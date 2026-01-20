// inlets and outlets
inlets = 1;
outlets = 3;


let parser = {}; 
function setup(block,voiceNum){
  // check the dictionaries, if we have a port and a pattern set them and lets go.
  let blocks = new Dict;
  blocks.name = "blocks";
  post("\nOSC init: block",block,"voice",voiceNum);
  if(blocks.contains("blocks[" + block + "]::OSC_settings")){//}::voices[" + voiceNum + "]")){
    outlet(2, blocks.get("blocks[" + block + "]::OSC_settings::port"));
    let bconf = new Dict;
    bconf = blocks.get("blocks[" + block + "]::OSC_settings::voices["+voiceNum+"]::parserConfig");
    let parserConfigDict = blocks.get("blocks[" + block + "]::OSC_settings::voices["+voiceNum+"]::parserConfig");
    let keys = parserConfigDict.getkeys();
    let obj = {};
    for (let i = 0; i < keys.length; i++) {
        obj[keys[i]] = parserConfigDict.get(keys[i]);
    }
    post("\nfound instructions:",JSON.stringify(obj));//::voices["+voiceNum+"]::parserConfig")));
    config_parser(obj);
  }else{
    post("\nthis OSC voice doesn't have a config, opening ui");
    if(voiceNum == 0){
      messnamed("ui_poly", "open", block + 1 );
    }
  }
  
}

// 1. Setup Function (Called from Max when user selects pattern)
function config_parser(parserConfig) { //prefix, mode, valid_outputs_list) {
  // valid_outputs_list comes from Max as a list, e.g. "1 2 3"
  //const outputs = arrayfromargs(messagename, arguments); 
  // Note: You'll need to parse the arguments carefully based on how you send them from Max.
  // Here is a simplified example assuming you send valid outputs as a list.
  
  // {
  //   addressPrefix: prefix,
  //   outputMode: mode,
  //   validOutputs: valid_outputs_list // e.g. ["1", "2"]
  // }

  parser = new VoiceParser(parserConfig);
  
  post("Voice parser created for: " + parserConfig.expectedVoiceId + "\n");
}

// 2. The OSC Input (List from [udpreceive] or [OSCroute])
function list() {
  // Reconstruct the OSC string from the Max list if your input is a list
  // or just accept the string if you are routing strings.
  // Assuming input is a string for this example:
  const msg = arrayfromargs(arguments).join(" "); 
  
  // Iterate over all registered parsers for this patch
  parser.parse(msg);
}

 
//  addressPrefix: The static part of the address belonging to this voice (e.g. "/from/james")
//  outputMode: 'implicit' (one output), 'address_suffix' (id in address), or 'arg_index' (multi-value)
//  validOutputs: Array of allowed output identifiers (e.g. ["1", "2"] OR [0, 1])

class VoiceParser {
  constructor(config) {
    this.prefix = config.addressPrefix;
    this.mode = config.outputMode;
    
    // Map valid output IDs to a sequential 0-based index for the UI
    // e.g. { "vel": 0, "pitch": 1 } or { 0: 0, 1: 1 }
    this.outputLookup = {};
    config.validOutputs.forEach((id, index) => {
      this.outputLookup[id] = index;
    });

    // Voice ID verification settings (for "Voice in Argument" patterns)
    this.expectedVoiceId = config.expectedVoiceId;
    this.voiceArgIndex = config.voiceArgIndex;

    this.outletCount = 2; // 0: Success, 1: Reject
  }

  /**
   * Main parse function.
   * Returns: true if the message was handled (emitted or rejected), 
   *          false if the message was ignored (not for this voice).
   */
  parse(msg) {
    // 1. Fast Prefix Check
    if (!msg.startsWith(this.prefix)) {
      return false; // This message is for a different block/voice entirely
    }

    // 2. Slice the string to get the variable part
    const remainder = msg.substring(this.prefix.length);
    
    // 3. Check if the Voice ID is in the Arguments (e.g., /track 1 value)
    // We must verify this BEFORE processing outputs.
    if (this.voiceArgIndex !== undefined) {
      // The remainder looks like: " 1 0.5" or "/1 0.5" (but usually arg-based implies no extra address parts)
      // We strip leading slash if present (rare but possible) and split by whitespace.
      const cleanRemainder = remainder.startsWith('/') ? remainder.substring(1) : remainder;
      const args = cleanRemainder.trim().split(/\s+/);

      // Ensure the message has enough arguments to contain the Voice ID
      if (args.length > this.voiceArgIndex) {
        const incomingVoiceId = args[this.voiceArgIndex];
        
        // Compare strictly. If the ID doesn't match, this message is NOT for this parser.
        // (We return false so that a parser for "Voice 2" might catch it, or simply drop it)
        if (String(incomingVoiceId) !== String(this.expectedVoiceId)) {
          return false;
        }
      } else {
        // Malformed message (not enough args), reject or ignore? 
        // Let's reject to alert the user.
        this.outletReject(1, msg);
        return true;
      }
    }

    // 4. Handle Output Parsing based on Mode
    
    const isAddressExtension = remainder.length > 0 && remainder[0] === '/';

    // --- MODE: address_suffix ---
    // Structure: /from/james/{output_id} value
    if (this.mode === 'address_suffix') {
      
      // We expect an address part here (e.g., "/1")
      if (!isAddressExtension) {
        this.outletReject(1, msg); // Reject: Expected address part but got args directly
        return true;
      }

      // Split: "/1 0.5" -> ["", "1", "0.5"] (split by space)
      // We need to handle multiple spaces carefully.
      // Logic: Find the first space to separate the output ID from the value.
      const firstSpace = remainder.indexOf(' ');
      
      if (firstSpace === -1) {
        // No value provided
        this.outletReject(1, msg);
        return true;
      }

      const potentialId = remainder.substring(1, firstSpace); // Remove leading '/'
      const valStr = remainder.substring(firstSpace + 1);
      const val = parseFloat(valStr);

      if (!isNaN(val) && this.outputLookup.hasOwnProperty(potentialId)) {
        const uiIndex = this.outputLookup[potentialId];
        this.outletSuccess(uiIndex, val);
      } else {
        // ID not in our list, or value is NaN
        this.outletReject(1, msg); 
      }
    }

    // --- MODE: implicit ---
    // Structure: /from/james value
    else if (this.mode === 'implicit') {
      
      // We expect arguments immediately (space), NOT an address extension
      if (isAddressExtension) {
        this.outletReject(1, msg); // Reject: Unexpected address part
        return true;
      }

      const val = parseFloat(remainder.trim());
      if (!isNaN(val)) {
        this.outletSuccess(0, val); // Implicit mode is always index 0
      }
    }

    // --- MODE: arg_index ---
    // Structure: /from/james val1 val2
    else if (this.mode === 'arg_index') {
      
      // We expect arguments
      if (isAddressExtension) {
        this.outletReject(1, msg);
        return true;
      }

      const args = remainder.trim().split(/\s+/);

      // Iterate through arguments and check if their index is a valid output
      args.forEach((argStr, i) => {
        // Note: 'i' here is the index relative to the remainder.
        // If the pattern definition said Arg 1 is an output, we check args[1].
        if (this.outputLookup.hasOwnProperty(i)) {
          const val = parseFloat(argStr);
          if (!isNaN(val)) {
            const uiIndex = this.outputLookup[i];
            this.outletSuccess(uiIndex, val);
          }
        }
      });
    }

    return true;
  }


  outletSuccess(index, value) {
    outlet(0, [index, value]);
    // post(`[Outlet 0] Voice ${this.prefix} -> Output Index: ${index}, Value: ${value}`);
  }

  outletReject(msg) {
    outlet(1, msg);
    post(`[Outlet 1] Rejected: ${msg}`);
  }
}
