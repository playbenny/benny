benny
-----

- is a modular software playground for making live music
- integrates hardware and software, midi and audio, lets you connect anything to anything
- extends nearly everything into polyphony elegantly and flexibly
- is anti-timeline and tries not to impose a structure on you
- aims for a low-density, glance-able interface that works for touch and mouse/keyboard use
- is an extendible and hackable place to host your own max patches

**30 minute intro to benny video** https://www.youtube.com/watch?v=Hs_4T_gjoWw

**installation and hardware setup** https://playbenny.com/mediawiki/index.php?title=Installation

**developing your own blocks** https://playbenny.com/mediawiki/index.php/Developers

**shortcut keys** https://playbenny.com/mediawiki/index.php/Shortcuts

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

contributing
------------

benny is currently in private beta but will be released as open source under the hippocratic license 3.0. contributions are welcome!

- report bugs on github.com under the 'issues' tab above. a good bug report contains a clear description of the problem and steps or attached files to reliably reproduce it
- if you want to contribute blocks and have them in the main repo just let me know. if you want, you can choose your own prefix for your blocks so you can have your own section in the menu.
- if you want to fix a bug:
  - create a new branch of the repository
  - fix the bug in your branch
  - submit a pull request to have your fix merged back into the main repo
- any questions, ask in the discussion page here on github https://github.com/jamesholdenmusic/benny/discussions
