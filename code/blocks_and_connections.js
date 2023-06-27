function new_block(block_name,x,y){
	post("new block");
	var details = new Dict;
//	var map = new Dict;
	var new_voice = -1;
	// find an unused block number in blocks
	var new_block_index = next_free_block();
	// what type is it?	// look it up in the blocks dict:
	if(blocktypes.contains(block_name)){
		details = blocktypes.get(block_name);
	}else{
		post("error: "+block_name+" not found in blocktypes dict");
		return -1;
	}

	var type = details.get("type");
	var vst = 0;
	var recycled=0;
	if((type=="audio") && RECYCLING){
		new_voice = find_audio_voice_to_recycle(block_name);
		recycled=1;
	}else{
		new_voice = next_free_voice(type);
	}
	var t_offset = 0;
	if(type == "note"){
		note_patcherlist[new_voice] = details.get("patcher");
	}else if(type == "audio"){
		t_offset=MAX_NOTE_VOICES;
		audio_patcherlist[new_voice] = details.get("patcher");
		if(audio_patcherlist[new_voice]=="vst.loader"){
			vst = 1;
		} 
	}else if(type == "hardware"){
		t_offset=MAX_NOTE_VOICES+MAX_AUDIO_VOICES;
		hardware_list[new_voice] = block_name;
	}
	voicemap.replace(new_block_index, new_voice+t_offset); //set the voicemap
	if(recycled) audio_poly.setvalue(new_voice+1,"reset");
	// now store it in block dict
	if(type=="hardware"){
		blocks.replace("blocks["+new_block_index+"]::name",block_name);
		if(blocktypes.contains(block_name+"::substitute")){
			blocks.replace("blocks["+new_block_index+"]::substitute",blocktypes.get(block_name+"::substitute"));
		}
	}else{
		//block_name = details.get("patcher");
		blocks.replace("blocks["+new_block_index+"]::patcher",details.get("patcher"));
		var ui = details.get("block_ui_patcher");
		if((ui == "") || (ui == 0)){
			ui_patcherlist[new_block_index] = "blank.ui";
		}else{
			ui_patcherlist[new_block_index] = ui;
		}
		blocks.replace("blocks["+new_block_index+"]::name",block_name);
		if(details.contains("voice_data::defaults")){
			var vd_def = [];
			var vdi;
			vd_def = details.get("voice_data::defaults");
			voice_data_buffer.poke(1, MAX_DATA*(new_voice+t_offset),vd_def);
			for(vdi=vd_def.length;vdi<MAX_DATA;vdi++){
				voice_data_buffer.poke(1, MAX_DATA*(new_voice+t_offset)+vdi,0);
			}
			//post("new block so setting default data TODO BUT HOW DO WE KNOW ITS NEW? IS THIS THE RIGHT PLACE TO DO THIS?",new_voice+t_offset,MAX_DATA*(new_voice+t_offset));
		}
	}
	panelslider_visible[new_block_index] = [];
	blocks.replace("blocks["+new_block_index+"]::label",block_name);
//	var bln = block_name.split(".",4);
	blocks.replace("blocks["+new_block_index+"]::type",type);
	if(details.contains("default_polymode")){
		blocks.replace("blocks["+new_block_index+"]::poly",details.get("default_polymode"));
	}else{
		blocks.replace("blocks["+new_block_index+"]::poly::stack_mode","1x");
		blocks.replace("blocks["+new_block_index+"]::poly::choose_mode","cycle free");
		blocks.replace("blocks["+new_block_index+"]::poly::steal_mode","oldest");		
	}
	if(details.contains("panel::parameters")){
		blocks.replace("blocks["+new_block_index+"]::panel::parameters",details.get("panel::parameters"));
		blocks.replace("blocks["+new_block_index+"]::panel::enable",1);
	}else{
		blocks.replace("blocks["+new_block_index+"]::panel::enable",0);
	}
	if(ui_patcherlist[new_block_index] != "blank.ui") blocks.replace("blocks["+new_block_index+"]::panel::enable",1);
	blocks.replace("blocks["+new_block_index+"]::poly::voices",1);
	blocks.replace("blocks["+new_block_index+"]::error::spread",0);
	blocks.replace("blocks["+new_block_index+"]::error::drift", 0);
	blocks.replace("blocks["+new_block_index+"]::error::lockup", 0);
	blocks.replace("blocks["+new_block_index+"]::flock::weight", 0.2);
	blocks.replace("blocks["+new_block_index+"]::flock::tension", 0.2);
	blocks.replace("blocks["+new_block_index+"]::flock::friction", 0.4);
	blocks.replace("blocks["+new_block_index+"]::flock::bounce", 0.7);
	blocks.replace("blocks["+new_block_index+"]::flock::attrep", 0.5);
	blocks.replace("blocks["+new_block_index+"]::flock::align", 0.5);
	blocks.replace("blocks["+new_block_index+"]::flock::twist", 0.5);
	blocks.replace("blocks["+new_block_index+"]::flock::brownian", 0);
	blocks.replace("blocks["+new_block_index+"]::space::x", x);
	blocks.replace("blocks["+new_block_index+"]::space::y", y);
	var up=0;
	if(type == "audio"){
		if(blocktypes.contains(block_name+"::upsample")) up = UPSAMPLING * blocktypes.get(block_name+"::upsample");
		blocks.replace("blocks["+new_block_index+"]::upsample", up);
		audio_upsamplelist[new_voice] = up;
	}
/*	blc=[128,128,128];
	if(config.contains("palette::"+bln[0])){
		blc=config.get("palette::"+bln[0]);
	}
	blocks.replace("blocks["+new_block_index+"]::space::colour", blc );*/
	blocks.replace("blocks["+new_block_index+"]::space::colour", blocktypes.get(block_name+"::colour") );
	
	// and set the params to defaults
	if(blocktypes.contains(block_name+"::parameters")){
		var voiceoffset = new_voice + MAX_NOTE_VOICES*(type == "audio")+ (MAX_NOTE_VOICES+MAX_AUDIO_VOICES)*(type == "hardware");
		var paramslength = blocktypes.getsize(block_name+"::parameters");
		var p_type,p_values,p_default;
		param_error_drift[voiceoffset]= [];
		param_defaults[new_block_index] = [];
		for(var i=0;i<paramslength;i++){
			parameter_error_spread_buffer.poke(1,MAX_PARAMETERS*voiceoffset+i,0);
//			param_error_spread[voiceoffet][i]=0;
			p_default = 0;
			p_type = blocktypes.get(block_name+"::parameters["+i+"]::type");//params[i].get("type");
			p_values = blocktypes.get(block_name+"::parameters["+i+"]::values");
			if(p_type == "float"){
				if(p_values[0]=="bi"){
					p_default = 0.5;
				}
			}
			if(blocktypes.contains(block_name+"::parameters["+i+"]::default")){
				p_default = blocktypes.get(block_name+"::parameters["+i+"]::default");
			}
			parameter_value_buffer.poke(1, MAX_PARAMETERS*new_block_index+i,p_default);
			param_defaults[new_block_index][i] = p_default;
		}		
	}
	// tell the polyalloc voice about its new job
	voicealloc_poly.setvalue((new_block_index+1),"type",type);
	voicealloc_poly.setvalue((new_block_index+1),"voicelist",(new_voice+1));
	var stack = poly_alloc.stack_modes.indexOf(blocks.get("blocks["+new_block_index+"]::poly::stack_mode"));
	var choose = poly_alloc.choose_modes.indexOf(blocks.get("blocks["+new_block_index+"]::poly::choose_mode"));
	var steal = poly_alloc.steal_modes.indexOf(blocks.get("blocks["+new_block_index+"]::poly::steal_mode"));
	voicealloc_poly.setvalue((new_block_index+1),"stack_mode",stack);  
	voicealloc_poly.setvalue((new_block_index+1),"choose_mode",choose); 
	voicealloc_poly.setvalue((new_block_index+1),"steal_mode",steal);  
	
	if(type=="audio"){ 
		audio_to_data_poly.setvalue((new_voice+1), "vis_meter", "1");
		audio_to_data_poly.setvalue((new_voice+1), "vis_scope", "0");
		audio_to_data_poly.setvalue((new_voice+1), "out_value", "0");
		audio_to_data_poly.setvalue((new_voice+1), "out_trigger", "0");
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "vis_meter", "1");
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "vis_scope", "0");
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "out_value", "0");
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "out_trigger", "0");
		if(vst==1){
			if(blocktypes.get(block_name+"::max_polyphony")>1){
				blocks.replace("blocks["+new_block_index+"]::subchannels",2);
				voicecount(new_block_index,blocktypes.get(block_name+"::max_polyphony"));
			}else{
				blocks.replace("blocks["+new_block_index+"]::subchannels",1);
			}			
		}else{
			blocks.replace("blocks["+new_block_index+"]::subchannels",1);
		}
	}else if(type=="hardware"){
		var split=0;//=MAX_AUDIO_VOICES+MAX_NOTE_VOICES;
		var ts, tii;
		ts="no";
		if(blocktypes.contains(block_name+"::connections::in::hardware_channels")){
			ts = blocktypes.get(block_name+"::connections::in::hardware_channels");	
			if(typeof ts=="number") ts=[ts];
			split = ts.length;
		}
		if(blocktypes.contains(block_name+"::connections::out::hardware_channels")){
			if(ts=="no"){
				ts = blocktypes.get(block_name+"::connections::out::hardware_channels");
			}else{
				var ts2 = blocktypes.get(block_name+"::connections::out::hardware_channels");
				if(typeof ts2=="number") ts2=[ts2];				
				for(tii=0;tii<ts2.length;tii++){
					ts[ts.length]=ts2[tii];
				}
			}
		}
		if(ts!="no"){
			for(tii=0;tii<split;tii++){
				audio_to_data_poly.setvalue(ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES + MAX_AUDIO_INPUTS,"vis_meter", 1);
				audio_to_data_poly.setvalue(ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES + MAX_AUDIO_INPUTS,"vis_scope", 0);
				audio_to_data_poly.setvalue(ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES + MAX_AUDIO_INPUTS,"out_value", 0);
				audio_to_data_poly.setvalue(ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES + MAX_AUDIO_INPUTS,"out_trigger", 0);
				ts[tii] = ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES + MAX_AUDIO_INPUTS-1;
			}
			for(tii=split;tii<ts.length;tii++){
				audio_to_data_poly.setvalue(ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES,"vis_meter", 1);
				audio_to_data_poly.setvalue(ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES,"vis_scope", 0);
				audio_to_data_poly.setvalue(ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES,"out_value", 0);
				audio_to_data_poly.setvalue(ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES,"out_trigger", 0);
				ts[tii] = ts[tii]+MAX_AUDIO_VOICES+MAX_NOTE_VOICES-1;
			}
			hardware_metermap.replace(new_block_index,ts);
			if(blocktypes.get(block_name+"::max_polyphony")>1){
				voicecount(new_block_index,blocktypes.get(block_name+"::max_polyphony"));
			}
		}	
	}
//	draw_block(new_block_index);
	if(type == "note"){
		still_checking_polys |=1;
		//send_note_patcherlist();
	}else if(type == "audio"){
		still_checking_polys |=2;
		// send_audio_patcherlist();
	}
	still_checking_polys |=4;
	//	send_ui_patcherlist();
	rebuild_action_list = 1;
	return new_block_index;
}

function send_note_patcherlist(do_all){ //loads a single voice and returns, only unflags still_checking_polys when all loaded.
	var i;
	for(i = 0; i<MAX_NOTE_VOICES; i++){
		if(note_patcherlist[i]!=loaded_note_patcherlist[i]){
			//post("loading",note_patcherlist[i],"into",i+1,"\n");
			note_poly.setvalue(i+1,"patchername",(note_patcherlist[i]+".maxpat"));
			loaded_note_patcherlist[i]=note_patcherlist[i];
			if(do_all!=1){
				still_checking_polys |=1;
				return 1;
			}
		}
	}
	still_checking_polys &= 6;
	post("\nall note blocks loaded");
}

function send_audio_patcherlist(do_all){
	var i;
//	post("\nsorry",audio_upsamplelist,"\n and ",loaded_audio_patcherlist);
	for(i = 0; i<MAX_AUDIO_VOICES; i++){
		if((audio_patcherlist[i]!=loaded_audio_patcherlist[i])&&(audio_patcherlist[i]!="recycling")){
			if(RECYCLING && (audio_patcherlist[i] == "blank.audio")){ //instead of wiping poly slots it just puts them to sleep, ready to be reused.
				audio_patcherlist[i] = "recycling";
				audio_poly.setvalue(i+1, "muteouts", 1);
				if(!do_all){
					still_checking_polys |= 2;
					return 1;
				}
			}else{
				//post("loading",audio_patcherlist[i],"into",i+1,"\n");
				var pn = (audio_patcherlist[i]+".maxpat");
	//			post("i,",i,"uplist-i",audio_upsamplelist[i]);
				if(audio_upsamplelist[i]>1){
					pn = "upsample upwrap"+audio_upsamplelist[i]+" "+pn;
	//				post("\n upsample message sent : "+ pn);
				}
				if(loaded_audio_patcherlist[i] == "reload"){
					audio_poly.setvalue(i+1,"patchername","blank.audio.maxpat");
					loaded_audio_patcherlist[i] = "blank.audio";
					still_checking_polys |=2;
					return 1; //this clears it, come back next time and it'll load what you wanted
				}
				if(loading.dont_automute!=0){
					audio_poly.setvalue(i+1,"patchername","loading "+pn); //supresses autounmute
				}else{
					audio_poly.setvalue(i+1,"patchername",pn);
				}
				loaded_audio_patcherlist[i]=audio_patcherlist[i];
				if(do_all!=1){
					still_checking_polys |=2;
					return 1;
				} 
			}
		}
	}
	still_checking_polys &= 5;
	post("\nall audio blocks loaded");
	loading.dont_automute=0;
	redraw_flag.flag |= 4;
}

function send_ui_patcherlist(do_all){
	var i;
	for(i = 0; i<MAX_BLOCKS; i++){
		if(loaded_ui_patcherlist[i]!=ui_patcherlist[i]){
			loaded_ui_patcherlist[i]=ui_patcherlist[i];
			ui_poly.setvalue( i+1, "patchername",ui_patcherlist[i] + ".maxpat");
			if(do_all!=1){
				still_checking_polys |=4;
				return 1;
			}
		}
	}
	still_checking_polys &= 3;
	post("\nall ui blocks loaded");
//	blocks_tex_sent = [];
	redraw_flag.flag |= 4;
}


function poly_loaded(type,number){
	//post("poly loaded voice successfully",type,number,"\n");
	if(type=="audio"){
		if(still_checking_polys&2){ send_audio_patcherlist(); }
	}else if(type=="note"){
		if(still_checking_polys&1){ send_note_patcherlist(); }
		//	send_note_patcherlist();
	}else if(type=="ui"){
		if(still_checking_polys&4){ send_ui_patcherlist(); }	
		//	send_ui_patcherlist();
	}
}

function find_audio_voice_to_recycle(pa,up){ //ideally needs to match up upsampling values as well as patchers when recycling, but it doesnt at the moment
	//post("\n>>looking for a voice to recycle for",pa,"upsampling is",up);
	for(i=0;i<MAX_AUDIO_VOICES;i++){
		if((audio_patcherlist[i] == "recycling") && (loaded_audio_patcherlist[i] == pa)){
			//post("\nrecycling voice ",i);
			return i;
		}
	}
	for(i=0;i<MAX_AUDIO_VOICES;i++){
		if(audio_patcherlist[i]=="blank.audio") return i;
	}
	for(i=0;i<MAX_AUDIO_VOICES;i++){
		if(audio_patcherlist[i]=="recycling") return i;
	}
	post("\nERROR : can't find a free voice or one to recycle\n");
	return -1;
}

function next_free_voice(t){
	var i=0;
	if(t == "note"){
		for(i=0;i<MAX_NOTE_VOICES;i++){
			if(note_patcherlist[i]=="blank.note") return i;
		}
	}else if(t == "audio"){
		for(i=0;i<MAX_AUDIO_VOICES;i++){
			if(audio_patcherlist[i]=="blank.audio") return i;
		}
		for(i=0;i<MAX_AUDIO_VOICES;i++){
			if(audio_patcherlist[i]=="recycling") return i;
		}
	}else if(t == "hardware"){
		for(i=0;i<MAX_HARDWARE_BLOCKS;i++){
			if(hardware_list[i]=="none") return i;
		}		
	}
	post("\nERROR : can't find a free voice\n");
	return -1;
}


function next_free_block(){
	var a = new Dict;
	
	var index=0;
	while(index < MAX_BLOCKS){
		a = blocks.get("blocks["+index+"]");
		if(a <= 0) {
			return index;
		}
		if(a.contains("name")){
			index++;
		}else{
			return index;
		}
	}
	post("error: no free block slots found\n");
	return -1;
}

function create_connection_button(){
	connections.append("connections",new_connection);
	make_connection(connections.getsize("connections")-1);
	new_connection.clear();
	//click_clear(0,0);
	//outlet(8,"bang");
	set_display_mode("blocks");
	redraw_flag.flag |= 4;
}

function add_to_midi_routemap(m_index,targetvalue){ 
	//adds it if it needs to, returns index it is (now, or already) at

	var existing = [];
	if(midi_routemap.contains(m_index)){
		var ts = midi_routemap.get(m_index);
		if(typeof ts === "number"){
			existing[0] = ts;
		}else{
			existing = ts;
		}
		var ti = existing.indexOf(targetvalue);
		if(ti == -1){
			ti = existing.length;
			existing[ti] = targetvalue;
			midi_routemap.replace(m_index,existing);
			messnamed("update_midi_routemap","bang");	
			return ti;
			//post("couldn't find",targetvalue,"so i added it");
		}else{
			return ti;
			//post("already exists");
		}
	}else{
		existing[0] = targetvalue;
		midi_routemap.replace(m_index,existing);
		messnamed("update_midi_routemap","bang");	
		return 0;
	}
	return -1;
}

function add_to_mod_routemap(m_index,targetvoice,targetparam,wrap){
	var existing = [];
	var xx = -1;
	
	if(mod_routemap.contains(m_index)){
		var ts = mod_routemap.get(m_index);
		if(typeof ts === "number"){
			existing[0] = ts;
		}else{
			existing = ts;
		}
		xx=existing.indexOf(targetvoice);
		if(xx == -1){
			xx = existing.length;
			existing[existing.length] = targetvoice;
			//post("couldn't find",targetvoice,"so i added it");
		}else{
			//post("already exists");
		}
	}else{
		existing[0] = targetvoice;
		xx=0;
	}
	mod_routemap.replace(m_index,existing);
	existing = [];
	if(mod_param.contains(m_index)){
		var ts = mod_param.get(m_index);
		if(typeof ts === "number"){
			existing[0] = ts;
		}else{
			existing = ts;
		}
	}
	existing[xx] = targetparam;
	mod_param.replace(m_index,existing);	
}				
function remove_from_midi_routemap(m_index,targetvalue){
	var existing = [];
	var removed= [];
//	post("removing ",m_index, targetvalue,"from MIDI routemap\n");
	if(midi_routemap.contains(m_index)){
		var ts = midi_routemap.get(m_index);
		if(typeof ts === "number"){
			existing[0] = ts;
		}else{
			existing = ts;
		}
//		post("existing",existing);
		ts = existing.indexOf(targetvalue);
//		post("ts",ts,"m_index",m_index);
		if(ts != -1){
			var i,t=0;
			for(i=0;i<existing.length;i++){
				if(i!=ts){
					removed[t] = existing[i];
					t++;
				}
			}
			if(t==0){
				midi_routemap.remove(m_index.toString());
			}else{
				midi_routemap.replace(m_index.toString(),removed);
			}
			messnamed("update_midi_routemap","bang");
			return t; //0 = m_index removed, >=1=m_index editted
		}
	}else{
		post("Error : couldn't find midi route to remove it\n");
		return -1;
	}
}				
function remove_from_mod_routemap(m_index,targetvalue){
	var existing = [];
	var ex_parm = [];
	if(mod_routemap.contains(m_index)){
		var ts = mod_routemap.get(m_index);
		if(typeof ts === "number"){
			existing[0] = ts;
			ex_parm[0] = mod_param.get(m_index);
		}else{
			existing = ts;
			ex_parm = mod_param.get(m_index);
		}
		ts = existing.indexOf(targetvalue);
		if(ts != -1){
			var i,t=0;
			for(i=0;i<existing.length;i++){
				if(i!=ts){
					existing[t] = existing[i];
					ex_parm[t] = ex_parm[i];
					t++;
				}
			}
			if(t==0){
				mod_routemap.remove(m_index.toString());
				mod_param.remove(m_index.toString());
			}else{
				mod_routemap.replace(m_index.toString(),existing);
				mod_param.replace(m_index.toString(),ex_parm);
			}
		}
	}
}

function set_conversion(index, enab, type, scale, offn, offv, vect, inputno){
	conversion_buffer.poke(1,index,enab);
	conversion_buffer.poke(2,index,type);
	conversion_buffer.poke(3,index,scale);
	conversion_buffer.poke(4,index,offn);
	conversion_buffer.poke(5,index,offv);
	conversion_buffer.poke(6,index,vect);
	conversion_buffer.poke(7,index,inputno);
}


// REMOVE CONNECTION ###################################################################################################
function remove_connection(connection_number){	
	// post("removing connection",connection_number,"\n");
	var f_type = connections.get("connections["+connection_number+"]::from::output::type");
	var t_type = connections.get("connections["+connection_number+"]::to::input::type");
	var f_block = connections.get("connections["+connection_number+"]::from::number");
	var t_block = 1* connections.get("connections["+connection_number+"]::to::number");
	var f_voice_list = connections.get("connections["+connection_number+"]::from::voice");
	var t_voice_list = connections.get("connections["+connection_number+"]::to::voice");
	var f_o_no = connections.get("connections["+connection_number+"]::from::output::number");
	var t_i_no = connections.get("connections["+connection_number+"]::to::input::number");
	var to_block_type = blocks.get("blocks["+t_block+"]::type");
	
	var f_voices = [];
	var t_voices = [];
	var v,i;
	var ta;
	var m_index;
	var f_voice,t_voice;
	var max_poly;
	var varr=[];
	
	for(i=0;i<wires[connection_number].length;i++){ // disable the wires
		wires[connection_number][i].freepeer(); //enable=0;
	}
	wires[connection_number]=[];
	wire_ends[connection_number][0] = -1.057;
	if(!is_empty(connection_blobs[connection_number])){
		connection_blobs[connection_number].freepeer(); //enable = 0;
		connection_blobs[connection_number] = null;
		//post("removing blob");
	} 
	selected.wire[connection_number] = 0;
	
	// work out which polyvoices/matrix slots correspond
	if(f_type == "matrix"){
		max_poly = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::connections::out::matrix_channels");
		if(typeof varr == "number") varr = [varr];
		if(max_poly>1){
			if(f_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					f_voices[i] = varr[i];
				}
			}else{
				if(typeof f_voice_list == 'number'){
					f_voices[0] =varr[f_voice_list];
				}else{
					for(v=0;v<f_voice_list.length;v++){
						f_voices[v] = varr[v];
					}
				}
			}
		}else{
			f_voices[0] = varr[f_o_no];
		}
	}else if(f_type == "hardware"){
		max_poly = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::connections::out::hardware_channels");
		if(typeof varr == "number") varr = [varr];
		if(max_poly>1){
			if(f_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					f_voices[i] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[i];
				}
			}else{
				if(typeof f_voice_list == 'number'){
					f_voices[0] =NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[f_voice_list]-1;
				}else{
					for(v=0;v<f_voice_list.length;v++){
						f_voices[v] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[v]-1;
					}
				}
			}
		}else{
			f_voices[0] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES + varr[f_o_no];
		}
	}else{
		if(blocks.get("blocks["+f_block+"]::subchannels")>1){
			post("disconnecting stereo vst as if 2 voices",f_voice_list, voicemap.get(f_block));
			//so f_voices[] should contain the matrix channels where the vst poly voice is, we have to make an
			//adjustment so voice 2 goes to v1/o2 instead
			if(f_voice_list == "all"){
				ta = voicemap.get(f_block);
				if(!ta.length){
					f_voices = [+ta,+ta+MAX_AUDIO_VOICES];
				}else{
					for(i=0;i<ta.length;i++){
						f_voices[i*2]=+ta[i];
						f_voices[i*2+1]=+ta[i]+MAX_AUDIO_VOICES;
					}
				}
			}else{
				ta = voicemap.get(f_block);
				if(!ta.length){
					if(typeof f_voice_list == 'number'){
						f_voices[0] = [+ta + (f_voice_list-1)*MAX_AUDIO_VOICES];
					}else{
						for(v=0;v<f_voice_list.length;v++){
							f_voices[v] = [+ta + (f_voice_list[v]-1)*MAX_AUDIO_VOICES];
						}
					}
				}else{
					post("\nwtf kind of corner case is this?");
				}
			}			
		}else{
			if(f_voice_list == "all"){
				ta = voicemap.get(f_block);
				if(!ta.length){
					f_voices[0] = ta;
				}else{
					f_voices = ta;
				}
			}else{
				if(typeof f_voice_list == 'number'){
					f_voices[0] = voicemap.get(f_block+"["+(f_voice_list-1)+"]");
				}else{
					for(v=0;v<f_voice_list.length;v++){
						f_voices[v] = voicemap.get(f_block+"["+(f_voice_list[v]-1)+"]");
					}
				}
			}
		}
	}
	
	if(t_type == "matrix"){ // work out which polyvoices/matrix slots correspond
		max_poly = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::matrix_channels");
		if(typeof varr == "number") varr = [varr];
		if(max_poly>1){
			if(t_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					t_voices[i] = varr[i];
				}
			}else{
				if(typeof t_voice_list == 'number'){
					t_voices[0] = varr[t_voice_list-1];
				}else{
					for(v=0;v<t_voice_list.length;v++){
						t_voices[v] = varr[t_voice_list[v]-1];
					}
				}
			}
		}else{
			t_voices[0] = varr[t_i_no];
		}
	}else if(t_type == "hardware"){ // work out which polyvoices/matrix slots correspond
		max_poly = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::hardware_channels");
		if(typeof varr == "number") varr = [varr];
		if(max_poly>1){
			if(t_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					t_voices[i] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[i]-1;
				}
			}else{
				if(typeof t_voice_list == 'number'){
					t_voices[0] =NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[t_voice_list-1]-1;
				}else{
					for(v=0;v<t_voice_list.length;v++){
						t_voices[v] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[t_voice_list[v]-1]-1;
					}
				}
			}
		}else{
			t_voices[0] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES + varr[t_i_no] - 1;
		}
	}else{	// need to check for vsts		
		if(blocks.get("blocks["+t_block+"]::subchannels")>1){
			post("disconnecting stereo vst as if 2 voices",t_voice_list, voicemap.get(t_block));
			//so f_voices[] should contain the matrix channels where the vst poly voice is, we have to make an
			//adjustment so voice 2 goes to v1/o2 instead
			if(t_voice_list == "all"){
				ta = voicemap.get(t_block);
				if(!ta.length){
					t_voices = [+ta,+ta+MAX_AUDIO_VOICES];
				}else{
					for(i=0;i<ta.length;i++){
						t_voices[i*2]=+ta[i];
						t_voices[i*2+1]=+ta[i]+MAX_AUDIO_VOICES;
					}
				}
			}else{
				ta = voicemap.get(t_block);
				if(!ta.length){
					if(typeof t_voice_list == 'number'){
						t_voices[0] = [+ta + (t_voice_list-1)*MAX_AUDIO_VOICES];
						//post("NUMBER");
					}else{
						for(v=0;v<t_voice_list.length;v++){
							t_voices[v] = [+ta + (t_voice_list[v]-1)*MAX_AUDIO_VOICES];
						}
					}
				}else{
					post("TODO, some insane corner case");
				}
			}	
		}else{
			if(t_voice_list == "all"){
				ta = voicemap.get(t_block);
				if(typeof ta == "number"){
					t_voices = [ta];
				}else{
					t_voices = ta;
				}
			}else{		
				if(typeof t_voice_list == 'number'){
					t_voices[0] = voicemap.get(t_block+"["+(t_voice_list-1)+"]");
				}else{
					for(v=0;v<t_voice_list.length;v++){
						t_voices[v] = voicemap.get(t_block+"["+(t_voice_list[v]-1)+"]");
					}
				}		
			}
		}
	}
//		post("from voices: "+ f_voices + " type: "+f_type + " length " + f_voices.length+" list "+f_voice_list+"\n");
//		post("to voices: "+ t_voices + " type: "+t_type + " length " + t_voices.length+" list "+t_voice_list+"\n");
	for(i=0;i<f_voices.length;i++){
		if(((t_type == "midi") || (t_type == "block")) && (t_voice_list == "all") && (to_block_type != "hardware")){
//midi that goes to a polyalloc - handled here not per-to-voice
			if(f_type == "midi"){ //midi to midi(polyrouter)
//				post("midi to polyrouter midi");
				m_index = (f_voices[i])*128+f_o_no;
				//if(from_block_type=="audio") m_index+=MAX_NOTE_VOICES*128;
				var c_ind = MAX_MOD_IDS * m_index + t_block;
				set_conversion(c_ind,0,0,0,0,0,0,0);
				remove_from_midi_routemap(m_index,t_block);
			}else if(f_type == "audio"){//audio to midi (polyrouter)
//				post("audio to midi (polyrouter)\n");
//post("TODO only turn this out_value off if it's not used elsewhere\n");
				m_index = ((f_voices[i]+f_o_no*MAX_AUDIO_VOICES-MAX_NOTE_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
				var c_ind = MAX_MOD_IDS * m_index + t_block;
				set_conversion(c_ind,0,0,0,0,0,0,0);
				if(remove_from_midi_routemap(m_index,t_block) == 0) {
					audio_to_data_poly.setvalue((f_voices[i]+1+f_o_no*MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", "0");
				}
			}
		}else{
			f_voice = 1*f_voices[i];
			for(v=0;v<t_voices.length;v++){
				t_voice = 1* t_voices[v];
				if(t_type == "midi"){ //midi to an individual voice, so we need to offset
					if(to_block_type == "audio"){
						t_voice += MAX_BLOCKS;// + MAX_NOTE_VOICES;
					}else if(to_block_type == "note"){
						t_voice += MAX_BLOCKS;
					}else if(to_block_type == "hardware"){ // HARDWARE JUST LOOKS UP AND REPLACES T_VOICE
						var midiout = 0;
						if(blocktypes.contains(blocks.get("blocks["+t_block+"]::name")+"::midi_output_number")){
							midiout = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::midi_output_number");
						}
						var chanout=0;
						if(blocktypes.contains(blocks.get("blocks["+t_block+"]::name")+"::connections::in::midi_ins_channels")){
							var chans = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::midi_ins_channels");
							if(typeof chans == "number") chans = [chans];
							chanout = chans[t_i_no];
						}
						
						t_voice = MAX_BLOCKS + MAX_NOTE_VOICES + MAX_AUDIO_VOICES + midiout * 16 + chanout;
						post("harware midi out",midiout,"channelout",chanout,"so tv=",t_voice);
					}
				}
				// find the route, then remove this polyvoice's connection
				if(f_type == "audio" || f_type == "hardware"){
					if(t_type == "audio" || t_type == "hardware"){
						var outmsg = new Array(3);
						if(f_type == "audio"){
							outmsg[0] = f_voice - MAX_NOTE_VOICES + f_o_no * MAX_AUDIO_VOICES;
						}else{
							outmsg[0] = f_voice - 1;
						}
						outmsg[1] = t_voice;//? - MAX_NOTE_VOICES;
						if(t_type == "audio") outmsg[1] += t_i_no * MAX_AUDIO_VOICES- MAX_NOTE_VOICES;
						outmsg[2] = 0;
						//post("matrix "+outmsg[0]+" "+outmsg[1]+" "+outmsg[2]+"\n");
						matrix.message(outmsg);
					}else if((t_type == "midi") || (t_type == "block")){
						m_index = ((f_voice+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
						var m_index_mult = MAX_MOD_IDS * m_index;
						set_conversion(m_index_mult + t_voice,0,0,0,0,0,0,0);
						remove_from_midi_routemap(m_index,t_voice);
						var existing = midi_routemap.get(m_index);
						if(typeof existing=="number")existing=[existing];
						post("m_ind",m_index,"ex",existing);
						if(!is_empty(existing)){
							audio_to_data_poly.setvalue((f_voice+1)+f_o_no*MAX_AUDIO_VOICES-MAX_NOTE_VOICES, "out_value", "0");
						}
					}else if(t_type == "parameters"){
						m_index = ((f_voice-MAX_NOTE_VOICES+f_o_no * MAX_AUDIO_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
						post("starting tvoice",t_voice);
						t_voice+=2*MAX_AUDIO_VOICES+MAX_AUDIO_OUTPUTS;
						var tvv = t_voice;
						var tmod_id;
						// post("looking up",tvv,"in mod routes\n");
						var idslist = mod_routemap.get(tvv);
						if(typeof idslist == "number") idslist =[idslist];
						var tidslist = midi_routemap.get(m_index);
						if(typeof tidslist == "number") tidslist=[tidslist];
						var found = -1;
						var sx,sy;
						var tparamlist = mod_param.get(tvv);
						if(typeof tparamlist=="number") tparamlist=[tparamlist];
						for(sx=0;sx<idslist.length;sx++){
							for(sy=0;sy<tidslist.length;sy++){
								if(idslist[sx]+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS==tidslist[sy]){
									if(tparamlist[sx]==t_i_no) found = idslist[sx];									
								} 
							}
						}
						if(found!= -1){
							//post("FOUND",found);
							tmod_id = found;
						}else{
							post("failed to find mod_id to remove it");
							return 0;
						}
						var vvv=MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+tmod_id+MAX_HARDWARE_MIDI_OUTS;

						remove_from_midi_routemap(m_index,vvv);
						remove_from_mod_routemap(t_voice,tmod_id);
						if(tidslist.length<=1){
							audio_to_data_poly.setvalue((f_voice+1+f_o_no * MAX_AUDIO_VOICES), "out_value", "0");
						}
						var m_index_mult = MAX_MOD_IDS * m_index;
						set_conversion(m_index_mult + vvv,0,0,0,0,0,0,0);
					}
				}else if(f_type == "matrix"){
					if(t_type == "matrix") {
						post("removing MATRIX connection",f_voices,t_voices);
						var mi,mf,sw=0;
						if(io_dict.contains("matrix_switch::matrix_out")) sw=1;
						for(mi=0;mi<t_voices.length;mi++){
							if(ext_matrix.connections[t_voices[mi]]==16) post("ERROR i expected this matrix destination to be assigned and it isnt");
							if(sw){
								if(Math.floor(t_voices[mi]) == io_dict.get("matrix_switch::matrix_out")){
									t_voices[mi]=Math.floor(t_voices[mi]);
									messnamed("to_ext_matrix","switch",0);
									ext_matrix.switch = -1;
									post("setting switch to 0");
								}
							}
							for(mf=0;mf<f_voices.length;mf++){
								ext_matrix.connections[t_voices[mi]]=16;
								messnamed("to_ext_matrix",t_voices[mi],16);
								post("removing external matrix connection to",t_voices[mi]);
							}
						}
					}else{
						post("ERROR : ext matrix connections can only go to the ext matrix. wtf did you just try to remove?");
					}
				}else if(f_type == "midi"){
					if((t_type == "audio") || (t_type == "hardware")){
						m_index = (f_voice)*128+f_o_no;
						var tvv = t_voice - MAX_NOTE_VOICES+MAX_AUDIO_VOICES*(t_i_no);
						if(t_type == "hardware"){
							//t_i_no = 0;
							tvv = t_voice;
						}
						var tmod_id;
						var idslist = mod_routemap.get(tvv);
						var tidslist = midi_routemap.get(m_index);
						if(typeof idslist == "number") idslist =[idslist];
						if(typeof tidslist == "number") tidslist=[tidslist];
						var found = -1;
						var sx,sy;

						for(sx=0;sx<idslist.length;sx++){
							for(sy=0;sy<tidslist.length;sy++){
								if(idslist[sx]+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS==tidslist[sy]){
									found = idslist[sx];
								} 
							}
						}
						if(found!= -1){
							//post("FOUND",found);
							tmod_id = found;
						}else{
							post("failed to find mod_id to remove it");
							return 0;
						}
						var vvv=tmod_id+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS;
						remove_from_midi_routemap(m_index,vvv);
						mod_buffer.poke(1, tmod_id, 0);
						remove_from_mod_routemap(tvv,tmod_id); 
						var m_index_mult = MAX_MOD_IDS * m_index;
						set_conversion(m_index_mult + vvv,0,0,0,0,0,0,0);
						sigouts.setvalue(tvv+1,0);
					}else if((t_type == "midi") || (t_type == "block")){
						//this is a midi-midi connection for a single voice
						m_index = (f_voice)*128+f_o_no;
						var m_index_mult = MAX_MOD_IDS * m_index;
						set_conversion(m_index_mult + t_voice,0,0,0,0,0,0,0);
						remove_from_midi_routemap(m_index,t_voice);
					}else if(t_type == "parameters"){
						// parameter connections are just like midi ones really
						m_index = (f_voice)*128+f_o_no; 
						t_voice+=2*MAX_AUDIO_VOICES+MAX_AUDIO_OUTPUTS;
						var tvv = t_voice;
						var tmod_id;
						var idslist = mod_routemap.get(tvv);
						if(typeof idslist == "number") idslist =[idslist];
						if(idslist == "null") idslist = [];
						var tidslist = midi_routemap.get(m_index);
						if(typeof tidslist == "number") tidslist=[tidslist];
						var found = -1;
						var sx,sy;
						var tparamlist = mod_param.get(tvv);
						if(typeof tparamlist=="number")tparamlist=[tparamlist];
						for(sx=0;sx<idslist.length;sx++){
							for(sy=0;sy<tidslist.length;sy++){
								if(idslist[sx]+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS==tidslist[sy]){
									if(tparamlist[sx]==t_i_no) found = idslist[sx];
								}
							}
						}
						if(found!= -1){
							//post("FOUND",found);
							tmod_id = found;
						}else{
							post("Error couldn't find this connection's modid\n");
						}
						
						remove_from_mod_routemap(t_voice,tmod_id);  
						var vvv = MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+tmod_id+MAX_HARDWARE_MIDI_OUTS;
						remove_from_midi_routemap(m_index,vvv);
						var m_index_mult = MAX_MOD_IDS * m_index;
						set_conversion(m_index_mult + vvv,0,0,0,0,0,0,0);
						mod_buffer.poke(1, tmod_id, 0)
					}		
				}		

			}
		}
	}

	var empt=new Dict;  // wipe this one from the dictionary
	connections.set("connections["+connection_number+"]", empt);
	rebuild_action_list = 1;
}


function make_connection(cno){
// takes the new connection dict and 
// works out the route for the connection
// makes the connection
// (it has already been copied into the connections dict, at the slot we've been called with?)
	var f_type = connections.get("connections["+cno+"]::from::output::type");
	var t_type = connections.get("connections["+cno+"]::to::input::type");
	var f_o_no = connections.get("connections["+cno+"]::from::output::number");
	var t_i_no = connections.get("connections["+cno+"]::to::input::number");	
	var f_voice_list = connections.get("connections["+cno+"]::from::voice");
	var t_voice_list = connections.get("connections["+cno+"]::to::voice");
	var conversion = connections.get("connections["+cno+"]::conversion");
	var f_block = 1* connections.get("connections["+cno+"]::from::number");
	var t_block = 1* connections.get("connections["+cno+"]::to::number");
	var to_block_type = blocks.get("blocks["+t_block+"]::type");
	
	var f_voices = [];
	var t_voices = [];
	var f_voice,t_voice;
	var v,i;
	var ta;
	var m_index;
	var varr=[];
	var max_poly;
	// work out which polyvoices/matrix slots correspond
	if(f_type == "matrix"){
		max_poly = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::connections::out::matrix_channels");
		if(typeof varr == "number") varr = [varr];
		if(max_poly>1){
			if(f_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					f_voices[i] = varr[i];
				}
			}else{
				if(typeof f_voice_list == 'number'){
					f_voices[0] =varr[f_voice_list];
				}else{
					for(v=0;v<f_voice_list.length;v++){
						f_voices[v] = varr[v];
					}
				}
			}
		}else{
			f_voices[0] = varr[f_o_no];
		}
	}else if(f_type == "hardware"){
		max_poly = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::connections::out::hardware_channels");
		if(typeof varr == "number") varr = [varr];
		if(max_poly>1){
			if(f_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					f_voices[i] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[i];
				}
			}else{
				if(typeof f_voice_list == 'number'){
					f_voices[0] =NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[f_voice_list]-1;
				}else{
					for(v=0;v<f_voice_list.length;v++){
						f_voices[v] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[v]-1;
					}
				}
			}
		}else{
//			post("\n this is where the error was varr, f_o_no",varr,f_o_no);
			f_voices[0] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES + varr[f_o_no];
		}
	}else{ // need to check for vsts, and if so do what i did for hardware above:
		if(blocks.get("blocks["+f_block+"]::subchannels")>1){
			post("connecting stereo vst as if 2 voices",f_voice_list, voicemap.get(f_block));
			//so f_voices[] should contain the matrix channels where the vst poly voice is, we have to make an
			//adjustment so voice 2 goes to v1/o2 instead
			if(f_voice_list == "all"){
				ta = voicemap.get(f_block);
				if(!ta.length){
					f_voices = [+ta,+ta+MAX_AUDIO_VOICES];
				}else{
					for(i=0;i<ta.length;i++){
						f_voices[i*2]=+ta[i];
						f_voices[i*2+1]=+ta[i]+MAX_AUDIO_VOICES;
					}
				}
			}else{
				ta = voicemap.get(f_block);
				if(!ta.length){
					if(typeof f_voice_list == 'number'){
						f_voices[0] = [+ta + (f_voice_list-1)*MAX_AUDIO_VOICES];
					}else{
						for(v=0;v<f_voice_list.length;v++){
							f_voices[v] = [+ta + (f_voice_list[v]-1)*MAX_AUDIO_VOICES];
						}
					}
				}else{
					post("\nwtf kind of corner case is this?");
				}
			}	
		}else{
			if(f_voice_list == "all"){
				ta = voicemap.get(f_block);
				if(!ta.length){
					f_voices[0] = ta;
				}else{
					f_voices = ta;
				}
			}else{
				if(typeof f_voice_list == 'number'){
					f_voices[0] = voicemap.get(f_block+"["+(f_voice_list-1)+"]");
				}else{
					for(v=0;v<f_voice_list.length;v++){
						f_voices[v] = voicemap.get(f_block+"["+(f_voice_list[v]-1)+"]");
					}
				}
			}			
		}
	}
	if(t_type == "matrix"){ // work out which polyvoices/matrix slots correspond
		max_poly = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::matrix_channels");
		if(typeof varr == "number") varr = [varr];
		if(max_poly>1){
			if(t_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					t_voices[i] = varr[i];
				}
			}else{
				if(typeof t_voice_list == 'number'){
					t_voices[0] = varr[t_voice_list-1];
				}else{
					for(v=0;v<t_voice_list.length;v++){
						t_voices[v] = varr[t_voice_list[v]-1];
					}
				}
			}
		}else{
			t_voices[0] = varr[t_i_no];
		}
	}else if(t_type == "hardware"){ // work out which polyvoices/matrix slots correspond
		max_poly = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::hardware_channels");
		if(typeof varr == "number") varr = [varr];
		if(max_poly>1){
			if(t_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					t_voices[i] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[i]-1;
				}
			}else{
				if(typeof t_voice_list == 'number'){
					t_voices[0] =NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[t_voice_list-1]-1;
				}else{
					for(v=0;v<t_voice_list.length;v++){
						t_voices[v] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[t_voice_list[v]-1]-1;
					}
				}
			}
		}else{
//			post("\n this is where the error was varr, f_o_no",varr,t_i_no,t_block,blocks.get("blocks["+t_block+"]::name"),blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::hardware_channels"));
			t_voices[0] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES + varr[t_i_no] - 1;
		}
	}else{	
		if(blocks.get("blocks["+t_block+"]::subchannels")>1){
			post("connecting stereo vst as if 2 voices",t_voice_list, voicemap.get(t_block));
			//so f_voices[] should contain the matrix channels where the vst poly voice is, we have to make an
			//adjustment so voice 2 goes to v1/o2 instead
			if(t_voice_list == "all"){
				ta = voicemap.get(t_block);
				if(!ta.length){
					t_voices = [+ta,+ta+MAX_AUDIO_VOICES];
				}else{
					for(i=0;i<ta.length;i++){
						t_voices[i*2]=+ta[i];
						t_voices[i*2+1]=+ta[i]+MAX_AUDIO_VOICES;
					}
				}
			}else{
				ta = voicemap.get(t_block);
				if(!ta.length){
					if(typeof t_voice_list == 'number'){
						t_voices[0] = [+ta + (t_voice_list-1)*MAX_AUDIO_VOICES];
						//post("NUMBER");
					}else{
						for(v=0;v<t_voice_list.length;v++){
							t_voices[v] = [+ta + (+t_voice_list[v]-1)*MAX_AUDIO_VOICES];
						}
					}
				}else{
					post("TODO, some insane corner case");
				}
			}	
		}else{
			if(t_voice_list == "all"){
				ta = voicemap.get(t_block);
				if(typeof ta == "number"){
					t_voices = [ta];
				}else{
					t_voices = ta;
				}
			}else{		
				if(typeof t_voice_list == 'number'){
					t_voices[0] = voicemap.get(t_block+"["+(t_voice_list-1)+"]");
				}else{
					for(v=0;v<t_voice_list.length;v++){
						t_voices[v] = voicemap.get(t_block+"["+(t_voice_list[v]-1)+"]");
					}
				}		
			}
		}
	}
//		post("\nfrom voices: "+ f_voices + " type: "+f_type + " length " + f_voices.length+" list "+f_voice_list+" fono "+f_o_no+"\n");
//		post("to voices: "+ t_voices + " type: "+t_type + " length " + t_voices.length+" list "+t_voice_list+" tono "+t_i_no+"\n");	
	if((!is_empty(t_voices))&&(!is_empty(f_voices))){
		f_voices.sort(function(a,b) { return a-b; });
		t_voices.sort(function(a,b) { return a-b; });
	//	post("from voices: "+ f_voices + "\n");
//		post("to voices: "+ t_voices + "\n"+typeof t_voices[0]);
		for(i=0;i<f_voices.length;i++){
			if(((t_type == "midi")||(t_type == "block")) && (t_voice_list == "all") && (to_block_type != "hardware")){ 
	//midi that goes to a polyalloc - handled here not per-to-voice
				if(f_type == "midi"){ //midi to midi(polyrouter)
					m_index = (f_voices[i])*128+f_o_no;
					add_to_midi_routemap(m_index,t_block);
					var enab = 1-conversion.get("mute");
					var scale = conversion.get("scale");
					var offn = conversion.get("offset");
					var offv = conversion.get("offset2");
					var c_ind = MAX_MOD_IDS * m_index + t_block; //existing[existing.length-1];
					if(t_type == "midi"){
						set_conversion(c_ind,enab,4,scale,offn,offv,0,t_i_no); 
					}else{
						//var b_i_no = -(1 +t_i_no);
						//post("\n\n\n\n\n\nBINO WOULD BE",b_i_no,"conv would be",c_ind,enab,4,scale,offn,offv,0, b_i_no);
						set_conversion(c_ind,enab,4,scale,offn,offv,0, -(1 +t_i_no)); 
					}
				}else if(f_type == "audio"){//audio to midi (polyrouter)
				//	post("audio to midi (polyrouter)\n");
					audio_to_data_poly.setvalue((f_voices[i]+1+f_o_no*MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", "1");
				//	post("f_v[i]=",f_voices[i]," f_o_no=",f_o_no,"\n");
					m_index = ((f_voices[i]+f_o_no*MAX_AUDIO_VOICES-MAX_NOTE_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
					add_to_midi_routemap(m_index,t_block);
					var enab = 1-conversion.get("mute");
					var scale = conversion.get("scale");
					var offn = conversion.get("offset");
					var offv = conversion.get("offset2");
					var vect = conversion.get("vector");
					var c_ind = MAX_MOD_IDS * m_index + t_block;
					set_conversion(c_ind,enab,2,scale,offn,offv,vect,t_i_no);
				}
			}else{
				f_voice = f_voices[i];
				for(v=0;v<t_voices.length;v++){
					t_voice = t_voices[v];
					if(t_type == "midi"){ //midi to an individual voice, so we need to offset
						if(to_block_type == "audio"){
							t_voice += MAX_BLOCKS;// + MAX_NOTE_VOICES;
						}else if(to_block_type == "note"){
							t_voice += MAX_BLOCKS;
						}else if(to_block_type == "hardware"){ // HARDWARE JUST LOOKS UP AND REPLACES T_VOICE
							var midiout = 0;
							if(blocktypes.contains(blocks.get("blocks["+t_block+"]::name")+"::midi_output_number")){
								midiout = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::midi_output_number");
							}
							var chanout=0;
							if(blocktypes.contains(blocks.get("blocks["+t_block+"]::name")+"::connections::in::midi_ins_channels")){
								var chans = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::midi_ins_channels");
								if(typeof chans == "number") chans = [chans];
								chanout = chans[t_i_no];
							}
							
							t_voice = MAX_BLOCKS + MAX_NOTE_VOICES + MAX_AUDIO_VOICES + midiout * 16 + chanout;
							post("harware midi out",midiout,"channelout",chanout,"so tv=",t_voice);
						}
					}

					// find the route, then enable / set parameters of this connection
					if(f_type == "audio" || f_type == "hardware"){
						if(t_type == "audio" || t_type == "hardware"){
							var outmsg = new Array(3);
							var force_unity = 0;
							if(f_type == "audio"){
								outmsg[0] = f_voice - MAX_NOTE_VOICES + f_o_no * MAX_AUDIO_VOICES;
							}else{
								outmsg[0] = f_voice - 1;
							}
							if(t_type == "audio"){
								outmsg[1] = t_voice - MAX_NOTE_VOICES + t_i_no * MAX_AUDIO_VOICES;
								if(f_type == "audio"){
									if(conversion.contains("force_unity")){
										force_unity = 1;
									}
								}
							}else{
								outmsg[1] = t_voice;//shuold it be this? - MAX_NOTE_VOICES;
							}
							if(force_unity){
								outmsg[2] = (1-conversion.get("mute"));
							}else{
								var spread_l = spread_level(i, v, conversion.get("offset"),conversion.get("vector"),f_voices.length, t_voices.length);
								outmsg[2] = conversion.get("scale") * (1-conversion.get("mute")) * spread_l;
							}
							//post("matrix "+outmsg[0]+" "+outmsg[1]+" "+outmsg[2]+"\n");
							matrix.message(outmsg);
						}else if(t_type == "midi"){
				// the audio is already routed to the monitoring objects, you just need to turn them on and route that data to the right place	
	//						post("audio to midi");
							audio_to_data_poly.setvalue((f_voice+1+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", "1");
							m_index = ((f_voice+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
							add_to_midi_routemap(m_index,t_voice);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							var c_ind = MAX_MOD_IDS * m_index + t_voice;
							set_conversion(c_ind,enab,2,scale,offn,offv,vect,t_i_no);
						}else if(t_type == "block"){
							// the audio is already routed to the monitoring objects, you just need to turn them on and route that data to the right place	
	//						post("audio to midi");
							audio_to_data_poly.setvalue((f_voice+1+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", "1");
							m_index = ((f_voice+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
							add_to_midi_routemap(m_index,t_voice);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							var c_ind = MAX_MOD_IDS * m_index + t_voice;
							//AM I THE CRASH set_conversion(c_ind,enab,2,scale,offn,offv,vect,-(1+t_i_no));
						}else if(t_type == "parameters"){
							audio_to_data_poly.setvalue((f_voice+1+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", "1");
							m_index = ((f_voice-MAX_NOTE_VOICES+f_o_no * MAX_AUDIO_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
							t_voice+=2*MAX_AUDIO_VOICES+MAX_AUDIO_OUTPUTS;
							var tmod_id;
							var idslist = mod_routemap.get(t_voice);
							if(typeof idslist == "number") idslist =[idslist];
							var tidslist = midi_routemap.get(m_index);
							if(typeof tidslist == "number") tidslist=[tidslist];
							if(is_empty(idslist)||is_empty(tidslist)){
//								post("one or both empty so creating new modid");
								mod_id++;
								tmod_id=mod_id;
								mod_buffer.poke(1, mod_id, 0); //<<this is eg how the values get poked in, set to 0 on connect for good housekeeping..							
							}else{
								var found = -1;
								var sx,sy;
								var tparamlist = mod_param.get(t_voice);
								if(typeof tparamlist=="number") tparamlist=[tparamlist];
								for(sx=0;sx<idslist.length;sx++){
									for(sy=0;sy<tidslist.length;sy++){
										if(idslist[sx]+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS==tidslist[sy]){
//											post("foundindex",idslist[sx]);
//											post("PARAM IS ALREADY",tparamlist[idslist[sx]-1]);
											if(tparamlist[sx]==t_i_no) found = idslist[sx];
										}
									}
								}
								if(found!= -1){
//									post("FOUND",found);
									tmod_id = found;
								}else{
//									post("present but no matching id found");
									mod_id++;
									tmod_id=mod_id;
									mod_buffer.poke(1, mod_id, 0);
								}
							}

							add_to_midi_routemap(m_index,tmod_id+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS);
							var wrap = 0;
							if(blocktypes.contains(blocks.get("blocks["+t_block+"]::name")+"::parameters["+t_i_no+"]::wrap")){
								wrap = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::parameters["+t_i_no+"]::wrap");
							}
							add_to_mod_routemap(t_voice,tmod_id,t_i_no,wrap);  
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offs = conversion.get("offset");
							if(typeof offs === "number"){
								var offn = offs;
								var offv = 0;
							}else{
								var offn = offs[0];
								var offv = offs[1];
							}
							var vect = conversion.get("vector");
							var vvv=MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+tmod_id+MAX_HARDWARE_MIDI_OUTS;
							vvv += MAX_MOD_IDS * m_index;
							set_conversion(vvv,enab,1,scale,offn,offv,vect,t_i_no);
						}
					}else if(f_type == "matrix"){
						if(t_type == "matrix") {
							post("\nmaking MATRIX connection",f_voices,t_voices);
							if(f_voices.length>1) post("\nWARNING multiple from voices? matrix can't work as a mixer");
							var mi,tf,sw=0;
							var mu=conversion.get("mute");
							if(io_dict.contains("matrix_switch::matrix_out")) sw=1;
							for(mi=0;mi<t_voices.length;mi++){
								if((ext_matrix.connections[t_voices[mi]]!=16)&&(ext_matrix.connections[t_voices[mi]]!=f_voices[0])){
									post("WARNING i think this matrix destination is in use, connected to:",ext_matrix.connections[t_voices[mi]]);
								}
								if(sw){
									if(Math.floor(t_voices[mi]) == io_dict.get("matrix_switch::matrix_out")){
										tf=t_voices[mi];
										t_voices[mi]=Math.floor(t_voices[mi]);
										tf=10*(tf-t_voices[mi]);
										messnamed("to_ext_matrix","switch",tf);
										ext_matrix.switch = tf;
										post("setting switch to",tf);
									}
								}
								ext_matrix.connections[t_voices[mi]]=f_voices[0];
								if(mu==0){
									messnamed("to_ext_matrix",t_voices[mi],f_voices[0]);
									post("setting external matrix connection from",f_voices[0],"to",t_voices[mi]);
								}else{
									messnamed("to_ext_matrix",t_voices[mi],16);
									post("muting external matrix connection from",f_voices[0],"to",t_voices[mi]);
								}
							}
						}else{
							post("ERROR : ext matrix connections can only go to the ext matrix");
						}
					}else if(f_type == "midi"){
						if((t_type == "audio") || (t_type == "hardware")){
							//this is a midi-audio connection for a single voice - works like parammod but eventually sends a number to the sig~ instead of to a buffer
							m_index = (f_voice)*128+f_o_no;
							var tvv = t_voice - MAX_NOTE_VOICES+MAX_AUDIO_VOICES*(t_i_no);
							if(t_type == "hardware"){
								//t_i_no = 0;
								tvv = t_voice;// - MAX_NOTE_VOICES+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK;
							}
							var tmod_id;
							var idslist = mod_routemap.get(tvv);
							if(typeof idslist == "number") idslist =[idslist];
							var tidslist = midi_routemap.get(m_index);
							if(typeof tidslist == "number") tidslist=[tidslist];
							if(is_empty(idslist)||is_empty(tidslist)){
//								post("one or both empty so creating new modid");
								mod_id++;
								tmod_id=mod_id;
							}else{
								var found = -1;
								var sx,sy;
								for(sx=0;sx<idslist.length;sx++){
									for(sy=0;sy<tidslist.length;sy++){
										if(idslist[sx]+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS==tidslist[sy]){
											found = idslist[sx];
										}
									}
								}
								if(found!= -1){
									tmod_id = found;
								}else{
//									post("present but no matching id found");
									mod_id++;
									tmod_id=mod_id;
								}
							}
							
							
							var vvv = tmod_id+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS; 
							add_to_midi_routemap(m_index,vvv);
							mod_buffer.poke(1, tmod_id, 0); 		
							add_to_mod_routemap(tvv,tmod_id,0,0); 
							//post("midi to audio",tvv);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offs = conversion.get("offset");
							if(typeof offs === "number"){
								var offn = offs;
								var offv = 0;
							}else{
								var offn = offs[0];
								var offv = offs[1];
							}
							var vect = conversion.get("vector");
							
							vvv += MAX_MOD_IDS * m_index;
							set_conversion(vvv,enab,3,scale,offn,offv,vect,t_i_no);
						}else if(t_type == "midi"){
							//this is a midi-midi connection for a single voice
							//post("fv",f_voice,"f_o",f_o_no);
							m_index = (f_voice)*128+f_o_no;
							add_to_midi_routemap(m_index,t_voice);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							var m_index_mult = MAX_MOD_IDS * m_index;
							set_conversion(m_index_mult + t_voice,enab,4,scale,offn,offv,vect,t_i_no);
						}else if(t_type == "block"){
							//this is a midi-block control connection for a single voice
							//post("fv",f_voice,"f_o",f_o_no);
							m_index = (f_voice)*128+f_o_no;
							add_to_midi_routemap(m_index,t_voice);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							var m_index_mult = MAX_MOD_IDS * m_index;
							//AM I THE CRASH set_conversion(m_index_mult + t_voice,enab,4,scale,offn,offv,vect,-(1+t_i_no));
						}else if(t_type == "parameters"){
							// parameter connections are just like midi ones really
							m_index = (f_voice)*128+f_o_no; 
							t_voice += NO_IO_PER_BLOCK * MAX_AUDIO_VOICES + MAX_AUDIO_OUTPUTS;
							var tvv = t_voice;
							var tmod_id;
							var idslist = mod_routemap.get(tvv);
							if(typeof idslist == "number") idslist =[idslist];
							var tidslist = midi_routemap.get(m_index);
							if(typeof tidslist == "number") tidslist=[tidslist];
	//						post("ids",idslist,"tids",tidslist);
							if(is_empty(idslist)||is_empty(tidslist)){
//								post("one or both empty so creating new modid");
								mod_id++;
								tmod_id=mod_id;
								mod_buffer.poke(1, mod_id, 0); //<<this is eg how the values get poked in, set to 0 on connect for good housekeeping..							
							}else{
								var found = -1;
								var sx,sy;
								var tparamlist = mod_param.get(tvv);
								if(typeof tparamlist=="number")tparamlist=[tparamlist];
//								post("current param list ",tparamlist);
								for(sx=0;sx<idslist.length;sx++){
									for(sy=0;sy<tidslist.length;sy++){
										if(idslist[sx]+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS==tidslist[sy]){
//											post("foundindex",idslist[sx]);
//											post("PARAM IS ALREADY",tparamlist[idslist[sx]-1]);
											if(tparamlist[sx]==t_i_no) found = idslist[sx];
										} 
									}
								}
								if(found!= -1){
//									post("FOUND",found);
									tmod_id = found;								
								}else{
//									post("present but no matching id found");
									mod_id++;
									tmod_id=mod_id;
									mod_buffer.poke(1, mod_id, 0);
								}
							}

							add_to_midi_routemap(m_index,tmod_id+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS);
							var wrap = 0;
							if(blocktypes.contains(blocks.get("blocks["+t_block+"]::name")+"::parameters["+t_i_no+"]::wrap")){
								wrap = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::parameters["+t_i_no+"]::wrap");
								//post("wrap",wrap);
							}
							add_to_mod_routemap(t_voice,tmod_id,t_i_no,wrap);  
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offs = conversion.get("offset");
							if(typeof offs === "number"){
								var offn = offs;
								var offv = 0;
							}else{
								var offn = offs[0];
								var offv = offs[1];
							}
							var vect = conversion.get("vector");
							var vvv = MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+tmod_id+MAX_HARDWARE_MIDI_OUTS;
							// post(m_index, t_voice+1,"modid:",tmod_id,"vals",enab,scale,offs,offn,offv,vect,"\n");
							var m_index_mult = MAX_MOD_IDS * m_index;
							set_conversion(m_index_mult + vvv,enab,3,scale,offn,offv,vect,t_i_no);
						}		
					}

					
				}
			}
		}
		draw_wire(cno);
	}
	rebuild_action_list = 1;
}	

function build_new_connection_menu(from, to, fromv,tov){
	// builds the connection menu and primes the new_connection one (that is eventually copied into 'connections')
					
	var fromname = blocks.get('blocks['+from+']::name');
	var toname = blocks.get('blocks['+to+']::name');
	var totype = blocks.get('blocks['+to+']::type');
	if(toname == null) return 0;
	connection_menu.parse('{ }');
 	connection_menu.replace("from::number",from);
	connection_menu.replace("from::name", fromname);
	connection_menu.replace("to::number", to);
	connection_menu.replace("to::name" , toname);
	connection_menu.replace("to::viewoffset", 0);
	connection_menu.replace("from::viewoffset" , 0);
	connection_menu.replace("from::voices", blocks.get('blocks['+from+']::poly::voices'));
	connection_menu.replace("to::voices", blocks.get('blocks['+to+']::poly::voices'));
		
	new_connection.parse('{ }');
 	new_connection.replace("from::number",from);
	new_connection.replace("to::number", to);
	
	var notall = 0;
	if(blocktypes.contains(fromname+"::connections::out::dontdefaultall")) notall = blocktypes.get(fromname+"::connections::out::dontdefaultall");
	if(fromv==-1){
		if(notall){
			new_connection.replace("from::voice", 1 );
		}else{
			new_connection.replace("from::voice", "all" );		
		}
	}else{
		new_connection.replace("from::voice", fromv + 1 );
	}
	notall = 0;
	if(blocktypes.contains(toname+"::connections::in::dontdefaultall")) notall = blocktypes.get(toname+"::connections::in::dontdefaultall");
	if(tov == -1){
		if(notall){
			new_connection.replace("to::voice", 1 );
		}else{
			new_connection.replace("to::voice", "all" );		
		}
	}else{
		new_connection.replace("to::voice", tov + 1 );
	}
	var force_unity = 0;
	if(blocktypes.contains(fromname+"::connections::out::force_unity")){
		force_unity = 1;
		new_connection.replace("conversion::force_unity" , 1);
	} 
	new_connection.replace("conversion::mute" , 0);
	new_connection.replace("conversion::scale", 1);
	new_connection.replace("conversion::vector", 0);	
	new_connection.replace("conversion::offset", 0);	
	
	var default_assigned=0;
	
	var d = new Dict;
	d = blocktypes.get(fromname);
	if(d.contains("connections::out::hardware")){
		connection_menu.replace("from::connections::hardware",d.get("connections::out::hardware"));
		if(d.contains("connections::out::matrix_channels")) connection_menu.replace("from::connections::matrix",d.get("connections::out::hardware"));
		if(!default_assigned){
			default_assigned=2;
			new_connection.replace("from::output::number",0);
			new_connection.replace("from::output::type","hardware");
		}
	}
	if(d.contains("connections::out::audio")){
		connection_menu.replace("from::connections::audio",d.get("connections::out::audio"));
		if(!default_assigned){
			default_assigned=2;
			new_connection.replace("from::output::number",0);
			new_connection.replace("from::output::type","audio");
		}
	}
	if(d.contains("connections::out::midi")){
		connection_menu.replace("from::connections::midi",d.get("connections::out::midi"));
		if(!default_assigned){
			default_assigned=1;
			new_connection.replace("from::output::number",0);
			new_connection.replace("from::output::type","midi");
		}
	}
	//post("\n\n\nNEWCONN def_ass=",default_assigned);
	var r_default_assigned=0;
	d = blocktypes.get(toname);
	post("toname",toname);
	if(d.contains("connections::in::hardware")){
		connection_menu.replace("to::connections::hardware",d.get("connections::in::hardware"));
		if(d.contains("connections::in::matrix_channels")) connection_menu.replace("to::connections::matrix",d.get("connections::in::hardware"));
		if(!r_default_assigned){
			if(default_assigned==2){
				r_default_assigned=1;
				new_connection.replace("to::input::number",0);
				new_connection.replace("to::input::type","hardware");
				new_connection.replace("conversion::offset", 0);
				new_connection.replace("conversion::offset2", 0.5);
			}if(default_assigned==1){
				new_connection.replace("conversion::offset", 0.5);
				r_default_assigned=1;
			}
		}
	}
	if(d.contains("connections::in::audio")){
		connection_menu.replace("to::connections::audio",d.get("connections::in::audio"));
		if(!r_default_assigned){
			if(default_assigned==2){
				r_default_assigned=1;
				new_connection.replace("to::input::number",0);
				new_connection.replace("to::input::type","audio");
				new_connection.replace("conversion::offset", 0);
				new_connection.replace("conversion::offset2", 0.5);
			}if(default_assigned==1){
				new_connection.replace("conversion::offset", 0.5);
				r_default_assigned=1;
			}
		}
	}
	if(d.contains("connections::in::midi")){
		connection_menu.replace("to::connections::midi",d.get("connections::in::midi"));
		if((!r_default_assigned)&&(default_assigned==1)){
			r_default_assigned=1;
			new_connection.replace("to::input::number",0);
			new_connection.replace("to::input::type","midi");
			new_connection.replace("conversion::offset", 0.5);
			new_connection.replace("conversion::offset2", 0.5);
		}
	}
	//post("\nNEWCONN r_def_ass=",r_default_assigned);
	
	if(d.contains("parameters")){
		var i = 0;	
		var params = [];	
		while(d.contains('parameters['+i+']::name')){
			if(d.contains('parameters['+i+']::nomap')){
				params[i] = "nomap";
			}else{
				params[i] = d.get("parameters["+i+"]::name");
			}
			i++;
		}
		connection_menu.replace("to::connections::parameters", params);
	}
	if(totype!="hardware") connection_menu.replace("to::connections::block", ["mute toggle", "mute"]);
}


function remove_block(block){
	post("removing block",block,"\n");
	var i;
	sidebar.scopes.voice = -1;
	// remove it from all states
	delete_state(-1,block);
	// remove all connections from this block.
	for(i=0;i<connections.getsize("connections");i++){
		if((connections.contains("connections["+i+"]::from::number")) && (connections.contains("connections["+i+"]::to::number"))){
			if((connections.get("connections["+i+"]::from::number") == block) || (connections.get("connections["+i+"]::to::number") == block)){
				remove_connection(i);
			}
		}
	}
	// disable the cubes and meters
	voicecount(block, 0); // remove all voices (this removes individual polyvoices and turns off audio-to-data voices)
	// it's been removed from voicealoc lists by the voicecount function, which also freepeers the cubes and meters
	blocks_meter[block]=[];
	blocks_cube[block]=[];
	// disable the label
/*	for(i=0;i<4;i++){
		if(typeof blocks_label[block][i] !== 'undefined') blocks_label[block][i].freepeer(); //enable =0;
	}
	blocks_label[block] = [];
*/
	if(blocktypes.contains(blocks.get("blocks["+block+"]::name")+"::block_ui_patcher")){
		ui_patcherlist[block]='blank.ui';
		still_checking_polys |=4;
	}
	
	var empt=new Dict;  // wipe this block from the dictionary
	blocks.set("blocks["+block+"]", empt);
	//voicealloc_poly.setvalue((block+1),"off");	 // turn off the polyrouter for this block
	selected.block[block]=0; 
	i = song_select.current_blocks.indexOf(block);
	if(i> -1){
		song_select.current_blocks.splice(i,1);
		if(song_select.current_blocks.length==0) song_select.show=0;
	}
	i = song_select.previous_blocks.indexOf(block);
	if(i> -1){
		song_select.previous_blocks.splice(i,1);
		if(song_select.previous_blocks.length==0) song_select.show=0;
	}
	i = panels_order.indexOf(block); //remove block from panels page
	if(i> -1){
		panels_order.splice(i,1);
	}
	set_display_mode("blocks");
	redraw_flag.flag = 12;
}



function voicecount(block, voices){     // changes the number of voices assigned to a block (inc to zero)
	var v = blocks.get("blocks["+block+"]::poly::voices");
	var type = blocks.get("blocks["+block+"]::type");
	var details = new Dict;
	var new_voice;
	var i;
	var vst=0;
	var block_name = blocks.get("blocks["+block+"]::name"); // check it exists,
	if(blocktypes.contains(block_name)){
		details = blocktypes.get(block_name);
	}else{
		post("error: "+block_name+" not found in blocktypes dict. block was"+block);
		return -1;
	}
	for(i=0;i<connections.getsize("connections");i++){
		if(connections.contains("connections["+i+"]::from")){
			if(connections.get("connections["+i+"]::from::number")==block) 	wire_ends[i][0]=-0.6969696;
			if(connections.get("connections["+i+"]::to::number")==block) 	wire_ends[i][0]=-0.6969696;				
		}
	} //this is to force it to redraw the wires connected to this block
	var max_v=details.get("max_polyphony"); // check we're not doing something illegal
	if(max_v == 0){
		if(type == "note"){
			max_v = MAX_NOTE_VOICES;
		}else if(type == "audio"){
			max_v = MAX_AUDIO_VOICES;
		}
	}
	if(voices>max_v) {
		voices=max_v;
		post("max polyphony = "+max_v+"\n");
	}
	if((details.get("patcher")=="vst.loader") && (max_v>0)) vst=1;
	if(voices == v) return 1;
	
	// FIRST, IF REMOVING VOICES, REMOVE ALL CONNECTIONS THAT TOUCH THIS BLOCK, STORING THE ONES THAT ARE GOING BACK ON
	//IN THIS ARRAY OF DICTS
	var handful = [];
	var handful_n = [];
	var hp=0;
	var direction = 0;
	if(voices < v){
		direction = -1;
		// first remove all connections for the removed voice
		for(i=0;i<connections.getsize("connections");i++){
			if((connections.contains("connections["+i+"]::from::number")) && (connections.contains("connections["+i+"]::to::number"))){
				var f_voice = connections.get("connections["+i+"]::from::voice");
				var t_voice = connections.get("connections["+i+"]::to::voice");
				var removedtotally=0;
				if(connections.get("connections["+i+"]::from::number") == block){
//			post("f_voice",f_voice,typeof f_voice);
					if(typeof f_voice == "number"){
						if(f_voice > voices) { 
							remove_connection(i);
							removedtotally = 1;
						}
					}else if(f_voice == "all"){
						handful[hp]=new Dict;
						handful[hp]=connections.get("connections["+i+"]");
						handful_n[hp] = i;
						remove_connection(i);
						hp++;
					}else{
						var vv;
						var vc;
						var f_v2=[];
						for(vv=0;vv<f_voice.length;vv++){
							if(f_voice[vv]<=voices){
								f_v2[vc] = f_voice[vv];
								vc++;
							}
						}
						if(vc==0){
							removedtotally=1;
							remove_connection(i);
						}else if(f_v2.length<f_voice.length){
							connections.set("connections["+i+"]::from::voice", f_v2); 
							handful[hp]=new Dict;
							handful[hp]=connections.get("connections["+i+"]");
							handful_n[hp] = i;
							remove_connection(i);
							hp++;						
						}						
					}
				}
				if(!removedtotally){
					if(connections.get("connections["+i+"]::to::number") == block){
						if(typeof t_voice == "number"){
							if(t_voice > voices){
								remove_connection(i);
							}
						}else if(t_voice == "all"){
							handful[hp]=new Dict;
							handful[hp]=connections.get("connections["+i+"]");
							handful_n[hp] = i;
							remove_connection(i);
							hp++;
						}else{
							var vv;
							var vc=0;
							var t_v2=[];
							for(vv=0;vv<t_voice.length;vv++){
								if(t_voice[vv]<=voices){
									t_v2[vc] = t_voice[vv];
									vc++;
								}
							}
							if(vc==0){
								removedtotally=1;
								remove_connection(i);
							}else if(t_v2.length<t_voice.length){
								connections.set("connections["+i+"]::to::voice", t_v2); 
								handful[hp]=new Dict;
								handful[hp]=connections.get("connections["+i+"]");
								handful_n[hp] = i;
								remove_connection(i);
								hp++;						
							}							
						}
					}
				}
			}
		}
	}else if(voices > v){
		direction = 1;
	}
	
	// NOW ADD OR REMOVE VOICES:
	while(voices != v){
		if(voices > v){	//add voices
			if((v==0)||(vst==0)){
				var t_offset = 0;
				if(type=="audio"){
					t_offset=MAX_NOTE_VOICES;
					new_voice = find_audio_voice_to_recycle(details.get("patcher"),blocks.get("blocks["+block+"]::upsample"));
				}else{
					new_voice = next_free_voice(type);
				}
				if(details.contains("voice_data::defaults")){
					var vd_def = [];
					var vdi;
					vd_def = details.get("voice_data::defaults");
					voice_data_buffer.poke(1,MAX_DATA*(new_voice+t_offset),vd_def);
					for(vdi=vd_def.length;vdi<MAX_DATA;vdi++){
						voice_data_buffer.poke(1, MAX_DATA*(new_voice+t_offset)+vdi,0);
					}
					//post("new voice of an existing block so setting default data TODO BUT HOW DO WE KNOW ITS NEW? IS THIS THE RIGTH PLACE TO DO THIS?",new_voice+t_offset,MAX_DATA*(new_voice+t_offset));
				}
				var voiceoffset =0;
				if(type == "note"){
					voiceoffset = new_voice;
					note_patcherlist[new_voice] = details.get("patcher");
				}else if(type == "audio"){
					voiceoffset = new_voice + MAX_NOTE_VOICES;
					audio_patcherlist[new_voice] = details.get("patcher");
					audio_upsamplelist[new_voice] = blocks.get("blocks["+block+"]::upsample");
				}else if(type == "hardware"){
					voiceoffset = new_voice + MAX_NOTE_VOICES + MAX_AUDIO_VOICES;
					hardware_list[new_voice] = block_name;
				}
				var list = voicemap.get(block);
				voicemap.replace(block, list, voiceoffset);
				if(type=="audio"){  // turn on audio-to-data for the new voice
					var tout;
					for(tout=0;tout<NO_IO_PER_BLOCK;tout++){
						audio_to_data_poly.setvalue((new_voice+1+tout*MAX_AUDIO_VOICES), "vis_meter", "1");
						audio_to_data_poly.setvalue((new_voice+1+tout*MAX_AUDIO_VOICES), "vis_scope", "0");
						audio_to_data_poly.setvalue((new_voice+1+tout*MAX_AUDIO_VOICES), "out_value", "0");
						audio_to_data_poly.setvalue((new_voice+1+tout*MAX_AUDIO_VOICES), "out_trigger", "0");
					}
					if(loading.progress<=0){
						audio_poly.setvalue(new_voice+1, "muteouts", 0);
					}
				}
				if(blocks.contains("blocks["+block+"]::flock::parameters")){
					var fplist = [-1, -1, -1];
					fplist = blocks.get("blocks["+block+"]::flock::parameters");
					flock_add_to_array(block,fplist[0],fplist[1],fplist[2]);
				}
				var sprd = blocks.get("blocks["+block+"]::error::spread");
				sprd = sprd*sprd*sprd*sprd;
				var spr = sprd;
				var drft = blocks.get("blocks["+block+"]::error::drift");
				drft = drft*drft*drft*drft;
				param_error_drift[voiceoffset] = [];
				param_error_lockup[voiceoffset] = 0;
				mulberryseed = cyrb128("b"+block_name+v+"s"+sprd);
				//for(i=0;i<details.getsize("parameters")*v;i++) ra=mulberry32();
				for(i=0;i<details.getsize("parameters");i++){
					if(details.contains("parameters["+i+"]::error_scale")){
						spr=sprd*details.get("parameters["+i+"]::error_scale");
					}else{
						spr = sprd;
					}
					parameter_error_spread_buffer.poke(1,MAX_PARAMETERS*voiceoffset+i,(mulberry32()-0.5)*spr);
					param_error_drift[voiceoffset][i]=0.01*drft*spr;
				} //set param spreads
				v++;			
				
			}else{
				v++;
			}
		}else if(voices < v){
			if((v==1)||(vst==0)){
				var voiceoffset=0;
				var removeme;// then actually remove the voice
				if(type == "note"){
					var list = voicemap.get(block);
					if(list.length>1){
						removeme = list[list.length - 1];
						list.pop(); //length -= 1;
						voicemap.replace(block,list);
					}else{
						removeme = list;
						voicemap.remove(block.toString());
					}
					note_patcherlist[removeme] = "blank.note";
				}else if(type == "audio"){
					voiceoffset = MAX_NOTE_VOICES;
					var list = voicemap.get(block);
					if(list.length>1){
						removeme = list[list.length - 1] - MAX_NOTE_VOICES;
						list.pop(); // length = list.length - 1;
						voicemap.replace(block,list);					
					}else{
						removeme = list - MAX_NOTE_VOICES;
						voicemap.remove(block.toString());
					}
					audio_patcherlist[removeme] = "blank.audio";
				}else if(type == "hardware"){
					voiceoffset = MAX_NOTE_VOICES+MAX_AUDIO_VOICES;
					voicemap.remove(block.toString()); //doesn't need to mess around, with hardware you're either removing everything or nothing.
				}
				blocks_cube[block][v].freepeer(); //enable = 0;
				blocks_cube[block].pop(); //= null;
				for(i=(v-1)*NO_IO_PER_BLOCK;i<blocks_meter[block].length;i++){
					blocks_meter[block][i].freepeer(); //enable = 0;
				}
				blocks_meter[block].pop();
				for(i=0;i<MAX_PARAMETERS;i++) is_flocked[MAX_PARAMETERS*(removeme+voiceoffset)+t] = 0;
				if(type=="audio"){ 
					var tout;
					for(tout=0;tout<NO_IO_PER_BLOCK;tout++){
						audio_to_data_poly.setvalue((removeme+1+tout*MAX_AUDIO_VOICES), "vis_meter", "0");
						audio_to_data_poly.setvalue((removeme+1+tout*MAX_AUDIO_VOICES), "vis_scope", "0");
						audio_to_data_poly.setvalue((removeme+1+tout*MAX_AUDIO_VOICES), "out_value", "0");
						audio_to_data_poly.setvalue((removeme+1+tout*MAX_AUDIO_VOICES), "out_trigger", "0");
					}
				}
				v--;
			}else{
				for(i=(v-1);i<blocks_meter[block].length;i++){
					blocks_meter[block][i].freepeer(); //enable = 0;
				}
				blocks_meter[block].pop();
				blocks_cube[block][v].freepeer(); //enable = 0;
				blocks_cube[block].pop(); //[v-1]= null;
				v--;
			}
		}
	}
	var voiceoffset=0;
	if(type == "note"){
		still_checking_polys |=1;
		//send_note_patcherlist();
	}else if(type == "audio"){
		still_checking_polys |=2;
		//send_audio_patcherlist();		
		voiceoffset=MAX_NOTE_VOICES;
	}else if(type=="hardware"){
		voiceoffset=MAX_NOTE_VOICES+MAX_AUDIO_VOICES;
	}
	blocks.set("blocks["+block+"]::poly::voices",v);
	if(v>0){ // tell polyalloc how many voices remain
		var addone = voicemap.get(block);
		var str_version = "";
		for(i=0;i<addone.length;i++){
			str_version = str_version + (addone[i]+1-voiceoffset)+" ";
		}
//		voicealloc_poly.setvalue((block+1),"mode",type,"blind_cycle",str_version);
		// tell the polyalloc voice about its new job
		voicealloc_poly.setvalue(+block + 1,"type",type);
		voicealloc_poly.setvalue(+block + 1,"voicelist",str_version);
		//post(0, "setvalue",+block + 1,"type",type);
		//post(0, "setvalue",+block + 1,"voicelist",str_version);
	}else{ // or turn it off if zero
		voicealloc_poly.setvalue( (block+1), "off");
	}
	if(direction==1){
		// now for every 'all' connection you need to add the new voice
		for(i=0;i<connections.getsize("connections");i++){
			if((connections.contains("connections["+i+"]::from::number")) && (connections.contains("connections["+i+"]::to::number"))){
				var f_voice = connections.get("connections["+i+"]::from::voice");
				var t_voice = connections.get("connections["+i+"]::to::voice");
				if((connections.get("connections["+i+"]::from::number") == block) && (f_voice == "all")){
					make_connection(i);
//						post("TODO add the new voice to 'all' connections");
				}else if((connections.get("connections["+i+"]::to::number") == block) && (t_voice == "all")){
					make_connection(i);
//						post("TODO add the new voice to 'all' connections");
				}
			}
		}
		if(blocks.contains("blocks["+block+"]::mute")){
			if(blocks.get("blocks["+block+"]::mute")==1){
				mute_particular_block(block,1);
			}
		}
		// and run draw_blocks to make sure cubes etc are assigned to the new voices, even if we're not on that screen
		//draw_blocks();
		draw_block(block);
		rebuild_action_list=1;//build_mod_sum_action_list();
		//rebuild_action_list=0;
	}else if(direction==-1){
		for(i=0;i<hp;i++){
			connections.replace("connections["+handful_n[i]+"]",handful[i]);
			make_connection(handful_n[i]);
		}
		//build_mod_sum_action_list();
		rebuild_action_list=1;
	}
	if(sidebar.mode=="block") sidebar.mode="retrig";
	redraw_flag.flag=4;
//	rebuild_action_list = 1;
}

function connection_edit_voices(connection, voice){
	var curr = connections.get("connections["+connection+"]::"+voice[0]+"::voice");
	new_connection = connections.get("connections["+connection+"]");
	remove_connection(connection);
	var i,t;
	if(voice[1] == 0){//all
		new_connection.replace(voice[0]+"::voice","all");
	}else{
		if(curr == "all"){
			new_connection.replace(voice[0]+"::voice",voice[1]);
		}else{
			if(typeof curr != "number"){
				//post("is an array, check if i'm in here already");
				if(curr.indexOf(voice[1])==-1){
					curr[curr.length]=voice[1];
					curr.sort();
					new_connection.replace(voice[0]+"::voice",curr);
					//post("appending",curr);
				}else{
					//post("removing");
					t=0;
					var newlist=[];
					for(i=0;i<curr.length;i++){
						if(curr[i]!=voice[1]){
							newlist[t]=curr[i];
							t++;
						}
					}
					newlist.sort();
					new_connection.replace(voice[0]+"::voice",newlist);
				}
			}else{
				if(curr!=voice[1]){
					var newlist=[];
					newlist[0]=curr;
					newlist[1]=voice[1];
					newlist.sort();
					new_connection.replace(voice[0]+"::voice",newlist);
				}
			}
		}
	}
	connections.replace("connections["+connection+"]",new_connection);
	make_connection(connection);
	selected.wire[connection]=1;
	wire_ends[connection][0]=-0.96969696;
	sidebar.lastmode="recalculate";
	redraw_flag.flag |= 4;
}

function insert_block_in_connection(newblockname,newblock){
//	post("insert conn no", block_menu_d.connection_number);
	// get the details of the inserted block
	var details = new Dict;
	details = blocktypes.get(newblockname);
	var intypes = details.get("connections::in").getkeys();
	var outtypes = details.get("connections::out").getkeys();
	if(!Array.isArray(intypes))	intypes=[intypes,"*"];
	if(!Array.isArray(outtypes)) outtypes=[outtypes,"*"];
	
	//- copy all the connection details
	var oldconn = new Dict;
	oldconn = connections.get("connections["+block_menu_d.connection_number+"]");

	// remove the connection
	remove_connection(block_menu_d.connection_number);
	// make a new connection:
	var f_type = oldconn.get("from::output::type");
	var t_type = oldconn.get("to::input::type");
	var i_no,o_no;

	//try to match up types..
	i_no = intypes.indexOf(f_type);
	o_no = outtypes.indexOf(t_type);
	if(i_no==-1){
		i_no = intypes.indexOf(t_type);
		if(i_no==-1) i_no = 0;
		post("matching input type not found, next best chosen");
	}
	if(o_no == -1){
		o_no = outtypes.indexOf(intypes[i_no]);
		if(o_no==-1) o_no=0;
		post("matching output type not found, next best chosen");
	}
	
	//one conversion is 'default' and the other is the one from the old conn. usually first one is default
	var defaultpos=0;
	if((f_type != intypes[i_no])&&(outtypes[o_no]==t_type))defaultpos = 1;
//	new_connection.replace("conversion",f_conv);
	new_connection.parse('{}');
	if(defaultpos){//this is the rare exception where default is the second one.
		new_connection.replace("conversion::mute" , 0);
		new_connection.replace("conversion::scale", 1);
		new_connection.replace("conversion::vector", 0);	
		new_connection.replace("conversion::offset", 0);
		new_connection.replace("conversion::offset2", 0.5);
		if((f_type=="midi")&&(intypes[i_no]=="midi")) new_connection.replace("conversion::offset", 0.5);
	}else{
		new_connection.replace("conversion",oldconn.get("conversion"));
	}
	new_connection.replace("from",oldconn.get("from"));
	new_connection.replace("to::number",newblock);
	new_connection.replace("to::voice","all");
	new_connection.replace("to::input::number",i_no);
	new_connection.replace("to::input::type",intypes[i_no]);
	connections.append("connections",new_connection);
	make_connection(connections.getsize("connections")-1);
	new_connection.clear();
	
//	new_connection.parse('{}');
//	new_connection.replace("conversion",t_conv); 
	if(defaultpos){//this is the rare exception where default is the second one.
		new_connection.replace("conversion", oldconn.get("conversion"));
	}else{
		new_connection.parse('{}');
		new_connection.replace("conversion::mute" , 0);
		new_connection.replace("conversion::scale", 1);
		new_connection.replace("conversion::vector", 0);	
		new_connection.replace("conversion::offset", 0);
		new_connection.replace("conversion::offset2", 0.5);
		if((t_type=="midi")&&(outtypes[o_no]=="midi")) new_connection.replace("conversion::offset", 0.5);
	}
	new_connection.replace("from::number",newblock);
	new_connection.replace("from::voice","all");
	new_connection.replace("from::output::number",o_no);
	new_connection.replace("from::output::type",outtypes[o_no]);
	new_connection.replace("to",oldconn.get("to"));
	connections.append("connections",new_connection);
	make_connection(connections.getsize("connections")-1);
	new_connection.clear();
	//click_clear(0,0);
	//outlet(8,"bang");
	set_display_mode("blocks");
	redraw_flag.flag |= 4;	
}

function swap_block(block_name){
	post("swapping block",block_menu_d.swap_block_target,"to",block_name);
	var details = new Dict;
	// find an unused block number in blocks
	// what type is it?	// look it up in the blocks dict:
	if(blocktypes.contains(block_name)){
		details = blocktypes.get(block_name);
//		post(details.stringify());
	}else{
		post("error: "+block_name+" not found in blocktypes dict");
		return -1;
	}
	
	var type = details.get("type")
	var otype = blocks.get("blocks["+block_menu_d.swap_block_target+"]::type");
	var redo_connections = 0;
	if((type=="hardware")||(otype=="hardware")||(type != otype)){
		redo_connections = 1;
		
		// collect up connections to/from this block, disconnect them all
		var handful = [];
		var handful_n = [];
		var h=0;
		for(i=0;i<connections.getsize("connections");i++){
			if(connections.contains("connections["+i+"]::from")){
				if((connections.get("connections["+i+"]::from::number") == block_menu_d.swap_block_target)||(connections.get("connections["+i+"]::to::number") == block_menu_d.swap_block_target)){
					handful[h] = connections.get("connections["+i+"]");
					handful_n[h] = i;
					h++;
					remove_connection(i);
					//wire_ends[i][0] += 0.05;
				}
			}
		}
	}
	if(type == "hardware"){
		blocks.replace("blocks["+block_menu_d.swap_block_target+"]::name",block_name);
		blocks.replace("blocks["+block_menu_d.swap_block_target+"]::label",block_name);
	}else{
		block_name = details.get("patcher");
		blocks.replace("blocks["+block_menu_d.swap_block_target+"]::name",block_name);
		blocks.replace("blocks["+block_menu_d.swap_block_target+"]::label",block_name);
		var ui = details.get("block_ui_patcher");
		if((ui == "") || (ui == 0)){
			ui_patcherlist[block_menu_d.swap_block_target] = "blank.ui";
		}else{
			ui_patcherlist[block_menu_d.swap_block_target] = ui;
		}
		still_checking_polys |=4;
		//send_ui_patcherlist();
	}
	if(redo_connections){
		// put all the connections back
		if(h>0){
			for(i=0;i<h;i++){
				connections.replace("connections["+handful_n[i]+"]",handful[i]);
				make_connection(handful_n[i]);	
			}
		}
	}

	selected.block[block_menu_d.swap_block_target] = 1;
	blocks.replace("blocks["+block_menu_d.swap_block_target+"]::type",type);
/*	blc=[128,128,128];
	if(config.contains("palette::"+bln[0])){
		blc=config.get("palette::"+bln[0]);
	}
	blocks.replace("blocks["+block_menu_d.swap_block_target+"]::space::colour", blc );*/
	blocks.replace("blocks["+block_menu_d.swap_block_target+"]::space::colour", blocktypes.get(block_name+"::colour") );
	draw_block_texture(block_menu_d.swap_block_target);

	var voicelist = [];
	voicelist = voicemap.get(block_menu_d.swap_block_target);
	if(typeof voicelist == "number") voicelist = [voicelist];
	//post("voicelist is",voicelist);
	var voice;
	for(var ti =0;ti<voicelist.length;ti++){
		voice= voicelist[ti];
		if(details.contains("voice_data::defaults")){
			var vd_def = [];
			var vdi;
			vd_def = details.get("voice_data::defaults")
			for(vdi=0;vdi<vd_def.length;vdi++){
				voice_data_buffer.poke(1, MAX_DATA*(voice)+vdi,vd_def[vdi]);
			}
			post("swapping block so setting default data");
		}
		if(type == "note"){
			note_patcherlist[voice] = details.get("patcher");
		}else if(type == "audio"){
			audio_patcherlist[voice-MAX_NOTE_VOICES] = details.get("patcher");
			post("setting",voice,"to",details.get("patcher"));
		}else if(type == "hardware"){
			hardware_list[voice-MAX_NOTE_VOICES-MAX_AUDIO_VOICES] = block_name;
		}
		
		if(details.contains("parameters")){
			var params = [];
			params = details.get("parameters");
			var p_type,p_values,p_default;
//			param_error_spread[voice]= [];
			param_error_drift[voice] = [];
			param_defaults[voice] = [];
			for(var i=0;i<params.length;i++){
				if(voice!=-1){
					parameter_error_spread_buffer.poke(1,MAX_PARAMETERS*voice+i,0);
//					param_error_spread[voice][i]=0;
					param_error_drift[voice][i]=0;
				}
				p_default = 0;
				p_type = params[i].get("type");
				p_values = params[i].get("values");
				if(p_type == "float"){
					if(p_values[0]=="bi"){
						p_default = 0.5;
					}
				}
				if(params[i].contains("default")){
					p_default = params[i].get("default");
				}
				parameter_value_buffer.poke(1, MAX_PARAMETERS*block_menu_d.swap_block_target+i,p_default);
				param_defaults[block_menu_d.swap_block_target][i] = p_default;
			}		
		}
		
		if(type=="audio"){ 
			audio_to_data_poly.setvalue((voice+1), "vis_meter", "1");
			audio_to_data_poly.setvalue((voice+1), "vis_scope", "0");
			audio_to_data_poly.setvalue((voice+1), "out_value", "0");
			audio_to_data_poly.setvalue((voice+1), "out_trigger", "0");
			audio_to_data_poly.setvalue((voice+1+MAX_AUDIO_VOICES), "vis_meter", "1");
			audio_to_data_poly.setvalue((voice+1+MAX_AUDIO_VOICES), "vis_scope", "0");
			audio_to_data_poly.setvalue((voice+1+MAX_AUDIO_VOICES), "out_value", "0");
			audio_to_data_poly.setvalue((voice+1+MAX_AUDIO_VOICES), "out_trigger", "0");
		}else if(type=="hardware"){
			//hardware_metermap[new_block_index] = [];
			var voffset=MAX_AUDIO_VOICES+MAX_NOTE_VOICES;
			var ts, tii;
			if(blocktypes.contains(block_name+"::connections::in::hardware_channels")){
				ts = blocktypes.get(block_name+"::connections::in::hardware_channels");	
				voffset += MAX_AUDIO_INPUTS;
			}else if(blocktypes.contains(block_name+"::connections::out::hardware_channels")){
				ts = blocktypes.get(block_name+"::connections::out::hardware_channels");
			}else{
				ts= "no";
			}
			if(ts!="no"){
				for(tii=0;tii<ts.length;tii++){
					audio_to_data_poly.setvalue(ts[tii]+voffset,"vis_meter", 1);
					audio_to_data_poly.setvalue(ts[tii]+voffset,"vis_scope", 0);
					audio_to_data_poly.setvalue(ts[tii]+voffset,"out_value", 0);
					audio_to_data_poly.setvalue(ts[tii]+voffset,"out_trigger", 0);
					ts[tii] = ts[tii]+voffset-1;
				}
				hardware_metermap.replace(block_menu_d.swap_block_target,ts);
			}
			
		}
		rebuild_action_list = 1;
	}
	if(type == "note"){
		still_checking_polys |=1;
//		send_note_patcherlist();
	}else if(type == "audio"){
		still_checking_polys |=2;
		//send_audio_patcherlist();
	}
	block_menu_d.swap_block_target = -1;
	redraw_flag.flag |= 8;//6;
}

function build_mod_sum_action_list(){
	if(loading.progress>0) return 0;
	messnamed("modulation_processor", "pause",1);
	//post("\nBuilding new mod sum action list");
//this was the old do_parameters loop, now it fills a buffer with a list of things to sum and where they go
// buffer has 4 channels. 
// ch1 is the index of the destination, this repeats for all rows relating to this particular param/etc. it changing is the sign to sum up, dump the number, move on.
// row 1 is always:
// destination index / extra data (only for flock destination, the location in the param value buffer that the number will eventually go to) / flag about destination type / 0=neither 1=wrap, 2=clip
// destination types: 1 param 2 flocked param 3 sig~ 4 hw midi out
// if the param is locked row 2 is:
// dest index / lock timer counter / flag saying it's the lockup row / lockup chance
// the flags from row 2 on are:
// 1 lockup row 2 param value 3 error-spread 4 modulation 5 ok to process this voice's flocks
// dest index / src index / flags / extra data (only lockup chance)

	var b,p,i,t,psize,btype,mv;
	var voicelist = [];
	var slotlist = [];
	var paramlist = [];
	var flock_id;
	flocklist=[];
	var ALLAUDIO = MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_OUTPUTS;
	
	var list_pointer = 0;



	for(mv=0;mv<ALLAUDIO;mv++){ //first look if there are any midi-audio to process
		if(mod_routemap.contains(mv)){
			slotlist = mod_routemap.get(mv);
			if(typeof slotlist == "number") {
				slotlist = [slotlist];
			}
			mod_sum_action_list.poke(1,list_pointer,mv+1);
			mod_sum_action_list.poke(2,list_pointer,0);
			mod_sum_action_list.poke(3,list_pointer,3);
			mod_sum_action_list.poke(4,list_pointer,0);
//			i=list_pointer;
//			post(i,mod_sum_action_list.peek(1,i),mod_sum_action_list.peek(2,i),mod_sum_action_list.peek(3,i),mod_sum_action_list.peek(4,i),"\n");			
			list_pointer++;
			for(t=0;t<slotlist.length;t++){
				mod_sum_action_list.poke(1,list_pointer,mv+1);
				mod_sum_action_list.poke(2,list_pointer,slotlist[t]);
				mod_sum_action_list.poke(3,list_pointer,4); //is it a modulation type input? i think so?
//				i=list_pointer;
//				post(i,mod_sum_action_list.peek(1,i),mod_sum_action_list.peek(2,i),mod_sum_action_list.peek(3,i),mod_sum_action_list.peek(4,i),"\n");
				list_pointer += 1;
			}
		}		
	}
	

	
	var midiout,lockup,locked,flag,dest_index,extra,has_mod,wrap;
//	var voffset=0;
	for(b=0;b<MAX_BLOCKS;b++){
		if(blocks.contains("blocks["+b+"]::name")){
			var bname = blocks.get("blocks["+b+"]::name");
			psize = blocktypes.getsize(bname+"::parameters");
			if(psize){
				midiout=0;
				btype = blocks.get("blocks["+b+"]::type");
				lockup = blocks.get("blocks["+b+"]::error::lockup");
				lockup *= lockup * 0.003;
				voicelist = voicemap.get(b);
				if(btype=="hardware"){
					//todo hardware can have params too!
//					voffset+=MAX_NOTE_VOICES+MAX_AUDIO_VOICES;//+b; //TODO no not +b, need a lookup
					if(blocktypes.contains(bname+"::midi_output_number")){
						midiout = blocktypes.get(bname+"::midi_output_number");
					}	
				}
				if(typeof voicelist == "number"){
					voicelist = [voicelist];
				}

				for(i=0;i<voicelist.length;i++){
					locked = 0;
					flock_id=-1;
					has_mod = 0;
					flock_buffer.poke(1,voicelist[i]*3,[0,0,0]);					
					mv=(voicelist[i]+ALLAUDIO);
					if(mod_routemap.contains(mv)){ //are there any modulations routed to this voice? if so, add them up, check if this param wraps.
						// { post("\nblock",b,"mod voice",i,"mv is",mv); }
						slotlist = mod_routemap.get(mv);
						paramlist = mod_param.get(mv);
						if(typeof slotlist == "number") {
							slotlist = [slotlist];
							paramlist= [paramlist];
						}
						has_mod=1;
					}
					
					
					for(p=0;p<psize;p++){ 
						chngd=0;
						//first row we write to buffer explains what it is
						wrap = 2;
						if(blocktypes.contains(bname+"::parameters["+p+"]::wrap")){
							wrap = 2 - blocktypes.get(bname+"::parameters["+p+"]::wrap"); 
						}
						//TODO could lose the whole mod_wrap dict?
						if(btype=="hardware"){
							flag = 4;
							var chanout = blocktypes.get(bname+"::parameters["+p+"]::midi_channel");
							var ccout = blocktypes.get(bname+"::parameters["+p+"]::midi_cc");
							dest_index = ccout + chanout*128+midiout*16384;
							mod_sum_action_list.poke(1,list_pointer,dest_index);
							mod_sum_action_list.poke(2,list_pointer,0);
							mod_sum_action_list.poke(3,list_pointer,flag);
							mod_sum_action_list.poke(4,list_pointer,wrap);
						}else if(is_flocked[MAX_PARAMETERS*(voicelist[i])+p]>0){
							flag = 2;
							extra = MAX_PARAMETERS*(voicelist[i])+p;
							flock_id = is_flocked[extra]-1;
							dest_index = flock_id;
//							post(extra,"is flocked, flockid = ",flock_id,"\n");

							flock_buffer.poke(1,flock_id,extra+1);

							mod_sum_action_list.poke(1,list_pointer,dest_index); //flokcid
							mod_sum_action_list.poke(2,list_pointer,b*MAX_PARAMETERS+p); //extra); //bpos[flockid]
							mod_sum_action_list.poke(3,list_pointer,flag);
							mod_sum_action_list.poke(4,list_pointer,wrap);						
						}else{
							dest_index = MAX_PARAMETERS*(voicelist[i])+p;
							flag = 1;
//							post(dest_index,"param\n");
							mod_sum_action_list.poke(1,list_pointer,dest_index);
							mod_sum_action_list.poke(2,list_pointer,b*MAX_PARAMETERS+p);
							mod_sum_action_list.poke(3,list_pointer,flag);
							mod_sum_action_list.poke(4,list_pointer,wrap);
						}
						list_pointer++;
						
						if(lockup>0){
							// lockup row
							mod_sum_action_list.poke(1,list_pointer,dest_index);
							mod_sum_action_list.poke(2,list_pointer,0);//this is the counter, >1=locked
							mod_sum_action_list.poke(3,list_pointer,1);
							mod_sum_action_list.poke(4,list_pointer,lockup);
							list_pointer++;
						}
						
						mod_sum_action_list.poke(1,list_pointer,dest_index);
						mod_sum_action_list.poke(2,list_pointer,MAX_PARAMETERS*b+p);
						mod_sum_action_list.poke(3,list_pointer,2);
						mod_sum_action_list.poke(4,list_pointer,0);
						list_pointer++;

						mod_sum_action_list.poke(1,list_pointer,dest_index);
						mod_sum_action_list.poke(2,list_pointer,MAX_PARAMETERS*voicelist[i]+p);
						mod_sum_action_list.poke(3,list_pointer,3);
						mod_sum_action_list.poke(4,list_pointer,0);
						list_pointer++;
						
						if(has_mod){
							for(t=0;t<slotlist.length;t++){
								if(paramlist[t]==p){
									mod_sum_action_list.poke(1,list_pointer,dest_index);
									mod_sum_action_list.poke(2,list_pointer,slotlist[t]);
									mod_sum_action_list.poke(3,list_pointer,4);
									mod_sum_action_list.poke(4,list_pointer,0);
									list_pointer++;								
								}
							}	
						}						
					}
					if(flock_id!=-1){
						var fll=flocklist.length;
						flocklist[fll]=voicelist[i];
						flockblocklist[fll]=b;
						flockvoicelist[fll]=i;
						flock_list_buffer.poke(1,fll+1,voicelist[i]);
						//what's written to the action list is a whole new section, flag = 5 for the header row, index is voice no
						mod_sum_action_list.poke(1,list_pointer,voicelist[i]);
						mod_sum_action_list.poke(2,list_pointer,fll);
						mod_sum_action_list.poke(3,list_pointer,5);
						mod_sum_action_list.poke(4,list_pointer,MAX_PARAMETERS*(b-voicelist[i]));
						list_pointer++;
						//then the row2's have different flags as they cover a load of variables
						mod_sum_action_list.poke(1,list_pointer,voicelist[i]);
						mod_sum_action_list.poke(2,list_pointer,0.001+Math.pow(4*blocks.get("blocks["+b+"]::flock::weight"),-4));//1/weight
						mod_sum_action_list.poke(3,list_pointer,5);
						mod_sum_action_list.poke(4,list_pointer,1-Math.pow(0.5*blocks.get("blocks["+b+"]::flock::friction"),2));//friction
						list_pointer++;
						mod_sum_action_list.poke(1,list_pointer,voicelist[i]);
						mod_sum_action_list.poke(2,list_pointer,0-blocks.get("blocks["+b+"]::flock::bounce"));//bounce
						mod_sum_action_list.poke(3,list_pointer,6);
						var t2 = blocks.get("blocks["+b+"]::flock::tension");
						t2*=t2;
						mod_sum_action_list.poke(4,list_pointer,t2);//tension
						list_pointer++;
						mod_sum_action_list.poke(1,list_pointer,voicelist[i]);
						mod_sum_action_list.poke(2,list_pointer,-1+2*blocks.get("blocks["+b+"]::flock::attrep"));//attract/repel
						mod_sum_action_list.poke(3,list_pointer,7);
						mod_sum_action_list.poke(4,list_pointer,-1+2*blocks.get("blocks["+b+"]::flock::align"));//align
						list_pointer++;
						mod_sum_action_list.poke(1,list_pointer,voicelist[i]);
						mod_sum_action_list.poke(2,list_pointer,-1+2*blocks.get("blocks["+b+"]::flock::twist"));//twist
						mod_sum_action_list.poke(3,list_pointer,8);
						mod_sum_action_list.poke(4,list_pointer,0.01*blocks.get("blocks["+b+"]::flock::brownian"));//brownian
						list_pointer++;						
					}
				}
			}
		}
	}
	flock_list_buffer.poke(1,0,flocklist.length);
	mod_sum_action_list.poke(1,list_pointer,-1);
	mod_sum_action_list.poke(2,list_pointer,-1);
	mod_sum_action_list.poke(3,list_pointer,-1);
	mod_sum_action_list.poke(4,list_pointer,-1);
	list_pointer++;	
	output_queue.poke(1,0,0);
	output_queue_pointer = 0;
	changed_queue.poke(1,0,0);
	changed_queue_pointer = 0; 
	messnamed("modulation_processor", "pause", 0); //this message gets deferred (in the max patch) otherwise the gen doesn't get a frame to realise that pause has changed to 1 and back
	
//post("ok, list length",list_pointer,"\n");
//for(i=0;i<list_pointer;i++){
//	post(i,mod_sum_action_list.peek(1,i),mod_sum_action_list.peek(2,i),mod_sum_action_list.peek(3,i),mod_sum_action_list.peek(4,i),"\n");
//}
}