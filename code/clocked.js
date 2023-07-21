function polycheck(){
	if(still_checking_polys&4){ send_ui_patcherlist(); }
	if(still_checking_polys&2){ send_audio_patcherlist(); }
    if(still_checking_polys&1){ send_note_patcherlist(); }
}

function slowclock(){
	//here: check things that need to be copied into buffers have been, check up on things like deferred load happening
	//if(deferred_diag.length>9900)deferred_diagnostics();
/*	if(debugmode){
		if(usermouse.left_button==0) deferred_diagnostics();
	}else{
		deferred_diag=[];
	}*/
	do_drift();
	if(usermouse.qlb==0) world.getsize();
	if(globals_requested) send_globals();

	recursions=0;
	if((deferred_diag.length>0)&&(usermouse.qlb==0)){
		for(i=0;i<deferred_diag.length;i++){
			post("\n"+deferred_diag[i]);
		}
		deferred_diag=[];
	}
	draw_cpu_meter(); //is this the right place for this?
}

function fastclock(){
	check_changed_queue();
	check_output_queue(); //EVENTUALLY this needs to be on a faster clock
	if(redraw_flag.deferred!=0){
		redraw_flag.flag = redraw_flag.deferred;
		redraw_flag.deferred = 0;
	}
}

function frameclock(){
	var bangflag=0;
	var i,t;
	if(usermouse.queue.length>0){
		//deferred_diag.push("mouse queue length "+usermouse.queue.length+" count is "+usermouse.qcount+" qlb is "+usermouse.qlb);
		while(usermouse.queue.length>0){
			var entry = usermouse.queue.shift();
			//post("\nprocessing mouse queue",entry);
			if((entry[2]!=usermouse.left_button)||(usermouse.queue.length==0)){ //(entry[2]==0)||
				omouse(entry[0],entry[1],entry[2],entry[3],entry[4],entry[5],entry[6],entry[7]);
			}
		}
	}


	if(usermouse.timer>0){
		usermouse.timer-=1;
	}
	
	if(loading.ready_for_next_action){
		loading.ready_for_next_action--;
		if(loading.ready_for_next_action==0){
			//clear_screens();
			import_song();
		}
		slowclock();
		draw_topbar();
		sidebar_meters();
		bangflag=1;
		redraw_flag.flag = 0;// redraw_flag.flag & 59; //disables a 'redraw' (and hence a draw blocks)
	}else if(loading.progress!=0){
		draw_topbar();
		sidebar_meters();
		bangflag=1;
		redraw_flag.flag = 0;
	}else{
		if(rebuild_action_list){
			build_mod_sum_action_list();
			rebuild_action_list=0;
		}
		if(still_checking_polys) polycheck();
		if((bulgeamount>0) && (bulgeamount<1)){
			bulgeamount -= 0.1;
			if(bulgeamount<=0)bulgeamount =0;
			if(Array.isArray(wires[bulgingwire])){
				for(var i=0;i<wires[bulgingwire].length;i++){
					var ta = wires[bulgingwire][i].scale;
					ta[0] = wire_diaX * (1 + bulgeamount);
					ta[1] = wire_diaY * (1 + bulgeamount);
					wires[bulgingwire][i].scale = [ta[0],ta[1],ta[2]];
				}
				if(bulgeamount==0) bulgingwire=-1;			
			}
		}
	}
	if(redraw_flag.flag & 8){
		block_and_wire_colours();
	}
	if(redraw_flag.flag & 4){
		redraw();
		bangflag=1;
	}else if(redraw_flag.flag & 2){
		clear_screens();
		draw_topbar();
		draw_sidebar();
		if(displaymode=="panels"){ draw_panels();}
		if((state_fade.position>-1) && (state_fade.selected > -2)) draw_state_xfade();
		bangflag=1;
	}else{
		if(redraw_flag.flag & 1){
			if((sidebar.mode == "block")||(sidebar.mode == "add_state")||(sidebar.mode == "settings")){
				for(i=0;i<redraw_flag.targets.length;i++){
					if(redraw_flag.targets[i] && Array.isArray(paramslider_details[i])){ //check it's defined (as sometimes if clock runs during its construction you got errors
						bangflag=1;
						//post("\nREDRAW",i);
						if((redraw_flag.targets[i]==1)&&(paramslider_details[i][16]!=0)&&(automap.mapped_c!=sidebar.selected)){
							lcd_main.message("paintrect", paramslider_details[i][0], paramslider_details[i][1], paramslider_details[i][2], paramslider_details[i][3],0,0,0);
							parameter_v_slider(paramslider_details[i][0], paramslider_details[i][1], paramslider_details[i][2], paramslider_details[i][3],paramslider_details[i][4], paramslider_details[i][5], paramslider_details[i][6], paramslider_details[i][7],paramslider_details[i][8], paramslider_details[i][9], paramslider_details[i][10]);
						}else{
							lcd_main.message("paintrect", paramslider_details[i][0], paramslider_details[i][1], paramslider_details[i][2], paramslider_details[i][17],0,0,0);
							labelled_parameter_v_slider(i);
						}
						redraw_flag.targets[i]=0;
					}
				}
			}
		}
		if(redraw_flag.flag & 16){
			if(displaymode == "panels"){
				for(t=0;t<redraw_flag.paneltargets.length;t++){
					if(redraw_flag.paneltargets[t]){
						bangflag=1;
						i = MAX_PARAMETERS + t;
						if((redraw_flag.paneltargets[t]==1)&&(paramslider_details[i][16]!=0)){
							lcd_main.message("paintrect", paramslider_details[i][0], paramslider_details[i][1], paramslider_details[i][2], paramslider_details[i][3],0,0,0);
							parameter_v_slider(paramslider_details[i][0], paramslider_details[i][1], paramslider_details[i][2], paramslider_details[i][3],paramslider_details[i][4], paramslider_details[i][5], paramslider_details[i][6], paramslider_details[i][7],paramslider_details[i][8], paramslider_details[i][9], paramslider_details[i][10]);
						}else{
							lcd_main.message("paintrect", paramslider_details[i][0], paramslider_details[i][1], paramslider_details[i][2], paramslider_details[i][17],0,0,0);
							labelled_parameter_v_slider(i);
						}
						redraw_flag.paneltargets[t]=0;				
					}
				}	
			}
		}
	}
	if(displaymode == "blocks"){
		if(meters_enable==1){
			var k = [];
			var index,vmap;
			k = voicemap.getkeys();
			for(i in k){
				vmap = voicemap.get(k[i]);
				if(typeof vmap == "number"){ vmap = [vmap]; }
				if(vmap !== 'null'){
					if(vmap[0]>=MAX_NOTE_VOICES+MAX_AUDIO_VOICES){
						vmap = hardware_metermap.get(k[i]);
						if(typeof vmap == "number"){
							hardware_meters(k[i],0,vmap);
						}else if(vmap !== 'null'){
							for(index =0;index<vmap.length;index++){
								hardware_meters(k[i],index,vmap[index]);
							}
						}
					}else if(vmap[0]>=MAX_NOTE_VOICES){
						for(index =0;index<vmap.length;index++){
							meters(k[i],index,vmap[index]-MAX_NOTE_VOICES);
						}
					}
				}
			}
			sidebar_meters();
			bangflag = 1;
		}
		if(sidebar.mode == "block"){
			if(custom_block == sidebar.selected) update_custom();
		}
	}else if(displaymode == "flocks"){
		sidebar_meters();
		move_flock_blocks();
		bangflag=1;
	}else if(displaymode == "panels"){
		sidebar_meters();
		update_custom_panels();
		bangflag=1;
	}else if(displaymode == "waves"){
		sidebar_meters();
		bangflag=1;
	}else if(displaymode == "custom"){
		if(redraw_flag.flag>1){
//			clear_screens();
//			draw_topbar();
//			draw_sidebar();
			draw_custom();
		}else{
			update_custom();
		}
		//if((state_fade.position>-1) && (state_fade.selected > -1))draw_state_xfade();
		sidebar_meters();
		bangflag=1;
	}else if(displaymode == "custom_fullscreen"){
		if(redraw_flag.flag>1){
			draw_custom();
		}else{
			update_custom();
		}
		//sidebar_meters();
		bangflag=1;
	}
	if(bangflag) {
		lcd_main.message("bang");
		//outlet(8,"bang");
	}
	redraw_flag.flag = 0;
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
			if((sidebar.mode == "block")||(sidebar.mode == "settings")||(sidebar.mode == "add_state")){
				if(!is_empty(paramslider_details[i])){
//					post("\ntesting",i,b,p);
//					post("flagging",p,"as changed");
					redraw_flag.targets[p] |= 1;
					redraw_flag.flag |= 1;														
				}
			}
		}
		if(displaymode == "panels"){
			if(panelslider_visible[b][p]){
				redraw_flag.paneltargets[panelslider_visible[b][p]-MAX_PARAMETERS] |= 1;//|= 2;
				redraw_flag.flag |= 16;
			}
		}
//		post("block",b,"param",p,"changed\n");
		changed_queue_pointer += 1;
		if(changed_queue_pointer > 1023){
			changed_queue_pointer = 0;
			t = 0; //to make sure it can never get stuck, though it might miss a change for one frame while it wraps around
		}else{
			t = changed_queue.peek(0,changed_queue_pointer);
		}
	}
//	if(i>0) post("read ",i,"changed queue events\n");
}


function check_output_queue(){
	var i=0,t,r,v;
	var chanout,ccout,midiout;
	t= output_queue.peek(1,output_queue_pointer);
	while(t>0){
		r= output_queue.peek(2,output_queue_pointer);
		v= output_queue.peek(3,output_queue_pointer);
		i+=1;
		if(t==1){//hw midi out
			midiout = Math.floor(r/16384);
			r-=midiout*16384;
			chanout = Math.floor(r/128);
			r-=chanout*128;
			ccout=r;
			messnamed("hardware_midi", midiout+8, ccout, Math.floor(128*v), chanout);
		}else if(t==2){// sigs
			//post("\nsetting sigouts from output queue position",output_queue_pointer,"r",r,"v",v);
			sigouts.setvalue(r,v);
		}
		output_queue_pointer+=1;
		t= output_queue.peek(1,output_queue_pointer);
		if(output_queue_pointer>1023){
			output_queue_pointer=0;
			t=0; //to make sure it can never get stuck, though it might miss a change for one frame while it wraps around
		}
	}
//	if(i>0){post("read ",i,"output queue events\n");}

}

function meters(block,voice,polyvoice){
	if(voice !== 'undefined'){
		var tv=[];
		var mmin,mmax;
		for(tt=0;tt<NO_IO_PER_BLOCK;tt++){ // need to get from buffer
			mmin = scope_buffer.peek(1,1+(polyvoice+MAX_AUDIO_VOICES*tt));
			mmax = scope_buffer.peek(2,1+(polyvoice+MAX_AUDIO_VOICES*tt));
			if(blocks_meter[block][voice*NO_IO_PER_BLOCK+tt] === undefined ){
				post("\nmeter problem: block",block,"voice",voice,"tt",tt,"loadingstatus",loading.progress);
			}else{
				//post("\nmeter OK     : block",block,"voice",voice,"tt",tt);
				tv = blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].position;
				//tv[0] = blocks_cube[block][voice].position[0] + 0.4+tt*0.4/NO_IO_PER_BLOCK + 0.25*(voice==0);
				tv[1] = blocks_cube[block][voice].position[1] + (mmax+mmin)*0.225;
				blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].position = tv;
				tv = blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].scale;
				tv[1] = Math.max(0.225*(mmax-mmin),0.005);
				blocks_meter[block][voice*NO_IO_PER_BLOCK+tt].scale = tv;
			}
		}
	}
}

function hardware_meters(block,voice,polyvoice){
//	post("bvp",block,voice,polyvoice);
	if(blocks_meter[block][voice] !== 'undefined'){
		var mmin = scope_buffer.peek(1,1+(polyvoice));
		var mmax = scope_buffer.peek(2,1+(polyvoice));
		//post("bvp-vv",block,voice,polyvoice,"-",mmin,mmax,"\n");
		var tv=[];
		tv = blocks_meter[block][voice].position;
		tv[1] = blocks.get("blocks["+block+"]::space::y")+(mmax+mmin)*0.225;
		blocks_meter[block][voice].position = tv;
		tv = blocks_meter[block][voice].scale;
		tv[1] = Math.max(0.225*(mmax-mmin),0.005);
		blocks_meter[block][voice].scale = tv;
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
		for(ii=0;ii<meter_positions[i][2].length;ii++){
			lcd_main.message("moveto", meter_positions[i][2][ii][0],meter_positions[i][2][ii][1]);
			lcd_main.message("lineto", meter_positions[i][2][ii][0],meter_positions[i][2][ii][2]);			
		}
		lcd_main.message("frgb", meter_positions[i][0]);
		for(ii=0;ii<meter_positions[i][2].length;ii++){
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
		for(i=0;i<peaklist.length;i++){
			lcd_main.message("moveto",peaklist[i][0],peaklist[i][1]);
			lcd_main.message("lineto",peaklist[i][0],peaklist[i][2]);
		}
	}

	if(sidebar.mode == "block"){
		if(sidebar.scopes.voice>-1) sidebar_scopes();
		if(sidebar.scopes.midi>-1) sidebar_midi_scope();
	}else if(sidebar.mode == "wire"){
		if(sidebar.scopes.voice>-1) sidebar_scopes();
		if(sidebar.scopes.midi>-1) sidebar_midi_scope();
	}else if((sidebar.mode == "output_scope")||(sidebar.mode == "input_scope")){
		if(sidebar.scopes.voice>-1) sidebar_scopes();
	}
}

function sidebar_midi_scope(){
	var t,v,sx,sy;
	var x1,y1,x2,y2;
	var ly=1,llx=-100;
	var show = sidebar.scopes.midinames;
	x1 = sidebar.x;
	y1 = sidebar.scopes.starty;
	x2 = mainwindow_width-9;
	y2 = sidebar.scopes.endy;
	if(sidebar.scopes.voice>-1){
		//if it's also displaying an audio scope, move this one down a bit
		t = fontheight*2.1;
		y1 += t;
		y2 += t;
		show = 0;
	}
	lcd_main.message("paintrect" , x1,y1,x2,y2,sidebar.scopes.bg);
	lcd_main.message("frgb",sidebar.scopes.fg);
	
	sx = (x2-x1)/128;
	sy = (y2-y1-2)/128;
	x1+=2;
	y2-=2;
	r =0;
	v = midi_scope_buffer.peek(1,0,128);
	for(t=0;t<128;t++){
		//v = midi_scope_buffer.peek(1,t);
		if(v[t]>127){
			r=1;
			v[t]=127;
			lcd_main.message("frgb",255,0,0);
		}else if(v[t]<-127){
			r=1;
			v[t]=-127;
			lcd_main.message("frgb",255,0,0);
		}else if(r==1){
			lcd_main.message("frgb",sidebar.scopes.fg);
		}
		if(v[t]>0){
			lcd_main.message("moveto", x1+t*sx, y2);
			lcd_main.message("lineto", x1+t*sx, y2-sy*v[t]);
			midi_scope_buffer.poke(1,t,Math.max(0,v[t]-0.2)); //held notes very slowly decay in the scope
			if(show == 1){
				if(t>llx+4){ly=1; llx=t;}else{ly++;}
				lcd_main.message("moveto", x1+t*sx+6, y1+(ly*fontheight)*0.4);
				lcd_main.message("write", note_names[t]);
			}
		}else if(v[t]<0){
			lcd_main.message("moveto", x1+t*sx, y2);
			lcd_main.message("lineto", x1+t*sx, y2+sy*v[t]);
			midi_scope_buffer.poke(1,t,Math.min(0,v[t]*0.00001));//just holds it for 1 frame longer
			if(show == 1){
				if(t>llx+4){ly=1; llx=t;}else{ly++;}
				lcd_main.message("moveto", x1+t*sx+6, y1+(ly*fontheight)*0.4);
				lcd_main.message("write", note_names[t]);
			}
		}
	}
}

function sidebar_scopes(){
	var i;
	for(i=0;i<sidebar.scopes.voicelist.length;i++){
		draw_scope(sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,sidebar.scopes.voicelist[i]);
	}
}

function draw_scope(x1,y1,x2,y2,voice){
	var t,mmin,mmax,c,oc;
	c=-1;
	oc=-1;
	lcd_main.message("paintrect", x1,y1,x2,y2, sidebar.scopes.bg);
	for(t=0;t<(x2-x1-2)/2;t++){
		mmin = scope_buffer.peek(1,256*(voice+1)+ t+1);
		mmax = scope_buffer.peek(2,256*(voice+1)+ t+1);
		if((mmin>=-1) && (mmin<=1) && (mmax<=1) && (mmax>=-1)){
			c=0;
		}else{
			c=1;
			mmax = Math.min(Math.max(mmax, -1), 1);
			mmin = Math.min(Math.max(mmin, -1), 1);
		}
		if(c!=oc){
			if(c==1){
				lcd_main.message("frgb", 255, 20, 20);
			}else{
				lcd_main.message("frgb", sidebar.scopes.fg);
			}
		}
		lcd_main.message("moveto", x1+t*2, (y1+y2)/2 - (y2-y1-4)*0.5*mmax -1);
		lcd_main.message("lineto", x1+t*2, (y1+y2)/2 - (y2-y1-4)*0.5*mmin );
	}		
}

function do_drift(){
	var i,t;
	for(i = 0; i<param_error_drift.length;i++){
		if(!is_empty(param_error_drift[i])){
			for(t=0;t<param_error_drift.length;t++){
				if(param_error_drift[i][t]!=0){
					//param_error_spread[i][t]+=(Math.random()-0.5)*param_error_drift[i][t];
					parameter_error_spread_buffer.poke(1,MAX_PARAMETERS*i+t,parameter_error_spread_buffer.peek(1, MAX_PARAMETERS*i+t)+(Math.random()-0.5)*param_error_drift[i][t]);
				}
			}
		}
	}
}