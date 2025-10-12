12/10/25:
- **core.scales.shapes** now has easier ways to select common scales - via sliders or midi input.

8/10/25:
- **version 0.555**
- breaking change: the spread/rotate formula has been tweaked - spread works properly on stereo destinations and the polyphonic gain autocompensation is much less aggressive. old songfiles will use the old formula, any songs you start in this version will use the new one. if you've made a custom 'autoload.json' file you'll need to make it again from the one bundled with this version. 
- the spread rotate ui has also been improved, hopefully it now explains what's happening better.
- you can use arrow keys to move through the new block menu

1/10/25:
- new block **utility.env.ping** is an envelope inspired by the 4ms PEG. the overall envelope time (attack+decay) is set by tap tempo, a 'time division' slider and a 'mult' slider then that time is split between attack and release by another slider. very fun envelope and mod source with a lot of surprising possibilities. thanks to [El Chico Fuendre](https://elchicofuendre.bandcamp.com/album/ragas-for-city-dwellers) for coding this one.  

24/9/25:
- big update to **midi.lfo**, including tap tempo input, midi input to set phase, buttons for quantised time periods, extended range, new visualisation

20/9/25:
- **voice.filter.env** the voice basic osc and env with the sm devices 2pole filter (with its own env) added. lots of modulation options including self-modulation.

19/9/25:
- **utility.midi.to_cv** (fka utility.self.tuner) has been fixed and updated. to improve the slope calibration to match your interface/oscilators you can press the 'calibrate slope' button and then send it a low note and then a high note a second or more apart. the slope will be stored. it assumes a linear relationship between voltage and pitch, so only works with well behaved v/oct oscillators (at the moment).

10/9/25:
- new 'autoconnect' feature: when creating a new block you can have it automatically connect to the block that was selected when you enter the menu. this happens if your hold shift while clicking your selected new block / while hitting enter to pick, or there's a config option that makes this happen even without shift held. also works if a single voice is selected.
- when you drag to make a new connection, if you hold ctrl as you release the new connection starts off muted. useful for live patching..

9/9/25:
- on blocks that have buttons that set a value - eg buckets delay has a row of time buttons - these are able to be applied to just one voice if you select it before pressing the button.
- main window opens at a more useable size by default.

8/9/25:
- **varispeed looper** adjusted, now with shortcut buttons to set length and change rate in useful ways, both of which make it easier to use as a basic looper.

5/9/25:
- adjusted project settings for faster initial load
- improved 'make space' function: alt+shift + scroll to spread out all the blocks on the blocks page

17/8/25:
- new **midi.logic** and **utility.audio.logic** are blocks that perform all the classic logic functions: OR, AND, XOR, NAND.
- **utility.spray** is a block that routes incoming notes to different outlets indexed by either note or velocity. useful for example, for turning a sequencer/clock progress counter into events at particular steps.

2/8/25:
- **seq.values** now lets you type lists of values in directly. hover your mouse over the lane you want to type into, then type, separating values by commas. eg c4,c#4,36,37,,,,2,3,127 followed by enter.

10/7/25:
- two new utilities for splitting signals so you can process parts of them differently: **utility.band.split** is a classic crossover for splitting a signal into frequency bands. you can stack them up for more bands. **utility.transient.split** splits a signal into 'transient' and 'body' portions. you can use this for simple transient enhancement as well as for applying different processing to the two parts.

9/7/25:
- two new blocks from Luke Abbott - **fx.multiband.drive** is a 3 band transfer-curve based saturator and **source.auto.drummer** is a super-simple preset beatbox - intended as a songwriting aid - based around dr110 samples. waltz! polka! rock.
- a change to dragging behaviour. now, to connect a block to itself you need to hold shift. you can switch back to the old behaviour in preferences if you prefer.

2/7/25:
- **utility.sacred.channel** - is a synth channel minus the oscillators: a SEM-like 12dB morphing filter and a saturating VCA driven by an ADSR envelope. a VCA floor parameter allows you to let a drone through.

28/6/25:
- big overhaul to how modulation and parameters get distributed to voices which has reduced cpu usage dramatically.

18/6/25:
- removed invisible layout grid, feels smoother
- **fx.thermal.eq** is a new eq block based on multi-level impulses taken from a british tube eq i have. it has a highpass and a single band of boost which pushes into the saturation nicely. a bite control lets transients through the drive a little.
- mixer.mono.thermal & mixer.stereo.thermal are a pair of mixer channels based on the same code. the mono one has a sidechain compressor input where the compression reduces transient detail as well as ducking the signal. the stereo one has a mid-side option with separate controls for the side channel.

15/6/25:
- in the sidebar parameters view, the modulation amount sliders for connected mod sources now (optionally) display the offset as well as the amount for that modulation.
- the ui prefs editor now updates preferences instantly, without a restart of benny.

13/6/25:
- **source.sacred.waves.osc** is a new dual+sub oscillator core by Luke Abbott based on wavetables sampled from a few synths at my studio (sacred walls) - a prophet 600 and a mono/poly. it gets the essential tone of those two surprisingly nicely and adds a versatile set of modulation options.
- you can now drag a block onto a wire while holding ctrl-shift (cmd-shift) to insert it into that wire. thanks to user 'gullygully'

11/6/25:
- improved scales handling - every block that uses scales (like midi.scale.quantise or fx.retune or fx.pitch.gate or midi.note.select or...) now has a much nicer scale selector. you can see the selected scale, and edit it with the mouse. the scales are still stored in a core.scales.shapes block but this gets loaded automatically for you if you load a block that needs it.
- lots of workflow improvements, macos compatibility improvements and bugfixes, many thanks to everyone trying benny out and contributing feedback and fixes!
- midi.lfo **breaking change** the maximum rate has been increased slightly. when loading old songs using this block you may need to make a small adjustment to the rate slider. 

8/6/25:
- **fx.metal.box** - hardware preamp/circuit colour replication, based on multi-level impulses sampled from recording equipment in my studio. works great on the end of an instrument's signal chain to gently glue it together, push up the level and round off the edges. the whole development of this was inspired by the process of helping my friend christopher duffin (xam duo) mix some tunes, and noticing that a lot of his parts (from things like a dx7 or juno or a rhodes recorded hot) didn't need much mix processing because the pushy, squared off output stages of all the gear involved had done half the job for us.
- **fx.convolve** - general purpose efficient convolution processor. you need to install the HISStools package in max package manager then you can convolve incoming audio with impulses stored in the waves page of benny. (also works well with samples that aren't reverb impulses).

3/6/25:
- **utility.spectrum** block added - outputs a test tone, shows the spectrum of its input in a pop up window.

28/5/25:
- important: **breaking change** if you already had a launch control xl, or midi fighter twister configured you should remove it from your hardware profile(s) and re-add. this will make it use the new midi controller drivers written specially for these controllers.
- hardware manager now supports readymade configurations for common controllers. if benny recognises a controller when you add it in hardware manager the settings will be autofilled and you'll be notified. 
- monome arc support, including displaying both the type of the control (eg unipolar, bipolar, stepped menu item) and the individual voice parameter values for polyphonic blocks.
- improved controller ui, colour assignments and storing initial values are easier with the new edit mode
- end zone forces : for controllers with encoders or motorised controls, you can specify zones at either end of the range that either attract or repel. this is useful for example when mapping to delay feedback controls, which are nice to turn up for a moment but bad if you forget and leave them there too long.
- smart jumpless soft pickup implemented for controllers with potentiometer outputs. you can disable this in the preferences. smart soft pickup remaps the fader curve to take into account differences between the controller position and the actual value. this means there are no jumps, no dead zones, and increasing the fader value always increases the output value (and the converse).
- controller looper. there's a button in the ui marked loop, or you can assign a midi button. while held, it captures all controller moves, when released it loops them - the loop length is set by the duration of the press. if you just tap the button it loops the preceding bar. moving any of the looped controls again stops the loop. once you have something looped you can click the 'grab' button to turn that loop into a permanent copy in a new piano roll player block. thanks to j preiksa for the suggestion!
- the keyboard looper has been improved to match the controller one, though the short-tap default loop is 8 bars, and you can adjust the loop capture range in the keyboard block before spawning a piano roll block if you want. both loopers copy a bit of performance prior to the loop into the piano roll when you spawn it, in case the previous take was better.
- improved piano roll ui - you can click to open / fold lanes, and the automatic focus only expands used lanes.
- on the panels page, if a block has patterns and the pattern selector is assigned to its panel then it displays pattern trigger buttons - one button per available non-empty pattern.

04/05/25:
- on windows, when using MME drivers, if an audio device (eg bluetooth headphones) disconnects then the max scheduler stops and as a result benny's ui stops too. this is a max/windows issue that i can't fix, but as a workaround if it happens you can scroll down on the launcher window and there's now an emergency save button which will save the contents of your song even if the ui and/or max scheduler have stopped.

28/4/25:
- improved the feel of the state fade sliders - you can make them pop up by dragging the state buttons in the left bar.

18/04/25:
- new **recall** page. shows a grid of all stored states (per block) and all available patterns. beta, in progress still, i'm up for hearing feedback in the github discussions page or discord.
- hold shift when clicking a state button (in the left sidebar or on the recall page), or a pattern (on the recall page) to quantise firing it to the next bar. if shift is still held when the bar comes around it waits for the next one, etc. ctrl-clicking the column labels mutes blocks.
- pattern naming, nicer pattern selector for the sidebar, pattern copy/clear. implemented for: seq values/note step/note tracker/piano roll/sample tracker (not relevant for any of the other sequencers - as seq analog/rene store their sequence in parameters, so patterns for these can be stored and recalled in states)
- improved how record works for **note step/note tracker/sample tracker**. these blocks can either record live (into as many voices as have been added) or if the transport is stopped you can step record into them.
- added step record facility to seq.values. you can take input from either note or velocity of your controller keyboard for the recording.

13/04/25:
- better indicators for **ableton link** - if it's installed an enable button is in the clock block sidebar as well as the midi indicators sidebar, and the play button changes colour depending on sync status. i've put a note about installing link in the manual too.
- tap tempo (in clock block sidebar)

10/04/25:
- **comparator** block
- fixed a bug in the integrator saw used in the basic/dual oscs and voices that caused dc offset and reduced level for notes in higher octaves.
- blocks' help text is shown by default now, rather than needing a click to expand that section of sidebar. by default this turns on after you add a block to the set, as if you haven't added a block we assume you're playing a live set and don't need extra distracting info on screen. this behaviour can be changed in the ui preferences.

03/04/25:
- **midi clock out**, audio clock out. benny's midi/audio clock out is based around the idea of a session that may be continuing even when benny itself stops. when you start the music the external clock starts in sync, but when you stop benny the external clock does not stop. ctrl-click on the play button to stop the external clocks. there is an external clock out indicator at the bottom of the midi in indicators (next to the play button). if the external clock is running and you start benny then benny will wait until the next downbeat before starting. you can configure outputs and ppqn values in the hardware manager. this has only been tested with a very limited range of hardware so far so please do get in touch if you find problems!
- **tempo bend** - you can map a controller to bend tempo _like a dj_, useful for shifting phase if you're manually synchronising benny to something else.
- **ableton link** support (experimental) to make this work you need to install the ableton link package in max yourself. in a max window look under file/package manager. once installed you can find the enable button in the midi indicators sidebar page for now (click the midi indicators right of the play button).

02/04/25:
- **core.tuning** updated to use presets, which means it'll be easy for people to submit tunings to be included. benny can apply the tuning system selected not only to the built in oscillators, voices etc but to any vst or amxd (max for live device) that supports pitch bend input. (you need to set the pitch bend range for the vst in the vst manager, then add as many voices to the vst block as there are notes used in your scale and it will do the rest automatically.)

28/03/25:
(i was digging through old patches trying to recreate a particular old song waclaw zimpel and i did and found these three which i've ported to benny)
- **ks6** block. 6 strings in one voice with energy crossfeeding between them via a body resonance, a slightly richer instrument than the basic ks.string model.
- **chaos osc**. makes a great lfo as it provides 3 outs that have some degree of correlation, and a pattern that comes close enough to repeating that you can use it musically.
- **wave guide** block. simple wave guide model with a pair of filters in the feedback path, does a good impression of overblown woodwind.

26/03/25:
- mixer channels in the blocks page now show their mute / solo status via shading.

25/03/25:
- when you add a mixer channel block it now automatically creates a bus if there isn't one. likewise new channels are automatically connected to the bus.

24/03/25:
- input processing: enabled by default but can be disabled per-input in the hardware config editor, there's dc blocking (which you would want to switch off if you're bringing control voltages in from eg a modular into benny, but is otherwise useful) and a gate, which is (only) designed to switch inaudible (below -60db) signals off to help save cpu. (there are no controls, if you want that use the utility.gate block).

23/03/25:
- big improvement to **panels** page layout edit - ctrl-click the titlebar of any panel to bring up the panel parameters assign mode of the sidebar as well as the reorder/hide buttons.

15/03/25:
- on startup the tempo is set to a random value to protect users from accidentally starting a song at 120bpm.

11/03/25:
- new **mixer** channel types. there are now stereo input and mono input variants of 3 different mixer channels, each designed for performable control of one aspect of the sound:
    - .basic - is the original channel, with eq shape and stereo width set by choosing a preset 'voicing'. amount and freq controls allow fine-tuning, but these are designed to work well together. the mono channel has a very simple sidechain compressor input designed for ducking/negative space.
    - .comp - based around a luke abbott multiband compressor design for versatile and live-show-safe dynamic control. can smooth transients or solidify them. the mono version has an optional sidechain in that automatically turns on if you connect something to it. the stereo version works slightly more on the mid channel than the sides.
    - .tape - has a pre and post emphasis eq around airwindows' totape6. with positive amounts it's a boost into the tape saturation and a smaller cut after, leaving a bump with extra harmonic energy. with amount negative the opposite happens, a shallow wide dip turns into a wide dip with a clean boost in the middle of it that works well for solid clean weight on a part's fundamental. the stereo version works in mid-side and again the mono version of this has a sidechain compressor input.
- all the mixer blocks are named more logically now (but old songs will adapt automatically).

10/03/25:
- big update to the **waves section** and related blocks. the waves ui has been made clearer, easier to use and more stable, wave drawing is better, zooming and panning works. playheads are drawn on the main waves page for all the blocks in the set. hopefully this makes it easier to understand what blocks like the multi.sample.player are doing. the waves page can now coexist with the sidebar. there's no longer any limit on the number of waves loaded.
- if you have a cue output set up in your hardware profile you can cue a wave by clicking and holding on it in the waves section. automapping controllers now control zoom and pan on waves.

06/03/25:
- **freeze** block inspired by watching my friend chris duffin (xam duo, etc) play sax into a guitar freeze pedal. when on (via a midi in or a button in the ui) the block freezes a small section of audio - either by looping (forward or bidirectional) or a basic FFT-stretch-freeze effect. the position slider lets you move already-captured loops' start and end around in the buffer. works well polyphonically - if you add voices it lets you grab and hold multiple instants from an incoming audio stream, for example.
- **tilt+scan** block for generating structured modulation for multiple voices or multiple parameters. wire each voice of this block to a voice on a block you want to modulate, in order, and this will let you tilt (optionally exponentially) the values and/or scan a resizable bump through the voices' values. you can also use it to modulate many parameters of one voice, for example the partials on a harmonic oscillator, as shown in the demosong.

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