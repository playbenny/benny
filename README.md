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
- a few blocks require airwindows console 7 vsts. they're included in the download, look in the vst dependencies folder and install the ones you need for your system. windows users should install vsts to C:\Program Files\VSTPlugins otherwise max/msp can't see them.
- in max / options / preferences / jitter preferences / make sure 'graphics engine' is set to glcore.
- open 'benny.maxproj'. the benny launcher window will appear, along with the max console window.
- open the audio settings and choose which audio driver/interface to use
- choose the 'no hardware' configuration to try benny out using just the default io on your computer. to set benny up for seamless integration with your modular synth, keyboards, drum machines, synths, microphones, pedals, effects and midi input devices you'll need to make your own hardware configuration file.

hardware configuration
----------------------

to use your hardware fluidly within benny you need to build a configuration file. in it you tell benny about each piece of hardware that's connected to your computer, then they appear as blocks. if you change your hardware setup benny can help you migrate songs from the old to the new, letting you choose substitutes for missing or replaced items. in my usage i have a configuration file for each iteration of my live touring setup and a different one for a setup i have at home and a setup for the studio with my synths and outboard compressors available as individual blocks.

the hardware configuration file also includes information about the midi controllers you have connected - how many controls, how they're arranged, the midi channels and protocols etc that they use, and which other controllers work as a substitute.
there are example files included that might help. 

i do recommend the midi fighter twister controller for use with this as the led feedback and per knob rgb leds make it work well with the automapping features.

other configuration
-------------------

to use a vst plugin in benny you need to set it up in the vst manager. pick a plugin from the list the scanner finds (on windows if it doesn't find your vsts, put them in C:\Program Files\VSTPlugins), then pick the parameters you want to see (and store in savefiles) in benny, and the order they should appear - at the moment it lets you assign them to 4 groups (1 group = 1 row of sliders in the benny interface).
- KNOWN ISSUE if you only have 1 group a bug slightly corrupts the file. have 2 groups or more until this is fixed!
- KNOWN ISSUE if you change your mind how you want the parameters organised you can't yet load a vst's config and edit it, you just have to do it again 

all the visual/ui preferences - colour palette, wire curve detail, various other behaviours with self explanatory names, are in config.json. if you want to change a setting copy the relevant entry you want to change the value of over to userconfig.json and change it there, as config.json will be overwritten with defaults next time you update benny but userconfig will not.

the default numbers of note and audio voice slots can be changed this way, but baseline cpu usage of the system's matrix mixer grows fast with audio voice count.

contributing
------------

benny is currently in private beta but will be released as open source under the hippocratic license 3.0. contributions are welcome!
- report bugs on github.com under the 'issues' tab above. a good bug report contains a clear description of the problem and steps or attached files to reliably reproduce it
- if you want to contribute blocks and have them in the main repo just let me know. if you want, you can choose your own prefix for your blocks so you can have your own section in the menu.
- if you want to fix a bug:
  - create a new branch of the repository
  - fix the bug in your branch
  - submit a pull request to have your fix merged back into the main repo
- any questions, ask!

developing blocks
-----------------

have a look in docs / block development / example patchers

every block needs, at minimum:
- a .json file describing its inputs, outputs, parameters
- a .maxpat file (that does the processing - note or audio - for one voice of your block)

the examples tell you everything you need to do. there are handy things like pitch lookup tables and shared memory for things like sequence storage and your patch can fairly easily manipulate any part of the song or set. 

optionally blocks can draw their own fullscreen / mini ui views like some of mine do. this is a 'block_ui_patcher' - a different patch, loaded separately from the voices. there's a max-only example in the note blocks folder, or you can look at the javascript-powered uis of any of the built in sequencers.
