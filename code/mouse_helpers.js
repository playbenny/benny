function config_toggle_gain_display_format(ta,tb){
	if(config.get("gain_display_format") == "x"){
		config.replace("gain_display_format", "db");
	}else{
		config.replace("gain_display_format", "x");
	}
	redraw_flag.flag |= 4;
}

function play(state){
	if(state!=playing){
		if(state == "wait"){
			ext_sync.waiting = 1;
			redraw_flag.flag |= 2;
		}else{
			playing=state;
			ext_sync.waiting = 0;
			redraw_flag.flag |= 2;
			if(playing&&(set_timer_start==null)){
				var da = new Date;
				set_timer_start = da.getTime();
			} 
			if(ext_sync.active){
				if(playing){
					ext_sync.state = 1;
				}else{
	
				}
			}
		}
	}
}

function play_button(){
	messnamed("play",1-playing);
}

function play_button_click(){
	if(playing == 0){
		if(usermouse.ctrl){
			stop_ext_clocks();
		}else{
			messnamed("play",1);
			playflag = 1;
		}
	}else{playflag = 0;}
}

function play_button_release(){
	if((!playflag)&playing){
		messnamed("play",0);
		if(usermouse.ctrl && ext_sync.state == 1) stop_ext_clocks();
	}
	playflag = 0;
}

function stop_ext_clocks(){
	post("\nstopping external clock");
	ext_sync.state = 0;
	messnamed("ext_sync","stop_clocks");
}

function link_available(){
	ext_sync.link_available = 1;
	var g = blocktypes.get("core.clock::groups[5]::contains");
	if(g.length<4){
		g.push(15);
		blocktypes.replace("core.clock::groups[5]::contains",g);
	}
	if(sidebar.mode=="midi_indicators") redraw_flag.flag |= 2;
}
function toggle_ableton_link(){
	set_ableton_link_enable(1 - ext_sync.link_enabled);
}
function set_ableton_link_enable(l){
	ext_sync.link_enabled = l;
	messnamed("link_enable",ext_sync.link_enabled);
	redraw_flag.flag |= 2;
}
function clock_link_button(){
	set_ableton_link_enable(1);
	clear_blocks_selection();
	set_sidebar_mode("midi_indicators");
}
function resync_button(){
	messnamed("resync","bang");
}

function panic_button(){
	messnamed("panic","bang");
	patternpage.quantise_and_hold = 0;
	build_mod_sum_action_list();
	flag_all_changed();
	// sigouts.message("setvalue", 0,0); //clears midi-audio sig~
	//for(var i=0;i<param_error_lockup.length;i++) param_error_lockup[i]=0; //frees any voice panel lockups
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

function blocks_paste(outside_connections,target){
//paste. should be clever - 
// - if blocks are selected
//   - are any the same type? paste in all parameters
//   - is it just one? and is just one copied? swap it in
// if not, paste in the blocks in the clipboard and their connections as new blocks
// outside connections = 1 if it should also paste connections from outside the copied blocks
	if(target==null){
		target=copy;
	}
	if(target.contains("actions")){//this would be undo actions, eg move, create block/connection, etc.
		if(target.contains("actions::create_block")){
			var val = target.get("actions::create_block");
			remove_block(val);
		}
		if(target.contains("actions::create_wire")){
			var val = target.get("actions::create_wire");
			remove_connection(val);
		}
		if(target.contains("actions::move_blocks")){
			var listd = target.get("actions::move_blocks");
			var list = listd.getkeys();
			var really = 0;
			if(!Array.isArray(list))list = [list];
			for(var i=0;i<list.length;i++){
				var x = target.get("actions::move_blocks::"+list[i]+"::x");
				var y = target.get("actions::move_blocks::"+list[i]+"::y");
				var ox = blocks.get("blocks["+list[i]+"]::space::x");
				var oy = blocks.get("blocks["+list[i]+"]::space::y");
				really |= ((x!=ox)||(y!=oy));
				blocks.replace("blocks["+list[i]+"]::space::x",x);
				blocks.replace("blocks["+list[i]+"]::space::y",y);
			}
			if(really){
				draw_blocks();
			}else{
				if(undoing==1){
					undo_button();
				}else if(undoing==2){
					redo_button();
				}
			}
		}
		if(target.contains("actions::make_space")){
			var listd = target.get("actions::make_space");
			var list = listd.getkeys();
			if(!Array.isArray(list))list = [list];
			for(var i=0;i<list.length;i++){
				var x = target.get("actions::make_space::"+list[i]+"::x");
				var y = target.get("actions::make_space::"+list[i]+"::y");
				blocks.replace("blocks["+list[i]+"]::space::x",x);
				blocks.replace("blocks["+list[i]+"]::space::y",y);
			}
			draw_blocks();
		}
		if(target.contains("actions::voicecount")){
			var tblock = target.get("actions::voicecount::block");
			var tvoices = target.get("actions::voicecount::voices");
			//post("\nvoicecount",tblock,tvoices);
			if(blocks.contains("blocks["+tblock+"]::poly")){
				voicecount(tblock,tvoices);
			}else{
				if(undoing==1){
					undo_button();
				}else if(undoing==2){
					redo_button();
				}
			}
		}
		if(target.contains("actions::parameter")){
			var tblock = target.get("actions::parameter::block");
			var tparam = target.get("actions::parameter::parameter");
			var tvalue = target.get("actions::parameter::value");
			parameter_value_buffer.poke(1, MAX_PARAMETERS*tblock+tparam,tvalue);
			redraw_flag.flag |= 4;
			if(tblock == automap.mapped_c) note_poly.message("setvalue", automap.available_c,"refresh");
		}
		if(target.contains("actions::voice_parameter")){
			var tvoice = target.get("actions::voice_parameter::voice");
			var tparam = target.get("actions::voice_parameter::parameter");
			var tvalue = target.get("actions::voice_parameter::value");
			//post("\nundoing to:",tvoice,tparam,tvalue);
			parameter_static_mod.poke(1, MAX_PARAMETERS*tvoice+tparam,tvalue);
			redraw_flag.flag |= 4;
			if(automap.mapped_c>-1){
				var avl=voicemap.get(automap.mapped_c);
				if(!Array.isArray(avl)) avl = [avl];
				if(avl.indexOf(tvoice)>-1) note_poly.message("setvalue", automap.available_c,"refresh");
			}
		}
	}
	if(target.contains("blocks")){
		if(undoing==1){
			var usz=redo_stack.getsize("history")|0;
			usz = Math.max(0,usz);
			redo_stack.append("history","{}");
			redo_stack.setparse("history["+usz+"]",'{}');
			redo_stack.replace("history["+usz+"]",target);
		}else if(undoing==2){
			var usz=undo_stack.getsize("history")|0;
			usz = Math.max(0,usz);
			undo_stack.append("history","{}");
			undo_stack.setparse("history["+usz+"]",'{}');
			undo_stack.replace("history["+usz+"]",target);
		}
	
		count_selected_blocks_and_wires();
		var td = target.get("blocks");
		if(td!=null){
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
					var vals = target.get("block_params::"+copied_blocks[0]);
					var v2 = parameter_value_buffer.peek(1,selb*MAX_PARAMETERS,vals.length);
					for(var pc=0;pc<vals.length;pc++){
						if(v2[pc]!=vals[pc]) same = 0;
					}
					// i can't be bothered to compare settings who is ever going to do that
					// WHAT ABOUT DATA THO
				}
			}
			if((same==0)&&(selected.block_count>0)&&(copied_blocks.length == 1)&&(!outside_connections)){
				//you could run through blocks in clipboard, but it'd get confusing
				//so restricted to one.
				//get type, first see if the block selected is the same as the copied one,
				//if so, deselect, paste new target. if not: see if any selected blocks are same type
				//paste values (and opvs?) and all the keys from blocks dict too (inc voicecount)
				for(var i=0; i<selected.block.length;i++){
					if(selected.block[i]){
						var ty = blocks.get("blocks["+i+"]::name");
						if(ty!=copied_type){
							//then swap the selected block to this type, then target settings params etc
							//should this be only if just one selected??
							menu.swap_block_target = i;
							swap_block(copied_type);
						}
						//target params
						var vals = target.get("block_params::"+copied_blocks[0]);
						parameter_value_buffer.poke(1,i*MAX_PARAMETERS,vals);
						//target block settings
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
						if(td.contains(copied_blocks[0]+"::patterns")){
							tdd = td.get(copied_blocks[0]+"::patterns");
							tkeys = tdd.getkeys();
							for(var t=0;t<tkeys.length;t++){
								blocks.replace("blocks["+i+"]::patterns::"+tkeys[t],tdd.get(tkeys[t]));
							}
						}
						if(target.contains("block_data::"+copied_blocks[0])){
							var vl = voicemap.get(i);
							if(!Array.isArray(vl)) vl=[vl];
							for(var t=0;t<vl.length;t++){
								var vals = target.get("block_data::"+copied_blocks[0]+"::"+t);
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
					var name = target.get("blocks::"+copied_blocks[b]+"::name");
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
						var px, py;
						px = td.get(copied_blocks[b]+"::space::x");
						py = td.get(copied_blocks[b]+"::space::y");
						if(target!=undo){
							px += pasteoffset[0];
							py += pasteoffset[1];
						}
						for(var i=0;i<MAX_BLOCKS;i++){ //crude collision detection
							if(blocks.contains("blocks["+i+"]::space::x")){
								if((px == blocks.get("blocks["+i+"]::space::x"))&&(py == blocks.get("blocks["+i+"]::space::y"))){
									px+=0.5;
									py+=0.5;
									i=-1;
								}
							}
						}
						new_block_index = new_block(name,px,py,1);
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
						var vals = target.get("block_params::"+copied_blocks[b]);
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
						blocks.replace("blocks["+new_block_index+"]::space::colour",target.get("blocks::"+copied_blocks[b]+"::space::colour"));
						if(target.contains("blocks::"+copied_blocks[b]+"::upsample")) blocks.replace("blocks["+new_block_index+"]::upsample",target.get("blocks::"+copied_blocks[b]+"::upsample"));
						if(target.contains("blocks::"+copied_blocks[b]+"::subvoices")) blocks.replace("blocks["+new_block_index+"]::subvoices",target.get("blocks::"+copied_blocks[b]+"::subvoices"));
						if(target.contains("blocks::"+copied_blocks[b]+"::from_subvoices")) blocks.replace("blocks["+new_block_index+"]::from_subvoices",target.get("blocks::"+copied_blocks[b]+"::from_subvoices"));
						if(target.contains("blocks::"+copied_blocks[b]+"::to_subvoices")) blocks.replace("blocks["+new_block_index+"]::to_subvoices",target.get("blocks::"+copied_blocks[b]+"::to_subvoices"));
						if(target.contains("blocks::"+copied_blocks[b]+"::mute")) blocks.replace("blocks["+new_block_index+"]::mute",target.get("blocks::"+copied_blocks[b]+"::mute"));
						if(target.contains("blocks::"+copied_blocks[b]+"::bypass")) blocks.replace("blocks["+new_block_index+"]::bypass",target.get("blocks::"+copied_blocks[b]+"::bypass"));
						
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
						if(td.contains(copied_blocks[0]+"::patterns")){
							tdd = td.get(copied_blocks[0]+"::patterns");
							tkeys = tdd.getkeys();
							for(var t=0;t<tkeys.length;t++){
								blocks.replace("blocks["+new_block_index+"]::patterns::"+tkeys[t],tdd.get(tkeys[t]));
							}
						}
						if(td.contains(copied_blocks[0]+"::stored_piano_roll")){
							tdd = td.get(copied_blocks[0]+"::stored_piano_roll");
							tkeys = tdd.getkeys();
							for(var t=0;t<tkeys.length;t++){
								blocks.replace("blocks["+new_block_index+"]::stored_piano_roll::"+tkeys[t],tdd.get(tkeys[t]));
							}
						}
						var vl = voicemap.get(new_block_index);
						if(!Array.isArray(vl)) vl=[vl];
						if(target.contains("block_data::"+copied_blocks[b])){
							for(var t=0;t<vl.length;t++){
								var vals = target.get("block_data::"+copied_blocks[b]+"::"+t);
								voice_data_buffer.poke( 1,MAX_DATA*vl[t],vals);
							}
						}
						if(target.contains("parameter_static_mod::"+copied_blocks[b])){
							for(var t=0;t<vl.length;t++){
								if(target.contains("parameter_static_mod::"+copied_blocks[b]+"::"+t)){
									post("pasting static mod ",t,vl[t]);
									var vals = target.get("parameter_static_mod::"+copied_blocks[b]+"::"+t);
									parameter_static_mod.poke(1,MAX_PARAMETERS*vl[t],vals);
								}
							}
						}
						selected.block[new_block_index] = 1;
					}				
				}
				if(target.contains("states")){
					var tds = target.get("states");
					var tk = tds.getkeys();
					if(tk!=null){
						for(var t=0;t<tk.length;t++){
							
							var tdsb = target.get("states::"+tk[t]);
							if(tdsb!=null){
								var tkb = tdsb.getkeys();
								var stat=0;
								if(Array.isArray(tkb)){
									for(var tt=0;tt<tkb.length;tt++){
										if(tkb[tt]=="static_mod"){
											stat=1;
										}else{
											if(paste_mapping[+tkb[tt]]!=-1){
												states.replace("states::"+tk[t]+"::"+paste_mapping[+tkb[tt]],target.get("states::"+tk[t]+"::"+tkb[tt]));
											}
										}
									}
									if(stat){
										tdsb = target.get("states::"+tk[t]+"::static_mod");
										if(tdsb!=null){
											tkb = tdsb.getkeys();
											for(var tt=0;tt<tkb.length;tt++){
												if(paste_mapping[+tkb[tt]]!=-1){
													states.replace("states::"+tk[t]+"::static_mod::"+paste_mapping[+tkb[tt]],target.get("states::"+tk[t]+"::static_mod::"+tkb[tt]));
												}
											}
										}										
									}
								}
							}
						}
					}
				}
				//todo: opv values
				var tdc = target.get("connections");
				var tk = tdc.getkeys();
				if(Array.isArray(tk)){
					for(var t=0;t<tk.length;t++){
						post("\npaste/undo connections",tk[t]);
						new_connection = target.get("connections::"+tk[t]);
						var pfrom = paste_mapping[+new_connection.get("from::number")];
						var pto = paste_mapping[+new_connection.get("to::number")];
						if(pfrom != -1) new_connection.replace("from::number",pfrom);
						if(pto != -1) new_connection.replace("to::number",pto);
						if(((pfrom==-1)||(pto==-1))&&(outside_connections != 1)){
							//do nothing - this connection is outside
						}else{
							connections.append("connections",new_connection);
							var co = connections.getsize("connections")-1;
							make_connection(co,0);
							new_connection.clear();		
							selected.wire[co]=1;
						}
					}				
				}
				if(target!=undo){
					pasteoffset[0] += 2;
					pasteoffset[1] -= 0.25;				
				}
			}
		}
	}else{
		if(target.contains("block_params")){ //undo params
			var pk = target.getkeys("block_params");
			if(Array.isArray(pk)){
				for(var t=0;t<pk.length;t++){
					var vals = target.get("block_params::"+pk[t]);
					parameter_value_buffer.poke(1,pk[t]*MAX_PARAMETERS,vals);
				}
			}
		}
		if(target.contains("connections")){
			// connections between selected blocks (these aren't copied yet)
			var tdc = target.get("connections");
			var tk = tdc.getkeys();
			if(Array.isArray(tk)){
				for(var t=0;t<tk.length;t++){
					post("\npaste/undo connections",tk[t]);
					new_connection = target.get("connections::"+tk[t]);
					if(!connections.contains("connections["+tk[t]+"]::to")){ //if possible put it back where it came from
						connections.replace("connections["+tk[t]+"]",new_connection);
						var co = tk[t];

					}else{
						connections.append("connections",new_connection);
						var co = connections.getsize("connections")-1;
					}
					post("\nrestored connection number",co);
					make_connection(co,0);
					new_connection.clear();		
					selected.wire[co]=1;
				}				
			}
		}
	}
}

function copy_block(block,target){
	if(target==null)target=copy;
	//first send the block the store message:
	if(blocks.contains("blocks["+block+"]::name")){
		if((ui_patcherlist[block]!='blank.ui')&&(ui_patcherlist[block]!='self')) ui_poly.message("setvalue",  block+1, "store");//query any ui blocks if they have data to store in data
		var ty=blocks.get("blocks["+block+"]::type");
		if(ty == "note"){
			var vl = voicemap.get(block);
			if(!Array.isArray(vl)) vl = [vl];
			for(v=0;v<vl.length;v++){
				note_poly.message("setvalue", vl[v]+1,"store");
			}
		}else if(ty == "audio"){
			var vl = voicemap.get(block);
			if(!Array.isArray(vl)) vl = [vl];
			for(v=0;v<vl.length;v++){			
				audio_poly.message("setvalue", vl[v]+1-MAX_NOTE_VOICES,"store");
			}
		}
	}
	//block itself 
	pasteoffset = [2,-0.25];
	var tb = blocks.get("blocks["+block+"]");
	target.setparse("blocks::"+block,"{}");
	target.replace("blocks::"+block,tb);
	target.setparse("block_params::"+block,"{}");
	if(tb.contains("patterns")){
		target.setparse("patterns::"+tb.get("patterns"));
	}
	var name=tb.get("name");
	var paramcount = blocktypes.getsize(name+"::parameters");
	var vals = parameter_value_buffer.peek(1, block*MAX_PARAMETERS, paramcount);
	target.replace("block_params::"+block,vals);
	var vl=voicemap.get(block);
	if(!Array.isArray(vl)) vl = [vl];
	if(blocktypes.contains(name+"::voice_data")){//even just an empty key in the block json is enough to tell it to copy data with the block
		target.setparse("block_data::"+block,"{}");
		for(var i=0;i<vl.length;i++){
			target.setparse("block_data::"+block+"::"+i,"{}");
			vals = voice_data_buffer.peek(1, vl[i]*MAX_DATA, MAX_DATA);
			target.replace("block_data::"+block+"::"+i,vals);
		}
	}
	//var type = blocktypes.get(name+"::type");
	for(var i=0;i<vl.length;i++){
		//var voiceoffset = vl[i] + MAX_NOTE_VOICES*(type == "audio") + (MAX_NOTE_VOICES+MAX_AUDIO_VOICES)*(type == "hardware");
		var psm = parameter_static_mod.peek(1,MAX_PARAMETERS*vl[i],paramcount);
		var c=0;
		for(var t=0;t<paramcount;t++) c|=(psm[t]!=0);
		if(c){
			if(!target.contains("parameter_static_mod::"+block)) target.setparse("parameter_static_mod::"+block,"{}");			
			target.setparse("parameter_static_mod::"+block+"::"+i,"{}");
			target.replace("parameter_static_mod::"+block+"::"+i,psm);
		}
	
	}
}

function copy_selection(target){
	if(target==null)target=copy;
	var i;
	target.setparse("blocks","{ }");
	target.setparse("block_params","{}");
	target.setparse("block_data","{}");
	target.setparse("parameter_static_mod","{}");
	for(i=0;i<selected.block.length;i++){
		if(selected.block[i]){
			copy_block(i,target);
		}
	}
	target.setparse("connections","{}");
	var csize = connections.getsize("connections");
	var c_ext=0;
	for(i=0;i<csize;i++){
		if(connections.contains("connections["+i+"]::from::number")){
			var cfrom = connections.get("connections["+i+"]::from::number");
			var cto = connections.get("connections["+i+"]::to::number");
			if(selected.block[+cfrom] || selected.block[+cto] || ((target==undo)&&(selected.wire[i]))){
				if(!(selected.block[+cfrom] && selected.block[+cto])) c_ext=1;
				target.setparse("connections::"+i,"{}");
				target.replace("connections::"+i,connections.get("connections["+i+"]"));
			}
		}
	}
	target.setparse("external_connections",c_ext);
	target.setparse("states","{}");
	for(i=0;i<MAX_STATES;i++){
		if(states.contains("states::"+i)){
			target.setparse("states::"+i,"{}")
			for(var t=0;t<MAX_BLOCKS;t++){
				if(selected.block[t]){
					if(states.contains("states::"+i+"::"+t)){
						target.setparse("states::"+i+"::"+t,"{}");
						target.replace("states::"+i+"::"+t,states.get("states::"+i+"::"+t));
					}
					if(states.contains("states::"+i+"::static_mod::"+t)){
						if(!target.contains("states::"+i+"::static_mod")) target.setparse("states::"+i+"::static_mod","{}");
						target.setparse("states::"+i+"::static_mod::"+t,"{}");
						target.replace("states::"+i+"::static_mod::"+t,states.get("states::"+i+"::static_mod::"+t));
					}
				}
			}
		}
	}
}

function duplicate_selection() {
    copy_selection();
    blocks_paste(0);
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
	if(sidebar.selected_voice == -1){
		for(var i in vl){
			if(vl[i]>=MAX_NOTE_VOICES){
				loaded_audio_patcherlist[vl[i]-MAX_NOTE_VOICES] = "reload";
			}else{
				loaded_note_patcherlist[vl[i]] = "reload";
			}
			post("\nreloading voice patcher "+vl[i]);
		}
	}else{
		if(vl[sidebar.selected_voice]>=MAX_NOTE_VOICES){
			loaded_audio_patcherlist[vl[sidebar.selected_voice]-MAX_NOTE_VOICES] = "reload";
		}else{
			loaded_note_patcherlist[vl[sidebar.selected_voice]] = "reload";
		}
		post("\nreloading voice patcher "+vl[sidebar.selected_voice]);
	}
	still_checking_polys |= 3;
}

function open_patcher(block,voice){
	if(block == null){
		block = sidebar.selected;
		voice = sidebar.selected_voice;
	}
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
			note_poly.message("setvalue",  voice+1, "open");
		}
	}else{
		voice = voice  - MAX_NOTE_VOICES;	
		if(usermouse.ctrl){
			audio_poly.message( "open" , voice+1);
		}else{
			audio_poly.message("setvalue",  voice+1, "open");
		}
	}
}

function swap_block_button(block){
	menu.swap_block_target = block;
	menu.show_all_types = 0;
	menu.mode = 1;
	set_display_mode("block_menu");
}

function block_position(number){
	var x = blocks.get("blocks["+number+"]::space::x");
	var y = blocks.get("blocks["+number+"]::space::y");
	return [x,y];
}

function insert_menu_button(cno){
	if(cno==-1) cno = selected.wire.indexOf(1);
	menu.mode = 2;
	menu.connection_number = cno;
	var fr=block_position(connections.get("connections["+cno+"]::from::number"));
	var tt=block_position(connections.get("connections["+cno+"]::to::number"));
	if((fr[0] == tt[0])&&(fr[1] == tt[1])){
		blocks_page.new_block_click_pos = [fr[0]+1,fr[1]];
	}else{
		blocks_page.new_block_click_pos = [0.5*(fr[0]+tt[0]),0.5*(fr[1]+tt[1])];
		if((fr[1]-tt[1])<2){
			make_fisheye_space(blocks_page.new_block_click_pos[0],blocks_page.new_block_click_pos[1],1.1);
		}
	}
	set_display_mode("block_menu");
}

function insert_multi_menu_button(){
	menu.connection_number = [];
	for(var i=0;i<connections.getsize("connections");i++) if(selected.wire[i])menu.connection_number.push(i);
	menu.mode = 2;
	set_display_mode("block_menu");
}

function split_wire_destination(cno){
	if(cno==-1) cno = selected.wire.indexOf(1);
	var vl = connections.get("connections["+cno+"]::to::voice");
	var tb = connections.get("connections["+cno+"]::to::number");
	if(vl == "all"){
		vl = [];
		for(var i=0;i<blocks.get("blocks["+tb+"]::poly::voices");i++){
			vl.push(i+1);
		}
	}else{
		if(!Array.isArray(vl))vl = [vl];
	}
	new_connection = connections.get("connections["+cno+"]");
	remove_connection(cno);
	for(var i=0;i<vl.length;i++){
		new_connection.replace("to::voice", vl[i]);
		connections.append("connections",new_connection);
		make_connection(connections.getsize("connections")-1,0);
	}
}

function split_wire_source(cno){
	if(cno==-1) cno = selected.wire.indexOf(1);
	var vl = connections.get("connections["+cno+"]::from::voice");
	var tb = connections.get("connections["+cno+"]::from::number");
	if(vl == "all"){
		vl = [];
		for(var i=0;i<blocks.get("blocks["+tb+"]::poly::voices");i++){
			vl.push(i+1);
		}
	}else{
		if(!Array.isArray(vl))vl = [vl];
	}
	new_connection = connections.get("connections["+cno+"]");
	remove_connection(cno);
	for(var i=0;i<vl.length;i++){
		new_connection.replace("from::voice", vl[i]);
		connections.append("connections",new_connection);
		make_connection(connections.getsize("connections")-1,0);
	}
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
	redraw_flag.flag = 10;
	redraw_flag.targets = [];
	redraw_flag.targetcount = 0;
	sidebar.scopes.midi = -1;
	sidebar.scopes.voice = -1;
	if((sidebar.mode!="none")&&(sidebar.mode!="file_menu")) set_sidebar_mode("none");
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
	redraw_flag.flag = 10;
	redraw_flag.targets = [];
	redraw_flag.targetcount = 0;	
}

function connection_select(parameter,value){
	var i;
	for(i=0;i<MAX_BLOCKS;i++) selected.block[i]=0;
	for(i=0;i<selected.wire.length;i++)	selected.wire[i]=0;
	selected.wire[value] = 1;
	selected.wire_count = 1;
	selected.block_count = 0;
	if(!sidebar.connection.default_in_applied) sidebar.connection.show_to_inputs = 0;
	if(!sidebar.connection.default_out_applied) sidebar.connection.show_from_outputs = 0;
	set_sidebar_mode("wire");
	redraw_flag.flag |= 8;
}
function connections_select(pass,block){
	//2 = audio ins, 1=other ins,0=outs
	var i;
	var which="to";
	if(pass==0) which="from";
	for(i=0;i<MAX_BLOCKS;i++) selected.block[i]=0;
	for(i=0;i<selected.wire.length;i++)	selected.wire[i]=0;
	selected.wire_count = 0;
	selected.block_count = 0;
	for(i=0;i<connections.getsize("connections");i++){
		if(connections.contains("connections["+i+"]::from")){
			if(connections.get("connections["+i+"]::"+which+"::number")==block){
				if((pass==2)&&(connections.get("connections["+i+"]::to::input::type")=="audio")){
					selected.wire[i]=1;
					selected.wire_count++;
				}else if((pass==1)&&(connections.get("connections["+i+"]::to::input::type")!="audio")){
					selected.wire[i]=1;
					selected.wire_count++;
				}else if(pass==0){
					selected.wire[i]=1;
					selected.wire_count++;
				}
			}
		}
	}
	set_sidebar_mode("wire");
	redraw_flag.flag |= 8;
}

function cpu_select_block(parameter,value){
	//cpu page select - clears selected voice
	sidebar.selected_voice = parameter;
	if(usermouse.alt){
		if(parameter==-1){
			if(loaded_ui_patcherlist[value]!='blank.ui') ui_poly.message("setvalue", value+1,"open");
		}else{
			open_patcher(value,parameter);
		}
	}else{
		select_block(0,value);
	}
}

function select_block_and_voice(block,voice){
	select_block(0,block);
	sidebar.selected_voice = voice;
	redraw_flag.flag |= 10;
}

function select_voice(parameter,value){
	sidebar.selected_voice = parameter;
	redraw_flag.flag |= 10;
}

function sidebar_select_connection(num,val){
	post("\nSSC");
	if(usermouse.ctrl){
		if(!connections.contains("connections["+num+"]::conversion")) post("\n?????",num);
		var m = !connections.get("connections["+num+"]::conversion::mute");
		connection_edit("connections["+num+"]::conversion::mute",m);
	}else{
		clear_blocks_selection();
		selected.wire[num]=1; //^^this already flags a redraw
	}
}
function show_new_block_menu(){
	if(sidebar.mode=="wire"){
		store_back(["wire",selected.wire.indexOf(1),sidebar.scroll.position]);
	}else{
		store_back([sidebar.mode,sidebar.selected, sidebar.selected_voice,sidebar.scroll.position]);
	}
	blocks_page.was_selected = null;
	if(selected.block.indexOf(1)>-1){
		blocks_page.was_selected = selected.block.indexOf(1);
		// post("\nsomething was selected, you can hold shift to connect to/from it",blocks_page.was_selected);
		if(blocks.get("blocks["+blocks_page.was_selected+"]::name").split('.')[0]=="mixer"){
			blocks_page.was_selected = null;
			// post("\nmixer blocks are excluded from autoconnect because they have their own connection algo");
		}
		if(sidebar.selected_voice>-1){
			blocks_page.was_selected_voice = sidebar.selected_voice;
		} else {
			blocks_page.was_selected_voice = null;
		}
	} 
	clear_blocks_selection();
	blocks_page.new_block_click_pos = screentoworld(usermouse.x,usermouse.y);
	usermouse.clicked3d=-1;
	usermouse.timer = 0;
	usermouse.long_press_function = null;
	menu.mode = 0;
	set_display_mode("block_menu");
}

function screentoworld(x,y){
	//var real = connections_sketch.screentoworld(x,y);
	//post("\nreal stw", real);
	var camera_stw_scale = 0.53589838486224541294510731698826 * camera_position[2];
	x/=mainwindow_width;
	y/=-mainwindow_height;
	x-=0.5;
	y+=0.5;
	x*=camera_stw_scale*mainwindow_width/mainwindow_height;
	y*=camera_stw_scale;
	x+=camera_position[0];
	y+=camera_position[1];
	//post("calculated one",x,y,"error",real[0]-x,real[1]-y);
	return [x,y,0];//real;
}

function click_patterns_column_header(parameter,value){
	if(usermouse.ctrl){
		if(usermouse.shift || patternpage.quantise_and_hold){
			queue_quantised_notification(mute_particular_block, parameter,-1);
			if(patternpage.column_type[value]==1){
				patternpage.held_pattern_fires[parameter] = -1;
			}else{
				patternpage.held_state_fires[parameter] = null;
			}
		}else{
			mute_particular_block(parameter,-1);
		}
	}else{
		select_block(parameter,parameter);
	}
}

function select_block(parameter,value){
	if((selected.block[value]==1)&&(selected.block_count==1)&&(displaymode == "panels")&&(usermouse.timer>0)){
		var ui = blocktypes.get(blocks.get("blocks["+value+"]::name")+"::block_ui_patcher");
		if((ui!="blank.ui")&&(ui!="self")){
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
		for(i=0;i<selected.wire.length;i++){
			selected.wire[i]=0;
		}
		selected.block[value] = 1;
		if(value != ob) sidebar.selected_voice = -1;
		sidebar.selected = value;
		selected.block_count = 1;
		selected.wire_count = 0;
		redraw_flag.flag |= 2;
		if(displaymode == "blocks"){
			redraw_flag.flag |= 8;
		}else if(displaymode == "panels"){
			if(usermouse.ctrl){
				panels.editting = value;
				set_sidebar_mode("panel_assign");
			}else{
				set_sidebar_mode("none");
				panels.editting = -1;
			}
		}else if(displaymode == "panels_edit"){
			panels.editting = value;
			set_sidebar_mode("panel_assign");
		}
	}
}

function panels_bg_click(){
	if(sidebar.mode != "none") clear_blocks_selection();
}


function panel_edit_button(parameter,value){
	post("panel edit",parameter,value);
	if(value=="up"){
		for(var i=1;i<panels.order.length;i++){
			if(panels.order[i]==parameter){
				panels.order[i] = panels.order[i-1];
				panels.order[i-1] = parameter;
			}
		}
	}else if(value=="down"){
		for(var i=panels.order.length-1;i>=0;i--){
			if(panels.order[i]==parameter){
				panels.order[i] = panels.order[i+1];
				panels.order[i+1] = parameter;
			}
		}
	}else if(value=="hide"){
		blocks.replace("blocks["+parameter+"]::panel::enable",0);
		panels.order.splice(panels.order.indexOf(parameter),1);
		redraw_flag.paneltargets[parameter] = 0;
		//post("panels order is now",panels.order);
	}
	redraw_flag.flag |= 4;
}

function extend_waves_dict(newlen){
	while((newlen+1) >= waves_dict.getsize("waves")){
		waves_dict.append("waves","*");
		waves_dict.setparse("waves["+(waves_dict.getsize("waves")-1)+"]","{}");
	}
	if(newlen>MAX_WAVES){
		error("\nTODO - need to increase MAX_WAVES here, but to do so we need to:");
		error("\nre-scale all wave select sliders, like during load");
		error("\nstore tracker wave mapping table?\n");
	}
}

function file_drop(fname){
	var ts = fname.split(".").pop();
	ts = ts.toLowerCase();
	if(ts=="json"){
		load_elsewhere(fname);
	}else if((ts=="wav")||(ts=="aiff")||(ts=="aif")||(ts=="mp3")||(ts=="flac")){
		post("\n\nloading audio file from drag and drop,");
		/*if(waves.selected == -1)*/ waves.selected = 0;
		inuse=1;
		while(inuse){
			if(!waves_dict.contains("waves["+(waves.selected+1)+"]::name")){
				inuse = 0;
			}else{
				waves.selected++;
				if((waves.selected+1) >= waves_dict.getsize("waves")){
					extend_waves_dict(waves.selected+1);
				}
				if(waves.selected>10000){error("thats a lot of waves"); inuse = 0;}
			}
		}
		var ffn = fname.split("/").pop();
		post(ffn, ", into slot ",waves.selected);
		waves_dict.replace("waves["+(waves.selected+1)+"]::name","loading");
		waves_dict.replace("waves["+(waves.selected+1)+"]::path","loading");
		wave_chosen(waves.selected, ffn,fname);
		set_display_mode("waves");
	}else{
		post("\ndrag and drop, unknown file type?",ts);
	}
}

function load_elsewhere_choose(){
	messnamed("open_elsewhere","bang");
}

function load_elsewhere(fname){
	if(fname == "cancel") return 0;
	if((startup_loadfile=="")||(startup_loadfile == fname)){
		post("\nyou chose:",fname);
		usermouse.ctrl = 0;
		var ts = fname.split("/").pop();
		ts = ts.split(".");
		var tss = "";
		for(var t=0;t<ts.length-1;t++){
			tss = tss + ts[t];
			if(t>0) tss = tss + ".";
		}
		post("\nfilename",tss);
		song.import_json(fname);
		loading.songpath = fname.split(tss)[0];
		post("\npath", loading.songpath);
		add_path_to_recent_folders(loading.songpath);
		copy_song_to_songs_dict(tss);
		if(playing) play_button();
		meters_enable = 0;
		clear_everything();
		startup_loadfile=="";
		loading.merge = 0;
		loading.progress=-1;
		loading.mute_new=0;
		loading.bundling=12;
		loading.wait=1;
		loading.songname = tss;
		import_song();	
	}else{
		startup_loadfile = fname;
		messnamed("trigger_startup","bang");
	}
}

function select_folder(parameter,value){
	sidebar.files_page = "songs";
	if(fullscreen){
		world.message("fullscreen",0);
	}
	folder_target = parameter;
	messnamed("select_folder","bang");
}

function open_core_control_auto(){
	// post("\nlooking");
	for(var i=0;i<MAX_BLOCKS;i++){
		if((blocks.contains("blocks["+i+"]::name"))&&(blocks.get("blocks["+i+"]::name")=="core.input.control.auto")){
			var show=0;
			for(var cc=0;cc<connections.getsize("connections");cc++){
				if(connections.contains("connections["+cc+"]::from::number")&&(connections.get("connections["+cc+"]::from::number")==i)){
					show=1;
					break;
				}
			}
			if(show){
				for(var t=0;t<MAX_BLOCKS;t++) selected.block[t] = 0;
				selected.block[i]=1;
				set_display_mode("custom",i);
			}
			return show;
		}
	}
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

function jump_to_block_at_connection_end(which){
	var i=selected.wire.indexOf(1);
	//post("\njump",which,i);
	var target = -1;
	if(which==0){
		target = connections.get("connections["+i+"]::from::number");
	}else{
		target = connections.get("connections["+i+"]::to::number");
	}
	if(target!=-1){
		post(target);
		for(i=0;i<selected.wire.length;i++) selected.wire[i]=0;
		selected.wire_count = 0;
		//selected.block[target] = 1;
		select_block(0,target);
		set_sidebar_mode("connections");
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
		set_sidebar_mode("none");
		danger_button = -1;
	}else{
		danger_button = value;
		redraw_flag.flag |= 2;
		post("\ndanger",value,"(",parameter,")");
	}
}
function clear_wave_btn(parameter,value){
	if(value == danger_button){
		delete_wave(waves.selected,waves.selected);
		danger_button = -1;
	}else{
		danger_button = value;
		redraw_flag.flag |= 4;
		post("\ndanger",value,"(",parameter,")");
	}
}
function custom_mouse_passthrough(parameter,value){
	// post("\n\nCUSTOM MOUSE PASSTHROUGH",parameter,value,usermouse.x,usermouse.y);
	ui_poly.message("setvalue", parameter,"mouse",usermouse.x,usermouse.y,usermouse.left_button,usermouse.shift,usermouse.alt,usermouse.ctrl,value);
}
function custom_direct_mouse_passthrough(parameter,value){
	//post("\n\nCDIRECT MOUSE PASSTHROUGH",parameter,value,usermouse.x,usermouse.y);
	if(value[0] == "output"){
		//post("passthrough",parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES);
		output_blocks_poly.message("setvalue", parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,(usermouse.x-value[5])/(value[7]-value[5]),(usermouse.y-value[6])/(value[8]-value[6]),value[3],value[4]);
	}else if(value[0] == "note"){
		note_poly.message("setvalue", parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,(usermouse.x-value[5])/(value[7]-value[5]),(usermouse.y-value[6])/(value[8]-value[6]),value[3],value[4]);
	}else if(value[0] == "audio"){
		audio_poly.message("setvalue", parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,(usermouse.x-value[5])/(value[7]-value[5]),(usermouse.y-value[6])/(value[8]-value[6]),value[3],value[4]);
	}
}
function custom_direct_mouse_button(parameter,value){
	// post("\n\ncustom mouse button",parameter,"----",value);
	if(value[0] == "output"){
		//post("output block button",parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES);
		output_blocks_poly.message("setvalue", parameter-MAX_AUDIO_VOICES-MAX_NOTE_VOICES,value[2],usermouse.left_button,value[3],value[4]);
	}else if(value[0] == "note"){
		// post("\nmessage is:","setvalue", parameter,value[2],usermouse.left_button,value[3],value[4]);
		note_poly.message("setvalue", parameter,value[2],usermouse.left_button,value[3],value[4]);
	}else if(value[0] == "audio"){
		audio_poly.message("setvalue", parameter,value[2],usermouse.left_button,value[3],value[4]);
	}else if(value[0] == "core"){
		messnamed("to_blockmanager",value[1],value[2],value[3],value[4],parameter);
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
function scope_midinames(t,value){
	if(sidebar.scopes.midinames<2){
		sidebar.scopes.midinames=2 + t;
	}else{
		if(t!=sidebar.scopes.midinames-2){
			sidebar.scopes.midinames= t+2;
		}else{
			sidebar.scopes.midinames= config.get("SIDEBAR_MIDI_SCOPE_NOTE_NAMES");
		}
	}
	redraw_flag.flag |= 2;
}

function send_button_message_dropdown(parameter,value){
	sidebar.dropdown=null;
	send_button_message(parameter,value);
}

function send_button_message(parameter, value){
	parameter_value_buffer.poke(1,value[2],value[3]);
	if(value[0] == "block"){
		ui_poly.message("setvalue", parameter+1,value[1]);
	}else if(value[0] == "firstvoice"){
		var vl = voicemap.get(parameter);
		if(!Array.isArray(vl)) vl=[vl];
		if(vl[0]<MAX_NOTE_VOICES){
			note_poly.message("setvalue", vl[0]+1,value[1]);
		}else if(vl[0]<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
			audio_poly.message("setvalue", vl[0]+1-MAX_NOTE_VOICES,value[1]);
		}else{
			output_blocks_poly.message("setvalue", vl[0]+1-MAX_NOTE_VOICES-MAX_AUDIO_VOICES,value[1]);
		}
	}else if(value[0] == "voices"){
		var vl=voicemap.get(parameter);
		if(!Array.isArray(vl)) vl=[vl];
		if(sidebar.selected == parameter && sidebar.selected_voice>-1){
			vl = [vl[sidebar.selected_voice]];
		}
		for(var t=vl.length;t--;){
			if(vl[t]<MAX_NOTE_VOICES){
				note_poly.message("setvalue", vl[t]+1,value[1]);
			}else if(vl[t]<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
				audio_poly.message("setvalue", vl[t]+1-MAX_NOTE_VOICES,value[1]);
			}else{
				output_blocks_poly.message("setvalue", vl[t]+1-MAX_NOTE_VOICES-MAX_AUDIO_VOICES,value[1]);
			}
		}
	}else if(value[0] == "core"){
		messnamed("to_blockmanager",value[1],parameter);
	}else{
		//post("unhandled send button message",parameter,"value",value,"\n");
	}
}

function fwd_button(){
	if(sidebar.fwd.length>0){
		var fwd = sidebar.fwd.pop();
		store_back([sidebar.mode,sidebar.selected, sidebar.selected_voice,sidebar.scroll.position]);
		//contains sidebar mode, then if it was a block one it contains the selected block and voice and scroll position
		//or if it was a connection it contains the selected connection and scroll position
		//or? 
		if(fwd[0]==sidebar.mode){
			if(fwd[0]=="wire"){
				if(((fwd[1]==selected.wire.indexOf(1)))&&(sidebar.fwd.length>0)) fwd = sidebar.fwd.pop();
			}else if((fwd[0]=="block")||(fwd[0]=="connections")){
				if(((fwd[1]==sidebar.selected&(fwd[2]==sidebar.selected_voice)))&&(sidebar.fwd.length>0)) fwd = sidebar.fwd.pop();
			}
		}
		//post("\nsidebar fwd",fwd, typeof fwd);
		if(fwd[0]=="wire"){
			clear_blocks_selection();
			sidebar_select_connection(fwd[1],null);
			sidebar.scroll.position = fwd[2];
		}else if((fwd[0]=="block")||(fwd[0]=="connections")){
			clear_blocks_selection();
			select_block_and_voice(fwd[1],fwd[2]);
			set_sidebar_mode(fwd[0]);
			sidebar.scroll.position = fwd[3];
		}
	}
}

function back_button(){
	if(sidebar.back.length>0){
		var back = sidebar.back.pop();
		store_fwd([sidebar.mode,sidebar.selected, sidebar.selected_voice,sidebar.scroll.position]);
		//contains sidebar mode, then if it was a block one it contains the selected block and voice and scroll position
		//or if it was a connection it contains the selected connection and scroll position
		//or? 
		if(back[0]==sidebar.mode){
			if(back[0]=="wire"){
				if(((back[1]==selected.wire.indexOf(1)))&&(sidebar.back.length>0)) back = sidebar.back.pop();
			}else if((back[0]=="block")||(back[0]=="connections")){
				if(((back[1]==sidebar.selected&(back[2]==sidebar.selected_voice)))&&(sidebar.back.length>0)) back = sidebar.back.pop();
			}
		}
		//post("\nsidebar back",back, typeof back);
		if(back[0]=="wire"){
			clear_blocks_selection();
			sidebar_select_connection(back[1],null);
			sidebar.scroll.position = back[2];
		}else if((back[0]=="block")||(back[0]=="connections")){
			clear_blocks_selection();
			select_block_and_voice(back[1],back[2]);
			set_sidebar_mode(back[0]);
			sidebar.scroll.position = back[3];
		}
	}
}

function store_back(contents){
	if(sidebar.back.length>0){
		//if(sidebar.back.length>sidebar.backpointer) sidebar.back.slice(0,sidebar.backpointer);
		mostrecent = sidebar.back[sidebar.back.length-1];
		if(mostrecent.length!=contents.length){
			sidebar.back.push(contents);
		}else{
			//post("\ntesting",mostrecent,"vs",contents);
			for(var i=0;i<mostrecent.length-1;i++){
				if(mostrecent[i]!=contents[i]){
					sidebar.back.push(contents);
					return 0;
				}
			}
			var skip = sidebar.back.pop();
			sidebar.back.push(contents);
		}
	}else{
		sidebar.back.push(contents);
	}
}

function store_fwd(contents){
	if(sidebar.fwd.length>0){
		//if(sidebar.back.length>sidebar.backpointer) sidebar.back.slice(0,sidebar.backpointer);
		mostrecent = sidebar.fwd[sidebar.fwd.length-1];
		if(mostrecent.length!=contents.length){
			sidebar.fwd.push(contents);
		}else{
			//post("\ntesting",mostrecent,"vs",contents);
			for(var i=0;i<mostrecent.length-1;i++){
				if(mostrecent[i]!=contents[i]){
					sidebar.fwd.push(contents);
					return 0;
				}
			}
			var skip = sidebar.fwd.pop();
			sidebar.fwd.push(contents);
		}
	}else{
		sidebar.fwd.push(contents);
	}
}


function request_load_wave(block){
	//this is for when a block has a button to request a wave, it finds an empty slot,
	//prompts for a file, loads it and then sets the slider in the requesting block to point
	//at it
	post("\nwave load request");
	for(var i=0;i<MAX_WAVES;i++){
		if(!waves_dict.contains("waves["+(i+1)+"]::name")){
			load_wave(i);
			var block_name = blocks.get("blocks["+block+"]::name");
			var params = blocktypes.get(block_name+"::parameters");
			for(var p=0;p<params.length;p++){
				if(params[p].get("type")=="wave"){
					parameter_value_buffer.poke(1,MAX_PARAMETERS*block+p,(i+0.01)/MAX_WAVES);
					redraw_flag.flag |= 2;
					return 1;
				}
			}
			return 0.5;
		}
	}
}

function request_edit_wave(block){
	//this is for when a block has a button to request a wave, it finds an empty slot,
	//prompts for a file, loads it and then sets the slider in the requesting block to point
	//at it
	//first check there is a wave, if not then just pop open the load box instead
	
	var block_name = blocks.get("blocks["+block+"]::name");
	var params = blocktypes.get(block_name+"::parameters");
	for(var p=0;p<params.length;p++){
		if(params[p].get("type")=="wave"){
			waves.selected = Math.floor(MAX_WAVES*parameter_value_buffer.peek(1,MAX_PARAMETERS*block+p));
			post("\nwave edit request",waves.selected);
			if(!waves_dict.contains("waves["+(waves.selected+1)+"]::name")){
				load_wave(waves.selected);
			}
			set_display_mode("waves");
			return 0;
		}
	}
}

function jump_to_scales_shapes(){
	//first see if it has been added
	if(scalesblock>-1){
		clear_blocks_selection();
		var v = 0;
		if((sidebar.selected>-1)&&blocks.contains("blocks["+sidebar.selected+"]::name")){
			var params = blocktypes.get(blocks.get("blocks["+sidebar.selected+"]::name")+"::parameters");
			if(!Array.isArray(params))params = [params];
			for(var p=0;p<params.length;p++){
				if(params[p].get("type")=="scale"){
					var siz=params[p].get("values").length;
					v = (siz==8) + Math.floor(parameter_value_buffer.peek(1,MAX_PARAMETERS*sidebar.selected+p)*(siz-0.01));
					post("\nfound scale parameter in current block. scale is:",v,"size is",siz,"param is",p,"sel",sidebar.selected,"peek",parameter_value_buffer.peek(1,MAX_PARAMETERS*scalesblock+p));
				}
			}
		}
		select_block_and_voice(scalesblock,v-1);
		return 1;
	}
	for(var i =0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			if(blocks.get("blocks["+i+"]::name")=="core.scales.shapes"){
				clear_blocks_selection();
				scalesblock = i;
				select_block(i,i);
				redraw_flag.flag |= 4;

				post("\njumping to ",i);
				return 1;
			}
		}
	}
	var x=0; var y=0;
	if(sidebar.selected!=-1){
		if(blocks.contains("blocks["+sidebar.selected+"]::space")){
			x = -2+blocks.get("blocks["+sidebar.selected+"]::space::x");
			y = -2+blocks.get("blocks["+sidebar.selected+"]::space::y");
		}
	}
	clear_blocks_selection();
	new_block("core.scales.shapes",x,y);
	draw_blocks();
	select_block_by_name("core.scales.shapes");
	redraw_flag.flag |= 2;
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
		set_sidebar_mode("edit_state");
	}else{
		if(usermouse.shift || patternpage.quantise_and_hold){
			if(state=="current") state = -1;//lol
			queue_quantised_notification(fire_block_state,state,block);
			patternpage.held_state_fires[block] = state;
			if(sidebar.selected==block) redraw_flag.flag |= 2; 
		}else{
			patternpage.held_state_fires[block] = null;
			var pv=[];
			if(state==-1) state = "current";
			pv = states.get("states::"+state+"::"+block);
			var m=0;
			if(blocks.contains("blocks["+block+"]::mute")) m=blocks.get("blocks["+block+"]::mute");
			mute_particular_block(block,pv[0]);
			for(var i=1;i<pv.length;i++){
				parameter_value_buffer.poke(1, MAX_PARAMETERS*block+i-1, pv[i]);
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
	redraw_flag.flag |= 4;
}

function fire_whole_state_btn_click(state,value){ //start timer, after a moment a slider appears
	//post("whole state btn click",state);
	if(!usermouse.shift){
		usermouse.drag.starting_x = usermouse.x;
		usermouse.drag.starting_y = usermouse.y;
		usermouse.drag.distance = 0;
		if((state_fade.selected>-2)&&(state_fade.last == -2)) state_fade.last = state_fade.selected;
		state_fade.selected = state;
		state_fade.position = -1;
		if(state>=-1) whole_state_xfade_create_task.schedule(LONG_PRESS_TIME);
	}
}

function create_whole_state_xfade_slider(state,value){
	state_fade.position=0;//1;
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
	//post("\nwhole state btn",state,value);
	if(usermouse.ctrl){
		if(state==-1){
			select_all();
		}else{
			sidebar.selected = state;
			//need to now select just the blocks that are in this state
			var stat = states.get("states::"+state);
			var sc_list = stat.getkeys();
			selected.block=[];
			set_sidebar_mode("edit_state");
			for(var i = MAX_BLOCKS;i>=0;i--) selected.block.push(0);
			for(var i = sc_list.length-1;i>=0;i--) selected.block[sc_list[i]]=1;
			post("\nselected these blocks",sc_list);
			redraw_flag.flag |= 8; //block_and_wire_colours();
		}
	}else if(usermouse.alt){
		reload_voicedata();
	}else{
		fire_whole_state(state);
	}
	if(state>-1){
		state_fade.lastcolour = statesbar.colours[state];
	}else{
		state_fade.lastcolour = [0,0,0];
	}
}


function fire_whole_state(state, value){
	if(state==-1) state="current";
	var stat = new Dict();
	stat = states.get("states::"+state);
	if(stat == null) return -1;
	var sc_list = stat.getkeys();
	if(!Array.isArray(sc_list)) sc_list=[+sc_list];
	for(var i=0;i<sc_list.length;i++){
		if(sc_list[i]!="static_mod") fire_block_state(state,sc_list[i]);
	}
}

function fade_state(){
	//post("\nfade whole state",state_fade.position);
	var pv=[];
	var state = state_fade.selected;
	if(state==-1) state="current";
	var stat = new Dict();
	stat = states.get("states::"+state);
	if(stat==null){
		error("tried to fade non-existent state");
		return 0;
	}
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
			//fade started at 1 (top) and ends at 0 (bottom) - 1 is the 'current state', 0 is the selected state.
			//this is now reversed back to a more logical start at 0 end at 1
			
			if((state_fade.position < 1) && (state_fade.end[b][0] == 1)) m = 1;
			if((state_fade.position == 1) && (state_fade.end[b][0] == 0)) m = 0;
			if((state_fade.position == 0)) m = state_fade.start[b][0];
			if(m>-1) mute_particular_block(b,m);
			for(var t=1;t<pv.length;t++){
				parameter_value_buffer.poke( 1, MAX_PARAMETERS*b+t-1, (state_fade.position)*state_fade.end[b][t] + (1-state_fade.position)*state_fade.start[b][t]);
			}
			if(state_fade.static_start[b]!=null){
				if(Array.isArray(state_fade.static_start[b])){
					var vl=voicemap.get(b);
					for(var t=0;t<state_fade.static_start[b].length;t++){
						if(Array.isArray(state_fade.static_start[b][t])){
							for(var x=0;x<pv.length;x++){
								if(state_fade.static_start[b][t][x]!=state_fade.static_end[b][t][x]){
									var y = (state_fade.position)*state_fade.static_end[b][t][x] + (1-state_fade.position)*state_fade.static_start[b][t][x];
									parameter_static_mod.poke( 1, MAX_PARAMETERS*vl[t]+x, y);
								}
							}
						}
					}
				}
			}
		}
	}
	redraw_flag.flag |= 2;
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
			post("parameter array",pv);
			if(states.contains("states::"+parameter+"::"+block)) states.remove("states::"+parameter+"::"+block);
			if(pv.length) states.replace("states::"+parameter+"::"+block,pv);
			blocks.replace("blocks["+block+"]::panel::enable",1);
			var vl = voicemap.get(block);
			if(vl==null){
				post("\nblock has no voices? failed to add to state");
				return -1;
			}
			if(!Array.isArray(vl)) vl=[vl];
			for(var i=0;i<vl.length;i++){
				post("\nsaving voice",vl[i],"state",parameter,"static mod",block,"::",i);
				//var voiceoffset = vl[i] + MAX_NOTE_VOICES*(type == "audio") + (MAX_NOTE_VOICES+MAX_AUDIO_VOICES)*(type == "hardware");
				var psm = parameter_static_mod.peek(1,MAX_PARAMETERS*vl[i],params.length);
				var c=0;
				for(var t=0;t<params.length;t++) c|=(psm[t]!=0);
				if(c){
					if(!states.contains("states::"+parameter+"::static_mod"))states.setparse("states::"+parameter+"::static_mod","{}");
					if(!states.contains("states::"+parameter+"::static_mod::"+block))states.setparse("states::"+parameter+"::static_mod::"+block,"{}");
					if(!states.contains("states::"+parameter+"::static_mod::"+block+"::"+i))states.setparse("states::"+parameter+"::static_mod::"+block+"::"+i,"{}");
					states.replace("states::"+parameter+"::static_mod::"+block+"::"+i,psm);
					//ideally, if you are going to write then you need to make sure you write zeroes to all the other ones that dont have an entry
					for(var s = -1;s<MAX_STATES;s++){
						var ss=s;
						if(ss==-1)ss="current";
						if(ss!=parameter){
							if((states.contains("states::"+ss))&&(!states.contains("states::"+ss+"::static_mod::"+block+"::"+i))){
								if(!states.contains("states::"+ss+"::static_mod"))states.setparse("states::"+ss+"::static_mod","{}");
								if(!states.contains("states::"+ss+"::static_mod::"+block))states.setparse("states::"+ss+"::static_mod::"+block,"{}");
								if(!states.contains("states::"+ss+"::static_mod::"+block+"::"+i))states.setparse("states::"+ss+"::static_mod::"+block+"::"+i,"{}");
								var ps2=[];
								for(var ps=psm.length;ps>=0;ps--)ps2.push(0);
								states.replace("states::"+ss+"::static_mod::"+block+"::"+i,ps2);
							}
						}
					}
				}else{
					//and if you're not, you should check and see if any of the other states have a static mod entry for this voice.
					for(var s = -1;s<MAX_STATES;s++){
						var ss=s;
						if(ss==-1)ss="current";
						if(ss!=parameter){
							if(states.contains("states::"+ss+"::static_mod::"+block+"::"+i)){
								states.replace("states::"+parameter+"::static_mod::"+block+"::"+i,psm);
							}
						}
					}
				}
			}
			if(parameter=="current"){
				state_fade.lastcolour = [0,0,0];
			}else{
				state_fade.lastcolour = statesbar.colours[parameter];
			}
			
			set_sidebar_mode("block");
		}
	}
}

function toggle_show_timer(parameter,value){
	if(usermouse.ctrl){
		set_timer_start = null;
		post("\nreset set timer");
	}else{
		if(value==null){
			set_timer_show = 1 - set_timer_show;
		}else{
			set_timer_show = value;
		}
		post("\nset show timer display mode:",set_timer_show);
	}
	redraw_flag.flag |= 2;
}

function reset_set_timer(){
	if(playing){
		var t = new Date();
		set_timer_start = t.getTime();
	}else{
		set_timer_start = null;
	}
	redraw_flag.flag |= 2;
}

function blocks_zoom_key(scroll){
	var xx = (2 * usermouse.x / mainwindow_width) - 1;
	var yy = (2 * usermouse.y / mainwindow_height) - 1;
	
	camera_position[2] = camera_position[2]-20*scroll;
	if(camera_position[2]<1.5)camera_position[2]=1.6;
	camera_position[0] += xx*scroll*7;
	camera_position[1] -= yy*scroll*7;//*0.5;
	messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
	messnamed("camera_control","position",  camera_position);
}

function show_vst_editor(parameter,value){
	var vlist = /*audio_*/voicemap.get(value);
	if(typeof vlist == "number") vlist = [vlist];
	for(i=0;i<vlist.length;i++){
		audio_poly.message("setvalue",  vlist[i]+1-MAX_NOTE_VOICES, "show_editor");
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
		return -sidebar.scroll.position/1500;
	}else if(value=="rel"){
		sidebar.scroll.position = Math.min(Math.max(0,sidebar.scroll.position-parameter*400),sidebar.scroll.max-0.01);
		redraw_flag.flag |= 2;
	}else{
		sidebar.scroll.position = Math.min(Math.max(0,-value*1500),sidebar.scroll.max-0.01);
		redraw_flag.flag |= 2;
	}
}
function scroll_waves(parameter,value){
	if(value=="get"){
		return -waves.scroll_position/5000;
	}else if(value=="rel"){
		waves.scroll_position = Math.min(Math.max(0,waves.scroll_position-parameter*100),mainwindow_height*(MAX_WAVES+2)/6-0.01);
		redraw_flag.flag |= 4;
	}else{
		waves.scroll_position = Math.min(Math.max(0,-value*5000),mainwindow_height*(MAX_WAVES+2)/6-0.01);
		redraw_flag.flag |= 4;
	}
}

function edit_pattern_name(parameter,value){
	if(parameter == "ok"){
		if(patternpage.patternbeingnamed[0]>-1){
			if((sidebar.text_being_edited!="")){
				blocks.replace("blocks["+patternpage.patternbeingnamed[0]+"]::patterns::names["+patternpage.patternbeingnamed[1]+"]",sidebar.text_being_edited);
				set_sidebar_mode("block");
				redraw_flag.flag |= 4;
			}	
		}		
	}
}

function edit_label(parameter,value){
	//post("\nok so",sidebar.text_being_edited);
	if(parameter == "ok"){
		var block = selected.block.indexOf(1);
		//post("bblock",block);
		if(block>-1){
			if(sidebar.text_being_edited!=""){
				blocks.replace("blocks["+block+"]::label",sidebar.text_being_edited);
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
//			if(sidebar.text_being_edited!=""){
				states.replace("names::"+state,sidebar.text_being_edited);
				set_sidebar_mode("none");
				redraw_flag.flag |= 4;
//			}	
		}		
	}
}
function edit_delete(){
	sidebar.text_being_edited = sidebar.text_being_edited.slice(0,-1);
	redraw_flag.flag |= 2;
}
function edit_typing(key){
	post("\ntyping,",key);
	var caps = 0;
	if(key==-2){
		key=46;
	}
	if(key>512) {
		caps=1;
		key-=512;
		key-=32;
	}
	if((key>45)&&(key<123)){
		sidebar.text_being_edited = sidebar.text_being_edited + String.fromCharCode(key);
	}
	redraw_flag.flag |= 2;
}

function edit_typing_with_spaces(key){
	if(key==-2){
		sidebar.text_being_edited = sidebar.text_being_edited+" ";
	}else{
		if(key>512) {
			caps=1;
			key-=512;
			// key-=32;
		}
		if((key>45)&&(key<123)){
			sidebar.text_being_edited = sidebar.text_being_edited + String.fromCharCode(key);
		}
	}
	redraw_flag.flag |= 2;
}

function edit_song_notes(key){
	post(/*"\ntyping,",*/key);
	var caps = 0;
	if(key==-2){
		sidebar.text_being_edited = sidebar.text_being_edited+" ";
	}else if(key==-4){
		sidebar.text_being_edited = sidebar.text_being_edited+"£";
	}else{
		post(String.fromCharCode(key));
		if(key>512) {
			caps=1;
			key-=512;
			//key-=32;
		}
		sidebar.text_being_edited = sidebar.text_being_edited + String.fromCharCode(key);
	}
	redraw_flag.flag |= 2;
}

function editted_song_notes(){
	post("\ndone.",sidebar.text_being_edited);
	set_sidebar_mode("none");
}
function static_mod_adjust(parameter,value){
	// post("\nstatic mod adj",parameter[0],parameter[1],parameter[2],value,mouse_index);
	//parameter holds paramno, blockno, voiceno
	var addr = parameter[2] * MAX_PARAMETERS + parameter[0];
	if(value=="get"){
		return parameter_static_mod.peek(1,addr);
	}else{
		if(usermouse.alt){
			//tilt
			vl = voicemap.get(parameter[1]);
			if(!Array.isArray(vl)) vl = [vl];
			hovvoice = vl.indexOf(parameter[2]);
			var diff = parameter_static_mod.peek(1,addr) - value;
			for(var i=0;i<vl.length;i++){
				var ii = hovvoice-i;
				ii *= diff;
				var ov = parameter_static_mod.peek(1,vl[i]*MAX_PARAMETERS+parameter[0]);
				parameter_static_mod.poke(1,vl[i]*MAX_PARAMETERS+parameter[0],ov+ii);
			}
		}else{
			//set value
			var t = parameter_value_buffer.peek(1,MAX_PARAMETERS*parameter[1]+parameter[0]);
			var t2 = t + Math.max(-1,Math.min(1,value));
			t2 = Math.max(0,Math.min(1,t2));
			t2 -= t;  //clip the value so that it + the param (at block level) value doesn't go off the edges
			// TODO DONT DO THIS IF PARAM WRAP IS ON
			parameter_static_mod.poke(1,addr,t2);
		}
		//rebuild_action_list = 1;
		if(((sidebar.mode=="block")||(sidebar.mode=="add_state")||(sidebar.mode=="settings"))){// && (parameter[1]==sidebar.selected)){
			redraw_flag.deferred|=1;
			redraw_flag.targets[parameter[0]]=2;
		}
		if((displaymode=="panels")&&(panelslider_visible[parameter[1]][parameter[0]])){
			redraw_flag.deferred|=16;
			redraw_flag.paneltargets[panelslider_visible[parameter[1]][parameter[0]]-MAX_PARAMETERS]=1;
		}
		if(sidebar.selected==automap.mapped_c) note_poly.message("setvalue", automap.available_c,"refresh");
	}
}

function static_mod_adjust_custom(parameter,value){
	// post("\nstatic mod adj",parameter[0],parameter[1],parameter[2],value,mouse_index);
	//parameter holds paramno, blockno, voiceno
	var addr = parameter[2] * MAX_PARAMETERS + parameter[0];
	if(value=="get"){
		return parameter_static_mod.peek(1,addr);
	}else{
		if(usermouse.alt){
			//tilt
			vl = voicemap.get(parameter[1]);
			if(!Array.isArray(vl)) vl = [vl];
			hovvoice = vl.indexOf(parameter[2]);
			var diff = parameter_static_mod.peek(1,addr) - value;
			for(var i=0;i<vl.length;i++){
				var ii = hovvoice-i;
				ii *= diff;
				var ov = parameter_static_mod.peek(1,vl[i]*MAX_PARAMETERS+parameter[0]);
				parameter_static_mod.poke(1,vl[i]*MAX_PARAMETERS+parameter[0],ov+ii);
			}
		}else{
			//set value
			var t = parameter_value_buffer.peek(1,MAX_PARAMETERS*parameter[1]+parameter[0]);
			var t2 = t + Math.max(-1,Math.min(1,value));
			t2 = Math.max(0,Math.min(1,t2));
			t2 -= t;  //clip the value so that it + the param (at block level) value doesn't go off the edges
			parameter_static_mod.poke(1,addr,t2);
		}
		// redraw_flag.flag|=2; //custom ui elements get update called every frame so you don't need to flag this
		// redraw_flag.deferred|=2;
	}
}

function static_mod_adjust_custom_opv_button(parameter,value){ // this version has the 'toggle all' fn.
	//post("\nstatic mod adj",parameter[0],parameter[1],parameter[2],value,mouse_index,"ctrl",usermouse.ctrl);
	//parameter holds paramno, blockno, voiceno
	if(usermouse.shift&&(!usermouse.ctrl)){ //EXPERIMENTAL: shift defers this kind of button push to quantised trigger on next bar.
		queue_quantised_notification(static_mod_adjust_custom_opv_button, parameter, value);
		return 0;
	}
	var addr = parameter[2] * MAX_PARAMETERS + parameter[0];
	if(value=="get"){
		return parameter_static_mod.peek(1,addr);
	}else{
		if(usermouse.ctrl){
			//turn off all others, toggle clicked.
			vl = voicemap.get(parameter[1]);
			if(!Array.isArray(vl)) vl = [vl];
			for(var i=0;i<vl.length;i++){
				var ov = parameter_static_mod.peek(1,vl[i]*MAX_PARAMETERS+parameter[0]);
				if(vl[i]!=parameter[2]){
					if(ov>=0.5) parameter_static_mod.poke(1,vl[i]*MAX_PARAMETERS+parameter[0],0);
				}else{
					parameter_static_mod.poke(1,vl[i]*MAX_PARAMETERS+parameter[0],((ov<0.5)|0)*0.99);
				}
			}
		}else{
			//set value
			var t = parameter_value_buffer.peek(1,MAX_PARAMETERS*parameter[1]+parameter[0]);
			var t2 = t + Math.max(-1,Math.min(1,value));
			t2 = Math.max(0,Math.min(1,t2));
			t2 -= t;  //clip the value so that it + the param (at block level) value doesn't go off the edges
			parameter_static_mod.poke(1,addr,t2);
		}
		// redraw_flag.flag|=2; //custom ui elements get update called every frame so you don't need to flag this
		// redraw_flag.deferred|=2;
	}
}


function data_edit(parameter,value){
	//post("\nDATA EDIT!!",parameter,"or",parameter[0],parameter[1],value);
	if(value=="get"){
		var clickset=0;
		if(parameter[1]) clickset = 1;
		usermouse.drag.release_on_exit = clickset;
		if(((SLIDER_CLICK_SET==0)&&(clickset==0))||(usermouse.shift==1)||(usermouse.alt==1)){
			return voice_data_buffer.peek(1,parameter[0]);
		}else{
			var newval;
			if(parameter[1]==1){
				newval = (parameter[3] - usermouse.y)/(parameter[3]-parameter[2]);
			}else if(parameter[1]==2){
				newval = (parameter[3] - usermouse.x)/(parameter[3]-parameter[2]);
			}
			newval = Math.min(1,Math.max(0,newval));
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

function do_parameter_toggle(parameter,value){
	value = 0.1 + 0.5*(value>0.5);
	// parameter_value_buffer.poke(1,parameter,value);
	request_set_block_parameter(parameter[1],parameter[0],2*value);
	var vc = voicemap.get(parameter[1]);
	if(!Array.isArray(vc)) vc=[vc];
	for(var i = 0;i<vc.length;i++){
		request_set_voice_parameter(parameter[1],vc[i],parameter[0],2*value);
	}
	redraw_flag.flag |= 2;
	//post("\ntoggled param",parameter[1],parameter[0],value,"voices",vc);
}

function request_set_block_parameter(block, parameter, value){
	//post("\n rsbp",block,parameter,value);
	var v = unscale_parameter(block,parameter,value);
	if(v == null) return -1;
	parameter_value_buffer.poke(1,MAX_PARAMETERS*block+parameter,v);
	if(block == sidebar.selected) redraw_flag.flag |= 2;
}
function request_set_voice_parameter(block,voice,parameter,value){
	var vcl = voicemap.get(block);
	if((!Array.isArray(vcl))||(vcl.length<=1)){ //if a block currently has just one voice then it sets the block param rather than the per voice offset
		request_set_block_parameter(block,parameter,value);
	}
	// post("\nrsvp",block,voice,parameter,value);
	var v = unscale_parameter(block,parameter,value);
	if(v == null) return -1;
	var bv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+parameter);
	parameter_static_mod.poke(1,MAX_PARAMETERS*voice+parameter,v-bv);
	if(block == sidebar.selected) redraw_flag.flag |= 2;
}

function unscale_parameter(block, parameter, value){
	var blockname = blocks.get("blocks["+block+"]::name");
	if(blockname == null) return 0;
	var p_type = blocktypes.get(blockname+"::parameters["+parameter+"]::type");
	var p_values = blocktypes.get(blockname+"::parameters["+parameter+"]::values");
	if(!Array.isArray(p_values)) return null;
	//post("\n\n\n\n",blockname,p_type,p_values,"value requested",value);
	if((p_type == "int")||(p_type == "float")||(p_type == "float4")||(p_type == "note")){ //anything but menus
		var pv = (value - p_values[1])/(p_values[2]-p_values[1]);
		//post("\nrescaled first:",pv);
		if(p_values[0]== "bi"){
			pv -= 0.5;
			pv *= 2;
		}
		if(p_values[3] == "exp"){
			if(pv>=0){
				pv = Math.log(pv+1)/Math.log(2);
			}else{
				pv = -Math.log(-pv+1)/Math.log(2);
			}
		}else if(p_values[3] == "exp10"){
			if(pv>=0){
				pv = (Math.log(pv*9 + 1))*0.434294; //this magic number = 1/ln(10)
			}else{
				pv = -(Math.log(-pv*9 + 1))*0.434294;
			}
		}else if(p_values[3] == "exp100"){
			if(pv>=0){
				pv = (Math.log(pv*99 + 1))*0.2171472// /Math.log(100); //(Math.pow(100, pv) - 1)*0.01010101010101010101010101010101;
			}else{
				pv = -(Math.log(-pv*99 + 1))*0.2171472//-0.01010101010101010101010101010101*(Math.pow(100, -pv) - 1);
			}
		}else if(p_values[3] == "exp1000"){
			if(pv>=0){
				pv = (Math.log(pv*999 + 1))*0.14476482// (Math.pow(1000, pv) - 1)*0.001001001001001001001001001001;
			}else{
				pv = -(Math.log(-pv*999 + 1))*0.14476482//-0.001001001001001001001001001001*(Math.pow(1000, -pv) - 1);
			}
		}else if(p_values[3] == "exp.1"){
			if(pv>=0){
				//pv = -1.1111111111111111111111111111111*(Math.pow(0.1, pv) - 1);
				pv = (Math.log(1 + (-pv*0.9))*-0.4342944819);
			}else{
				pv = -(Math.log(1 + (pv*0.9))*-0.4342944819);
			}
		}else if(p_values[3] == "exp.01"){
			if(pv>=0){
				//pv = -1.010101010101010101010101010101*(Math.pow(0.01, pv) - 1);
				pv = (Math.log(1 + (-pv*0.99))*-0.2171472);
			}else{
				// pv = 1.010101010101010101010101010101*(Math.pow(0.01, -pv) - 1);
				pv = -(Math.log(1 + (pv*0.99))*-0.2171472);
			}
		}else if(p_values[3] == "exp.001"){
			if(pv>=0){
				// pv = -1.001001001001001001001001001001*(Math.pow(0.001, pv) - 1);
				pv = (Math.log(1 + (-pv*0.999))*-0.14476482);
			}else{
				// pv = 1.001001001001001001001001001001*(Math.pow(0.001, -pv) - 1);
				pv = -(Math.log(1 + (pv*0.999))*-0.14476482);
			}
		}else if(p_values[3] == "s"){
			pv = 0.5 - 0.5 * Math.acos(pv*PI);
		}
		if(p_values[0]== "bi"){
			pv += 1;
			pv *= 0.5;
		}
		//post("uncurved",pv);
		return pv;
	}else{
		//post("\nit's a menu, there are ",p_values.length," items");
		var test = p_values.indexOf(value);
		if(test!=-1){
			post("\nfound a string match,",test);
			return test/p_values.length;
		}else{
			test = value;
			//post("\nnumber received,",test,p_values[test]);
			return test/p_values.length;
		}
	}
}


function qwertymidi_octave(parameter, value){
	if(value=="get"){
		var oct = parameter_value_buffer.peek(1,MAX_PARAMETERS * automap.available_k_block + 9);
		return(oct);
	}else{
		value = Math.max(0,Math.min(0.9999999,value));
		parameter_value_buffer.poke(1, MAX_PARAMETERS * automap.available_k_block + 9, value);
		redraw_flag.flag |= 2;
	}
}

function automap_q_gain(parameter,value){
	if(value=="get"){
		return(automap.q_gain);
	}else{
		value = Math.max(0,Math.min(1,value));
		automap.q_gain = value;
		set_automap_q(automap.q_gain);
		redraw_flag.flag |= 2;
	}	
}
function select_q_output(parameter,value){
	set_automap_q(0);
	post("\nset output:",parameter);
	automap.mapped_q_output = parameter;
	automap.mapped_q = -1;
	automap.mapped_q_channels = [];
	sidebar.dropdown=null;
	redraw_flag.flag |= 2;
}
	
function automap_undo_point(p,v){
	var s = (p<0);
	p = Math.abs(p);
	if(usermouse.last.scroll != p){
		//post("\nautomap undo point stored for",automap.mapped_c,p,v);
		usermouse.last.scroll = p;
		if(um_task == null){
			um_task = new Task(um_scroll_wait,this,0);
		}else{
			um_task.cancel();
		}
		um_task.schedule(1000);
		//store undo
		if(s){ // ONLY IF SELECTION HAS CHANGED OR THERE@S BEEN A PAUSE
			store_voice_param_undo(p,automap.mapped_c,v);
		}else{
			store_param_undo(p,automap.mapped_c,v);
		}
	}
}

function store_param_undo(parameter,block,value){
	//post("\nstoring undo, block:",block," p:",parameter, " v:", value);
	var usz=undo_stack.getsize("history")|0;
	undo_stack.append("history",'{}');
	undo_stack.setparse("history["+usz+"]", '{ "actions" : { "parameter" : {} } }');
	undo_stack.replace("history["+usz+"]::actions::parameter::block", +block);
	undo_stack.replace("history["+usz+"]::actions::parameter::parameter", +parameter);
	undo_stack.replace("history["+usz+"]::actions::parameter::value", +value);
}

function store_voice_param_undo(parameter,voice,value){
	//post("\nstoring undo, voice:",voice," p:",parameter, " v:", value);
	var usz=undo_stack.getsize("history")|0;
	undo_stack.append("history",'{}');
	undo_stack.setparse("history["+usz+"]", '{ "actions" : { "voice_parameter" : {} } }');
	undo_stack.replace("history["+usz+"]::actions::voice_parameter::voice", +voice);
	undo_stack.replace("history["+usz+"]::actions::voice_parameter::parameter", +parameter);
	undo_stack.replace("history["+usz+"]::actions::voice_parameter::value", +value);
}

function sidebar_parameter_knob(parameter, value){
	// post("\nsidebar parameter knob P: ",parameter,"  V:",value);
	// post("bufferpos",MAX_PARAMETERS*parameter[1]+parameter[0]);
	if(value=="get"){
		//also: look up if this slider is set to clickset mode
		var clickset=0;
		if((Array.isArray(parameter))&&(Array.isArray(paramslider_details[parameter[0]]))){
			if(paramslider_details[parameter[0]][18]) clickset = 1;
			usermouse.drag.release_on_exit = clickset;
		}
		if((usermouse.ctrl)&&(usermouse.got_t == 2)){ // this bit is for touch - if you hold ctrl and touch a different bit of fader it won't have changed selection yet
			var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
			if(current_p>1){
				var sl_no = mouse_click_parameters[usermouse.got_i][0];
				var x1 = paramslider_details[sl_no][0];
				var x2 = paramslider_details[sl_no][2];
				var p = blocks.get("blocks["+mouse_click_parameters[usermouse.got_i][1]+"]::poly::voices");
				var vh = Math.floor(p*(usermouse.x - x1)/(x2 - x1));
				if(sidebar.selected_voice != vh){
					if((CTRL_VOICE_SEL_MOMENTARY)&&(sidebar.selected_voice==-1)) usermouse.ctrl_voice_select = 1;
					sidebar.selected_voice = vh;
					redraw_flag.flag |= 10;
					usermouse.left_button = 0; // this makes it start a new drag next frame
				}
				post("\ntouch safety code activated(?)");
			}
		}
		if(((SLIDER_CLICK_SET==0)&&(clickset==0))||(usermouse.shift==1)||(usermouse.alt==1)){
			return parameter_value_buffer.peek(1, MAX_PARAMETERS*parameter[1]+paramslider_details[parameter[0]][9]);
		}else{
			//TODO if paramslider_details[][18] == 2 then use x instead
			var newval;
			if(paramslider_details[parameter[0]][18]==2){
				newval = (usermouse.x - paramslider_details[parameter[0]][2])/(paramslider_details[parameter[0]][0]-paramslider_details[parameter[0]][2]);
			}else{
				newval = (usermouse.y - paramslider_details[parameter[0]][3])/(paramslider_details[parameter[0]][1]-paramslider_details[parameter[0]][3]);
			}
			//post("\nsetting the slider to",newval);
			if(typeof newval == "number") parameter_value_buffer.poke(1, MAX_PARAMETERS*parameter[1]+paramslider_details[parameter[0]][9],newval);
			redraw_flag.deferred|=1;
			return newval;
		}
	}else{
		//set value
		if(!usermouse.shift&&(parameter[2]==1)){
			value = (100+value) % 1;
		}else{
			value = Math.max(0,Math.min(0.9999999,value));
		}
		parameter_value_buffer.poke(1, MAX_PARAMETERS*parameter[1]+paramslider_details[parameter[0]][9],value);
		if(((sidebar.mode=="block")||(sidebar.mode=="add_state")||(sidebar.mode=="settings")) && (parameter[1]==sidebar.selected)){
			redraw_flag.deferred|=1;
			redraw_flag.targets[parameter[0]]=2;
		}
		if((displaymode=="panels")&&(panelslider_visible[parameter[1]][paramslider_details[parameter[0]][9]])){
			redraw_flag.deferred|=16;
			redraw_flag.paneltargets[panelslider_visible[parameter[1]][paramslider_details[parameter[0]][9]]-MAX_PARAMETERS]=1;
		}
		if(sidebar.selected==automap.mapped_c) note_poly.message("setvalue", automap.available_c,"refresh");
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

function new_block_via_button(block){
	new_block(block, blocks_page.rightmost+1, blocks_page.highest);
}

function set_block_record_arm(block,x){
	var tt = blocks.get("blocks["+block+"]::type");
	if(((config.get("ENABLE_RECORD_HARDWARE")==1) && (tt=="hardware"))){
		var n = blocks.get("blocks["+block+"]::name");
		if(blocktypes.contains(n+"::connections::out::hardware")) tt="audio";
	}
	if(tt=="audio"){
		if(x==0){
			record_arm[block] = 0;
		}else if(x==1){
			record_arm[block] = 1;
		}else{
			record_arm[block] = 1 - record_arm[block];
		}
		if(record_arm[block]==0){
			if(blocks.contains("blocks["+block+"]::record_arm")){
				blocks.remove("blocks["+block+"]::record_arm");
			}
		}else{
			blocks.replace("blocks["+block+"]::record_arm", 1);
		}
		redraw_flag.flag |= 10;
		send_record_arm_messages(block);
	}
	recording_flag = ((record_arm.indexOf(1)!=-1)+2*(config.get("RECORD_FOLDER")!=""));
	//so it's 3 if you're good to go, it's <2 if you don't have a folder to write to
}

function send_record_arm_messages(block){
	//makes up filenames for all armed blocks, sends them out.
	var da = new Date();
	var tt = blocks.get("blocks["+block+"]::type");
	var path = config.get("RECORD_FOLDER");
	if((path=="")||(path=="auto")){
		path = SONGS_FOLDER;
		error("\nno record folder set so i'm recording into the songs folder.");
	}
	if((loading.songname == "autoload")||(loading.songname=="")){
		path = path + "untitled";
	}else{
		path = path + loading.songname;
	}
	path = path + "-" + blocks.get("blocks["+block+"]::label") + "-" +(da.getMonth()+1) + "-" + da.getDate() + "-" + da.getHours()+"-"+da.getMinutes();
	//post("\npath is ",path);
	if(tt=="audio"){
		var vl = voicemap.get(block);
		if(!Array.isArray(vl)) vl = [vl];
		for(var i =0; i<vl.length;i++){
			//post("\ntell voice",vl[i],"that record is set to",record_arm[block]);
			if(record_arm[block]){
				audio_poly.message("setvalue", vl[i]+1-64,"filename",path);
			}else{
				audio_poly.message("setvalue", vl[i]+1-64,"filename","off");
			}
		}
	}else if(tt == "hardware"){
		var gate = this.patcher.getnamed("hw_rec_gate_"+blocks.get("blocks["+block+"]::name"));
		gate.message("int", record_arm[block]);
		if(record_arm[block]){
			var rec = this.patcher.getnamed("hw_rec_"+blocks.get("blocks["+block+"]::name"));
			rec.message("open","wave",path+".wav");
		}
	}
}

function open_dropdown(id){
	if(sidebar.dropdown != id){
		sidebar.dropdown = id;
		redraw_flag.flag |= 2;
	}else{
		sidebar.dropdown = null;
		redraw_flag.flag |= 2;
	}
}

function set_block_mode(setting,p){
	var block;
	if(sidebar.mode=="wire"){
		block = selected.wire.indexOf(1);
		block = connections.get("connections["+block + "]::to::number");
	}else{
		block = sidebar.selected;
	}
	var target = "blocks["+block+"]::";
	if(setting=="stack"){
		target = target+"poly::stack_mode";
		blocks.replace(target,poly_alloc.stack_modes[p]);
		voicealloc_poly.message("setvalue", (block+1),"stack_mode",p);  //1x
	}else if(setting=="choose"){
		target = target+"poly::choose_mode";
		blocks.replace(target,poly_alloc.choose_modes[p]);
		voicealloc_poly.message("setvalue", (block+1),"choose_mode",p); //cycle free
	}else if(setting=="steal"){
		target = target+"poly::steal_mode";
		blocks.replace(target,poly_alloc.steal_modes[p]);
		voicealloc_poly.message("setvalue", (block+1),"steal_mode",p);  //oldest
	}else if(setting=="latching"){
		target = target+"poly::latching_mode";
		blocks.replace(target,p);
		//need to tell the voices
		var vl = voicemap.get(block);
		if(!Array.isArray(vl))vl=[vl];
		if((vl[0])<MAX_NOTE_VOICES){
			for(var v=0;v<vl.length;v++){
				note_poly.message("setvalue", 1+vl[v],"voice_is",vl[v]);
				get_voice_details(vl[v]);
			}
		}else if((vl[0])<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
			for(var v=0;v<vl.length;v++){
				audio_poly.message("setvalue", 1+vl[v],"voice_is",vl[v]-MAX_NOTE_VOICES);
				get_voice_details(vl[v]);
			}
		}
	}
	sidebar.dropdown=null;
	redraw_flag.flag |= 2;

}

function cycle_block_mode(block,setting){
	var target = "blocks["+block+"]::";
	var p;
	if(setting=="stack"){
		target = target+"poly::stack_mode";
		p = poly_alloc.stack_modes.indexOf(blocks.get(target));
		p = (p+1) % poly_alloc.stack_modes.length;
		blocks.replace(target,poly_alloc.stack_modes[p]);
		voicealloc_poly.message("setvalue", (block+1),"stack_mode",p);  //1x
	}else if(setting=="choose"){
		target = target+"poly::choose_mode";
		p = poly_alloc.choose_modes.indexOf(blocks.get(target));
		p = (p+1) % poly_alloc.choose_modes.length;
		blocks.replace(target,poly_alloc.choose_modes[p]);
		voicealloc_poly.message("setvalue", (block+1),"choose_mode",p); //cycle free
	}else if(setting=="steal"){
		target = target+"poly::steal_mode";
		p = poly_alloc.steal_modes.indexOf(blocks.get(target));
		p = (p+1) % poly_alloc.steal_modes.length;
		blocks.replace(target,poly_alloc.steal_modes[p]);
		voicealloc_poly.message("setvalue", (block+1),"steal_mode",p);  //oldest
	}else if(setting=="return"){
		target = target+"poly::return_mode";
		p = blocks.get(target);
		p = 1 - p;
		blocks.replace(target,p);
		voicealloc_poly.message("setvalue", (block+1),"return_mode",p);  //oldest
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
				note_poly.message("setvalue", 1+vl[v],"voice_is",vl[v]);
				get_voice_details(vl[v]);
			}
		}else if((vl[0])<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
			for(var v=0;v<vl.length;v++){
				audio_poly.message("setvalue", 1+vl[v],"voice_is",vl[v]-MAX_NOTE_VOICES);
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

function mixermutes(m){
	mix_block_has_mutes = m;
	redraw_flag.flag |= 2;
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
	redraw_flag.flag = 10;
	if(av==0) messnamed("unmute_all","bang");
}

function mute_selection(action){
	if(selected.wire.indexOf(1)>-1){
		connection_mute_selected(action,null);
	}
	if(selected.block.indexOf(1)>-1){
		mute_selected_block(action);
	}
}

function individual_multiselected_block(b){
	//this is clicks in the list of multiple selected blocks
	//shift click - unselect
	if(usermouse.shift){
		selected.block[b] = 0;
		redraw_flag.flag |= 10;
	}
	//ctrl click - mute
	if(usermouse.ctrl){
		mute_particular_block(b,-1);
	}
	//alt click - bypass?
	if(usermouse.alt){
		bypass_particular_block(b, -1);
	}
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
	if(blocks.get("blocks["+block+"]::type")=="hardware") return -1; //hardware can't be bypassed, too complicated
//	if(av==1) anymuted=1; //does bypass count as mute? do we want unmute all to unbypass all?
	blocks.replace("blocks["+block+"]::bypass",av);
	if(blocks.get("blocks["+block+"]::type")=="audio"){
		list = voicemap.get(block);
		if(typeof list === 'number'){
			audio_poly.message("setvalue",  list+1-MAX_NOTE_VOICES, "bypass",av);
		}else{
			for(var t=0;t<list.length;t++){
				audio_poly.message("setvalue",  list[t]+1-MAX_NOTE_VOICES, "bypass",av);
			}					
		}
	}else{
		list = voicemap.get(block);
		if(list === null){
			post("\n\nERROR: couldn't find block "+block+" in the voicemap list\n\n");
		}else if(typeof list === 'number'){
			note_poly.message("setvalue",  list+1, "bypass",av);
		}else{
			for(var t=0;t<list.length;t++){
				note_poly.message("setvalue",  list[t]+1, "bypass",av);
			}					
		}
	}
	redraw_flag.flag = 8;
}

function mute_particular_block(block,av){ // i=block, av=value, av=-1 means toggle
	patternpage.held_pattern_fires[block]=null;
	patternpage.held_state_fires[block]=null;
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
	if(still_checking_polys&7) return 0;
	if(type=="audio"){
		list = voicemap.get(block);
		if(typeof list === 'number'){
			audio_poly.message("setvalue",  list+1-MAX_NOTE_VOICES, "muteouts",av);
		}else{
			for(var t=0;t<list.length;t++){
				audio_poly.message("setvalue",  list[t]+1-MAX_NOTE_VOICES, "muteouts",av);
			}					
		}
	}else if(type == "note"){
		list = voicemap.get(block);
		if(list === null){
			post("\n\nERROR: couldn't find block "+block+" in the voicemap list\n\n");
		}else if(typeof list === 'number'){
			note_poly.message("setvalue",  list+1, "muteouts",av);
		}else{
			for(var t=0;t<list.length;t++){
				note_poly.message("setvalue",  list[t]+1, "muteouts",av);
			}					
		}
	}else if(type == "hardware"){
		//actually needs to mute or unmute the audio/midi connections for hw blocks
		// first the signal from the hardware to benny
		for(var t=0;t<connections.getsize("connections");t++){
			if(connections.contains("connections["+t+"]::from") && (connections.get("connections["+t+"]::from::number") == block)){
				// then mute it or unmute it (if the connection itself is not muted)
				if((connections.get("connections["+t+"]::conversion::mute")==0) && (connections.get("connections["+t+"]::from::output::type") == "hardware")){
					make_connection(t,1);
				}
			}
		}
		// and if the block doesn't have hw->benny, mute the signals the other way
		if(!blocktypes.contains(blocks.get("blocks["+block+"]::name")+"::connections::out::hardware")){
			// post("\nthis block is just an output, right?");
			for(var t=0;t<connections.getsize("connections");t++){
				if(connections.contains("connections["+t+"]::to") && (connections.get("connections["+t+"]::to::number") == block)){
					// then mute it or unmute it (if the connection itself is not muted)
					if((connections.get("connections["+t+"]::conversion::mute")==0) && (connections.get("connections["+t+"]::to::input::type") == "hardware")){
						make_connection(t,1);
					}
				}
			}
		}

		//and also if the block has a generic midi handler (or whatever) loaded in a note slot, send that a mute message
		list = voicemap.get(block);
		if(list === null){
			//hw block has no midi handler
		}else if(typeof list === 'number'){
			note_poly.message("setvalue",  list+1, "muteouts",av);
		}else{
			for(var t=0;t<list.length;t++){
				note_poly.message("setvalue",  list[t]+1, "muteouts",av);
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
						redraw_flag.flag |= 4;
						post("\n\n\nemergency exitting infinite-looking recursion loop. how did that happen? you should file a bug report\n\n\n")
						return(0);
					}else{
						mute_particular_block(b,0);
					}
				}
			}
		}
	}	
	redraw_flag.flag = 10;
}


function process_drag_selection(){
	var sts = screentoworld(usermouse.drag.starting_x,usermouse.drag.starting_y);
	var stw = screentoworld(usermouse.x,usermouse.y);
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
		make_connection(pm[0],1);
		if(pn[2]=="mute"){
			//draw_wire(pm[0]);
			redraw_flag.flag |= 8;
		}
		sidebar.lastmode="recalculate";
		redraw_flag.flag |= 2;
	}
}

function connection_mute_selected(parameter,value){
	var i=connections.getsize("connections");
	//post("\nmute sel conns",i,parameter,value);
	if(parameter==0){//unmute all
		for(;i>=0;--i){
			if(selected.wire[i]) connection_edit("connections["+i+"]::conversion::mute",0);
		}	
	}else if(parameter==1){ //mute all
		for(;i>=0;--i){
			if(selected.wire[i]) connection_edit("connections["+i+"]::conversion::mute",1);
		}	
	}else if(parameter==-1){ //toggle all
		for(;i>=0;--i){
			if(selected.wire[i]){
				var m=connections.get("connections["+i+"]::conversion::mute");
				connection_edit("connections["+i+"]::conversion::mute",!m);
			}
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
	//post("existing list",fplist);
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
	redraw_flag.flag |= 4;	
}

function cycle_automap_offset(p,v){
	if(automap.mapped_c!=-1){
		if(p>0){
			automap.offset_c++;
			if(automap.offset_c > automap.offset_range_c) automap.offset_c = 0;
		}else if(p<0){
			automap.offset_c--;
			if(automap.offset_c < 0) automap.offset_c = automap.offset_range_c;
		}else{
			automap.offset_c=0;
			automap.mapped_c=-1;
		}
		note_poly.message("setvalue", automap.available_c, "automap_offset", automap.offset_c * automap.c_cols );
		//automap.offset_range_c = -automap.offset_range_c; //this flags a remapping
		redraw_flag.flag |= 2;
	}
}

function set_automap_k_input(parameter,value){
	sidebar.dropdown = null;
	redraw_flag.flag |= 2;
	automap.inputno_k = parameter;
	note_poly.message("setvalue",  automap.available_k, "maptargetinput", automap.inputno_k);
}

function select_block_by_name(parameter,value){
	for(var i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			if(blocks.get("blocks["+i+"]::name")==parameter){
				clear_blocks_selection();
				selected.block[i] = 1;
				return i;
			}
		}
	}
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
		if(match==2){ //if assigned to Z -> unassign
		}else if((match==1)&&(fplist[2]!=-1)){ //if it was Y, but something else is Z, then unassign
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
	redraw_flag.flag |= 4;
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
	//post("\n you clicked a meter, type:",type,"number",number);
	clear_blocks_selection();
	if(type == "in"){
		set_sidebar_mode("input_scope");
	}else if(type == "out"){
		set_sidebar_mode("output_scope");
	}else if(type == "midi"){
		set_sidebar_mode("midi_indicators");
		number = -1;
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
		redraw_flag.flag = 2;
	}
}

function quantise_and_hold_button(state){
	patternpage.quantise_and_hold = state;
}

var capturetask, capturetask2;
function capture_controller_loop_button(state,block){
	//post("\ncapture controller loop, state:",state,"for block",block);
	if(block == null){
		capture.target = automap.available_c;
	}else{
		capture.target = block+1;
	}
	if(state != 0 ){
		capture.controller = 1;
		capturetask = new Task(capture_button, this, 0);
		capturetask.schedule(400);
	}else{
		if(capture.controller){
			capture.controller = 0;
			capturetask.cancel();
			capturetask.freepeer();
			// post("\n[c] short press, send the message to the controller that it should loop the last bar");
			note_poly.message("setvalue",capture.target,"loop_on");
		}else{
			// post("\n[c] it's already recording, stop it");
			note_poly.message("setvalue",capture.target,"loop_end");
		}
	}
	redraw_flag.flag |= 2;
}

function controller_looper_button(p,v){
	capture_controller_loop_button(usermouse.left_button,automap.available_c-1);
}
function keyboard_looper_button(p,v){
	capture_keyboard_loop_button(usermouse.left_button,automap.available_k-1);
}

function controller_stop_loop(p,v){
	note_poly.message("setvalue",capture.target,"loop_stop");
}
function keyboard_stop_loop(p,v){
	note_poly.message("setvalue",automap.available_k,"loop_stop");
}

function loopstatus(type,state){
	if(type=="controller"){
		if(automap.looping_c != state) redraw_flag.flag |= 2;
		automap.looping_c = state;
	}else if(type=="keyboard"){
		if(automap.looping_k != state) redraw_flag.flag |= 2;
		automap.looping_k = state;
	}
}
function request_spawn_player(block,auto){
	note_poly.message("setvalue",block,"spawn_player");
}

function controller_spawned_loop_targets(){
	var targets = arrayfromargs(arguments);
	automap.targetslist = targets.concat();
	post("\nspawn mapping targets list received:",targets);
}

function capture_keyboard_loop_button(state){
	if(state != 0 ){
		capture.keyboard = 1;
		capturetask2 = new Task(capture_button, this, 0);
		capturetask2.schedule(200);
	}else{
		if(capture.keyboard){
			capture.keyboard = 0;
			capturetask2.cancel();
			capturetask2.freepeer();
			// post("\n[k] short press, send the message to the keyboard that it should loop the last bar");
			note_poly.message("setvalue",automap.available_k, "loop_on");
		}else{
			// post("\n[k] it's already recording, stop it");
			note_poly.message("setvalue",automap.available_k, "loop_end");
		}
	}
}

function capture_button(){
	if(capture.controller){
		capture.controller = 0;
		// post("\n[c] start recording, from 200ms ago");
		note_poly.message("setvalue",capture.target,"loop_start");
	}else if(capture.keyboard){
		capture.keyboard = 0;
		// post("\n[k] start recording, from 200ms ago");
		note_poly.message("setvalue",automap.available_k,"loop_start");
	}
}

function automap_default(a){
	if(sidebar.selected != -1){
		if(a<0){
			//post("\nTHIS IS STATIC MOD RESET",a,b);
			parameter_static_mod.poke(1,-a,0);
			note_poly.message("setvalue", automap.available_c,"refresh");
		}else{
			parameter_value_buffer.poke(1,a,param_defaults[sidebar.selected][a-MAX_PARAMETERS*sidebar.selected]);
			note_poly.message("setvalue", automap.available_c,"refresh");
		}
	}
}

function file_menu_enter(){
	load_song();
}

function select_song(song){
	if((usermouse.timer>0)&&(song==currentsong)&&(!playing)){
		usermouse.timer=0;
		load_song();
	}else{
		currentsong = song;
		usermouse.timer = DOUBLE_CLICK_TIME;
		post("\n song info",songs_info[currentsong]);
		redraw_flag.flag |= 2;
	}
}

function wave_chosen(number,name,path){
	if((name == null)||(name=="")){
		error("\nfilename error:",name,path);
		error("\nplease rename the file, avoiding special characters like / \ *");
		waves.selected = -1;
		timed_sidebar_notification("FILENAME ERROR. Please rename the file, avoiding special characters like / \ *",5000);
		return -1;
	}
	var t = polybuffer_load_wave(path,name);
	if(t==-2){
		post("\n load fail");
		return -1;
	}else if(t==-1){
		t = waves_polybuffer.count;
	}else{
		t++;
	}
	buffer_loaded(number,path,name,"waves."+t);
}

function load_wave(parameter,value){
	post("loading a wave file into buffer slot",parameter);
	waves.selected = parameter;
	extend_waves_dict(waves.selected+1);
	messnamed("choose_and_read_wave",parameter);
	//waves_buffer[parameters].replace;
}

function setup_waves(parameter,value){
	if(value=="get"){
		return 10*waves_dict.get("waves["+parameter[0]+"]::"+parameter[1]);
	}else{
		if(!isNaN(value)){
			var cv = Math.max(0,Math.min(1,0.1*value));
			waves_dict.replace("waves["+parameter[0]+"]::"+parameter[1],cv);
			store_wave_slices(parameter[0]);
			messnamed("wave_updated",parameter[0]);
		}
		if((cv<waves.zoom_start)||(cv>waves.zoom_end)){
			var wzs = waves.zoom_start;
			if(parameter[1]=="start"){
				var l = waves.zoom_end-waves.zoom_start;
				waves.zoom_start = Math.min(1-0.7*l, Math.max(0,cv - 0.3*l));
				waves.zoom_end = l + waves.zoom_start;
			}else if(parameter[1]=="end"){
				var l = waves.zoom_end-waves.zoom_start;
				waves.zoom_end = Math.max(0.7*l, Math.min(1,cv+0.3*l));
				waves.zoom_start = waves.zoom_end - l;
			}
			if(wzs!=waves.zoom_start){
				draw_wave_z[waves.selected] = [[],[],[],[]];
			}
		}
		redraw_flag.flag |= 4;
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

function q_player_release_check(){
	if(waves.q_playing==1){
		if((usermouse.left_button == 0)||(usermouse.qlb==0)){
			// messnamed("q_player","stop");
			waves.q_player.message("stop");
			waves.q_playing = 0;
			q_player_release_task.freepeer();
		}else{
			q_player_release_task.schedule(135);   
			// deferred_diag.push("mice"+usermouse.left_button+" "+usermouse.qlb);
		}
	}else{
		q_player_release_task.freepeer();
		waves.q_playing = 0;
	}
}

function zoom_waves(parameter,value){
	if(value=="get"){
		waves.drag_start_x = usermouse.x;
		waves.drag_start_y = usermouse.y;
		if((automap.available_q!=-1)&&(automap.lock_q<=0)){
			set_automap_q(0);
			automap.mapped_q=-0.5;
			var x = (usermouse.x - waves.w_helper[waves.selected][0])/(waves.w_helper[waves.selected][2]-waves.w_helper[waves.selected][0]);
			x *= (waves.zoom_end-waves.zoom_start);
			x += waves.zoom_start;
			x *= waves_dict.get("waves["+(waves.selected+1)+"]::size"); //size>>ms, which is what play~ wants. length=samples, which groove would take.
			// post("\nQ MESSAGE",waves_dict.get("waves["+(waves.selected+1)+"]::buffername"),"play",x);
			if(waves.q_playing == 1){
				// messnamed("q_player","stop");
				waves.q_player.message("stop");
			}
			// messnamed("q_player","set",waves_dict.get("waves["+(waves.selected+1)+"]::buffername"));
			waves.q_player.message("set",waves_dict.get("waves["+(waves.selected+1)+"]::buffername"));
			waves.q_player.message("start",x);
			// messnamed("q_player","start",x);
			// deferred_diag.push("start "+x);
			// post("\nTODO schedule check for mouseup so that you can stop the preview player");
			waves.q_playing=1;  
			q_player_release_task = new Task(q_player_release_check, this);
			q_player_release_task.schedule(205);  
		}
		return 0;
	}else if(value=="all"){
		waves.zoom_start = 0;
		waves.zoom_end = 1;
		draw_wave_z[waves.selected] = [[],[],[],[]];
		redraw_flag.flag |= 4;
	}else{
		var wzs = waves.zoom_start;
		var wze = waves.zoom_end;
		var dx=0;
		var dy=0;
		if(value=="zoom"){
			dy = parameter;
			dy *= Math.sqrt(waves.zoom_end - waves.zoom_start);
		}else if(value=="pan"){
			dx = parameter;
		}else{
			//this is how piano roll does it but:
			dx = usermouse.x - waves.drag_start_x;
			dy = usermouse.y - waves.drag_start_y;
			if((dx==0)&&(dy==0)&&(value!=0)){
				if(usermouse.shift){
					dx = -10000*value;
				}else{
					dy = -1000*value;
				}
			}
		}
		var dir = 0;
		if(Math.abs(dx)<Math.abs(dy)) dir = 1;
		if(dir==0){
			var l = (waves.zoom_end - waves.zoom_start);
			var p = (0.1+l)/(waves.width*1.1);
			p *= dx;
			waves.zoom_start += p;
			waves.zoom_start = Math.min(Math.max(0,waves.zoom_start),1-l);
			waves.zoom_end = waves.zoom_start + l;
			waves.drag_start_y = usermouse.y;
			waves.drag_start_x = usermouse.x;
		}else{
			var l = (waves.zoom_end - waves.zoom_start);
			var xx = (usermouse.x-fontheight*1.1-9)/waves.width;
			dy*=0.01;
			waves.zoom_start += l*xx*dy;
			waves.zoom_end -= l*(1-xx)*dy;
			waves.zoom_end = Math.max(waves.zoom_start+0.00001,waves.zoom_end);
			waves.zoom_end = Math.min(waves.zoom_end, 1);
			waves.zoom_start = Math.min(waves.zoom_end-0.00001,waves.zoom_start);
			waves.zoom_start = Math.max(waves.zoom_start,0);
			waves.zoom_scale = 1/(waves.zoom_end - waves.zoom_start);
			waves.drag_start_x = usermouse.x;
			waves.drag_start_y = usermouse.y;
		}
		if((wze!=waves.zoom_end)||(wzs!=waves.zoom_start)){
			draw_wave_z[waves.selected] = [[],[],[],[]];
			waves.w_helper[waves.selected][4]=waves.zoom_start;
			waves.w_helper[waves.selected][5]=waves.zoom_end;
		}
		redraw_flag.flag |= 4;
	}
}

function wave_stripe_click(parameter,value){
	//	post("\nstripe click",parameter,value);
	redraw_flag.flag |= 4;
	if(	waves.selected != parameter){
		if(usermouse.scroll!=0){
			waves.scroll_position -= fontheight * usermouse.scroll * 2;
			waves.scroll_position = Math.max(0,waves.scroll_position);
		}else{
			waves.zoom_start=0;
			waves.zoom_end = 1;
			waves.selected = parameter;
			clear_wave_graphic(waves.selected+1,1);
		}
	}else if(value=="get"){
		waves.drag_start_x = usermouse.x;
		waves.drag_start_y = usermouse.y;
		return 0;//waves.zoom_start;
	}else{
		//this is how piano roll does it but:
		var wzs = waves.zoom_start;
		var wze = waves.zoom_end;
		var dx = usermouse.x - waves.drag_start_x;
		var dy = usermouse.y - waves.drag_start_y;
		if((dx==0)&&(dy==0)&&(value!=0)){
			if(usermouse.shift){
				dx = -10000 * value;
			}else{
				dy = -1000 * value;
			}
		}
		var dir = 0;
		if(Math.abs(dx)<Math.abs(dy)) dir = 1;
		if(dir==0){
			var l = (waves.zoom_end - waves.zoom_start);
			//the stripe is faster to drag l-r on when zoomed in than the big wave
			var p = 0.75/waves.width;
			p *= dx;
			waves.zoom_start += p;
			waves.zoom_start = Math.min(Math.max(0,waves.zoom_start),1-l);
			waves.zoom_end = waves.zoom_start + l;
			waves.drag_start_y = usermouse.y;
			waves.drag_start_x = usermouse.x;
		}else{
			var l = (waves.zoom_end - waves.zoom_start);
			var xx = (usermouse.x-fontheight*1.1-9)/waves.width;
			dy*=0.01;
			waves.zoom_start += l*xx*dy;
			waves.zoom_end -= l*(1-xx)*dy;
			waves.zoom_end = Math.max(waves.zoom_start+0.00001,waves.zoom_end);
			waves.zoom_end = Math.min(waves.zoom_end, 1);
			waves.zoom_start = Math.min(waves.zoom_end-0.00001,waves.zoom_start);
			waves.zoom_start = Math.max(waves.zoom_start,0);
			waves.zoom_scale = 1/(waves.zoom_end - waves.zoom_start);
			waves.drag_start_x = usermouse.x;
			waves.drag_start_y = usermouse.y;
		}
		if((wze!=waves.zoom_end)||(wzs!=waves.zoom_start)){
			draw_wave_z[waves.selected] = [[],[],[],[]];
		}
		redraw_flag.flag |= 4;
	}
	
	/*if(value=="get"){
		var skew = usermouse.x / mainwindow_width;
		var wl = waves.zoom_end - waves.zoom_start;
		var wzs = waves.zoom_start;
		var wze = waves.zoom_end;
		waves.zoom_start = skew - 0.5*wl;
		waves.zoom_end = skew + 0.5*wl;
		if(waves.zoom_start<0){
			waves.zoom_end -= waves.zoom_start;
			if(waves.zoom_end>1)waves.zoom_end = 1;
			waves.zoom_start = 0;
		}else if(waves.zoom_end > 1){
			waves.zoom_start -= (waves.zoom_end-1);
			if(waves.zoom_start<0)waves.zoom_start=0;
			waves.zoom_end = 1;
		}
		if((wze!=waves.zoom_end)||(wzs!=waves.zoom_start)){
			draw_wave_z[waves.selected] = [[],[],[],[]];
		}
		return 0;
	}else{
		var skew = usermouse.x / mainwindow_width;
		var wl = waves.zoom_end - waves.zoom_start;
		var wzs = waves.zoom_start;
		var wze = waves.zoom_end;
		waves.zoom_start = skew - 0.5*wl;
		waves.zoom_end = skew + 0.5*wl;

		var w = waves.zoom_end- waves.zoom_start;
		waves.zoom_start += (skew)* w*value;
		waves.zoom_end -= (1-skew)*w*value;
		
		if(waves.zoom_start>waves.zoom_end){
			var t = waves.zoom_start;
			waves.zoom_start=waves.zoom_end;
			waves.zoom_end = t;
		}
		if(waves.zoom_start<0){
			waves.zoom_end -= waves.zoom_start;
			if(waves.zoom_end>1)waves.zoom_end = 1;
			waves.zoom_start = 0;
		}else if(waves.zoom_end > 1){
			waves.zoom_start -= (waves.zoom_end-1);
			if(waves.zoom_start<0)waves.zoom_start=0;
			waves.zoom_end = 1;
		}
		if((wze!=waves.zoom_end)||(wzs!=waves.zoom_start)){
			draw_wave_z[waves.selected] = [[],[],[],[]];
		}
	}*/
}



function delete_wave(parameter,value){
	post("\n\n\n\ndeleting slot number",parameter)
	var t=parameter+1;
	waves_dict.setparse("waves["+t+"]","{}");
	waves.selected = -1;
	messnamed("waves_buffers",parameter,"clearlow");
	clear_wave_graphic_z(parameter);
	redraw_flag.flag |= 4;
}

function copy_wave(parameter,value){
	error("\nsorry not implemented yet");
}

function undo_button(){
	undoing = 1;
	var usz=undo_stack.getsize("history")|0;
	//post("\nundoing, stack size",usz);
	usz--;
	if(usz<0) return -1;
	undo = undo_stack.get("history["+usz+"]");
	if(undo==null){
		if(usz>0)undo_button();
	}else{
		redo_stack.append("history","{}");
		var rsz=redo_stack.getsize("history")|0;
		rsz--;
		redo_stack.replace("history["+rsz+"]",undo);
		undo_stack.remove("history["+usz+"]");
		blocks_paste(1,undo);
		undo.parse("{}");
	}
	undoing = 0;
}

function redo_button(){
	//undoing = 1;
	var rsz=redo_stack.getsize("history")|0;
	if(rsz == 0) return -1;
	post("\nredoing, stack size",rsz);
	rsz--;
	if(rsz<0) return -1;
	undo = redo_stack.get("history["+rsz+"]");
	if((undo==null)||(undo=="*")){
		redo_stack.remove("history["+rsz+"]");
		redo_button();
	}else{
		undoing = 2;
		post("\nredo:",undo.stringify());
		if(undo.contains("actions")){
			var usz=undo_stack.getsize("history")|0;
			undo_stack.append("history","*");
			usz--;
			undo_stack.replace("history["+usz+"]",undo);
		}
		redo_stack.remove("history["+rsz+"]");
		blocks_paste(1,undo);
		undo.parse("{}");
	} 
	undoing = 0;
}

function delete_selection(){
	if(undoing!=1){
		copy_selection(undo);
		var usz=undo_stack.getsize("history")|0;
		usz = Math.max(0,usz);
		undo_stack.append("history","{}");
		undo_stack.setparse("history["+usz+"]",'{}');
		undo_stack.replace("history["+usz+"]",undo);
		undo.parse("{}");
	}
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

function delete_tree(){
	// need to select everything that's going to be deleted, so that undo can work
	select_tree();
	delete_selection();
}

function select_tree_key(){
	select_tree();
	redraw_flag.flag = 10;	
}

function select_tree(){
	var added=0;
	var recurse=0;
	var ignore= config.get("TREE_SELECT_IGNORES_CONTROL_BLOCKS");
	for(var b=0;b<MAX_BLOCKS;b++){
		if((selected.block[b]==0) && (blocks.contains("blocks["+b+"]::name"))){
			//this block exists, isn't selected. lets see if it has a connection TO any selected blocks. and any other connections TO unselected blocks
			var to_sel_conns = 0;
			var to_unsel_conns = 0;
			var from_sel_conns = 0; 
			var from_unsel_conns = 0;
			var igg=0;
			if(ignore){
				var n = blocks.get("blocks["+b+"]::name");
				n = n.split(".")[2];
				if(n=="control") igg = 1;
			}
			if(igg == 0){
				for(var c=connections.getsize("connections")-1;c>=0;c--){
					if((connections.contains("connections["+c+"]::from")) && (connections.get("connections["+c+"]::from::number") == b)){
						var t = connections.get("connections["+c+"]::to::number");
						var ig = 0;
						if(ignore){
							var n = blocks.get("blocks["+t+"]::name");
							n = n.split(".")[2];
							if(n == "control") ig = 1;
						}
						if(ig==1){
							//ignore control blocks
						}else if(selected.block[t]==1){
							to_sel_conns++;
						}else{
							to_unsel_conns++;
						}
					}else if((connections.contains("connections["+c+"]::to")) && (connections.get("connections["+c+"]::to::number") == b)){
						var t = connections.get("connections["+c+"]::from::number");
						var ig = 0;
						if(ignore){
							var n = blocks.get("blocks["+t+"]::name");
							n = n.split(".")[2];
							if(n == "control") ig = 1;
						}
						if(ig==1){
							//ignore control blocks
						}else if(selected.block[t]==1){
							from_sel_conns++;
						}else{
							from_unsel_conns++;
						}
					}
				}
				if((to_sel_conns>0) && (to_unsel_conns==0)){
					added++;
					selected.block[b]=1;
					recurse++;
					if(recurse<300) b=-1;
				}else if((from_sel_conns>0)&& (from_unsel_conns==0)){
					added++;
					selected.block[b]=1;
					recurse++;
					if(recurse<300) b=-1;
				}
			}
		}
	}
}

function toggle_fullscreen(){
	fullscreen = 1 - fullscreen;
	keyrepeat_task.cancel();
	world.message("fullscreen",fullscreen);
}

function key_escape(){
	if(sidebar.dropdown!=null) {
		sidebar.dropdown=null;
		redraw_flag.flag |= 2;
		return 1;
	}
	if(displaymode=="panels"){
		if((sidebar.mode=="flock")||(sidebar.mode=="panel_assign")||(sidebar.mode=="cpu")){
			set_sidebar_mode("block");
			panels.editting = -1;
		}else if(sidebar.mode!="none"){
			clear_blocks_selection();
			if(sidebar.mode == "file_menu"){
				set_sidebar_mode("none");
				center_view(1);
			} 
		}else{
			set_display_mode("blocks");
		}
	}else if((displaymode=="waves")&&(waves.selected!=-1)){
		clear_wave_graphic(waves.selected+1,1);
		waves.selected = -1;
		redraw_flag.flag |= 4;
	}else if((displaymode=="custom")||(displaymode=="custom_fullscreen")){
		if((last_displaymode!="blocks")&&(last_displaymode!="panels")&&(last_displaymode!="patterns")&&(last_displaymode!="waves")){
			post("\ndon't want to return to:",last_displaymode,"mode so i'm going to blocks instead");
			last_displaymode="blocks";
		}
		set_display_mode(last_displaymode);
	}else{
		if((displaymode=="blocks")&&(usermouse.clicked3d>-1)){
			usermouse.clicked3d=-1;
			if(wires_potential_connection>-1) clear_or_close();
			draw_blocks();
		}else if((displaymode=="block_menu")&&(menu.mode==3)){
			if(menu.search!=""){
				menu.search="";
				draw_menu_hint();
			}else{
				post("\nsorry no you have to make a selection");
				draw_menu_hint();
			}
		}else if(displaymode=="block_menu"){
			back_button();
			set_display_mode("blocks");
		}else{
			set_display_mode("blocks");
			if((sidebar.mode=="flock")||(sidebar.mode=="panel_assign")||(sidebar.mode=="cpu")){
				set_sidebar_mode("block");
			}else if(sidebar.mode!="none"){
				clear_blocks_selection();
				if(sidebar.mode == "file_menu"){
					set_sidebar_mode("none");
					center_view(1);
				}
			}else if(bottombar.block>-1){
				hide_bottom_bar();	
			}else{
				center_view(1);
			}
		}
	}
}

function blocks_and(side){
	set_sidebar_mode(side);
	redraw_flag.flag |= 2;		
	set_display_mode("blocks");
}

function toggle_show_sidebar_para_mod(){
	MODULATION_IN_PARAMETERS_VIEW = (MODULATION_IN_PARAMETERS_VIEW+1)%4;
	redraw_flag.flag |= 2;
}

function selected_block_custom_mode(mode){
	var se = selected.block.indexOf(1);
	if(se>=0){
		var na = blocks.get("blocks["+se+"]::name");
		if(blocktypes.contains(na+"::block_ui_patcher")){
			var ui = blocktypes.get(na+"::block_ui_patcher");
			if(ui!="blank.ui"){
				if(blocktypes.contains(na+"::no_edit") && (blocktypes.get(na+"::no_edit")==1)){
				}else if(ui=="self"){
					open_patcher(se, -1);
				}else{
					set_display_mode(mode,se);
				}
			}
		}
	}
}

function custom_key_passthrough(key){
	ui_poly.message("setvalue",  custom_block+1, "keydown", key, usermouse.x, usermouse.y);
}

function qwertymidi(key,vel){
	messnamed("qwertymidi",key, vel);
}
function qwertymidispecial(command){
	var oct = parameter_value_buffer.peek(1,MAX_PARAMETERS * automap.available_k_block + 9)
	if(command=="octavedown"){
		oct -= 0.1;
	}else if(command=="octaveup"){
		oct += 0.1;
	}
	oct = Math.max(0, Math.min(1, oct));
	parameter_value_buffer.poke(1,MAX_PARAMETERS * automap.available_k_block + 9,oct);
	redraw_flag.flag |= 2;
}

function poly_key(dir,end){
	if(dir<0){
		if((sidebar.mode == "block")||(sidebar.mode == "settings")){
			var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
			if((current_p>1)&&(blocks.get("blocks["+sidebar.selected+"]::type")!="hardware")){
				voicecount(sidebar.selected, current_p - 1);
			}
		}else if(sidebar.mode == "blocks"){
			multiselect_polychange(-1);
		}else if(sidebar.mode == "wire"){
			var i = selected.wire.indexOf(1);
			if(end == 0){
				var t_number = connections.get("connections["+i+"]::from::number");	
			}else{
				var t_number = connections.get("connections["+i+"]::to::number");
			}
			var current_p = blocks.get("blocks["+t_number+"]::poly::voices");
			if((current_p>1)&&(blocks.get("blocks["+t_number+"]::type")!="hardware")){
				voicecount(t_number, current_p - 1);
				selected.wire[i] = 1;
			}
		}
	}else{
		if((sidebar.mode == "block")||(sidebar.mode == "settings")){
			var max_p = blocktypes.get(blocks.get("blocks["+sidebar.selected+"]::name")+"::max_polyphony");
			if(max_p ==0) max_p=9999999999999;
			var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
			if((max_p > current_p)&&(blocks.get("blocks["+sidebar.selected+"]::type")!="hardware")){
				voicecount(sidebar.selected, current_p + 1);
			}
		}else if(sidebar.mode == "blocks"){
			multiselect_polychange(1);
		}else if(sidebar.mode == "wire"){
			var i = selected.wire.indexOf(1);
			if(end == 0){
				var t_number = connections.get("connections["+i+"]::from::number");	
			}else{
				var t_number = connections.get("connections["+i+"]::to::number");
			}
			var max_p = blocktypes.get(blocks.get("blocks["+t_number+"]::name")+"::max_polyphony");
			if(max_p ==0) max_p=9999999999999;
			var current_p = blocks.get("blocks["+t_number+"]::poly::voices");
			if((max_p > current_p)&&(blocks.get("blocks["+t_number+"]::type")!="hardware")){
				voicecount(t_number, current_p + 1);
			}
		}
	}
}
function cut_selection(){
	copy_selection();
	delete_selection();
}
function file_menu_arrows(dir){
	currentsong+=dir;
	currentsong = (currentsong + songlist.length) % (songlist.length);
	redraw_flag.flag |= 2;
}


function conn_show_from_outputs_list(parameter,value) {
	if(value==-1){
		sidebar.connection.show_from_outputs = 1 - sidebar.connection.show_from_outputs;
	}else{
		sidebar.connection.show_from_outputs = value;
	}
}

function conn_show_to_inputs_list(parameter,value) {
	if(value==-1)value = 1 - sidebar.connection.show_to_inputs;
	sidebar.connection.show_to_inputs = value;
}

function conn_set_from_output(c,value){
	var ty = value[0];
	var o = value[1];
	sidebar.connection.default_out_applied = 0;
	sidebar.connection.show_from_outputs = 0;
	new_connection = connections.get("connections["+c+"]");
	new_connection.replace("from::output::number",o);
	var otype = new_connection.get("from::output::type");
	if(ty!=otype){//type change, sense check default offsets
		if(ty=="midi"){
			new_connection.replace("conversion::offset", 0.5);
			new_connection.replace("conversion::offset2", 0.5);			
		}	
	}
	new_connection.replace("from::output::type",ty);
	remove_connection(c);
	connections.replace("connections["+c+"]",new_connection);
	make_connection(c,0);
	selected.wire[c]=1;
	wire_ends[c][0]=-0.96969696;
	sidebar.scroll.position = 0;
	sidebar.lastmode="recalculate";
	redraw_flag.flag |= 4;
}

function conn_set_to_input(c,value){
	var ty = value[0];
	var o = value[1];
	sidebar.connection.show_to_inputs = 0;
	new_connection = connections.get("connections["+c+"]");
	new_connection.replace("to::input::number",o);
	new_connection.replace("to::input::type",ty);
	if(sidebar.connection.default_in_applied!=0){
		if(ty=="midi"){
			/*if((new_connection.get("from::output::type")=="parameters")&&(new_connection.get("conversion::vector")==0)){
				new_connection.replace("conversion::vector",0.25);
				new_connection.replace("conversion::offset2",1);
			}*/
			if(new_connection.get("conversion::offset")==0) new_connection.replace("conversion::offset",0.5);
			if(new_connection.get("conversion::offset2")==0) new_connection.replace("conversion::offset2",0.5);
			if(new_connection.get("conversion::offset2")==1) new_connection.replace("conversion::offset2",0.5);
		}else{
			if(new_connection.get("conversion::offset")==0) new_connection.replace("conversion::offset",0.5);
			//if(new_connection.get("conversion::vector")==0.25) new_connection.replace("conversion::vector",0);
			if(new_connection.get("conversion::offset2")==1) new_connection.replace("conversion::offset2",0.5);
		}
	}
	remove_connection(c);
	connections.replace("connections["+c+"]",new_connection);
	make_connection(c,0);
	selected.wire[c]=1;
	wire_ends[c][0]=-0.96969696;
	sidebar.connection.default_in_applied = 0;
	sidebar.scroll.position = 0;
	sidebar.lastmode="recalculate";
	redraw_flag.flag |= 4;
}

function convert_matrix_to_regular(cno, channels){
	new_connection = connections.get("connections["+cno+"]");
	new_connection.replace("from::output::type","hardware");
	new_connection.replace("to::input::type","hardware");
	remove_connection(cno);
	connections.replace("connections["+cno+"]",new_connection);
	make_connection(cno,0);
	redraw_flag.flag |= 8; //block_and_wire_colours();
	sidebar_select_connection(cno);
}

function convert_regular_to_matrix(cno, channels){
	new_connection = connections.get("connections["+cno+"]");
	new_connection.replace("from::output::type","matrix");
	new_connection.replace("to::input::type","matrix");
	remove_connection(cno);
	connections.replace("connections["+cno+"]",new_connection);
	make_connection(cno,0);
	redraw_flag.flag |= 8; //block_and_wire_colours();
	sidebar_select_connection(cno);
}

function fold_menus(){
	post("\nfold",sidebar.connection.default_out_applied);
	if(sidebar.connection.default_out_applied>0){
		sidebar.connection.show_from_outputs = 0;
		sidebar.connection.default_out_applied = 0;
	} 
	if(sidebar.connection.default_in_applied>0){
		sidebar.connection.show_to_inputs = 0;
		sidebar.connection.default_in_applied = 0;
	}
	wire_ends[selected.wire.indexOf(1)][0]=-0.96969696; //forces it to redraw it
	sidebar.scroll.position = 0;
	redraw_flag.flag |= 10;
}

function clear_or_close(){
	var s = selected.wire.indexOf(1);
	// post("\n\n\n\nclear or close,",s);
	if(s>-1){
		if((connections.get("connections["+s+"]::from::output::type")=="potential")||(connections.get("connections["+s+"]::to::input::type")=="potential")){
			remove_connection(s);
		}else if(sidebar.connection.default_in_applied && sidebar.connection.default_out_applied){
			remove_connection(s);
		}
	}
	sidebar.connection.default_out_applied = 0;
	sidebar.connection.default_in_applied = 0;
	clear_blocks_selection();
	set_sidebar_mode("none");
}

function toggle_connection_help(){
	sidebar.connection.help = 1 - sidebar.connection.help;
	redraw_flag.flag |= 2;
}

function type_to_search(key){
	if(key==-7){
		menu.search = menu.search.slice(0, -1);
	}else if(key==-6){
		menu.search = "";
	}else if(key==-2 || key==-9 || key == -10 || key ==503 || key == 502){
	}else{
		if(menu.search == ""){
			menu.camera_scroll=0;
			camera();
		}
		var k = String.fromCharCode(key);
		if((k!=".")) menu.search = menu.search + k;
		//menu.search = menu.search.replace(".","");
		//menu.search = menu.search.replace(" ","");
	}
	if(menu.search!=""){
		var osel = menu.shown_order.indexOf(menu.selected);
		if(osel<0) osel = 0;
		var type_order = config.get("type_order");
		var types = blocktypes.getkeys();
		var results = [];
		var found =0;
		var showdep = config.contains("show_deprecated") && (config.get("show_deprecated")==1);
		for(var i=0;i<menu.cubecount;i++){
			if(!showdep&&(blocktypes.contains(types[i]+"::deprecated") && blocktypes.get(types[i]+"::deprecated")==1)){
			}else{
				var str = types[i];
				if(blocktypes.contains(types[i]+"::synonyms")) str = str + blocktypes.get(types[i]+"::synonyms");
				str = str.toLowerCase();
				while(str.indexOf(".")>=0) str = str.replace(".","");
				if(str.indexOf(menu.search)!=-1){
					found=1;
					break;
				}
			}
		}
		if((found==0)&&(menu.search.length>0)){
			type_to_search(-7);
			return 0;
		}
		
		for(var i=0;i<menu.cubecount;i++){
			if(!showdep&&(blocktypes.contains(types[i]+"::deprecated") && blocktypes.get(types[i]+"::deprecated")==1)){
			}else{
				var str = types[i];
				if(blocktypes.contains(types[i]+"::synonyms")) str = str + blocktypes.get(types[i]+"::synonyms");
				str = str.toLowerCase();
				while(str.indexOf(".")>=0) str = str.replace(".","");
				if(str.indexOf(menu.search)!=-1){ //if you find the search in the name
					var ts=types[i].split('.');
					var tt = type_order.length;
					for(var t in type_order){ // add the number of the block to an array indexed by the type
						if(ts[0]==type_order[t]){tt = t; t=9999;}
					}
					if(!Array.isArray(results[tt])) results[tt] = [];
					results[tt].push(i);
					blocks_menu[i].enable = 1;
				}else{
					if(blocks_menu[i] !== undefined) blocks_menu[i].enable = 0;
				}
			}
		}
		var w = 4 - (Math.max(0,Math.min(3,((mainwindow_height/mainwindow_width)-0.4)*5)) |0 );
		var z=-3.5; var x=-w;
		menu.shown_order = [];
		for(var i =0;i<results.length;i++){
			var f=0;
			if(Array.isArray(results[i])){
				for(var ii = 0;ii<results[i].length;ii++){
					f=1;
					menu.shown_order.push(results[i][ii]);
					blocks_menu[results[i][ii]].position = [x,-110.5,z];
					x++;
					if(x>w){
						z++;
						x=-w;
					}
				}
				if(f){
					z++;
					z+=0.5;
					x=-w;
				}
			}
		}
		if((x==-w)&&(z==-3.5)){
			matrix_menu_index=[];
		}
		if(osel==null || osel>=menu.shown_order.length) osel = 0;
		menu.selected = menu.shown_order[osel];
		if(blocks_menu[menu.selected]) blocks_menu[menu.selected].position[1] += 1;
		write_menu_matrix();
	}else{
		initialise_block_menu(1);
	}
	usermouse.hover[1] = null;
	draw_menu_hint();
}

function menu_show_all(){
	menu.show_all_types = 1;
	menu.selected = 0;
	initialise_block_menu(1);
	redraw_flag.flag |= 4;
}

function squash_block_menu(){
	//squashes the block menu to only show visible blocks
	menu.shown_order = [];
	var type_order = config.get("type_order");
	var types = blocktypes.getkeys();
	var w = 4 - (Math.max(0,Math.min(3,((mainwindow_height/mainwindow_width)-0.4)*5)) |0 );
	var z=-3.5; var x=-w;
	for(var t in type_order){
		var f=0;
		for(var i=0;i<menu.cubecount;i++){
			var ts=types[i].split('.');
			if(ts[0] == type_order[t]){
				if(blocks_menu[i].enable){
					f=1;
					menu.shown_order.push(i);
					blocks_menu[i].position = [x,-110.5+(i==menu.selected),z];
					x++;
					if(x>w){
						z++;
						x=-w;
					}
				}
			}
		}
		if(f){
			z++;
			z+=0.5;
			x=-w;
		}
	}
}

function show_and_search_new_block_menu(key){
	if(!usermouse.caps && (key>=97)&& (key<=122)){
		blocks_page.new_block_click_pos = screentoworld(usermouse.x,usermouse.y);// [usermouse.x,usermouse.y];
		menu.search = "";
		show_new_block_menu();
		end_of_frame_fn = function(){type_to_search(key);};
	}else if((((key>=-42)&&(key<-32))||((key>=44)&&(key<58)))&&(usermouse.caps==0)){ //numbers do direct entry on values.	
		if((sidebar.mode == "block")&&(usermouse.got_t>=2) && (usermouse.got_t<=4) && (usermouse.got_i) && (usermouse.x > sidebar.x)){
			var pno = mouse_click_parameters[usermouse.got_i][0];
			//0-3 coords, 456 colour, 8 is the block (we know that already) 9 is the param no
			sidebar.mode = "param_number_entry";
			if(((key>=-42)&&(key<-32))){
				key = -key + 15;
			}
			sidebar.param_number_entry = String.fromCharCode(key);
			sidebar.param_number = pno;
			draw_number_entry(pno, sidebar.param_number_entry);
		}//else (panels, custom, waves)
	}else{post("\nkeycode",key);}
}

function number_entry(key){
	if(key>512)key -= 512;
	if(key == -4){//enter
		if(sidebar.param_number_entry.indexOf(",")>-1){
			parameter_list_entry();
		}else{
			request_set_block_parameter(sidebar.selected,sidebar.param_number,(+sidebar.param_number_entry));
		}
		sidebar.mode = "block";
		redraw_flag.flag |=2;
	}else if(key == -3){//esc
		sidebar.param_number_entry = "";
		sidebar.mode = "block";
		redraw_flag.flag |= 2;
	}else if(((key>=44)&&(key<58))||(key==110)||(key==116)||((key>=-42)&&(key<-32))){
		//44=. 45=- 46=. 47=/ 110,116 = nt
		if(((key>=-42)&&(key<-32))) key = -key + 15;
		sidebar.param_number_entry = sidebar.param_number_entry.concat(String.fromCharCode(key));
		draw_number_entry(sidebar.param_number,sidebar.param_number_entry);
	}else if((key==-6)||(key==-7)){
		sidebar.param_number_entry = sidebar.param_number_entry.slice(0, -1);
		draw_number_entry(sidebar.param_number,sidebar.param_number_entry);
	}
}

function parameter_list_entry(){
	// like this
	//  request_set_block_parameter(sidebar.selected,sidebar.param_number,(+sidebar.param_number_entry));
	// but for a list. so 
	// you find the least value, 
	var clock = null;
	var list = [];

	if(sidebar.param_number_entry.indexOf("/")>-1){
		clock = sidebar.param_number_entry.split("/").pop();
		if(clock.indexOf("n")==-1) clock = clock+"n";
		post("\nuser entered clock",clock);
	}

	list = sidebar.param_number_entry.split(",");
	post("\n list has ",list.length,"entries"	);
	var least = 1;
	for(var i=0;i<list.length;i++){
		list[i] = unscale_parameter(sidebar.selected,sidebar.param_number,parseFloat(list[i]));
		if(list[i]<least)least = list[i];
	}
	post("least value is ",least);

	// set it to that,
	parameter_value_buffer.poke(1,MAX_PARAMETERS*sidebar.selected+sidebar.param_number,least);
	
	// work out the offsets for all list items
	for(var i=0;i<list.length;i++){
		list[i] = list[i] - least;
	}

	// make a seq values

	var x = blocks.get("blocks["+sidebar.selected+"]::space::x");
	var y = blocks.get("blocks["+sidebar.selected+"]::space::y");

	var seqblock = new_block('seq.values', x-1.5, y+1.5,0  );
	
	draw_block(seqblock);
	new_connection.parse('{}');
	new_connection.replace("conversion::mute" , 0);
	new_connection.replace("conversion::scale", 1);
	new_connection.replace("conversion::vector", 0);	
	new_connection.replace("conversion::offset", 0.5);
	new_connection.replace("conversion::offset2", 0.5);
	new_connection.replace("from::number",seqblock);
	new_connection.replace("to::number",sidebar.selected);
	if(sidebar.selected_voice==-1){
		new_connection.replace("to::voice","all");
	}else{
		new_connection.replace("to::voice",sidebar.selected_voice);
	}
	new_connection.replace("from::voice",1);
	new_connection.replace("to::input::number",sidebar.param_number);
	new_connection.replace("to::input::type","parameters");
	new_connection.replace("from::output::number",0);
	new_connection.replace("from::output::type","parameters");
	connections.append("connections",new_connection);
	make_connection(connections.getsize("connections")-1,0);

	request_set_block_parameter(seqblock,3,list.length);
	var vl = voicemap.get(seqblock);
	if(!Array.isArray(vl)) vl = [vl];

	for(var i=0;i<list.length;i++){
		if(typeof list[i] == 'number' && !isNaN(list[i])){
			list[i] = (1 + 127*parseFloat(list[i]))/128;
		}else{
			list[i] = 0;
		}
		voice_data_buffer.poke(1,MAX_DATA*vl[0]+1+i,list[i]);
	}

	// connect to a new clock
	if(clock != null){
		var clockblock = null;
		for(var i = 0;i < MAX_BLOCKS;i++){
			if(blocks.get("blocks["+i+"]::name") && blocks.get("blocks["+i+"]::name")=='core.clock'){
				clockblock = i;
				break;
			}
		}
		if(clockblock==null){
			clockblock = new_block('core.clock',x - 1.5, y+ 3,0);
		}else{
			voicecount(clockblock,blocks.get("blocks["+clockblock+"]::poly::voices")+1);
		}
		var cvcl = voicemap.get(clockblock);
		if(!Array.isArray(cvcl)) cvcl = [cvcl];
		var cvn = cvcl.length-1;
		draw_block(seqblock);
		new_connection.parse('{}');
		new_connection.replace("conversion::mute" , 0);
		new_connection.replace("conversion::scale", 1);
		new_connection.replace("conversion::vector", 0);	
		new_connection.replace("conversion::offset", 0.5);
		new_connection.replace("conversion::offset2", 0.5);
		new_connection.replace("from::number",clockblock);
		new_connection.replace("to::number",seqblock);
		new_connection.replace("to::voice",1);
		new_connection.replace("from::voice",cvn+1);
		new_connection.replace("to::input::number",0);
		new_connection.replace("to::input::type","midi");
		new_connection.replace("from::output::number",0);
		new_connection.replace("from::output::type","midi");
		connections.append("connections",new_connection);
		make_connection(connections.getsize("connections")-1,0);
		
		var div = ["off", "1n", "2n", "2nt", "4n", "4nt", "8n", "8nt", "16n", "16nt", "32n", "32nt", "64n", "128n"].indexOf(clock);
		request_set_voice_parameter(clockblock,cvcl[cvn],8,div+0.5);
	}
}

function draw_number_entry(pno,number){
	var y = paramslider_details[pno][3]-paramslider_details[pno][1]-fontheight;
	y*=0.5;
	y+=paramslider_details[pno][1];

	lcd_main.message("paintrect",paramslider_details[pno][0],y,paramslider_details[pno][2],y+fontheight,0,0,0);
	lcd_main.message("framerect",paramslider_details[pno][0],y,paramslider_details[pno][2],y+fontheight,paramslider_details[pno][4],paramslider_details[pno][5],paramslider_details[pno][6]);
	lcd_main.message("moveto",paramslider_details[pno][0]+4,y+fontheight*0.8);
	lcd_main.message("font",mainfont,fontsmall*2);
	lcd_main.message("write",number);
}

function block_search_typing(key){
	if(key==-7){
		sidebar.text_being_edited = sidebar.text_being_edited.slice(0, -1);
	}else if(key==-6){
		sidebar.text_being_edited = "";
	}else{
		sidebar.text_being_edited = sidebar.text_being_edited + String.fromCharCode(key);
	}	
	if(sidebar.text_being_edited!=""){
		ch=0;
		for(var i=0;i<blocks.getsize("blocks");i++){
			//var hit = 0;
			var str = "";
			if(blocks.contains("blocks["+i+"]::name")) str = str + blocks.get("blocks["+i+"]::name");
			if(blocks.contains("blocks["+i+"]::label")) str = str + blocks.get("blocks["+i+"]::label");
			var t = selected.block[i];
			str = str.toLowerCase();
			if(str.indexOf(sidebar.text_being_edited.toLowerCase())!=-1){
				selected.block[i] = 1;
			}else{
				selected.block[i] = 0;
			}
			ch |= (selected.block[i]!=t);
		}
		if(ch) redraw_flag.flag |= 8; //block_and_wire_colours();
	}
	redraw_flag.flag |=2;
}
function blocks_page_enter(){
	clear_blocks_selection();
	blocks_page.new_block_click_pos = screentoworld(usermouse.x,usermouse.y);
	set_display_mode("block_menu");
}

function blocks_menu_up_down(dir){
	var n = menu.shown_order.indexOf(menu.selected) + dir;
	var y = blocks_menu[menu.selected].position[2];
	while(matrix_menu_index.indexOf(menu.shown_order[n])<0 && n>=0 && n<=menu.shown_order.length){
		n+=dir;
	}
	if(n>=menu.shown_order.length) n = menu.shown_order.length - 1;
	if(n<0)n=0;
	menu.selected = menu.shown_order[n];
	type_to_search(-9);
	y-=blocks_menu[menu.selected].position[2];
	if(y<-4 || y>4){
		menu.camera_scroll = blocks_menu[menu.selected].position[2] + 3;
	}else{
		menu.camera_scroll = menu.camera_scroll - y;
	}
	messnamed("camera_control","position", 2 , -93, menu.camera_scroll);
}

function blocks_menu_enter(){
	var sel = menu.selected;
	var types = blocktypes.getkeys();
	if(menu.mode == 0){
		// post("\nnew block",sel,types[sel]);
		set_display_mode("blocks");
		end_of_frame_fn = function(){
			var r = new_block(types[sel], Math.round(blocks_page.new_block_click_pos[0]), Math.round(blocks_page.new_block_click_pos[1]));
			selected.block[r] = 1;
			sidebar.scopes.voice = -1;
			sidebar.selected_voice = -1;
			var t = draw_block(r);
			if(blocks_page.was_selected!=null && (!usermouse.shift != /*XOR*/ !config.get("ALWAYS_AUTOCONNECT_IF_YOU_CAN"))){
				getWiresPotentialConnection();
				if(blocks_page.new_block_click_pos[1] > blocks.get("blocks["+blocks_page.was_selected+"]::space::y")){
					build_new_connection_menu(r,blocks_page.was_selected,-1,(blocks_page.was_selected_voice!=null) ? blocks_page.was_selected_voice : -1);
				}else{
					build_new_connection_menu(blocks_page.was_selected,r,(blocks_page.was_selected_voice!=null) ? blocks_page.was_selected_voice : -1, -1);
				}
			} 
			blocks_page.was_selected = null;
			block_cubes++;
			voice_cubes+=t[0];
			write_blocks_matrix();
			var bpw = (blocks_page.rightmost - blocks_page.leftmost);
			var d = ((blocks_page.new_block_click_pos[0]-blocks_page.leftmost)/bpw)-(sidebar.x/mainwindow_width);
			if(d > 0){
				camera_position[0] += 1.5*d*bpw;
				camera();
			}
			redraw_flag.flag |= 8;
		}
	}else if(menu.mode == 1){
		swap_block(types[sel]);
		set_display_mode("blocks");
	}else if(menu.mode == 2){
		var r = new_block(types[sel], blocks_page.new_block_click_pos[0],blocks_page.new_block_click_pos[1]);
		if(blocktypes.get(types[sel]+"::type")=="audio") send_audio_patcherlist(1);
		draw_block(r);
		write_block_matrix(r);
		insert_block_in_connection(types[sel],r);							
		redraw_flag.flag |= 4;
	}else if(menu.mode == 3){
		post("substitution found!!"+types[sel]);
		loading.recent_substitutions.replace(menu.swap_block_target, types[sel]);
		menu.swap_block_target = types[sel];
		set_display_mode("blocks");
		import_song();
		//swap_block(usermouse.ids[1]);
		//set_display_mode("blocks");
	}
}

function toggle_automap_lock(type){
	if(type=="control"){
		automap.lock_c = 1-automap.lock_c;
	}else if(type == "keyboard"){
		automap.lock_k = 1 - automap.lock_k;
	}else if(type == "cue"){
		automap.lock_q = 1 - automap.lock_q;
	}
	redraw_flag.flag |= 4;
}

function set_automap_lock(type,value){
	if(type=="control"){
		automap.lock_c = value;
	}else if(type == "keyboard"){
		automap.lock_k = value;
	}else if(type == "cue"){
		automap.lock_q = value;
	}
	sidebar.mode = "redraw";
	redraw_flag.flag |= 4;
}

function tab_between_display_modes(){
	if(displaymode == "blocks"){
		set_display_mode("panels");
	}else{
		set_display_mode("blocks");
	}
}

function automap_k_click(p,v){
	if(usermouse.alt){
		select_block_by_name("core.input.keyboard");
	}else if(usermouse.ctrl){
		if(automap.available_k!=-1){
			disable_automap_k();
		}else{
			enable_automap_k();
		}
	}else{
		//lock
		if(v==-1){
			automap.lock_k = 1 - automap.lock_k;
		}else{
			automap.lock_k = (v!=0);
		}
		if((automap.available_k==-1))automap.lock_k = 0;
		if(automap.lock_k==0){
			if(sidebar.selected!=automap.mapped_k) automap.mapped_k = -1;
		}
	}
}

function automap_c_click(p,v){
	if(usermouse.alt){
		select_block_by_name("core.input.control.auto");
	}else if(usermouse.ctrl){
		toggle_automap_c_enable();
	}else{
		//lock
		if(v==-1){
			automap.lock_c = 1 - automap.lock_c;
		}else{
			automap.lock_c = (v!=0);
		}
		if(automap.available_c==-1){
			toggle_automap_c_enable();
		}
		if(automap.lock_c==0){
			if(sidebar.selected!=automap.mapped_c) automap.mapped_c = -1;
		}
	}
}
function automap_q_click(p,v){
	if(usermouse.ctrl){
		automap.q_gain = -automap.q_gain;
		set_automap_q(automap.q_gain);
		automap.lock_q=0;
		redraw_flag.flag |= 2;
		// post("\ntoggled mute cue",automap.q_gain);
	}else{
		//lock
		if(v==-1){
			automap.lock_q = 1 - automap.lock_q;
		}else{
			automap.lock_q = (v!=0);
		}
		redraw_flag.flag |= 2;
	}
}

function conn_assign_controller_moved(type,number){
	if(type == "parameters"){
		post("\nyou moved controller param number",number);
	}else{
		post("\nyou pressed controller button number",number);
	}
	i = selected.wire.indexOf(1);
	if(i>-1){
		conn_set_from_output(i, [type, number]);
	}
}

function conn_toggle_control_auto_assign(){
	sidebar.connection.auto_pick_controller = 1 - sidebar.connection.auto_pick_controller;
	sidebar.connection.show_from_outputs = 1;
	redraw_flag.flag |= 2;
}

function turn_off_controller_assign_mode(){
	note_poly.message("setvalue", 0,"connection_assign_mode",0);
	automap.assignmode = 0;
}

function make_space(x,y,r){
	//move all blocks a distance r along a line from their x,y to the specified x,y.
	var usz=undo_stack.getsize("history")|0;
	if(undo_stack.contains("history["+(usz-1)+"]::actions::make_space")){
		usz=-1;
	}else{
		undo_stack.append("history","{}");
		undo_stack.setparse("history["+usz+"]", '{ "actions" : { "make_space" : {} } }');
	}
	for(var b=0;b<MAX_BLOCKS;b++){
		if(blocks.contains("blocks["+b+"]::space")){
			var bx = blocks.get("blocks["+b+"]::space::x");
			var by = blocks.get("blocks["+b+"]::space::y");
			if(usz!=-1) undo_stack.setparse("history["+usz+"]::actions::make_space::"+b, '{ "x" : '+bx+', "y" : '+by+'}');	
			var dx = bx-x;
			var dy = by-y;
			var dd = Math.sqrt(dx*dx+dy*dy);
			if((dd>1.4)||(r>0)){
				dd = r;
				dx *= dd;
				dy *= dd; //now normalised to a r-long vector.
				bx += dx; 
				by += dy;
				blocks.replace("blocks["+b+"]::space::x",bx);
				blocks.replace("blocks["+b+"]::space::y",by);
			}
		}
	}
	redraw_flag.flag |= 4;
}

function make_fisheye_space(x,y,r){
	//move all blocks a distance r along a line from their x,y to the specified x,y.
	var usz=undo_stack.getsize("history")|0;
	if(undo_stack.contains("history["+(usz-1)+"]::actions::make_space")){
		usz=-1;
	}else{
		undo_stack.append("history","{}");
		undo_stack.setparse("history["+usz+"]", '{ "actions" : { "make_space" : {} } }');
	}
	for(var b=0;b<MAX_BLOCKS;b++){
		if(blocks.contains("blocks["+b+"]::space")){
			var bx = blocks.get("blocks["+b+"]::space::x");
			var by = blocks.get("blocks["+b+"]::space::y");
			if(usz!=-1) undo_stack.setparse("history["+usz+"]::actions::make_space::"+b, '{ "x" : '+bx+', "y" : '+by+'}');	
			var dx = bx-x;
			var dy = by-y;
			var dd = Math.sqrt(dx*dx+dy*dy);
			if((dd>1.4)||(r>0)){
				dd = r/dd;
				dx *= dd;
				dy *= dd; //now normalised to a r-long vector.
				bx += dx; 
				by += dy;
				blocks.replace("blocks["+b+"]::space::x",bx);
				blocks.replace("blocks["+b+"]::space::y",by);
			}
		}
	}
	redraw_flag.flag |= 4;
}


function reify_automap_k(){
	// makes new connection out of automap k connection, turns off automap_k
	new_connection.parse('{}');
	new_connection.replace("to::number", +automap.mapped_k);
	new_connection.replace("from::number", +automap.available_k_block);
	new_connection.replace("from::output::number",0);
	new_connection.replace("from::voice","all");
	new_connection.replace("to::voice","all");
	new_connection.replace("from::output::type","midi");
	new_connection.replace("to::input::number",automap.inputno_k);
	new_connection.replace("to::input::type","midi");
	
	new_connection.replace("conversion::mute" , 0);
	new_connection.replace("conversion::scale", 1);
	new_connection.replace("conversion::vector", 0);	
	new_connection.replace("conversion::offset", 0.5);	
	new_connection.replace("conversion::offset2", 0.5);	
	connections.append("connections", new_connection);
	make_connection(connections.getsize("connections")-1,0);
	set_automap_lock("keyboard",0);
	automap.mapped_k = -1;
	note_poly.message("setvalue", automap.available_k, "automapped", 0);
	draw_blocks();
}

function start_keyboard_looper(){
	messnamed("core.input.keyboard","toggle_loop", 1);
	for(var i=0;i<MAX_BLOCKS;i++){
		if((blocks.contains("blocks["+i+"]::name")) && (blocks.get("blocks["+i+"]::name") == "core.input.keyboard")){
			clear_blocks_selection();
			selected.block[i]=1;
			i=Infinity;
		}
	}
}

function disable_automap_k(p,v){
	if(automap.available_k_block>-1){
		//post("\nturning off automap, block is",automap.available_k_block);
		parameter_value_buffer.poke(1, MAX_PARAMETERS*automap.available_k_block+2,0.1);
		automap.lock_k = 0;
		redraw_flag.deferred = 132;	
	}
}

function enable_automap_k(p,v){
	if(automap.available_k_block>-1){
		parameter_value_buffer.poke(1, MAX_PARAMETERS*automap.available_k_block+2,0.8);
		redraw_flag.deferred = 132;	
	}
}

function toggle_automap_c_enable(){
	//post("\nauto",automap.available_c,automap.mapped_c);
	if(automap.available_c>-1){
		automap.mapped_c=-1;
		automap.voice_c = automap.available_c;
		automap.available_c=-1;
		automap.lock_c=0;
		for(var i=0;i<MAX_BLOCKS;i++){
			if(blocks.get("blocks["+i+"]::name")=="core.input.control.auto"){
				parameter_value_buffer.poke(1, MAX_PARAMETERS*i+1,0.1);
				note_poly.message("setvalue", i+1, "automapped", 0);
				//post("\off",i);
				break;
			}
		}
	}else{
		if(automap.voice_c>-1){
			automap.mapped_c=-1;
			automap.available_c=automap.voice_c;
			automap.lock_c=0;
			for(var i=0;i<MAX_BLOCKS;i++){
				if(blocks.get("blocks["+i+"]::name")=="core.input.control.auto"){
					parameter_value_buffer.poke(1, MAX_PARAMETERS*i+1,0.8);
					//post("\non",i);
					break;
				}	
			}
		}else{
			automap.voice_c = new_block("core.input.control.auto", blocks_page.leftmost-1, blocks_page.highest+1);
			send_note_patcherlist(1);
			draw_block(automap.voice_c);
		}
	}
	redraw_flag.deferred = 132;
}

function automap_direct_to_core(knob,value){
	if(displaymode == "waves"){
		if(knob==0){
			if(waves.selected==-1){
				scroll_waves(-0.2*value, "rel");
			}else{
				zoom_waves(10*value,"zoom");
			}
		}else{
			zoom_waves(10*value,"pan");
			/*var os = usermouse.shift;
			usermouse.shift=1;
			mousewheel(usermouse.x,usermouse.y,0,usermouse.ctrl,usermouse.shift,usermouse.caps,usermouse.alt,0,0,-0.1*value);
			usermouse.shift=os;*/
		}
	}else if(displaymode == "block_menu"){
		blocks_menu_up_down(value);
		//mousewheel(usermouse.x,usermouse.y,0,usermouse.ctrl,usermouse.shift,usermouse.caps,usermouse.alt,0,0,-0.1*value);
	}else if(sidebar.mode=="file_menu"){
		automap.scroll_accumulator += value*0.25;
		if(Math.abs(automap.scroll_accumulator)>=1){
			file_menu_arrows(value);
			automap.scroll_accumulator=0;
		}
	}else if(sidebar.mode=="wire"){
		var kx=knob%automap.c_cols;
		var ky=(knob-kx)/automap.c_cols;
		var c = 0;
		if(kx>0){
			c=kx;
		}else if(ky>0){
			c=ky;
		}
		if(automap.groups[c]=="force_unity"){
			return 0;
		}else{
			kx= connection_edit(automap.groups[c],"get");
			kx += value * automap.sidebar_row_ys[c];
			connection_edit(automap.groups[c],kx);
		}
	}else if(sidebar.mode=="wires"){
		if(knob==0){
			connection_scale_selected(0,value*automap.sidebar_row_ys[0]);
		}
	}else{
		post("\nreceived ",knob,value," but in ",sidebar.mode," i have nothing assigned to that");
		post("\ndisabling automap direct mode");
		note_poly.message("setvalue", automap.available_c, "automapped", 0);
	}
}

function rename_pattern(p,v){
	if(v=="name"){
		patternpage.column_block = [];
		post("\nrename pattern",p,v);
		patternpage.patternbeingnamed = p;//[p,v];
		sidebar.text_being_edited = blocks.get("blocks["+p[0]+"]::patterns::names["+p[1]+"]");
		set_sidebar_mode("edit_pattern_name");
	}else{
		scroll_pattern(p,v);
		// post("\nscroll pattern",p,",",v);
	}
}
function copy_pattern_dict(p,target){
	//at the moment the only dict based storage is piano roll, and it's per-block only. 
	// TODO if i want to store per-voice dicts i'll need to add a key to select between
	var key = blocks.get("blocks["+p[0]+"]::patterns::dict_key");
	if(blocks.get("blocks["+p[0]+"]::patterns::dict_mode")=="block"){
		var copydata = blocks.get("blocks["+p[0]+"]::"+key+"::"+p[1]);
		post("\nblock mode copy");
		blocks.replace("blocks["+p[0]+"]::"+key+"::"+target,copydata);
	}else{
		error("voice mode copy not implemented");
	}
}
function copy_pattern(p,target){
	post("\ncopy pattern",p,",",target);
	sidebar.dropdown = null;
	redraw_flag.flag |= 2;
	patternpage.column_block = [];
	if(blocks.contains("blocks["+p[0]+"]::patterns")){
		var type = blocks.get("blocks["+p[0]+"]::patterns::pattern_storage");
		// post("type",type);
		if(type=="data"){
			var x = blocks.get("blocks["+p[0]+"]::patterns::pattern_start");
			var size = blocks.get("blocks["+p[0]+"]::patterns::pattern_size");
			
			// post("start",x,"size",size);
			var bvs = voicemap.get(p[0]);
			if(!Array.isArray(bvs)) bvs = [bvs];
			// post("voices",bvs);
			for(var v=0;v<bvs.length;v++){
				var copydata = voice_data_buffer.peek(1, MAX_DATA*bvs[v]+x+size*p[1],size);
				// post("\ncopydata from",MAX_DATA*bvs[v]+x+size*p[1],"length",copydata.length,"\n",copydata);
				// post("\npoke target,",MAX_DATA*bvs[v]+x+size*target);
				voice_data_buffer.poke(1, MAX_DATA*bvs[v]+x+size*target,copydata);
			}
		}else if(type=="dict"){
			ui_poly.message("setvalue",(1+p[0]),"copy_pattern",p[1],target);
			post("\nrequested the block copy its pattern itself");
		}
		var nam=blocks.get("blocks["+p[0]+"]::patterns::names["+p[1]+"]");
		var ns = nam.slice(-1);
		// post("\nnam",nam,"ns",ns);
		if("0123456789".indexOf(ns)!=-1){
			ns++;
			nam = nam.slice(0,-1)+ns;
		}else{
			nam = nam + "2";
		}
		// post("now nam",nam);
		
		blocks.replace("blocks["+p[0]+"]::patterns::names["+target+"]",nam);

		var param = blocks.get("blocks["+p[0]+"]::patterns::parameter");
		request_set_block_parameter(p[0],param,target);
		
		redraw_flag.deferred |= 4;
	}
}

function clear_block_pattern(block,pattern){
	danger_button = 99;
	clear_pattern([block,pattern],99);
}

function clear_voice_pattern(block,voiceno,pattern){
	sidebar.dropdown = null;
	post("\nclear pattern",block,voiceno,pattern);
	patternpage.column_block = [];
	danger_button = -1;
	if(blocks.contains("blocks["+block+"]::patterns")){
		var type = blocks.get("blocks["+block+"]::patterns::pattern_storage");
		if(type=="data"){
			var x = blocks.get("blocks["+block+"]::patterns::pattern_start");
			var size = blocks.get("blocks["+block+"]::patterns::pattern_size");
			var bvs = voicemap.get(block);
			if(!Array.isArray(bvs)) bvs = [bvs];
			var copydata = [];
			for(var v=0;v<size;v++)copydata.push(0);
			voice_data_buffer.poke(1, MAX_DATA*bvs[voiceno]+x+size*pattern,copydata);
		}else if(type=="dict"){
			post("\ncan't do per-pattern clear for this type sorry");
		}
	}
}

function clear_pattern(p,v){
	sidebar.dropdown = null;
	if(v == danger_button){
		post("\nclear pattern",p,v);
		var target = p[1];
		patternpage.column_block = [];
		danger_button = -1;
		if(blocks.contains("blocks["+p[0]+"]::patterns")){
			var type = blocks.get("blocks["+p[0]+"]::patterns::pattern_storage");
			if(type=="data"){
				var x = blocks.get("blocks["+p[0]+"]::patterns::pattern_start");
				var size = blocks.get("blocks["+p[0]+"]::patterns::pattern_size");
				var bvs = voicemap.get(p[0]);
				if(!Array.isArray(bvs)) bvs = [bvs];
				var copydata = [];
				for(var v=0;v<size;v++)copydata.push(0);
				for(var v=0;v<bvs.length;v++){
					voice_data_buffer.poke(1, MAX_DATA*bvs[v]+x+size*target,copydata);
				}
			}else if(type=="dict"){
				ui_poly.message("setvalue",(1+p[0]),"clear_pattern",p[1]);
			}
			var n = blocks.get("blocks["+p[0]+"]::patterns::names");
			n[target] = "";
			blocks.replace("blocks["+p[0]+"]::patterns::names",n);
		}
	}else{
		danger_button = v;
		// post("\ndanger",v,"(",p,")");
	}
	redraw_flag.flag |= 2;
}

function pattern_click(b,p){
	var param = blocks.get("blocks["+b[0]+"]::patterns::parameter");
	// post("\nclicked block",b[0],"voice",b[1],"pattern",p,"param",param,p);
	if(!Array.isArray(b[1])) b[1] = [b[1]];
	if(usermouse.shift || patternpage.quantise_and_hold){
		queue_quantised_notification(pattern_click, b,p);
		patternpage.held_pattern_fires[b[0]] = p;
	}else{
		if(usermouse.ctrl){
			var v = Math.floor(b[1]);
			if(v<MAX_NOTE_VOICES){
				note_poly.message("setvalue",(1+v),"resync");
			}else{
				audio_poly.message("setvalue",(1+v-MAX_NOTE_VOICES),"resync");
			}
		}
		patternpage.held_pattern_fires[b[0]] = null;
		for(var i =0;i<b[1].length;i++)	request_set_voice_parameter(b[0],b[1][i],param,p);
		mute_particular_block(b[0],0);
	}
	// request_set_block_parameter(b[0],param,p+1);
	// redraw_flag.flag |= 4;
	redraw_flag.deferred |= 4;
}

function scroll_pattern(p,v){
	// post("\nscroll pattern",p,",",v,"BUT",usermouse.left_button);
	if(usermouse.left_button){
		redraw_flag.flag |= 4;
	}else{
		var param = blocks.get("blocks["+p[0]+"]::patterns::parameter");
		var d = (v > 0) ? 1 : -1;
		var bvs=voicemap.get(p[0]);
		if(!Array.isArray(bvs))bvs = [bvs];
		for(var i=0;i<bvs.length;i++){
			request_set_voice_parameter(p[0],bvs[i],param,p[1]+d);
		}
		// request_set_block_parameter(p[0],param,p[1]+d);
		
		redraw_flag.deferred |= 4;
	}
}