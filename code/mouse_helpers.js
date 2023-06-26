function config_toggle_gain_display_format(ta,tb){
	if(config.get("gain_display_format") == "x"){
		config.replace("gain_display_format", "db");
	}else{
		config.replace("gain_display_format", "x");
	}
	redraw_flag.flag=4;
}

function play_button(){
	messnamed("play",1-playing);
}

function resync_button(){
	messnamed("resync","bang");
}

function panic_button(){
	var i;
	//post("TODO: panic");
	messnamed("panic","bang");
	build_mod_sum_action_list();
	sigouts.setvalue(0,0); //clears midi-audio sig~
	//for(i=0;i<param_error_lockup.length;i++) param_error_lockup[i]=0; //frees any voice panel lockups
}

function copy_block(){
	post("TODO: copy block");
}

function change_upsampling(b,u){ // send block, -1 to just set it for all voices.
	if(u>-1){
		blocks.replace("blocks["+b+"]::upsample",u);
	}else{
		if(blocks.contains("blocks["+b+"]::upsample")){
			u = blocks.get("blocks["+b+"]::upsample");
		}else{
			return -1;
		}
	}
	var vl = voicemap.get(b);
	if(!Array.isArray(vl)) vl = [vl];
	for(var i in vl){
		audio_upsamplelist[vl[i]-MAX_NOTE_VOICES] = u;
//		post("\n set upsampling of voice",vl[i] - MAX_NOTE_VOICES, "to",u);
	}
	hard_reload_block(b);
}

function multiselect_polychange(dir){
	if(dir>0){
		for(var se = 0;se<MAX_BLOCKS;se++){
			if(selected.block[se]){
				var max_p = blocktypes.get(blocks.get("blocks["+se+"]::name")+"::max_polyphony");
				if(max_p ==0) max_p=9999999999999;
				var current_p = blocks.get("blocks["+se+"]::poly::voices");
				if((max_p > current_p)&&(blocks.get("blocks["+se+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+se+"]::name")+"::plugin_name")))){
					voicecount(se, current_p + 1);
				}
			}
		}		
	}else{
		for(var se = 0;se<MAX_BLOCKS;se++){
			if(selected.block[se]){
				var current_p = blocks.get("blocks["+se+"]::poly::voices");
				if((current_p>1)&&(blocks.get("blocks["+se+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+se+"]::name")+"::plugin_name")))){
					voicecount(se, current_p - 1);
				}					
			}
		}		
	}
}

function hard_reload_block(b){
	var vl = voicemap.get(b);
	if(!Array.isArray(vl)) vl = [vl];
	for(var i in vl){
		if(vl[i]>=MAX_NOTE_VOICES){
			loaded_audio_patcherlist[vl[i]-MAX_NOTE_VOICES] = "reload";
		}else{
			loaded_note_patcherlist[vl[i]] = "reload";
		}
		post("\nreloading voice patcher "+vl[i]);
	}
	still_checking_polys = 3;
}

function open_patcher(block){
	post("opening patcher");
	var type = blocks.get("blocks["+block+"]::type");
	post(type);
	var voice;
	if(type=="note"){
		voice= /*note_*/voicemap.get(block);
		if(typeof voice!= "number") voice = voice[0];
		clear_blocks_selection();
		note_poly.setvalue( voice+1, "open");
	}else if(type=="audio"){
		voice= /*audio_*/voicemap.get(block);
		if(typeof voice!= "number") voice = voice[0];	
		voice = voice  - MAX_NOTE_VOICES;	
		clear_blocks_selection();
		audio_poly.setvalue( voice+1, "open");
	}
}

function swap_block_button(block){
	block_menu_d.swap_block_target = block;
	block_menu_d.mode = 1;
	set_display_mode("block_menu");
}

function insert_menu_button(cno){
	block_menu_d.mode = 2;
	block_menu_d.connection_number = cno;
	//needs to set blocks_page.new_block_click_pos to the average of the 2 block's [x,y,z] TODO
	set_display_mode("block_menu");
}

function clear_blocks_selection(){
	var t;
	for(t=0;t<selected.block.length;t++){
		selected.block[t]=0;
	}
	for(t=0;t<selected.wire.length;t++){
		selected.wire[t]=0;
	}
	selected.block_count = 0;
	selected.wire_count = 0;
	sidebar.editbtn=0;
	redraw_flag.flag=10;
	redraw_flag.targets = [];
	redraw_flag.targetcount = 0;
}

function select_all(){
	var t;
	post("\nselect all");
	selected.block_count = 0;
	for(t=0;t<MAX_BLOCKS;t++){
		if(blocks.contains("blocks["+t+"]::name")){
			selected.block_count++;
			selected.block[t]=1;
		} 
	}
	for(t=0;t<selected.wire.length;t++){
		selected.wire[t]=0;
	}
	selected.wire_count = 0;
	sidebar.editbtn=0;
	redraw_flag.flag=10;
	redraw_flag.targets = [];
	redraw_flag.targetcount = 0;	
}

function connection_select(parameter,value){
	var i;
	for(i=0;i<MAX_BLOCKS;i++){
		selected.block[i]=0;
	}
	for(i=0;i<connections.getsize();i++){
		selected.wire[i]=0;
	}
	selected.wire[value] = 1;
	selected.wire_count = 1;
	selected.block_count = 0;
	set_sidebar_mode("wire");
	block_and_wire_colours();
}

function select_block(parameter,value){
	if((selected.block[value]==1)&&(selected.block_count==1)&&(displaymode == "panels")&&(usermouse.timer>0)){
		if(blocktypes.get(blocks.get("blocks["+value+"]::name")+"::block_ui_patcher")!="blank.ui"){
			set_display_mode("custom",value);
			return(1);
		}
	}else{
		usermouse.timer = DOUBLE_CLICK_TIME;
		//post(selected.block[value],selected.block_count,displaymode,usermouse.timer);
		var i;
		for(i=0;i<MAX_BLOCKS;i++){
			selected.block[i]=0;
		}
		for(i=0;i<connections.getsize();i++){
			selected.wire[i]=0;
		}
		selected.block[value] = 1;
		sidebar.selected = value;
		selected.block_count = 1;
		selected.wire_count = 0;
		set_sidebar_mode("block");
		if(displaymode == "blocks") block_and_wire_colours();
	}
}
function panels_bg_click(){
	if(sidebar.mode != "none") clear_blocks_selection();
}
function panel_edit_button(parameter,value){
	post("panel edit",parameter,value);
	if(value=="up"){
		for(var i=1;i<panels_order.length;i++){
			if(panels_order[i]==parameter){
				panels_order[i] = panels_order[i-1];
				panels_order[i-1] = parameter;
			}
		}
	}else if(value=="down"){
		for(var i=panels_order.length-1;i>=0;i--){
			if(panels_order[i]==parameter){
				panels_order[i] = panels_order[i+1];
				panels_order[i+1] = parameter;
			}
		}
	}else if(value=="hide"){
		blocks.replace("blocks["+parameter+"]::panel::enable",0);
		panels_order.splice(panels_order.indexOf(parameter),1);
		//post("panels order is now",panels_order);
	}
	redraw_flag.flag=4;
}
function connection_menu_scroll(parameter,value){
	if(parameter=="from"){
		connection_menu.replace("from::viewoffset",Math.max(0,connection_menu.get("from::viewoffset")+value));
		redraw_flag.flag=4;
	}else if(parameter=="to"){
		connection_menu.replace("to::viewoffset",Math.max(0,connection_menu.get("to::viewoffset")+value));
		redraw_flag.flag=4;		
	}
}

function data_edit(parameter,value){
//	post("DATA EDIT!!\n",parameter,"or",parameter[0],parameter[1],value);
	if(value=="get"){
		return voice_data_buffer.peek(1,parameter);
	}else{
		voice_data_buffer.poke(1,parameter,Math.min(1,Math.max(0,value)))
		redraw_flag.flag |= 4;//?
	}
}

function select_folder(parameter,value){
	messnamed("select_folder","bang");
}

function remove_connection_btn(cno,value){
	if(value == danger_button){
		remove_connection(cno);
		danger_button = -1;
	}else{
		danger_button = value;
		redraw_flag.flag |= 2;
	}	
}

function remove_block_btn(block,value){
	if(value == danger_button){
		remove_block(block);
		danger_button = -1;
	}else{
		danger_button = value;
		redraw_flag.flag |= 2;
	}	
}
function clear_everything_btn(parameter,value){
	if(value == danger_button){
		clear_everything();
		danger_button = -1;
	}else{
		danger_button = value;
	}
}

function custom_mouse_passthrough(parameter,value){
	//post("\n\nCUSTOM MOUSE PASSTHROUGH",parameter,value,usermouse.x,usermouse.y);
	ui_poly.setvalue(parameter,"mouse",usermouse.x,usermouse.y,usermouse.left_button,usermouse.shift,usermouse.alt,usermouse.ctrl,value);
}

function scope_one_or_all(parameter,value){
	if(value=="get"){
		return sidebar.scopes.one_or_all
	}else{
		sidebar.scopes.one_or_all = 1 - sidebar.scopes.one_or_all;
	}
}
function scope_zoom(parameter,value){
	if(value=="get"){
		return sidebar.scopes.zoom;
	}else if(value=="click"){
		sidebar.scopes.voicenum = parameter;
		redraw_flag.flag |= 10;
	}else{
		sidebar.scopes.zoom = Math.min(Math.max(0,value),1);
		messnamed("scope_rate",60*Math.pow(2,sidebar.scopes.zoom*8));
	}
}
function scope_midinames(parameter,value){
	sidebar.scopes.midinames = 1 - sidebar.scopes.midinames;
	if(sidebar.scopes.midinames == 0){
		redraw_flag.flag |= 2;
	}
}

function sidebar_button(parameter, value){
	post("sidebar button param",parameter,"value",value,"\n");
}

function delete_state(state,block){
	//if block = -1 it deletes the whole state, if not it just removes that block from this state, if state=-1 it deletes that block from all states.
	if(state == -1){
		for(var si=0;si<MAX_STATES;si++){
			delete_state(si,block);
		}
	}else{
		if(block==-1){
			if(states.contains("states::"+state)){
				states.remove("states::"+state);
				if(states.contains("names::"+state)) states.remove("names::"+state);
			}
			if(sidebar.mode == "edit_state") set_sidebar_mode("none");
		}else{
			if(states.contains("states::"+state+"::"+block)){
				states.remove("states::"+state+"::"+block);
				post("removed block"+block+"from state"+state);
				var sz=0;
				for(var i=0;i<MAX_BLOCKS;i++) if(states.contains("states::"+state+"::"+i)) sz++;
				post(" found "+sz+"blocks still in this state");
				if(sz==0){
					post("so i'm deleting it");
					states.remove("states::"+state);
					if(states.contains("names::"+state)) states.remove("names::"+state);
				}
			}
			redraw_flag.flag |= 4;
		}
	}
}

function fire_block_state(state, block){
	if(usermouse.ctrl){
		sidebar.selected = state;
		set_sidebar_mode("edit_stete");
	}else{
		var pv=[];
		pv = states.get("states::"+state+"::"+block);
		var m=0;
		if(blocks.contains("blocks["+block+"]::mute")) m=blocks.get("blocks["+block+"]::mute");
		mute_particular_block(block,pv[0]);
		for(var i=1;i<pv.length;i++) parameter_value_buffer.poke(1, MAX_PARAMETERS*block+i-1, pv[i]);
		if(m!=pv[0]) redraw_flag.flag |= 8;
	}
}

function fire_whole_state_btn(state,value){
	if(usermouse.ctrl){
		sidebar.selected = state;
		set_sidebar_mode("edit_state");
	}else{
		fire_whole_state(state);
	}
}
function fire_whole_state(state, value){
	//post("\nfire whole state",state);
	var pv=[];
	if(state==-1) state="current";
	var stat = new Dict();
	stat = states.get("states::"+state);
	var sc_list = stat.getkeys();
	if(!Array.isArray(sc_list)) sc_list=[+sc_list];
	var mf=0;
	for(var i=0;i<sc_list.length;i++){
		var b = sc_list[i];
		pv = states.get("states::"+state+"::"+b);
		if(!is_empty(pv)){
			var m=0;
			if(blocks.contains("blocks["+b+"]::mute")) m=blocks.get("blocks["+b+"]::mute");
			if(m!=pv[0])mf=1;
			mute_particular_block(b,pv[0]);
			for(var t=1;t<pv.length;t++) parameter_value_buffer.poke(1, MAX_PARAMETERS*b+t-1, pv[t]);
		}
	}
	if(mf==1)redraw_flag.flag |= 8;
}

function blend_state(state, amount){ //this isn't suitable for xfading, it's for the states block really - it blends current value with state value (no way to wind back to starting point etc)
	var pv=[];
	if(state==-1) state="current";
	var stat = new Dict();
	stat = states.get("states::"+state);
	var sc_list = stat.getkeys();
	if(!Array.isArray(sc_list)) sc_list=[+sc_list];
	var mf=0;
	for(var i=0;i<sc_list.length;i++){
		var b = sc_list[i];
		pv = states.get("states::"+state+"::"+b);
		if(!is_empty(pv)){
			var m=0;
			if(blocks.contains("blocks["+b+"]::mute")) m=blocks.get("blocks["+b+"]::mute");
			if(m!=pv[0])mf=1;
			mute_particular_block(b,pv[0]);
			for(var t=1;t<pv.length;t++){
				var opv = parameter_value_buffer.peek(1, MAX_PARAMETERS*b+t-1);
				opv = opv * (128-amount) + pv[t] * amount;
				opv = opv>>7;
				parameter_value_buffer.poke(1, MAX_PARAMETERS*b+t-1, opv);
			} 
		}
	}
	if(mf==1)redraw_flag.flag |= 8;
}

function add_state(parameter,value){
	set_sidebar_mode("add_state");
}	

function add_to_state(parameter,block){ //if block==-1 all states, -2 all selected states
	if(usermouse.ctrl){
		delete_state(parameter,block);
	}else{
		if(block==-2){
			for(var i=0;i<MAX_BLOCKS;i++){
				if(selected.block[i]) add_to_state(parameter,i);
			}
		}else if(block==-1){
			for(var i=0;i<MAX_BLOCKS;i++){
				add_to_state(parameter,i);
			}
		}else{
			post("add param values to state number", parameter," block number",block);
			var block_name = blocks.get("blocks["+block+"]::name");
			var params = blocktypes.get(block_name+"::parameters");
			if(blocktypes.getsize(block_name+"::parameters")==1) params = [params];	
			var pv=new Array(params.length+1);
			pv[0] = 0;
			if(blocks.contains("blocks["+block+"]::mute")){
				pv[0]=blocks.get("blocks["+block+"]::mute");
			}
			for(var p=0;p<params.length;p++){
				pv[p+1] = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+p);
			}
			post("parameter array",pv);
			if(states.contains("states::"+parameter+"::"+block)) states.remove("states::"+parameter+"::"+block);
			if(pv.length) states.replace("states::"+parameter+"::"+block,pv);
			blocks.replace("blocks["+block+"]::panel::enable",1);
			set_sidebar_mode("block");
		}
	}
}	
	
function show_vst_editor(parameter,value){
	var vlist = /*audio_*/voicemap.get(value);
	if(typeof vlist == "number") vlist = [vlist];
	for(i=0;i<vlist.length;i++){
		audio_poly.setvalue( vlist[i]+1-MAX_NOTE_VOICES, "show_editor");
	}	
}
function toggle_panel(parameter,value){
	var e = blocks.get("blocks["+parameter+"]::panel::enable");
	if(e==1){
		e=0;
	}else{
		e=1;
	}
	blocks.replace("blocks["+parameter+"]::panel::enable",e);
	redraw_flag.flag |= 2;
}

function edit_label(parameter,value){
	if(parameter == "ok"){
		var block = selected.block.indexOf(1);
		if(block>-1){
			if(text_being_editted!=""){
				blocks.replace("blocks["+block+"]::label",text_being_editted);
/*				for(var i=0;i<4;i++){
					if(typeof blocks_label[block][i] != 'undefined') blocks_label[block][i].text("");
				}*/
				set_sidebar_mode("block");
				redraw_flag.flag |= 4;
			}	
		}		
	}
}
function edit_state_label(parameter,value){
	if(parameter == "ok"){
		var state = sidebar.selected;
		if(state>-1){
//			if(text_being_editted!=""){
				states.replace("names::"+state,text_being_editted);
				set_sidebar_mode("none");
				redraw_flag.flag |= 4;
//			}	
		}		
	}
}

function static_mod_adjust(parameter,value){
	//post("\nstatic mod adj",parameter[0],parameter[1],parameter[2],value,mouse_index);
	if(value=="get"){
		return parameter_static_mod.peek(1,parameter[2]);
	}else{
		//set value
		parameter_static_mod.poke(1,parameter[2],Math.max(-1,Math.min(1,value)));
		rebuild_action_list = 1;
		if(((sidebar.mode=="block")||(sidebar.mode=="add_state")||(sidebar.mode=="settings"))){// && (parameter[1]==sidebar.selected)){
			redraw_flag.flag|=1;
			redraw_flag.targets[parameter[0]]=2;
		}
		if((displaymode=="panels")&&(panelslider_visible[parameter[1]][parameter[0]])){
			redraw_flag.flag|=16;
			redraw_flag.paneltargets[panelslider_visible[parameter[1]][parameter[0]]-MAX_PARAMETERS]=1;
		}
		//if(displaymode=="custom") redraw_flag.flag=4;
		if(sidebar.selected==automap.mapped_c) note_poly.setvalue(automap.available_c,"refresh");
	}
}

function sidebar_parameter_knob(parameter, value){
	//post("\nP: ",parameter,"\nV:",value);
	// post("bufferpos",MAX_PARAMETERS*parameter[1]+parameter[0]);
	if(value=="get"){
		return parameter_value_buffer.peek(1, MAX_PARAMETERS*parameter[1]+parameter[0]);
	}else{
		//set value
		parameter_value_buffer.poke(1, MAX_PARAMETERS*parameter[1]+parameter[0],Math.max(0,Math.min(1,value)));
		if(((sidebar.mode=="block")||(sidebar.mode=="add_state")||(sidebar.mode=="settings")) && (parameter[1]==sidebar.selected)){
			redraw_flag.flag|=1;
			redraw_flag.targets[parameter[0]]=2;
		}
		if((displaymode=="panels")&&(panelslider_visible[parameter[1]][parameter[0]])){
			redraw_flag.flag|=16;
			redraw_flag.paneltargets[panelslider_visible[parameter[1]][parameter[0]]-MAX_PARAMETERS]=1;
		}
		//if(displaymode=="custom") redraw_flag.flag=4;
		if(sidebar.selected==automap.mapped_c) note_poly.setvalue(automap.available_c,"refresh");
	}
}

function move_selected_blocks(dx,dy){
	for(var i=MAX_BLOCKS;i--;){
		if(selected.block[i]){
			if(blocks.contains("blocks["+i+"]::space")){
				if(dx!=0){
					blocks.replace("blocks["+i+"]::space::x", blocks.get("blocks["+i+"]::space::x") + dx);
				}
				if(dy!=0){
					blocks.replace("blocks["+i+"]::space::y", blocks.get("blocks["+i+"]::space::y") + dy);
				}
				//draw_block(i);
			}
		}
	}
	draw_blocks();
}

function cycle_block_mode(block,setting){
	var target = "blocks["+block+"]::";
	var p;
	if(setting=="stack"){
		target = target+"poly::stack_mode";
		p = poly_alloc.stack_modes.indexOf(blocks.get(target));
		p = (p+1) % poly_alloc.stack_modes.length;
		blocks.replace(target,poly_alloc.stack_modes[p]);
		voicealloc_poly.setvalue((block+1),"stack_mode",p);  //1x
	}else if(setting=="choose"){
		target = target+"poly::choose_mode";
		p = poly_alloc.choose_modes.indexOf(blocks.get(target));
		p = (p+1) % poly_alloc.choose_modes.length;
		blocks.replace(target,poly_alloc.choose_modes[p]);
		voicealloc_poly.setvalue((block+1),"choose_mode",p); //cycle free
	}else if(setting=="steal"){
		target = target+"poly::steal_mode";
		p = poly_alloc.steal_modes.indexOf(blocks.get(target));
		p = (p+1) % poly_alloc.steal_modes.length;
		blocks.replace(target,poly_alloc.steal_modes[p]);
		voicealloc_poly.setvalue((block+1),"steal_mode",p);  //oldest
	}else if(setting=="flock"){
		target = target+"flock::mode";
		p = flock_modes.indexOf(blocks.get(target));
		p = (p+1) % flock_modes.length;
		blocks.replace(target,flock_modes[p]);
	}
	redraw_flag.flag |= 2;
}

function song_select_button(id){
	//post("\nsong select button",id);
	for(var i=0;i<MAX_BLOCKS;i++){
		selected.block[i]=0;
	}
	if(id=="current"){
		for(var i=0;i<song_select.current_blocks.length;i++){
			selected.block[song_select.current_blocks[i]]=1;
		}
	}else{
		for(var i=0;i<song_select.previous_blocks.length;i++){
			selected.block[song_select.previous_blocks[i]]=1;
		}
	}
	redraw_flag.flag = 8;
}

function mute_all_blocks(action){
	var i;
	var av=0;
	if(action == "mute") av = 1;
	if(action == "toggle") av = -1;
	for(i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::type")) mute_particular_block(i,av);
	}
	if(av!=-1) anymuted=av;
	redraw_flag.flag=10;
}

function mute_selected_block(action){
	//post("\n(un)muting selected block(s)",action);
	var i;
	for(i=0;i<MAX_BLOCKS;i++){
		if(selected.block[i]){
			mute_particular_block(i,action);
		}
	}
}
function bypass_selected_block(action){
	//post("\n(un)bypassing selected block(s)",action);
	var i;
	for(i=0;i<MAX_BLOCKS;i++){
		if(selected.block[i]){
			bypass_particular_block(i,action);
		}
	}
}

function bypass_particular_block(block,av){ // i=block, av=value, av=-1 means toggle
	// post("\nbypass particular",block,av);
	if(av==-1){
		av = 1 - blocks.get("blocks["+block+"]::bypass");
	}
//	if(av==1) anymuted=1; //does bypass count as mute? do we want unmute all to unbypass all?
	blocks.replace("blocks["+block+"]::bypass",av);
	if(blocks.get("blocks["+block+"]::type")=="audio"){
		list = voicemap.get(block);
		if(typeof list === 'number'){
			audio_poly.setvalue( list+1-MAX_NOTE_VOICES, "bypass",av);
		}else{
			for(var t=0;t<list.length;t++){
				audio_poly.setvalue( list[t]+1-MAX_NOTE_VOICES, "bypass",av);
			}					
		}
	}else{
		list = voicemap.get(block);
		if(list === null){
			post("\n\nERROR: couldn't find block "+block+" in the voicemap list\n\n");
		}else if(typeof list === 'number'){
			note_poly.setvalue( list+1, "bypass",av);
		}else{
			for(var t=0;t<list.length;t++){
				note_poly.setvalue( list[t]+1, "bypass",av);
			}					
		}
	}
	redraw_flag.flag=8;
}

function mute_particular_block(block,av){ // i=block, av=value, av=-1 means toggle
	if(av==-1){
		av = 1 - blocks.get("blocks["+block+"]::mute");
	}
	if(av==1) anymuted =1;
	blocks.replace("blocks["+block+"]::mute",av);
	if(blocks.get("blocks["+block+"]::type")=="audio"){
		list = voicemap.get(block);
		if(typeof list === 'number'){
			audio_poly.setvalue( list+1-MAX_NOTE_VOICES, "muteouts",av);
		}else{
			for(var t=0;t<list.length;t++){
				audio_poly.setvalue( list[t]+1-MAX_NOTE_VOICES, "muteouts",av);
			}					
		}
	}else{
		list = voicemap.get(block);
		if(list === null){
			post("\n\nERROR: couldn't find block "+block+" in the voicemap list\n\n");
		}else if(typeof list === 'number'){
			note_poly.setvalue( list+1, "muteouts",av);
		}else{
			for(var t=0;t<list.length;t++){
				note_poly.setvalue( list[t]+1, "muteouts",av);
			}					
		}
	}
	if(usermouse.shift && (av==0)){ //this could lose the av term, but big auto mute chains seems a bad idea.
		//recursion time! if shift is down scan through everything connected after the block and apply the same mute status
		for(var t=0;t<connections.getsize("connections");t++){
			if(connections.contains("connections["+t+"]::from") && (connections.get("connections["+t+"]::from::number") == block)){
				var b = connections.get("connections["+t+"]::to::number");
				if(blocks.get("blocks["+b+"]::mute")!=0){
					post("recursion!");
					recursions++;
					if(recursions>1000){
						usermouse.shift = 0;
						redraw_flag.flag=4;
						post("\n\n\nemergency exitting infinite-looking recursion loop. how did that happen? you should file a bug report\n\n\n")
						return(0);
					}else{
						mute_particular_block(b,0);
					}
				}
			}
		}
	}	
	redraw_flag.flag=10;
}


function process_drag_selection(){
	var sts = connections_sketch.screentoworld(usermouse.drag.starting_x,usermouse.drag.starting_y);
	var stw = connections_sketch.screentoworld(usermouse.x,usermouse.y);
	if(sts[0]>stw[0]){
		var ttt = sts[0];
		sts[0] = stw[0];
		stw[0] = ttt;
	}
	if(sts[1]>stw[1]){
		var ttt = sts[1];
		sts[1] = stw[1];
		stw[1] = ttt;
	}
	var bx=-9999;
	for(var bb=0;bb<MAX_BLOCKS;bb++){
		if(blocks.contains("blocks["+bb+"]::space")){
			bx=blocks.get("blocks["+bb+"]::space::x");
			if((bx>=sts[0])&&(bx<stw[0])){
				bx=blocks.get("blocks["+bb+"]::space::y");
				if((bx>=sts[1])&&(bx<stw[1])){
					selected.block[bb]=1;
				}
			}
		}
	}
}
function connection_edit(parameter,value){
	if(value=="get"){
		return connections.get(parameter);
	}else{
		var pn=parameter.split("::");
		if(pn[2]=="scale"){
			connections.replace(parameter,value);
		}else{
			connections.replace(parameter,Math.min(1,Math.max(0,value)));
		}

		var pm=parameter.split("[");
		pm=pm[1].split("]");
		//pm[0] holds the connection number
		make_connection(pm[0]);
		if(pn[2]=="mute"){
			draw_wire(pm[0]);
			redraw_flag.flag |= 8;
		}
		sidebar.lastmode="recalculate";
		redraw_flag.flag|=2;
	}
}

function panel_assign_click(parameter,value){
	var fplist = [];
	if(blocks.contains("blocks["+parameter[0]+"]::panel::parameters")){
		fplist = blocks.get("blocks["+parameter[0]+"]::panel::parameters");
		if(typeof fplist=="number") fplist = [fplist];
		if(fplist=="") fplist=[];
	}else{
		fplist = [];
	}
	post("existing list",fplist);
	var t;
	var match=fplist.indexOf(parameter[1]);
	if(match==-1){
		fplist[fplist.length] = parameter[1];
		blocks.replace("blocks["+parameter[0]+"]::panel::enable",1);
		blocks.replace("blocks["+parameter[0]+"]::panel::parameters",fplist);	
	}else{
		if(fplist.length==1){
			fplist=[];
			blocks.remove("blocks["+parameter[0]+"]::panel::parameters");
		}else{
			for(t=match;t<fplist.length-1;t++){
				fplist[t]=fplist[t+1];
			}
			fplist=fplist.slice(0,-1);
			blocks.replace("blocks["+parameter[0]+"]::panel::parameters",fplist);
		}
	}
	if(fplist!=[]) 
	redraw_flag.flag=4;	
}

function set_flock_preset(parameter,value){
	var preset = flock_presets.get(parameter);
	blocks.replace("blocks["+value+"]::flock::weight", preset[0]);
	blocks.replace("blocks["+value+"]::flock::tension", preset[1]);
	blocks.replace("blocks["+value+"]::flock::friction", preset[2]);
	blocks.replace("blocks["+value+"]::flock::bounce", preset[3]);
	blocks.replace("blocks["+value+"]::flock::attrep", preset[4]);
	blocks.replace("blocks["+value+"]::flock::align", preset[5]);
	blocks.replace("blocks["+value+"]::flock::twist", preset[6]);
	blocks.replace("blocks["+value+"]::flock::brownian", preset[7]);
	rebuild_action_list = 1;
	set_sidebar_mode("settings");
}

function flock_click(parameter,value){
//	post("assigning block",parameter[0],"parameter number",parameter[1],"to the next avail flock axis");
	var fplist = [];
	if(blocks.contains("blocks["+parameter[0]+"]::flock::parameters")){
		fplist = blocks.get("blocks["+parameter[0]+"]::flock::parameters");
		if(fplist=="")fplist=[-1,-1,-1];
	}else{
		fplist = [-1,-1,-1];
	}
	var t;
	var match=fplist.indexOf(parameter[1]);
	if(match==-1){
		if(fplist.indexOf(-1)>-1){
			t= fplist.indexOf(-1);
			fplist[t] = parameter[1];
		}else{
			post("didn't assign because all axes are already assigned");
		}
	}else{
		if(match==2){
		}else if(fplist[(match+1)%3]==-1){
			fplist[(match+1)%3]=parameter[1];
		}else if(fplist[(match+2)%3]==-1){
			fplist[(match+2)%3]=parameter[1];
		}
		fplist[match]=-1;
	}
	blocks.replace("blocks["+parameter[0]+"]::flock::parameters",fplist);
	// now needs to get voicelist for the block, then store 'is_flocked' for these (up to) 3 params
	flock_add_to_array(parameter[0],fplist[0],fplist[1],fplist[2]);
	redraw_flag.flag=4;
}

function flock_add_to_array(block,x,y,z){
	//var type = blocks.get("blocks["+block+"]::type");
	voicelist=voicemap.get(block);
	if(typeof voicelist == "number") voicelist = [voicelist];
	var i,t;
	for(i=0;i<voicelist.length;i++){
		for(t=0;t<MAX_PARAMETERS;t++) is_flocked[MAX_PARAMETERS*(voicelist[i])+t]=0; //disable all then:
		if(x!=-1){
			is_flocked[MAX_PARAMETERS*(voicelist[i])+x]=3*(voicelist[i])+1; // these start at 1 so we can test against nonzero, but flock_id starts at 0 so when you read this out in the flocking bit you -1 it.
//			post("set is flocked[",MAX_PARAMETERS*voicelist[i]+x,"] to ",3*voicelist[i]+1);
			flock_buffer.poke(3, 3*(voicelist[i]), 0);//speed
			flock_buffer.poke(4, 3*(voicelist[i]), parameter_value_buffer.peek(1,MAX_PARAMETERS*block+x)); //position
			flockblocklist[voicelist[i]] = block;
			flockvoicelist[voicelist[i]] = i;
		}else{
			flock_buffer.poke(3, 3*voicelist[i], 0);//speed
			flock_buffer.poke(4, 3*voicelist[i], 0); //position
		}
		if(y!=-1){ 
			is_flocked[MAX_PARAMETERS*(voicelist[i])+y]=3*(voicelist[i])+2;
			flock_buffer.poke(3, 3*voicelist[i]+1, 0);//speed
			flock_buffer.poke(4, 3*voicelist[i]+1, parameter_value_buffer.peek(1,MAX_PARAMETERS*block+y)); //position
			flockblocklist[voicelist[i]] = block;
			flockvoicelist[voicelist[i]] = i;
		}else{
			flock_buffer.poke(3, 3*voicelist[i]+1, 0);//speed
			flock_buffer.poke(4, 3*voicelist[i]+1, 0);//position
		}
		if(z!=-1){
			is_flocked[MAX_PARAMETERS*(voicelist[i])+z]=3*(voicelist[i])+3;
			flock_buffer.poke(3, 3*voicelist[i]+2, 0);//speed
			flock_buffer.poke(4, 3*voicelist[i]+2, parameter_value_buffer.peek(1,MAX_PARAMETERS*block+z)); //position
			flockblocklist[voicelist[i]] = block;
			flockvoicelist[voicelist[i]] = i;
		}else{
			flock_buffer.poke(3, 3*voicelist[i]+2, 0);//speed
			flock_buffer.poke(4, 3*voicelist[i]+2, 0);//position
		}
	}
	build_mod_sum_action_list();
}

function hw_meter_click(number,type){
	post("\n you clicked a meter, type:",type,"number",number);
	sidebar.scopes.voice = number;
	for(var i =0;i<MAX_BLOCKS;i++){
		selected.block[i]=0;
		selected.wire[i]=0;
	}
	if(type == "in"){
		set_sidebar_mode("input_scope");
	}else if(type == "out"){
		set_sidebar_mode("output_scope");
	}
}

function block_edit(parameter,value){
	if(value=="get"){
		return blocks.get(parameter);
	}else{
		var pt=parameter.split("::");
		if(pt[2]=="spread"){
			var pn=parameter.split("[");
			pn=pn[1].split("]");//pn[0] holds blockno now
			var block_name = blocks.get("blocks["+pn[0]+"]::name");
			var no_params = blocktypes.getsize(block_name+"::parameters");
			var list = voicemap.get(pn[0]);
			var sprd = blocks.get("blocks["+pn[0]+"]::error::spread");
			var mult;
			sprd = sprd*sprd*sprd*sprd;
			if(typeof list == "number") list = [list];
			for(var l=0;l<list.length;l++){
				mulberryseed = cyrb128("b"+block_name+l+"s"+sprd);
				for(var i=0;i<no_params;i++){
					mult = 1;
					if(blocktypes.contains(block_name+"::parameters["+i+"]::error_scale")){
						mult = blocktypes.get(block_name+"::parameters["+i+"]::error_scale");
					}
//					param_error_spread[list[l]][i]=(Math.random()-0.5)*sprd*mult;
					parameter_error_spread_buffer.poke(1, MAX_PARAMETERS*list[l]+i,(mulberry32()-0.5)*sprd*mult);
				}			
			}
		}else if(pt[2]=="drift"){
			var pn=parameter.split("[");
			pn=pn[1].split("]");//pn[0] holds blockno now
			var block_name = blocks.get("blocks["+pn[0]+"]::name");
			var no_params = blocktypes.getsize(block_name+"::parameters");
			var list = voicemap.get(pn[0]);
			var sprd = blocks.get("blocks["+pn[0]+"]::error::spread");
			var drft = blocks.get("blocks["+pn[0]+"]::error::drift");
			drft = drft*drft*drft*drft;
			var mult;
			sprd = sprd*sprd*sprd*sprd;
			if(typeof list == "number") list = [list];
			for(var i=0;i<no_params;i++){
				mult = 1;
				if(blocktypes.contains(block_name+"::parameters["+i+"]::error_scale")){
					mult = blocktypes.get(block_name+"::parameters["+i+"]::error_scale");
				}
				for(var l=0;l<list.length;l++){
					param_error_drift[list[l]][i]=0.01*drft*sprd*mult;
				}			
			}	
		}
		blocks.replace(parameter,Math.min(1,Math.max(0,value)));
		if(pt[1]=="flock") rebuild_action_list = 1;
		redraw_flag.flag=2;
	}
}

function automap_default(a,b){
	if(sidebar.selected != -1){
		parameter_value_buffer.poke(1,a,param_defaults[sidebar.selected][a-MAX_PARAMETERS*sidebar.selected]);
		note_poly.setvalue(b,"refresh");
	}
}

function setup_new_connection(parameter,value){
	if(value=="get"){
		return new_connection.get(parameter);
	}else{
		var pn=parameter.split("::");
		if(pn[1]=="scale"){
			new_connection.replace(parameter,value); //Math.max(0,Math.min(1,value)));
		}else{
			new_connection.replace(parameter,Math.max(0,Math.min(1,value)));
		}
		redraw_flag.flag = 4;
	}
}

function new_connection_select_output(type,number){
	new_connection.replace("from::output::number",number);
	new_connection.replace("from::output::type",type);
//	if(type=="audio") {
//		new_connection.replace("conversion::offset", 1);
//	}
	redraw_flag.flag = 4;
}

function new_connection_select_input(type,number){
	var ot=-99,on=-99;
	if(new_connection.contains("to::input::type"))ot = new_connection.get("to::input::type");
	if(new_connection.contains("to::input::number"))on = new_connection.get("to::input::number");
	new_connection.replace("to::input::number",number);
	new_connection.replace("to::input::type",type);
	if((ot!=type)||(on!=number)){
		if((type=="midi")||(type=="block")){
			new_connection.replace("conversion::offset", 0.5);
			new_connection.replace("conversion::offset2", 0.5);
		}else if(type =="parameters"){
			new_connection.replace("conversion::offset", 0.5);
			new_connection.replace("conversion::offset2", 0.5);
		}else if(type =="audio"){
			new_connection.replace("conversion::offset", 0.5);
			new_connection.replace("conversion::offset2", 0.5);
		}	
	}
	redraw_flag.flag = 4;
}

function new_connection_toggle_voice(side,number){
	post("voicetoggle "+number+" \n");
	if(number=="all"){
		var b = [];
		b[0] = "all";
		new_connection.replace(side+"::voice",b);
	}else{
		if(new_connection.gettype(side+"::voice")=="array"){
			post("is array\n");
			var a=[];
			var b=[];
			a = new_connection.get(side+"::voice");
			var i;
			var t=0;
			var found=0;
			for(i=0;i<a.length;i++){
				post("testing list pos "+i+" value "+a[i]+"\n");
				if(a[i]!=number){
					b[t]=a[i];
					t++;
				}else{
					found=1;
					post("removed "+number+" from array \n");
				}
			}
			if(found==0) {
				b[t]=number;
				post("adding to array "+b+"\n");
			}
			new_connection.replace(side+"::voice",b);
		}else{
			var a;
			var b = [];
			a = new_connection.get(side+"::voice");
			if(a==number){
				b[0] = "all";
				post("setting to all\n"+b+"\n");
			}else{
				if(a=="all"){
					b[0] = number;
				}else{
					b[0] = a;
					b[1] = number;
				}
				post("setting to "+b+"\n");
			}
			new_connection.replace(side+"::voice",b);
		}	
	}
	redraw_flag.flag = 4;
}



function select_song(song){
	currentsong = song;
	redraw_flag.flag|=2;
}

function wave_chosen(number,name,path){
	var t = polybuffer_load_wave(path,name);
	if(t==-1){
		t = waves_polybuffer.count;
	}else{
		t++;
	}
	buffer_loaded(number,path,name,"waves."+t);
}

function load_wave(parameter,value){
	post("loading a wave file into buffer slot",parameter);
	waves.selected = parameter;
	messnamed("choose_and_read_wave",parameter);
	//waves_buffer[parameters].replace;
}

function setup_waves(parameter,value){
	if(value=="get"){
		return waves_dict.get("waves["+parameter[0]+"]::"+parameter[1]);
	}else{
		waves_dict.replace("waves["+parameter[0]+"]::"+parameter[1],Math.max(0,Math.min(1,value)));
		store_wave_slices(parameter[0]);
		messnamed("wave_updated",parameter[0]);
		redraw_flag.flag = 4;
	}
}
function store_wave_slices(waveno){
	var d = Math.floor(waves_dict.get("waves["+waveno+"]::divisions")*127.999)+1;
	if(d>0){
		var l = waves_dict.get("waves["+waveno+"]::length");
		var s = l * waves_dict.get("waves["+waveno+"]::start");
		var e = l * waves_dict.get("waves["+waveno+"]::end");
		var m = (e-s) / d;
		var i;
		var o = (waveno - 1) * MAX_WAVES_SLICES;
		for(i=0;i<d;i++){
			waves_slices_buffer.poke(1, o+i, i*m+s);
		}
		post("writing slices to buffer",waveno,/*o,*/l,s,e,d,m,"\n");
	}
}

function zoom_waves(parameter,value){
	post("zoom wavse TODO",parameter,value);
	if(value=="get"){
		return 0;//waves.zoom_start;
	}else{
		var w = waves.zoom_end- waves.zoom_start;
		waves.zoom_start += w*value;
		waves.zoom_end -= w*value;
		redraw_flag.flag |= 4;
	}
	
}

function wave_stripe_click(parameter,value){
	post("stripe click",parameter,value);
	waves.selected = parameter;
	redraw_flag.flag = 4;
}

function delete_wave(parameter,value){
	post("\n\n\n\ndeleting slot number",parameter)
	var t=parameter+1;
	waves_dict.setparse("waves["+t+"]","{}");
	waves.selected = -1;
	messnamed("waves_buffers",parameter,"clearlow");
	redraw_flag.flag = 4;
}