outlets = 0;

include("init_functions.js");
include("display_pages.js");
include("files.js");
include("blocks_and_connections.js");
include("mouse.js");
include("clocked.js");
include("mouse_helpers.js");
include("drawing_helpers.js");

//these are all loaded from the config.json file now BUT MAX_PARAMATER and MAX_NOTE_VOICES and MAX_MOD_IDS need sending out
var MAX_BLOCKS = 128; 
var MAX_NOTE_VOICES = 64;
var MAX_AUDIO_VOICES = 64;
var MAX_AUDIO_INPUTS = 12;
var MAX_AUDIO_OUTPUTS = 16;
var MAX_USED_AUDIO_INPUTS = 0;
var MAX_USED_AUDIO_OUTPUTS = 0;
var NO_IO_PER_BLOCK = 2;
var MAX_BEZIER_SEGMENTS = 12;//24; //must be a multiple of 4
var MAX_PARAMETERS = 256;
var MAX_DATA = 1024;
var MAX_MOD_IDS = 1024;
var MAX_WAVES_SLICES = 1024;
var MAX_WAVES = 16;
var MAX_HARDWARE_MIDI_OUTS = 256;
var MAX_HARDWARE_BLOCKS = 64;
var MAX_CONNECTIONS_PER_OUTPUT = 32;
var MAX_OUTPUTS_PER_VOICE = 128;
var MAX_STATES = 8;
var MERGE_PURGE = 1;
var MAX_PANEL_COLUMNS = 4;
var SELF_CONNECT_THRESHOLD = 1200; //when dragging a block back onto itself
var DOUBLE_CLICK_TIME = 8;
var LONG_PRESS_TIME = 800;
var SLIDER_CLICK_SET = 0;
var SCOPE_DEFAULT_ZOOM = 0.65;
var BLOCK_TEXTURE_SIZE = 128;
var ANIM_TIME = 0.25;
var UPSAMPLING = 1;
var RECYCLING = 1;
var MODULATION_IN_PARAMETERS_VIEW = 1;
var BLOCKS_GRID = [100, 0.01];
var BLOCK_MENU_CLICK_ACTION = "click";
var SONGS_FOLDER = "songs"; //current songs folder, actually gets read in from config file. every song file in the root of this folder is preloaded (it doesn't look in subfolders),
//  and all the wavs referenced in them are also loaded. this makes loading bits of a live set faster, but it means if your folder is full of junk the app will use a lot of memory.
var waves_preloading = 1;
var TEMPLATES_FOLDER = "templates";

var panelslider_index;
var panelslider_visible = new Array(MAX_BLOCKS);

var danger_button = -1;
var folder_target = "";//when you pop open a folder select box, where is the result going?

var mainwindow_width = 320;
var mainwindow_height = 240;
var scale_2d = 1;

var displaymode = "loading";
var custom_block = -1; //block no for custom screen pages
var playing = 0;
var recording = 0;
var recording_flag = 0;
var playflag = 0;

var meters_enable = 0;
var meters_updatelist = {
	hardware : [],
	meters : [],
	midi : []
}
var debug = 0;

var output_used = new Array(MAX_AUDIO_OUTPUTS+2);
var input_used = new Array(MAX_AUDIO_OUTPUTS+2);

var state_fade = {
	start : [],
	x : 0,
	index : 0,
	end : [],
	static_start : [],
	static_end : [],
	colour : [],
	lastcolour : [],
	selected : -2, //-1 = init state, -2=none
	position : -1, //-1 = no fader, 0-1=fade pos.
	last: -1 //just for the colour fade on the slider.
}

var whole_state_xfade_create_task = new Task(create_whole_state_xfade_slider, this);
var keyrepeat_task = new Task(keydown,this,0);

var end_of_frame_fn = null;

var output_blocks_poly = this.patcher.getnamed("output_blocks_poly");
var voicealloc_poly = this.patcher.getnamed("voicealloc_poly");
var ui_poly = this.patcher.getnamed("ui_poly");
var note_poly = this.patcher.getnamed("note_poly");
var audio_poly = this.patcher.getnamed("audio_poly");
var audio_to_data_poly = this.patcher.getnamed("audio_to_data_poly");
var sigouts = this.patcher.getnamed("sigouts");
var matrix = this.patcher.getnamed("matrix");
var world = this.patcher.getnamed("world");
var lcd_main = this.patcher.getnamed("lcd_main");

var output_looper_active = 0;
var output_looper_block = -1;

var lcd_block_textures = this.patcher.getnamed("lcd_block_textures");
var textureset_blocks = this.patcher.getnamed("textureset_blocks");

var glpicker = new JitterObject("jit.gl.picker","mainwindow");

var scope_buffer = new Buffer("scope_buffer");
var midi_scope_buffer = new Buffer("midi_scope_buffer"); //old one, to be replaced..

var midi_meters_buffer = new Buffer("midi_meters_buffer");
var midi_scopes_buffer = new Buffer("midi_scopes_buffer");
var midi_scopes_change_buffer = new Buffer("midi_scopes_change_buffer");
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); //for each voice, the final value of all parameters
var voice_data_buffer = new Buffer("voice_data_buffer"); //for voices that store data, eg grid seq
var parameter_value_buffer = new Buffer("parameter_value_buffer"); //for each block, the values set by the user
var parameter_info_buffer = new Buffer("parameter_info_buffer"); //for each block, for each param, min max steps curve (stored in 4 channels)
var mod_buffer = new Buffer("mod_buffer"); //filled according to 'id' which just increments (total length is like 40k) then this is looked up from the mod_route dict/coll
var parameter_static_mod = new Buffer("voice_static_mod_buffer"); //holds per voice tweaks to parameter values
var mod_sum_action_list = new Buffer("mod_sum_action_list"); //this is a list of things to add up and where they go, for modulation. the list is redone every time it might've changed, eg blocks added, flocks changed, connections added/removed
var rebuild_action_list = 0;
var output_queue = new Buffer("output_queue"); //this is a list of things for the js to do that the gen code updates - hw midi out, sigs
var changed_queue = new Buffer("changed_queue"); //params that have changed for ui updates
//var output_queue_pointer = 0;
var changed_queue_pointer = 0;
var mtoa_buffer = new Buffer("mtoa_sigs"); //eventually i think this could be only accessed from a gen output queue checker but for now it's in clocked js

var parameter_error_spread_buffer = new Buffer("parameter_error_spread_buffer"); //indexed by MAX_PARAMETERS * voice + paramno, this is the random spread values added to each voice's params
var routing_buffer = new Buffer("routing"); //replaces conversion buffer
	//index of this is 9 *( index + max_connections_per_output * (outputno + voiceno * max_outputs_per_voice ) )
var next_free_routing_index = []; // index of this is outputno + voiceno*max_outputs_per_voice, holds the next free index
var routing_index = []; //the actual index value where this connection's data is in the routing buffer.
  //routing_index[cno][destvoiceno][sourcevoice] = r_b index
var waves_polybuffer = new PolyBuffer("waves");
var polybuffer_names = [];
var polybuffer_samplerates = [];
var polybuffer_channels = [];
var polybuffer_lengths = [];

var preload_task = new Task(preload_all_waves, this);
var waves_buffer = [];

var draw_wave = [];
var waves_slices_buffer = new Buffer("waves_slices");
var waves = {
	selected : -1,
	zoom_start : 0,
	zoom_end : 1,
	remapping : [],
	age : [],
	seq_no : 0
}

var quantpool = new Buffer("QUANTPOOL");
var indexpool = new Buffer("INDEXPOOL");
var notepools_dict = new Dict;
notepools_dict.name = "notepools";

var flock_buffer = new Buffer("flock_buffer");
var flock_list_buffer = new Buffer("flock_list"); //this is a copy of flocklist[] but starts from 1, because 0 holds the length
var is_flocked = new Array(65536); //voice*MAX_PARAMS+paramno is the index, this is also the index for voice_parameter_buffer. 
 //   								  the value is 0 for no or flock_id for yes
var mod_id = 0;

// new click buffer. this array is typed for speed. we take index (12bit) and add bitshifted type(4bit)
// dont mess it up with out of bounds values. index < 4096, type < 16
var click_i = new Int16Array(9900000); //more than 4k. 
var click_b_s = 2; //click buffer is scaled, >> click_b_s, so 
var click_b_w = 11 >> click_b_s; //width of the screen log2 (ie so 2^this > actual width)

var connections_sketch = new JitterObject("jit.gl.sketch","mainwindow");

//these hold all the opengl objects (labels, blocks separate for the main one, in one for the menu one.)
//var blocks_label = []; //called label-blockno-0
var blocks_cube = [];  //called block-blockno-voiceno
var blocks_cube_texture = [];
var blocks_tex_sent= []; //each element is mutestate+label
var blocks_menu_texture = [];
var blocks_menu = []; //called menulabel-type or menublock-type
var menu_length = 10; //endstop for the menu scroll
var cubecount; //number of menu cubes
var wires = []; // called wires-connectionno-segmentno
var wires_colours = [];
var wires_enable = []; //whether wire enable flag is set

var view_changed = true; //whether you're redrawing click buffers or not

var wires_enable_animate = []; // list of [wireno,target enable value,current seg,direction,length];

var wires_show_all = 1;

var wires_potential_connection = -1; //if illustrating a potential connection you set this
//to the (unused) conn no you use for drawing the wire, then set back to -1 when you freepeer it

var bulgingwire=-1;
var bulgeamount;

var recursions = 0; // just because i had an anxiety dream about getting stuck in an infinite loop

var preload_list=[];

var connection_blobs = []; // connection handles. maybe not even blobs one day.
var background_cube;
var selection_cube;
var menu_background_cube;
var flock_cube;
var flocklist=[];
var flockblocklist=[];
var flockvoicelist=[];
var flock_cube_size=20;
var blocks_meter = []; //called meter-blockno-outputno, they're a sub-array

var selected = {
	block : [],
	wire : [],
	anysel : 0,
	block_count : 0,
	wire_count : 0
}

var anymuted = 0; //if any blocks are muted (to show the unmute all btn)

var song_select = { //used to show the buttons to select the last song or the new song, when merging happens.
	previous_name : "",
	current_name : "",
	previous_blocks : [],
	current_blocks : [],
	show: 0
}
var wire_ends = [];

var wire_dia = 0.03;

var cur_font_size = 0;

var param_defaults = [];

var automap = {
	available_c : -1,
	available_k : -1,
	available_k_block : -1,
	already_k : 0, //if the keyboard is already connected to the current block don't auto
	mapped_c : -1,
	mapped_k : -1,
	mapped_k_v : -1,
	devicename_c : "",
	inputno_k : 0,
	offset_c : 0,
	offset_range_c : 0,
	c_cols : 4,
	c_rows : 4
}

var wirecolour = [1,1,1,1];

var meter_positions = [];

var panels_custom = [];
var panels_order = [];

var blocks_page = {
	new_block_click_pos : 0,
	leftmost : 0,
	rightmost : 0,
	highest :0,
	lowest: 0
}	

var block_menu_d = {
	mode : 0, //0=new block,1=swap block,2=insert in connection
	swap_block_target : -1, //when swapping a block for another this holds the target
	connection_number : -1,
}

var touch_click=0;
var stored_click = [];

var menucolour;
var menudark;
var menudarkest;
var bg_dark_ratio = 0.2;
var matrixcolour;
var hardwarecolour;
var audiocolour;
var midicolour;
var parameterscolour;
var blockcontrolcolour;
var fontheight;
var fo1;
var backgroundcolour;
var backgroundcolour_blocks;
var backgroundcolour_block_menu;
var backgroundcolour_panels;
var backgroundcolour_waves;
var backgroundcolour_sidebar;
var backgroundcolour_current;

//this is what a listener looks like
//var mylistener = new JitterListener(mywindow.getregisteredname(), thecallback);
//var picker = new JitterObject("jit.gl.picker","mainwindow");
//picker.hover=0;
//var picker_listener = new JitterListener(picker.getregisteredname(), picker_callback);

var mouse_click_actions = [];
var mouse_click_parameters = [];
var mouse_click_values = [];

var usermouse = {
	last : {
		left_button : 0,
		shift: 0,
		alt: 0,
		got_i : 0,
		got_t : 0
	},
	queue : [],
	qlb : 0,
	qcount:0,
	clicked2d : -1, //hold id of a thing if you click/drag it
	clicked3d : -1,
	hover : [-1,-1,-1], //hover things while you drag a thing
	ids : [0,0,0], //current, split by -'s
	oid : null,//-1.1, //last hover id, to see if it's changed
	got_i : 0,
	got_t : 0,
	left_button : 0,
	shift : 0,
	alt : 0,
	ctrl : 0,
	caps : 0,
	x : 0,
	y : 0,
	timer : 0,
	sidebar_scrolling: null,
	long_press_function : null,
	drag : {
		starting_x : 0,
		starting_y : 0,
		starting_value_x : 0,
		starting_value_y : 0,
		last_x : 0,
		last_y : 0,
		distance : 0,
		release_on_exit : 0,
		dragging : {
			connections : [],
			voices : []
		}
	}
}

var sidebar = {
	mode : "none",
	lastmode : "none",
	selected : -1,
	selected_voice : 0, //this is eg voice 2 out of 4 for this block
	width : 100,
	width_in_units : 8,
	x : 490,
	x2 : 900,
	scrollbar_width : 9,
	meters : {
		startx : 490,
		spread : 2
	},
	scroll : {
		position : 0,
		max : 0
	},
	editbtn : 0,
	editbtn_x: 0,
	editcolour : [255,255,255],
	editdark : [64,64,64],
	scopes : {
		zoom : 0,
		voice : -1,    //this is eg voice 34 of the poly
		one_or_all : 0, //0=single, 1=all
		width : 0,
		starty : 0,
		endy: 0,
		voicelist : [-1, -1],
		midivoicelist : [],
		midioutlist : [],
		midi : -1, //this is the target id for midi notes that you're watching
		midinames : 1,
		fg: [255,255,255],
		bg: [10,10,10]
	},
	panel : 0
}

var mutemap = new Buffer("mutemap");

var redraw_flag = {
	flag : 0,
	deferred : 0,
	targets: [],
	paneltargets: [],
	targetcount: 0,
	selective : 0
}
var paramslider_details = []; //indexed by param number
//x1,y1,x2,y2,r,g,b,mouse_index,block,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider,gets-overwritten-with-y-coord-returned(bottom),click_to_set
var camera_position = [-2, 0, 23];
var menu_camera_scroll = 0;

var text_being_editted="";

var config = new Dict;
config.name = "config";
var userconfig = new Dict;
userconfig.name = "userconfig";

var keymap = new Dict;
keymap.name = "keymap";

var copy = new Dict;
copy.name = "copy";
var pasteoffset = [0,0]; //add to this before every paste, reset it on new copy

var flock_presets = new Dict;
flock_presets.name = "flock_presets";

var blocktypes = new Dict;
blocktypes.name = "blocktypes";

var blocks = new Dict;
blocks.name = "blocks";

var voicemap = new Dict;
voicemap.name = "voicemap";

var hardware_metermap = new Dict;
hardware_metermap.name = "hardware_metermap";

var connections = new Dict;
connections.name = "connections";

var new_connection = new Dict;
new_connection.name = "new_connection";
var potential_connection = new Dict;
potential_connection.name = "potential_connection";

var connection_menu = new Dict;
connection_menu.name = "connection_menu";

var states = new Dict;
states.name = "states";

var data = new Dict;
data.name = "data";

var song = new Dict;
song.name = "song";

var songs = new Dict;
songs.name = "songs";
var songs_info = []; //holds voicecount etc 
var songs_moddate = []; //and file data/time for every preloaded json song.

var io_dict = new Dict;
io_dict.name = "io";

var midi_routemap = new Dict;
midi_routemap.name = "midi_routemap";

var mod_routemap = new Dict;
mod_routemap.name = "mod_routemap";
var mod_param = new Dict;
mod_param.name = "mod_param";


var waves_dict = new Dict;
waves_dict.name = "waves";

var audio_patcherlist = new Array(MAX_AUDIO_VOICES);
var audio_upsamplelist = new Array(MAX_AUDIO_VOICES);
var note_patcherlist = new Array(MAX_NOTE_VOICES);
var ui_patcherlist = new Array(MAX_BLOCKS);
var hardware_list = new Array(MAX_HARDWARE_BLOCKS);
var loaded_audio_patcherlist = new Array(MAX_AUDIO_VOICES); //these 3 hold what is already in the polys so nothing is unnecessarily loaded
var loaded_note_patcherlist = new Array(MAX_NOTE_VOICES);
var loaded_ui_patcherlist = new Array(MAX_BLOCKS);
var vst_list = new Array(MAX_AUDIO_VOICES);

var songlist;
var currentsong = -1;

var fullscreen = 0;

var note_names=[];

var poly_alloc = { //393 possible modes...
	stack_modes : [ "unison all", "1x","2x","3x","4x","5x","6x","octave","2x octave" ],
	choose_modes : ["blind cycle","blind random","cycle free","first free", "last free", "random free", "notememory"],
	steal_modes : ["no steal","oldest","lowest","highest","cyclic","random","notememory"]
}
var flock_modes = ["off","spring mass", "spring mass repel", "spring mass rotate"];
var latching_modes = ["continuous","initial noteon","all ons","all ons and offs"];

var record_arm = [];

var mulberryseed = 0; //seed for the mulberry32 random fn that does error spread values
var param_error_drift = []; //new Array(MAX_AUDIO_VOICES+MAX_NOTE_VOICES+MAX_HARDWARE_BLOCKS);
var param_error_lockup = new Array(MAX_AUDIO_VOICES+MAX_NOTE_VOICES+MAX_HARDWARE_BLOCKS);
//both indexed by voice / param num. populated when you make a new block or voice?

var still_checking_polys = 0;
var globals_requested = 0;

var deferred_diag = [];
var debugmode = 0;

var glow_amount=0.15;
var monofont = "Consolas";
var mainfont = "Consolas";

var ext_matrix = {
	connections : [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
	switch : -1
}
var loading = {
	progress : 0,
	songname : "",
	dont_automute : 0, //if set to 1 then audio blocks don't automatically unmute on load - because the load routine does that depending on saved status once all are loaded.
	mute_loaded : 0,
	xoffset : 0,
	ready_for_next_action : 0,
	bundling : 1, //set to 1 for a slow load with a rest between each thing loaded, higher loads things in chunks, loads faster overall.
	wait : 1, //how many frame to wait between stages of loading
	mapping : [],
	merge : 0,
	mutelist : [], //each entry is [blockno,mute], you resend the message once everything should've loaded
	purgelist : [], //list of blocks to be deleted, and everything solely connected to them too. (for merge purge)
	wave_paramlist : [] //list of [blockno,paramno] that are wave parameters that have been remapped - it uses this list to apply the remapping to preset states too
}

var cpu_meter = {
	avg : [256],
	peak : [256],
	fps : [256],
	pointer : 0,
	lastdrawn : -1,
	x : 1,
	y2 : 9,
	y1 : 40
}

function init(){
	// the jit world sends this message, but at present we only initialise when a hardware mapping is selected.
}

function loadbang(){

}

function show_diagnostics(x){
	debugmode = x;
}

function diagnostics(){
	post("\n\n\n\ndiagnostics\n-----------\n");
	post("display mode",displaymode,"\n");
	if(displaymode=="custom") post("--",custom_block);
	post("sidebar mode",sidebar.mode,"\n");
	post("sidebar selected", sidebar.selected, "\n");
	post("scope selected",sidebar.scopes.voice, sidebar.scopes.voicelist, "\n");
	post("block selected",selected.block,"\n");
	if(voicemap.contains(selected.block.indexOf(1))) post("- its voices: ",voicemap.get(selected.block.indexOf(1)),"\n");
	post("wire selected",selected.wire,"\n");
	post("panels list: ",panels_order,"\n");
	post("note patcherlist: \n",note_patcherlist,"\n loaded note patcherlist: \n",loaded_note_patcherlist,"\n audio patcherlist: \n",audio_patcherlist,"\n loaded audio patcherlist: \n",loaded_audio_patcherlist,"\n upsampling list: \n",audio_upsamplelist,"\n ui patcherlist: \n",ui_patcherlist,"\n loaded ui patcherlist: \n",loaded_ui_patcherlist,"\n vst list:\n",vst_list,"\n\n");
	post("Number of items in the waves polybuffer:", waves_polybuffer.count); 
	post("Memory used in the waves polybuffer:", waves_polybuffer.size/1048576, " megabytes\n"); 
	deferred_diagnostics();
}

function request_globals(){
	globals_requested = 1;
}

function cpu(avg,peak,fps){
	cpu_meter.pointer++;
	cpu_meter.pointer &= 127;
	cpu_meter.avg[cpu_meter.pointer] = avg;
	cpu_meter.peak[cpu_meter.pointer] = peak;
	cpu_meter.fps[cpu_meter.pointer] = fps;
	if(sidebar.mode=="cpu"){
		if(cpu_meter.lastdrawn > 3){ 
			redraw_flag.flag |= 2; 
			cpu_meter.lastdrawn =0;
		}else{ 
			cpu_meter.lastdrawn++; 
		}
	} 
}

function outputfx(type, number, value){
	if(type=="meter"){
		if(value==0){
			c=menucolour;
		}else if(value==1){
			c=[255,100,60];
		}else if(value==2){
			c=[60,255,60];
		}else if(value==3){
			c=[60,205,100];
		}else if(value==4){
			c=[255,90,255];
		}
		meter_positions[1][0]=c;
		meter_positions[1][1]=[(c[0]*0.2)|0,(c[1]*0.2)|0,(c[2]*0.2)|0];
		output_looper_active = (value>0);
		output_looper_block = number;
	}
}

function request_waves_remapping(type, voice){
	post("\n remapping request received,",type,voice,"the remapping i sent out is",waves.remapping);
	if(type=="audio"){
		audio_poly.setvalue((voice-MAX_NOTE_VOICES)+1,"remapping",waves.remapping);
	}else if(type=="ui"){
		ui_poly.setvalue(voice+1,"remapping",waves.remapping);
	}
}

function send_globals(){
	messnamed("MAX_DATA",MAX_DATA);
	messnamed("MAX_BLOCKS",MAX_BLOCKS);
	messnamed("MAX_NOTE_VOICES",MAX_NOTE_VOICES);
	messnamed("MAX_AUDIO_VOICES",MAX_AUDIO_VOICES);
	messnamed("MAX_AUDIO_INPUTS",MAX_AUDIO_INPUTS);
	messnamed("MAX_AUDIO_OUTPUTS",MAX_AUDIO_OUTPUTS);
	messnamed("NO_IO_PER_BLOCK",NO_IO_PER_BLOCK);
//	messnamed("MAX_BEZIER_SEGMENTS",MAX_BEZIER_SEGMENTS);
	messnamed("MAX_PARAMETERS",MAX_PARAMETERS);
	messnamed("MAX_MOD_IDS",MAX_MOD_IDS);
	messnamed("MAX_WAVES", MAX_WAVES);
	messnamed("MAX_WAVES_SLICES",MAX_WAVES_SLICES);
	globals_requested = 0;
}

