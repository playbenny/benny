function polycheck(){
	if(still_checking_polys&4){ send_ui_patcherlist(); }
	if(still_checking_polys&2){ send_audio_patcherlist(); }
    if(still_checking_polys&1){ send_note_patcherlist(); }
}

function slowclock(){
	//here: check things that need to be copied into buffers have been, check up on things like deferred load happening
	do_drift();
	if(usermouse.qlb==0) world.getsize();
	if(globals_requested) send_globals();

	recursions=0;
	if((deferred_diag.length>0)&&(usermouse.qlb==0)){
		if(usermouse.ctrl){
			post("\nthere were",deferred_diag.length,"items");
		}else{
			for(i=0;i<deferred_diag.length;i++){
				post("\n"+deferred_diag[i]);
			}
		}
		deferred_diag=[];
	}
	draw_cpu_meter(); //is this the right place for this?
	if(fullscreen && ((displaymode=="blocks")||(displaymode=="panels"))) draw_clock();
}

function frameclock(){
	var bangflag=0;
	var i,t;
	if(usermouse.queue.length>0){
		//deferred_diag.push("mouse queue length "+usermouse.queue.length+" count is "+usermouse.qcount+" qlb is "+usermouse.qlb);
		while(usermouse.queue.length>0){
			var entry = usermouse.queue.shift();
			//post("\nprocessing mouse queue",entry);
			//var tcell = click_i[(entry[0]>>click_b_s)+((entry[1]>>click_b_s)<<click_b_w)];
			if((entry[2]!=usermouse.left_button)||(usermouse.queue.length==0)){ //(entry[2]==0)||
				omouse(entry[0],entry[1],entry[2],entry[3],entry[4],entry[5],entry[6],entry[7]);
			}
		}
	}

	check_changed_queue(); // was in fastclock?

	if(usermouse.timer!=0){
		usermouse.timer-=1;
		if(usermouse.timer<-LONG_PRESS_TIME*0.0151){// /66
			if(usermouse.long_press_function!=null){
				usermouse.long_press_function();
				usermouse.long_press_function=null;
				usermouse.timer = 0;
			}
		}
	}

	if(still_checking_polys) polycheck();

	if(loading.ready_for_next_action){
		//post("\nloading progress:",loading.progress,"loading wait",loading.ready_for_next_action);
		//if(loading.progress>=MAX_BLOCKS+loading.mapping.length) polycheck();
		loading.ready_for_next_action--;
		if(loading.ready_for_next_action==0){
			import_song();
			lcd_main.message("brgb", backgroundcolour_blocks);
			lcd_main.message("clear");
		}
		draw_topbar();
		if(displaymode=="block_menu") draw_menu_hint();
		//sidebar_meters();
		lcd_main.message("bang");
		return 1;
	}
	if(rebuild_action_list){
		build_mod_sum_action_list();
		rebuild_action_list=0;
	}
	if((bulgeamount>0) && (bulgeamount<1)){
		bulgeamount -= 0.025;
		if(bulgeamount<=0)bulgeamount =0;
		if(Array.isArray(wires_position[bulgingwire])){
			var ll = wires_position[bulgingwire].length;
			for(var i=0;i<ll;i++){
				var ta = wires_scale[bulgingwire][i];
				ta[1] = wire_dia * (1 + bulgeamount);
				wires_scale[bulgingwire][i] = [ta[0],ta[1],ta[2]];
			}
			if(bulgeamount==0) bulgingwire=-1;			
			write_wire_matrix(bulgingwire);
			redraw_flag.matrices |= 1;
		}
	}

	if(redraw_flag.flag & 4){
		redraw(); //redraw does everything 2 does + blocks, panels or custom or whatever
		bangflag=1;
	}else if(redraw_flag.flag & 2){
		clear_screens();
		draw_topbar();
		draw_sidebar();
		if(fullscreen && ((displaymode=="blocks")||(displaymode=="panels"))) draw_clock();
		if((displaymode=="panels")||(displaymode=="panels_edit")) draw_panels();
		if(displaymode=="waves") draw_waves();
		if((state_fade.position>-1) && (state_fade.selected > -2)) draw_state_xfade();
		if(redraw_flag.flag & 8) block_and_wire_colours();
		bangflag=1;
	}else{
		if(redraw_flag.flag & 8) block_and_wire_colours();
		if(redraw_flag.matrices & 1){
			messnamed("wires_matrices","bang");
		}
		if(redraw_flag.matrices & 2){
			messnamed("voices_matrices","bang");
			messnamed("blocks_matrices","bang");
		}
		redraw_flag.matrices = 0;
		if(redraw_flag.flag & 1){
			if((sidebar.mode == "block")||(sidebar.mode == "add_state")||(sidebar.mode == "settings")||(sidebar.mode == "wire")){
				var vch = view_changed;
				view_changed = false;
				var ll = redraw_flag.targets.length;
				for(i=0;i<ll;i++){
					if(redraw_flag.targets[i] && Array.isArray(paramslider_details[i])){ //check it's defined (as sometimes if clock runs during its construction you got errors
						bangflag=1;
						if(paramslider_details[i][13]=="menu_l"){
							parameter_menu_l(i);
						}else if(paramslider_details[i][13] == "menu_b"){
							redraw_flag.deferred|=2;// parameter_menu_b(i);
						}else if(paramslider_details[i][13] == "button"){
							parameter_button(i);
						}else if(paramslider_details[i][13] == "menu_d"){
							redraw_flag.deferred|=2;//parameter_menu_l(i);
						}else if((redraw_flag.targets[i]==1)&&((paramslider_details[i][16]|0)!=0)&&(automap.mapped_c!=sidebar.selected)){
							parameter_v_slider(paramslider_details[i][0], paramslider_details[i][1], paramslider_details[i][2], paramslider_details[i][3],paramslider_details[i][4], paramslider_details[i][5], paramslider_details[i][6], paramslider_details[i][7],paramslider_details[i][8], paramslider_details[i][9], paramslider_details[i][10]);
						}else if((paramslider_details[i][12]|0)!=0){
							lcd_main.message("paintrect", paramslider_details[i][0], paramslider_details[i][3], paramslider_details[i][2], paramslider_details[i][17],backgroundcolour_current);
							labelled_parameter_v_slider(i);
						}
						redraw_flag.targets[i]=0;
					}
				}
				view_changed = vch;
			}
		}
		if(redraw_flag.flag & 16){
			if(displaymode == "panels"){
				var vch = view_changed;
				view_changed = false;
				var ll = redraw_flag.paneltargets.length;
				for(t=0;t<ll;t++){
					if(redraw_flag.paneltargets[t]){
						bangflag=1;
						i = MAX_PARAMETERS + t;
						if(paramslider_details[i][13]=="menu_l"){
							parameter_menu_l(i);
						}else if(paramslider_details[i][13] == "menu_b"){
							redraw_flag.deferred|=2;// parameter_menu_b(i);
						}else if(paramslider_details[i][13] == "button"){
							parameter_button(i);
						}else if((redraw_flag.paneltargets[t]==1)&&(paramslider_details[i][16]!=0)){
							parameter_v_slider(paramslider_details[i][0], paramslider_details[i][1], paramslider_details[i][2], paramslider_details[i][3],paramslider_details[i][4], paramslider_details[i][5], paramslider_details[i][6], paramslider_details[i][7],paramslider_details[i][8], paramslider_details[i][9], paramslider_details[i][10]);
						}else{
							labelled_parameter_v_slider(i);
						}
						redraw_flag.paneltargets[t]=0;				
					}
				}	
				view_changed = vch;
			}
		}
	}
	if(displaymode == "blocks"){
		if(meters_enable==1){
			hardware_meters();
			meters();
			midi_meters();
			messnamed("meters_matrices","bang");
			sidebar_meters();
			bangflag = 1;
		}
		if(sidebar.panel) update_custom();
	}else if(displaymode == "panels"){
		sidebar_meters();
		update_custom_panels();
		bangflag=1;
	}else if(displaymode == "waves"){
		sidebar_meters();
		bangflag=1;
	}else if(displaymode == "custom"){
		if(redraw_flag.flag>1){
			draw_custom();
		}else{
			update_custom();
		}
		sidebar_meters();
		bangflag=1;
	}else if(displaymode == "custom_fullscreen"){
		if(redraw_flag.flag>1){
			draw_custom();
		}else{
			update_custom();
		}
		sidebar_meters();
		bangflag=1;
	}else if(displaymode == "flocks"){
		sidebar_meters();
		move_flock_blocks();
		bangflag=1;
	}
	if(bangflag) {
		lcd_main.message("bang");
	}
	redraw_flag.flag = 0;
	if(redraw_flag.deferred!=0){ //.deferred = skip a frame, |=128 makes it skip 2 frames
		redraw_flag.flag = redraw_flag.deferred;
		redraw_flag.deferred = 0;
	}
	if(end_of_frame_fn!=null) {
		end_of_frame_fn();
		end_of_frame_fn = null;
	}
}

function prep_meter_updatelist(){
	var k = [];
	var index,vmap;
	k = voicemap.getkeys();
	meters_updatelist.hardware = [];
	meters_updatelist.meters = [];
	meters_updatelist.midi = [];
	for(var i in k){
		var ty = blocks.get("blocks["+k[i]+"]::type");
		if(ty == "hardware"){//hardware_metermap.contains(k[i])){
			vmap = hardware_metermap.get(k[i]);
			if(vmap !== null){
				if(!Array.isArray(vmap)) vmap = [vmap];
				for(index =0;index<vmap.length;index++){
					//post("\nadded to hw meters:",k[i],index,vmap[index],blocks.get("blocks["+k[i]+"]::space::y"));
					meters_updatelist.hardware.push([k[i],index,vmap[index],blocks.get("blocks["+k[i]+"]::space::y")]);
				}
			}
		}else{
			vmap = voicemap.get(k[i]);
			if(vmap !== null){
				if(!Array.isArray(vmap)) vmap = [vmap];
				if(vmap[0]>=MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
				}else if(vmap[0]>=MAX_NOTE_VOICES){
					for(index =0;index<vmap.length;index++){
						meters_updatelist.meters.push([k[i],index,vmap[index]-MAX_NOTE_VOICES] );
					}
				}else{
					for(index =0;index<vmap.length;index++){
						var wide = (!blocktypes.contains(blocks.get("blocks["+k[i]+"]::name")+"::connections::out::midi"));
						meters_updatelist.midi.push([k[i],index,vmap[index],wide]);//the 4th element is 0 for normal, 1 for a full width bar?
					}
				}
			}	
		}
	}
	meters_enable = 1;
}

function check_changed_queue(){
	var i=0,t;
	var b,p;
	t= changed_queue.peek(0,changed_queue_pointer);
	while(t>0){
		i+=1;
		t-=1;
		b = Math.floor(t/MAX_PARAMETERS);
		p = Math.floor(t - b*MAX_PARAMETERS);
		if(b==sidebar.selected){
			if(!is_empty(paramslider_details[p /*i*/])){
				redraw_flag.targets[p] |= 1;
				redraw_flag.flag |= 1;														
			}
		}
		if(displaymode == "panels"){
			if(panelslider_visible[b][p]){
				redraw_flag.paneltargets[panelslider_visible[b][p]-MAX_PARAMETERS] |= 1;//|= 2;
				redraw_flag.flag |= 16;
			}
		}
		changed_queue_pointer += 1;
		if(changed_queue_pointer > 1023){
			changed_queue_pointer = 0;
			t = 0; //to make sure it can never get stuck, though it might miss a change for one frame while it wraps around
		}else{
			t = changed_queue.peek(0,changed_queue_pointer);
		}
	}
}



function meters(){
	for(i = meters_updatelist.meters.length-1; i>=0; i--){
		var voice = meters_updatelist.meters[i][1];
		var block = meters_updatelist.meters[i][0];
		var polyvoice = meters_updatelist.meters[i][2];
		var tv=[];
		var mmin,mmax;
		for(tt=0;tt<NO_IO_PER_BLOCK;tt++){ // need to get from buffer
			mmin = scope_buffer.peek(1,1+(polyvoice+MAX_AUDIO_VOICES*tt));
			mmax = scope_buffer.peek(2,1+(polyvoice+MAX_AUDIO_VOICES*tt));
			tv = blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].position;
			//tv[0] = blocks_cube[block][voice].position[0] + 0.4+tt*0.4/NO_IO_PER_BLOCK + 0.25*(voice==0);
			tv[1] = blocks_cube[block][voice].position[1] + (mmax+mmin)*0.225;
			tv[2] = 0.5+blocks_cube[block][voice].position[2];
			blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].position = tv;
			tv = blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].scale;
			tv[1] = Math.max(0.225*(mmax-mmin),0.005);
			blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].scale = tv;
			matrix_meter_position.setcell(matrix_meter_index[block][voice*NO_IO_PER_BLOCK+tt],0,"val",blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].position[0],blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].position[1],blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].position[2]);
			matrix_meter_scale.setcell(matrix_meter_index[block][voice*NO_IO_PER_BLOCK+tt],0,"val",blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].scale[0],blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].scale[1],blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].scale[2]);
		}
	}
}

function hardware_meters(){
	for(i = meters_updatelist.hardware.length-1; i>=0; i--){
		var block=meters_updatelist.hardware[i][0];
		var voice=meters_updatelist.hardware[i][1];
		var polyvoice = meters_updatelist.hardware[i][2];
		var mmin = scope_buffer.peek(1,1+(polyvoice));
		var mmax = scope_buffer.peek(2,1+(polyvoice));
		var tv=[];
		tv = blocks_meter[block][voice].position;
		tv[1] = blocks_cube[block][0].position[1] + (mmax+mmin) * 0.225;
		tv[2] = 0.5+blocks_cube[block][0].position[2];
		blocks_meter[block][voice].position = tv;
		tv = blocks_meter[block][voice].scale;
		tv[1] = Math.max(0.225*(mmax-mmin),0.005);
		blocks_meter[block][voice].scale = tv;
		matrix_meter_position.setcell(matrix_meter_index[block][voice],0,"val",blocks_meter[block][voice].position[0],blocks_meter[block][voice].position[1],blocks_meter[block][voice].position[2]);
		matrix_meter_scale.setcell(matrix_meter_index[block][voice],0,"val",blocks_meter[block][voice].scale[0],blocks_meter[block][voice].scale[1],blocks_meter[block][voice].scale[2]);
	}
}

function draw_midi_indicators(){
	var l = midi_indicators.list.length;
	var yi = (fontheight-2) / Math.max(1, l - 1);
	var y = 9;
	midi_indicators.flag = 0;
	for(var i = 0; i<l; i++){
		if(midi_indicators.status[i]>0){
			if(midi_indicators.status[i]==1){
				lcd_main.message("frgb", menucolour);
				lcd_main.message("moveto", sidebar.meters.startx, y);
				lcd_main.message("lineto", sidebar.meters.startx, y+1);
				if(sidebar.mode == "midi_indicators") redraw_flag.deferred |= 2;
			}
			midi_indicators.status[i] -= 0.3;
			midi_indicators.flag = 1;
		}else{	
			lcd_main.message("frgb",menudarkest);
			lcd_main.message("moveto", sidebar.meters.startx, y);
			lcd_main.message("lineto", sidebar.meters.startx, y+1);
			midi_indicators.status[i] = 0;
			if(sidebar.mode == "midi_indicators") redraw_flag.deferred |= 2;
		}
		y += yi;
	}
}

function midi_meters(){ //currently locked to 1 per voice but easy to generalise to more i think
	var minsize = Math.max(1,1+0.1*(camera_position[2]-5));
	minsize *= minsize;
	for(i = meters_updatelist.midi.length-1; i>=0; i--){
		var block=meters_updatelist.midi[i][0];
		var voice=meters_updatelist.midi[i][1];
		var polyvoice = meters_updatelist.midi[i][2];
		var mvals = [];
		for(var ii=0;ii<7;ii++) mvals[ii] = midi_meters_buffer.peek(ii+1,polyvoice);
		if(mvals[1]){
			midi_meters_buffer.poke(2,polyvoice,0); //wipe change flag
			if((mvals[2]==0)||(mvals[4]<mvals[3])){
				if(blocks_meter[block][voice].enable) matrix_meter_scale.setcell(matrix_meter_index[block][voice],0,"val",0,0,0);
				blocks_meter[block][voice].enable = 0;
			}else{
				blocks_meter[block][voice].enable = 1;
				var p_min, p_max, v_min, v_max;
				var held = mvals[2]*0.05;
				if(meters_updatelist.midi[i][3]==1){
					p_min = 0; p_max = 1;
					v_min = (mvals[5])/129;
					v_max = (mvals[6]+1)/129;
				}else{		
					p_min = (mvals[3])/(128 + minsize);
					p_max = (minsize + mvals[4])/(128 + minsize);
					v_min = (mvals[5])/(128 + 0.5*minsize);
					v_max = (0.5*minsize + mvals[6])/(128 + 0.5*minsize);
				}
				var tv=[];
				tv = blocks_cube[block][voice+1].position.concat();
				tv[0] = tv[0] - 0.185 + (p_max+p_min)*0.185;
				tv[1] = tv[1] - 0.41 + (v_max+v_min)*0.41;
				tv[2] = 0.5 + tv[2]; //selected.block[block];
				blocks_meter[block][voice].position = tv.concat();
				tv[0] = Math.max(0.185*(p_max-p_min),0.02);
				tv[1] = Math.max(0.45*(v_max-v_min),0.02);
				tv[2] = held;
				blocks_meter[block][voice].scale = tv.concat();
				matrix_meter_position.setcell(matrix_meter_index[block][voice],0,"val",blocks_meter[block][voice].position[0],blocks_meter[block][voice].position[1],blocks_meter[block][voice].position[2]);
				matrix_meter_scale.setcell(matrix_meter_index[block][voice],0,"val",blocks_meter[block][voice].scale[0],blocks_meter[block][voice].scale[1],blocks_meter[block][voice].scale[2]);
			}
		}
//		}catch(err){error("\nmidi meter err ",block,voice, err.name,err.message);}
	}
}

function move_flock_blocks(){
	for(var i=0;i<flocklist.length;i++){ // FLOCK.
		p = flocklist[i];
		b=3*p;
		blocks_cube[flockblocklist[p]][flockvoicelist[p]].position = [flock_cube_size*(flock_buffer.peek(4, b)-0.5),flock_cube_size*(flock_buffer.peek(4, b+1)-0.5),5+flock_cube_size*flock_buffer.peek(4, b+2)];
	}	
}



function sidebar_meters(){
	var i, ii, peakflag =0,mmin,mmax;
	var peaklist = [];
	var l;
	if(displaymode=="panels"){
		l = meter_positions.length;
	}else{
		l = 2;
	}
	for(i=0;i<l;i++){
		lcd_main.message("frgb", meter_positions[i][1]);
		var ll = meter_positions[i][2].length;
		for(ii=0;ii<ll;ii++){
			lcd_main.message("moveto", meter_positions[i][2][ii][0],meter_positions[i][2][ii][1]);
			lcd_main.message("lineto", meter_positions[i][2][ii][0],meter_positions[i][2][ii][2]);			
		}
		lcd_main.message("frgb", meter_positions[i][0]);
		for(ii=0;ii<ll;ii++){
			mmin = Math.min(Math.max(scope_buffer.peek(1,meter_positions[i][2][ii][3]), -1), 1);
			mmax = Math.min(Math.max(scope_buffer.peek(2,meter_positions[i][2][ii][3]), -1), 1);
			var mh=meter_positions[i][2][ii][2]-meter_positions[i][2][ii][1]-2;
			if((mmin>-0.98) && (mmax<0.98)){// && (mmin<1)  && (mmax>-1)){
				lcd_main.message("moveto", meter_positions[i][2][ii][0], meter_positions[i][2][ii][1] + mh * (1 - mmax) * 0.5);
				lcd_main.message("lineto", meter_positions[i][2][ii][0], 1+meter_positions[i][2][ii][1] + mh * (1 - mmin) * 0.5);
			}else{
				peakflag=1;
				peaklist[peaklist.length]=[meter_positions[i][2][ii][0], meter_positions[i][2][ii][1] + mh * (1 - mmax) * 0.5, 1+meter_positions[i][2][ii][1] + mh * (1 - mmin) * 0.5];
			}
		}
	}
	if(peakflag){
		lcd_main.message("frgb", 255, 20, 20);
		for(i=peaklist.length-1;i>=0;i--){
			lcd_main.message("moveto",peaklist[i][0],peaklist[i][1]);
			lcd_main.message("lineto",peaklist[i][0],peaklist[i][2]);
		}
	}
	if(midi_indicators.flag>0) draw_midi_indicators();
	if(sidebar.scopes.voice>-1) sidebar_scopes();
	if((sidebar.scopes.midi>-1)||(sidebar.scopes.midi_routing.number>-1)) sidebar_midi_scope();
}

function sidebar_midi_scope(){
	var t,v,sx,sy;
	var x1,y1,x2,y2;
	var ly=1,llx=-100;
	x1 = sidebar.x;
	x2 = sidebar.x2;
	sx = (x2-x1)/128;
	x1+=2;
	y1 = sidebar.scopes.starty;
	y2 = sidebar.scopes.endy;
	sy = (y2-y1-2)/128;
	y2-=2;
	r =0;
	//actually need to iterate over all voices/outputs?
	//but there are flags for if you need to bother drawing
	var vi,cha=0;
	for(vi=0;vi<sidebar.scopes.midivoicelist.length;vi++){
		if(midi_scopes_change_buffer.peek(1,(sidebar.scopes.midivoicelist[vi]*128 + sidebar.scopes.midioutlist[vi]))>0){ 
			cha +=1;
			midi_scopes_change_buffer.poke(1,(sidebar.scopes.midivoicelist[vi]*128 + sidebar.scopes.midioutlist[vi]),0);
		}
	}
	if(cha>0){
		lcd_main.message("paintrect" , x1-2,y1,x2,y2+2,sidebar.scopes.bg);
		lcd_main.message("frgb",sidebar.scopes.fg);
		if(sidebar.scopes.midinames == 1) setfontsize(fontsmall);
		for(vi = 0;vi<sidebar.scopes.midivoicelist.length; vi++){
			v = midi_scopes_buffer.peek(1,(sidebar.scopes.midivoicelist[vi]*128 + sidebar.scopes.midioutlist[vi])*128,128);
			//post("\ndrawing scope for voice",vl[vi]," which is",vi,"of",vl.length);
			for(t=0;t<128;t++){
				if(v[t]){
					if(Math.abs(v[t])>127){
						if(r!=1)lcd_main.message("frgb",255,0,0);
						r=1;
						v[t]=127;
					}else if(r==1){
						lcd_main.message("frgb",sidebar.scopes.fg);
					}
					lcd_main.message("moveto", x1+t*sx, y2);
					lcd_main.message("lineto", x1+t*sx, y2-sy*Math.abs(v[t]));
					if(sidebar.scopes.midinames == 1){
						if(t>llx+4){ly=1; llx=t;}else{ly++;}
						lcd_main.message("moveto", x1+t*sx+6, y1+(ly*fontheight)*0.4);
						lcd_main.message("write", note_names[t]);
					}
				}
			}
		}
	}
	if(sidebar.scopes.midi_routing.number!=-1){
		y1 = sidebar.scopes.midi_routing.starty;
		y2 = sidebar.scopes.midi_routing.endy;
		sy = (y2-y1-2)/128;
		y2-=2;
		r =0;
		cha = 0;
		if(midi_scopes_change_buffer.peek(1,(sidebar.scopes.midi_routing.voice*128))>0){ 
			cha +=1;
			midi_scopes_change_buffer.poke(1,(sidebar.scopes.midi_routing.voice*128),0);
		}
		if(cha>0){
			lcd_main.message("paintrect" , x1-2,y1,x2,y2+2,sidebar.scopes.midi_routing.bg);
			lcd_main.message("frgb",sidebar.scopes.midi_routing.fg);
			v = midi_scopes_buffer.peek(1,(sidebar.scopes.midi_routing.voice*128)*128,128);
			for(t=0;t<128;t++){
				if(v[t]){
					if(Math.abs(v[t])>127){
						if(r!=1)lcd_main.message("frgb",255,0,0);
						r=1;
						v[t]=127;
					}else if(r==1){
						lcd_main.message("frgb",sidebar.scopes.midi_routing.fg);
					}
					lcd_main.message("moveto", x1+t*sx, y2);
					lcd_main.message("lineto", x1+t*sx, y2-sy*Math.abs(v[t]));
					if(sidebar.scopes.midinames == 1){
						if(t>llx+4){ly=1; llx=t;}else{ly++;}
						lcd_main.message("moveto", x1+t*sx+6, y1+(ly*fontheight)*0.4);
						lcd_main.message("write", note_names[t]);
					}
				}
			}
		}
	}
}

function sidebar_scopes(){
	var i;
	for(i=0;i<sidebar.scopes.voicelist.length;i++){
		draw_scope(sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-fo1,sidebar.scopes.endy,sidebar.scopes.voicelist[i]);
	}
}

function draw_scope(x1,y1,x2,y2,voice){
	var t,mmin,mmax,c,oc;
	c=-1;
	oc=-1;
	lcd_main.message("paintrect", x1,y1,x2,y2, sidebar.scopes.bg);
	var w=(x2-x1-2);
	var w2 = w*0.5;
	var w3 = Math.min(255,w2);
	var wi = w3 / w2;
	var h1 = (y1+y2)*0.5;
	var h2 = (y2-y1-4)*0.5;
	var t=256*(voice+1)+1;
	for(var x=x1|0;x<x2-2;x+=2){
		/*var t2 = t |0; //interpolating version - you only really see the difference if the scope is more than 255 pixels wide, tends to be on connection page
		var t3 = t-t2;
		var t4 = 1-t3;
		mmin = t4*scope_buffer.peek(1,t2)+t3*scope_buffer.peek(1,t2+1);
		mmax = t4*scope_buffer.peek(2,t2)+t3*scope_buffer.peek(2,t2+1);*/
		var t2 = t|0; //cheaper version
		mmin = scope_buffer.peek(1,t2);
		mmax = scope_buffer.peek(2,t2);
		t+=wi;
		if((mmin<-1) || (mmin>1) || (mmax>1) || (mmax<-1)){
			c=1;
			mmax = Math.min(Math.max(mmax, -1), 1);
			mmin = Math.min(Math.max(mmin, -1), 1);
		}else{
			c=0;
		}
		if(c!=oc){
			if(c==1){
				lcd_main.message("frgb", 255, 20, 20);
			}else{
				lcd_main.message("frgb", sidebar.scopes.fg);
			}
		}
		lcd_main.message("moveto", x, h1 - h2*mmax -1);
		lcd_main.message("lineto", x, h1 - h2*mmin );
	}		
}

function do_drift(){
	var i,t;
	for(i=param_error_drift.length;i--;){
		if(!is_empty(param_error_drift[i])){
			for(t=param_error_drift.length;t--;){
				if((param_error_drift[i][t]|0)!=0){
					parameter_error_spread_buffer.poke(1,MAX_PARAMETERS*i+t,parameter_error_spread_buffer.peek(1, MAX_PARAMETERS*i+t)+(Math.random()-0.5)*param_error_drift[i][t]);
				}
			}
		}
	}
}