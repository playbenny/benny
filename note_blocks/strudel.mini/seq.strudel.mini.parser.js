// Install Strudel first: npm install @strudel/mini

const maxApi = require('max-api');
const { mini } = require('@strudel/mini');

let currentCycle = 0;
let currentPattern = "";
let playingSeq = "aseq";

function parseAndSend(){
  if(currentPattern == null || currentPattern == "") return 0;
  const pattern = mini(currentPattern);
    
  // Query the pattern for a specific time span (e.g., first cycle)
  const events = pattern.queryArc(currentCycle, currentCycle+1);
  
  const targetSeq = (playingSeq == "bseq") ? "aseq" : "bseq";
  
  maxApi.outlet("seq", "erase", targetSeq);

  // send each event as an instruction to store it in seq
  events.forEach(hap => {
    const value = hap.value;
    const noteNum = parseMidiNote(value);

    if(noteNum){
      maxApi.outlet("seq","add",targetSeq,Number(hap.whole.begin) % 1,noteNum,Number(hap.whole.end - hap.whole.begin));
    }else if(typeof(value) === "number"){
      // maxApi.post("number",value);
      maxApi.outlet("seq","add",targetSeq,Number(hap.whole.begin) % 1,-value,Number(hap.whole.end - hap.whole.begin));
    }else{
      
      maxApi.outlet("seq","add",targetSeq,Number(hap.whole.begin) % 1,value,Number(hap.whole.end - hap.whole.begin));
    }
  });
  maxApi.outlet("seq", "seq", targetSeq);
  playingSeq = targetSeq;
  // maxApi.post(`Parsed pattern: ${currentPattern} (${events.length} events)`);
}

function parseMidiNote(note) {
    const midiNotePattern = /([A-Ga-g][#b]?)(\d+)/;
    const match = note.match(midiNotePattern);

    if (match) {
        const noteName = match[1].toUpperCase(); // Normalize to uppercase
        const octave = parseInt(match[2], 10);

        // Mapping of note names to MIDI note numbers
        const noteToNumber = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
            'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9,
            'A#': 10, 'B': 11
        };

        const noteNumber = (noteToNumber[noteName] + (octave) * 12) % 128; // MIDI note number

        return noteNumber;
    } else {
        return null; // No valid note found
    }
}

// Parse a mini notation pattern and output as dictionary
maxApi.addHandler('pattern', (patternString) => {
  try {
    currentPattern = patternString;
    parseAndSend();
  } catch (err) {
    maxApi.post(`Error: ${err.message}`);
  }
});

maxApi.addHandler('cycle', (cycleNumber) => {
    currentCycle = cycleNumber;
    parseAndSend();
});


maxApi.post('Strudel mini notation parser ready');