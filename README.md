benny
----------
- is a software playground for making live music or for making music live
- integrates hardware and software, midi and audio, lets you connect anything to anything, extends into polyphony elegantly
- is agnostic about timelines and structure rather than imposing either
- aims for a low-density, low-distraction, glance-able interface that works for touch and mouse/keyboard use
- is an extendible and hackable place to host your own max patches
- is not a DAW

concepts
--------
- the cubes in benny are called 'blocks'. they all make or process sound or musical data. the first page you land on is the blocks page. hit enter, double click or start typing to find blocks to add.
- connections in benny can go from anything to anything. an audio output can be connected to an audio input, or to a parameter value, or to the midi note input of a synth. every wire has gain and mute controls and wires that translate from one kind of value to another let you choose how that happens
- almost every block can be made polyphonic. you can add or remove voices as you choose. notes sent to the block get allocated to voices (you can choose how) or you can send notes or audio or modulation directly to individual voices or sets of voices. you can adjust parameters for all voices together, or offset the parameters of individual voices.
- you can store the current parameter settings of a whole block and all its voices to a 'state'. states can contain settings for some or all of the blocks in a patch. you can trigger states by clicking their buttons in the top bar, or per-block, or xfade between states, or use musical information to trigger state changes using the core.states block.
- any block can have 1-3 of its parameters assigned to the position of imaginary creatures in a flocking simulation. the creatures are attracted to the parameter slider position but are influenced by a whole load of physical-ish things: friction, weight, attraction to or repulsion from other creatures, a desire to align or to head in different directions, from which many useful auto-modulations can be constructed. a simple 1d example would be eq peaks that move out of each other's way.
- the sidebar is where you can see more detailed audio scopes / midi visualisers, parameters, settings and states of a block.
- any audio block can have upsampling enabled up to 128x
- some blocks have a full screen editor you can bring up, eg for editing sequences
- some blocks have a mini-ui they can show in the sidebar with a version of this large editor
- the second main page of benny is the 'panels' view. you can choose what goes on here - both which blocks get a panel and which parameters show up on the panel. blocks may have mini-uis showing you what they're doing on this page. think of it as a place to build a custom set of controls and visualisation to perform this song.
- a song is a patch
- a liveset is a folder of songfiles. on startup or when you select a new folder benny reads in everything in the folder and preloads as many audio files as it can. it also tries to recycle the voices of previously loaded songs so that it can load a new song as fast as possible.
- you can 'merge' one song in next to an existing one.
- meters in benny always show you the minimum and maximum value that happened in the last frame of video. every voice of every block has some kind of meter. midi meters show you the lowest note, highest note, lowest velocity and highest velocity.
- you can store multiple hardware configuration files for different setups you use. if a hardware block isn't available when loading a song, benny will either auto-substitute or prompt you to choose a replacement. the goal is for a benny-based live set to tolerate on the road equipment failures with minimum fuss.
- all send/return loops to hardware have softclip and dither on the outputs
- all outputs optionally have audio processing. in my setup the output looper lets you capture a loop and manipulate it while the next song loads.

installation
------------
- install max (cycling74.com) but no need to buy it, just ignore all those messages, don't start the free trial, don't subscribe, nothing. you'll be able to use all the features of benny. BUT if you decide you want to learn to build your own blocks you'll need to buy max.
- in max / options / preferences / jitter preferences / make sure 'graphics engine' is set to glcore.
- open 'benny.maxproj'
- open the audio settings and choose which audio driver/interface to use
- choose the 'no hardware' configuration to try benny out using just the default io on your computer. to set benny up for seamless integration with your modular synth, keyboards, drum machines, synths, microphones, pedals, effects and midi input devices you'll need to make your own hardware configuration file.

configuration
-------------
- in the end, there'll be a hardware editor.. for now, using the hardware config .json files as an example, build your own, with entries for any pieces of modular or hardware you want to use. i recommend using an editor like vscode that has automatic syntax checking for json files.
- the vst plugin editor is rudimentary for now.. the idea is to pick a plugin, choose which parameters you want in the sidebar ui, assign them to up to 4 rows, press add..
    - KNOWN ISSUE if you only have 1 group a bug slightly corrupts the file. manually edit the .json files the vst editor spits out into the audio_blocks folder, look for the junk at the end of the 'groups' section and delete it.
    - KNOWN ISSUE if you change your mind how you want the parameters organised you can't load a vst's config and edit it, you just have to do it again 
    - KNOWN ISSUE on windows max sometimes can't find your plugins. the simplest solution is put them all in C:\Program Files\VSTPlugins
- all the visual/ui preferences are in config.json. this gets overwritten when you update the software, so if you want to change a setting copy the relevant entry you want to change the value of over to userconfig.json.
   
temporary limits
----------------
at the moment the code is fixed to 64 midi block voices, 64 audio block voices, 24 hw outs, metronome click on 25, 12 hw ins. this will all be reconfigurable at startup in the end.
at the moment the individual audio plugin voices are restricted to being 2-in 2-out. eventually 'wide' voices with more io will be possible.

developing blocks
-----------------
tutorial still to come, but steal some bits out of my patchers and here's some notes. 
every patch needs:
- a .json file describing its inputs, outputs, parameters
- a .maxpat file (that does the processing - note or audio - for one voice of your block)
    - this needs to send a few messages out:
        - on load: 'getvoice' out of its first (main) outlet, then the system will reply with bits of information it needs to look up its parameters etc. you can't use the normal max method (thispoly) to determine which voice you are, because you may well be loaded in any number of wrapping subpatches.
        - block mute status (from a thispoly object) out the second outlet
        - any notes etc, preceded by the output number (eg 0 54 126) is a loud g# on the first output
    - it needs to respond to messages too:
        - notes: received as pairs, but the input number is note/128. eg 0-127 first input, 128-255 second etc
        - mute: pass this (1 or 0) direct to a thispoly
        - voice_is, voice_offset - for knowing where to look up parameters. for a gen example see voice.basic, for the simplest possible way of getting parameters steal the 'voice_header' subpatch that appears in eg midi.lfo. this looks up the .json file and spits out parameters for you, already scaled to the right ranges.
- (optional) a second .maxpat file that is for rendering a ui in the panels / sidebar / custom / fullscreen views. only really realistic to do this in javascript OR can also just be for global, per-block, processing, such as managing save data.
  - this also needs to send out a getvoice, and gets a number of function calls from the main system: setup (tells it the size of the rendering window etc), voice_is (tells it what block it's attached to), draw (draw a full ui), update (update ui efficiently), and store (prepare for save - data has to be copied from buffer memory into the blocks dict, and this is where that happens)
