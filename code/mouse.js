function clicked_block_preparation() {
	if ((selected.block_count > 1) && (selected.block[usermouse.ids[1]] != 0)) {
		// if the clicked block is selected and multiple blocks are selected, then you drag them all
		var t = 0;
		usermouse.drag.dragging.voices = [];
		for (var b = 0; b < MAX_BLOCKS; b++) {
			if (selected.block[b]) {
				var tvc = blocks.get("blocks[" + b + "]::poly::voices")*Math.max(1,blocks.get("blocks[" + b + "]::subvoices"));
				for (var i = 0; i <= tvc; i++) {
					usermouse.drag.dragging.voices[t] = [b, i];
					t++;
				}
			}
		}
		//for (var i = 0; i < t; i++)	post("\nmultidrag", usermouse.drag.dragging.voices[i][0], usermouse.drag.dragging.voices[i][1]);
	} else {
		// if the clicked block is not selected, or is the only one selected, then you drag it				
		var tvc = blocks.get("blocks[" + usermouse.ids[1] + "]::poly::voices")*Math.max(1,blocks.get("blocks[" + usermouse.ids[1] + "]::subvoices"));
		usermouse.drag.dragging.voices = [];
		for (var i = 0; i <= tvc; i++) {
			usermouse.drag.dragging.voices[i] = [usermouse.ids[1], i];
		}
	}
	usermouse.drag.starting_value_x = blocks_cube[usermouse.clicked3d][0].position[0];
	usermouse.drag.starting_value_y = blocks_cube[usermouse.clicked3d][0].position[1];
	var nc = 0, found;
	usermouse.drag.dragging.connections = [];
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
		//deferred_diag.push("hover - "+id);
		var ohov=usermouse.hover[1];
		usermouse.oid=id;
		var thov =id.split('£'); // store hover - any picker id received when not waiting for click
		
		if((thov[0]=="wires")&&(usermouse.clicked3d==-1)){  // wire bulge stuff for a bit
			if(bulgingwire!=-1){
				for(var i=0;i<wires[bulgingwire].length;i++){
					var ta = wires[bulgingwire][i].scale;
					wires[bulgingwire][i].scale = [ta[0], wire_dia,1];
				}					
			}
			bulgingwire=thov[1];
			bulgeamount=1;
			for(var i=0;i<wires[bulgingwire].length;i++){
				var ta = wires[bulgingwire][i].scale;
				ta[1] = wire_dia * (1 + bulgeamount);
				wires[bulgingwire][i].scale = [ta[0],ta[1],ta[2]];
			}
		}else if(thov[0]!="background"){
			if(thov[0]!="wires") usermouse.hover = thov.concat();
			if(bulgeamount>0){
				bulgeamount=0;
				for(var i=0;i<wires[bulgingwire].length;i++){
					var ta = wires[bulgingwire][i].scale;
					wires[bulgingwire][i].scale = [ta[0],wire_dia,1];
				}
				bulgingwire = -1;
			}
		}else{
			//usermouse.hover = thov.concat();
			if(thov[0]!="wires") usermouse.hover = thov.concat();
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
	if(!usermouse.qlb){
		usermouse.queue.push([x,y,leftbutton,ctrl,shift,caps,alt,usermouse.qcount++]);
		usermouse.qlb = leftbutton;
		//deferred_diag.push("idle    "+x+","+y+" [[  "+leftbutton+"  ]] "+usermouse.qcount);
	}/*else{
		deferred_diag.push("idle during click??????");
	}*/
}

function mouseidleout(x,y,leftbutton,ctrl,shift,caps,alt,e){

}

function omouse(x,y,leftbutton,ctrl,shift,caps,alt,e){
	//post("processing mouse event",x,y,leftbutton,ctrl,shift,caps,alt,e);
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
	//if(usermouse.caps!=caps){
		usermouse.caps = caps;
	//	redraw_flag.flag |= 2; //so the qwertymidi indicator gets drawn
	//}
	usermouse.x = x;
	usermouse.y = y;
	usermouse.sidebar_scrolling = null;

	var tcell = click_i[(x>>click_b_s)+((y>>click_b_s)<<click_b_w)];
	usermouse.got_i = tcell & 4095;
	usermouse.got_t = tcell >> 12;
	//post(usermouse.got_i,usermouse.got_t);
	if(usermouse.got_t==0){
		if((displaymode=="blocks")||(displaymode=="block_menu")){
			var id = glpicker.touch(x,y);
			picker_hover_and_special(id);
		}
	}
	//deferred_diag.push(["omouse ",x,y+"[[  "+leftbutton+"  ]]"+usermouse.got_i,usermouse.got_t]);
	if(usermouse.last.left_button!=usermouse.left_button){
		// ##################################################
		if(usermouse.left_button){	// CLICK
			if((usermouse.got_i==0) && (usermouse.got_t==0)){	//nothing on the 2d layer, open it up for 3d clicks
				if((displaymode=="blocks")||(displaymode=="block_menu")){
					usermouse.clicked3d = usermouse.hover[1];
					usermouse.drag.starting_x = usermouse.x;
					usermouse.drag.starting_y = usermouse.y;		
					usermouse.drag.last_x = usermouse.x;
					usermouse.drag.last_y = usermouse.y;
					usermouse.drag.distance=0;
					usermouse.clicked2d=-1;
					usermouse.ids = id.split('£');
					if(id=="background" || id=="block_menu_background"){
						usermouse.clicked3d = "background";
						usermouse.drag.starting_x = -1; // flag waiting for the first mouse message of a drag, because the initial click may be at wrong location with touch messages. usermouse.x;
						usermouse.drag.starting_y = -1; //usermouse.y;
						usermouse.drag.last_x = usermouse.x;
						usermouse.drag.last_y = usermouse.y;
						usermouse.ids[1]=-3;
						usermouse.hover=[-1,-1,-1];
						if(BLOCK_MENU_CLICK_ACTION=="long_click"){
							usermouse.long_press_function = show_new_block_menu;
							usermouse.timer=-1;
						}
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
				//post("\npassthrough",f.toString(),p,v);
				f(p,v);
				if((displaymode=="blocks")||(displaymode=="custom")||(displaymode=="panels")) redraw_flag.flag|=2;				
			}else{
				usermouse.clicked2d = usermouse.got_i;
				usermouse.clicked3d = -1;
				usermouse.last.got_i = usermouse.got_i;
				usermouse.last.got_t = usermouse.got_t;
				usermouse.drag.distance = 0;
				//post("\nclick",usermouse.last.got_i,usermouse.last.got_t);
				if(usermouse.got_t>=2 && usermouse.got_t<=4){
					usermouse.drag.starting_x = usermouse.x;
					usermouse.drag.starting_y = usermouse.y;
					if(usermouse.got_i>=0){
						var f = mouse_click_actions[usermouse.got_i];
						var p = mouse_click_parameters[usermouse.got_i];
						var v = mouse_click_values[usermouse.got_i];
						usermouse.drag.starting_value_x = f(p,"get");
						if((usermouse.got_t==4)){ 
							usermouse.drag.starting_value_y = f(v,"get");
						}else{
							usermouse.drag.starting_value_y = -1;
						}
					}
				}else if(usermouse.got_t==6){
					var f = mouse_click_actions[usermouse.got_i];
					f = f[0];
					var p = mouse_click_parameters[usermouse.got_i];
					var v = mouse_click_values[usermouse.got_i];
					f(p,v);
					usermouse.drag.starting_x = usermouse.x;
					usermouse.drag.starting_y = usermouse.y;
					usermouse.drag.starting_value_x = 1;
					usermouse.drag.starting_value_y = -1;
					usermouse.clicked2d = usermouse.got_i;
					usermouse.clicked3d = -1;
					usermouse.drag.distance = 0;
				}
				if((displaymode=="blocks")||(displaymode=="custom")||(displaymode=="panels")) redraw_flag.flag|=2;
			}
						

		// ##################################################
		}else{						// RELEASE
			//post("\nrelease\n2d3d is",usermouse.clicked2d,usermouse.clicked3d);
			//post("2d release",usermouse.last.got_i,usermouse.last.got_t,"was",usermouse.got_i);
			if(usermouse.got_t==7){//passthrough
				var f = mouse_click_actions[usermouse.got_i];
				var p = mouse_click_parameters[usermouse.got_i];
				var v = mouse_click_values[usermouse.got_i];
				f(p,v);
				if(usermouse.clicked2d>-1) redraw_flag.flag |= 2;
				
				if((displaymode=="blocks")||(displaymode=="custom")||(displaymode=="panels")) redraw_flag.flag|=2;
			} else if(usermouse.clicked2d != -1){
				if(usermouse.last.got_i == usermouse.got_i){
					//post("2d release",usermouse.last.got_i,usermouse.last.got_t);
					if((usermouse.last.got_t == 1)||(usermouse.last.got_t == 7)||(usermouse.last.got_t == 6)){ // it's a button (1) or passthrough(7)
						var f = mouse_click_actions[usermouse.last.got_i];
						if(usermouse.last.got_t == 6){
							usermouse.last.got_t = 1;
							f = f[1];
						}
						var p = mouse_click_parameters[usermouse.last.got_i];
						var v = mouse_click_values[usermouse.last.got_i];
						
						if(usermouse.last.got_i != danger_button){
							danger_button = -1;
						} 
						//if(Array.isArray(f)) post("f is an array",mouse_click_actions[usermouse.last.got_i][0],mouse_click_actions[usermouse.last.got_i][1]);
						//post("f is",f,"index is",usermouse.last.got_i,usermouse.last.got_t);
						//post("or",f.name);
						f(p,v);
						if((displaymode=="blocks")||(displaymode=="custom")||(displaymode=="panels")) redraw_flag.deferred|=2;
					}
					if((usermouse.last.got_t == 2) && (usermouse.drag.distance<100)){ //its a slider
						if(mouse_click_actions[usermouse.last.got_i]==sidebar_parameter_knob){
							var pb = mouse_click_parameters[usermouse.last.got_i];
							//post("params",pb);
							if(alt == 1){
								sidebar_parameter_knob(pb,param_defaults[pb[1]][pb[0]]);
								redraw_flag.flag|=2;								
							}else if(usermouse.ctrl == 1){
								if(usermouse.shift == 1){
									set_sidebar_mode("panel_assign");
								}else if(usermouse.alt == 1){
									set_sidebar_mode("flock");
								}
							}else if(mouse_click_values[usermouse.last.got_i]!=""){//CHECK IF ITS A MENU ONE, JUMP TO NEXT VALUE
								var pnumber = mouse_click_values[usermouse.last.got_i] - 1;
								var p_values= blocktypes.get(paramslider_details[pnumber][15]+"::parameters["+paramslider_details[pnumber][9]+"]::values");
								var pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*paramslider_details[pnumber][8]+paramslider_details[pnumber][9]);
								if(p_values.length>0) pv = (pv + 1.01/p_values.length) % 0.999;
								sidebar_parameter_knob(pb,pv);
								redraw_flag.flag|=2;
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
						}else if(mouse_click_actions[usermouse.got_i]==connection_edit){
							if(alt == 1){
								var p = mouse_click_parameters[usermouse.last.got_i];
								var v = mouse_click_values[usermouse.last.got_i];
								p2= p.split("::").pop();
								if(p2=="scale"){
									connection_edit(p,1);
								}else if(p2=="offset"){
									connection_edit(p,sidebar.connection.defaults.offset);
								}else if(p2=="offset2"){
									connection_edit(p,sidebar.connection.defaults.offset2);
								}else if(p2=="vector"){
									connection_edit(p,sidebar.connection.defaults.vector);
								}else{
									connection_edit(p,0);
								}

							}
						}
					}
				}else if(mouse_click_actions[usermouse.last.got_i]==whole_state_xfade){ //end of state xfade
					state_fade.lastcolour = [state_fade.colour[0], state_fade.colour[1], state_fade.colour[2]];
					state_fade.last = state_fade.selected;
					state_fade.selected = -2;
					state_fade.position = -2;
					redraw_flag.flag |= 2;									
				}else if(usermouse.last.got_t == 1) redraw_flag.flag |= 2;
				usermouse.clicked2d = -1;
			}else if(usermouse.clicked3d != -1){ //####################### 3d release #####################
				if(displaymode=="block_menu"){
					usermouse.timer = 0;
					usermouse.long_press_function = null;
					if(menu.mode == 0){ //post("BLOCK MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.clicked3d==-2){
							usermouse.clicked3d=-3;
						}
						if(usermouse.ids[0]=="block_menu_background"){
							if(usermouse.clicked3d!="background_dragged") set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								set_display_mode("blocks");
								post("menu click c3d="+usermouse.clicked3d+" ids1 = "+usermouse.ids[1]+" oid "+usermouse.oid+" hover "+usermouse.hover);
								end_of_frame_fn = function(){
									var r = new_block(usermouse.ids[1], Math.round(blocks_page.new_block_click_pos[0]), Math.round(blocks_page.new_block_click_pos[1]));
									draw_block(r);
									selected.block[r] = 1;
									sidebar.scopes.voice = -1;
									sidebar.selected_voice = -1;
									redraw_flag.flag |= 8;
								}
							}
						}
						usermouse.clicked3d = -1;
					}else if(menu.mode == 1){ //post("SWAP MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block_menu_background"){
							set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								swap_block(usermouse.ids[1]);
								set_display_mode("blocks");
							}
						}
					}else if(menu.mode == 2){ //post("insert MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block_menu_background"){
							set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								var f_no= connections.get("connections["+menu.connection_number+"]::from::number");
								var t_no = connections.get("connections["+menu.connection_number+"]::to::number");
								var avx = 0.25*Math.round(2*(blocks.get("blocks["+f_no+"]::space::x") + blocks.get("blocks["+t_no+"]::space::x")));
								var avy = 0.25*Math.round(2*(blocks.get("blocks["+f_no+"]::space::y") + blocks.get("blocks["+t_no+"]::space::y")));
								var r = new_block(usermouse.ids[1], avx,avy);
								
								draw_block(r);
								//set_display_mode("blocks");
								insert_block_in_connection(usermouse.ids[1],r);							
							}
						}
					}else if(menu.mode == 3){ //post("SUBSTITUTION MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block_menu_background"){
							//set_display_mode("blocks");
							post("sorry no, you have to pick a substitute");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								post("substitution found!!"+usermouse.ids[1]);
								menu.swap_block_target = usermouse.ids[1];
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
								if(BLOCK_MENU_CLICK_ACTION=="long_click"){
									if((usermouse.timer<-LONG_PRESS_TIME/66)&&(usermouse.long_press_function!=null)) usermouse.long_press_function();
									usermouse.timer = 0;
									usermouse.long_press_function = null;
								}
							}else{
								var showmenu =0;
								//there are options for how to bring up the menu, so we go through and see if they're true for the various modes, then decide whether to trigger the menu (1)
								if(BLOCK_MENU_CLICK_ACTION=="click"){
									showmenu = 0;
								}else if(BLOCK_MENU_CLICK_ACTION=="double_click"){
									var tp = connections_sketch.screentoworld(usermouse.x,usermouse.y);
									if(usermouse.timer>0){
										if((Math.abs(blocks_page.new_block_click_pos[0]-tp[0])+Math.abs(blocks_page.new_block_click_pos[1]-tp[1]))<400){
											showmenu = 1;
										}else{
											post("\ndouble click too wide",(Math.abs(blocks_page.new_block_click_pos[0]-tp[0])+Math.abs(blocks_page.new_block_click_pos[1]-tp[1])));
										}
									}else{
										usermouse.timer = DOUBLE_CLICK_TIME;
										blocks_page.new_block_click_pos = tp;
									}
								}else if(BLOCK_MENU_CLICK_ACTION=="ctrl_click"){
									if(usermouse.ctrl) showmenu = 1;
								}else if(BLOCK_MENU_CLICK_ACTION=="alt_click"){
									if(usermouse.alt) showmenu = 1;
								}else if(BLOCK_MENU_CLICK_ACTION=="shift_click"){
									if(usermouse.shift) showmenu = 1;
								}else if(BLOCK_MENU_CLICK_ACTION=="long_click"){
									if((usermouse.timer<-LONG_PRESS_TIME/66)&&(usermouse.long_press_function!=null)) usermouse.long_press_function();
									usermouse.timer = 0;
									usermouse.long_press_function = null;
								}
								if(showmenu){
									show_new_block_menu();
								}else{
									if(sidebar.mode!="none") set_sidebar_mode("none");
								}
							}
							redraw_flag.targets = [];
							redraw_flag.targetcount = 0;
						}else{
							//it was just a drag, don't do anything else	
							if(selection_cube.enable == 1){
								process_drag_selection();
								selection_cube.enable = 0;
								redraw_flag.flag |= 12; //4
							}
						}
					}
					if(usermouse.timer<0){ // reset background longpress
						usermouse.timer = 0;
						usermouse.long_press_function = null;
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
									//post("new connection, drag dist was",usermouse.drag.distance,"ids",usermouse.ids[0],usermouse.ids[1],usermouse.ids[2],"hover",usermouse.hover[0],usermouse.hover[1],usermouse.hover[2]);
									build_new_connection_menu(usermouse.ids[1],usermouse.hover[1],usermouse.ids[2]-1,usermouse.hover[2]-1);
									usermouse.clicked3d=-1;
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
								//meters_enable = 1;
								block_meters_enable(1);
							}
							if((usermouse.hover[1] == usermouse.ids[1]) && (Math.round(displaypos[0]) == Math.round(dictpos[0])) && (Math.round(displaypos[1]) == Math.round(dictpos[1]))){
								if((usermouse.drag.distance>SELF_CONNECT_THRESHOLD)){ // ###################### CONNECT TO SELF
									post("you connected it to itself, dist: " + usermouse.drag.distance +" ids "+ usermouse.ids[1] + " hover "+usermouse.hover[1]);
									build_new_connection_menu(usermouse.ids[1], usermouse.hover[1],usermouse.ids[2]-1,usermouse.hover[2]-1);
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
								
								if(afters==1){
									//ie if clicking a wire that wasn't selected, and shift isn't held, you clear the selection
									for(ti=0;ti<selected.wire.length;ti++){
										selected.wire[ti]=0;
									}
									selected.wire_count=0;
								}
								if(selected.wire_count>1){
									//and if lots of things are selected (and one of them was clicked) you clear selection but keep that one selected
									afters = 1;
									for(ti=0;ti<selected.wire.length;ti++){
										selected.wire[ti]=0;
									}
									selected.wire_count=1;						
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
			usermouse.long_press_function = null;
			usermouse.drag.starting_value_x = camera_position[0];
			if(usermouse.ctrl){//set up zoom
				usermouse.drag.starting_value_y = camera_position[2];
			}else if(usermouse.shift){//(set up )select rectangle)
				
			}else{//set up normal background drag
				//usermouse.drag.starting_value_x = camera_position[0];
				if(usermouse.clicked3d =="background") {
					usermouse.drag.starting_value_y = camera_position[1];
				}else{
					usermouse.drag.starting_value_y = menu.camera_scroll;
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
				if(usermouse.drag.release_on_exit && (usermouse.last.got_i != usermouse.got_i)){
					//post("\nDRAGOUT!!!!");
					usermouse.drag.release_on_exit = 0;
					usermouse.left_button = 0;
					f = "none";
				}
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
					//post("drag-f",f);
					//post("or",f.name);
					f(p,usermouse.drag.starting_value_x+xdist);					
				}
			}else if((usermouse.clicked2d != -1) && (usermouse.last.got_t==1)){
				//dragged off a button?
				if(usermouse.got_i != usermouse.clicked2d){
					usermouse.clicked2d = -1; //usermouse.got_i;
					/*if(usermouse.got_t == 1){
						usermouse.last_got_i = usermouse.got_i;
						usermouse.last_got_t = 1;
					}*/
					redraw_flag.flag |= 2;
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
									//nb the current selection function doesn't work for dynamic select
								}else{
									camera_position[0] = usermouse.drag.starting_value_x - xdist*0.001*camera_position[2];
									camera_position[1] = usermouse.drag.starting_value_y - ydist*0.001*camera_position[2];
									messnamed("camera_control", "rotatexyz" , 0, 0, 0);
									messnamed("camera_control","position",  camera_position);
									messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
								}
							}else if((usermouse.ids[0] == "block")||(usermouse.ids[0] == "meter")){
								var oldpos = blocks_cube[usermouse.ids[1]][0].position;
								var t = 0;
								var stw = connections_sketch.screentoworld(usermouse.x,usermouse.y);
								var block_x = BLOCKS_GRID[1]*Math.round(stw[0]*BLOCKS_GRID[0]); 
								var block_y = BLOCKS_GRID[1]*Math.round(stw[1]*BLOCKS_GRID[0]);
								var dictpos = [ blocks.get("blocks["+usermouse.ids[1]+"]::space::x"), blocks.get("blocks["+usermouse.ids[1]+"]::space::y")];
								if((usermouse.hover=="background") || (((Math.round(block_x)!=Math.round(dictpos[0]))||(Math.round(block_y)!=Math.round(dictpos[1]))||(usermouse.drag.distance<=SELF_CONNECT_THRESHOLD))&&(((usermouse.hover[1]==usermouse.ids[1])&&((usermouse.hover[0]=="block")||(usermouse.hover[0]=="meter")))/*||(usermouse.hover[0]=="wires")*/))){ //i think hover can't get set to wires
									remove_potential_wire();
									if((block_x!=oldpos[0])||(block_y!=oldpos[1])){
										var dx = Math.abs(block_x-usermouse.drag.starting_value_x);
										var dy = Math.abs(block_y-usermouse.drag.starting_value_y);
										if((dx>=0.75)||(dy>=0.75)){
											usermouse.drag.starting_value_x = -999; // this is the start of dragging a block. resetting these means it
											usermouse.drag.starting_value_y = -999; // always passes the dx/dy test.
											block_meters_enable(0);
											meters_updatelist.meters = [];
											meters_updatelist.hardware = [];
											meters_updatelist.midi = [];
											var ob=-1;
											var bdx,bdy;
											for(t = 0; t<usermouse.drag.dragging.voices.length; t++){
												//post("dragin",usermouse.drag.dragging.voices[t][0],usermouse.drag.dragging.voices[t][1]);
												if(ob!=usermouse.drag.dragging.voices[t][0]){
													ob = usermouse.drag.dragging.voices[t][0];	
													bdx = blocks.get("blocks["+ob+"]::space::x") + block_x - dictpos[0];
													bdy = blocks.get("blocks["+ob+"]::space::y") + block_y - dictpos[1];
												}
												var subvoices = blocks.get("blocks["+ob+"]::subvoices");
												if(subvoices<1)subvoices = 1;
												blocks_cube[usermouse.drag.dragging.voices[t][0]][usermouse.drag.dragging.voices[t][1]].position = [ bdx + (0.125*subvoices + 0.125)*(usermouse.drag.dragging.voices[t][1]>0)+ 0.5*usermouse.drag.dragging.voices[t][1]/subvoices, bdy, -0.25];//-usermouse.drag.dragging.voices[t][1]-0.2];
											}
											for(tt=0;tt<usermouse.drag.dragging.connections.length;tt++){
												draw_wire(usermouse.drag.dragging.connections[tt]);
											}
										}
									}
								}else if(((usermouse.hover[0]=="block")||(usermouse.hover[0]=="meter"))&&(selected.block_count<=1)){
									//post("\nhovering over:",usermouse.hover[0],usermouse.hover[1],usermouse.hover[2]);
									// ############## INDICATE POSSIBLE CONNECTION by drawing a 'potential' wire	
									var drawwire=1;
									if(wires_potential_connection != -1){
										if((connections.contains("connections["+wires_potential_connection+"]::to"))&&(connections.get("connections["+wires_potential_connection+"]::to::number")==usermouse.hover[1])&&(connections.get("connections["+wires_potential_connection+"]::to::voice")==usermouse.hover[2])){
											//already drawn the potential connection wirer to this block
											drawwire = 0;	
										}
									}
									if(drawwire == 1){
										potential_connection.replace("from::number",usermouse.ids[1]);
										potential_connection.replace("to::number",usermouse.hover[1]);
										potential_connection.replace("to::input::type","potential");
										potential_connection.replace("from::output::type","potential");
										var temptovoice = usermouse.hover[2];
										if(blocks.contains("blocks["+usermouse.hover[1]+"]::subvoices")){
											//post("\nadjusted for subvoices"); //more efficient to do it here than add more to wire drawing routines
											temptovoice = temptovoice / blocks.get("blocks["+usermouse.hover[1]+"]::subvoices");
										}
										potential_connection.replace("to::voice",temptovoice);
										var tempfromvoice = usermouse.ids[2];
										if(blocks.contains("blocks["+usermouse.ids[1]+"]::subvoices")){
											//post("\nadjusted for subvoices"); //more efficient to do it here than add more to wire drawing routines
											tempfromvoice = tempfromvoice / blocks.get("blocks["+usermouse.ids[1]+"]::subvoices");
										}
										potential_connection.replace("from::voice",tempfromvoice);
										if(Array.isArray(wire_ends[wires_potential_connection]))wire_ends[wires_potential_connection][3] = -99.94;
										if(wires_potential_connection==-1){
											var csize = connections.getsize("connections");
											var w=1;
											for(var i=1;i<csize;i++){ //look for an empty slot
												if(!connections.contains("connections["+i+"]::to::number")){
													//post("\nfound an empty slot,",i," to use for potential connection wire");
													connections.replace("connections["+i+"]",potential_connection);
													wires_potential_connection = i;
													w=0;
													i=csize;
												}
											}
											if(w==1){
												connections.append("connections",potential_connection);
												wires_potential_connection = connections.getsize("connections")-1;
												//post("\nappended, number is",wires_potential_connection);
											}
										}else{
											//post("\nreplaced", wires_potential_connection);
											connections.replace("connections["+wires_potential_connection+"]",potential_connection);
										}
										//post("\ndrawing wire from",usermouse.ids[1],"to",usermouse.hover[1],usermouse.hover[2]);
										//draw_wire(wires_potential_connection);
										//post("\ndrew");
									
										var drawnlist = [];
										for(var t=0;t<usermouse.drag.dragging.voices.length;t++){
											if(drawnlist.indexOf(usermouse.drag.dragging.voices[t][0])==-1){
												drawnlist.push(usermouse.drag.dragging.voices[t][0]);
												draw_block(usermouse.drag.dragging.voices[t][0]);
											}
										}
										draw_wire(wires_potential_connection);
										for(var t=0;t<usermouse.drag.dragging.connections.length;t++){
											draw_wire(usermouse.drag.dragging.connections[t]);
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
							var ydist=usermouse.drag.last_y - y;//starting_y-y;
							//usermouse.drag.distance += Math.abs(x - usermouse.drag.last_x) + Math.abs(y - usermouse.drag.last_y);
							//usermouse.drag.last_x = x;
							usermouse.drag.last_y = y;
							if((usermouse.clicked3d == "background")||(usermouse.clicked3d == "background_dragged")){
								usermouse.clicked3d = "background_dragged";
								menu.camera_scroll += ydist*0.04;
								messnamed("camera_control","position", 2 , -93, menu.camera_scroll);	
							}					
						}
					}
				}		
			}
		}
	}else{ //idlemouse
		if(usermouse.ctrl && (usermouse.x > sidebar.x)){ // if ctrl held hover over sidebar param slider selects voice
			if(usermouse.got_t == 2){
				if(mouse_click_actions[usermouse.got_i]==sidebar_parameter_knob){
					var current_p = blocks.get("blocks["+sidebar.selected+"]::poly::voices");
					if(current_p>1){
						var sl_no = mouse_click_parameters[usermouse.got_i][0];
						var x1 = paramslider_details[sl_no][0];
						var x2 = paramslider_details[sl_no][2];
						var p = blocks.get("blocks["+mouse_click_parameters[usermouse.got_i][1]+"]::poly::voices");
						var vh = Math.floor(p*(usermouse.x - x1)/(x2 - x1));
						if(sidebar.selected_voice != vh){
							sidebar.selected_voice = vh;
							redraw_flag.flag |= 10;
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
				var ui ="blank.ui";
				var na = blocks.get("blocks["+usermouse.ids[1]+"]::name");
				if(blocktypes.contains(na+"::block_ui_patcher")) ui = blocktypes.get(na+"::block_ui_patcher");
				if(ui=="self"){
					open_patcher(usermouse.ids[1],-1);
				}else if(ui!="blank.ui"){
					set_display_mode("custom",+usermouse.ids[1]);
					if(selected.block[+usermouse.ids[1]]!=1) select_block(0,+usermouse.ids[1]);
					return(0);
				}else if(blocktypes.contains(blocks.get("blocks["+usermouse.ids[1]+"]::name")+"::plugin_name")){
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
			var current_p = blocks.get("blocks["+usermouse.ids[1]+"]::poly::voices");
			for(ti=0;ti<selected.wire.length;ti++){
				selected.wire[ti]=0;
			}
			for(ti=0;ti<selected.block.length;ti++){
				selected.block[ti]=0;
			}
			selected.block[usermouse.ids[1]]=1;	
			selected.block_count=1;
			selected.wire_count=0;
			usermouse.timer = DOUBLE_CLICK_TIME;
			var subvoices = 1;
			if(blocks.contains("blocks["+usermouse.ids[1]+"]::subvoices"))subvoices = blocks.get("blocks["+usermouse.ids[1]+"]::subvoices");
			if((usermouse.ids[2] == 0)||(current_p==1)){
				sidebar.selected_voice = -1;
			}else{
				sidebar.selected_voice = ((usermouse.ids[2]-1)/subvoices)|0;
			}
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


	var tcell;
	
	if(usermouse.sidebar_scrolling!=null){
		usermouse.sidebar_scrolling = null;
		d = 999;
	}else{
		tcell = click_i[(x>>click_b_s)+((y>>click_b_s)<<click_b_w)];
		b=tcell & 4095;
		c=0;
		d=tcell >> 12;
	}

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
			camera_position[0] += xx*scroll*1.5;
			camera_position[1] -= yy*scroll*1.5;//*0.5;
			messnamed("camera_control","position",  camera_position);
			messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
		}else if(displaymode=="block_menu"){
			menu.camera_scroll = Math.max(-3,Math.min(menu.length+3,menu.camera_scroll-scroll));
			messnamed("camera_control","position", 2 , -93, menu.camera_scroll);
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
		usermouse.shift=1;//forces it to 'get' even if its in clicktoset mode
		var tv = f(p, "get");
		usermouse.shift=shift;
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
	}else if((sidebar.mode!='none')&&(x>sidebar.x)){
		scroll_sidebar(scroll,"rel");
		usermouse.sidebar_scrolling = true;
	}else if((sidebar.mode=='file_menu')&&(x>sidebar.x2 - fontheight * 15)){
		usermouse.sidebar_scrolling = true;
		scroll_sidebar(scroll,"rel");
	}
}


function keydown(key){
	if(keymap.contains("modal::"+sidebar.mode)){
		if(keymap.contains("modal::"+sidebar.mode+"::"+key)){
			var action = keymap.get("modal::"+sidebar.mode+"::"+key);
			var paras = action.slice(2,99);
			//post("\nfound in keymap modal", action[0],action[1], "paras",paras);
			(eval(action[1])).apply(this,paras);
			return 1;		
		}else if(keymap.contains("modal::"+sidebar.mode+"::all")){
			var action = keymap.get("modal::"+sidebar.mode+"::all");
			var paras = action.slice(2,99);
			if(!Array.isArray(paras)) paras=[paras];
			paras.push(key);
			//post("\nfound in keymap modal all", action[0],action[1], "paras",paras);
			(eval(action[1])).apply(this,paras);
			return 1;		
		}
	}
	if(usermouse.caps && keymap.contains("qwertymidi::"+key)){
		var action = keymap.get("qwertymidi::"+key);
		var paras = action.slice(2,99);
		if(!Array.isArray(paras)) paras=[paras];
		paras.push(qwertym.vel);
		//post("\nfound in keymap qwertmidi", action[0],action[1], "paras",paras);
		(eval(action[1])).apply(this,paras);
		return 1;		
	}
	if(keyrepeat_task.running==0){
		keyrepeat_task = new Task(keydown, this, key);
		keyrepeat_task.interval= 150;
		keyrepeat_task.repeat(-1,300);			
	}
	if(keymap.contains("sidebar::"+sidebar.mode+"::"+key)){
		var action = keymap.get("sidebar::"+sidebar.mode+"::"+key);
		var paras = action.slice(2,99);
		//post("\nfound in keymap for sidebar mode", sidebar.mode,":", action, "paras",paras);
		(eval(action[1])).apply(this,paras);
		return 1;
	}else if(keymap.contains("global::"+key)){
		var action = keymap.get("global::"+key);
		var paras = action.slice(2,99);
		//post("\nfound in keymap", action[0],action[1], "paras",paras);
		(eval(action[1])).apply(this,paras);
		return 1;		
	}else if(keymap.contains(displaymode+"::"+key)){
		var action = keymap.get(displaymode+"::"+key);
		var paras = action.slice(2,99);
		//post("\nfound in keymap for mode", displaymode,":", action, "paras",paras);
		(eval(action[1])).apply(this,paras);
		return 1;		
	}else if(keymap.contains(displaymode+"::all")){
		var action = keymap.get(displaymode+"::all");
		var paras = action.slice(2,99);
		if(!Array.isArray(paras)) paras=[paras];
		paras.push(key);
		//post("\nfound in keymap for mode - all - ", displaymode,":", action, "paras",paras);
		(eval(action[1])).apply(this,paras);
		return 1;		
	}
	post("\nunhandled key", key, sidebar.mode);
}

function keyup(key){
	keyrepeat_task.cancel();
	if(usermouse.caps && keymap.contains("qwertymidi::"+key)){
		var action = keymap.get("qwertymidi::"+key);
		if(action[1] == "qwertymidi"){
			var paras = action.slice(2,99);
			if(!Array.isArray(paras)) paras=[paras];
			paras.push(0);
			//post("\nfound in keymap qwertmidi", action[0],action[1], "paras",paras);
			(eval(action[1])).apply(this,paras);
			return 1;		
		}
	}

}