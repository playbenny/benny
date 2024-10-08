## CHANGELOG

*This changelog is for noteworthy changes since the first public release. Breaking changes or changes to default behaviour will be in bold. Changes that are still on a branch on github rather than on main will be in ()*

8/10/24:
- renamed some blocks for clarity. introduced aliases list so that this doesn't break anyone's old savefiles.
- recording from hardware blocks is possible now
- there is a midi in indicator - a dot for each available input device - to help you check midi inputs are working properly etc. next to the play button.
26/09/24:
- utility.fidget block - adhd for parameter values
23/09/24:
- seq.values supports patterns
- WIRES_REDUCE key in userconfig simplifies wire drawing for connections to/from all voices
- distance-fog effect on further wires, cleans up display
- mechanism to take a load off max scheduler by only enabling midi outputs if they're connected (currently only used on utility.env.asr's EOA/EOR outs)
- when connecting a paramater (1d) output to a midi input labelled as 'notes' or 'notes in' or 'pitch' benny automatically sets the conversion settings to turn the values into different notes (as opposed to different velocities, the default)
20/09/24:
- random per-note delay options added to the midi delay block, useful for making the notes of a chord not all arrive simultaneously
- audio rate smoothing block added (useful after an env used as an envelope follower)
- env and vca.env updated to make audio rate trigger/follow inputs actually work **breaking change** the options for in2 on the env.asr have changed
- bonk block added. detects drum transients, can be trained to identify a number of different drums. currently saving the training data isn't implemented.
16/09/24:
- meter_tint in the config sets the colour of block meters (0 = the block colour, 1 = white)
- vca.env made more useful
15/09/24:
- **breaking change** midi.scale.quantise is renamed to utility.cv.scale.quantise. if you have problems loading old songs you can open the json and run a find replace to swap all instances of the old name to the new name.
- new midi.scale.quantise (does midi-only quantising)
- fixes and improvements to sample tracker - slice drawing, patterns
- fullscreen clock / click to toggle to timer / ctrl click resets timer
- support for 'special controllers' (eg my new live pc has a high res encoder to adjust last param)
- waves page param value step fixed so it's useable now
- midi pitch range block
11/09/24:
- preliminary alysseum matrix support works - in hw editor you can define what matrix io a hardware block is connected to then in the new connection view a new type of wire is available - matrix - which is purple.
- drag and drop audio files onto the launcher benny logo loads them into the next free slots
- fixes to setting up midi only hardware blocks
- fixes to muting hardware blocks' midi handler
04/08/24:
- hardware editor layout improvements (collapsing tree), support for selecting soundcard and external matrix drivers, improved labelling, selecting matrix channels
- experimental support for nearly-direct routing of hardware-hardware connections through RME totalmix (instead of bringing audio into max, through the internal matrix and back out, this drastically reduces the latency of these connections). needs to be enabled under advanced in hardware manager. known issue: these connections don't show up on benny's audio meters.
28/08/24:
- fixes to vst manager
- support for drivers for external matrixes (eg alysseum, erica in hardware, or soundcard driver matrix mixers too, eg RME totalmix) (this is in a branch)
- utility.midi.calculus block added - given a stream of midi values it outputs rate of change (with a nice smoothing algo) and integral as well as difference to last value and noteouts for change, 'becomes nonzero' and 'becomes zero'.
- utility.midi.smooth block - uses the cytomic smoothing algorithm used in the calculus block to provide simple effective value-stream smoothing.
18/08/24:
- **breaking change** the mix curve on buckets and tape and stretch delays has been changed. at the midpoint both wet and dry signals are at 100% - ie the mix fader *brings in* the wet signal, which doesn't create the impression of the music getting quieter. (previously all 3 had different behaviour, none of which was quite right)
- **breaking change** rene no longer supports per-voice values for the contents of the cells. but now cell enable buttons work in the ui
- fixes to core.input.control
- vst parameter sync between plugin window ui and benny fixed
- modal synthesis voice added
- wave.scan now supports free play (ie playing even when transport stopped) 
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
- added AMXD (max for live device) support
- added insert key shortcut on the connection edit sidebar view
- warnings when saving a patch where substitution have occured
- fixes to loading, merge, muting
- shift-delete to delete the selected blocks AND all blocks that are now left redundant by that deletion. (ctrl-shift click does the same but with mute)
- facility for opened max/msp patcher windows to stop benny listening to the keyboard while they have focus (this also optionally drops the benny framerate so that while developing patches your laptop doesn't got so hot)
- **changed default behaviour:** autozoom_on_select is now 0. set it to 1 (in userconfig) if you want the old behaviour where selecting things would make the camera zoom out to make sure nothing obscures the sidebar.
