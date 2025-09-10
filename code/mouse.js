function clicked_block_preparation() {
	//post("\nclicked block, ids is",usermouse.ids);
	if ((selected.block_count > 1) && (selected.block[usermouse.ids[1]] != 0)) {
		// if the clicked block is selected and multiple blocks are selected, then you drag them all
		var t = 0;
		usermouse.drag.dragging.voices = [];
		var usz=undo_stack.getsize("history")|0;
		undo_stack.append("history","{}");
		undo_stack.setparse("history["+usz+"]", '{ "actions" : { "move_blocks" : {} } }');
		for (var b = 0; b < MAX_BLOCKS; b++) {
			if (selected.block[b]) {
				var tvc = blocks.get("blocks[" + b + "]::poly::voices")*Math.max(1,blocks.get("blocks[" + b + "]::subvoices"));
				for (var i = 0; i <= tvc; i++) {
					usermouse.drag.dragging.voices[t] = [b, i];
					t++;
				}
				var x = blocks.get("blocks["+b+"]::space::x");
				var y = blocks.get("blocks["+b+"]::space::y");
				undo_stack.setparse("history["+usz+"]::actions::move_blocks::"+b, '{ "x" : '+x+', "y" : '+y+'}');
			}
		}
		//for (var i = 0; i < t; i++)	post("\nmultidrag", usermouse.drag.dragging.voices[i][0], usermouse.drag.dragging.voices[i][1]);
	} else {
		// if the clicked block is not selected, or is the only one selected, then you drag it				
		var b = usermouse.ids[1];	
		var tvc = blocks.get("blocks[" + b + "]::poly::voices")*Math.max(1,blocks.get("blocks[" + b + "]::subvoices"));
		usermouse.drag.dragging.voices = [];
		for (var i = 0; i <= tvc; i++) {
			usermouse.drag.dragging.voices[i] = [b, i];
		}
		var usz=undo_stack.getsize("history")|0;
		undo_stack.append("history","{}");
		undo_stack.setparse("history["+usz+"]", '{ "actions" : { "move_blocks" : {} } }');
		var x = blocks.get("blocks["+b+"]::space::x");
		var y = blocks.get("blocks["+b+"]::space::y");
		undo_stack.setparse("history["+usz+"]::actions::move_blocks::"+b, '{ "x" : '+x+', "y" : '+y+'}');
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

function picker_lookups(id){
	if(id === undefined) return null;
	var thov = id.split('_');
	if(thov[0]=="voice"){
		thov[0] ="block";
		var bv = matrix_voice_lookup[thov[1]];
		thov[1] = bv[0];
		thov[2] = bv[1];
		id = "block_"+thov[1]+"_"+thov[2];
	}else if(thov[0]=="block"){
		// post("\nresetting block from lookup",thov[1]);
		thov[1] = matrix_block_lookup[thov[1]];
		// post("to",thov[1]);
		id = "block_"+thov[1]+"_0";
	}else if(thov[0]=="wires"){
		thov[1] = wires_lookup[thov[1]];
		id = "wires_"+thov[1]+"_0";
	}
	// deferred_diag.push("lookups returns "+id);
	return id;
}

function picker_hover_and_special(id){
	// post("\nid",id,"incoming hov",usermouse.hover);
	if(usermouse.oid!=id){ //if id has changed
		//deferred_diag.push("hover - "+id);
		var ohov=usermouse.hover[1];
		usermouse.oid=id;
		var thov = id.split('_'); // store hover - any picker id received when not waiting for click
		if((thov[0]=="wires")&&((usermouse.clicked3d==-1)||(usermouse.clicked3d=="background"))){  // wire bulge stuff for a bit
			if(bulgingwire!=-1){
				if(Array.isArray(wires_scale[bulgingwire]) && !(selected.wire[bulgingwire])){
					for(var i=0;i<wires_scale[bulgingwire].length;i++){
						wires_scale[bulgingwire][i][1] = wire_dia;
					}					
					write_wire_scale_matrix(bulgingwire);
				}
			}
			bulgingwire = thov[1];
			bulgeamount=1;
			usermouse.wiretouch.x = usermouse.x; usermouse.wiretouch.y = usermouse.y;
			if(!Array.isArray(wires_scale[bulgingwire])) wires_scale[bulgingwire]=[];
			for(var i=0;i<wires_scale[bulgingwire].length;i++){
				wires_scale[bulgingwire][i][1] = wire_dia * (1 + bulgeamount);
			}
			write_wire_scale_matrix(bulgingwire);
		}else if(thov[0]!="background"){
			if(thov[0]!="wires") usermouse.hover = thov.concat();
			if((bulgeamount>0) && !(selected.wire[bulgingwire])){
				bulgeamount=0;
				if(wires_scale[bulgingwire]!=null){
					for(var i=0;i<wires_scale[bulgingwire].length;i++){
						wires_scale[bulgingwire][i][1] = wire_dia;
					}
					write_wire_scale_matrix(bulgingwire);
				}
				bulgingwire = -1;
				usermouse.wiretouch.x=-9999;
			}
		}else{
			if(thov[0]!="wires") usermouse.hover = thov.concat();
			if((bulgeamount==1) && !(selected.wire[bulgingwire])) bulgeamount = 0.999;
		}
		if((displaymode=="block_menu")&&(ohov!=usermouse.hover[1])){
			draw_menu_hint();
		}	
	}
	// deferred_diag.push(" - - hover is"+usermouse.hover+"returning id"+id);
	return id;
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
	// deferred_diag.push("mouse"+x+","+y+" [[  "+leftbutton+"  ]] "+usermouse.qcount);
}

function mouseidle(x,y,leftbutton,ctrl,shift,caps,alt,e){
	if(!usermouse.qlb){
		usermouse.queue.push([x,y,leftbutton,ctrl,shift,caps,alt,usermouse.qcount++]);
		usermouse.qlb = leftbutton;
		// deferred_diag.push("idle    "+x+","+y+" [[  "+leftbutton+"  ]] "+usermouse.qcount);
	}else{
		deferred_diag.push("idle during click??????");
		usermouse.queue.push([x,y,leftbutton,ctrl,shift,caps,alt,usermouse.qcount++]);
		usermouse.qlb = leftbutton; //nb previously, these two lines weren't here, these messages were dumped, but now i only see them when a mouse release has failed to register
	}
}

function mouseidleout(x,y,leftbutton,ctrl,shift,caps,alt,e){

}

function phys_picker(id,leftbutton){
	phys_picker_id = id;
	if((leftbutton==0)&&(usermouse.qlb)){
		var l=usermouse.queue.length;
		if(l>0){
			var m = usermouse.queue[l-1];
			mouse(m[0],m[1],0,m[3],m[4],m[5],m[6],m[7]);
		}else{
			mouse(usermouse.x,usermouse.y,0,usermouse.ctrl,usermouse.shift,usermouse.caps,usermouse.alt,0);
		}
	}
}

function manual_hit_detection(){
	var id = null;
	var stw = screentoworld(usermouse.x,usermouse.y);
	for(var i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::space::x")){
			var by = Math.abs(blocks.get("blocks["+i+"]::space::y")-stw[1]);
			if(by<0.5){
				var bx = blocks.get("blocks["+i+"]::space::x")-stw[0];
				var bv = blocks.get("blocks["+i+"]::poly::voices");
				if((bx<0.5)&&(bx>-0.5*(1+bv))){
					//post("\nITS THIS BLOCK!",i,blocks.get("blocks["+i+"]::name"));
					if(bx>-0.5){
						//post(" - the block itself");
						id="block_"+i+"_"+0;
					}else{
						bv = Math.floor(bx*-2);
						//post(" - voice",bv);
						id="block_"+i+"_"+bv;
					}
					i=MAX_BLOCKS;
				}
			}
		}
	}
	return id;
}

function manual_wire_hit_detection() {
    function distSq(p, q) {
        var dx = p[0] - q[0];
        var dy = p[1] - q[1];
        return dx * dx + dy * dy;
    }

    function distToSegmentSquared(p, v, w) {
        var l2 = distSq(v, w);
        if (l2 == 0) return distSq(p, v);
        var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
        t = Math.max(0, Math.min(1, t));
        return distSq(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]);
    }

    var stw = screentoworld(usermouse.x, usermouse.y);
    var p = [stw[0], stw[1]];
    var threshold = 0.25; // in world coordinates, squared. 0.5^2

    for (var i = 0; i < connections.getsize("connections"); i++) {
        if (connections.contains("connections[" + i + "]::from::number") && wires_position[i] && wires_position[i].length > 1) {
            for (var j = 0; j < wires_position[i].length - 1; j++) {
                var v = wires_position[i][j];
                var w = wires_position[i][j+1];
                if (distToSegmentSquared(p, v, w) < threshold) {
                    return i;
                }
            }
        }
    }
    return null;
}

function omouse(x,y,leftbutton,ctrl,shift,caps,alt,e){
	if(!am_foreground&&leftbutton) other_window_active(0); // you got a mouse event, so you should make sure you're foreground? but only after a click

	//post("processing mouse event",x,y,leftbutton,ctrl,shift,caps,alt,e);
	//if(id!='background') post("touch",id);
	//	opicker(id,leftbutton);
	usermouse.last.left_button = usermouse.left_button;
	usermouse.left_button = leftbutton;
	usermouse.last.shift = usermouse.shift;
	usermouse.last.alt = usermouse.alt;
	usermouse.last.x = x;
	usermouse.last.y = y; //these two aren't like the others, just used for special input - jogwheel
	usermouse.shift = shift;
	usermouse.scroll = 0;
	
	if(usermouse.ctrl != ctrl){
		usermouse.ctrl = ctrl;
		if((ctrl==0)&&usermouse.ctrl_voice_select){//reverts to just block selected
			sidebar.selected_voice = -1;
			if(displaymode=="blocks"){
				redraw_flag.flag |= 10;
			}
		}	
		/*if(sidebar.mode == "file_menu")*/ redraw_flag.flag |= 2;
	}
	if(alt!=usermouse.alt){
		usermouse.alt = alt;
		if(states.contains("states::current")) redraw_flag.flag |= 2;
	}
	if(usermouse.caps!=caps) redraw_flag.flag |= 2; //so the qwertymidi indicator gets drawn
	usermouse.caps = caps;
	
	usermouse.x = x;
	usermouse.y = y;
	usermouse.sidebar_scrolling = null;

	var tcell = click_i[(x>>click_b_s)+((y>>click_b_s)<<click_b_w)];
	usermouse.got_i = tcell & 4095;
	usermouse.got_t = tcell >> 12;
	var id = null;
	if(usermouse.got_t==0){
		if((displaymode=="blocks")||(displaymode=="block_menu")){
			//i do manual hit detection while dragging a block because i couldn't work out how to make phys picker see things under the dragged block..
			if((displaymode=="blocks") /*&& (usermouse.last.left_button)*/) id = manual_hit_detection();
			if(id==null) id = picker_lookups(phys_picker_id);
			if(id!=null) id = picker_hover_and_special(id);
		}else if(displaymode=="flocks"){
			id = picker_lookups(phys_picker_id);
			if(id!=null) id = picker_hover_and_special(id);
		}
	}
	if(usermouse.last.left_button!=usermouse.left_button){
		// deferred_diag.push(["omouse ",x,y+"[[  "+leftbutton+"  ]]"+usermouse.got_i,usermouse.got_t]);
		// ##################################################
		if(usermouse.left_button){	// CLICK
			if((usermouse.got_i==0) && (usermouse.got_t==0)){	//nothing on the 2d layer, open it up for 3d clicks
				if((displaymode=="blocks")||(displaymode=="block_menu")||(displaymode=="flocks")){
					usermouse.clicked3d = usermouse.hover[1];
					usermouse.drag.starting_x = usermouse.x;
					usermouse.drag.starting_y = usermouse.y;		
					usermouse.drag.last_x = usermouse.x;
					usermouse.drag.last_y = usermouse.y;
					usermouse.drag.distance=0;
					usermouse.clicked2d=-1;
					if(id=="background"){
						var t = manual_hit_detection();
						if(t!=null) id = t;
						// deferred_diag.push("used manual hit detect and got something that physics didnt");
					}
					usermouse.ids = id.split('_');
					// deferred_diag.push("mouse id"+usermouse.ids+" button "+leftbutton);
					if(id=="background" || id=="block-menu-background"){
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
							if((usermouse.ids[0]=="block")){
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
				// post("\nclick",usermouse.last.got_i,usermouse.last.got_t);
				if(usermouse.got_t==1){
					if((mouse_click_actions[usermouse.got_i]==send_button_message)||(mouse_click_actions[usermouse.got_i]==send_button_message_dropdown)){
						var ov = parameter_value_buffer.peek(1,mouse_click_values[usermouse.last.got_i][2]);
						store_param_undo(mouse_click_values[usermouse.last.got_i][2] - mouse_click_parameters[usermouse.last.got_i]*MAX_PARAMETERS,mouse_click_parameters[usermouse.last.got_i],ov);
					}
				}else if(usermouse.got_t>=2 && usermouse.got_t<=4){
					usermouse.drag.starting_x = usermouse.x;
					usermouse.drag.starting_y = usermouse.y;
					if(usermouse.got_i>=0){
						var f = mouse_click_actions[usermouse.got_i];
						var p = mouse_click_parameters[usermouse.got_i];
						var v = mouse_click_values[usermouse.got_i];
						usermouse.drag.starting_value_x = f(p,"get");
						if(mouse_click_actions[usermouse.got_i]==sidebar_parameter_knob){
							//post("\nstore, p",p,"b",v);
							store_param_undo(p[0],p[1],usermouse.drag.starting_value_x);
						}else if(mouse_click_actions[usermouse.got_i]==static_mod_adjust){
							//post("\nstore, p",p,"v",v);
							store_voice_param_undo(p[0],p[2],usermouse.drag.starting_value_x);
						}else{
							// deferred_diag.push("should store undo?",mouse_click_actions[usermouse.got_i].name,p,v,usermouse.drag.starting_value_x);
						}
						
						if((usermouse.got_t==4)){ 
							usermouse.drag.starting_value_y = f(v,"get");
						}else{
							usermouse.drag.starting_value_y = -1;
						}
					}
				}else if(usermouse.got_t == 6){
					var f = mouse_click_actions[usermouse.got_i][0];
					// f = f[0];
					var p = mouse_click_parameters[usermouse.got_i];
					var v = mouse_click_values[usermouse.got_i];
					f(p,v);
					usermouse.drag.starting_x = usermouse.x;
					usermouse.drag.starting_y = usermouse.y;
					usermouse.drag.starting_value_x = -1;
					usermouse.drag.starting_value_y = 0;//-1;
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
				if(mouse_click_actions[usermouse.last.got_i]==whole_state_xfade){ //end of state xfade
					state_fade.lastcolour = [state_fade.colour[0], state_fade.colour[1], state_fade.colour[2]];
					state_fade.last = state_fade.selected;
					state_fade.selected = -2;
					state_fade.position = -2;
					redraw_flag.flag |= 2;									
				}else if(usermouse.last.got_i == usermouse.got_i){
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
						if(f!=null)	f(p,v);
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
								usermouse.alt = 0; //so it actually resets rather than doing tilt
								static_mod_adjust(pb,0);
								usermouse.alt = 1;
								redraw_flag.flag |= 2;
							}else if(mouse_click_values[usermouse.got_i]!=""){//CHECK IF ITS A MENU ONE, JUMP TO NEXT VALUE
								var pnumber = mouse_click_values[usermouse.last.got_i] - 1;
								var p_values= blocktypes.get(paramslider_details[pnumber][15]+"::parameters["+paramslider_details[pnumber][9]+"]::values");
								var pv = static_mod_adjust(pb,"get");
								if(p_values.length>0) pv = (pv + 1.01/p_values.length) % 1;
								static_mod_adjust(pb,pv);
								redraw_flag.flag |= 2;
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
							}else{
								var p = mouse_click_parameters[usermouse.last.got_i];
								p2= p.split("::").pop();
								if(p2=="scale"){
									config_toggle_gain_display_format();
								}
							}
						}
					}
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
						if(usermouse.ids[0]=="block-menu-background"){
							if(usermouse.clicked3d!="background_dragged") set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged" &&  blocks_menu[matrix_menu_index[usermouse.hover[1]]]){
								var num = matrix_menu_index[usermouse.hover[1]];
								if(num != undefined){
									var type = blocks_menu[num].name;
									if(sidebar.show_help==0) sidebar.show_help = 1;
									set_display_mode("blocks");
									end_of_frame_fn = function(){
										var r = new_block(type, Math.round(blocks_page.new_block_click_pos[0]), Math.round(blocks_page.new_block_click_pos[1]));
										var bpw = (blocks_page.rightmost - blocks_page.leftmost);
										var d = ((blocks_page.new_block_click_pos[0]-blocks_page.leftmost)/bpw)-(sidebar.x/mainwindow_width);
										if(d > 0){
											camera_position[0] += 1.5*d*bpw;
											camera();
										}
										selected.block[r] = 1;
										var t = draw_block(r);
										if(blocks_page.was_selected!=null && (usermouse.shift || config.get("ALWAYS_AUTOCONNECT_IF_YOU_CAN"))){
											getWiresPotentialConnection();
											if(blocks_page.new_block_click_pos[1] > blocks.get("blocks["+blocks_page.was_selected+"]::space::y")){
												build_new_connection_menu(r,blocks_page.was_selected,-1,(blocks_page.was_selected_voice!=null) ? blocks_page.was_selected_voice : -1);
											}else{
												build_new_connection_menu(blocks_page.was_selected,r,(blocks_page.was_selected_voice!=null) ? blocks_page.was_selected_voice : -1,-1);
											}
										} 
										blocks_page.was_selected = null;
										block_cubes++;
										voice_cubes+=t[0];
										write_blocks_matrix();
										sidebar.scopes.voice = -1;
										sidebar.selected_voice = -1;
										redraw_flag.flag |= 8;
									}
								}
							}
						}
						usermouse.clicked3d = -1;
					}else if(menu.mode == 1){ //post("SWAP MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block-menu-background"){
							if(usermouse.clicked3d!="background_dragged") set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								var num = matrix_menu_index[usermouse.hover[1]];
								if(num == undefined) error("\nhow 2?",usermouse.hover[1],num);
								var newb = blocks_menu[num].name;
								swap_block(newb);
								set_display_mode("blocks");
							}
						}
					}else if(menu.mode == 2){ //post("insert MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block-menu-background"){
							if(usermouse.clicked3d!="background_dragged") set_display_mode("blocks");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								var cno = menu.connection_number;
								if(Array.isArray(menu.connection_number)) cno = menu.connection_number[0];
					
								var f_no = connections.get("connections["+cno+"]::from::number")|0;
								var t_no = connections.get("connections["+cno+"]::to::number")|0;
								var avx = blocks.get("blocks["+f_no+"]::space::x");
								var avy = blocks.get("blocks["+f_no+"]::space::y") - 0.5;
								var dy = blocks.get("blocks["+t_no+"]::space::y")-blocks.get("blocks["+f_no+"]::space::y");
								if(dy<1.2) make_fisheye_space(avx,avy,0.55);
								avy = blocks.get("blocks["+f_no+"]::space::y") - 1.25;
								var num = matrix_menu_index[usermouse.hover[1]];
								if(num == undefined) error("\nhow 3?",usermouse.hover[1],num);
								var newb = blocks_menu[num].name;
								var r = new_block(newb, avx,avy);
								if(blocktypes.get(newb+"::type")=="audio") send_audio_patcherlist(1);
								draw_block(r);
								insert_block_in_connection(newb,r);							
								redraw_flag.flag |= 4;						
							}
						}
					}else if(menu.mode == 3){ //post("SUBSTITUTION MENU",usermouse.clicked3d,usermouse.ids);
						if(usermouse.ids[0]=="block-menu-background"){
							//set_display_mode("blocks");
							post("sorry no, you have to pick a substitute");
						}else{
							if(usermouse.clicked3d!="background_dragged"){
								var num = matrix_menu_index[usermouse.hover[1]];
								if(num == undefined) error("\nhow 4?",usermouse.hover[1],num);
								var newb = blocks_menu[num].name;
								post("substitution found!!"+newb);
								loading.recent_substitutions.replace(menu.swap_block_target, newb);
								menu.swap_block_target = newb;
								set_display_mode("blocks");
								import_song();
								//swap_block(usermouse.ids[1]);
								//set_display_mode("blocks");
							}
						}
					}
				}else if((displaymode == "blocks")||(displaymode == "flocks")){
					if((usermouse.ids[0] == "background") && (bulgeamount>0.5) && (bulgeamount<1)){
						var d = (usermouse.x-usermouse.wiretouch.x) * (usermouse.x-usermouse.wiretouch.x) + (usermouse.y-usermouse.wiretouch.y)*(usermouse.y-usermouse.wiretouch.y);
						if(d<100){
							usermouse.ids = ["wires", bulgingwire, 0];
							// post("\nset to last wire not background");
						}
					}
					if(usermouse.ids[0] == "background"){
						if(usermouse.drag.distance<20){
							if(usermouse.alt){
								center_view(1);
							}else if((selected.block.indexOf(1)>-1) || (selected.wire.indexOf(1)>-1)){ //either clear selection or bring up new block menu
								clear_blocks_selection();
								usermouse.clicked3d = -1;
							}else{
								var showmenu =0;
								//there are options for how to bring up the menu, so we go through and see if they're true for the various modes, then decide whether to trigger the menu (1)
								var tp = screentoworld(usermouse.x,usermouse.y);
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
					// if(usermouse.timer<0){ // reset background longpress
					// 	usermouse.timer = 0;
					// 	usermouse.long_press_function = null;
					// }
					usermouse.drag.starting_x = 0;
					usermouse.drag.starting_y = 0;
					if((usermouse.ids[0] != "background")&&(displaymode=="blocks")){
						if (usermouse.ids[0] == "block"){
							// a block drag has finished, update its position first
							var displaypos = [blocks_cube[usermouse.ids[1]][0].position[0] , blocks_cube[usermouse.ids[1]][0].position[1]];
							var dictpos = [ blocks.get("blocks["+usermouse.ids[1]+"]::space::x"), blocks.get("blocks["+usermouse.ids[1]+"]::space::y")];

							for(var t = 0; t<usermouse.drag.dragging.voices.length; t++){//resets the dragged blocks Z pos
								blocks_cube[usermouse.drag.dragging.voices[t][0]][usermouse.drag.dragging.voices[t][1]].position[2] = 0;
								write_block_matrix(usermouse.drag.dragging.voices[t][0]);
							}
							if(usermouse.drag.dragging.voices.length>0){
								messnamed("voices_matrices","bang");
								messnamed("blocks_matrices","bang");
							}
							if((displaypos[0] != dictpos[0]) || (displaypos[1] != dictpos[1])){
								var ob=-1;
								for(var t = 0; t<usermouse.drag.dragging.voices.length; t++){
									if(usermouse.drag.dragging.voices[t][0]!=ob){
										ob=usermouse.drag.dragging.voices[t][0];
										blocks.replace("blocks["+ob+"]::space::x",blocks_cube[ob][0].position[0]);
										blocks.replace("blocks["+ob+"]::space::y",blocks_cube[ob][0].position[1]);
									}
								}									
								redraw_flag.flag |= 4;
							}

							// now check for actions
							if (usermouse.drag.target_wire_for_insertion > -1) {
								// insert into wire
								menu.connection_number = usermouse.drag.target_wire_for_insertion;
								var dragged_block_number = usermouse.ids[1];
								var dragged_block_name = blocks.get("blocks[" + dragged_block_number + "]::name");
								insert_block_in_connection(dragged_block_name, dragged_block_number);
								usermouse.drag.target_wire_for_insertion = -1;

							} else if ((usermouse.hover[1] != usermouse.ids[1]) && (usermouse.hover[0] != "background")) {
								// connect to another block
								if(usermouse.hover[1]==-1){
									post("\nERROR hover was -1\n");
								}else{
									var makewire=1;
									var fname = blocks.get("blocks["+usermouse.ids[1]+"]::name");
									var ifu = blocktypes.contains(blocks.get("blocks["+usermouse.hover[1]+"]::name")+"::connections::in::force_unity");
									if(!blocktypes.contains(fname +"::connections::out")) makewire=0; //no outputs!
									if(blocktypes.contains(fname+"::connections::out::force_unity")){
										if(!ifu){
											makewire=0;
											sidebar_notification("This block can only be connected to a mixer.bus block");
										}
									}else{
										if(ifu){
											makewire=0;
											sidebar_notification("You can only connect mixer.channel blocks into a mixer.bus");
										}
									}
									if(makewire){
										build_new_connection_menu(usermouse.ids[1],usermouse.hover[1],usermouse.ids[2]-1,usermouse.hover[2]-1);
									}
								}
							} else if ((usermouse.hover[1] == usermouse.ids[1]) && (Math.round(displaypos[0]) == Math.round(dictpos[0])) && (Math.round(displaypos[1]) == Math.round(dictpos[1]))) {
								// dropped on self
								if((usermouse.drag.distance>SELF_CONNECT_THRESHOLD) && (usermouse.shift || (SELF_CONNECT_REQUIRES_SHIFT==0))){ // connect to self
									
									var makewire=1;
									var fname = blocks.get("blocks["+usermouse.ids[1]+"]::name");
									if(!blocktypes.contains(fname +"::connections::out")) makewire=0; //no outputs!
									if(blocktypes.contains(fname+"::connections::out::force_unity")){
										if(!blocktypes.contains(blocks.get("blocks["+usermouse.hover[1]+"]::name")+"::connections::in::force_unity")){
											makewire=0;
											sidebar_notification("This block can only be connected to a mixer.bus block");
										}
									}
									if(makewire){
										post("you connected it to itself, dist: " + usermouse.drag.distance +" ids "+ usermouse.ids[1] + " hover "+usermouse.hover[1]);
										build_new_connection_menu(usermouse.ids[1], usermouse.hover[1],usermouse.ids[2]-1,usermouse.hover[2]-1);
									}
								}else{ // just a click
									mouse_released_on_a_thing_no_drag();
									usermouse.ids=['done',-1,-1];
								}
							}

							// tidy up
							if (usermouse.ids[0] != 'done') {
								usermouse.clicked3d = -1;
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
									sidebar.connection.show_from_outputs = 0;
									sidebar.connection.default_out_applied = 0;
									sidebar.connection.show_to_inputs = 0;
									sidebar.connection.default_in_applied = 0;
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
								//write_wires_matrix();
								redraw_flag.flag |= 4;
							}else{
								selected.wire[usermouse.ids[1]]=1 - selected.wire[usermouse.ids[1]];
								//write_wire_matrix(usermouse.ids[1]);
								redraw_flag.flag |= 4;
							}
						}
						redraw_flag.flag |= 8; //block_and_wire_colours();
						usermouse.clicked3d = -1;
						usermouse.ids[0]="done";
					}else if(displaymode=="flocks"){
						if(usermouse.ids[0] == "block" ){
							for(ti=selected.block.length-1;ti>=0;ti--){
								selected.block[ti]=0;
							}
							selected.block[usermouse.ids[1]]=1;
							sidebar.selected_voice = -1;
							set_sidebar_mode("block");
							redraw_flag.flag|=10;
						}
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
				usermouse.drag.starting_value_x = 0; //keeps track of distance dragged, so we can do the x/y for 'zoom in around a point'
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
			if((usermouse.last.got_t == 6) && (usermouse.drag.distance > STATE_FADE_DRAG_THRESHOLD)){
				state_fade.position=0;//1;
				redraw_flag.flag |= 2;
				usermouse.last.got_t = 2;
				usermouse.long_press_function = null;
				create_whole_state_xfade_slider();
				whole_state_xfade_create_task.cancel();
				mouse_click_actions[usermouse.last.got_i] = whole_state_xfade;
				p = state_fade.selected;
				v = 0;
			}	
			if((usermouse.clicked2d != -1) && (usermouse.last.got_t>=2 && usermouse.last.got_t<=4)){ 
				// #### 2D DRAG ###########################################################################################################
				var f = mouse_click_actions[usermouse.last.got_i];
				var p = mouse_click_parameters[usermouse.last.got_i];
				var v = mouse_click_values[usermouse.last.got_i];
				if(usermouse.drag.release_on_exit && (usermouse.last.got_i != usermouse.got_i)){
					//post("\nDRAGOUT!!!!",mouse_click_parameters[usermouse.got_i]);
					//nb here you should check what you've dragged onto
					//and only do this if you've dragged onto another click-to-set slider
					//(i think from the index -> param slider details 18?)
					var ppp=0;
					var ppf=mouse_click_actions[usermouse.got_i];
					if(ppf == data_edit){
						ppp=1;
					}else if(ppf == sidebar_parameter_knob){
						ppp = mouse_click_parameters[usermouse.got_i];
						ppp = paramslider_details[ppp[0]][18];
						//post("\nsidebar, ppp is",ppp);
					}
					if(ppp){
						usermouse.drag.release_on_exit = 0;
						usermouse.left_button = 0;
						f = "none";
					}
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
						if(usermouse.drag.release_on_exit){
							xdist=ydist; //click-to-set sliders don't respond to horizontal drag
						}else{
							xdist += ydist;
						}
					}else{
						if(!Array.isArray(f))f(v,usermouse.drag.starting_value_y+ydist);
					}
					//post("drag-f",f);
					//post("or",f.name);
					if(!Array.isArray(f))f(p,usermouse.drag.starting_value_x+xdist);					
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
			}else if((usermouse.clicked2d == -1) && (usermouse.got_t == 7)){
				if((mouse_click_actions[usermouse.got_i]==custom_mouse_passthrough)&&(mouse_click_values[usermouse.got_i]==1)){
					custom_mouse_passthrough(mouse_click_parameters[usermouse.got_i],1);
				}
			}else if((usermouse.clicked3d != -1) && (usermouse.clicked3d != -2)){ //############################## 3D DRAG
				//	post("\n3d drag, id",id,"hover",usermouse.hover,"ids",usermouse.ids,"phys",phys_picker_id);
				if(displaymode == "blocks"){
					if(usermouse.left_button==1){
						if(usermouse.drag.starting_x>0){
							var xdist=usermouse.x-usermouse.drag.starting_x;
							var ydist=usermouse.drag.starting_y-usermouse.y;
							usermouse.drag.distance += Math.abs(usermouse.x - usermouse.drag.last_x) + Math.abs(usermouse.y - usermouse.drag.last_y);
							if(usermouse.ids[0] == "background"){
								if(usermouse.ctrl){
									//zoom in or out on drag
									var xx = (2 * usermouse.drag.starting_x / mainwindow_width) - 1;
									var yy = (2 * usermouse.drag.starting_y / mainwindow_height) - 1;
									var scroll = usermouse.drag.starting_value_x - ydist*0.1;

									usermouse.drag.starting_value_x = ydist*0.1;
									camera_position[2] = Math.max(3,Math.min(500,camera_position[2]-scroll));				
									camera_position[0] += xx*scroll*0.3;
									camera_position[1] -= yy*scroll*0.3;//*0.5;
									messnamed("camera_control","position",  camera_position);
								}else if(usermouse.shift){
									var sts = screentoworld(usermouse.drag.starting_x,usermouse.drag.starting_y);
									var stw = screentoworld(usermouse.x,usermouse.y);
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
									//messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
								}
							}else if((usermouse.ids[0] == "block")){
								var tsx = (sidebar.mode == "none") ? (mainwindow_width-20) : (sidebar.x - 20);
								if(usermouse.x<20){
									camera_position[0] -= 0.0003*camera_position[2]*Math.max(20,20 - usermouse.x);
									messnamed("camera_control","position",  camera_position);
								}else if(usermouse.x>tsx){
									camera_position[0] += 0.0003*camera_position[2]*Math.max(20,usermouse.x - tsx);
									messnamed("camera_control","position",  camera_position);
								}
								if(usermouse.y<20){
									camera_position[1] += 0.0003*camera_position[2]*Math.max(20,20 - usermouse.y);
									messnamed("camera_control","position",  camera_position);
								}else if(usermouse.y>(mainwindow_height-20)){
									camera_position[1] -= 0.0003*camera_position[2]*Math.max(20,usermouse.x-mainwindow_height+20);
									messnamed("camera_control","position",  camera_position);
								}
								var oldpos = blocks_cube[usermouse.ids[1]][0].position;
								var t = 0;
								var stw = screentoworld(usermouse.x,usermouse.y);
								var block_x = stw[0]; //BLOCKS_GRID[1]*Math.round(stw[0]*BLOCKS_GRID[0]); 
								var block_y = stw[1]; //BLOCKS_GRID[1]*Math.round(stw[1]*BLOCKS_GRID[0]);
								var dictpos = [ blocks.get("blocks["+usermouse.ids[1]+"]::space::x"), blocks.get("blocks["+usermouse.ids[1]+"]::space::y")];
								if((usermouse.hover=="background") || ((!(!SELF_CONNECT_REQUIRES_SHIFT || (usermouse.shift&&!usermouse.ctrl&&!usermouse.alt))||((Math.abs(block_x-dictpos[0])+Math.abs(block_y-dictpos[1]))>(0.5+(2+20*usermouse.shift)*SELF_CONNECT_REQUIRES_SHIFT))||(usermouse.drag.distance<=SELF_CONNECT_THRESHOLD))&&(((usermouse.hover[1]==usermouse.ids[1])&&(usermouse.hover[0]=="block"))))){ //i think hover can't get set to wires			
									if(wires_potential_connection>-1) remove_potential_wire();
									if((block_x!=oldpos[0])||(block_y!=oldpos[1])){
										var dx = Math.abs(block_x-usermouse.drag.starting_value_x);
										var dy = Math.abs(block_y-usermouse.drag.starting_value_y);
										if((dx>=0.75)||(dy>=0.75)){
											usermouse.drag.starting_value_x = -999; // this is the start of dragging a block. resetting these means it
											usermouse.drag.starting_value_y = -999; // always passes the dx/dy test.
											//block_meters_enable(0);
											//meters_updatelist.meters = [];
											//meters_updatelist.hardware = [];
											//meters_updatelist.midi = [];
											var ob=-1.1;
											var bdx,bdy;
											var bl=[];
											var subvoices = 1;
											for(t = 0; t<usermouse.drag.dragging.voices.length; t++){
												if(ob!=usermouse.drag.dragging.voices[t][0]){
													ob = usermouse.drag.dragging.voices[t][0];	
													bl.push(ob);
													bdx = blocks.get("blocks["+ob+"]::space::x") + block_x - dictpos[0];
													bdy = blocks.get("blocks["+ob+"]::space::y") + block_y - dictpos[1];
													var mdx = bdx - blocks_cube[ob][0].position[0];
													//var mdy = bdy - blocks_cube[ob][0].position[1];
													for(var m=0;m<blocks_meter[ob].length;m++){
														blocks_meter[ob][m].position[0]+=mdx;
													//	blocks_meter[ob][m].position[1]+=mdy;
													}
													subvoices = blocks.get("blocks["+ob+"]::subvoices");
													if(subvoices<1)subvoices = 1;
												}
												blocks_cube[ob][usermouse.drag.dragging.voices[t][1]].position = [ bdx + (0.125*subvoices + 0.125)*(usermouse.drag.dragging.voices[t][1]>0)+ 0.5*usermouse.drag.dragging.voices[t][1]/subvoices, bdy, -0.25];//-usermouse.drag.dragging.voices[t][1]-0.2];
												//post("\nset position of block",ob,"voice",usermouse.drag.dragging.voices[t][1],"to:",blocks_cube[ob][usermouse.drag.dragging.voices[t][1]].position);
											}
											if(bl.length>0){
												for(t=0;t<bl.length;t++) write_block_matrix(bl[t]);
												messnamed("voices_matrices","bang");
												messnamed("blocks_matrices","bang");
												redraw_flag.matrices =  253;
											}
											for(tt=0;tt<usermouse.drag.dragging.connections.length;tt++){
												draw_wire(usermouse.drag.dragging.connections[tt]);
												write_wire_matrix(usermouse.drag.dragging.connections[tt]);
											}
											if(redraw_flag.matrices & 1){
												messnamed("wires_matrices","bang");
												redraw_flag.matrices &= 254;
											}else{
												post("\nno dragged wires?");
											}
										}
										if(sidebar.mode=="notification") set_sidebar_mode("none");
									}
									var hovered_wire = manual_wire_hit_detection();
									if (hovered_wire !== null && usermouse.shift && usermouse.ctrl) {
										usermouse.drag.target_wire_for_insertion = hovered_wire;
										if (bulgingwire != hovered_wire) {
											if (bulgingwire != -1 && Array.isArray(wires_scale[bulgingwire]) && !selected.wire[bulgingwire]) {
												for (var k = 0; k < wires_scale[bulgingwire].length; k++) { wires_scale[bulgingwire][k][1] = wire_dia; }
												write_wire_scale_matrix(bulgingwire);
											}
											bulgingwire = hovered_wire;
										}
										bulgeamount = 2; // make it bigger
										if (!Array.isArray(wires_scale[bulgingwire])) wires_scale[bulgingwire] = [];
										for (var k = 0; k < wires_scale[bulgingwire].length; k++) { wires_scale[bulgingwire][k][1] = wire_dia * (1 + bulgeamount); }
										write_wire_scale_matrix(bulgingwire);
									} else if (usermouse.drag.target_wire_for_insertion != -1) {
										if (bulgingwire != -1 && Array.isArray(wires_scale[bulgingwire]) && !selected.wire[bulgingwire]) {
											bulgeamount = 0;
											for (var k = 0; k < wires_scale[bulgingwire].length; k++) { wires_scale[bulgingwire][k][1] = wire_dia; }
											write_wire_scale_matrix(bulgingwire);
										}
										usermouse.drag.target_wire_for_insertion = -1;
									}
								}else if(((usermouse.hover[0]=="block"))&&(selected.block_count<=1)){
									//post("\nhovering over:",usermouse.hover[0],usermouse.hover[1],usermouse.hover[2],"ids",usermouse.ids,"wpc",wires_potential_connection);
									// ############## INDICATE POSSIBLE CONNECTION by drawing a 'potential' wire	
									var drawwire=1;
									if(wires_potential_connection != -1){
										if((connections.contains("connections["+wires_potential_connection+"]::to"))&&(connections.get("connections["+wires_potential_connection+"]::to::number")==usermouse.hover[1])&&(connections.get("connections["+wires_potential_connection+"]::to::voice")==usermouse.hover[2])){
											//already drawn the potential connection wirer to this block
											drawwire = 0;	
										}
									}
									if(SELF_CONNECT_REQUIRES_SHIFT && !usermouse.shift && (usermouse.hover[1] == usermouse.ids[1])) drawwire = 0; //prohibit self-con
									var fname = blocks.get("blocks["+usermouse.ids[1]+"]::name");
									if(!blocktypes.contains(fname +"::connections::out")) drawwire=0; //no outputs!
									var ifu = blocktypes.contains(blocks.get("blocks["+usermouse.hover[1]+"]::name")+"::connections::in::force_unity");
									if(blocktypes.contains(fname+"::connections::out::force_unity")){
										if(!ifu){
											drawwire=0;
											if(usermouse.hover[1]!=usermouse.ids[1]) sidebar_notification("The "+fname+" block can only be connected to a mixer.bus block");
										}else{
											if(sidebar.mode=="notification") set_sidebar_mode("none");
										}
									}else{
										if(ifu){
											drawwire=0;
											if(usermouse.hover[1]!=usermouse.ids[1]) sidebar_notification("The "+fname+" block can't be connected to a mixer.bus block directly, you need to connect a mixer.channel block to the bus first.");
										}else{
											if(sidebar.mode=="notification") set_sidebar_mode("none");
										}
									}
									if(drawwire == 1){
										potential_connection.replace("from::number",+usermouse.ids[1]);
										potential_connection.replace("to::number",+usermouse.hover[1]);
										potential_connection.replace("to::input::type","potential");
										potential_connection.replace("from::output::type","potential");
										var temptovoice = usermouse.hover[2];
										potential_connection.replace("to::voice",temptovoice);
										var tempfromvoice = usermouse.ids[2];
										potential_connection.replace("from::voice",tempfromvoice);
										if(Array.isArray(wire_ends[wires_potential_connection]))wire_ends[wires_potential_connection][3] = -99.94;
										if(wires_potential_connection==-1){
											getWiresPotentialConnection(); //find a free slot in the connections dict
										}else{
											// post("\nreplaced", wires_potential_connection);
											connections.replace("connections["+wires_potential_connection+"]",potential_connection);
										}
										set_sidebar_mode("potential_wire");
									
										var drawnlist = [];
										for(var t=0;t<usermouse.drag.dragging.voices.length;t++){
											if(drawnlist.indexOf(usermouse.drag.dragging.voices[t][0])==-1){
												// post("\nupdating block",usermouse.drag.dragging.voices[t][0]);
												drawnlist.push(usermouse.drag.dragging.voices[t][0]);
												blocks_cube[usermouse.drag.dragging.voices[t][0]] = [];
												draw_block(usermouse.drag.dragging.voices[t][0]);
											}
										}
										write_blocks_matrix();
										draw_wire(wires_potential_connection);
										for(var t=0;t<usermouse.drag.dragging.connections.length;t++){
											draw_wire(usermouse.drag.dragging.connections[t]);
											//write_wire_matrix(usermouse.drag.dragging.connections[t]);
										}
										write_wires_matrix();
										redraw_flag.matrices &= 241;
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
							if((CTRL_VOICE_SEL_MOMENTARY)&&(sidebar.selected_voice==-1)) usermouse.ctrl_voice_select = 1;
							sidebar.selected_voice = vh;
							redraw_flag.flag |= 10;
						}
					}
				}
			}
		}else if((usermouse.x > sidebar.x) && !automap.lock_c && automap.mouse_follow && (automap.offset_range_c>0) && (sidebar.mode=="block") && (usermouse.got_t == 2) && ((mouse_click_actions[usermouse.got_i]==sidebar_parameter_knob)||(mouse_click_actions[usermouse.got_i]==static_mod_adjust))){
			var r = 0;
			for(var tr=0;tr<automap.sidebar_row_ys.length;tr++){
				if(usermouse.y>automap.sidebar_row_ys[tr]) r = tr;
			}
			var cr = automap.groups.indexOf(r);
			var crn = automap.groups.indexOf(r+1);
			if(crn==-1)crn=automap.groups.length;
			//only move the controller offset if the row you're over isn't shown
			if((cr<automap.offset_c)||(crn>(automap.offset_c+automap.c_rows))){
				r = Math.min(cr,automap.offset_range_c);
				automap.offset_c = r;
				note_poly.message("setvalue", automap.available_c, "automap_offset", automap.offset_c * automap.c_cols );
				redraw_flag.flag |= 2;
			}
		}else if(usermouse.got_t == 7){
			if((mouse_click_actions[usermouse.got_i]==custom_mouse_passthrough)&&(mouse_click_values[usermouse.got_i]==1)){
				custom_mouse_passthrough(mouse_click_parameters[usermouse.got_i],1);
			}
		}
	}
}

function getWiresPotentialConnection() {
	var csize = connections.getsize("connections");
	var w = 1;
	for (var i = 1; i < csize; i++) { //look for an empty slot
		if (!connections.contains("connections[" + i + "]::to::number")) {
			//post("\nfound an empty slot,",i," to use for potential connection wire");
			connections.replace("connections[" + i + "]", potential_connection);
			wires_potential_connection = i;
			w = 0;
			i = csize;
		}
	}
	if (w == 1) {
		connections.append("connections", potential_connection);
		wires_potential_connection = connections.getsize("connections") - 1;
		// post("\nappended, number is",wires_potential_connection);
	}
}

function mouse_released_on_a_thing_no_drag(){
	if(usermouse.ids[0]=='block' || usermouse.ids[0]=='meter'){
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
		}else if(usermouse.alt){
			if(selected.block[usermouse.ids[1]]){
				bypass_selected_block(-1);
			}else{
				bypass_particular_block(usermouse.ids[1],-1);											
			}
		}else if(usermouse.shift == 0){
			var ti=0;
			var current_p = blocks.get("blocks["+usermouse.ids[1]+"]::poly::voices");
			if(selected.block[usermouse.ids[1]]==0) sidebar.scroll.position = 0;
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
			//var subvoices = 1;
			//if(blocks.contains("blocks["+usermouse.ids[1]+"]::subvoices"))subvoices = blocks.get("blocks["+usermouse.ids[1]+"]::subvoices");
			if((usermouse.ids[2] == 0)||(current_p==1)){
				sidebar.selected_voice = -1;
			}else{
				//post("\nsubv",subvoices,"ids",usermouse.ids[2]-1,"selected", ((usermouse.ids[2]-1)/subvoices)|0);
				sidebar.selected_voice = ((usermouse.ids[2]-1)/*/subvoices*/)|0;
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

function ext_jogwheel(value){
	mousewheel(usermouse.last.x,usermouse.last.y,0,usermouse.ctrl,usermouse.shift,usermouse.caps,usermouse.alt,0,0,value);
}
function um_scroll_wait(){
	usermouse.last.scroll = -1;
}

function mousewheel(x,y,leftbutton,ctrl,shift,caps,alt,e,f, scroll){
	usermouse.shift = shift;
	usermouse.ctrl = ctrl;
	usermouse.alt = alt;
	usermouse.x = x;
	usermouse.y = y;
	usermouse.last.x = x;
	usermouse.last.y = y;
	usermouse.scroll = scroll;
	var tcell;
	
	if(usermouse.sidebar_scrolling != null){
		usermouse.sidebar_scrolling = null;
		d = 999;
	}else{
		tcell = click_i[(x>>click_b_s)+((y>>click_b_s)<<click_b_w)];
		b=tcell & 4095;
		c=0;
		d=tcell >> 12;
	}

	if((displaymode=="blocks")||(displaymode=="block_menu")){
		id = picker_lookups(phys_picker_id);
		if(id!=null) picker_hover_and_special(id);
		if(displaymode == "block_menu") draw_menu_hint();
	}	
//	post("\nbcd",b,c,d,mouse_index);
	if((b==0)&&(c==0)&&(d==0)){ //nothing to see here, zoom the 3d camera instead
		if(displaymode=="blocks"){
			if((!usermouse.ctrl)&&(!usermouse.shift)&&(!usermouse.alt)){
				var xx = (2 * x / mainwindow_width) - 1;
				var yy = (2 * y / mainwindow_height) - 1;
				camera_position[2] = Math.max(3,Math.min(500,camera_position[2]-20*scroll));				
				camera_position[0] += xx*scroll*7;
				camera_position[1] -= yy*scroll*7;//*0.5;
				messnamed("camera_control","position",  camera_position);
				//messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
			}else if(usermouse.ctrl){
				if(bulgingwire>-1){ //ctrl-scroll a wire to adjust level
					var scale = connections.get("connections["+bulgingwire+"]::conversion::scale");
					connection_edit("connections["+bulgingwire+"]::conversion::scale", scale+scroll*0.1);
					if(sidebar.mode =="wire"){
						if(selected.wire[bulgingwire]!=1){
							for(var si=0;si<selected.wire.length;si++) selected.wire[si]=0;
							selected.wire[bulgingwire]=1;
							//redraw_flag.flag |= 8; //block_and_wire_colours();
							//redraw_flag.flag |= 2;
							redraw_flag.flag |= 10;
						}
					}else{
						for(var si=0;si<selected.block.length;si++) selected.block[si]=0;
						for(var si=0;si<selected.wire.length;si++) selected.wire[si]=0;
						selected.wire[bulgingwire]=1;
						redraw_flag.flag |= 8; //block_and_wire_colours();
						redraw_flag.flag |= 2;
					}
				} //todo? ctrl-scroll a block
			}else if((usermouse.shift)&&(usermouse.alt)){
				var stw = screentoworld(usermouse.x,usermouse.y);
				make_space(stw[0],stw[1],-1*scroll);
			}
		}else if(displaymode=="block_menu"){
			menu.camera_scroll = Math.max(-3,Math.min(menu.length+3,menu.camera_scroll-3*scroll));
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
		
		if((f==sidebar_parameter_knob)||((f==static_mod_adjust)&&(p[3]!="custom_opv"))){ //tries to line up scrollwheel steps with slider values for int/menu types
			//that last bit - maybe a temp fix. look at this once you've got mixer bus ui working 100%
			var scalar = ((shift)?0.1:1);
			if((f!=static_mod_adjust)&&(shift)) scalar = (((alt))?0.01:0.1);
			if(typeof paramslider_details[p[0]] == "undefined"){
				t="default";
			}else{
				//store undo
				if(usermouse.last.scroll != MAX_PARAMETERS*paramslider_details[p[0]][8]+paramslider_details[p[0]][9]){
					usermouse.last.scroll = MAX_PARAMETERS*paramslider_details[p[0]][8]+paramslider_details[p[0]][9];
					if(um_task == null){
						um_task = new Task(um_scroll_wait,this,0);
					}else{
						um_task.cancel();
					}
					um_task.schedule(1000);
					if(f==static_mod_adjust){ // ONLY IF SELECTION HAS CHANGED OR THERE@S BEEN A PAUSE
						store_voice_param_undo(paramslider_details[p[0]][9],paramslider_details[p[0]][8],parameter_static_mod.peek(1,MAX_PARAMETERS*paramslider_details[p[0]][8]+paramslider_details[p[0]][9]));
					}else{
						store_param_undo(paramslider_details[p[0]][9],paramslider_details[p[0]][8],parameter_value_buffer.peek(1,MAX_PARAMETERS*paramslider_details[p[0]][8]+paramslider_details[p[0]][9]));
					}
				}
				var t=paramslider_details[p[0]][13];
				var p_values= blocktypes.get(paramslider_details[p[0]][15]+"::parameters["+paramslider_details[p[0]][9]+"]::values");
			}
			if(t=="int"){
				if(p_values.length==5) scalar *= p_values[4];
				usermouse.scroll_accumulator += scroll*scalar;
				if(usermouse.scroll_accumulator > 0.22 ){
					usermouse.scroll_accumulator = 0;
					tv += scalar / (p_values[2] - p_values[1] + 1);
				}else if(usermouse.scroll_accumulator < -0.22){
					usermouse.scroll_accumulator = 0;
					tv -= scalar / (p_values[2] - p_values[1] + 1);
				}
			}else if((t=="menu_i")||(t=="menu_l")||(t=="menu_b")||(t=="menu_d")){
				usermouse.scroll_accumulator += scroll;
				scalar *= (f==static_mod_adjust)?0.5:1; //this isn't right, i don't understand what's going on here, p_values.length is right, so static_mod_adjust must mangle it but it doesn't? 
				if(usermouse.scroll_accumulator > 0.22 ){
					usermouse.scroll_accumulator = 0;
					tv += scalar / (p_values.length);
				}else if(usermouse.scroll_accumulator < -0.22){
					usermouse.scroll_accumulator = 0;
					tv -= scalar / (p_values.length);
				}
			}else if((t=="menu_f")){
				if((alt)&&(!shift)){
					usermouse.scroll_accumulator += scroll;
					if(usermouse.scroll_accumulator > 0.22 ){
						usermouse.scroll_accumulator = 0;
						tv += scalar / (p_values.length+1);
					}else if(usermouse.scroll_accumulator < -0.22){
						usermouse.scroll_accumulator = 0;
						tv -= scalar / (p_values.length+1);
					}
				}else{
					if(scroll>0){
						tv += 0.1*scalar / (p_values.length+1);
					}else{	
						tv -= 0.1*scalar / (p_values.length+1);
					}
				}
			}else if((t=="wave")){
				usermouse.scroll_accumulator += scroll;//*scalar;
				if(usermouse.scroll_accumulator > 0.22 ){
					usermouse.scroll_accumulator = 0;
					tv += 1.01 * scalar / MAX_WAVES;
				}else if(usermouse.scroll_accumulator < -0.22){
					usermouse.scroll_accumulator = 0;
					tv -= 1.01 * scalar / MAX_WAVES;
				}
				redraw_flag.flag |= 2;
			}else if((t=="float")&&(p_values[3]=="lin")){
				if(p_values.length==5){
					scalar *= p_values[4];
				}else{
					var range = p_values[2]-p_values[1];
					range = Math.floor((Math.log(Math.abs(range))/Math.log(10))-0.9);
					scalar *= Math.pow(10,range);
				}
				usermouse.scroll_accumulator += scroll;
				if(usermouse.scroll_accumulator > 0.22 ){
					usermouse.scroll_accumulator = 0;
					tv += scalar / (p_values[2] - p_values[1] );
				}else if(usermouse.scroll_accumulator < -0.22){
					usermouse.scroll_accumulator = 0;
					tv -= scalar / (p_values[2] - p_values[1] );
				}
			}else{
				tv += scroll*0.1*scalar;
			}
		}else{
			var scalar = ((alt)?0.01:1) * ((shift)?0.1:1);
			tv += scroll *0.1*scalar;
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

function keydown_not_needed_by_panel(key){
	if(sidebar.panel){
		sidebar.panel = 0;
		keydown(key);
		sidebar.panel = 1;
	}else if(key==45){
		voicecount(sidebar.selected, blocks.get("blocks["+sidebar.selected+"]::poly::voices")-1);
	}else if([43,61,555,573].indexOf(key)>-1){
		voicecount(sidebar.selected, blocks.get("blocks["+sidebar.selected+"]::poly::voices")+1);
	}
}

function keydown(key){
	if(!am_foreground) return 0;
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
	if((sidebar.panel) && (displaymode!="custom")){ //some sidebar panels capture keypresses
		if((usermouse.x>sidebar.x) && (usermouse.y>sidebar.panel_y_range[0]) && (usermouse.y<sidebar.panel_y_range[1])){
			post("\n sending keypress to sidebar ui instead ");
			ui_poly.message("setvalue",  custom_block+1, "keydown", key, usermouse.x, usermouse.y);
			return 1;
		}
	}
	if(keymap.contains("modal::"+displaymode)){
		if(keymap.contains("modal::"+displaymode+"::"+key)){
			var action = keymap.get("modal::"+displaymode+"::"+key);
			var paras = action.slice(2,99);
			//post("\nfound in keymap modal", action[0],action[1], "paras",paras);
			(eval(action[1])).apply(this,paras);
			return 1;		
		}else if(keymap.contains("modal::"+displaymode+"::all")){
			var action = keymap.get("modal::"+displaymode+"::all");
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
		// post("\nfound in keymap for sidebar mode", sidebar.mode,":", action, "paras",paras);
		(eval(action[1])).apply(this,paras);
		return 1;
	}else if(keymap.contains("global::"+key)){
		var action = keymap.get("global::"+key);
		var paras = action.slice(2,99);
		// post("\nfound in global keymap", action[0],action[1], "paras",paras);
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