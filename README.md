benny
-----
- is a modular software playground for making live music
- integrates hardware and software, midi and audio, lets you connect anything to anything
- extends nearly everything into polyphony elegantly and flexibly
- is anti-timeline and tries not to impose a structure on you
- aims for a low-density, glance-able interface that works for touch and mouse/keyboard use
- is an extendible and hackable place to host your own max patches

30 minute intro to benny video:
https://www.youtube.com/watch?v=Hs_4T_gjoWw

concepts
--------
- the cubes in benny are called 'blocks'. they all make or process sound or musical data. the first page you land on is the blocks page. hit enter, double click or start typing to find blocks to add.
- the sidebar is where you can see more detailed audio scopes / midi visualisers, parameters, settings and states of a block.
- connections in benny can go from anything to anything. an audio output can be connected to an audio input, or to a parameter value, or to the midi note input of a synth. every wire has gain and mute controls and wires that translate from one kind of value to another let you choose how that happens
- almost every block can be made polyphonic. you can add or remove voices as you choose. notes sent to the block get allocated to voices (you can choose how) or you can send notes or audio or modulation directly to individual voices or sets of voices. you can adjust parameters for all voices together, or offset the parameters of individual voices.
- you can store the current parameter settings of a whole block and all its voices to a 'state'. states can contain settings for some or all of the blocks in a patch. you can trigger states by clicking their buttons in the top bar, or per-block, or xfade between states, or use musical information to trigger state changes using the core.states block.
- any block can have 1-3 of its parameters assigned to the position of imaginary creatures in a flocking simulation. the creatures are attracted to the parameter slider position but are influenced by a whole load of physical-ish things: friction, weight, attraction to or repulsion from other creatures, a desire to align or to head in different directions, from which many useful auto-modulations can be constructed. a simple 1d example would be eq peaks that move out of each other's way.
- some blocks have a full screen editor you can bring up, eg for editing sequences. some blocks have a mini-ui they can show in the sidebar with a version of this large editor
- the second main page of benny is the 'panels' view. you can choose what goes on here - both which blocks get a panel and which parameters show up on the panel. blocks may have mini-uis showing you what they're doing on this page. think of it as a place to build a custom set of controls and visualisation to perform this song.
- a song is a patch. a liveset is a folder of songfiles. on startup or when you select a new folder benny reads in everything in the folder and preloads as many audio files as it can. it also tries to recycle the voices of previously loaded songs so that it can load a new song as fast as possible. you can 'merge' one song in next to an existing one.
- meters in benny always show you the minimum and maximum value that happened in the last frame of video. every voice of every block has some kind of meter. midi meters show you the lowest note, highest note, lowest velocity and highest velocity.
- you can store multiple hardware configuration files for different setups you use. if a hardware block isn't available when loading a song, benny will either auto-substitute or prompt you to choose a replacement. the goal is for a benny-based live set to tolerate on the road equipment failures with minimum fuss.
- all send/return loops to hardware have aliasing preventing softclip and dither on the outputs. any audio block can be upsampled and run at a higher internal frequency
- you can arm any blocks to record apart from (at the moment) hardware ones, which you need to route to something else to record.
- [shortcut keys](https://github.com/jamesholdenmusic/benny/blob/main/docs/key%20commands.txt)

installation
------------
- install max (cycling74.com) but no need to buy it, just ignore all those messages, don't start the free trial, don't subscribe, nothing. you'll be able to use all the features of benny. BUT if you decide you want to learn to build your own blocks you'll need to buy max.
- in max / options / preferences / jitter preferences / make sure 'graphics engine' is set to glcore.
- open 'benny.maxproj'
- open the audio settings and choose which audio driver/interface to use
- choose the 'no hardware' configuration to try benny out using just the default io on your computer. to set benny up for seamless integration with your modular synth, keyboards, drum machines, synths, microphones, pedals, effects and midi input devices you'll need to make your own hardware configuration file.

configuration
-------------
- open the hardware editor, choose a configuration to start from. some example files are included.
- the recommended method with any outboard hardware is to define your blocks as things like 'x filter' or 'mono voice' rather than just abstracting your computer audio/midi io as a block. although this is a bit more effort in the setup it pays off in a more fluid experience patching, and enables things like swapping and substituting for no-longer available pieces of hardware.
- the vst plugin editor is rudimentary for now.. the idea is to pick a plugin, choose which parameters you want in the sidebar ui, assign them to up to 4 rows, press add..
    - KNOWN ISSUE if you only have 1 group a bug slightly corrupts the file. manually edit the .json files the vst editor spits out into the audio_blocks folder, look for the junk at the end of the 'groups' section and delete it.
    - KNOWN ISSUE if you change your mind how you want the parameters organised you can't load a vst's config and edit it, you just have to do it again 
    - KNOWN ISSUE on windows max sometimes can't find your plugins. the simplest solution is put them all in C:\Program Files\VSTPlugins
- all the visual/ui preferences are in config.json. this gets overwritten when you update the software, so if you want to change a setting copy the relevant entry you want to change the value of over to userconfig.json.
- the default numbers of note and audio voice slots can be changed, but baseline cpu usage of the system's matrix mixer grows fast with audio voice count.
   
developing blocks
-----------------
have a look in docs / block development / example patchers

every block needs, at minimum:
- a .json file describing its inputs, outputs, parameters
- a .maxpat file (that does the processing - note or audio - for one voice of your block)

the examples tell you everything you need to do. there are handy things like pitch lookup tables and shared memory for things like sequence storage and your patch can fairly easily manipulate any part of the song or set. 

optionally blocks can draw their own fullscreen / mini ui views like some of mine do. this is a 'block_ui_patcher' - a different patch, loaded separately from the voices. there's a max-only example in the note blocks folder, or you can look at the javascript-powered uis of any of the built in sequencers.
