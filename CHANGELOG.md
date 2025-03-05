05/03/25:
- sidebar midi scope view: now all the midi and parameter outputs are shown at once, and parameter value outputs get their own kind of display. hopefully this gives an instant idea of what kind of midi/value outputs are available from a block. you can click midi scopes to show a label describing them.

04/03/25:
- improved the (headphones?) **cue** facility - if a cue out is set up in your hardware profile then automap cue becomes available, with the ability to select which  output of a block / which voice you listen to, as well as cue gain control and the ability to lock the cue to the current source. also works on connections and the input scope view.

03/03/25:
- **song notes** (under files / ... / edit song notes) are shown when you select a song in the file list, and pop up while/after it loads the song.

28/2/25:
- simplified the files page, removed the 'templates' folder. on the 'files/...' menu there's a list of recently used folders.

25/2/25:
- **flocking** improvements - once you've assigned some parameters to flocking the flock controls are visible at the bottom of the sidebar parameters view, which makes tuning behaviour easier. you can also click blocks in the flock visualiser to select them in the sidebar to adjust.

22/2/25:
- **piano roll** improvements - snap to grid while dragging, nice fast pan and zoom, and now all the modifier events work: they let you apply skipping, transposing, repeating notes, etc, to the pattern, with the option to use probability or a cyclic 'n times out of every x events' to decide when. presently you need to scroll over the modifier event to adjust the 1st modifier event parameter, alt-scroll adjusts the second if there are two.
- you can also play modifier notes into an input on the piano roll

20/2/25:
- **mixer** improvements - you can name channels, the bus displays the names when it's in the bottom bar view, many ui fixes.
- if you select multiple connections going to one place you can insert a mixer (channels+bus)
- it's now possible to bypass the airwindows console system on the mixer

16/2/25:
- the mixer channel/stereo channel now compensate the gain fader when 'cascade' or 'crunch' modes are selected to roughly match the 'channel' mode gain. *breaking change* if you used cascade or crunch you'll need to raise your level sliders on those channels to match how it sounded before.
- **bottom panel area**. experimental. at the moment only the mixer bus can be put there.

15/2/25:
- **presets** - block developers can include presets in their blocks, and the user can save their own presets for any blocks.

14/2/25:
- the **envelopes** in voice.basic, voice.pitch.env, voice.dual, voice.harmonic, voice.noise, env.asr, vca.env, 2pole.filter.env have been upgraded to include a switch between regular envelope behaviour (an exponential envelope rises fast initially and falls fast initially, slowing as it progresses in both directions) and 'mirrored' mode, where exponential envelopes start to rise slowly, accelerating as they go on, forming a mirrored version of the decay curve. *breaking change* the old default was the mirrored behaviour, but the new default is the opposite, which means some old patches might sound wrong until you flip the (new) mode button.

13/2/25:
- 3d objects now go *behind* the sidebar and other control panel areas

12/2/25:
- **huge performance improvements**! i'd been putting this off but it wasn't as bad as i feared (!) the 3d graphics now takes advantage of 'hardware instancing' which means the cpu overhead of large patches is vastly reduced. on my mid-range framework intel laptop (no gpu) with a particular largeish patch ('blackpool late 80s') from my live set the cpu usage/power draw drops by 50% (!) despite it actually hitting a higher FPS than before. 
- mouse selection and hover on the blocks page is also vastly improved as it now uses physics based picking on the gpu instead of the axis aligned bounding box method it used before. everything should feel a lot snappier.
- wires also look a bit better and the hover / selection graphics are clearer.

8/2/25:
- **ui preferences editor** - saves users having to edit any .json files, has helpful info about what the settings do. autosaves but you have to fully close all max windows and restart benny to apply some of the settings.

2/2/25:
- ui preferences option to downsample the audio_to_data section that does signal->param conversions (downsampling will make no real difference here) and scopes and meters, where it affects the maximum scope zoom in. the default (1) gives best appearance, but you can save a lot of cpu (~20%?) on low end systems by dropping this to 4 or 8.
- experimental: i've turned off multithreading for these meters, which actually seems to have reduced cpu use (threads locking around buffer access perhaps?)

31/1/25:
- **seq.curved.time** is a rhythm sequencer based around bending time. two phasors with a curve-warp option are summed and when they cross thresholds a trigger is emitted. makes a nice weird lfo too.

25/1/25:
- **automap for controllers** now works in more places - on connections (for gain/conversion parameter editting) and for scroll file menu / new block menu

20/1/25:
- added more models to **voice.modal**, *breaking change* which will possibly throw off model selection in old songfiles. easy to correct and the new models are nice.
- **stick slip model block** (model of a mass sticking and slipping on a surface as it is pulled by a spring - useful for generating rhythms, making lfos more interesting, processing audio, scrapes and scratches)

18/1/25:
- new sidebar view during drag-to-connect showing you the inputs and outputs available on the source/dest blocks

16/1/25:
- **undo now works for almost everything** in the main part of benny

9/1/25:
- quantpool was populated slightly wrong, i think. *breaking change* very slight chance if you were using quantisers of any kind they may need a slight offset adjustment
- fix quantislide osc 

28/12/24:
- updated the clock input of **rene** which is a *breaking change* if you were using the other inputs, just fix those connections and it'll work as before though. rene ui improvements, new features.
- **piano roll** is enabled but it's still a work in progress.

27/12/24:
- **quanti.slide.osc** added (has a scale quantiser built in, after unstable pitch+fm+range+detune+midi note+slide)
- **sidechain compressor** now just a simple gen algorithm, no longer requires pro-c2 to work.

26/12/24:
- *breaking change* there are now separate forward and backwards trigger inputs to note.step and note.tracker, which means if you were using row-select or reset inputs you'll need to fix those connections because they'll point to the wrong input now.
- a few js error trapping things to make it work in max 9 v8 engine (it does, but i'm not switching for now because that would prevent max8 users using it and it doesn't bring huge performance gains)
- key 'SHOW_CONTROL_AUTO_DURING_SONG_LOAD' added. if you enable this then while it loads a song it shows you the fullscreen control auto view, which should have labels telling you what the knobs of your controller are assigned to.

24/12/24:
- improved how qwerty input octave control works
- improved **shape player block**. removed the two self-playing modes because this is something you can do using one or two other blocks so it doesn't need to be built in.

05/12/24:
- **four stage env** added, lets you do complex envelopes. easily chainable, lots of interesting trigger ins and outs.
- dropdowns now available as a parameter display type
- added a bunch of the **new max9 abl devices - so far: compressor, limiter, 3band eq, all the reverbs, all the filters, all the modulation (chorus etc)**

19/11/24:
- **midi.lfo** now lets you modulate the rate without glitching
- value to value connections now have an offset. likewise audio-value, value-audio, etc (i think this is not a breaking change, still testing with savefiles)

16/11/24:
- *breaking change* the mode of shape player where the note at the clock input sets offset has been removed, just map input note to the offset slider to do this.

11/11/24:
- *breaking change* the range for the output of cv scale quantiser has been fixed.
- source/voice basic and pitch env osc have had exp fm modes added. this is the new default, works well with the audio output of cv scale quantiser.

10/11/24:
- **type numbers while over a slider to enter the value directly**
- midi message rate displayed on resource monitor page.
- START_FULLSCREEN key in config.
- *breaking change* seq values has had a few changes. if you were using it and using the note->position or reset inputs you'll need to find those connections and select the right input again. also the undocumented and buggy D=reverse,B=reset 'feature' on the trigger input is removed - all notes trigger it now, and there's a separate 'reverse' input. there's also a note out that uses the velocity of the incoming trigger (the note comes from the sequence value).
- **midi.delay** has an output midi gain control.
- the new midi recording (in input keyboard) stuff is now in main, but the piano roll block is hidden from the menu for now

06/11/24:
- **env.asr**'s EOA/EOR outputs now output notes who's velocity matches the peak level of the envelope in that cycle. makes it more useful for looped envelope bouncing ball stuff. possibly a *breaking change* if you used this output on something velocity-sensitive.
- request_set_voice_param - the way a block asks to set its own parameters, now sets the block param instead if there's only one voice. testing to see if any issues with existing blocks.
- *breaking change* **source.random** - value out is now bipolar, which makes it more useful

20/10/24:
- dragging blocks off the edges of the page / into the sidebar area now scrolls the blocks page
- (in a branch) core.input.keyboard now has history recording, can loop bits of the recording and can spawn an already-connected piano roll block playing back that loop too.

13/10/24:
- **tides** (version 1) added
- '**make space**' fn : shift+alt+scroll on the blocks page to push all blocks away from the mouse cursor (or pull towards)
- **clouds** now supports saving the contents of its internal buffer to a wave slot (and to disk so it's recalled when you load the song next time)

12/10/24:
- **rings, clouds, warps, sheep and braids** all added too. the MI blocks with pitch inputs have been adjusted to work with benny's global tuning table system. also added the MI verb and phase vocoder
- **voice.basic** now has a row of velocity modulation controls, which makes that more convenient.
- file menu laid out in a hopefully more intuitive way
- **seq.wonky** - set step lengths with sliders, it fits the steps into the desired loop length and follows an incoming clock

9/10/24:
- **voice.plaits** is a wrapper for v boehm's port of MI plaits. works really nicely with benny's workflow i think, and is fun in polyphony. the audio input destination selectors work with the module's different behaviour for when things are plugged in or not, when things aren't connected to the mod inputs there's an internal decay envelope. grateful for Emilie's generosity.

8/10/24:
- renamed some blocks for clarity. introduced aliases list so that this doesn't break anyone's old savefiles.
- **recording from hardware blocks is possible now**
- there is a **midi in indicator** - a dot for each available input device - to help you check midi inputs are working properly etc. next to the play button.

26/09/24:
- **utility.fidget** block - adhd for parameter values

23/09/24:
- **seq.values** supports patterns
- WIRES_REDUCE key in userconfig simplifies wire drawing for connections to/from all voices
- distance-fog effect on further wires, cleans up display
- mechanism to take a load off max scheduler by only enabling midi outputs if they're connected (currently only used on utility.env.asr's EOA/EOR outs)
- when connecting a paramater (1d) output to a midi input labelled as 'notes' or 'notes in' or 'pitch' benny automatically sets the conversion settings to turn the values into different notes (as opposed to different velocities, the default)

20/09/24:
- random per-note delay options added to the **midi.delay** block, useful for making the notes of a chord not all arrive simultaneously
- audio rate **smoothing block** added (useful after an env used as an envelope follower)
- env and vca.env updated to make audio rate trigger/follow inputs actually work *breaking change* the options for in2 on the env.asr have changed
- **bonk block added. detects drum transients**, can be trained to identify a number of different drums. currently saving the training data isn't implemented.

16/09/24:
- meter_tint in the config sets the colour of block meters (0 = the block colour, 1 = white)
- **vca.env** made more useful

15/09/24:
- *breaking change* midi.scale.quantise is renamed to **utility.cv.scale.quantise**. if you have problems loading old songs you can open the json and run a find replace to swap all instances of the old name to the new name.
- new **midi.scale.quantise** (does midi-only quantising)
- fixes and improvements to **sample tracker** - slice drawing, patterns
- fullscreen **clock** / click to toggle to timer / ctrl click resets timer
- support for 'special controllers' (eg my new live pc has a high res encoder to adjust last param)
- waves page param value step fixed so it's useable now
- **midi pitch range** block

11/09/24:
- preliminary **alysseum matrix support** works - in hw editor you can define what matrix io a hardware block is connected to then in the new connection view a new type of wire is available - matrix - which is purple.
- **drag and drop audio files** onto the launcher benny logo loads them into the next free slots
- fixes to setting up midi only hardware blocks
- fixes to muting hardware blocks' midi handler

04/08/24:
- **hardware editor** layout improvements (collapsing tree), support for selecting soundcard and external matrix drivers, improved labelling, selecting matrix channels
- experimental support for nearly-direct routing of **hardware-hardware connections through RME totalmix** (instead of bringing audio into max, through the internal matrix and back out, this drastically reduces the latency of these connections). needs to be enabled under advanced in hardware manager. known issue: these connections don't show up on benny's audio meters.

28/08/24:
- fixes to **vst manager**
- support for drivers for external matrixes (eg alysseum, erica in hardware, or soundcard driver matrix mixers too, eg RME totalmix) (this is in a branch)
- **utility.midi.calculus** block added - given a stream of midi values it outputs rate of change (with a nice smoothing algo) and integral as well as difference to last value and noteouts for change, 'becomes nonzero' and 'becomes zero'.
- **utility.midi.smooth** block - uses the cytomic smoothing algorithm used in the calculus block to provide simple effective value-stream smoothing.

18/08/24:
- *breaking change* the mix curve on buckets and tape and stretch delays has been changed. at the midpoint both wet and dry signals are at 100% - ie the mix fader *brings in* the wet signal, which doesn't create the impression of the music getting quieter. (previously all 3 had different behaviour, none of which was quite right)
- *breaking change* rene no longer supports per-voice values for the contents of the cells. but now cell enable buttons work in the ui
- fixes to core.input.control
- vst parameter sync between plugin window ui and benny fixed
- modal synthesis voice added
- **wave.scan** now supports free play (ie playing even when transport stopped) 
- fix to panel slider behaviours, fix behaviour when dragging along a row of sliders with the 'click to set' property enabled
- improvements to notepool loading (trying to avoid duplicate loads without messing it up..)

09/08/24:
- improvements to rene block ui and functionality
    - quantise, root pitch, movement modes, the bug that made my song 'renata' work
- improvements to core.input.control ui
    - ui adapts to rows and cols of controller
    - sliders on the ui now work as well. it works if the physical controller isn't present when loading songs.
    - starting states can be set for controllers per-song. (still in testing)

06/08/24:
- added **AMXD (max for live device)** support - add your AMXD devices in the vst manager
- added insert key shortcut on the connection edit sidebar view
- warnings when saving a patch where substitution have occured
- fixes to loading, merge, muting
- shift-delete to delete the selected blocks AND all blocks that are now left redundant by that deletion. (ctrl-shift click does the same but with mute)
- facility for opened max/msp patcher windows to stop benny listening to the keyboard while they have focus (this also optionally drops the benny framerate so that while developing patches your laptop doesn't got so hot)
- **changed default behaviour:** autozoom_on_select is now 0. set it to 1 (in userconfig) if you want the old behaviour where selecting things would make the camera zoom out to make sure nothing obscures the sidebar.

20/07/24:
- public alpha first shared.