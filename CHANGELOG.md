## CHANGELOG

*This changelog is for noteworthy changes since the first public release. Breaking changes or changes to default behaviour will be in bold. Changes that are still on a branch on github rather than on main will be in ()*
18/08/24:
- **breaking changes** the mix curve on buckets and tape and stretch delays has been changed. at the midpoint both wet and dry signals are at 100% - ie the mix fader *brings in* the wet signal, which doesn't create the impression of the music getting quieter. (previously all 3 had different behaviour, the best of which was wasting cpu on a sqrt curve..)
- fixes to core.input.control
- modal synthesis voice added
- wave.scan now supports free play (ie playing even when transport stopped) 
- fix to panel slider behaviours, fix behaviour when dragging along a row of sliders with the 'click to set' property enabled
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
