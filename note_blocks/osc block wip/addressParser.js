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

    // 1. Group by "Address Depth" (number of parts in the OSC address)
    //    This separates /a/b from /a/b/c immediately.
    const groupedByDepth = this._groupBy(this.messages, m => m.addressParts.length);

    const suggestions = [];

    // 2. For each depth group, find sub-clusters (Common Base Keys)
    Object.values(groupedByDepth).forEach(group => {
      // We need to find clusters of messages that look similar.
      // We do this by finding the Longest Common Prefix (LCP) of the address parts.
      
      // Sort to ensure similar addresses are adjacent
      group.sort((a, b) => a.fullAddress.localeCompare(b.fullAddress));

      let currentCluster = [group[0]];
  
      // Heuristic: If they share at least the first 2 parts (or 50% of path), 
      // treat them as part of the same pattern cluster.
      const minShared = Math.min(2, group[0].addressParts.length);
      // post("\nchecking the group for length",group[0].addressParts.length,'has ',group.length,'members');

      for (let i = 1; i < group.length; i++) {
        const prev = group[i-1];
        const curr = group[i];
        
        const commonDepth = this._getCommonPrefixDepth(prev.addressParts, curr.addressParts);
                
        if (commonDepth >= minShared) {
          currentCluster.push(curr);
        } else {
          // Finish current cluster and start new one
          suggestions.push(this._derivePattern(currentCluster));
          currentCluster = [curr];
        }
      }
      suggestions.push(this._derivePattern(currentCluster));
    });

    return suggestions;
  }

  // --- Internal Logic ---

  _parseMessage(str) {
    const trimmed = str.trim();
    if (!trimmed.startsWith('/')) return null;
    
    // Split by first space to separate address from args
    const firstSpaceIndex = trimmed.indexOf(' ');
    
    let address = "";
    let args = [];
    
    if (firstSpaceIndex === -1) {
      address = trimmed;
    } else {
      address = trimmed.substring(0, firstSpaceIndex);
      const argStr = trimmed.substring(firstSpaceIndex + 1);
      if (argStr.length > 0) {
        args = argStr.split(/\s+/).map(a => {
          // Try to convert to number if possible
          const float = parseFloat(a);
          return isNaN(float) ? a : float;
        });
      }
    }
    
    return {
      raw: str,
      addressParts: address.split('/').filter(p => p !== ''), // ["many", "keys", ...]
      fullAddress: address,
      args: args
    };
  }

  _derivePattern(cluster) {
    // We have a cluster of messages that look structurally similar.
    // We need to separate:
    // 1. The Block (Static Address Prefix)
    // 2. The Voice (Dynamic Address Suffix + Dynamic Arg Prefix)
    // 3. The Outputs (Remaining Args)

    // analyse Address Parts to find where the static part ends
    const addressMatrix = cluster.map(m => m.addressParts);
    const numAddressParts = addressMatrix[0].length;
    
    // Identify which columns in the address are "static" (100% same) vs "variable"
    const staticAddressParts = [];
    const variableAddressIndices = [];
    
    for (let col = 0; col < numAddressParts; col++) {
      const values = addressMatrix.map(row => row[col]);
      const uniqueVals = new Set(values);
      
      if (uniqueVals.size === 1) {
        staticAddressParts.push(values[0]);
      } else {
        variableAddressIndices.push(col);
      }
    }

    // Now analyse Arguments to see if they should be promoted to "Voice ID" (Case 3)
    // or remain as "Outputs" (Case 4).
    // Logic: If an arg has LOW cardinality (few unique values), it's likely an ID/Index.
    // If it has HIGH cardinality (many values), it's likely a value/output.
    
    const argMatrix = cluster.map(m => m.args);
    const maxArgs = Math.max(...cluster.map(m => m.args.length));
    
    const voiceArgIndices = [];
    const outputArgIndices = [];

    // Dynamic threshold for "high cardinality" vs "low cardinality"
    // If we have 100 messages, and an arg has 2 values -> ID. If it has 90 values -> Output.
    const ID_CARDINALITY_THRESHOLD = 5; 

    for (let i = 0; i < maxArgs; i++) {
      // Gather values for this arg index across all messages that have it
      const values = argMatrix
        .filter(row => row.length > i)
        .map(row => row[i]);
      
      if (values.length === 0) break;
      
      const uniqueVals = new Set(values);
      const isNumeric = values.every(v => typeof v === 'number');

      // Check if looks like an Index (Voice ID)
      // Criteria: Numeric AND (Low Cardinality OR Integer)
      if (isNumeric) {
        const isLowCardinality = uniqueVals.size <= ID_CARDINALITY_THRESHOLD;
        const areAllIntegers = values.every(v => Number.isInteger(v));
        
        // Case 3: /keys/name 0 1 value -> 0 and 1 are likely indices
        if (isLowCardinality || areAllIntegers) {
           voiceArgIndices.push(i);
           continue;
        }
      }
      
      // Otherwise, it's an output value
      outputArgIndices.push(i);
    }

    // Construct the result object
    const blockAddress = '/' + staticAddressParts.join('/');
    
    // We need a "Pattern String" that matches these messages
    // e.g. /base/{id} or /base {id} {id}
    
    let patternParts = [...staticAddressParts];
    
    // Add placeholders for variable address parts
    for (let i = 0; i < numAddressParts; i++) {
      if (variableAddressIndices.includes(i)) {
        patternParts.push('{id}');
      }
    }
    
    // Add placeholders for voice args
    // Note: In OSC standard, address is distinct from args. 
    // But for display, we can show: /prefix {id_from_address} {id_from_arg_0}
    
    return {
      blockPath: blockAddress,
      messageCount: cluster.length,
      
      // Structure mapping
      structure: {
        block: staticAddressParts,
        
        voice: {
          addressIndices: variableAddressIndices, // e.g. [2] means 3rd part of address
          argIndices: voiceArgIndices             // e.g. [0] means 1st arg
        },
        
        outputs: outputArgIndices
      },
      
      // Human readable suggestion
      suggestionString: this._generateSuggestionString(staticAddressParts, numAddressParts, variableAddressIndices, voiceArgIndices, outputArgIndices),
      
      // Example data for UI
      examples: cluster.slice(0, 3).map(m => m.raw)
    };
  }

  _generateSuggestionString(staticAddr, totalAddr, varAddrIndices, voiceArgIndices, outputArgIndices) {
    let s = "/" + staticAddr.join('/');
    
    // Add variable address parts
    for (let i=0; i<totalAddr; i++) {
      if (!varAddrIndices.includes(i)) continue; // skip static
      s += `/{addr_id}`;
    }
    
    // Add voice args
    voiceArgIndices.forEach(() => s += ` {idx}`);
    
    // Add outputs
    if (outputArgIndices.length > 0) {
      s += ` (`;
      outputArgIndices.forEach((_, idx) => {
        s += `val${idx+1} `;
      });
      s = s.trim() + `)`;
    }
    
    return s;
  }

  _getCommonPrefixDepth(arr1, arr2) {
    let i = 0;
    const minLen = Math.min(arr1.length, arr2.length);
    while (i < minLen && arr1[i] === arr2[i]) {
      i++;
    }
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


function msg_int(m) {
  listenMode = m;
  if(m == 1) {
    analyser.messages = [];
  }else{
    process();
  }        
}

function process(){
  // Run Analysis
  const patterns = analyser.analyse();

  post('\n--- SUGGESTED PATTERNS ---');
  patterns.forEach((p, index) => {
    post(`\nPattern ${index + 1}: ${p.suggestionString}`);
    post(`\n   Block: ${p.blockPath}`);
    post(`\n   Voice Source: Address Parts [${p.structure.voice.addressIndices.join(', ')}] + Args [${p.structure.voice.argIndices.join(', ')}]`);
    post(`\n   Output Indices: [${p.structure.outputs.join(', ')}]`);
    post(`\n   Examples: ${p.examples.length} messages`);
    post('\n');
  });
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

function anything() {
	var a = arrayfromargs(messagename, arguments);
  if(listenMode == 1) {
    analyser.record(a.join(' '));
  }else{
    //post("i should route and process this",a);
  }
}