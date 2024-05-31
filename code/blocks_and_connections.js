function new_block(block_name,x,y){
	//post("new block");
	var details = new Dict;
	var new_voice = -1;
	// find an unused block number in blocks, passing the block name so we can search for ui patchers to recycle
	var new_block_index = next_free_block(block_name);
	// what type is it?	// look it up in the blocks dict:
	if(blocktypes.contains(block_name)){
		details = blocktypes.get(block_name);
	}else{
		post("error: "+block_name+" not found in blocktypes dict");
		return -1;
	}
	var type = details.get("type");
	var hwmidi = "";
	if((type=="hardware")&&(blocktypes.contains(block_name+"::midi_handler"))){
		hwmidi = blocktypes.get(block_name+"::midi_handler");
	}
	var vst = 0;
	var recycled=0;
	if((type=="audio") && RECYCLING){
		var tnv = find_audio_voice_to_recycle(block_name);
		new_voice = tnv[0];
		recycled = tnv[1];
	}else if((type=="note") && RECYCLING){
		var tnv = find_note_voice_to_recycle(block_name);
		new_voice = tnv[0];
		recycled = tnv[1];
	}else if((type=="hardware") && (hwmidi!="") && RECYCLING){
		var tnv = find_note_voice_to_recycle(hwmidi);
		new_voice = tnv[0];
		recycled = tnv[1]; //this is for the note voice that handles hardware midi
	}else{
		new_voice = next_free_voice(type,block_name);
	}
	var t_offset = 0;
	if(type == "note"){
		note_patcherlist[new_voice] = details.get("patcher");
	}else if(type == "audio"){
		t_offset=MAX_NOTE_VOICES;
		audio_patcherlist[new_voice] = details.get("patcher");
		if(audio_patcherlist[new_voice]=="vst.loader"){
			vst_list[new_voice] = block_name;
			vst = 1;
		} 
	}else if(type == "hardware"){
		//hardware_list[new_voice] = block_name;
		if(hwmidi){
			note_patcherlist[new_voice] = hwmidi;
			t_offset=0;
		}else{
			t_offset=MAX_NOTE_VOICES+MAX_AUDIO_VOICES;
		}
		//post("HARDWARE BLOCK, NEW VOICE",new_voice,"T OFFSET",t_offset);
	}
	voicemap.replace(new_block_index, new_voice+t_offset); //set the voicemap
	if(recycled){
		if(type=="audio"){
			audio_poly.setvalue(new_voice+1,"reset");
		}else if(type=="note"){
			note_poly.setvalue(new_voice+1,"reset");
		}
	}
	// now store it in block dict
	ui_patcherlist[new_block_index] = "blank.ui"; //if the new block has no ui we need to be sure it gets unloaded
	if(type=="hardware"){
		blocks.replace("blocks["+new_block_index+"]::name",block_name);
		if(details.contains("substitute")){
			blocks.replace("blocks["+new_block_index+"]::substitute",details.get("substitute"));
		}
		if(details.contains("block_ui_patcher")){
			var ui = details.get("block_ui_patcher");
			if((ui == "") || (ui == 0) || (ui == "self")){
				ui_patcherlist[new_block_index] = "blank.ui";
			}else{
				ui_patcherlist[new_block_index] = ui;
			}	
		}
	}else{
		//block_name = details.get("patcher");
		blocks.replace("blocks["+new_block_index+"]::patcher",details.get("patcher"));
		var ui = details.get("block_ui_patcher");
		if((ui == "") || (ui == 0) || (ui == "self")){
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
		}
	}
	panelslider_visible[new_block_index] = [];
	blocks.replace("blocks["+new_block_index+"]::label",block_name);

	blocks.replace("blocks["+new_block_index+"]::type",type);
	if(details.contains("default_polymode")){
		blocks.replace("blocks["+new_block_index+"]::poly",details.get("default_polymode"));
	}else{
		blocks.replace("blocks["+new_block_index+"]::poly::stack_mode","1x");
		blocks.replace("blocks["+new_block_index+"]::poly::choose_mode","cycle free");
		blocks.replace("blocks["+new_block_index+"]::poly::steal_mode","oldest");
		blocks.replace("blocks["+new_block_index+"]::poly::return_mode",1);
		blocks.replace("blocks["+new_block_index+"]::poly::latching_mode",0);		
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
	blocks.replace("blocks["+new_block_index+"]::space::colour", blocktypes.get(block_name+"::colour") );
	
	// and set the params to defaults
	if(blocktypes.contains(block_name+"::parameters")){
		var voiceoffset = new_voice + MAX_NOTE_VOICES*(type == "audio")+ (MAX_NOTE_VOICES+MAX_AUDIO_VOICES)*(type == "hardware");
		var paramslength = blocktypes.getsize(block_name+"::parameters");
		var p_type,p_values,p_default;
		param_error_drift[voiceoffset]= [];
		param_defaults[new_block_index] = [];
		var sprd = blocks.get("blocks["+new_block_index+"]::error::spread");
		sprd = sprd*sprd*sprd*sprd;
		var spr = sprd;
		var drft = blocks.get("blocks["+new_block_index+"]::error::drift");
		drft = drft*drft*drft*drft;
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
			parameter_static_mod.poke(1, MAX_PARAMETERS*voiceoffset+i, 0);
			param_defaults[new_block_index][i] = p_default;
			if(details.contains("parameters["+i+"]::error_scale")){
				spr=sprd*details.get("parameters["+i+"]::error_scale");
			}else{
				spr = sprd;
			}			
			param_error_drift[voiceoffset][i]=0.01*drft*spr;
			
			write_parameter_info_buffer(p_values, p_type, MAX_PARAMETERS * new_block_index + i);
		}		
	}
	// tell the polyalloc voice about its new job
	if(hwmidi!=""){
		voicealloc_poly.setvalue((new_block_index+1),"type","note");
	}else{
		voicealloc_poly.setvalue((new_block_index+1),"type",type);
	}
	voicealloc_poly.setvalue((new_block_index+1),"voicelist",(new_voice+1));
	var stack = poly_alloc.stack_modes.indexOf(blocks.get("blocks["+new_block_index+"]::poly::stack_mode"));
	var choose = poly_alloc.choose_modes.indexOf(blocks.get("blocks["+new_block_index+"]::poly::choose_mode"));
	var steal = poly_alloc.steal_modes.indexOf(blocks.get("blocks["+new_block_index+"]::poly::steal_mode"));
	var returnmode = blocks.get("blocks["+new_block_index+"]::poly::return_mode");
	voicealloc_poly.setvalue((new_block_index+1),"stack_mode",stack);  
	voicealloc_poly.setvalue((new_block_index+1),"choose_mode",choose); 
	voicealloc_poly.setvalue((new_block_index+1),"steal_mode",steal);  
	voicealloc_poly.setvalue((new_block_index+1),"return_mode",returnmode);
	if(type=="audio"){ 
		audio_to_data_poly.setvalue((new_voice+1), "vis_meter", 1);
		audio_to_data_poly.setvalue((new_voice+1), "vis_scope", 0);
		audio_to_data_poly.setvalue((new_voice+1), "out_value", 0);
		audio_to_data_poly.setvalue((new_voice+1), "out_trigger", 0);
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "vis_meter", 1);
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "vis_scope", 0);
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "out_value", 0);
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "out_trigger", 0);
		if(vst==1){  // so subvoices = 2 means each voice contains 2 subvoices. these are displayed like voices, but you can only select them in
			// pairs, ditto per voice edits. but audio routing is like they're 2 things. more useful on wide blocks when i add them later.
			if(!blocktypes.contains(block_name+"::subvoices")) blocktypes.replace(block_name+"::subvoices",2);//is this the right place to be fixing the blocktypes db?!
			blocks.replace("blocks["+new_block_index+"]::subvoices",blocktypes.get(block_name+"::subvoices"));
		}else{
			if(!blocktypes.contains(block_name+"::subvoices")) blocktypes.replace(block_name+"::subvoices",1);
			blocks.replace("blocks["+new_block_index+"]::subvoices",blocktypes.get(block_name+"::subvoices"));
			if(blocktypes.contains(block_name+"::from_subvoices")) blocks.replace("blocks["+new_block_index+"]::from_subvoices",blocktypes.get(block_name+"::from_subvoices"));
			if(blocktypes.contains(block_name+"::to_subvoices")) blocks.replace("blocks["+new_block_index+"]::to_subvoices",blocktypes.get(block_name+"::to_subvoices"));
		}
		//if(blocks.get("blocks["+new_block_index+"]::subvoices")>1){
		//	voicecount(new_block_index,blocks.get("blocks["+new_block_index+"]::subvoices"));
		//} 	
	}else if(type=="hardware"){
		var split=0;//=MAX_AUDIO_VOICES+MAX_NOTE_VOICES;
		var ts, tii;
		ts="no";
		if(blocktypes.contains(block_name+"::connections::in::hardware_channels")){
			ts = blocktypes.get(block_name+"::connections::in::hardware_channels");	
			if(!Array.isArray(ts)) ts=[ts];
			split = ts.length;
		}
		if(blocktypes.contains(block_name+"::connections::out::hardware_channels")){
			if(ts=="no"){
				ts = blocktypes.get(block_name+"::connections::out::hardware_channels");
				if(!Array.isArray(ts)) ts = [ts];
			}else{
				var ts2 = blocktypes.get(block_name+"::connections::out::hardware_channels");
				if(!Array.isArray(ts2)) ts2=[ts2];				
				for(tii=0;tii<ts2.length;tii++){
					ts[ts.length]=ts2[tii];
				}
			}
		}
		//post("\nstart of meter assign hw");
		if(ts!="no"){
			//post("\nts is ",ts.toString());
			for(tii=0;tii<split;tii++){
				//post("\nturning on meter",tii,":",ts[tii],typeof ts[tii]);
				ts[tii] = +ts[tii]+MAX_AUDIO_VOICES*2 + MAX_AUDIO_INPUTS;
				audio_to_data_poly.setvalue(ts[tii],"vis_meter", 1);
				audio_to_data_poly.setvalue(ts[tii],"vis_scope", 0);
				audio_to_data_poly.setvalue(ts[tii],"out_value", 0);
				audio_to_data_poly.setvalue(ts[tii],"out_trigger", 0);
				ts[tii] -= 1;
				//post(ts[tii]);
			}
			for(tii=split;tii<ts.length;tii++){
				//post("\nturning on input meter",tii,":",ts[tii],typeof ts[tii]);
				ts[tii] = +ts[tii]+MAX_AUDIO_VOICES*2;
				audio_to_data_poly.setvalue(ts[tii],"vis_meter", 1);
				audio_to_data_poly.setvalue(ts[tii],"vis_scope", 0);
				audio_to_data_poly.setvalue(ts[tii],"out_value", 0);
				audio_to_data_poly.setvalue(ts[tii],"out_trigger", 0);
				ts[tii] -= 1;
				//post(ts[tii]);
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
	}else if(hwmidi!=""){
		still_checking_polys |= 1;
	}
	still_checking_polys |=4;
	//	send_ui_patcherlist();
	rebuild_action_list = 1;
	return new_block_index;
}

function write_parameter_info_buffer(p_values, p_type, index) {
	var p_pol = p_values[0];
	var p_min = p_values[1];
	var p_max = p_values[2];
	var p_curve = p_values[3];
	var p_steps = 0;
	if ((p_type == "menu_i") || (p_type == "menu_b") || (p_type == "menu_l")) {
		p_min = 0;
		p_steps = p_values.length; //details.getsize("parameters["+i+"]::values");
		p_max = p_steps - 1;
		p_curve = 0;
	} else if (p_type == "menu_f") {
		p_min = 0;
		p_max = p_values.length; //details.getsize("parameters["+i+"]::values");
		p_steps = 0;
		p_curve = 0;
	} else if (p_type == "int") {
		p_steps = p_max - p_min + 1;
	} else if (p_type == "button") {
		p_min = 0;
		p_max = (p_values.length - 1) / 2;
		p_steps = p_max + 1;
		p_curve = 0;
	} else if (p_type == "wave") {
		p_min = 0;
		p_steps = MAX_WAVES;
		p_max = p_steps - 1;
		p_curve = 0;
	}
	if (p_curve == "lin") {
		p_curve = 0;
	} else {
		if (p_curve == "exp") {
			p_curve = 2;
		} else if (p_curve == "exp10") {
			p_curve = 10;
		} else if (p_curve == "exp100") {
			p_curve = 100;
		} else if (p_curve == "exp1000") {
			p_curve = 1000;
		} else if (p_curve == "exp.1") {
			p_curve = 0.1;
		} else if (p_curve == "exp.01") {
			p_curve = 0.01;
		} else if (p_curve == "exp.001") {
			p_curve = 0.001;
		} else if (p_curve == "s") {
			p_curve = 1;
		}
		if (p_pol != "uni") {
			p_curve = -p_curve;
		}
	}
	// parameter info poked out here for paramwatcher
	//if((p_type=="int")&&(p_min<0)) post("\nnew block",new_block_index,"writing to p_i_b",MAX_PARAMETERS*new_block_index+i,p_min,p_max,p_steps,p_curve);
	parameter_info_buffer.poke(1, index, p_min);
	parameter_info_buffer.poke(2, index, p_max);
	parameter_info_buffer.poke(3, index, p_steps);
	parameter_info_buffer.poke(4, index, p_curve);
}

function send_note_patcherlist(do_all){ //loads a single voice and returns, only unflags still_checking_polys when all loaded.
	var i;
	for(i = 0; i<MAX_NOTE_VOICES; i++){
		if((note_patcherlist[i] != loaded_note_patcherlist[i]) && (note_patcherlist[i] != "recycling")){
			if(RECYCLING && (note_patcherlist[i] == "blank.note")){ //instead of wiping poly slots it just puts them to sleep, ready to be reused.
				note_patcherlist[i] = "recycling";
				note_poly.setvalue(i+1, "muteouts", 1);
				note_poly.setvalue(i+1, "enabled", 0);
				if(!do_all){
					still_checking_polys |= 1;
					return 1;
				}
			}else{
				if(loading.wait>1) post("loading",note_patcherlist[i],"into",i+1,"\n");
				var pn = (note_patcherlist[i]+".maxpat");
				if(loaded_note_patcherlist[i] == "reload"){
					note_poly.setvalue(i+1,"patchername","blank.note.maxpat");
					loaded_note_patcherlist[i] = "blank.note";
					still_checking_polys |=1;
					return 1; //this clears it, come back next time and it'll load what you wanted
				}
				note_poly.setvalue(i+1,"patchername",pn);
				loaded_note_patcherlist[i]=note_patcherlist[i];
				if(do_all != 1){
					still_checking_polys |= 1;
					return 1;
				} 
			}
		}		
	}
	still_checking_polys &= 14;
	post("\nall note blocks loaded");
	if(still_checking_polys&7 == 0) update_all_voices_mutestatus();
	redraw_flag.flag |= 4;
}

function send_audio_patcherlist(do_all){
	var i;
	for(i = 0; i<MAX_AUDIO_VOICES; i++){
		if((audio_patcherlist[i]!=loaded_audio_patcherlist[i])&&(audio_patcherlist[i]!="recycling")){
			if(loading.wait>1) post("\n- loading voice "+i+"'s patcher");
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
				if(audio_upsamplelist[i]>1){
					pn = "upsample upwrap"+audio_upsamplelist[i]+" "+pn;
				}
				if(loaded_audio_patcherlist[i] == "reload"){
					audio_poly.setvalue(i+1,"patchername","blank.audio.maxpat");
					loaded_audio_patcherlist[i] = "blank.audio";
					still_checking_polys |=2;
					return 1; //this clears it, come back next time and it'll load what you wanted
				}
				audio_poly.setvalue(i+1,"patchername",pn);
				loaded_audio_patcherlist[i]=audio_patcherlist[i];
				if(do_all!=1){
					still_checking_polys |=2;
					return 1;
				} 
			}
		}
	}
	still_checking_polys &= 13;
	if((still_checking_polys&7) == 0) update_all_voices_mutestatus();
	if(deferred_matrix.length) process_deferred_matrix();
	redraw_flag.flag |= 4;
}

function process_deferred_matrix(){
	post("\nprocessing deferred matrix connections");
	while(deferred_matrix.length){
		matrix.message(deferred_matrix.pop());
	}
}

function send_ui_patcherlist(do_all){
	var i;
	for(i = 0; i<MAX_BLOCKS; i++){
		if((loaded_ui_patcherlist[i]!=ui_patcherlist[i])&&(ui_patcherlist[i]!="recycling")){
			if(RECYCLING && (ui_patcherlist[i] == "blank.ui")){ //instead of wiping poly slots it just puts them to sleep, ready to be reused.
				ui_patcherlist[i] = "recycling";
				ui_poly.setvalue(i+1, "muteouts", 1); //doesn't strictly mute the outs but i'm just using the same message for consistency
				if(!do_all){
					still_checking_polys |= 4;
					return 1;
				}
			}else{
				if(loading.wait>1) post("loading",ui_patcherlist[i],"into",i+1,"\n");
				var pn = (ui_patcherlist[i]+".maxpat");
				if(loaded_ui_patcherlist[i] == "reload"){
					ui_poly.setvalue(i+1,"patchername","blank.ui.maxpat");
					loaded_ui_patcherlist[i] = "blank.ui";
					still_checking_polys |=4;
					return 1; //this clears it, come back next time and it'll load what you wanted
				}
				//post("\nui patcher load message sent",i+1,pn);
				ui_poly.setvalue(i+1,"patchername",pn);
				loaded_ui_patcherlist[i]=ui_patcherlist[i];
				if(do_all!=1){
					still_checking_polys |=4;
					return 1;
				} 
			}
		}		
	}
	still_checking_polys &= 11;
	post("\nall ui blocks loaded");
	if((still_checking_polys&7) == 0) update_all_voices_mutestatus();
//	blocks_tex_sent = [];
	redraw_flag.flag |= 4;
}

function update_all_voices_mutestatus(){
	post("\nupdating all voices mute status");
	var k = voicemap.getkeys();
	if(k!=null){
		for(var i = 0; i<k.length;i++){
			var v = voicemap.get(k[i]);
			if(v!=null){
				var m =0;
				if(blocks.contains("blocks["+k[i]+"]::name")&&(blocks.get("blocks["+k[i]+"]::mute")==1))m=1;
				if(!Array.isArray(v)) v = [v];
				for(var ii=0;ii<v.length;ii++){
					if(v[ii]<MAX_NOTE_VOICES){
						//post("\nthist mutes: note block",k[i],"voice",v[ii],"mute",m);
						note_poly.setvalue(v[ii]+1, "muteouts", m);
					}else if(v[ii]<MAX_AUDIO_VOICES+MAX_NOTE_VOICES){
						if(audio_patcherlist[v[ii]] == "recycling"){
							m = 1;
							post("recycling");
						}
						//post("\nthist mutes: audio block",k[i],"voice",v[ii],"mute",m);
						audio_poly.setvalue(v[ii]+1-MAX_NOTE_VOICES, "muteouts", m);
					}else{
	
					}
				}
			}
		}
	}
	send_all_voice_details();
}

function poly_loaded(type,number){
	var t = still_checking_polys>0;
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
	if(t&&(!still_checking_polys)) update_all_voices_mutestatus();
}

function find_audio_voice_to_recycle(pa,up){ //ideally needs to match up upsampling values as well as patchers when recycling, but it doesnt at the moment
	//post("\n>>looking for a voice to recycle for",pa,"upsampling is",up);
	for(i=0;i<MAX_AUDIO_VOICES;i++){
		if((audio_patcherlist[i] == "recycling") && ((loaded_audio_patcherlist[i] == pa)||((loaded_audio_patcherlist[i] == "vst.loader") && (vst_list[i]==pa)))){
			//post("\nrecycling voice ",i);
			return [i,1];
		}
	}
	for(i=0;i<MAX_AUDIO_VOICES;i++){//tries to avoid core 1
		if(audio_patcherlist[i]=="blank.audio") return [i,0];
	}
	for(i=0;i<MAX_AUDIO_VOICES;i++){
		if(audio_patcherlist[i]=="recycling") return [i,0];
	}
	post("\nERROR : can't find a free voice or one to recycle\n");
	return -1;
}

function find_note_voice_to_recycle(pa){ //ideally needs to match up upsampling values as well as patchers when recycling, but it doesnt at the moment
	//post("\n>>looking for a voice to recycle for",pa);
	for(i=0;i<MAX_NOTE_VOICES;i++){
		if((note_patcherlist[i] == "recycling") && (loaded_note_patcherlist[i] == pa)){
			//post("\nrecycling note voice ",i,pa);
			return [i,1];
		}
	}
	for(i=0;i<MAX_NOTE_VOICES;i++){
		if(note_patcherlist[i]=="blank.note") return [i,0];
	}
	for(i=0;i<MAX_NOTE_VOICES;i++){
		if(note_patcherlist[i]=="recycling") return [i,0];
	}
	post("\nERROR : can't find a free voice or one to recycle\n");
	return -1;
}

function next_free_voice(t,n){
	var i=0;
	if(t == "note"){
		for(i=0;i<MAX_NOTE_VOICES;i++){
			if(note_patcherlist[i]=="blank.note") return i;
		}
		for(i=0;i<MAX_NOTE_VOICES;i++){
			if(note_patcherlist[i]=="recycling") return i;
		}
	}else if(t == "audio"){
		for(i=0;i<MAX_AUDIO_VOICES;i++){
			if(audio_patcherlist[i]=="blank.audio") return i;
		}
		for(i=0;i<MAX_AUDIO_VOICES;i++){
			if(audio_patcherlist[i]=="recycling") return i;
		}
	}else if(t == "hardware"){
		if(blocktypes.contains(n+"::midi_handler")){
			for(i=0;i<MAX_NOTE_VOICES;i++){
				if(note_patcherlist[i]=="blank.note") return i;
			}
			for(i=0;i<MAX_NOTE_VOICES;i++){
				if(note_patcherlist[i]=="recycling") return i;
			}
			post("\nfailed to find a voice for the midi handler patch");
			return -1;
		}else if(blocktypes.contains(n+"::connections::in::hardware_channels")){
			t = blocktypes.get(n+"::connections::in::hardware_channels");
			if(Array.isArray(t)) t = t[0];
			return t;
		}else if(blocktypes.contains(n+"::connections::out::hardware_channels")){
			t = blocktypes.get(n+"::connections::out::hardware_channels");
			if(Array.isArray(t)) t = t[0];
			return t+MAX_AUDIO_INPUTS;
		}else{
			post("\nerror? hardware has no input or output channels")
			return -1;
		}
	}
	post("\ncan't find a free voice, this block will not load\n");
	return -1;
}


function next_free_block(block_name){
	if(block_name!==null){
		var ui = blocktypes.get(block_name+"::block_ui_patcher");
		//search for a recycling candidate
		if((ui!="blank.ui")&&(ui!="self")){
			for(i=0;i<MAX_BLOCKS;i++){
				if(((ui_patcherlist[i]=="blank.ui")||(ui_patcherlist[i]=="recycling"))&&(loaded_ui_patcherlist[i]==ui) && !blocks.contains("blocks["+i+"]::name")){
					//post("\n-found ui patcher recycling candidate..");
					for(t=0;t<loading.mapping.length;t++){
						if(loading.mapping[t] == i){
							post("failed, already in use");
							t=999999999;
						}
					}
					if(t<999999999){
						loaded_ui_patcherlist[i] = "recycling";
						return i; 	
					}
				}
			}
		}
	}
	for(i=0;i<MAX_BLOCKS;i++){
		if((ui_patcherlist[i]=="blank.ui") && !blocks.contains("blocks["+i+"]::name")){
			for(t=0;t<loading.mapping.length;t++){
				if(loading.mapping[t] == i){
					t=999999999;
				}
			}
			if(t<999999999){//post("using blank block",i);
				return i; 
			}
		}
	}
	for(i=0;i<MAX_BLOCKS;i++){
		if((ui_patcherlist[i]=="recycling") && !blocks.contains("blocks["+i+"]::name")){
			for(t=0;t<loading.mapping.length;t++){
				if(loading.mapping[t] == i){
					t=999999999;
				}
			}
			if(t<999999999) return i; 
		}
	}

	post("error: no free block slots found\n");
	return -1;
}

function get_voice_details(voiceis){
	//post("\nblock requested voice details",voiceis);
	var vlk = voicemap.getkeys();
	if(vlk===null) return -1;
	var block = -1;
	var nth = -1;
	var of = -1;
	for(var v=0;v<vlk.length;v++){
		var vl = voicemap.get(vlk[v]);
		if(!Array.isArray(vl)) vl = [vl];
		for(var vv=0;vv<vl.length;vv++){
			if(vl[vv] == voiceis){
				block = +vlk[v];
				nth = vv;
				of = vl.length;
			}
		}
	} 
	var block_name = blocks.get("blocks["+block+"]::name");
	var no_params = blocktypes.getsize(block_name+"::parameters");
	var latching = 0;
	if(blocks.contains("blocks["+block+"]::poly::latching_mode")) latching = blocks.get("blocks["+block+"]::poly::latching_mode");
	var rate = 0;

	if(voiceis<MAX_NOTE_VOICES){
		note_poly.setvalue(voiceis+1,"voice_details",block,block*MAX_PARAMETERS,nth,of,no_params,latching,rate);
	}else if(voiceis<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
		audio_poly.setvalue(voiceis+1-MAX_NOTE_VOICES,"voice_details",block,block*MAX_PARAMETERS,nth,of,no_params,latching,rate);
	}
}

function send_all_voice_details(){
	post("\nsend all voice details");
	var vlk = voicemap.getkeys();
	if(!Array.isArray(vlk)){
		post("\nno voices to send to!");
		return -1;
	}
	for(var v=0;v<vlk.length;v++){
		var vl = voicemap.get(vlk[v]);
		if(!Array.isArray(vl)) vl = [vl];
		var of = vl.length;
		var block = +vlk[v];
		var block_name = blocks.get("blocks["+block+"]::name");
		var no_params = blocktypes.getsize(block_name+"::parameters");
		var latching = 0;
		if(blocks.contains("blocks["+block+"]::poly::latching_mode")) latching = blocks.get("blocks["+block+"]::poly::latching_mode");
		var rate = 0;
		for(var nth=0;nth<of;nth++){
			if(vl[nth]<MAX_NOTE_VOICES){
				note_poly.setvalue(vl[nth]+1,"voice_details",block,block*MAX_PARAMETERS,nth,of,no_params,latching,rate);
			}else if(vl[nth]<MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
				audio_poly.setvalue(vl[nth]+1-MAX_NOTE_VOICES,"voice_details",block,block*MAX_PARAMETERS,nth,of,no_params,latching,rate);
			}
		}
	} 

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

function set_routing(sourcevoice, sourceoutput, enab, type, desttype, destvoice, destinput, scalen, scalev, offsetn, offsetv,cno,destvoiceno){
//nb destvoiceno = 0 for polyrouter, voices go 1,2,3,4,5 etc
//	if((enab !== null) && (type !== null) && (desttype !== null) && (destvoice !== null) && (destinput !== null) && (scalen !== null) && (scalev !== null) && (offsetn !== null) && (offsetv !== null)){
	var voindex = sourcevoice * MAX_OUTPUTS_PER_VOICE + sourceoutput;
	var index = -1;
	var baseindex = 9 * (MAX_CONNECTIONS_PER_OUTPUT * voindex);
	//does this connection exist in the routing buffer already?
	if(!Array.isArray(routing_index[cno][destvoiceno])) routing_index[cno][destvoiceno] = [];
	if(typeof routing_index[cno][destvoiceno][sourcevoice] == "number" ){
		index = routing_index[cno][destvoiceno][sourcevoice];
		//post("\nFOUND EXISTING,",index);
	}else{ //find an empty slot
		for(var i=0;i<MAX_CONNECTIONS_PER_OUTPUT;i++){
			var t = baseindex + 9 * i;
			if(routing_buffer.peek(1,t + 1) == 0){ //compares on the 'type' entry
				index = t;
				routing_index[cno][destvoiceno][sourcevoice] = t;
				i = 99999;
			}
		}
		//post("\nGOT NEW",index);
	}
	routing_buffer.poke(1,index+1,type);
	routing_buffer.poke(1,index+2,desttype);
	routing_buffer.poke(1,index+3,destvoice);
	routing_buffer.poke(1,index+4,destinput);
	if(enab){
		routing_buffer.poke(1,index,1);
		routing_buffer.poke(1,index+5,scalen);
		routing_buffer.poke(1,index+6,scalev);
		routing_buffer.poke(1,index+7,offsetn);
		routing_buffer.poke(1,index+8,offsetv);
	}else{ //the enab key isn't passed to the router, the gains and offsets are just set to zero. this is so muting a modulation returns the modulated value to what it was
		routing_buffer.poke(1,index,1); //(loading.progress==0)?1:0);
		routing_buffer.poke(1,index+5,0);
		routing_buffer.poke(1,index+6,0);
		routing_buffer.poke(1,index+7,0);
		routing_buffer.poke(1,index+8,0);
	}
	//post("\npoked into routing buffer starting at",index,"values",sourcevoice, sourceoutput, "so", enab,type,desttype,destvoice,destinput,scalen,scalev,offsetn,offsetv);
	if(cno == sidebar.scopes.midi_routing.number){
		//post("\ncopy this connection for metering");
		set_routing(sourcevoice, sourceoutput, enab, type, 5, destvoice, destinput, scalen, scalev, offsetn, offsetv,0,destvoiceno);
	}
	return index;
}

function remove_all_routings(){
	for(var c=0;c<routing_index.length;c++){
		for(var i = 0;i<routing_index[c].length;i++){
			for(var si=0;si<routing_index[c][i].length;si++){
				var start = routing_index[c][i][si];
				if(typeof start == "number"){
					//end is the end of the whole section of routingbuffer..
					//var end = (Math.floor((start / 9) / MAX_CONNECTIONS_PER_OUTPUT)+1)*MAX_CONNECTIONS_PER_OUTPUT*9;
					//post("\nremoving, start is",start,"end is",end);
					for(var x = start;x < start+9;x++){
						routing_buffer.poke(1, x, 0);
					}
				}
			}
		}
		routing_index[c] = [];
	}
}

function remove_routing(cno){
	for(var i = 0;i<routing_index[cno].length;i++){
		for(var si=0;si<routing_index[cno][i].length;si++){
			var start = routing_index[cno][i][si];
			if(typeof start == "number"){
				//end is the end of the whole section of routingbuffer..
				var end = (Math.floor((start / 9) / MAX_CONNECTIONS_PER_OUTPUT)+1)*MAX_CONNECTIONS_PER_OUTPUT*9;
				//post("\nremoving, start is",start,"end is",end);
				for(var x = start;x < end-9;x++){
					routing_buffer.poke(1, x, routing_buffer.peek(1, x+9));
				}
				for(var x=end-9;x<end;x++){
					routing_buffer.poke(1, x, 0);
				}
				//you need to decrement routingindex in all entries of routing_index that refer to this voindex
				for(c=0;c<routing_index.length;c++){
					for(ii = 0;ii < routing_index[c].length;ii++){
						if(!Array.isArray(routing_index[c][ii])) routing_index[c][ii]=[];
						for(var sii=0;sii<routing_index[c][ii].length;sii++){
							if((routing_index[c][ii][sii] > start)&&(routing_index[c][ii][sii] < end)){
								//post("\ndecrementing index for routing",c,ii,routing_index[c][ii][sii]);
								routing_index[c][ii][sii] -= 9;
							}
						} 
					}
				}	
			}
		}
	}
	routing_index[cno] = [];
}

function turn_off_audio_to_data_if_unused(voice){
	//run me AFTER deleting the connection this audio-to-data was on.
	//check the routing_index array to see if any indexes are connected to this one.
	var dont = 0;
	for(var cno=routing_index.length;cno--;){
		if(Array.isArray(routing_index[cno])){
			for(var destvoice=routing_index[cno].length;destvoice--;){
				if(typeof routing_index[cno][destvoice][voice] == "number"){
					//post("\n i think i found another voice using this one's a2m converter so i wont turn it off ",routing_index[cno][destvoice][voice]);
					dont = 1;
				}/*else{
					for(var source=routing_index[cno][destvoice].length;source--;){
						post("\nr_i",cno,destvoice,source,"=",routing_index[cno][destvoice][source]);
					}
				}*/
			}
		}
	}
	if(!dont) audio_to_data_poly.setvalue(voice, "out_value", 0);
}

// REMOVE CONNECTION ###################################################################################################
function remove_connection(connection_number){	

	for(i=0;i<wires[connection_number].length;i++){ // disable the wires
		wires[connection_number][i].enable=0; //freepeer(); 
		wires[connection_number][i].scale = [0,0,0]; 
	}
	//wires[connection_number]=[];
	wire_ends[connection_number][0] = -1.057;
	selected.wire[connection_number] = 0;

	if(connections.contains("connections["+connection_number+"]::overlap")){
		var empt=new Dict;  // wipe this one from the dictionary
		connections.set("connections["+connection_number+"]", empt);
		return -1;
		//if it was flagged as overlapping then no connection was made and there's nothing to remove
	}
	// post("removing connection",connection_number,"\n");
	var f_type = connections.get("connections["+connection_number+"]::from::output::type");
	var t_type = connections.get("connections["+connection_number+"]::to::input::type");
	var f_block = connections.get("connections["+connection_number+"]::from::number");
	var t_block = 1* connections.get("connections["+connection_number+"]::to::number");
	var f_voice_list = connections.get("connections["+connection_number+"]::from::voice");
	var t_voice_list = connections.get("connections["+connection_number+"]::to::voice");
	var f_o_no = connections.get("connections["+connection_number+"]::from::output::number");
	var t_i_no = connections.get("connections["+connection_number+"]::to::input::number");
	var f_subvoices = 1;
	if(f_type=="audio"){
		f_subvoices = Math.max(1,blocks.get("blocks["+f_block+"]::subvoices"));
		if((f_subvoices==1)&&(blocktypes.contains(blocks.get("blocks["+f_block+"]::name")+"::from_subvoices")))f_subvoices=blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::from_subvoices");
	}else if(f_type=="parameters"){
		if(blocktypes.contains(blocks.get("blocks["+f_block+"]::name")+"::connections::out::midi")){
			f_o_no += blocktypes.getsize(blocks.get("blocks["+f_block+"]::name")+"::connections::out::midi");
			
		}
	}
	var t_subvoices = 1;
	if(t_type=="audio"){
		t_subvoices = Math.max(1,blocks.get("blocks["+t_block+"]::subvoices"));
		if((t_subvoices==1)&&(blocks.contains("blocks["+t_block+"]::to_subvoices"))) t_subvoices = blocks.get("blocks["+t_block+"]::to_subvoices");
	}
	
	var f_voices = [];
	var t_voices = [];
	var v,i;
	var ta;
	var m_index;
	var f_voice,t_voice;
	var max_poly;
	var varr=[];
	
	
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
		if(!Array.isArray(varr)) varr = [varr];
		if(max_poly>1){
			if(f_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					f_voices[i] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[i];
				}
			}else{
				if(!Array.isArray(f_voice_list)) f_voice_list = [f_voice_list];
				for(v=0;v<f_voice_list.length;v++){
					f_voices[v] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[f_voice_list[v]-1];//-1;
				}
			}
		}else{
			f_voices[0] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES + varr[f_o_no];
		}
	}else{
		if(f_subvoices>1){
			//post("connecting stereo vst as if 2 voices",f_voice_list, voicemap.get(f_block));
			//so f_voices[] should contain the matrix channels where the vst poly voice is, we have to make an
			//adjustment so voice 2 goes to v1/o2 instead
			if(f_voice_list == "all"){
				ta = voicemap.get(f_block);
				if(!Array.isArray(ta)) ta = [ta];
				for(i=0;i<ta.length;i++){
					for(var ti=0;ti<f_subvoices;ti++){
						f_voices[i*f_subvoices+ti]=+ta[i] + ti*MAX_AUDIO_VOICES;
					}
				}
			}else{
				ta = voicemap.get(f_block);
				if(!Array.isArray(ta)) ta = [ta];
				if(!Array.isArray(f_voice_list)) f_voice_list = [f_voice_list];
				for(v=0;v<f_voice_list.length;v++){
					var v2 = (f_voice_list[v]-1) % f_subvoices;
					var v3 = (f_voice_list[v]-1) / f_subvoices;
					v3 |= 0;
					var tv = ta[v3];
					f_voices[v] = tv + v2*MAX_AUDIO_VOICES;
				}
			}			
		}else{
			if(f_voice_list == "all"){
				f_voices = voicemap.get(f_block);
				if(!Array.isArray(f_voices)) f_voices = [f_voices];
			}else{
				if(!Array.isArray(f_voice_list)) f_voice_list = [f_voice_list];
				for(v=0;v<f_voice_list.length;v++){
					f_voices[v] = voicemap.get(f_block+"["+(f_voice_list[v]-1)+"]");
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
		if(!Array.isArray(varr)) varr = [varr];
		if(max_poly>1){
			if(t_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					t_voices[i] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[i];
				}
			}else{
				if(!Array.isArray(t_voice_list)) t_voice_list = [t_voice_list];
				for(v=0;v<t_voice_list.length;v++){
					t_voices[v] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[t_voice_list[v]-1];
				}
			}
		}else{
			t_voices[0] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES + varr[t_i_no];
		}
	}else{	// need to check for vsts		
		if(t_subvoices>1){
			//post("connecting stereo vst as if 2 voices",t_voice_list, voicemap.get(t_block));
			//so f_voices[] should contain the matrix channels where the vst poly voice is, we have to make an
			//adjustment so voice 2 goes to v1/o2 instead
			if(t_voice_list == "all"){
				ta = voicemap.get(t_block);
				if(!ta.length) ta = [ta];
				for(i=0;i<ta.length;i++){
					for(var ti=0;ti<t_subvoices;ti++){
						t_voices[i*t_subvoices+ti]=+ta[i] + ti*MAX_AUDIO_VOICES;
					}
				}
			}else{
				ta = voicemap.get(t_block);
				if(!ta.length) ta = [ta];
				if(typeof t_voice_list == 'number') t_voice_list = [t_voice_list];
				//post("\nta",ta.toString(),"t_v_l",t_voice_list.toString());
				for(v=0;v<t_voice_list.length;v++){
					var tv = t_voice_list[v]-1;
					var tv2 = tv % t_subvoices;
					tv /= t_subvoices;
					tv |= 0;
					t_voices[v] = [ta[tv] + tv2*MAX_AUDIO_VOICES];
				}
			}	
		}else{
			if(t_voice_list == "all"){
				t_voices = voicemap.get(t_block);
				if(!Array.isArray(t_voices))t_voices = [t_voices];
			}else{		
				if(!Array.isArray(t_voice_list)) t_voice_list = [t_voice_list];
				for(v=0;v<t_voice_list.length;v++){
					t_voices[v] = voicemap.get(t_block+"["+(t_voice_list[v]-1)+"]");
				}		
			}
		}
	}
	for(i=0;i<f_voices.length;i++){
		if(((t_type == "midi") || (t_type == "block")) && (t_voice_list == "all")){
//midi that goes to a polyalloc - handled here not per-to-voice
			if(f_type == "midi"){ //midi to midi(polyrouter)
				remove_routing(connection_number);
			}else if(f_type == "audio"){//audio to midi (polyrouter)
				remove_routing(connection_number);
				turn_off_audio_to_data_if_unused((f_voices[i]+(1+f_o_no)*MAX_AUDIO_VOICES));
			}
		}else{
			f_voice = +f_voices[i];
			for(v=0;v<t_voices.length;v++){
				t_voice = +t_voices[v];
				if(t_type == "midi"){ //midi to an individual voice, so we need to offset
					t_voice += MAX_BLOCKS;// + MAX_NOTE_VOICES;
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
						if(t_type == "audio"){
							outmsg[1] = t_voice + t_i_no * MAX_AUDIO_VOICES- MAX_NOTE_VOICES;
/*							if(f_type == "audio"){
								if(connections.contains("connections["+connection_number+"]::conversion::force_unity")){
									force_unity = 1;
								}
							}*/
						}else{
							outmsg[1] = t_voice - 1;
						}
						outmsg[2] = 0;
						//post("matrix "+outmsg[0]+" "+outmsg[1]+" "+outmsg[2]+"\n");
						matrix.message(outmsg);
					}else if((t_type == "midi") || (t_type == "block")){
						if(f_type == "hardware") f_voice += MAX_NOTE_VOICES-1;
						remove_routing(connection_number);
						turn_off_audio_to_data_if_unused((f_voice)+(f_o_no+1)*MAX_AUDIO_VOICES);
					}else if(t_type == "parameters"){
						if(f_type == "hardware") f_voice += MAX_NOTE_VOICES-1;
						m_index = ((f_voice-MAX_NOTE_VOICES+f_o_no * MAX_AUDIO_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
						//post("starting tvoice",t_voice);
						t_voice+=2*MAX_AUDIO_VOICES+MAX_AUDIO_OUTPUTS;
						var tvv = t_voice;
						var tmod_id;
						// post("looking up",tvv,"in mod routes\n");
						var idslist = mod_routemap.get(tvv);
						if(!Array.isArray(idslist)) idslist =[idslist];
						var tidslist = midi_routemap.get(m_index);
						if(!Array.isArray(tidslist)) tidslist=[tidslist];
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
						remove_routing(connection_number);
						if(tidslist.length<=1){
							//audio_to_data_poly.setvalue((f_voice+1+f_o_no * MAX_AUDIO_VOICES), "out_value", 0);
							turn_off_audio_to_data_if_unused((f_voice)+(f_o_no+1)*MAX_AUDIO_VOICES);
						}
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
							tvv = t_voice-1;
						}
						var tmod_id;
						var idslist = mod_routemap.get(tvv);
						var tidslist = midi_routemap.get(m_index);
						if(!Array.isArray(idslist)) idslist =[idslist];
						if(!Array.isArray(tidslist)) tidslist=[tidslist];
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
						remove_routing(connection_number);
						sigouts.setvalue(tvv+1,0);
					}else if((t_type == "midi") || (t_type == "block")){
						//this is a midi-midi connection for a single voice
						remove_routing(connection_number);
					}else if(t_type == "parameters"){
						// parameter connections are just like midi ones really
						m_index = (f_voice)*128+f_o_no; 
						t_voice+=2*MAX_AUDIO_VOICES+MAX_AUDIO_OUTPUTS;
						var tvv = t_voice;
						var tmod_id;
						var idslist = mod_routemap.get(tvv);
						if(!Array.isArray(idslist)) idslist =[idslist];
						if(idslist == "null") idslist = [];
						var tidslist = midi_routemap.get(m_index);
						if(!Array.isArray(tidslist)) tidslist=[tidslist];
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
						remove_routing(connection_number);
						mod_buffer.poke(1, tmod_id, 0)
					}		
				}else if(f_type == "parameters"){
					if((t_type == "audio") || (t_type == "hardware")){
						m_index = (f_voice)*128+f_o_no;
						var tvv = t_voice - MAX_NOTE_VOICES+MAX_AUDIO_VOICES*(t_i_no);
						if(t_type == "hardware"){
							tvv = t_voice-1;
						}
						var tmod_id;
						var idslist = mod_routemap.get(tvv);
						var tidslist = midi_routemap.get(m_index);
						if(!Array.isArray(idslist)) idslist =[idslist];
						if(!Array.isArray(tidslist)) tidslist=[tidslist];
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
						remove_routing(connection_number);
						sigouts.setvalue(tvv+1,0);
					}else if((t_type == "midi") || (t_type == "block")){
						//this is a midi-midi connection for a single voice
						remove_routing(connection_number);
					}else if(t_type == "parameters"){
						// parameter connections are just like midi ones really
						m_index = (f_voice)*128+f_o_no; 
						t_voice+=2*MAX_AUDIO_VOICES+MAX_AUDIO_OUTPUTS;
						var tvv = t_voice;
						var tmod_id;
						var idslist = mod_routemap.get(tvv);
						if(!Array.isArray(idslist)) idslist =[idslist];
						if(idslist == "null") idslist = [];
						var tidslist = midi_routemap.get(m_index);
						if(!Array.isArray(tidslist)) tidslist=[tidslist];
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
						remove_routing(connection_number);
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

function remove_potential_wire(gl_objects_only){
	if(wires_potential_connection != -1){
		if(Array.isArray(wires[wires_potential_connection])){
			for(var t=wires[wires_potential_connection].length-1;t>=0;t--){
				wires[wires_potential_connection][t].enable = 0; //freepeer();
				wires[wires_potential_connection][t].scale = [0,0,0];
				//wires[wires_potential_connection].pop();
			}
		}
		if(gl_objects_only!=1){
			post("\nremoving",wires_potential_connection);
			var empt=new Dict;  // wipe this one from the dictionary
			connections.set("connections["+wires_potential_connection+"]", empt);
			wire_ends[wires_potential_connection][3] = -99.94;
			wire_ends[wires_potential_connection][1] = -99.94;
			wires_potential_connection = -1;
		}
	}										
}

function make_connection(cno,existing){
// takes the new connection dict and 
// works out the route for the connection
// makes the connection
// (it has already been copied into the connections dict, at the slot we've been called with?)
// if existing==1 then it doesn't bother redoing modsumaction list, just adjusts routing.
	//first: check if the connection overlaps any existing ones, if it does, we don't make it, just flag it as overlapping
	if((existing==0)&&(loading.progress==0)){
		if(check_for_connection_overlap(cno)){
			connections.replace("connections["+cno+"]::overlap",1);
			return -1;
		}else if(connections.contains("connections["+cno+"]::overlap")){
			connections.remove("connections["+cno+"]::overlap");
		}
	}
	var f_type = connections.get("connections["+cno+"]::from::output::type");
	var t_type = connections.get("connections["+cno+"]::to::input::type");
	var f_o_no = connections.get("connections["+cno+"]::from::output::number");
	var t_i_no = connections.get("connections["+cno+"]::to::input::number");	
	var f_voice_list = connections.get("connections["+cno+"]::from::voice");
	var t_voice_list = connections.get("connections["+cno+"]::to::voice");
	var conversion = connections.get("connections["+cno+"]::conversion");
	if((!existing)&&conversion.get("mute")==1){
		post("\nno point making this muted connection");
		return 0;
	}
	var f_block = 1* connections.get("connections["+cno+"]::from::number");
	var t_block = 1* connections.get("connections["+cno+"]::to::number");
	var f_subvoices = 1;
	var t_subvoices = 1;
	if(f_type=="audio"){
		f_subvoices = Math.max(1,blocks.get("blocks["+f_block+"]::subvoices"));
		if((f_subvoices==1)&&(blocktypes.contains(blocks.get("blocks["+f_block+"]::name")+"::from_subvoices")))f_subvoices=blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::from_subvoices");
	}else if(f_type=="parameters"){
		if(blocktypes.contains(blocks.get("blocks["+f_block+"]::name")+"::connections::out::midi")){
			f_o_no += blocktypes.getsize(blocks.get("blocks["+f_block+"]::name")+"::connections::out::midi");
		}
	}
	var t_subvoices = 1;
	if(t_type=="audio"){
		t_subvoices = Math.max(1,blocks.get("blocks["+t_block+"]::subvoices"));
		if((t_subvoices==1)&&(blocks.contains("blocks["+t_block+"]::to_subvoices"))) t_subvoices = blocks.get("blocks["+t_block+"]::to_subvoices");
	}
	var f_voices = [];
	var t_voices = [];
	var f_voice,t_voice;
	var v,i;
	var ta;
	var m_index;
	var varr=[];
	var max_poly;
	var hw_mute=0; //if from block is hardware, and is muted, this gets set to 1, and the connection is set to silent
	// work out which polyvoices/matrix slots correspond
	if(f_type == "matrix"){
		max_poly = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::connections::out::matrix_channels");
		if(!Array.isArray(varr)) varr = [varr];
		if(max_poly>1){
			if(f_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					f_voices[i] = varr[i];
				}
			}else{
				if(!Array.isArray(f_voice_list)) f_voice_list = [f_voice_list];
				for(v=0;v<f_voice_list.length;v++){
					f_voices[v] = varr[v];
				}
			}
		}else{
			f_voices[0] = varr[f_o_no];
		}
	}else if(f_type == "hardware"){
		max_poly = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+f_block+"]::name")+"::connections::out::hardware_channels");
		//post("\navailable hw voice out channels:", varr, "max poly", max_poly, "f_voice_list",f_voice_list);
		hw_mute = blocks.get("blocks["+f_block+"]::mute");
		if(!Array.isArray(varr)) varr = [varr];
		if(max_poly>1){
			if(f_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					f_voices[i] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[i];
				}
			}else{
				if(!Array.isArray(f_voice_list)) f_voice_list = [f_voice_list];
				for(v=0;v<f_voice_list.length;v++){
					f_voices[v] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[f_voice_list[v]-1];//-1;
				}
			}
		}else{
			f_voices[0] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES + varr[f_o_no];
		}
		//post("\nhave set f_voices to",f_voices,"\n");
	}else{ // need to check for vsts, and if so do what i did for hardware above:
		if(f_subvoices>1){
			//post("connecting stereo vst as if 2 voices",f_voice_list, voicemap.get(f_block));
			//so f_voices[] should contain the matrix channels where the vst poly voice is, we have to make an
			//adjustment so voice 2 goes to v1/o2 instead
			if(f_voice_list == "all"){
				ta = voicemap.get(f_block);
				if(!Array.isArray(ta)) ta = [ta];
				for(i=0;i<ta.length;i++){
					for(var ti=0;ti<f_subvoices;ti++){
						f_voices[i*f_subvoices+ti]=+ta[i] + ti*MAX_AUDIO_VOICES;
					}
				}
			}else{
				ta = voicemap.get(f_block);
				if(!Array.isArray(ta)) ta = [ta];
				if(!Array.isArray(f_voice_list)) f_voice_list = [f_voice_list];
				//post("\nf_voice_list",f_voice_list.toString());
				for(v=0;v<f_voice_list.length;v++){
					var v2 = (f_voice_list[v]-1) % f_subvoices;
					var v3 = (f_voice_list[v]-1) / f_subvoices;
					v3 |= 0;
					var tv = ta[v3];
					//post("tv",tv,"v2",v2,"v",v,"v3",v3);
					f_voices[v] = tv + v2*MAX_AUDIO_VOICES;
					//post(">>",f_voices[v]);
				}
			}	
		}else{
			if(f_voice_list == "all"){
				f_voices = voicemap.get(f_block);
				if(!Array.isArray(f_voices)) f_voices = [f_voices];
			}else{
				if(!Array.isArray(f_voice_list)) f_voice_list = [f_voice_list];
				for(v=0;v<f_voice_list.length;v++){
					f_voices[v] = voicemap.get(f_block+"["+(f_voice_list[v]-1)+"]");
				}
			}			
		}
	}
	if(t_type == "matrix"){ // work out which polyvoices/matrix slots correspond
		max_poly = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::matrix_channels");
		if(!Array.isArray(varr)) varr = [varr];
		if(max_poly>1){
			if(t_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					t_voices[i] = varr[i];
				}
			}else{
				if(!Array.isArray(t_voice_list)) t_voice_list = [t_voice_list];
				for(v=0;v<t_voice_list.length;v++){
					t_voices[v] = varr[t_voice_list[v]-1];
				}
			}
		}else{
			t_voices[0] = varr[t_i_no];
		}
	}else if(t_type == "hardware"){ // work out which polyvoices/matrix slots correspond
		max_poly = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::max_polyphony");
		varr = blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::hardware_channels");
		if(!Array.isArray(varr)) varr = [varr];
		if(max_poly>1){
			if(t_voice_list == "all"){
				for(i=0;i<max_poly;i++){
					t_voices[i] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[i];
				}
			}else{
				if(!Array.isArray(t_voice_list)) t_voice_list = [t_voice_list];
				for(v=0;v<t_voice_list.length;v++){
					t_voices[v] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES+varr[t_voice_list[v]-1];
				}
			}
		}else{
			//post("\n this is where the error was varr, f_o_no",varr,t_i_no,t_block,blocks.get("blocks["+t_block+"]::name"),blocktypes.get(blocks.get("blocks["+t_block+"]::name")+"::connections::in::audio"));
			t_voices[0] = NO_IO_PER_BLOCK*MAX_AUDIO_VOICES + varr[t_i_no];
		}
	}else{	
		if(t_subvoices>1){
			//post("connecting stereo vst as if 2 voices",t_voice_list, voicemap.get(t_block));
			//so f_voices[] should contain the matrix channels where the vst poly voice is, we have to make an
			//adjustment so voice 2 goes to v1/o2 instead
			if(t_voice_list == "all"){
				ta = voicemap.get(t_block);
				if(!ta.length) ta = [ta];
				for(i=0;i<ta.length;i++){
					for(var ti=0;ti<t_subvoices;ti++){
						t_voices[i*t_subvoices+ti]=+ta[i] + ti*MAX_AUDIO_VOICES;
					}
				}
			}else{
				ta = voicemap.get(t_block);
				if(!ta.length) ta = [ta];
				if(!Array.isArray(t_voice_list)) t_voice_list = [t_voice_list];
				//post("\nta",ta.toString(),"t_v_l",t_voice_list.toString());
				for(v=0;v<t_voice_list.length;v++){
					var tv = t_voice_list[v]-1;
					var tv2 = tv % t_subvoices;
					tv /= t_subvoices;
					tv |= 0;
					t_voices[v] = [ta[tv] + tv2*MAX_AUDIO_VOICES];
				}
			}	
			//post("\nthe special to list i've made is",t_voices.toString());
		}else{
			if(t_voice_list == "all"){
				t_voices = voicemap.get(t_block);
				if(!Array.isArray(t_voices))t_voices = [t_voices];
			}else{		
				if(!Array.isArray(t_voice_list)) t_voice_list = [t_voice_list];
				for(v=0;v<t_voice_list.length;v++){
					t_voices[v] = voicemap.get(t_block+"["+(t_voice_list[v]-1)+"]");
				}
			}
		}
	}
	if((!is_empty(t_voices))&&(!is_empty(f_voices))){
		for(i=0;i<f_voices.length;i++){
			if(((t_type == "midi")||(t_type == "block")) && (t_voice_list == "all")){ 
	//midi that goes to a polyalloc - handled here not per-to-voice
				if(f_type == "midi"){ //midi to midi(polyrouter)
					var enab = 1-conversion.get("mute");
					var scale = conversion.get("scale");
					var offn = conversion.get("offset");
					var offv = conversion.get("offset2");
					if(t_type == "midi"){
						set_routing(f_voices[i],f_o_no, enab,4,1,t_block,t_i_no,1,scale,offn*256-128,offv*256-128,cno,0);
					}else{
						set_routing(f_voices[i],f_o_no, enab,4,1,t_block,-(1+t_i_no),1,scale,offn*256-128,offv*256-128,cno,0);
					}
				}else if(f_type == "audio"){//audio to midi (polyrouter)
					audio_to_data_poly.setvalue((f_voices[i]+1+f_o_no*MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", 1);
					var enab = 1-conversion.get("mute");
					var scale = conversion.get("scale");
					var offn = conversion.get("offset");
					var offv = conversion.get("offset2");
					var vect = conversion.get("vector");
					if(t_type == "midi"){
						set_routing(f_voices[i]+f_o_no*MAX_AUDIO_VOICES+MAX_AUDIO_VOICES,0,enab,2,1,t_block,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,0);
					}else{
						set_routing(f_voices[i]+f_o_no*MAX_AUDIO_VOICES+MAX_AUDIO_VOICES,0,enab,2,1,t_block,-(1+t_i_no),scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,0);
					}
				}else if(f_type == "parameters"){//param to midi (polyrouter)
					//audio_to_data_poly.setvalue((f_voices[i]+1+f_o_no*MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", 1);
					var enab = 1-conversion.get("mute");
					var scale = conversion.get("scale");
					var offn = conversion.get("offset");
					var offv = conversion.get("offset2");
					var vect = conversion.get("vector");
					if(t_type == "midi"){
						set_routing(f_voices[i],f_o_no, enab,2,1,t_block,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,0);
					}else{
						set_routing(f_voices[i],f_o_no, enab,2,1,t_block,-(1+t_i_no),scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,0);
					}
				}
			}else{
				f_voice = +f_voices[i];
				for(v=0;v<t_voices.length;v++){
					t_voice = +t_voices[v];
					if(t_type == "midi"){ //midi to an individual voice, so we need to offset
						t_voice += MAX_BLOCKS;
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
								outmsg[1] = t_voice - 1; 
							}
							if(force_unity){
								//if f_u=1 then you just connect like pairs - L out to L in, R out to R in, x all voices.
								var a = (outmsg[0]>=MAX_AUDIO_VOICES) == (outmsg[1]>=MAX_AUDIO_VOICES);
								outmsg[2] = a * (1-(hw_mute || conversion.get("mute")));
								//if(a==0) post("\nskipped a connection in force unity:",outmsg);
								//if(a!=0) post("\noutmsg was,",outmsg);
							}else{
								var spread_l = spread_level(i, v, conversion.get("offset"),conversion.get("vector"),f_voices.length, t_voices.length);
								outmsg[2] = conversion.get("scale") * (1-(hw_mute || conversion.get("mute"))) * spread_l;
							}
							//post("\nmatrix "+outmsg[0]+" "+outmsg[1]+" "+outmsg[2]);
							if(loading.progress!=0){
								deferred_matrix.push(outmsg);
							}else{
								matrix.message(outmsg);
							}
						}else if(t_type == "midi"){
							// the audio is already routed to the monitoring objects, you just need to turn them on and route that data to the right place	
							//post("\nturning on number",(f_voice+1+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES));
							if(f_type == "hardware") f_voice += MAX_NOTE_VOICES-1;
							audio_to_data_poly.setvalue((f_voice+1+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", 1);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							t_voice -= MAX_BLOCKS;
							//post("\nrouting",f_voice+f_o_no*MAX_AUDIO_VOICES+MAX_AUDIO_VOICES,0,enab,2,2,t_voice,t_i_no);
							if(t_voice<MAX_NOTE_VOICES){
								set_routing(f_voice+f_o_no*MAX_AUDIO_VOICES+MAX_AUDIO_VOICES,0,enab,2,2,t_voice,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,v);
							}else{
								set_routing(f_voice+f_o_no*MAX_AUDIO_VOICES+MAX_AUDIO_VOICES,0,enab,2,3,t_voice-MAX_NOTE_VOICES,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,v);
							}
						}else if(t_type == "block"){
							if(f_type == "hardware") f_voice += MAX_NOTE_VOICES-1;
							audio_to_data_poly.setvalue((f_voice+1+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", 1);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							//i had this commented out for fear of a crash? set_conversion(c_ind,enab,2,scale,offn,offv,vect,-(1+t_i_no));
							set_routing(f_voice+f_o_no*MAX_AUDIO_VOICES+MAX_AUDIO_VOICES,0,enab,2,1,t_block,-(1+t_i_no),scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,0);
						}else if(t_type == "parameters"){
							if(f_type == "hardware") f_voice += MAX_NOTE_VOICES-1;
							audio_to_data_poly.setvalue((f_voice+1+f_o_no * MAX_AUDIO_VOICES-MAX_NOTE_VOICES), "out_value", 1);
							m_index = ((f_voice-MAX_NOTE_VOICES+f_o_no * MAX_AUDIO_VOICES)+(MAX_AUDIO_VOICES+MAX_NOTE_VOICES)*128);
							t_voice+=2*MAX_AUDIO_VOICES+MAX_AUDIO_OUTPUTS;
							var tmod_id;
							var idslist = mod_routemap.get(t_voice);
							if(!Array.isArray(idslist)) idslist =[idslist];
							var tidslist = midi_routemap.get(m_index);
							if(!Array.isArray(tidslist)) tidslist=[tidslist];
							if(is_empty(idslist)||is_empty(tidslist)){
								//post("\none or both empty so creating new modid");
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
											//post("\nfoundindex",idslist[sx]);
											//post("\nPARAM IS ALREADY",tparamlist[idslist[sx]-1]);
											if(tparamlist[sx]==t_i_no) found = idslist[sx];
										}
									}
								}
								if(found!= -1){
									//post("\nFOUND",found);
									tmod_id = found;
								}else{
									//post("\npresent but no matching id found");
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
							set_routing(f_voice+f_o_no*MAX_AUDIO_VOICES+MAX_AUDIO_VOICES,0,enab,1,6,tmod_id,t_i_no,0,scale,0,0,cno,v);
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
								tvv = t_voice-1;// - MAX_NOTE_VOICES+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK;
							}
							var tmod_id;
							var idslist = mod_routemap.get(tvv);
							if(!Array.isArray(idslist)) idslist =[idslist];
							var tidslist = midi_routemap.get(m_index);
							if(!Array.isArray(tidslist)) tidslist=[tidslist];
							if(is_empty(idslist)||is_empty(tidslist)){
								post("one or both empty so creating new modid");
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
									//post("present but no matching id found");
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
								var offv = 0.5;
							}else{
								var offn = offs[0];
								var offv = offs[1];
							}
							var vect = conversion.get("vector");
							
							vvv += MAX_MOD_IDS * m_index;
							set_routing(f_voice,f_o_no,enab,3,6,tmod_id,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,v);
						}else if(t_type == "midi"){
							//this is a midi-midi connection for a single voice
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							t_voice-=MAX_BLOCKS;
							//post("\nf_voice,f_o_no,enab,4,2,t_voice,t_i_no,1,scale,offn*256-128,offv*256-128,cno,v\n",f_voice,f_o_no,enab,4,2,t_voice,t_i_no,1,scale,offn*256-128,offv*256-128,cno,v);
							if(t_voice<MAX_NOTE_VOICES){
								set_routing(f_voice,f_o_no,enab,4,2,t_voice,t_i_no,1,scale,offn*256-128,offv*256-128,cno,v);
							}else{
								set_routing(f_voice,f_o_no,enab,4,3,t_voice-MAX_NOTE_VOICES,t_i_no,1,scale,offn*256-128,offv*256-128,cno,v);
							}
						}else if(t_type == "block"){
							//this is a midi-block control connection for a single voice
							//post("fv",f_voice,"f_o",f_o_no);
							//m_index = (f_voice)*128+f_o_no;
							//add_to_midi_routemap(m_index,t_voice);
							post("\nper-voice muting isn't supported (yet) TODO it shouldn't let you make this connection");
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							var m_index_mult = MAX_MOD_IDS * m_index;
							//set_conversion(m_index_mult + t_voice,enab,4,scale,offn,offv,vect,-(1+t_i_no));
						}else if(t_type == "parameters"){
							// parameter connections are just like midi ones really
							m_index = (f_voice)*128+f_o_no; 
							t_voice += NO_IO_PER_BLOCK * MAX_AUDIO_VOICES + MAX_AUDIO_OUTPUTS;
							var tvv = t_voice;
							var tmod_id;
							var idslist = mod_routemap.get(tvv);
							if(!Array.isArray(idslist)) idslist =[idslist];
							var tidslist = midi_routemap.get(m_index);
							if(!Array.isArray(tidslist)) tidslist=[tidslist];
							//post("ids",idslist,"tids",tidslist);
							if(is_empty(idslist)||is_empty(tidslist)){
								//post("one or both empty so creating new modid");
								mod_id++;
								tmod_id=mod_id;
								mod_buffer.poke(1, mod_id, 0); //<<this is eg how the values get poked in, set to 0 on connect for good housekeeping..							
							}else{
								var found = -1;
								var sx,sy;
								var tparamlist = mod_param.get(tvv);
								if(typeof tparamlist=="number")tparamlist=[tparamlist];
								//post("current param list ",tparamlist);
								for(sx=0;sx<idslist.length;sx++){
									for(sy=0;sy<tidslist.length;sy++){
										if(idslist[sx]+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS==tidslist[sy]){
										//	post("foundindex",idslist[sx]);
										//	post("PARAM IS ALREADY",tparamlist[idslist[sx]-1]);
											if(tparamlist[sx]==t_i_no) found = idslist[sx];
										} 
									}
								}
								if(found!= -1){
									//post("FOUND",found);
									tmod_id = found;								
								}else{
									//post("present but no matching id found");
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
							set_routing(f_voice,f_o_no,enab,3,6,tmod_id,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,v);
						}		
					}else if(f_type == "parameters"){
						if((t_type == "audio") || (t_type == "hardware")){
							//this is a param (=midi vel) -audio connection for a single voice - works like parammod but eventually sends a number to the sig~ instead of to a buffer
							m_index = (f_voice)*128+f_o_no;
							var tvv = t_voice - MAX_NOTE_VOICES+MAX_AUDIO_VOICES*(t_i_no);
							if(t_type == "hardware"){
								//t_i_no = 0;
								tvv = t_voice-1;// - MAX_NOTE_VOICES+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK;
							}
							var tmod_id;
							var idslist = mod_routemap.get(tvv);
							if(!Array.isArray(idslist)) idslist =[idslist];
							var tidslist = midi_routemap.get(m_index);
							if(!Array.isArray(tidslist)) tidslist=[tidslist];
							if(is_empty(idslist)||is_empty(tidslist)){
								post("one or both empty so creating new modid");
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
									//post("present but no matching id found");
									mod_id++;
									tmod_id=mod_id;
								}
							}
							
							
							var vvv = tmod_id+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS; 
							add_to_midi_routemap(m_index,vvv);
							mod_buffer.poke(1, tmod_id, 0); 		
							add_to_mod_routemap(tvv,tmod_id,0,0); 
							//post("param to audio",tvv);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							/*var offs = conversion.get("offset");
							if(typeof offs === "number"){
								var offn = offs;
								var offv = 0;
							}else{
								var offn = offs[0];
								var offv = offs[1];
							}
							var vect = conversion.get("vector");
							*/
							vvv += MAX_MOD_IDS * m_index;
							set_routing(f_voice,f_o_no,enab,1,6,tmod_id,t_i_no,0,scale,0,0,cno,v);
						}else if(t_type == "midi"){
							//this is a param-midi connection for a single voice
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							t_voice-=MAX_BLOCKS;
							if(t_voice<MAX_NOTE_VOICES){
								set_routing(f_voice,f_o_no,enab,2,2,t_voice,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,v);
							}else{
								set_routing(f_voice,f_o_no,enab,2,3,t_voice-MAX_NOTE_VOICES,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,v);
							}
						}else if(t_type == "block"){
							//this is a midi-block control connection for a single voice
							//post("fv",f_voice,"f_o",f_o_no);
							//m_index = (f_voice)*128+f_o_no;
							//add_to_midi_routemap(m_index,t_voice);
							var enab = 1-conversion.get("mute");
							var scale = conversion.get("scale");
							var offn = conversion.get("offset");
							var offv = conversion.get("offset2");
							var vect = conversion.get("vector");
							var m_index_mult = MAX_MOD_IDS * m_index;
							set_conversion(m_index_mult + t_voice,enab,2,scale,offn,offv,vect,-(1+t_i_no));
						}else if(t_type == "parameters"){
							// parameter connections are just like midi ones really
							m_index = (f_voice)*128+f_o_no; 
							t_voice += NO_IO_PER_BLOCK * MAX_AUDIO_VOICES + MAX_AUDIO_OUTPUTS;
							var tvv = t_voice;
							var tmod_id;
							var idslist = mod_routemap.get(tvv);
							if(!Array.isArray(idslist)) idslist =[idslist];
							var tidslist = midi_routemap.get(m_index);
							if(!Array.isArray(tidslist)) tidslist=[tidslist];
							//post("ids",idslist,"tids",tidslist);
							if(is_empty(idslist)||is_empty(tidslist)){
								//post("one or both empty so creating new modid");
								mod_id++;
								tmod_id=mod_id;
								mod_buffer.poke(1, mod_id, 0); //<<this is eg how the values get poked in, set to 0 on connect for good housekeeping..							
							}else{
								var found = -1;
								var sx,sy;
								var tparamlist = mod_param.get(tvv);
								if(typeof tparamlist=="number")tparamlist=[tparamlist];
								//post("current param list ",tparamlist);
								for(sx=0;sx<idslist.length;sx++){
									for(sy=0;sy<tidslist.length;sy++){
										if(idslist[sx]+MAX_BLOCKS+MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_MIDI_OUTS==tidslist[sy]){
										//	post("foundindex",idslist[sx]);
										//	post("PARAM IS ALREADY",tparamlist[idslist[sx]-1]);
											if(tparamlist[sx]==t_i_no) found = idslist[sx];
										} 
									}
								}
								if(found!= -1){
									//post("FOUND",found);
									tmod_id = found;								
								}else{
									//post("present but no matching id found");
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
							set_routing(f_voice,f_o_no,enab,1 ,6,tmod_id,t_i_no,scale*Math.sin(Math.PI*vect*2),scale*Math.cos(Math.PI*vect*2),offn*256-128,offv*256-128,cno,v);
						}		
					}

					
				}
			}
		}
		draw_wire(cno);
	}
	if(!existing) rebuild_action_list = 1;
	last_connection_made=cno;
}	

function build_new_connection_menu(from, to, fromv,tov){
	// builds the connection menu and primes the new_connection one (that is eventually copied into 'connections')
	//remove_potential_wire();
	sidebar.connection.show_from_outputs = 1;
	sidebar.connection.show_to_inputs = 1;

	//post("\n so i've been told tov is ",tov);

	var fromname = blocks.get('blocks['+from+']::name');
	var toname = blocks.get('blocks['+to+']::name');
	//var totype = blocks.get('blocks['+to+']::type');
	var f_subvoices = 1;
	var t_subvoices = 1;
	if(blocks.contains("blocks["+from+"]::subvoices")) f_subvoices = blocks.get("blocks["+from+"]::subvoices");
	if(blocks.contains("blocks["+from+"]::from_subvoices")) f_subvoices=blocks.get("blocks["+from+"]::from_subvoices");
	if(blocks.contains("blocks["+to+"]::subvoices")) t_subvoices = blocks.get("blocks["+to+"]::subvoices");
	if(blocks.contains("blocks["+to+"]::to_subvoices")) t_subvoices = blocks.get("blocks["+to+"]::to_subvoices");
	var fpoly = f_subvoices*blocks.get("blocks["+from+"]::poly::voices");
	var tpoly = t_subvoices*blocks.get("blocks["+to+"]::poly::voices");
	if(toname == null) return 0;
	new_connection.parse('{ }');
 	new_connection.replace("from::number",from);
	new_connection.replace("to::number", to);
	new_connection.replace("from::output::type", "potential");
	new_connection.replace("to::input::type","potential");

	new_connection.replace("conversion::mute" , 0);
	new_connection.replace("conversion::scale", 1);
	new_connection.replace("conversion::vector", 0);	
	new_connection.replace("conversion::offset", 0);	
	
	sidebar.connection.default_out_applied = 0;
	sidebar.connection.default_in_applied = 0;
	var spreadwide = 0;
	
	var d = new Dict;
	d = blocktypes.get(fromname);
	if(d.contains("connections::out::hardware")){
		if(!sidebar.connection.default_out_applied){
			sidebar.connection.default_out_applied=2;
			new_connection.replace("from::output::number",0);
			new_connection.replace("from::output::type","hardware");
		}
	}
	if(d.contains("connections::out::audio")){
		if(!sidebar.connection.default_out_applied){
			sidebar.connection.default_out_applied=2;
			new_connection.replace("from::output::number",0);
			new_connection.replace("from::output::type","audio");
		}
	}
	if(d.contains("connections::out::midi")){
		if(!sidebar.connection.default_out_applied){
			sidebar.connection.default_out_applied=1;
			new_connection.replace("from::output::number",0);
			new_connection.replace("from::output::type","midi");
		}
	}
	if(d.contains("connections::out::parameters")){
		if(!sidebar.connection.default_out_applied){
			sidebar.connection.default_out_applied=1;
			new_connection.replace("from::output::number",0);
			new_connection.replace("from::output::type","parameters");
		}
	}
	var notall = 0;
	if(blocktypes.contains(fromname+"::connections::out::dontdefaultall")) notall = blocktypes.get(fromname+"::connections::out::dontdefaultall");
	if(fromv==-1){
		if(notall){
			new_connection.replace("from::voice", 1 );
		}else{
			new_connection.replace("from::voice", "all" );
			if(tov==-1){
				if(fpoly*f_subvoices==tpoly*t_subvoices) spreadwide = 1;
				//post("\nspreadW",spreadwide);
			}
		}
	}else{
		new_connection.replace("from::voice", fromv + 1 );
	}
	if(spreadwide){
		if((fpoly==1)||(tpoly==1)) spreadwide = 0;
	}
	sidebar.connection.default_in_applied = 0;
	d = blocktypes.get(toname);
	if(d.contains("connections::in::hardware")){
		if(!sidebar.connection.default_in_applied){
			if(sidebar.connection.default_out_applied==2){
				sidebar.connection.default_in_applied=1;
				if(d.contains("connections::in::default")){
					new_connection.replace("to::input::number",d.get("connections::in::default"));
				}else{
					new_connection.replace("to::input::number",0);
				}
				new_connection.replace("to::input::type","hardware");
				new_connection.replace("conversion::offset", spreadwide);
				new_connection.replace("conversion::offset2", 0.5);
			}else if(sidebar.connection.default_out_applied==1){
				new_connection.replace("conversion::offset", 0.5);
			}
		}
	}
	if(d.contains("connections::in::audio")){
		if(!sidebar.connection.default_in_applied){
			if(sidebar.connection.default_out_applied==2){
				sidebar.connection.default_in_applied=1;
				if(d.contains("connections::in::default")){
					new_connection.replace("to::input::number",d.get("connections::in::default"));
				}else{
					new_connection.replace("to::input::number",0);
				}
				new_connection.replace("to::input::type","audio");
				new_connection.replace("conversion::offset", spreadwide);
				new_connection.replace("conversion::offset2", 0.5);
			}else if(sidebar.connection.default_out_applied==1){
				new_connection.replace("conversion::offset", 0.5);
			}
		}
	}
	if(d.contains("connections::in::midi")){
		if((!sidebar.connection.default_in_applied)&&(sidebar.connection.default_out_applied==1)){
			sidebar.connection.default_in_applied = 1;
			if(d.contains("connections::in::default")){
				new_connection.replace("to::input::number",d.get("connections::in::default"));
			}else{
				new_connection.replace("to::input::number",0);
			}
			new_connection.replace("to::input::type","midi");
			new_connection.replace("conversion::offset", 0.5);
			new_connection.replace("conversion::offset2", 0.5);
		}else if((!sidebar.connection.default_in_applied)&&(sidebar.connection.default_out_applied==2)){
			sidebar.connection.default_in_applied = 1;
			if(d.contains("connections::in::default")){
				new_connection.replace("to::input::number",d.get("connections::in::default"));
			}else{
				new_connection.replace("to::input::number",0);
			}
			new_connection.replace("to::input::type","midi");
			new_connection.replace("conversion::offset", 0.5);
			new_connection.replace("conversion::offset2", 0.5);			
		}
	}
	notall = 0;
	if(blocktypes.contains(toname+"::connections::in::dontdefaultall")) notall = blocktypes.get(toname+"::connections::in::dontdefaultall");
	var t_type = new_connection.get("to::input::type");
	if(tov == -1){
		if(notall){
			new_connection.replace("to::voice", 1 );
		}else{
			new_connection.replace("to::voice", "all" );		
		}
	}else{
		if(!((t_type=="audio")||(t_type=="hardware"))){
			tov /= t_subvoices;
			tov |= 0;
			tov +=1;
		}else{
			var ttov = tov * t_subvoices+1;
			tov=[];
			for(var tsi=0;tsi<t_subvoices;tsi++){
				tov.push(ttov+tsi);
			}
			if((t_subvoices==2)&&(f_subvoices==2)){
				new_connection.replace("conversion::offset",1);
				//this make stereo-stereo ones go wide
			}
		}
		new_connection.replace("to::voice", tov);
	}
	
	if(blocktypes.contains(fromname+"::connections::out::force_unity")){
		new_connection.replace("conversion::force_unity" , 1);
	} 

	
	if(wires_potential_connection>-1){
		connections.replace("connections["+wires_potential_connection+"]",new_connection);
		if(check_for_connection_overlap(wires_potential_connection)){
			connections.replace("connections["+wires_potential_connection+"]::overlap",1);
		}else{
			//remove_potential_wire(1);
			make_connection(wires_potential_connection,0);
		}
		new_connection.clear();
		sidebar_select_connection(wires_potential_connection);
		if(sidebar.mode=="none")set_sidebar_mode("connection");
		wires_potential_connection = -1;
	}else{
		post("\nERROR how have we got here without a potential connection?",fromname,toname);
	}

	redraw_flag.flag|=4;
}

function check_for_connection_overlap(n){
	var l = connections.getsize("connections");
	//var overlap = 0;
	var f_n = connections.get("connections["+n+"]::from::number");
	var t_n = connections.get("connections["+n+"]::to::number");
	var f_t = connections.get("connections["+n+"]::from::output::type");
	var t_t = connections.get("connections["+n+"]::to::input::type");
	var f_v = connections.get("connections["+n+"]::from::voice");
	if(!Array.isArray(f_v)) f_v = [f_v];
	var t_v = connections.get("connections["+n+"]::to::voice");
	if(!Array.isArray(t_v)) f_v = [t_v];
	var f_i = connections.get("connections["+n+"]::from::output::number");
	var t_i = connections.get("connections["+n+"]::to::input::number");
	for(var ti=0;ti<l;ti++){
		if(ti==n){
		}else{
			if((connections.contains("connections["+ti+"]::from::number"))&&(connections.get("connections["+ti+"]::from::number")==f_n)){
				if(connections.get("connections["+ti+"]::to::number")==t_n){
					//post("\nfrom and to match");
					if((connections.get("connections["+ti+"]::from::output::type")==f_t)&&(connections.get("connections["+ti+"]::to::input::type")==t_t)){
						//post("\ntypes match");
						if((connections.get("connections["+ti+"]::from::output::number")==f_i)&&(connections.get("connections["+ti+"]::to::input::number")==t_i)){
							//inputs / outputs match	
							var frommatch=0;
							var fv = new_connection.get("from::voice");
							if((f_v == "all") || (fv == "all")){
								frommatch = 1;
							}else{
								if(!Array.isArray(fv)) fv = [fv];
								for(vi=0;vi<fv.length;vi++){
									for(vii=0;vii<f_v.length;vii++){
										if(fv[vi]==f_v[vii]){
											frommatch = 1;
											vii = 9999; vi = 9999;
										}
									}
								}
							}
							if(frommatch){
								var tomatch=0;
								var tv = new_connection.get("to::voice");
								if((t_v == "all") || (tv == "all")){
									tomatch = 1;
								}else{
									if(!Array.isArray(tv)) tv = [tv];
									for(vi=0;vi<tv.length;vi++){
										for(vii=0;vii<t_v.length;vii++){
											if(tv[vi]==t_v[vii]){
												tomatch = 1;
												vii = 9999; vi = 9999;
											}
										}
									}
								}
								if(tomatch){
									return 1;
									//post("\noverlapping connection");
									//ti=99999;
									//overlap = 1;
								}	
							}
						}
					}
				}
			}
		}
	}
	return 0;
}

function remove_block(block){
	//hide the cubes and meters first, to give the illusion it all happens fast
	for(i=0;i<blocks_cube[block].length;i++){
		blocks_cube[block][i].enable = 0;
	}
	for(i=0;i<blocks_meter[block].length;i++){
		blocks_meter[block][i].enable = 0;
	}
	if(record_arm[block]>0) set_block_record_arm(block,0);
	post("removing block",block,"\n");
	var i;
	sidebar.scopes.voice = -1;
	// remove it from all states
	// remove all connections from this block.
	for(i=0;i<connections.getsize("connections");i++){
		if((connections.contains("connections["+i+"]::from::number")) && (connections.contains("connections["+i+"]::to::number"))){
			if((connections.get("connections["+i+"]::from::number") == block) || (connections.get("connections["+i+"]::to::number") == block)){
				remove_connection(i);
			}
		}
	}
	delete_state(-1,block);
	// disable the cubes and meters
	voicecount(block, 0); // remove all voices (this removes individual polyvoices and turns off audio-to-data voices)
	// it's been removed from voicealoc lists by the voicecount function, which also freepeers the cubes and meters
	blocks_meter[block]=[];
	blocks_cube[block]=[];
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
	var new_voice = -1;
	var i;
	var subvoices=1;
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
	//if((details.get("patcher")=="vst.loader") && (max_v>0)) vst=1;
	if(voices == v) return 1;
	
	subvoices = Math.max(1,blocks.get("blocks["+block+"]::subvoices"));
	
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
				var sv=1;
				var f_voice = connections.get("connections["+i+"]::from::voice");
				var t_voice = connections.get("connections["+i+"]::to::voice");
				var removedtotally=0;
				if(connections.get("connections["+i+"]::from::number") == block){
					if(connections.get("connections["+i+"]::from::output::type") == "audio") sv = subvoices;
//			post("f_voice",f_voice,typeof f_voice);
					if(typeof f_voice == "number"){
						if(f_voice > voices*sv) { 
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
							if(f_voice[vv]<=voices*sv){
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
						sv = 1;
						if(connections.get("connections["+i+"]::to::input::type") == "audio") sv = subvoices;
						//post("\nSV IS ",sv);
						if(typeof t_voice == "number"){
							if(t_voice > voices*sv){
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
								if(t_voice[vv]<=voices*sv){
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
			//post("adding a poly voice");
			var t_offset = 0;
			var recycled = 0;
			if(type=="audio"){
				t_offset=MAX_NOTE_VOICES;
				var tnv = find_audio_voice_to_recycle(details.get("patcher"),blocks.get("blocks["+block+"]::upsample"));
				new_voice = tnv[0];
				recycled = tnv[1];
			}else if(type=="note"){
				var tnv = find_note_voice_to_recycle(details.get("patcher"));
				new_voice = tnv[0];
				recycled = tnv[1];
			}else{
				new_voice = next_free_voice(type,block_name);
			}
			if(details.contains("voice_data::defaults")){
				if(loading.wait>1) post("\n- poking in default voicedata");
				var vd_def = [];
				var vdi;
				vd_def = details.get("voice_data::defaults");
				if((typeof new_voice != 'number')||(typeof t_offset != 'number')){
					post("\n- poking in default voicedata");
					post("\n\n\nPROBLEM",new_voice,t_offset,vd_def);
					return -1;
				}
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
				//hardware_list[new_voice] = block_name;
			}
			var list = voicemap.get(block);
			if(!Array.isArray(list)) list = [list];
			list.push(voiceoffset);
			voicemap.replace(block, list);
			if(type=="audio"){  // turn on audio-to-data for the new voice
				var tout;
				for(tout=0;tout<NO_IO_PER_BLOCK;tout++){
					audio_to_data_poly.setvalue((new_voice+1+tout*MAX_AUDIO_VOICES), "vis_meter", 1);
					audio_to_data_poly.setvalue((new_voice+1+tout*MAX_AUDIO_VOICES), "vis_scope", 0);
					audio_to_data_poly.setvalue((new_voice+1+tout*MAX_AUDIO_VOICES), "out_value", 0);
					audio_to_data_poly.setvalue((new_voice+1+tout*MAX_AUDIO_VOICES), "out_trigger", 0);
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
				if(loading.wait>1) post(spr);
				parameter_static_mod.poke(1, voiceoffset * MAX_PARAMETERS+i, 0);
				parameter_error_spread_buffer.poke(1,MAX_PARAMETERS*voiceoffset+i,(mulberry32()-0.5)*spr);
				param_error_drift[voiceoffset][i]=0.01*drft*spr;
			} //set param spreads
			if(recycled){
				if(type=="audio"){
					audio_poly.setvalue(new_voice+1,"reset");
				}else if(type=="note"){
					note_poly.setvalue(new_voice+1,"reset");
				}
			}		
			v++;			
		}else if(voices < v){
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
				note_poly.setvalue(removeme+1, "enabled",0);
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
			for(i=0;i<subvoices;i++){
				//post("\nv = ",v,"i=",i,"removing",v*subvoices- i);
				blocks_cube[block][v*subvoices - i].freepeer(); //enable = 0;
				blocks_cube[block].pop(); //= null;
			}
			for(i=(v-1)*NO_IO_PER_BLOCK;i<blocks_meter[block].length;i++){
				blocks_meter[block][i].freepeer(); //enable = 0;
			}
			blocks_meter[block].pop();
			for(i=0;i<MAX_PARAMETERS;i++) is_flocked[MAX_PARAMETERS*(removeme+voiceoffset)+t] = 0;
			if(type=="audio"){ 
				var tout;
				for(tout=0;tout<NO_IO_PER_BLOCK;tout++){
					audio_to_data_poly.setvalue((removeme+1+tout*MAX_AUDIO_VOICES), "vis_meter", 0);
					audio_to_data_poly.setvalue((removeme+1+tout*MAX_AUDIO_VOICES), "vis_scope", 0);
					audio_to_data_poly.setvalue((removeme+1+tout*MAX_AUDIO_VOICES), "out_value", 0);
					audio_to_data_poly.setvalue((removeme+1+tout*MAX_AUDIO_VOICES), "out_trigger", 0);
				}
			}
			v--;
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
		if(!Array.isArray(addone))addone = [addone];
		var str_version = "";
		for(i=0;i<addone.length;i++){
			str_version = str_version + (addone[i]+1-voiceoffset)+" ";
			//if(addone[i]!=new_voice) get_voice_details(addone[i]);
			//this now happens once all voices are loaded
		}
		// tell the polyalloc voice about its new job
		voicealloc_poly.setvalue(+block + 1,"type",type);
		voicealloc_poly.setvalue(+block + 1,"voicelist",str_version);
		// and do voicedetails:
		
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
					make_connection(i,0);
//						post("TODO add the new voice to 'all' connections");
				}else if((connections.get("connections["+i+"]::to::number") == block) && (t_voice == "all")){
					make_connection(i,0);
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
			make_connection(handful_n[i],0);
		}
		//build_mod_sum_action_list();
		rebuild_action_list=1;
	}
	if(sidebar.mode=="block"){
		sidebar.mode="retrig";
		remove_automaps();
	}	
	if(((displaymode=="custom")||(displaymode=="custom_fullscreen"))&&(custom_block==block)){
		set_display_mode(displaymode,custom_block);
	}else{
		redraw_flag.flag=4;
	}
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
	make_connection(connection,0);
	selected.wire[connection]=1;
	wire_ends[connection][0]=-0.96969696;
	sidebar.lastmode="recalculate";
	redraw_flag.flag |= 4;
}

function insert_block_in_connection(newblockname,newblock){
//	post("insert conn no", menu.connection_number);
	// get the details of the inserted block
	var details = new Dict;
	details = blocktypes.get(newblockname);
	var intypes = details.get("connections::in").getkeys();
	var outtypes = details.get("connections::out").getkeys();
	if(!Array.isArray(intypes))	intypes=[intypes];
	if(!Array.isArray(outtypes)) outtypes=[outtypes];
	
	//- copy all the connection details
	var oldconn = new Dict;
	oldconn = connections.get("connections["+menu.connection_number+"]");

	// remove the connection
	remove_connection(menu.connection_number);
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
	// so what i'm calling i_no and o_no are actually type number, not output number. 
	//we have no idea which output number / input number within the types, but switching is easy! :)
	//there is a 'default' key we could check if we're feeling clever?
	//post("\n\n\ninsert, ",i_no,o_no,f_type,t_type,"intypes",intypes,"outtypes",outtypes);
	//one conversion is 'default' and the other is the one from the old conn. usually first one is default
	var defaultpos=0;
	var ftt = (f_type == "hardware") ? "audio" : f_type;
	var ttt = (t_type == "hardware") ? "audio" : t_type;
	if((ftt != intypes[i_no])&&(outtypes[o_no]==ttt))defaultpos = 1;
	if((ftt == intypes[i_no])&&(outtypes[o_no]!=ttt))defaultpos = 2;
	new_connection.parse('{}');
	if(defaultpos == 1){//this is the rare exception where default is the second one.
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
	new_connection.replace("to::input::number",0/*i_no*/);
	new_connection.replace("to::input::type",intypes[i_no]);
	connections.append("connections",new_connection);
	make_connection(connections.getsize("connections")-1,0);
	new_connection.clear();
	
//	new_connection.parse('{}');
//	new_connection.replace("conversion",t_conv); 
	if(defaultpos==2){//this is the rare exception where default is the second one.
		new_connection.parse('{}');
		new_connection.replace("conversion::mute" , 0);
		new_connection.replace("conversion::scale", 1);
		new_connection.replace("conversion::vector", 0);	
		new_connection.replace("conversion::offset", 0);
		new_connection.replace("conversion::offset2", 0.5);
		if((t_type=="midi")&&(outtypes[o_no]=="midi")) new_connection.replace("conversion::offset", 0.5);
	}else{
		new_connection.replace("conversion", oldconn.get("conversion"));
		if(defaultpos==0) new_connection.replace("conversion::scale", 1);
	}
	post("\ndefaultpos was ",defaultpos);
	new_connection.replace("from::number",newblock);
	new_connection.replace("from::voice","all");
	new_connection.replace("from::output::number",0/*o_no*/);
	new_connection.replace("from::output::type",outtypes[o_no]);
	new_connection.replace("to",oldconn.get("to"));
	connections.append("connections",new_connection);
	make_connection(connections.getsize("connections")-1,0);
	new_connection.clear();
	//click_clear(0,0);
	//outlet(8,"bang");
	set_display_mode("blocks");
	redraw_flag.flag |= 4;	
}

function swap_block(block_name){
	// if type changes you need to allocate a new voice number, this is where it falls down atm

	post("swapping block",menu.swap_block_target,"to",block_name);
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
	var otype = blocks.get("blocks["+menu.swap_block_target+"]::type");
	var o_subv = 1;
	if(otype == "audio") o_subv = blocks.get("blocks["+menu.swap_block_target+"]::subvoices");
	var subv = 1;
	if(type == "audio"){
		if(details.contains("subvoices")){
			subv = details.get("subvoices");
		}else if(details.contains("plugin_name")){
			subv = 2;
		}
	} 
	// collect up connections to/from this block, disconnect them all
	var handful = [];
	var handful_n = [];
	var h=0;
	var ratio = subv/o_subv;
	if(ratio!=1) post("\ntodo - i think here it needs to reassign connection voices differently?");
	for(i=0;i<connections.getsize("connections");i++){
		if(connections.contains("connections["+i+"]::from")){
			if((connections.get("connections["+i+"]::from::number") == menu.swap_block_target)||(connections.get("connections["+i+"]::to::number") == menu.swap_block_target)){
				handful[h] = connections.get("connections["+i+"]");
				handful_n[h] = i;
				h++;
				remove_connection(i);
				//wire_ends[i][0] += 0.05;
			}
		}
	}
	var x = blocks.get("blocks["+menu.swap_block_target+"]::space::x");
	var y = blocks.get("blocks["+menu.swap_block_target+"]::space::y");
	var v = blocks.get("blocks["+menu.swap_block_target+"]::poly::voices");
	remove_block(menu.swap_block_target);
	menu.swap_block_target = new_block(block_name,x,y);
	post("\nreplacement block",menu.swap_block_target);
	draw_block(menu.swap_block_target);
	voicecount(menu.swap_block_target, v);
	rebuild_action_list = 1;
	
	// put all the connections back
	if(h>0){
		for(i=0;i<h;i++){
			if(+handful[i].get("from::number")==menu.swap_block_target){
				//check we have that type of output
				post("\noutput check",i);
				var oty = handful[i].get("from::output::type");
				var onu = handful[i].get("from::output::number");
				if(!details.contains("connections::out::"+oty)){
					if((oty=="hardware")&&(details.contains("connections::out::audio"))){
						handful[i].replace("from::output::type","audio");
					}else if((oty=="audio")&&(details.contains("connections::out::hardware"))){
						handful[i].replace("from::output::type","hardware");
					}else{
						handful[i].replace("from::output::type","potential");
					}
					post(" - replaced");
				}
				var nn = details.getsize("connections::out::"+handful[i].get("from::output::type"));
				if(onu>=nn){
					handful[i].replace("from::output::number",nn-1);
					post(" - renumbered");
				}
			}else{
				//check we have that type of input
				post("\ninput check");
				var oty = handful[i].get("to::input::type");
				var onu = handful[i].get("to::input::number");
				if(!details.contains("connections::in::"+oty)){
					if((oty=="hardware")&&(details.contains("connections::in::audio"))){
						handful[i].replace("to::input::type","audio");
					}else if((oty=="audio")&&(details.contains("connections::in::hardware"))){
						handful[i].replace("to::input::type","hardware");
					}else{
						handful[i].replace("to::input::type","potential");
					}
					post(" - replaced");
				}
				var nn = details.getsize("connections::in::"+handful[i].get("to::input::type"));
				if(onu>=nn){
					handful[i].replace("to::input::number",nn-1);
					post(" - renumber	ed");
				}

			}
			connections.replace("connections["+handful_n[i]+"]",handful[i]);
			make_connection(handful_n[i],0);	
		}
	}

	if(type == "note"){
		still_checking_polys |=1;
	}else if(type == "audio"){
		still_checking_polys |=2;
	}
	menu.swap_block_target = -1;
	redraw_flag.flag |= 4; 
}

function build_mod_sum_action_list(){
	//var ttt=new Date().getTime();
	if(loading.progress>0) return 0;
	messnamed("modulation_processor", "pause",1);
	post("\nBuilding new mod sum action list");
// this was the old do_parameters loop, now it fills a buffer with a list of things to sum and where they go
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
			if(!Array.isArray(slotlist)) slotlist = [slotlist];
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
	

	
	var lockup,locked,flag,dest_index,extra,has_mod,wrap;
//	var midiout,voffset=0;
	for(b=0;b<MAX_BLOCKS;b++){
		if(blocks.contains("blocks["+b+"]::name")){
			var bname = blocks.get("blocks["+b+"]::name");
			psize = blocktypes.getsize(bname+"::parameters");
			if(psize){
				midiout=-1;
				btype = blocks.get("blocks["+b+"]::type");
				lockup = blocks.get("blocks["+b+"]::error::lockup");
				lockup *= lockup * 0.003;
				voicelist = voicemap.get(b);
				if(!Array.isArray(voicelist)) voicelist = [voicelist];
				/*if(btype=="hardware"){
					if(blocktypes.contains(bname+"::midi_output_number")){
						midiout = blocktypes.get(bname+"::midi_output_number");
					}	
				}*/

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
						
						/*if(midiout>-1){
							flag = 4;
							var chanout = blocktypes.get(bname+"::parameters["+p+"]::midi_channel");
							var ccout = blocktypes.get(bname+"::parameters["+p+"]::midi_cc");
							dest_index = ccout + chanout*128+midiout*16384;
							mod_sum_action_list.poke(1,list_pointer,dest_index);
							mod_sum_action_list.poke(2,list_pointer,0);
							mod_sum_action_list.poke(3,list_pointer,flag);
							mod_sum_action_list.poke(4,list_pointer,wrap);
						}else */
						if(is_flocked[MAX_PARAMETERS*(voicelist[i])+p]>0){
							flag = 2;
							extra = MAX_PARAMETERS*(voicelist[i])+p;
							flock_id = is_flocked[extra]-1;
							dest_index = flock_id;
							flock_buffer.poke(1,flock_id,1 +extra);

							mod_sum_action_list.poke(1,list_pointer,dest_index); //flokcid
							mod_sum_action_list.poke(2,list_pointer,b*MAX_PARAMETERS+p); //extra); //bpos[flockid]
							mod_sum_action_list.poke(3,list_pointer,flag);
							mod_sum_action_list.poke(4,list_pointer,wrap);						
						}else{
							dest_index = MAX_PARAMETERS*(voicelist[i])+p;
							flag = 1;
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
						mod_sum_action_list.poke(2,list_pointer,0.001+0.3*Math.pow(4*blocks.get("blocks["+b+"]::flock::weight"),-4));//1/weight
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
	//ttt = new Date().getTime() - ttt;
	//post("\nMSA LIST MADE IN ",ttt);
	messnamed("output_queue_pointer_reset","bang");
	changed_queue.poke(1,0,0);
	changed_queue_pointer = 0; 
	messnamed("modulation_processor", "pause", 0); //this message gets deferred (in the max patch) otherwise the gen doesn't get a frame to realise that pause has changed to 1 and back
}

function mute_last_connection(){
//called by the midi router if it thinks feedback is happening
connection_edit("connections["+last_connection_made+"]::conversion::mute",1);
post("\n\nFEEDBACK PANIC! there were so many midi messages i muted the last new connection to try to prevent a meltdown");
}