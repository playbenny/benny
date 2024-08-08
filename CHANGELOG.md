## CHANGELOG

*This changelog is for noteworthy changes since the first public release. Breaking changes or changes to default behaviour will be in bold. Changes that are still on a branch on github rather than on main will be in ()*

08/08/24:
- added AMXD (max for live device) support
- added insert key shortcut on the connection edit sidebar view
- warnings when saving a patch where substitution have occured
- fixes to loading, merge, muting
- shift-delete to delete the selected blocks AND all blocks that are now left redundant by that deletion. (ctrl-shift click does the same but with mute)
- facility for opened patcher windows to stop benny listening to the keyboard while they have focus (this also optionally drops the benny framerate so that while developing patches your laptop doesn't got so hot)
- **changed default behaviour:** autozoom_on_select is now 0. set it to 1 if you want the old behaviour where selecting things would make the camera zoom out to make sure nothing obscures the sidebar.
