/**
 * OSC Pattern analyser
 * 
 * analyses a list of raw OSC message strings and suggests patterns
 * mapping them to a Block -> Voice -> Output hierarchy.
 */

class OSCPatternanalyser {
  constructor() {
    this.messages = [];
  }

  record(msgStr) {
    const parsed = this._parseMessage(msgStr);
    if (parsed) {
      this.messages.push(parsed);
    }
  }

  analyse() {
  if (this.messages.length === 0) return [];
    
    // 1. Group messages by structure (Depth + Common Prefix)
    const groupedByDepth = this._groupBy(this.messages, m => m.addressParts.length);
    const suggestions = [];

    Object.values(groupedByDepth).forEach(group => {
      group.sort((a, b) => a.fullAddress.localeCompare(b.fullAddress));
      
      let currentCluster = [group[0]];
      post("\nthis group has address length",group[0].addressParts.length);
      for (let i = 1; i < group.length; i++) {
        const prev = group[i-1];
        const curr = group[i];
        const commonDepth = this._getCommonPrefixDepth(prev.addressParts, curr.addressParts);
        
        // Group if they share at least the first 2 parts (or 50%)
        const minShared = Math.max(1, Math.floor(curr.addressParts.length * 0.5)); 
        
        if (commonDepth >= minShared) {
          currentCluster.push(curr);
        } else {
          suggestions.push(...this._generateAlternatives(currentCluster));
          currentCluster = [curr];
        }
      }
      suggestions.push(...this._generateAlternatives(currentCluster));
    });

    return suggestions;
  }

  // --- NEW: GENERATES MULTIPLE STRATEGIES ---
  _generateAlternatives(cluster) {
    const alternatives = [];
    const addressMatrix = cluster.map(m => m.addressParts);
    const numAddressParts = addressMatrix[0].length;
    
    // 1. Identify Static vs Variable Address Parts
    const staticAddressParts = [];
    const variableAddressIndices = []; // e.g. [1, 2, 3]
    
    for (let col = 0; col < numAddressParts; col++) {
      const values = addressMatrix.map(row => row[col]);
      const uniqueVals = new Set(values);
      if (uniqueVals.size === 1) {
        staticAddressParts.push(values[0]);
      } else {
        variableAddressIndices.push(col);
      }
    }

    // 2. Identify Voice Args vs Output Args
    const argMatrix = cluster.map(m => m.args);
    const maxArgs = Math.max(...cluster.map(m => m.args.length));
    const ID_CARDINALITY_THRESHOLD = 5; 
    
    const voiceArgIndices = [];
    const outputArgIndices = [];

    for (let i = 0; i < maxArgs; i++) {
      const values = argMatrix.filter(row => row.length > i).map(row => row[i]);
      if (values.length === 0) break;
      
      const uniqueVals = new Set(values);
      const isNumeric = values.every(v => typeof v === 'number');
      const isLowCardinality = uniqueVals.size <= ID_CARDINALITY_THRESHOLD;
      const areAllIntegers = values.every(v => Number.isInteger(v));

      if (isNumeric && (isLowCardinality || areAllIntegers)) {
         voiceArgIndices.push(i);
      } else {
         outputArgIndices.push(i);
      }
    }

    // --- STRATEGY GENERATION LOOP ---
    
    // A. Strategy 1: "Flat Voice" (Everything variable is the Voice ID, Outputs are just values)
    alternatives.push(this._createAlternative(
      cluster, 
      staticAddressParts, 
      variableAddressIndices, // Voice
      [],                      // Output Address Parts
      voiceArgIndices,         // Voice Args
      outputArgIndices,        // Output Args
      "Standard (Address is Voice)"
    ));

    // B. Strategy 2...N: "Hierarchical Splits"
    // We split the variable address parts. Left side = Voice, Right side = Output ID.
    // e.g. if varIndices = [1, 2, 3]
    // Split 1: Voice=[1], OutputAddr=[2,3]
    // Split 2: Voice=[1,2], OutputAddr=[3]
    
    // Only do this if we have at least 2 variable parts (to make a split meaningful)
    // and if we don't have voice arguments (mixing ID args and address splits gets too messy)
    if (variableAddressIndices.length >= 2 && voiceArgIndices.length === 0) {
      for (let i = 1; i < variableAddressIndices.length; i++) {
        const voiceParts = variableAddressIndices.slice(0, i);
        const outputParts = variableAddressIndices.slice(i);
        
        // Create a label like "Split: Last 1 part is Output"
        const splitCount = outputParts.length;
        alternatives.push(this._createAlternative(
          cluster,
          staticAddressParts,
          voiceParts,
          outputParts,
          voiceArgIndices,
          outputArgIndices,
          `Hierarchical (Last ${splitCount} address part${splitCount > 1 ? 's' : ''} is Output)`
        ));
      }
    }

    return alternatives;
  }

  _createAlternative(cluster, staticAddr, voiceAddrIdx, outputAddrIdx, voiceArgIdx, outputArgIdx, label) {
    const uniqueVoices = new Set();
    const uniqueOutputs = new Set();
    const blockAddress = '/' + staticAddr.join('/');

    cluster.forEach(msg => {
      // 1. Construct Voice ID
      const vParts = voiceAddrIdx.map(i => msg.addressParts[i]);
      const vArgs = voiceArgIdx.map(i => msg.args[i]);
      const voiceKey = [...vParts, ...vArgs].join(':') || "Default";
      uniqueVoices.add(voiceKey);

      // 2. Construct Output ID
      // Note: Outputs are tricky. They can be defined by the Address OR by the Argument index.
      const oAddrParts = outputAddrIdx.map(i => msg.addressParts[i]);
      
      // If outputs are defined by address (e.g. part 3 is the fader number)
      if (oAddrParts.length > 0) {
        uniqueOutputs.add(oAddrParts.join(':'));
      } 
      // If outputs are defined by arguments (e.g. value 1, value 2)
      else {
        // We map arg indices to generic names like "Value 1", "Value 2"
        outputArgIdx.forEach((argIdx, count) => {
          // If there is only one output arg, just call it "Value", else number them.
          const name = outputArgIdx.length === 1 ? "Value" : `Value ${count + 1}`;
          uniqueOutputs.add(name);
        });
      }
    });

    return {
      label: label, // To distinguish patterns in UI
      blockPath: blockAddress,
      messageCount: cluster.length,
      
      // UI Lists
      voices: Array.from(uniqueVoices).sort(),
      outputs: Array.from(uniqueOutputs).sort(),
      
      // Structure map (for your parser logic later)
      structure: {
        block: staticAddr,
        voice: {
          addressIndices: voiceAddrIdx,
          argIndices: voiceArgIdx
        },
        output: {
          addressIndices: outputAddrIdx, // New: Supports output coming from address
          argIndices: outputArgIdx
        }
      },
      
      // Visualization helper
      exampleAddress: cluster[0].addressParts.join('/')
    };
  }


  // takes the selected pattern and makes a single voice's parser config object
  makeParserConfig(pattern, voiceId, selectedOutputIds) {
    // 1. Construct the Static Address Prefix
    //    We build the prefix by appending the specific voiceId to the block path.
    let prefix = pattern.blockPath;

    // Case A: The Voice ID is part of the OSC address (e.g., /from/james)
    if (pattern.structure.voice.addressIndices.length > 0) {
      prefix += '/' + voiceId;
    }
    // Case B: The Voice ID is in the arguments (e.g., /track 1)
    // The prefix stays as the block path (e.g., /track). 
    // We will pass the voiceArgIndex so the parser can filter messages later.

    // 2. Determine the Output Mode
    let mode = 'implicit';
    if (pattern.structure.output.addressIndices.length > 0) {
      mode = 'address_suffix';
    } else if (pattern.structure.output.argIndices.length > 0) {
      mode = 'arg_index';
    }

    // 3. Prepare the validOutputs list
    //    For 'arg_index' mode, we need to convert the Output Names (e.g., "Value 1")
    //    back into integer indices (e.g., 0).
    let validOutputs = selectedOutputIds;

    if (mode === 'arg_index') {
      validOutputs = selectedOutputIds.map(outputName => {
        // Find the index of this name in the pattern's discovered outputs list
        const index = pattern.outputs.indexOf(outputName);
        return index; 
      }).filter(idx => idx !== -1); // Remove any invalid selections
    }

    return {
      addressPrefix: prefix,
      outputMode: mode,
      validOutputs: validOutputs,
      // Extra data to help VoiceParser filter if Voice ID is in arguments
      voiceArgIndex: pattern.structure.voice.argIndices[0],
      expectedVoiceId: voiceId
    };
  }


  // --- Helpers ---
  
  _parseMessage(str) {
    const trimmed = str.trim();
    if (!trimmed.startsWith('/')) return null;
    const firstSpaceIndex = trimmed.indexOf(' ');
    let address = "", args = [];
    if (firstSpaceIndex === -1) address = trimmed;
    else {
      address = trimmed.substring(0, firstSpaceIndex);
      const argStr = trimmed.substring(firstSpaceIndex + 1);
      if (argStr.length > 0) args = argStr.split(/\s+/).map(a => isNaN(parseFloat(a)) ? a : parseFloat(a));
    }
    return { raw: str, addressParts: address.split('/').filter(p => p !== ''), fullAddress: address, args: args };
  }

  _getCommonPrefixDepth(arr1, arr2) {
    let i = 0; const minLen = Math.min(arr1.length, arr2.length);
    while (i < minLen && arr1[i] === arr2[i]) i++;
    return i;
  }

  _groupBy(array, keyFn) {
    return array.reduce((result, item) => {
      const key = keyFn(item);
      if (!result[key]) result[key] = [];
      result[key].push(item);
      return result;
    }, {});
  }
}


const analyser = new OSCPatternanalyser();


//mode 0 = normal parsing
//mode 1 = listening to determine addresses
let listenMode = 0;

function loadbang() {
  wipeDisplay();
}

function wipeDisplay(){
  outlet(0,'umenu','clear');
  outlet(0,'display','bba','set',' ');
  outlet(0,'display','addr1','set',' ');
  outlet(0,'display','addr2','set',' ');
}

function msg_int(m) {
  listenMode = m;
  if(m == 1) {
    analyser.messages = [];
    wipeDisplay();
  }else{
    post("\ncaptured",analyser.messages.length,"messages, analysing");
    process();
  }        
}

let patterns = {};
let selectedIndex = 0;
let OSCport = 9000;

function process(){
  // Run Analysis
  patterns = analyser.analyse().filter(p => (p.outputs.length>0));//remove stub ones with no outputs
  // put the ones with more outputs first, within that sort by number of messages matched.
  patterns.sort((a,b) => {
    const ldif = b.structure.output.addressIndices.length - a.structure.output.addressIndices.length;
    if(ldif!=0) return ldif;
    return b.structure.messageCount - b.structure.messageCount;
  });
  outlet(0, 'umenu', 'clear');
  post('\n--- SUGGESTED PATTERNS ---');
  post(`\nFound ${patterns.length} pattern interpretations:\n`);
  patterns.forEach((p, index) => {
    outlet(0, 'umenu', 'append', `Pattern ${index + 1}: ${p.label}`);
    post(`\nPattern ${index + 1}: ${p.label} `);
    post(`\n   Block: ${p.blockPath}`);
    post(`\n    Voices Found: [${p.voices.join(', ')}]`); 
    post(`\n    Outputs:      [${p.outputs.join(', ')}]`);
    post('\n');
  });
  displayPattern(0);
}

function bang() {
  //bunch of dummy data

  // 1. TouchDesigner Style: /block/voiceID value
  analyser.record("/many/keys/define/address/1 0.5");
  analyser.record("/many/keys/define/address/2 0.7");
  analyser.record("/many/keys/define/address/3 0.2");

  // 2. TouchOSC Vintage: /block/faderID value
  analyser.record("/some/keys/fader1 0.1");
  analyser.record("/some/keys/fader2 0.9");

  // 3. Space separated as address: /block x y value (where x,y are indices)
  analyser.record("/keys/name 0 1 0.5");
  analyser.record("/keys/name 0 2 0.6");
  analyser.record("/keys/name 1 1 0.8");

  // 4. Multi-output: /block val1 val2 (where vals are variables)
  analyser.record("/mixer/chan1 0.5 0.8");
  analyser.record("/mixer/chan1 0.6 0.9");
  analyser.record("/mixer/chan2 0.1 0.2");
}

function displayPattern(index){
  p = patterns[index];
  selectedIndex = index;

  outlet(0,'display', 'bba','set', `${p.blockPath}`);
  outlet(0,'display', 'addr1','set', p.voices.join('\n'));
  outlet(0,'display', 'addr2','set', p.outputs.join('\n'));
}

function port(p){
  OSCport = p;
}

function anything() {
	var a = arrayfromargs(messagename, arguments);
  if(listenMode == 1) {
    analyser.record(a.join(' '));
  }else{
    //post("i should route and process this",a);
  }
}

function apply(blockNum){
  // this needs to store the pattern, voice addresses, output labels and assignments in the block dict
  // it needs to add voices
  // can it label the outputs?
  let blocks = new Dict;
  blocks.name = "blocks";
  
  let blocktypes = new Dict;
  blocktypes.name = "blocktypes";
  
  voicePatterns = [];
  let p = patterns[selectedIndex];
  for(let i = 0;i<p.outputs.length; i++){
    blocktypes.replace("utility.OSC.input::connections::out::parameters["+i+"]",p.outputs[i]);
  }
  for(i = 0; i<p.voices.length; i++){
    const parserConfig = analyser.makeParserConfig(p, p.voices[i], p.outputs);
    voicePatterns[i] = {
      voiceName : p.voices[i],
      outputs : p.outputs,
      parserConfig : parserConfig
    }
  }
  blocks.replace("blocks[" + blockNum + "]::OSC_settings", { "port": OSCport, "voices" : voicePatterns });
  if(blocks.get("blocks[" + blockNum + "]::poly::voices") != p.voices.length){
    messnamed("to_blockmanager","voicecount",blockNum,p.voices.length);
  }
  
  post("current block",blockNum," dict:",JSON.stringify(blocks.get("blocks["+blockNum+"]")));
}

