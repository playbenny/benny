// Install Strudel first: npm install @strudel/mini

const maxApi = require('max-api');
const { mini } = require('@strudel/mini');

let currentCycle = 0;
let currentPattern = "";
let playingSeq = "aseq";
let rev_jux = 0;

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
    let noteNum = null;
    let vel = 100;
    if(typeof(value) !== "number"){
      noteNum = parseMidiNote(value.toString());
    }
    let type = -1;
    if(noteNum){
      type = 0; //midi note
    }else if(typeof(value) === "number"){
      type = 1; //scale degree
      noteNum = value+24;
    }else{
      noteNum = parseDrumNumber(value);
      if(noteNum>-1){
        type = 2; //drum
      }else{
        type = 3; //scale select
         // Mapping of note names to MIDI note numbers
        const noteToNumber = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
            'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9,
            'A#': 10, 'B': 11
        };
        if(value.slice(1,2)=='#'){
          noteNum = noteToNumber[value.slice(0,2).toUpperCase()];
          let mm = value.slice(2,);
          if(mm == 'm'){
            vel = 1;
          }else{
            vel = 0;
          }
          // maxApi.post("scale parser 2:",noteNum,value.slice(0,2).toUpperCase());
        }else{
          noteNum = noteToNumber[value.slice(0,1).toUpperCase()];
          let mm = value.slice(1,);
          if(mm == 'm'){
            vel = 5;
          }else if(mm == 'd'){
            vel = 1;
          }else if(mm == 'h'){
            vel = 7;
          }else{
            vel = 0;
          }
          // maxApi.post("scale parser 1:",noteNum,value.slice(0,1).toUpperCase());
        }
        // maxApi.post(`unknown type ${value} ${noteNum} ${vel}`);
      }
    }
    if(rev_jux != 1){ //fwd version
      maxApi.outlet("seq","add",targetSeq,Number(hap.whole.begin) % 1,type,noteNum,vel,Number(hap.whole.end - hap.whole.begin));
    }
    if(rev_jux>0){ //rev version
      maxApi.outlet("seq","add",targetSeq,1 - (Number(hap.whole.end) % 1),type,noteNum,vel,Number(hap.whole.end - hap.whole.begin));    
    }
  });
  maxApi.outlet("seq", "seq", targetSeq);
  playingSeq = targetSeq;
  // maxApi.post(`Parsed pattern: ${currentPattern} (${events.length} events)`);
}
function parseDrumNumber(note){
  const drumList = ["bd","sd","cp","hh","oh","rd","lt","mt","ht"];
  return drumList.indexOf(note);
}
function parseMidiNote(note) {
  try {
    const midiNotePattern = /([A-Ga-g][#b]?)(\d+)/;
    const match = note.match(midiNotePattern);

    if (match) {
        const noteName = match[1].toUpperCase(); // Normalize to uppercase
        const octave = parseInt(match[2], 10) + 2;

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
  } catch (err) {
    maxApi.post(`Error: ${err.message}`);
    return null;
  }
}

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

maxApi.addHandler('rev_jux', (mode) => {
  if(rev_jux!=2 && mode==2)maxApi.post("thanks yaxu");
  rev_jux = mode;
  parseAndSend();
});


maxApi.post('Strudel mini notation parser ready');