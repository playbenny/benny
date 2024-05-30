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
	post("\n\nwelcome to benny\n\n\ninit stage 1 : initial-only actions\n------------------------------------");
	var path = this.patcher.filepath;
	projectpath = path.split("patchers/");
	projectpath = projectpath[0];
	post("\npath is",projectpath);
	var dropdown = this.patcher.getnamed("hw_dropdown");
	dropdown.message("prefix", projectpath+"hardware_configs");
	config.parse('{ }');
	config.import_json("config.json");
	userconfig.parse('{ }');
	post("\nlooking for userconfig:",projectpath+"userconfig.json");
	var userconfigfile = new File(projectpath+"userconfig.json");
	if(userconfigfile.isopen){
		userconfigfile.close();
		userconfig.import_json(projectpath+"userconfig.json");
		post("OK");
	}else{
		userconfigfile.close();
		post("\n-------------\nfirst run. hello!\nsetting songs folder and templates folder, you can change these in the file menu.");
		var newuserconfig = new Dict;
		newuserconfig.parse("{}");
		newuserconfig.replace("last_hardware_config","no_hardware.json");
		newuserconfig.replace("TEMPLATES_FOLDER", projectpath+"templates");
		newuserconfig.replace("SONGS_FOLDER", projectpath+"demosongs");
		newuserconfig.replace("glow", 0.2);
		newuserconfig.export_json(projectpath+"userconfig.json");
		post("\ntry close");
		newuserconfig.close();
		post("\ntry freepeer");
		newuserconfig.freepeer();
		userconfig.import_json(projectpath+"userconfig.json");
		post("OK");
		//FIRSTRUN = 1;
	}
	if(userconfig.contains("last_hardware_config")){
		messnamed("set_hw_config",userconfig.get("last_hardware_config"));
	}
	keymap.parse('{}');
	keymap.import_json("keymap.json");
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
	}
}

function initialise_reset(hardware_file){
	post("\n\nreset stage 1 : resets\n------------------");
	messnamed("getpath","bang");
	config.parse('{ }');
	config.import_json("config.json");
	userconfig.parse('{ }');
	userconfig.import_json("userconfig.json");
	keymap.parse('{}');
	keymap.import_json("keymap.json");
	process_userconfig();

	matrix.message("clear"); //clears the audio matrix
	
	sigouts.setvalue(0,0); // clear sigs

	//wipe all the buffers
	messnamed("clear_all_buffers","bang");
	//waves_polybuffer.clear();
	note_poly.setvalue(0,"enabled",0);
	audio_poly.setvalue(0,"enabled",0);

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
	load_config_colours(); //separate fn so it can be called by core.space block
	UPSAMPLING = config.get("UPSAMPLING");
	RECYCLING = config.get("RECYCLING");
	click_b_s = config.get("click_buffer_scaledown");
	wire_dia = config.get("wire_dia");
	glow_amount = config.get("glow");
	messnamed("bloom_amt",glow_amount);
	mainfont = config.get("mainfont");
	monofont = config.get("monofont");
	BLOCK_MENU_CLICK_ACTION = config.get("BLOCK_MENU_CLICK_ACTION");
	MAX_BLOCKS = config.get("MAX_BLOCKS");
	MAX_NOTE_VOICES = config.get("MAX_NOTE_VOICES");
	MAX_AUDIO_VOICES = config.get("MAX_AUDIO_VOICES");
	MAX_AUDIO_INPUTS = config.get("MAX_AUDIO_INPUTS");
	MAX_AUDIO_OUTPUTS = config.get("MAX_AUDIO_OUTPUTS");
	//MAX_USED_AUDIO_INPUTS = config.get("MAX_USED_AUDIO_INPUTS");
	//MAX_USED_AUDIO_OUTPUTS = config.get("MAX_USED_AUDIO_OUTPUTS");
	NO_IO_PER_BLOCK = config.get("NO_IO_PER_BLOCK");
	MAX_BEZIER_SEGMENTS = config.get("MAX_BEZIER_SEGMENTS");//24; //must be a multiple of 4
	MIN_BEZIER_SEGMENTS = config.get("MIN_BEZIER_SEGMENTS");//24; //must be a multiple of 4
	BLOCKS_GRID = config.get("BLOCKS_GRID");
	BLOCKS_GRID = [BLOCKS_GRID, 1/BLOCKS_GRID];
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
	MAX_PANEL_COLUMNS = config.get("MAX_PANEL_COLUMNS");
	SELF_CONNECT_THRESHOLD = config.get("SELF_CONNECT_THRESHOLD"); //when dragging a block back onto itself
	DOUBLE_CLICK_TIME = config.get("DOUBLE_CLICK_TIME");
	LONG_PRESS_TIME = config.get("LONG_PRESS_TIME");
	CTRL_VOICE_SEL_MOMENTARY = config.get("CTRL_VOICE_SEL_MOMENTARY");
	SLIDER_CLICK_SET = config.get("SLIDER_CLICK_SET");
	SCOPE_DEFAULT_ZOOM = config.get("SCOPE_DEFAULT_ZOOM");
	ANIM_TIME = config.get("ANIM_TIME");
	waves_preloading = config.get("waves_preloading");
	wires_show_all = config.get("WIRES_SHOW_ALL");
	MODULATION_IN_PARAMETERS_VIEW = config.get("MODULATION_IN_PARAMETERS_VIEW");
	AUTOZOOM_ON_SELECT = config.get("AUTOZOOM_ON_SELECT");
	sidebar.scrollbar_width = config.get("sidebar_scrollbar_width");
	sidebar.width_in_units = config.get("sidebar_width_in_units");
	sidebar.width = fontheight*sidebar.width_in_units;
	sidebar.x2 = mainwindow_width - sidebar.scrollbar_width;
	sidebar.x = sidebar.x2 -sidebar.width;



	//for(i=0;i<MAX_PARAMETERS*MAX_BLOCKS;i++) is_flocked[i]=0;
	post("\ninitialising polys");//this primes these arrays so that it doesn't think it needs to load the blank patches twice.
	note_poly.message("voices", MAX_NOTE_VOICES);
	post("\n-",MAX_NOTE_VOICES," note voice slots available");
	audio_poly.message("voices", MAX_AUDIO_VOICES);
	post("\n-",MAX_AUDIO_VOICES," audio voice slots available");

	for(i=0;i<MAX_NOTE_VOICES;i++) {
		loaded_note_patcherlist[i]='_blank.note';
	}
	emptys="{}"; //experimental - i'm not wiping the waves polybuffer on reset
	for(i=0;i<MAX_WAVES;i++){
		waves.remapping[i]=i;
		waves.age[i]=0;
		emptys= emptys+",{}";
	}
	//for(i=0;i<=MAX_WAVES;i++)	
	waves_dict.parse('{ "waves" : ['+emptys+'] }');

	//for(i=0;i<MAX_HARDWARE_BLOCKS;i++) hardware_list[i] = "none";
	
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
	
	var i;
	for(i=0;i<MAX_NOTE_VOICES;i++) {
		note_patcherlist[i]='blank.note';
		note_poly.setvalue(i+1,"patchername","blank.note");
		loaded_note_patcherlist[i]='blank.note';
	}
	for(i=0;i<MAX_AUDIO_VOICES;i++) {
		audio_upsamplelist[i]=1;
		audio_patcherlist[i]='blank.audio';
		audio_poly.setvalue(i+1,"patchername","blank.audio");
		loaded_audio_patcherlist[i]='blank.audio';
	}
	for(i=0;i<MAX_BLOCKS;i++) {
		ui_patcherlist[i]='blank.ui';
		loaded_ui_patcherlist[i] = 'blank.ui';
		ui_poly.setvalue(i+1,"patchername","blank.ui");
		selected.block[i]=0;
		selected.wire[i]=0;
		record_arm[i]=0;
	}
	still_checking_polys = 0;
	audio_to_data_poly.setvalue(0, "vis_meter", 0);
	audio_to_data_poly.setvalue(0, "vis_scope", 0);
	audio_to_data_poly.setvalue(0, "out_value", 0);
	audio_to_data_poly.setvalue(0, "out_trigger", 0);

	for(i=MAX_AUDIO_VOICES * NO_IO_PER_BLOCK+1;i<1+MAX_AUDIO_VOICES * NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS+MAX_AUDIO_OUTPUTS;i++){
		audio_to_data_poly.setvalue(i, "vis_meter", 1);
	}
	var emptys="{}";
	for(i=0;i<MAX_BLOCKS-1;i++)	emptys= emptys+",{}";
	blocks.parse('{ "blocks" : ['+emptys+'] }');

	connections.parse('{ "connections" : [ {} ] }');

//	emptys="{}";
//	for(i=0;i<=MAX_WAVES;i++)	emptys= emptys+",{}";
//	waves_dict.parse('{ "waves" : ['+emptys+'] }');
		
	send_note_patcherlist();
	send_audio_patcherlist();

	scope_zoom(0,SCOPE_DEFAULT_ZOOM);


	SONGS_FOLDER = config.get("SONGS_FOLDER");
	read_songs_folder("songs");
	
	TEMPLATES_FOLDER = config.get("TEMPLATES_FOLDER");
	if((projectpath!="")&&(TEMPLATES_FOLDER.indexOf("/")==-1)){
		TEMPLATES_FOLDER = projectpath + TEMPLATES_FOLDER;
		post("\ntemplates folder is ",TEMPLATES_FOLDER);
	}
	read_songs_folder("templates");	
			
	post("\nbuilding blocktypes database");
	import_blocktypes("note_blocks");
	import_blocktypes("audio_blocks");

	check_for_new_prefixes();

	var preload_task = new Task(preload_all_waves, this);
	preload_task.schedule(100);

	if(hardware_file!="init"){
		import_hardware(hardware_file);
	}else{
		post("\nall essential data loaded, please choose a hardware configuration and press start.");
		messnamed("ready_to_start","bang");
	}
}

function initialise_graphics() {
	world.message("sendwindow", "idlemouse", 1);
	world.message("sendwindow", "mousewheel", 1);
	world.message("sendrender", "rotate_order", "zyx");
	world.message("sendrender", "smooth_shading", 1);
	world.message("visible", 1);
	world.message("esc_fullscreen", 0);
	world.message("fsmenubar", 0);
	world.message("fsaa", 1);
	world.message("fps", 30);
	world.getsize(); //world.message( "getsize"); //get ui window ready

	background_cube = new JitterObject("jit.gl.gridshape", "benny");
	background_cube.shape = "cube";
	background_cube.scale = [100000, 100000, 1];
	background_cube.position = [0, 0, -200];
	background_cube.name = "background";
	//background_cube.filterclass = "block";
	background_cube.color = [0, 0, 0, 1];

	selection_cube = new JitterObject("jit.gl.gridshape", "benny");
	selection_cube.shape = "cube";
	selection_cube.name = "selection";
	selection_cube.color = [0.65, 0.65, 0.65, 0.15];
	selection_cube.scale = [1, 1, 1];
	selection_cube.position = [0, 0, 0];
	selection_cube.blend_enable = 1;
	selection_cube.enable = 0;

	menu_background_cube = new JitterObject("jit.gl.gridshape", "benny");
	menu_background_cube.shape = "cube";
	menu_background_cube.scale = [1000, 1, 1000];
	menu_background_cube.position = [0, -200, 0];
	menu_background_cube.name = "block_menu_background";
	menu_background_cube.color = [0, 0, 0, 1];

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

	flock_axes(0);
	//	messnamed("camera_control", "position", 0, 0, -2);
	messnamed("camera_control", "direction", 0, 0, -1);
	messnamed("camera_control", "position", camera_position);
	messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0], blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1], blocks_page.highest), blocks_page.lowest), -1);
	messnamed("camera_control", "lighting_enable", 1);
	messnamed("camera_control", "lens_angle", 30);

	var menutex_task = new Task(initialise_block_menu, this);
	menutex_task.schedule(1000);
}

function stop_graphics(){
	post("\nstopping graphics");
	background_cube.freepeer();
	selection_cube.freepeer();
	menu_background_cube.freepeer();
	flock_cubexy.freepeer();
	flock_cubeyz.freepeer();
	flock_cubexz.freepeer();
	world.message("enable",0);
}

function import_hardware(v){
	post("\n\ninit stage 3 : import hardware\n---------------------------------------");
	var d2 = new Dict;
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
	d2.import_json(v);
	
	d = d2.get("hardware");
	var keys = d.getkeys();
	if(d2.contains("measured_latency")){
		post("\nlatency measurement found, copied to config for blocks to access if they want");
		config.replace("measured_latency",d2.get("measured_latency"));
	}
	
	for(i=0;i<MAX_AUDIO_INPUTS+2;i++) input_used[i]=0;
	for(i=0;i<MAX_AUDIO_OUTPUTS+2;i++) output_used[i]=0;
	var output_blocks=[]; //output blocks are in pairs, eg #1 is ch's 1+2. so, for every output channel you find ("in" to a block, mind), 
																		//you math.floor((x-1)/2) and set that element of this array
	for(i=0;i<MAX_AUDIO_OUTPUTS/2;i++) output_blocks[i] = "clip_dither";

	for(i = 0; i < keys.length; i++){
		post("\n  "+keys[i]);
		blocktypes.set(keys[i],d.get(keys[i]));
		var ob=null;
		
		if(d.contains(keys[i]+"::output_block")){
			ob = new Dict;
			ob = d.get(keys[i]+"::output_block");
			d3.setparse('{}');
			d3.import_json(ob+".json");
			
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
				//blocktypes.set(keys[i]+"::connections",d3.get(ob+"connections"));
				blocktypes.set(keys[i]+"::parameters");
				blocktypes.append(keys[i]+"::parameters");
				var plist= d3.getsize(ob+"::parameters");
				post("- found ",plist,"parameters. adding: ");
				for(t=0;t<plist;t++){
					var d4 = d3.get(ob+"::parameters["+t+"]");
					p_type = d4.get("type");
					p_values = d4.get("values");
					write_parameter_info_buffer(p_values,p_type,MAX_PARAMETERS*(MAX_BLOCKS+i)+t);
					post("\nopb,",MAX_PARAMETERS*(MAX_BLOCKS+i)+t);
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
			if((d.contains(keys[i]+"::cue_out"))&&(d.get(keys[i]+"::cue_out")==1)){
				automap.available_q = ch;
				post("\ncue out is on channel(s)",ch);
			}
			if((d.contains(keys[i]+"::click_out"))&&(d.get(keys[i]+"::click_out") == 1)){
				post("\nfound click out");
				var clickdac = this.patcher.newdefault(90,208, "dac~", ch);
				clickdac.message("sendbox", "varname", "click_output");
				click_enabled = 1;
				var global_transport_and_click = this.patcher.getnamed("global_transport_and_click");
				for(var ccc=0;ccc<ch.length;ccc++) this.patcher.connect(global_transport_and_click, 1, clickdac, ccc);
			}
		}
		if(d.contains(keys[i]+"::connections::out::hardware_channels")){
			var ch = d.get(keys[i]+"::connections::out::hardware_channels");
			if(typeof ch == "number") ch = [ch];
			for(t=0;t<ch.length;t++){
				input_used[ch[t]-1]=1;
				if(ch[t]>MAX_USED_AUDIO_INPUTS) MAX_USED_AUDIO_INPUTS = ch[t];
			}
		}
	}
	post("\nlast input:",MAX_USED_AUDIO_INPUTS,"last output:",MAX_USED_AUDIO_OUTPUTS);
	if(output_blocks.length<MAX_USED_AUDIO_OUTPUTS/2){
		for(i=output_blocks.length;i<MAX_USED_AUDIO_OUTPUTS/2;i++) output_blocks.push("clip_dither");
	}else{
		output_blocks.splice(MAX_USED_AUDIO_OUTPUTS);
	}
	post("\nreading midi io config");
	d = d2.get("io");
	var keys = d.getkeys();
	for(i = 0; i < keys.length; i++){
		t = d.get(keys[i]);
		io_dict.set(keys[i],t);
		if(keys[i]=="controllers"){
			post("\n  controllers : "+t.getkeys());
		}else if(keys[i]=="marix_switch"){
			post("\n  matrix switch : ok");
		}else{
			post("\n  "+keys[i]+" : "+t);
		}
	}
	//messnamed("to_ext_matrix","read_config");
	transfer_input_lists();
	post("\nsetting output blocks to:",output_blocks);
	output_blocks_poly.patchername(output_blocks); 
	post("\n\ninit stage 4 : start graphic and audio engines\n------------------------------------------");

	initialise_graphics();

	post("\nbuilding new audio graph");
	messnamed("click_enabled",click_enabled);
	var audioiolists = get_hw_meter_positions();
	var old_dac = this.patcher.getnamed("audio_outputs");
	var old_adc = this.patcher.getnamed("audio_inputs");
	this.patcher.remove(old_dac);
	this.patcher.remove(old_adc);
	new_adc = this.patcher.newdefault(654,497, "mc.adc~", audioiolists[0]);
	new_adc.message("sendbox", "varname", "audio_inputs");
	new_dac = this.patcher.newdefault(667,882, "mc.dac~", audioiolists[1]);
	new_dac.message("sendbox", "varname", "audio_outputs");
	var opinterleave = this.patcher.getnamed("op_interleave");
	var ipcombine = this.patcher.getnamed("ip_combine");
	var openbut = this.patcher.getnamed("openbutton");
	this.patcher.connect(opinterleave, 0, new_dac, 0);
	this.patcher.connect(new_adc,0,ipcombine,1);
	this.patcher.connect(openbut,0,new_dac,0);
	post("\noutput list",audioiolists[1],"\ninput list",audioiolists[0]);
	keys = blocktypes.getkeys();
	for(i=0;i<keys.length;i++){
		if(keys[i].split(".")[0] == "hardware"){
			if(blocktypes.contains(keys[i]+"::connections::in::hardware_channels")){
				var ch = blocktypes.get(keys[i]+"::connections::in::hardware_channels");
				if(!Array.isArray(ch)) ch=[ch];
				for(var ci=0;ci<ch.length;ci++){
					ch[ci] = audioiolists[1].indexOf(ch[ci])+1;
				}
				blocktypes.replace(keys[i]+"::connections::in::hardware_channels",ch);
			}
			if(blocktypes.contains(keys[i]+"::connections::out::hardware_channels")){
				var ch = blocktypes.get(keys[i]+"::connections::out::hardware_channels");
				if(!Array.isArray(ch)) ch=[ch];
				for(var ci=0;ci<ch.length;ci++){
					//post("\nwas",ch[ci]);
					ch[ci] = audioiolists[0].indexOf(ch[ci])+1;
					//post(" is ",ch[ci]);
				}
				blocktypes.replace(keys[i]+"::connections::out::hardware_channels",ch);
			}
		}
	} //this section ^^ eg ifyou have eg 2xES6 with an adat soundcard you'll have in channels 1 2 3 4 5 6 9 10 11 12 13 14. 
	//so we tell the adc~ to listen to those channels, then RENUMBER the channels in the blocktypes dict, to refer to the 
	//sequential number of the io rather than the channel number
	//audioiolists[0].length
	MAX_AUDIO_INPUTS = audioiolists[0].length;
	MAX_AUDIO_OUTPUTS = audioiolists[1].length;
	config.set("MAX_AUDIO_INPUTS",MAX_AUDIO_INPUTS);
	config.set("MAX_AUDIO_OUTPUTS",MAX_AUDIO_OUTPUTS);
	sidebar.scopes.midi_routing.voice = MAX_NOTE_VOICES + MAX_AUDIO_VOICES + MAX_AUDIO_VOICES * NO_IO_PER_BLOCK + MAX_AUDIO_INPUTS + MAX_AUDIO_OUTPUTS;
	//var matrixins = MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS;
	var matrixouts = MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_OUTPUTS;
	//post("\n i think matrix should be ",MAX_AUDIO_VOICES," * ",NO_IO_PER_BLOCK," + either",MAX_USED_AUDIO_INPUTS," or ",MAX_USED_AUDIO_OUTPUTS," = ",matrixins,"or",matrixouts);
	sigouts.chans(matrixouts);
	this.patcher.getnamed("mc_separate").chans(MAX_AUDIO_VOICES,MAX_AUDIO_VOICES);
	matrix.numouts(matrixouts);
	output_blocks_poly.voices(MAX_USED_AUDIO_OUTPUTS/2);
	audio_to_data_poly.voices(MAX_USED_AUDIO_INPUTS + MAX_USED_AUDIO_OUTPUTS + NO_IO_PER_BLOCK * MAX_AUDIO_VOICES);

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
	
	usermouse.queue = [];
	world.message( "enable", 1);

	set_display_mode("blocks");
	
	//	turn on audio engine
	new_dac.message('int',1);
	if(startup_loadfile=="autoload"){
		if(songs.contains(startup_loadfile/*"autoload"*/)){
			loading.merge = 0;
			loading.progress=-1;
			loading.mute_new=0;
			loading.bundling=12;
			loading.wait=1;
			loading.songname = "autoload";
			import_song();	
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
	menudark = [ menucolour[0]* dimm, menucolour[1]*dimm, menucolour[2]*dimm ];
	state_fade.lastcolour = menudark;
	dimm=bg_dark_ratio;
	menudarkest = [ menucolour[0]* dimm, menucolour[1]*dimm, menucolour[2]*dimm ];
	backgroundcolour = config.get("palette::background");
	backgroundcolour_blocks = config.get("palette::background_blocks");
	backgroundcolour_block_menu = config.get("palette::background_block_menu");
	backgroundcolour_panels = config.get("palette::background_panels");
	backgroundcolour_waves = config.get("palette::background_waves");
	backgroundcolour_sidebar = config.get("palette::background_sidebar");
	redraw_flag.flag |= 4;
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
								nc = [nc[0]*1.2,nc[1]*1.2,nc[2]*1.2];
								blocktypes.replace(types[i]+"::groups["+gp+"]::colour",nc);
							}
						}
					}catch(err){
						post("\n\n>> ERROR >> the block:",types[i],"has corrupt groups in the json file.(",err.name,err.message,")");
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
	var f = new Folder(v);
	var d = new Dict;
		
	f.reset();
	while (!f.end) {
		if(f.extension == ".json"){
			post("\n  "+f.filename);
			d.import_json(f.filename);
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

function play(state){
	if(state!=playing){
		playing=state;
		redraw_flag.flag=2;
	}
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
		fontsmall = fontheight / 3.2;
		fo1 = fontheight * 0.1;
		sidebar.width = fontheight*sidebar.width_in_units;
		sidebar.x2 = mainwindow_width - sidebar.scrollbar_width;
		sidebar.x = sidebar.x2 -sidebar.width;

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