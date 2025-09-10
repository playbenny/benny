outlets = 0;

include("init_functions.js");
include("display_pages.js");
include("files.js");
include("blocks_and_connections.js");
include("mouse.js");
include("clocked.js");
include("mouse_helpers.js");
include("drawing_helpers.js");

//these are all loaded from the config.json file now BUT MAX_PARAMETER and MAX_NOTE_VOICES and MAX_MOD_IDS need sending out
var MAX_BLOCKS = 128; 
var MAX_NOTE_VOICES = 64;
var MAX_AUDIO_VOICES = 64;
var MAX_AUDIO_INPUTS = 12;
var MAX_AUDIO_OUTPUTS = 16;
var MAX_USED_AUDIO_INPUTS = 0;
var MAX_USED_AUDIO_OUTPUTS = 0;
var NO_IO_PER_BLOCK = 2;
var MAX_BEZIER_SEGMENTS = 16;//24; //must be a multiple of 4
var MAX_PARAMETERS = 256;
var MAX_DATA = 16384;
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
var SHOW_STATES_ON_PANELS = 1;
var SHOW_KEYBOARD_AUTOMAP_CONNECT_BUTTON = 0;
var BLOCK_TEXTURE_SIZE = 128;
var UPSAMPLING = 1;
var RECYCLING = 1;
var MODULATION_IN_PARAMETERS_VIEW = 1;
var AUTOZOOM_ON_SELECT = 1;
var CTRL_VOICE_SEL_MOMENTARY = 1;
var SHOW_STATES_ON_PANELS = 1;
var TARGET_FPS = [30, 5];
var SELECTED_BLOCK_Z_MOVE = 2;
var SELECTED_BLOCK_DEPENDENTS_Z_MOVE = 0.5;
var METER_TINT = 0.3;
var SONGS_FOLDER = "songs"; //current songs folder, actually gets read in from config file. every song file in the root of this folder is preloaded (it doesn't look in subfolders),
//  and all the wavs referenced in them are also loaded. this makes loading bits of a live set faster, but it means if your folder is full of junk the app will use a lot of memory.
var waves_preloading = 1;
var MUTEDWIRE = [0.16,0.16,0.14, 1];
var SOUNDCARD_HAS_MATRIX = 0;
var EXTERNAL_MATRIX_PRESENT = 0;
var pattern_recall_timing_quantise = "1n";
var STATE_FADE_DRAG_THRESHOLD = 20; // number of px of drag before state button converts into a slider

var quantised_event_list = [];


var panelslider_index;
var panelslider_visible = new Array(MAX_BLOCKS);

var danger_button = -1;
var folder_target = "";//when you pop open a folder select box, where is the result going?

var mainwindow_width = 320;
var mainwindow_height = 240;

var scale_2d = 1;

var displaymode = "loading";
var last_displaymode = "blocks"; //where you back out to if you hit esc from a ui page.
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
var input_used = new Array(MAX_AUDIO_INPUTS+2);

var audioiolists;

var state_fade = {
	start : [],
	y : 0,
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

var output_looper_active = 0;
var output_looper_block = -1;

var end_of_frame_fn = null;

var whole_state_xfade_create_task = new Task(create_whole_state_xfade_slider, this);
var keyrepeat_task = new Task(keydown,this,0);

var output_blocks_poly;
var voicealloc_poly;
var ui_poly;
var note_poly;
var audio_poly;
var audio_to_data_poly;
var sigouts;
var matrix;
var deferred_matrix=[];
var world;
var lcd_main;

var lcd_block_textures;
var textureset_blocks;

var topbar = {
	lcd: null,
	videoplane: null,
	used_length:0
}

var statesbar = {
	lcd: null,
	videoplane: null,
	used_height:0,
	colours : [],
	y_pos : []
}

var statesfadebar = {
	videoplane: null,
	shown: 0,
}

function thispatcherstuff(){
	output_blocks_poly = this.patcher.getnamed("output_blocks_poly");
	voicealloc_poly = this.patcher.getnamed("voicealloc_poly");
	ui_poly = this.patcher.getnamed("ui_poly");
	note_poly = this.patcher.getnamed("note_poly");
	audio_poly = this.patcher.getnamed("audio_poly");
	audio_to_data_poly = this.patcher.getnamed("audio_to_data_poly");
	sigouts = this.patcher.getnamed("smoothsigouts");
	matrix = this.patcher.getnamed("matrix");
	world = this.patcher.getnamed("world");
	lcd_main = this.patcher.getnamed("lcd_main");
	lcd_block_textures = this.patcher.getnamed("lcd_block_textures");
	textureset_blocks = this.patcher.getnamed("textureset_blocks");
	topbar.videoplane = this.patcher.getnamed("topbar_videoplane");
	sidebar.videoplane = this.patcher.getnamed("sidebar_videoplane");
	statesbar.videoplane = this.patcher.getnamed("statesbar_videoplane");
	statesfadebar.videoplane = this.patcher.getnamed("statesfadebar_videoplane");
	bottombar.videoplane = this.patcher.getnamed("bottombar_videoplane");
}

var phys_picker_id;

var scope_buffer = new Buffer("scope_buffer");
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
// var output_queue = new Buffer("output_queue"); //this is a list of things for the js to do that the gen code updates - hw midi out, sigs
var changed_queue = new Buffer("changed_queue"); //params that have changed for ui updates
//var output_queue_pointer = 0;
var changed_queue_pointer = 0;
var changed_flags = new Buffer("changed_flags"); //flags per voice for param changes
var mtoa_buffer = new Buffer("mtoa_sigs"); //eventually i think this could be only accessed from a gen output queue checker but for now it's in clocked js
var indexpool_buffer = new Buffer("INDEXPOOL"); // for scale lookup
var parameter_error_spread_buffer = new Buffer("parameter_error_spread_buffer"); //indexed by MAX_PARAMETERS * voice + paramno, this is the random spread values added to each voice's params
var routing_buffer = new Buffer("routing"); //replaces conversion buffer
	//index of this is 9 *( index + max_connections_per_output * (outputno + voiceno * max_outputs_per_voice ) )
var next_free_routing_index = []; // index of this is outputno + voiceno*max_outputs_per_voice, holds the next free index
var routing_index = []; //the actual index value where this connection's data is in the routing buffer.
  //routing_index[cno][destvoiceno][sourcevoice] = r_b index
var waves_search_paths = [];

var waves_polybuffer = new PolyBuffer("waves");
var polybuffer_names = [];
var polybuffer_samplerates = [];
var polybuffer_channels = [];
var polybuffer_lengths = [];

var preload_task;// = new Task(preload_all_waves, this);
var waves_buffer = [];

var midi_indicators = {
	list : [],
	status : [],
	flag : 0
}

var draw_wave = [];
var draw_wave_z = [];
var waves_slices_buffer = new Buffer("waves_slices");
var waves = {
	selected : -1,
	zoom_start : 0,
	zoom_end : 1,
	width : 640, //of the ui, for the mouse
	remapping : [],
	age : [],
	seq_no : 0,
	scroll_position: 0,
	show_in_bottom_panel: 0,
	playheadlist : [], //list of voices to check for playhead movement.
	v_helper : [], //colour of each voice's playhead, defined when you get the message about a playhead existing.
	v_label : [],
	v_jump : [], //[block,voice] for jumping to that one in the sidebar.
	visible : [], //0 or 1 for if it's onscreen.
	w_helper : [], // for each wave its x1,y1,height, width, range min max, colour,chans so the playhead has everything in one place
	ph_ox : [], //old playhead x, by voice.
	q_playing : 0,
	q_player : null
}
//var playheads = []; //index by voice, holds position, replaces the buffer method which crashed max
var waves_playheads_buffer = new Buffer("waves_playheads"); //ch1=playhead,ch2=wave

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

var blocks_cube = [];  //called block-blockno-voiceno
var blocks_cube_texture = [];
var blocks_tex_sent= []; //each element is mutestate+label
var blocks_menu_texture = [];
var blocks_menu = []; //called menulabel-type or menublock-type
var blocks_per_voice_colour_overrides = []; //eg if block 6 has this on some voices it'd be .._overides[6] = [0, [126,16,16], 0, etc]
var menu = {
	length : 10,  //endstop for the menu scroll
	search : "",
	camera_scroll : 0,
	original_position : [],
	mode : 0, //0=new block,1=swap block,2=insert in connection
	swap_block_target : -1, //when swapping a block for another this holds the target
	connection_number : -1,
	cubecount : 0,
	show_all_types : 0 //to override swap type filtering
}; 

var wires_position = []; // called wires-connectionno-segmentno
var wires_rotatexyz = [];
var wires_scale = [];
var wires_colour = [];
var wires_startindex = [];//indexed by wireno like the above, contains the first matrix index of a wire piece.
var wires_lookup = [];//reverse lookup indexed by matrix/multiple index, contains wire number
//legacy?
var wires_colours = [];
var wires_enable = []; //whether wire enable flag is set

var view_changed = true; //whether you're redrawing click buffers or not

var last_connection_made = -1;
var wires_potential_connection = -1; //if illustrating a potential connection you set this
//to the (unused) conn no you use for drawing the wire, then set back to -1 when you freepeer it

var bulgingwire=-1;
var bulgeamount=0;

var recursions = 0; // just because i had an anxiety dream about getting stuck in an infinite loop

var preload_list=[]; // this is for waves

var preload_note_voice_list = [];
var preload_audio_voice_list = [];

var matrix_wire_index = [];
var matrix_block_index = [];
var matrix_block_lookup = [];
var matrix_voice_index = [];
var matrix_voice_lookup = [];
var matrix_meter_index = [];

var matrix_menu_index = [];
var matrix_menu_lookup = [];

var matrix_wire_position;
var matrix_wire_scale;
var matrix_wire_rotatexyz;
var matrix_wire_colour;

var matrix_voice_position;
var matrix_voice_scale;
var matrix_voice_colour;

var matrix_block_position;
var matrix_block_scale;
var matrix_block_colour;
var matrix_block_texture;

var matrix_menu_position;
var matrix_menu_scale;
var matrix_menu_colour;
var matrix_menu_texture;

var matrix_meter_position;
var matrix_meter_scale;
var matrix_meter_colour;

var voice_cubes;
var meter_cubes;
var block_cubes;

var connection_blobs = []; // connection handles. maybe not even blobs one day.
//var background_cube;
//var menu_background_cube;
var selection_cube;
var flock_cube;
var flocklist=[];
var flockblocklist=[];
var flockvoicelist=[];
var flock_cube_size=20;
var blocks_meter = []; //called meter-blockno-outputno, they're a sub-array

var startup_loadfile = "autoload";

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

var param_defaults = [];

var ext_sync = {
	active : 0,
	state : 0,
	waiting : 0, //if the main transport is waiting for a bar on the sync transport in order to start.
	link_available : 0,
	link_enabled : 0
};

var scalesblock = -1;

var automap = {
	available_c : -1,
	voice_c : -1,
	available_k : -1,
	available_k_block : -1,
	already_k : 0, //if the keyboard is already connected to the current block don't auto
	mapped_c : -1,
	mapped_k : -1,
	mapped_k_v : -1,
	devicename_c : "",
	count : 0,
	inputno_k : 0,
	offset_c : 0,
	offset_range_c : 0, 
	c_cols : 4,
	c_rows : 4,
	mouse_follow : 0,
	groups : [], //index is group, content is controller row (ie before offset applied)
	sidebar_row_ys : [], //gets populated if mouse_follow on to speed up the hover check, index is group, content is starting (top) y
	q_gain : 0.125, //default gain for cue auto connections
	available_q : -1, //for cue (listen) automapping - holds the audio out(s) cue should go to
	mapped_q : -1, //if it's mapped this is the block it's mapped to
	mapped_q_channels : [],
	mapped_q_output : 0,
	lock_c : 0,
	lock_k : 0,
	lock_q : 0,
	looping_c : 0,
	looping_k : 0,
	colours_c : {
		darkest : [],
		dark : [],
		colour : []
	},
	colours_k : {
		darkest : [],
		dark : [],
		colour : []
	},
	colours_q : {
		darkest : [],
		dark : [],
		colour : []
	},
	scroll_accumulator : 0, //used in automap direct to core mode (eg for scroll file menu/block menu)
	assignmode : 0 //actually covers all controllers, if it's in move-to-pick mode this is 1.
}

var qwertym = {
	vel : 100
}

var wirecolour = [1,1,1,1];

var meter_positions = [[],[]];

var panels = {
	custom : [],
	order : [],
	editting : -1
};

var blocks_page = {
	new_block_click_pos : [0,0],
	was_selected : null,
	was_selected_voice : null,
	leftmost : 0,
	rightmost : 0,
	highest :0,
	lowest: 0
}	

var menucolour, menudark, menudarkest;
var greycolour, greydark, greydarkest;
var bg_dark_ratio = 0.2;
var fontheight,fontsmall;
var fo1;
var backgroundcolour;
var backgroundcolour_blocks;
var backgroundcolour_block_menu;
var backgroundcolour_panels;
var backgroundcolour_waves;
var backgroundcolour_sidebar;
var backgroundcolour_current;

var mouse_click_actions = [];
var mouse_click_parameters = [];
var mouse_click_values = [];

var um_task;

var usermouse = {
	last : {
		left_button : 0,
		shift: 0,
		alt: 0,
		got_i : 0,
		got_t : 0,
		x : 0,
		y : 0,
		scroll : -1 //holds index of last scrolled parameter, just used so as not to store too many undos
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
	ctrl_voice_select : 0, //turned on when ctrl has selected a voice in sidebar
	caps : 0,
	x : 0,
	y : 0,
	scroll : 0,
	timer : 0,
	scroll_accumulator : 0,
	sidebar_scrolling: null,
	long_press_function : null,
	wiretouch : {
		x : -1,
		y : -1
	},
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
		},
		target_wire_for_insertion: -1
	}
}

var bottombar = {
	videoplane: null,
	height: 200,
	block: -1,
	right: -1,
	requested_widths: [],
	available_blocks : []
}

var sidebar = {
	videoplane: null,
	used_height: 0,
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
		spread : 2,
		endx : 999
	},
	scroll : {
		position : 0,
		max : 0
	},
	scopes : {
		zoom : 0,
		voice : -1,    //this is eg voice 34 of the poly
		one_or_all : 0, //0=single, 1=all
		width : 0,
		starty : 0,
		endy: 0,
		voicelist : [-1, -1],
		midivoicelist : [], //list of voices to show (overlaid)
		midioutlist : [], //list of outputs to show (separate scopes for each)
		midiouttypes : [], //0 = notes, 1 = thin notes, 2 = values
		midi : -1, //this is the target id for midi notes that you're watching
		midinames : 1,
		fg: [255,255,255],
		bg: [10,10,10],
		midi_routing :{ //special post router meter shown on connections page
			starty : 0,
			endy : 0,
			voice : 298,
			number : -1,
			fg: [255,255,255],
			bg: [10,10,10]
		}
	},
	panel : 0,
	connection : {
		show_from_outputs : 0,
		show_to_inputs : 0,
		default_out_applied : 0, //ie on a new connection
		default_in_applied : 0,
		auto_pick_controller : 1,
		selected : -1,
		defaults : {
			offset : 0.5,
			offset2 : 0.5,
			vector : 0
		},
		help: 0
	},
	scrollbar_index : 2,
	back : [],
	fwd : [],
	files_page : "songs",
	notification : "",
	text_being_edited : "",
	channelnaming : ["block","channel"], //set when you bring up the edit channel name mode
	dropdown : null,
	show_help : 0 //once you add a block to a song this turns on and it always shows help
}

var patternpage = { // info to help draw pattern page fast
	enable : 0, //turned on when it loads a block with patterns
	column_block : [], //block no
	block_split : [], //if it's split into voices, then the number of voices. checked on switch mode. stored by block not by columnno
	block_statelist : [], //states that include this block
	column_type : [], //0 =state,
					// 1 = pattern ?? (wave scan? etc) if a block has both it gets one of each.
	usedstates : 0, //how many states are used
	max_rows : 0, //maximum of usedstates and number of patterns. actually it will display more than that, as one column could be up and one down? maybe?
	patternbeingnamed : -1, //just a place to hold the number of this to save 
	cursor_index : [], //by column, pointer index or list of indexes
	cursor_last : [],
	cursor_divisor : [], // 1/length;
	column_ends_x : [], //list of ends (start, end of voice 1, .. ,end of last voice) - so v+1 entries.
	held_state_fires : [],
	held_pattern_fires: [], //to indicate when a pattern etc is held via shift key..
	quantise_and_hold: 0 //or by midi, flagged here.
}

var capture = {
	keyboard : 0,
	controller : 0,
	target : null //which controller
}

var y_offset;

var mutemap = new Buffer("mutemap");
var mix_block_has_mutes = 0; //if a mixer channel is muted the unmute all button lights in the topbar

var redraw_flag = {
	flag : 0,
	deferred : 0,
	matrices : 0,
	targets: [],
	paneltargets: [],
	targetcount: 0,
	selective : 0
}

var am_foreground = 1; //other windows will message to say they want keyboard not to go to benny, this flags that.

var paramslider_details = []; //indexed by param number
//x1,y1,x2,y2,r,g,b,mouse_index,block,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider,gets-overwritten-with-y-coord-returned(bottom),click_to_set
var camera_position = [-2, 0, 23];

var config = new Dict;
config.name = "config";
var userconfig = new Dict;
userconfig.name = "userconfig";
userconfig.filechanged = function(){};

var hardwareconfig = new Dict;
hardwareconfig.name = "hardwareconfig";

var userpresets = new Dict;
userpresets.name = "userpresets";
userpresets.filechanged = function(){};

var keymap = new Dict;
keymap.name = "keymap";

var copy = new Dict;
copy.name = "copy";
var pasteoffset = [0,0]; //add to this before every paste, reset it on new copy

var undo = new Dict;
undo.name = "undo";

var undo_stack = new Dict;
undo_stack.name = "undo_stack";
var redo_stack = new Dict;
redo_stack.name = "redo_stack";

var undoing = 0; //flag 1 while you do undo actions to avoid writing those actions 
				// to the undo stack, 2 for while redoing

var flock_presets = new Dict;
flock_presets.name = "flock_presets";

var blocktypes = new Dict;
blocktypes.name = "blocktypes";

var aliases = new Dict;
aliases.name = "aliases";

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

var proll = new Dict;
proll.name = "seq-piano-roll";

var notepad_dict = new Dict; // for song notes
notepad_dict.name = "notepad"; 

var audio_patcherlist = new Array(MAX_AUDIO_VOICES);
var audio_upsamplelist = new Array(MAX_AUDIO_VOICES);
var note_patcherlist = new Array(MAX_NOTE_VOICES);
var ui_patcherlist = new Array(MAX_BLOCKS);
//var hardware_list = new Array(MAX_HARDWARE_BLOCKS);
var loaded_audio_patcherlist = new Array(MAX_AUDIO_VOICES); //these 3 hold what is already in the polys so nothing is unnecessarily loaded
var loaded_note_patcherlist = new Array(MAX_NOTE_VOICES);
var loaded_ui_patcherlist = new Array(MAX_BLOCKS);
var vst_list = new Array(MAX_AUDIO_VOICES);

var songlist = [];
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
var mainfont = "Arial";

var set_timer_start = null;
var set_timer_show = 0;

var projectpath="";

var ext_matrix = {
	connections : [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
	switch : -1
}
var loading = {
	progress : 0,
	songname : "",
	songpath : "",
	mute_loaded : 0,
	xoffset : 0,
	ready_for_next_action : 0,
	bundling : 1, //set to 1 for a slow load with a rest between each thing loaded, higher loads things in chunks, loads faster overall.
	wait : 1, //how many frame to wait between stages of loading
	mapping : [],
	incoming_max_waves: 16,
	conncount : 0, //how many connections
	merge : 0,
	mutelist : [], //each entry is [blockno,mute], you resend the message once everything should've loaded
	purgelist : [], //list of blocks to be deleted, and everything solely connected to them too. (for merge purge)
	wave_paramlist : [], //list of [blockno,paramno] that are wave parameters that have been remapped - it uses this list to apply the remapping to preset states too
	recent_substitutions : 0, //this is made into a dict where we keep a record of user substitutions during load, so we don't have to ask twice.
	lockout : 0, //to prevent hotkey triggering save twice
	hardware_substitutions_occured : 0, //this is set to 1 to put the warning on the save page
	save_waitlist : [], //blocks we are waiting for them to say they've completed a 'store' command.
	save_wait_count : 0,
	save_type : "selected", //selected, named, save
	temporandomise : 0
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

function show_diagnostics(x){
	debugmode = x;
}

function diagnostics(){
	post("\n\n\n\ndiagnostics\n-----------");
	post("\ndisplay mode",displaymode);
	if(displaymode=="custom") post("--",custom_block);
	post("\nsidebar mode",sidebar.mode);
	post("\nsidebar selected", sidebar.selected);
	post("\nscope selected",sidebar.scopes.voice, sidebar.scopes.voicelist);
	post("\nnblock selected",selected.block);
	if(voicemap.contains(selected.block.indexOf(1))) post("- its voices: ",voicemap.get(selected.block.indexOf(1)));
	post("\nwire selected",selected.wire);
	post("\npanels list: ",panels.order);
	post("\nnote patcherlist: \n",note_patcherlist,"\n loaded note patcherlist: \n",loaded_note_patcherlist,"\n audio patcherlist: \n",audio_patcherlist,"\n loaded audio patcherlist: \n",loaded_audio_patcherlist,"\n upsampling list: \n",audio_upsamplelist,"\n ui patcherlist: \n",ui_patcherlist,"\n loaded ui patcherlist: \n",loaded_ui_patcherlist,"\n vst list:\n",vst_list,"\n\n");
	post("\nNumber of items in the waves polybuffer:", waves_polybuffer.count); 
	post("\nMemory used in the waves polybuffer:", waves_polybuffer.size/1048576, " megabytes"); 
	post("\nredrawflag targets",redraw_flag.targets);
	post("\nredrawflag paneltargets",redraw_flag.paneltargets);
	deferred_diagnostics();
}

function request_globals(){
	globals_requested = 1;
}

function messagerate(rate){
	cpu_meter.midi_message_rate = rate;
	if(rate>1200) post("\nMESSAGE RATE WARNING:",rate," messages per second - looks like it might be feedback watch out");
	if(rate>9000) mute_last_connection();
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

function other_window_active(a){
	if(!Array.isArray(TARGET_FPS)){
		am_foreground = 1;
		return 0;
	}
	if(world == null) return 0;
	if(a == 1){
		am_foreground = 0;
		world.message("fps", TARGET_FPS[1]);
	}else{
		am_foreground = 1;
		world.message("fps", TARGET_FPS[0]);
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

var screenDimensions = { x : 1200, y: 800 };
function screensize(x,y){
	screenDimensions.x = x;
	screenDimensions.y = y;
}

function send_globals(){
	messnamed("MAX_DATA",MAX_DATA);
	messnamed("MAX_BLOCKS",MAX_BLOCKS);
	messnamed("MAX_NOTE_VOICES",MAX_NOTE_VOICES);
	messnamed("MAX_AUDIO_VOICES",MAX_AUDIO_VOICES);
	messnamed("MAX_AUDIO_INPUTS",MAX_AUDIO_INPUTS);
	messnamed("MAX_AUDIO_OUTPUTS",MAX_AUDIO_OUTPUTS);
	messnamed("NO_IO_PER_BLOCK",NO_IO_PER_BLOCK);
	messnamed("MAX_PARAMETERS",MAX_PARAMETERS);
	messnamed("MAX_MOD_IDS",MAX_MOD_IDS);
	messnamed("MAX_WAVES", MAX_WAVES);
	messnamed("MAX_WAVES_SLICES",MAX_WAVES_SLICES);
	globals_requested = 0;
}