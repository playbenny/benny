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

function play_button_click(){
	if(playing == 0){
		messnamed("play",1);
		playflag = 1;
	}else{playflag = 0;}
}

function play_button_release(){
	if((!playflag)&playing){
		messnamed("play",0);
	}
	playflag = 0;
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
function count_selected_blocks_and_wires(){
	selected.block_count =0;
	selected.wire_count = 0;
	for(i=0;i<selected.block.length;i++){
		selected.block_count += selected.block[i];
	}
	for(i=0;i<selected.wire.length;i++){
		selected.wire_count += selected.wire[i];
	}
}
function blocks_paste(outside_connections){
//paste. should be clever - 
// - if blocks are selected
//   - are any the same type? paste in all parameters
//   - is it just one? and is just one copied? swap it in
// if not, paste in the blocks in the clipboard and their connections as new blocks
// outside connections = 1 if it should also paste connections from outside the copied blocks
	if(copy.contains("blocks")){
		count_selected_blocks_and_wires();
		var td = copy.get("blocks");
		var copied_blocks = td.getkeys();
		if(!Array.isArray(copied_blocks)) copied_blocks = [copied_blocks];
		var copied_type = td.get(copied_blocks[0]+"::name");
		var same = 0;
		if((selected.block_count==1) && (copied_blocks.length==1) && (!outside_connections)){
			//maybe the copied block is the same as the selected block, check
			same = 1;
			var selb = selected.block.indexOf(1);
			if(copied_type != blocks.get("blocks["+selb+"]::name")){
				same = 0;
			}else{
				//compare params!
				var vals = copy.get("block_params::"+copied_blocks[0]);
				var v2 = parameter_value_buffer.peek(1,selb*MAX_PARAMETERS,vals.length);
				for(var pc=0;pc<vals.length;pc++){
					if(v2[pc]!=vals[pc]) same = 0;
				}
				// i can't be bothered to compare settings who is ever going to do that
			}
		}
		if((same==0)&&(selected.block_count>0)&&(copied_blocks.length == 1)&&(!outside_connections)){
			//you could run through blocks in clipboard, but it'd get confusing
			//so restricted to one.
			//get type, first see if the block selected is the same as the copied one,
			//if so, deselect, paste new copy. if not: see if any selected blocks are same type
			//paste values (and opvs?) and all the keys from blocks dict too (inc voicecount)
			for(var i=0; i<selected.block.length;i++){
				if(selected.block[i]){
					var ty = blocks.get("blocks["+i+"]::name");
					if(ty!=copied_type){
						//then swap the selected block to this type, then copy settings params etc
						//should this be only if just one selected??
						block_menu_d.swap_block_target = i;
						swap_block(copied_type);
					}
					//copy params
					var vals = copy.get("block_params::"+copied_blocks[0]);
					parameter_value_buffer.poke(1,i*MAX_PARAMETERS,vals);
					//copy block settings
					var tdd = td.get(copied_blocks[0]+"::poly");
					var tkeys = tdd.getkeys();
					for(var t=0;t<tkeys.length;t++){
						if(tkeys[t]!="voices"){
							blocks.replace("blocks["+i+"]::poly::"+tkeys[t],tdd.get(tkeys[t]));
						}else{
							voicecount(i,tdd.get("voices"));
						}
					}
					draw_block(i);
					tdd = td.get(copied_blocks[0]+"::panel");
					tkeys = tdd.getkeys();
					if(td.getsize(copied_blocks[0]+"::panel")==1) tkeys = [tkeys];
					for(var t=0;t<tkeys.length;t++){
						blocks.replace("blocks["+i+"]::panel::"+tkeys[t],tdd.get(tkeys[t]));
					}
					tdd = td.get(copied_blocks[0]+"::error");
					tkeys = tdd.getkeys();
					for(var t=0;t<tkeys.length;t++){
						blocks.replace("blocks["+i+"]::error::"+tkeys[t],tdd.get(tkeys[t]));
					}
					tdd = td.get(copied_blocks[0]+"::flock");
					tkeys = tdd.getkeys();
					for(var t=0;t<tkeys.length;t++){
						blocks.replace("blocks["+i+"]::flock::"+tkeys[t],tdd.get(tkeys[t]));
					}
					if(copy.contains("block_data::"+copied_blocks[0])){
						var vl = voicemap.get(i);
						if(!Array.isArray(vl)) vl=[vl];
						for(var t=0;t<vl.length;t++){
							var vals = copy.get("block_data::"+copied_blocks[0]+"::"+t);
							voice_data_buffer.poke(1,MAX_DATA*vl[t],vals);
						}
					}
						//set redraw
				}
			}
		}else{
			clear_blocks_selection();
			var new_blocks_indexes=[];
			var paste_mapping = [];
			for(var i=0;i<MAX_BLOCKS;i++) paste_mapping[i]=-1;
			for(var b=0;b<copied_blocks.length;b++){
				var name = copy.get("blocks::"+copied_blocks[b]+"::name");
				var excl = blocktypes.contains(name+"::exclusive");
				if(excl){
					for(i=0;i<MAX_BLOCKS;i++){
						if(blocks.get("blocks["+i+"]::name") == name){
							excl=2;
							i=MAX_BLOCKS;
						}
					}
				}
				var new_block_index;
				if(excl==2){
					post("\ncan't paste this block, it's exclusive, only one instance is allowed.");
					new_block_index = -1;
				}else{
					pasteoffset[0] += 2;
					pasteoffset[1] -= 0.25;
					var px = td.get(copied_blocks[b]+"::space::x")+pasteoffset[0];
					var py = td.get(copied_blocks[b]+"::space::y")+pasteoffset[1];
					new_block_index = new_block(name,px,py);
				}
				if(new_block_index==-1){
					if(excl!=2)post("\nerror pasting, "+name+" not found");
				}else{
					new_blocks_indexes.push(new_block_index);
					paste_mapping[copied_blocks[b]] = new_block_index;
					//ok you've made the right type of block, but all its settings and parameters are defaults
					//you could integrate pasting into new block but i don't really like the sound of that? paste is never mission-critical like new block is
					//ok can i iterate through the keys in the copy buffer to make this futureproof rather than doing them specifically?
					//sort of, nested ones sound like a headache so i'll go through them one by one
					//and poly requires voicecount calling so that's special. 
					//poly/panel/error/flock/(space)
					var vals = copy.get("block_params::"+copied_blocks[b]);
					parameter_value_buffer.poke(1,new_block_index*MAX_PARAMETERS,vals);
					var tdd = td.get(copied_blocks[b]+"::poly");
					var tkeys = tdd.getkeys();
					for(var t=0;t<tkeys.length;t++){
						if(tkeys[t]!="voices"){
							blocks.replace("blocks["+new_block_index+"]::poly::"+tkeys[t],tdd.get(tkeys[t]));
						}else{
							voicecount(new_block_index,tdd.get("voices"));
						}
					}
					blocks.replace("blocks["+new_block_index+"]::space::colour",copy.get("blocks::"+copied_blocks[b]+"::space::colour"));
					if(copy.contains("blocks::"+copied_blocks[b]+"::upsample")) blocks.replace("blocks["+new_block_index+"]::upsample",copy.get("blocks::"+copied_blocks[b]+"::upsample"));
					if(copy.contains("blocks::"+copied_blocks[b]+"::subvoices")) blocks.replace("blocks["+new_block_index+"]::subvoices",copy.get("blocks::"+copied_blocks[b]+"::subvoices"));
					if(copy.contains("blocks::"+copied_blocks[b]+"::mute")) blocks.replace("blocks["+new_block_index+"]::mute",copy.get("blocks::"+copied_blocks[b]+"::mute"));
					if(copy.contains("blocks::"+copied_blocks[b]+"::bypass")) blocks.replace("blocks["+new_block_index+"]::bypass",copy.get("blocks::"+copied_blocks[b]+"::bypass"));
					
					draw_block(new_block_index);
					tdd = td.get(copied_blocks[b]+"::panel");
					tkeys = tdd.getkeys();
					if(td.getsize(copied_blocks[b]+"::panel")==1) tkeys = [tkeys];
					for(var t=0;t<tkeys.length;t++){
						blocks.replace("blocks["+new_block_index+"]::panel::"+tkeys[t],tdd.get(tkeys[t]));
					}
					tdd = td.get(copied_blocks[b]+"::error");
					tkeys = tdd.getkeys();
					for(var t=0;t<tkeys.length;t++){
						blocks.replace("blocks["+new_block_index+"]::error::"+tkeys[t],tdd.get(tkeys[t]));
					}
					tdd = td.get(copied_blocks[b]+"::flock");
					tkeys = tdd.getkeys();
					for(var t=0;t<tkeys.length;t++){
						blocks.replace("blocks["+new_block_index+"]::flock::"+tkeys[t],tdd.get(tkeys[t]));
					}
					var vl = voicemap.get(new_block_index);
					if(!Array.isArray(vl)) vl=[vl];
					if(copy.contains("block_data::"+copied_blocks[b])){
						for(var t=0;t<vl.length;t++){
							var vals = copy.get("block_data::"+copied_blocks[b]+"::"+t);
							safepoke(voice_data_buffer, 1,MAX_DATA*vl[t],vals);
						}
					}
					if(copy.contains("parameter_static_mod::"+copied_blocks[b])){
						for(var t=0;t<vl.length;t++){
							if(copy.contains("parameter_static_mod::"+copied_blocks[b]+"::"+t)){
								post("pasting static mod ",t,vl[t]);
								var vals = copy.get("parameter_static_mod::"+copied_blocks[b]+"::"+t);
								safepoke(parameter_static_mod,1,MAX_PARAMETERS*vl[t],vals);
							}
						}
					}
					selected.block[new_block_index] = 1;
				}				
			}
			if(copy.contains("states")){
				var tds = copy.get("states");
				var tk = tds.getkeys();
				if(tk!=null){
					for(var t=0;t<tk.length;t++){
						
						var tdsb = copy.get("states::"+tk[t]);
						if(tdsb!=null){
							var tkb = tdsb.getkeys();
							var stat=0;
							for(var tt=0;tt<tkb.length;tt++){
								if(tkb[tt]=="static_mod"){
									stat=1;
								}else{
									if(paste_mapping[+tkb[tt]]!=-1){
										states.replace("states::"+tk[t]+"::"+paste_mapping[+tkb[tt]],copy.get("states::"+tk[t]+"::"+tkb[tt]));
									}
								}
							}
							if(stat){
								tdsb = copy.get("states::"+tk[t]+"::static_mod");
								if(tdsb!=null){
									tkb = tdsb.getkeys();
									for(var tt=0;tt<tkb.length;tt++){
										if(paste_mapping[+tkb[tt]]!=-1){
											states.replace("states::"+tk[t]+"::static_mod::"+paste_mapping[+tkb[tt]],copy.get("states::"+tk[t]+"::static_mod::"+tkb[tt]));
										}
									}
								}										
							}
						}
					}
				}
			}
			//todo: opv values
			// connections between selected blocks (these aren't copied yet)
			var tdc = copy.get("connections");
			var tk = tdc.getkeys();
			if(Array.isArray(tk)){
				for(var t=0;t<tk.length;t++){
					new_connection = copy.get("connections::"+t);
					var pfrom = paste_mapping[+new_connection.get("from::number")];
					var pto = paste_mapping[+new_connection.get("to::number")];
					if(pfrom != -1) new_connection.replace("from::number",pfrom);
					if(pto != -1) new_connection.replace("to::number",pto);
					if(((pfrom==-1)||(pto==-1))&&(outside_connections != 1)){
						//do nothing - this connection is outside
					}else{
						connections.append("connections",new_connection);
						var co = connections.getsize("connections")-1;
						make_connection(co);
						new_connection.clear();		
						selected.wire[co]=1;
						//draw_wire(co);	//better to draw the wires as you go than risk a cpu spike from trying to do them all at once later
					}
				}				
			}
		}
	}
}

function copy_block(block){
	//block itself 
	pasteoffset = [0,0];
	var tb = blocks.get("blocks["+block+"]");
	copy.setparse("blocks::"+block,"{}");
	copy.replace("blocks::"+block,tb);
	copy.setparse("block_params::"+block,"{}");
	var name=tb.get("name");
	var paramcount = blocktypes.getsize(name+"::parameters");
	var vals = parameter_value_buffer.peek(1, block*MAX_PARAMETERS, paramcount);
	copy.replace("block_params::"+block,vals);
	var vl=voicemap.get(block);
	if(!Array.isArray(vl)) vl = [vl];
	if(blocktypes.contains(name+"::voice_data")){//even just an empty key in the block json is enough to tell it to copy data with the block
		copy.setparse("block_data::"+block,"{}");
		for(var i=0;i<vl.length;i++){
			copy.setparse("block_data::"+block+"::"+i,"{}");
			vals = voice_data_buffer.peek(1, vl[i]*MAX_DATA, MAX_DATA);
			copy.replace("block_data::"+block+"::"+i,vals);
		}
	}
	//var type = blocktypes.get(name+"::type");
	for(var i=0;i<vl.length;i++){
		//var voiceoffset = vl[i] + MAX_NOTE_VOICES*(type == "audio") + (MAX_NOTE_VOICES+MAX_AUDIO_VOICES)*(type == "hardware");
		var psm = parameter_static_mod.peek(1,MAX_PARAMETERS*vl[i],paramcount);
		var c=0;
		for(var t=0;t<paramcount;t++) c|=(psm[t]!=0);
		if(c){
			if(!copy.contains("parameter_static_mod::"+block)) copy.setparse("parameter_static_mod::"+block,"{}");			
			copy.setparse("parameter_static_mod::"+block+"::"+i,"{}");
			copy.replace("parameter_static_mod::"+block+"::"+i,psm);
		}
	
	}
}

function copy_selection(){
	var i;
	copy.setparse("blocks","{ }");
	copy.setparse("block_params","{}");
	copy.setparse("block_data","{}");
	copy.setparse("parameter_static_mod","{}");
	for(i=0;i<selected.block.length;i++){
		if(selected.block[i]){
			copy_block(i);
		}
	}
	copy.setparse("connections","{}");
	var csize = connections.getsize("connections");
	var c_ext=0;
	for(i=0;i<csize;i++){
		if(connections.contains("connections["+i+"]::from::number")){
			var cfrom = connections.get("connections["+i+"]::from::number");
			var cto = connections.get("connections["+i+"]::to::number");
			if(selected.block[+cfrom] || selected.block[+cto]){
				if(!(selected.block[+cfrom] && selected.block[+cto])) c_ext=1;
				copy.setparse("connections::"+i,"{}");
				copy.replace("connections::"+i,connections.get("connections["+i+"]"));
			}
		}
	}
	copy.setparse("external_connections",c_ext);
	copy.setparse("states","{}");
	for(i=0;i<MAX_STATES;i++){
		if(states.contains("states::"+i)){
			copy.setparse("states::"+i,"{}")
			for(var t=0;t<MAX_BLOCKS;t++){
				if(selected.block[t]){
					if(states.contains("states::"+i+"::"+t)){
						copy.setparse("states::"+i+"::"+t,"{}");
						copy.replace("states::"+i+"::"+t,states.get("states::"+i+"::"+t));
					}
					if(states.contains("states::"+i+"::static_mod::"+t)){
						if(!copy.contains("states::"+i+"::static_mod")) copy.setparse("states::"+i+"::static_mod","{}");
						copy.setparse("states::"+i+"::static_mod::"+t,"{}");
						copy.replace("states::"+i+"::static_mod::"+t,states.get("states::"+i+"::static_mod::"+t));
					}
				}
			}
		}
	}
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

function open_patcher(block,voice){
	if(block>-1){
		var vm = voicemap.get(block);
		if(!Array.isArray(vm)) vm = [vm];
		if(voice == -1){
			voice = vm[0];
		}else{
			voice = vm[voice];
		}
	}
	if(voice<MAX_NOTE_VOICES){
		if(usermouse.ctrl){
			note_poly.message( "open" , voice+1);
		}else{
			note_poly.setvalue( voice+1, "open");
		}
		clear_blocks_selection();
	}else{
		voice = voice  - MAX_NOTE_VOICES;	
		if(usermouse.ctrl){
			audio_poly.message( "open" , voice+1);
		}else{
			audio_poly.setvalue( voice+1, "open");
		}
		clear_blocks_selection();
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

function do_nothing(){}

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
	sidebar.scopes.midi = -1;
	sidebar.scopes.voice = -1;
	if(sidebar.mode!="none") set_sidebar_mode("none");
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
	redraw_flag.flag |= 8;
}
function cpu_select_block(parameter,value){
	//cpu page select - clears selected voice
	sidebar.selected_voice = parameter;
	if(usermouse.alt){
		if(parameter==-1){
			if(loaded_ui_patcherlist[value]!='blank.ui') ui_poly.setvalue(value+1,"open");
		}else{
			open_patcher(value,parameter);
		}
	}else{
		select_block(0,value);
	}
}
function select_voice(parameter,value){
	sidebar.selected_voice = parameter;
	redraw_flag.flag |= 10;
}

function show_new_block_menu(){
	clear_blocks_selection();
	blocks_page.new_block_click_pos = connections_sketch.screentoworld(usermouse.x,usermouse.y);
	usermouse.clicked3d=-1;
	usermouse.timer = 0;
	usermouse.long_press_function = null;
	block_menu_d.mode = 0;
	set_display_mode("block_menu");
}

function select_block(parameter,value){
	//post("\nselblock,",value);
	if((selected.block[value]==1)&&(selected.block_count==1)&&(displaymode == "panels")&&(usermouse.timer>0)){
		if(blocktypes.get(blocks.get("blocks["+value+"]::name")+"::block_ui_patcher")!="blank.ui"){
			set_display_mode("custom",value);
			return(1);
		}
	}else{
		usermouse.timer = DOUBLE_CLICK_TIME;
		//post(selected.block[value],selected.block_count,displaymode,usermouse.timer);
		var i;
		var ob=-1;
		if(selected.block_count == 1) ob = selected.block.indexOf(1);
		for(i=0;i<MAX_BLOCKS;i++){
			selected.block[i]=0;
		}
		for(i=0;i<connections.getsize();i++){
			selected.wire[i]=0;
		}
		selected.block[value] = 1;
		if(value != ob) sidebar.selected_voice = -1;
		sidebar.selected = value;
		selected.block_count = 1;
		selected.wire_count = 0;
		redraw_flag.flag |= 2;
		if(displaymode == "blocks") redraw_flag.flag |= 8;
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

function select_folder(parameter,value){
	if(fullscreen){
		world.message("fullscreen",0);
	}
	folder_target = parameter;
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
function custom_direct_mouse_passthrough(parameter,value){
	//post("\n\nCDIRECT MOUSE PASSTHROUGH",parameter,value,usermouse.x,usermouse.y);
	if(value[0] == "output"){
		//post("passthrough",parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES);
		output_blocks_poly.setvalue(parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,(usermouse.x-value[5])/(value[7]-value[5]),(usermouse.y-value[6])/(value[8]-value[6]),value[3],value[4]);
	}else if(value[0] == "note"){
		note_poly.setvalue(parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,(usermouse.x-value[5])/(value[7]-value[5]),(usermouse.y-value[6])/(value[8]-value[6]),value[3],value[4]);
	}else if(value[0] == "audio"){
		audio_poly.setvalue(parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,(usermouse.x-value[5])/(value[7]-value[5]),(usermouse.y-value[6])/(value[8]-value[6]),value[3],value[4]);
	}
}
function custom_direct_mouse_button(parameter,value){
	//post("\n\ncustom mouse button",parameter,"----",value);
	if(value[0] == "output"){
		//post("output block button",parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES);
		output_blocks_poly.setvalue(parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,value[3],value[4]);
	}else if(value[0] == "note"){
		note_poly.setvalue(parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,value[3],value[4]);
	}else if(value[0] == "audio"){
		audio_poly.setvalue(parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,value[3],value[4]);
	}
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
		sidebar.selected_voice = parameter;
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

function send_button_message(parameter, value){
	parameter_value_buffer.poke(1,value[2],value[3]);
	if(value[0] == "block"){
		ui_poly.setvalue(parameter+1,value[1]);
	}else if(value[0] == "firstvoice"){
		var vl = voicemap.get(parameter);
		if(!Array.isArray(vl)) vl=[vl];
		if(vl[0]<MAX_NOTE_VOICES){
			note_poly.setvalue(vl[0]+1,value[1]);
		}else if(vl[0]<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
			audio_poly.setvalue(vl[0]+1-MAX_NOTE_VOICES,value[1]);
		}else{
			output_blocks_poly.setvalue(vl[0]+1-MAX_NOTE_VOICES-MAX_AUDIO_VOICES,value[1]);
		}
	}else if(value[0] == "voices"){
		var vl=voicemap.get(parameter);
		for(var t=vl.length;t--;){
			if(vl[t]<MAX_NOTE_VOICES){
				note_poly.setvalue(vl[t]+1,value[1]);
			}else if(vl[t]<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
				audio_poly.setvalue(vl[t]+1-MAX_NOTE_VOICES,value[1]);
			}else{
				output_blocks_poly.setvalue(vl[t]+1-MAX_NOTE_VOICES-MAX_AUDIO_VOICES,value[1]);
			}
		}
	}else if(value[0] == "core"){
		messnamed("to_blockmanager",value[1]);
	}
	//post("send button message",parameter,"value",value,"\n");
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
				if(states.contains("states::"+state+"::static_mod::"+block)) states.remove("states::"+state+"::static_mod::"+block);
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
	if(usermouse.ctrl && (state!=-1)){
		sidebar.selected = state;
		set_sidebar_mode("edit_stete");
	}else{
		var pv=[];
		if(state==-1) state = "current";
		pv = states.get("states::"+state+"::"+block);
		var m=0;
		if(blocks.contains("blocks["+block+"]::mute")) m=blocks.get("blocks["+block+"]::mute");
		mute_particular_block(block,pv[0]);
		for(var i=1;i<pv.length;i++){
			if(pv[i] !== null){
				parameter_value_buffer.poke(1, MAX_PARAMETERS*block+i-1, pv[i]);
			}else{
				post("\n\n\n\n\n\n\nunsafe poke in fire block state",i,pv[i]);
			}
		}
		if(states.contains("states::"+state+"::static_mod::"+block)){
			var td = states.get("states::"+state+"::static_mod::"+block);
			var tk = td.getkeys();
			var vl = voicemap.get(block);
			if(!Array.isArray(vl)) vl = [vl];
			for(var i=0;i<tk.length;i++){
				parameter_static_mod.poke(1,MAX_PARAMETERS*vl[+tk[i]],states.get("states::"+state+"::static_mod::"+block+"::"+tk[i]));
			}
		}
		if(m!=pv[0]) redraw_flag.flag |= 8;
	}
}

function fire_whole_state_btn_click(state,value){ //start timer, after a moment a slider appears
	//post("whole state btn click",state);
	if((state_fade.selected>-2)&&(state_fade.last == -2)) state_fade.last = state_fade.selected;
	state_fade.selected = state;
	state_fade.position = -1;
	if(state>=-1) whole_state_xfade_create_task.schedule(LONG_PRESS_TIME);
}

function create_whole_state_xfade_slider(state,value){
	state_fade.position=1;
	redraw_flag.flag |= 2;
	usermouse.last.got_t = 2;
	//here: fill the starting/ending arrays - these are structured like the store[b][xxxx] arrays used to save states
	var state = state_fade.selected; // run through the state we're fading into, just note down those params, not all blocks.
	var pv=[];
	state_fade.start = [];
	state_fade.end = [];
	if(state_fade.selected==-1) state="current";
	var stat = new Dict();
	stat = states.get("states::"+state);
	var sc_list = stat.getkeys();
	if(!Array.isArray(sc_list)) sc_list=[+sc_list];
	for(var i=0;i<sc_list.length;i++){
		var b = sc_list[i];
		//post(b,": ");
		if(b!="static_mod"){
			state_fade.static_start[b] = null;
			state_fade.static_end[b] = null;
			state_fade.start[b] = [];
			state_fade.end[b] = [];
			pv = states.get("states::"+state+"::"+b);
			if(!is_empty(pv)){
				var m=0;
				if(blocks.contains("blocks["+b+"]::mute")) m=blocks.get("blocks["+b+"]::mute");
				state_fade.start[b][0] = m;
				state_fade.end[b][0] = pv[0];
				for(var t=1;t<pv.length;t++){
					state_fade.start[b][t] = parameter_value_buffer.peek(1, MAX_PARAMETERS*b+t-1);
					state_fade.end[b][t] = pv[t];
				}
				if(states.contains("states::"+state+"::static_mod::"+b)){
					vl = voicemap.get(b);
					var td=states.get("states::"+state+"::static_mod::"+b);
					var tk=td.getkeys();
					if(tk!=null){
						state_fade.static_start[b] = [];
						state_fade.static_end[b] = [];
						for(var t=0;t<tk.length;t++){
							state_fade.static_start[b][+tk[t]] = parameter_static_mod.peek(1, MAX_PARAMETERS * vl[+tk[t]],pv.length-1);
							state_fade.static_end[b][+tk[t]] = states.get("states::"+state+"::static_mod::"+b+"::"+tk[t]);
						}
					}
				}
			}
		}
	}
}

function fire_whole_state_btn_release(state,value){//if a slider didn't appear you're firing the state
	//post("\nstate release");
	whole_state_xfade_create_task.cancel();
	state_fade.selected = -2;
	state_fade.last = state;
	state_fade.position = -1;
	redraw_flag.flag |= 2;
	fire_whole_state_btn(state,value);
}
function whole_state_xfade(parameter,value){ //called by the slider
	if(value == "get"){
		return state_fade.position*2 - 1;
	}else{
		value = value *0.5 + 0.5;
		var op=state_fade.position;
		state_fade.position = Math.min(1,Math.max(0,value));
		if(op!=state_fade.position) fade_state();
	}
}
function fire_whole_state_btn(state,value){
	//post("\nwhole state btn")
	if(usermouse.ctrl){
		sidebar.selected = state;
		set_sidebar_mode("edit_state");
	}else{
		fire_whole_state(state);
	}
	if(state>-1){
		var cll = config.getsize("palette::gamut");
		state_fade.lastcolour = config.get("palette::gamut["+Math.floor(state*cll/MAX_STATES)+"]::colour");
	}else{
		state_fade.lastcolour = [0,0,0];
	}
}


function fire_whole_state(state, value){
	//post("\nfire whole state",state);
//	var pv=[];
	if(state==-1) state="current";
	var stat = new Dict();
	stat = states.get("states::"+state);
	var sc_list = stat.getkeys();
	if(!Array.isArray(sc_list)) sc_list=[+sc_list];
//	var mf=0;
	for(var i=0;i<sc_list.length;i++){
		if(sc_list[i]!="static_mod") fire_block_state(state,sc_list[i]);
/*		var b = sc_list[i];
		pv = states.get("states::"+state+"::"+b);
		if(!is_empty(pv)){
			var m=0;
			if(blocks.contains("blocks["+b+"]::mute")) m=blocks.get("blocks["+b+"]::mute");
			if(m!=pv[0])mf=1;
			mute_particular_block(b,pv[0]);
			for(var t=1;t<pv.length;t++) parameter_value_buffer.poke(1, MAX_PARAMETERS*b+t-1, pv[t]);
		}*/
	}
//	if((mf==1) && (displaymode != "block_menu")) redraw_flag.flag |= 8;
}

function fade_state(){
	//post("\nfade whole state",state_fade.position);
	var pv=[];// , qv = [];
	var state = state_fade.selected;
	if(state==-1) state="current";
	var stat = new Dict();
	stat = states.get("states::"+state);
	var sc_list = stat.getkeys();
	if(!Array.isArray(sc_list)) sc_list=[+sc_list];
	//var mf=0;
	for(var i=0;i<sc_list.length;i++){
		var b = sc_list[i];
		pv = states.get("states::"+state+"::"+b);
		if(!is_empty(state_fade.end[b])){
			var m=-1;
			//var om=0;
			//if(blocks.contains("blocks["+b+"]::mute")) m=blocks.get("blocks["+b+"]::mute");
			//if(m!=pv[0])mf=1;
			//fade starts at 1 (top) and ends at 0 (bottom) - 1 is the 'current state', 0 is the selected state.
			if((state_fade.position < 1) && (state_fade.end[b][0] == 1)) m = 1;
			if((state_fade.position == 0) && (state_fade.end[b][0] == 0)) m = 0;
			if((state_fade.position == 1)) m = state_fade.start[b][0];
			if(m>-1) mute_particular_block(b,m);
			for(var t=1;t<pv.length;t++){
				safepoke(parameter_value_buffer, 1, MAX_PARAMETERS*b+t-1, (1-state_fade.position)*state_fade.end[b][t] + (state_fade.position)*state_fade.start[b][t]);
			}
			if(state_fade.static_start[b]!=null){
				if(Array.isArray(state_fade.static_start[b])){
					var vl=voicemap.get(b);
					for(var t=0;t<state_fade.static_start[b].length;t++){
						if(Array.isArray(state_fade.static_start[b][t])){
							for(var x=0;x<pv.length;x++){
								if(state_fade.static_start[b][t][x]!=state_fade.static_end[b][t][x]){
									var y = (1-state_fade.position)*state_fade.static_end[b][t][x] + state_fade.position*state_fade.static_start[b][t][x];
									safepoke(parameter_static_mod, 1, MAX_PARAMETERS*vl[t]+x, y);
								}
							}
						}
					}
				}
			}
		}
	}
	redraw_flag.flag |= 2;
	//if(mf==1)redraw_flag.flag |= 8;
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

function copy_state_to_state(from,to){
	var st = states.get("states::"+from);
	if(st!=null){
		states.replace("states::"+to,st);
	}
}

function add_to_state(parameter,block){ //if block==-1 all states, -2 all selected states
	if(parameter==-1) parameter = "current";
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
			//post("add param values to state number", parameter," block number",block);
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
			//post("parameter array",pv);
			if(states.contains("states::"+parameter+"::"+block)) states.remove("states::"+parameter+"::"+block);
			if(pv.length) states.replace("states::"+parameter+"::"+block,pv);
			blocks.replace("blocks["+block+"]::panel::enable",1);
			var vl = voicemap.get(block);
			for(var i=0;i<vl.length;i++){
				//var voiceoffset = vl[i] + MAX_NOTE_VOICES*(type == "audio") + (MAX_NOTE_VOICES+MAX_AUDIO_VOICES)*(type == "hardware");
				var psm = parameter_static_mod.peek(1,MAX_PARAMETERS*vl[i],params.length);
				var c=0;
				for(var t=0;t<params.length;t++) c|=(psm[t]!=0);
				if(c){
					if(!states.contains("states::"+parameter+"::static_mod"))states.setparse("states::"+parameter+"::static_mod","{}");
					if(!states.contains("states::"+parameter+"::static_mod::"+block))states.setparse("states::"+parameter+"::static_mod::"+block,"{}");
					if(!states.contains("states::"+parameter+"::static_mod::"+block+"::"+i))states.setparse("states::"+parameter+"::static_mod::"+block+"::"+i,"{}");
					states.replace("states::"+parameter+"::static_mod::"+block+"::"+i,psm);
				}
			}
			if(parameter=="current"){
				state_fade.lastcolour = [0,0,0];
			}else{
				var cll = config.getsize("palette::gamut");
				state_fade.lastcolour = config.get("palette::gamut["+Math.floor(parameter*cll/MAX_STATES)+"]::colour");
			}
			
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
function scroll_sidebar(parameter,value){
	if(value=="get"){
		return -sidebar.scroll.position/5000;
	}else if(value=="rel"){
		sidebar.scroll.position = Math.min(Math.max(0,sidebar.scroll.position-parameter*100),sidebar.scroll.max-0.01);
		redraw_flag.flag |= 2;
	}else{
		sidebar.scroll.position = Math.min(Math.max(0,-value*5000),sidebar.scroll.max-0.01);
		redraw_flag.flag |= 2;
	}
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
		safepoke(parameter_static_mod,1,parameter[2],Math.max(-1,Math.min(1,value)));
		rebuild_action_list = 1;
		if(((sidebar.mode=="block")||(sidebar.mode=="add_state")||(sidebar.mode=="settings"))){// && (parameter[1]==sidebar.selected)){
			redraw_flag.deferred|=1;
			redraw_flag.targets[parameter[0]]=2;
		}
		if((displaymode=="panels")&&(panelslider_visible[parameter[1]][parameter[0]])){
			redraw_flag.deferred|=16;
			redraw_flag.paneltargets[panelslider_visible[parameter[1]][parameter[0]]-MAX_PARAMETERS]=1;
		}
		//if(displaymode=="custom") redraw_flag.flag=4;
		if(sidebar.selected==automap.mapped_c) note_poly.setvalue(automap.available_c,"refresh");
	}
}

function data_edit(parameter,value){
	//post("\nDATA EDIT!!",parameter,"or",parameter[0],parameter[1],value);
	if(value=="get"){
		var clickset=0;
		if(parameter[1]){
			clickset = 1;
			usermouse.drag.release_on_exit = 1;
		}
		if(((SLIDER_CLICK_SET==0)&&(clickset==0))||(usermouse.shift==1)||(usermouse.alt==1)){
			return voice_data_buffer.peek(1,parameter[0]);
		}else{
			var newval;
			if(parameter[1]==1){
				newval = (parameter[3] - usermouse.y)/(parameter[3]-parameter[2]);
			}else if(parameter[1]==2){
				newval = (parameter[3] - usermouse.x)/(parameter[3]-parameter[2]);
			}
			if(newval!=null){
				voice_data_buffer.poke(1,parameter[0],newval);
			}
			redraw_flag.flag |= 2;
			return newval;
		}
	}else{
		if(typeof value == 'number') voice_data_buffer.poke(1,parameter[0],Math.min(1,Math.max(0,value)))
		redraw_flag.flag |= 2;// was 4?
	}
}
	
function sidebar_parameter_knob(parameter, value){
	//post("\nP: ",parameter,"  V:",value);
	// post("bufferpos",MAX_PARAMETERS*parameter[1]+parameter[0]);
	if(value=="get"){
		//also: look up if this slider is set to clickset mode
		var clickset=0;
		if(paramslider_details[parameter[0]][18]){
			clickset = 1;
			usermouse.drag.release_on_exit = 1;
		}
		if(((SLIDER_CLICK_SET==0)&&(clickset==0))||(usermouse.shift==1)||(usermouse.alt==1)){
			return parameter_value_buffer.peek(1, MAX_PARAMETERS*parameter[1]+parameter[0]);
		}else{
			//TODO if paramslider_details[][18] == 2 then use x instead
			var newval;
			if(paramslider_details[parameter[0]][18]==2){
				newval = (usermouse.x - paramslider_details[parameter[0]][2])/(paramslider_details[parameter[0]][0]-paramslider_details[parameter[0]][2]);
			}else{
				newval = (usermouse.y - paramslider_details[parameter[0]][3])/(paramslider_details[parameter[0]][1]-paramslider_details[parameter[0]][3]);
			}
			//post("\nsetting the slider to",newval);
			if(typeof newval == "number") parameter_value_buffer.poke(1, MAX_PARAMETERS*parameter[1]+parameter[0],newval);
			redraw_flag.deferred|=1;
			return newval;
		}
	}else{
		//set value
		safepoke(parameter_value_buffer,1, MAX_PARAMETERS*parameter[1]+parameter[0],Math.max(0,Math.min(1,value)));
		if(((sidebar.mode=="block")||(sidebar.mode=="add_state")||(sidebar.mode=="settings")) && (parameter[1]==sidebar.selected)){
			redraw_flag.deferred|=1;
			redraw_flag.targets[parameter[0]]=2;
		}
		if((displaymode=="panels")&&(panelslider_visible[parameter[1]][parameter[0]])){
			redraw_flag.deferred|=16;
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

function record_button(){
	//post("\nYOU PRESSED RECORD");
	recording = 1-recording;
	if(recording) for(var i=0;i<MAX_BLOCKS;i++) if(record_arm[i]) send_record_arm_messages(i);
	messnamed("record",recording);
	if(usermouse.ctrl) messnamed("play",recording);
	redraw_flag.flag |= 2;
}

function arm_selected_blocks(){
	if(usermouse.ctrl){
		for(var b=0;b<MAX_BLOCKS;b++){
			set_block_record_arm(b,0);
		}		
	}
	for(var b=0;b<MAX_BLOCKS;b++){
		if(selected.block[b]) set_block_record_arm(b,-1);
	}
}

function set_record_arm(block,x){
	if(usermouse.ctrl){
		for(var b=0;b<MAX_BLOCKS;b++){
			set_block_record_arm(b,0);
		}		
	}
	set_block_record_arm(block,x);
}

function set_block_record_arm(block,x){
	var tt = blocks.get("blocks["+block+"]::type");
	if((tt=="audio")||(tt=="hardware")){
		if(x==0){
			record_arm[block] = 0;
		}else if(x==1){
			record_arm[block] = 1;
		}else{
			record_arm[block] = 1 - record_arm[block];
		}
		redraw_flag.flag |= 10;
		send_record_arm_messages(block);
	}
	recording_flag = ((record_arm.indexOf(1)!=-1)+2*(config.get("RECORD_FOLDER")!=""));
	//so it's 3 if you're good to go, it's <2 if you don't have a folder to write to
}

function send_record_arm_messages(block){
	//makes up filenames for all armed blocks, sends them out.
	var vl = voicemap.get(block);
	if(!Array.isArray(vl)) vl = [vl];
	var da = new Date();
	for(var i =0; i<vl.length;i++){
		//post("\ntell voice",vl[i],"that record is set to",record_arm[block]);
		var path = config.get("RECORD_FOLDER");
		if(typeof songlist[currentsong] == 'undefined'){
			path = path + "untitled";
		}else{
			path = path +songlist[currentsong];
		}
		path = path + "-" + (da.getMonth()+1) + "-" + da.getDate() + "-" + da.getHours()+"-"+da.getMinutes();
		//post("\npath is ",path);
		if(record_arm[block]){
			audio_poly.setvalue(vl[i]+1-64,"filename",path);
		}else{
			audio_poly.setvalue(vl[i]+1-64,"filename","off");
		}
	}
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
	}else if(setting=="return"){
		target = target+"poly::return_mode";
		p = blocks.get(target);
		p = 1 - p;
		blocks.replace(target,p);
		voicealloc_poly.setvalue((block+1),"return_mode",p);  //oldest
	}else if(setting=="flock"){
		target = target+"flock::mode";
		p = flock_modes.indexOf(blocks.get(target));
		p = (p+1) % flock_modes.length;
		blocks.replace(target,flock_modes[p]);
	}else if(setting=="latching"){
		target = target+"poly::latching_mode";
		p = blocks.get(target);
		p = (+p+1) % latching_modes.length;
		blocks.replace(target,p);
		//need to tell the voices
		var vl = voicemap.get(block);
		if(!Array.isArray(vl))vl=[vl];
		if((vl[0])<MAX_NOTE_VOICES){
			for(var v=0;v<vl.length;v++){
				note_poly.setvalue(1+vl[v],"voice_is",vl[v]);
				get_voice_details(vl[v]);
			}
		}else if((vl[0])<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
			for(var v=0;v<vl.length;v++){
				audio_poly.setvalue(1+vl[v],"voice_is",vl[v]-MAX_NOTE_VOICES);
				get_voice_details(vl[v]);
			}
		}
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
	if(block == "static_mod"){
		post("\n\n\nERROR mute was passed : ",block);
		return -1; 
	}
	var type = blocks.get("blocks["+block+"]::type");
	if(av==-1){
		av = 1 - blocks.get("blocks["+block+"]::mute");
	}
	if(av==1) anymuted =1;
	blocks.replace("blocks["+block+"]::mute",av);
	if(still_checking_polys) return 0;
	if(type=="audio"){
		list = voicemap.get(block);
		if(typeof list === 'number'){
			audio_poly.setvalue( list+1-MAX_NOTE_VOICES, "muteouts",av);
		}else{
			for(var t=0;t<list.length;t++){
				audio_poly.setvalue( list[t]+1-MAX_NOTE_VOICES, "muteouts",av);
			}					
		}
	}else if(type == "note"){
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
	}else if(type == "hardware"){
		//actually needs to mute or unmute the audio/midi connections for hw blocks
		for(var t=0;t<connections.getsize("connections");t++){
			if(connections.contains("connections["+t+"]::from") && (connections.get("connections["+t+"]::from::number") == block)){
				// then mute it or unmute it (if the connection itself is not muted)
				if((connections.get("connections["+t+"]::conversion::mute")==0) && (connections.get("connections["+t+"]::from::output::type") == "hardware")){
					make_connection(t);
				}
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
	sidebar.selected_voice = -1;
}
function connection_edit(parameter,value){
	if(value=="get"){
		return connections.get(parameter);
	}else if(parameter == -1){ //todo find the root of this error! lol
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

function connection_mute_selected(parameter,value){
	var i=connections.getsize("connections");
	//post("\nmute sel conns",i,parameter,value);
	if(parameter==0){//unmute all
		for(;i>=0;--i){
			if(selected.wire[i]) connection_edit("connections["+i+"]::conversion::mute",0)
		}	
	}else if(parameter==1){ //mute all
		for(;i>=0;--i){
			if(selected.wire[i]) connection_edit("connections["+i+"]::conversion::mute",1)
		}	
	}else if(parameter==-1){ //toggle all
		for(;i>=0;--i){
			m=connections.get("connections["+i+"]::conversion::mute");
			if(selected.wire[i]) connection_edit("connections["+i+"]::conversion::mute",!m)
		}	
	}
}

function connection_scale_selected(parameter,value){
	if(value == "get") return 0;
	var adj = 1 + value; //eg param is the mouse scroll wheel value, +-
	var i=connections.getsize("connections");
	for(;i>=0;--i){
		if(selected.wire[i]){
			var os=connections.get("connections["+i+"]::conversion::scale");
			connection_edit("connections["+i+"]::conversion::scale",os*adj);
		}
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

function set_automap_k_input(parameter,value){
	automap.inputno_k = parameter;
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

function show_cpu_meter(){
	if((selected.block_count>1) || (selected.wire_count>0)) clear_blocks_selection();
	set_sidebar_mode("cpu");
}

function hw_meter_click(number,type){
//	post("\n you clicked a meter, type:",type,"number",number);
	clear_blocks_selection();
	if(type == "in"){
		set_sidebar_mode("input_scope");
	}else if(type == "out"){
		set_sidebar_mode("output_scope");
	}
	sidebar.scopes.voice = number;
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
					safepoke(parameter_error_spread_buffer,1, MAX_PARAMETERS*list[l]+i,(mulberry32()-0.5)*sprd*mult);
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
		safepoke(parameter_value_buffer,1,a,param_defaults[sidebar.selected][a-MAX_PARAMETERS*sidebar.selected]);
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
				//post("setting to all\n"+b+"\n");
			}else{
				if(a=="all"){
					b[0] = number;
				}else{
					b[0] = a;
					b[1] = number;
				}
				//post("setting to "+b+"\n");
			}
			new_connection.replace(side+"::voice",b);
		}	
	}
	redraw_flag.flag = 4;
}



function select_song(song){
	if((usermouse.timer>0)&&(song==currentsong)&&(!playing)){
		usermouse.timer=0;
		load_song();
	}else{
		currentsong = song;
		usermouse.timer = DOUBLE_CLICK_TIME;
		post("\n song info",songs_info[currentsong]);
		redraw_flag.flag|=2;
	}
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
	var d = Math.floor(waves_dict.get("waves["+waveno+"]::divisions")*(MAX_WAVES_SLICES-0.00001))+1;
	if(d>0){
		//post("\ncalculating ",d,"slices ")
		var l = waves_dict.get("waves["+waveno+"]::length");

		var s = l * waves_dict.get("waves["+waveno+"]::start");
		var e = l * waves_dict.get("waves["+waveno+"]::end");
		var m = (e-s) / d;
		var i;
		var o = (waveno - 1) * MAX_WAVES_SLICES;
		
		for(i=0;i<d;i++){
			waves_slices_buffer.poke(1, o+i, i*m+s);
		}
		//post("writing slices to buffer",waveno,/*o,*/l,s,e,d,m,"\n");
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

function delete_selection(){
	var i;
	for(i=0;i<selected.wire.length;i++){
		if(selected.wire[i]) {
			//post("removing connection",i,"\n");
			remove_connection(i);
		}
	}
	for(i=0;i<selected.block.length;i++){
		if(selected.block[i]) {
			//post("removing block",i,"\n");
			remove_block(i);
		}
	}
	selected.anysel = 0;
	redraw_flag.flag |= 12;
}