function clicked_block_preparation() {
	if ((selected.block_count > 1) && (selected.block[usermouse.ids[1]] != 0)) {
		// if the clicked block is selected and multiple blocks are selected, then you drag them all
		var t = 0;
		usermouse.drag.dragging.voices = [];
		for (var b = 0; b < MAX_BLOCKS; b++) {
			if (selected.block[b]) {
				var tvc = blocks.get("blocks[" + b + "]::poly::voices");
				for (var i = 0; i <= tvc; i++) {
					usermouse.drag.dragging.voices[t] = [b, i];
					t++;
				}
			}
		}
		for (var i = 0; i < t; i++)	post("\nmultidrag", usermouse.drag.dragging.voices[i][0], usermouse.drag.dragging.voices[i][1]);
	} else {
		// if the clicked block is not selected, or is the only one selected, then you drag it				
		var tvc = blocks.get("blocks[" + usermouse.ids[1] + "]::poly::voices");
		usermouse.drag.dragging.voices = [];
		for (var i = 0; i <= tvc; i++) {
			usermouse.drag.dragging.voices[i] = [usermouse.ids[1], i];
		}
	}
	usermouse.drag.starting_value_x = blocks_cube[usermouse.clicked3d][0].position[0];
	usermouse.drag.starting_value_y = blocks_cube[usermouse.clicked3d][0].position[1];
	var nc = 0, found;
	for (t = 0; t < connections.getsize("connections"); t++) { //get list of connections that move with this/these blocks
		found = 0;
		if (connections.contains("connections[" + t + "]::to::number")) {
			var ct = connections.get("connections[" + t + "]::to::number");
			var cf = connections.get("connections[" + t + "]::from::number");
			for (var i = 0; i < usermouse.drag.dragging.voices.length; i++) {
				if (usermouse.drag.dragging.voices[i][0] == ct) {
					found = 1;
				} else if (usermouse.drag.dragging.voices[i][0] == cf) {
					found = 1;
				}
			}
			if (found) {
				usermouse.drag.dragging.connections[nc] = t;
				nc++;
			}
		}
	}
}

function picker_hover_and_special(id){
	if(usermouse.oid!=id){ //if id has changed
		var ohov=usermouse.hover[1];
		usermouse.oid=id;
		var thov =id.split('-'); // store hover - any picker id received when not waiting for click
		
		if((thov[0]=="wires")&&(usermouse.clicked3d==-1)){  // wire bulge stuff for a bit
			if(bulgingwire!=-1){
				for(var i=0;i<wires[bulgingwire].length;i++){
					var ta = wires[bulgingwire][i].scale;
					wires[bulgingwire][i].scale = [wire_diaX,wire_diaY,ta[2]];
				}					
			}
			bulgingwire=thov[1];
			bulgeamount=1;
			for(var i=0;i<wires[bulgingwire].length;i++){
				var ta = wires[bulgingwire][i].scale;
				ta[0] = wire_diaX * (1 + bulgeamount);
				ta[1] = wire_diaY * (1 + bulgeamount);
				wires[bulgingwire][i].scale = [ta[0],ta[1],ta[2]];
			}
		}else if(thov[0]!="background"){
			if(thov[0]!="wires") usermouse.hover = thov.concat();
			if(bulgeamount>0){
				bulgeamount=0;
				for(var i=0;i<wires[bulgingwire].length;i++){
					var ta = wires[bulgingwire][i].scale;
					wires[bulgingwire][i].scale = [wire_diaX,wire_diaY,ta[2]];
				}
				bulgingwire = -1;
			}
		}else{
			usermouse.hover = thov.concat();
			if(bulgeamount==1) bulgeamount = 0.999;
		}
		if((displaymode=="block_menu")&&(ohov!=usermouse.hover[1])){
			draw_menu_hint();
		}	
	}
}
// usermouse. left_button, shift, ctrl, alt, x, y, got_i, got_t  <-- all the latest values. got_i , _t = 2d click index and type
//     last.left_button, last.got_i / _t <-- last message's left button, index+type
// looks like only mouse fn can administer left button? this thitng above here is probably wrong?
//  .clicked2d - index if clicked, -1 if nothing
//  .clicked3d = -1 if you've clicked the 2d layer which supercedes the 3d one.
// .drag.starting_x/y - 2d start of drag. BUT if starting_x = -1 that's a flag to store the next mouse x/y in starting_X
//      .starting_value_x/y
//      .distance
//   .ids - last picker click when we were waiting for click (-2 mode)
// .hover = last picker click or not click when we were not in -2 mode waiting for click

function mouse(x,y,leftbutton,ctrl,shift,caps,alt,e){
	usermouse.queue.push([x,y,leftbutton,ctrl,shift,caps,alt,usermouse.qcount++]);
	usermouse.qlb = leftbutton;
	//deferred_diag.push("mouse"+x+","+y+" [[  "+leftbutton+"  ]] "+usermouse.qcount);
}

function mouseidle(x,y,leftbutton,ctrl,shift,caps,alt,e){
	usermouse.queue.push([x,y,leftbutton,ctrl,shift,caps,alt,usermouse.qcount++]);
	usermouse.qlb = leftbutton;
	//deferred_diag.push("idle    "+x+","+y+" [[  "+leftbutton+"  ]] "+usermouse.qcount);
}

function mouseidleout(x,y,leftbutton,ctrl,shift,caps,alt,e){

}

function omouse(x,y,leftbutton,ctrl,shift,caps,alt,e){
	//if(id!='background') post("touch",id);
	//	opicker(id,leftbutton);
	usermouse.last.left_button = usermouse.left_button;
	//if(usermouse.clicked2d == -2) usermouse.last.left_button = -1;//<-- hack for touchscreens
	usermouse.left_button = leftbutton;
	usermouse.last.shift = usermouse.shift;
	usermouse.last.alt = usermouse.alt;
	usermouse.shift = shift;
	usermouse.ctrl = ctrl;
	usermouse.alt = alt;
	usermouse.x = x;
	usermouse.y = y;

	var tcell = click_i[x+(y<<click_b_w)];
	usermouse.got_i = tcell & 4095;
	usermouse.got_t = tcell >> 12;
	if((displaymode=="blocks")||(displaymode=="block_menu")){
		var id = glpicker.touch(x,y);
		picker_hover_and_special(id);
	}
	//deferred_diag.push(["omouse ",x,y+"[[  "+leftbutton+"  ]]"+usermouse.got_i,usermouse.got_t]);
	if(usermouse.last.left_button!=usermouse.left_button){
		// ##################################################
		if(usermouse.left_button){	// CLICK
			if((usermouse.got_i==0) && (usermouse.got_t==0)){	//nothing on the 2d layer, open it up for 3d clicks
				if((displaymode=="blocks")||(displaymode=="block_menu")){
					usermouse.drag.starting_x = usermouse.x;
					usermouse.drag.starting_y = usermouse.y;		
					usermouse.clicked3d = usermouse.hover[1];
					usermouse.drag.last_x = usermouse.x;
					usermouse.drag.last_y = usermouse.y;
					usermouse.drag.distance=0;
					usermouse.clicked2d=-1;
					usermouse.ids = id.split('-');
					//	deferred_diag[deferred_diag.length] = "id set to "+id;
					if(id=="background" || id=="block_menu_background"){
						usermouse.clicked3d = "background";
						usermouse.drag.starting_x = -1; // flag waiting for the first mouse message of a drag, because the initial click may be at wrong location with touch messages. usermouse.x;
						usermouse.drag.starting_y = -1; //usermouse.y;
						usermouse.drag.last_x = usermouse.x;
						usermouse.drag.last_y = usermouse.y;
						usermouse.ids[1]=-3;
						usermouse.hover=[-1,-1,-1];
					}else{
						usermouse.clicked3d = usermouse.ids[1];
						usermouse.hover = [].concat(usermouse.ids);
						if(displaymode=="blocks"){
							if((usermouse.ids[0]=="block")||(usermouse.ids[0]=="meter")){
								clicked_block_preparation();
							}
						}
					}
				} 
			}else if(usermouse.got_t==7){//passthrough
				var f = mouse_click_actions[usermouse.got_i];
				var p = mouse_click_parameters[usermouse.got_i];
				var v = mouse_click_values[usermouse.got_i];
				f(p,v);
				if((displaymode=="blocks")||(displaymode=="custom")||(displaymode=="panels")) redraw_flag.flag|=2;				
			}else{
				//usermouse.timer = DOUBLE_CLICK_TIME;
				usermouse.clicked2d = usermouse.got_i;
				usermouse.clicked3d = -1;
				usermouse.last.got_i = usermouse.got_i;
				usermouse.last.got_t = usermouse.got_t;
				usermouse.drag.distance = 0;
				if(usermouse.got_t>=2 && usermouse.got_t<=4){
					usermouse.drag.starting_x = usermouse.x;
					usermouse.drag.starting_y = usermouse.y;
					if(usermouse.got_i>=0){
						var f = mouse_click_actions[usermouse.got_i];
						var p = mouse_click_parameters[usermouse.got_i];
						var v = mouse_click_values[usermouse.got_i];
						usermouse.drag.starting_value_x = f(p,"get");
						if(/* (v>1)|| */(usermouse.got_t==4)){ //v is 
							usermouse.drag.starting_value_y = f(v,"get");
						}else{
							usermouse.drag.starting_value_y = -1;
						}
					}
				}
				if((displaymode=="blocks")||(displaymode=="custom")||(displaymode=="panels")) redraw_flag.flag|=2;
			}
						

		// ##################################################
		}else{						// RELEASE
//			post("\nrelease\n2d3d is",usermouse.clicked2d,usermouse.clicked3d);
			if(usermouse.got_t==7){//passthrough
				var f = mouse_click_actions[usermouse.got_i];
				var p = mouse_click_parameters[usermouse.got_i];
				var v = mouse_click_values[usermouse.got_i];
				f(p,v);
				if((displaymode=="blocks")||(displaymode=="custom")||(displaymode=="panels")) redraw_flag.flag|=2;
			} 
/*			if(usermouse.clicked2d == -2){ //this is if the mouse click transition to 1 happened in picker not in mouse, which is the case with touch
				if((usermouse.got_i > 0) && (usermouse.got_t>0)){
					usermouse.clicked2d = usermouse.got_i;
					usermouse.clicked3d = -1;
					usermouse.last.got_i = usermouse.got_i;
					usermouse.last.got_t = usermouse.got_t;
					usermouse.drag.distance = 0;
					if(usermouse.got_t>=2 && usermouse.got_t<=4){
						usermouse.drag.starting_x = usermouse.x;
						usermouse.drag.starting_y = usermouse.y;
						if(usermouse.got_i>=0){
							var f = mouse_click_actions[usermouse.got_i];
							var p = mouse_click_parameters[usermouse.got_i];
							var v = mouse_click_values[usermouse.got_i];
							usermouse.drag.starting_value_x = f(p,"get");
							if((v>1)||(usermouse.got_t==4)){ //v is 
								usermouse.drag.starting_value_y = f(v,"get");
							}else{
								usermouse.drag.starting_value_y = -1;
							}
						}
					}
					usermouse.last.left_button = 1;
				}
			}*/
			if(usermouse.clicked2d != -1){
				if(usermouse.last.got_i == usermouse.got_i){
					// post("2d release",usermouse.last.got_i);
					if((usermouse.last.got_t == 1)||(usermouse.last.got_t == 7)){ // it's a button (1) or passthrough(7)
						var f = mouse_click_actions[usermouse.last.got_i];
						var p = mouse_click_parameters[usermouse.last.got_i];
						var v = mouse_click_values[usermouse.last.got_i];
						
						if(usermouse.last.got_i != danger_button){
							danger_button = -1;
						} 
						f(p,v);
						if((displaymode=="blocks")||(displaymode=="custom")||(displaymode=="panels")) redraw_flag.flag|=2;
					}
					if((usermouse.last.got_t == 2) && (usermouse.drag.distance<100)){ //its a slider
						if(mouse_click_actions[usermouse.last.got_i]==sidebar_parameter_knob){
							var pb = mouse_click_parameters[usermouse.last.got_i];
							if(alt == 1){
								sidebar_parameter_knob(p,param_defaults[pb[1]][pb[0]]);
								redraw_flag.flag=2;								
							}else if(usermouse.ctrl == 1){
								if(usermouse.shift == 1){
									set_sidebar_mode("panel_assign");
								}else{
									set_sidebar_mode("flock");
								}
							}else if(mouse_click_values[usermouse.last.got_i]!=""){//CHECK IF ITS A MENU ONE, JUMP TO NEXT VALUE
								var pnumber = mouse_click_values[usermouse.last.got_i] - 1;
								var p_values= blocktypes.get(paramslider_details[pnumber][15]+"::parameters["+paramslider_details[pnumber][9]+"]::values");
								var pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*paramslider_details[pnumber][8]+paramslider_details[pnumber][9]);
								if(p_values.length>0) pv = (pv + 1.01/p_values.length) % 1;
								sidebar_parameter_knob(pb,pv);
								redraw_flag.flag=2;
							} 
						}else if(mouse_click_actions[usermouse.last.got_i]==scope_zoom){
							if(alt == 1){
								scope_zoom(0,SCOPE_DEFAULT_ZOOM);
							}else{
								scope_zoom(mouse_click_parameters[usermouse.last.got_i],"click");
							}
						}else if(mouse_click_actions[usermouse.got_i]==static_mod_adjust){
							var pb = mouse_click_parameters[usermouse.got_i];
							if(alt == 1){
								static_mod_adjust(pb,0);
								redraw_flag.flag=2;
							}else if(usermouse.ctrl == 1){
								if(usermouse.shift == 1){
									set_sidebar_mode("panel_assign");
								}else{
									set_sidebar_mode("flock");
								}
							}else if(mouse_click_values[usermouse.got_i]!=""){//CHECK IF ITS A MENU ONE, JUMP TO NEXT VALUE
								var pnumber = mouse_click_values[usermouse.last.got_i] - 1;
								var p_values= blocktypes.get(paramslider_details[pnumber][15]+"::parameters["+paramslider_details[pnumber][9]+"]::values");
								var pv = static_mod_adjust(pb,"get");
								if(p_values.length>0) pv = (pv + 1.01/p_values.length) % 1;
								static_mod_adjust(pb,pv);
								redraw_flag.flag=2;
							} 
						}
					}
				}
				usermouse.clicked2d = -1;
			}else if(usermouse.clicked3d != -1){ //####################### 3d release #####################
				if(displaymode=="block_menu"){
					if(block_menu_d.mode == 0){ //post("BLOCK MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.clicked3d==-2){
							usermouse.clicked3d=-3;
						}
						if(usermouse.ids[0]=="block_menu_background"){
							if(usermouse.clicked3d!="background_dragged") set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								set_display_mode("blocks");
								//post("menu click c3d="+usermouse.clicked3d+" ids1 = "+usermouse.ids[1]+" oid "+usermouse.oid+" hover "+usermouse.hover);
								var r = new_block(usermouse.ids[1], Math.round(blocks_page.new_block_click_pos[0]), Math.round(blocks_page.new_block_click_pos[1]));
								draw_block(r);
								selected.block[r] = 1;
								sidebar.scopes.voice = -1;
								sidebar.scopes.voicenum = -1;
								redraw_flag.flag |= 8;
							}
						}
						usermouse.clicked3d = -1;
					}else if(block_menu_d.mode == 1){ //post("SWAP MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block_menu_background"){
							set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								swap_block(usermouse.ids[1]);
								set_display_mode("blocks");
							}
						}
					}else if(block_menu_d.mode == 2){ //post("insert MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block_menu_background"){
							set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								var f_no= connections.get("connections["+block_menu_d.connection_number+"]::from::number");
								var t_no = connections.get("connections["+block_menu_d.connection_number+"]::to::number");
								var avx = 0.25*Math.round(2*(blocks.get("blocks["+f_no+"]::space::x") + blocks.get("blocks["+t_no+"]::space::x")));
								var avy = 0.25*Math.round(2*(blocks.get("blocks["+f_no+"]::space::y") + blocks.get("blocks["+t_no+"]::space::y")));
								var r = new_block(usermouse.ids[1], avx,avy);
								
								draw_block(r);
								//set_display_mode("blocks");
								insert_block_in_connection(usermouse.ids[1],r);							
							}
						}
					}else if(block_menu_d.mode == 3){ //post("SUBSTITUTION MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block_menu_background"){
							//set_display_mode("blocks");
							post("sorry no, you have to pick a substitute");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								post("substitution found!!"+usermouse.ids[1]);
								block_menu_d.swap_block_target = usermouse.ids[1];
								set_display_mode("blocks");
								import_song();
								//swap_block(usermouse.ids[1]);
								//set_display_mode("blocks");
							}
						}
					}
				}else if((displaymode == "blocks")||(displaymode == "flocks")){
					if(usermouse.ids[0] == "background"){
						if(usermouse.drag.distance<20){
							if(usermouse.ctrl){
								center_view(1);
							}else if((selected.block.indexOf(1)>-1) || (selected.wire.indexOf(1)>-1)){ //either clear selection or bring up new block menu
								clear_blocks_selection();
								//redraw_flag.flag=8;
							}else{
								blocks_page.new_block_click_pos = connections_sketch.screentoworld(usermouse.x,usermouse.y);
								usermouse.clicked3d=-1;
								block_menu_d.mode = 0;
								//post("\n\nOPENING BLOCK MENU BECAUSE DRAG DIST",usermouse.drag.distance);
								set_display_mode("block_menu");
							}
							redraw_flag.targets = [];
							redraw_flag.targetcount = 0;
						}else{
							//it was just a drag, don't do anything else	
							if(selection_cube.enable == 1){
								process_drag_selection();
								selection_cube.enable = 0;
								//block_and_wire_colours();
								redraw_flag.flag |= 12; //4
							}else{
							//	deferred_diag[deferred_diag.length] = "it was just a drag, don't do anything else";
							}
							//set clicked3d to -3? then the picker event has to trigger a whole thing?
						}
					}
					usermouse.drag.starting_x = 0;
					usermouse.drag.starting_y = 0;
					if((usermouse.ids[0] != "background")&&(displaymode=="blocks")){
						if (usermouse.ids[0] == "block" || usermouse.ids[0] == "meter"){
							// var tcol=blocks_cube[usermouse.ids[1]][0].color;
							//var displaypos = [0.25*Math.round(4*blocks_cube[usermouse.ids[1]][0].position[0]) , 0.25*Math.round(4*blocks_cube[usermouse.ids[1]][0].position[1])];
							var displaypos = [blocks_cube[usermouse.ids[1]][0].position[0] , blocks_cube[usermouse.ids[1]][0].position[1]];
							var dictpos = [ blocks.get("blocks["+usermouse.ids[1]+"]::space::x"), blocks.get("blocks["+usermouse.ids[1]+"]::space::y")];
							if((usermouse.hover[1] != usermouse.ids[1]) && (usermouse.hover[0] != "background")){
								//############# CONNECT BLOCKS ########################## based on hover and ids which are set in picker not this fn
							//	deferred_diag[deferred_diag.length] = "i think you dropped block "+usermouse.ids[1]+" on "+usermouse.hover[1];
								if(usermouse.hover[1]==-1){
									post("\nERROR hover was -1\n");
								}else{
									post("new connection, drag dist was",usermouse.drag.distance,"ids",usermouse.ids[0],usermouse.ids[1],usermouse.ids[2],"hover",usermouse.hover[0],usermouse.hover[1],usermouse.hover[2]);
									build_new_connection_menu(usermouse.ids[1],usermouse.hover[1],usermouse.ids[2]-1,usermouse.hover[2]-1);
									usermouse.clicked3d=-1;
									set_display_mode("connection_menu");
								}
							}else{ // ############## END OF DRAG MOVE BLOCKS ################
								// MOVE BLOCK: - stores the dragged pos in the dict
								if((displaypos[0] != dictpos[0]) || (displaypos[1] != dictpos[1])){
									ob=-1;
									for(t = 0; t<usermouse.drag.dragging.voices.length; t++){
										if(usermouse.drag.dragging.voices[t][0]!=ob){
											ob=usermouse.drag.dragging.voices[t][0];
											blocks.replace("blocks["+ob+"]::space::x",blocks_cube[ob][0].position[0]);
											blocks.replace("blocks["+ob+"]::space::y",blocks_cube[ob][0].position[1]);
										}
									}
									redraw_flag.flag=4;//need to redraw it (for connections only? unless you've messed anything up....)
								}
								for(t = 0; t<usermouse.drag.dragging.voices.length; t++){//resets the dragged blocks Z pos
									blocks_cube[usermouse.drag.dragging.voices[t][0]][usermouse.drag.dragging.voices[t][1]].position[2] = 0;
								}
								usermouse.clicked3d = -1;
							}
							if((usermouse.hover[1] == usermouse.ids[1]) && (0.25*Math.round(4*displaypos[0]) == 0.25*Math.round(4*dictpos[0])) && (0.25*Math.round(4*displaypos[1]) == 0.25*Math.round(4*dictpos[1]))){
								if((usermouse.drag.distance>SELF_CONNECT_THRESHOLD)){ // ###################### CONNECT TO SELF
									post("you connected it to itself, dist: " + usermouse.drag.distance +" ids "+ usermouse.ids[1] + " hover "+usermouse.hover[1]);
									build_new_connection_menu(usermouse.ids[1], usermouse.hover[1],usermouse.ids[2]-1,usermouse.hover[2]-1);
									set_display_mode("connection_menu");
								}else{ // ################### A BUNCH OF MUNDANE TOGGLING SELECtiON - you released on a thing, no drag:
									mouse_released_on_a_thing_no_drag();
									usermouse.ids=['done',-1,-1];
								}
							}
						}else if(usermouse.ids[0]=='wires'){
							//	post("you clicked this wire2 \n");
							if(usermouse.ctrl){//mute toggle
								var mu = connections.get("connections["+usermouse.ids[1]+"]::conversion::mute");
								connection_edit("connections["+usermouse.ids[1]+"]::conversion::mute",!mu);
							}else if(usermouse.shift == 0){
								var ti;
								var afters=1 - selected.wire[usermouse.ids[1]];
								for(ti=0;ti<selected.wire.length;ti++){
									if(selected.wire[ti]){
										selected.wire[ti]=0;
									}
								}
								for(ti=0;ti<selected.block.length;ti++){
									selected.block[ti]=0;
								}
								selected.wire[usermouse.ids[1]]=afters;
								if(afters==1) sidebar.lastmode=-1; //force reassign scopes
								redraw_flag.flag=10;
							}else{
								selected.wire[usermouse.ids[1]]=1 - selected.wire[usermouse.ids[1]];
								redraw_flag.flag=10;
							}
						}
						usermouse.ids[0]="done";
					}
				}
			}
			usermouse.drag.distance = 0;
		}

	// ############## button status hasn't changed so ###############################################
	}else if(leftbutton){ // DRAGGING
		if(usermouse.drag.starting_x == -1){ //background/menubackground drag prep, flagged from picker
			usermouse.drag.starting_x = usermouse.x;
			usermouse.drag.starting_y = usermouse.y;
			usermouse.drag.distance = 0;
			usermouse.drag.starting_value_x = camera_position[0];
			if(usermouse.ctrl){//set up zoom
				usermouse.drag.starting_value_y = camera_position[2];
			}else if(usermouse.shift){//set up select rectangle
				post("\nselection rectangle (TODO!)");
			}else{//set up normal background drag
				usermouse.drag.starting_value_x = camera_position[0];
				if(usermouse.clicked3d =="background") {
					usermouse.drag.starting_value_y = camera_position[1];
				}else{
					usermouse.drag.starting_value_y = menu_camera_scroll;
				}
			}
		}else{
			var xdist=usermouse.x-usermouse.drag.starting_x;
			var ydist=usermouse.drag.starting_y-usermouse.y;
			usermouse.drag.distance += Math.abs(xdist) + Math.abs(ydist);			
			if((usermouse.clicked2d != -1) && (usermouse.last.got_t>=2 && usermouse.last.got_t<=4)){ 
// #### 2D DRAG ###########################################################################################################
				var f = mouse_click_actions[usermouse.last.got_i];
				var p = mouse_click_parameters[usermouse.last.got_i];
				var v = mouse_click_values[usermouse.last.got_i];
				if(f!="none"){
					xdist/=(mainwindow_width*0.25);
					ydist/=(mainwindow_height*0.3);
					if((usermouse.shift!=usermouse.last.shift)||(usermouse.alt!=usermouse.last.alt)){
						usermouse.drag.starting_x = usermouse.x;
						usermouse.drag.starting_y = usermouse.y;
						usermouse.drag.last_x = usermouse.x;
						usermouse.drag.last_y = usermouse.y;
						xdist = 0;
						ydist = 0;
						usermouse.drag.starting_value_x = f(p,"get");
						if(/* (v>1)|| */(usermouse.got_t==4)){ //v is 
							usermouse.drag.starting_value_y = f(v,"get");
						}else{
							usermouse.drag.starting_value_y = -1;
						}							
					}
					if(usermouse.shift){
						xdist*=0.1;
						ydist*=0.1;
						if(usermouse.alt){
							xdist*=0.1;
							ydist*=0.1;
						}
					}
					if(usermouse.drag.starting_value_y==-1){
						xdist += ydist;
					}else{
						f(v,usermouse.drag.starting_value_y+ydist);
					}
					f(p,usermouse.drag.starting_value_x+xdist);					
				}
			}else if((usermouse.clicked3d != -1) && (usermouse.clicked3d != -2)){ //############################## 3D DRAG
				//	post("3d drag, hover",usermouse.hover,"ids",usermouse.ids,"\n");
				if(displaymode == "blocks"){
					if(usermouse.left_button==1){
						if(usermouse.drag.starting_x>0){
							var xdist=usermouse.x-usermouse.drag.starting_x;
							var ydist=usermouse.drag.starting_y-usermouse.y;
							usermouse.drag.distance += Math.abs(usermouse.x - usermouse.drag.last_x) + Math.abs(usermouse.y - usermouse.drag.last_y);
							if(usermouse.ids[0] == "background"){
								if(usermouse.ctrl){
									//zoom in or out on drag
									//xdist = usermouse.x - usermouse.last_x;
									camera_position[2] = usermouse.drag.starting_value_y + ydist*0.1;
									messnamed("camera_control", "rotatexyz" , 0, 0, 0);
									messnamed("camera_control","position",  camera_position);
									messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
								}else if(usermouse.shift){
									var sts = connections_sketch.screentoworld(usermouse.drag.starting_x,usermouse.drag.starting_y);
									var stw = connections_sketch.screentoworld(usermouse.x,usermouse.y);
									selection_cube.scale = [0.5*Math.abs(sts[0]-stw[0]), 0.5*Math.abs(sts[1]-stw[1]), 1];
									selection_cube.position = [0.5*(sts[0]+stw[0]), 0.5*(sts[1]+stw[1]), -1];
									selection_cube.enable = 1;
								
									//selection rectangle
								}else{
									camera_position[0] = usermouse.drag.starting_value_x - xdist*0.001*camera_position[2];
									camera_position[1] = usermouse.drag.starting_value_y - ydist*0.001*camera_position[2];
									messnamed("camera_control", "rotatexyz" , 0, 0, 0);
									messnamed("camera_control","position",  camera_position);
									messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
								}
							}else if(usermouse.ids[0] == "block"){
								var oldpos = blocks_cube[usermouse.ids[1]][0].position;
								var t = 0;
								var stw = connections_sketch.screentoworld(usermouse.x,usermouse.y);
								var block_x = 0.25*Math.round(stw[0]*4); 
								var block_y = 0.25*Math.round(stw[1]*4);
								var dictpos = [ blocks.get("blocks["+usermouse.ids[1]+"]::space::x"), blocks.get("blocks["+usermouse.ids[1]+"]::space::y")];
								if((usermouse.hover=="background") || (((block_x!=dictpos[0])||(block_y!=dictpos[1])||(usermouse.drag.distance<=SELF_CONNECT_THRESHOLD))&&(((usermouse.hover[1]==usermouse.ids[1])&&((usermouse.hover[0]=="block")||(usermouse.hover[0]=="meter")))||(usermouse.hover[0]=="wires")||(usermouse.hover=="background")))){
								//if((usermouse.hover=="background") || (((block_x!=dictpos[0])||(block_y!=dictpos[1])||(usermouse.drag.distance<=SELF_CONNECT_THRESHOLD))&&(usermouse.hover[1]==usermouse.ids[1])&&((usermouse.hover[0]=="block")||(usermouse.hover[0]=="meter")))){
									if(blocks_page.possible_connection>=0){
										blocks_cube[blocks_page.possible_connection][0].color = blocks_page.saved_color;
										blocks_page.possible_connection = -1;
									}										
									if((block_x!=oldpos[0])||(block_y!=oldpos[1])){
										var dx = Math.abs(block_x-usermouse.drag.starting_value_x);
										var dy = Math.abs(block_y-usermouse.drag.starting_value_y);
										if((dx>=0.75)||(dy>=0.75)){
											usermouse.drag.starting_value_x = -999; // this is the start of dragging a block. resetting these means it
											usermouse.drag.starting_value_y = -999; // always passes the dx/dy test.
											var tv = new Array(3);
											var nometers = NO_IO_PER_BLOCK; //for eg hardware you actually need to get the name, look up in blocktypes how many io.
											var b_t,ob=-1;
											var bdx,bdy;
											for(t = 0; t<usermouse.drag.dragging.voices.length; t++){
												//post("dragin",usermouse.drag.dragging.voices[t][0],usermouse.drag.dragging.voices[t][1]);
												if(ob!=usermouse.drag.dragging.voices[t][0]){
													ob = usermouse.drag.dragging.voices[t][0];	
													b_t = blocks.get("blocks["+usermouse.drag.dragging.voices[t][0]+"]::type");
													nometers = 0; //note blocks have no meters
													if(b_t == "audio"){
														nometers = NO_IO_PER_BLOCK;
													}else if(b_t == "hardware"){
														b_t = blocks.get("blocks["+usermouse.ids[1]+"]::name");
														nometers = 0;
														if(blocktypes.contains(b_t+"::connections::in::hardware_channels")) nometers += blocktypes.getsize(b_t+"::connections::in::hardware_channels");
														if(blocktypes.contains(b_t+"::connections::out::hardware_channels")) nometers += blocktypes.getsize(b_t+"::connections::out::hardware_channels");
														if(blocktypes.contains(b_t+"::max_polyphony")) nometers /= blocktypes.get(b_t+"::max_polyphony");
													}
													bdx = blocks.get("blocks["+ob+"]::space::x") + block_x - dictpos[0];
													bdy = blocks.get("blocks["+ob+"]::space::y") + block_y - dictpos[1];
												}
												blocks_cube[usermouse.drag.dragging.voices[t][0]][usermouse.drag.dragging.voices[t][1]].position = [ bdx + 0.25 * (usermouse.drag.dragging.voices[t][1]>0)+ 0.5*usermouse.drag.dragging.voices[t][1], bdy, -0.25];//-usermouse.drag.dragging.voices[t][1]-0.2];
												if(usermouse.drag.dragging.voices[t][1]>0){
													for(tt=0;tt<nometers;tt++){ 
														if(typeof blocks_meter[usermouse.drag.dragging.voices[t][0]][(usermouse.drag.dragging.voices[t][1]-1)*nometers+tt] !== 'undefined'){
															tv = blocks_meter[usermouse.drag.dragging.voices[t][0]][(usermouse.drag.dragging.voices[t][1]-1)*nometers+tt].position;
															tv[0] = blocks_cube[usermouse.drag.dragging.voices[t][0]][usermouse.drag.dragging.voices[t][1]].position[0] + 0.4 * tt/nometers;//block_x+0.5;
															tv[2] = 0.2;
															blocks_meter[usermouse.drag.dragging.voices[t][0]][(usermouse.drag.dragging.voices[t][1]-1)*nometers+tt].position = tv;
														}
													}
												}
											}
											for(tt=0;tt<usermouse.drag.dragging.connections.length;tt++){
												draw_wire(usermouse.drag.dragging.connections[tt]);
											}
										}
									}
								}else if(((usermouse.hover[0]=="block")||(usermouse.hover[0]=="meter"))&&(selected.block_count<=1)){
									//post("\n\nhovering over:",usermouse.hover[0],usermouse.hover[1],usermouse.hover[2]);
								
								// ############## INDICATE POSSIBLE CONNECTION (currently by turning it white)	
									//only need to do this once, when the state changes
								//post("this'll help if that error happens",usermouse.hover,usermouse.ids,"\n");
									if((blocks_cube[usermouse.hover[1]][0].color[0] == 1)&&(blocks_cube[usermouse.hover[1]][0].color[1] == 1)&&(blocks_cube[usermouse.hover[1]][0].color[2] == 1)&&(blocks_cube[usermouse.hover[1]][0].color[3] == 0.9)){
									//	post("yes already");
									}else{
										if(usermouse.hover[1]!=usermouse.ids[1]){
											blocks_page.possible_connection = usermouse.hover[1];
											blocks_page.saved_color = blocks_cube[usermouse.hover[1]][0].color;
											blocks_cube[usermouse.hover[1]][0].color = [1, 1, 0.9, 1];
											for(t = 0; t<usermouse.drag.dragging.voices.length; t++){
												blocks_cube[usermouse.drag.dragging.voices[t][0]][usermouse.drag.dragging.voices[t][1]].position = [ blocks.get("blocks["+usermouse.drag.dragging.voices[t][0]+"]::space::x") + 0.001, blocks.get("blocks["+usermouse.drag.dragging.voices[t][0]+"]::space::y")-0.001, -usermouse.drag.dragging.voices[t][1]];
											}
											if((oldpos[0] != blocks_cube[usermouse.ids[1]][0].position[0])||(oldpos[1] != blocks_cube[usermouse.ids[1]][0].position[1])||(oldpos[2] != blocks_cube[usermouse.ids[1]][0].position[2])){
												for(tt=0;tt<usermouse.drag.dragging.connections.length;tt++){
													draw_wire(usermouse.drag.dragging.connections[tt]);
												}
											}
										}else{
											blocks_page.possible_connection = usermouse.hover[1];
											blocks_page.saved_color = blocks_cube[usermouse.hover[1]][0].color;
											blocks_cube[usermouse.hover[1]][0].color = [1, 1, 0.9, 1];
											for(t = 0; t<usermouse.drag.dragging.voices.length; t++){
												blocks_cube[usermouse.drag.dragging.voices[t][0]][usermouse.drag.dragging.voices[t][1]].position = [ blocks.get("blocks["+usermouse.drag.dragging.voices[t][0]+"]::space::x") + 0.001, blocks.get("blocks["+usermouse.drag.dragging.voices[t][0]+"]::space::y")-0.001, -usermouse.drag.dragging.voices[t][1]];
											}
											if((oldpos[0] != blocks_cube[usermouse.ids[1]][0].position[0])||(oldpos[1] != blocks_cube[usermouse.ids[1]][0].position[1])||(oldpos[2] != blocks_cube[usermouse.ids[1]][0].position[2])){
												for(tt=0;tt<usermouse.drag.dragging.connections.length;tt++){
													draw_wire(usermouse.drag.dragging.connections[tt]);
												}
											}
										}
									}
								}
							}	
							usermouse.drag.last_x = usermouse.x;
							usermouse.drag.last_y = usermouse.y;
						}
					}		
				}else if(displaymode=="block_menu"){
					if(usermouse.left_button==1){
						if(usermouse.drag.starting_x>0){
							//var xdist=x-usermouse.drag.starting_x;
							//var ydist=usermouse.drag.starting_y-y;
							usermouse.drag.distance += Math.abs(x - usermouse.drag.last_x) + Math.abs(y - usermouse.drag.last_y);
							usermouse.drag.last_x = x;
							usermouse.drag.last_y = y;
							if((usermouse.clicked3d == "background")||(usermouse.clicked3d == "background_dragged")){
								usermouse.clicked3d = "background_dragged";
								menu_camera_scroll = usermouse.drag.starting_value_y + ydist*0.04;
								messnamed("camera_control","position", 2 , -93, menu_camera_scroll);	
							}					
						}
					}
				}		
			}
		}
	}
}

function mouse_released_on_a_thing_no_drag(){
	if(usermouse.ids[0]=='block' || usermouse.ids[0]=='label' || usermouse.ids[0]=='meter'){
		//										deferred_diag[deferred_diag.length] = "you clicked this block "+usermouse.ids[1];
		if(usermouse.timer>0){
			if(blocks.get("blocks["+usermouse.ids[1]+"]::type")!="hardware"){
				if(blocktypes.get(blocks.get("blocks["+usermouse.ids[1]+"]::name")+"::block_ui_patcher")!="blank.ui"){
					set_display_mode("custom",+usermouse.ids[1]);
					if(selected.block[+usermouse.ids[1]]!=1) select_block(0,+usermouse.ids[1]);
					return(0);
				}else if(blocktypes.contains(blocks.get("blocks["+usermouse.ids[1]+"]::name")+"::plugin_name")){
					post("/n/n show vst editor"); //vst edit
					show_vst_editor(usermouse.ids[1],usermouse.ids[1]);
					if(selected.block[+usermouse.ids[1]]!=1) select_block(0,+usermouse.ids[1]);
					return(0);					
				}else{
					post("ignored double click",usermouse.ids[1],blocks.get("blocks["+usermouse.ids[1]+"]::name"));
				}
			}
		}
		if(usermouse.ctrl){
			if(selected.block[usermouse.ids[1]]){
				mute_selected_block(-1);
			}else{
				mute_particular_block(usermouse.ids[1],-1);											
			}
		}else if(usermouse.shift == 0){
			var ti=0;
			var afters=1;
			if(selected.block[usermouse.ids[1]] && (+usermouse.ids[2]-1 == sidebar.scopes.voicenum)) afters = 0;
			for(ti=0;ti<selected.wire.length;ti++){
				selected.wire[ti]=0;
			}
			for(ti=0;ti<selected.block.length;ti++){
				selected.block[ti]=0;
			}
			selected.block[usermouse.ids[1]]=afters;	
			selected.block_count=afters;
			selected.wire_count=0;
			usermouse.timer = DOUBLE_CLICK_TIME;
			if(afters) sidebar.scopes.voicenum = +usermouse.ids[2]-1;
			if(sidebar.mode=="edit_label") set_sidebar_mode("block");
		}else{
			selected.block[usermouse.ids[1]]=1-selected.block[usermouse.ids[1]];
		}
		if(selected.block.indexOf(1)==-1) { // nothing is selected
			sidebar.scopes.voice = -1;
			redraw_flag.targets = [];
			redraw_flag.targetcount = 0;
		}
		redraw_flag.flag=10;
	}else {
		post("unrecognised thing clicked on ",usermouse.ids,"\n");
	}
}


function mousewheel(x,y,leftbutton,ctrl,shift,caps,alt,e,f, scroll){
	usermouse.shift = shift;
	usermouse.ctrl = ctrl;
	usermouse.alt = alt;
	usermouse.x = x;
	usermouse.y = y;

	var tcell = click_i[x+(y<<click_b_w)];
	b=tcell & 4095;
	c=0;
	d=tcell >> 12;

	if((displaymode=="blocks")||(displaymode=="block_menu")){
		var id = glpicker.touch(x,y);
		picker_hover_and_special(id);
	}	
//	post("\nbcd",b,c,d,mouse_index);
	if((b==0)&&(c==0)&&(d==0)){ //nothing to see here, zoom the 3d camera instead
		if(displaymode=="blocks"){
			var xx = (2 * x / mainwindow_width) - 1;
			var yy = (2 * y / mainwindow_height) - 1;
			
			camera_position[2] = camera_position[2]-2*scroll;
			if(camera_position[2]<0.1)camera_position[2]+=2*scroll;
			camera_position[0] += xx*scroll*0.5;
			camera_position[1] -= yy*scroll*0.5;
			messnamed("camera_control","position",  camera_position);
			messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
		}else if(displaymode=="block_menu"){
			menu_camera_scroll = menu_camera_scroll-scroll;
			messnamed("camera_control","position", 2 , -93, menu_camera_scroll);
		}else if(displaymode=="connection_menu"){
			if(x<mainwindow_width/2){
				connection_menu.replace("from::viewoffset",Math.max(0,connection_menu.get("from::viewoffset")+2*(scroll<0)-1));
				redraw_flag.flag=4;
			}else{
				connection_menu.replace("to::viewoffset",Math.max(0,connection_menu.get("to::viewoffset")+2*(scroll<0)-1));
				redraw_flag.flag=4;
			}
		}
	}else if((d>=2) && (d<=4)){
		var f = mouse_click_actions[b];
		var p = mouse_click_parameters[b];
		var v = mouse_click_values[b];
		if(d==4){
			if(ctrl){
				p=v;
			}
		}
		var tv = f(p, "get");
		if(shift){
			if(alt){
				tv += scroll * 0.001;
			}else{
				tv += scroll * 0.01;
			}
		}else{
			tv += scroll *0.1;
		}
		f(p,tv);
	}else if(d==7){
		var f = mouse_click_actions[b];
		var p = mouse_click_parameters[b];
		var v = mouse_click_values[b];
		f(p,scroll);
	}else if(displaymode=="connection_menu"){
		if(x<mainwindow_width/3){
			connection_menu.replace("from::viewoffset",Math.max(0,connection_menu.get("from::viewoffset")+2*(scroll<0)-1));
			redraw_flag.flag=4;
		}else{
			connection_menu.replace("to::viewoffset",Math.max(0,connection_menu.get("to::viewoffset")+2*(scroll<0)-1));
			redraw_flag.flag=4;
		}
	}
}


function keydown(key){
	// GLOBAL KEYS ##############################################################################
	if(key == -27){//f11 fullscreen
		fullscreen = 1 - fullscreen;
		outlet(6,"fullscreen",fullscreen);
		return;
	}else if(key == 47){
		deferred_diagnostics();
	}else if(key == 96){
		messnamed("panic","bang");
	}else if(key == -3){//escape
		//center_view();
		if(displaymode=="panels"){
			if(sidebar.mode=="none"){
				set_display_mode("blocks");
			}else{
				clear_blocks_selection();
			}
		}else if((displaymode=="waves")&&(waves.selected!=-1)){
			waves.selected=-1;
			redraw_flag.flag |= 4;
		}else{
			set_display_mode("blocks");
			if((sidebar.mode=="flock")||(sidebar.mode=="panel_assign")){
				set_sidebar_mode("block");
			}else if(sidebar.mode!="none"){
				clear_blocks_selection();
				if(sidebar.mode == "file_menu") set_sidebar_mode("none");
			}else{
				center_view(1);
				//redraw_flag.flag |= 4;//draw_blocks();
			}
		}
	}else if(key == -2){
		play_button();
	}else if(key == -23){
		set_display_mode("waves");
	}else if(key == -494){
		set_display_mode("flocks");
	}else if(key == -17){
		set_display_mode("panels");
	}else if(key == -18){
		set_sidebar_mode("block");
		redraw_flag.flag = 2;		
		set_display_mode("blocks");
	}else if(key == -20){
		set_sidebar_mode("settings");
		redraw_flag.flag = 2;
		//if(displaymode!="panels") set_display_mode("blocks");
	}else if(key == -22){
		set_sidebar_mode("connections");
		redraw_flag.flag = 2;
		set_display_mode("blocks");
	}else if(key == -24){
		set_sidebar_mode("file_menu");
		redraw_flag.flag = 2;
		set_display_mode("blocks");
	}
	// MODAL OVERIDES - IE EDIT LABEL MODE IN THE SIDEBAR TAKES OVER THE WHOLE KEYBOARD
	if((sidebar.mode == "edit_label")||(sidebar.mode == "edit_state")){
		//post("edit keys",key);
		if((key==-6)||(key==-7)){
			//delete
			text_being_editted = text_being_editted.slice(0,-1);
		}else if(key==-2){
			key=46;
		}else if(key==-4){
			edit_label("ok",0);
			return(0);
		}else if(key==-3){
			set_sidebar_mode("block");
			return(0);
		}else{
			var caps=0;
			if(key>512) {
				caps=1;
				key-=512;
				key-=32;
			}
			if((key>45)&&(key<123)){
				text_being_editted = text_being_editted + String.fromCharCode(key);
			}
			//post(String.fromCharCode(key));
		}
		redraw_flag.flag |= 2;
	}else{
		if(displaymode=="custom_fullscreen"){
			post("fs keys",key);
			if(key == -19) {
				set_display_mode("custom",selected.block.indexOf(1));
			}else if(key==-3){
				set_display_mode("blocks");
			}else{
				ui_poly.setvalue( custom_block+1, "keydown", key);
			}
		}else if(displaymode=="custom"){
			if(key == -19) {
				set_display_mode("custom_fullscreen",selected.block.indexOf(1));
			}else if(key==-3){
				set_display_mode("blocks");
			}else{
				ui_poly.setvalue( custom_block+1, "keydown", key);
			}
		}else if(displaymode=="waves"){

		}else if(displaymode=="panels"){
			if(key == 45){
				if((sidebar.mode == "block")||(sidebar.mode == "settings")){
					var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
					if((current_p>1)&&(blocks.get("blocks["+sidebar.selected+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+sidebar.selected+"]::name")+"::plugin_name")))){
						voicecount(sidebar.selected, current_p - 1);
					}				
				}
			}else if((key == 43)||(key==573)){
				if((sidebar.mode == "block")||(sidebar.mode == "settings")){
					var max_p = blocktypes.get(blocks.get("blocks["+sidebar.selected+"]::name")+"::max_polyphony");
					if(max_p ==0) max_p=9999999999999;
					var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
					if((max_p > current_p)&&(blocks.get("blocks["+sidebar.selected+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+sidebar.selected+"]::name")+"::plugin_name")))){
						voicecount(sidebar.selected, current_p + 1);
					}
				}
			}else if(key == 353){
				select_all();
			}else if(key == -5){
				set_display_mode("blocks");
			}
		}else if(displaymode=="blocks"){
			if(key == -19){
				if(selected.block.indexOf(1)!=-1){
					set_display_mode("custom",selected.block.indexOf(1));
				}
			}else if(key == -15){//home
				center_view(1);
			}else if((key == -6) || (key==-7)){
				//delete, if any block or connection is selected
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
			}else if(key == 45){
				if((sidebar.mode == "block")||(sidebar.mode == "settings")){
					var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
					if((current_p>1)&&(blocks.get("blocks["+sidebar.selected+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+sidebar.selected+"]::name")+"::plugin_name")))){
						voicecount(sidebar.selected, current_p - 1);
					}
				}else if(sidebar.mode == "blocks"){
					multiselect_polychange(-1);
				}
			}else if((key == 43)||(key==573)){
				if((sidebar.mode == "block")||(sidebar.mode == "settings")){
					var max_p = blocktypes.get(blocks.get("blocks["+sidebar.selected+"]::name")+"::max_polyphony");
					if(max_p ==0) max_p=9999999999999;
					var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
					if((max_p > current_p)&&(blocks.get("blocks["+sidebar.selected+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+sidebar.selected+"]::name")+"::plugin_name")))){
						voicecount(sidebar.selected, current_p + 1);
					}
				}else if(sidebar.mode == "blocks"){
					multiselect_polychange(1);
				}
			}else if(key == 353){
				select_all();
			}else if(key == -5){
				set_display_mode("panels");
			}else if(key == -9){
				move_selected_blocks(0,0.5);
			}else if(key == -10){
				move_selected_blocks(0,-0.5);
			}else if(key == -11){
				move_selected_blocks(-0.5,0);
			}else if(key == -12){
				move_selected_blocks(0.5,0);
			}else if(key == 503){
				move_selected_blocks(0,0.25);
			}else if(key == 502){
				move_selected_blocks(0,-0.25);
			}else if(key == 501){
				move_selected_blocks(-0.25,0);
			}else if(key == 500){
				move_selected_blocks(0.25,0);
			}
		}else if(displaymode == "flocks"){
			if(key == 45){
				if((sidebar.mode == "block")||(sidebar.mode == "settings")){
					var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
					if((current_p>1)&&(blocks.get("blocks["+sidebar.selected+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+sidebar.selected+"]::name")+"::plugin_name"))))	voicecount(sidebar.selected, current_p - 1);				
				}
			}else if((key == 43)||(key==573)){
				if((sidebar.mode == "block")||(sidebar.mode == "settings")){
					var max_p = blocktypes.get(blocks.get("blocks["+sidebar.selected+"]::name")+"::max_polyphony");
					if(max_p ==0) max_p=9999999999999;
					var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
					if((max_p > current_p)&&(blocks.get("blocks["+sidebar.selected+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+sidebar.selected+"]::name")+"::plugin_name")))){
						voicecount(sidebar.selected, current_p + 1);
					}
				}
			}		
		}else if(displaymode=="block_menu"){
			if(key==-3) {
				center_view();
			}
		}else if(displaymode=="connection_menu"){
			if(key==-4){
				create_connection_button();
			}
		}		
	}

}

function keyup(key){
	
}