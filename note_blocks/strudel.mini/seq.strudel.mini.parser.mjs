// Install Strudel first: npm install @strudel/mini

// const maxApi = require('max-api');
// const { mini } = require('@strudel/mini');
import maxApi from 'max-api';
import { mini } from '@strudel/mini';

let currentCycle = 0;
let currentPattern = "";
let playingSeq = "aseq";
let rev_jux = 0;

function parseAndSend(){
  let idcount = 0;
  
  if(currentPattern == null || currentPattern == "") return 0;
  const pattern = mini(currentPattern);
    
  // Query the pattern for a specific time span (e.g., first cycle)
  const events = pattern.queryArc(currentCycle, currentCycle+1);
  
  const targetSeq = (playingSeq == "bseq") ? "aseq" : "bseq";
  
  maxApi.outlet("seq", "erase", targetSeq);
  maxApi.outlet("locations", "clear");

  // send each event as an instruction to store it in seq
  events.forEach(hap => {
    //THIS IS HOW YOU DO CODE HIGHLIGHTING AS IT PLAYS
    //every hap gets a list of locations in the text that it refers to
    //maxApi.post("\nhap",JSON.stringify(hap.context));
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
      noteNum = value;
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
          //maxApi.post("scale parser 2:",noteNum,value.slice(0,2).toUpperCase(),vel);
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
          //maxApi.post("scale parser 1:",noteNum,value.slice(0,1).toUpperCase(),vel);
        }
        // maxApi.post(`unknown type ${value} ${noteNum} ${vel}`);
      }
    }
    // the seq format here is: starttime, type, note, vel, duration, hap locations list id
    if(rev_jux != 1){ //fwd version
      maxApi.outlet("seq","add",targetSeq,Number(hap.whole.begin) % 1,type,noteNum,vel,Number(hap.whole.end - hap.whole.begin),idcount);
      let locList = [];
      hap.context.locations.forEach((l) => {
        locList.push(l.start);
        locList.push(l.end);
      });
      maxApi.outlet("locations",idcount,...locList);
    }
    if(rev_jux>0){ //rev version
      // to show locations would be a bit of a pain using my current system
      // either, reverse lookup id here and append to the coll
      // or switch to using the length of haps to turn off location highlights.
      maxApi.outlet("seq","add",targetSeq,1 - (Number(hap.whole.end) % 1),type,noteNum,vel,Number(hap.whole.end - hap.whole.begin));    
    }
    idcount++;
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
    //parseAndSend();
  } catch (err) {
    maxApi.post(`Error: ${err.message}`);
  }
});

maxApi.addHandler('cycle', (cycleNumber) => {
    currentCycle = cycleNumber;
  try {
    parseAndSend();
  } catch (err) {
    maxApi.post(`Error: ${err.message}`);
  }
});

maxApi.addHandler('rev_jux', (mode) => {
  if(rev_jux!=2 && mode==2)maxApi.post("thanks yaxu");
  rev_jux = mode;
  //parseAndSend();
});


maxApi.post('Strudel mini notation parser ready');