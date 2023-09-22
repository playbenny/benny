MULTITUDES
----------
- is software for making live music
- integrates hardware and software
- aims for a low-density, low-distraction, glance-able interface that works for touch and mouse/keyboard use
- is agnostic about timelines and structure rather than imposing either
  
installation
------------
- for now (in the end i'll make gen versions of everything i use) you need to install the ar. airwindows externals, they're in a zip in the root folder. test they're installed by in a new max window making an object, ar.cliponly2~, if it works you're good.
- in max / options / preferences / jitter preferences / make sure 'graphics engine' is set to glcore
- open 'multitudes.maxproj'

configuration
-------------
- recommended max/msp audio settings: vector size same as audio buffer size, i work at 256 (any lower and the multicore processing doesn't run very efficiently) scheduler in audio interupt ticked, overdrive ticked
- recommended max scheduler settings, found under options/preferences/scheduler, take a screenshot of your original ones just in case
    Event Interval (ms) : 2
    Overdrive : Yes
    Poll Throttle : 100
    Queue Throttle : 10
    Redraw Queue Throttle : 100
    Refresh Rate : 33.333333
    Scheduler Interval (ms) : 1
    Scheduler Slop (ms) : 100
- in the end, there'll be a hardware editor.. for now, using the hardware config .json files as an example, build your own, with entries for any pieces of modular or hardware you want to use. in vscode this isn't too bad...
- the vst plugin editor is rudimentary for now.. the idea is to pick a plugin, choose which parameters you want in the sidebar ui, assign them to up to 4 rows, press add..
    - KNOWN ISSUE manually edit the .json files the vst editor spits out into the audio_blocks folder, look for the junk at the end of the 'groups' section and delete it.
    - KNOWN ISSUE you can't load a vst's config and edit it, you just have to do it again if you change your mind how you want the parameters organised
    - KNOWN ISSUE on windows sometimes max pretends not to be able to find your plugins. the simplest solution is put them all in C:\Program Files\VSTPlugins
- there's a config.json file you can edit with some visual/ui preferrences

temporary limits
----------------
at the moment the code is fixed to 64 midi block voices, 64 audio block voices, 16 hw outs, click on 17, 12 hw ins. this will all be reconfigurable at startup in the end.
at the moment only 2-in 2-out audio voices are supported. eventually 'wide' voices with more io will be possible.
parameter refresh rate is about every 20ms at the moment. plan to speed it up a bit.

developing blocks
-----------------
you can canibalise my code but i'm about to implement a new more efficient way of getting the parameters, like a standardised starter patcher.
