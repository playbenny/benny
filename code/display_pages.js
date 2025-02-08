function set_display_mode(mode,t){
	if(mode == "custom"){
		custom_block = +t;
		last_displaymode = displaymode;
		var x1 = ((custom_block!=NaN)&&(blocktypes.contains(blocks.get("blocks["+(custom_block|0)+"]::name")+"::show_states_on_custom_view"))) ? 18+fontheight : 9;
		ui_poly.message("setvalue",  custom_block+1, "setup", x1,18+fontheight*1.1, sidebar.x-9, mainwindow_height-9,mainwindow_width);
	}else if(mode == "custom_fullscreen"){
		custom_block = +t;
		last_displaymode = displaymode;
		ui_poly.message("setvalue",  custom_block+1, "setup", 9,18+fontheight*1.1, sidebar.x2, mainwindow_height-9,mainwindow_width);
	}else if(mode == "flocks"){
		if(is_empty(flocklist)){
			mode = "blocks"; //only show flocks if there are flocks
			redraw_flag.flag=4;
		}
	}
	var blocks_enabled=(mode=="blocks");
	if(displaymode!=mode){
		if(displaymode == "block_menu") hide_block_menu();
		if((mode!="blocks")&&(mode!="panels")){
			sidebar.mode="none";
			remove_midi_scope();
			sidebar.scopes.voice = -1;
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
		}
		if(mode=="flocks"){
			flock_axes(1);
			blocks_enabled=1; //really you could/should just show the right ones for the flock view here? or maybe flock view does it TODOTODO
		}else{
			flock_axes(0);
		}
		if(mode == "blocks"){
			if(displaymode == "panels") block_and_wire_colours();
			if(displaymode == "flocks"){
				draw_blocks();
			}
		}
		displaymode=mode;
		if(mode == "block_menu"){
			if((automap.available_c>-1)&&(!automap.lock_c)){
				automap.mapped_c=-0.5;
				var maplist = [];
				var mapwrap = [];
				var maplistopv = [];
				var mapcolours = [];
				automap.groups = [];
				maplist.push(-0.5);
				mapwrap.push(1);
				maplistopv.push(-1);
				mapcolours.push(218);
				mapcolours.push(36);
				mapcolours.push(0);
				for(var pad=1;pad<automap.c_cols*automap.c_rows;pad++){
					maplist.push(-1);
					mapwrap.push(1);
					maplistopv.push(-1);
					mapcolours.push(-1);	
				}
				note_poly.message("setvalue", automap.available_c, "automapped", 1);
				note_poly.message("setvalue", automap.available_c, "automap_offset", 0);
				note_poly.message("setvalue", automap.available_c,"maplistopv",maplistopv);
				note_poly.message("setvalue", automap.available_c,"maplist",maplist);
				note_poly.message("setvalue", automap.available_c,"mapwrap",mapwrap);
				note_poly.message("setvalue", automap.available_c,"mapcolour",mapcolours);
				note_poly.message("setvalue", automap.available_c,"buttonmaplist",-1);
			}
			if(menu.search!=""){
				menu.search = "";
				type_to_search(-6);
			}
		}
		camera();
		//post("display mode set to "+mode+"\n");
		redraw_flag.flag=4;
	}else{
		if(displaymode=="panels") { 
			if(usermouse.ctrl){
				displaymode = "panels_edit";
				flock_axes(0);
				camera();
				redraw_flag.flag=4;
			}else{
				clear_blocks_selection();
			}	
		}
		if(displaymode=="blocks"){
			center_view(1);
		}
	}
	blocks_enable(blocks_enabled);	
}

function camera(){
	if(displaymode == "custom"){
		messnamed("camera_control", "position", [0,-95,0]);
	}else if(displaymode == "block_menu"){
		messnamed("camera_control", "position", [2,-93,menu.camera_scroll]); //"anim", "moveto", [0,-95,0], 0.2);
		messnamed("camera_control", "rotatexyz" , 0, 0, 0);
		messnamed("camera_control", "direction", 0, -1, 0);		
	}else if(displaymode == "blocks"){ //this could be animated too?
		messnamed("camera_control", "rotatexyz" , 0, 0, 0);
		messnamed("camera_control", "direction", 0, 0, -1);
		messnamed("camera_control", "position",  camera_position); //"anim", "moveto"
//		messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
	}else if(displaymode == "waves"){
		messnamed("camera_control", "position", [0,-95,0]);
	}else if((displaymode == "panels")||(displaymode == "panels_edit")){
		messnamed("camera_control", "position", [0,-95,0]);		
	}else if(displaymode == "flocks"){
		messnamed("camera_control", "position", [flock_cube_size*2.5,1.5*flock_cube_size,5+2.5*flock_cube_size]);
		messnamed("camera_control", "direction", -0.59, -0.48, -0.64);
	}
}

function redraw(){
	redraw_flag.flag = 0;
	if(displaymode == "blocks"){
		meters_enable=0;
		draw_blocks();
		clear_screens();
		draw_topbar();
		draw_sidebar();
		if(fullscreen) draw_clock();
	}else if(displaymode == "block_menu"){
		draw_block_menu();
	}else if(displaymode == "custom"){
		clear_screens();
		draw_topbar();
		draw_sidebar();
		draw_custom();
	}else if((displaymode == "panels")||(displaymode == "panels_edit")){
		meters_enable=0;
		clear_screens();
		draw_topbar();
		draw_sidebar();
		if(fullscreen) draw_clock();
		draw_panels();
		meters_enable=1;
	}else if(displaymode == "custom_fullscreen"){
		clear_screens();
		draw_topbar();
		draw_custom();
	}else if(displaymode == "flocks"){
		meters_enable=0;
		clear_screens();
		draw_topbar();
		draw_sidebar();
		if(fullscreen) draw_clock();
	}else if(displaymode == "waves"){
		sidebar.mode="none";
		clear_screens();
		draw_topbar();
		draw_waves();
	}
}


function get_hw_meter_positions(){
	var x=0;
	if(midi_indicators.list.length>0) x = 2;
	var inlist = []; var outlist = [];
	meter_positions = [];
	var positions = []; //hw input meter positions
	var c=0;
	for(i=0;i<MAX_USED_AUDIO_INPUTS;i++){
		if(input_used[i]) {
			inlist.push(i+1);
			positions[positions.length] = [sidebar.meters.startx + x * sidebar.meters.spread,9,8+fontheight,1+(MAX_AUDIO_VOICES*NO_IO_PER_BLOCK + c)];
			//post("\ninput meter",i,"position",positions[positions.length-1]);
			x++;
			c++;
		}
	}
	meter_positions[0] = [menucolour,menudarkest,positions];
	x++;
	//c = 0;
	positions = []; //hw output meter positions
	for(i=0;i<MAX_USED_AUDIO_OUTPUTS;i++){
		if(output_used[i]){
			outlist.push(i+1);
			positions[positions.length] = [sidebar.meters.startx + x * sidebar.meters.spread,9,8+fontheight,1+(MAX_AUDIO_VOICES*NO_IO_PER_BLOCK + c)];
			//post("\noutput meter",i,"position",positions[positions.length-1]);
			c++;
			x++;
		} 
	}
	x++;
	sidebar.meters.endx = sidebar.meters.startx + x * sidebar.meters.spread;
	meter_positions[1] = [menucolour,menudarkest,positions];
	return [inlist,outlist];
}

function draw_panels(){
	//deferred_diag.push("draw panels "+mouse_index);
	panels_custom = [];
	var i,b,x=0,y=0,h;
	var statecount;
	var block_name;
	var block_is_in_custom_order=[];
	view_changed=true;
	get_hw_meter_positions();
	panelslider_index=MAX_PARAMETERS+1;
	redraw_flag.paneltargets=[];
	var seen=[];
	if(panels_order.length){
		for(i=0;i<panels_order.length;i++){
			b=panels_order[i];
			if((seen[b]!=1)&&(blocks.get("blocks["+b+"]::panel::enable")==1)){
				block_is_in_custom_order[b]=1;
				seen[b]=1;
			}else{
				panels_order.splice(i,1);
			}
		}
	}
	for(b=0;b<MAX_BLOCKS;b++){
		if(block_is_in_custom_order[b]!=1){
			if(blocks.contains("blocks["+b+"]::panel::enable")){
				if((seen[b]!=1)&&(blocks.get("blocks["+b+"]::panel::enable")==1)){
					panels_order[panels_order.length] = b;
				}
			}
		}
	}
	var column_width;
	if(sidebar.mode != "none"){
		column_width = (sidebar.x-18 - fontheight*1.1) / MAX_PANEL_COLUMNS;
	}else{
		column_width = (mainwindow_width-18 - fontheight*1.1)/MAX_PANEL_COLUMNS;
	}
	for(i=0;i<panels_order.length;i++){
		b = panels_order[i];
		//work out height first
		h=1; //title, floating blocks?, mute
		statecount=0;
		if(SHOW_STATES_ON_PANELS){
			for(var state=0;state<MAX_STATES;state++){
				if(states.contains("states::"+state+"::"+b)) statecount++;
			}
			if(statecount>0) h+=1; //if it has states
		}
		block_name = blocks.get("blocks["+b+"]::name");
//			block_type = blocks.get("blocks["+b+"]::type");
		var has_params = 0;
		if(blocks.contains("blocks["+b+"]::panel::parameters")){
			h+=2; //if it has panelparams
			has_params = 1;
		} 
		
		var has_ui = 0;
		var ui = blocktypes.get(block_name+"::block_ui_patcher");
		if((ui!="blank.ui")&&(ui!="self")&&((ui!=null))){
			has_ui = 4;
			if(blocktypes.contains(block_name+"::ui_in_sidebar_height")){
				has_ui = Math.min(4,blocktypes.get(block_name+"::ui_in_sidebar_height"));
			}
			if(blocktypes.contains(block_name+"::no_ui_in_panel")) has_ui = 0;
			h+=has_ui;
			if(has_params) h-=0.5;
			panels_custom.push(b);
		}

		if(18+(y+h+0.9)*fontheight>mainwindow_height){
			x++;
			y=0;
			if(x>=MAX_PANEL_COLUMNS){
				//post("\npanels list overflowed, TODO scroll or autosize!");
				MAX_PANEL_COLUMNS++;
				redraw.redraw_flag=4;
				return(1);
			}
		}
		var x1 = 18 + fontheight*1.1 + x * column_width;
		if(displaymode=="panels_edit"){
			draw_panel_edit(x1,y,h,b,column_width-9);
		}else{
			draw_panel(x1,y,h,b,column_width-9,statecount,has_params,has_ui);
		}
	
		y+=h+0.1;

	}
	if((x<MAX_PANEL_COLUMNS-1)&&(MAX_PANEL_COLUMNS>2)){
		MAX_PANEL_COLUMNS--;
		redraw.redraw_flag=4;
	}
}

function draw_panel_edit(x1,y,h,b,column_width){
	var i,cx,cy,r;
//	var block_name=blocks.get("blocks["+b+"]::name");
	var block_colour = blocks.get("blocks["+b+"]::space::colour");
	block_colour = [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
//	var block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
	var block_darkest = [block_colour[0]*bg_dark_ratio, block_colour[1]*bg_dark_ratio, block_colour[2]*bg_dark_ratio];
	var x2 = x1 + column_width;
	setfontsize(fontsmall);
	lcd_main.message("paintrect",x1,18+y*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,block_darkest);
	lcd_main.message("moveto",fontheight*0.2+x1,18+y*fontheight+fontheight*1.5);
	lcd_main.message("frgb", 255, 255, 255);
	lcd_main.message("write", blocks.get("blocks["+b+"]::label"));
	cy = 18+y*fontheight+1.5*fontheight + column_width / 6;
	for(i=0;i<3;i++){
		cx = x1 + (i + 0.5) *column_width / 3;
		r = column_width /8;
		lcd_main.message("paintoval", cx-r,cy-r,cx+r,cy+r, menucolour[2],menucolour[1],menucolour[0]);
		click_oval(cx-r,cy-r,cx+r,cy+r, mouse_index,1);
		r = 0.8*r;
		lcd_main.message("paintoval", cx-r,cy-r,cx+r,cy+r, 0,0,0);
		r = 0.8*r;
		if(i==0){
			lcd_main.message("frgb", menucolour[2],menucolour[1],menucolour[0]);	
			lcd_main.message("paintpoly",cx-r,cy,cx,cy-r,cx+r,cy,cx-r,cy);
			mouse_click_actions[mouse_index] = panel_edit_button;
			mouse_click_parameters[mouse_index] = b;
			mouse_click_values[mouse_index] = "up";
		}else if(i==1){
			mouse_click_actions[mouse_index] = panel_edit_button;
			mouse_click_parameters[mouse_index] = b;
			mouse_click_values[mouse_index] = "down";
			lcd_main.message("frgb", menucolour[2],menucolour[1],menucolour[0]);	
			lcd_main.message("paintpoly",cx-r,cy,cx,cy+r,cx+r,cy,cx-r,cy, menucolour[2],menucolour[1],menucolour[0]);
		}else{
			mouse_click_actions[mouse_index] = panel_edit_button;
			mouse_click_parameters[mouse_index] = b;
			mouse_click_values[mouse_index] = "hide";
			lcd_main.message("moveto",cx-r,cy+fontheight*0.3);
			lcd_main.message("frgb", menucolour[2],menucolour[1],menucolour[0]);	
			lcd_main.message("write","hide");	
		}
		mouse_index++;
	}
}

function draw_panel(x1,y,h,b,column_width,statecount,has_params,has_ui){
	var has_states = (statecount > 0);
	var i;
	var block_name=blocks.get("blocks["+b+"]::name");
	var block_colour = blocks.get("blocks["+b+"]::space::colour");
	block_colour = [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
	var block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
	var block_darkest = [block_colour[0]*bg_dark_ratio, block_colour[1]*bg_dark_ratio, block_colour[2]*bg_dark_ratio];
	if(sidebar.selected==b) block_colour = [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
	var x2 = x1 + column_width;
	cur_font_size=0;
	setfontsize(fontsmall);
	lcd_main.message("paintrect",x1,18+y*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,block_darkest);
	click_rectangle(x1,18+y*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,mouse_index,1);
	mouse_click_actions[mouse_index] = select_block;
	mouse_click_parameters[mouse_index] = b;
	mouse_click_values[mouse_index] = b;
	mouse_index++;
	
	lcd_main.message("moveto",fontheight*0.2+x1,18+y*fontheight+fontheight*1.7);
	lcd_main.message("frgb", block_colour);
	lcd_main.message("write", blocks.get("blocks["+b+"]::label"));
	
	if(usermouse.clicked2d == mouse_index){
		lcd_main.message("paintrect", x2-fontheight*1, 18+y*fontheight+fontheight*1.1,x2-fo1, 18+y*fontheight+fontheight*1.9 ,block_colour);
		lcd_main.message("frgb", 128,128,128);
	}else if(blocks.get("blocks["+b+"]::mute")){
		lcd_main.message("paintrect", x2-fontheight*1, 18+y*fontheight+fontheight*1.1,x2-fo1, 18+y*fontheight+fontheight*1.9 ,128,128,128);
		lcd_main.message("frgb", block_darkest);
	}else{
		lcd_main.message("paintrect", x2-fontheight*1, 18+y*fontheight+fontheight*1.1,x2-fo1, 18+y*fontheight+fontheight*1.9 ,block_dark);
		lcd_main.message("frgb", block_darkest);// 128,128,128);
	}
	click_rectangle( x2-fontheight*1, 18+y*fontheight+fontheight*1.1,x2-fo1, 18+y*fontheight+fontheight*1.9 ,mouse_index,1);
	lcd_main.message("moveto", x2-fontheight*0.9, 18+y*fontheight+fontheight*1.7 );
	lcd_main.message("write", "mute");
	mouse_click_actions[mouse_index] = mute_particular_block;
	mouse_click_parameters[mouse_index] = b;
	mouse_click_values[mouse_index] = -1;
	mouse_index++;
	
	var has_meters=0;
	var mx=0;
	var positions = []; 
	var subvoices = 1;
	if(blocks.contains("blocks["+b+"]::subvoices")) subvoices = blocks.get("blocks["+b+"]::subvoices");
	var vl = voicemap.get(b);
	if(!Array.isArray(vl)) vl = [vl];
	if(blocktypes.contains(block_name+"::connections::out::audio")){
		has_meters=1;
		var mll =blocktypes.getsize(block_name+"::connections::out::audio");
		if(subvoices>1) mll=subvoices;
		if(vl !== 'null'){
			for(var vm=0;vm<vl.length;vm++){
				for(i=0;i<mll;i++){
					positions[positions.length] = [mx*sidebar.meters.spread, 18+y*fontheight+fontheight*1.1, 16+y*fontheight+fontheight*1.9, 1+((vl[vm] - MAX_NOTE_VOICES)+MAX_AUDIO_VOICES*i)];
					mx++;
				}
				mx++;
			}
		}
	}
/*	if(blocktypes.contains(block_name+"::connections::out::hardware")) { //DO HW INS TOO
		has_meters=1;
		mlist=blocktypes.get(block_name+"::connections::out::hardware_channels");
		for(i=0;i<mlist.length;i++){
			positions[positions.length] = [mx*sidebar.meters.spread, 18+y*fontheight+fontheight*1.1, 18+y*fontheight+fontheight*1.9, 1+(MAX_AUDIO_VOICES*NO_IO_PER_BLOCK + mlist[i])];
			mx++;
		}
	}*/ //at the moment i have no hardware blocks that have parameters to test this with.
	if(has_meters){
		mx = x2-fontheight*1 - sidebar.meters.spread - positions[positions.length-1][0];
		for(i=0;i<positions.length;i++) positions[i][0]=positions[i][0]+mx;
		//post("adding",positions.length,"positions to meters",meter_positions.length);
		meter_positions[meter_positions.length] = [block_colour,block_dark,positions];	
	}

	
	if(has_states){
		var cll = config.getsize("palette::gamut")/MAX_STATES;
		var c = new Array(3);	
		var st=0;	
		var statecontents = "states::current::"+b;
		for(state=0;state<=MAX_STATES;state++){
			if(states.contains(statecontents)){
				if(state==0){
					c = [0,0,0];
				}else{
					c = config.get("palette::gamut["+Math.floor((state-1)*cll)+"]::colour");
				}
				lcd_main.message("paintrect",x1+(st/(statecount+1))*column_width,18+(y+2)*fontheight,x1+((st+1)/(statecount+1))*column_width,18+(y+2.9)*fontheight,c[0],c[1],c[2]);
				click_rectangle(x1+(st/(statecount+1))*column_width,18+(y+2)*fontheight,x1+((st+1)/(statecount+1))*column_width,18+(y+2.9)*fontheight,mouse_index,1);
				mouse_click_actions[mouse_index] = fire_block_state;
				if(state==0){
					mouse_click_parameters[mouse_index] = "current";
				}else{
					mouse_click_parameters[mouse_index] = state-1;
				}
				mouse_click_values[mouse_index] = b;
				mouse_index++;
				st++;
			}
			statecontents = "states::"+state+"::"+b;
		}
	}
	if(has_params){ //has panelparams
		panelslider_visible[b]=[];
		var plist = blocks.get("blocks["+b+"]::panel::parameters");
		var glist = blocktypes.get(block_name+"::groups");
		var params = blocktypes.get(block_name+"::parameters");
		if(!Array.isArray(params)) params = [params];
		if(!Array.isArray(plist)) plist = [plist];
		try{
			for(var p=0;p<plist.length;p++){
				var p_type = params[plist[p]].get("type");
				var wrap = params[plist[p]].get("wrap");
				//var namearr = params[plist[p]].get("name");
				var noperv = 1; //params[plist[p]].contains("nopervoice");
				var p_values = params[plist[p]].get("values");
				var flags = (p_values[0]=="bi") + 4*noperv;
				if(!noperv){
					for(var g=0;g<glist.length;g++){
						var cont = glist[g].get("contains");
						if(!Array.isArray(cont)) cont=[cont];
						var gi = cont.indexOf(plist[p]);
						if(gi>-1){
							if(glist[g].contains("onepervoice")) flags |= 2;
						}
					}
					//look up what group contains this param, look up if that group has onepervoice flag
				}			
				//namearr = namearr.split("_");
				var namelabely = 18+(y+2+has_states+0.4)*fontheight;
				var h_slider = 0;
				panelslider_visible[b][plist[p]]=panelslider_index;
				var curp = plist[p];
				var y1 = 18+(y+2+has_states)*fontheight;
				var y2 = 18+(y+3.9-0.5*(has_ui>0)+has_states)*fontheight;
				if((p_type=="menu_d")||(((p_type=="menu_b")||(p_type=="menu_l")) && (vl.length != 1))) p_type = "menu_i";
				if(p_type=="button"){
					paramslider_details[panelslider_index]=[x1+(p/plist.length)*column_width,y1,x1-2+((p+1)/plist.length)*column_width,y2,block_colour[0]/2,block_colour[1]/2,block_colour[2]/2,mouse_index,b,curp,flags,vl[0],namelabely,p_type,wrap,block_name,h_slider,p_values];
					parameter_button(panelslider_index);
					mouse_click_actions[mouse_index] = send_button_message;
					mouse_click_parameters[mouse_index] = b;
					mouse_index++;
				}else if((p_type=="menu_l")){
					var h_s=h_slider;
					if(h_slider==0){
						h_s=1.5;
					}else{
						if(maxnamelabely>0){
							h_s = (maxnamelabely - y_offset)/fontheight;
						}else{
							h_s += 0.9;
						}
					}
					var cols=1;
					if(params[curp].contains("columns")) cols = params[curp].get("columns");
					if(p_values.length/cols > cols) cols = (p_values.length/cols) |0;
					var valcol;
					if(params[curp].contains("colours")){
						valcol = params[curp].get("colours");
					}else{
						valcol = [block_colour];
					}
					paramslider_details[panelslider_index]=[x1+(p/plist.length)*column_width,y1,x1-2+((p+1)/plist.length)*column_width,y2,valcol,0,0,mouse_index,b,curp,flags,cols,statecount,p_type,wrap,vl[0],h_s,p_values];
					mouse_index = parameter_menu_l(panelslider_index);
				}else if((p_type=="menu_b")){
					var statecount = (p_values.length);
					pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*b+curp);
					var ppv2 = Math.floor(pv * statecount * 0.99999);
					pv = voice_parameter_buffer.peek(1, MAX_PARAMETERS*vl[0]+curp);
					var pv2 = Math.floor(pv * statecount * 0.99999);
					var valcol;
					if(params[curp].contains("colours")){
						valcol = params[curp].get("colours["+pv2+"]");
					}else{
						var pv3;
						if(statecount==2){
							pv3 = pv*0.9 + 0.3;
						}else{
							pv3 = pv*0.6 + 0.7;
						}
						valcol = [pv3*block_colour[0], pv3*block_colour[1], pv3*block_colour[2]];
					}
					paramslider_details[panelslider_index]=[x1+(p/plist.length)*column_width,y1,x1-2+((p+1)/plist.length)*column_width,y2,valcol[0],valcol[1],valcol[2],mouse_index,b,curp,flags,vl[0],namelabely,p_type,wrap,block_name,h_slider];
					parameter_menu_b(panelslider_index);
					mouse_click_actions[mouse_index] = send_button_message;
					mouse_click_parameters[mouse_index] = b;
					mouse_click_values[mouse_index] = ["param","",MAX_PARAMETERS*b+curp, ((ppv2+1.1) % statecount)/statecount];
					mouse_index++;
				}else{
					namearr = params[curp].get("name");
					namearr = namearr.split("_");
					var click_to_set = 0;
					if(params[curp].contains("click_set")) click_to_set = params[curp].get("click_set");
					if(h_slider<1){
						paramslider_details[panelslider_index]=[x1+(p/plist.length)*column_width,y1,x1-2+((p+1)/plist.length)*column_width,y2,block_colour[0]/2,block_colour[1]/2,block_colour[2]/2,mouse_index,b,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider,0,click_to_set];
					}else{
						paramslider_details[panelslider_index]=[x1+(p/plist.length)*column_width,y1,x1-2+((p+1)/plist.length)*column_width,y2,block_colour[0],block_colour[1],block_colour[2],mouse_index,b,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider,0,click_to_set];
					}
					namelabely = labelled_parameter_v_slider(panelslider_index);
					paramslider_details[panelslider_index][17]=namelabely;
					//paramslider_details is used for quick redraw of a single slider. index is curp
					//ie is mouse_click_parameters[index][0]
					mouse_click_actions[mouse_index] = sidebar_parameter_knob;
					mouse_click_parameters[mouse_index] = [panelslider_index, b,wrap];
					if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")||(p_type=="menu_l")||(p_type=="wave")){
						//if it's a menu_b or menu_i store the slider index + 1 in mouse-values
						mouse_click_values[mouse_index] = curp+1;
					}else{
						mouse_click_values[mouse_index] = "";
					}								
					mouse_index++;
				}
				panelslider_index++;
			}
		}catch(err){error("\npanels params error ",p,plist[p],b,block_name, err.name,err.message);}
	}else{
		panelslider_visible[b]=[];
	}
	if(has_ui){
		if(!blocktypes.contains(block_name+"::no_edit")){
			click_rectangle( x1,18+(y+h-has_ui)*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,mouse_index,1);
			mouse_click_actions[mouse_index] = set_display_mode;
			mouse_click_parameters[mouse_index] = "custom";
			mouse_click_values[mouse_index] = b;
			mouse_index++; //if the ui patcher doesn't make the area clickable, it clicks through to the full size ui
		}
		ui_poly.message("setvalue",  b+1, "setup", x1,18+(y+h-has_ui)*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,mainwindow_width);
	}
}

function draw_waves(){
	messnamed("update_wave_colls","bang");
	var num_slots = MAX_WAVES;//waves_dict.getsize("waves");
	var slot;
	var c=new Array(3);
	var slot_h = mainwindow_height*0.16;
	var bigsloth = mainwindow_height*0.7;//-fontheight*10.2-18; 
	setfontsize(fontsmall*2);
	var colinc = config.getsize("palette::gamut") / (num_slots+1);
	var sloty = fontheight+fo1+9-waves.scroll_position;
	//post("\nwavescr",waves.scroll_position);
	for(slot=0;slot<(num_slots);slot++){
		if((sloty>fontheight)&&(sloty<mainwindow_height)){
			if(waves_dict.contains("waves["+(slot+1)+"]::name")){
				if(slot==waves.selected){
					//draw controls bar and zoomed wave
					c=config.get("palette::gamut["+Math.floor(slot*colinc)+"]::colour");
					lcd_main.message("framerect",9, sloty, sidebar.x2,sloty+0.9*fontheight,c[0],c[1],c[2]);
	
					c=config.get("palette::gamut["+Math.floor(1+slot*colinc)+"]::colour");
					draw_h_slider(sidebar.x2-17*fontheight,sloty+fo1,sidebar.x2-13.1*fontheight,sloty+fontheight*0.7,c[0],c[1],c[2],mouse_index,waves_dict.get("waves["+(slot+1)+"]::start"));
					mouse_click_actions[mouse_index] = setup_waves;
					mouse_click_parameters[mouse_index] = [slot+1,"start"];
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
	
					c=config.get("palette::gamut["+Math.floor(2+slot*colinc)+"]::colour");
					draw_h_slider(sidebar.x2-13*fontheight,sloty+fo1,sidebar.x2-9.1*fontheight,sloty+fontheight*0.7,c[0],c[1],c[2],mouse_index,waves_dict.get("waves["+(slot+1)+"]::end"));
					mouse_click_actions[mouse_index] = setup_waves;
					mouse_click_parameters[mouse_index] = [slot+1,"end"];
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
	
					c=config.get("palette::gamut["+Math.floor(3+slot*colinc)+"]::colour");
					draw_h_slider(sidebar.x2-9*fontheight,sloty+fo1,sidebar.x2-5*fontheight,sloty+fontheight*0.7,c[0],c[1],c[2],mouse_index,waves_dict.get("waves["+(slot+1)+"]::divisions"));
					mouse_click_actions[mouse_index] = setup_waves;
					mouse_click_parameters[mouse_index] = [slot+1,"divisions"];
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
	
					lcd_main.message("paintrect",sidebar.x2-3*fontheight,sloty+fo1,sidebar.x2,sloty+fontheight*0.7,255,0,0);
					click_rectangle(sidebar.x2-3*fontheight,sloty+fo1,sidebar.x2,sloty+fontheight*0.7,mouse_index,1);
					mouse_click_actions[mouse_index] = delete_wave;
					mouse_click_parameters[mouse_index] = slot;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					lcd_main.message("frgb",menucolour);
					lcd_main.message("moveto",sidebar.x2-2.7*fontheight,sloty+fontheight*0.6);
					setfontsize(fontsmall);
					lcd_main.message("textface","normal");
					lcd_main.message("write","delete");
					
					c=config.get("palette::gamut["+Math.floor(4+slot*colinc)+"]::colour");
					draw_stripe(9,sloty+fontheight*0.8,sidebar.x2,sloty+fontheight*1.8,c[0],c[1],c[2],slot+1,mouse_index);
					mouse_click_actions[mouse_index] = wave_stripe_click;
					mouse_click_parameters[mouse_index] = slot;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					lcd_main.message("frgb",menucolour);//config.get("palette::gamut["+Math.floor(4+slot*colinc)+"]::colour"))
					lcd_main.message("moveto",18,sloty+fontheight*0.6);
					setfontsize(fontsmall*1.5);
					lcd_main.message("textface","bold");
					lcd_main.message("write",slot+1,waves_dict.get("waves["+(slot+1)+"]::name"));
					setfontsize(fontsmall);
					lcd_main.message("textface","normal");
					lcd_main.message("moveto",mainwindow_width-17*fontheight,sloty+fontheight*0.6);
					lcd_main.message("write","start");
					lcd_main.message("moveto",mainwindow_width-13*fontheight,sloty+fontheight*0.6);
					lcd_main.message("write","end");
					lcd_main.message("moveto",mainwindow_width - 9*fontheight,sloty+fontheight*0.6);
					lcd_main.message("write","divisions:",Math.floor(1+(MAX_WAVES_SLICES-0.0001)*waves_dict.get("waves["+(slot+1)+"]::divisions")));
					draw_zoomable_waveform(9,sloty+fontheight*1.8,sidebar.x2,sloty+bigsloth+slot_h-fo1,c[0],c[1],c[2],slot+1,mouse_index,2);
					mouse_click_actions[mouse_index] = zoom_waves;
					mouse_click_parameters[mouse_index] = slot;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					
					sloty+=bigsloth;
				}else{
					c=config.get("palette::gamut["+Math.floor(3+slot*colinc)+"]::colour");
					draw_stripe(9,sloty,sidebar.x2,sloty+slot_h-fo1,c[0],c[1],c[2],slot+1,mouse_index);
					mouse_click_actions[mouse_index] = wave_stripe_click;
					mouse_click_parameters[mouse_index] = slot;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					lcd_main.message("frgb",menucolour);//config.get("palette::gamut["+Math.floor(4+slot*colinc)+"]::colour"))
					lcd_main.message("moveto",18,sloty+fontheight*0.32);
					setfontsize(fontsmall);
					lcd_main.message("textface","bold");
					lcd_main.message("write",slot+1,waves_dict.get("waves["+(slot+1)+"]::name"));
				}
				
			}else{
				//draw placeholder marker that's a load button
				c=config.get("palette::gamut["+Math.floor(3+slot*colinc)+"]::colour");
				lcd_main.message("framerect",9,sloty,sidebar.x2,sloty+slot_h-fo1,c[0],c[1],c[2]);
				//lcd_main.message("frgb",menudark);
				lcd_main.message("moveto",18,sloty+fontheight*0.32);
				setfontsize(fontsmall);
				lcd_main.message("textface","bold");
				lcd_main.message("write",slot+1,"---");
				click_rectangle(9,sloty,sidebar.x2,sloty+slot_h-fo1,mouse_index,1);
				mouse_click_actions[mouse_index] = load_wave;
				mouse_click_parameters[mouse_index] = slot;
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
			}
		}
		sloty+=slot_h;
	}
	lcd_main.message("frgb", menudarkest);
	lcd_main.message("moveto",mainwindow_width-5,9);
	lcd_main.message("lineto",mainwindow_width-5,mainwindow_height-9);		
	var l = (mainwindow_height-18) / (/*mainwindow_height + sidebar.scroll.max*/ slot_h*(MAX_WAVES-1)+bigsloth - 18);
	var l2 = (mainwindow_height-18) * l;
	var p = waves.scroll_position * l + 9;
	lcd_main.message("frgb", menucolour);
	lcd_main.message("moveto",mainwindow_width-5,p);
	lcd_main.message("lineto",mainwindow_width-5,p+l2);
	//click zone for the scrollbar
	click_zone(scroll_waves, null, null, sidebar.x2,0,mainwindow_width+2,mainwindow_height,mouse_index,2);

	lcd_main.message("bang");
	//outlet(8,"bang");
}

function draw_custom(){
	ui_poly.message("setvalue",  custom_block+1, "draw");
}

function update_custom(){
	ui_poly.message("setvalue",  custom_block+1, "update");
}

function update_custom_panels(){
	for(var i=0;i<panels_custom.length;i++){
		ui_poly.message("setvalue",  panels_custom[i]+1, "update");
	}
}

function draw_block_menu(){
	initialise_block_menu(1);
	lcd_main.message("brgb", backgroundcolour_block_menu);
	click_clear(0,0);
//	mouse_click_actions[0] = pan_background;
	mouse_click_parameters[0] = 0;
	mouse_click_values[0] = 0;	
	draw_menu_hint();
}

function hide_block_menu(){
	post("\nhiding block menu\n");
	messnamed("menu_multiple","enable",0);
	//for(var i=0;i<menu.cubecount;i++){
	//	blocks_menu[i].enable = 0;
	//}
}

function reinitialise_block_menu(){
	/*for(var b in blocks_menu){
		if(blocks_menu[b]!=="undefined") blocks_menu[b].freepeer()
	}*/
	blocks_menu=[];
}

function initialise_block_menu(visible){	
	visible |= 0;	
	var i; // draw cubes distributed on the xz plane, rotated 90 degrees about the x axis, y = -110
	var t;
	var z = -5;
	var x = -5;
	var types = [];
	var type_order = config.get("type_order");
	types = blocktypes.getkeys();
	var ts,swpt=0;
	var col;
	var vis=0;
	if(typeof blocks_menu[0] !== "undefined"){ //we've already done the work here, just need to dim used blocks
		//post("\nA showing block menu",visible);
		if(menu.mode == 1){
			swpt = blocks.get("blocks["+menu.swap_block_target+"]::type");
			if(swpt=="hardware") swpt = "audio";
		}
		for(i=0;i<menu.cubecount;i++){
			if((blocktypes.contains(types[i]+"::deprecated") && blocktypes.get(types[i]+"::deprecated")==1)){
				//skip this one
				//				post("\n\n",types[i]," is deprecated",blocktypes.get(types[i]+"::deprecated"));
			}else{
				if(visible==1){
					vis=1;	
					if((menu.mode == 1)&&!(menu.show_all_types)){
						var tt = blocktypes.get(types[i]+"::type");
						if(tt=="hardware") tt="audio";
						if(tt != swpt) vis=0; //this is for swap mode, you can only swap an audio into an audio, etc
					}
					if(blocktypes.contains(types[i]+"::exclusive")){
						for(t = 0;t<MAX_BLOCKS;t++){
							if(blocks.get("blocks["+t+"]::name") == types[i]){
								vis=0; // this is to hide blocks eg clock when there's one already out (as you can't have more than one of them)
							}
						}
					}
				}
				blocks_menu[i].enable = vis;
				blocks_menu[i].position = menu.original_position[i];
			}
		}
		if(menu.mode == 1) squash_block_menu();
		write_menu_matrix();
		messnamed("menu_multiple","enable",visible);
	}else{
		post("\ninitialising block menu");
		var w = 4 - (Math.max(0,Math.min(3,((mainwindow_height/mainwindow_width)-0.4)*5)) |0 );
		for(var typ in type_order){
			z++;
			z+=0.5;
			x=-w;
			for(i=0;i<menu.cubecount;i++){
				ts=types[i].split('.');
				if(ts[0]==type_order[typ]){
					if((blocktypes.contains(types[i]+"::deprecated") && blocktypes.get(types[i]+"::deprecated")==1)){
						//skip this one
						//	post("\n\n",types[i]," is deprecated",blocktypes.get(types[i]+"::deprecated"));
						/*blocks_menu[i] = new JitterObject("jit.gl.gridshape","benny");
						blocks_menu[i].name = "menu_"+types[i]+"_"+i;
						blocks_menu[i].shape = "cube";*/
						//blocks_menu[i].enable = 0; //1;//0;//1; just set it to zero as you're initialising, you'll show it later.

						blocks_menu[i]={ color:[],position:[],scale:[],name:"" };
						blocks_menu[i].color = [1,1,1,1]; //[col[0]/256,col[1]/256,col[2]/256,1];
						blocks_menu[i].position = [1000, 1000, 1000];
						blocks_menu[i].scale = [0.45, 0.45, 0.45];
						menu.original_position[i]=[1000,1000,1000];
					}else{
						//	post("\ndrawing menu texture:",i," label is ",ts,"\n");
						messnamed("texture_generator","menu",i);
						col = blocktypes.get(types[i]+"::colour");
						lcd_block_textures.message("brgb",col);
						lcd_block_textures.message("clear");
						lcd_block_textures.message("frgb",255,255,255);
						lcd_block_textures.message("font",mainfont,16);
						lcd_block_textures.message("textface","normal");
						for(var t=0;t<ts.length;t++){
							lcd_block_textures.message("moveto",5, 28+t*27);
							lcd_block_textures.message("write",ts[t].replace(/_/g,' '));
							if(t==0){
								lcd_block_textures.message("textface","bold");
								lcd_block_textures.message("font",mainfont,27);
							}
						}
						lcd_block_textures.message("bang");
						
						if(x>w){
							z++;
							x=-w;
						}
						blocks_menu[i]={ color:[],position:[],scale:[],name:"" };
						//col = config.get("palette::"+ts[0]);
						//						post("drawing menu block",ts);
						/*blocks_menu[i] = new JitterObject("jit.gl.gridshape","benny");
						blocks_menu[i].name = "menu_"+types[i]+"_"+i;
						blocks_menu[i].shape = "cube";*/
						blocks_menu[i].color = [1,1,1,1]; //[col[0]/256,col[1]/256,col[2]/256,1];
						blocks_menu[i].position = [x, -110, z];
						menu.original_position[i]=[x,-110,z];
						blocks_menu[i].scale = [0.45, 0.45, 0.45];
						blocks_menu[i].name = types[i];
						//blocks_menu[i].enable = 0; //1;//0;//1; just set it to zero as you're initialising, you'll show it later.
						/*blocks_menu[i].texture = blocks_menu_texture[i];
						blocks_menu[i].tex_map = 1;
						blocks_menu[i].texzoom = [1,1];
						blocks_menu[i].texanchor = [0.5,0.5];
						blocks_menu[i].tex_plane_s = [0.5,0,0,0.5];
						blocks_menu[i].tex_plane_t = [0,1,-0.5,-0.5];*/
						x++;					
					}
				}
			}
		}
		menu.length = z;
		blocks_tex_sent = []; // this is a good moment to ask for a redraw of any blocks that are loaded by now's textures
		initialise_block_menu(visible); //to hide the core blocks if they're already loaded
	}
}


function blocks_enable(enab){ //shows or hides all the blocks/wires
	/*for(var i=0;i<blocks_cube.length;i++){
		if(typeof blocks_cube[i] !== 'undefined'){
			for(var t=0;t<blocks_cube[i].length;t++){
				blocks_cube[i][t].enable = enab;
			}
		}
	}*/
	messnamed("blocks_multiple","enable",enab);
	messnamed("wires_multiple","enable",enab);
	messnamed("voices_multiple","enable",enab);
	messnamed("meters_multiple","enable",enab);
}

function block_meters_enable(enab){ //never used now?
	messnamed("meters_multiple","enable",enab);
}

function block_and_wire_colours(){ //for selection and mute etc
	if(displaymode != "blocks") return -1;
	var i, t, cmute,tmc,segment,cs;
	var block_c=[];
	var block_v, subvoices, block_mute;
	var tree_highlight = [];
	var tree_highlight_c = [];
	selected.anysel = 0;
	if((selected.block.indexOf(1)>-1) || (selected.wire.indexOf(1)>-1)){
		selected.anysel = 1;
		var count=0;
		for(i=0;i<MAX_BLOCKS;i++){
			count+=selected.block[i];
			tree_highlight[i]=0;
		}
		if(count==1){
			tree_highlight[selected.block.indexOf(1)]=1;
			var gsc=connections.getsize("connections");
			for(i=gsc;i>=0;i--) tree_highlight_c[i]=0;
			for(var pass=0;pass<1;pass++){
				for(i=gsc;i>=0;i--){
					if((tree_highlight_c[i]==0)&&(connections.contains("connections["+i+"]::from"))){
						if(connections.get("connections["+i+"]::conversion::mute")==0){
							var f = connections.get("connections["+i+"]::from::number");
							if(tree_highlight[f]==1){
								var t = connections.get("connections["+i+"]::to::number");
								if(tree_highlight[t]==0){
									tree_highlight_c[i] = 1;
									if(blocks.get("blocks["+t+"]::mute")==0){
										tree_highlight[t] = 1;
										pass=-1;
									}
								}
							}
						}
					}
				}
			}
		}
	}
	var search=(sidebar.mode=="edit_state"); //if search==1 this is about highlighting blocks to the user, so dark ones are darker, mute doesn't darken so much, wires don't get the highlight
	anymuted=0;
	var subv=1; //
	for(i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			draw_block_texture(i);
			block_c = [1,1,1,1]; //the first one is white, the others have no texture
			block_mute = blocks.get("blocks["+i+"]::mute");
			block_v = blocks.get("blocks["+i+"]::poly::voices");
			subvoices = Math.max(1,blocks.get("blocks["+i+"]::subvoices"));
			if(sidebar.selected==i) subv=subvoices;
			if(block_mute){
				anymuted=1;
			}
			if(typeof blocks_cube[i] !== "undefined"){
				for(t=0;t<=block_v*subvoices;t++){
					var csc=1;
					if(typeof blocks_cube[i][t] !== "undefined"){
						var p = blocks_cube[i][t].position;
						if(selected.anysel){
							if(selected.block[i]){ //
								if((sidebar.selected_voice==-1)){
									blocks_cube[i][t].color = [1.1*block_c[0],1.1*block_c[1],1.1*block_c[2],1]; //block_c; 
								}else if((t>0)&&((sidebar.selected_voice) == (((t-1)/subvoices)|0))){
									blocks_cube[i][t].color = [1.1*block_c[0],1.1*block_c[1],1.1*block_c[2],1]; //block_c;
								}else{
									blocks_cube[i][t].color = [0.4*block_c[0],0.4*block_c[1],0.4*block_c[2],1]; 
								}
								blocks_cube[i][t].position = [p[0],p[1],SELECTED_BLOCK_Z_MOVE];
							}else{
								csc = 0.3 + 0.4*tree_highlight[i];
								if(block_mute||search) csc = 0.2;
								blocks_cube[i][t].color = [csc*block_c[0],csc*block_c[1],csc*block_c[2],1];
								blocks_cube[i][t].position = [p[0],p[1],SELECTED_BLOCK_DEPENDENTS_Z_MOVE*(2*tree_highlight[i]-1)];
								if((t>0) && (blocks_meter[i][t*2-1] != null)){
									blocks_meter[i][t-1].color = [csc*(METER_TINT+mt*block_c[0]),csc*(METER_TINT+mt*block_c[1]),csc*(METER_TINT+mt*block_c[2]),1];
								}
							}
						}else{
							if(block_mute){
								blocks_cube[i][t].color = [0.3*block_c[0],0.3*block_c[1],0.3*block_c[2],1];	
								csc = 0.3;
							}else{
								blocks_cube[i][t].color = block_c;
							}
							blocks_cube[i][t].position = [p[0],p[1],0];
						}
						if(t==1){
							var mt=Math.sqrt(1-METER_TINT);
							var mco;
							if(selected.block[i]){
								mco = [1,1,1,1];
							}else{
								mco = [csc*(METER_TINT+mt*block_c[0]),csc*(METER_TINT+mt*block_c[1]),csc*(METER_TINT+mt*block_c[2]),1];
							} 
							for(var m = blocks_meter[i].length-1;m>=0;m--){
								blocks_meter[i][m].color = mco;
							}
						}
					}
					
					if(t==0){
						block_c = blocks.get("blocks["+i+"]::space::colour");
						block_c[0] /= 256;
						block_c[1] /= 256;
						block_c[2] /= 256;
					}
				}
			}
		}
	}
	for(i=connections.getsize("connections")-1;i>=0;i--){
		if((connections.contains("connections["+i+"]::conversion::mute"))){
			var cfrom = connections.get("connections["+i+"]::from::number");
			var cto = connections.get("connections["+i+"]::to::number");
			cs = selected.wire[i];
			if(selected.anysel && !cs){
				if(selected.block[cfrom]){
					if((sidebar.selected==cfrom)&&(sidebar.selected_voice>-1)){
						var cfromv = connections.get("connections["+i+"]::from::voice");
						if(cfromv=="all"){
							cs=1;
						}else{
							if(connections.get("connections["+i+"]::from::output::type")=="audio"){
								if(!Array.isArray(cfromv)) cfromv=[cfromv];
								for(var compvoice = (sidebar.selected_voice*subv)+1;compvoice<=(sidebar.selected_voice*subv)+subv;compvoice++){
									if(cfromv.indexOf(compvoice)>-1) cs=1;
								}
							}							
						}
					}else{
						cs = 1;
					}
				}else if(selected.block[cto]){
					if((sidebar.selected==cto)&&(sidebar.selected_voice>-1)){
						var ctov = connections.get("connections["+i+"]::to::voice");
						if(ctov=="all"){
							cs=1;
						}else{
							if(connections.get("connections["+i+"]::to::input::type")=="audio"){
								if(!Array.isArray(ctov)) ctov=[ctov];
								for(var compvoice = (sidebar.selected_voice*subv)+1;compvoice<=(sidebar.selected_voice*subv)+subv;compvoice++){
									if(ctov.indexOf(compvoice)>-1) cs=1;
								}
							}	
						}
					}else{
						cs = 1;
					}
				}
			}
			//draw_wire(i);
			if(wires_colours[i].length>=wires_colour[i].length){
				for(segment=0;segment<wires_colour[i].length;segment++){
					tmc=0.3;
					tmc *= (1-0.8*selected.anysel*(0.3 - 1.5*cs));
					if(cmute){
						wires_colour[i][segment] = [tmc*MUTEDWIRE[0],tmc*MUTEDWIRE[1],tmc*MUTEDWIRE[2]];
					}else{
						wires_colour[i][segment] = [tmc*wires_colours[i][segment][0],tmc*wires_colours[i][segment][1],tmc*wires_colours[i][segment][2]];	
					}
				}		
			}
		}
	}
	write_wires_matrix();
}


function draw_block(i){ //i is the blockno, we've checked it exists before this point
	//post("drawing block",i,"\n");
	var vc=0; var bc=0; var mc=0;
	draw_block_texture(i);
	block_x = blocks.get("blocks["+i+"]::space::x");
	block_y = blocks.get("blocks["+i+"]::space::y");
	block_z = SELECTED_BLOCK_Z_MOVE * selected.block[i];
	block_c = blocks.get("blocks["+i+"]::space::colour");
	block_mute = blocks.get("blocks["+i+"]::mute");
	if(block_mute){
		block_c = [block_c[0]*0.3, block_c[1]*0.3, block_c[2]*0.3];//config.get("palette::muted");
	}
	block_v = blocks.get("blocks["+i+"]::poly::voices");
	block_name = blocks.get("blocks["+i+"]::name");
	block_label = blocks.get("blocks["+i+"]::label");
	block_type = blocks.get("blocks["+i+"]::type");
	var subvoices = 1;
	if(blocks.contains("blocks["+i+"]::subvoices")){
		subvoices = blocks.get("blocks["+i+"]::subvoices");
	} 
	if(block_x<blocks_page.leftmost) blocks_page.leftmost = block_x;
	var block_x2 = block_x + block_v * 0.5;
	if(block_x2>blocks_page.rightmost) blocks_page.rightmost = block_x2;
	if(block_y<blocks_page.lowest) blocks_page.lowest = block_y;
	if(block_y>blocks_page.highest) blocks_page.highest = block_y;
	
	if(!Array.isArray(blocks_cube[i])){
		blocks_cube[i] = [];
		blocks_meter[i] = [];
	}

	var tt=0;
	var noio=0, max_poly=1;
	if(blocktypes.contains(block_name+"::max_polyphony")) max_poly = blocktypes.get(block_name+"::max_polyphony");
	if(blocktypes.contains(block_name+"::connections::in::hardware_channels")){
		noio += blocktypes.getsize(block_name+"::connections::in::hardware_channels");
	}
	if(blocktypes.contains(block_name+"::connections::out::hardware_channels")){
		noio += blocktypes.getsize(block_name+"::connections::out::hardware_channels");
	}						
	noio /= max_poly;
	for(t=0;t<=block_v*subvoices;t++){
		if(is_empty(blocks_cube[i][t])) {
			var col;
			if(block_mute){
				col = [0.3,0.3,0.3,1];
			}else if(selected.anysel){
				if(selected.block[i]){
					col = [1,1,1,1];
				}else{
					col = [0.4,0.4,0.4,1]; 
				}
			}else{
				col = [1,1,1,1];
			}
			blocks_cube[i][t] = {
				position : [],
				scale : [],
				color : []
			}
		
			if(t==0){
				bc++;
				blocks_cube[i][0].scale = [0.45, 0.45, 0.45];
				blocks_cube[i][t].color = col;
				/*blocks_cube[i][t] = new JitterObject("jit.gl.gridshape","benny");
				blocks_cube[i][t].dim = [12, 12];
				blocks_cube[i][t].name = "block_"+i+"_"+t;
				blocks_cube[i][t].shape = "cube";
				blocks_cube[i][0].texture = blocks_cube_texture[i];
				blocks_cube[i][0].tex_map = 1;
				blocks_cube[i][0].texzoom = [1,1];
				blocks_cube[i][0].texanchor = [0.5, 0.5];
				blocks_cube[i][0].position = [block_x, block_y, block_z];
				*/
			}else{
				blocks_cube[i][t].scale = [-0.05 + 0.25 / subvoices, 0.45, 0.45];		
				var tc = col[0]/256;
				blocks_cube[i][t].color = [block_c[0]*tc,block_c[1]*tc,block_c[2]*tc,1];
			}
			vc++;
			blocks_cube[i][t].position = [block_x+0.15+(0.5/subvoices)*t+ 0.1, block_y, block_z];
			if(block_type=="audio"){
				var tv=(t-1)/subvoices;
				for(tt=0;tt<NO_IO_PER_BLOCK/subvoices;tt++){
					blocks_meter[i][(tv)*NO_IO_PER_BLOCK+tt] = {
						position : [],
						scale : [],
						colour: []
					};
					/*blocks_meter[i][(tv)*NO_IO_PER_BLOCK+tt] = new JitterObject("jit.gl.gridshape","benny");
					blocks_meter[i][(tv)*NO_IO_PER_BLOCK+tt].dim = [8,6];// [12, 12];
					blocks_meter[i][(tv)*NO_IO_PER_BLOCK+tt].name = "meter£"+i+"£"+t+"£"+tt;
					blocks_meter[i][(tv)*NO_IO_PER_BLOCK+tt].shape = "cube";*/
				}						
			}else if(block_type == "hardware"){
				if(noio==0){
					post("\nthis hardware block seems to have no audio io?");
				}else{
					for(tt=0;tt<noio;tt++){
						blocks_meter[i][(t-1)*noio+tt] = {
							position : [],
							scale : [],
							colour: []
						};
						/*new JitterObject("jit.gl.gridshape","benny");
						blocks_meter[i][(t-1)*noio+tt].dim = [8,6];// [12, 12];
						blocks_meter[i][(t-1)*noio+tt].name = "meter£"+i+"£"+t+"£"+tt;
						blocks_meter[i][(t-1)*noio+tt].shape = "cube";
						//blocks_meter[i][(t-1)*noio+tt].filterclass = "block";
						//blocks_meter[i][t*noio+tt].blend_enable = 0;*/
					}
				}					
				
			}else if(block_type == "note"){
				blocks_meter[i][t-1] = {
					position : [],
					scale : [],
					colour: []
				};
				/*new JitterObject("jit.gl.gridshape","benny");
				blocks_meter[i][t-1].dim = [8,6];// [12, 12];
				blocks_meter[i][t-1].name = "meter£"+i+"£"+t+"£0";
				blocks_meter[i][t-1].shape = "cube";
				//blocks_meter[i][t-1].filterclass = "block";*/
			}	
		}
		blocks_cube[i][t].position = [block_x+(0.125*subvoices + 0.125)*(t!=0)+(0.5/subvoices)*t, block_y, block_z];
		//blocks_cube[i][t].enable = 1;
		if(block_type=="audio"){
			if(t>0){
				var ios=NO_IO_PER_BLOCK/subvoices;
				var tv = (t-1)*ios;
				var mt=Math.sqrt(1-METER_TINT);
				var mco = blocks_cube[i][t].color; 
				mco = [METER_TINT + mt*mco[0], METER_TINT + mt*mco[1], METER_TINT + mt*mco[2], 1];
				for(tt=0;tt<ios;tt++){
					mc++;
					blocks_meter[i][tv+tt].colour = mco;
					blocks_meter[i][tv+tt].position = [blocks_cube[i][t].position[0] + tt*0.2 + 0.1 - 0.2/subvoices, block_y, 0.5+block_z];
					blocks_meter[i][tv+tt].scale = [(-0.05 + 0.25/subvoices)/ios, 0.025, 0.05];
					//blocks_meter[i][tv+tt].enable = 1;
				}				
			}
		}else if(block_type == "note"){
			if(t>0){
				var mt=Math.sqrt(1-METER_TINT);
				var mco = blocks_cube[i][t].color; 
				mco = [METER_TINT + mt*mco[0], METER_TINT + mt*mco[1], METER_TINT + mt*mco[2], 1];
				mc++;
				blocks_meter[i][t-1].colour = mco;
				blocks_meter[i][t-1].position = [blocks_cube[i][t].position[0], block_y, 0.5+block_z];
				blocks_meter[i][t-1].scale = [0, 0, 0.05];
				//blocks_meter[i][t-1].enable = 0;
			}			
		}else if(block_type == "hardware"){
			if(t>0){
				if(noio==0){
					//post("this hardware block seems to have no audio io?");
				}else{
					var mt=Math.sqrt(1-METER_TINT);
					var mco = blocks_cube[i][t].color; 
					mco = [METER_TINT + mt*mco[0], METER_TINT + mt*mco[1], METER_TINT + mt*mco[2], 1];
					for(tt=0;tt<noio;tt++){
						mc++;
						blocks_meter[i][(t-1)*noio+tt].colour = mco;
						blocks_meter[i][(t-1)*noio+tt].position = [blocks_cube[i][t].position[0] - 0.2 + (tt+0.5)*0.4/noio, block_y, 0.5+block_z];
						blocks_meter[i][(t-1)*noio+tt].scale = [0.2/noio, 0.025, 0.05];
						//blocks_meter[i][(t-1)*noio+tt].enable = 1;
					}
				}					
			}
		}
	}
	return [block_v*subvoices,mc];
}

function draw_blocks(){
	//post("draw blocks");
	var i;
	blocks_page.leftmost=0;
	blocks_page.rightmost=0;
	blocks_page.lowest=0;
	blocks_page.highest=0;

	block_cubes = 0;
	voice_cubes = 0;
	meter_cubes = 0;
	
	for(i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			var r = draw_block(i);
			block_cubes++;
			voice_cubes+=r[0];
			meter_cubes+=r[1];
		}
	}
	for(i=0;i<connections.getsize("connections");i++){
		if(connections.contains("connections["+i+"]::from")){
			draw_wire(i);
		} 
	}
	write_blocks_matrix();
	write_wires_matrix();
	prep_meter_updatelist();
}

function draw_wire(connection_number){
	var t;
	//post("\ndraw wire",connection_number);
	if((connections.contains("connections["+connection_number+"]::from::number")) && (connections.contains("connections["+connection_number+"]::to::number"))){
		if(typeof selected.wire[connection_number] === 'undefined') selected.wire[connection_number] = 0;
		var cfrom = connections.get("connections["+connection_number+"]::from::number");
		var cto = connections.get("connections["+connection_number+"]::to::number");
		// now just get the block positions and compare to stored ones in wire_ends
		if(cfrom === null){
			post("\n\n\n\n\nERROR connection NOT FOUND");
			return -1;
		} 

		var drawme=1;
		if(!is_empty(wire_ends[connection_number])){
			if((blocks_cube[cfrom][0].position[0]==wire_ends[connection_number][0])&&(blocks_cube[cfrom][0].position[1]==wire_ends[connection_number][1])&&(blocks_cube[cfrom][0].position[2]==wire_ends[connection_number][2])&&(blocks_cube[cto][0].position[0]==wire_ends[connection_number][3])&&(blocks_cube[cto][0].position[1]==wire_ends[connection_number][4])&&(blocks_cube[cto][0].position[2]==wire_ends[connection_number][5])){
				drawme =0;
				//post("\nskipped draw",connection_number);
			}
		}
		if(drawme){
			var cmute = connections.get("connections["+connection_number+"]::conversion::mute");
			var from_number = connections.get("connections["+connection_number+"]::from::output::number");
			var to_number = connections.get("connections["+connection_number+"]::to::input::number");
			if(connections.contains("connections["+connection_number+"]::overlap")){
				from_type = "potential";
				to_type = "potential";
			}
			var from_type = connections.get("connections["+connection_number+"]::from::output::type");
			var to_type = connections.get("connections["+connection_number+"]::to::input::type");
			var from_name = blocks.get("blocks["+cfrom+"]::name");
			var ftt = from_type;
			if(ftt=="matrix") ftt="matrix_channels";
			var num_outs = Math.max(1,blocktypes.getsize(from_name+"::connections::out::"+ftt));
			var num_ins;
			if(to_type=="parameters"){
				num_ins = blocktypes.getsize(blocks.get("blocks["+cto+"]::name")+"::parameters");
			}else if (to_type != "potential"){
				var ttt = to_type;
				if(ttt=="matrix")ttt="matrix_channels";
				num_ins = blocktypes.getsize(blocks.get("blocks["+cto+"]::name")+"::connections::in::"+ttt);
				num_ins++; //add the block input (mute, mute toggle)
			}else{
				num_ins = 1;//potential wires, special case
			}
			var from_pos,to_pos, from_anglevector,to_anglevector,from_colour,to_colour;
			if((from_type=="hardware")&&(to_type=="hardware")&&connections.contains("connections["+connection_number+"]::conversion::soundcard")){
				from_colour = config.get("palette::connections::soundcard");
				to_colour = config.get("palette::connections::soundcard");
			}else{
				from_colour = config.get("palette::connections::"+from_type);
				to_colour = config.get("palette::connections::"+to_type);
			}
			from_colour[0] = from_colour[0]*0.003921;// /255;
			from_colour[1] = from_colour[1]*0.003921;// /255;
			from_colour[2] = from_colour[2]*0.003921;// /255;
			to_colour[0] = to_colour[0]*0.003921;// /255;
			to_colour[1] = to_colour[1]*0.003921;// /255;
			to_colour[2] = to_colour[2]*0.003921;// /255;
			var fconx = 0;
			var tconx = 0; //offset x based on input number/no inputs (or outputs etc)
			
			wire_ends[connection_number]=[blocks_cube[cfrom][0].position[0],blocks_cube[cfrom][0].position[1],blocks_cube[cfrom][0].position[2],blocks_cube[cto][0].position[0],blocks_cube[cto][0].position[1],blocks_cube[cto][0].position[2]];
			if((from_type=="audio")){// || (from_type=="hardware") || (from_type=="matrix")){
				fconx = ((from_number+0.5)/(NO_IO_PER_BLOCK)) ;
				from_pos = [ (blocks_cube[cfrom][0].position[0]), blocks_cube[cfrom][0].position[1] - 0.44, blocks_cube[cfrom][0].position[2] ];
			}else{
				fconx = ((from_number+0.5)/(num_outs));
				from_pos = [ (blocks_cube[cfrom][0].position[0]), blocks_cube[cfrom][0].position[1] - 0.44, blocks_cube[cfrom][0].position[2] ];
				if(from_type == "midi") from_pos[2]-=0.25;
				if(from_type == "parameters") from_pos[2]-=0.125;
			}
			if((to_type=="audio")){//} || (to_type=="hardware") || (to_type=="matrix")){
				tconx = ((to_number+0.5)/(NO_IO_PER_BLOCK));
				to_pos = [ (blocks_cube[cto][0].position[0]), blocks_cube[cto][0].position[1]+0.44, blocks_cube[cto][0].position[2] ];
			}else{
				tconx =  ((to_number+0.5)/(num_ins));
				to_pos = [ blocks_cube[cto][0].position[0], blocks_cube[cto][0].position[1]+0.44, blocks_cube[cto][0].position[2] ];
				if(to_type == "midi") to_pos[2] -= 0.1875;
				if(to_type == "parameters") to_pos[2] -= 0.125;
				if(to_type == "block"){
					to_pos[2] -= 0.25;
					tconx = 0.5;
				} 
			}
			
			var dist=0;
			for(var i=0;i<3;i++){
				var dt = (from_pos[i]-to_pos[i]);
				dt = dt*dt;
				dist+=dt;
			}

			var from_multi = 0;
			var from_list = [];
			var to_list = [];
			var tv=0,fv=0,tl;
			var from_subvoices=1, to_subvoices=1;
			if(from_type=="audio"){
				if(blocks.contains("blocks["+cfrom+"]::subvoices"))	from_subvoices = blocks.get("blocks["+cfrom+"]::subvoices");
				if(blocks.contains("blocks["+cfrom+"]::from_subvoices")) from_subvoices = blocks.get("blocks["+cfrom+"]::from_subvoices");
			}
			if(to_type=="audio"){
				if(blocks.contains("blocks["+cto+"]::subvoices")) to_subvoices = blocks.get("blocks["+cto+"]::subvoices");
				if(blocks.contains("blocks["+cto+"]::to_subvoices")) to_subvoices = blocks.get("blocks["+cto+"]::to_subvoices");
			}
			if(connections.get("connections["+connection_number+"]::from::voice")=="all"){
				if(WIRES_REDUCE){
					from_multi = -1;
					from_list = [0];
				}else{
					fv = blocks.get("blocks["+cfrom+"]::poly::voices") * from_subvoices;
					from_multi = (fv>1);
					for(t=0;t<fv;t++){
						from_list[t] = t+1;
					}
				}
			}else{
				tl = connections.get("connections["+connection_number+"]::from::voice");
				if(Array.isArray(tl)){
					fv = tl.length;
					from_multi=(fv>1);
					for(t=0;t<tl.length;t++){
						from_list[t] = tl[t];
					}
				}else{
					fv=1;
					from_list = [tl];
				}
			}

			var to_multi=0;
			if(connections.get("connections["+connection_number+"]::to::voice")=="all"){
				tv = blocks.get("blocks["+cto+"]::poly::voices") * to_subvoices;
				if((WIRES_REDUCE||(to_type == "midi")||(to_type == "parameters")||(to_type == "block"))/*&&(tv>1)*/){
					to_multi = -1; // to flag that it goes to the poly input - the main square not a voice
					to_list = [0];
				}else{
					to_multi = (tv>1);
					for(t=0;t<tv;t++){
						to_list[t] = t+1;
					}
				}
			}else{
				tl = connections.get("connections["+connection_number+"]::to::voice");
				if(Array.isArray(tl)){
					tv = tl.length;
					to_multi = (tv>1);
					for(t=0;t<tl.length;t++){
						to_list[t] = tl[t];
					}
				}else {
					tv=1;
					to_list = [tl];
					//to_pos[0] += 0.5*(tl-1)/to_subvoices;
				}
			}

			if(is_empty(wires_colours[connection_number])) wires_colours[connection_number] = [];
			if(!Array.isArray(wires_position[connection_number])){
				wires_position[connection_number] = [];
				wires_scale[connection_number] = [];
				wires_rotatexyz[connection_number] = [];
				wires_colour[connection_number] = [];
			}
		
			from_anglevector = [0, -0.5, 0];
			to_anglevector = [0, -0.5, 0];

			var segments_to_use = MAX_BEZIER_SEGMENTS;
			var short=0;
			// old code was: if either to_multi or from_multi are 1 then we have to draw connections too and from a 'blob'. if not, we just draw a single bezier
			// if there are blobs then the blobs are either at one of the corners or in the middle.
			// many-blob-corner-one, many-corner-blob-corner-many, one-corner-blob-many
			var blob_position = [];
			var meanvector = [0,0,0];
			if(cfrom == cto){
				from_anglevector[2] -= 1;
				from_anglevector[1] *= 1.3;
				to_anglevector[1] *= 1.3;
				to_anglevector[2] -= 1;
				if(selected.block[cfrom]||selected.wire[connection_number]){
					from_anglevector[1] *= 1.5;
					to_anglevector[1] *= 1.5;
					meanvector[2] = 1;
				}
			}
			var fx = from_pos[0];
			var tx = to_pos[0];
			if(from_multi>0){
				var i = 0;
				if(tx>fx) i = from_list.length-1;
				fx += 0.5*(from_list[i]-1)/from_subvoices + 0.4*fconx + 0.55;
			}else{
				if(from_multi==-1){
					fx += -0.4 + 0.8 * fconx;
				}else{
					//if(!Array.isArray(from_list))from_list = [fv];
					fx += 0.5*(from_list[0]-1)/from_subvoices + 0.4*fconx + 0.55;
				}

			}
			if(to_multi>0){
				var i = 0;
				if(tx>fx) i = to_list.length-1;
				tx += 0.5*(to_list[i]-1)/to_subvoices + 0.4*tconx + 0.55;
			}else{
				if(to_multi==-1){
					tx += -0.4 + 0.8 * tconx;
				}else{
					//if(!Array.isArray(to_list))to_list = [tv];
					tx += 0.5*(to_list[0]-1)/to_subvoices + 0.4*tconx + 0.55;
				}
			}

			if((cfrom!=cto)&&(from_pos[1]>(to_pos[1]-1))){
				if((dist<3.5)&&(Math.abs(fx-tx)<0.5)){
					segments_to_use = 1; //flag for short wires - use less segments.
					short=1;
				}else if(dist<6){
					segments_to_use /= 2;
					short=1;
					if((Math.abs(from_pos[0]-to_pos[0])<0.5) && !to_multi && !from_multi) segments_to_use = 1;
				}
			}
			segments_to_use = Math.round(segments_to_use);// 4*(Math.max(1,Math.round(segments_to_use/4)));
			var bez_prep=[];
			for(t=0;t<6;t++) bez_prep[t] = new Array(3);
			segment=0;


			blob_position[0] = ((fx + tx)*0.5);
			blob_position[1] = ((from_pos[1] + to_pos[1])*0.5);
			meanvector[0] = fx - tx;
			var s2 = 0.5 - 0.4*short;
			meanvector[1] = from_pos[1] + s2*from_anglevector[1] - to_pos[1] + s2*to_anglevector[1];
			var mvl = Math.sqrt(meanvector[0]*meanvector[0] + meanvector[1]*meanvector[1]);
			blob_position[2] =  Math.min(Math.max(-3,-0.5 -0.5*(Math.max(0,mvl-3)) + Math.max(-1,Math.min(0,meanvector[1]))),-1.5*(cfrom==cto)); //was -0.25 -0.3
			var mv3=mvl*0.05;
			mv3 = mv3 * mv3 * mv3 * 20;
			mv3 = Math.min(15,mv3);
			mvl = mvl - mv3;
			var yclip = from_pos[1]-to_pos[1];
			if((yclip<=0)||(cfrom==cto)){
				yclip=1000;
			}else{
				yclip = Math.max(0,yclip)+Math.max(0,Math.abs(meanvector[0])-1);
			}
			from_anglevector = [from_anglevector[0],from_anglevector[1]*(2+Math.min(1,Math.max(0,meanvector[1]-1))),from_anglevector[2]/* - bp2*/];
			to_anglevector = [to_anglevector[0],to_anglevector[1]*(2+Math.min(1,Math.max(0,meanvector[1]-1))),to_anglevector[2]/* + bp2*/];
			from_anglevector[1]=Math.min(yclip,Math.max(-yclip,from_anglevector[1]));
			to_anglevector[1]=Math.min(yclip,Math.max(-yclip,to_anglevector[1]));
			if(cfrom==cto) mvl *= 0.25;
			meanvector[0] = meanvector[0] * -0.33/mvl;
			meanvector[1] = meanvector[1] * -0.33/mvl;				
			if((to_multi>0) || (from_multi>0)){
				var i;
				var mtot=0;
				var fp = from_pos[0];
				var tp = to_pos[0];

				for(t=0;t<from_list.length;t++){
					i = from_list[t];
					mtot += i;
				}
				for(t=0;t<to_list.length;t++){
					i = to_list[t];
					mtot+=i;
				}

				if((from_multi>0)&&(to_multi>0)){ 
					for(i=0;i<from_list.length;i++){
						from_pos[0] = fp + 0.5*(from_list[i]-1)/from_subvoices + 0.4*fconx + 0.55;
						for(t=0;t<3;t++){
							bez_prep[0][t] = from_pos[t];
							bez_prep[1][t] = from_pos[t]+from_anglevector[t];
							bez_prep[2][t] = blob_position[t]-meanvector[t];
							bez_prep[3][t] = blob_position[t];
							bez_prep[4][t] = from_colour[t];
							bez_prep[5][t] = (from_colour[t]+to_colour[t])*0.7;
						}
						segment=draw_bezier(connection_number, segment, segments_to_use*0.5 , bez_prep, cmute);
					}
					// this is the first half
					for(i=0;i<to_list.length;i++){
						to_pos[0] = tp + 0.5 * (to_list[i]-1)/to_subvoices + 0.4 * tconx + 0.55;
						for(t=0;t<3;t++){
							bez_prep[0][t] = blob_position[t];
							bez_prep[1][t] = blob_position[t]+meanvector[t];
							bez_prep[2][t] = to_pos[t]-to_anglevector[t];
							bez_prep[3][t] = to_pos[t];
							bez_prep[4][t] = (from_colour[t]+to_colour[t])*0.7;
							bez_prep[5][t] = to_colour[t];
						}
						segment=draw_bezier(connection_number, segment, segments_to_use*0.5 , bez_prep, cmute);
					}
				}else if(from_multi>0){  //only from is multi, so many-blob-corner-one, this is the same whether its got a corner[0] or not as the blob is the corner
					for(i=0;i<from_list.length;i++){
						from_pos[0] = fp + 0.5 * (from_list[i]-1)/from_subvoices + 0.4 * fconx + 0.55;
						for(t=0;t<3;t++){
							bez_prep[0][t] = from_pos[t];
							bez_prep[1][t] = from_pos[t]+from_anglevector[t];
							bez_prep[2][t] = blob_position[t]-meanvector[t];
							bez_prep[3][t] = blob_position[t];
							bez_prep[4][t] = from_colour[t];
							bez_prep[5][t] = (from_colour[t]+to_colour[t])*0.7;
						}
						segment=draw_bezier(connection_number, segment, segments_to_use*0.5 , bez_prep, cmute);
					}
					if(to_multi<0){
						to_pos[0] += -0.4 + 0.8 * tconx;
					}else{
						//to_pos[0] += 0.55 + 0.4 * tconx;
						to_pos[0] = tp + 0.5 * (to_list[0]-1)/to_subvoices + 0.4 * tconx + 0.55;
					}
					for(t=0;t<3;t++){
						bez_prep[0][t] = blob_position[t];
						bez_prep[1][t] = blob_position[t]+meanvector[t];
						bez_prep[2][t] = to_pos[t]-to_anglevector[t];
						bez_prep[3][t] = to_pos[t];
						bez_prep[4][t] = (from_colour[t]+3*to_colour[t])*0.35;
						bez_prep[5][t] = to_colour[t];
					}
					segment=draw_bezier(connection_number, segment, segments_to_use*0.5, bez_prep, cmute);		
				}else{ // one-corner-blob-many //ie to_multi==1
					to_pos[0] += 0.55 + 0.4 * tconx;
					if(from_multi<0){
						from_pos[0] += -0.4 + 0.8 * fconx;
					}else{
						//from_pos[0] += 0.55 + 0.4 * fconx;
						from_pos[0] = fp + 0.5 * (from_list[0]-1)/from_subvoices + 0.4 * fconx + 0.55;
					}
					blob_position[0] = ((from_pos[0] + to_pos[0])*0.5);
					blob_position[1] = ((from_pos[1] + to_pos[1])*0.5);

					for(t=0;t<3;t++){
						bez_prep[0][t] = from_pos[t];
						bez_prep[1][t] = from_pos[t]+from_anglevector[t];
						bez_prep[2][t] = blob_position[t]-meanvector[t];
						bez_prep[3][t] = blob_position[t];
						bez_prep[4][t] = (from_colour[t]*3+to_colour[t])*0.35;
						bez_prep[5][t] = (from_colour[t]+3*to_colour[t])*0.35;
					}
					segment=draw_bezier(connection_number, segment, segments_to_use*0.5, bez_prep, cmute);					
	
					for(i=0;i<to_list.length;i++){
						to_pos[0] = tp + 0.5 * (to_list[i]-1)/to_subvoices + 0.4 * tconx + 0.55;
						meanvector[2]=-meanvector[2];
						for(t=0;t<3;t++){
							bez_prep[0][t] = blob_position[t];
							bez_prep[1][t] = blob_position[t]+meanvector[t];
							bez_prep[2][t] = to_pos[t]-to_anglevector[t];
							bez_prep[3][t] = to_pos[t];
							bez_prep[4][t] = (from_colour[t]+to_colour[t])*0.7;
							bez_prep[5][t] = to_colour[t];
						}
						segment=draw_bezier(connection_number, segment, segments_to_use*0.5 , bez_prep, cmute);
					}
				}
			}else{ // single wire
				if(to_multi<0){
					to_pos[0] += -0.4 + 0.8 * tconx;
				}else{
					to_pos[0] += 0.5 * (to_list[0]-1)/to_subvoices + 0.4 * tconx + 0.55;
				}
				if(from_multi<0){
					from_pos[0] += -0.4 + 0.8 * fconx;
				}else{
					from_pos[0] += 0.5 * (from_list[0]-1)/from_subvoices + 0.4 * fconx + 0.55;
				}
				if(short){
					for(t=0;t<3;t++){
						bez_prep[0][t] = from_pos[t];
						bez_prep[1][t] = from_pos[t]+from_anglevector[t]*(t!=2);
						bez_prep[2][t] = to_pos[t]-to_anglevector[t]*(t!=2);
						bez_prep[3][t] = to_pos[t];
						bez_prep[4][t] = from_colour[t];
						bez_prep[5][t] = to_colour[t];
					}
					segment=draw_bezier(connection_number, segment, segments_to_use, bez_prep, cmute);	
				}else{
					for(t=0;t<3;t++){
						bez_prep[0][t] = from_pos[t];
						bez_prep[1][t] = from_pos[t]+from_anglevector[t];
						bez_prep[2][t] = blob_position[t]-meanvector[t];
						bez_prep[3][t] = blob_position[t];
						bez_prep[4][t] = from_colour[t];
						bez_prep[5][t] = (from_colour[t]+to_colour[t])*0.7;
					}
					segment=draw_bezier(connection_number, segment, segments_to_use*0.5, bez_prep, cmute);	
					meanvector[2]=-meanvector[2];
					for(t=0;t<3;t++){
						bez_prep[0][t] = blob_position[t];
						bez_prep[1][t] = blob_position[t]+meanvector[t];
						bez_prep[2][t] = to_pos[t]-to_anglevector[t];
						bez_prep[3][t] = to_pos[t];
						bez_prep[4][t] = (from_colour[t]+to_colour[t])*0.7;
						bez_prep[5][t] = to_colour[t];
					}
					segment=draw_bezier(connection_number, segment, segments_to_use*0.5, bez_prep, cmute);	
				}
			}
			if(Array.isArray(wires_position[connection_number])){
				if(segments_to_use<wires_position[connection_number].length){
					//remove wires
					for(var sr = wires_position[connection_number].length-1;sr>=segment;sr--){
						wires_position[connection_number].pop();
						wires_rotatexyz[connection_number].pop();
						wires_scale[connection_number].pop();
						wires_colour[connection_number].pop();
					}
				}
			}
			return 1;
		}
	}
	return 0;
}

function draw_bezier(connection_number, segment, num_segments, bez_prep, cmute){
	//if(connection_number == wires_potential_connection) post("\nbez:",connection_number, segment, num_segments, "\nfrom:",bez_prep[0], bez_prep[1], "\nto",bez_prep[2], bez_prep[3], bez_prep[4], bez_prep[5], cmute, visible)
	var t, tt, i, ott;
	var p = [];
	num_segments = Math.max(1,Math.floor(num_segments));
	if(num_segments <= 1){
		draw_cylinder(connection_number,segment,bez_prep[0],bez_prep[3],cmute,bez_prep[4]);
		segment++;
		return segment;
	}else{
		var iseg = 1 / num_segments;
		for(t=0;t<=num_segments;t++){
			tt=t*iseg;
			ott=1- tt;
			p[t] = [];
			for(i=0;i<3;i++){
				p[t][i] = ott*ott*ott*bez_prep[0][i] + 3*ott*ott*tt*bez_prep[1][i] + 3*ott*tt*tt*bez_prep[2][i] + tt*tt*tt*bez_prep[3][i];
			}
		}
		var col = [bez_prep[4][0], bez_prep[4][1], bez_prep[4][2]];
		var cold = [(bez_prep[5][0]-bez_prep[4][0])*iseg, (bez_prep[5][1]-bez_prep[4][1])*iseg, (bez_prep[5][2]-bez_prep[4][2])*iseg];
		for(t=0;t<num_segments;t++){
			draw_cylinder(connection_number,segment, p[t], p[t+1], cmute, col);
			col[0]+=cold[0];
			col[1]+=cold[1];
			col[2]+=cold[2];
			segment++;
		}
		return segment;
	}
}

function draw_cylinder(connection_number, segment, from_pos, to_pos, cmute,col){
	var t;
	var avg_pos = Array(3);
	var pos_dif = Array(3);
	var seglength = 0;
	for(t=0;t<3;t++){
		avg_pos[t] = (from_pos[t] + to_pos[t])/2;
		pos_dif[t] = (to_pos[t] - from_pos[t]);
		seglength += pos_dif[t] * pos_dif[t];
	}
	if(seglength === 0){
		//post("\nzero length vector",seglength,pos_dif,"\n");
		//return;
		seglength=0.01;
		rotY=0;
		rotz=0;
	}else{
		seglength = Math.sqrt(seglength);
		var rotY = (7.8540-Math.acos(pos_dif[2]/seglength)) % 6.28;
		var rotZ = Math.atan(pos_dif[1]/pos_dif[0]);
	
		if(from_pos[0]<=to_pos[0]) rotY	= -rotY;
		//if(usermouse.caps) post("\nroty",rotY,"rotz",rotZ);
		rotZ *= 57.29577951; //180/Math.PI;
		rotY *= 57.29577951; //180/Math.PI;
	}

	wires_position[connection_number][segment] = [ avg_pos[0], avg_pos[1], avg_pos[2] ];
	wires_scale[connection_number][segment] = [seglength*0.52, wire_dia,1];
	wires_rotatexyz[connection_number][segment] = [0, rotY, rotZ];
	var tmc=0.4;
	tmc *= (1-0.8*selected.anysel*(0.3 - selected.wire[connection_number]));
	var zs = Math.max(Math.abs(avg_pos[2])-0.5,0);
	zs = 1 / (1 + zs);
	tmc *= zs;
	if(cmute){
		wires_colour[connection_number][segment] = [tmc*MUTEDWIRE[0],tmc*MUTEDWIRE[1],tmc*MUTEDWIRE[2]];
	}else{
		wires_colour[connection_number][segment] = [tmc*col[0],tmc*col[1],tmc*col[2]];
	}
	wires_colours[connection_number][segment] = [zs*col[0],zs*col[1],zs*col[2]]; //storage of unmodified segment colours, to use for highlighting elsewhere
}

function write_block_matrix(b){	
	if(Array.isArray(blocks_cube[b])){
		var bc=matrix_block_index[b];
		matrix_block_position.setcell(bc,0,"val",blocks_cube[b][0].position[0],blocks_cube[b][0].position[1],blocks_cube[b][0].position[2]);
		matrix_block_scale.setcell(bc,0,"val",blocks_cube[b][0].scale[0],blocks_cube[b][0].scale[1],blocks_cube[b][0].scale[2]);
		matrix_block_colour.setcell(bc,0,"val",blocks_cube[b][0].color[0],blocks_cube[b][0].color[1],blocks_cube[b][0].color[2]);
		matrix_block_texture.setcell(bc,0,"val",b);
		var vc=matrix_voice_index[b];
		for(var c=1;c<blocks_cube[b].length;c++){
			matrix_voice_position.setcell(vc,0,"val",blocks_cube[b][c].position[0],blocks_cube[b][c].position[1],blocks_cube[b][c].position[2]);
			matrix_voice_scale.setcell(vc,0,"val",blocks_cube[b][c].scale[0],blocks_cube[b][c].scale[1],blocks_cube[b][c].scale[2]);
			matrix_voice_colour.setcell(vc,0,"val",blocks_cube[b][c].color[0],blocks_cube[b][c].color[1],blocks_cube[b][c].color[2]);
			vc++;
		}
		var mc=matrix_meter_index[b][0];
		for(var c=0;c<blocks_meter[b].length;c++){
			matrix_meter_position.setcell(mc,0,"val",blocks_meter[b][c].position[0],blocks_meter[b][c].position[1],blocks_meter[b][c].position[2]);
			matrix_meter_scale.setcell(mc,0,"val",blocks_meter[b][c].scale[0],blocks_meter[b][c].scale[1],blocks_meter[b][c].scale[2]);
			matrix_meter_colour.setcell(mc,0,"val",blocks_meter[b][c].colour[0],blocks_meter[b][c].colour[1],blocks_meter[b][c].colour[2]);
			mc++;
		}
	}
	redraw_flag.matrices |= 2;
}

function write_menu_matrix(){
	var menu_cubes = 0;
	for(var i=0;i<blocks_menu.length;i++) menu_cubes += (blocks_menu[i] !== undefined);

	matrix_menu_position.dim = [menu_cubes,1];
	matrix_menu_scale.dim = [menu_cubes,1];
	matrix_menu_colour.dim = [menu_cubes,1];
	matrix_menu_texture.dim = [menu_cubes,1];
	var lastvalid=null;
	bm=0;
	for(var i=0;i<blocks_menu.length;i++){
		if(blocks_menu[i]!== undefined){
			matrix_menu_index[bm]=i;
			matrix_menu_lookup[i]=bm;
			matrix_menu_position.setcell(bm,0,"val",blocks_menu[i].position[0],blocks_menu[i].position[1],blocks_menu[i].position[2]);
			matrix_menu_scale.setcell(bm,0,"val",blocks_menu[i].scale[0],blocks_menu[i].scale[1],blocks_menu[i].scale[2]);
			matrix_menu_colour.setcell(bm,0,"val",blocks_menu[i].color[0],blocks_menu[i].color[1],blocks_menu[i].color[2]);
			matrix_menu_texture.setcell(bm,0,"val",i);//blocks_menu[i].texture);
			if(blocks_menu_texture[i]==null){
				if(lastvalid==null)error("\nbad menu textures");
				blocks_menu_texture[i]=lastvalid;
			}else{
				lastvalid=blocks_menu_texture[i];
			}
			bm++;
		}
	}
	messnamed("menu_multiple","texture",blocks_menu_texture);
	messnamed("menu_matrices","bang");
}

function write_blocks_matrix(){
	redraw_flag.matrices &= 253;
	matrix_voice_position.dim = [voice_cubes,1];
	matrix_voice_colour.dim = [voice_cubes,1];
	matrix_voice_scale.dim = [voice_cubes,1];
	matrix_block_position.dim = [block_cubes,1];
	matrix_block_scale.dim = [block_cubes,1];
	matrix_block_colour.dim = [block_cubes,1];
	matrix_block_texture.dim = [block_cubes,1];
	matrix_meter_position.dim = [meter_cubes,1];
	matrix_meter_colour.dim = [meter_cubes,1];
	matrix_meter_scale.dim = [meter_cubes,1];
	
	var vc=0;
	var mc=0;
	var bc=0;
	matrix_meter_index = [];
	matrix_voice_index = [];
	for(var b=0;b<MAX_BLOCKS;b++){
		matrix_meter_index[b]=[];
		if(Array.isArray(blocks_cube[b])){
			matrix_block_index[b]=bc;
			matrix_block_position.setcell(bc,0,"val",blocks_cube[b][0].position[0],blocks_cube[b][0].position[1],blocks_cube[b][0].position[2]);
			matrix_block_scale.setcell(bc,0,"val",blocks_cube[b][0].scale[0],blocks_cube[b][0].scale[1],blocks_cube[b][0].scale[2]);
			matrix_block_colour.setcell(bc,0,"val",blocks_cube[b][0].color[0],blocks_cube[b][0].color[1],blocks_cube[b][0].color[2]);
			matrix_block_texture.setcell(bc,0,"val",b);
			bc++;
			matrix_voice_index[b]=vc;
			for(var c=1;c<blocks_cube[b].length;c++){
				matrix_voice_position.setcell(vc,0,"val",blocks_cube[b][c].position[0],blocks_cube[b][c].position[1],blocks_cube[b][c].position[2]);
				matrix_voice_scale.setcell(vc,0,"val",blocks_cube[b][c].scale[0],blocks_cube[b][c].scale[1],blocks_cube[b][c].scale[2]);
				matrix_voice_colour.setcell(vc,0,"val",blocks_cube[b][c].color[0],blocks_cube[b][c].color[1],blocks_cube[b][c].color[2]);
				vc++;
			}
			for(var c=0;c<blocks_meter[b].length;c++){
				matrix_meter_position.setcell(mc,0,"val",blocks_meter[b][c].position[0],blocks_meter[b][c].position[1],blocks_meter[b][c].position[2]);
				matrix_meter_scale.setcell(mc,0,"val",blocks_meter[b][c].scale[0],blocks_meter[b][c].scale[1],blocks_meter[b][c].scale[2]);
				matrix_meter_colour.setcell(mc,0,"val",blocks_meter[b][c].colour[0],blocks_meter[b][c].colour[1],blocks_meter[b][c].colour[2]);
				matrix_meter_index[b][c]=mc;
				mc++;
			}
		}
	}
	matrix_voice_index[b]=vc;
	messnamed("blocks_multiple","texture",blocks_cube_texture);
	messnamed("blocks_matrices","bang");
	messnamed("voices_matrices","bang");
	messnamed("meters_matrices","bang");
}

function write_wire_matrix(i){
	matrix_wire_index = wires_startindex[i];
	if(Array.isArray(wires_position[i])){
		for(var ii=0;ii<wires_position[i].length;ii++){
			matrix_wire_position.setcell(matrix_wire_index,0,"val",wires_position[i][ii][0],wires_position[i][ii][1],wires_position[i][ii][2]);
			matrix_wire_scale.setcell(matrix_wire_index,0,"val",wires_scale[i][ii]);
			matrix_wire_rotatexyz.setcell(matrix_wire_index,0,"val",wires_rotatexyz[i][ii]);
			matrix_wire_colour.setcell(matrix_wire_index,0,"val",wires_colour[i][ii]);
			matrix_wire_index++;
		}	
	}
	redraw_flag.matrices |= 1;
}

function write_wires_matrix(){
	redraw_flag.matrices &= 254;

	matrix_wire_index=0;
	var count=0;
	for(var i=0;i<wires_position.length;i++){
		if(Array.isArray(wires_position[i])) count+=wires_position[i].length;
	}
	matrix_wire_position.dim = [count,1];
	matrix_wire_scale.dim = [count,1];
	matrix_wire_rotatexyz.dim = [count,1];
	matrix_wire_colour.dim = [count,1];

	//post("wire matrix length",count);
	wires_lookup=[];
	for(var i=0;i<wires_position.length;i++){
		if(Array.isArray(wires_position[i])){
			wires_startindex[i] = matrix_wire_index;
			for(var ii=0;ii<wires_position[i].length;ii++){
				matrix_wire_position.setcell(matrix_wire_index,0,"val",wires_position[i][ii][0],wires_position[i][ii][1],wires_position[i][ii][2]);
				matrix_wire_scale.setcell(matrix_wire_index,0,"val",wires_scale[i][ii]);
				matrix_wire_rotatexyz.setcell(matrix_wire_index,0,"val",wires_rotatexyz[i][ii]);
				matrix_wire_colour.setcell(matrix_wire_index,0,"val",wires_colour[i][ii]);
				wires_lookup[matrix_wire_index] = i;
				matrix_wire_index++;
			}
		}
	}
	wires_startindex[i] = mouse_index;
	messnamed("wires_matrices","bang");
	//post("\n\nmatrices ready",matrix_wire_index);
}

function set_sidebar_mode(mode){
	if((mode=="block")&&(usermouse.ctrl)){
		mode = "edit_label";
		sidebar.lastmode = -1;
		usermouse.ctrl = 0;
	} 
	//post("sidebar mode",mode);
	if(mode!=sidebar.mode){
		sidebar.dropdown = null;
		sidebar.scroll.position = 0;
		sidebar.scroll.max = 0;
		//if((sidebar.mode == "none")||(mode=="none")) center_view(1);
		if(mode=="block"){
			sidebar.scopes.voice = -1;//causes it to ask te right block to display a scope
		}else{
			audio_to_data_poly.message("setvalue", 0,"vis_scope",0);
			sidebar.scopes.midi = -1;
			sidebar.scopes.voice = -1;
		}
		sidebar.mode = mode;
		if(mode=="file_menu"){
			displaymode="blocks";
			center_view(1);
			redraw_flag.flag  |= 4;
		}
	}
	redraw_flag.flag |= 2;
}

function clear_screens(){
	//lcd_main.message("brgb", 0, 0, 0);
	//deferred_diag.push("clear screens, mode "+displaymode);
	view_changed = true;
	if(displaymode=="panels"){
		backgroundcolour_current = backgroundcolour_panels;
		mouse_index=2;
		click_clear(1,1);
		mouse_click_actions[1] = panels_bg_click;
		mouse_click_parameters[1] = 0;
		mouse_click_values[1] = 0;
	}else{
		if(displaymode=="blocks"){
			backgroundcolour_current = backgroundcolour_blocks;
		}else if(displaymode == "waves"){
			backgroundcolour_current = backgroundcolour_waves;
		}else{
			backgroundcolour_current = backgroundcolour;
		}
		mouse_index=2;
		click_clear(0,0);
		mouse_click_actions[0] = do_nothing;
		mouse_click_parameters[0] = 0;
		mouse_click_values[0] = 0;		
	}
	scrollbar_index = 3;//mouse_index;
	mouse_index=4;
	lcd_main.message("brgb", backgroundcolour_current);
	lcd_main.message("clear");
	//mouse_index++;
}

function draw_state_xfade(){
	var cll = config.getsize("palette::gamut");
	if((state_fade.position>-1) && (state_fade.selected > -2)){
		var c = state_fade.lastcolour;
		lcd_main.message("paintrect",9,state_fade.y, sidebar.x - 9, fontheight+state_fade.y,menudarkest )
		var c2 = [0,0,0];
		if(state_fade.selected>=0) c2 = config.get("palette::gamut["+Math.floor(state_fade.selected*cll/MAX_STATES)+"]::colour");
		state_fade.colour = [c2[0]*(state_fade.position)+c[0]*(1- state_fade.position),c2[1]*(state_fade.position)+c[1]*(1- state_fade.position),c2[2]*(state_fade.position)+c[2]*(1- state_fade.position)];
		var x = 9+(sidebar.x-18-fontheight)*(state_fade.position);
		lcd_main.message("paintrect",x, state_fade.y, x+fontheight,fontheight+state_fade.y,state_fade.colour );
		click_rectangle( 9+fontheight*state_fade.x, 0, 9+fontheight*(state_fade.x+1.2), mainwindow_height ,mouse_index,2 );							
		mouse_click_actions[state_fade.index] = whole_state_xfade;
		mouse_click_parameters[state_fade.index] = state_fade.selected;
		mouse_click_values[state_fade.index] = 0;
	}
}

function draw_topbar(){
	setfontsize(fontsmall);
	lcd_main.message("textface", "bold");
	lcd_main.message("pensize", 2, 2);
	lcd_main.message("frgb",menucolour);

	var x_o=0, i;
	
	click_zone(show_cpu_meter, null, null, 0,0,9,fontheight+9, mouse_index, 1);
	
	//play
	if(usermouse.clicked2d == mouse_index){
		lcd_main.message("paintrect", 9, 9, 9 + fontheight, 9+fontheight, menucolour);
	}else if(!(still_checking_polys&3)){
		lcd_main.message("paintrect", 9, 9, 9 + fontheight, 9+fontheight, menudarkest);
	}else{
		lcd_main.message("paintrect", 9, 9, 9 + fontheight, 9+fontheight, 64,64,64);
	}
	if(!playing){
		lcd_main.message("frgb" , 0,0,0);
		lcd_main.message("paintpoly",9 + fontheight*0.2, 9+ fontheight*0.2, 9 + fontheight*0.8, 9+fontheight/2, 9 + fontheight*0.2, fontheight*0.8+9, 9 + fontheight*0.2, 9+ fontheight*0.2);
	}else{
		lcd_main.message("frgb" , menucolour);			
		lcd_main.message("paintpoly", 9 + fontheight*0.2, 9+ fontheight*0.2, 9 + fontheight*0.8, 9+fontheight/2, 9 + fontheight*0.2, fontheight*0.8+9, 9 + fontheight*0.2, 9+ fontheight*0.2);
	}	
	if(view_changed===true){
		click_rectangle( 9, 9, 9 + fontheight, 9+fontheight, mouse_index, 6);
		mouse_click_actions[mouse_index] = [play_button_click, play_button_release];
		mouse_click_parameters[mouse_index] = "";
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		
		if(midi_indicators.list.length>0) click_zone(hw_meter_click, 0, "midi", 10+fontheight,0,10+fontheight+sidebar.meters.spread,fontheight+9, mouse_index, 1);
		for(i=0;i<meter_positions[0][2].length;i++){
			click_rectangle( meter_positions[0][2][i][0], meter_positions[0][2][i][1], meter_positions[0][2][i][0]+3, meter_positions[0][2][i][2], mouse_index, 1);
			//post("\nmeter click_rectangle",meter_positions[0][2][i][0], meter_positions[0][2][i][1], meter_positions[0][2][i][0]+3, meter_positions[0][2][i][2], mouse_index, 1);
			mouse_click_actions[mouse_index] = hw_meter_click;
			mouse_click_parameters[mouse_index] = i;
			mouse_click_values[mouse_index] = "in";
			mouse_index++;
		}
		for(i=0;i<meter_positions[1][2].length;i++){
			click_rectangle( meter_positions[1][2][i][0], meter_positions[1][2][i][1], meter_positions[1][2][i][0]+3, meter_positions[1][2][i][2], mouse_index, 1);
			//post("\nmeter click_rectangle",meter_positions[1][2][i][0], meter_positions[1][2][i][1], meter_positions[1][2][i][0]+3, meter_positions[1][2][i][2], mouse_index, 1);
			mouse_click_actions[mouse_index] = hw_meter_click;
			mouse_click_parameters[mouse_index] = i;
			mouse_click_values[mouse_index] = "out";
			mouse_index++;
		}
	}else{
		mouse_index += meter_positions[0][2].length + 1 + meter_positions[1][2].length;
	}
	draw_midi_indicators();
	draw_cpu_meter();

	x_o = (sidebar.meters.endx-9) / fontheight; //1.3 + 4*(MAX_AUDIO_INPUTS+MAX_AUDIO_OUTPUTS)/fontheight;

	if(recording_flag==3){
		lcd_main.message("paintoval", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight,255,58,50 );
		if(!recording){
			lcd_main.message("paintoval", 11 + fontheight*x_o, 11, 7+fontheight*(x_o+1), 7+fontheight,0,0,0);
			lcd_main.message("frgb" , 255,58,50);
		}else{
			lcd_main.message("frgb" , 0,0,0);
		}
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.25), 9+fontheight*0.75);
		lcd_main.message("write", "rec");
		click_zone(record_button, null, null, 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight, mouse_index, 1 );
		x_o+=1.1;
	}	
	if(recording_flag&1){
		lcd_main.message("framerect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.5), 9+fontheight,255,58,50 );
		//		lcd_main.message("frgb" , 0,0,0);
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.15), 9+fontheight*0.5);
		lcd_main.message("write", "set rec");
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.15), 9+fontheight*0.75);
		lcd_main.message("write", "folder");
		click_zone(select_folder, "record", null, 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight, mouse_index, 1 );
		x_o+=1.6;
	}	
	
	if(!playing){
		lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight,menudarkest );
		lcd_main.message("frgb" , menudark);
	}else if(usermouse.clicked2d == mouse_index){
		lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight,menucolour );
		lcd_main.message("frgb", 0,0,0);
	}else{
		lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight,menudarkest );
		lcd_main.message("frgb" , menucolour);
	}
	lcd_main.message("moveto", 9+fontheight*(x_o+0.15), 9+fontheight*0.5);
	lcd_main.message("write", "re");
	lcd_main.message("moveto", 9 + fontheight*(x_o+0.15), 9+fontheight*0.75);
	lcd_main.message("write", "sync");
	
	// only need to draw resync if you're playing
	click_zone(resync_button, null, null, 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight, mouse_index, 1 );
	x_o+=1.1;
	
	if(usermouse.clicked2d == mouse_index){
		lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight,20,255,20 );
		lcd_main.message("frgb", 0,0,0);
	}else{
		lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight,menudarkest );
		lcd_main.message("frgb", menucolour);
	}
	lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
	lcd_main.message("write", "all");
	lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
	lcd_main.message("write", "off");
	click_zone(panic_button, null,null, 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight, mouse_index, 1 );
	x_o+=1.1;
	if((loading.progress==0)&&(sidebar.mode != "file_menu")){
		if(view_changed===true) click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.3), 9+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = set_display_mode;
		mouse_click_parameters[mouse_index] = "panels";
		if((displaymode == "panels")||(usermouse.clicked2d==mouse_index)){
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.3), 9+fontheight,menucolour );
			lcd_main.message("frgb", 0,0,0);
		}else if(displaymode == "panels_edit"){
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.3), 9+fontheight,menucolour[2],menucolour[1], menucolour[0] );
			lcd_main.message("frgb", 0,0,0);
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
			lcd_main.message("write", "edit");
		}else{
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.3), 9+fontheight,menudarkest );
			lcd_main.message("frgb", menucolour);
		}
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.16), 9+fontheight*0.75);
		lcd_main.message("write", "panels");
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		x_o+=1.4;
		//here, add some spare space, if any
	
		if(view_changed===true) click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.3), 9+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = set_display_mode;
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.18), 9+fontheight*0.75);
		mouse_click_parameters[mouse_index] = "blocks";
		if((displaymode == "blocks")||(usermouse.clicked2d==mouse_index)){
			if(displaymode=="blocks"){
				mouse_click_parameters[mouse_index] = "flocks";
			}
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.3), 9+fontheight,menucolour );
			lcd_main.message("frgb", 0,0,0);
			lcd_main.message("write", "blocks");
		}else if(displaymode == "flocks"){
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.3), 9+fontheight,255,50,200 );
			lcd_main.message("frgb", 0,0,0);
			lcd_main.message("write", "flocks");
		}else{
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.3), 9+fontheight,menudarkest );
			lcd_main.message("frgb", menucolour);
			lcd_main.message("write", "blocks");
		}
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		x_o+=1.4;
	
		if(view_changed===true) click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = set_display_mode;
		if((displaymode == "waves")||(usermouse.clicked2d==mouse_index)){
			if(displaymode == "waves")mouse_click_parameters[mouse_index] = "blocks";
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight,menucolour );
			lcd_main.message("frgb", 0,0,0);
		}else{
			mouse_click_parameters[mouse_index] = "waves";		
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight,menudarkest );
			lcd_main.message("frgb", menucolour);
		}
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.15), 9+fontheight*0.75);
		lcd_main.message("write", "waves");
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		x_o+=1.3;
	
		if(view_changed===true) click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.1), 9+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = set_sidebar_mode;
		if(sidebar.mode == "file_menu"){
			mouse_click_parameters[mouse_index] = "none";
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.1), 9+fontheight,192,192,192 );
			lcd_main.message("frgb", 0,0,0);
/*			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
			lcd_main.message("write", "load");*/
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
			lcd_main.message("write", "files");
		}else{
			mouse_click_parameters[mouse_index] = "file_menu";	
			var	darkgrey = (menudarkest[0]+menudarkest[1]+menudarkest[2])/3;
			if(usermouse.clicked2d == mouse_index) darkgrey = 255;
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.1), 9+fontheight, darkgrey,darkgrey,darkgrey);
			lcd_main.message("frgb", 192,192,192);
			/*lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
			lcd_main.message("write", "load");*/
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
			lcd_main.message("write", "files");
		}
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		x_o+=1.3;

		if(song_select.show){
			click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.6), 9+fontheight,mouse_index,1 );
			mouse_click_actions[mouse_index] = song_select_button;
			mouse_click_parameters[mouse_index] = "previous";
			mouse_click_values[mouse_index] = 0;
			mouse_index++;
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.4), 9+fontheight,menudarkest );
			lcd_main.message("frgb", menucolour);		
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
			lcd_main.message("write", "select");
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
			lcd_main.message("write", "previous");
			x_o+=1.6;
			click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.6), 9+fontheight,mouse_index,1 );
			mouse_click_actions[mouse_index] = song_select_button;
			mouse_click_parameters[mouse_index] = "current";
			mouse_click_values[mouse_index] = 0;
			mouse_index++;
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.4), 9+fontheight,menudarkest );
			lcd_main.message("frgb", menucolour);		
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
			lcd_main.message("write", "select");
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
			lcd_main.message("write", "merged");
			x_o+=1.6;
		}

		if(displaymode == "custom_fullscreen"){
			lcd_main.message("paintrect", mainwindow_width-9-fontheight,9,mainwindow_width-9,9+fontheight,(usermouse.clicked2d==mouse_index)?menucolour:menudarkest);
			lcd_main.message("frgb", (usermouse.clicked2d==mouse_index)?menudark:menucolour);
			lcd_main.message("moveto",mainwindow_width-9-fo1*2,9+fo1*6);
			lcd_main.message("lineto",mainwindow_width-9-fo1*3,9+fo1*7);
			lcd_main.message("lineto",mainwindow_width-9-fo1*2,9+fo1*8);
			click_zone(set_display_mode,"custom",custom_block,mainwindow_width-9-fontheight,9,mainwindow_width-9,9+fontheight,mouse_index,1);
		}else if((displaymode == "blocks")||(displaymode == "panels")||((displaymode == "custom") && (blocktypes.contains(blocks.get("blocks["+(custom_block|0)+"]::name")+"::show_states_on_custom_view")))){ //draw states / init / unmute all
			var y_o = mainwindow_height - 9 - fontheight;
			var cll = config.getsize("palette::gamut");
			var c = new Array(3);
			// draw a button for each possible state
			for(i=MAX_STATES-1;i>=-1;i--){
				var statecontents;
				if(i == -1){
					statecontents = states.contains("states::current");
				}else{
					statecontents = states.contains("states::"+i);
				}
				if(statecontents){
					if((state_fade.position>-1) && (state_fade.selected ==i)){
						state_fade.y = y_o;
						state_fade.index = mouse_index;
					} 
					if(i < 0){
						if(usermouse.clicked2d!=mouse_index){
							c = menucolour;
						}else{
							c=[255,255,255];
						}
						lcd_main.message("framerect", 5, y_o, 9+fontheight, fontheight + y_o,c );
						if(usermouse.alt){
							lcd_main.message("moveto",5 + fontheight*0.2, y_o+fontheight*0.45);
							lcd_main.message("write", "init+");
							lcd_main.message("moveto",5 + fontheight*0.2, y_o+fontheight*0.75);
							lcd_main.message("write", "data");
						}else{
							lcd_main.message("moveto",5 + fontheight*0.25, y_o+fontheight*0.75);
							lcd_main.message("write", "init");
						}	
					}else{
						if(usermouse.clicked2d!=mouse_index){
							c = config.get("palette::gamut["+Math.floor(i*cll/MAX_STATES)+"]::colour");
						}else{
							c=[255,255,255];
						} 
						lcd_main.message("paintrect", 5, y_o, 9+fontheight, fontheight + y_o,c );		
						if(states.contains("names::"+i)){
							var sn=states.get("names::"+i);
							sn = sn.split(".");
							if(!Array.isArray(sn)) sn = [sn];
							for(var si=0;si<sn.length;si++){
								lcd_main.message("moveto",5 + fontheight*0.1, y_o+fontheight*(1-0.25*(sn.length-si)));
								lcd_main.message("frgb", 0,0,0); //c[0]*bg_dark_ratio,c[1]*bg_dark_ratio,c[2]*bg_dark_ratio);
								lcd_main.message("write",sn[si]);
							}
						}					
					}
					click_zone( [fire_whole_state_btn_click,fire_whole_state_btn_release], i, 0, 0, y_o, 9+fontheight*1.2, fontheight + y_o,mouse_index,6 );							
					y_o -= 1.1*fontheight;
				}
			}
			if(anymuted || mix_block_has_mutes){
				y_o -= 0.3*fontheight
				if(usermouse.clicked2d == mouse_index){
					lcd_main.message("paintrect", 5, y_o, 9+fontheight, y_o + 1.2*fontheight,0,0,0 );
					lcd_main.message("frgb", menucolour);		
				}else{
					lcd_main.message("paintrect", 5, y_o, 9+fontheight, y_o + 1.2*fontheight,menudarkest );
					lcd_main.message("frgb", menucolour);		
				}
				lcd_main.message("moveto", 5 + fontheight*0.2, y_o+fontheight*0.4);
				lcd_main.message("write", "un");
				lcd_main.message("moveto", 5 + fontheight*0.2, y_o+fontheight*0.7);
				lcd_main.message("write", "mute");
				lcd_main.message("moveto", 5 + fontheight*0.2, y_o+fontheight);
				lcd_main.message("write", "all");			
				click_zone(mute_all_blocks, "unmute", 0, 0, y_o, 9+fontheight, y_o + fontheight,mouse_index,1 );
			}
		}
	}else if(loading.progress>0){
		mouse_click_parameters[mouse_index] = "none"; // todo - make progress bar more meaningful
		lcd_main.message("paintrect", 13 + fontheight*x_o, 13, 5+fontheight*x_o+(mainwindow_width-fontheight*x_o-17)*(loading.progress/(MAX_BLOCKS+4*loading.mapping.length+2)), 5+fontheight,menudark);
		lcd_main.message("framerect", 9 + fontheight*x_o, 9, sidebar.x2, 9+fontheight,menucolour);
		lcd_main.message("frgb", 0,0,0);		
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
		lcd_main.message("write", "loading:");
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
		lcd_main.message("write", loading.songname);
		mouse_index++;
	}
}

function draw_sidebar(){	
	//deferred_diag.push("draw sidebar, mode "+sidebar.mode);
	sidebar.scroll.max = 0;
	if(sidebar.mode!=sidebar.lastmode) {
		if(sidebar.mode == "param_number_entry") return 0; // just bail!
		clear_sidebar_paramslider_details();
		if(sidebar.lastmode!="recalculate"){
			if(automap.assignmode)turn_off_controller_assign_mode();
			sidebar.scroll.position = 0;
		}
		if((automap.mapped_c==-0.5)&&(sidebar.mode!="wire")&&(sidebar.mode!="wires")){
			automap.mapped_c = -1;
			note_poly.message("setvalue", automap.available_c, "automapped", 0);
		}
		view_changed = true;
	}
	if((sidebar.scopes.midi_routing.number!=-1)){
		if(!selected.wire[sidebar.scopes.midi_routing.number]){
			var tz=[];
			for(var i=0;i<128;i++) tz.push(0);
			midi_scopes_buffer.poke(1,(sidebar.scopes.midi_routing.voice*128)*128,tz);			
		}
		remove_routing(0);
		sidebar.scopes.midi_routing.number=-1;
	}
	sidebar.panel = 0;	
	var block_colour, block_dark, block_darkest;
	var i,t;
	y_offset=0;
	count_selected_blocks_and_wires();
	if(selected.block_count!=1){
		if((automap.mapped_k>-1)&&!automap.lock_k){
			note_poly.message("setvalue",  automap.available_k, "maptarget", "none");
			automap.mapped_k = -1;
		}
		if((automap.mapped_q!=-1)&&!automap.lock_q){
			set_automap_q(0);
			automap.mapped_q_channels = [];
			automap.mapped_q = -1;
		}
	}
	var has_params=0;
	var block;
	if(/*(sidebar.mode!="none")||*/((selected.block_count+selected.wire_count)>0)){
		click_zone(do_nothing, null, null, sidebar.x,0,sidebar.x2,mainwindow_height,0,1); //was 0);
		mouse_index--; //because this is using an already assigned index no, but click_zone increments mouse_index
		if((sidebar.mode=="none") && fullscreen){
			//wipe clock space
			lcd_main.message("paintrect", mainwindow_width-2.1*fontheight, 9, mainwindow_width,fontheight+9,0,0,0);
		}
	}
	
	y_offset = 9 - sidebar.scroll.position;

	// MODAL SIDEBAR MODES FIRST - EDIT LABEL, EDIT STATE, FILE, CPU
	setfontsize(fontsmall);
	if(sidebar.mode == "edit_label"){
		// EDIT BLOCK LABEL ##############################################################################################################
		block = sidebar.selected;
		if(block<0){
			sidebar.mode = "none";
			center_view(1);
			return(0);
		}
		var block_name = blocks.get("blocks["+block+"]::name");
		var block_label = blocks.get("blocks["+block+"]::label");
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		block_colour = [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
		block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
		block_darkest = [block_colour[0]*bg_dark_ratio, block_colour[1]*bg_dark_ratio, block_colour[2]*bg_dark_ratio];
		
		if(sidebar.mode != sidebar.lastmode){
			clear_sidebar_paramslider_details();
			sidebar.lastmode = sidebar.mode;
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			text_being_editted = block_label;
		}
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,block_colour);
		click_zone(set_sidebar_mode, "block", "", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , 0,0,0);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		if(text_being_editted.length<15) setfontsize(fontsmall*2);
		lcd_main.message("write", text_being_editted);
		setfontsize(fontsmall);
		y_offset+=1.1*fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2-fontheight*2.5,fontheight+y_offset,block_darkest);
		lcd_main.message("frgb" , block_colour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "edit this block's label");
		lcd_main.message("paintrect", sidebar.x2-fontheight*2.4, y_offset, sidebar.x2-fontheight*1.1,fontheight+y_offset,block_dark);
		click_zone(set_sidebar_mode, "block", "", sidebar.x2-fontheight*2.4, y_offset, sidebar.x2-fontheight*1.1,fontheight+y_offset,mouse_index,1);
		lcd_main.message("paintrect", sidebar.x2-fontheight, y_offset, sidebar.x2,fontheight+y_offset,block_dark);
		click_zone(edit_label, "ok", "", sidebar.x-fontheight, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , 255,255,255);
		lcd_main.message("moveto" ,sidebar.x2-fontheight*2.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "cancel");
		lcd_main.message("moveto" ,sidebar.x2-fontheight*0.8, fontheight*0.75+y_offset);
		lcd_main.message("write", "ok");
		
	}else if(sidebar.mode == "block_search"){
		// type to search for blocks in your patch ##############################################################################################################
		if(sidebar.mode != sidebar.lastmode){
			if(displaymode == "blocks") center_view(1);
			clear_sidebar_paramslider_details();
			sidebar.lastmode = sidebar.mode;
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			text_being_editted = "";
		}
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,menucolour);
		click_zone(set_sidebar_mode, "none", "", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , 0,0,0);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		if(text_being_editted.length<15) setfontsize(fontsmall*2);
		lcd_main.message("write", text_being_editted);
		setfontsize(fontsmall);
		y_offset+=1.1*fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*6.8,fontheight+y_offset,menudarkest);
		lcd_main.message("frgb" , menucolour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "type to search blocks in your song");
		lcd_main.message("paintrect", sidebar.x+fontheight*6.9, y_offset, sidebar.x2,fontheight+y_offset,menudark);
		click_zone(set_sidebar_mode, "none", "", sidebar.x+fontheight*7, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , 255,255,255);
		lcd_main.message("moveto" ,sidebar.x+fontheight*7, fontheight*0.75+y_offset);
		lcd_main.message("write", "cancel");
		y_offset += fontheight;
		for(i=0;i<MAX_BLOCKS;i++){
			if(selected.block[i]){
				block_label = blocks.get("blocks["+i+"]::label");
				block_colour = blocks.get("blocks["+i+"]::space::colour");
				lcd_main.message("frgb" , block_colour);				
				lcd_main.message("moveto", sidebar.x + fo1, fontheight*(0.4)+y_offset);
				lcd_main.message("write", block_label);
				click_zone(individual_multiselected_block,i,null, sidebar.x, y_offset, sidebar.x2, y_offset+0.5*fontheight,mouse_index,1);
				y_offset+=0.5*fontheight;
			}
		}
	}else if(sidebar.mode == "name_encapsulation"){
		// when encapsulating blocks you need to name the encapsulation first ##############################################################################################################
		if(sidebar.mode != sidebar.lastmode){
			if(displaymode == "blocks") center_view(1);
			clear_sidebar_paramslider_details();
			sidebar.lastmode = sidebar.mode;
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			text_being_editted = "";
		}

		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,menudarkest);
		lcd_main.message("frgb" , menucolour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "enter a name for the encapsulated block");
		y_offset+=1.1*fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,menucolour);
		click_zone(set_sidebar_mode, "none", "", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , 0,0,0);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		if(text_being_editted.length<15) setfontsize(fontsmall*2);
		lcd_main.message("write", text_being_editted);
		setfontsize(fontsmall*2);
		y_offset+=1.1*fontheight;
		lcd_main.message("paintrect", sidebar.x2-fontheight*6.3, y_offset, sidebar.x2-fontheight*2.2,fontheight+y_offset,menudark);
		click_zone(encapsulate_selection, text_being_editted, text_being_editted, sidebar.x2-fontheight*6.3, y_offset, sidebar.x2-fontheight*2.2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , menucolour);
		lcd_main.message("moveto" ,sidebar.x2-fontheight*6.1, fontheight*0.75+y_offset);
		lcd_main.message("write", "encapsulate");
		lcd_main.message("paintrect", sidebar.x2-fontheight*2.1, y_offset, sidebar.x2,fontheight+y_offset,menudarkest);
		click_zone(set_sidebar_mode, "none", "", sidebar.x2-fontheight*2.1, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , menudark);
		lcd_main.message("moveto" ,sidebar.x2-fontheight*1.9, fontheight*0.75+y_offset);
		lcd_main.message("write", "cancel");
		y_offset += fontheight;
	}else if(sidebar.mode == "edit_state"){
		// EDIT STATE  ##############################################################################################################
		var cll = config.getsize("palette::gamut");
		var state = sidebar.selected;
		if(state<0){
			sidebar.mode = "none";
			center_view(1);
			return(0);
		}
		var state_label = "";
		if(states.contains("names::"+state)) state_label = states.get("names::"+state);
		block_colour = config.get("palette::gamut["+Math.floor(state*cll/MAX_STATES)+"]::colour");
		block_colour =  [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
		block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
		block_darkest = [block_colour[0]*bg_dark_ratio, block_colour[1]*bg_dark_ratio, block_colour[2]*bg_dark_ratio];
		
		if(sidebar.mode+state != sidebar.lastmode){
			sidebar.lastmode = sidebar.mode+state;
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			text_being_editted = state_label;
		}
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,block_colour);
		click_zone(set_sidebar_mode, "none", "", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , 255,255,255);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		if(text_being_editted.length<15) setfontsize(fontsmall*2);
		lcd_main.message("write", text_being_editted);
		setfontsize(fontsmall);
		y_offset+=1.1*fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*5.5,fontheight+y_offset,block_darkest);
		lcd_main.message("frgb" , block_colour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "type to edit state label");
		lcd_main.message("paintrect", sidebar.x+fontheight*5.6, y_offset, sidebar.x+fontheight*6.9,fontheight+y_offset,block_dark);
		click_zone(set_sidebar_mode,"none", "", sidebar.x+fontheight*5.6, y_offset, sidebar.x+fontheight*6.9,fontheight+y_offset,mouse_index,1);
		lcd_main.message("paintrect", sidebar.x+fontheight*7, y_offset, sidebar.x2,fontheight+y_offset,block_dark);
		click_zone(edit_state_label, "ok", "", sidebar.x+fontheight*7, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , 255,255,255);
		lcd_main.message("moveto" ,sidebar.x+fontheight*5.8, fontheight*0.75+y_offset);
		lcd_main.message("write", "cancel");
		lcd_main.message("moveto" ,sidebar.x+fontheight*7.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "ok");

		y_offset+=2.1*fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,block_darkest);
		lcd_main.message("frgb" , block_colour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "click to copy this state into another:");
		
		y_offset += 1.1* fontheight;
		var cll = config.getsize("palette::gamut");
		var c = new Array(3);
		var sc=0;
		var statex=0;
		// draw a button for each possible state
		if(states.contains("states::current")) sc=-1;
		var x_inc=8 / (MAX_STATES-sc);
		for(;sc<MAX_STATES;sc++){
			var statecontents;
			if(sc==-1){
				statecontents = states.get("states::current");
			}else{
				statecontents = states.get("states::"+sc);
			}
			//var slotfilled=0;
			var stateexists=0;
			if(!is_empty(statecontents)){
				stateexists=1;
				/*if(statecontents.contains(block)){
					slotfilled=1;
				}*/
			}
			if(sc!=sidebar.selected){
				var sn = "";
				if(sc==-1){
					sn = "init";
					c = [0,0,0];
				}else{
					c = config.get("palette::gamut["+Math.floor(sc*cll/MAX_STATES)+"]::colour");
				}
				if(states.contains("names::"+sc)){
					sn=states.get("names::"+sc);
				}
				lcd_main.message("paintrect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9*x_inc), fontheight*0.9+y_offset,c );							
				if(stateexists) lcd_main.message("framerect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9*x_inc), fontheight*0.9+y_offset,menucolour );
				//if(slotfilled) lcd_main.message("framerect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9*x_inc), fontheight*0.9+y_offset,255,0,0 );
				click_zone(copy_state_to_state, state, sc, sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9*x_inc), fontheight*0.9+y_offset,mouse_index,1 );							
				if(sn!=""){
					sn = sn.split(".");
					if(!Array.isArray(sn)) sn = [sn];
					for(var si=0;si<sn.length;si++){
						lcd_main.message("moveto",9 + fontheight*(statex+0.9-0.2*sn[si].length), y_offset+fontheight*(1-0.25*(sn.length-si)));
						lcd_main.message("frgb", block_darkest);
						lcd_main.message("write",sn[si]);
					}
				}	
			}
			statex+=x_inc;
			if(statex>7){
				y_offset += 1* fontheight;
				statex=0;
			}
		}
		y_offset += 1.1* fontheight;

		lcd_main.message("paintrect", sidebar.x+fontheight*5, y_offset, sidebar.x2,fontheight+y_offset,block_dark);
		click_zone(delete_state, sidebar.selected, -1, sidebar.x+fontheight*5, y_offset, sidebar.x2,fontheight+y_offset,mouse_index,1);
		lcd_main.message("frgb" , 255,60,60);
		lcd_main.message("moveto" ,sidebar.x+fontheight*5.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "delete state");
	}else if(sidebar.mode == "notification"){
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,menucolour);
		lcd_main.message("frgb", 0,0,0 );
		setfontsize(fontsmall*2);
		lcd_main.message("textface", "bold");
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "notification");
		y_offset += 1.1* fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, mainwindow_height-9,menudarkest);
		lcd_main.message("frgb", menucolour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		setfontsize(fontsmall);
		lcd_main.message("textface", "normal");
		post("\nsidebar notification is:\n",sidebar.notification);
		long_sidebar_text(sidebar.notification);
	}else if(sidebar.mode == "potential_wire"){
		if(wires_potential_connection>-1){
			if(connections.get("connections["+wires_potential_connection+"]::from::output::type")=="potential"){
				i = wires_potential_connection;
				var f_number = connections.get("connections["+i+"]::from::number");
				var f_label = blocks.get("blocks["+f_number+"]::label");
				var f_name = blocks.get("blocks["+f_number+"]::name");
				var t_number = connections.get("connections["+i+"]::to::number");
				var t_label = blocks.get("blocks["+t_number+"]::label");
				var t_name = blocks.get("blocks["+t_number+"]::name");
				var to_has_matrix = 0;
				if(blocktypes.contains(t_name+"::connections::in::matrix_channels")) to_has_matrix = 1;
				var t_i_name,f_o_name;
				var section_colour,section_colour_dark,section_colour_darkest;
				var type_colour,type_colour_dark,type_colour_darkest;
				
				var is_core_control = 0 ; 
				var f_n_a = f_name;
				var param_count = null;
				var button_count = null;
				f_n_a = f_n_a.split(".");
				if((f_n_a[0]=="core")&&(f_n_a[1]=="input")){
					is_core_control = 1; 
					if(f_n_a[2]=="control"){
						//it's either core.input.control.auto or .basic so
						// check if we need to trim the list of midi outs / param outs / available colours
						var cnam = blocks.get("blocks["+f_number+"]::selected_controller");
						
						param_count = io_dict.get("controllers::"+cnam+"::outputs") |0;
						button_count = io_dict.get("controllers::"+cnam+"::buttons::count") |0;
						post("core input", param_count,button_count);
					}
				}

				type_colour=[192,192,192];
				type_colour_dark = [type_colour[0]*0.5,type_colour[1]*0.5,type_colour[2]*0.5];
				type_colour_darkest = [type_colour[0]*bg_dark_ratio,type_colour[1]*bg_dark_ratio,type_colour[2]*bg_dark_ratio];

				section_colour = blocks.get("blocks["+f_number+"]::space::colour");
				section_colour = [section_colour[0]*1.2,section_colour[1]*1.2,section_colour[2]*1.2];
				section_colour_dark = [section_colour[0]*0.5,section_colour[1]*0.5,section_colour[2]*0.5];
				section_colour_darkest = [section_colour[0]*bg_dark_ratio,section_colour[1]*bg_dark_ratio,section_colour[2]*bg_dark_ratio];
	
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,type_colour_dark );
				lcd_main.message("moveto" ,sidebar.x+fo1+fo1, fontheight*0.75+y_offset);
				setfontsize(fontsmall*2);
				lcd_main.message("frgb",type_colour);
				lcd_main.message("write", "new connection");

				y_offset += 1.1* fontheight;
				
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fo1*6+y_offset,section_colour_darkest );
			
				setfontsize(fontsmall);
	
				lcd_main.message("paintrect", sidebar.x, y_offset+fo1*7, sidebar.x2-(1+is_core_control)*15*fo1, fo1*13+y_offset,section_colour_darkest );
				lcd_main.message("paintrect", sidebar.x2-fo1*14, y_offset+fo1*7, sidebar.x2, y_offset+fo1*13, (usermouse.clicked2d==mouse_index)? section_colour:section_colour_darkest );
				lcd_main.message("frgb" , section_colour_dark);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.4+y_offset);
				lcd_main.message("write", "from");
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*1.1+y_offset);
				lcd_main.message("write", "output");
				lcd_main.message("frgb", section_colour );
				lcd_main.message("moveto" ,sidebar.x+fontheight*1.4, fontheight*0.4+y_offset);
				lcd_main.message("write", f_label);
			
				y_offset+=1.4*fontheight;
				if(EXTERNAL_MATRIX_PRESENT && to_has_matrix) y_offset = conn_draw_from_outputs_list(i, f_name, "matrix", y_offset, null);
				y_offset = conn_draw_from_outputs_list(i, f_name, "hardware", y_offset, null);
				y_offset = conn_draw_from_outputs_list(i, f_name, "audio", y_offset, null);
				if(!is_core_control) y_offset = conn_draw_from_outputs_list(i, f_name, "midi", y_offset, null);
				y_offset = conn_draw_from_outputs_list(i, f_name, "parameters", y_offset, param_count);
				if(is_core_control) y_offset = conn_draw_from_outputs_list(i, f_name, "midi", y_offset, button_count);				
				section_colour = blocks.get("blocks["+t_number+"]::space::colour");
				section_colour = [section_colour[0]*1.2,section_colour[1]*1.2,section_colour[2]*1.2];
				section_colour_dark = [section_colour[0]*0.5,section_colour[1]*0.5,section_colour[2]*0.5];
				section_colour_darkest = [section_colour[0]*bg_dark_ratio,section_colour[1]*bg_dark_ratio,section_colour[2]*bg_dark_ratio];
	
				y_offset+=1.4*fontheight;

				//TO BLOCK, INPUT, VOICE labels/menus
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fo1*6+y_offset,section_colour_darkest );
				
				lcd_main.message("paintrect", sidebar.x, y_offset+fo1*7, sidebar.x2-15*fo1, fo1*13+y_offset,section_colour_darkest );
				lcd_main.message("paintrect", sidebar.x2-fo1*14, y_offset+fo1*7, sidebar.x2, y_offset+fo1*13, (usermouse.clicked2d==mouse_index)? section_colour:section_colour_darkest );
				
				lcd_main.message("frgb", section_colour );
				lcd_main.message("moveto" ,sidebar.x+fontheight*1.4, fontheight*0.4+y_offset);
				lcd_main.message("write", t_label);
				
				lcd_main.message("frgb" , section_colour_dark);
				
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.4+y_offset);
				lcd_main.message("write", "to");
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*1.1+y_offset);
				lcd_main.message("write", "input");
					
				//draw a list of buttons to select between the various outputs on offer here
				if(t_i_no!=null){
					lcd_main.message("moveto" ,sidebar.x2-fontheight*1.2, fontheight*1.1+y_offset);
					lcd_main.message("write", "hide");
				}
				y_offset+=1.4*fontheight;
				if(f_type == "matrix"){
					y_offset = conn_draw_to_inputs_list(i, t_name, "matrix", y_offset);
				}else{
					y_offset = conn_draw_to_inputs_list(i, t_name, "hardware", y_offset);
					y_offset = conn_draw_to_inputs_list(i, t_name, "audio", y_offset);
					y_offset = conn_draw_to_inputs_list(i, t_name, "midi", y_offset);
					y_offset = conn_draw_to_inputs_list(i, t_name, "parameters", y_offset);
					if(t_i_v == "all") y_offset = conn_draw_to_inputs_list(i, t_name, "block", y_offset);
				}
				
			}else{
				set_sidebar_mode("wire");
			}
		}else{
			set_sidebar_mode("none");
		}
	}else if(sidebar.mode == "file_menu"){
		// FILE MENU ##############################################################################################################
		//also: calculate resource usage so you can decide if you've got space to merge the currently selected song
		var free_b=MAX_BLOCKS;
		var free_n=MAX_NOTE_VOICES;
		var free_a=MAX_AUDIO_VOICES;

		
		
		for(i = 0;i<MAX_BLOCKS;i++){
			if(blocks.contains("blocks["+i+"]::space::colour")) free_b--;
		}
		for(var i = 0;i<MAX_NOTE_VOICES;i++){
			if(note_patcherlist[i]=="recycling"){
			}else if(note_patcherlist[i]!='blank.note') free_n--;
		}
		for(var i = 0;i<MAX_AUDIO_VOICES;i++){
			if(audio_patcherlist[i]=="recycling"){
				//free_a--;
			}else if(audio_patcherlist[i]!="blank.audio") {
				free_a--;
			}
		}

		var fpage = 0;
		var gdarkest = [greydarkest[0],greydarkest[1],greydarkest[2]];
		var gcolour = [greycolour[0],greycolour[1],greycolour[2]];
		if(sidebar.files_page == "templates"){
			fpage = 1;
			gdarkest = [greydarkest[0]*0.8,greydarkest[1]*0.8,greydarkest[2]*1.2];
			gcolour = [greycolour[0]*0.8,greycolour[1]*0.8,greycolour[2]*1.2];
		}	 
		var file_menu_x = sidebar.x2 - fontheight * 15;
		if(sidebar.mode != sidebar.lastmode){
			if((automap.available_c>-1)&&(!automap.lock_c)){
				automap.mapped_c=-0.5;
				var maplist = [];
				var mapwrap = [];
				var maplistopv = [];
				var mapcolours = [];
				automap.groups = [];
				maplist.push(-0.5);
				mapwrap.push(1);
				maplistopv.push(-1);
				mapcolours.push(32);
				mapcolours.push(32);
				mapcolours.push(250);
				for(var pad=1;pad<automap.c_cols*automap.c_rows;pad++){
					maplist.push(-1);
					mapwrap.push(1);
					maplistopv.push(-1);
					mapcolours.push(-1);	
				}
				note_poly.message("setvalue", automap.available_c, "automapped", 1);
				note_poly.message("setvalue", automap.available_c, "automap_offset", 0);
				note_poly.message("setvalue", automap.available_c,"maplistopv",maplistopv);
				note_poly.message("setvalue", automap.available_c,"maplist",maplist);
				note_poly.message("setvalue", automap.available_c,"mapwrap",mapwrap);
				note_poly.message("setvalue", automap.available_c,"mapcolour",mapcolours);
				note_poly.message("setvalue", automap.available_c,"buttonmaplist",-1);
			}
			clear_sidebar_paramslider_details();
			sidebar.lastmode = sidebar.mode;
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			sidebar.selected = -1;
			read_songs_folder(sidebar.files_page);
		}
		
		y_offset += (0.4+0.6*loading.hardware_substitutions_occured)*fontheight;
		
		lcd_main.message("paintrect", file_menu_x, 0, sidebar.x2, 18+fontheight*(1+0.6*loading.hardware_substitutions_occured),0,0,0 );
		if(loading.hardware_substitutions_occured==1){
			setfontsize(fontsmall);
			lcd_main.message("paintrect", file_menu_x , 9 + 1.1*fontheight, sidebar.x2, 9+1.6*fontheight,50,0,0 );	
			lcd_main.message("frgb" , 255,50,50);
			lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+fontheight*1.45);
			lcd_main.message("write" , "when this song was loaded, substitutions were made. if you save it, these become permanent.");
		}

		setfontsize(fontsmall*2);
		for(i=0;i<songlist[fpage].length;i++){
			y_offset += 1.1*fontheight;
			if(i==currentsong){
				lcd_main.message("paintrect", file_menu_x , y_offset, sidebar.x2, y_offset+fontheight,gcolour );
				lcd_main.message("frgb", 0, 0, 0 );
				lcd_main.message("moveto", file_menu_x + fontheight*0.2, y_offset+fontheight*0.75);
				lcd_main.message("write" , songlist[fpage][i]);
			}else{
				lcd_main.message("paintrect", file_menu_x , y_offset, sidebar.x2, y_offset+fontheight,gdarkest );	
				lcd_main.message("frgb" , gcolour);
				lcd_main.message("moveto", file_menu_x + fontheight*0.2, y_offset+fontheight*0.75);
				lcd_main.message("write" , songlist[fpage][i]);
			}
			click_zone(select_song,i,i, file_menu_x , y_offset, sidebar.x2, y_offset+1.1*fontheight,mouse_index,1 );
		}
		y_offset += 1.5*fontheight;
		
		
		lcd_main.message("paintrect", file_menu_x, 9, file_menu_x+fontheight*1.7, 9+fontheight,gdarkest );
		setfontsize(fontsmall*2);
		if(!playing){
			lcd_main.message("frgb" , gcolour);
		}else{
			if(danger_button == mouse_index){
				lcd_main.message("frgb" , 255,50,50);
			}else{
				lcd_main.message("frgb" , gcolour[0], gcolour[1]*0.3, gcolour[2]*0.2);
			}
		}
		click_zone(load_song, "","", file_menu_x, 9, file_menu_x+fontheight*1.8, 9+fontheight,mouse_index,1 );
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+fontheight*0.75);
		lcd_main.message("write", "load");

		lcd_main.message("paintrect", file_menu_x + fontheight*1.8, 9, file_menu_x+fontheight*4, 9+fontheight,gdarkest );
		lcd_main.message("moveto", file_menu_x + fontheight*2, 9+fontheight*0.75);
		//grey out merge if unavail
		var merge=0;
		if(currentsong==-1){
			merge = 1;
		}else if((free_b>=songs_info[currentsong][0])&&(free_n>=songs_info[currentsong][1])&&(free_a>=songs_info[currentsong][2])){
			merge = 1;
		}
		if(merge){
			click_zone( merge_song, null, null, file_menu_x + fontheight*1.8, 9, file_menu_x+fontheight*4.1, 9+fontheight,mouse_index,1 );
			lcd_main.message("frgb" , gcolour);
		}else{
			lcd_main.message("frgb" , greydark);
			//post("Not enough free resources to offer merge-load,\nfree_b:",free_b," free_n:",free_n," free_a:",free_a,"\nand the song requires",songs_info[currentsong]);
		}
		lcd_main.message("write", "merge");
	
		if(selected.block.indexOf(1)!=-1){
			lcd_main.message("paintrect", file_menu_x + fontheight*6, 9, file_menu_x + fontheight*8.5, 9+fontheight,gdarkest );
			lcd_main.message("frgb" , gcolour);
			click_zone(save_song, 1, "", file_menu_x + fontheight*6, 9, file_menu_x + fontheight*8.6, 9+fontheight,mouse_index,1 );
			setfontsize(fontsmall);
			lcd_main.message("moveto", file_menu_x + fontheight*6.2, 9+fontheight*0.45);
			lcd_main.message("write", "save");
			lcd_main.message("moveto", file_menu_x + fontheight*6.2, 9+fontheight*0.75);
			lcd_main.message("write", "selected");
			setfontsize(fontsmall*2);
		}else{
			lcd_main.message("paintrect", file_menu_x + fontheight*4.1, 9, file_menu_x + fontheight*5.9, 9+fontheight,gdarkest );
			if((loading.songname != "")&&(loading.songname!="autoload")){
				if(loading.hardware_substitutions_occured==1){
					lcd_main.message("frgb", 255, 50, 50);
				}else{
					lcd_main.message("frgb" , gcolour);
				}
				click_zone(save_song, 0, 0, file_menu_x + fontheight*4.1, 9, file_menu_x + fontheight*6, 9+fontheight,mouse_index,1 );
			}else{
				lcd_main.message("frgb", greydark);
			}
			lcd_main.message("moveto", file_menu_x + fontheight*4.3, 9+fontheight*0.75);
			lcd_main.message("write", "save");				
	
			lcd_main.message("paintrect", file_menu_x + fontheight*6, 9, file_menu_x + fontheight*8.7, 9+fontheight,gdarkest );
			if(danger_button == mouse_index){
				lcd_main.message("frgb" , 255,50,50);
			}else{
				lcd_main.message("frgb", gcolour);
			}
			click_zone( save_song, 0, 1, file_menu_x + fontheight*6, 9, file_menu_x + fontheight*8.8, 9+fontheight,mouse_index,1 );
			//setfontsize(fontsmall);
			lcd_main.message("moveto", file_menu_x + fontheight*6.2, 9+fontheight*0.75);
			lcd_main.message("write", "save as");
		}

		lcd_main.message("paintrect", sidebar.x2 - fontheight * 3.4, 9,  sidebar.x2 - fontheight * 1.2, 9+fontheight,gdarkest);
		click_zone(files_switch_folder, 1, "", sidebar.x2 - fontheight * 3.4, 9, sidebar.x2 - fontheight * 1.1, 9+fontheight,mouse_index,1 );
		setfontsize(fontsmall);
		lcd_main.message("frgb",gcolour);
		lcd_main.message("moveto", sidebar.x2 - fontheight * 3.2, 9+fontheight*0.5);
		lcd_main.message("write", "folder:");
		lcd_main.message("moveto", sidebar.x2 - fontheight * 3.2, 9+fontheight*0.75);
		lcd_main.message("write", sidebar.files_page);
						
		click_zone(set_sidebar_mode,"file_more", "file_more",sidebar.x2-1.1*fontheight,0,sidebar.x2,fontheight+9,mouse_index,1 );
		lcd_main.message("paintrect", sidebar.x2-fontheight,9,sidebar.x2,fontheight+9,gdarkest);
		lcd_main.message("moveto", sidebar.x2-fontheight*0.8, 9+fontheight*0.75);
		lcd_main.message("frgb",gcolour);
		setfontsize(fontsmall*2);
		lcd_main.message("write", "...");

	}else if(sidebar.mode == "file_more"){
		//browse, and list of folders (songs, templates, record), and a collect all button
		if(sidebar.mode != sidebar.lastmode){
			clear_sidebar_paramslider_details();
			sidebar.lastmode = sidebar.mode;
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			sidebar.selected = -1;
			read_songs_folder(sidebar.files_page);
		}
		var file_menu_x = sidebar.x2 - fontheight * 15;
		setfontsize(fontsmall*2);
		click_zone(set_sidebar_mode,"file_menu", "file_menu",sidebar.x2-1.1*fontheight,0,sidebar.x2,fontheight+9,mouse_index,1 );
		lcd_main.message("paintrect", sidebar.x2-fontheight,9,sidebar.x2,fontheight+9,greydarkest);
		lcd_main.message("moveto", sidebar.x2-fontheight*0.8, 9+fontheight*0.75);
		lcd_main.message("frgb",greycolour);
		lcd_main.message("write", "<<");
		y_offset+=1.1*fontheight;
		//browse for file:
		click_zone(load_elsewhere_choose, "","", file_menu_x, 9+y_offset, file_menu_x+fontheight*6, 9+fontheight+y_offset,mouse_index,1 );
		lcd_main.message("paintrect", file_menu_x, 9+y_offset, file_menu_x+fontheight*6, 9+fontheight+y_offset,greydarkest);
		lcd_main.message("frgb",greycolour);
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+fontheight*0.75+y_offset);
		lcd_main.message("write", "browse for songfile");
		y_offset+=1.6*fontheight;
		//collect all and save:
		if(0){
			//click_zone(collect_all_and_save, "","", file_menu_x, 9+y_offset, file_menu_x+fontheight*6, 9+fontheight+y_offset,mouse_index,1 );
			lcd_main.message("paintrect", file_menu_x, 9+y_offset, file_menu_x+fontheight*6, 9+fontheight+y_offset,greydarkest);
			lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+fontheight*0.75+y_offset);
			lcd_main.message("frgb",greycolour);
			lcd_main.message("write", "collect all and save");
			y_offset+=1.1*fontheight;
		}
		
		y_offset+=1.1*fontheight;

		//songs folder
		setfontsize(fontsmall);
		lcd_main.message("paintrect", file_menu_x, 9+y_offset+fontheight*0.25, sidebar.x2, 9+fontheight+y_offset,greydarkest);
		lcd_main.message("frgb",greycolour);
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+y_offset);
		lcd_main.message("write", "songfiles folder");
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+fontheight*0.75+y_offset);
		lcd_main.message("write", SONGS_FOLDER);
		click_zone(select_folder, "song", null, file_menu_x, 9+y_offset, sidebar.x2, 9+fontheight+y_offset,mouse_index,1 );
		y_offset+=2.2*fontheight;

		//templates folder
		gdarkest = [greydarkest[0]*0.8,greydarkest[1]*0.8,greydarkest[2]*1.2];
		gcolour = [greycolour[0]*0.8,greycolour[1]*0.8,greycolour[2]*1.2];
		lcd_main.message("paintrect", file_menu_x, 9+y_offset+fontheight*0.25, sidebar.x2, 9+fontheight+y_offset,gdarkest);
		lcd_main.message("frgb",gcolour);
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+y_offset);
		lcd_main.message("write", "templates folder");
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+fontheight*0.75+y_offset);
		lcd_main.message("write", TEMPLATES_FOLDER);
		click_zone(select_folder, "template", null, file_menu_x, 9+y_offset, sidebar.x2, 9+fontheight+y_offset,mouse_index,1 );
		y_offset+=2.2*fontheight;
		
		//record folder
		lcd_main.message("paintrect", file_menu_x, 9+y_offset+fontheight*0.25, sidebar.x2, 9+fontheight+y_offset,68,10,10);
		lcd_main.message("frgb",255,50,50);
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+y_offset);
		lcd_main.message("write", "record folder");
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+fontheight*0.75+y_offset);
		lcd_main.message("write", config.get("RECORD_FOLDER"));
		click_zone(select_folder, "record", null, file_menu_x, 9+y_offset, sidebar.x2, 9+fontheight+y_offset,mouse_index,1 );
		y_offset+=2.2*fontheight;

		//clear all: 
		post("\ndb",danger_button,"mi",mouse_index);
		if(danger_button == mouse_index){
			lcd_main.message("paintrect", file_menu_x, 9+y_offset, file_menu_x+fontheight*6, 9+fontheight+y_offset,120,0,0);
			lcd_main.message("frgb", 255,50,50);
		}else{
			lcd_main.message("paintrect", file_menu_x, 9+y_offset, file_menu_x+fontheight*6, 9+fontheight+y_offset,greydarkest);
			lcd_main.message("frgb",greycolour);
		}
		click_zone(clear_everything_btn, 0,mouse_index, file_menu_x, 9+y_offset, file_menu_x+fontheight*6, 9+fontheight+y_offset,mouse_index,1 );
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, 9+fontheight*0.75+y_offset);
		lcd_main.message("write", "clear everything");
		y_offset+=1.6*fontheight;

	}else if(sidebar.mode == "cpu"){//todo, clicking the active blocks list should open patchers etc, maybe mouseover tells you what things are
		draw_resource_monitor_page();
	}else{		
		// BLOCK SCOPES AND PARAMS #######################################################################################################	
		if(selected.block_count != 1){
			var sx = sidebar.x;
			automap.count = ((automap.mapped_c!=-1)&&(automap.lock_c)) + (automap.mapped_k>-1) + (automap.mapped_q!=-1);
			if(automap.count == 1) sx += sidebar.width*0.5;
			if(automap.count) draw_automap_headers(sx, block);
		}
		block_colour = menucolour;
		block_dark = menudark;
		block_darkest = menudarkest;
		if(selected.block_count == 1){ // if 1 block selected
			block = selected.block.indexOf(1);
			var block_name = blocks.get("blocks["+block+"]::name");
			var block_label = blocks.get("blocks["+block+"]::label");
			var block_type = blocks.get("blocks["+block+"]::type");
			block_colour = blocks.get("blocks["+block+"]::space::colour");
			block_colour = [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
			block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
			block_darkest = [block_colour[0]*bg_dark_ratio, block_colour[1]*bg_dark_ratio, block_colour[2]*bg_dark_ratio];
	
			has_params = blocktypes.contains(block_name+"::parameters");
			var has_midi_in = blocktypes.contains(block_name+"::connections::in::midi");

			var tii,ts;
			var block_voicecount = 1;

			if((sidebar.mode == "settings")||(sidebar.mode == "settings_flockpreset")||(sidebar.mode == "add_state")||(sidebar.mode == "connections")||(sidebar.mode == "help")||(sidebar.mode == "flock")||(sidebar.mode == "panel_assign")){
			}else{
				sidebar.mode = "block";
				if(AUTOZOOM_ON_SELECT)center_view(1);
			}
			if(sidebar.selected != block) sidebar.lastmode = "retrig";
			var bvs = voicemap.get(block);
			if(!Array.isArray(bvs)) bvs = [bvs];
			block_voicecount = bvs.length;
			if(sidebar.selected_voice >= block_voicecount) sidebar.selected_voice = -1;
			var listvoice=-1;
			if(sidebar.selected_voice>=0){
				listvoice  = bvs[sidebar.selected_voice] - MAX_NOTE_VOICES;// voicemap.get(block+"["+sidebar.selected_voice+"]") - MAX_NOTE_VOICES; 
				if(listvoice != sidebar.scopes.voice) sidebar.lastmode="retrig";
			}else if(sidebar.scopes.midivoicelist.length!=bvs.length) sidebar.lastmode="retrig";



			if(sidebar.mode != sidebar.lastmode){
				clear_sidebar_paramslider_details();
				store_back([sidebar.mode,block, sidebar.selected_voice,sidebar.scroll.position]);
				sidebar.lastmode = sidebar.mode;
				sidebar.scopes.voice = -1;
				//sidebar.dropdown = null;
				audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
				remove_midi_scope();
				redraw_flag.targets=[];
				redraw_flag.targets[0]=0;
				if(sidebar.mode == "block"){
					//get scope info together, turn on scopes
					if(block_type=="audio"){
						if(sidebar.selected_voice != -1){
							sidebar.scopes.voicelist = [];
							for(tii=0;tii<NO_IO_PER_BLOCK;tii++){
								audio_to_data_poly.message("setvalue", (listvoice+1+tii*MAX_AUDIO_VOICES),"vis_scope", 1);
								sidebar.scopes.voicelist[tii] = (listvoice+tii*MAX_AUDIO_VOICES);
							}	
							sidebar.scopes.width = (sidebar.width + fo1)/NO_IO_PER_BLOCK;
							messnamed("scope_size",(sidebar.scopes.width)/2);
							sidebar.scopes.voice = listvoice;
						}else{
							//post("if sidebar.selected_voice is -1 display scopes for all voices");
							sidebar.scopes.voicelist = [];
							for(i=0;i<bvs.length;i++){
								for(tii=0;tii<NO_IO_PER_BLOCK;tii++){
									audio_to_data_poly.message("setvalue", (bvs[i]+1+tii*MAX_AUDIO_VOICES - MAX_NOTE_VOICES),"vis_scope", 1);
									sidebar.scopes.voicelist[tii+i*NO_IO_PER_BLOCK] = (bvs[i]+tii*MAX_AUDIO_VOICES - MAX_NOTE_VOICES);
								}
							}	
							sidebar.scopes.width = (sidebar.width + fo1)/(bvs.length*NO_IO_PER_BLOCK);
							messnamed("scope_size",(sidebar.scopes.width)/2);
							sidebar.scopes.voice = -0.99;
						}
					}else if(block_type=="hardware"){
						var voffset=MAX_AUDIO_VOICES+MAX_NOTE_VOICES;
						sidebar.scopes.voicelist = [];
						if(blocktypes.contains(block_name+"::connections::out")){
							ts = blocktypes.get(block_name+"::connections::out::hardware_channels");
						}else if(blocktypes.contains(block_name+"::connections::in")){
							ts = blocktypes.get(block_name+"::connections::in::hardware_channels");	
							voffset += MAX_AUDIO_INPUTS;
						}
						//post("setting up hardware scopes",ts);
						if(!Array.isArray(ts)) ts= [ts];
						if(!is_empty(ts)){
							if(ts[0] != sidebar.scopes.voice){
								for(tii=0;tii<ts.length;tii++){
									audio_to_data_poly.message("setvalue", ts[tii]+voffset,"vis_scope", 1);
									sidebar.scopes.voicelist[tii] = ts[tii]+voffset-1;
								}
								sidebar.scopes.voice = ts[0];
							}
							sidebar.scopes.width = (sidebar.width + fo1)/ts.length;
							messnamed("scope_size",(sidebar.scopes.width)/2);
							// post("scopes width",ts.length,"scopes list",sidebar.scopes.voicelist);
						}
					}else if(blocktypes.contains(block_name+"::connections::in::midi")){
						//assign_midi_scope
						sidebar.scopes.midi = block;
						if(sidebar.selected_voice<0){
							sidebar.scopes.midivoicelist = bvs;
							for(var te=0;te<bvs.length;te++){
								sidebar.scopes.midioutlist[te] = 0; //in future support selecting the output you monitor, or displaying them all?
							}
						}else{
							sidebar.scopes.midivoicelist = [bvs[sidebar.selected_voice]];
							sidebar.scopes.midioutlist = [0];
						}
						//post("\naassigned midi scopes block ",sidebar.scopes.midi,"voices",sidebar.scopes.midivoicelist, "outs", sidebar.scopes.midioutlist);
					}
				}
				sidebar.selected = block;
			}

			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2-fontheight*((block_type=="hardware")?1.1:2.5),fontheight+y_offset,block_darkest);
			click_zone(set_sidebar_mode, "block", null, sidebar.x, y_offset, sidebar.x2-fontheight*2.4,fontheight+y_offset,mouse_index,1);
			var bnt = block_label.split('.');
			lcd_main.message("frgb" , block_colour);
			if(bnt.length>1){
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.35+y_offset);
				lcd_main.message("write", bnt[0]);
				if(bnt.length>2){
					bntt = bnt[1]+"."+bnt[2];
					if(bnt.length>3)bntt = bntt +"."+bnt[3];
				}else{
					bntt = bnt[1];
				}
			}else{
				bntt = bnt[0];
			}
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			if(bntt.length<15) setfontsize(fontsmall*2);
			lcd_main.message("write", bntt);
			setfontsize(fontsmall);
			if(block_type!="hardware"){
				if(view_changed===true) click_rectangle( sidebar.x2 - fontheight*2.4, y_offset, sidebar.x2 - fontheight*1.1, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = bypass_selected_block;
				if(blocks.get("blocks["+block+"]::bypass")){
					var bc = [128,128,128];
					if(usermouse.clicked2d == mouse_index)bc = block_colour;
					lcd_main.message("paintrect", sidebar.x2 - fontheight*2.4, y_offset, sidebar.x2 - fontheight*1.1, fontheight+y_offset,bc );
					lcd_main.message("moveto", sidebar.x2 - fontheight*2.25, fontheight*0.75+y_offset);
					lcd_main.message("frgb" , 0,0,0);
					lcd_main.message("write", "bypass");	
					lcd_main.message("frgb" , block_colour);
					mouse_click_parameters[mouse_index] = 0;
				}else{
					var bc = block_darkest;
					if(usermouse.clicked2d == mouse_index)bc = block_colour;	
					mouse_click_parameters[mouse_index] = 1;
					lcd_main.message("paintrect", sidebar.x2 - fontheight*2.4, y_offset, sidebar.x2 - fontheight*1.1, fontheight+y_offset,bc );
					lcd_main.message("moveto", sidebar.x2 - fontheight*2.25, fontheight*0.75+y_offset);
					lcd_main.message("frgb" , 128,128,128);
					lcd_main.message("write", "bypass");
				}
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
			}
			if(view_changed===true) click_rectangle( sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = mute_selected_block;
			if(blocks.get("blocks["+block+"]::mute")){
				var bc = [128,128,128];
				if(usermouse.clicked2d == mouse_index)bc = block_colour;
				lcd_main.message("paintrect", sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,bc );
				lcd_main.message("moveto", sidebar.x2 - fontheight*0.85, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , 0,0,0);
				lcd_main.message("write", "mute");	
				lcd_main.message("frgb" , block_colour);
				mouse_click_parameters[mouse_index] = 0;
			}else{
				var bc = block_darkest;
				if(usermouse.clicked2d == mouse_index)bc = block_colour;
				mouse_click_parameters[mouse_index] = 1;
				lcd_main.message("paintrect", sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,bc );
				lcd_main.message("moveto", sidebar.x2 - fontheight*0.85, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , 128,128,128);
				lcd_main.message("write", "mute");
			}
			mouse_click_values[mouse_index] = "";	
			mouse_index++;
			y_offset += 1.1*fontheight;

			var getmap = 0;
			var map_x = 0, map_y = 0, maplist = [], maplistopv = [], buttonmaplist = [], mapcolours = [], mapwrap = [];
			
			var sx=sidebar.x;
			if(automap.available_k!=-1){
				if((block_name != "core.input.keyboard")&&has_midi_in){
					if(((automap.mapped_k!=block)||(automap.mapped_k_v!=sidebar.selected_voice))&&!automap.lock_k){
						//check connections for wires from keyboard to this block\
						automap.already_k = 0;
						for(var ci =connections.getsize("connections");ci>0;ci--){
							if(connections.contains("connections["+ci+"]::to")){
								if((connections.get("connections["+ci+"]::from::number")==automap.available_k_block)&&(connections.get("connections["+ci+"]::to::number")==block)){
									//post("skipping keyboard auto assign because there is already a keyboard connection to this block");
									ci = -999;
									automap.mapped_k = -1;
									note_poly.message("setvalue", automap.available_k, "automapped", 0);
								}
							}
						}
						if(ci>-2){
							automap.mapped_k_v = sidebar.selected_voice;
							if(sidebar.selected_voice == -1){
								if(blocktypes.contains(block_name+"::connections::in::automap_poly")&&blocktypes.get(block_name+"::connections::in::automap_poly")==0){
									// force selection to not be block if this key is set 
									sidebar.selected_voice = 0; //this is a little hacky but it works?
									block_and_wire_colours();
									automap.mapped_k_v = 0;
									var vl=bvs[sidebar.selected_voice];
									note_poly.message("setvalue",  automap.available_k, "maptarget", MAX_BLOCKS + vl);
								}else{
									note_poly.message("setvalue",  automap.available_k, "maptarget", block);
								}
							}else{
								var vl=bvs[sidebar.selected_voice];
								note_poly.message("setvalue",  automap.available_k, "maptarget", MAX_BLOCKS + vl);
							}
							if(automap.mapped_k!=block){
								//see if there's a default automap target input stored
								if(blocks.contains("blocks["+block+"]::automap_to")){
									automap.inputno_k = blocks.get("blocks["+block+"]::automap_to");
								}else if(blocktypes.contains(block_name+"::connections::in::automap_to")){
									automap.inputno_k = blocktypes.get(block_name+"::connections::in::automap_to");
								}else{
									automap.inputno_k = 0;
								}
								blocks.replace("blocks["+block+"]::automap_to",automap.inputno_k);
							}
							automap.mapped_k = block;
							automap.colours_k.colour = block_colour;
							automap.colours_k.dark = block_dark;
							automap.colours_k.darkest = block_darkest;
							note_poly.message("setvalue",  automap.available_k, "maptargetinput", automap.inputno_k);
						}else{
							automap.already_k = 1;
							automap.mapped_k_v = sidebar.selected_voice;
							automap.mapped_k = block;
							automap.colours_k.colour = block_colour;
							automap.colours_k.dark = block_dark;
							automap.colours_k.darkest = block_darkest;
							automap.inputno_k = -1;
						}
					}
				}else{
					if(!automap.lock_k){
						 automap.mapped_k = -2;
						 note_poly.message("setvalue", automap.available_k, "automapped", 0);
					}
				}
			}else{
				if((block_name == "core.input.keyboard")||!has_midi_in){
					automap.mapped_k = -2;
				}else{
					automap.mapped_k = -1;
				}
			}
			if(automap.available_c!=-1){
				if((block_name != "core.input.control.auto") && (block_name != "core.input.control.basic") && has_params){
					if((automap.mapped_c!=block&&!automap.lock_c)){
						automap.offset_c = 0;
						getmap=1; //flag set, then it collects up map data
						automap.mapped_c=block;
						automap.colours_c.colour = block_colour;
						automap.colours_c.dark = block_dark;
						automap.colours_c.darkest = block_darkest;
					}
				}else{
					if(!automap.lock_c){
						automap.mapped_c=-1;
						note_poly.message("setvalue", automap.available_c, "automapped", 0);					
					}
				}
			}

			if((automap.available_q!=-1)&&!automap.lock_q){
				if((block_type=="audio")||(block_type=="hardware")){
					if(automap.mapped_q != block+"."+sidebar.selected_voice){
						if(automap.mapped_q!=-1){
							set_automap_q(0);
							automap.mapped_q_channels = [];
							//automap.mapped_q = -1;
						}
						automap.mapped_q = block+"."+sidebar.selected_voice;
						automap.colours_q.colour = block_colour;
						automap.colours_q.dark = block_dark;
						automap.colours_q.darkest = block_darkest;
						if(sidebar.selected_voice == -1){
							automap.mapped_q_channels = voicemap.get(block);
							if(!Array.isArray(automap.mapped_q_channels)) automap.mapped_q_channels=[automap.mapped_q_channels];
						}else{
							automap.mapped_q_channels = [voicemap.get(block+"["+sidebar.selected_voice+"]")];
						}
						if(block_type=="audio"){ //TODO ADD CHOICE OVER OUTPUT NUMBER
							for(tc=0;tc<automap.mapped_q_channels.length;tc++) automap.mapped_q_channels[tc]-=MAX_NOTE_VOICES;
						}else if(block_type=="hardware"){
							if(blocktypes.contains(block_name+"::connections::out::hardware_channels")){
								var newlist = blocktypes.get(block_name+"::connections::out::hardware_channels");
								if(!Array.isArray(newlist)) newlist = [newlist];
								automap.mapped_q_channels = [];
								for(tc=0;tc<newlist.length;tc++){
									automap.mapped_q_channels.push(MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+newlist[tc]-1);
								}
							}else if(blocktypes.contains(block_name+"::connections::in::hardware_channels")){
								automap.mapped_q = -1;
								automap.mapped_q_channels = [];
								//post("\n\nTODO: we can only cue signals back from hardware. ones going only TO hardware would require a separate bit of routing code that isn't done.");
								/*
								var newlist = blocktypes.get(block_name+"::connections::in::hardware_channels");
								if(!Array.isArray(newlist)) newlist = [newlist];
								automap.mapped_q_channels = [];
								for(tc=0;tc<newlist.length;tc++){
									automap.mapped_q_channels.push(MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_OUTPUTS+newlist[tc]-1);
								}*/
							}else{
								automap.mapped_q = -1;
								automap.mapped_q_channels = [];
							}
						}
						if(automap.mapped_q!=-1) set_automap_q(automap.q_gain);
					}
				}else if(automap.mapped_q!=-1){
					//post("\nunmap automap cue");
					set_automap_q(0);
					automap.mapped_q = -1;
					automap.mapped_q_channels = [];
				}
			}
			
			automap.count = (automap.mapped_k>-1) || (automap.mapped_q!=-1) || ((automap.devicename_c!="")&&(block_name!="core.input.control.auto")) || ((automap.mapped_k==-1)||(automap.available_k_block>-1));
			
			if(automap.count) draw_automap_headers(sx, block);

			var current_p = blocks.get("blocks["+block+"]::poly::voices");

			if(current_p>1){
				// DRAW VOICE SELECTION LINE			
				lcd_main.message("paintrect",sidebar.x,y_offset,sidebar.x+1.5*fontheight,y_offset+fontheight*0.5,block_darkest);
				lcd_main.message("frgb", block_dark);
				lcd_main.message("moveto", sidebar.x+fo1, y_offset+0.4*fontheight);
				lcd_main.message("write", "selected : ");//, (sidebar.selected_voice == -1)?"block":("voice "+(sidebar.selected_voice+1)));
				var sx = sidebar.x + 1.6*fontheight;		
				for(i=-1;i<current_p;i++){
					var ex = sx + (((i==-1)?1:0.4) + (i>8)*0.2)*fontheight;
					if(i==sidebar.selected_voice){
						lcd_main.message("paintrect",sx,y_offset,ex,y_offset+fontheight*0.5,block_dark);
						lcd_main.message("frgb", block_colour);
					}else{
						lcd_main.message("paintrect",sx,y_offset,ex,y_offset+fontheight*0.5,block_darkest);
						lcd_main.message("frgb", block_dark);
						click_zone(select_voice, i, null, sx,y_offset,ex,y_offset+0.5*fontheight,mouse_index,1);
					}
					lcd_main.message("moveto", sx+fo1,y_offset+0.4*fontheight);
					lcd_main.message("write", (i == -1)?"block":(i+1));
					sx = ex+fo1;
					if(sx>sidebar.x2)i=99999;
				}
				if(sx<sidebar.x2) lcd_main.message("paintrect",sx,y_offset,sidebar.x2,y_offset+fontheight*0.5,block_darkest);
				y_offset += fontheight*0.6;
			}

			if(sidebar.mode == "block"){
				sidebar.scopes.starty = y_offset;
				sidebar.scopes.endy = y_offset+2*fontheight;
				sidebar.scopes.bg = block_darkest;
				sidebar.scopes.fg = block_colour;
				
				if(block_type == "audio" || block_type == "hardware"){
					if(sidebar.selected_voice != -1){
						for(i=0;i<NO_IO_PER_BLOCK;i++){
							lcd_main.message("paintrect", sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-fo1,sidebar.scopes.endy,block_darkest);
							if(view_changed===true) click_rectangle( sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-fo1,sidebar.scopes.endy,mouse_index,2);
						}
						mouse_click_actions[mouse_index] = scope_zoom;
						mouse_click_parameters[mouse_index] = "-1";
						mouse_click_values[mouse_index] = "";	
						mouse_index++;
					}else{
						for(i=0;i<sidebar.scopes.voicelist.length;i++){
							lcd_main.message("paintrect", sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-fo1,sidebar.scopes.endy,block_darkest);
							click_zone(scope_zoom, Math.floor(i>>1), null, sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-fo1,sidebar.scopes.endy,mouse_index,2);
						}
					}
					
					y_offset += fontheight*2.1;						
				}else if(blocktypes.contains(block_name+"::connections::in::midi")){
					y_offset += fontheight*2.1;
					lcd_main.message("paintrect", sidebar.x, sidebar.scopes.starty,sidebar.x2,sidebar.scopes.endy,block_darkest);
					click_zone(scope_midinames, null,null, sidebar.x, sidebar.scopes.starty,sidebar.x2,sidebar.scopes.endy,mouse_index,1);
				}
				if(blocktypes.contains(block_name+"::ui_in_sidebar_height") && (displaymode != "custom") && (displaymode != "panels")){
					var ui_h = blocktypes.get(block_name+"::ui_in_sidebar_height");
					if((block_voicecount>1) && (blocktypes.contains(block_name+"::ui_in_sidebar_expands"))) ui_h += (block_voicecount-1) * blocktypes.get(block_name+"::ui_in_sidebar_expands");
					var miplus16 = mouse_index + 16;
					//this is a bit hacky, but because sometimes the ui may have fewer or more clickable
					//elements depending on status, you just make this section take up max(16,actual length)
					//ie if it has more than 16 elements then you hope it stays constant

					if(ui_h>0){
						sidebar.panel = 1;
						ui_h *= fontheight;
						//draw the panelui for this block here
						if(!blocktypes.contains(block_name+"::no_edit")){
							click_zone(set_display_mode, "custom", block, sidebar.x,y_offset,sidebar.x2,y_offset+ui_h,mouse_index,1);
							//if the ui patcher doesn't make the area clickable, it clicks through to the full size ui
						}
						ui_poly.message("setvalue",  block+1, "setup", sidebar.x,y_offset,sidebar.x2,y_offset+ui_h,mainwindow_width);
						custom_block = block;
						y_offset += ui_h + fo1;
					}
					mouse_index = Math.max(miplus16,mouse_index);
				}
			}
			//button to open editor. currently a full row, but it may easily fit on with some of the above stuff? but position needs to be consistent
			if((block_type!="hardware")&&(blocktypes.contains(block_name+"::block_ui_patcher"))&&(blocktypes.get(block_name+"::block_ui_patcher")!="blank.ui")&&(!blocktypes.contains(block_name+"::no_edit"))){
				mouse_click_actions[mouse_index] = set_display_mode;
				mouse_click_values[mouse_index] = block;
				var ebg=block_darkest;
				var efg=block_colour;
				var et="<< edit"
				if(displaymode=="custom"){
					ebg = block_colour;
					efg = block_darkest;
					mouse_click_parameters[mouse_index] = "custom_fullscreen";
					et=">> edit fullscreen"
				}/*else if(displaymode=="custom_fullscreen"){ //never happens, doesn't draw sidebar in fullscreen
				}*/else{ // 'self' just pops open the patcher as if it was a vst editor
					// nb this isn't a magic bullet for easy dev - these patchers still 
					// need to store their data etc like the js-based ui's do.
					if(blocktypes.get(block_name+"::block_ui_patcher")=="self"){
						mouse_click_actions[mouse_index] = open_patcher;
						mouse_click_parameters[mouse_index] = block;
						mouse_click_values[mouse_index] = -1;
					}else{
						mouse_click_parameters[mouse_index] = "custom";
					}
				}
				if(usermouse.clicked2d == mouse_index){
					efg = block_darkest;
					ebg = menucolour;
				}
				lcd_main.message("paintrect", sidebar.x,y_offset,sidebar.x2,y_offset+fontheight*0.5,ebg);
				lcd_main.message("frgb" , efg);
				if(view_changed===true) click_rectangle( sidebar.x,y_offset,sidebar.x2,y_offset+fontheight*0.5,mouse_index,1);
				mouse_index++;
				lcd_main.message("moveto" ,sidebar.x+2*fo1, y_offset+fontheight*0.4);
				lcd_main.message("write", et);

				y_offset += fontheight*0.6;
			}else if(blocktypes.contains(block_name+"::plugin_name")){
				var fc = block_colour;
				var bc = block_darkest;
				if(usermouse.clicked2d == mouse_index){
					fc = block_darkest;
					bc = block_colour;
				}
				lcd_main.message("paintrect", sidebar.x,y_offset,sidebar.x2, y_offset+0.5*fontheight,bc);
				if(view_changed===true) click_rectangle( sidebar.x,y_offset,sidebar.x2,y_offset+0.5*fontheight,mouse_index,1);
				mouse_click_actions[mouse_index] = show_vst_editor;
				mouse_click_parameters[mouse_index] = block;
				mouse_click_values[mouse_index] = block;
				mouse_index++;
				lcd_main.message("frgb" , fc);
				lcd_main.message("moveto" ,sidebar.x+2*fo1, y_offset+fontheight*0.4);
				if(blocktypes.get(block_name+"::plugin_type")=="amxd"){
					lcd_main.message("write", "open max for live device window");
				}else{
					lcd_main.message("write", "open vst");
				}
				y_offset += 0.6*fontheight;
			}
			if((sidebar.mode == "block")||(sidebar.mode == "add_state")){
				var groups = [];
				var params = [];
				var knob_x = 0; var knob_y = 0;
				if(!has_params){
					lcd_main.message("paintrect", sidebar.x , y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
					lcd_main.message("moveto" ,sidebar.x + fontheight*0.2, fontheight+y_offset-9);
					lcd_main.message("frgb" , block_dark);
					lcd_main.message("write", "no parameters");
					y_offset += fontheight*1.1;
				}else{
					params = blocktypes.get(block_name+"::parameters");
					if(!Array.isArray(params))params = [params];
					if(!blocktypes.contains(block_name+"::groups")){
						var paramarray = [];
						groups[0] = new Dict;
						for(i=0;i<params.length;i++){
							paramarray[i] = i;
						}
						groups[0].replace("contains",paramarray);
					}else{
						groups = blocktypes.get(block_name+"::groups");
						if(!Array.isArray(groups)) groups = [groups];
					}
					var vl = voicemap.get(block);
					if(!Array.isArray(vl))vl=[vl];
					var w_slider,h_slider,colour,plist;
					var slidercount; //used to hide sliders that apply to not-yet-active voices
					var maxnamelabely,namelabely,x1,x2,y1,y2,p_type,p_values,pv,namearr,tk,wk,wrap;
					var mod_in_para = [];
					if(MODULATION_IN_PARAMETERS_VIEW){
						//see if any connections go to this parameter
						for(var ci=connections.getsize("connections");ci>=0;ci--){
							if(connections.contains("connections["+ci+"]::to::number")){
								if(connections.get("connections["+ci+"]::to::number")==block){
									if(connections.get("connections["+ci+"]::to::input::type")=="parameters"){
										var ic=connections.get("connections["+ci+"]::to::input::number");
										if(mod_in_para[ic]==null)mod_in_para[ic]=[];
										mod_in_para[ic].push(ci);
									}
								}
							}
						}
					}
					if(getmap){
						automap.groups = []; //index is controller row number
						automap.groups[0] = 0;
					}
					
					for(i=0;i<groups.length;i++){
						var this_group_mod_in_para=[];
						automap.sidebar_row_ys[i] = y_offset;
						colour=block_colour;
						if(groups[i].contains("colour")){
							colour = groups[i].get("colour");
						}
						if(groups[i].contains("header")){
							y_offset += fo1;
							lcd_main.message("paintrect",sidebar.x,y_offset,sidebar.x2,y_offset+fontheight*0.5,colour[0]*bg_dark_ratio,colour[1]*bg_dark_ratio,colour[2]*bg_dark_ratio);
							lcd_main.message("moveto", sidebar.x+fo1, y_offset+0.4*fontheight);
							lcd_main.message("frgb", colour);
							lcd_main.message("write", groups[i].get("header"));
							y_offset += fontheight*0.6;
						}
						h_slider = 3;
						if(groups[i].contains("height")){
							h_slider = groups[i].get("height");
						}
						var nolabel = 0;
						if(groups[i].contains("nolabel"))nolabel = 1;
						plist = groups[i].get("contains");
						if(!Array.isArray(plist)) plist = [plist];
						slidercount=plist.length;
						if(getmap){
							var actualcount=0;
							t = -1;
							for(tk=0;tk<plist.length;tk++) if(plist[tk]!=t){t = plist[tk]; actualcount++; }
							var spares = (actualcount<automap.c_cols) ? (automap.c_cols - actualcount) : 0;
						}

						var columns = Math.max(1,slidercount);
						var opvf = groups[i].contains("onepervoice");
						w_slider = (sidebar.width + fo1)/columns;
						maxnamelabely =-99999;
						if((h_slider>0) && (h_slider<1) && (vl.length != 1) && !params[curp].contains("nopervoice")) h_slider =0;
						y1 = y_offset +  fontheight * (4 * knob_y);
						y2 = y_offset +  fontheight * (4 * knob_y + h_slider+1.5*(h_slider==0));
						var h_ext=0;
						for(t=0;t<slidercount;t++){
							var curp = plist[t];
							wk=0;
							for(tk=t;tk<slidercount;tk++){
								if(plist[tk]==plist[t]) wk++;
							}
							if(params[curp].contains("name")){
								p_type = params[curp].get("type");
								wrap = params[curp].get("wrap");
								if(getmap==1){
									if(p_type!="button"){
										if(opvf && (p_type=="menu_b")){
											//these should get added to button map list instead
											//is it here or later?
										}else if(opvf){
											for(var vc=0;vc<current_p;vc++){
												if((map_y>=0)){
													maplist.push(0-(MAX_PARAMETERS*block+curp));
													mapwrap.push(wrap|0);
													maplistopv.push(MAX_PARAMETERS*vl[vc]+curp);
													mapcolours.push(colour[0]);
													mapcolours.push(colour[1]);
													mapcolours.push(colour[2]);
													automap.groups[map_y] = i;
													if((spares>0)&&(wk>1)&&(map_x<(automap.c_cols-1))&&((map_x/automap.c_cols)<((t+wk)/slidercount))){
														map_x++;
														maplist.push(-1);
														mapwrap.push(-1);
														maplistopv.push(-1);
														mapcolours.push(-1);
														spares--;
													}
												}
												map_x++;
												if(map_x>=automap.c_cols){
													map_x=0;
													map_y++;
												}	
											}
										}else{
											//should this also exclude menu_b from mappings here?
											if((map_y>=0)){//&&(map_y<automap.c_rows)){
												maplist.push(MAX_PARAMETERS*block+curp);
												mapwrap.push(wrap|0);
												maplistopv.push(-1);
												mapcolours.push(colour[0]);
												mapcolours.push(colour[1]);
												mapcolours.push(colour[2]);
												automap.groups[map_y] = i;
												if((spares>0)&&(wk>1)&&(map_x<(automap.c_cols-1))&&((map_x/automap.c_cols)<((t+wk)/slidercount))){
													map_x++;
													maplist.push(-1);
													mapwrap.push(0);
													maplistopv.push(-1);
													mapcolours.push(-1);
													spares--;
												}
											}
											map_x++;
											if(map_x>=automap.c_cols){
												map_x=0;
												map_y++;
											}
										}
									}//buttons need target/message to be stored so are done later
								}
								if((y2>0)&&(y1<mainwindow_height)){
									x1 = sidebar.x + w_slider*knob_x;
									x2 = sidebar.x + w_slider*(knob_x+wk) - fo1;
									p_values = params[curp].get("values");
									namelabely=y1+fontheight*(0.4+h_slider);
									var flags = (p_values[0]=="bi");
									if(opvf){
										flags |= 2;
										//flags |= 4 * t;
									}else if(params[curp].contains("nopervoice")){
										flags &= 61;
										flags |= 4; //removes 2 flag, adds 4 flag
									} 
									if(((p_type=="menu_d")||(p_type=="menu_l")) && (vl.length != 1)&&!params[curp].contains("nopervoice")) p_type = "menu_i";
									if(p_type=="button"){
										paramslider_details[curp]=[x1,y1,x2,y2/*maxnamelabely*/,colour[0]/2,colour[1]/2,colour[2]/2,mouse_index,block,curp,flags,vl[0],namelabely,p_type,wrap,block_name,h_slider,p_values];
										parameter_button(curp);
										//pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+curp);
										//var statecount = (p_values.length - 1) / 2;
										//var pv2 = Math.floor(pv * statecount * 0.99999) * 2  + 1;
										/*draw_button(x1,y1,x2,y2,colour[0]/2,colour[1]/2,colour[2]/2,mouse_index, p_values[pv2]);*/
										mouse_click_actions[mouse_index] = send_button_message;
										mouse_click_parameters[mouse_index] = block;
										//mouse_click_values[mouse_index] = [p_values[0],p_values[pv2+1],MAX_PARAMETERS*block+curp, (pv+(1/statecount)) % 1];
										if(getmap!=0){ //so ideally buttons should be something that if possible happens in max, for low latency
											//but it's so much easier just to call this fn
											buttonmaplist.push(block, p_values[0],p_values[pv2+1],MAX_PARAMETERS*block+curp, (pv+(1/statecount)) % 0.99);											
										}
										mouse_index++;
									}else if((p_type=="menu_l")){
										var h_s=h_slider;
										if(h_slider==0){
											h_s=1.5;
										}else{
											if(maxnamelabely>0){
												h_s = (maxnamelabely - y_offset)/fontheight; //+=0.9;
											}else{
												h_s += 0.9;//4;
												maxnamelabely = y1+fontheight*h_s;//_offset+h_s;
												//post("\nset max",maxnamelabely,y_offset,h_s);
											}
										}
										if(params[curp].contains("force_label")){
											if(maxnamelabely<0){
												maxnamelabely = y1+fontheight*(h_s-0.6);
												lcd_main.message("moveto",x1+4,maxnamelabely);
												maxnamelabely=-9999;
												h_s-=0.4;
											}else{
												lcd_main.message("moveto",x1+4,maxnamelabely-fontheight*0.2);
											}
											h_s-=0.6;
											lcd_main.message("frgb",colour);
											lcd_main.message("write",params[curp].get("name"));
										}
										var cols=1;
										if(params[curp].contains("columns")) cols = params[curp].get("columns");
										var valcol;
										if(params[curp].contains("colours")){
											valcol = params[curp].get("colours");//["+bl+"]");
										}else{
											valcol = [colour];
										}
										paramslider_details[curp]=[x1,y1,x2,y2,valcol,0,0,mouse_index,block,curp,flags,cols,statecount,p_type,wrap,vl[0],h_s,p_values];
										mouse_index = parameter_menu_l(curp);
										
										if(getmap!=0){ //so ideally buttons should be something that if possible happens in max, for low latency
											//but it's so much easier just to call this fn
											buttonmaplist.push(block, "param","",MAX_PARAMETERS*block+curp, ((ppv2+1.1) % statecount)/statecount);
										}
									}else if((p_type=="menu_d")){
										var fl=0;
										var h_s = fontheight*(h_slider + (h_slider==0)*1.5);
										if(params[curp].contains("force_label")){
											/*if(maxnamelabely<0){
												maxnamelabely = y1+fontheight*(h_s-0.6);
												lcd_main.message("moveto",x1+4,maxnamelabely);
												maxnamelabely=-9999;
												h_s-=0.4;
											}else{
												lcd_main.message("moveto",x1+4,maxnamelabely-fontheight*0.2);
										}
										h_s-=0.6;*/
											lcd_main.message("moveto",x1+4,y1+fontheight*0.4);
											lcd_main.message("frgb",colour);
											lcd_main.message("write",params[curp].get("name"));
											fl = 0.5 * fontheight;
											if(fl<(h_s-0.6*fontheight)) fl = h_s-0.6*fontheight;
										}
										var cols=1;
										if(params[curp].contains("columns")) cols = params[curp].get("columns");
										var valcol;
										if(params[curp].contains("colours")){
											valcol = params[curp].get("colours");//["+bl+"]");
										}else{
											valcol = [colour];
										}
										paramslider_details[curp]=[x1,y1+fl,x2,y2+fl,valcol,0,0,mouse_index,block,curp,flags,cols,statecount,p_type,wrap,vl[0],h_slider,p_values];
										h_ext = Math.max(h_ext,parameter_menu_d(curp));
										if(getmap!=0){ //so ideally buttons should be something that if possible happens in max, for low latency
											//but it's so much easier just to call this fn
											buttonmaplist.push(block, "param","",MAX_PARAMETERS*block+curp, ((ppv2+1.1) % statecount)/statecount);
										}
										if(h_ext+fl<h_s) h_ext=0;
									}else if((p_type=="menu_b")){
										wrap = 1;
										var statecount = (p_values.length);
										pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+curp);
										var ppv2 = Math.floor(pv * statecount * 0.99999); 
										//ideally i'd like to be able to draw menu_b for polyphonic blocks
										//this means it needs to stash the params[]-colours in paramslider_details?
										var w = x2-x1; //-2;
										if(flags&4){ //no pervoice
											var pv2 = Math.floor(pv * statecount * 0.99999);
											var valcol;
											var pv3 = pv2/statecount;
											if(params[curp].contains("colours")){
												valcol = params[curp].get("colours["+pv2+"]");
											}else{
												var pv4;
												if(statecount==2){
													pv4 = pv3*0.9 + 0.3;
												}else{
													pv4 = pv3*0.6 + 0.7;
												}
												valcol = [pv4*colour[0], pv4*colour[1], pv4*colour[2]];
											}
											paramslider_details[curp]=[x1,y1,x1+w,y2,valcol[0],valcol[1],valcol[2],mouse_index,block,curp,flags,null,namelabely,p_type,wrap,block_name,h_slider,p_values];
											parameter_menu_b(curp);
											mouse_click_actions[mouse_index] = send_button_message;
											mouse_click_parameters[mouse_index] = block;
											mouse_click_values[mouse_index] = ["param","",MAX_PARAMETERS*block+curp, ((ppv2+1.1) % statecount)/statecount];
											/*	mouse_click_actions[mouse_index] = static_mod_adjust;
												mouse_click_parameters[mouse_index] = [curp, block, vl[v]];
												//post("\npv,sc",pv,statecount);
												mouse_click_values[mouse_index] = ((1.01+pv2-ppv2)/statecount) % 1;//["param","",MAX_PARAMETERS*block+curp, ((ppv2+1.1) % statecount)/statecount];
												
											}*/
											mouse_index++;
											if(getmap!=0){ //so ideally buttons should be something that if possible happens in max, for low latency
												//but it's so much easier just to call this fn
												buttonmaplist.push(block, "param","",MAX_PARAMETERS*block+curp, ((ppv2+1.1) % statecount)/statecount);
											}
										}else{
											var ww = (w + 2*(opvf))/vl.length;
											var ww2 = ww - 2*(opvf);
											for(var v=0;v<vl.length;v++){
												pv = voice_parameter_buffer.peek(1, MAX_PARAMETERS*vl[v]+curp);
												var pv2 = Math.floor(pv * statecount * 0.99999);
												var valcol;
												var pv3 = pv2/statecount;
												if(params[curp].contains("colours")){
													valcol = params[curp].get("colours["+pv2+"]");
												}else{
													var pv4;
													if(statecount==2){
														pv4 = pv3*0.9 + 0.3;
													}else{
														pv4 = pv3*0.6 + 0.7;
													}
													valcol = [pv4*colour[0], pv4*colour[1], pv4*colour[2]];
												}
												paramslider_details[curp]=[x1+v*ww,y1,x1+v*ww+ww2,y2,valcol[0],valcol[1],valcol[2],mouse_index,block,curp,flags,vl[v],namelabely,p_type,wrap,block_name,h_slider,p_values];
												parameter_menu_b(curp);
												/*if(vl.length==1){
													mouse_click_actions[mouse_index] = send_button_message;
													mouse_click_parameters[mouse_index] = block;
													mouse_click_values[mouse_index] = ["param","",MAX_PARAMETERS*block+curp, ((ppv2+1.1) % statecount)/statecount];
												}else{*/
													mouse_click_actions[mouse_index] = static_mod_adjust;
													mouse_click_parameters[mouse_index] = [curp, block, vl[v]];
													//post("\npv,sc",pv,statecount);
													mouse_click_values[mouse_index] = ((1.01+pv2-ppv2)/statecount) % 1;//["param","",MAX_PARAMETERS*block+curp, ((ppv2+1.1) % statecount)/statecount];
													
												//}
												mouse_index++;
												if(getmap!=0){ //so ideally buttons should be something that if possible happens in max, for low latency
													//but it's so much easier just to call this fn
													buttonmaplist.push(block, "param","",MAX_PARAMETERS*block+curp, ((ppv2+1.1) % statecount)/statecount);
												}
											}
										}
										if(params[curp].contains("force_label")){
											if(maxnamelabely<0){
												maxnamelabely = y1+fontheight*(h_s-0.6);
												lcd_main.message("moveto",x1+4,maxnamelabely);
												maxnamelabely=-9999;
												h_s-=0.4;
											}else{
												lcd_main.message("moveto",x1+4,maxnamelabely-fontheight*0.2);
											}
											h_s-=0.6;
											lcd_main.message("frgb",colour);
											lcd_main.message("write",params[curp].get("name"));
										}
									}else{
										if(nolabel){
											namearr="";
										}else{
											namearr = params[curp].get("name");
											namearr = namearr.split("_");
										}
										var click_to_set = 0;
										if(params[curp].contains("click_set")) click_to_set = params[curp].get("click_set");
										if(h_slider<1){
											paramslider_details[curp]=[x1,y1,x2,y2,colour[0]/2,colour[1]/2,colour[2]/2,mouse_index,block,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider,0,click_to_set];
										}else{
											paramslider_details[curp]=[x1,y1,x2,y2,colour[0],colour[1],colour[2],mouse_index,block,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider,0,click_to_set];
										}
										namelabely = labelled_parameter_v_slider(curp);
										paramslider_details[curp][17]=namelabely;
										//paramslider_details is used for quick redraw of a single slider. index is curp
										//ie is mouse_click_parameters[index][0]
										mouse_click_actions[mouse_index] = sidebar_parameter_knob;
										mouse_click_parameters[mouse_index] = [curp, block,wrap];
										if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")||(p_type=="menu_l")||(p_type=="menu_d")){
											//if it's a menu_b or menu_i store the slider index + 1 in mouse-values
											mouse_click_values[mouse_index] = curp+1;
										}else{
											mouse_click_values[mouse_index] = "";
										}								
										mouse_index++;
									}
									if(MODULATION_IN_PARAMETERS_VIEW){
										if(Array.isArray(mod_in_para[curp])){
											this_group_mod_in_para.push(curp);
										}
										namelabely+=fo1;
									}
								}else{
									namearr = params[curp].get("name");
									namearr = namearr.split("_");
									namelabely=y1+fontheight*(0.4+h_slider+0.4*namearr.length);
								}
								if(namelabely>maxnamelabely) maxnamelabely=namelabely;
								knob_x+=wk;
								if(knob_x>=columns){
									knob_x = 0;
									y_offset += fontheight * (h_slider + 0.1 + 1.6*(h_slider==0));
								}	
							}
							t += wk-1;
						}
						if((h_slider>=1) && (maxnamelabely>(y2))){
							y_offset += maxnamelabely - y2;
						}
						if(h_ext>0) y_offset += h_ext;
						if(this_group_mod_in_para.length>0){
							namelabely = y_offset-fo1;
							for(var cu=this_group_mod_in_para.length;cu>0;cu--){
								var curp = this_group_mod_in_para[cu-1];
								for(var ip=mod_in_para[curp].length;ip>0;ip--){
									var namelabelyo = namelabely;
									namelabely+=fontheight*0.3;
									var scale = connections.get("connections["+mod_in_para[curp][ip-1]+"]::conversion::scale");
									var thisco;
									if(connections.get("connections["+mod_in_para[curp][ip-1]+"]::conversion::mute")==1){
										thisco = [120,120,120];
									}else{
										thisco = [colour[0],colour[1],colour[2]];
									}
									draw_h_slider((sidebar.x*0.4+0.6*sidebar.x2), namelabelyo+fo1, sidebar.x2, namelabely,thisco[0],thisco[1],thisco[2],mouse_index,scale);
									mouse_click_actions[mouse_index] = connection_edit;
									mouse_click_parameters[mouse_index] = "connections["+mod_in_para[curp][ip-1]+"]::conversion::scale";
									//post("\ndraw modulation connection",mod_in_para[curp][ip-1],mouse_click_parameters[mouse_index],scale);
									mouse_click_values[mouse_index] = 0;
									mouse_index++;
					
									lcd_main.message("moveto",sidebar.x+0.6*fo1,namelabely);
									lcd_main.message("frgb",0.6*thisco[0],0.6*thisco[1],0.6*thisco[2]);
									var fromn = blocks.get("blocks["+connections.get("connections["+mod_in_para[curp][ip-1]+"]::from::number")+"]::name");
									var froml = blocks.get("blocks["+connections.get("connections["+mod_in_para[curp][ip-1]+"]::from::number")+"]::label");
									var ftype = connections.get("connections["+mod_in_para[curp][ip-1]+"]::from::output::type");
									var fnum = connections.get("connections["+mod_in_para[curp][ip-1]+"]::from::output::number");
									var fromn2 = blocktypes.get(fromn+"::connections::out::"+ftype+"["+fnum+"]");
									froml = froml.split(".");
									fromn = froml.pop();
									fromn = froml.pop()+"."+fromn;
									fromn = fromn+"/"+fromn2;
									var pnam = params[curp].get("name");
									pnam = pnam.replace("_"," ");
									lcd_main.message("write", fromn+" → "+pnam +"/"+ connections.get("connections["+mod_in_para[curp][ip-1]+"]::to::voice"));
									click_zone(sidebar_select_connection,mod_in_para[curp][ip-1],1,sidebar.x,namelabelyo,(sidebar.x*0.4+0.6*sidebar.x2),namelabely,mouse_index,1);
								}
	
							}
							y_offset=namelabely+fontheight*0.2;
						}
						if((automap.mapped_c==block)){ //(automap.offset_range_c>0)&&(automap.mouse_follow)&&
							automap.sidebar_row_ys[i+1] = y_offset;
							var gr = 0;
							var first=-1;
							for(var gi=0;gi<automap.groups.length;gi++){ 
								gr += (automap.groups[gi]==i);
								if((first==-1)&&(automap.groups[gi]==i)) first = gi;
							}
							var gh = (y_offset - automap.sidebar_row_ys[i] - 8)/gr;
							var yy = automap.sidebar_row_ys[i]+4;
							var sbx = mainwindow_width-4;
							for(var g=first;g<first+gr;g++){
								if((g >= automap.offset_c)&&(g < (automap.offset_c+automap.c_rows))){
									lcd_main.message("frgb",colour);
									lcd_main.message("moveto",sbx,yy);
									lcd_main.message("lineto",sbx,yy+gh-4);
								}							
								yy += gh;
							}
						}
						if(getmap==1){
							if(map_x!=0){ //wrap round to the next row, padding maplist with -1s if still inside the row limit
								if((map_y>=0)){// && (map_y<automap.c_rows)){
									for(var tm=0;tm<(automap.c_cols-map_x);tm++){
										maplist.push(-1);
										mapwrap.push(0);
										maplistopv.push(-1);
										mapcolours.push(-1);
									}
								}
								map_x=0;
								map_y++;
							}									
						}
					}
					if(getmap!=0){
						while(map_y<automap.c_rows){ //pads out the list up to rows x cols long.
							mapcolours.push(-1);
							map_x++;
							if(map_x>=automap.c_cols){
								map_x = 0;
								map_y++;
							}
						}
						automap.offset_range_c = Math.max(0,map_y - automap.c_rows + automap.offset_c);
						note_poly.message("setvalue", automap.available_c, "automapped", 1);
						note_poly.message("setvalue", automap.available_c, "automap_offset", automap.offset_c);
						note_poly.message("setvalue", automap.available_c,"maplistopv",maplistopv);
						note_poly.message("setvalue", automap.available_c,"maplist",maplist);
						note_poly.message("setvalue", automap.available_c,"mapwrap",mapwrap);
						note_poly.message("setvalue", automap.available_c,"mapcolour",mapcolours);
						if(buttonmaplist.length>0){
							note_poly.message("setvalue", automap.available_c,"buttonmaplist",buttonmaplist);
						}else{
							note_poly.message("setvalue", automap.available_c,"buttonmaplist",-1);
						}
					}
				}
				colour=block_colour;
				y_offset += fontheight * 4 * knob_y;
			}else if(sidebar.mode == "flock"){
				click_zone(set_sidebar_mode, "block", null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_colour );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb", 0,0,0 );
				lcd_main.message("write", "assign parameters to flocking");
				y_offset += 1.1* fontheight;
				var groups = [];
				var params = [];
				var knob = { x:0 , y:0 };
				var cx = [];
				var cy = [];
				if(!has_params){
					sidebar.mode = "settings";
				}else{
					params = blocktypes.get(block_name+"::parameters");
					if(blocktypes.getsize(block_name+"::parameters")==1)params = [params];
					if(!blocktypes.contains(block_name+"::groups")){
						var paramarray = [];
						groups[0] = new Dict;
						for(i=0;i<params.getsize();i++){
							paramarray[i] = i;
						}
						groups[0].replace("contains",paramarray);
					}else if(blocktypes.getsize(block_name+"::groups")==1){
						groups[0]=blocktypes.get(block_name+"::groups[0]");
					}else{
						groups = blocktypes.get(block_name+"::groups");
					}

					var w_slider,h_slider,colour,plist;
					var maxnamelabely,namelabely,x1,x2,y1,y2,p_type,p_values,pv,namearr,tk,wk,wrap;
					for(i=0;i<groups.length;i++){
						//colour=menucolour;
						//if(groups[i].contains("colour")){
						//	colour = groups[i].get("colour");
						//}
						h_slider = 3;
						if(groups[i].contains("height")){
							h_slider = groups[i].get("height");
						}
						plist = groups[i].get("contains");
						if(!Array.isArray(plist)) plist = [plist];
						var columns = Math.max(1,plist.length);
						w_slider = (sidebar.width + fo1)/columns;
						maxnamelabely =0;
						y1 = y_offset +  fontheight * (4 * knob_y);
						y2 = y_offset +  fontheight * (4 * knob_y + h_slider+(h_slider==0));
						for(t=0;t<plist.length;t++){
							wk=0;
							for(tk=t;tk<plist.length;tk++){
								if(plist[tk]==plist[t]) wk++;
							}
							if(params[plist[t]].contains("name")){
								x1 = sidebar.x + w_slider*knob_x;
								x2 = sidebar.x + w_slider*(knob_x+wk) - fo1;
								cx[plist[t]] = (x1+x2)*0.5;
								cy[plist[t]] = (y1+y2)*0.5;
								p_type = params[plist[t]].get("type");
								p_values = params[plist[t]].get("values");
								wrap = params[plist[t]].get("wrap");
								pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+plist[t]);
								if(p_type=="button"){
									lcd_main.message("framerect", x1, y1, x2, y2, 50,50,50 );
								}else{
									if(h_slider<1){
										parameter_v_slider(x1,y1,x2,y2,50,50,50,0,block,plist[t],p_values[0]);
									}else{
										parameter_v_slider(x1,y1,x2,y2,50,50,50,0,block,plist[t],p_values[0]);
									}
								}
								namelabely=y1+fontheight*(0.4+h_slider);
								namearr = params[plist[t]].get("name");
								namearr = namearr.split("_");
								//lcd_main.message("frgb",colour[0],colour[1],colour[2]);
								for(var c = 0;c<namearr.length;c++){
									lcd_main.message("moveto",x1+fo1,namelabely);
									lcd_main.message("write",namearr[c]);				
									namelabely+=0.4*fontheight;
								}
								lcd_main.message("moveto",x1+fo1,namelabely);
								if(namelabely>maxnamelabely) maxnamelabely=namelabely;
								
								knob_x+=wk;
								if(knob_x>=columns){
									knob_x = 0;
									//knob_y++;
									y_offset += fontheight * (h_slider + 1 + 0.1*(h_slider==0));
								}	
							}
							t += wk-1;
						}
						if(maxnamelabely>(y1+fontheight*3.4)){
							y_offset += maxnamelabely - y1 - fontheight*3.8;
						}
					}
					var r=fontheight*0.6;
					var fplist = [];
					if(blocks.contains("blocks["+block+"]::flock::parameters")){
						fplist = blocks.get("blocks["+block+"]::flock::parameters");
						if(fplist=="")fplist=[-1,-1,-1];
					}else{
						fplist = [-1,-1,-1];
					}
					setfontsize(fontheight);
					for(i=0;i<cx.length;i++){
						if(cx[i]!=0){
							lcd_main.message("paintoval", cx[i]-r,cy[i]-r,cx[i]+r,cy[i]+r,0,0,0);
							lcd_main.message("frameoval", cx[i]-r,cy[i]-r,cx[i]+r,cy[i]+r,menucolour);
							click_oval(cx[i]-r,cy[i]-r,cx[i]+r,cy[i]+r,mouse_index,1);
							mouse_click_actions[mouse_index] = flock_click;
							mouse_click_parameters[mouse_index] = [block, i];
							mouse_click_values[mouse_index] = "flock_click";
							mouse_index++;
							if(i==fplist[0]){
								lcd_main.message("moveto",cx[i]-fontheight*0.3,cy[i]+fontheight/3);
								lcd_main.message("write","X");
							}else if(i==fplist[1]){
								lcd_main.message("moveto",cx[i]-fontheight*0.25,cy[i]+fontheight/3);
								lcd_main.message("write","Y");
							}else if(i==fplist[2]){
								lcd_main.message("moveto",cx[i]-fontheight*0.3,cy[i]+fontheight/3);
								lcd_main.message("write","Z");
							}
						}
					}
					setfontsize(fontsmall);
				}
				y_offset += fontheight * 4 * knob_y;
				//y_offset += fontheight*1.1;
			}else if(sidebar.mode == "panel_assign"){
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_colour );
				click_zone(set_sidebar_mode, "block", null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb", 0,0,0 );
				lcd_main.message("write", "assign parameters to panel");
				y_offset += 1.1* fontheight;
				var groups = [];
				var params = [];
				var knob = { x:0 , y:0 };
				var cx = [];
				var cy = [];
				if(!has_params){
					sidebar.mode = "settings";
				}else{
					params = blocktypes.get(block_name+"::parameters");
					if(blocktypes.getsize(block_name+"::parameters")==1)params = [params];
					if(!blocktypes.contains(block_name+"::groups")){
						var paramarray = [];
						groups[0] = new Dict;
						for(i=0;i<params.getsize();i++){
							paramarray[i] = i;
						}
						groups[0].replace("contains",paramarray);
					}else if(blocktypes.getsize(block_name+"::groups")==1){
						groups[0]=blocktypes.get(block_name+"::groups[0]");
					}else{
						groups = blocktypes.get(block_name+"::groups");
					}

					var w_slider,h_slider,colour,plist;
					var maxnamelabely,namelabely,x1,x2,y1,y2,blockoffset,p_type,p_values,pv,namearr,tk,wk,wrap;
					for(i=0;i<groups.length;i++){
						//colour=menucolour;
						//if(groups[i].contains("colour")){
						//	colour = groups[i].get("colour");
						//}
						h_slider = 3;
						if(groups[i].contains("height")){
							h_slider = groups[i].get("height");
						}
						plist = groups[i].get("contains");
						if(!Array.isArray(plist)) plist = [plist];
						var columns = Math.max(1,plist.length);
						w_slider = (sidebar.width + fo1)/columns;
						maxnamelabely =0;
						y1 = y_offset +  fontheight * (4 * knob_y);
						y2 = y_offset +  fontheight * (4 * knob_y + h_slider+(h_slider==0));
						for(t=0;t<plist.length;t++){
							wk=0;
							for(tk=t;tk<plist.length;tk++){
								if(plist[tk]==plist[t]) wk++;
							}
							if(params[plist[t]].contains("name")){
								x1 = sidebar.x + w_slider*knob_x;
								x2 = sidebar.x + w_slider*(knob_x+wk) - fo1;
								cx[plist[t]] = (x1+x2)*0.5;
								cy[plist[t]] = (y1+y2)*0.5;
								p_type = params[plist[t]].get("type");
								p_values = params[plist[t]].get("values");
								wrap = params[plist[t]].get("wrap");
								pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+plist[t]);
								if(p_type=="button"){
									lcd_main.message("framerect", x1, y1, x2, y2, 50,50,50 );
								}else{
									if(h_slider<1){
										parameter_v_slider(x1,y1,x2,y2,50,50,50,0,block,plist[t],p_values[0]);
									}else{
										parameter_v_slider(x1,y1,x2,y2,50,50,50,0,block,plist[t],p_values[0]);
									}
								}
								namelabely=y1+fontheight*(0.4+h_slider);
								namearr = params[plist[t]].get("name");
								namearr = namearr.split("_");
								//lcd_main.message("frgb",colour[0],colour[1],colour[2]);
								for(var c = 0;c<namearr.length;c++){
									lcd_main.message("moveto",x1+fo1,namelabely);
									lcd_main.message("write",namearr[c]);				
									namelabely+=0.4*fontheight;
								}
								lcd_main.message("moveto",x1+fo1,namelabely);
								if(namelabely>maxnamelabely) maxnamelabely=namelabely;
								
								knob_x+=wk;
								if(knob_x>=columns){
									knob_x = 0;
									//knob_y++;
									y_offset += fontheight * (h_slider + 1 + 0.1*(h_slider==0));
								}	
							}
							t += wk-1;
						}
						if(maxnamelabely>(y1+fontheight*3.4)){
							y_offset += maxnamelabely - y1 - fontheight*3.8;
						}
					}
					var r=fontheight*0.6;
					var fplist = [];
					if(blocks.contains("blocks["+block+"]::panel::parameters")){
						fplist = blocks.get("blocks["+block+"]::panel::parameters");
						if(typeof fplist=="number") fplist =[fplist];
						if(fplist=="")fplist=[];
					}else{
						fplist = [];
					}
					setfontsize(fontheight);
					for(i=0;i<cx.length;i++){
						if(cx[i]!=0){
							lcd_main.message("paintoval", cx[i]-r,cy[i]-r,cx[i]+r,cy[i]+r,0,0,0);
							lcd_main.message("frameoval", cx[i]-r,cy[i]-r,cx[i]+r,cy[i]+r,block_colour);
							click_oval(cx[i]-r,cy[i]-r,cx[i]+r,cy[i]+r,mouse_index,1);
							mouse_click_actions[mouse_index] = panel_assign_click;
							mouse_click_parameters[mouse_index] = [block, i];
							mouse_click_values[mouse_index] = "panel_assign_click";
							mouse_index++;
							for(var it=0;it<fplist.length;it++){
								if(i==fplist[it]){
									lcd_main.message("paintoval", cx[i]-r*0.5,cy[i]-r*0.5,cx[i]+r*0.5,cy[i]+r*0.5,block_colour);
								}								
							}
						}
					}
					setfontsize(fontsmall);
				}
				y_offset += fontheight * 4 * knob_y;
				//y_offset += fontheight*1.1;
			}else if(sidebar.mode == "settings"){				
				if(has_params){
					lcd_main.message("paintrect", sidebar.x , y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
					lcd_main.message("frgb" , block_colour);
					lcd_main.message("moveto" ,sidebar.x + fontheight*0.2, 0.75*fontheight+y_offset);
					lcd_main.message("write", "parameters");
					click_zone(set_sidebar_mode, "block", null, sidebar.x , y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
					var groups = [];
					var params = [];
					params = blocktypes.get(block_name+"::parameters");
					if(!Array.isArray(params)) params = [params];
					if(!blocktypes.contains(block_name+"::groups")){
						var paramarray = [];
						groups[0] = new Dict;
						for(i=0;i<params.getsize();i++){
							paramarray[i] = i;
						}
						groups[0].replace("contains",paramarray);
					}else if(blocktypes.getsize(block_name+"::groups")==1){
						groups[0]=blocktypes.get(block_name+"::groups[0]");
					}else{
						groups = blocktypes.get(block_name+"::groups");
					}

					var w_slider,h_slider,colour,plist;
					var opv; //used to hide sliders that apply to not-yet-active voices
					var maxnamelabely,namelabely,x1,x2,y1,y2,p_type,p_values,pv,namearr,tk,wk,wrap;
					var getmap = 0;
					var totcol = 0;
					for(i=0;i<groups.length;i++){
						plist = groups[i].get("contains");
						if(!Array.isArray(plist)) plist = [plist];
						var columns = Math.max(1,plist.length);
						opv=plist.length;
						if(groups[i].contains("onepervoice")){
							opv=blocks.get("blocks["+block+"]::poly::voices");
							columns= Math.max(1,opv);
						}
						totcol+=columns+0.2;
					}
					totcol-=0.2;
					w_slider = (sidebar.width - fontheight * 2.1)/totcol;
					for(i=0;i<groups.length;i++){
						colour=block_colour;
						if(groups[i].contains("colour")){
							colour = groups[i].get("colour");
						}
						y1 = y_offset +  fo1;
						y2 = y_offset +  fontheight * 1;
						plist = groups[i].get("contains");
						if(!Array.isArray(plist)) plist = [plist];
						opv=plist.length;
						var columns= Math.max(1,opv);						
						for(t=0;t<opv;t++){
							wk=0;
							for(tk=t;tk<opv;tk++){
								if(plist[tk]==plist[t]) wk++;
							}
							if(params[plist[t]].contains("name")){
								p_type = params[plist[t]].get("type");
								if(p_type=="button"){
									paramslider_details[curp]=null;//[x1,y1,x2,y2,colour[0],colour[1],colour[2],mouse_index,block,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider];
								}else{
									x1 = sidebar.x + fontheight*2.2+ w_slider*knob_x;
									x2 = sidebar.x + w_slider*(knob_x+wk) + fontheight*2.1;
									p_values = params[plist[t]].get("values");
									wrap = params[plist[t]].get("wrap");
									pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+plist[t]);
									if(h_slider<1){
										paramslider_details[plist[t]]=[x1,y1,x2,y2,colour[0]/2,colour[1]/2,colour[2]/2,mouse_index,block,plist[t],p_values[0],"",0,p_type,wrap,block_name,h_slider];
									}else{
										paramslider_details[plist[t]]=[x1,y1,x2,y2,colour[0],colour[1],colour[2],mouse_index,block,plist[t],p_values[0],"",0,p_type,wrap,block_name,h_slider];
									}
									parameter_v_slider(paramslider_details[plist[t]][0], paramslider_details[plist[t]][1], paramslider_details[plist[t]][2], paramslider_details[plist[t]][3],paramslider_details[plist[t]][4], paramslider_details[plist[t]][5], paramslider_details[plist[t]][6], paramslider_details[plist[t]][7],paramslider_details[plist[t]][8], paramslider_details[plist[t]][9], paramslider_details[plist[t]][10]);
	
									paramslider_details[plist[t]][17]=namelabely;
									if(namelabely>maxnamelabely) maxnamelabely=namelabely;
									//paramslider_details is used for quick redraw of a single slider. index is plist[t]
									//ie is mouse_click_parameters[index][0]
									mouse_click_actions[mouse_index] = sidebar_parameter_knob;
									mouse_click_parameters[mouse_index] = [plist[t], block,wrap];
									if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")||(p_type=="menu_l")||(p_type=="menu_d")){
										//if it's a menu_b or menu_i store the next position in mouse_click_values
										mouse_click_values[mouse_index] = plist[t];//(pv+1/p_values.length) % 1;
									}else{
										mouse_click_values[mouse_index] = "";
									}								
									mouse_index++;
									knob_x+=wk;
									t += wk-1;
								}
							}
						}
						knob_x += 0.2;
					}
				}
				colour=block_colour;
				y_offset += fontheight*1.1;
				//y_offset += fontheight * 4 * knob_y;				
			}else if(has_params){
				//parameters header only displayed if not in block OR flock assign modes
				lcd_main.message("paintrect", sidebar.x , y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,sidebar.x + fontheight*0.2, 0.75*fontheight+y_offset);
				lcd_main.message("write", "parameters");// ("+blocktypes.getsize(block_name+"::parameters")+")");
				click_zone(set_sidebar_mode, "block" , null, sidebar.x , y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				y_offset += fontheight*1.1;
			}				
		// STATES LIST ##############################################################################################################
			if(sidebar.mode == "add_state"){
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_colour );
				click_zone(set_sidebar_mode, "states", null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb", 0,0,0 );
				lcd_main.message("write", "add state (ctrl+click to remove)");
				y_offset += 1.2* fontheight;
				var cll = config.getsize("palette::gamut");
				var c = new Array(3);
				var sc=0;
				var statex=0;
				if(states.contains("states::current")) sc=-1;
				var colt = (1+Math.floor((MAX_STATES-sc) / sidebar.width_in_units));
				var roww = -Math.floor(-(MAX_STATES-sc)/colt);
				var x_inc= (sidebar.width_in_units + 0.1)/roww;
				//post("\nmaxs",MAX_STATES,sidebar.width_in_units,"colt,",colt,"roww",roww,"x_inc",x_inc);
		
				// draw a button for each possible state
				for(;sc<MAX_STATES;sc++){
					var statecontents;
					if(sc==-1){
						statecontents = states.get("states::current");
					}else{
						statecontents = states.get("states::"+sc);
					}
					var slotfilled=0;
					var stateexists=0;
					if(!is_empty(statecontents)){
						stateexists=1;
						if(statecontents.contains(block)){
							slotfilled=1;
						}
					}
					var sn = "";
					if(sc==-1){
						sn = "init";
						c = [0,0,0];
					}else{
						c = config.get("palette::gamut["+Math.floor(sc*cll/MAX_STATES)+"]::colour");
					}
					if(states.contains("names::"+sc)){
						sn=states.get("names::"+sc);
					}
					if(usermouse.clicked2d == mouse_index) c = [255,255,255];
					lcd_main.message("paintrect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9*x_inc), fontheight*0.9+y_offset,c );							
					if(stateexists) lcd_main.message("framerect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9*x_inc), fontheight*0.9+y_offset,menucolour );
					if(slotfilled) lcd_main.message("framerect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9*x_inc), fontheight*0.9+y_offset,255,0,0 );
					click_zone(add_to_state,sc,block, sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,mouse_index,1 );							
					if(sc!=""){
						sn = sn.split(".");
						if(!Array.isArray(sn)) sn = [sn];
						for(var si=0;si<sn.length;si++){
							lcd_main.message("moveto", sidebar.x + fontheight*(statex+1-0.2*sn[si].length), y_offset+fontheight*(1-0.25*(sn.length-si)));
							lcd_main.message("frgb", 0,0,0);//c[0]*bg_dark_ratio, c[1]*bg_dark_ratio, c[2]*bg_dark_ratio);
							lcd_main.message("write", sn[si]);
						}
					}	
					statex+=x_inc;
					if(statex>(sidebar.width_in_units-0.9)){
						y_offset += 1* fontheight;
						statex=0;
					}
				}
				y_offset += fo1 + (statex!=0)*fontheight;
			}else if(has_params){
				click_zone(set_sidebar_mode,"add_state",null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("write", "states");
				
				var cll = config.getsize("palette::gamut")/MAX_STATES;
				var c = new Array(3);
				var sc=0;
				var overflowed=0;
				if(states.contains("states::current")) sc=-1;
				//var width = 0.1*(MAX_STATES-sc)+0.9*(states.getsize())//i gave up here because it's hard to actually get the size without running the loop below..
				var scw = 0.6*fontheight; //6.5*fontheight / (MAX_STATES - sc);
				var statex=0;
				// draw a button for each possible state
				for(;sc<MAX_STATES;sc++){
					var statecontents;
					if(sc==-1){
						statecontents = states.get("states::current");
						c = [0,0,0];
					}else{
						statecontents = states.get("states::"+sc);
						c = config.get("palette::gamut["+Math.floor(sc*cll)+"]::colour");
					}
					var slotfilled=0;
					var stateexists=0;
					if(!is_empty(statecontents)){
						stateexists=1;
						if(statecontents.contains(block)){
							slotfilled=1;
						}
					}
					if(usermouse.clicked2d == mouse_index) c = [255,255,255];
					if(slotfilled){
						lcd_main.message("paintrect", sidebar.x+fontheight*1.5 +scw*statex, y_offset+fontheight*0.2, sidebar.x+fontheight*1.5 +scw*(statex+0.9), fontheight*0.8+y_offset,c );							
						click_zone(fire_block_state,sc,block, sidebar.x+fontheight*1.5 +scw*statex, y_offset+fontheight*0.2, sidebar.x+fontheight*1.5 +scw*(statex+0.9), fontheight*0.8+y_offset,mouse_index,1 );							
						statex+=1.2;
					}else{
						statex+=0.2;
					}
					if((statex+1)*scw+1.7*fontheight>sidebar.width){
						overflowed += 0.8*fontheight;
						statex = 0;
						y_offset+=0.8*fontheight;
						lcd_main.message("paintrect", sidebar.x, y_offset+0.2, sidebar.x2, fontheight+y_offset,block_darkest );
					}
				}
				
				
				y_offset += 1.1* fontheight;					
			}
			if((sidebar.mode == "settings")||(sidebar.mode == "settings_flockpreset")){
		// BLOCK SETTINGS ##############################################################################################################
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_colour );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb", 0,0,0 );
				lcd_main.message("write", "block settings");
				y_offset += 1.1* fontheight;

				if((block_type == "audio")||(block_type == "hardware")){ //TODO build hw recording!
					if(usermouse.clicked2d == mouse_index){
						lcd_main.message("paintrect", sidebar.x2-7.6*fontheight, y_offset, sidebar.x2-6.6*fontheight, fontheight+y_offset,255,158,150 );
						lcd_main.message("frgb" ,255,255,255);
					}else if(record_arm[block]){
						lcd_main.message("paintrect", sidebar.x2-7.6*fontheight, y_offset, sidebar.x2-6.6*fontheight, fontheight+y_offset,255,58,50 );
						lcd_main.message("frgb" ,0,0,0);
					}else{
						lcd_main.message("paintrect", sidebar.x2-7.6*fontheight, y_offset, sidebar.x2-6.6*fontheight, fontheight+y_offset,block_darkest );
						lcd_main.message("frgb" ,255,58,50);
					}
					click_zone(set_record_arm,block,-1, sidebar.x2-7.6*fontheight, y_offset, sidebar.x2-6.6*fontheight, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("moveto" ,sidebar.x2-7.4*fontheight, fontheight*0.5+y_offset);
					lcd_main.message("write", "rec");
					lcd_main.message("moveto" ,sidebar.x2-7.4*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", "arm");
				}

				var bc, fc;
				if(block_type!="hardware"){
					bc = block_darkest;
					fc = [255,128,50];
					if(usermouse.clicked2d == mouse_index){ 
						bc = fc;
						fc = [0,0,0];
					}
					lcd_main.message("paintrect", sidebar.x2-6.5*fontheight, y_offset, sidebar.x2-5.5*fontheight, fontheight+y_offset,bc );
					click_zone(hard_reload_block,block,null, sidebar.x2-6.5*fontheight, y_offset, sidebar.x2-5.5*fontheight, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("frgb" ,fc);
					lcd_main.message("moveto" ,sidebar.x2-6.4*fontheight, fontheight*0.5+y_offset);
					lcd_main.message("write", "re-");
					lcd_main.message("moveto" ,sidebar.x2-6.4*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", "load");
				}

				if(usermouse.clicked2d == mouse_index){ 
					bc = block_colour;
					fc = block_darkest;
				}else{
					bc = block_darkest;
					fc = block_colour;
				}
				lcd_main.message("paintrect", sidebar.x2-5.4*fontheight, y_offset, sidebar.x2-4.4*fontheight, fontheight+y_offset,bc );
				click_zone(set_sidebar_mode, "edit_label", null, sidebar.x2-5.4*fontheight, y_offset, sidebar.x2-4.4*fontheight, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , fc);
				lcd_main.message("moveto" ,sidebar.x2-5.3*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("write", "re-");
				lcd_main.message("moveto" ,sidebar.x2-5.3*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "name");

				if(block_type!="hardware"){
					if(usermouse.clicked2d == mouse_index){ 
						bc = block_colour;
						fc = block_darkest;
					}else{
						bc = block_darkest;
						fc = block_colour;
					}
					lcd_main.message("paintrect", sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight+y_offset,bc );
					click_zone(open_patcher, block, -1, sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("frgb" , fc);
					lcd_main.message("moveto" ,sidebar.x2-4.2*fontheight, fontheight*0.5+y_offset);
					lcd_main.message("write", "open");
					lcd_main.message("moveto" ,sidebar.x2-4.2*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", "patch");
				}
				
				if(usermouse.clicked2d == mouse_index){ 
					bc = block_colour;
					fc = block_darkest;
				}else{
					bc = block_darkest;
					fc = block_colour;
				}
				lcd_main.message("paintrect", sidebar.x2-3.2*fontheight, y_offset, sidebar.x2-2.2*fontheight, fontheight+y_offset,bc );
				click_zone(copy_block, block, null, sidebar.x2-3.2*fontheight, y_offset, sidebar.x2-2.2*fontheight, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , fc);
				lcd_main.message("moveto" ,sidebar.x2-3.1*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "copy");

				if(usermouse.clicked2d == mouse_index){ 
					bc = block_colour;
					fc = block_darkest;
				}else{
					bc = block_darkest;
					fc = block_colour;
				}
				lcd_main.message("paintrect", sidebar.x2-2.1*fontheight, y_offset, sidebar.x2-1.1*fontheight, fontheight+y_offset,bc );
				click_zone(swap_block_button,block,null, sidebar.x2-2.1*fontheight, y_offset, sidebar.x2-1.1*fontheight, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , fc);
				lcd_main.message("moveto" ,sidebar.x2-1.9*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "swap");
				if(danger_button == mouse_index){
					lcd_main.message("paintrect", sidebar.x2-1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,255,0,0 );
					lcd_main.message("frgb" , 0,0,0);
				}else if(usermouse.clicked2d == mouse_index){
					lcd_main.message("paintrect", sidebar.x2-1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,block_colour );
					lcd_main.message("frgb", 0,0,0);
				}else{
					lcd_main.message("paintrect", sidebar.x2-1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
					lcd_main.message("frgb", 255,0,0);
				}
				click_zone(remove_block_btn,block,mouse_index, sidebar.x2-1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				// lcd_main.message("frgb" , 255,0,0);
				lcd_main.message("moveto" ,sidebar.x2-0.8*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "del");
				y_offset += 1.1* fontheight;
				
				// polyphony
				var max_p = blocktypes.get(blocks.get("blocks[" + block + "]::name") + "::max_polyphony");
				max_p = (max_p == 0) * 9999999999999;
				if((max_p!=1)&&(block_type!="hardware")){
					lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2 - 3.3 * fontheight, fontheight + y_offset, block_darkest);
					lcd_main.message("moveto", sidebar.x + fontheight * 0.2, fontheight * 0.75 + y_offset);
					lcd_main.message("frgb", block_colour);
					lcd_main.message("write", "polyphony");	
					
					//var current_p = blocks.get("blocks["+block+"]::poly::voices");
					if (current_p > 1) {
						if (usermouse.clicked2d == mouse_index) {
							bc = block_colour;
							fc = block_darkest;
						} else {
							bc = block_darkest;
							fc = block_colour;
						}
						lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2 - 2.2 * fontheight, fontheight + y_offset, bc);
						click_zone(poly_key, -1, -1, sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2 - 2.2 * fontheight, fontheight + y_offset, mouse_index, 1);
						lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.75 + y_offset);
						lcd_main.message("frgb", fc);
						lcd_main.message("write", "-");
					} else {
						lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2 - 2.2 * fontheight, fontheight + y_offset, block_darkest);
					}
					lcd_main.message("paintrect", sidebar.x2 - 2.1 * fontheight, y_offset, sidebar.x2 - 1.1 * fontheight, fontheight + y_offset, block_darkest);
					lcd_main.message("moveto", sidebar.x2 - 1.8 * fontheight, fontheight * 0.5 + y_offset);
					lcd_main.message("write", "voices");
					lcd_main.message("frgb", block_colour);
					lcd_main.message("moveto", sidebar.x2 - 1.8 * fontheight, fontheight * 0.75 + y_offset);
					lcd_main.message("write", current_p);
					if (current_p < max_p) {
						if (usermouse.clicked2d == mouse_index) {
							bc = block_colour;
							fc = block_darkest;
						} else {
							bc = block_darkest;
							fc = block_colour;
						}
						lcd_main.message("paintrect", sidebar.x2 -  fontheight, y_offset, sidebar.x2, fontheight + y_offset, bc);
						click_zone(poly_key, 1, 1, sidebar.x2 - fontheight, y_offset, sidebar.x2 , fontheight + y_offset, mouse_index, 1);
						lcd_main.message("moveto", sidebar.x2 - 0.8 * fontheight, fontheight * 0.75 + y_offset);
						lcd_main.message("frgb", fc);
						lcd_main.message("write", "+");
					} else {
						lcd_main.message("paintrect", sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight + y_offset, block_darkest);
					}
					y_offset += 1.1*fontheight;
					draw_sidebar_polyphony_options(block, block_colour, block_dark, block_darkest, block_name);
				}

				//oversampling settings
				if(UPSAMPLING && (block_type == "audio")){
					var current_up = blocks.get("blocks["+block+"]::upsample");
					lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2-4.4*fontheight, fontheight+y_offset,block_darkest );
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("frgb", block_colour );
					lcd_main.message("write", "upsampling");
					if( current_up > 1 ){
						if(usermouse.clicked2d == mouse_index){ 
							bc = block_colour;
							fc = block_darkest;
						}else{
							bc = block_dark;
							fc = block_colour;
						}
						lcd_main.message("paintrect", sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight+y_offset,bc );
						click_zone(change_upsampling,block,(current_up >> 1), sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight+y_offset,mouse_index,1 );
						lcd_main.message("moveto" ,sidebar.x2-4.1*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("frgb", fc );
						lcd_main.message("write", "-");
					}else{
						lcd_main.message("paintrect", sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight+y_offset,block_darkest );
					}
					lcd_main.message("paintrect", sidebar.x2-3.2*fontheight, y_offset, sidebar.x2-1.1*fontheight, fontheight+y_offset,block_darkest );
					lcd_main.message("moveto" ,sidebar.x2-3.0*fontheight, fontheight*0.5+y_offset);
					//lcd_main.message("write", "voices");
					lcd_main.message("frgb", block_colour);
					lcd_main.message("moveto" ,sidebar.x2-3.0*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", current_up+"x");
					if(current_up<128){
						if(usermouse.clicked2d == mouse_index){ 
							bc = block_colour;
							fc = block_darkest;
						}else{
							bc = block_dark;
							fc = block_colour;
						}
						lcd_main.message("paintrect", sidebar.x2-1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,bc);
						click_zone(change_upsampling,block, (current_up<<1), sidebar.x2-1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
						lcd_main.message("moveto" ,sidebar.x2-0.8*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("frgb", fc );
						lcd_main.message("write", "+");
					}else{
						lcd_main.message("paintrect", sidebar.x2-1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,block_darkest);
					}
					y_offset += 1.1* fontheight;

				}



				// panel assigns
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2-4.4*fontheight, fontheight+y_offset,block_darkest );
				if(usermouse.clicked2d == mouse_index){ 
					bc = block_colour;
					fc = block_darkest;
				}else{
					bc = block_dark;
					fc = block_colour;
				}click_zone(set_sidebar_mode,"panel_assign",null, sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-2.2*fontheight, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("paintrect", sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-2.2*fontheight, fontheight+y_offset,bc );
				//lcd_main.message("frgb", menucolour );
				lcd_main.message("frgb" , fc);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "panel");
				lcd_main.message("moveto" ,sidebar.x2-4.2*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "assign");
				
				if(usermouse.clicked2d == mouse_index){ 
					bc = block_colour;
					fc = block_darkest;
				}else{
					bc = block_darkest;
					fc = block_colour;
				}
				click_zone(toggle_panel,block,0, sidebar.x2-2.1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("paintrect", sidebar.x2-2.1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,bc );
				lcd_main.message("moveto" ,sidebar.x2-1.9*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("frgb", block_dark );
				lcd_main.message("write", "enable");
				lcd_main.message("frgb", fc );
				lcd_main.message("moveto" ,sidebar.x2-1.9*fontheight, fontheight*0.75+y_offset);
				if(blocks.get("blocks["+block+"]::panel::enable")){
					lcd_main.message("write", "on");
				}else{
					lcd_main.message("write", "off");
				}
				y_offset += fontheight*1.1;

				// flock 
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2-4.4*fontheight, fontheight+y_offset,block_darkest );
				if(usermouse.clicked2d == mouse_index){ 
					bc = block_colour;
					fc = block_dark;
				}else{
					bc = block_darkest;
					fc = block_colour;
				}
				lcd_main.message("paintrect", sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-2.2*fontheight, fontheight+y_offset,block_dark );
				//lcd_main.message("frgb", menucolour );
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "flock");
				lcd_main.message("moveto" ,sidebar.x2-4.1*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "assign");
				click_zone(set_sidebar_mode,"flock",null, sidebar.x2-4.3*fontheight, y_offset, sidebar.x2-2.2*fontheight, fontheight+y_offset,mouse_index,1 );
				var this_b_is_flocked=0;
				if(!is_empty(flocklist)){
					for(var fli=0;fli<flocklist.length;fli++){ 
						if(block == flockblocklist[flocklist[fli]]) this_b_is_flocked=1;
					}
				}
				if(!this_b_is_flocked){
					y_offset += fontheight*1.1;	
				}else{
					if(sidebar.mode == "settings_flockpreset"){
						click_zone(set_sidebar_mode,"settings","settings", sidebar.x2-2.1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
						lcd_main.message("paintrect", sidebar.x2-2.1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,block_colour);
						lcd_main.message("moveto" ,sidebar.x2-1.9*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("frgb", block_darkest );
						lcd_main.message("write", "choose");
						lcd_main.message("frgb", block_darkest );
						lcd_main.message("moveto" ,sidebar.x2-1.9*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("write", "preset");
						y_offset += fontheight*1.1;		
						//TODO there'll be a flock_presets dict, here you'd list the names of entries. these are hard presets btw, no user saving.
						var presetlist = flock_presets.getkeys();
						for(var pri=0; pri<presetlist.length; pri++){
							lcd_main.message("paintrect", sidebar.x+ 2.1*fontheight, y_offset, sidebar.x2, 0.65*fontheight+y_offset,block_darkest);
							lcd_main.message("moveto" ,sidebar.x+ 2.3*fontheight, fontheight*0.5+y_offset);
							lcd_main.message("frgb", block_colour );
							lcd_main.message("write", presetlist[pri]);
							click_zone(set_flock_preset,presetlist[pri],block, sidebar.x+ 2.1*fontheight, y_offset, sidebar.x2, 0.65*fontheight+y_offset,mouse_index,1);
							y_offset += fontheight*0.75
						}
						y_offset += fontheight*1.1;	
					}else{
						click_zone(set_sidebar_mode, "settings_flockpreset", "settings_flockpreset", sidebar.x2-2.1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
						lcd_main.message("paintrect", sidebar.x2-2.1*fontheight, y_offset, sidebar.x2, fontheight+y_offset,block_dark);
						lcd_main.message("moveto" ,sidebar.x2-1.9*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("frgb", block_darkest );
						lcd_main.message("write", "choose");
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-1.9*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("write", "preset");
						y_offset += fontheight*1.1;
						draw_h_slider(sidebar.x2-6.5*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::weight"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::weight";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-6.3*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "weight");
						draw_h_slider(sidebar.x2-3.2*fontheight, y_offset, sidebar.x2, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::tension"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::tension";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-3.0*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "tension");
						y_offset += 0.75* fontheight;
						draw_h_slider(sidebar.x2-6.5*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::friction"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::friction";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-6.3*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "friction");
						draw_h_slider(sidebar.x2-3.2*fontheight, y_offset, sidebar.x2, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::bounce"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::bounce";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-3.0*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "bounce");
						y_offset += 0.75* fontheight;
						draw_h_slider(sidebar.x2-6.5*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,-1+2*blocks.get("blocks["+block+"]::flock::attrep"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::attrep";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-6.3*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "attract/repel");
						draw_h_slider(sidebar.x2-3.2*fontheight, y_offset, sidebar.x2, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,-1+2*blocks.get("blocks["+block+"]::flock::align"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::align";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-3.0*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "align");
						y_offset += 0.75* fontheight;
						draw_h_slider(sidebar.x2-6.5*fontheight, y_offset, sidebar.x2-3.3*fontheight, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,-1+2*blocks.get("blocks["+block+"]::flock::twist"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::twist";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-6.3*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "twist");
						draw_h_slider(sidebar.x2-3.2*fontheight, y_offset, sidebar.x2, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::brownian"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::brownian";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,sidebar.x2-3.0*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "brownian");
						y_offset += 0.75* fontheight;
						
					}
				}

			}

			if((has_params) && ((sidebar.mode == "settings")||(sidebar.mode == "settings_flockpreset")||((sidebar.mode == "block")&&(block_voicecount>1)))){
				// error section
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+3.4*fontheight, fontheight+y_offset,block_darkest );
				var ew = sidebar.width - 3.7 * fontheight;
				ew/=3;
				ew+=0.1*fontheight;
				var es = sidebar.x+3.5*fontheight;
				draw_h_slider(es, y_offset, es+ew-0.1*fontheight, fontheight+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::error::spread"));
				mouse_click_actions[mouse_index] = block_edit;
				mouse_click_parameters[mouse_index] = "blocks["+block+"]::error::spread";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				es+=ew;
				draw_h_slider(es, y_offset, es+ew-0.1*fontheight, fontheight+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::error::drift"));
				mouse_click_actions[mouse_index] = block_edit;
				mouse_click_parameters[mouse_index] = "blocks["+block+"]::error::drift";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				es+=ew;
				draw_h_slider(es, y_offset, es+ew-0.1*fontheight, fontheight+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::error::lockup"));
				mouse_click_actions[mouse_index] = block_edit;
				mouse_click_parameters[mouse_index] = "blocks["+block+"]::error::lockup";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("frgb", block_colour );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "parameter errors");
				es = sidebar.x+3.7*fontheight;
				lcd_main.message("moveto" ,es, fontheight*0.75+y_offset);
				lcd_main.message("write", "spread");
				es+=ew;
				lcd_main.message("moveto" ,es, fontheight*0.75+y_offset);
				lcd_main.message("write", "drift");
				es+=ew;
				lcd_main.message("moveto" ,es, fontheight*0.75+y_offset);
				lcd_main.message("write", "freeze");
				y_offset+=fontheight*1.1;
			}

			if((sidebar.mode != "settings")&&(sidebar.mode != "settings_flockpreset")){
				lcd_main.message("frgb", block_colour);
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
				click_zone(set_sidebar_mode,"settings",null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "block settings");
				y_offset += 1.1* fontheight;
			}


			var conn_count = 0;
			var cm = connections.getsize("connections");
			for(i=0;i<cm;i++){
				if(connections.contains("connections["+i+"]::from::number")){
					if((connections.get("connections["+i+"]::from::number") == block) || (connections.get("connections["+i+"]::to::number") == block)){
						conn_count++;
					}						
				}
			}
			if(sidebar.mode == "connections"){
				// CONNECTIONS LIST ##############################################################################################################
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_colour );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb", 0,0,0);
				if(sidebar.selected_voice==-1){
					lcd_main.message("write", "connections");
				}else{
					lcd_main.message("write", "connections (to/from voice "+sidebar.selected_voice+1+" only)");
				}
				y_offset += 1.1* fontheight;
				if(conn_count){
					var audiofound=0;
					for(var pass=2;pass>=0;pass--){ //pass 2: audio ins, 1: all other ins, 0: outs
						var first = 1;
						for(i=0;i<cm;i++){
							setfontsize(fontsmall);
							if(connections.contains("connections["+i+"]::from::number")){
								var comp,compv,subv=1;
								if(pass==0){
									comp = connections.get("connections["+i+"]::from::number");
									compv = connections.get("connections["+i+"]::from::voice");
									if(connections.get("connections["+i+"]::from::output::type")=="audio"){
										subv=-1;
									}
									if(connections.get("connections["+i+"]::to::number")==comp){
										//feedback, dont show twice.
										comp = null;
									}
								}else{
									comp = connections.get("connections["+i+"]::to::number");
									compv = connections.get("connections["+i+"]::to::voice");
									if(connections.get("connections["+i+"]::to::input::type")=="audio"){
										subv=-1;
										if(pass==1)comp = null;
									}else{
										if(pass==2)comp = null;
									}
								}
								if((comp == block)){
									if(subv==-1){
										if(blocks.contains("blocks["+block+"]::subvoices")){
											subv = Math.max(1,blocks.get('blocks['+comp+']::subvoices'));
										}			
									}
									var showthisone=0;
									if(compv=="all"){
										showthisone=1;
									}else if(sidebar.selected_voice==-1){
										showthisone=1;
									}else{
										if(!(Array.isArray(compv)))compv=[compv];
										for(var compvoice = (sidebar.selected_voice*subv)+1;compvoice<=(sidebar.selected_voice*subv)+subv;compvoice++){
											if(compv.indexOf(compvoice)>-1) showthisone=1;
										}
									}
									if(showthisone==1){
										if(first){
											//lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight*0.5+y_offset,block_darkest );
											click_zone(connections_select,pass,block, sidebar.x, y_offset, sidebar.x2 , fontheight*0.5+y_offset,mouse_index,1 );
											lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.35+y_offset);
											lcd_main.message("frgb", block_colour);
											if(pass==2){
												lcd_main.message("write", "audio inputs");
												audiofound=1;
											}else if(pass==1){
												if(audiofound){
													lcd_main.message("write", "other inputs");
												}else{
													lcd_main.message("write", "inputs");
												}
											}else{
												lcd_main.message("write", "outputs");
											}
											y_offset += 0.6* fontheight;
											first = 0;
										}
										lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2 - 3.3*fontheight, fontheight*1.6+y_offset,block_darkest );
										click_zone(connection_select,0,i, sidebar.x, y_offset, sidebar.x2 - 3.3*fontheight, fontheight*1.7+y_offset,mouse_index,1 );
										lcd_main.message("frgb" , block_dark);
										lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.45+y_offset);
										lcd_main.message("write", "from");
										lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*1.05+y_offset);
										lcd_main.message("write", "to");
										lcd_main.message("frgb", block_colour );
										var f_number = connections.get("connections["+i+"]::from::number");
										var f_name = blocks.get("blocks["+f_number+"]::name");
										var f_label = f_name;
										if(blocks.contains("blocks["+f_number+"]::label")){
											f_label = blocks.get("blocks["+f_number+"]::label");
										}
										var t_number = connections.get("connections["+i+"]::to::number");
										var t_name = blocks.get("blocks["+t_number+"]::name");
										var t_label = t_name;
										if(blocks.contains("blocks["+t_number+"]::label")){
											t_label = blocks.get("blocks["+t_number+"]::label");
										}
										var f_o_no = connections.get("connections["+i+"]::from::output::number");
										var f_type = connections.get("connections["+i+"]::from::output::type");
										var ftt=f_type;
										if(ftt=="matrix")ftt="hardware";
										var t_i_no = connections.get("connections["+i+"]::to::input::number");
										var t_type = connections.get("connections["+i+"]::to::input::type");
										var ttt=t_type;
										if(ttt=="matrix")ttt="hardware";
										var f_o_name = blocktypes.get(f_name+"::connections::out::"+ftt+"["+f_o_no+"]");
										if(t_type=="parameters"){
											var t_i_name = blocktypes.get(t_name+"::parameters["+t_i_no+"]::name");
										}else{
											var t_i_name = blocktypes.get(t_name+"::connections::in::"+ttt+"["+t_i_no+"]");
										}
										var f_o_v = ""; var t_i_v="";
										if(blocks.get("blocks["+f_number+"]::poly::voices")>1) f_o_v = connections.get("connections["+i+"]::from::voice");
										if(blocks.get("blocks["+t_number+"]::poly::voices")>1) t_i_v = connections.get("connections["+i+"]::to::voice");
										lcd_main.message("moveto" ,sidebar.x+fontheight*0.95, fontheight*0.45+y_offset);
										if(pass>=1){
											if(f_number==block) f_label = "self";
											lcd_main.message("write", f_label);
											lcd_main.message("moveto" ,sidebar.x+fontheight*0.95, fontheight*0.7+y_offset);
										}
										if(f_o_v!="") {
											lcd_main.message("write", f_o_v+" - "+f_o_name);
										}else{
											lcd_main.message("write", f_o_name);
										}
										//lcd_main.message("moveto" ,sidebar.x+fontheight*0.95, fontheight*0.95+y_offset);
										//lcd_main.message("write", f_o_v);
										lcd_main.message("moveto" ,sidebar.x+fontheight*0.95, fontheight*1.05+y_offset);
										if(pass==0){
											lcd_main.message("write", t_label);
											lcd_main.message("moveto" ,sidebar.x+fontheight*0.95, 1.3*fontheight+y_offset);
										}
										if(t_i_v!=""){
											lcd_main.message("write", t_i_v+" - "+t_i_name);
										}else{
											lcd_main.message("write", t_i_name);
										}
										//lcd_main.message("moveto" ,sidebar.x+fontheight*0.95, 1.8*fontheight+y_offset);
										//lcd_main.message("write", t_i_v);
										
										var mute = connections.get("connections["+i+"]::conversion::mute");
										var scale = connections.get("connections["+i+"]::conversion::scale");
										var vector = connections.get("connections["+i+"]::conversion::vector");
										var offset = connections.get("connections["+i+"]::conversion::offset");
										var offset2 = connections.get("connections["+i+"]::conversion::offset2");
										var force_unity = connections.get("connections["+i+"]::conversion::force_unity");
										var tty = connections.get("connections["+i+"]::to::input::type");
										if((tty=="hardware")&&(connections.contains("connections["+i+"]::conversion::soundcard"))) tty="soundcard";
										var col=config.get("palette::connections::"+tty);
										
										if(mute){
											lcd_main.message("paintrect",sidebar.x2-fontheight, y_offset, sidebar.x2, fontheight+y_offset,128,128,128);
											lcd_main.message("frgb", 0, 0, 0);
											lcd_main.message("moveto",sidebar.x2-fontheight*0.9, fontheight*0.9+y_offset);
											lcd_main.message("write", "mute");
											lcd_main.message("frgb",col[0],col[1],col[2]);
										}else{
											lcd_main.message("paintrect",sidebar.x2-fontheight, y_offset, sidebar.x2, fontheight+y_offset,menudark);
											lcd_main.message("frgb" , menucolour);
											lcd_main.message("moveto",sidebar.x2-fontheight*0.9, fontheight*0.9+y_offset);
											lcd_main.message("write","mute");
										}
										click_zone(connection_edit, "connections["+i+"]::conversion::mute" ,!mute, sidebar.x2-fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index, 1);
										if((connections.get("connections["+i+"]::from::output::type")!="matrix") && (!force_unity)){
											draw_h_slider_labelled(sidebar.x2-fontheight*3.2, y_offset+fontheight*1.1, sidebar.x2, fontheight*1.6+y_offset,col[0],col[1],col[2],mouse_index,scale);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::scale";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;
												//	lcd_main.message("frgb", menucolour);
										}else{
											lcd_main.message("frgb" , menucolour);
											if(connections.get("connections["+i+"]::from::output::type")=="matrix"){
												lcd_main.message("moveto", sidebar.x2-fontheight*3.1, y_offset+fontheight*1.3);
												lcd_main.message("write","(matrix connections");
												lcd_main.message("moveto", sidebar.x2-fontheight*3.1, y_offset+fontheight*1.55);
												lcd_main.message("write","have no gain control)");
											}else{
												lcd_main.message("moveto", sidebar.x2-fontheight*3.1, y_offset+fontheight*1.3);
												lcd_main.message("write","connection gain");
												lcd_main.message("moveto", sidebar.x2-fontheight*3.1, y_offset+fontheight*1.55);
												lcd_main.message("write","locked to unity");
											}
										}
										if(connections.get("connections["+i+"]::from::output::type")=="hardware"){
											if((connections.get("connections["+i+"]::to::input::type")=="audio")||(connections.get("connections["+i+"]::to::input::type")=="hardware")){
												var v1;
												var v2;
												var nv1 = connections.get("connections["+i+"]::from::voice");
												if(!Array.isArray(nv1))nv1=[nv1];
												v1 = nv1.length;
												var nv2 = connections.get("connections["+i+"]::to::voice");
												if(!Array.isArray(nv2))nv2=[nv2];
												v2 = nv2.length;
												draw_spread(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2);	
												draw_spread_levels(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2,scale);	
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
												mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_index++;
											}else if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
												draw_vector(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;
												draw_2d_slider(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
												mouse_index++;
											}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
												draw_h_slider(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;
											}
										}else if(connections.get("connections["+i+"]::from::output::type")=="audio"){
											if(force_unity){
											}else if((connections.get("connections["+i+"]::to::input::type")=="hardware")	|| (connections.get("connections["+i+"]::to::input::type")=="audio")){
												var nv1 = connections.get("connections["+i+"]::from::voice");
												if(!Array.isArray(nv1)) nv1 = [nv1];
												var v1 = nv1.length;
												var nv2 = connections.get("connections["+i+"]::to::voice");
												if(!Array.isArray(nv2)) nv2=[nv2];
												var v2 = nv2.length;	
												draw_spread(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2);				
												draw_spread_levels(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2,scale);				
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
												mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_index++;
											}else if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
												draw_vector(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;
												draw_2d_slider(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
												mouse_index++;
											}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
												draw_h_slider(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;
											}
										}else if(connections.get("connections["+i+"]::from::output::type")=="midi"){
											if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
												draw_2d_slider(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
												mouse_index++;			
											}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
												draw_vector(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;
												draw_h_slider(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;			
											}else if((connections.get("connections["+i+"]::to::input::type")=="audio")||(connections.get("connections["+i+"]::to::input::type")=="hardware")){
												draw_vector(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;
												draw_h_slider(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;									
											}
										}else if(connections.get("connections["+i+"]::from::output::type")=="parameters"){
											if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
												draw_vector(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;
												draw_2d_slider(sidebar.x2-fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
												mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
												mouse_index++;			
											}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
												draw_h_slider(sidebar.x2-fontheight*3.2, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
												mouse_click_actions[mouse_index] = connection_edit;
												mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
												mouse_click_values[mouse_index] = 0;
												mouse_index++;			
											}			
										}
										y_offset += 1.7 * fontheight;
									}
								}
							}
						}
					}
				}
			}else{
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
				if(conn_count>0){
					click_zone(set_sidebar_mode, "connections", null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("frgb", block_colour);
				}else{
					lcd_main.message("frgb", block_dark);
				}
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "connections ("+conn_count+")");
				y_offset += 1.1* fontheight;
			}
			if(blocktypes.contains(block_name+"::help_text")){
				if(sidebar.mode == "help"){
					click_zone(set_sidebar_mode,"block", null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_colour);
					lcd_main.message("frgb", 0,0,0 );
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("write", "help");
					y_offset += 1.1* fontheight;
					lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, mainwindow_height-9,block_darkest);
					lcd_main.message("frgb", block_colour);
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					setfontsize(fontsmall);
					lcd_main.message("textface", "normal");
					var hint=blocktypes.get(block_name+"::help_text")+" ";
					function get_io_name_and_description(ty,dir) {
						if (blocktypes.contains(block_name + "::connections::"+dir+"::" + ty)) {
							hint = hint + "££*"+dir+"puts: "+ty+"*";
							var l = blocktypes.get(block_name + "::connections::"+dir+"::" + ty);
							for (var i = 0; i < l.length; i++) {
								hint = hint + "£- " + l[i];
								if (blocktypes.contains(block_name + "::connections::"+dir+"::descriptions::" + ty)) {
									hint = hint + " - " + blocktypes.get(block_name + "::connections::"+dir+"::descriptions::" + ty+"["+i+"]");
								}
							}
						}
					}
					get_io_name_and_description("hardware","in");
					get_io_name_and_description("audio","in");
					get_io_name_and_description("midi","in");
					get_io_name_and_description("hardware","out");
					get_io_name_and_description("audio","out");
					get_io_name_and_description("midi","out");
					long_sidebar_text(hint);
				}else{
					click_zone(set_sidebar_mode,"help",null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
					lcd_main.message("frgb", block_colour);
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("write", "help");
					y_offset += 1.1* fontheight;				
				}
			}
		}else if(selected.wire_count == 1){ // if 1 connection selected
			// CONNECTION DETAIL VIEW #######################################################################################################
			i = selected.wire.indexOf(1);
			var f_number = connections.get("connections["+i+"]::from::number");
			var f_label = blocks.get("blocks["+f_number+"]::label");
			var f_name = blocks.get("blocks["+f_number+"]::name");
			var t_number = connections.get("connections["+i+"]::to::number");
			var t_label = blocks.get("blocks["+t_number+"]::label");
			var t_name = blocks.get("blocks["+t_number+"]::name");
			var f_o_no = connections.get("connections["+i+"]::from::output::number");
			var f_type = connections.get("connections["+i+"]::from::output::type");
			var t_i_no = connections.get("connections["+i+"]::to::input::number");
			var t_type = connections.get("connections["+i+"]::to::input::type");
			if(sidebar.connection.default_in_applied != 0){
				sidebar.connection.show_to_inputs = 1;
			}else if(sidebar.mode!="wire"){
				//post("\n\nfolding because",sidebar.mode);
				sidebar.connection.show_to_inputs = 0;
			}
			if(sidebar.connection.default_out_applied != 0){
				sidebar.connection.show_from_outputs = 1;
			}else if(sidebar.mode!="wire"){
				sidebar.connection.show_from_outputs = 0;
				//post("\n\nfolding because",sidebar.mode);
			}
			var f_o_v = connections.get("connections["+i+"]::from::voice");
			var t_i_v = connections.get("connections["+i+"]::to::voice");
			if(t_i_v!="all"){
				if(!Array.isArray(t_i_v)) t_i_v = [t_i_v];
				t_i_v.sort();
			}
			if(f_o_v != "all"){
				if(!Array.isArray(f_o_v)) f_o_v = [f_o_v];
				f_o_v.sort();
			}
			var f_v_no = blocks.get("blocks["+f_number+"]::poly::voices");
			var t_v_no = blocks.get("blocks["+t_number+"]::poly::voices");
			var from_subvoices = 1;
			var to_subvoices = 1;
			if(f_type=="audio"){
				if(blocks.contains("blocks["+f_number+"]::from_subvoices")){
					from_subvoices = blocks.get("blocks["+f_number+"]::from_subvoices");
				}else if(blocks.contains("blocks["+f_number+"]::subvoices"))	from_subvoices = blocks.get("blocks["+f_number+"]::subvoices");
			}
			if(t_type=="audio"){
				if(blocks.contains("blocks["+t_number+"]::to_subvoices")){
					to_subvoices = blocks.get("blocks["+t_number+"]::to_subvoices");
				}else if(blocks.contains("blocks["+t_number+"]::subvoices")) to_subvoices = blocks.get("blocks["+t_number+"]::subvoices");
			}			
			var t_i_name,f_o_name;


			var mute = connections.get("connections["+i+"]::conversion::mute");
			var scale = connections.get("connections["+i+"]::conversion::scale");
			var vector = connections.get("connections["+i+"]::conversion::vector");
			var offset = connections.get("connections["+i+"]::conversion::offset");
			var offset2 = connections.get("connections["+i+"]::conversion::offset2");
			var force_unity = connections.get("connections["+i+"]::conversion::force_unity");

			var section_colour,section_colour_dark,section_colour_darkest;
			var type_colour,type_colour_dark,type_colour_darkest;
			
			if((f_type=="potential")||(t_type=="potential")){
				type_colour=[192,192,192];
			}else{
				var fty = f_type;
				if((fty=="hardware")&&(connections.contains("connections["+i+"]::conversion::soundcard"))) fty="soundcard";
				type_colour = config.get("palette::connections::"+fty);
			}
			type_colour_dark = [type_colour[0]*0.5,type_colour[1]*0.5,type_colour[2]*0.5];
			type_colour_darkest = [type_colour[0]*bg_dark_ratio,type_colour[1]*bg_dark_ratio,type_colour[2]*bg_dark_ratio];
			section_colour = blocks.get("blocks["+f_number+"]::space::colour");
			section_colour = [section_colour[0]*1.2,section_colour[1]*1.2,section_colour[2]*1.2];
			section_colour_dark = [section_colour[0]*0.5,section_colour[1]*0.5,section_colour[2]*0.5];
			section_colour_darkest = [section_colour[0]*bg_dark_ratio,section_colour[1]*bg_dark_ratio,section_colour[2]*bg_dark_ratio];

			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,type_colour_dark );
			lcd_main.message("moveto" ,sidebar.x+fo1+fo1, fontheight*0.75+y_offset);
			setfontsize(fontsmall*2);
			lcd_main.message("frgb",type_colour);
			if((f_type=="potential")||(t_type=="potential")){
				lcd_main.message("write", "new connection");
			}else{
				lcd_main.message("write", "connection edit");
			}
			
			y_offset += 1.1* fontheight;
			
			if((f_type=="audio")||(f_type=="hardware")||(f_type=="potential")){
				f_v_no *= from_subvoices;
				if(f_type=="potential") f_o_v[0] *= 2;
			}
			if((t_type=="audio")||(t_type=="hardware")||(t_type=="potential")){
				t_v_no *= to_subvoices;
				if(t_type=="potential") t_i_v[0] *= 2;
			}
			if(f_type=="parameters"){
				f_o_name = blocktypes.get(f_name+"::connections::out::parameters["+f_o_no+"]");
			}else if(f_type=="potential"){
				f_o_name = "?";
				sidebar.connection.show_from_outputs = 1;
			}else if(f_type=="matrix"){
				f_o_name = blocktypes.get(f_name+"::connections::out::hardware["+f_o_no+"]");
			}else{
				f_o_name = blocktypes.get(f_name+"::connections::out::"+f_type+"["+f_o_no+"]");
			}
			if(f_type=="matrix"){
				if((t_type!="matrix")&&(t_type!="potential")){
					t_type = "potential";
					t_i_no = 0;
					t_i_v = "all"
					connections.replace("connections["+i+"]::to::input::number",t_i_no);
					connections.replace("connections["+i+"]::to::input::type",t_type);
					connections.replace("connections["+i+"]::to::voice","all");
					post("\nreset the other end of the connection because matrix can only go to matrix")
					block_and_wire_colours();
				}
			}else if((t_type=="matrix")){
				t_type = "potential";
				t_i_no = 0;
				t_i_v = "all"
				connections.replace("connections["+i+"]::to::input::number",t_i_no);
				connections.replace("connections["+i+"]::to::input::type",t_type);
				connections.replace("connections["+i+"]::to::voice","all");
				post("\nreset the other end of the connection because matrix can only go to matrix")
				block_and_wire_colours();
			}
			//post("\nfoname",f_o_name,f_type,f_o_no);
			var to_has_matrix = 0;
			if(blocktypes.contains(t_name+"::connections::in::matrix_channels")) to_has_matrix = 1;
			if(t_type=="parameters"){
				t_i_name = blocktypes.get(t_name+"::parameters["+t_i_no+"]::name");
			}else if(t_type=="potential"){
				t_i_name = "?";
				sidebar.connection.show_to_inputs = 1;
			}else if(t_type=="block"){
				t_v_no = 0;
				if(t_i_no == 0){
					t_i_name = "mute toggle";
				}else if(t_i_no == 1){
					t_i_name = "mute";
				}
			}else if(t_type=="matrix"){
				var t_i_name = blocktypes.get(t_name+"::connections::in::hardware["+t_i_no+"]");
			}else{
				var t_i_name = blocktypes.get(t_name+"::connections::in::"+t_type+"["+t_i_no+"]");
			}
	
			sidebar.mode = "wire";

			automap.groups = [];
			automap.sidebar_row_ys = []; // i reuse these two for automap direct mode control over gain/conversion params. ys contains scaling multiplier for the knobs.

			// FROM BLOCK, OUTPUT, VOICE labels/menus

			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fo1*6+y_offset,section_colour_darkest );
			click_zone(jump_to_block_at_connection_end,0,0,sidebar.x, y_offset, sidebar.x2, fo1*6+y_offset,mouse_index,1);
			//lcd_main.message("paintrect", sidebar.x2-fontheight*1.4, y_offset, sidebar.x2, y_offset+fontheight*0.6, (usermouse.clicked2d==mouse_index)? section_colour:section_colour_darkest );
			//click_zone(select_block,0,f_number,sidebar.x2-fontheight*1.4, y_offset, sidebar.x2, fontheight*0.6+y_offset,mouse_index,1);
			//^^this should be the select a new from block fn

			var is_core_control = 0 ; 
			var auto_pick_controller = 0;
			var f_n_a = f_name;
			var param_count = null;
			var button_count = null;
			f_n_a = f_n_a.split(".");
			if((f_n_a[0]=="core")&&(f_n_a[1]=="input")){
				is_core_control = 1; 
				if(f_n_a[2]=="control"){
					//it's either core.input.control.auto or .basic so
					// check if we need to trim the list of midi outs / param outs / available colours
					var cnam = blocks.get("blocks["+f_number+"]::selected_controller");
					
					param_count = io_dict.get("controllers::"+cnam+"::outputs") |0;
					button_count = io_dict.get("controllers::"+cnam+"::buttons::count") |0;
				}
				// turn a knob to map it functionality here - also applies to core.input.keyboard (and core.input.arc when it's done)
				// see if we should be in auto_pick_controller mode, send an 'assign mode' message to the block in question.
				// auto is always visible as a button, auto-enables if it's turned on in config and the list is open. disabling it if list is open disables it in config?
				var firv = voicemap.get(f_number);
				if(Array.isArray(firv)) firv=firv[0];

				if(sidebar.connection.show_from_outputs){
					auto_pick_controller = 1;
					note_poly.message("setvalue", firv+1,"connection_assign_mode",1);
					automap.assignmode = 1;
				}else{
					automap.assignmode = 0;
					note_poly.message("setvalue", firv+1,"connection_assign_mode",0);
				}
			}

			setfontsize(fontsmall);

			click_zone(conn_show_from_outputs_list,0,-1,sidebar.x, y_offset+0.7*fontheight, sidebar.x2, fontheight*1.3+y_offset,mouse_index,1);
			lcd_main.message("paintrect", sidebar.x, y_offset+fo1*7, sidebar.x2-(1+is_core_control)*15*fo1, fo1*13+y_offset,section_colour_darkest );
			lcd_main.message("paintrect", sidebar.x2-fo1*14, y_offset+fo1*7, sidebar.x2, y_offset+fo1*13, (usermouse.clicked2d==mouse_index)? section_colour:section_colour_darkest );
			if(is_core_control){
				var tbc = (auto_pick_controller)? section_colour_dark:section_colour_darkest;
				tbc = (usermouse.clicked2d==mouse_index)? section_colour:tbc;
				lcd_main.message("paintrect", sidebar.x2-fo1*29, y_offset+fo1*7, sidebar.x2-fo1*15, y_offset+fo1*13, tbc );
				lcd_main.message("frgb", section_colour );
				lcd_main.message("moveto" ,sidebar.x2-fo1*27, fo1*11+y_offset);
				lcd_main.message("write", "auto");
				click_zone(conn_toggle_control_auto_assign,0,-1,sidebar.x2-fo1*29, y_offset+0.7*fontheight, sidebar.x2-fo1*15, fontheight*1.3+y_offset,mouse_index,1);
			}
			lcd_main.message("frgb" , section_colour_dark);
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.4+y_offset);
			lcd_main.message("write", "from");
			//lcd_main.message("moveto" ,sidebar.x2-fontheight*1.2, fontheight*0.4+y_offset);
			//lcd_main.message("write", "change");
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*1.1+y_offset);
			lcd_main.message("write", "output");
			lcd_main.message("frgb", section_colour );
			lcd_main.message("moveto" ,sidebar.x+fontheight*1.4, fontheight*0.4+y_offset);
			lcd_main.message("write", f_label);
			if(!sidebar.connection.show_from_outputs){
				lcd_main.message("moveto" ,sidebar.x2-fontheight*1.2, fontheight*1.1+y_offset);
				lcd_main.message("write", "change");
				lcd_main.message("moveto" ,sidebar.x+fontheight*1.4, fontheight*1.1+y_offset);
				lcd_main.message("frgb", type_colour );
				lcd_main.message("write", f_o_name);
				lcd_main.message("frgb", type_colour_dark );
				lcd_main.message("write", "("+f_type+")");
				y_offset+=1.4*fontheight;
			}else{
				//draw a list of buttons to select between the various outputs on offer here
				if(f_o_no!=null){
					lcd_main.message("moveto" ,sidebar.x2-fontheight*1.2, fontheight*1.1+y_offset);
					lcd_main.message("write", "hide");
				}
				y_offset+=1.4*fontheight;
				if(EXTERNAL_MATRIX_PRESENT && to_has_matrix) y_offset = conn_draw_from_outputs_list(i, f_name, "matrix", y_offset, null);
				y_offset = conn_draw_from_outputs_list(i, f_name, "hardware", y_offset, null);
				y_offset = conn_draw_from_outputs_list(i, f_name, "audio", y_offset, null);
				if(!is_core_control) y_offset = conn_draw_from_outputs_list(i, f_name, "midi", y_offset, null);
				y_offset = conn_draw_from_outputs_list(i, f_name, "parameters", y_offset, param_count);
				if(is_core_control) y_offset = conn_draw_from_outputs_list(i, f_name, "midi", y_offset, button_count);
			}
			
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight*0.6+y_offset,section_colour_darkest );
			lcd_main.message("frgb" , section_colour_dark);
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.4+y_offset);
			lcd_main.message("write", "voices");
			var vi;
			var show_split_source = 0;
			var vx=sidebar.x+fontheight*1.4;
			for(vi=0;vi<=f_v_no;vi++){
				if(vx > sidebar.x2 - fontheight*(0.4+0.1*(vi>9))){
					vx = sidebar.x + fontheight*1.4;
					y_offset+=fontheight * 0.7;
					lcd_main.message("paintrect", sidebar.x, y_offset-fo1, sidebar.x2, 6*fo1+y_offset,section_colour_darkest );
				}
				if(vi==0){
					click_rectangle( vx-fo1, y_offset, vx+fontheight*1.1, fontheight*0.6+y_offset, mouse_index,1);
					if(f_o_v == "all"){
						lcd_main.message("paintrect", vx-fo1, y_offset, vx+fontheight*0.6, fontheight*0.6+y_offset, section_colour);
						lcd_main.message("frgb", 0,0,0 );
						show_split_source = (f_v_no > 1);
					}else{
						lcd_main.message("paintrect", vx-fo1, y_offset, vx+fontheight*0.6, fontheight*0.6+y_offset, section_colour_dark);
						lcd_main.message("frgb", section_colour );
					}
					lcd_main.message("moveto" ,vx, fontheight*0.4+y_offset);
					lcd_main.message("write", "all");
					vx+=fontheight*0.8;
				}else{
					click_rectangle( vx-fo1, y_offset, vx+fontheight*0.4, fontheight*2.5+y_offset, mouse_index,1);
					if(f_o_v.indexOf(vi)!=-1){
						lcd_main.message("paintrect", vx-fo1, y_offset, vx+fontheight*(0.4+0.1*(vi>9)), fontheight*0.6+y_offset, section_colour);
						lcd_main.message("frgb", 0,0,0 );
						show_split_source += 0.5;
					}else{
						lcd_main.message("paintrect", vx-fo1, y_offset, vx+fontheight*(0.4+0.1*(vi>9)), fontheight*0.6+y_offset, section_colour_dark);
						lcd_main.message("frgb", section_colour );
					}
					lcd_main.message("moveto" ,vx, fontheight*0.4+y_offset);
					lcd_main.message("write", vi);
					vx+=fontheight*0.6;
					if(vi>9) vx+=fontheight*0.1;
				}	
				mouse_click_actions[mouse_index] = connection_edit_voices;
				mouse_click_parameters[mouse_index] = i; 
				mouse_click_values[mouse_index] = ["from", vi];
				mouse_index++;
				
			}
			if((f_v_no>1)||(blocktypes.get(f_name+"::max_polyphony")==0)||(blocktypes.get(f_name+"::max_polyphony")>f_v_no)){
				if(vx>sidebar.x2 - fontheight){
					y_offset+= fo1*7;			
				}
				vx = sidebar.x2 - fontheight;
				if(f_v_no>1){
					lcd_main.message("paintrect", vx-fo1, y_offset, vx+fo1*4, fo1*6+y_offset, section_colour_dark);
					click_zone(poly_key,-1,0,vx-fo1, y_offset, vx+fo1*4, fo1*6+y_offset,mouse_index,1);
				}
				lcd_main.message("paintrect", vx+fo1*5, y_offset, vx+fontheight, fo1*6+y_offset, section_colour_dark);
				click_zone(poly_key,1,0,vx+fo1*5, y_offset, vx+fontheight, fo1*6+y_offset,mouse_index,1);
				lcd_main.message("frgb", section_colour );
				if(f_v_no>1){
					lcd_main.message("moveto" ,vx, fontheight*0.4+y_offset);
					lcd_main.message("write", "-");
				}
				lcd_main.message("moveto" ,vx+fo1*6, fontheight*0.4+y_offset);
				lcd_main.message("write", "+");
			}
			y_offset+= fo1*7;			

			// FROM SCOPE

			sidebar.scopes.starty = y_offset;
			sidebar.scopes.endy = y_offset+2*fontheight;
			//lcd_main.message("paintrect", sidebar.x, sidebar.scopes.starty,sidebar.x2,sidebar.scopes.endy,section_colour_darkest);
			sidebar.scopes.bg=section_colour_darkest;
			sidebar.scopes.fg=section_colour;
			click_zone(scope_zoom,null,null, sidebar.x, sidebar.scopes.starty,sidebar.x2,sidebar.scopes.endy,mouse_index,2);
			y_offset += fontheight*2.1;
			if(sidebar.mode != sidebar.lastmode){
				store_back(["wire",i,sidebar.scroll.position]);
				if(AUTOZOOM_ON_SELECT)center_view(1);
				clear_sidebar_paramslider_details();
				sidebar.lastmode = sidebar.mode;
				audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
				remove_midi_scope();
				redraw_flag.targets=[];
				sidebar.selected = -1;

				var tii;
				// SHOULD THIS BE f_type?
				if((f_type=="midi")||(f_type=="block")||(f_type=="parameters")){
					//	deferred_diag.push("assigning midi scope block to connection output",t_number,"voice",t_i_v,"input",t_i_no,"fov",f_o_v,"\n");
					// need to add 1023 to the midi routemap for every source voice
					// use f_o_v + f_number to look up in voicemap
					// you've got out number too, so you pass those two to the assign fn which gets a list of m_indexes
					// need to keep a record of which m-indexes it's used
					// either you can find orig c_ind (use t_i_v + t_number, look up in voicemap) and copy
					// or calculate conv numbers from dict? sounds like latter is easier.
					var m_index = [];
					var tf_o_v = [];
					if(f_o_v == "all"){
						for(tii=0;tii<f_v_no;tii++) tf_o_v[tii]=tii;
					}else{
						if(!Array.isArray(f_o_v)){ 
							tf_o_v=[f_o_v-1];
						}else{
							for(tii=0;tii<f_o_v.length;tii++) tf_o_v[tii] = f_o_v[tii]-1;
						}
					}
					for(tii=0;tii<tf_o_v.length;tii++){
						m_index[tii] = f_o_no + (voicemap.get(f_number+"["+tf_o_v[tii]+"]")<<7);
					}
					sidebar.scopes.voice = -1;
					sidebar.scopes.voicelist = [];
					sidebar.scopes.midi = MAX_BLOCKS + i;
					sidebar.scopes.midivoicelist=[];
					sidebar.scopes.midioutlist=[];
					var vm = voicemap.get(f_number);
					if(!Array.isArray(vm))vm=[vm];
					//post("\nvoicelist is",vm,"tf_o_v is",tf_o_v,"\n");
					for(tii=0;tii<tf_o_v.length;tii++){
						//post("\ntii",tii,"tf_o_v",tf_o_v,"vm[tf]",vm[+tf_o_v[tii]]);
						sidebar.scopes.midivoicelist[tii] = vm[+tf_o_v[tii]];
						sidebar.scopes.midioutlist[tii] = +f_o_no;
					}
					sidebar.scopes.width = (sidebar.width + fo1);
				}else if(f_type=="audio"){
					//post("assigning connection audio scope block",f_number,"voice",f_o_v,"output",f_o_no,"\n");
					sidebar.scopes.voicelist = [];
					audio_to_data_poly.message("setvalue", 0, "vis_scope", 0);
					var listvoice = [];
					if(from_subvoices<=1){
						if(f_o_v=="all"){
							listvoice = voicemap.get(f_number);
							if(!Array.isArray(listvoice)) listvoice = [listvoice];
							for(tii=0;tii<listvoice.length;tii++) listvoice[tii] -= MAX_NOTE_VOICES;
						}else{
							listvoice = f_o_v.slice();
							var t_listvoice = voicemap.get(f_number);
							if(!Array.isArray(listvoice)) listvoice = [listvoice];
							if(!Array.isArray(t_listvoice)) t_listvoice = [t_listvoice];
							for(tii=0;tii<listvoice.length;tii++) listvoice[tii] = t_listvoice[listvoice[tii]-1]-MAX_NOTE_VOICES;
						}
					}else{
						if(f_o_v=="all"){
							var s_listvoice = voicemap.get(f_number);
							if(!Array.isArray(s_listvoice)) s_listvoice = [s_listvoice];//, listvoice + MAX_AUDIO_VOICES];
							for(tii=0;tii<s_listvoice.length;tii++){
								for(var tiii=0;tiii<from_subvoices;tiii++){
									listvoice[tii*from_subvoices+tiii] = s_listvoice[tii] - MAX_NOTE_VOICES + tiii*MAX_AUDIO_VOICES;
								}
							}
						}else{
							var s_listvoice = f_o_v.slice();
							var t_listvoice = voicemap.get(f_number);
							if(!Array.isArray(s_listvoice)) s_listvoice = [s_listvoice];//, listvoice + MAX_AUDIO_VOICES];
							if(!Array.isArray(t_listvoice)) t_listvoice = [t_listvoice];//, t_listvoice + MAX_AUDIO_VOICES];
							for(tii=0;tii<s_listvoice.length;tii++){
								for(var tiii=0;tiii<from_subvoices;tiii++){
									listvoice[tii*from_subvoices+tiii] = t_listvoice[s_listvoice[tii]-1]-MAX_NOTE_VOICES+tiii*MAX_AUDIO_VOICES;
								}
							}
						}						
					}
					
					//post("\nLISTVOICE",listvoice);
					for(tii=0;tii<listvoice.length;tii++){
						audio_to_data_poly.message("setvalue", (listvoice[tii]+1+f_o_no*MAX_AUDIO_VOICES),"vis_scope", 1);
						sidebar.scopes.voicelist[tii] = (listvoice[tii]+f_o_no*MAX_AUDIO_VOICES);
					}
					sidebar.scopes.midivoicelist = [];
					sidebar.scopes.midioutlist = [];
					sidebar.scopes.midi = -1;
					//post("\naudio to midi scopes:",sidebar.scopes.voicelist,"midi",sidebar.scopes.midivoicelist,"outs",sidebar.scopes.midioutlist,"midi",sidebar.scopes.midi);
					sidebar.scopes.voice = f_number; 
					//	post("scopes voicelist",sidebar.scopes.voicelist,"f_o_v",f_o_v);
					sidebar.scopes.width = (sidebar.width + fo1)/listvoice.length;
					messnamed("scope_size",(sidebar.scopes.width)/2);

				}else if(f_type=="hardware"){
					//post("todo assign connection hardware scope block",f_number,"voice",f_o_v,"output",f_o_no,"\n");
					if(blocktypes.contains(f_name+"::connections::out::hardware_channels")){
						var listch = blocktypes.get(f_name+"::connections::out::hardware_channels");
						if(!Array.isArray(listch)) listch = [listch];
						var voffset=MAX_AUDIO_VOICES+MAX_NOTE_VOICES;
						if(!is_empty(listch)){
							sidebar.scopes.voicelist = [];
							audio_to_data_poly.message("setvalue", listch[f_o_no]+voffset,"vis_scope", 1);
							sidebar.scopes.voicelist[0] = listch[f_o_no]+voffset-1;
							sidebar.scopes.width = (sidebar.width + fo1);
							messnamed("scope_size",(sidebar.scopes.width)/2);
							sidebar.scopes.voice = f_number; 
							//post("\nSCOPES: ",sidebar.scopes.voicelist);
						}
					}
				}
			}


			// conversion params header


			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight*0.6+y_offset,type_colour_darkest );
			lcd_main.message("frgb" , type_colour_dark);
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.4+y_offset);
			if(f_type==t_type){
				lcd_main.message("write", "connection gain & offset");
			}else{
				lcd_main.message("write", "conversion settings")
				if((f_type=="potential")||(t_type=="potential")){
				}else{
					lcd_main.message("write","("+f_type+" to "+t_type+")");
				}
			}
			y_offset+=fontheight*0.7;			

			//conversion settings here
			if(mute){
				lcd_main.message("paintrect",sidebar.x2-fontheight, y_offset, sidebar.x2, fontheight+y_offset,96,96,96);
				//lcd_main.message("frgb",type_colour);
				lcd_main.message("frgb", 0, 0, 0);
				lcd_main.message("moveto",sidebar.x2-8*fo1, fontheight*0.8+y_offset);
				lcd_main.message("write", "mute");
			}else{
				lcd_main.message("paintrect",sidebar.x2-fontheight, y_offset, sidebar.x2, fontheight+y_offset,type_colour_dark);
				lcd_main.message("frgb", 0,0,0);
				lcd_main.message("moveto",sidebar.x2-fo1*8, fontheight*0.8+y_offset);
				lcd_main.message("write","mute");
			}
			click_zone(connection_edit, "connections["+i+"]::conversion::mute", !mute, sidebar.x2-fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index, 1);
			if((f_type!="matrix") && (!force_unity)){
				draw_h_slider_labelled(sidebar.x, y_offset, sidebar.x2-fo1*22, fontheight+y_offset,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,scale);
				mouse_click_actions[mouse_index] = connection_edit;
				mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::scale";
				automap.groups[0] = "connections["+i+"]::conversion::scale";
				automap.sidebar_row_ys[0] = 0.01;
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("paintrect", sidebar.x2-fontheight*2.1,y_offset,sidebar.x2-fontheight*1.1,y_offset+fontheight,type_colour_dark);
				lcd_main.message("frgb", 0,0,0 );
				lcd_main.message("moveto",sidebar.x+2*fo1, fo1*4+y_offset);
				lcd_main.message("write","gain");
				lcd_main.message("moveto",sidebar.x2-fontheight*1.9, fo1*4+y_offset);
				lcd_main.message("write","ø");
				lcd_main.message("moveto",sidebar.x2-fontheight*1.9, fo1*8+y_offset);
				lcd_main.message("write","flip");
				click_zone(connection_edit, "connections["+i+"]::conversion::scale", -scale, sidebar.x2-fontheight*2.1,y_offset,sidebar.x2-fontheight*1.1,y_offset+fontheight*1.1,mouse_index, 1);
			}else{
				automap.groups[0] = "force_unity";
				lcd_main.message("frgb" , type_colour);
				lcd_main.message("moveto", sidebar.x+fo1*2, y_offset+fontheight*0.7);
				if(f_type=="matrix"){
					lcd_main.message("write", "matrix connections have no gain control");
				}else{
					lcd_main.message("write", "connection gain locked to unity");
				}
			}
			y_offset+=11*fo1;
			if(f_type=="hardware"){
				if((t_type=="audio")||(t_type=="hardware")){
					var v1,v2;
					if(f_o_v=="all"){
						v1 = f_v_no;
					}else{
						v1 = f_o_v.length;
					}
					if(t_i_v=="all"){
						v2 = t_v_no;
					}else{
						v2 = t_i_v.length;
					}
					if((v1==1)&&(v2==1)){
						//no rotators etc
						//y_offset+=(sidebar.width-fo1)*0.5 + 30*fo1;
					}else{
						draw_h_slider(sidebar.x,y_offset,sidebar.x2,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,vector);
						mouse_click_actions[mouse_index] = connection_edit;
						mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
						automap.groups[1]="connections["+i+"]::conversion::vector";
						automap.sidebar_row_ys[1] = 0.025;
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						draw_h_slider(sidebar.x,y_offset+fontheight*1.1,sidebar.x2,y_offset+2.1*fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,offset);
						mouse_click_actions[mouse_index] = connection_edit;
						mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
						automap.groups[2]="connections["+i+"]::conversion::offset";
						automap.sidebar_row_ys[2] = 0.025;
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb",type_colour_dark);
						lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fontheight*0.8);
						lcd_main.message("write","rotation",vector.toPrecision(2));
						lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fontheight*1.9);
						lcd_main.message("write","spread",offset.toPrecision(2));
						y_offset+=22*fo1;
						sidebar.connection.defaults.vector = 0;
						sidebar.connection.defaults.offset = 1;
						draw_spread(sidebar.x, y_offset, sidebar.x2-(sidebar.width+fo1)*0.5, (sidebar.width-fo1)*0.5+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,vector,offset,v1,v2);				
						draw_spread_levels(sidebar.x2-(sidebar.width-fo1)*0.5, y_offset, sidebar.x2, (sidebar.width-fo1)*0.5+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,vector,offset,v1,v2,scale);				
						mouse_click_actions[mouse_index] = connection_edit;
						mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
						mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset";
						mouse_index++;
						y_offset+=(sidebar.width-fo1)*0.5 + fo1;
					}
				}else if((t_type=="midi")||(t_type=="block")){
					sidebar.connection.defaults.vector = Math.round(vector*4)/4;
					sidebar.connection.defaults.offset = 0.5;
					sidebar.connection.defaults.offset2 = 0.5;
					draw_vector(sidebar.x, y_offset, sidebar.x2-fo1*54, fo1*19+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					automap.groups[1]="connections["+i+"]::conversion::vector";
					automap.sidebar_row_ys[1] = 0.025;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_2d_slider(sidebar.x2-fontheight*5.3, y_offset, sidebar.x2-fontheight*2.7, fo1*19+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,offset,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
					automap.groups[2]="connections["+i+"]::conversion::offset";
					automap.groups[3]="connections["+i+"]::conversion::offset2";
					automap.sidebar_row_ys[2] = 1/256;
					automap.sidebar_row_ys[3] = 1/256;
					mouse_index++;
					lcd_main.message("moveto", (sidebar.x2-fontheight*5.1), (fontheight*1.1+y_offset));
					if(offset<0.5){
						lcd_main.message("write", (Math.floor(offset*256)-128));
					}else{
						lcd_main.message("write", "+"+(Math.floor(offset*256)-128));
					}
					lcd_main.message("moveto", (sidebar.x2-fontheight*5.1), (fontheight*1.7+y_offset));
					if(offset2<0.5){
						lcd_main.message("write", (Math.floor(offset2*256)-128));
					}else{
						lcd_main.message("write", "+"+(Math.floor(offset2*256)-128));
					}
					y_offset+=20*fo1;
				}else if(t_type=="parameters"){
					sidebar.connection.defaults.offset = 0.5;
					draw_h_slider(sidebar.x,y_offset,sidebar.x2,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,2*offset-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					automap.groups[1]="connections["+i+"]::conversion::offset";
					automap.sidebar_row_ys[1] = 0.025;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					lcd_main.message("frgb",type_colour_dark);
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*9);
					lcd_main.message("write","offset",(2*offset-1).toPrecision(2));
					y_offset+=11*fo1;
				}
			}else if(f_type=="audio"){
				if(force_unity){

				}else if((t_type=="hardware") || (t_type=="audio")){
					var v1,v2;
					if(f_o_v=="all"){
						v1 = f_v_no;
					}else{
						v1 = f_o_v.length;
					}
					if(t_i_v=="all"){
						v2 = t_v_no;
					}else{
						v2 = t_i_v.length;
					}
					if((v1==1)&&(v2==1)){
						//no rotators etc
						//y_offset+=(sidebar.width-fo1)*0.5 + 30*fo1;
					}else{
						sidebar.connection.defaults.vector = 0;
						sidebar.connection.defaults.offset = 1;
						draw_h_slider(sidebar.x,y_offset,sidebar.x2,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,vector);
						mouse_click_actions[mouse_index] = connection_edit;
						mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
						automap.groups[1]="connections["+i+"]::conversion::vector";
						automap.sidebar_row_ys[1] = 0.025;
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						draw_h_slider(sidebar.x,y_offset+fo1*11,sidebar.x2,y_offset+21*fo1,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,offset);
						mouse_click_actions[mouse_index] = connection_edit;
						mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
						automap.groups[2]="connections["+i+"]::conversion::offset";
						automap.sidebar_row_ys[2] = 0.025;	
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb",type_colour_dark);
						lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*8);
						lcd_main.message("write","rotation",vector.toPrecision(2));
						lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*19);
						if(offset>0.98) lcd_main.message("frgb",type_colour);
						lcd_main.message("write","spread",offset.toPrecision(2));
						y_offset+=22*fo1;
	
						draw_spread(sidebar.x, y_offset, sidebar.x2-(sidebar.width+fo1)*0.5, (sidebar.width-fo1)*0.5+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,vector,offset,v1,v2);				
						draw_spread_levels(sidebar.x2-(sidebar.width-fo1)*0.5, y_offset, sidebar.x2, (sidebar.width-fo1)*0.5+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,vector,offset,v1,v2,scale);				
						mouse_click_actions[mouse_index] = connection_edit;
						mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
						mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset";
						mouse_index++;
						y_offset+=(sidebar.width-fo1)*0.5 + fo1;
					}
				}else if((t_type=="midi")||(t_type=="block")){
					sidebar.connection.defaults.vector = Math.round(vector*4)/4;
					sidebar.connection.defaults.offset = 0.5;
					sidebar.connection.defaults.offset2 = 0.5;
					draw_vector(sidebar.x2-fo1*15.5, y_offset, sidebar.x2, fo1*15.5+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					automap.groups[1]="connections["+i+"]::conversion::vector";
					automap.sidebar_row_ys[1] = 0.025;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_2d_slider(sidebar.x2-fo1*15.5, y_offset+16.5*fo1, sidebar.x2, fo1*32+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,offset,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
					automap.groups[2]="connections["+i+"]::conversion::offset";
					automap.groups[3]="connections["+i+"]::conversion::offset2";
					automap.sidebar_row_ys[2] = 1/256;
					automap.sidebar_row_ys[3] = 1/256;
					mouse_index++;	
					
					draw_h_slider(sidebar.x,y_offset,sidebar.x2-fo1*16.5,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
	
					draw_h_slider(sidebar.x, y_offset+fo1*11, sidebar.x2-fo1*16.5, fo1*21+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,2*offset-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;		
					
					draw_h_slider(sidebar.x, y_offset+fo1*22, sidebar.x2-fo1*16.5, fo1*32+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,offset2*2-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset2";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;	
					
					lcd_main.message("frgb",type_colour_dark);
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*8);
					lcd_main.message("write","projection angle",vector.toPrecision(2));
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*19);
					lcd_main.message("write","note offset",Math.floor(256*offset-128));
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*30);
					lcd_main.message("write","velocity offset",Math.floor(256*offset2-128));

					y_offset += fo1*33;

				}else if(t_type=="parameters"){
					sidebar.connection.defaults.offset2 = 0.5;
					draw_h_slider(sidebar.x,y_offset,sidebar.x2,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,2*offset2-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset2";
					automap.groups[1]="connections["+i+"]::conversion::offset2";
					automap.sidebar_row_ys[1] = 0.025;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					lcd_main.message("frgb",type_colour_dark);
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*9);
					lcd_main.message("write","offset",(2*offset2-1).toPrecision(2));
					y_offset+=11*fo1;
				}
			}else if((f_type=="midi")||(f_type=="block")){
				if(t_type=="midi"){
					sidebar.connection.defaults.offset = 0.5;
					sidebar.connection.defaults.offset2 = 0.5;
					draw_2d_slider(sidebar.x2-fo1*21, y_offset, sidebar.x2, fo1*21+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,offset,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
					mouse_index++;			
					draw_h_slider(sidebar.x,y_offset,sidebar.x2-fo1*22,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,offset*2-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					automap.groups[1]="connections["+i+"]::conversion::offset";
					automap.sidebar_row_ys[1] = 1/256;
					automap.sidebar_row_ys[2] = 1/256;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_h_slider(sidebar.x,y_offset+fontheight*1.1,sidebar.x2-fo1*22,y_offset+2.1*fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,offset2*2-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset2";
					automap.groups[2]="connections["+i+"]::conversion::offset2";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;

					var dispn;
					lcd_main.message("frgb",type_colour_dark);
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*8);
					lcd_main.message("write","pitch offset");
					dispn=Math.floor(offset*256-128);
					if(dispn>0) dispn="+"+dispn;
					lcd_main.message("write", dispn);
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*19);
					lcd_main.message("write","velocity offset");
					dispn = Math.floor(offset2*256-128);
					if(dispn>0) dispn="+"+dispn;
					lcd_main.message("write", dispn);
					y_offset+=22*fo1;
				}else if((t_type=="parameters")||(t_type=="audio")||(t_type=="hardware")){
					sidebar.connection.defaults.vector =  Math.round(vector*4)/4;
					sidebar.connection.defaults.offset = 0.5;
					draw_vector(sidebar.x2-21*fo1, y_offset, sidebar.x2, 21*fo1+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					automap.groups[1]="connections["+i+"]::conversion::vector";
					automap.sidebar_row_ys[1] = 0.025;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;

					draw_h_slider(sidebar.x,y_offset,sidebar.x2-fo1*22,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					//not sure if this should be put back in for audio/hardware destinations? not needed for params obvs. downside is that it will jump if muted
					draw_h_slider(sidebar.x, y_offset+fo1*11, sidebar.x2-fo1*22, fo1*21+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,2*offset-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					automap.groups[2]="connections["+i+"]::conversion::offset";
					automap.sidebar_row_ys[2] = 1/256;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;		
					
					lcd_main.message("frgb",type_colour_dark);
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*8);
					lcd_main.message("write","projection angle",vector.toPrecision(2));
					//lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*19);
					//lcd_main.message("write","offset",(2*offset-1).toPrecision(2));
					y_offset+=22*fo1;					
				}
			}else if(f_type=="parameters"){
				if((t_type=="midi")||(t_type=="block")){
					sidebar.connection.defaults.vector = Math.round(vector*4)/4;
					sidebar.connection.defaults.offset = 0.5;
					sidebar.connection.defaults.offset2 = 0.5;
					draw_vector(sidebar.x2-fo1*15.5, y_offset, sidebar.x2, fo1*15.5+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					automap.groups[1]="connections["+i+"]::conversion::vector";
					automap.sidebar_row_ys[1] = 0.025;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_2d_slider(sidebar.x2-fo1*15.5, y_offset+16.5*fo1, sidebar.x2, fo1*32+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,offset,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
					automap.groups[2]="connections["+i+"]::conversion::offset";
					automap.groups[3]="connections["+i+"]::conversion::offset2";
					automap.sidebar_row_ys[2] = 1/256;
					automap.sidebar_row_ys[3] = 1/256;
					mouse_index++;	
					
					draw_h_slider(sidebar.x,y_offset,sidebar.x2-fo1*16.5,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
	
					draw_h_slider(sidebar.x, y_offset+fo1*11, sidebar.x2-fo1*16.5, fo1*21+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,2*offset-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;		
					
					draw_h_slider(sidebar.x, y_offset+fo1*22, sidebar.x2-fo1*16.5, fo1*32+y_offset,type_colour[0],type_colour[1],type_colour[2],mouse_index,offset2*2-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset2";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;	
					
					lcd_main.message("frgb",type_colour_dark);
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*8);
					lcd_main.message("write","projection angle",vector.toPrecision(2));
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*19);
					lcd_main.message("write","note offset",Math.floor(256*offset-128));
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*30);
					lcd_main.message("write","velocity offset",Math.floor(256*offset2-128));

					y_offset += fo1*33;
				}else if(t_type=="parameters"){
					// trying putting offsets back in here. do existing patches break?
					sidebar.connection.defaults.vector = 0.5; //Math.round(vector*4)/4;
					sidebar.connection.defaults.offset = 0.5;
					sidebar.connection.defaults.offset2 = 0.5;
					draw_h_slider(sidebar.x,y_offset,sidebar.x2,y_offset+fontheight,type_colour_dark[0],type_colour_dark[1],type_colour_dark[2],mouse_index,2*offset-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					automap.groups[1]="connections["+i+"]::conversion::offset";
					automap.sidebar_row_ys[1] = 0.025;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					lcd_main.message("frgb",type_colour_dark);
					lcd_main.message("moveto",sidebar.x+2*fo1,y_offset+fo1*8);
					lcd_main.message("write","offset",(2*offset-1).toPrecision(2));//offset);
					y_offset+=11*fo1;
				}			
			}

			if((automap.available_c>-1)&&(!automap.lock_c)){
				automap.mapped_c=-0.5;
				var maplist = [];
				var mapwrap = [];
				var maplistopv = [];
				var mapcolours = [];
				
				
				if(automap.c_rows<automap.groups.length){
					for(var pad=0;pad<automap.c_cols*automap.c_rows;pad++){
						if(pad<automap.groups.length){
							maplist.push(-0.5);
							mapcolours.push(type_colour[0]);
							mapcolours.push(type_colour[1]);
							mapcolours.push(type_colour[2]);
						}else{
							maplist.push(-1);
							mapcolours.push(-1);	
						}
						mapwrap.push(1);
						maplistopv.push(-1);
					}
				}else{
					for(var pad=0;pad<automap.c_cols*automap.c_rows;pad++){
						var px = pad % automap.c_cols;
						var py = ((pad-px)/automap.c_cols);
						if((px==0)&&(py<automap.groups.length)){
							maplist.push(-0.5);
							mapcolours.push(type_colour[0]);
							mapcolours.push(type_colour[1]);
							mapcolours.push(type_colour[2]);
						}else{
							maplist.push(-1);
							mapcolours.push(-1);	
						}
						mapwrap.push(1);
						maplistopv.push(-1);
					}
				}
				note_poly.message("setvalue", automap.available_c, "automapped", 1);
				note_poly.message("setvalue", automap.available_c, "automap_offset", 0);
				note_poly.message("setvalue", automap.available_c, "maplistopv",maplistopv);
				note_poly.message("setvalue", automap.available_c, "maplist",maplist);
				note_poly.message("setvalue", automap.available_c, "mapwrap",mapwrap);
				note_poly.message("setvalue", automap.available_c, "mapcolour",mapcolours);
				note_poly.message("setvalue", automap.available_c, "buttonmaplist",-1);
			}

			section_colour = blocks.get("blocks["+t_number+"]::space::colour");
			section_colour = [section_colour[0]*1.2,section_colour[1]*1.2,section_colour[2]*1.2];
			section_colour_dark = [section_colour[0]*0.5,section_colour[1]*0.5,section_colour[2]*0.5];
			section_colour_darkest = [section_colour[0]*bg_dark_ratio,section_colour[1]*bg_dark_ratio,section_colour[2]*bg_dark_ratio];


			//TO BLOCK, INPUT, VOICE labels/menus
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fo1*6+y_offset,section_colour_darkest );
			click_zone(jump_to_block_at_connection_end,1,1,sidebar.x, y_offset, sidebar.x2, fo1*6+y_offset,mouse_index,1);
			//lcd_main.message("paintrect", sidebar.x2-fontheight*1.4, y_offset, sidebar.x2, y_offset+fontheight*0.6, (usermouse.clicked2d==mouse_index)? section_colour:section_colour_darkest );
			//click_zone(select_block,0,t_number,sidebar.x2-fontheight*1.4, y_offset, sidebar.x2, fontheight*0.6+y_offset,mouse_index,1);
			//^^this should be the select a new to block fn
			
			lcd_main.message("paintrect", sidebar.x, y_offset+fo1*7, sidebar.x2-15*fo1, fo1*13+y_offset,section_colour_darkest );
			lcd_main.message("paintrect", sidebar.x2-fo1*14, y_offset+fo1*7, sidebar.x2, y_offset+fo1*13, (usermouse.clicked2d==mouse_index)? section_colour:section_colour_darkest );
			click_zone(conn_show_to_inputs_list,0,-1,sidebar.x, y_offset+0.7*fontheight, sidebar.x2, fontheight*1.3+y_offset,mouse_index,1);
			//^^fn not defined yet. this should be 'select a new input'
			
			lcd_main.message("frgb", section_colour );
			lcd_main.message("moveto" ,sidebar.x+fontheight*1.4, fontheight*0.4+y_offset);
			lcd_main.message("write", t_label);
			
			lcd_main.message("frgb" , section_colour_dark);
			
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.4+y_offset);
			lcd_main.message("write", "to");
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*1.1+y_offset);
			lcd_main.message("write", "input");
			
			//lcd_main.message("moveto" ,sidebar.x2-fontheight*1.2, fontheight*0.4+y_offset);
			//lcd_main.message("write", "change");
			var tty = t_type;
			if((tty=="hardware")&&(connections.contains("connections["+i+"]::conversion::soundcard"))) tty="soundcard";
			type_colour = config.get("palette::connections::"+tty);
			type_colour_dark = [type_colour[0]*0.5,type_colour[1]*0.5,type_colour[2]*0.5];
			type_colour_darkest = [type_colour[0]*bg_dark_ratio,type_colour[1]*bg_dark_ratio,type_colour[2]*bg_dark_ratio];
			if(!sidebar.connection.show_to_inputs){
				lcd_main.message("moveto" ,sidebar.x2-fontheight*1.2, fontheight*1.1+y_offset);
				lcd_main.message("write", "change");
				lcd_main.message("moveto" ,sidebar.x+fontheight*1.4, fontheight*1.1+y_offset);
				lcd_main.message("frgb", type_colour );
				lcd_main.message("write", t_i_name);
				lcd_main.message("frgb", type_colour_dark );
				lcd_main.message("write", "("+t_type+")");
				y_offset+=1.4*fontheight;
			}else{
				//draw a list of buttons to select between the various outputs on offer here
				if(t_i_no!=null){
					lcd_main.message("moveto" ,sidebar.x2-fontheight*1.2, fontheight*1.1+y_offset);
					lcd_main.message("write", "hide");
				}
				y_offset+=1.4*fontheight;
				if(f_type == "matrix"){
					y_offset = conn_draw_to_inputs_list(i, t_name, "matrix", y_offset);
				}else{
					y_offset = conn_draw_to_inputs_list(i, t_name, "hardware", y_offset);
					y_offset = conn_draw_to_inputs_list(i, t_name, "audio", y_offset);
					y_offset = conn_draw_to_inputs_list(i, t_name, "midi", y_offset);
					y_offset = conn_draw_to_inputs_list(i, t_name, "parameters", y_offset);
					if(t_i_v == "all") y_offset = conn_draw_to_inputs_list(i, t_name, "block", y_offset);
				}
			}
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, 6*fo1+y_offset,section_colour_darkest );

			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fo1*4+y_offset);
			lcd_main.message("frgb", section_colour_dark);
			lcd_main.message("write", "voices");

			var vi;
			var vx=sidebar.x+fontheight*1.4;
			var show_poly_options = 0;
			var show_split_destination = 0;
			for(vi=0;vi<=t_v_no;vi++){
				if(vx>sidebar.x2-fontheight*(0.4+0.1*(vi>9))){
					vx=sidebar.x+fontheight*1.4;
					y_offset+=fontheight * 0.7;
					lcd_main.message("paintrect", sidebar.x, y_offset-fo1, sidebar.x2, 6*fo1+y_offset,section_colour_darkest );
				}					
				if(vi==0){
					click_rectangle( vx-fo1, y_offset, vx+fontheight*1.7, fontheight*0.6+y_offset, mouse_index,1);
					var w=0;
					if((t_i_no == 0) && ((t_type == "midi"))) w=0.1;
					if(t_type == "block"){
						w=0.4;
						t_i_v = "all";
					}
					if(t_i_v == "all"){
						lcd_main.message("paintrect", vx-fo1, y_offset, vx+fontheight*(w+0.6), fontheight*0.6+y_offset, section_colour);
						lcd_main.message("frgb", 0,0,0 );
					}else{
						lcd_main.message("paintrect", vx-fo1, y_offset, vx+fontheight*(w+0.6), fontheight*0.6+y_offset, section_colour_dark);
						lcd_main.message("frgb", section_colour );
					}
					lcd_main.message("moveto" ,vx, fontheight*0.4+y_offset);
					if(w>0.3){
						lcd_main.message("write", "block");
						vx+=fontheight*(0.8+w);	
					}else if(w>0){
						lcd_main.message("write", "poly");
						vx+=fontheight*(0.8+w);	
						show_poly_options = (t_i_v == "all");
						show_split_destination |= show_poly_options;
					}else{
						lcd_main.message("write", "all");
						vx+=fontheight*0.8;
						show_split_destination=(t_i_v=="all") && (t_v_no>1);
					}
					//var t_i_no = connections.get("connections["+i+"]::to::input::number");
				}else{
					click_rectangle( vx-fo1, y_offset, vx+fontheight*(0.4+0.1*(vi>9)), fontheight*0.6+y_offset, mouse_index,1);
					if(!Array.isArray(t_i_v))t_i_v=[t_i_v];
					if(t_i_v.indexOf(vi)!=-1){
						lcd_main.message("paintrect", vx-fo1, y_offset, vx+fontheight*(0.4+0.1*(vi>9)), fontheight*0.6+y_offset, section_colour);
						lcd_main.message("frgb", 0,0,0 );
						show_split_destination += 0.5;
					}else{
						lcd_main.message("paintrect", vx-fo1, y_offset, vx+fontheight*(0.4+0.1*(vi>9)), fontheight*0.6+y_offset, section_colour_dark);
						lcd_main.message("frgb", section_colour );
					}
					lcd_main.message("moveto" ,vx, fontheight*0.4+y_offset);
					lcd_main.message("write", vi);
					vx+=fontheight*0.6;
					if(vi>9)vx+=fontheight*0.1;
				}
				mouse_click_actions[mouse_index] = connection_edit_voices;
				mouse_click_parameters[mouse_index] = i; 
				mouse_click_values[mouse_index] = ["to",vi];
				mouse_index++;
			}
			show_split_destination = (show_split_destination>=1);			
			show_split_source = (show_split_source>=1);			
			
			if((t_v_no>1)||(blocktypes.get(t_name+"::max_polyphony")==0)||(blocktypes.get(t_name+"::max_polyphony")>t_v_no)){
				if(vx>sidebar.x2 - fontheight){
					y_offset+= fo1*7;			
				}
				vx = sidebar.x2 - fontheight;
				if(t_v_no>1){
					lcd_main.message("paintrect", vx-fo1, y_offset, vx+fo1*4, fo1*6+y_offset, section_colour_dark);
					click_zone(poly_key,-1,1,vx-fo1, y_offset, vx+fo1*4, fo1*6+y_offset,mouse_index,1);
				}
				lcd_main.message("paintrect", vx+fo1*5, y_offset, vx+fontheight, fo1*6+y_offset, section_colour_dark);
				click_zone(poly_key,1,1,vx+fo1*5, y_offset, vx+fontheight, fo1*6+y_offset,mouse_index,1);
				lcd_main.message("frgb", section_colour );
				if(t_v_no>1){
					lcd_main.message("moveto" ,vx, fontheight*0.4+y_offset);
					lcd_main.message("write", "-");
				}
				lcd_main.message("moveto" ,vx+fo1*6, fontheight*0.4+y_offset);
				lcd_main.message("write", "+");
				
				y_offset+= fo1*7;			
			}
			if(show_poly_options){
				draw_sidebar_polyphony_options(t_number,section_colour,section_colour_dark,section_colour_darkest,t_name);
			}

			//output scope here
			paramslider_details=[];
			if(t_type=="audio"){
				//no audio output scopes because i don't have A2D converters on the outputs of the matrix
			}else if(t_type=="midi"){
				//tell the routing patch to monitor this connection:
				//a special routing, a special imaginary connection, and a special destination voice no? desttype controls the gate in the routing patch,
				//so a simple solution is a new type that then goes direct into the monitor slot. 
				//index = routing_index[cno][destvoiceno][sourcevoice]; <- you can use this to find the existing connection and just copy the values out!
				/*	routing_buffer.poke(1,index+1,type);
					routing_buffer.poke(1,index+2,desttype);
					routing_buffer.poke(1,index+3,destvoice);
					routing_buffer.poke(1,index+4,destinput);
					routing_buffer.poke(1,index+5,scalen);
					routing_buffer.poke(1,index+6,scalev);
					routing_buffer.poke(1,index+7,offsetn);
					routing_buffer.poke(1,index+8,offsetv);*/
				sidebar.scopes.midi_routing.starty = y_offset;
				sidebar.scopes.midi_routing.endy = y_offset + fontheight*2;
				sidebar.scopes.midi_routing.bg = section_colour_darkest;
				sidebar.scopes.midi_routing.fg = section_colour;
				if(sidebar.scopes.midi_routing.number != i){
					remove_routing(0);
					sidebar.scopes.midi_routing.number = i;
					make_connection(i,1);
				}
				lcd_main.message("paintrect",sidebar.x,y_offset,sidebar.x2,y_offset+2*fontheight,section_colour_darkest);
				y_offset += fo1*21;
			}else if(t_type=="parameters"){
				var params=blocktypes.get(t_name+"::parameters");
				curp = t_i_no;
				var p_values = params[curp].get("values");
				var wrap = params[curp].get("wrap");
				var pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+curp);
				var namelabely=y_offset+fontheight*(0.4+2);
				var namearr = params[curp].get("name").split("_");
				var flags = (p_values[0]=="bi");
				var opvf=0;//do i need to fetch this here or is it never relevant?
				if(opvf){
					flags |= 2;
				}else if(params[curp].contains("nopervoice")){
					flags &= 61;
					flags |= 4; //removes 2 flag, adds 4 flag
				}
		
				if(p_type=="button"){
					paramslider_details[curp]=null;
					var statecount = (p_values.length - 1) / 2;
					var pv2 = Math.floor(pv * statecount * 0.99999) * 2  + 1;
					draw_button(sidebar.x,y_offset,sidebar.x2,y_offset+2*fontheight,section_colour_dark[0],section_colour_dark[1],section_colour_dark[2],mouse_index, p_values[pv2],pv);
					mouse_click_actions[mouse_index] = send_button_message;
					mouse_click_parameters[mouse_index] = block;
					mouse_click_values[mouse_index] = [p_values[0],p_values[pv2+1],MAX_PARAMETERS*block+curp, (pv+(1/statecount)) % 1];
					if(getmap!=0){ //so ideally buttons should be something that if possible happens in max, for low latency
						//but it's so much easier just to call this fn
						buttonmaplist.push(block, p_values[0],p_values[pv2+1],MAX_PARAMETERS*block+curp, (pv+(1/statecount)) % 1);											
					}
					mouse_index++;
					y_offset+=2.1*fontheight;
				}else{
					var click_to_set = 0;
					if(params[curp].contains("click_set")) click_to_set = params[curp].get("click_set");
					if(h_slider<1){
						paramslider_details[curp]=[sidebar.x,y_offset,sidebar.x2,y_offset+3*fontheight,section_colour_dark[0],section_colour_dark[1],section_colour_dark[2],mouse_index,t_number,curp,flags,namearr,namelabely,p_type,wrap,t_name,3/*height*/,0,click_to_set];
					}else{
						paramslider_details[curp]=[sidebar.x,y_offset,sidebar.x2,y_offset+3*fontheight,section_colour[0],section_colour[1],section_colour[2],mouse_index,t_number,curp,flags,namearr,namelabely,p_type,wrap,t_name,3,0,click_to_set];
					}
					parameter_v_slider(sidebar.x,y_offset,sidebar.x2,y_offset+3*fontheight,section_colour_dark[0],section_colour_dark[1],section_colour_dark[2],mouse_index,t_number,curp,flags,click_to_set);
					sidebar.selected = t_number;
					//paramslider_details is used for quick redraw of a single slider. index is curp
					//ie is mouse_click_parameters[index][0]
					mouse_click_actions[mouse_index] = sidebar_parameter_knob;
					mouse_click_parameters[mouse_index] = [curp, t_number,wrap];
					if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")||(p_type=="menu_l")||(p_type=="menu_d")){
						//if it's a menu_b or menu_i store the slider index + 1 in mouse-values
						mouse_click_values[mouse_index] = curp+1;
					}else{
						mouse_click_values[mouse_index] = "";
					}								
					mouse_index++;
					y_offset+=3.1*fontheight;
				}
			}

			if((blocktypes.contains(f_name+"::connections::out::matrix_channels")) && (to_has_matrix = 1)){
				if((f_type=="matrix")&&(t_type=="matrix")){
					var fhc = blocktypes.get(f_name+"::connections::out::hardware_channels["+f_o_no+"]");
					var thc = blocktypes.get(t_name+"::connections::in::hardware_channels["+t_i_no+"]");
					if((fhc != 0) && (thc != 0)){
						//offer to convert it to hardware connection instead of matrix
						lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,(usermouse.clicked2d==mouse_index)? type_colour_dark:type_colour_darkest );
						click_zone(convert_matrix_to_regular, i, 0, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
						lcd_main.message("moveto" , sidebar.x + fo1+fo1, fontheight*0.75+y_offset);
						lcd_main.message("frgb",config.get("palette::connections::hardware"));
						lcd_main.message("write", "convert from matrix to regular connection");
			
						y_offset += 1.1* fontheight;						
					}
				}else if((f_type=="hardware")&&(t_type=="hardware")){
					var fhc = blocktypes.get(f_name+"::connections::out::matrix_channels["+f_o_no+"]");
					var thc = blocktypes.get(t_name+"::connections::in::matrix_channels["+t_i_no+"]");
					if((fhc != 0) && (thc != 0)){
						//offer to convert it to hardware connection instead of matrix
						lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,(usermouse.clicked2d==mouse_index)? type_colour_dark:type_colour_darkest );
						click_zone(convert_regular_to_matrix, i, 0, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
						lcd_main.message("moveto" , sidebar.x + fo1+fo1, fontheight*0.75+y_offset);
						lcd_main.message("frgb", config.get("palette::connections::matrix"));
						lcd_main.message("write", "convert from regular connection to matrix one");
			
						y_offset += 1.1* fontheight;						
					}
				}
			}
			
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,(usermouse.clicked2d==mouse_index)? type_colour_dark:type_colour_darkest );
			click_zone(insert_menu_button, i, 0, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
			lcd_main.message("moveto" , sidebar.x + fo1+fo1, fontheight*0.75+y_offset);
			lcd_main.message("frgb",type_colour);
			lcd_main.message("write", "insert block into connection");

			y_offset += 1.1* fontheight;

			if(show_split_source){
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,(usermouse.clicked2d==mouse_index)? type_colour_dark:type_colour_darkest );
				click_zone(split_wire_source, i, 0, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("moveto" , sidebar.x + fo1+fo1, fontheight*0.75+y_offset);
				lcd_main.message("frgb",type_colour);
				lcd_main.message("write", "split connection into one wire per source voice");

				y_offset += 1.1* fontheight;
			}

			if(show_split_destination){
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,(usermouse.clicked2d==mouse_index)? type_colour_dark:type_colour_darkest );
				click_zone(split_wire_destination, i, 0, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("moveto" , sidebar.x + fo1+fo1, fontheight*0.75+y_offset);
				lcd_main.message("frgb",type_colour);
				lcd_main.message("write", "split connection into one wire per destination voice");

				y_offset += 1.1* fontheight;
			}

			if(danger_button == mouse_index){
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,120,0,0 );
				lcd_main.message("frgb" , 255,50,50);
			}else{
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,(usermouse.clicked2d==mouse_index)? type_colour_dark:type_colour_darkest );
				lcd_main.message("frgb" , 255,0,0);
			}
			click_zone(remove_connection_btn, i, mouse_index, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
			lcd_main.message("moveto" , sidebar.x+fo1+fo1, fontheight*0.75+y_offset);
			lcd_main.message("write", "delete connection");
			y_offset += 1.1* fontheight;
		}else if((selected.block_count + selected.wire_count) > 1){ 
			if(selected.wire_count>1){
				sidebar.mode = "wires";
			}else{
				sidebar.mode = "blocks";
			}
			if(sidebar.mode != sidebar.lastmode){
				if((sidebar.lastmode == "none")&&AUTOZOOM_ON_SELECT) center_view(1);
				clear_sidebar_paramslider_details();
				sidebar.scroll.position = 0;
				sidebar.lastmode = sidebar.mode;
				audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
				remove_midi_scope();
				sidebar.scopes.voice = -1;
				redraw_flag.targets=[];
				sidebar.selected = -1;
			}
			if(selected.block_count > 1){ 
				// MULTI BLOCKS SELECTED ########################################################################################################
				// nothing, maybe just muteall/unmuteall buttons? copy + paste? delete? group?
			    lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2,fontheight+y_offset,menudarkest);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , menucolour);
				lcd_main.message("write", "multiple blocks selected");
				y_offset += 1.1*fontheight;
				
				if(is_selection_encapsulatable()){
					lcd_main.message("paintrect", sidebar.x2- fontheight*8.3, y_offset, sidebar.x2- fontheight*6.4, fontheight+y_offset,greydarkest );
					lcd_main.message("frgb" ,greycolour);
					click_zone(set_sidebar_mode,"name_encapsulation",1, sidebar.x2 - fontheight*8.3, y_offset, sidebar.x2 - fontheight*6.4, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("moveto" ,sidebar.x2 - fontheight*8.2, fontheight*0.5+y_offset);
					lcd_main.message("write", "encapsulate");
					lcd_main.message("moveto" ,sidebar.x2 - fontheight*8.2, fontheight*0.75+y_offset);
					lcd_main.message("write", "selected");
				}
				
				lcd_main.message("paintrect", sidebar.x2- fontheight*6.3, y_offset, sidebar.x2- fontheight*4.4, fontheight+y_offset,greydarkest );
				lcd_main.message("frgb" ,greycolour);
				click_zone(save_song,1,1, sidebar.x2 - fontheight*6.3, y_offset, sidebar.x2 - fontheight*4.4, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("moveto" ,sidebar.x2 - fontheight*6.2, fontheight*0.5+y_offset);
				lcd_main.message("write", "save");
				lcd_main.message("moveto" ,sidebar.x2 - fontheight*6.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "selected");
			
				var recarmflag=0;
				for(var tb=0;tb<MAX_BLOCKS;tb++){
					if(selected.block[tb]){
						var tt = blocks.get("blocks["+tb+"]::type");
						if((tt=="audio")||(tt=="hardware")){
							recarmflag=1;
							tb=MAX_BLOCKS;
						}
					}
				}
				if(recarmflag){
					lcd_main.message("paintrect", sidebar.x2- fontheight*4.3, y_offset, sidebar.x2- fontheight*3.3, fontheight+y_offset,255,58,50 );
					lcd_main.message("frgb" ,0,0,0);
					click_zone(arm_selected_blocks,0,1, sidebar.x2 - fontheight*4.3, y_offset, sidebar.x2 - fontheight*3.3, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("moveto" ,sidebar.x2 - fontheight*4.2, fontheight*0.5+y_offset);
					lcd_main.message("write", "rec");
					lcd_main.message("moveto" ,sidebar.x2 - fontheight*4.2, fontheight*0.75+y_offset);
					lcd_main.message("write", "arm");
				}
				
				lcd_main.message("paintrect", sidebar.x2 - fontheight*3.2, y_offset, sidebar.x2 - fontheight*2.2, fontheight+y_offset,menudarkest );
				lcd_main.message("moveto", sidebar.x2 - fontheight*3.1, fontheight*0.75+y_offset);
				lcd_main.message("frgb" ,0,0,0);
				lcd_main.message("write", "copy");
				click_zone(copy_selection, null,null, sidebar.x2 - fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,mouse_index,1 );
				
				lcd_main.message("paintrect", sidebar.x2-  fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,menudark );
				click_zone(mute_selected_block,0,null, sidebar.x2 - fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , menucolour);				
				lcd_main.message("moveto", sidebar.x2 - fontheight*2, fontheight*0.5+y_offset);
				lcd_main.message("write", "un");
				lcd_main.message("moveto", sidebar.x2 - fontheight*2, fontheight*0.75+y_offset);
				lcd_main.message("write", "mute");
				lcd_main.message("paintrect", sidebar.x2-  fontheight, y_offset, sidebar.x2, fontheight+y_offset,menucolour );
				click_zone(mute_selected_block,1,null, sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , 0,0,0);				
				lcd_main.message("moveto", sidebar.x2 - fontheight*0.9, fontheight*0.75+y_offset);
				lcd_main.message("write", "mute");		
				y_offset += 1.1*fontheight;
				var block_label;
				
				for(i=0;i<MAX_BLOCKS;i++){
					if(selected.block[i]){
						block_label = blocks.get("blocks["+i+"]::label");
						block_colour = blocks.get("blocks["+i+"]::space::colour");
						lcd_main.message("frgb" , block_colour);				
						lcd_main.message("moveto", sidebar.x + fo1, fontheight*(0.4)+y_offset);
						lcd_main.message("write", block_label);
						click_zone(individual_multiselected_block,i,null, sidebar.x, y_offset, sidebar.x2, y_offset+0.5*fontheight,mouse_index,1);
						y_offset+=0.5*fontheight;
					}
				}
				y_offset+=0.5*fontheight;
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset, menudarkest );
				lcd_main.message("frgb" , menucolour);				
				lcd_main.message("moveto", sidebar.x + fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "store all selected blocks to a state");		
				y_offset += 1.1*fontheight;
	
				var cll = config.getsize("palette::gamut");
				var c = new Array(3);
				var sc;
				var statex=0;
				// draw a button for each possible state
				for(sc=0;sc<MAX_STATES;sc++){
					var statecontents = states.get("states::"+sc);
					var slotfilled=0;
					var stateexists=0;
					if(!is_empty(statecontents)){
						stateexists=1;
						if(statecontents.contains(block)){
							slotfilled=1;
						}
					}
					c = config.get("palette::gamut["+Math.floor(sc*cll/MAX_STATES)+"]::colour");
					lcd_main.message("paintrect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,c );							
					if(stateexists) lcd_main.message("framerect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,menucolour );
					if(slotfilled) lcd_main.message("framerect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,255,0,0 );
					click_zone(add_to_state, sc, -2, sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,mouse_index,1 );							
					if(states.contains("names::"+sc)){
						var sn=states.get("names::"+sc);
						sn = sn.split(".");
						if(!Array.isArray(sn)) sn = [sn];
						for(var si=0;si<sn.length;si++){
							lcd_main.message("moveto", sidebar.x + fontheight*(statex+1-0.2*sn[si].length), y_offset+fontheight*(1-0.25*(sn.length-si)));
							lcd_main.message("frgb", 0,0,0); //c[0]*bg_dark_ratio, c[1]*bg_dark_ratio, c[2]*bg_dark_ratio);
							lcd_main.message("write", sn[si]);
						}
					}	
					statex+=1.0124;
					if(statex>sidebar.width_in_units-0.1){
						y_offset += fontheight;
						statex=0;
					}
				}
				y_offset += fo1 + (statex!=0)*fontheight;
				y_offset+=0.5*fontheight;
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2 - fontheight*2.2, fontheight+y_offset, menudarkest );
				lcd_main.message("frgb" , menucolour);				
				lcd_main.message("moveto", sidebar.x + fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "polyphony");		
	
				lcd_main.message("paintrect", sidebar.x2 - fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,menudarkest );
				click_zone(multiselect_polychange, -1, null, sidebar.x2 - fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , menucolour);				
				lcd_main.message("moveto", sidebar.x2 - fontheight*2, fontheight*0.75+y_offset);
				lcd_main.message("write", "-");
				lcd_main.message("paintrect", sidebar.x2 - fontheight, y_offset, sidebar.x2 , fontheight+y_offset,menudarkest );
				click_zone(multiselect_polychange,1,null, sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , menucolour);				
				lcd_main.message("moveto", sidebar.x2 - fontheight*0.9, fontheight*0.75+y_offset);
				lcd_main.message("write", "+");		
	
	
				y_offset += 1.1*fontheight;
			}
	
	
			if(selected.wire_count > 1){
				
				if(selected.block_count>1) y_offset+= 1.1*fontheight;
		// MULTI CONNECTION VIEW
				lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2-fontheight*2.3,fontheight+y_offset,menudarkest);
				lcd_main.message("paintrect", sidebar.x2 - fontheight*3.2, y_offset, sidebar.x2-fontheight*2.2, fontheight+y_offset,menudarkest );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , menucolour);
				lcd_main.message("write", selected.wire_count, "connections selected");

			
				lcd_main.message("paintrect", sidebar.x2 - fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,menudark );
				click_zone(connection_mute_selected,0,null, sidebar.x2 - fontheight*2.1, y_offset, sidebar.x2-fontheight*1.1, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , menucolour);				
				lcd_main.message("moveto", sidebar.x2 - fontheight*2, fontheight*0.5+y_offset);
				lcd_main.message("write", "un");
				lcd_main.message("moveto", sidebar.x2 - fontheight*2, fontheight*0.75+y_offset);
				lcd_main.message("write", "mute");
				lcd_main.message("paintrect", sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,menudarkest );
				click_zone(connection_mute_selected,1,null, sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , 128,128,128);				
				lcd_main.message("moveto", sidebar.x2 + fontheight*0.9, fontheight*0.75+y_offset);
				lcd_main.message("write", "mute");	
				var y_o = y_offset + 1.1*fontheight;	
				y_offset += 2.2*fontheight;
				var block_label;
				var avg_scale = 0;
				var num = 0;
				var same_dest = -1;
				for(i=0;i<selected.wire.length;i++){
					if(selected.wire[i]){
						num++;
						var f_number = connections.get("connections["+i+"]::from::number");
						var f_label = blocks.get("blocks["+f_number+"]::label");
						var t_number = connections.get("connections["+i+"]::to::number");
						if(num==1){
							same_dest = t_number;
						}else{
							if(t_number!=same_dest)same_dest=-1;
						}
						var t_label = blocks.get("blocks["+t_number+"]::label");
						//var t_name = blocks.get("blocks["+t_number+"]::name");
						//var f_o_no = connections.get("connections["+i+"]::from::output::number");
						//var f_type = connections.get("connections["+i+"]::from::output::type");
						//var t_i_no = connections.get("connections["+i+"]::to::input::number");
						var t_type = connections.get("connections["+i+"]::to::input::type");
						var mute = connections.get("connections["+i+"]::conversion::mute");
						var ccol = [];
						if(mute){
							ccol = [128,128,128];
						}else{
							var tty = t_type;
							if((tty=="hardware")&&(connections.contains("connections["+i+"]::conversion::soundcard"))) tty="soundcard";
							if(config.contains("palette::connections::"+t_type)){
								ccol = config.get("palette::connections::"+t_type);
							}else{
								ccol = menucolour;
							}
						}
						var c_scale = connections.get("connections["+i+"]::conversion::scale");
						avg_scale+=Math.abs(c_scale);
						lcd_main.message("frgb" , ccol);				
						lcd_main.message("moveto", sidebar.x + fo1, fontheight*(0.4)+y_offset);
						lcd_main.message("write", f_label+"-->"+t_label);
						if((connections.get("connections["+i+"]::from::output::type")!="matrix") && (!force_unity)){
							draw_h_slider_labelled(sidebar.x+4*fontheight, y_offset+0.5*fontheight, sidebar.x2-fontheight*1.1, fontheight+y_offset,ccol[0],ccol[1],ccol[2],mouse_index,c_scale);
							mouse_click_actions[mouse_index] = connection_edit;
							mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::scale";
							mouse_click_values[mouse_index] = 0;
							mouse_index++;
						}
						click_rectangle( sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1 );
						mouse_click_actions[mouse_index] = connection_edit;
						if(mute){
							mouse_click_values[mouse_index] = 0;	
							lcd_main.message("paintrect", sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,128,128,128 );
							lcd_main.message("moveto", sidebar.x2 + fontheight*0.85, fontheight*0.75+y_offset);
							lcd_main.message("frgb" , 0,0,0);
							lcd_main.message("write", "mute");	
							lcd_main.message("frgb" , menucolour);
						}else{
							mouse_click_values[mouse_index] = 1;
							lcd_main.message("paintrect", sidebar.x2 - fontheight, y_offset, sidebar.x2, fontheight+y_offset,block_darkest );
							lcd_main.message("moveto", sidebar.x2 - fontheight*0.85, fontheight*0.75+y_offset);
							lcd_main.message("frgb" , 128,128,128);
							lcd_main.message("write", "mute");
						}
						mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::mute";
						mouse_index++;
						y_offset+=1.1*fontheight;
					}
				}
				avg_scale /= num;
				lcd_main.message("moveto", sidebar.x + fo1, fontheight*0.75+y_o);
				lcd_main.message("frgb" , menucolour);
				lcd_main.message("write", "adjust all");
				draw_h_slider_labelled(sidebar.x+4*fontheight, y_o, sidebar.x2-fontheight*1.1, fontheight+y_o,menucolour[0],menucolour[1],menucolour[2],mouse_index,avg_scale);
				mouse_click_actions[mouse_index] = connection_scale_selected;
				mouse_click_parameters[mouse_index] = 0;
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
			
				if((automap.available_c>-1)&&(!automap.lock_c)){
					automap.groups = ["connections_multi"];
					automap.sidebar_row_ys[0] = 0.01;

					automap.mapped_c=-0.5;
					var maplist = [];
					var mapwrap = [];
					var maplistopv = [];
					var mapcolours = [];
					
					
					if(automap.c_rows<automap.groups.length){
						for(var pad=0;pad<automap.c_cols*automap.c_rows;pad++){
							if(pad<automap.groups.length){
								maplist.push(-0.5);
								mapcolours.push(menucolour[0]);
								mapcolours.push(menucolour[1]);
								mapcolours.push(menucolour[2]);
							}else{
								maplist.push(-1);
								mapcolours.push(-1);	
							}
							mapwrap.push(1);
							maplistopv.push(-1);
						}
					}else{
						for(var pad=0;pad<automap.c_cols*automap.c_rows;pad++){
							var px = pad % automap.c_cols;
							var py = ((pad-px)/automap.c_cols);
							if((px==0)&&(py<automap.groups.length)){
								maplist.push(-0.5);
								mapcolours.push(menucolour[0]);
								mapcolours.push(menucolour[1]);
								mapcolours.push(menucolour[2]);
							}else{
								maplist.push(-1);
								mapcolours.push(-1);	
							}
							mapwrap.push(1);
							maplistopv.push(-1);
						}
					}
					note_poly.message("setvalue", automap.available_c, "automapped", 1);
					note_poly.message("setvalue", automap.available_c, "automap_offset", 0);
					note_poly.message("setvalue", automap.available_c, "maplistopv",maplistopv);
					note_poly.message("setvalue", automap.available_c, "maplist",maplist);
					note_poly.message("setvalue", automap.available_c, "mapwrap",mapwrap);
					note_poly.message("setvalue", automap.available_c, "mapcolour",mapcolours);
					note_poly.message("setvalue", automap.available_c, "buttonmaplist",-1);
				}

				if(same_dest>-1){
					y_offset+=0.6*fontheight;
					lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+0.5*y_offset,block_darkest );
					lcd_main.message("moveto", sidebar.x + fontheight*0.2, fontheight*0.35+y_offset);
					lcd_main.message("frgb" , block_colour);
					lcd_main.message("write", "selected wires all have the same destination:");
					y_offset+=0.6*fontheight;
					lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+sidebar.width*0.5-fontheight*0.05, fontheight+y_offset,(usermouse.clicked2d==mouse_index)? block_colour:block_darkest );
					click_zone(insert_multi_menu_button,same_dest,null, sidebar.x, y_offset, sidebar.x+sidebar.width*0.5-fontheight*0.05, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("moveto", sidebar.x + fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("frgb" , (usermouse.clicked2d==mouse_index)? block_darkest : block_colour);
					lcd_main.message("write", "insert block");
					lcd_main.message("paintrect", sidebar.x+sidebar.width*0.5+fontheight*0.05, y_offset, sidebar.x2, fontheight+y_offset,(usermouse.clicked2d==mouse_index)? block_colour:block_darkest );
					click_zone(insert_mixer,same_dest, null, sidebar.x+sidebar.width*0.5+fontheight*0.05, y_offset, sidebar.x2, fontheight+y_offset ,mouse_index, 1);
					lcd_main.message("moveto", sidebar.x + sidebar.width*0.5+ fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("frgb" , (usermouse.clicked2d==mouse_index)? block_darkest : block_colour);
					lcd_main.message("write", "insert mixer");
					y_offset+=1.1*fontheight;
				}
			}
		}else if(sidebar.mode == "input_scope"){
			sidebar.scroll.position = 0;
			if(sidebar.mode != sidebar.lastmode){
				clear_sidebar_paramslider_details();
				sidebar.lastmode = sidebar.mode;
			}
			
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,menudarkest );
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			lcd_main.message("frgb", menucolour);
			setfontsize(fontsmall*2);
			lcd_main.message("write", "input",sidebar.scopes.voice+1);
			
			y_offset += fontheight*1.1;
						
			//need to get the name of this input, and the block it's on.
			var bk = blocktypes.getkeys();
			var t;
			for(var b=0;b<bk.length;b++){
				if(blocktypes.contains(bk[b]+"::connections::out::hardware_channels")){
					t = blocktypes.get(bk[b]+"::connections::out::hardware_channels");
					if(!Array.isArray(t)) t = [t];
					var cnam = "";
					var tn = blocktypes.get(bk[b]+"::connections::out::hardware");
					if(!Array.isArray(tn)) tn = [tn];
					var cnam = "";
					for(var ti = 0; ti<t.length; ti++){
						if(tn[ti] !== undefined){
							cnam = tn[ti];
						}
						if(t[ti]==sidebar.scopes.voice+1){
							lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,menudarkest );
							lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
							lcd_main.message("frgb", menucolour);
							setfontsize(fontsmall*1.5);
							lcd_main.message("write", bk[b],cnam);

							sidebar.scopes.starty = y_offset + fontheight*1.1;
							sidebar.scopes.endy = y_offset+5*fontheight;
							sidebar.scopes.bg = menudarkest;
							sidebar.scopes.fg = menucolour;
							sidebar.scopes.width = (sidebar.width + fo1);		
							lcd_main.message("paintrect", sidebar.x,sidebar.scopes.starty,sidebar.x+sidebar.scopes.width-fo1,sidebar.scopes.endy,block_darkest);
							click_zone(scope_zoom,null,null, sidebar.x,sidebar.scopes.starty,sidebar.x+sidebar.scopes.width-fo1,sidebar.scopes.endy,mouse_index,2);				

							y_offset = sidebar.scopes.endy+fo1;						
							for(var bb=0;bb<MAX_BLOCKS;bb++){
								if(blocks.contains("blocks["+bb+"]::name")&&(blocks.get("blocks["+bb+"]::name")==bk[b])){
									var blockcol = blocks.get("blocks["+bb+"]::space::colour");
									lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,blockcol );
									lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
									lcd_main.message("frgb", 255,255,255);
									lcd_main.message("write", "click to jump to the "+bk[b]+" block");
									click_zone(select_block,bb,bb, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1);
									bb=999999999;
								}
							}
							if(bb<=MAX_BLOCKS){
								//it's not here, button to add it?
								var blockcol = blocktypes.get(bk[b]+"::colour");
								lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,blockcol );
								lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
								lcd_main.message("frgb", 255,255,255);
								lcd_main.message("write", "click to add a "+bk[b]+" block");
								click_zone(new_block_via_button,bk[b],null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1);
							}
							b=99999;ti=999999;
						}
					}
				}
			}
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
			sidebar.scopes.midi = -1;
			audio_to_data_poly.message("setvalue", 1+sidebar.scopes.voice+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK,"vis_scope",1);
			sidebar.scopes.voicelist = [sidebar.scopes.voice+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK];			
			messnamed("scope_size",(sidebar.scopes.width)/2);
			y_offset += fontheight*1.1;
		}else if(sidebar.mode == "output_scope"){
			sidebar.scroll.position = 0;
			if(sidebar.mode != sidebar.lastmode){
				clear_sidebar_paramslider_details();
				sidebar.lastmode = sidebar.mode;
			}
	
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,menudarkest );
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			lcd_main.message("frgb", menucolour);
			setfontsize(fontsmall*2);
			lcd_main.message("write", "output",sidebar.scopes.voice+1);

			y_offset += fontheight*1.1;
		
			var bk = blocktypes.getkeys();
			var t;
			for(var b=0;b<bk.length;b++){
				if(blocktypes.contains(bk[b]+"::connections::in::hardware_channels")){
					t = blocktypes.get(bk[b]+"::connections::in::hardware_channels");
					if(!Array.isArray(t)) t = [t];
					var cnam = "";
					var tn = blocktypes.get(bk[b]+"::connections::in::hardware");
					if(!Array.isArray(tn)) tn = [tn];
					for(var ti = 0; ti<t.length; ti++){
						if(tn[ti] !== undefined){
							cnam = tn[ti];
						}
						if(t[ti]==sidebar.scopes.voice+1){
							lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,menudarkest );
							lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
							lcd_main.message("frgb", menucolour);
							setfontsize(fontsmall*1.5);
							lcd_main.message("write", bk[b],cnam);							
							y_offset += fontheight*1.1;
							sidebar.scopes.starty = y_offset;
							sidebar.scopes.endy = y_offset+4*fontheight;
							sidebar.scopes.bg = menudarkest;
							sidebar.scopes.fg = menucolour;
							sidebar.scopes.width = (sidebar.width + fo1);
							lcd_main.message("paintrect", sidebar.x,sidebar.scopes.starty,sidebar.x+sidebar.scopes.width-fo1,sidebar.scopes.endy,block_darkest);
							click_zone(scope_zoom,null,null, sidebar.x,sidebar.scopes.starty,sidebar.x+sidebar.scopes.width-fo1,sidebar.scopes.endy,mouse_index,2);
							y_offset = sidebar.scopes.endy + fo1;
							for(var bb=0;bb<MAX_BLOCKS;bb++){
								if(blocks.contains("blocks["+bb+"]::name")&&(blocks.get("blocks["+bb+"]::name")==bk[b])){
									//post("\nthe link is to block",bb,bk[b]);
									var blockcol = blocks.get("blocks["+bb+"]::space::colour");
									lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,blockcol );
									lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
									lcd_main.message("frgb", 255,255,255);
									lcd_main.message("write", "click to jump to the "+bk[b]+" block");
									click_zone(select_block,bb,bb, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1);
									bb=999999999;
								}
							}
							if(bb<=MAX_BLOCKS){
								//it's not here, button to add it?
								var blockcol = blocktypes.get(bk[b]+"::colour");
								lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,blockcol );
								lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
								lcd_main.message("frgb", 255,255,255);
								lcd_main.message("write", "click to add a "+bk[b]+" block");
								click_zone(new_block_via_button,bk[b],null, sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,mouse_index,1);
							}
							b= 9999999; ti=999999;
						}
					}
				}
			}
			y_offset += fontheight*1.1;

						
			audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
			sidebar.scopes.midi = -1;
			sidebar.scopes.voicelist = [sidebar.scopes.voice+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS];
			audio_to_data_poly.message("setvalue", 1+sidebar.scopes.voice+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS,"vis_scope",1);
			messnamed("scope_size",(sidebar.scopes.width)/2);
		}else if(sidebar.mode == "midi_indicators"){
			sidebar.scroll.position = 0;
			if(sidebar.mode != sidebar.lastmode){
				clear_sidebar_paramslider_details();
				sidebar.lastmode = sidebar.mode;
			}
	
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight+y_offset,menudarkest );
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			lcd_main.message("frgb", menucolour);
			setfontsize(fontsmall*2);
			lcd_main.message("write", "midi input indicators");
			y_offset += fontheight*1.1;
			
			for(var i=0;i<midi_indicators.list.length;i++){
				if(midi_indicators.status[i]>0){
					lcd_main.message("frgb",menucolour);
				}else{
					lcd_main.message("frgb",menudarkest);
				}
				y_offset += fontheight*1.1;
				lcd_main.message("moveto",sidebar.x+fontheight*0.2,y_offset);
				lcd_main.message("write",midi_indicators.list[i]);
			}	
		}else{
			sidebar.mode = "none";
			//center_view(1);
			if(sidebar.mode != sidebar.lastmode){
				clear_sidebar_paramslider_details();
				sidebar.lastmode = sidebar.mode;
				sidebar.scopes.voice = -1;
				audio_to_data_poly.message("setvalue", 0,"vis_scope", 0);
				remove_midi_scope();
				redraw_flag.targets=[];
				sidebar.selected = -1;
				sidebar.scroll.position = 0;
			}
		}	
	}

	if((sidebar.mode!="block")&&(sidebar.mode!="settings")&&(sidebar.mode!="settings_flockpreset")&&(sidebar.mode!="add_state")&&(sidebar.mode!="help")){ // DISABLE AUTOMAPPED MIDI CONTROLLERS
		remove_automaps();
	}
	if(y_offset+sidebar.scroll.position >= mainwindow_height){
		sidebar.scroll.max = fontheight + fontheight + sidebar.scroll.position+y_offset-mainwindow_height;
	}else{
		if(view_changed && (sidebar.mode!="none")){
			var ttt= (displaymode == "panels") ? 1 : 0;
			click_rectangle(sidebar.x,y_offset+1,sidebar.x2,mainwindow_height,ttt,ttt);
		}
	}
	if((sidebar.scroll.max>0)){
		var sbx = mainwindow_width-(sidebar.scrollbar_width-8)*0.5;
		var l = (mainwindow_height-18) / (mainwindow_height + sidebar.scroll.max - 18);
		var l2 = (mainwindow_height-18) * l;
		var p = sidebar.scroll.position * l + 9;
		lcd_main.message("frgb", block_darkest);
		lcd_main.message("moveto",sbx,9);
		lcd_main.message("lineto",sbx,mainwindow_height-9);		
		if(mouse_index==usermouse.clicked2d){
			lcd_main.message("frgb", block_colour);
		}else{
			lcd_main.message("frgb", block_dark);
		}
		lcd_main.message("moveto",sbx,p);
		lcd_main.message("lineto",sbx,p+l2);
		//click zone for the scrollbar
		click_zone(scroll_sidebar, null, null, sidebar.x2,0,mainwindow_width+2,mainwindow_height,scrollbar_index,2);
	}
	if(fullscreen&&view_changed&&((displaymode=="blocks")||(displaymode=="panels")))draw_clock();
	view_changed = false;
}


function draw_sidebar_polyphony_options(block, block_colour, block_dark, block_darkest, block_name){
	var bc,fc;
	var max_p = blocktypes.get(blocks.get("blocks[" + block + "]::name") + "::max_polyphony");
	max_p = (max_p == 0) * 9999999999999;

	lcd_main.message("paintrect", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2 - 3.3 * fontheight, 0.6*fontheight + y_offset, block_darkest);
	lcd_main.message("moveto", sidebar.x2 - 7.4 * fontheight, fontheight * 0.4 + y_offset);
	lcd_main.message("frgb", block_dark);
	lcd_main.message("write", "stack mode");
	
	click_zone(open_dropdown, "stack", "stack", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
	if(sidebar.dropdown!="stack"){
		if (usermouse.clicked2d == mouse_index) {
			bc = block_colour;
			fc = block_darkest;
		} else {
			bc = block_darkest;
			fc = block_colour;
		}
		click_zone(open_dropdown, "stack", "stack", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
		lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
		lcd_main.message("frgb", fc);
		lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
		lcd_main.message("write", blocks.get("blocks[" + block + "]::poly::stack_mode"));
		lcd_main.message("paintpoly", sidebar.x2 - 4*fo1, y_offset + 2.5*fo1, sidebar.x2 - fo1, y_offset + 2.5*fo1, sidebar.x2 - 2.5*fo1, y_offset + 4*fo1, sidebar.x2 - 4*fo1, y_offset + 2.5*fo1);				
		y_offset += 0.7 * fontheight;
	}else{
		var sel = blocks.get("blocks[" + block + "]::poly::stack_mode");
		var sn = poly_alloc.stack_modes.indexOf(sel);
		for(var dr=0;dr<poly_alloc.stack_modes.length;dr++){
			if((dr==sn)||(mouse_index==usermouse.clicked2d)){
				fc = block_darkest;
				bc = block_colour;
			}else{
				bc = block_darkest;
				fc = block_colour;
			}
			if(dr == sn){
				click_zone(open_dropdown, "stack", "stack", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
			}else{
				click_zone(set_block_mode, "stack", dr, sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
			}
			lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
			lcd_main.message("frgb", fc);
			lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
			lcd_main.message("write", poly_alloc.stack_modes[dr]);	
			y_offset+=0.7*fontheight;			
		}
	}


	lcd_main.message("paintrect", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2 - 3.3 * fontheight, 0.6*fontheight + y_offset, block_darkest);
	lcd_main.message("moveto", sidebar.x2 - 7.4 * fontheight, fontheight * 0.4 + y_offset);
	lcd_main.message("frgb", block_dark);
	lcd_main.message("write", "choose mode");
	click_zone(open_dropdown, "choose", "choose", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
	if(sidebar.dropdown!="choose"){
		if (usermouse.clicked2d == mouse_index) {
			bc = block_colour;
			fc = block_darkest;
		} else {
			bc = block_darkest;
			fc = block_colour;
		}
		click_zone(open_dropdown, "choose", "choose", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
		lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
		lcd_main.message("frgb", fc);
		lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
		lcd_main.message("write", blocks.get("blocks[" + block + "]::poly::choose_mode"));
		lcd_main.message("paintpoly", sidebar.x2 - 4*fo1, y_offset + 2.5*fo1, sidebar.x2 - fo1, y_offset + 2.5*fo1, sidebar.x2 - 2.5*fo1, y_offset + 4*fo1, sidebar.x2 - 4*fo1, y_offset + 2.5*fo1);				
		y_offset += 0.7 * fontheight;
	}else{
		var sel = blocks.get("blocks[" + block + "]::poly::choose_mode");
		var sn = poly_alloc.choose_modes.indexOf(sel);
		for(var dr=0;dr<poly_alloc.choose_modes.length;dr++){
			if((dr==sn)||(mouse_index==usermouse.clicked2d)){
				fc = block_darkest;
				bc = block_colour;
			}else{
				bc = block_darkest;
				fc = block_colour;
			}
			if(dr == sn){
				click_zone(open_dropdown, "choose", "choose", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
			}else{
				click_zone(set_block_mode, "choose", dr, sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
			}
			lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
			lcd_main.message("frgb", fc);
			lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
			lcd_main.message("write", poly_alloc.choose_modes[dr]);	
			y_offset+=0.7*fontheight;			
		}
	}


	lcd_main.message("paintrect", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2 - 3.3 * fontheight, 0.6*fontheight + y_offset, block_darkest);
	lcd_main.message("moveto", sidebar.x2 - 7.4 * fontheight, fontheight * 0.4 + y_offset);
	lcd_main.message("frgb", block_dark);
	lcd_main.message("write", "steal mode");
	click_zone(open_dropdown, "steal", "steal", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, mouse_index, 1);
	if(sidebar.dropdown!="steal"){
		if (usermouse.clicked2d == mouse_index) {
			bc = block_colour;
			fc = block_darkest;
		} else {
			bc = block_darkest;
			fc = block_colour;
		}
		click_zone(open_dropdown, "steal", "steal", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
		lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
		lcd_main.message("frgb", fc);
		lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
		lcd_main.message("write", blocks.get("blocks[" + block + "]::poly::steal_mode"));
		lcd_main.message("paintpoly", sidebar.x2 - 4*fo1, y_offset + 2.5*fo1, sidebar.x2 - fo1, y_offset + 2.5*fo1, sidebar.x2 - 2.5*fo1, y_offset + 4*fo1, sidebar.x2 - 4*fo1, y_offset + 2.5*fo1);				
		y_offset += 0.7 * fontheight;
	}else{
		var sel = blocks.get("blocks[" + block + "]::poly::steal_mode");
		var sn = poly_alloc.steal_modes.indexOf(sel);
		for(var dr=0;dr<poly_alloc.steal_modes.length;dr++){
			if((dr==sn)||(mouse_index==usermouse.clicked2d)){
				fc = block_darkest;
				bc = block_colour;
			}else{
				bc = block_darkest;
				fc = block_colour;
			}
			if(dr == sn){
				click_zone(open_dropdown, "steal", "steal", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
			}else{
				click_zone(set_block_mode, "steal", dr, sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
			}
			lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
			lcd_main.message("frgb", fc);
			lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
			lcd_main.message("write", poly_alloc.steal_modes[dr]);	
			y_offset+=0.7*fontheight;			
		}
	}

	if (usermouse.clicked2d == mouse_index) {
		bc = block_colour;
		fc = block_darkest;
	} else {
		bc = block_darkest;
		fc = block_colour;
	}
	lcd_main.message("paintrect", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2 - 3.3 * fontheight, 0.6*fontheight + y_offset, block_darkest);
	lcd_main.message("moveto", sidebar.x2 - 7.4 * fontheight, fontheight * 0.4 + y_offset);
	lcd_main.message("frgb", block_dark);
	lcd_main.message("write", "return stolen");
	lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
	lcd_main.message("frgb", fc);
	lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
	lcd_main.message("write", (blocks.get("blocks[" + block + "]::poly::return_mode") == 1) ? "on" : "off");
	click_zone(cycle_block_mode, block, "return", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
	y_offset += 0.7 * fontheight;

	if (blocktypes.contains(block_name + "::latching_enable")) {
		lcd_main.message("paintrect", sidebar.x2 - 7.6 * fontheight, y_offset, sidebar.x2-fontheight*3.3, 0.6*fontheight + y_offset, block_darkest);
		lcd_main.message("moveto", sidebar.x2 - 7.4 * fontheight, fontheight * 0.4 + y_offset);
		lcd_main.message("frgb", block_dark);
		lcd_main.message("write", "parameter latching mode");
		click_zone(open_dropdown, "latching", "latching", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
		if(sidebar.dropdown!="latching"){
			if (usermouse.clicked2d == mouse_index) {
				bc = block_colour;
				fc = block_darkest;
			} else {
				bc = block_darkest;
				fc = block_colour;
			}
			click_zone(open_dropdown, "latching", "latching", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
			lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
			lcd_main.message("frgb", fc);
			lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
			lcd_main.message("write", latching_modes[blocks.get("blocks[" + block + "]::poly::latching_mode")]);
			lcd_main.message("paintpoly", sidebar.x2 - 4*fo1, y_offset + 2.5*fo1, sidebar.x2 - fo1, y_offset + 2.5*fo1, sidebar.x2 - 2.5*fo1, y_offset + 4*fo1, sidebar.x2 - 4*fo1, y_offset + 2.5*fo1);				
			y_offset += 0.7 * fontheight;
		}else{
			var sn = blocks.get("blocks[" + block + "]::poly::latching_mode");
			//var sn = poly_alloc.latching_modes.indexOf(sel);
			for(var dr=0;dr<latching_modes.length;dr++){
				if((dr==sn)||(mouse_index==usermouse.clicked2d)){
					fc = block_darkest;
					bc = block_colour;
				}else{
					bc = block_darkest;
					fc = block_colour;
				}
				if(dr == sn){
					click_zone(open_dropdown, "latching", "latching", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
				}else{
					click_zone(set_block_mode, "latching", dr, sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.7*fontheight + y_offset, mouse_index, 1);
				}
				lcd_main.message("paintrect", sidebar.x2 - 3.2 * fontheight, y_offset, sidebar.x2, 0.6*fontheight + y_offset, bc);
				lcd_main.message("frgb", fc);
				lcd_main.message("moveto", sidebar.x2 - 3 * fontheight, fontheight * 0.4 + y_offset);
				lcd_main.message("write", latching_modes[dr]);	
				y_offset+=0.7*fontheight;			
			}
		}
	}
}

function draw_resource_monitor_page() {
	y_offset = 9 - sidebar.scroll.position;
	if (sidebar.mode != sidebar.lastmode) {
		//audio_poly.message("setvalue",0,"report_mutes");
		sidebar.lastmode = sidebar.mode;
		audio_to_data_poly.message("setvalue", 0, "vis_scope", 0);
		remove_midi_scope();
		redraw_flag.targets = [];
	}
	lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, fontheight + y_offset, menudarkest);
	click_zone(set_sidebar_mode, "none", null, sidebar.x, y_offset, sidebar.x2, fontheight + y_offset, mouse_index, 1);
	lcd_main.message("frgb", menucolour);
	lcd_main.message("moveto", sidebar.x + fontheight * 0.2, fontheight * 0.75 + y_offset);
	lcd_main.message("write", "resource monitor");
	y_offset += 1.1 * fontheight;
	lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x2, 4 * fontheight + y_offset, menudarkest);
	var p = (cpu_meter.pointer + 1) & 255;
	var st = (sidebar.x2 - sidebar.x) / 128;
	var tx = sidebar.x, ty = 0, tyy;
	lcd_main.message("frgb", menucolour);
	for (var i = 128; i--;) {
		tyy = y_offset + 4 * fontheight * (1 - cpu_meter.peak[p] * 0.01);
		ty = y_offset + 4 * fontheight * (1 - cpu_meter.avg[p] * 0.01);
		lcd_main.message("moveto", tx, tyy);
		lcd_main.message("lineto", tx, ty);
		tx += st;
		p = (p + 1) & 127;
	}
	tx = sidebar.x;
	lcd_main.message("frgb", 200, 200, 200);
	for (var i = 128; i--;) {
		var c = cpu_meter.fps[p] * 0.0333333333;
		if (isNaN(c)) c = 0;
		if (c > 1) c = 1;
		ty = y_offset + (4 * fontheight - 1) * (1 - c);
		lcd_main.message("setpixel", tx, ty, 100, 100, 200);
		//lcd_main.message("lineto",tx, ty+1);
		tx += st;
		p = (p + 1) & 127;
	}
	wm = (sidebar.width - 18) / 15;
	tx = sidebar.x;
	y_offset += 5.1 * fontheight;
	lcd_main.message("moveto", sidebar.x, y_offset - 0.5 * fontheight);
	lcd_main.message("frgb", menucolour);
	if(cpu_meter.midi_message_rate>0){
		lcd_main.message("write", "message rate: " + cpu_meter.midi_message_rate +" /s" );
		y_offset += fontheight;
		lcd_main.message("moveto", sidebar.x, y_offset - 0.5 * fontheight);
	}
	lcd_main.message("write", "blocks");
	var bfree = MAX_BLOCKS;
	var oy = y_offset - 0.5 * fontheight;
	var voicecolours = [];
	var voiceselect = [];
	var voiceparent = [];
	var voiceno = []; //these are for building a reverse of the voicemap dict

	for (var i = 0; i < MAX_BLOCKS; i++) {
		var c = menudarkest;
		if (blocks.contains("blocks[" + i + "]::space::colour")) {
			c = blocks.get("blocks[" + i + "]::space::colour");
			bfree--;
			if (voicemap.contains(i)) {
				var tva = voicemap.get(i);
				if (!Array.isArray(tva)) tva = [tva];
				for (tv = tva.length - 1; tv >= 0; tv--) {
					voicecolours[tva[tv]] = c;
					voiceparent[tva[tv]] = i;
					voiceno[tva[tv]] = tv;
					if ((sidebar.selected_voice == -1) || (sidebar.selected_voice == tv)) voiceselect[tva[tv]] = selected.block[i];
				}
			}
		}
		if (selected.block[i]) lcd_main.message("paintrect", tx - 4, y_offset - 4, tx + 22, y_offset + 22, menucolour);
		lcd_main.message("paintrect", tx, y_offset, tx + 18, y_offset + 18, c);
		click_zone(cpu_select_block, -1, i, tx - 4, y_offset - 4, tx + 22, y_offset + 22, mouse_index, 1);
		tx += wm;
		if (tx > mainwindow_width - 18) {
			tx = sidebar.x;
			y_offset += wm;
		}
	}
	lcd_main.message("moveto", sidebar.x + 6 * fontheight, oy);
	lcd_main.message("frgb", menucolour);
	lcd_main.message("write", bfree, "free");
	lcd_main.message("moveto", sidebar.x, y_offset + 0.5 * fontheight);
	oy = y_offset + 0.5 * fontheight;
	lcd_main.message("write", "note voices", MAX_NOTE_VOICES);
	bfree = MAX_NOTE_VOICES;
	tx = sidebar.x;
	y_offset += 1.1 * fontheight;
	for (var i = 0; i < MAX_NOTE_VOICES; i++) {
		var c = menudarkest;
		var rectype = "paintrect";
		if (note_patcherlist[i] == 'recycling') {
			rectype = "framerect";
		} else if (note_patcherlist[i] != 'blank.note') {
			c = menucolour;
			bfree--;
		}
		if (Array.isArray(voicecolours[i])) c = voicecolours[i];
		if (voiceselect[i]) lcd_main.message("paintrect", tx - 4, y_offset - 4, tx + 22, y_offset + 22, menucolour);
		lcd_main.message(rectype, tx, y_offset, tx + 18, y_offset + 18, c);
		click_zone(cpu_select_block, voiceno[i], voiceparent[i], tx - 4, y_offset - 4, tx + 22, y_offset + 22, mouse_index, 1);
		tx += wm;
		if (tx > mainwindow_width - 18) {
			tx = sidebar.x;
			y_offset += wm;
		}
	}
	lcd_main.message("moveto", sidebar.x + 6 * fontheight, oy);
	lcd_main.message("frgb", menucolour);
	lcd_main.message("write", bfree, "free");
	bfree = MAX_AUDIO_VOICES;
	lcd_main.message("moveto", sidebar.x, y_offset + 0.5 * fontheight);
	oy = y_offset + 0.5 * fontheight;
	lcd_main.message("write", "audio voices");
	tx = sidebar.x;
	y_offset += 1.1 * fontheight;
	for (var i = 0; i < MAX_AUDIO_VOICES; i++) {
		var c = menudarkest;
		var d = [0, 0, 0];
		var rectype = "paintrect";
		if (audio_patcherlist[i] == "recycling") {
			c = [0, 50, 0];
			d = [20, 80, 20];
			rectype = "framerect";
			voiceno[i + MAX_NOTE_VOICES] = i + MAX_NOTE_VOICES;
			voiceparent[i + MAX_NOTE_VOICES] = -1;
		} else if (audio_patcherlist[i] != "blank.audio") {
			c = menucolour;
			rectype = "paintrect";
			bfree--;
			if (Array.isArray(voicecolours[i + MAX_NOTE_VOICES])) c = voicecolours[i + MAX_NOTE_VOICES];
			if (mutemap.peek(1, i + 1)) {
				c = [c[0] * 0.5, c[1] * 0.5, c[2] * 0.5];
			}
		}
		if (voiceselect[i + MAX_NOTE_VOICES]) lcd_main.message("paintrect", tx - 4, y_offset - 4, tx + 22, y_offset + 22, menucolour);
		lcd_main.message(rectype, tx, y_offset, tx + 18, y_offset + 18, c);
		click_zone(cpu_select_block, voiceno[i + MAX_NOTE_VOICES], voiceparent[i + MAX_NOTE_VOICES], tx - 4, y_offset - 4, tx + 22, y_offset + 22, mouse_index, 1);
		if (mutemap.peek(1, i + 1)) {
			lcd_main.message("frgb", d);
			lcd_main.message("moveto", tx + 2, y_offset + 16);
			lcd_main.message("lineto", tx + 16, y_offset);
		}
		tx += wm;
		if (tx > mainwindow_width - 18) {
			tx = sidebar.x;
			y_offset += wm;
		}
	}
	lcd_main.message("moveto", sidebar.x + 6 * fontheight, oy);
	lcd_main.message("frgb", menucolour);
	lcd_main.message("write", bfree, "free");
}

function draw_automap_headers(sx, block) {
	if ((automap.already_k == 0)&&((automap.mapped_k>-1) || ((automap.available_k_block>-1)&&(sidebar.mode=="block")&&(automap.mapped_k==-1)))){
		//DRAW KEYBOARD AUTOMAP HEADER LINE
		click_zone(automap_k_click, -1, -1, sidebar.x, y_offset, sidebar.x + 22, y_offset + fontheight * 0.5, mouse_index, 1);
		if (!usermouse.ctrl && (usermouse.clicked2d == mouse_index - 1) &&(automap.mapped_k>-1)) {
			lcd_main.message("frgb", automap.colours_k.colour);
			lcd_main.message("paintrect", sidebar.x + fo1, y_offset + 2.5 * fo1, sidebar.x + 22 - fo1, y_offset + fontheight * 0.45, automap.colours_k.colour);
			lcd_main.message("moveto", sidebar.x + 1.5 * fo1, y_offset + (2.5 - 1.5 * automap.lock_k) * fo1);
			lcd_main.message("lineto", sidebar.x + 1.5 * fo1, y_offset + fo1 * (1 - 0.5 * automap.lock_k));
			lcd_main.message("lineto", sidebar.x + 20 - 1.5 * fo1, y_offset + fo1 * (1 - 0.5 * automap.lock_k));
			lcd_main.message("lineto", sidebar.x + 20 - 1.5 * fo1, y_offset + 2.5 * fo1);
			sx = sidebar.x + 26 + 2.4 * fontheight;
		} else {
			if(automap.mapped_k>-1){
				if (automap.lock_k) {
					lcd_main.message("frgb", automap.colours_k.colour);
				} else {
					lcd_main.message("frgb", automap.colours_k.dark);
				}
			}else{
				lcd_main.message("frgb", greydark);
			}
			lcd_main.message("framerect", sidebar.x, y_offset, sidebar.x + 22, y_offset + fontheight * 0.5);
			var tmp = y_offset + 0.25 * fontheight - 2;
			var tbt = y_offset + 0.5 * fontheight - 2;
			lcd_main.message("moveto", sidebar.x + 4, y_offset);
			lcd_main.message("lineto", sidebar.x + 4, tmp);
			lcd_main.message("moveto", sidebar.x + 6, y_offset);
			lcd_main.message("lineto", sidebar.x + 6, tbt);
			lcd_main.message("moveto", sidebar.x + 8, y_offset);
			lcd_main.message("lineto", sidebar.x + 8, tmp);
			lcd_main.message("moveto", sidebar.x + 12, y_offset);
			lcd_main.message("lineto", sidebar.x + 12, tmp);
			lcd_main.message("moveto", sidebar.x + 14, y_offset);
			lcd_main.message("lineto", sidebar.x + 14, tbt);
			lcd_main.message("moveto", sidebar.x + 16, y_offset);
			lcd_main.message("lineto", sidebar.x + 16, tmp);
			if(automap.mapped_k==-1){
				lcd_main.message("moveto", sidebar.x + 26, y_offset + 0.2 * fontheight);
				lcd_main.message("write", "automap");
				lcd_main.message("moveto", sidebar.x + 26, y_offset + 0.4 * fontheight);
				lcd_main.message("write", "off");
				sx = sidebar.x + 26 + 2.4 * fontheight;
				click_zone(enable_automap_k, null, automap.mapped_k, sidebar.x + 24, y_offset, sx - 2, y_offset + fontheight * 0.5, mouse_index, 1);
			}else if(automap.lock_k && block != automap.mapped_k) {
				var labl = blocks.get("blocks[" + automap.mapped_k + "]::label");
				sx = sidebar.x + 26 + (0.1 + labl.length * 0.16) * fontheight;
				//lcd_main.message("paintrect", sidebar.x + fontheight * 2.1, y_offset, sx - fo1, y_offset + fontheight * 0.5, automap.colours_k.darkest);
				lcd_main.message("frgb", automap.colours_k.dark);
				lcd_main.message("moveto", sidebar.x + 26, y_offset + 0.2 * fontheight);
				lcd_main.message("write", "locked to");
				lcd_main.message("frgb", automap.colours_k.colour);
				lcd_main.message("moveto", sidebar.x + 26, y_offset + 0.4 * fontheight);
				lcd_main.message("write", labl);
				click_zone(select_block, null, automap.mapped_k, sidebar.x + 24, y_offset, sx - 2, y_offset + fontheight * 0.5, mouse_index, 1);
			} else {
				lcd_main.message("frgb", automap.colours_k.dark);
				lcd_main.message("moveto", sidebar.x + 26, y_offset + 0.4 * fontheight);
				if(automap.lock_k){
					lcd_main.message("write", "locked to:");
					sx = sidebar.x + 26 + 1.8 * fontheight;
				}else{
					lcd_main.message("write", "automapped to:");
					sx = sidebar.x + 26 + 2.4 * fontheight;
				}	
			}
		}
		if(automap.mapped_k>-1){
			var midiins = blocktypes.get(blocks.get("blocks[" + automap.mapped_k + "]::name") + "::connections::in::midi");
			if (!Array.isArray(midiins)) midiins = [midiins];	
			var linewrap=0;
			if(sidebar.dropdown != "automap_k_input"){
				var bw2 = fontheight * (0.8 + midiins[automap.inputno_k].length / 7);
				var ex = sx + bw2 - fo1;
				if(midiins.length>1){
					lcd_main.message("paintrect", sx, y_offset, ex, y_offset + fontheight * 0.5, automap.colours_k.dark);
					lcd_main.message("frgb", automap.colours_k.colour);
					lcd_main.message("paintpoly", ex - 4*fo1, y_offset + 2*fo1, ex - fo1, y_offset + 2*fo1, ex - 2.5*fo1, y_offset + 3.5*fo1, ex - 4*fo1, y_offset + 2*fo1);				
					click_zone(open_dropdown, "automap_k_input", "automap_k_input", sx, y_offset, ex, y_offset + fontheight * 0.5, mouse_index, 1);
				}else{
					lcd_main.message("paintrect", sx, y_offset, ex, y_offset + fontheight * 0.5, automap.colours_k.darkest);
					lcd_main.message("frgb", automap.colours_k.dark);				
				}
				lcd_main.message("moveto", sx + fo1, y_offset + 0.4 * fontheight);
				lcd_main.message("write", midiins[automap.inputno_k]);			
				sx+=bw2;
			}else{
				var ml = 0;
				for (var ti = 0; ti < midiins.length; ti++) ml = Math.max(ml,midiins[ti].length);
				var bw2 = fontheight * (0.3 + ml / 7);
				var ex = sx + bw2 - fo1;
				linewrap = 1;
				for (var ti = 0; ti < midiins.length; ti++) {
					if (ti == automap.inputno_k) {
						lcd_main.message("paintrect", sx, y_offset, ex, y_offset + fontheight * 0.5, automap.colours_k.dark);
						lcd_main.message("frgb", automap.colours_k.colour);
						click_zone(open_dropdown, null, null, sx, y_offset, ex, y_offset + fontheight * 0.5, mouse_index, 1);
					} else {
						lcd_main.message("paintrect", sx, y_offset, ex, y_offset + fontheight * 0.5, automap.colours_k.darkest);
						click_zone(set_automap_k_input, ti, null, sx, y_offset, ex, y_offset + fontheight * 0.5, mouse_index, 1);
						lcd_main.message("frgb", automap.colours_k.dark);
					}
					lcd_main.message("moveto", sx + fo1, y_offset + 0.4 * fontheight);
					lcd_main.message("write", midiins[ti]);
					y_offset+=fontheight*0.6;
				}
				sx+=bw2;
			}
			if(linewrap) y_offset-=fontheight*0.6;//sx = sidebar.x; 
			if(usermouse.caps){
				var bw2 = fo1 * 12;
				var ex = sx + bw2 - fo1;
				lcd_main.message("paintrect", sx, y_offset, ex, y_offset + fontheight * 0.5, automap.colours_k.darkest);
				click_zone(qwertymidi_octave, null, null, sx, y_offset, ex, y_offset + fontheight * 0.5, mouse_index, 2);
				lcd_main.message("frgb", automap.colours_k.dark);
				lcd_main.message("moveto", sx + fo1, y_offset + 0.25 * fontheight);
				lcd_main.message("write", "octave");
				lcd_main.message("frgb", automap.colours_k.colour);
				lcd_main.message("moveto", sx + fo1, y_offset + 0.4 * fontheight);
				var oct = parameter_value_buffer.peek(1,MAX_PARAMETERS * automap.available_k_block + 9)
				oct = Math.floor(oct * 9.99);
				lcd_main.message("write", oct-2);
				sx += bw2;		
			}
			if(playing){
				var bw2 = fo1 * 10;
				var ex = sx + bw2 - fo1;		
				lcd_main.message("framerect", sx, y_offset, ex, y_offset + fontheight * 0.5, automap.colours_k.dark);
				click_zone(start_keyboard_looper, null, null, sx, y_offset, ex, y_offset + fontheight * 0.5, mouse_index, 2);
				//lcd_main.message("frgb", automap.colours_k.dark);
				lcd_main.message("moveto", sx + fo1, y_offset + 0.4 * fontheight);
				lcd_main.message("write", "loop");
				sx += bw2;		
			}
			var bw2 = fo1 * 15;
			var ex = sx + bw2 - fo1;		
			lcd_main.message("framerect", sx, y_offset, ex, y_offset + fontheight * 0.5, automap.colours_k.dark);
			click_zone(reify_automap_k, null, null, sx, y_offset, ex, y_offset + fontheight * 0.5, mouse_index, 2);
			//lcd_main.message("frgb", automap.colours_k.dark);
			lcd_main.message("moveto", sx + fo1, y_offset + 0.4 * fontheight);
			lcd_main.message("write", "connect");
			sx += bw2;	
			if(linewrap) sx = sidebar.x2;
		}
	}
	if ((automap.mapped_c != -1) || ((automap.voice_c>-1)&&(blocks.get("blocks["+sidebar.selected+"]::name")!="core.input.control.auto"))){
		if(sx!=sidebar.x){
			var chw = 26 + 4 + fontheight * (0.8 + 0.4 * (automap.mapped_c == -1));// * 1.2;
			if(automap.lock_c && block != automap.mapped_c) {
				var labl = blocks.get("blocks[" + automap.mapped_c + "]::label");
				chw += (0.1 + labl.length * 0.18) * fontheight;
			}
			if(sx+chw>sidebar.x2){
				sx = sidebar.x;
				y_offset+=0.6*fontheight;
			}else{
				sx = sidebar.x2 - chw;
			}
		}
		// DRAW AUTOMAP HEADER LINE
		var hf = 0.25 * fontheight;
		click_zone(automap_c_click, null, -1, sx, y_offset, sx + 22, y_offset + fontheight * 0.5, mouse_index, 1);
		if(!usermouse.ctrl && (usermouse.clicked2d == mouse_index - 1)) {
			lcd_main.message("frgb", automap.colours_c.colour);
			lcd_main.message("moveto", sx + 1.5 * fo1, y_offset + (2.5 - 1.5 * automap.lock_k) * fo1);
			lcd_main.message("lineto", sx + 1.5 * fo1, y_offset + fo1 * (1 - 0.5 * automap.lock_k));
			lcd_main.message("lineto", sx + 20 - 1.5 * fo1, y_offset + fo1 * (1 - 0.5 * automap.lock_k));
			lcd_main.message("lineto", sx + 20 - 1.5 * fo1, y_offset + 2.5 * fo1);
		} else {
			if(automap.mapped_c<0){
				lcd_main.message("frgb", greydark);
				lcd_main.message("moveto", sx+26, y_offset + 0.2 * fontheight);
				lcd_main.message("write", "automap");
				lcd_main.message("moveto", sx+26, y_offset + 0.4 * fontheight);
				lcd_main.message("write", "off");
			}else if (automap.lock_c) {
				lcd_main.message("frgb", automap.colours_c.colour);
			} else {
				lcd_main.message("frgb", automap.colours_c.dark);
			}
			lcd_main.message("framerect", sx, y_offset, sx + 22, y_offset + fontheight * 0.5);
			lcd_main.message("frameoval", sx + 13 - hf, y_offset + 4, sx + hf + 9, y_offset + hf + hf - 4);
			lcd_main.message("moveto", sx + 9, hf + y_offset - 1);
			lcd_main.message("lineto", sx + 0.106 * fontheight + 9, fo1 * 1.44 + y_offset);
		}
		sx += 26;
		if(automap.mapped_c>-1){
			if (automap.lock_c && block != automap.mapped_c) {
				var labl = blocks.get("blocks[" + automap.mapped_c + "]::label");
				//lcd_main.message("paintrect", sx + fontheight * 2.1, y_offset, sidebar.x2, y_offset + fontheight * 0.5, automap.colours_c.darkest);
				lcd_main.message("frgb", automap.colours_c.dark);
				lcd_main.message("moveto", sx, y_offset + 0.2 * fontheight);
				lcd_main.message("write", "locked to");
				lcd_main.message("frgb", automap.colours_c.colour);
				lcd_main.message("moveto", sx, y_offset + 0.4 * fontheight);
				lcd_main.message("write", labl);
				var osx = sx;
				sx += (0.1 + labl.length * 0.18) * fontheight;
				click_zone(select_block, null, automap.mapped_c, osx - 2, y_offset, sx, y_offset + fontheight * 0.5, mouse_index, 1);
			}
			lcd_main.message("frgb", automap.colours_c.dark);
			lcd_main.message("moveto", sx, y_offset + 0.2 * fontheight);
			lcd_main.message("write", "rows");
			lcd_main.message("frgb", automap.colours_c.colour);
			lcd_main.message("moveto", sx, y_offset + 0.4 * fontheight);
			lcd_main.message("write", automap.offset_c + 1, "-", automap.offset_c + automap.c_rows);
			click_zone(cycle_automap_offset, 1, null, sx - 2, y_offset, sidebar.x2, y_offset + 0.5 * fontheight, mouse_index, 1);
			sx += fontheight * 0.8;// * 1.2;
		}
	}

	if (automap.mapped_q != -1) {
		lcd_main.message("paintrect", sx, y_offset, sidebar.x2, y_offset + fontheight * 0.5, automap.colours_q.darkest); // [0]*0.5,automap.colours_q.darkest[1]*0.5,automap.colours_q.darkest[2]*0.5);
		var hf = 0.25 * fontheight;
		click_zone(automap_q_click, null, -1, sx, y_offset, sx + 22, y_offset + fontheight * 0.5, mouse_index, 1);
		if (!usermouse.ctrl && (usermouse.clicked2d == mouse_index - 1)) {
			lcd_main.message("frgb", automap.colours_q.colour);
			lcd_main.message("paintrect", sx + fo1, y_offset + 2.5 * fo1, sx + 22 - fo1, y_offset + fontheight * 0.45, automap.colours_q.colour);
			lcd_main.message("moveto", sx + 1.5 * fo1, y_offset + (2.5 - 1.5 * automap.lock_q) * fo1);
			lcd_main.message("lineto", sx + 1.5 * fo1, y_offset + fo1 * (1 - 0.5 * automap.lock_q));
			lcd_main.message("lineto", sx + 20 - 1.5 * fo1, y_offset + fo1 * (1 - 0.5 * automap.lock_q));
			lcd_main.message("lineto", sx + 20 - 1.5 * fo1, y_offset + 2.5 * fo1);
		} else {
			if (automap.lock_q) {
				lcd_main.message("frgb", automap.colours_q.colour);
			} else {
				lcd_main.message("frgb", automap.colours_q.dark);
			}
			lcd_main.message("framerect", sx, y_offset, sx + 22, y_offset + fontheight * 0.5);
			lcd_main.message("frameoval", sx + 13 - hf, y_offset + 4, sx + hf + 9, y_offset + hf + hf - 4);
			lcd_main.message("paintrect", sx + 5, hf + y_offset, sx + 17, y_offset + hf * 1.7);
			lcd_main.message("paintrect", sx + 9, hf + y_offset, sx + 13, y_offset + hf * 1.7, automap.colours_q.darkest);
		}
		sx += 26;
		var mqb = automap.mapped_q.split(".")[0];
		if (automap.lock_q && block != mqb) {
			var labl = blocks.get("blocks[" + mqb + "]::label");
			lcd_main.message("paintrect", sx + fontheight * 2.1, y_offset, sidebar.x2, y_offset + fontheight * 0.5, automap.colours_q.darkest);
			lcd_main.message("frgb", automap.colours_q.dark);
			lcd_main.message("moveto", sx, y_offset + 0.2 * fontheight);
			lcd_main.message("write", "locked to");
			lcd_main.message("frgb", automap.colours_q.colour);
			lcd_main.message("moveto", sx, y_offset + 0.4 * fontheight);
			lcd_main.message("write", labl);
			var osx = sx;
			sx += (0.1 + labl.length * 0.18) * fontheight;
			click_zone(select_block, null, mqb, osx - 2, y_offset, sx, y_offset + fontheight * 0.5, mouse_index, 1);
		}
		lcd_main.message("paintrect", sx, y_offset, sidebar.x2, y_offset + fontheight * 0.5, automap.colours_q.darkest[0] * 0.5, automap.colours_q.darkest[1] * 0.5, automap.colours_q.darkest[2] * 0.5);
	}

	if (sx != sidebar.x) y_offset += fontheight * 0.6;
	//return y_offset;
}

function set_automap_q(v) {
	for (var qc = 0; qc < automap.mapped_q_channels.length; qc++) {
		for (var oc = 0; oc < automap.available_q.length; oc++) {
			matrix.message(automap.mapped_q_channels[qc], MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+automap.available_q[oc]-1, v);
			//post("\nmatrix ", automap.mapped_q_channels[qc], MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+automap.available_q[oc]-1, v);
		}
	}
}

function remove_automaps(){
	if((automap.available_c != -1) && !automap.lock_c){
		if((automap.mapped_c > -0.01)){
			automap.mapped_c = -1;
			note_poly.message("setvalue", automap.available_c, "automapped", 0);
		}
	}
	if((automap.available_k != -1) && !automap.lock_k){
		if (automap.mapped_k != -1) {
			automap.mapped_k = -1;
			note_poly.message("setvalue", automap.available_k, "automapped", 0);
		}
	}
}

function remove_midi_scope(){
//	post("\nremove midi scope called",sidebar.scopes.midi,"vl",sidebar.scopes.midivoicelist);
	sidebar.scopes.midi = -1;
	sidebar.scopes.midivoicelist = [];
	sidebar.scopes.midioutlist = [];
}

function do_automap(type, voice, onoff, name){ // this is called from outside
	if(type=="controller"){
		if(onoff==0){
			note_poly.message("setvalue", automap.available_c,"automapped", 0);
			automap.available_c = -1;
			automap.mapped_c = -1;
		}else{
			automap.available_c = voice;
			automap.voice_c = voice;
			redraw_flag.flag |= 2;
		} 
		automap.devicename_c = name;
		if(io_dict.contains("controllers::"+automap.devicename_c+"::rows")){
			automap.c_rows = io_dict.get("controllers::"+automap.devicename_c+"::rows");
			automap.c_cols = io_dict.get("controllers::"+automap.devicename_c+"::columns");
		}
	}else if(type=="keyboard"){
		if(onoff==0){
			if(automap.mapped_k!=-1){
				note_poly.message("setvalue", automap.available_k,"automapped", 0);
				automap.mapped_k = -1;
			}
			automap.available_k = -1;
		}else{
			automap.available_k = voice;
			var k = voicemap.getkeys();
			if(k!=null){
				for(var i = 0; i<k.length;i++){
					var v = voicemap.get(k[i]);
					if(!Array.isArray(v))v=[v];
					for(var vl = v.length-1;vl>=0;vl--){
						if(v[vl]==voice-1) automap.available_k_block = k[i];
					}
				}
			}
		}
	}
}


