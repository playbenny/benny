function import_hardware(v){
	var d2 = new Dict;
	var d = new Dict;
	var d3 = new Dict;
	var t;
	var i;
	
	initialise_dictionaries();
		
	post("\nbuilding blocktypes database \n");
	import_blocktypes("note_blocks");
	import_blocktypes("audio_blocks");
		
	post("reading hardware database \n");
	d2.import_json(v);
	
	d = d2.get("hardware");
	var keys = d.getkeys();
	
	for(i=0;i<MAX_AUDIO_INPUTS+2;i++) input_used[i]=0;
	for(i=0;i<MAX_AUDIO_OUTPUTS+2;i++) output_used[i]=0;
	var output_blocks=[]; //output blocks are in pairs, eg #1 is ch's 1+2. so, for every output channel you find ("in" to a block, mind), 
																		//you math.floor((x-1)/2) and set that element of this array
	for(i=0;i<MAX_AUDIO_OUTPUTS/2;i++) output_blocks[i] = "clip_dither";
	for(i = 0; i < keys.length; i++){
		post("  "+keys[i]+"\n");
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
				//post("- found ",plist,"parameters. adding: ");
				for(t=0;t<plist;t++){
					blocktypes.setparse(keys[i]+"::parameters["+t+"]","{}");
					blocktypes.set(keys[i]+"::parameters["+t+"]",d3.get(ob+"::parameters["+t+"]"));
					//post(d3.get(ob+"::parameters["+t+"]::name")+" ");
					if(t+1<plist)blocktypes.append(keys[i]+"::parameters","*");
				}
			}
			if(d3.contains(ob+"::connections::in::midi") && !blocktypes.contains(keys[i]+"::connections::in::midi")){
				blocktypes.set(keys[i]+"::connections::in::midi",d3.get(ob+"::connections::in::midi"));
			} //presently only bothers to look for and copy over MIDI inputs to output blocks - the audio side is already accounted for..
		}
		if(d.contains(keys[i]+"::connections::in::hardware_channels")){
			var ch = d.get(keys[i]+"::connections::in::hardware_channels");
			if(typeof ch == "number") ch = [ch];
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
		}
	}
	post("last input:",MAX_USED_AUDIO_INPUTS,"last output:",MAX_USED_AUDIO_OUTPUTS,"\n");
	get_hw_meter_positions();
	post("reading midi io config\n");
	d = d2.get("io");
	var keys = d.getkeys();
	for(i = 0; i < keys.length; i++){
		t = d.get(keys[i]);
		post("  "+keys[i]+" : "+t+"\n");
		io_dict.set(keys[i],t);
	}
	var hardware_outs = io_dict.get("hardware");
	if(typeof hardware_outs == "string") hardware_outs = [hardware_outs];
	if(hardware_outs!=null){
		for(i=0;i<8;i++){
			if(i<hardware_outs.length){
				messnamed("hardware_midi", i, hardware_outs[i]);
				messnamed("hardware_midi", i+8, hardware_outs[i]);
			}else{
				messnamed("hardware_midi", i, "None");
				messnamed("hardware_midi", i+8, "None");
			}
		}
		
	}
	messnamed("to_ext_matrix","read_config");
	populate_lookup_tables();
	transfer_input_lists();
	post("\nsetting output blocks to:",output_blocks);
	output_blocks_poly.patchername(output_blocks); //"master_1.maxpat", "clip_dither.maxpat", "clip_dither.maxpat", "clip_dither.maxpat", "clip_dither.maxpat", "clip_dither.maxpat", "clip_dither.maxpat", "clip_dither.maxpat");
	assign_block_colours();
	
	usermouse.queue = [];
	world.message( "enable", 1);

	set_display_mode("blocks");
	
	
	//	center_view();
	this.patcher.getnamed("audio_outputs").message('int',1);

	var preload_task = new Task(preload_all_waves, this);
	preload_task.schedule(3000);
	
	var menutex_task = new Task(initialise_block_menu, this);
	menutex_task.schedule(1000);
	//	redraw_flag.flag=4;
	if((!usermouse.ctrl) && (songs.contains("autoload"))){
		loading.merge = 0;
		loading.dont_automute=1;
		loading.progress=-1;
		loading.mute_new=0;
		loading.bundling=12;
		loading.wait=1;
		loading.songname = "autoload";
		import_song();	
	}	
}

function load_config_colours(){
	process_userconfig();
	menucolour = config.get("palette::menu");
	var dimm=0.5;
	menudark = [ menucolour[0]* dimm, menucolour[1]*dimm, menucolour[2]*dimm ];
	state_fade.lastcolour = menudark;
	dimm=bg_dark_ratio;
	menudarkest = [ menucolour[0]* dimm, menucolour[1]*dimm, menucolour[2]*dimm ];
	matrixcolour = config.get("palette::connections::matrix");
	hardwarecolour = config.get("palette::connections::hardware");
	audiocolour = config.get("palette::connections::audio");
	midicolour = config.get("palette::connections::midi");
	parameterscolour = config.get("palette::connections::parameters");
	blockcontrolcolour = config.get("palette::connections::block");
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
	//post("\nimporting userconfig\n  ");
	var uk = userconfig.getkeys();
	if(uk==null) return 0;
	for(var i=0;i<uk.length;i++){
		var tk=userconfig.get(uk[i]);
		if((typeof tk == "string")||(typeof tk == "number")){
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

function initialise_dictionaries(){
	var i; 
	// get config first because a lot of things depend on it.
	config.parse('{ }');
	config.import_json("config.json");
	userconfig.parse('{ }');
	userconfig.import_json("userconfig.json");
	post("reading config\n");				
	load_config_colours(); //separate fn so it can be called by core.space block
	//process_userconfig();
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
	MAX_USED_AUDIO_INPUTS = config.get("MAX_USED_AUDIO_INPUTS");
	MAX_USED_AUDIO_OUTPUTS = config.get("MAX_USED_AUDIO_OUTPUTS");
	NO_IO_PER_BLOCK = config.get("NO_IO_PER_BLOCK");
	MAX_BEZIER_SEGMENTS = config.get("MAX_BEZIER_SEGMENTS");//24; //must be a multiple of 4
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
	SCOPE_DEFAULT_ZOOM = config.get("SCOPE_DEFAULT_ZOOM");
	ANIM_TIME = config.get("ANIM_TIME");
	waves_preloading = config.get("waves_preloading");
	wires_show_all = config.get("WIRES_SHOW_ALL");

	var maxmsp = config.get("maxmsp");
	var messes = maxmsp.getkeys();
	for(i=0;i<messes.length;i++){
		var m = maxmsp.get(messes[i]);
		messnamed("max",messes[i],m);
		post("\nmessage to max: ",messes[i],m);
	}


//	connections_sketch.reset();
//	request_globals(); //sends the global variables (MAX_DATA etc) out. IS THIS NEEDED AT THIS POINT?

	matrix.message("clear"); //clears the audio matrix

	//wipe all the buffers
	messnamed("clear_all_buffers","bang");
	waves_polybuffer.clear();
	note_poly.setvalue(0,"enabled",0);
	audio_poly.setvalue(0,"enabled",0);


	//for(i=0;i<MAX_PARAMETERS*MAX_BLOCKS;i++) is_flocked[i]=0;
	post("\ninitialising polys");//this primes these arrays so that it doesn't think it needs to load the blank patches twice.
	for(i=0;i<MAX_NOTE_VOICES;i++) {
		loaded_note_patcherlist[i]='_blank.note';
	}
	for(i=0;i<MAX_WAVES;i++){
		waves.remapping[i]=i;
		waves.age[i]=0;
	}
	for(i=0;i<MAX_HARDWARE_BLOCKS;i++){
		hardware_list[i] = "none";
	}
	
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

	emptys="{}";
	for(i=0;i<=MAX_WAVES;i++)	emptys= emptys+",{}";
	waves_dict.parse('{ "waves" : ['+emptys+'] }');


	var namelist = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	for(i=0;i<128;i++){
		note_names[i] = namelist[i%12]+(Math.floor(i/12)-2);
	}
		
	send_note_patcherlist();
	send_audio_patcherlist();

	messnamed("config_loaded","bang");
	messnamed("MAX_PARAMETERS", MAX_PARAMETERS); //the wrapper blocks need this so it makes sense to send it

	messnamed("MAX_BLOCKS",MAX_BLOCKS); //once you've updated blocks, delete all these, and the request global function TODO
	messnamed("MAX_NOTE_VOICES",MAX_NOTE_VOICES);
	messnamed("MAX_AUDIO_VOICES", MAX_AUDIO_VOICES);
	messnamed("MAX_AUDIO_INPUTS", MAX_AUDIO_INPUTS);
	messnamed("MAX_AUDIO_OUTPUTS", MAX_AUDIO_OUTPUTS);
	messnamed("NO_IO_PER_BLOCK", NO_IO_PER_BLOCK);
	messnamed("MAX_DATA", MAX_DATA);

	scope_zoom(0,SCOPE_DEFAULT_ZOOM);


	SONGS_FOLDER = config.get("SONGS_FOLDER");
	read_songs_folder("songs");
	
	TEMPLATES_FOLDER = config.get("TEMPLATES_FOLDER");
	read_songs_folder("templates");	
	// all the 3d ui stuff now

	world.message( "sendwindow", "idlemouse", 1);
	world.message( "sendwindow", "mousewheel", 1);
	world.message( "sendrender", "rotate_order", "zyx");
	world.message( "sendrender", "smooth_shading", 1);
	world.message( "visible", 1);
	world.message( "esc_fullscreen", 0);
	world.message( "fsmenubar", 0);
	world.message( "fsaa", 1);
	world.message( "fps", 30);
	world.getsize(); //world.message( "getsize"); //get ui window ready

	background_cube = new JitterObject("jit.gl.gridshape", "mainwindow");
	background_cube.shape = "cube";
	background_cube.scale = [100000, 100000, 1 ];
	background_cube.position = [0, 0, -200];
	background_cube.name = "background";
	background_cube.color = [0, 0, 0, 1];

	selection_cube = new JitterObject("jit.gl.gridshape", "mainwindow");
	selection_cube.shape = "cube";
	selection_cube.name = "selection";
	selection_cube.color = [0.65, 0.65, 0.65, 0.15];
	selection_cube.scale = [1, 1, 1 ];
	selection_cube.position = [0, 0, 0];
	selection_cube.blend_enable = 1;
	selection_cube.enable = 0;

	menu_background_cube = new JitterObject("jit.gl.gridshape", "mainwindow");
	menu_background_cube.shape = "cube";
	menu_background_cube.scale = [1000, 1, 1000 ];
	menu_background_cube.position = [0, -200, 0];
	menu_background_cube.name = "block_menu_background";
	menu_background_cube.color = [0, 0, 0, 1];

	flock_cubexy = new JitterObject("jit.gl.gridshape", "mainwindow");
	flock_cubexy.shape = "cube";
	flock_cubexy.scale = [flock_cube_size*0.5+1, flock_cube_size*0.5+1, 0.0001 ];
	flock_cubexy.position = [0, 0, 3.999];
	flock_cubexy.name = "flockcubexy";
	flock_cubexy.color = [0.2,0.2,0.2,1];
	
	flock_cubeyz = new JitterObject("jit.gl.gridshape", "mainwindow");
	flock_cubeyz.shape = "cube";
	flock_cubeyz.scale = [0.0001, flock_cube_size*0.5+1, flock_cube_size*0.5+1 ];
	flock_cubeyz.position = [-flock_cube_size*0.5-1.00005, 0,5+flock_cube_size*0.5];
	flock_cubeyz.name = "flockcubeyz";
	flock_cubeyz.color = [0.4,0.4,0.4,1];
	
	flock_cubexz = new JitterObject("jit.gl.gridshape", "mainwindow");
	flock_cubexz.shape = "cube";
	flock_cubexz.scale = [flock_cube_size*0.5+1, 0.0001, flock_cube_size*0.5+1 ];
	flock_cubexz.position = [0, -flock_cube_size*0.5-1.00005,5+flock_cube_size*0.5];
	flock_cubexz.name = "flockcubexz";
	flock_cubexz.color = [0.3,0.3,0.3,1];
	
	flock_axes(0);
	
//	messnamed("camera_control", "position", 0, 0, -2);
	messnamed("camera_control", "direction", 0, 0, -1);
	messnamed("camera_control","position",  camera_position);
	messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
	messnamed("camera_control", "lighting_enable", 1);
	messnamed("camera_control", "lens_angle", 30);
	sigouts.setvalue(0,0); // clear sigs
}

function assign_block_colours(){
	//counts how many types of block there are:
	var typecount=0;
	var types = [];
	types = blocktypes.getkeys();
	types.sort();
	cubecount = types.length;
	var i;
	var typ,ty;
	var type_order = config.get("type_order");
	typecount = type_order.length;
	
	var cll = config.getsize("palette::gamut");
	var t = Math.floor(cll/(typecount+1));
	var t1=44;
	var t2;
	var c=new Array(3);
	for(var typ in type_order){	
		t2=t1;
		for(i=0;i<cubecount;i++){
			ty=types[i].split(".",4);
			if(ty[0]==type_order[typ]){
				t2++;
				t2 = t2 % cll;
				c = config.get("palette::gamut["+t2+"]::colour");
				blocktypes.replace(types[i]+"::colour",c);
			}
		}
		t1+=t;
	}
}

function import_blocktypes(v)
{
	var f = new Folder(v);
	var d = new Dict;
		
	f.reset();
	while (!f.end) {
		if(f.extension == ".json"){
			post("  "+f.filename + "\n");
			d.import_json(f.filename);
			var keys = d.getkeys();
			blocktypes.set(keys,d.get(keys));
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
		return 20*Math.log(f);
	}else if(f<0){ //minus numbers invert the signal so i'm using this slightly nonstandard notation of -db to signify that.. sorry
		return -20*Math.log(-f);
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
	post("populated pitch lookup with default 12TET 440Hz\nthere are other tunings available!\n");
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

function transfer_input_lists(){
	// this routine also populates controller lists and keyboard input lists in all blocks in the db
	var k=blocktypes.getkeys();
	var t, mk;
	post("transferring controller and keyboard lists to blocks\n");
	if(io_dict.contains("controllers")){  //looks for blocks with a param called 'controller number' and populates the menu list with the current set of controllers
		for(t in k){
			var ps = blocktypes.getsize(k[t]+"::parameters");
			var pt;
			for(pt=0;pt<ps;pt++){
				if(blocktypes.get(k[t]+"::parameters["+pt+"]::name")=="controller number"){
					var cn = io_dict.get("controllers");
					var cnfk;
					mk = cn.getkeys();
					if(typeof mk == 'string'){
						mk= [mk];
					}
					for(cnfk in mk){
						blocktypes.replace(k[t]+"::parameters["+pt+"]::values["+cnfk+"]",mk[cnfk]);
					}
				}
			}
		}
	}
	if(blocktypes.contains("core.input.keyboard")){
		if(io_dict.contains("keyboards")){
			var cn = io_dict.getsize("keyboards");
			var cnfk;
			
			for(cnfk=0;cnfk<cn;cnfk++){
				blocktypes.replace("core.input.keyboard::parameters[1]::values["+cnfk+"]",io_dict.get("keyboards["+cnfk+"]"));
			}
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

function safepoke(buffer,channel,index,value){
	if(Array.isArray(value)){
		var ok=1;
		for(var i=value.length;i--;){
			ok &= (value[i] !== null);
		}
		if(ok){
			//deferred_diag.push("poke: "+channel+" - "+index+" - "+value);
			buffer.poke(channel,index,value);
		}else{
			post("\n\n\n\nWARNING UNSAFE ARRAY POKE ATTEMPTED:\nbuffer: ",buffer,"C,I,V",channel,index,value,"\n\n\n");
		}
	}else if(value !== null){
		buffer.poke(channel,index,value);
		//post("\npoke - "+channel+" - "+index+" - "+value);
	}else{
		post("\n\n\n\nWARNING UNSAFE POKE ATTEMPTED:\nbuffer: ",buffer,buffer.toString(), buffer.constructor.name, "C,I,V",channel,index,value,"\n\n\n");
	}
}

function size(width,height,scale){
	if(mainwindow_width!=width || mainwindow_height!=height){
		reinitialise_block_menu();
		post("main window : "+width+"x"+height+"px\n");
		blocks_tex_sent = [];
		//initialise_block_menu(-1);
		mainwindow_width = width;
		mainwindow_height = height;
		if((typeof scale == "number") && (scale>0)) scale_2d = scale;
		//click_matrix.dim= [width,height];
		lcd_main.message("dim",width,height);
		click_b_w=1; //work out the next power of two after the width, eg 640 --> 1024, use this for the click matrix row length for speed
		var t = 1;// << click_b_s;
		while(t<mainwindow_width){
			t*=2;
			click_b_w++;
		}
		fontheight = (mainwindow_height-24) / 18;
		sidebar.width = fontheight*8;
		sidebar.x = mainwindow_width-sidebar.width -9;
		sidebar.meters.startx = 9+1.1* fontheight;
		sidebar.meters.spread = 4;// * (MAX_USED_AUDIO_INPUTS+MAX_USED_AUDIO_OUTPUTS); //fontheight*3.5 / (MAX_USED_AUDIO_INPUTS+MAX_USED_AUDIO_OUTPUTS);
		get_hw_meter_positions();
		for(var number=0;number<draw_wave.length;number++){
			for(var i=0;i<waves_buffer[number].channelcount()*2;i++){
				draw_wave[number][i]=new Array(128);
				var t=0;
				while(t<128){
					draw_wave[number][i][t]=0;
					t++;
				} 
			}			
		}
		set_display_mode(displaymode,custom_block);
		redraw_flag.flag=12;
	}
}