// INITIALISATION IS IN 4 MAIN FNS:
// LOADBANG - called on first load, things like setting max scheduler settings,
//      reading userconfig to find out what hardware config you last used
// INITIALISE_DICTIONARIES - loads everything it can
// IMPORT HARDWARE - once the user chooses hardware and confirms by hitting start,
//   remaining init steps and then starts audio and graphics engines
// INITIALISE RESET - just the resets you need to do when it reboots

// loadbang runs itself and init dicts
// start runs import hardware
// restart calls reset,init dicts, import hardware 

function loadbang(){
	thispatcherstuff();
	var path = this.patcher.filepath;
	projectpath = path.split("patchers/");
	projectpath = projectpath[0];
	post("\npath is",projectpath);
	messnamed("filepath","set",projectpath,1);
	post("\nlooking for userconfig:",projectpath+"userconfig.json");
	var userconfigfile = new File(projectpath+"userconfig.json");
	if(userconfigfile.isopen){
		userconfigfile.close();
		userconfigfile.freepeer();
	}else{
		userconfigfile.close();
		userconfigfile.freepeer();
		post("\n-------------\nfirst run. hello!\nsetting songs folder, you can change this in the file menu.");
		var newuserconfig = new Dict;
		newuserconfig.parse("{}");
		newuserconfig.replace("last_hardware_config","no_hardware.json");
		newuserconfig.replace("SONGS_FOLDER", "demosongs");
		newuserconfig.replace("glow", 0.2);
		newuserconfig.export_json(projectpath+"userconfig.json");
		try{
			newuserconfig.freepeer();
		}catch(error){ 
			error("\nfreepeer failed",error); 
		}
		post("\nstarting again now first run tasks are completed");
		var pause_and_reinit = new Task(loadbang, this);
		pause_and_reinit.schedule(500);
		//messnamed("firstrun","bang");
		return -2;
	}

	post("\n\nwelcome to benny\n\n\ninit stage 1 : initial-only actions\n------------------------------------");
	var dropdown = this.patcher.getnamed("hw_dropdown");
	dropdown.message("prefix", projectpath+"hardware_configs");
	userconfig.parse('{ }');
	userconfig.import_json(projectpath+"userconfig.json");
	userpresets.parse("{}");
	userpresets.import_json(projectpath+"userpresets.json");
	config.parse('{ }');
	config.import_json(projectpath+"config.json");
	keymap.parse('{}');
	keymap.import_json(projectpath+"data/keymap.json");
	aliases.parse('{}');
	aliases.import_json(projectpath+"data/aliases.json");
	if(userconfig.contains("last_hardware_config")){
		messnamed("set_hw_config",userconfig.get("last_hardware_config"));
	}
	process_userconfig();
	var maxmsp = config.get("maxmsp");
	var messes = maxmsp.getkeys();
	for(i=0;i<messes.length;i++){
		var m = maxmsp.get(messes[i]);
		post("\nmessage to max: ",messes[i],m);
		messnamed("max",messes[i],m);
	}
	populate_lookup_tables();
	post("\nreticulating splines");
	states.parse('{ "states" : {}}'); //these dicts all need to be initialised, 
	potential_connection.parse("{}"); //the others are fine to start from empty
	potential_connection.replace("conversion::mute",0);
	potential_connection.replace("from::output::number",0);
	potential_connection.replace("from::output::type","potential");
	potential_connection.replace("to::input::number",0);
	potential_connection.replace("to::input::type","potential");
	potential_connection.replace("from::voice",0);
	
	audio_poly = this.patcher.getnamed("audio_poly");
	matrix = this.patcher.getnamed("matrix");
	world = this.patcher.getnamed("world");
	initialise_dictionaries("init");
}

function systemtypeis(type){
	if(type!="windows"){
		post("\ndetected macos, noting small differences")
		config.replace("consolevsts::bus", "Console7Buss");
		config.replace("consolevsts::channel", "Console7Channel");
		config.replace("consolevsts::cascade", "Console7Cascade");
		config.replace("consolevsts::crunch", "Console7Crunch");
		config.replace("consolevsts::tape", "totape6");
	}
}

function initialise_reset(hardware_file){
	post("\n\nreset stage 1 : resets\n------------------");
	thispatcherstuff();
		var path = this.patcher.filepath;
	projectpath = path.split("patchers/");
	projectpath = projectpath[0];
	post("\npath is",projectpath);

//	messnamed("getpath","bang");
	messnamed("clear_all_buffers","bang");
	config.parse('{ }');
	config.import_json("config.json");
	userconfig.parse('{ }');
	userconfig.import_json(projectpath+"userconfig.json");
	keymap.parse('{}');
	keymap.import_json(projectpath+"keymap.json");
	process_userconfig();

	matrix.message("clear"); //clears the audio matrix
	
	// sigouts.message("setvalue", 0,0); // clear sigs

	//wipe all the buffers
	//waves_polybuffer.clear();
	note_poly.message("setvalue", 0,"enabled",0);
	audio_poly.message("setvalue", 0,"enabled",0);

	//also empties all the dicts for re-initialisatoin:
	blocktypes.parse('{ }');
	voicemap.parse('{ }');
	midi_routemap.parse('{ }');
	hardware_metermap.parse('{ }');
	mod_routemap.parse('{ }');
	mod_param.parse('{ }');
	states.parse('{ "states" : {}}');
	songs.parse('{}');
	song.parse('{}');
	potential_connection.parse("{}");
	potential_connection.replace("conversion::mute",0);
	potential_connection.replace("from::output::number",0);
	potential_connection.replace("from::output::type","potential");
	potential_connection.replace("to::input::number",0);
	potential_connection.replace("to::input::type","potential");
	potential_connection.replace("from::voice",0);
	
	messnamed("update_midi_routemap","bang");
	for(i=0;i<128;i++){
		quantpool.poke(1, i, i);
		indexpool.poke(1, i, i);
	}
	initialise_dictionaries(hardware_file);
}

function initialise_dictionaries(hardware_file){
	post("\n\ninit stage 2 : import dictionaries\n---------------------------");
	var i; 
	var namelist = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	for(i=0;i<128;i++){
		note_names[i] = namelist[i%12]+(Math.floor(i/12)-2);
	}
	// get config first because a lot of things depend on it.
	read_settings_from_config();
	sidebar.width = fontheight*sidebar.width_in_units;
	sidebar.x2 = mainwindow_width - sidebar.scrollbar_width;
	sidebar.x = sidebar.x2 -sidebar.width;
	load_config_colours(); //separate fn so it can be called by core.space block

	SOUNDCARD_HAS_MATRIX = 0;

	post("\ninitialising polys");//this primes these arrays so that it doesn't think it needs to load the blank patches twice.
	note_poly.message("voices", MAX_NOTE_VOICES);
	post("\n-",MAX_NOTE_VOICES," note voice slots available");
	audio_poly.message("voices", MAX_AUDIO_VOICES);
	post("\n-",MAX_AUDIO_VOICES," audio voice slots available");

	for(i=0;i<MAX_NOTE_VOICES;i++) {
		loaded_note_patcherlist[i]='_blank.note';
	}
	emptys="{}"; 
	for(i=0;i<MAX_WAVES;i++){
		waves.remapping[i]=i;
		waves.age[i]=0;
	}
	emptys= emptys+",{}"; 
	waves_dict.parse('{ "waves" : ['+emptys+'] }');
	
	i = 1+MAX_PARAMETERS*(MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_BLOCKS);
	is_flocked=[];
	for(;i--;){
		is_flocked.push(0);
	}
	i = MAX_OUTPUTS_PER_VOICE * (MAX_BLOCKS + MAX_NOTE_VOICES + MAX_AUDIO_VOICES + MAX_HARDWARE_BLOCKS);
	next_free_routing_index=[];
	for(;i--;){
		next_free_routing_index.push(0);
	}
	for(i=0;i<256;i++) routing_index[i] = [];
	
	messnamed("play",0);

	sidebar.mode = "none";
	blocks_cube = [];
	var i;
	for(i=0;i<MAX_NOTE_VOICES;i++) {
		note_patcherlist[i]='blank.note';
		note_poly.message("setvalue", i+1,"patchername","blank.note");
		loaded_note_patcherlist[i]='blank.note';
	}
	for(i=0;i<MAX_AUDIO_VOICES;i++) {
		audio_upsamplelist[i]=1;
		audio_patcherlist[i]='blank.audio';
		audio_poly.message("setvalue", i+1,"patchername","blank.audio");
		loaded_audio_patcherlist[i]='blank.audio';
	}
	for(i=0;i<MAX_BLOCKS;i++) {
		ui_patcherlist[i]='blank.ui';
		loaded_ui_patcherlist[i] = 'blank.ui';
		ui_poly.message("setvalue", i+1,"patchername","blank.ui");
		selected.block[i]=0;
		selected.wire[i]=0;
		record_arm[i]=0;
	}
	still_checking_polys = 0;
	audio_to_data_poly.message("setvalue", 0, "vis_meter", 0);
	audio_to_data_poly.message("setvalue", 0, "vis_scope", 0);
	audio_to_data_poly.message("setvalue", 0, "out_value", 0);

	notepools_dict.parse("notepools","{}");
	
	var emptys="{}";
	for(i=0;i<MAX_BLOCKS-1;i++)	emptys= emptys+",{}";
	blocks.parse('{ "blocks" : ['+emptys+'] }');

	connections.parse('{ "connections" : [ {} ] }');

//	emptys="{}";
//	for(i=0;i<=MAX_WAVES;i++)	emptys= emptys+",{}";
//	waves_dict.parse('{ "waves" : ['+emptys+'] }');
	
	post("\nbuilding blocktypes database");
	import_blocktypes("note_blocks");
	import_blocktypes("audio_blocks");

	import_presets();

	check_for_new_prefixes();

	send_note_patcherlist();
	send_audio_patcherlist();

	scope_zoom(0,SCOPE_DEFAULT_ZOOM);
	var seqdict = new Dict;
	seqdict.name = "seq-piano-roll";
	seqdict.parse('{}');
	seqdict.name = "core-keyb-loop-xfer";
	seqdict.parse('{}');
	undo_stack.parse('{ "history" : [ {}, {} ] }');
	redo_stack.parse('{ "history" : [ {}, {} ] }');
	
	SONGS_FOLDER = config.get("SONGS_FOLDER");
	if((projectpath!="")&&(SONGS_FOLDER.indexOf("/")==-1)){
		SONGS_FOLDER = projectpath + SONGS_FOLDER;
		post("\songs folder is ",SONGS_FOLDER);
	}else{
		post("\nsongs folder is ",SONGS_FOLDER, "project path is",projectpath,"and debug number is",SONGS_FOLDER.indexOf("/"));
	}	
	read_songs_folder("songs");
	if(startup_loadfile=="autoload") read_songs_folder("templates");

	preload_task = new Task(preload_all_waves, this);
	preload_task.schedule(100);

	if(hardware_file!="init"){
		import_hardware(hardware_file);
	}else{
		post("\nall essential data loaded, please choose a hardware configuration and press start.");
		messnamed("ready_to_start","bang");
	}
}

function read_settings_from_config() {
	UPSAMPLING = config.get("UPSAMPLING");
	RECYCLING = config.get("RECYCLING");
	click_b_s = config.get("click_buffer_scaledown");
	wire_dia = config.get("wire_dia");
	glow_amount = config.get("glow");
	messnamed("bloom_amt", glow_amount);
	mainfont = config.get("mainfont");
	monofont = config.get("monofont");
	MAX_BLOCKS = config.get("MAX_BLOCKS");
	MAX_NOTE_VOICES = config.get("MAX_NOTE_VOICES");
	MAX_AUDIO_VOICES = config.get("MAX_AUDIO_VOICES");
	MAX_AUDIO_INPUTS = config.get("MAX_AUDIO_INPUTS");
	MAX_AUDIO_OUTPUTS = config.get("MAX_AUDIO_OUTPUTS");
	NO_IO_PER_BLOCK = config.get("NO_IO_PER_BLOCK");
	MAX_BEZIER_SEGMENTS = config.get("MAX_BEZIER_SEGMENTS"); //24; //must be a multiple of 4
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	MAX_CONNECTIONS_PER_OUTPUT = config.get("MAX_CONNECTIONS_PER_OUTPUT");
	MAX_OUTPUTS_PER_VOICE = config.get("MAX_OUTPUTS_PER_VOICE");
	MAX_DATA = config.get("MAX_DATA");
	MAX_MOD_IDS = config.get("MAX_MOD_IDS");
	MAX_WAVES_SLICES = config.get("MAX_WAVES_SLICES");
	MAX_WAVES = config.get("MAX_WAVES");
	draw_wave.length = MAX_WAVES;
	MAX_HARDWARE_MIDI_OUTS = config.get("MAX_HARDWARE_MIDI_OUTS");
	MAX_HARDWARE_BLOCKS = config.get("MAX_HARDWARE_BLOCKS");
	MAX_STATES = config.get("MAX_STATES");
	MERGE_PURGE = config.get("MERGE_PURGE");
	STATE_FADE_DRAG_THRESHOLD = config.get("STATE_FADE_DRAG_THRESHOLD");
	MAX_PANEL_COLUMNS = config.get("MAX_PANEL_COLUMNS");
	SELF_CONNECT_THRESHOLD = config.get("SELF_CONNECT_THRESHOLD"); //when dragging a block back onto itself
	SELF_CONNECT_REQUIRES_SHIFT = config.get("SELF_CONNECT_REQUIRES_SHIFT");
	DOUBLE_CLICK_TIME = config.get("DOUBLE_CLICK_TIME");
	LONG_PRESS_TIME = config.get("LONG_PRESS_TIME");
	CTRL_VOICE_SEL_MOMENTARY = config.get("CTRL_VOICE_SEL_MOMENTARY");
	SLIDER_CLICK_SET = config.get("SLIDER_CLICK_SET");
	SCOPE_DEFAULT_ZOOM = config.get("SCOPE_DEFAULT_ZOOM");
	waves_preloading = config.get("waves_preloading");
	MODULATION_IN_PARAMETERS_VIEW = config.get("MODULATION_IN_PARAMETERS_VIEW");
	AUTOZOOM_ON_SELECT = config.get("AUTOZOOM_ON_SELECT");
	SHOW_STATES_ON_PANELS = config.get("SHOW_STATES_ON_PANELS");
	SHOW_KEYBOARD_AUTOMAP_CONNECT_BUTTON = config.get("SHOW_KEYBOARD_AUTOMAP_CONNECT_BUTTON");
	TARGET_FPS = config.get("TARGET_FPS");
	METER_TINT = config.get("METER_TINT");
	SELECTED_BLOCK_Z_MOVE = config.get("SELECTED_BLOCK_Z_MOVE");
	SELECTED_BLOCK_DEPENDENTS_Z_MOVE = config.get("SELECTED_BLOCK_DEPENDENTS_Z_MOVE");
	sidebar.scopes.midinames = config.get("SIDEBAR_MIDI_SCOPE_NOTE_NAMES");
	sidebar.show_help = config.get("SIDEBAR_ALWAYS_SHOW_HELP");
	automap.mouse_follow = config.get("AUTOMAP_MOUSE_FOLLOW");
	sidebar.scrollbar_width = config.get("sidebar_scrollbar_width");
	sidebar.width_in_units = config.get("sidebar_width_in_units");
}

function initialise_graphics() {
	world.message("sendwindow", "idlemouse", 1);
	world.message("sendwindow", "mousewheel", 1);
	world.message("sendrender", "rotate_order", "zyx");
	world.message("sendrender", "smooth_shading", 1);
	world.message("esc_fullscreen", 0);
	world.message("fsmenubar", 0);
	world.message("fsaa", (config.get("FSAA")==1)|0);
	world.message("fps", TARGET_FPS[0]);
	world.message("visible", 1);
	if(config.contains("START_FULLSCREEN")&&(config.get("START_FULLSCREEN")==1)){
		fullscreen = 1;
		world.message("fullscreen",1);
	}else{
		world.message("rect", screenDimensions.x * 0.03, screenDimensions.y*0.08, screenDimensions.x*0.97,screenDimensions.y * 0.92);
	}
	world.getsize(); //world.message( "getsize"); //get ui window ready

	selection_cube = new JitterObject("jit.gl.gridshape", "benny");
	selection_cube.shape = "cube";
	selection_cube.name = "selection";
	selection_cube.color = [0.65, 0.65, 0.65, 0.15];
	selection_cube.scale = [1, 1, 1];
	selection_cube.position = [0, 0, 0];
	selection_cube.blend_enable = 1;
	selection_cube.enable = 0;

	flock_cubexy = new JitterObject("jit.gl.gridshape", "benny");
	flock_cubexy.shape = "cube";
	flock_cubexy.scale = [flock_cube_size * 0.5 + 1, flock_cube_size * 0.5 + 1, 0.0001];
	flock_cubexy.position = [0, 0, 3.999];
	flock_cubexy.name = "flockcubexy";
	flock_cubexy.color = [0.2, 0.2, 0.2, 1];

	flock_cubeyz = new JitterObject("jit.gl.gridshape", "benny");
	flock_cubeyz.shape = "cube";
	flock_cubeyz.scale = [0.0001, flock_cube_size * 0.5 + 1, flock_cube_size * 0.5 + 1];
	flock_cubeyz.position = [-flock_cube_size * 0.5 - 1.00005, 0, 5 + flock_cube_size * 0.5];
	flock_cubeyz.name = "flockcubeyz";
	flock_cubeyz.color = [0.4, 0.4, 0.4, 1];

	flock_cubexz = new JitterObject("jit.gl.gridshape", "benny");
	flock_cubexz.shape = "cube";
	flock_cubexz.scale = [flock_cube_size * 0.5 + 1, 0.0001, flock_cube_size * 0.5 + 1];
	flock_cubexz.position = [0, -flock_cube_size * 0.5 - 1.00005, 5 + flock_cube_size * 0.5];
	flock_cubexz.name = "flockcubexz";
	flock_cubexz.color = [0.3, 0.3, 0.3, 1];

	matrix_wire_position = new JitterMatrix;
	matrix_wire_scale = new JitterMatrix;
	matrix_wire_rotatexyz = new JitterMatrix;
	matrix_wire_colour = new JitterMatrix;
	
	matrix_wire_position.name = "matrix_wire_position";
	matrix_wire_scale.name = "matrix_wire_scale";
	matrix_wire_rotatexyz.name = "matrix_wire_rotatexyz";
	matrix_wire_colour.name = "matrix_wire_colour";

	matrix_voice_position = new JitterMatrix;
	matrix_voice_scale = new JitterMatrix;
	matrix_voice_colour = new JitterMatrix;

	matrix_voice_position.name = "matrix_voice_position";
	matrix_voice_scale.name = "matrix_voice_scale";
	matrix_voice_colour.name = "matrix_voice_colour";

	matrix_block_position = new JitterMatrix;
	matrix_block_scale = new JitterMatrix;
	matrix_block_colour = new JitterMatrix;
	matrix_block_texture = new JitterMatrix;

	matrix_block_position.name = "matrix_block_position";
	matrix_block_scale.name = "matrix_block_scale";
	matrix_block_colour.name = "matrix_block_colour";
	matrix_block_texture.name = "matrix_block_texture";

	matrix_menu_position = new JitterMatrix;
	matrix_menu_scale = new JitterMatrix;
	matrix_menu_colour = new JitterMatrix;
	matrix_menu_texture = new JitterMatrix;

	matrix_menu_position.name = "matrix_menu_position";
	matrix_menu_scale.name = "matrix_menu_scale";
	matrix_menu_colour.name = "matrix_menu_colour";
	matrix_menu_texture.name = "matrix_menu_texture";

	matrix_meter_position = new JitterMatrix;
	matrix_meter_scale = new JitterMatrix;
	matrix_meter_colour = new JitterMatrix;

	matrix_meter_position.name = "matrix_meter_position";
	matrix_meter_scale.name = "matrix_meter_scale";
	matrix_meter_colour.name = "matrix_meter_colour";

	flock_axes(0);
	messnamed("camera_control", "direction", 0, 0, -1);
	messnamed("camera_control", "position", camera_position);
	messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0], blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1], blocks_page.highest), blocks_page.lowest), -1);
	messnamed("camera_control", "lighting_enable", 1);
	messnamed("camera_control", "lens_angle", 30);

	var menutex_task = new Task(initialise_block_menu, this);
	menutex_task.schedule(1000);
}

function stop_graphics(){
	if(fullscreen) world.message("fullscreen",0);
	fullscreen = 0;
	lcd_main.message("brgb",0,0,0);
	lcd_main.message("clear");
	lcd_main.message("bang");
	meters_enable = 0;
	redraw_flag.flag = 0;
	view_changed = 0;
	meters_updatelist.hardware = [];
	meters_updatelist.meters = [];
	post("\nstopping graphics");
	//background_cube.freepeer();
	//menu_background_cube.freepeer();
	messnamed("wires_matrices","dim",0,0);
	messnamed("wires_matrices","bang");
	messnamed("voices_matrices","dim",0,0);
	messnamed("voices_matrices","bang");
	messnamed("meters_matrices","dim",0,0);
	messnamed("meters_matrices","bang");
	messnamed("blocks_matrices","dim",0,0);
	messnamed("blocks_matrices","bang");
	selection_cube.freepeer();
	flock_cubexy.freepeer();
	flock_cubeyz.freepeer();
	flock_cubexz.freepeer();
	//world.message("enable",0);
	var stop_task = new Task(stop_world, this);
	stop_task.schedule(1);
}
function stop_world(){
	world.message("enable",0);
}

function import_hardware(v){
	post("\n\ninit stage 3 : import hardware\n---------------------------------------");
	var d = new Dict;
	var d3 = new Dict;
	var t;
	var i;

	var old_clickdac =this.patcher.getnamed("click_output");
	this.patcher.remove(old_clickdac);
	var click_enabled = 0;	

	loading.recent_substitutions = new Dict;
	loading.recent_substitutions.parse("{}");

	var vspl = v.split('/').pop();
	if(!userconfig.contains("last_hardware_config") || (vspl!=userconfig.get("last_hardware_config"))){
		userconfig.replace("last_hardware_config",vspl);
		write_userconfig();
		post("\nstoring hardware config choice",vspl);
	}

	post("\nreading hardware database");
	hardwareconfig.import_json(v);
	
	d = hardwareconfig.get("hardware");
	if(hardwareconfig.contains("io::matrix::external")){
		var drv = hardwareconfig.get("io::matrix::external");
		if(drv != "none"){
			post("\nfound external matrix, loading driver",drv);
			messnamed("drivers_poly","setvalue",1,"patchername",drv);
			EXTERNAL_MATRIX_PRESENT = 1; 
		}
	}
	if(hardwareconfig.contains("io::matrix::soundcard")){
		var drv = hardwareconfig.get("io::matrix::soundcard");
		if(drv != "none"){
			post("\nfound soundcard matrix, loading driver",drv);
			messnamed("drivers_poly","setvalue",2,"patchername",drv);
			SOUNDCARD_HAS_MATRIX = 1;
		}
	}
	if(hardwareconfig.contains("io::special_controller")){
		var drv = hardwareconfig.get("io::special_controller");
		if(drv != "none"){
			post("\nfound special controller, loading driver",drv);
			messnamed("drivers_poly","setvalue",3,"patchername",drv);
		}
	}
	
	var keys = d.getkeys();
	if(hardwareconfig.contains("measured_latency")){
		post("\nlatency measurement found, copied to config for blocks to access if they want");
		config.replace("measured_latency",hardwareconfig.get("measured_latency"));
	}
	for(i=0;i<MAX_AUDIO_INPUTS+2;i++) input_used[i]=0;
	for(i=0;i<MAX_AUDIO_OUTPUTS+2;i++) output_used[i]=0;
	var output_blocks=[]; //output blocks are in pairs, eg #1 is ch's 1+2. so, for every output channel you find ("in" to a block, mind), 
																		//you math.floor((x-1)/2) and set that element of this array
	for(i=0;i<MAX_AUDIO_OUTPUTS/2;i++) output_blocks[i] = "clip_dither";
	var dc_block_enabled_list = [];
	var input_gate_enabled_list = [];
	for(i = 0; i < keys.length; i++){
		post("\n  "+keys[i]);
		blocktypes.set(keys[i],d.get(keys[i]));
		var ob=null;
		
		if(d.contains(keys[i]+"::output_block")){
			ob = new Dict;
			ob = d.get(keys[i]+"::output_block");
			d3.setparse('{}');
			d3.import_json(projectpath+"output_blocks/"+ob+".json");
			var d4 = d3.get(ob);
			var d4k=d4.getkeys();
			// post("\nd4k:",d4k);
			for(t=0;t<d4k.length;t++){
				if((d4k[t]!="parameters")&&(d4k[t]!="panel")&&(d4k[t]!="connections")&&(d4k[t]!="type")&&(d4k[t]!="patcher")&&(d4k[t]!="max_polyphony")){
					post("\ncopied output block key:",d4k[t]);
					blocktypes.set(keys[i]+"::"+d4k[t],d4.get(d4k[t]));
				}
			}
			if(d3.contains(ob+"::parameters")){
				if(d3.contains(ob+"::groups")){
					blocktypes.set(keys[i]+"::groups");
					blocktypes.append(keys[i]+"::groups");
					var glist=d3.getsize(ob+"::groups");
					for(t=0;t<glist;t++){
						blocktypes.setparse(keys[i]+"::groups["+t+"]","{}");
						blocktypes.set(keys[i]+"::groups["+t+"]",d3.get(ob+"::groups["+t+"]"));
						if(t+1<glist)blocktypes.append(keys[i]+"::groups","*");
					}
				}
				if(d3.contains(ob+"::panel")){
					blocktypes.set(keys[i]+"::panel",d3.get(ob+"::panel"));
				}
				//post("found output block parameters\n");
				blocktypes.set(keys[i]+"::parameters");
				blocktypes.append(keys[i]+"::parameters");
				var plist= d3.getsize(ob+"::parameters");
				post("- found ",plist,"parameters. adding: ");
				for(t=0;t<plist;t++){
					var d4 = d3.get(ob+"::parameters["+t+"]");
					p_type = d4.get("type");
					p_values = d4.get("values");
					write_parameter_info_buffer(p_values,p_type,MAX_PARAMETERS*(MAX_BLOCKS+i)+t);
					// post("\nopb,",MAX_PARAMETERS*(MAX_BLOCKS+i)+t);
					blocktypes.setparse(keys[i]+"::parameters["+t+"]","{}");
					blocktypes.set(keys[i]+"::parameters["+t+"]",d4);
					if(t+1<plist)blocktypes.append(keys[i]+"::parameters","*");
				}
			}
			if(d3.contains(ob+"::connections::in::midi") && !blocktypes.contains(keys[i]+"::connections::in::midi")){
				blocktypes.set(keys[i]+"::connections::in::midi",d3.get(ob+"::connections::in::midi"));
			} //presently only bothers to look for and copy over MIDI inputs to output blocks - the audio side is already accounted for..
		}
		if(d.contains(keys[i]+"::connections::in::hardware_channels")){
			var ch = d.get(keys[i]+"::connections::in::hardware_channels");
			if(!Array.isArray(ch)) ch = [ch];
			for(t=0;t<ch.length;t++){
				output_used[ch[t]-1]=1;
				if(ob!=null){
					var hch = Math.floor((ch[t] - 1)/2);
					output_blocks[hch] = ob;
				}
				if(ch[t]>MAX_USED_AUDIO_OUTPUTS) MAX_USED_AUDIO_OUTPUTS = ch[t];
			}
		}
		if(d.contains(keys[i]+"::connections::out::hardware_channels")){
			var ch = d.get(keys[i]+"::connections::out::hardware_channels");
			if(typeof ch == "number") ch = [ch];
			for(t=0;t<ch.length;t++){
				input_used[ch[t]-1]=1;
				if(ch[t]>MAX_USED_AUDIO_INPUTS) MAX_USED_AUDIO_INPUTS = ch[t];
			}
			if(d.contains(keys[i]+"::connections::out::dc_block")){
				var dcl=d.get(keys[i]+"::connections::out::dc_block");
				for(t=0;t<ch.length;t++) dc_block_enabled_list[ch[t]-1]  = dcl[t];
			}else{
				for(t=0;t<ch.length;t++) dc_block_enabled_list[ch[t]-1] = 1;
			}
			if(d.contains(keys[i]+"::connections::out::input_gate")){
				var dcl=d.get(keys[i]+"::connections::out::input_gate");
				for(t=0;t<ch.length;t++) input_gate_enabled_list[ch[t]-1]  = dcl[t];
			}else{
				for(t=0;t<ch.length;t++) input_gate_enabled_list[ch[t]-1] = 1;
			}

		}
	}
	var old_audio_clock_out = this.patcher.getnamed("audio_clock_out_dac");
	this.patcher.remove(old_audio_clock_out);
	messnamed("ext_sync","active",0);
	messnamed("ext_sync","stop_clocks");

	post("\nlast input:",MAX_USED_AUDIO_INPUTS,"last output:",MAX_USED_AUDIO_OUTPUTS);
	if(output_blocks.length<MAX_AUDIO_OUTPUTS/2){
		for(i=output_blocks.length;i<MAX_AUDIO_OUTPUTS/2;i++) output_blocks.push("clip_dither");
	}
	post("\nreading midi io config");
	d = hardwareconfig.get("io");
	var keys = d.getkeys();
	for(i = 0; i < keys.length; i++){
		t = d.get(keys[i]);
		io_dict.set(keys[i],t);
		if(keys[i]=="controllers"){
			post("\n  controllers : "+t.getkeys());
		}else if(keys[i]=="matrix_switch"){
			post("\n  matrix switch : ok");
		}else if(keys[i]=="sync"){
			if(d.contains("sync::midi_clock_out")){
				var dm = d.get("sync::midi_clock_out");
				var mk = dm.getkeys();
				var outlist = [];
				if(mk != null){
					if(!Array.isArray(mk))mk = [mk];
					for(var m=0;m<mk.length;m++){
						if(dm.get(mk[m]+"::enable")==1) outlist.push(mk[m]);
					}
					post("\n  sync : midi clock out - "+outlist);
					messnamed("ext_sync","midi_clock_out_poly","voices",outlist.length);
					for(var m=0;m<outlist.length;m++){
						messnamed("ext_sync","midi_clock_out_poly","setvalue",m+1,"output",outlist[m]);
						messnamed("ext_sync","midi_clock_out_poly","setvalue",m+1,"ppqn",dm.get(outlist[m]+"::ppqn"));
					}
					ext_sync.active = 1;
				}
			}
			if(d.contains("sync::audio_clock_out")){
				if(d.get("sync::audio_clock_out::enable")==1){
					post("\n  sync : audio clock out", d.get("sync::audio_clock_out::ppqn")+"ppqn on channel",d.get("sync::audio_clock_out::channel"));
					ext_sync.active = 1
					messnamed("ext_sync", "audio_clock_rate", d.get("sync::audio_clock_out::ppqn"));
					var transportpatcher = this.patcher.getnamed("global_transport_and_click");
					var new_audio_clock_out = this.patcher.newdefault(180,178, "dac~", d.get("sync::audio_clock_out::channel"));
					new_audio_clock_out.message("sendbox", "varname", "audio_clock_out_dac");
					this.patcher.connect(transportpatcher, 2, new_audio_clock_out, 0);
				}
			}
			messnamed("ext_sync","active",ext_sync.active);
		}else{
			post("\n  "+keys[i]+" : "+t);
		}
	}
	//messnamed("to_ext_matrix","read_config");
	transfer_input_lists();
	post("\n\ninit stage 4 : start graphic and audio engines\n------------------------------------------");

	initialise_graphics();

	post("\nbuilding new audio graph");
	messnamed("click_enabled",click_enabled);
	prep_midi_indicators();
	audioiolists = get_hw_meter_positions();
	MAX_AUDIO_INPUTS = audioiolists[0].length;
	MAX_AUDIO_OUTPUTS = audioiolists[1].length;
	config.set("MAX_AUDIO_INPUTS",MAX_AUDIO_INPUTS);
	config.set("MAX_AUDIO_OUTPUTS",MAX_AUDIO_OUTPUTS);

	var old_dac = this.patcher.getnamed("audio_outputs");
	var old_adc = this.patcher.getnamed("audio_inputs");
	this.patcher.remove(old_dac);
	this.patcher.remove(old_adc);
	var old_ip = this.patcher.getnamed("input_processing");
	if(old_ip!=null) this.patcher.remove(old_ip);

	new_adc = this.patcher.newdefault(654,497, "mc.adc~", audioiolists[0]);
	new_adc.message("sendbox", "varname", "audio_inputs");
	var ipprocessing = this.patcher.newdefault(654,527, "mc.gen~", "input_processing", "@chans", audioiolists[0].length);
	ipprocessing.message("sendbox", "varname", "input_processing");
	new_dac = this.patcher.newdefault(667,882, "mc.dac~", audioiolists[1]);
	
	var dc_sorted = [];
	var ip_sorted = []; //these are only for the console notification but it's useful to have that as a reminder..
	for(var i=0;i<audioiolists[0].length;i++){
		ipprocessing.message("setvalue",i+1,"hp", dc_block_enabled_list[audioiolists[0][i]-1]);
		ipprocessing.message("setvalue",i+1,"gate", input_gate_enabled_list[audioiolists[0][i]-1]);
		dc_sorted.push(dc_block_enabled_list[audioiolists[0][i]-1]);
		ip_sorted.push(input_gate_enabled_list[audioiolists[0][i]-1]);
	}
	post("\ninput processing: dc block",dc_sorted,"cpu saving gate",ip_sorted);
	new_dac.message("sendbox", "varname", "audio_outputs");
	var opinterleave = this.patcher.getnamed("op_interleave");
	var ipcombine = this.patcher.getnamed("ip_combine");
	var openbut = this.patcher.getnamed("openbutton");
	this.patcher.connect(opinterleave, 0, new_dac, 0);
	//this.patcher.connect(new_adc,0,ipcombine,1);
	this.patcher.connect(new_adc,0,ipprocessing,0);
	this.patcher.connect(ipprocessing,0,ipcombine,1);
	this.patcher.connect(openbut,0,new_dac,0);
	post("\noutput list",audioiolists[1],"\ninput list",audioiolists[0]);
	if(config.get("ENABLE_RECORD_HARDWARE")==1){
		//if hw rec enabled, look for the temp objects created to do that last run
		var orecr = this.patcher.getnamed("recr");
		if(orecr==null){
		}else{
			post("\nremoving old record objects");
			this.patcher.remove(orecr);
			var oor = this.patcher.firstobject;
			while(oor !== null){
				var n = oor.varname;
				var ooor = oor.nextobject;
				if(n.indexOf("hw_rec_")!=-1){
					this.patcher.remove(oor);
				}
				if((n=="q_out")||(n=="q_player")) this.patcher.remove(oor);
				oor = ooor;
			}
		}
	}
	keys = blocktypes.getkeys();
	var reccount=0;
	var recr;
	for(i=0;i<keys.length;i++){
		if(keys[i].split(".")[0] == "hardware"){
			var reclist=[];
			if(blocktypes.contains(keys[i]+"::connections::in::hardware_channels")){
				var ch = blocktypes.get(keys[i]+"::connections::in::hardware_channels");
				if(!Array.isArray(ch)) ch=[ch];
				if((blocktypes.contains(keys[i]+"::cue_out"))&&(blocktypes.get(keys[i]+"::cue_out")==1)){
					automap.available_q = ch;
					post("\ncue out is on channel(s)",ch);
					waves.q_player = this.patcher.newdefault(950,900, "play~", "waves.1", 2);
					waves.q_player.message("sendbox", "varname", "q_player");
					var q_out = this.patcher.newdefault(950,930, "dac~", ch);
					q_out.message("sendbox","varname","q_out");
					this.patcher.connect(waves.q_player, 0, q_out, 0);
					if(Array.isArray(ch)&&(ch.length>1)){
						this.patcher.connect(waves.q_player, 1, q_out, 1);
					}else{
						this.patcher.connect(waves.q_player, 1, q_out, 0);
					}
				}
				for(var ci=0;ci<ch.length;ci++){
					ch[ci] = audioiolists[1].indexOf(ch[ci])+1;
				}
				blocktypes.replace(keys[i]+"::connections::in::hardware_channels",ch);
				if((blocktypes.contains(keys[i]+"::click_out"))&&(blocktypes.get(keys[i]+"::click_out") == 1)){
					post("\nclick out is on channel(s)",ch);
					var clickdac = this.patcher.newdefault(90,208, "dac~", ch);
					clickdac.message("sendbox", "varname", "click_output");
					click_enabled = 1;
					var global_transport_and_click = this.patcher.getnamed("global_transport_and_click");
					for(var ccc=0;ccc<ch.length;ccc++) this.patcher.connect(global_transport_and_click, 1, clickdac, ccc);
				}
			}
			if(blocktypes.contains(keys[i]+"::connections::out::hardware_channels")){
				var ch = blocktypes.get(keys[i]+"::connections::out::hardware_channels");
				if(!Array.isArray(ch)) ch=[ch];
				for(var ci=0;ci<ch.length;ci++){
					reclist.push(ch[ci]);
					//post("\nwas",ch[ci]);
					ch[ci] = audioiolists[0].indexOf(ch[ci])+1;
					//post(" is ",ch[ci]);
				}
				blocktypes.replace(keys[i]+"::connections::out::hardware_channels",ch);
			}
			if((config.get("ENABLE_RECORD_HARDWARE")==1)&& (reclist.length>0)){
				if(reccount==0){
					recr =  this.patcher.newdefault(930,440, "r", "record");
					recr.message("sendbox", "varname" , "recr");
				}
				var recadc = this.patcher.newdefault(950+reccount,520, "mc.adc~", reclist);
				recadc.message("sendbox", "varname", "hw_rec_adc_"+keys[i]);
				var recsf = this.patcher.newdefault(950+reccount,580, "mc.sfrecord~", reclist.length, "@dither", 0, "@bitdepth", 32);
				recsf.message("sendbox", "varname", "hw_rec_"+keys[i]);
				this.patcher.connect(recadc, 0, recsf, 0);
				var recgate =  this.patcher.newdefault(950+reccount,550, "gate");
				recgate.message("sendbox", "varname", "hw_rec_gate_"+keys[i]);
				this.patcher.connect(recgate, 0, recsf, 0);
				this.patcher.connect(recr, 0, recgate, 1);
				reccount+=40;
			}
		}
	} //this section ^^ eg ifyou have eg 2xES6 with an adat soundcard you'll have in channels 1 2 3 4 5 6 9 10 11 12 13 14. 
	//so we tell the adc~ to listen to those channels, then RENUMBER the channels in the blocktypes dict, to refer to the 
	//sequential number of the io rather than the channel number
	//audioiolists[0].length
	sidebar.scopes.midi_routing.voice = MAX_NOTE_VOICES + MAX_AUDIO_VOICES + MAX_AUDIO_VOICES * NO_IO_PER_BLOCK + MAX_AUDIO_INPUTS + MAX_AUDIO_OUTPUTS;
	//var matrixins = MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS;
	var matrixouts = MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_OUTPUTS;
	//post("\n MAX_ ",MAX_AUDIO_INPUTS," or ",MAX_AUDIO_OUTPUTS," vs USED ",MAX_USED_AUDIO_INPUTS," or ",MAX_USED_AUDIO_OUTPUTS," = ",matrixouts);
	sigouts.chans(matrixouts);
	this.patcher.getnamed("mc_separate").chans(MAX_AUDIO_VOICES,MAX_AUDIO_VOICES);
	matrix.numouts(matrixouts);
	var ol = ((MAX_AUDIO_OUTPUTS+1)/2)|0;
	output_blocks.splice(ol);
	output_blocks_poly.voices(ol);
	post("\nsetting output blocks to:",output_blocks);
	output_blocks_poly.patchername(output_blocks); 
	
	audio_to_data_poly.voices(MAX_AUDIO_INPUTS + MAX_AUDIO_OUTPUTS + NO_IO_PER_BLOCK * MAX_AUDIO_VOICES);
	audio_to_data_poly.message("down",((+config.get("AUDIO_TO_DATA_DOWNSAMPLE"))|0));
	post("\nset audio_to_data poly downsampling to ",config.get("AUDIO_TO_DATA_DOWNSAMPLE"));
	for(i=MAX_AUDIO_VOICES * NO_IO_PER_BLOCK+1;i<1+MAX_AUDIO_VOICES * NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS+MAX_AUDIO_OUTPUTS;i++){
		audio_to_data_poly.message("setvalue", i, "vis_meter", 1);
	}
	messnamed("config_loaded","bang");
	messnamed("MAX_PARAMETERS", MAX_PARAMETERS); //the wrapper blocks need this so it makes sense to send it
	messnamed("MAX_BLOCKS",MAX_BLOCKS); //once you've updated blocks, delete all these, and the request global function TODO
	messnamed("MAX_NOTE_VOICES",MAX_NOTE_VOICES);
	messnamed("MAX_AUDIO_VOICES", MAX_AUDIO_VOICES);
	messnamed("MAX_AUDIO_INPUTS", MAX_AUDIO_INPUTS);
	messnamed("MAX_AUDIO_OUTPUTS", MAX_AUDIO_OUTPUTS);
	messnamed("NO_IO_PER_BLOCK", NO_IO_PER_BLOCK);
	messnamed("MAX_DATA", MAX_DATA);

	assign_block_colours();
	if(SOUNDCARD_HAS_MATRIX){ //tell the driver the size of the matrix. wipe it.
		messnamed("drivers_poly","setvalue",2,"num_inputs",MAX_USED_AUDIO_INPUTS);
		messnamed("drivers_poly","setvalue",2,"num_outputs",MAX_USED_AUDIO_OUTPUTS);
		messnamed("drivers_poly","setvalue",2,"initialise");
	}
	
	usermouse.queue = [];
	world.message( "enable", 1);

	set_display_mode("blocks");
	
	//	turn on audio engine
	new_dac.message('int',1);

	if(startup_loadfile=="autoload"){
		if(songs.contains(startup_loadfile)){
			loading.merge = 0;
			loading.progress=-1;
			loading.mute_new=0;
			loading.bundling=12;
			loading.wait=1;
			loading.songname = "autoload";
			import_song();	
		}else{
			load_elsewhere(startup_loadfile);
		}
	}else{
		load_elsewhere(startup_loadfile);
	}
	startup_loadfile = "";

	slowclock_task = new Task(slowclock, this);
	slowclock_task.interval = 900;
	slowclock_task.repeat();
}

function load_config_colours(){
	menucolour = config.get("palette::menu");
	var dimm=0.5;
	menudark = shadeRGB(menucolour,dimm);
	state_fade.lastcolour = menudark;
	dimm=bg_dark_ratio;
	menudarkest = shadeRGB(menucolour, dimm);
	var avg = (menucolour[0]+menucolour[1]+menucolour[2])/3;
	greycolour = [avg,avg,avg];
	avg *= 0.4;
	greydark = [avg,avg,avg];
	avg *= 2.5*bg_dark_ratio;
	greydarkest = [avg,avg,avg];
	backgroundcolour = config.get("palette::background");
	backgroundcolour_blocks = config.get("palette::background_blocks");
	backgroundcolour_block_menu = config.get("palette::background_block_menu");
	backgroundcolour_panels = config.get("palette::background_panels");
	backgroundcolour_waves = config.get("palette::background_waves");
	backgroundcolour_sidebar = config.get("palette::background_sidebar");
	redraw_flag.flag |= 4;
	var c = config.get("palette::muted");
	MUTEDWIRE = [c[0]/128,c[1]/128,c[2]/128,1];
	calculate_states_colours();
}

function process_userconfig(){
	//userconfig OVERWRITES items in config
	post("\nreading config");				
	var uk = userconfig.getkeys();
	if(uk==null) return 0;
	for(var i=0;i<uk.length;i++){
		var tk=userconfig.get(uk[i]);
		if((typeof tk == "string")||(typeof tk == "number")||(Array.isArray(tk))){
			config.replace(uk[i],tk);
			//post(uk[i]);
		}else{
			if(typeof tk == "object"){
				tkk = tk.getkeys();
				if(tkk != null){
					for(var ii=0;ii<tkk.length;ii++){
						var ttkk = userconfig.get(uk[i]+"::"+tkk[ii]);
						if(ttkk != null){
							config.replace(uk[i]+"::"+tkk[ii],ttkk);
							//post(tkk[ii]);
						}
					}
				}
			}
		}
	}
}

function check_for_new_prefixes(){
	var types = blocktypes.getkeys();
	var type_order = config.get("type_order");
	var found=0;
	for(var i=0;i<types.length;i++){
		ty=types[i].split(".",4);
		var oc = type_order.indexOf(ty[0]);
		if(oc==-1){
			post("\nnew block name prefix "+ty[0]+" discovered. added to the type_order key in userconfig.json. you can reorder the block menu by editing this.");
			type_order.push(ty[0]);
			userconfig.replace("type_order",type_order);
			config.replace("type_order",type_order);
			found=1;
		}
	}
	if(found)write_userconfig();
}
function assign_block_colours(){
	//counts how many types of block there are:
	var typecount=0;
	var types = blocktypes.getkeys();
	types.sort();
	menu.cubecount = types.length;
	var i;
	var typ,ty;
	var type_order = config.get("type_order");
	typecount = type_order.length;
	


	var cll = config.getsize("palette::gamut");
	var t = Math.floor(cll/(typecount));
	var t1=40;
	var t2;
	var c=new Array(3);
	for(var typ in type_order){	
		t2=t1;
		t1+=t;
		for(i=0;i<menu.cubecount;i++){
			ty=types[i].split(".",4);
			if(ty[0]==type_order[typ]){
				t2++;
				t2 = t2 % cll;
				if(t2>t1-3) t2=t1-t;
				c = config.get("palette::gamut["+t2+"]::colour");
				blocktypes.replace(types[i]+"::colour",c);
				var gps = blocktypes.get(types[i]+"::groups");
				for(var gp in gps){
					try{
						if(gps[gp].contains("colour")){
							var tc = gps[gp].get("colour");
							if(!Array.isArray(tc)){
								var nc = config.get("palette::gamut["+((t2+tc+cll)%cll)+"]::colour");
								nc = shadeRGB(nc, 1.2);
								blocktypes.replace(types[i]+"::groups["+gp+"]::colour",nc);
							}
						}
					}catch(err){
						error("\n\n>> ERROR >> the block:",types[i],"has corrupt groups in the json file.(",err.name,err.message,")");
						blocktypes.remove(types[i]+"::groups["+gp+"]");
						post("\ni have tried to remove the bad group but you should fix the file.\n");
					}
				}
				var prms = blocktypes.get(types[i]+"::parameters");
				if(Array.isArray(prms)){
					for(var pp in prms){
						if(prms[pp].contains("colours")){
							var ttc = prms[pp].get("colours");
							if(!Array.isArray(ttc)) ttc = [ttc];
							for(var tt=0;tt<ttc.length;tt++){
								if(!Array.isArray(ttc[tt])){
									var nc = config.get("palette::gamut["+((t2+ttc[tt]+cll)%cll)+"]::colour");
									blocktypes.replace(types[i]+"::parameters["+pp+"]::colours["+tt+"]",nc);								
								}
							}
						}
					}
				}
				//post("types[i]=",types[i],"t2=",t2,"c=",c,"\n");
			}
		}
	}
}

function import_blocktypes(v)
{
	var f = new Folder(projectpath+v);
	var d = new Dict;
		
	f.reset();
	while (!f.end) {
		if(f.extension == ".json"){
			post("\n  "+f.filename);
			d.import_json(projectpath+v+"/"+f.filename);
			var keys = d.getkeys();
			if(keys==null){
				post("ERROR reading block definition json file");
			}else{
				keys = keys.toString();
				blocktypes.set(keys,d.get(keys));
			}
		}
		f.next();
	}
	f.close();
}


function is_empty(obj){
	for (var i in obj) return false;      
	return true; 
}

function f_to_db(f){
	if(f>0){
		return 8.68588963*Math.log(f); //==20*ln(f)/ln(10)
	}else if(f<0){ //minus numbers invert the signal so i'm using this slightly nonstandard notation of -db to signify that.. sorry
		return 8.68588963*Math.log(-f);
	}else{
		return -144.0;
	}
}

function cyrb128(str) { // this is a hash function used to generate seeds for the PRNG
    h1 = 1779033703, h2 = 3144134277,
    h3 = 1013904242, h4 = 2773480762;
    for (var i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ (h1 ^ k)*( 597399067);
        h2 = h3 ^ (h2 ^ k)*( 2869860233);
        h3 = h4 ^ (h3 ^ k)*( 951274213);
        h4 = h1 ^ (h4 ^ k)*( 2716044179);
    }
    h1 = (h3 ^ (h1 >>> 18))*( 597399067);
    h2 = (h4 ^ (h2 >>> 22))*( 2869860233);
    h3 = (h1 ^ (h3 >>> 17))*( 951274213);
    h4 = (h2 ^ (h4 >>> 19))*( 2716044179);
    return (h1^h2^h3^h4)>>>0;//[(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function mulberry32(){
   mulberryseed += 0x6D2B79F5;
   var t = mulberryseed;
   t = (t ^ t >>> 15)*(t | 1);
   t ^= t + (t ^ t >>> 7)*( t | 61);
   return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function spread_level(in_no, out_no, r2,rotation,no_in_channels, no_out_channels){
	if(bennyversion >= 0.555){
		//r2=radius of inner circle
		//d = angle difference
		var max_chans = Math.max(no_in_channels,no_out_channels);
		var min_chans = Math.min(no_in_channels,no_out_channels);
		if(min_chans<2){
			min_chans = 2;
			max_chans -= r2;
			//implements a crazy no-dip pan law for the mono->stereo/3/4/etc special case
		}
		var inputangle = in_no / no_in_channels;
		var outputangle = out_no / no_out_channels;
		var d;
		var tl=0;
		rotation = -rotation;
		for(var i=0;i<no_out_channels;i++){
			for(var ii=0;ii<no_in_channels;ii++){
				d = ((((i/no_out_channels)+(ii/no_in_channels)+outputangle-inputangle) + 1.5) % 1 ) - 0.5;
				d = Math.abs(d);
				tl += Math.max(1 - d * r2 * min_chans /*no_out_channels*/,0);
			}
		} // first sum up a kind of hypothetical total level and get a scaling factor:
		tl = Math.min(1,Math.pow(max_chans*no_in_channels,0.666) / tl);

		// then the particular one
		d = (((rotation+outputangle-inputangle) + 1.5) % 1 ) - 0.5;
		d = Math.abs(d);
		var l = Math.max(1 - r2 * d * min_chans,0) * tl;
		return l;
	}else{
		return spread_level_old(in_no, out_no, r2,rotation,no_in_channels, no_out_channels);
	}
}

function spread_level_old(in_no, out_no, r2,rotation,no_in_channels, no_out_channels){
	//r2=radius of inner circle
	//d = angle difference
	var max_chans = Math.max(no_in_channels,no_out_channels);
	var min_chans = Math.max(Math.min(max_chans,2)-r2,Math.min(no_in_channels,no_out_channels));
		//implements a crazy no-dip pan law for the mono->stereo/3/4/etc special case
	var inputangle = in_no / no_in_channels;
	var outputangle = out_no / no_out_channels;
	var d;
	var tl=0;
	for(var i=0;i<no_out_channels;i++){
		for(var ii=0;ii<no_in_channels;ii++){
			d = ((((i/no_out_channels)+(ii/no_in_channels)+outputangle-inputangle) + 1.5) % 1 ) - 0.5;
			d = Math.abs(d);
			tl += Math.max(1 - r2 * d * max_chans /*no_out_channels*/,0);
		}
	} // first sum up a kind of hypothetical total level
	tl /= min_chans;

	// then the particular one
	d = (((rotation+outputangle-inputangle) + 1.5) % 1 ) - 0.5;
	d = Math.abs(d);
	var l = Math.max(1 - r2 * d * max_chans,0) / tl;
	//post("\ntl",tl,"l",l);
	return l;
}

function populate_lookup_tables(){
	post("\nbuilding oscillator shape lookup");
	var osc_shape_lookup = new Buffer("osc_shape_lookup");
	var i,t,tt;
	var sin_l=[1,0,0,0,0,0,1];
	var tri_l=[0,1,1,0,0,1,0];
	var sqr_l=[0,0,0,1,1,0,0];
	var pw  = [0,0,1,1,0,0,0];
	
	for(i=0;i<4096;i++){
		t = i*6/4096;
		tt= Math.floor(t);
		t -= tt;
		
		osc_shape_lookup.poke(1,i, sin_l[tt]*(1-t)+sin_l[tt+1]*t);
		osc_shape_lookup.poke(2,i, tri_l[tt]*(1-t)+tri_l[tt+1]*t);
		osc_shape_lookup.poke(3,i, sqr_l[tt]*(1-t)+sqr_l[tt+1]*t);
		osc_shape_lookup.poke(4,i, 0.5+0.48*(pw[tt]*(1-t)+pw[tt+1]*t));
	}
	post("\npopulated pitch lookup with default 12TET 440Hz\nthere are other tunings available!");
	var mtof_l = new Buffer("mtof_lookup");
	for(t=0;t<8;t++){
		for(i=0;i<128;i++){
			mtof_l.poke(t+1,i,440*Math.pow(2,(i-69)/12));
		}
	}
	for(i=0;i<128;i++){
		quantpool.poke(1, i, i);
		indexpool.poke(1, i, i);
	}
}

function transfer_input_lists(){ // this routine also populates controller lists and keyboard input lists in all blocks in the db
	var k=blocktypes.getkeys();
	var t, mk;
	post("\ntransferring controller and keyboard lists to blocks");
	if(io_dict.contains("controllers")){  //looks for blocks with a param called 'controller number' and populates the menu list with the current set of controllers
		var cn = io_dict.get("controllers");
		mk = cn.getkeys();
		if(!Array.isArray(mk)) mk= [mk];
		mk.splice(0,0,"none");
		for(t in k){
			var ps = blocktypes.getsize(k[t]+"::parameters");
			var pt;
			for(pt=0;pt<ps;pt++){
				if(blocktypes.get(k[t]+"::parameters["+pt+"]::name")=="controller"){
					blocktypes.replace(k[t]+"::parameters["+pt+"]::values",mk);
				}
			}
		}
	}
	if(blocktypes.contains("core.input.keyboard")){
		if(io_dict.contains("keyboards")){
			blocktypes.replace("core.input.keyboard::parameters[1]::values",io_dict.get("keyboards"));
		}
	}
}

function deferred_diagnostics(){
	if(deferred_diag.length>1){
		var doo=deferred_diag[deferred_diag.length-1];
		for(var i=1;i<deferred_diag.length;i++){
			post("\n",deferred_diag[i]);
		}
		deferred_diag = [];
		deferred_diag[0] = doo;
	}
}

function calculate_states_colours(){
	var cll = config.getsize("palette::gamut");
	for(var i=0;i<MAX_STATES;i++){
		statesbar.colours[i] = config.get("palette::gamut["+Math.floor(i*cll/MAX_STATES)+"]::colour");
	}
}

function topbar_size(){
	var w=(topbar.used_length>0)? topbar.used_length:sidebar.x;
	var tw=(w+3)/mainwindow_width;
	var th=(fontheight+14)/mainwindow_height;
	topbar.videoplane.message("scale",tw,th);
	topbar.videoplane.message("position",-1+tw,1-th,0);
	topbar.videoplane.message("texzoom",1/tw,1/th);
	topbar.videoplane.message("texanchor",0.5*tw,1-0.5*th);
}

function sidebar_size(){
	var w = sidebar.width+sidebar.scrollbar_width+6;
	if((sidebar.mode=="file_menu")||(sidebar.mode=="file_more")){
		w = fontheight * 15+sidebar.scrollbar_width+6;
	}
	var h = sidebar.used_height;
	if(h==0){
		sidebar.videoplane.message("enable",0);
	}else{
		sidebar.videoplane.message("enable",1);
		var tw = w/mainwindow_width;
		var th = h/mainwindow_height;
		sidebar.videoplane.message("scale",tw,th,1);
		sidebar.videoplane.message("position",1-tw,1-th,0);
		sidebar.videoplane.message("texzoom",1/tw,1/th);
		sidebar.videoplane.message("texanchor",1-0.5*tw,1-0.5*th);
	}
}

function statesbar_size(){
	var h=(statesbar.used_height>0)? statesbar.used_height:0;
	if((h==0)||(displaymode=="block_menu")||(sidebar.mode == "file_menu")){
		statesbar.videoplane.message("enable",0);
	}else{
		statesbar.videoplane.message("enable",1);
		var tw=(14+fontheight)/mainwindow_width;
		var th=(h+5)/mainwindow_height;
		statesbar.videoplane.message("scale",tw,th);
		statesbar.videoplane.message("position",-1+tw,-1+th,0);
		statesbar.videoplane.message("texzoom",1/tw,1/th);
		statesbar.videoplane.message("texanchor",0.5*tw,0.5*th);
	}
}

function size(width,height,scale){
	if(mainwindow_width!=width || mainwindow_height!=height){
		post("\nmain window : "+width+"x"+height+"px");
		reinitialise_block_menu();
		blocks_tex_sent = [];
		mainwindow_width = width;
		mainwindow_height = height;
		if((typeof scale == "number") && (scale>0)) scale_2d = scale;
		lcd_main.message("dim",width,height);
		click_b_w=1; //work out the next power of two after the width, eg 640 --> 1024, use this for the click matrix row length for speed
		var t = 1;// << click_b_s;
		while(t<mainwindow_width){
			t*=2;
			click_b_w++;
		}
		fontheight = (mainwindow_height-24) / 18;
		config.replace("fontheight", fontheight);
		config.replace("window",width,height);
		fontsmall = fontheight / 3.2;
		config.replace("fontsmall",fontsmall);
		fo1 = fontheight * 0.1;
		sidebar.width = fontheight*sidebar.width_in_units;
		sidebar.x2 = mainwindow_width - sidebar.scrollbar_width;
		sidebar.x = sidebar.x2 -sidebar.width;

		topbar_size();
		sidebar_size();
		topbar.videoplane.message("enable",1);
		bottombar.requested_widths = [];
		setup_bottom_bar();

		sidebar.meters.startx = 9+1.1* fontheight;
		sidebar.meters.spread = 4;
		get_hw_meter_positions();
		for(var number=0;number<draw_wave.length;number++){
			if(waves_buffer[number] != undefined){
				for(var i=0;i<waves_buffer[number].channelcount();i++){
					var t=0;
					var ii=i*2;
					draw_wave[number][ii]=new Array((mainwindow_width/2)|0);
					draw_wave[number][ii+1]=new Array((mainwindow_width/2)|0);
					while(t<mainwindow_width/2){
						draw_wave[number][ii][t]=1;
						draw_wave[number][ii+1][t]=-1;
						t++;
					} 
				}			
			}
		}
		set_display_mode(displaymode,custom_block);
		redraw_flag.flag=12;
	}
}

function songs_audit(){
	songs_audit_process("core.input.control", "core.input.control.auto","parameters");
	songs_audit_process("core.input.control.2", "core.input.control.basic","parameters");
}

function songs_audit_process(hunting,replacing,replace_con_type_with){
	//temporary fn to go through songs, replace old blocks with new versions and tweak connection params
	var sk = songs.getkeys();
	post("\nsongs audit");
	for(var s=0;s<sk.length;s++){
		post("\n auditing song:",sk[s]);
		var found = -1;
		var blks = songs.get(sk[s]+"::blocks");
		for(var b=0;b<blks.length;b++){
			if(blks[b].contains("patcher")) if(blks[b].get("patcher")==hunting) found=b;
		}
		if(found!=-1){
			post("\n  found block ",hunting," in block ",found);
			songs.replace(sk[s]+"::blocks["+found+"]::patcher",replacing);
			songs.replace(sk[s]+"::blocks["+found+"]::name",replacing);
			if(replace_con_type_with != null){
				var cons = songs.get(sk[s]+"::connections");
				for(var c=0;c<cons.length;c++){
					if(cons[c].contains("from")){
						if(cons[c].get("from::number")==found){
							post("\n   connection number",c,"comes from the replaced block");
							songs.replace(sk[s]+"::connections["+c+"]::from::output::type",replace_con_type_with);
						} 
					}
				}

			}
		}/*else{
			post("\n  DIDNT FIND IT IN THIS SONG");
		}*/
	}
}

function soundcard_matrix_connection_fail(){
	post("\n\n\n\nSoundcard matrix mixer disabled for this session. Restart benny once you've fixed the problem.");
	SOUNDCARD_HAS_MATRIX = 0;
}

function prep_midi_indicators(){
	var oor = this.patcher.firstobject;
	while(oor !== null){
		var n = oor.varname;
		var ooor = oor.nextobject;
		if(n.indexOf("midi_indicator_")!=-1){
			this.patcher.remove(oor);
		}
		oor = ooor;
	}
	midi_indicators.list = [];
	var tl = []
	if(io_dict.contains("keyboards")) tl = io_dict.get("keyboards");
	if(io_dict.contains("controllers")){
		var cd = io_dict.get("controllers");
		var ck = cd.getkeys();
		if(!Array.isArray(ck)) ck = [ck];
		for(var i=0;i<ck.length;i++){
			tl.push(ck[i]);
		}
	}
	var al = io_dict.get("midi_available");
	if(!Array.isArray(al)) al = [al];
	for(var i =0;i<tl.length;i++){
		for(var t =0;t<al.length;t++){
			if(al[t]==tl[i]){
				midi_indicators.list.push(tl[i]);
				t = 9999;
			}
		}
	}
	for(var i = 0;i<midi_indicators.list.length;i++){
		var m_in = this.patcher.newdefault(950+i*50,620, "midiin", midi_indicators.list[i]);
		m_in.message("sendbox","varname","midi_indicator_in_"+i);
		var m_lim = this.patcher.newdefault(950+i*50,650, "speedlim", 33,"@defer",1);
		m_lim.message("sendbox","varname","midi_indicator_lim_"+i);
		var m_m = this.patcher.newdefault(950+i*50,680, "message","@varname","midi_indicator_m_"+i);
		m_m.set(";","to_blockmanager", "midi_indicator",i);
		this.patcher.connect(m_in,0,m_lim,0);
		this.patcher.connect(m_lim,0,m_m,0);
		midi_indicators.status[i]=0;
	}
	if(ext_sync.active||ext_sync.link_enabled)midi_indicators.status.push(0);
}

function import_presets(){
	var k = userpresets.getkeys();
	if(k==null) return 0;
	for(var i=0;i<k.length;i++){
		if(blocktypes.contains(k[i])){
			post("\nimporting presets for",k[i],":");
			var pd=new Dict;
			pd = userpresets.get(k[i]+"::presets");
			pdk = pd.getkeys();
			for(var ii=0;ii<pdk.length;ii++){
				post(pdk[ii]);
				blocktypes.replace(k[i]+"::presets::"+pdk[ii]+"::values",userpresets.get(k[i]+"::presets::"+pdk[ii]+"::values"));
			}
		}
	}
}