function set_display_mode(mode,t){
	if(mode == "custom"){
		custom_block = +t;
		ui_poly.setvalue( custom_block+1, "setup", 9,18+fontheight*1.1, sidebar.x-9, mainwindow_height-9,mainwindow_width);
	}else if(mode == "custom_fullscreen"){
		custom_block = +t;
		ui_poly.setvalue( custom_block+1, "setup", 9,18+fontheight*1.1, mainwindow_width-9, mainwindow_height-9,mainwindow_width);
	}else if(mode == "flocks"){
		if(is_empty(flocklist)){
			mode = "blocks"; //only show flocks if there are flocks
			redraw_flag.flag=4;
		}
	}
	var blocks_enabled=(mode=="blocks");
	if(displaymode!=mode){
		if((mode!="blocks")&&(mode!="panels")) sidebar.mode="none";
		if(mode == "blocks") blocks_enabled=1;
		if(mode=="flocks"){
			flock_axes(1);
			blocks_enabled=1; //really you could/should just show the right ones for the flock view here? or maybe flock view does it TODOTODO
		}else{
			flock_axes(0);
		}
		if(mode=="block_menu") {
			menu_camera_scroll=0;
		}else{
			//hide_block_menu();
		}
		displaymode=mode;
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
	}
	blocks_enable(blocks_enabled);
}

function camera(){
	if(displaymode == "custom"){
		messnamed("camera_control", "anim", "moveto", [0,-95,0], ANIM_TIME);
	}else if(displaymode == "block_menu"){
		messnamed("camera_control", "position", [2,-93,menu_camera_scroll]); //"anim", "moveto", [0,-95,0], 0.2);
		messnamed("camera_control", "rotatexyz" , 0, 0, 0);
		messnamed("camera_control", "direction", 0, -1, 0);		
	}else if(displaymode == "blocks"){ //this could be animated too?
		messnamed("camera_control", "rotatexyz" , 0, 0, 0);
		messnamed("camera_control", "direction", 0, 0, -1);
		messnamed("camera_control","anim", "moveto",  camera_position, ANIM_TIME);
//		messnamed("camera_control", "lookat", Math.max(Math.min(camera_position[0],blocks_page.rightmost), blocks_page.leftmost), Math.max(Math.min(camera_position[1],blocks_page.highest),blocks_page.lowest), -1);
		if(sidebar.mode=="file_menu"){
			camera_position[2] += 50;
			camera_position[0] = 8+Math.max(camera_position[0], blocks_page.rightmost);
			messnamed("camera_control", "anim", "moveto", camera_position, ANIM_TIME);
		}
	}else if(displaymode == "connection_menu"){
		messnamed("camera_control", "anim", "moveto", camera_position[0],camera_position[1],-20,ANIM_TIME);
	}else if(displaymode == "waves"){
		messnamed("camera_control", "anim", "moveto", [0,-95,0], ANIM_TIME);
	}else if((displaymode == "panels")||(displaymode == "panels_edit")){
		messnamed("camera_control", "anim", "moveto", [0,-95,0], ANIM_TIME);		
	}else if(displaymode == "flocks"){
		messnamed("camera_control", "anim", "moveto", [flock_cube_size*1.5,1.5*flock_cube_size,5+1.5*flock_cube_size], ANIM_TIME);
		messnamed("camera_control", "direction", -0.572078, -0.667424, -0.476731);
	}
}

function redraw(){
	redraw_flag.flag = 0;
	if(displaymode == "connection_menu"){
		draw_connection_menu();
	}else if(displaymode == "blocks"){
		meters_enable=0;
		draw_blocks();
		clear_screens();
		draw_topbar();
		draw_sidebar();
		//outlet(8,"bang");
		meters_enable=1;
	}else if(displaymode == "block_menu"){
		draw_block_menu();
		//outlet(8,"bang");	
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
		draw_panels();
		//outlet(8,"bang");
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
		//outlet(8,"bang");	
		//draw_sidebar();
	}else if(displaymode == "waves"){
		sidebar.mode="none";
		clear_screens();
		draw_topbar();
		draw_waves();
		//outlet(8,"bang");		
	}
}


function get_hw_meter_positions(){
	var x=0;
	meter_positions = [];
	var positions = []; //hw input meter positions
	for(i=0;i<MAX_USED_AUDIO_INPUTS;i++){
		if(input_used[i]) {
			positions[positions.length] = [sidebar.meters.startx + x * sidebar.meters.spread,9,8+fontheight,1+(MAX_AUDIO_VOICES*NO_IO_PER_BLOCK + i)];
			x++;
		}
	}
	meter_positions[0] = [menucolour,menudarkest,positions];
	x++;
	positions = []; //hw output meter positions
	for(i=0;i<MAX_USED_AUDIO_OUTPUTS;i++){
		if(output_used[i]){
			positions[positions.length] = [sidebar.meters.startx + x * sidebar.meters.spread,9,8+fontheight,1+(MAX_AUDIO_VOICES*NO_IO_PER_BLOCK + i+MAX_AUDIO_INPUTS)];
			x++;
		} 
	}
	meter_positions[1] = [menucolour,menudarkest,positions];
}

function draw_panels(){
	panels_custom = [];
	var i,b,x=0,y=0,h;
	var statecount;
	var statelist = states.getkeys();
	var block_name;
	var block_is_in_custom_order=[];
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

	for(i=0;i<panels_order.length;i++){
		b = panels_order[i];
		//work out height first
		h=1; //title, floating blocks?, mute
		statecount=0;
		for(var state in statelist){
			if(state!="current"){
				var statecontents = states.get("states::"+state);
				if(!is_empty(statecontents)){
					if(statecontents.contains(b)){
						statecount++;
					}
				}
			}
		}
		
		if(statecount>0) h+=1; //if it has states
		block_name = blocks.get("blocks["+b+"]::name");
//			block_type = blocks.get("blocks["+b+"]::type");
		var has_params = 0;
		if(blocks.contains("blocks["+b+"]::panel::parameters")){
			h+=2; //if it has panelparams
			has_params = 1;
		} 
		
		var has_ui = 0;
		if(blocktypes.get(block_name+"::block_ui_patcher")!="blank.ui"){
			has_ui = 1;
			h+=4;
			if(has_params) h-=0.5;
			panels_custom[panels_custom.length] = b;
		}

		if(18+(y+h)*fontheight>mainwindow_height){
			x++;
			y=0;
			if(x>=MAX_PANEL_COLUMNS){
				post("\npanels list overflowed, TODO scroll or autosize!");
				MAX_PANEL_COLUMNS++;
				redraw.redraw_flag=4;
				return(1);
			}
		}

		if(displaymode=="panels_edit"){
			draw_panel_edit(x,y,h,b);
		}else{
			draw_panel(x,y,h,b,statecount>0,has_params,has_ui);
		}
	
		y+=h+0.1;

	}
	if((x<MAX_PANEL_COLUMNS-1)&&(MAX_PANEL_COLUMNS>3)){
		MAX_PANEL_COLUMNS--;
		redraw.redraw_flag=4;
	}
}

function draw_panel_edit(x,y,h,b){
	var i,cx,cy,r;
//	var block_name=blocks.get("blocks["+b+"]::name");
	var block_colour = blocks.get("blocks["+b+"]::space::colour");
	block_colour = [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
//	var block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
	var block_darkest = [block_colour[0]*bg_dark_ratio, block_colour[1]*bg_dark_ratio, block_colour[2]*bg_dark_ratio];
	var column_width = mainwindow_width/MAX_PANEL_COLUMNS;
	if(sidebar.mode != "none") column_width = sidebar.x / MAX_PANEL_COLUMNS;
	var x1 = 9 + x * column_width;
	column_width -= 9;
	var x2 = x1 + column_width;
	setfontsize(fontheight/3.2);
	lcd_main.message("paintrect",x1,18+y*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,block_darkest);
	lcd_main.message("moveto",fontheight*0.2+x1,18+y*fontheight+fontheight*1.5);
	lcd_main.message("frgb", 255, 255, 255);
	lcd_main.message("write", blocks.get("blocks["+b+"]::label"));
	cy = 18+y*fontheight+1.5*fontheight + column_width / 6;
	for(i=0;i<3;i++){
		cx = x1 + (i + 0.5) *column_width / 3;
		r = column_width /8;
		lcd_main.message("paintoval", cx-r,cy-r,cx+r,cy+r, menucolour[2],menucolour[1],menucolour[0]);
		//outlet(8,"paintoval", cx-r,cy-r,cx+r,cy+r, mouse_index,1);
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

function draw_panel(x,y,h,b,has_states,has_params,has_ui){
	var i;
	var block_name=blocks.get("blocks["+b+"]::name");
	var block_colour = blocks.get("blocks["+b+"]::space::colour");
	block_colour = [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
	var block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
	var block_darkest = [block_colour[0]*bg_dark_ratio, block_colour[1]*bg_dark_ratio, block_colour[2]*bg_dark_ratio];
	var column_width = mainwindow_width/MAX_PANEL_COLUMNS;
	if(sidebar.mode != "none") column_width = (sidebar.x - 9) / MAX_PANEL_COLUMNS;
	var x1 = 9 + x * column_width;
	column_width -= 9;
	var x2 = x1+column_width;
	cur_font_size=0;
	setfontsize(fontheight/3.2);
	lcd_main.message("paintrect",x1,18+y*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,block_darkest);
	click_rectangle(x1,18+y*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,mouse_index,1);
	mouse_click_actions[mouse_index] = select_block;
	mouse_click_parameters[mouse_index] = b;
	mouse_click_values[mouse_index] = b;
	mouse_index++;
	
	lcd_main.message("moveto",fontheight*0.2+x1,18+y*fontheight+fontheight*1.5);
	lcd_main.message("frgb", 255, 255, 255);
	lcd_main.message("write", blocks.get("blocks["+b+"]::label"));
	
	if(blocks.get("blocks["+b+"]::mute")){
		lcd_main.message("paintrect", x2-fontheight*1, 18+y*fontheight+fontheight*1.1,x2-fontheight*0.1, 18+y*fontheight+fontheight*1.9 ,128,128,128);
		lcd_main.message("frgb", block_darkest);
	}else{
		lcd_main.message("paintrect", x2-fontheight*1, 18+y*fontheight+fontheight*1.1,x2-fontheight*0.1, 18+y*fontheight+fontheight*1.9 ,block_dark);
		lcd_main.message("frgb", 128,128,128);
	}
	click_rectangle( x2-fontheight*1, 18+y*fontheight+fontheight*1.1,x2-fontheight*0.1, 18+y*fontheight+fontheight*1.9 ,mouse_index,1);
	lcd_main.message("moveto", x2-fontheight*0.9, 18+y*fontheight+fontheight*1.7 );
	lcd_main.message("write", "mute");
	mouse_click_actions[mouse_index] = mute_particular_block;
	mouse_click_parameters[mouse_index] = b;
	mouse_click_values[mouse_index] = -1;
	mouse_index++;
	
	var has_meters=0;
	var mx=0;
	var mlist;
	var positions = []; 
	if(blocktypes.contains(block_name+"::connections::out::audio")){
		has_meters=1;
		mlist=blocktypes.get(block_name+"::connections::out::audio");
		var vmap = voicemap.get(b);
		if(typeof vmap == "number") vmap = [vmap];
		if(vmap !== 'null'){
			for(var vm=0;vm<vmap.length;vm++){
				for(i=0;i<mlist.length;i++){
					positions[positions.length] = [mx*sidebar.meters.spread, 18+y*fontheight+fontheight*1.1, 16+y*fontheight+fontheight*1.9, 1+((vmap[vm] - MAX_NOTE_VOICES)+MAX_AUDIO_VOICES*i)];
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
		
		for(state=0;state<MAX_STATES;state++){
			var statecontents = states.get("states::"+state);
			if(!is_empty(statecontents)){
				if(statecontents.contains(b)){
					c = config.get("palette::gamut["+Math.floor(state*cll)+"]::colour");
					lcd_main.message("paintrect",x1+(state/MAX_STATES)*column_width,18+(y+2)*fontheight,x1+((state+1)/MAX_STATES)*column_width,18+(y+2.9)*fontheight,c[0],c[1],c[2]);
					click_rectangle(x1+(state/MAX_STATES)*column_width,18+(y+2)*fontheight,x1+((state+1)/MAX_STATES)*column_width,18+(y+2.9)*fontheight,mouse_index,1);
					mouse_click_actions[mouse_index] = fire_block_state;
					mouse_click_parameters[mouse_index] = state;
					mouse_click_values[mouse_index] = b;
					mouse_index++;
				}
			}
		}
	}
	if(has_params){ //has panelparams
		panelslider_visible[b]=[];
		plist = blocks.get("blocks["+b+"]::panel::parameters");
		var params = blocktypes.get(block_name+"::parameters");
		if(typeof plist == "number") plist = [plist];
		for(var p=0;p<plist.length;p++){
			//lcd_main.message("paintrect", 9+(x+p/plist.length)*mainwindow_width/4,18+(y+2+has_states)*fontheight,7+(x+(p+1)/plist.length)*mainwindow_width/4,18+(y+3.9+has_states)*fontheight, block_colour[0], block_colour[1], block_colour[2]);
			//parameter_v_slider(x1+(p/plist.length)*column_width,18+(y+2+has_states)*fontheight,x1-2+((p+1)/plist.length)*column_width,18+(y+3.9+has_states)*fontheight, block_colour[0], block_colour[1], block_colour[2], mouse_index,b,plist[p],0);
			var p_type = params[plist[p]].get("type");
			//var p_values = params[plist[p]].get("values");
			var wrap = params[plist[p]].get("wrap");
			var namearr = params[plist[p]].get("name");
			namearr = namearr.split("_");
			var namelabely = 18+(y+2+has_states+0.4)*fontheight;
			var h_slider = 0;
			panelslider_visible[b][plist[p]]=panelslider_index;
			paramslider_details[panelslider_index]=[x1+(p/plist.length)*column_width,18+(y+2+has_states)*fontheight,x1-2+((p+1)/plist.length)*column_width,18+(y+3.9-0.5*has_ui+has_states)*fontheight, block_colour[0], block_colour[1], block_colour[2], mouse_index,b,plist[p],0 /* TODO ONEPERVOICE HERE << AND BIPOLAR TOO??>*/, namearr,namelabely,p_type,wrap,block_name,h_slider];
			labelled_parameter_v_slider(panelslider_index);
			if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")){
				//var pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*paramslider_details[panelslider_index][8]+paramslider_details[panelslider_index][9]);				
				//if it's a menu_b or menu_i store the next position in mouse_click_values
				// now stores the paramslider_details index, so you can look up type, get num values, etc etc, on click, more efficient.
				mouse_click_values[mouse_index] = panelslider_index; //(pv+1/p_values.length) % 1;
			}else{
				mouse_click_values[mouse_index] = "";
			}
			mouse_click_actions[mouse_index] = sidebar_parameter_knob;
			mouse_click_parameters[mouse_index] = [plist[p], b];
			mouse_index++;
			panelslider_index++;
		}
	}else{
		panelslider_visible[b]=[];
	}
	if(has_ui){
		click_rectangle( x1,18+(y+h-4)*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,mouse_index,1);
		mouse_click_actions[mouse_index] = set_display_mode;
		mouse_click_parameters[mouse_index] = "custom";
		mouse_click_values[mouse_index] = b;
		mouse_index++; //if the ui patcher doesn't make the area clickable, it clicks through to the full size ui
		ui_poly.setvalue( b+1, "setup", x1,18+(y+h-4)*fontheight+fontheight,x2,18+(y+h)*fontheight+fontheight*0.9,mainwindow_width);
	}
}

function draw_waves(){
	var num_slots = MAX_WAVES;//waves_dict.getsize("waves");
	var slot;
	var c=new Array(3);
	var slot_h;
//	if(num_slots==0){
//		num_slots=1;
//		slot_h = (mainwindow_height-fontheight*2-27);
//	}else{
	var bigsloth = mainwindow_height-fontheight*10.2-18; 
	if(waves.selected == -1){
		slot_h = (mainwindow_height-fontheight*1-27) / (num_slots);
	}else{
		if(waves_dict.contains("waves["+(waves.selected+1)+"]::name")){
			slot_h = (mainwindow_height-fontheight*1-27-bigsloth) / (num_slots);
		}else{
			slot_h = fontheight*1.1;
		}
	}
//	}
	setfontsize(fontheight/1.6);
	var colinc = config.getsize("palette::gamut") / (num_slots+1);
	var sloty = fontheight+18;
	for(slot=0;slot<(num_slots);slot++){
		if(waves_dict.contains("waves["+(slot+1)+"]::name")){
			if(slot==waves.selected){
				//draw controls bar and zoomed wave
				c=config.get("palette::gamut["+Math.floor(slot*colinc)+"]::colour");
				lcd_main.message("paintrect",9, sloty, mainwindow_width-9,sloty+0.9*fontheight,c[0],c[1],c[2]);

				c=config.get("palette::gamut["+Math.floor(1+slot*colinc)+"]::colour");
				draw_h_slider(9+fontheight*6,sloty+fontheight*0.1,9+fontheight*8.9,sloty+fontheight*0.7,c[0],c[1],c[2],mouse_index,waves_dict.get("waves["+(slot+1)+"]::start"));
				mouse_click_actions[mouse_index] = setup_waves;
				mouse_click_parameters[mouse_index] = [slot+1,"start"];
				mouse_click_values[mouse_index] = 0;
				mouse_index++;

				c=config.get("palette::gamut["+Math.floor(2+slot*colinc)+"]::colour");
				draw_h_slider(9+fontheight*9,sloty+fontheight*0.1,9+fontheight*11.9,sloty+fontheight*0.7,c[0],c[1],c[2],mouse_index,waves_dict.get("waves["+(slot+1)+"]::end"));
				mouse_click_actions[mouse_index] = setup_waves;
				mouse_click_parameters[mouse_index] = [slot+1,"end"];
				mouse_click_values[mouse_index] = 0;
				mouse_index++;

				c=config.get("palette::gamut["+Math.floor(3+slot*colinc)+"]::colour");
				draw_h_slider(9+fontheight*12,sloty+fontheight*0.1,9+fontheight*14.9,sloty+fontheight*0.7,c[0],c[1],c[2],mouse_index,waves_dict.get("waves["+(slot+1)+"]::divisions"));
				mouse_click_actions[mouse_index] = setup_waves;
				mouse_click_parameters[mouse_index] = [slot+1,"divisions"];
				mouse_click_values[mouse_index] = 0;
				mouse_index++;

				lcd_main.message("paintrect",mainwindow_width-9-3*fontheight,sloty+fontheight*0.1,mainwindow_width-9,sloty+fontheight*0.7,255,0,0);
				click_rectangle(mainwindow_width-9-3*fontheight,sloty+fontheight*0.1,mainwindow_width-9,sloty+fontheight*0.7,mouse_index,1);
				mouse_click_actions[mouse_index] = delete_wave;
				mouse_click_parameters[mouse_index] = slot;
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("frgb",menucolour);
				lcd_main.message("moveto",mainwindow_width-9-2.7*fontheight,sloty+fontheight*0.6);
				setfontsize(fontheight/3.2);
				lcd_main.message("textface","normal");
				lcd_main.message("write","delete");
				
				c=config.get("palette::gamut["+Math.floor(4+slot*colinc)+"]::colour");
				draw_stripe(9,sloty+fontheight*0.8,mainwindow_width-9,sloty+fontheight*1.3,c[0],c[1],c[2],slot+1,mouse_index);
				mouse_click_actions[mouse_index] = wave_stripe_click;
				mouse_click_parameters[mouse_index] = slot;
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("frgb",menucolour);//config.get("palette::gamut["+Math.floor(4+slot*colinc)+"]::colour"))
				lcd_main.message("moveto",18,sloty+fontheight*0.6);
				setfontsize(fontheight/2.4);
				lcd_main.message("textface","bold");
				lcd_main.message("write",slot+1,waves_dict.get("waves["+(slot+1)+"]::name"));
				lcd_main.message("moveto",9+6.3*fontheight,sloty+fontheight*0.6);
				setfontsize(fontheight/3.2);
				lcd_main.message("textface","normal");
				lcd_main.message("write","start");
				lcd_main.message("moveto",9+9.3*fontheight,sloty+fontheight*0.6);
				lcd_main.message("write","end");
				lcd_main.message("moveto",9+12.3*fontheight,sloty+fontheight*0.6);
				lcd_main.message("write","divisions:",Math.floor(1+(MAX_WAVES_SLICES-0.0001)*waves_dict.get("waves["+(slot+1)+"]::divisions")));
				
				draw_waveform(9,sloty+fontheight*1.3,mainwindow_width-9,sloty+bigsloth+fontheight*0.9,c[0],c[1],c[2],slot+1,mouse_index,2);
				mouse_click_actions[mouse_index] = zoom_waves;
				mouse_click_parameters[mouse_index] = slot;
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				
				sloty+=bigsloth;
			}else{
				c=config.get("palette::gamut["+Math.floor(3+slot*colinc)+"]::colour");
				draw_stripe(9,sloty,mainwindow_width-9,sloty+slot_h-fontheight*0.1,c[0],c[1],c[2],slot+1,mouse_index);
				mouse_click_actions[mouse_index] = wave_stripe_click;
				mouse_click_parameters[mouse_index] = slot;
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("frgb",menucolour);//config.get("palette::gamut["+Math.floor(4+slot*colinc)+"]::colour"))
				lcd_main.message("moveto",18,sloty+fontheight*0.32);
				setfontsize(fontheight/3.2);
				lcd_main.message("textface","bold");
				lcd_main.message("write",slot+1,waves_dict.get("waves["+(slot+1)+"]::name"));
			}
			
		}else{
			//draw placeholder marker that's a load button
//			var b = mainwindow_height-9;
	//		if(slot!=num_slots-1) b = 9+(slot+0.96)*slot_h;
			c=config.get("palette::gamut["+Math.floor(3+slot*colinc)+"]::colour");
			lcd_main.message("framerect",9,sloty,mainwindow_width-9,sloty+slot_h-fontheight*0.1,c[0],c[1],c[2]);
			//lcd_main.message("frgb",menudark);
			lcd_main.message("moveto",18,sloty+fontheight*0.32);
			setfontsize(fontheight/3.2);
			lcd_main.message("textface","bold");
			lcd_main.message("write",slot+1,"---");
			click_rectangle(9,sloty,mainwindow_width-9,sloty+slot_h-fontheight*0.1,mouse_index,1);
			mouse_click_actions[mouse_index] = load_wave;
			mouse_click_parameters[mouse_index] = slot;
			mouse_click_values[mouse_index] = "";	
			mouse_index++;
		}
		sloty+=slot_h;
	}
	lcd_main.message("bang");
	//outlet(8,"bang");
}

function draw_custom(){
	ui_poly.setvalue( custom_block+1, "draw");
}

function update_custom(){
	ui_poly.setvalue( custom_block+1, "update");
}

function update_custom_panels(){
	for(var i=0;i<panels_custom.length;i++){
		ui_poly.setvalue( panels_custom[i]+1, "update");
	}
}

function draw_block_menu(){
	initialise_block_menu(1);
	lcd_main.message("brgb", 0, 0, 0);
	click_clear(0,0);
//	mouse_click_actions[0] = pan_background;
	mouse_click_parameters[0] = 0;
	mouse_click_values[0] = 0;	
	draw_menu_hint();
}

function hide_block_menu(){
	//post("\nhiding block menu\n");
	for(var i=0;i<cubecount;i++){
		blocks_menu[i].enable = 0;
	}
}

function initialise_block_menu(visible){		
	//post("\nshowing block menu\n");
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
	//blocks_menu=[];
	if(typeof blocks_menu[0] !== "undefined"){ //we've already done the work here, just need to dim used blocks
		if(block_menu_d.mode == 1) swpt = blocks.get("blocks["+block_menu_d.swap_block_target+"]::type");
		for(i=0;i<cubecount;i++){
			if((blocktypes.contains(types[i]+"::deprecated") && blocktypes.get(types[i]+"::deprecated")==1)){
				//skip this one
//				post("\n\n",types[i]," is deprecated",blocktypes.get(types[i]+"::deprecated"));
			}else{
				if(visible==1)vis=1;	
				if(block_menu_d.mode == 1){
					if(blocktypes.get(types[i]+"::type") != swpt) vis=0; //this is for swap mode, you can only swap an audio into an audio, etc
				}
				if(blocktypes.contains(types[i]+"::exclusive")){
					for(t = 0;t<MAX_BLOCKS;t++){
						if(blocks.get("blocks["+t+"]::name") == types[i]){
							vis=0; // this is to hide blocks eg clock when there's one already out (as you can't have more than one of them)
						}
					}
				}
				blocks_menu[i].enable = vis;
			}
		}
	}else{
		for(var typ in type_order){
			z++;
			x=-4;
			for(i=0;i<cubecount;i++){
				ts=types[i].split('.');
				if(ts[0]==type_order[typ]){
					if((blocktypes.contains(types[i]+"::deprecated") && blocktypes.get(types[i]+"::deprecated")==1)){
						//skip this one
						//						post("\n\n",types[i]," is deprecated",blocktypes.get(types[i]+"::deprecated"));
						blocks_menu[i] = new JitterObject("jit.gl.gridshape","mainwindow");
						blocks_menu[i].name = "menu_block-"+types[i]+"-"+i;
						blocks_menu[i].shape = "cube";
						blocks_menu[i].color = [1,1,1,1]; //[col[0]/256,col[1]/256,col[2]/256,1];
						blocks_menu[i].position = [1000, 1000, 1000];
						blocks_menu[i].scale = [0.45, 0.45, 0.45];
						blocks_menu[i].enable = 0; //1;//0;//1; just set it to zero as you're initialising, you'll show it later.
					}else{
//						post("\ndrawing menu texture:",i," label is ",ts,"\n");
						messnamed("texture_generator","menu",i);
						col = blocktypes.get(types[i]+"::colour");
						lcd_block_textures.message("brgb",col);
						lcd_block_textures.message("clear");
						lcd_block_textures.message("frgb",255,255,255);
						lcd_block_textures.message("font","consolas",30);
						lcd_block_textures.message("textface","bold");
						for(var t=0;t<ts.length;t++){
							lcd_block_textures.message("moveto",5, 28+t*30);
							lcd_block_textures.message("write",ts[t]);
						}
						lcd_block_textures.message("bang");
	
						if(x>4){
							z++;
							x=-4;
						}
						//col = config.get("palette::"+ts[0]);
//						post("drawing menu block",ts);
						blocks_menu[i] = new JitterObject("jit.gl.gridshape","mainwindow");
						blocks_menu[i].name = "menu_block-"+types[i]+"-"+i;
						blocks_menu[i].shape = "cube";
						blocks_menu[i].color = [1,1,1,1]; //[col[0]/256,col[1]/256,col[2]/256,1];
						blocks_menu[i].position = [x, -110, z];
						blocks_menu[i].scale = [0.45, 0.45, 0.45];
						blocks_menu[i].enable = 0; //1;//0;//1; just set it to zero as you're initialising, you'll show it later.
						blocks_menu[i].texture = blocks_menu_texture[i];
						blocks_menu[i].tex_map = 1;
						blocks_menu[i].texzoom = [1,1];
						blocks_menu[i].texanchor = [0.5,0.5];
						blocks_menu[i].tex_plane_s = [0.5,0,0,0.5];
						blocks_menu[i].tex_plane_t = [0,1,-0.5,-0.5];
						x++;					
					}
				}
			}
		}
		blocks_tex_sent = []; // this is a good moment to ask for a redraw of any blocks that are loaded by now's textures
		initialise_block_menu(visible); //to hide the core blocks if they're already loaded
	}
}

function blocks_enable(enab){ //shows or hides all the blocks/wires/text
	for(var i=0;i<blocks_cube.length;i++){
		if(typeof blocks_cube[i] !== 'undefined'){
			for(var t=0;t<blocks_cube[i].length;t++){
				/*if(typeof blocks_cube[i][t] !== 'undefined') */blocks_cube[i][t].enable = enab;
			}
			if(typeof blocks_meter[i][0] !== 'undefined'){
				for(var t=0;t<blocks_cube[i].length;t++){
					for(var tt=0;tt<blocks_meter[i].length;tt++){
						if(typeof blocks_meter[i][t*NO_IO_PER_BLOCK+tt] !== 'undefined'){
							blocks_meter[i][t*NO_IO_PER_BLOCK+tt].enable = enab;
						}
					}
				}
			}
		}
/*		if(typeof blocks_label[i]!=='undefined'){
			for(var t=0;t<blocks_label[i].length;t++){
				if(typeof blocks_label[i][t] !== 'undefined'){
					blocks_label[i][t].enable = enab;
				}
			}
		}*/
	}
	for(var i=0;i<wires.length;i++){
		if(Array.isArray(wires[i]) ){
			for(var t=0;t<wires[i].length;t++){
				if(typeof wires[i][t] !== 'undefined'){
					wires[i][t].enable = enab;
				}
			}
		}
	}
}

function block_and_wire_colours(){ //for selection and mute etc
	var i, t, cmute,tmc,segment,cs;
	var block_c=[];
	selected.anysel = 0;
	if((selected.block.indexOf(1)>-1) || (selected.wire.indexOf(1)>-1)){
		selected.anysel = 1; 
	}
	anymuted=0;
	for(i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			draw_block_texture(i);
			block_c = [1,1,1,1];
			block_mute = blocks.get("blocks["+i+"]::mute");
			block_v = blocks.get("blocks["+i+"]::poly::voices");
			if(block_mute){
				anymuted=1;
			}
			for(t=0;t<=block_v;t++){
				if(selected.anysel){
					if(selected.block[i]){
						if((sidebar.scopes.voicenum==-1)||((sidebar.scopes.voicenum+1) == t)){
							blocks_cube[i][t].color = block_c; 
						}else{
							blocks_cube[i][t].color = [0.4*block_c[0],0.4*block_c[1],0.4*block_c[2],1]; 
						}
					}else{
						blocks_cube[i][t].color = [0.4*block_c[0],0.4*block_c[1],0.4*block_c[2],1];
					}
				}else{
					blocks_cube[i][t].color = block_c;
				}
				if(block_mute) blocks_cube[i][t].color = [0.3*block_c[0],0.3*block_c[1],0.3*block_c[2],1];
				if(t==0){
					block_c = blocks.get("blocks["+i+"]::space::colour");
					block_c[0] /= 256;
					block_c[1] /= 256;
					block_c[2] /= 256;
				}
			}
		}
	}
	for(i=0;i<connections.getsize("connections");i++){
		if(connections.contains("connections["+i+"]::conversion::mute")){
			cs = selected.wire[i];
			if(selected.anysel && !cs){
				if(selected.block[connections.get("connections["+i+"]::from::number")]){
					cs = 1;
				}else if(selected.block[connections.get("connections["+i+"]::to::number")]){
					cs = 1;
				}
			}
			cmute = connections.get("connections["+i+"]::conversion::mute");
	//		post("connection",i,"length",wires[i].length,"w_c length",wires_colours[i].length,"\n");
			if(wires_colours[i].length>=wires[i].length){
				for(segment=0;segment<wires[i].length;segment++){
					tmc=0.3;
					if(cmute) tmc -= 0.2935*(segment*0.5==Math.floor(segment*0.5)); // stripey wires if muted
					tmc *= (1-0.8*selected.anysel*(0.3 - 1.5*cs));
					//post("seg,w_c[i][seg]",segment);
					//post(wires_colours[i][segment],"\n");
					wires[i][segment].color = [tmc*wires_colours[i][segment][0],tmc*wires_colours[i][segment][1],tmc*wires_colours[i][segment][2],1];	
				}		
			}
		}
	}
}


function draw_block(i){ //i is the blockno, we've checked it exists before this point
	//post("drawing block",i,"\n");
	draw_block_texture(i);
	block_x = blocks.get("blocks["+i+"]::space::x");
	block_y = blocks.get("blocks["+i+"]::space::y");
	block_c = blocks.get("blocks["+i+"]::space::colour");
	block_mute = blocks.get("blocks["+i+"]::mute");
	if(block_mute){
		block_c = config.get("palette::muted");
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
	if(block_x>blocks_page.rightmost) blocks_page.rightmost = block_x;
	if(block_y<blocks_page.lowest) blocks_page.lowest = block_y;
	if(block_y>blocks_page.highest) blocks_page.highest = block_y;
	
	if(is_empty(blocks_cube[i])){
		blocks_cube[i] = [];
		blocks_meter[i] = [];
	}

	var tt=0;
	for(t=0;t<=block_v;t++){
		if(is_empty(blocks_cube[i][t])) {
			blocks_cube[i][t] = new JitterObject("jit.gl.gridshape","mainwindow");
			blocks_cube[i][t].dim = [12, 12];
			blocks_cube[i][t].name = "block-"+i+"-"+t;
			blocks_cube[i][t].shape = "cube";
			if(selected.anysel){
				if(selected.block[i]){
					blocks_cube[i][t].color = [1,1,1,1];//[block_c[0]/256,block_c[1]/256,block_c[2]/256,1];
				}else{
					//var c_avg = (block_c[0] + block_c[1] + block_c[2])/3;
					blocks_cube[i][t].color = [0.4,0.4,0.4,1]; //[(block_c[0]+c_avg)/1024,(block_c[1]+c_avg)/1024,(block_c[2]+c_avg)/1024,1];
				}
			}else{
				blocks_cube[i][t].color = [1,1,1,1];//[block_c[0]/300,block_c[1]/300,block_c[2]/300,1];
			}
			if(block_mute) blocks_cube[i][t].color = [0.3,0.3,0.3,1];
			if(t==0){
				blocks_cube[i][0].texture = blocks_cube_texture[i];
				blocks_cube[i][0].tex_map = 1;
				blocks_cube[i][0].texzoom = [1,1];
				blocks_cube[i][0].texanchor = [0.5, 0.5];
				blocks_cube[i][t].position = [block_x, block_y, 0];
				blocks_cube[i][t].scale = [0.45, 0.45, 0.45];
			}else{
				var tc = blocks_cube[i][t].color;
				blocks_cube[i][t].color = [block_c[0]*tc[0]/256,block_c[1]*tc[1]/256,block_c[2]*tc[2]/256,1];
				blocks_cube[i][t].position = [block_x+0.25+0.5*t, block_y, 0];
				blocks_cube[i][t].scale = [0.2, 0.45, 0.45];		
				if(block_type=="audio"){
					if((subvoices<=1) || (t==1)){
						for(tt=0;tt<NO_IO_PER_BLOCK;tt++){
							blocks_meter[i][(t-1)*NO_IO_PER_BLOCK+tt] = new JitterObject("jit.gl.gridshape","mainwindow");
							blocks_meter[i][(t-1)*NO_IO_PER_BLOCK+tt].dim = [8,6];// [12, 12];
							blocks_meter[i][(t-1)*NO_IO_PER_BLOCK+tt].name = "meter-"+i+"-"+t+"-"+tt;
							blocks_meter[i][(t-1)*NO_IO_PER_BLOCK+tt].shape = "cube";
							//blocks_meter[i][t*NO_IO_PER_BLOCK+tt].blend_enable = 0;
						}						
					}// for vsts it register more cubes than there really are - one per output, so you just skip the voices that arent the first
				}else if(block_type == "hardware"){
					var noio=0, max_poly=1;
					if(blocktypes.contains(block_name+"::max_polyphony")) max_poly = blocktypes.get(block_name+"::max_polyphony");
					if(blocktypes.contains(block_name+"::connections::in::hardware_channels")){
						noio += blocktypes.getsize(block_name+"::connections::in::hardware_channels");
					}
					if(blocktypes.contains(block_name+"::connections::out::hardware_channels")){
						noio += blocktypes.getsize(block_name+"::connections::out::hardware_channels");
					}						
					noio /= max_poly;
					if(noio==0){
						post("this hardware block seems to have no io?");
					}else{
						for(tt=0;tt<noio;tt++){
							blocks_meter[i][(t-1)*noio+tt] = new JitterObject("jit.gl.gridshape","mainwindow");
							blocks_meter[i][(t-1)*noio+tt].dim = [8,6];// [12, 12];
							blocks_meter[i][(t-1)*noio+tt].name = "meter-"+i+"-"+t+"-"+tt;
							blocks_meter[i][(t-1)*noio+tt].shape = "cube";
							//blocks_meter[i][t*noio+tt].blend_enable = 0;
						}
					}					
					
				}	
			}
		}
		//blocks_cube[i][t].position = [block_x, block_y, -t];
		//blocks_cube[i][t].scale = [0.45, 0.45, 0.45];
		blocks_cube[i][t].position = [block_x+0.25*(t!=0)+0.5*t, block_y, 0];
		blocks_cube[i][t].enable = 1;
		if(block_type=="audio"){
			if(subvoices>1){
				if((t % subvoices) == 1){
					for(tt=0;tt<(NO_IO_PER_BLOCK);tt++){
						blocks_meter[i][tt].color = [1, 1, 1, 1];
						blocks_meter[i][tt].position = [block_x + tt*0.5 + 0.75, block_y, 0.5];
						blocks_meter[i][tt].scale = [0.20, 0.025, 0.05];
						blocks_meter[i][tt].enable = 1;
					}									
				}
			}else{
				if(t>0){
					for(tt=0;tt<NO_IO_PER_BLOCK;tt++){
						blocks_meter[i][(t-1)*NO_IO_PER_BLOCK+tt].color = [1, 1, 1, 1];
						blocks_meter[i][(t-1)*NO_IO_PER_BLOCK+tt].position = [blocks_cube[i][t].position[0] + tt*0.4/NO_IO_PER_BLOCK - 0.1, block_y, 0.5];
						blocks_meter[i][(t-1)*NO_IO_PER_BLOCK+tt].scale = [0.2/NO_IO_PER_BLOCK, 0.025, 0.05];
						blocks_meter[i][(t-1)*NO_IO_PER_BLOCK+tt].enable = 1;
					}				
				}
			}
		}else if(block_type == "hardware"){
			if(t>0){
				var noio=0, max_poly=1;
				if(blocktypes.contains(block_name+"::max_polyphony")) max_poly = blocktypes.get(block_name+"::max_polyphony");
				if(blocktypes.contains(block_name+"::connections::in::hardware_channels")){
					noio += blocktypes.getsize(block_name+"::connections::in::hardware_channels");
				}
				if(blocktypes.contains(block_name+"::connections::out::hardware_channels")){
					noio += blocktypes.getsize(block_name+"::connections::out::hardware_channels");
				}						
				noio /= max_poly;
				if(noio==0){
					//post("this hardware block seems to have no io?");
				}else{
					for(tt=0;tt<noio;tt++){
						blocks_meter[i][(t-1)*noio+tt].color = [1, 1, 1, 1];
						blocks_meter[i][(t-1)*noio+tt].position = [blocks_cube[i][t].position[0] - 0.2 + (tt+0.5)*0.4/noio, block_y, 0.5];
						blocks_meter[i][(t-1)*noio+tt].scale = [0.2/noio, 0.025, 0.05];
						blocks_meter[i][(t-1)*noio+tt].enable = 1;
					}
				}					
			}
		}
	}
}

function draw_blocks(){
	post("draw blocks");
	var i;
	blocks_page.leftmost=0;
	blocks_page.rightmost=0;
	blocks_page.lowest=0;
	blocks_page.highest=0;

	for(i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			draw_block(i);
		}
	}
	for(i=0;i<connections.getsize("connections");i++){
		if(connections.contains("connections["+i+"]::from")){
			draw_wire(i);
		} 
	}
}

function draw_wire(connection_number){
	//post("draw wire",connection_number,"\n");
	var t;
	if((connections.contains("connections["+connection_number+"]::from::number")) && (connections.contains("connections["+connection_number+"]::to::number"))){
		var cfrom = connections.get("connections["+connection_number+"]::from::number");
		var cto = connections.get("connections["+connection_number+"]::to::number");
		// now just get the block positions and compare to stored ones in wire_ends
		var drawme=1;
		//if(is_empty(blocks_cube[cfrom])) drawme = 0;
		if(!is_empty(wire_ends[connection_number])){
			if((blocks_cube[cfrom][0].position[0]==wire_ends[connection_number][0])&&(blocks_cube[cfrom][0].position[1]==wire_ends[connection_number][1])&&(blocks_cube[cto][0].position[0]==wire_ends[connection_number][2])&&(blocks_cube[cto][0].position[1]==wire_ends[connection_number][3])){
				drawme =0;
			}
		}
		if(typeof selected.wire[connection_number] === 'undefined') selected.wire[connection_number] = 0;
		if(drawme){
			var cmute = connections.get("connections["+connection_number+"]::conversion::mute");
			var from_number = connections.get("connections["+connection_number+"]::from::output::number");
			var from_type = connections.get("connections["+connection_number+"]::from::output::type");
			var to_number = connections.get("connections["+connection_number+"]::to::input::number");
			var to_type = connections.get("connections["+connection_number+"]::to::input::type");
			var from_name = blocks.get("blocks["+cfrom+"]::name");
			var num_outs = blocktypes.getsize(from_name+"::connections::out::"+from_type);
			var num_ins;
			if(to_type!="parameters"){
				num_ins = blocktypes.getsize(blocks.get("blocks["+cto+"]::name")+"::connections::in::"+to_type);
			}else{
				num_ins = blocktypes.getsize(blocks.get("blocks["+cto+"]::name")+"::parameters");
			}
			var from_pos,to_pos;
			var from_anglevector,to_anglevector;
			var from_corner, to_corner, from_cornervector, to_cornervector;
			var from_colour = config.get("palette::connections::"+from_type);
			var to_colour = config.get("palette::connections::"+to_type);
			from_colour[0] = from_colour[0]/255;
			from_colour[1] = from_colour[1]/255;
			from_colour[2] = from_colour[2]/255;
			to_colour[0] = to_colour[0]/255;
			to_colour[1] = to_colour[1]/255;
			to_colour[2] = to_colour[2]/255;

			var fconz = 0;
			var tconz = 0;
			var typeoffset = 0; //midi and parameters are in front of audio
			
			wire_ends[connection_number]=[blocks_cube[cfrom][0].position[0],blocks_cube[cfrom][0].position[1],blocks_cube[cto][0].position[0],blocks_cube[cto][0].position[1]];
			if((from_type=="audio") || (from_type=="hardware") || (from_type=="matrix")){
				fconz = ((from_number+0.5)/(NO_IO_PER_BLOCK)) ;
				from_pos = [ (blocks_cube[cfrom][0].position[0]), blocks_cube[cfrom][0].position[1] - 0.44, 0/*fconz*/ ];
			}else{
				fconz = ((from_number+0.5)/(num_outs));
				from_pos = [ (blocks_cube[cfrom][0].position[0]), blocks_cube[cfrom][0].position[1] - 0.44, 0/*fconz*/ ];
				if(from_type == "midi") from_pos[2]+=0.25;
				if(from_type == "parameters") from_pos[2]+=0.125;
			}
			if((to_type=="audio") || (to_type=="hardware") || (to_type=="matrix")){
				tconz = ((to_number+0.5)/(NO_IO_PER_BLOCK));
				to_pos = [ (blocks_cube[cto][0].position[0]), blocks_cube[cto][0].position[1]+0.44, 0/*tconz*/ ];
			}else{
				tconz =  ((to_number+0.5)/(num_ins));
				to_pos = [ blocks_cube[cto][0].position[0], blocks_cube[cto][0].position[1]+0.44, 0/* tconz*/ ];
				if(to_type == "midi") typeoffset = 0.25; //to_pos[1]-=0.25;
				if(to_type == "parameters") typeoffset = 0.125; //to_pos[1]+=0.25;
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
			var tv,tl;
			if(connections.get("connections["+connection_number+"]::from::voice")=="all"){
				tv = blocks.get("blocks["+cfrom+"]::poly::voices");
				if(tv>1) from_multi = 1;
				for(t=0;t<tv;t++){
					from_list[t] = t+1;
				}
			}else{
				tl = connections.get("connections["+connection_number+"]::from::voice");
				if(tl.length>1){
					from_multi=1;
					for(t=0;t<tl.length;t++){
						from_list[t] = tl[t];
					}
				}else{
					from_pos[0] += 0.5*tl;
				}
			}
			var to_multi=0;
			tv = blocks.get("blocks["+cto+"]::poly::voices");
			if(connections.get("connections["+connection_number+"]::to::voice")=="all"){
				if(((to_type == "midi")||(to_type == "parameters"))&&(tv>1)){
					to_multi = -1; // to flag that it goes to the poly input - the main square not a voice
				}else{
					if(tv>1)to_multi = 1;
					for(t=0;t<tv;t++){
						to_list[t] = t+1;
					}
					to_pos[0] += 0.2;			
				}
			}else{
				to_pos[0] += 0.2;

				tl = connections.get("connections["+connection_number+"]::to::voice");
				if(tl.length>1){
					to_multi = 1;
					for(t=0;t<tl.length;t++){
						to_list[t] = tl[t];
					}
				}else {
					to_pos[0] += 0.5*tl;// + tconz * 0.4; 
				}
			}
			if(is_empty(wires[connection_number])) wires[connection_number] = [];
			if(is_empty(wires_colours[connection_number])) wires_colours[connection_number] = [];
			to_pos[2] += typeoffset;	
			
			// if it doubles back on itself in any way it needs a corner in the wire at each end.
			var corners = [0,0];
			
			if((to_pos[1]>=from_pos[1])){
				from_anglevector = [0, -0.44, 0];
				corners[0] = 1;
				if(to_pos[0]>from_pos[0]){
					from_corner = [from_pos[0] + 0.44, from_pos[1]-0.44, from_pos[2]];
					from_cornervector = [0.44, 0, 0];//[0.44, 0, 0];
				}else{
					from_corner = [from_pos[0] - 0.44, from_pos[1]-0.44, from_pos[2]];
					from_cornervector = [-0.44, 0, 0];//[-0.44, 0, 0];
				}
			}else{
				from_corner = [from_pos[0],from_pos[1] - 0.5,from_pos[2]];
				from_cornervector = [0, -0.44, 0];
				from_anglevector = [0, -0.44, 0];
			}

			if((to_pos[1]>=from_pos[1])){
				to_anglevector = [0, -0.44, 0];
				corners[1]=1;
				if(to_pos[0]<from_pos[0]){
					to_corner = [to_pos[0]+0.44, to_pos[1]+0.44, to_pos[2]];
					to_cornervector = [-0.44,0,0];//[-0.44, 0, 0];
				}else{
					to_corner = [to_pos[0]-0.44, to_pos[1]+0.44, to_pos[2]];
					to_cornervector = [0.44, 0, 0];
				}
			}else{
				to_corner = [to_pos[0],to_pos[1]+0.5,to_pos[2]];
				to_cornervector = [0, -0.44, 0];
				to_anglevector = [0, -0.44, 0];
			}
			if((dist<4.5)&&(cfrom!=cto)) corners = [0,0];
			var bez_prep=[];
			for(t=0;t<6;t++){
				bez_prep[t] = new Array(3);
			}
			segment=0;
			//so. if either to_multi or from_multi are 1 then we have to draw connections too and from a 'blob'. if not, we just draw a single bezier
			// if there are blobs then the blobs are either at one of the corners or in the middle.
			// many-blob-corner-one, many-corner-blob-corner-many, one-corner-blob-many
			if((to_multi>0) || from_multi){
				var blob_position = [];
				var meanvector = [0,0,0];
				var i;
				var minz=99999;
				var mtot=0;
				var fp = from_pos[0];
				var tp = to_pos[0];

				for(t=0;t<from_list.length;t++){
					i = from_list[t];
					mtot += i;
					if(i<minz)minz=i;
				}
				for(t=0;t<to_list.length;t++){
					i = to_list[t];
					mtot+=i;
					if(i<minz)minz=i;
				}
				
				minz = 0.5*mtot/(from_list.length+to_list.length);
				minz += 0.5*(fp+tp);
				blob_position[2] =  0;//1 - minz;
				from_corner[2] = 0;
				to_corner[2]=0;
				blob_position[0] = minz; //((from_corner[0] + to_corner[0])*0.5);
				blob_position[1] = ((from_pos[1] + to_pos[1])*0.5);// ((from_corner[1] + to_corner[1])*0.5);
				meanvector[0] = from_corner[0] - to_corner[0];
				meanvector[1] = from_corner[1] - to_corner[1];
				var mvl = meanvector[0]*meanvector[0] + meanvector[1]*meanvector[1];
				mvl = -0.44/Math.sqrt(mvl);
				meanvector[0] = meanvector[0] * mvl;
				meanvector[1] = meanvector[1] * mvl;				

				if((from_multi)&&(to_multi>0)){ 
					if(corners[0]){ //many-corner(many)-blob-  then later i'll do -?corner(many)?-many
						for(i=0;i<from_list.length;i++){
							from_pos[0] = fp + 0.5*from_list[i]+0.4*fconz;
							//from_corner[2] = (1 - from_list[i]+fconz+blob_position[2])*0.5;
							for(t=0;t<3;t++){
								bez_prep[0][t] = from_pos[t];
								bez_prep[1][t] = from_pos[t]+from_anglevector[t];
								bez_prep[2][t] = from_corner[t]-from_cornervector[t];
								bez_prep[3][t] = from_corner[t];
								bez_prep[4][t] = from_colour[t];
								bez_prep[5][t] = (from_colour[t]*3+to_colour[t])*0.35;
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						}
						for(i=0;i<from_list.length;i++){
							//from_pos[2] = 1 - from_list[i]+fconz;
							//from_corner[2] = (1 - from_list[i]+fconz+blob_position[2])*0.5;
							for(t=0;t<3;t++){
								bez_prep[0][t] = from_corner[t];
								bez_prep[1][t] = from_corner[t]+from_cornervector[t];
								bez_prep[2][t] = blob_position[t]-meanvector[t];
								bez_prep[3][t] = blob_position[t];
								bez_prep[4][t] = (from_colour[t]*3+to_colour[t])*0.35;
								bez_prep[5][t] = (from_colour[t]+to_colour[t])*0.7;
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						}
					}else{ //many-blob- then later ?corner?-many
						for(i=0;i<from_list.length;i++){
							from_pos[0] = fp + 0.5*from_list[i] + 0.4*fconz;
							for(t=0;t<3;t++){
								bez_prep[0][t] = from_pos[t];
								bez_prep[1][t] = from_pos[t]+2*from_anglevector[t];
								bez_prep[2][t] = blob_position[t]-meanvector[t];
								bez_prep[3][t] = blob_position[t];
								bez_prep[4][t] = from_colour[t];
								bez_prep[5][t] = (from_colour[t]+to_colour[t])*0.7;
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.5 , bez_prep, cmute);
						}
					}
					// this is the first half
					if(corners[1]){//blob-corner(many)-many
						for(i=0;i<to_list.length;i++){
							//to_pos[0] = tp + 0.5*to_list[i] + 0.25*tconz;
							//to_corner[2] = (1 - to_list[i]+tconz+blob_position[2])*0.5;
							for(t=0;t<3;t++){
								bez_prep[0][t] = blob_position[t];
								bez_prep[1][t] = blob_position[t]+meanvector[t];
								bez_prep[2][t] = to_corner[t]-to_cornervector[t];
								bez_prep[3][t] = to_corner[t];
								bez_prep[4][t] = (from_colour[t]+to_colour[t])*0.7;
								bez_prep[5][t] = (from_colour[t]*3+to_colour[t])*0.35;
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						}
						for(i=0;i<to_list.length;i++){
							to_pos[0] = tp + 0.5 * to_list[i] + 0.4 * tconz;
							//to_corner[2] = (1 - to_list[i]+tconz+blob_position[2])*0.5;
							for(t=0;t<3;t++){
								bez_prep[0][t] = to_corner[t];
								bez_prep[1][t] = to_corner[t]+to_cornervector[t];
								bez_prep[2][t] = to_pos[t]-to_anglevector[t];
								bez_prep[3][t] = to_pos[t];
								bez_prep[4][t] = (from_colour[t]+3*to_colour[t])*0.35;
								bez_prep[5][t] = to_colour[t];
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						}
					}else{ //blob-no corner many
						for(i=0;i<to_list.length;i++){
							to_pos[0] = tp + 0.5 * to_list[i] + 0.4 * tconz;
							for(t=0;t<3;t++){
								bez_prep[0][t] = blob_position[t];
								bez_prep[1][t] = blob_position[t]+meanvector[t];
								bez_prep[2][t] = to_pos[t]-2*to_anglevector[t];
								bez_prep[3][t] = to_pos[t];
								bez_prep[4][t] = (from_colour[t]+to_colour[t])*0.7;
								bez_prep[5][t] = to_colour[t];
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.5 , bez_prep, cmute);
						}
					}
				}else if(from_multi){  //only from is multi, so many-blob-corner-one, this is the same whether its got a corner[0] or not as the blob is the corner
					if(corners[0]){ //many-corner(many)-blob-  then later i'll do -?corner(many)?-many
						for(i=0;i<from_list.length;i++){
							from_pos[0] = fp + 0.5 * from_list[i]+ 0.4 * fconz;
							//from_corner[2] = (1 - from_list[i]+fconz+blob_position[2])*0.5;
							for(t=0;t<3;t++){
								bez_prep[0][t] = from_pos[t];
								bez_prep[1][t] = from_pos[t]+from_anglevector[t];
								bez_prep[2][t] = from_corner[t]-from_cornervector[t];
								bez_prep[3][t] = from_corner[t];
								bez_prep[4][t] = from_colour[t];
								bez_prep[5][t] = (from_colour[t]*3+to_colour[t])*0.35;
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						}
						for(i=0;i<from_list.length;i++){
							//from_pos[2] = 1 - from_list[i]+fconz;
							//from_corner[2] = (1 - from_list[i]+fconz+blob_position[2])*0.5;
							for(t=0;t<3;t++){
								bez_prep[0][t] = from_corner[t];
								bez_prep[1][t] = from_corner[t]+from_cornervector[t];
								bez_prep[2][t] = blob_position[t]-meanvector[t];
								bez_prep[3][t] = blob_position[t];
								bez_prep[4][t] = (from_colour[t]*3+to_colour[t])*0.35;
								bez_prep[5][t] = (from_colour[t]+to_colour[t])*0.7;
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						}
					}else{ //many-blob- then later ?corner?-many
						for(i=0;i<from_list.length;i++){
							from_pos[0] = fp + 0.5 * from_list[i] + 0.4 * fconz;
							for(t=0;t<3;t++){
								bez_prep[0][t] = from_pos[t];
								bez_prep[1][t] = from_pos[t]+2*from_anglevector[t];
								bez_prep[2][t] = blob_position[t]-meanvector[t];
								bez_prep[3][t] = blob_position[t];
								bez_prep[4][t] = from_colour[t];
								bez_prep[5][t] = (from_colour[t]+to_colour[t])*0.7;
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.5 , bez_prep, cmute);
						}
					}
					to_pos[0] += 0.3 + 0.4 * tconz;
					if(corners[1]){	
						//if(to_type=="hardware") post("hw conn,",tconz);
						for(t=0;t<3;t++){
							bez_prep[0][t] = blob_position[t];
							bez_prep[1][t] = blob_position[t]+meanvector[t];
							bez_prep[2][t] = to_corner[t]-to_cornervector[t];
							bez_prep[3][t] = to_corner[t]
							bez_prep[4][t] = (from_colour[t]*3+to_colour[t])*0.35;
							bez_prep[5][t] = (from_colour[t]+3*to_colour[t])*0.35;
						}
						segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						for(t=0;t<3;t++){
							bez_prep[0][t] = to_corner[t];
							bez_prep[1][t] = to_corner[t]+to_cornervector[t];//+from_anglevector[t];
							bez_prep[2][t] = to_pos[t]-to_anglevector[t];
							bez_prep[3][t] = to_pos[t];
							bez_prep[4][t] = (from_colour[t]+3*to_colour[t])*0.35;
							bez_prep[5][t] = to_colour[t];
						}
						segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25, bez_prep, cmute);		
					}else{
						for(t=0;t<3;t++){
							bez_prep[0][t] = blob_position[t];
							bez_prep[1][t] = blob_position[t]+meanvector[t];
							bez_prep[2][t] = to_pos[t]-to_anglevector[t];
							bez_prep[3][t] = to_pos[t];
							bez_prep[4][t] = (from_colour[t]+3*to_colour[t])*0.35;
							bez_prep[5][t] = to_colour[t];
						}
						segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.5, bez_prep, cmute);		
					}
				}else{ // one-corner-blob-many //ie to_multi==1
					to_pos[0] += 0.4 * tconz;
					from_pos[0] += 0.4 * fconz;
					if(corners[0]){
						for(t=0;t<3;t++){
							bez_prep[0][t] = from_pos[t];
							bez_prep[1][t] = from_pos[t]+from_anglevector[t];
							bez_prep[2][t] = from_corner[t]-from_cornervector[t];
							bez_prep[3][t] = from_corner[t];
							bez_prep[4][t] = from_colour[t];
							bez_prep[5][t] = (from_colour[t]*3+to_colour[t])*0.35;
						}
						segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25, bez_prep, cmute);					
						for(t=0;t<3;t++){
							bez_prep[0][t] = from_corner[t];
							bez_prep[1][t] = from_corner[t]+from_cornervector[t];
							bez_prep[2][t] = blob_position[t]-meanvector[t];
							bez_prep[3][t] = blob_position[t];
							bez_prep[4][t] = (from_colour[t]*3+to_colour[t])*0.35;
							bez_prep[5][t] = (from_colour[t]+3*to_colour[t])*0.35;
						}
						segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25, bez_prep, cmute);					
	
					}else{
						for(t=0;t<3;t++){
							bez_prep[0][t] = from_pos[t];
							bez_prep[1][t] = from_pos[t]+2*from_anglevector[t];
							bez_prep[2][t] = blob_position[t]-meanvector[t];
							bez_prep[3][t] = blob_position[t];
							bez_prep[4][t] = (from_colour[t]*3+to_colour[t])*0.35;
							bez_prep[5][t] = (from_colour[t]+3*to_colour[t])*0.35;
						}
						segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.5, bez_prep, cmute);					
	
					}

					if(corners[1]){//blob-corner(many)-many
						for(i=0;i<to_list.length;i++){
							//to_pos[0] = tp + 0.375 + 0.5 * to_list[i] + 0.25 * tconz;
							//to_corner[2] = (1 - to_list[i]+tconz+blob_position[2])*0.5;
							for(t=0;t<3;t++){
								bez_prep[0][t] = blob_position[t];
								bez_prep[1][t] = blob_position[t]+meanvector[t];
								bez_prep[2][t] = to_corner[t]-to_cornervector[t];
								bez_prep[3][t] = to_corner[t];
								bez_prep[4][t] = (from_colour[t]+to_colour[t])*0.7;
								bez_prep[5][t] = (from_colour[t]*3+to_colour[t])*0.35;
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						}
						for(i=0;i<to_list.length;i++){
							to_pos[0] = tp + 0.5* to_list[i] + 0.4 * tconz;
							//to_corner[2] = (1 - to_list[i]+tconz+blob_position[2])*0.5;
							for(t=0;t<3;t++){
								bez_prep[0][t] = to_corner[t];
								bez_prep[1][t] = to_corner[t]+to_cornervector[t];
								bez_prep[2][t] = to_pos[t]-to_anglevector[t];
								bez_prep[3][t] = to_pos[t];
								bez_prep[4][t] = (from_colour[t]+3*to_colour[t])*0.35;
								bez_prep[5][t] = to_colour[t];
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25 , bez_prep, cmute);
						}
					}else{ //blob-no corner many
						for(i=0;i<to_list.length;i++){
							to_pos[0] = tp + 0.5 * to_list[i] + 0.4 * tconz;
							for(t=0;t<3;t++){
								bez_prep[0][t] = blob_position[t];
								bez_prep[1][t] = blob_position[t]+meanvector[t];
								bez_prep[2][t] = to_pos[t]-2*to_anglevector[t];
								bez_prep[3][t] = to_pos[t];
								bez_prep[4][t] = (from_colour[t]+to_colour[t])*0.7;
								bez_prep[5][t] = to_colour[t];
							}
							segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.5 , bez_prep, cmute);
						}
					}
				}
			}else{ // single wire
				to_pos[0] += 0.05;// 0.2 * tconz;
				from_pos[0] += 0.4 * fconz + 0.05;
				if(corners[0]&&corners[1]){
					for(t=0;t<3;t++){
						bez_prep[0][t] = from_pos[t];
						bez_prep[1][t] = from_pos[t]+from_anglevector[t];
						bez_prep[2][t] = from_corner[t]-from_cornervector[t];
						bez_prep[3][t] = from_corner[t];
						bez_prep[4][t] = from_colour[t];
						bez_prep[5][t] = (from_colour[t]*3+to_colour[t])*0.35;
					}
					segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25, bez_prep, cmute);	
					for(t=0;t<3;t++){
						bez_prep[0][t] = from_corner[t];
						bez_prep[1][t] = from_corner[t]+from_cornervector[t];
						bez_prep[2][t] = to_corner[t]-to_cornervector[t];
						bez_prep[3][t] = to_corner[t];
						bez_prep[4][t] = (from_colour[t]*3+to_colour[t])*0.35;
						bez_prep[5][t] = (from_colour[t]+3*to_colour[t])*0.35;
					}
					segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.5, bez_prep, cmute);	
					for(t=0;t<3;t++){
						bez_prep[0][t] = to_corner[t];
						bez_prep[1][t] = to_corner[t]+to_cornervector[t];
						bez_prep[2][t] = to_pos[t]-to_anglevector[t];
						bez_prep[3][t] = to_pos[t];
						bez_prep[4][t] = (from_colour[t]+3*to_colour[t])*0.35;
						bez_prep[5][t] = to_colour[t];
					}
					segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25, bez_prep, cmute);	
				}else if(corners[0]){
					for(t=0;t<3;t++){
						bez_prep[0][t] = from_pos[t];
						bez_prep[1][t] = from_pos[t]+from_anglevector[t];
						bez_prep[2][t] = from_corner[t]-from_cornervector[t];
						bez_prep[3][t] = from_corner[t];
						bez_prep[4][t] = from_colour[t];
						bez_prep[5][t] = (from_colour[t]*3+to_colour[t])*0.35;
					}
					segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25, bez_prep, cmute);	
					for(t=0;t<3;t++){
						bez_prep[0][t] = from_corner[t];
						bez_prep[1][t] = from_corner[t]+from_cornervector[t];
						bez_prep[2][t] = to_pos[t]-2*to_anglevector[t];
						bez_prep[3][t] = to_pos[t];
						bez_prep[4][t] = (from_colour[t]+3*to_colour[t])*0.35;
						bez_prep[5][t] = to_colour[t];
					}
					segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.75, bez_prep, cmute);	
				}else if(corners[1]){
					for(t=0;t<3;t++){
						bez_prep[0][t] = from_pos[t];
						bez_prep[1][t] = from_pos[t]+2*from_anglevector[t];
						bez_prep[2][t] = to_corner[t]-to_cornervector[t];
						bez_prep[3][t] = to_corner[t];
						bez_prep[4][t] = from_colour[t];
						bez_prep[5][t] = (from_colour[t]+3*to_colour[t])*0.35;
					}
					segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.75, bez_prep, cmute);	
					for(t=0;t<3;t++){
						bez_prep[0][t] = to_corner[t];
						bez_prep[1][t] = to_corner[t]+to_cornervector[t];
						bez_prep[2][t] = to_pos[t]-to_anglevector[t];
						bez_prep[3][t] = to_pos[t];
						bez_prep[4][t] = (from_colour[t]+3*to_colour[t])*0.35;
						bez_prep[5][t] = to_colour[t];
					}
					segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS*0.25, bez_prep, cmute);	
				}else{
					for(t=0;t<3;t++){
						bez_prep[0][t] = from_pos[t];
						bez_prep[1][t] = from_pos[t]+2*from_anglevector[t];
						bez_prep[2][t] = to_pos[t]-2*to_anglevector[t];
						bez_prep[3][t] = to_pos[t];
						bez_prep[4][t] = from_colour[t];
						bez_prep[5][t] = to_colour[t];
					}
					segment=draw_bezier(connection_number, segment, MAX_BEZIER_SEGMENTS, bez_prep, cmute);	
				}
			}
		}
	}
}

function draw_bezier(connection_number, segment, num_segments, bez_prep, cmute){
	var t, tt, i, ott;
	var p = [];
	for(t=0;t<=num_segments;t++){
		tt=t/num_segments;
		ott=1- tt;
		p[t] = [];
		for(i=0;i<3;i++){
			p[t][i] = ott*ott*ott*bez_prep[0][i] + 3*ott*ott*tt*bez_prep[1][i] + 3*ott*tt*tt*bez_prep[2][i] + tt*tt*tt*bez_prep[3][i];
		}
	}
	var col = [bez_prep[4][0], bez_prep[4][1], bez_prep[4][2]];
	var cold = [(bez_prep[5][0]-bez_prep[4][0])/num_segments, (bez_prep[5][1]-bez_prep[4][1])/num_segments, (bez_prep[5][2]-bez_prep[4][2])/num_segments];
	for(t=0;t<num_segments;t++){
		draw_cylinder(connection_number,segment, p[t], p[t+1], cmute, col);
		col[0]+=cold[0];
		col[1]+=cold[1];
		col[2]+=cold[2];
		segment++;
	}
	return segment;
}

function draw_cylinder(connection_number, segment, from_pos, to_pos, cmute,col){
/*	wires_sketch.glcolor(col[0],col[1],col[2],0.5);
	wires_sketch.gllinewidth(21);
	wires_sketch.moveto(from_pos);
	wires_sketch.lineto(to_pos);*/
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
		var rotY = -Math.acos(pos_dif[2]/seglength);
		var rotZ = Math.atan(pos_dif[1]/pos_dif[0]);
	
		if(from_pos[0]<=to_pos[0]) rotY	= -rotY;
		rotZ *= 57.29577951; //180/Math.PI;
		rotY *= 57.29577951; //180/Math.PI;
	}
	if(typeof wires[connection_number][segment] === 'undefined') {
		wires[connection_number][segment] = new JitterObject("jit.gl.gridshape","mainwindow");
		wires[connection_number][segment].shape = "opencylinder";
		wires[connection_number][segment].name = "wires-"+connection_number+"-"+segment;
		wires[connection_number][segment].dim = [5, 2]; //[3,2]cyl is ribbons, [5,2] cuboids
		//wires[connection_number][segment].blend_enable = 1;
	}
	wires[connection_number][segment].position = [ avg_pos[0], avg_pos[1], avg_pos[2] ];
	wires[connection_number][segment].scale = [wire_diaX,wire_diaY, seglength*0.52];
	wires[connection_number][segment].rotatexyz = [0, rotY, rotZ];
	var tmc=0.4;
	if(cmute) tmc -= 0.35*(segment*0.5==Math.floor(segment*0.5)); // stripey wires if muted
	tmc *= (1-0.8*selected.anysel*(0.3 - selected.wire[connection_number]));
//	post("\nsetting W_C",connection_number,segment);
//	post("col",col);
	wires_colours[connection_number][segment] = [col[0],col[1],col[2]];
	wires[connection_number][segment].color = [tmc*col[0],tmc*col[1],tmc*col[2], 0.7];
	wires[connection_number][segment].enable = 1;
}

function draw_connection_menu(){
	redraw_flag.targets=[];
	var mouse_index = 3;
	lcd_main.message("brgb", 0, 0, 0);
	lcd_main.message("clear");
	click_clear(0,0);
	var a = new Array(3);
	var menucolour = config.get("palette::menu");
	var matrixcolour = config.get("palette::connections::matrix");
	var hardwarecolour = config.get("palette::connections::hardware");
	var audiocolour = config.get("palette::connections::audio");
	var midicolour = config.get("palette::connections::midi");
	var parameterscolour = config.get("palette::connections::parameters");
	var hardwarecdark = [hardwarecolour[0]/2,hardwarecolour[1]/2,hardwarecolour[2]/2];
	var audiocdark = [audiocolour[0]/2,audiocolour[1]/2,audiocolour[2]/2];
	var midicdark = [midicolour[0]/2,midicolour[1]/2,midicolour[2]/2];
	var parameterscdark = [parameterscolour[0]/2,parameterscolour[1]/2,parameterscolour[2]/2];
	var blockcontroldark = [blockcontrolcolour[0]/2,blockcontrolcolour[1]/2,blockcontrolcolour[2]/2];
	var vdark = 1/6;
	var hardwarevdark = [hardwarecolour[0]*vdark,hardwarecolour[1]*vdark,hardwarecolour[2]*vdark];
	var audiovdark = [audiocolour[0]*vdark,audiocolour[1]*vdark,audiocolour[2]*vdark];
	var midivdark = [midicolour[0]*vdark,midicolour[1]*vdark,midicolour[2]*vdark];
	var parametersvdark = [parameterscolour[0]*vdark,parameterscolour[1]*vdark,parameterscolour[2]*vdark];
	var y_offset = 15;
	var from_block = connection_menu.get("from::number");
	var to_block = connection_menu.get("to::number");
	setfontsize(fontheight);
	lcd_main.message("textface", "bold");
	lcd_main.message("pensize", 2, 2);
	lcd_main.message("framerect", 9, 9, (fontheight*0.9+9),(fontheight+9),menucolour);
	lcd_main.message("paintrect", (fontheight*0.9+9+4), 9, (mainwindow_width-9),(fontheight+9),menudark);
	click_rectangle( 0, 0, (fontheight*0.9+9),(fontheight+9),1, 1);
	mouse_click_actions[1] = set_display_mode;
	mouse_click_parameters[1] = "blocks";
	lcd_main.message("moveto",(9+fontheight*0.2),(fontheight*0.85+9));
	lcd_main.message("write", "X");
	lcd_main.message("moveto",(mainwindow_width/2 - 4*fontheight),(fontheight*0.85 + 9));
	lcd_main.message("frgb", 0, 0, 0);
	lcd_main.message("write", "NEW", "CONNECTION");
	lcd_main.message("frgb",menucolour);
	setfontsize(fontheight*0.4);
	lcd_main.message("textface", "normal");
	lcd_main.message("moveto", 10,(1.85*fontheight+y_offset));
	lcd_main.message("write", "from");
	setfontsize(fontheight*0.8);
	lcd_main.message("textface","bold");
	lcd_main.message("write",blocks.get('blocks['+from_block+']::name'));
	lcd_main.message("textface","normal");
//	lcd_main.message("write",connection_menu.get("from::number"));
	lcd_main.message("moveto",(mainwindow_width/3 + 9),(1.85*fontheight+y_offset));
	setfontsize(fontheight*0.4);
	lcd_main.message("write", "to");
	setfontsize(fontheight*0.8);
	lcd_main.message("textface", "bold");	
	lcd_main.message("write",blocks.get('blocks['+to_block+']::name'));
	lcd_main.message("textface", "normal");
//	lcd_main.message("write",to_block);
	lcd_main.message("moveto", 10,(2.85*fontheight+y_offset));
	setfontsize(fontheight*0.4);
	lcd_main.message("write","voices");
	lcd_main.message("moveto",(mainwindow_width/3 + 9),(2.85*fontheight+y_offset));
	lcd_main.message("write", "voices");
	setfontsize(fontheight*0.8);
	var i=0;
	var t=0;
	lcd_main.message("textface", "bold");
	var tx=fontheight*2+9;
	if(new_connection.get("from::voice")!="all"){
		lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+1.7*fontheight-6),(3*fontheight+y_offset),menudarkest);
		lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
		lcd_main.message("frgb", menudark);
		lcd_main.message("write","ALL");
	}else{
		lcd_main.message("paintrect",(tx-6),( 2.1*fontheight+y_offset),(tx+1.7*fontheight-6),(3*fontheight+y_offset),menucolour);
		lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
		lcd_main.message("frgb", 0, 0, 0);
		lcd_main.message("write","ALL");		
		lcd_main.message("frgb",menucolour);
	}
	click_rectangle((tx-6),( 2*fontheight+y_offset),(tx+1.7*fontheight-6),(3*fontheight+y_offset+6),2, 1);
	mouse_click_actions[2] = new_connection_toggle_voice;
	mouse_click_parameters[2] = "from";
	mouse_click_values[2] = "all";
	tx+=fontheight*1.8;
	var w=1;
	connection_menu.replace("from::voices", blocks.get('blocks['+from_block+']::poly::voices'));
	connection_menu.replace("to::voices", blocks.get('blocks['+to_block+']::poly::voices'));
	for(i=1;i<=connection_menu.get("from::voices");i++){
		if(tx>(mainwindow_width/3-fontheight)) {
			tx=fontheight*2+9;
			y_offset += fontheight;
		}
		w = (i>9)*0.5+1;
		var voice_selected=0;
		if(new_connection.contains("from::voice")){
			var v_list = [];
			if(new_connection.gettype("from::voice")=="array"){
				v_list = new_connection.get("from::voice");
				for(t=0;t<v_list.length;t++){
					if(v_list[t]==i) voice_selected=1;
				}
			}else{
				if(new_connection.get("from::voice")==i) voice_selected=1;
			}
		}
		if(voice_selected==1){
			lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+(w-0.1)*fontheight-6),(3*fontheight+y_offset),menucolour);
			lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
			lcd_main.message("frgb", 0, 0, 0);
			lcd_main.message("write",i);	
			lcd_main.message("frgb",menucolour);		
		}else{
			lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+(w-0.1)*fontheight-6),(3*fontheight+y_offset),menudarkest);
			lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
			lcd_main.message("frgb", menudark);
			lcd_main.message("write",i);
		}
		click_rectangle((tx-6),(2*fontheight+y_offset),(tx+w*fontheight-6),(3*fontheight+y_offset),mouse_index, 1);
		mouse_click_actions[mouse_index] = new_connection_toggle_voice;
		mouse_click_parameters[mouse_index] = "from";
		mouse_click_values[mouse_index] = i;
		tx+=w*fontheight;
		mouse_index++;
	}
	//-+ buttons for polyphony
	var max_p = blocktypes.get(blocks.get("blocks["+from_block+"]::name")+"::max_polyphony");
	if(max_p ==0) {
		max_p=9999999999999;
	}
	if((max_p != 1)&&(blocks.get("blocks["+from_block+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+from_block+"]::name")+"::plugin_name")))){
		if(tx>mainwindow_width*0.333-2*fontheight){
			y_offset+=fontheight;
		}
		var current_p = blocks.get("blocks["+from_block+"]::poly::voices");
		tx = mainwindow_width*0.333-fontheight*0.9;
		if(current_p<max_p){
			lcd_main.message("paintrect",(tx),(2.1*fontheight+y_offset),(tx+0.9*fontheight),(3*fontheight+y_offset),menudarkest);
			lcd_main.message("moveto",tx+6,(2.85*fontheight+y_offset));
			lcd_main.message("frgb", menucolour);
			lcd_main.message("write","+");
			click_rectangle((tx),(2.1*fontheight+y_offset),(tx+0.9*fontheight),(3*fontheight+y_offset),mouse_index,1 );
			mouse_click_actions[mouse_index] = voicecount;
			mouse_click_parameters[mouse_index] = from_block;
			mouse_click_values[mouse_index] = ( current_p + 1);	
			mouse_index++;
			tx -= fontheight;
		}
		if(current_p>1){
			lcd_main.message("paintrect",(tx),(2.1*fontheight+y_offset),(tx+0.9*fontheight),(3*fontheight+y_offset),menudarkest);
			lcd_main.message("moveto",tx+6,(2.85*fontheight+y_offset));
			lcd_main.message("frgb", menucolour);
			lcd_main.message("write","-");
			click_rectangle((tx),(2.1*fontheight+y_offset),(tx+0.9*fontheight),(3*fontheight+y_offset),mouse_index,1 );
			mouse_click_actions[mouse_index] = voicecount;
			mouse_click_parameters[mouse_index] = from_block;
			mouse_click_values[mouse_index] = ( current_p - 1);	
			mouse_index++;
		}
	}
	tx=mainwindow_width/3 + fontheight*1.8+9;
	var left_y_offset=y_offset;
	y_offset=15;
	if((new_connection.get("to::voice")=="all") && (new_connection.contains("to::input"))){
		if((new_connection.get("to::input::number")==0)&&(new_connection.get("to::input::type")=="midi")){
			lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+2.2*fontheight-6),(3*fontheight+y_offset),menucolour);
			lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
			lcd_main.message("frgb", 0, 0, 0);
			lcd_main.message("write", "POLY");	
			lcd_main.message("frgb",menucolour);	
			click_rectangle((tx-6),(2*fontheight+y_offset),(tx+2.2*fontheight-6),(3*fontheight+y_offset),mouse_index, 1);
			tx+=fontheight*2.2+2;
		}else if((new_connection.get("to::input::type")=="block")){
			lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+2.5*fontheight-6),(3*fontheight+y_offset),menucolour);
			lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
			lcd_main.message("frgb", 0, 0, 0);
			lcd_main.message("write", "BLOCK");	
			lcd_main.message("frgb",menucolour);	
			click_rectangle((tx-6),(2*fontheight+y_offset),(tx+2.5*fontheight-6),(3*fontheight+y_offset),mouse_index, 1);
			tx+=fontheight*2.2+2;
		}else{
			lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+1.8*fontheight-6),(3*fontheight+y_offset),menucolour);
			lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
			lcd_main.message("frgb", 0, 0, 0);
			lcd_main.message("write", "ALL");	
			lcd_main.message("frgb",menucolour);	
			click_rectangle((tx-6),(2*fontheight+y_offset),(tx+1.8*fontheight-6),(3*fontheight+y_offset),mouse_index, 1);
			tx+=fontheight*1.8+2;
		}
	}else{
		if((new_connection.contains("to::input"))&&(new_connection.get("to::input::type")=="midi")){
			lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+2.2*fontheight-6),(3*fontheight+y_offset),menudarkest);
			lcd_main.message("frgb", menudark);
			lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
			lcd_main.message("write", "POLY");
			click_rectangle((tx-6),(2*fontheight+y_offset),(tx+2.2*fontheight-6),(3*fontheight+y_offset),mouse_index, 1);
			tx+=fontheight*2.2+2;
		}else if((new_connection.contains("to::input"))&&(new_connection.get("to::input::type")=="block")){
			lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+2.5*fontheight-6),(3*fontheight+y_offset),menucolour);
			lcd_main.message("frgb", 0,0,0);
			lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
			lcd_main.message("write", "BLOCK");
			click_rectangle((tx-6),(2*fontheight+y_offset),(tx+2.5*fontheight-6),(3*fontheight+y_offset),mouse_index, 1);
			new_connection.replace("to::voice","all");
			tx+=fontheight*2.2+2;
		}else{
			lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+1.8*fontheight-6),(3*fontheight+y_offset),menudarkest);
			lcd_main.message("frgb", menudark);
			lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
			lcd_main.message("write", "ALL");
			click_rectangle((tx-6),(2*fontheight+y_offset),(tx+1.8*fontheight-6),(3*fontheight+y_offset),mouse_index, 1);
			tx+=fontheight*1.8+2;	
		}
	}
	mouse_click_actions[mouse_index] = new_connection_toggle_voice;
	mouse_click_parameters[mouse_index] = "to";
	mouse_click_values[mouse_index] = "all";
	mouse_index++;
	if(!((new_connection.contains("to::input"))&&(new_connection.get("to::input::type")=="block"))){
		for(i=1;i<=connection_menu.get("to::voices");i++){
			if(tx>(mainwindow_width-2*fontheight)) {
				tx=mainwindow_width/2+fontheight*2.5+9;
				y_offset += fontheight;
			}
			w = (i>9)*0.5+1;
			var voice_selected=0;
			if(new_connection.contains("to::voice")){
				var v_list = [];
				if(new_connection.gettype("to::voice")=="array"){
					v_list = new_connection.get("to::voice");
					for(t=0;t<v_list.length;t++){
						if(v_list[t]==i) voice_selected=1;
					}
				}else{
					if(new_connection.get("to::voice")==i) voice_selected=1;
				}
			}
			if(voice_selected==1){
				lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+(w-0.1)*fontheight-6),(3*fontheight+y_offset),menucolour);
				lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
				lcd_main.message("frgb", 0, 0, 0);
				lcd_main.message("write",i);
				lcd_main.message("frgb",menucolour);
			}else{
				lcd_main.message("paintrect",(tx-6),(2.1*fontheight+y_offset),(tx+(w-0.1)*fontheight-6),(3*fontheight+y_offset),menudarkest);
				lcd_main.message("frgb", menudark);
				lcd_main.message("moveto",tx,(2.85*fontheight+y_offset));
				lcd_main.message("write",i);
			}
			click_rectangle((tx-6),(2*fontheight+y_offset),(tx+w*fontheight-6),(3*fontheight+y_offset),mouse_index, 1);
			mouse_click_actions[mouse_index] = new_connection_toggle_voice;
			mouse_click_parameters[mouse_index] = "to";
			mouse_click_values[mouse_index] = i;
			mouse_index++;
			tx+=w*fontheight;
		}
		//-+ buttons for polyphony
		var max_p = blocktypes.get(blocks.get("blocks["+to_block+"]::name")+"::max_polyphony");
		if(max_p ==0) {
			max_p=9999999999999;
		}
		if((max_p != 1)&&(blocks.get("blocks["+to_block+"]::type")!="hardware")&&((!blocktypes.contains(blocks.get("blocks["+to_block+"]::name")+"::plugin_name")))){
			if(tx>mainwindow_width*0.666-2*fontheight){
				y_offset+=fontheight;
			}
			var current_p = blocks.get("blocks["+to_block+"]::poly::voices");
			tx = mainwindow_width*0.666-fontheight*0.9;
			if(current_p<max_p){
				lcd_main.message("paintrect",(tx),(2.1*fontheight+y_offset),(tx+0.9*fontheight),(3*fontheight+y_offset),menudarkest);
				lcd_main.message("moveto",tx+6,(2.85*fontheight+y_offset));
				lcd_main.message("frgb", menucolour);
				lcd_main.message("write","+");
				click_rectangle((tx),(2.1*fontheight+y_offset),(tx+0.9*fontheight),(3*fontheight+y_offset),mouse_index,1 );
				mouse_click_actions[mouse_index] = voicecount;
				mouse_click_parameters[mouse_index] = to_block;
				mouse_click_values[mouse_index] = ( current_p + 1);	
				mouse_index++;
				tx -= fontheight;
			}
			if(current_p>1){
				lcd_main.message("paintrect",(tx),(2.1*fontheight+y_offset),(tx+0.9*fontheight),(3*fontheight+y_offset),menudarkest);
				lcd_main.message("moveto",tx+6,(2.85*fontheight+y_offset));
				lcd_main.message("frgb", menucolour);
				lcd_main.message("write","-");
				click_rectangle((tx),(2.1*fontheight+y_offset),(tx+0.9*fontheight),(3*fontheight+y_offset),mouse_index,1 );
				mouse_click_actions[mouse_index] = voicecount;
				mouse_click_parameters[mouse_index] = to_block;
				mouse_click_values[mouse_index] = ( current_p - 1);	
				mouse_index++;
			}
		}
	}
	if(left_y_offset>y_offset) y_offset=left_y_offset;
	lcd_main.message("textface", "normal");
	setfontsize(fontheight*0.4);
	lcd_main.message("frgb",menucolour);
	lcd_main.message("moveto", 10,(3.85*fontheight+y_offset));
	lcd_main.message("write", "outputs");
	lcd_main.message("moveto",(mainwindow_width/3+9),(3.85*fontheight+y_offset));
	lcd_main.message("write", "inputs");
	setfontsize(fontheight*0.8);
	var row=3.85;
	var typetest=0;
	var output_selected=0;
	var hastype = new_connection.contains("from::output::type") && new_connection.contains("from::output::number");
//	var matrix_chosen_l = 0;
//	var matrix_chosen_r = 0;
	var viewoffset=connection_menu.get("from::viewoffset");
	if(viewoffset>0){
		//you've scrolled, draw the up arrow.
		lcd_main.message("frgb",menucolour);	
		lcd_main.message("paintpoly", (fontheight*4.5+3),((row+0.15)*fontheight+y_offset),(fontheight*6.5+3),((row+0.15)*fontheight+y_offset),(fontheight*5.5+3),((row-0.75)*fontheight+y_offset),(fontheight*4.5+3),((row+0.15)*fontheight+y_offset));
		click_rectangle((fontheight*4+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3-9),((row+0.15)*fontheight+y_offset),mouse_index, 1);
		mouse_click_actions[mouse_index] = connection_menu_scroll;
		mouse_click_parameters[mouse_index] = "from";
		mouse_click_values[mouse_index] = -1;
		mouse_index++;
		row+=1;
	}
	if(connection_menu.contains("from::connections::matrix")){
		lcd_main.message("frgb",matrixcolour);
		var la = [];
		if(connection_menu.gettype("from::connections::matrix")=="array"){
			la = connection_menu.get("from::connections::matrix");
		}else{
			la[0] = connection_menu.get("from::connections::matrix");
		}
		for(i=0;i<la.length;i++){
			typetest=0;
			if(hastype)	typetest=(new_connection.get("from::output::type")=="matrix" && new_connection.get("from::output::number")==i);
			if(typetest) output_selected=1;
			if(viewoffset>0){
				viewoffset--;
			}else if((row>=17)&&(row<=18)){
				lcd_main.message("frgb",menucolour);
				lcd_main.message("paintpoly",(fontheight*4.5+3),((row-0.75)*fontheight+y_offset),(fontheight*6.5+3),((row-0.75)*fontheight+y_offset),(fontheight*5.5+3),((row+0.15)*fontheight+y_offset),(fontheight*4.5+3),((row-0.75)*fontheight+y_offset));
				click_rectangle((fontheight*4+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/2-4*fontheight),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_menu_scroll;
				mouse_click_parameters[mouse_index] = "from";
				mouse_click_values[mouse_index] = 1;
				mouse_index++;
				row+=1;
			}else if(row<17){
				if(typetest){
					lcd_main.message("paintrect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3-9),((row+0.15)*fontheight+y_offset));
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					lcd_main.message("frgb", matrixcolour);	
					matrix_chosen_l=1;
				}else{
					lcd_main.message("framerect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3-9),((row+0.15)*fontheight+y_offset));
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);
				}
				click_rectangle((fontheight*2+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3-9),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_output;
				mouse_click_parameters[mouse_index] = "matrix";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
			}
		}
	}
	if(connection_menu.contains("from::connections::hardware")){
		lcd_main.message("frgb", hardwarecolour);
		var la = [];
		if(connection_menu.gettype("from::connections::hardware")=="array"){
			la = connection_menu.get("from::connections::hardware");
		}else{
			la[0] = connection_menu.get("from::connections::hardware");
		}
		for(i=0;i<la.length;i++){
			typetest=0;
			if(hastype)	typetest=(new_connection.get("from::output::type")=="hardware" && new_connection.get("from::output::number")==i);
			if(typetest) output_selected=1;
			if(viewoffset>0){
				viewoffset--;
			}else if((row>=17)&&(row<=18)){
				lcd_main.message("frgb",menucolour);
				lcd_main.message("paintpoly",(fontheight*4.5+3),((row-0.75)*fontheight+y_offset),(fontheight*6.5+3),((row-0.75)*fontheight+y_offset),(fontheight*5.5+3),((row+0.15)*fontheight+y_offset),(fontheight*4.5+3),((row-0.75)*fontheight+y_offset));
				click_rectangle((fontheight*4+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3-9),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_menu_scroll;
				mouse_click_parameters[mouse_index] = "from";
				mouse_click_values[mouse_index] = 1;
				mouse_index++;
				row+=1;
			}else if(row<17){
				if(typetest){
					lcd_main.message("paintrect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset), hardwarecolour);
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width/3-1.8*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","hardware");
					lcd_main.message("frgb",hardwarecolour);			
				}else{
					lcd_main.message("paintrect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),hardwarevdark);
					lcd_main.message("frgb",hardwarecdark);
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width/3-1.8*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","hardware");
					lcd_main.message("frgb",hardwarecolour);	
				}
				setfontsize(fontheight*0.8);
				click_rectangle((fontheight*2+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_output;
				mouse_click_parameters[mouse_index] = "hardware";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
			}
		}
	}
	if(connection_menu.contains("from::connections::audio")){
		lcd_main.message("frgb",audiocolour);
		var la = [];
		if(connection_menu.gettype("from::connections::audio")=="array"){
			la = connection_menu.get("from::connections::audio");
		}else{
			la[0] = connection_menu.get("from::connections::audio");
		}
		for(i=0;i<la.length;i++){
			typetest=0;
			if(hastype)	typetest=(new_connection.get("from::output::type")=="audio" && new_connection.get("from::output::number")==i);
			if(typetest) output_selected=1;
			if(viewoffset>0){
				viewoffset--;
			}else if((row>=17)&&(row<=18)){
				lcd_main.message("frgb",menucolour);
				lcd_main.message("paintpoly",(fontheight*4.5+3),((row-0.75)*fontheight+y_offset),(fontheight*6.5+3),((row-0.75)*fontheight+y_offset),(fontheight*5.5+3),((row+0.15)*fontheight+y_offset),(fontheight*4.5+3),((row-0.75)*fontheight+y_offset));
				click_rectangle((fontheight*4+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3-9),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_menu_scroll;
				mouse_click_parameters[mouse_index] = "from";
				mouse_click_values[mouse_index] = 1;
				mouse_index++;
				row+=1;
			}else if(row<17){
				if(typetest){
					lcd_main.message("paintrect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),audiocolour);
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width/3-1.2*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","audio");
					lcd_main.message("frgb",audiocolour);			
				}else{
					lcd_main.message("paintrect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),audiovdark);
					lcd_main.message("frgb",audiocdark);
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width/3-1.2*fontheight),(row-0.4)*fontheight+y_offset);
					//lcd_main.message("frgb",audiocdark);			
					lcd_main.message("write","audio");
					lcd_main.message("frgb",audiocolour);			
				}
				setfontsize(fontheight*0.8);
				click_rectangle((fontheight*2+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_output;
				mouse_click_parameters[mouse_index] = "audio";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
			}
		}
	}
	if(connection_menu.contains("from::connections::midi")){
		lcd_main.message("frgb",midicolour);
		var la = [];
		if(connection_menu.gettype("from::connections::midi")=="array"){
			la = connection_menu.get("from::connections::midi");
		}else{
			la[0] = connection_menu.get("from::connections::midi");
		}
		for(i=0;i<la.length;i++){
			typetest=0;
			if(hastype)	typetest=(new_connection.get("from::output::type")=="midi" && new_connection.get("from::output::number")==i);
			if(typetest) output_selected=1;
			if(viewoffset>0){
				viewoffset--;
			}else if((row>=17)&&(row<=18)){
				lcd_main.message("frgb",menucolour);
				lcd_main.message("paintpoly",(fontheight*4.5+3),((row-0.75)*fontheight+y_offset),(fontheight*6.5+3),((row-0.75)*fontheight+y_offset),(fontheight*5.5+3),((row+0.15)*fontheight+y_offset),(fontheight*4.5+3),((row-0.75)*fontheight+y_offset));
				click_rectangle((fontheight*4+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3-9),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_menu_scroll;
				mouse_click_parameters[mouse_index] = "from";
				mouse_click_values[mouse_index] = 1;
				mouse_index++;
				row+=1;
			}else if(row<17){
				if(typetest){
					lcd_main.message("paintrect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),midicolour);
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width/3-0.9*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","midi");
					lcd_main.message("frgb",midicolour);
				}else{
					lcd_main.message("paintrect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),midivdark);
					lcd_main.message("frgb",midicdark);
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width/3-0.9*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","midi");
				}
				setfontsize(fontheight*0.8);
				click_rectangle((fontheight*2+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_output;
				mouse_click_parameters[mouse_index] = "midi";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
			}
		}
	}
	if(connection_menu.contains("from::connections::parameters")){
		lcd_main.message("frgb",parameterscolour);
		var la = [];
		if(connection_menu.gettype("from::connections::parameters")=="array"){
			la = connection_menu.get("from::connections::parameters");
		}else{
			la[0] = connection_menu.get("from::connections::parameters");
		}
		for(i=0;i<la.length;i++){
			typetest=0;
			if(hastype)	typetest=(new_connection.get("from::output::type")=="parameters" && new_connection.get("from::output::number")==i);
			if(typetest) output_selected=1;
			if(viewoffset>0){
				viewoffset--;
			}else{
				if(typetest){
					lcd_main.message("paintrect",(fontheight*4.5+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),parameterscolour);
					lcd_main.message("moveto",(fontheight*4.5+9),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width/2-6*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","parameter");
					lcd_main.message("frgb",parameterscolour);
				}else{
					lcd_main.message("paintrect",(fontheight*2+3),((row-0.75)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),parametersvdark);
					lcd_main.message("frgb",parameterscdark);					
					lcd_main.message("moveto",(fontheight*2+9),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width/2-6*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","parameter");
				}
				setfontsize(fontheight*0.8);
				click_rectangle((fontheight*2+3),((row-0.85)*fontheight+y_offset),(mainwindow_width/3),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_output;
				mouse_click_parameters[mouse_index] = "parameters";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
			}
		}
	}
	row=3.85;
	var viewoffset=connection_menu.get("to::viewoffset");
	if(viewoffset>0){
		//you've scrolled, draw the up arrow.
		lcd_main.message("frgb",menucolour);	
		lcd_main.message("paintpoly", (mainwindow_width/2+fontheight*1.5+12),((row+0.15)*fontheight+y_offset),(mainwindow_width/2+fontheight*3.5+12),((row+0.15)*fontheight+y_offset),(mainwindow_width/2+fontheight*2.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*1.5+12),((row+0.15)*fontheight+y_offset));
		click_rectangle((mainwindow_width/2+fontheight*1.5+12),((row-0.85)*fontheight+y_offset),(mainwindow_width-9),((row+0.15)*fontheight+y_offset),mouse_index, 1);
		mouse_click_actions[mouse_index] = connection_menu_scroll;
		mouse_click_parameters[mouse_index] = "to";
		mouse_click_values[mouse_index] = -1;
		mouse_index++;
		row+=1;
	}
	//post("\nconn menu start");

	hastype = new_connection.contains("to::input::type") && new_connection.contains("to::input::number");
	var connection_params_y=0;
	if(connection_menu.contains("to::connections::matrix")){
		lcd_main.message("frgb",matrixcolour);
		var la = [];
		if(connection_menu.gettype("to::connections::matrix")=="array"){
			la = connection_menu.get("to::connections::matrix");
		}else{
			la[0] = connection_menu.get("to::connections::matrix");
		}
		for(i=0;i<la.length;i++){
			typetest=0;
			if(hastype)	typetest=(new_connection.get("to::input::type")=="matrix" && new_connection.get("to::input::number")==i);
			if(typetest) output_selected=1;
			if(viewoffset>0){
				viewoffset--;
			}else if((row>=17)&&(row<=18)){
				lcd_main.message("frgb",menucolour);
				lcd_main.message("paintpoly",(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*3.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*2.5+12),((row+0.15)*fontheight+y_offset),(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset));
				click_rectangle((mainwindow_width/2+fontheight*1+12),((row-0.85)*fontheight+y_offset),mainwindow_width,((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_menu_scroll;
				mouse_click_parameters[mouse_index] = "to";
				mouse_click_values[mouse_index] = 1;
				mouse_index++;
				row+=1;
			}else if(row<17){
				if(typetest){
					lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width-9),((row+0.15)*fontheight+y_offset));
					lcd_main.message("moveto",(mainwindow_width/2+fontheight*1.5+18),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					lcd_main.message("frgb",matrixcolour);
				}else{
					lcd_main.message("framerect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width-9),((row+0.15)*fontheight+y_offset));
					lcd_main.message("moveto",(mainwindow_width/2+fontheight*1.5+18),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);				
				}
				click_rectangle((mainwindow_width/3 + fontheight*1.8+3),((row-0.85)*fontheight+y_offset),(mainwindow_width-9),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_input;
				mouse_click_parameters[mouse_index] = "matrix";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
				if(typetest && output_selected){
					connection_params_y = row;
	//				row += 3;
				}
			}
		}
	}
	if(connection_menu.contains("to::connections::hardware")){
		lcd_main.message("frgb",hardwarecolour);
		var la = [];
		if(connection_menu.gettype("to::connections::hardware")=="array"){
			la = connection_menu.get("to::connections::hardware");
		}else{
			la[0] = connection_menu.get("to::connections::hardware");
		}
		for(i=0;i<la.length;i++){
			if(viewoffset>0){
				viewoffset--;
			}else if((row>=17)&&(row<=18)){
				lcd_main.message("frgb",menucolour);
				lcd_main.message("paintpoly",(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*3.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*2.5+12),((row+0.15)*fontheight+y_offset),(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset));
				click_rectangle((mainwindow_width/2+fontheight*1+12),((row-0.85)*fontheight+y_offset),mainwindow_width,((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_menu_scroll;
				mouse_click_parameters[mouse_index] = "to";
				mouse_click_values[mouse_index] = 1;
				mouse_index++;
				row+=1;
			}else if(row<17){
				typetest=0;
				if(hastype)	typetest=(new_connection.get("to::input::type")=="hardware" && new_connection.get("to::input::number")==i);
				if(typetest){
					lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),hardwarecolour);
					lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width*0.666-1.9*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","hardware");
					lcd_main.message("frgb",hardwarecolour);
				}else{
					lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),hardwarevdark);
					lcd_main.message("frgb",hardwarecdark);					
					lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);				
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width*0.666-1.9*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","hardware");
				}
				setfontsize(fontheight*0.8);
				click_rectangle((mainwindow_width/3 + fontheight*1.8+3),((row-0.85)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_input;
				mouse_click_parameters[mouse_index] = "hardware";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
				if(typetest && output_selected){
					connection_params_y = row;
	//				row += 3;
				}
			}
		}
	}
	if(connection_menu.contains("to::connections::audio")){
		lcd_main.message("frgb",audiocolour);
		var la = [];
		if(connection_menu.gettype("to::connections::audio")=="array"){
			la = connection_menu.get("to::connections::audio");
		}else{
			la[0] = connection_menu.get("to::connections::audio");
		}
		for(i=0;i<la.length;i++){
			if(viewoffset>0){
				viewoffset--;
			}else if((row>=17)&&(row<=18)){
				lcd_main.message("frgb",menucolour);
				lcd_main.message("paintpoly",(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*3.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*2.5+12),((row+0.15)*fontheight+y_offset),(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset));
				click_rectangle((mainwindow_width/2+fontheight*1+12),((row-0.85)*fontheight+y_offset),mainwindow_width,((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_menu_scroll;
				mouse_click_parameters[mouse_index] = "to";
				mouse_click_values[mouse_index] = 1;
				mouse_index++;
				row+=1;
			}else if(row<17){
				typetest=0;
				if(hastype)	typetest=(new_connection.get("to::input::type")=="audio" && new_connection.get("to::input::number")==i);
				if(typetest){
					lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),audiocolour);
					lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width*0.666-1.2*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","audio");
					lcd_main.message("frgb",audiocolour);
				}else{
					lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),audiovdark);
					lcd_main.message("frgb",audiocdark);					
					lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);				
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width*0.666-1.2*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","audio");
				}
				setfontsize(fontheight*0.8);
				click_rectangle((mainwindow_width/3 + fontheight*1.8+3),((row-0.85)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_input;
				mouse_click_parameters[mouse_index] = "audio";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
				if(typetest && output_selected){
					connection_params_y = row;
//					row += 3;
				}
			}
		}
	}
	if(connection_menu.contains("to::connections::midi")){
		lcd_main.message("frgb",midicolour);
		var la = [];
		if(connection_menu.gettype("to::connections::midi")=="array"){
			la = connection_menu.get("to::connections::midi");
		}else{
			la[0] = connection_menu.get("to::connections::midi");
		}
		for(i=0;i<la.length;i++){
			if(viewoffset>0){
				viewoffset--;
			}else if((row>=17)&&(row<=18)){
				lcd_main.message("frgb",menucolour);
				lcd_main.message("paintpoly",(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*3.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*2.5+12),((row+0.15)*fontheight+y_offset),(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset));
				click_rectangle((mainwindow_width/2+fontheight*1+12),((row-0.85)*fontheight+y_offset),mainwindow_width,((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_menu_scroll;
				mouse_click_parameters[mouse_index] = "to";
				mouse_click_values[mouse_index] = 1;
				mouse_index++;
				row+=1;
			}else if(row<17){
				typetest=0;
				if(hastype)	typetest=(new_connection.get("to::input::type")=="midi" && new_connection.get("to::input::number")==i);
				if(typetest){
					lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),midicolour);
					lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
					lcd_main.message("frgb", 0, 0, 0);
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width*0.666-0.9*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","midi");
					lcd_main.message("frgb",midicolour);
				}else{
					lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),midivdark);
					lcd_main.message("frgb",midicdark);
					lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
					lcd_main.message("write",la[i]);
					setfontsize(fontheight*0.4);
					lcd_main.message("moveto",(mainwindow_width*0.666-0.9*fontheight),(row-0.4)*fontheight+y_offset);
					lcd_main.message("write","midi");
				}
				setfontsize(fontheight*0.8);
				click_rectangle((mainwindow_width/3 + fontheight*1.8+3),((row-0.85)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),mouse_index, 1);
				mouse_click_actions[mouse_index] = new_connection_select_input;
				mouse_click_parameters[mouse_index] = "midi";
				mouse_click_values[mouse_index] = i;
				mouse_index++;
				row+=1;
				if(typetest && output_selected){
					connection_params_y = row;
//					row += 3;
				}
			}
		}
	}
	if(connection_menu.contains("to::connections::parameters")){
		lcd_main.message("frgb",parameterscolour);
		var la = [];
		if(connection_menu.gettype("to::connections::parameters")=="array"){
			la = connection_menu.get("to::connections::parameters");
		}else{
			la[0] = connection_menu.get("to::connections::parameters");
		}
		for(i=0;i<la.length;i++){
			if(la[i]!="nomap"){
				if(viewoffset>0){
					viewoffset--;
				}else if((row>=17)&&(row<=18)){
					lcd_main.message("frgb",menucolour);
					lcd_main.message("paintpoly",(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*3.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*2.5+12),((row+0.15)*fontheight+y_offset),(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset));
					click_rectangle((mainwindow_width/2+fontheight*1+12),((row-0.85)*fontheight+y_offset),mainwindow_width,((row+0.15)*fontheight+y_offset),mouse_index, 1);
					mouse_click_actions[mouse_index] = connection_menu_scroll;
					mouse_click_parameters[mouse_index] = "to";
					mouse_click_values[mouse_index] = 1;
					mouse_index++;
					row+=1;
				}else if(row<17){
					typetest=0;
					if(hastype)	typetest=(new_connection.get("to::input::type")=="parameters" && new_connection.get("to::input::number")==i);
					if(typetest){
						lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),parameterscolour);
						lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
						lcd_main.message("frgb", 0, 0, 0);
						lcd_main.message("write",la[i]);
						setfontsize(fontheight*0.4);
						lcd_main.message("moveto",(mainwindow_width*0.666-2*fontheight),(row-0.4)*fontheight+y_offset);
						lcd_main.message("write","parameter");
						lcd_main.message("frgb",parameterscolour);
					}else{
						lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),parametersvdark);
						lcd_main.message("frgb",parameterscdark);
						lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
						lcd_main.message("write",la[i]);
						setfontsize(fontheight*0.4);
						lcd_main.message("moveto",(mainwindow_width*0.666-2*fontheight),(row-0.4)*fontheight+y_offset);
						lcd_main.message("write","parameter");
					}
					setfontsize(fontheight*0.8);
					click_rectangle((mainwindow_width/3 + fontheight*1.8+3),((row-0.85)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),mouse_index, 1);
					mouse_click_actions[mouse_index] = new_connection_select_input;
					mouse_click_parameters[mouse_index] = "parameters";
					mouse_click_values[mouse_index] = i;
					mouse_index++;
					row+=1;
					if(typetest && output_selected){
						connection_params_y = row;
//						if(new_connection.get("from::output::type")!="matrix") row += 3;
					}
				}
			}
		}
	}

	if(connection_menu.contains("to::connections::block")){
		lcd_main.message("frgb",blockcontrolcolour);
		var la = [];
		if(connection_menu.gettype("to::connections::block")=="array"){
			la = connection_menu.get("to::connections::block");
		}else{
			la[0] = connection_menu.get("to::connections::block");
		}
		for(i=0;i<la.length;i++){
			if(la[i]!="nomap"){
				if(viewoffset>0){
					viewoffset--;
				}else if((row>=17)&&(row<=18)){
					lcd_main.message("frgb",menucolour);
					lcd_main.message("paintpoly",(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*3.5+12),((row-0.75)*fontheight+y_offset),(mainwindow_width/2+fontheight*2.5+12),((row+0.15)*fontheight+y_offset),(mainwindow_width/2+fontheight*1.5+12),((row-0.75)*fontheight+y_offset));
					click_rectangle((mainwindow_width/2+fontheight*1+12),((row-0.85)*fontheight+y_offset),mainwindow_width,((row+0.15)*fontheight+y_offset),mouse_index, 1);
					mouse_click_actions[mouse_index] = connection_menu_scroll;
					mouse_click_parameters[mouse_index] = "to";
					mouse_click_values[mouse_index] = 1;
					mouse_index++;
					row+=1;
				}else if(row<17){
					typetest=0;
					if(hastype)	typetest=(new_connection.get("to::input::type")=="block" && new_connection.get("to::input::number")==i);
					if(typetest){
						lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),blockcontrolcolour);
						lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
						lcd_main.message("frgb", 0, 0, 0);
						lcd_main.message("write",la[i]);
						setfontsize(fontheight*0.4);
						lcd_main.message("moveto",(mainwindow_width*0.666-2.8*fontheight),(row-0.4)*fontheight+y_offset);
						lcd_main.message("write","block control");
						lcd_main.message("frgb",blockcontrolcolour);
					}else{
						lcd_main.message("paintrect",(mainwindow_width/3 + fontheight*1.8+3),((row-0.75)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),blockcontroldark[0]/2,blockcontroldark[1]/2,blockcontroldark[2]/2);
						lcd_main.message("frgb",blockcontroldark);
						lcd_main.message("moveto",(mainwindow_width/3+fontheight*1.8+9),(row*fontheight+y_offset));
						lcd_main.message("write",la[i]);
						setfontsize(fontheight*0.4);
						lcd_main.message("moveto",(mainwindow_width*0.666-2.8*fontheight),(row-0.4)*fontheight+y_offset);
						lcd_main.message("write","block control");
					}
					setfontsize(fontheight*0.8);
					click_rectangle((mainwindow_width/3 + fontheight*1.8+3),((row-0.85)*fontheight+y_offset),(mainwindow_width*0.666),((row+0.15)*fontheight+y_offset),mouse_index, 1);
					mouse_click_actions[mouse_index] = new_connection_select_input;
					mouse_click_parameters[mouse_index] = "block";
					mouse_click_values[mouse_index] = i;
					mouse_index++;
					row+=1;
					if(typetest && output_selected){
						connection_params_y = row;
//						if(new_connection.get("from::output::type")!="matrix") row += 3;
					}
				}
			}
		}
	}


	if(connection_params_y>0){
		var mute = new_connection.get("conversion::mute");
		var scale = new_connection.get("conversion::scale");
		var vector = new_connection.get("conversion::vector");
		var offset = new_connection.get("conversion::offset");
		var offset2 = new_connection.get("conversion::offset2");
		
		var col=new Array(3);
		if(new_connection.get("to::input::type")=="audio"){
			col = audiocolour;
		}else if(new_connection.get("to::input::type")=="hardware"){
			col = hardwarecolour;
		}else if(new_connection.get("to::input::type")=="matrix"){
			col = matrixcolour;
		}else if(new_connection.get("to::input::type")=="midi"){
			col = midicolour;
		}else if(new_connection.get("to::input::type")=="block"){
			col = blockcontrolcolour;
		}else if(new_connection.get("to::input::type")=="parameters"){
			col = parameterscolour;
		}
		if(mute){
			lcd_main.message("paintrect",(mainwindow_width*0.666+9),((connection_params_y-2.75)*fontheight+y_offset),(mainwindow_width*0.833-4),((connection_params_y-1.85)*fontheight+y_offset),col[0],col[1],col[2]);
			lcd_main.message("frgb", 0, 0, 0);
			lcd_main.message("moveto",(mainwindow_width*0.666+15),((connection_params_y-2)*fontheight+y_offset));
			lcd_main.message("write", "mute");
			lcd_main.message("frgb",col[0],col[1],col[2]);
		}else{
			lcd_main.message("paintrect",(mainwindow_width*0.666+9),((connection_params_y-2.75)*fontheight+y_offset),(mainwindow_width*0.666+fontheight*3),((connection_params_y-1.85)*fontheight+y_offset),col[0]*vdark,col[1]*vdark,col[2]*vdark);
			lcd_main.message("frgb", col[0],col[1],col[2]);
			lcd_main.message("moveto",(mainwindow_width*0.666+15),((connection_params_y-2)*fontheight+y_offset));
			lcd_main.message("write","mute");
		}
		click_rectangle((mainwindow_width*0.666+9),((connection_params_y-2.75)*fontheight+y_offset),(mainwindow_width*0.833-4),((connection_params_y-1.85)*fontheight+y_offset),mouse_index, 1);
		mouse_click_actions[mouse_index] = setup_new_connection;
		mouse_click_parameters[mouse_index] = "conversion::mute";
		mouse_click_values[mouse_index] = (1-mute);
		mouse_index++;
		
		if((new_connection.get("from::output::type")!="matrix")&&(!new_connection.contains("conversion::force_unity"))){
			draw_h_slider((mainwindow_width*0.666+9),((connection_params_y-1.75)*fontheight+y_offset),(mainwindow_width*0.889-4),((connection_params_y-0.85)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,scale);
			lcd_main.message("moveto",(mainwindow_width*0.889+5),((connection_params_y-1.7)*fontheight+y_offset));
			setfontsize(fontheight*0.3);
			lcd_main.message("write", "gain");
			setfontsize(fontheight*0.8);
			lcd_main.message("moveto",(mainwindow_width*0.889+5),((connection_params_y-1)*fontheight+y_offset));
			lcd_main.message("write",gain_display(scale)); //.toPrecision(2)+"x");
			mouse_click_actions[mouse_index] = setup_new_connection;
			mouse_click_parameters[mouse_index] = "conversion::scale";
			mouse_click_values[mouse_index] = 0;
			mouse_index++;
			click_rectangle((mainwindow_width*0.889-4),((connection_params_y-1.75)*fontheight+y_offset),mainwindow_width,((connection_params_y-0.75)*fontheight+y_offset),mouse_index, 1);
			mouse_click_actions[mouse_index] = config_toggle_gain_display_format;
			mouse_click_parameters[mouse_index] = 0;
			mouse_click_values[mouse_index] = 0;
			mouse_index++;
		}
		var v1;
		var v2;
		var nv1;
		var nv2;
		if(new_connection.get("from::output::type")=="hardware"){
			if((new_connection.get("to::input::type")=="hardware")||(new_connection.get("to::input::type")=="audio")){
				nv1 = new_connection.get("from::voice");
				if(new_connection.gettype("from::voice")!="array"){
					if(new_connection.get("from::voice")=="all"){
						v1 = connection_menu.get("from::voices");
					}else{
						v1 = 1;
					}
				}else{
					v1 = nv1.length;
				}
				nv2 = new_connection.get("to::voice");
				if(new_connection.gettype("to::voice")!="array"){
					if(new_connection.get("to::voice")=="all"){
						v2 = connection_menu.get("to::voices");
					}else{
						v2 = 1;
					}
				}else{
					v2 = nv2.length;
				}
				
				draw_spread((mainwindow_width*0.666+9),((connection_params_y+1.5)*fontheight+y_offset),(mainwindow_width*0.833-4),((connection_params_y+1.5)*fontheight+y_offset+mainwindow_width*0.166 - 18),col[0],col[1],col[2],mouse_index,vector,offset,v1,v2);				
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::vector";
				mouse_click_values[mouse_index] = "conversion::offset";
				mouse_index++;
				draw_spread_levels((mainwindow_width*0.833+5),((connection_params_y+1.5)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+1.5)*fontheight+y_offset+mainwindow_width*0.166 - 18),col[0],col[1],col[2],mouse_index,vector,offset,v1,v2,scale);
			}else if((new_connection.get("to::input::type")=="midi") || (new_connection.get("to::input::type")=="block")){
				draw_vector((mainwindow_width-fontheight*5.9-9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9-3*fontheight),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,vector);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::vector";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				draw_2d_slider((mainwindow_width-fontheight*2.9-9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,offset,offset2);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::offset";
				mouse_click_values[mouse_index] = "conversion::offset2";
				mouse_index++;
				lcd_main.message("moveto", (mainwindow_width-9-2.7*fontheight), ((connection_params_y+1.0)*fontheight+y_offset));
				if(offset<0.5){
					lcd_main.message("write", (Math.floor(offset*256)-128));
				}else{
					lcd_main.message("write", "+"+(Math.floor(offset*256)-128));
				}
				lcd_main.message("moveto", (mainwindow_width-9-2.7*fontheight), ((connection_params_y+2)*fontheight+y_offset));
				if(offset2<0.5){
					lcd_main.message("write", (Math.floor(offset2*256)-128));
				}else{
					lcd_main.message("write", "+"+(Math.floor(offset2*256)-128));
				}
			}else if(new_connection.get("to::input::type")=="parameters"){
				draw_h_slider((mainwindow_width-9-fontheight*5.9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,2*offset-1);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::offset";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
			}
		}else if(new_connection.get("from::output::type")=="audio"){
			if((new_connection.get("to::input::type")=="hardware")||(new_connection.get("to::input::type")=="audio")){
				if(new_connection.contains("conversion::force_unity")){

				}else{
					nv1 = new_connection.get("from::voice");
					if(new_connection.gettype("from::voice")!="array"){
						if(new_connection.get("from::voice")=="all"){
							v1 = connection_menu.get("from::voices");
						}else{
							v1 = 1;
						}
					}else{
						v1 = nv1.length;
					}
					nv2 = new_connection.get("to::voice");
					if(new_connection.gettype("to::voice")!="array"){
						if(new_connection.get("to::voice")=="all"){
							v2 = connection_menu.get("to::voices");
						}else{
							v2 = 1;
						}
					}else{
						v2 = nv2.length;
					}	
					draw_spread((mainwindow_width*0.666+9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width*0.888-4),((connection_params_y-0.75)*fontheight+y_offset+mainwindow_width*0.222-13),col[0],col[1],col[2],mouse_index,vector,offset,v1,v2);
					mouse_click_actions[mouse_index] = setup_new_connection;
					mouse_click_parameters[mouse_index] = "conversion::vector";
					mouse_click_values[mouse_index] = "conversion::offset";
					mouse_index++;
					draw_spread_levels((mainwindow_width*0.889+5),((connection_params_y-0.75)*fontheight+y_offset+mainwindow_width*0.111-13),(mainwindow_width-9),((connection_params_y-0.75)*fontheight+y_offset+mainwindow_width*0.222-13),col[0],col[1],col[2],mouse_index,vector,offset,v1,v2,scale);
				}
			}else if((new_connection.get("to::input::type")=="midi") || (new_connection.get("to::input::type")=="block")){
				draw_vector((mainwindow_width-fontheight*5.9-9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9-3*fontheight),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,vector);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::vector";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				draw_2d_slider((mainwindow_width-2.9*fontheight-9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,offset,offset2);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::offset";
				mouse_click_values[mouse_index] = "conversion::offset2";
				mouse_index++;
				lcd_main.message("moveto", (mainwindow_width-9-2.7*fontheight), ((connection_params_y+1.0)*fontheight+y_offset));
				if(offset<0.5){
					lcd_main.message("write", (Math.floor(offset*256)-128));
				}else{
					lcd_main.message("write", "+"+(Math.floor(offset*256)-128));
				}
				lcd_main.message("moveto", (mainwindow_width-9-2.7*fontheight), ((connection_params_y+2)*fontheight+y_offset));
				if(offset2<0.5){
					lcd_main.message("write", (Math.floor(offset2*256)-128));
				}else{
					lcd_main.message("write", "+"+(Math.floor(offset2*256)-128));
				}
			}else if(new_connection.get("to::input::type")=="parameters"){
				draw_h_slider((mainwindow_width-fontheight*5.9-9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,2*offset-1);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::offset";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
			}
		}else if(new_connection.get("from::output::type")=="midi"){
			if((new_connection.get("to::input::type")=="midi") || (new_connection.get("to::input::type")=="block")){
				draw_2d_slider((mainwindow_width-9-fontheight*5.9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9-3*fontheight),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,offset,offset2);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::offset";
				mouse_click_values[mouse_index] = "conversion::offset2";
				mouse_index++;			
				lcd_main.message("moveto", (mainwindow_width-9-2.7*fontheight), ((connection_params_y+1.0)*fontheight+y_offset));
				if(offset<0.5){
					lcd_main.message("write", (Math.floor(offset*256)-128));
				}else{
					lcd_main.message("write", "+"+(Math.floor(offset*256)-128));
				}
				lcd_main.message("moveto", (mainwindow_width-9-2.7*fontheight), ((connection_params_y+2)*fontheight+y_offset));
				if(offset2<0.5){
					lcd_main.message("write", (Math.floor(offset2*256)-128));
				}else{
					lcd_main.message("write", "+"+(Math.floor(offset2*256)-128));
				}
			}else if(new_connection.get("to::input::type")=="parameters"){
				draw_vector((mainwindow_width-9-fontheight*5.9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9-3*fontheight),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,vector);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::vector";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				draw_h_slider((mainwindow_width-9-fontheight*2.9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,2*offset-1);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::offset";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;			
			}else if((new_connection.get("to::input::type")=="audio")||(new_connection.get("to::input::type")=="hardware")){
				draw_vector((mainwindow_width-9-fontheight*5.9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9-3*fontheight),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,vector);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::vector";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				draw_h_slider((mainwindow_width-9-fontheight*2.9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,2*offset-1);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::offset";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;			
			}
		}else if(new_connection.get("from::output::type")=="parameters"){
			if((new_connection.get("to::input::type")=="midi") || (new_connection.get("to::input::type")=="block")){
				draw_vector((mainwindow_width-9-fontheight*5.9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9-3*fontheight),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,vector);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::vector";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				draw_2d_slider((mainwindow_width-fontheight*2.9+9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,offset,offset2);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::offset";
				mouse_click_values[mouse_index] = "conversion::offset2";
				mouse_index++;			
				lcd_main.message("moveto", (mainwindow_width-9-2.7*fontheight), ((connection_params_y+1.0)*fontheight+y_offset));
				if(offset<0.5){
					lcd_main.message("write", (Math.floor(offset*256)-128));
				}else{
					lcd_main.message("write", "+"+(Math.floor(offset*256)-128));
				}
				lcd_main.message("moveto", (mainwindow_width-9-2.7*fontheight), ((connection_params_y+2)*fontheight+y_offset));
				if(offset2<0.5){
					lcd_main.message("write", (Math.floor(offset2*256)-128));
				}else{
					lcd_main.message("write", "+"+(Math.floor(offset2*256)-128));
				}
			}else if(new_connection.get("to::input::type")=="parameters"){
				draw_h_slider((mainwindow_width-fontheight*5.9-9),((connection_params_y-0.75)*fontheight+y_offset),(mainwindow_width-9),((connection_params_y+2.15)*fontheight+y_offset),col[0],col[1],col[2],mouse_index,vector);
				mouse_click_actions[mouse_index] = setup_new_connection;
				mouse_click_parameters[mouse_index] = "conversion::vector";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;			
			}			
		}
		lcd_main.message("paintrect",(mainwindow_width-5*fontheight-4),0,(mainwindow_width),(9+fontheight),0, 0, 0);
		lcd_main.message("paintrect",(mainwindow_width-5*fontheight), 9 ,(mainwindow_width-9),(9+fontheight),menucolour);
		click_rectangle((mainwindow_width-5*fontheight),0,(mainwindow_width-9),(9+fontheight),mouse_index, 1);
		lcd_main.message("frgb", 0, 0, 0);
		lcd_main.message("moveto",(mainwindow_width-5*fontheight+4),(9+fontheight*0.85));
		lcd_main.message("textface", "bold");
		setfontsize(fontheight);
		lcd_main.message("write", "CREATE>>");
		lcd_main.message("textface", "normal");
//	setfontsize(fontheight);
		mouse_click_actions[mouse_index] = create_connection_button;
		mouse_click_parameters[mouse_index] = 0;
		mouse_click_values[mouse_index] = 0;
		mouse_index++;			
	}
	
	lcd_main.message("bang");
	//outlet(8,"bang");
}


function set_sidebar_mode(mode){
	if((mode=="block")&&(usermouse.ctrl)){
		mode = "edit_label";
		sidebar.lastmode = -1;
		usermouse.ctrl = 0;
	} 
	post("sidebar mode",mode);
	if(mode!=sidebar.mode){
		sidebar.scroll.position = 0;
		sidebar.scroll.max = 0;
		if(mode=="block"){
			sidebar.scopes.voice = -1;//causes it to ask te right block to display a scope
		}else{
			audio_to_data_poly.setvalue(0,"vis_scope",0);
		}
		sidebar.mode = mode;
		if(mode=="file_menu"){
			displaymode="blocks";
			camera();
			redraw_flag.flag  |= 4;
		}
	}
	redraw_flag.flag |= 2;
}

function clear_screens(){
	//lcd_main.message("brgb", 0, 0, 0);
	lcd_main.message("brgb", 0, 0, 0);
	if(displaymode=="panels"){
		mouse_index=2;
		click_clear(1,1);
		mouse_click_actions[1] = panels_bg_click;
		mouse_click_parameters[1] = 0;
		mouse_click_values[1] = 0;
	}else{
		mouse_index=1;
		click_clear(0,0);
		mouse_click_actions[0] = "none";
		mouse_click_parameters[0] = 0;
		mouse_click_values[0] = 0;		
	}
	lcd_main.message("clear"); //lcd_main.message("clear");
	mouse_index++;
}

function draw_topbar(){
	//post("\ndraw topbar");
	setfontsize(fontheight/3.2);
	lcd_main.message("textface", "bold");
	lcd_main.message("pensize", 2, 2);
	lcd_main.message("frgb",menucolour);

	var x_o=0, i;
	
	//play
	
	if(usermouse.clicked2d == mouse_index){
		lcd_main.message("paintrect", 9, 9, 9 + fontheight, 9+fontheight, menucolour);
	}else if(!(still_checking_polys&3)){
		lcd_main.message("paintrect", 9, 9, 9 + fontheight, 9+fontheight, menudarkest);
	}else{
		lcd_main.message("paintrect", 9, 9, 9 + fontheight, 9+fontheight, 64,64,64);
	}
	if(!playing){
		lcd_main.message("frgb" , menudark);
		lcd_main.message("paintpoly",9 + fontheight*0.2, 9+ fontheight*0.2, 9 + fontheight*0.8, 9+fontheight/2, 9 + fontheight*0.2, fontheight*0.8+9, 9 + fontheight*0.2, 9+ fontheight*0.2);
	}else{
		lcd_main.message("frgb" , menucolour);			
		lcd_main.message("paintpoly", 9 + fontheight*0.2, 9+ fontheight*0.2, 9 + fontheight*0.8, 9+fontheight/2, 9 + fontheight*0.2, fontheight*0.8+9, 9 + fontheight*0.2, 9+ fontheight*0.2);
	}	
	click_rectangle( 9, 9, 9 + fontheight, 9+fontheight, mouse_index, 6);
	mouse_click_actions[mouse_index] = [play_button_click, play_button_release];
	mouse_click_parameters[mouse_index] = "";
	mouse_click_values[mouse_index] = "";
	mouse_index++;

	for(i=0;i<meter_positions[0][2].length;i++){
		click_rectangle( meter_positions[0][2][i][0]-1, meter_positions[0][2][i][1]-1, meter_positions[0][2][i][0]+6, meter_positions[0][2][i][2], mouse_index, 1);
		mouse_click_actions[mouse_index] = hw_meter_click;
		mouse_click_parameters[mouse_index] = i;
		mouse_click_values[mouse_index] = "in";
		mouse_index++;
	}
	for(i=0;i<meter_positions[1][2].length;i++){
		click_rectangle( meter_positions[1][2][i][0]-1, meter_positions[1][2][i][1]-1, meter_positions[1][2][i][0]+6, meter_positions[1][2][i][2], mouse_index, 1);
		mouse_click_actions[mouse_index] = hw_meter_click;
		mouse_click_parameters[mouse_index] = i;
		mouse_click_values[mouse_index] = "out";
		mouse_index++;
	}
	draw_cpu_meter();


	x_o = 1.3 + 4*(MAX_USED_AUDIO_INPUTS+MAX_USED_AUDIO_OUTPUTS)/fontheight;//4.8;
	click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight, mouse_index, 1 );
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
	mouse_click_actions[mouse_index] = resync_button;
	mouse_click_parameters[mouse_index] = "";
	mouse_click_values[mouse_index] = "";
	mouse_index++;
	x_o+=1.1;
	
	click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight, mouse_index, 1 );
	if(usermouse.clicked2d == mouse_index){
		lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight,20,255,20 );
		lcd_main.message("frgb", 0,0,0);
	}else{
		lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1), 9+fontheight,menudarkest );
	}
	lcd_main.message("frgb", menucolour);
	lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
	lcd_main.message("write", "all");
	lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
	lcd_main.message("write", "off");
	mouse_click_actions[mouse_index] = panic_button;
	mouse_click_parameters[mouse_index] = "";
	mouse_click_values[mouse_index] = "";
	mouse_index++;
	x_o+=1.1;
	if(displaymode != "loading"){

		click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.6), 9+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = set_display_mode;
		if(displaymode == "panels"){
			mouse_click_parameters[mouse_index] = "panels";
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.6), 9+fontheight,menucolour );
			lcd_main.message("frgb", 0,0,0);
		}else if(displaymode == "panels_edit"){
			mouse_click_parameters[mouse_index] = "panels";
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.6), 9+fontheight,menucolour[2],menucolour[1], menucolour[0] );
			lcd_main.message("frgb", 0,0,0);
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
			lcd_main.message("write", "edit");
		}else{
			mouse_click_parameters[mouse_index] = "panels";		
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.6), 9+fontheight,menudarkest );
			lcd_main.message("frgb", menucolour);
		}
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
		lcd_main.message("write", "panels");
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		x_o+=1.7;
		//here, add some spare space, if any
	
		click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.4), 9+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = set_display_mode;
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
		if(displaymode == "blocks"){
			mouse_click_parameters[mouse_index] = "flocks";
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.4), 9+fontheight,menucolour );
			lcd_main.message("frgb", 0,0,0);
			lcd_main.message("write", "blocks");
		}else if(displaymode == "flocks"){
			mouse_click_parameters[mouse_index] = "blocks";
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.4), 9+fontheight,255,50,200 );
			lcd_main.message("frgb", 0,0,0);
			lcd_main.message("write", "flocks");
		}else{
			mouse_click_parameters[mouse_index] = "blocks";		
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.4), 9+fontheight,menudarkest );
			lcd_main.message("frgb", menucolour);
			lcd_main.message("write", "blocks");
		}
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		x_o+=1.5;
	
		click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = set_display_mode;
		if(displaymode == "waves"){
			mouse_click_parameters[mouse_index] = "blocks";
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight,menucolour );
			lcd_main.message("frgb", 0,0,0);
		}else{
			mouse_click_parameters[mouse_index] = "waves";		
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight,menudarkest );
			lcd_main.message("frgb", menucolour);
		}
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
		lcd_main.message("write", "waves");
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		x_o+=1.3;
		sidebar.editbtn_x = x_o*fontheight + 9;
		sidebar.editbtn_index = mouse_index;
		mouse_index++;
		
		if(sidebar.editbtn!=0){
			click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editbtn_index,1);
			mouse_click_actions[sidebar.editbtn_index] = set_display_mode;
			if(displaymode=="custom"){
				lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editcolour);
				lcd_main.message("frgb" , sidebar.editdark);
				mouse_click_parameters[sidebar.editbtn_index] = "custom_fullscreen";
			}else if(displaymode=="custom_fullscreen"){
				lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editcolour);
				lcd_main.message("frgb" , sidebar.editdark);
				mouse_click_parameters[sidebar.editbtn_index] = "custom";
			}else{
				lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editdark);
				lcd_main.message("frgb" , sidebar.editcolour);
				mouse_click_parameters[sidebar.editbtn_index] = "custom";
			}
			//mouse_click_values[mouse_index] = sidebar.selected;
			//mouse_index++;
			lcd_main.message("moveto" ,sidebar.editbtn_x+fontheight*0.1, 9+fontheight*0.75);
			lcd_main.message("write", "edit");		
		}
		
		
		x_o+=1.1;
	
		click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = set_sidebar_mode;
		if(sidebar.mode == "file_menu"){
			mouse_click_parameters[mouse_index] = "none";
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight,192,192,192 );
			lcd_main.message("frgb", 0,0,0);
		}else{
			mouse_click_parameters[mouse_index] = "file_menu";	
			var	darkgrey = (menudarkest[0]+menudarkest[1]+menudarkest[2])/3;
			lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.2), 9+fontheight, darkgrey,darkgrey,darkgrey);
			lcd_main.message("frgb", 192,192,192);
		}
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
		lcd_main.message("write", "load/");
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
		lcd_main.message("write", "save");
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		x_o+=1.4;
	
		var cll = config.getsize("palette::gamut");
		var c = new Array(3);
		// draw a button for each possible state
		for(i=-1;i<MAX_STATES;i++){
			var statecontents;
			if(i == -1){
				statecontents = states.contains("states::current");
			}else{
				statecontents = states.contains("states::"+i);
			}
			//if(usermouse.left_button == 0) state_fade.position = -1; //feels a bit hacky, can we do this in the state_xfade fn?
			if(statecontents){
				if((state_fade.position>-1) && (state_fade.selected == i)){ //draw a slider instead
					c = menucolour;
					lcd_main.message("framerect",9+fontheight*x_o, 9, 9+fontheight*(x_o+1.1), mainwindow_height - 9,c )
					c2 = config.get("palette::gamut["+Math.floor(i*cll/MAX_STATES)+"]::colour");
					lcd_main.message("paintrect",9+fontheight*x_o+4, 9+(mainwindow_height-18-fontheight)*(1 - state_fade.position), 9+fontheight*(x_o+1.1)-4, 9+fontheight+(mainwindow_height-18-fontheight)*(1-state_fade.position),c[0]*(state_fade.position-1)+c2[0]*state_fade.position,c[1]*(state_fade.position-1)+c2[1]*state_fade.position,c[2]*(state_fade.position-1)+c2[2]*state_fade.position );
					click_rectangle( 9+fontheight*x_o, 9, 9+fontheight*(x_o+1.2), mainwindow_height - 9,mouse_index,2 );							
					post("\nfader index",mouse_index);
					mouse_click_actions[mouse_index] = whole_state_xfade;
					mouse_click_parameters[mouse_index] = i;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					x_o+=1.2;					
				}else{
					var clicked=0;
					if(usermouse.clicked2d==mouse_index) clicked=1;
					if(i == -1){
						c = menucolour;
						lcd_main.message("framerect", 9+fontheight*x_o-clicked, 9-clicked, 9+fontheight*(x_o+1.1)+clicked, fontheight + 9+clicked,c );		
						lcd_main.message("moveto",9 + fontheight*(x_o+0.3), 9+fontheight*0.75);
						lcd_main.message("write", "init");					
					}else{
						c = config.get("palette::gamut["+Math.floor(i*cll/MAX_STATES)+"]::colour");
						lcd_main.message("paintrect", 9+fontheight*x_o-clicked, 9-clicked, 9+fontheight*(x_o+1.1)+clicked, fontheight + 9+clicked,c );		
						if(states.contains("names::"+i)){
							var sn=states.get("names::"+i);
							sn = sn.split(".");
							if(!Array.isArray(sn)) sn = [sn];
							for(var si=0;si<sn.length;si++){
								lcd_main.message("moveto",9 + fontheight*(x_o+1.15-0.2*sn[si].length), 9+fontheight*(1-0.25*(sn.length-si)));
								lcd_main.message("frgb", 0,0,0); //c[0]*bg_dark_ratio,c[1]*bg_dark_ratio,c[2]*bg_dark_ratio);
								lcd_main.message("write",sn[si]);
							}
						}					
					}
					click_rectangle( 9+fontheight*x_o, 9, 9+fontheight*(x_o+1.2), fontheight + 9,mouse_index,6 );							
					mouse_click_actions[mouse_index] = [fire_whole_state_btn_click,fire_whole_state_btn_release];
					mouse_click_parameters[mouse_index] = i;
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					x_o+=1.2;
				}
			}
		}
		if(anymuted){
			x_o+=0.2;
			if(usermouse.clicked2d == mouse_index){
				lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.4), 9+fontheight,0,0,0 );
				lcd_main.message("frgb", menucolour);		
			}else{
				lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.4), 9+fontheight,menudarkest );
				lcd_main.message("frgb", menucolour);		
			}
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
			lcd_main.message("write", "unmute");
			lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
			lcd_main.message("write", "all");			
			click_rectangle( 9 + fontheight*x_o, 9, 9+fontheight*(x_o+1.6), 9+fontheight,mouse_index,1 );
			mouse_click_actions[mouse_index] = mute_all_blocks;
			mouse_click_parameters[mouse_index] = "unmute";
			mouse_click_values[mouse_index] = 0;
			mouse_index++;
			x_o+=1.6;
		}
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
	}else{
		mouse_click_parameters[mouse_index] = "none"; // this is a bodge, the progress bar is quite meaningless..
		lcd_main.message("framerect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+10), 9+fontheight,192,192,192 );
		lcd_main.message("paintrect", 9 + fontheight*x_o, 9, 9+fontheight*(x_o+10*(loading.progress/(MAX_BLOCKS+4*loading.mapping.length+2))), 9+fontheight,192,192,192 );
		lcd_main.message("frgb", 0,0,0);		
		//lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.5);
		lcd_main.message("moveto", 9 + fontheight*(x_o+0.2), 9+fontheight*0.75);
		lcd_main.message("write", "loading");
		//lcd_main.message("write", "-ing");
		mouse_index++;
		if(songs.contains(songlist[currentsong]+"::notepad")){ //TODO - it should swap topbar for progress meter, clear the songlist and write out the notes in its place
			var hint = songs.get(songlist[currentsong]+"::notepad");
			lcd_main.message("paintrect", sidebar.x, 9, mainwindow_width-9 ,mainwindow_height -9,64,64,64);
			lcd_main.message("frgb", menucolour);
			var y_offset=9+fontheight;
			lcd_main.message("moveto", sidebar.x+fontheight*0.2, y_offset);
			setfontsize(fontheight/1.6);
			lcd_main.message("write", "SONG NOTES");
			
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			lcd_main.message("textface", "normal");
			// this is copied from the 'help' display. £ is newline * is bold
			var hintrows = 0.4+ hint.length / 27+hint.split("£").length-1;
			var rowstart=0;
			var rowend=20;
			hint = hint+"                       ";
			var bold=0;
			var sameline=0;
			for(var ri=0;ri<hintrows;ri++){
				while((hint[rowend]!=' ') && (rowend>1+rowstart)){ rowend--; }
				var sliced = hint.slice(rowstart,rowend);
				if(!sameline) {
					lcd_main.message("moveto",sidebar.x+fontheight*0.2,y_offset+fontheight*(0.75+0.6*ri));
				}else{
					ri--;
				}
				sameline=0;					
				var newlineind = sliced.indexOf("£");
				var boldind = sliced.indexOf("*");		
				if((boldind>-1)&&(newlineind>-1)){
					if(boldind<newlineind){
						newlineind=-1;
					}else{
						boldind=-1;
					}
				}		
				if(newlineind>-1){
					rowend = rowstart+ sliced.indexOf("£");
					sliced = hint.slice(rowstart,rowend);
					sameline=0;
				}
				if(boldind>-1){
					sameline=1;
					bold=1-bold;
					rowend = rowstart+ sliced.indexOf("*");
					sliced = hint.slice(rowstart,rowend);
				}
				lcd_main.message("write",sliced);
				if(!sameline){
					rowstart=rowend+1;
					rowend+=20;
				}else{
					var t = rowstart+20;
					rowstart=rowend+1
					rowend=t;
				}
				if(bold){
					lcd_main.message("textface", "bold");
				}else{
					lcd_main.message("textface", "normal");
				}	
			}
			if(!bold) lcd_main.message("textface", "bold");
		}
	}
	
}

function draw_sidebar(){	
	//post("\ndraw sidebar",sidebar.mode);
	sidebar.scroll.max = 0;
	if(sidebar.mode!=sidebar.lastmode) sidebar.scroll.position = 0;
	selected.block_count =0;
	selected.wire_count = 0;
	var block_colour, block_dark, block_darkest;
	var i,t;
	var y_offset=0;
//		redraw_flag.targets = [];
	for(i=0;i<selected.block.length;i++){
		selected.block_count += selected.block[i];
	}
	for(i=0;i<selected.wire.length;i++){
		selected.wire_count += selected.wire[i];
	}
	if(selected.block_count!=1){
		if(automap.mapped_k!=-1){
			note_poly.setvalue( automap.available_k, "maptarget", "none");
			automap.mapped_k=-1;
		}
	}
	var has_params=0;
	var block;
	if(sidebar.mode!="none"){
		click_rectangle(sidebar.x,0,mainwindow_width,mainwindow_height,mouse_index,0);
		mouse_click_actions[mouse_index] = "none";
		mouse_click_parameters[mouse_index] = "";
		mouse_click_values[mouse_index] = "";	
		mouse_index++;
	}

	click_rectangle(mainwindow_width-9,0,mainwindow_width,mainwindow_height,mouse_index,2);
	mouse_click_actions[mouse_index] = scroll_sidebar;
	mouse_click_parameters[mouse_index] = "";
	mouse_click_values[mouse_index] = "";	
	mouse_index++;
	y_offset = 9 - sidebar.scroll.position;
	if(sidebar.mode == "edit_label"){
		// EDIT BLOCK LABEL ##############################################################################################################
		block = sidebar.selected;
		if(block<0){
			sidebar.mode = "none";
			return(0);
		}
		var block_name = blocks.get("blocks["+block+"]::name");
		var block_label = blocks.get("blocks["+block+"]::label");
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		block_colour = [Math.min(block_colour[0]*1.5,255),Math.min(block_colour[1]*1.5,255),Math.min(block_colour[2]*1.5,255)];
		block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
		block_darkest = [block_colour[0]*bg_dark_ratio, block_colour[1]*bg_dark_ratio, block_colour[2]*bg_dark_ratio];
		
		if(sidebar.mode != sidebar.lastmode){
			sidebar.lastmode = sidebar.mode;
			audio_to_data_poly.setvalue(0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			text_being_editted = block_label;
		}
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,block_colour);
		click_rectangle( sidebar.x, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,mouse_index,1);
		mouse_click_actions[mouse_index] = set_sidebar_mode;
		mouse_click_parameters[mouse_index] = "block";
		mouse_click_values[mouse_index] = "";	
		mouse_index++;
		lcd_main.message("frgb" , 0,0,0);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		if(text_being_editted.length<15) setfontsize(fontheight/1.6);
		lcd_main.message("write", text_being_editted);
		setfontsize(fontheight/3.2);
		y_offset+=1.1*fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*5.5,fontheight+y_offset,block_darkest);
		lcd_main.message("frgb" , block_colour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "edit this block's label");
		lcd_main.message("paintrect", sidebar.x+fontheight*5.6, y_offset, sidebar.x+fontheight*6.9,fontheight+y_offset,block_dark);
		click_rectangle( sidebar.x+fontheight*5.6, y_offset, sidebar.x+fontheight*6.9,fontheight+y_offset,mouse_index,1);
		mouse_click_actions[mouse_index] = set_sidebar_mode;
		mouse_click_parameters[mouse_index] = "block";
		mouse_click_values[mouse_index] = "";	
		mouse_index++;				
		lcd_main.message("paintrect", sidebar.x+fontheight*7, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,block_dark);
		click_rectangle( sidebar.x+fontheight*7, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,mouse_index,1);
		mouse_click_actions[mouse_index] = edit_label;
		mouse_click_parameters[mouse_index] = "ok";
		mouse_click_values[mouse_index] = "";	
		mouse_index++;				
		lcd_main.message("frgb" , 255,255,255);
		lcd_main.message("moveto" ,sidebar.x+fontheight*5.8, fontheight*0.75+y_offset);
		lcd_main.message("write", "cancel");
		lcd_main.message("moveto" ,sidebar.x+fontheight*7.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "ok");


		
	}else if(sidebar.mode == "edit_state"){
		// EDIT STATE  ##############################################################################################################
		var cll = config.getsize("palette::gamut");
		var state = sidebar.selected;
		if(state<0){
			sidebar.mode = "none";
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
			audio_to_data_poly.setvalue(0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			text_being_editted = state_label;
		}
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,block_colour);
		click_rectangle( sidebar.x, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,mouse_index,1);
		mouse_click_actions[mouse_index] = set_sidebar_mode;
		mouse_click_parameters[mouse_index] = "none";
		mouse_click_values[mouse_index] = "";	
		mouse_index++;
		lcd_main.message("frgb" , 255,255,255);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		if(text_being_editted.length<15) setfontsize(fontheight/1.6);
		lcd_main.message("write", text_being_editted);
		setfontsize(fontheight/3.2);
		y_offset+=1.1*fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*5.5,fontheight+y_offset,block_darkest);
		lcd_main.message("frgb" , block_colour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "type to edit state label");
		lcd_main.message("paintrect", sidebar.x+fontheight*5.6, y_offset, sidebar.x+fontheight*6.9,fontheight+y_offset,block_dark);
		click_rectangle( sidebar.x+fontheight*5.6, y_offset, sidebar.x+fontheight*6.9,fontheight+y_offset,mouse_index,1);
		mouse_click_actions[mouse_index] = set_sidebar_mode;
		mouse_click_parameters[mouse_index] = "none";
		mouse_click_values[mouse_index] = "";	
		mouse_index++;				
		lcd_main.message("paintrect", sidebar.x+fontheight*7, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,block_dark);
		click_rectangle( sidebar.x+fontheight*7, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,mouse_index,1);
		mouse_click_actions[mouse_index] = edit_state_label;
		mouse_click_parameters[mouse_index] = "ok";
		mouse_click_values[mouse_index] = "";	
		mouse_index++;				
		lcd_main.message("frgb" , 255,255,255);
		lcd_main.message("moveto" ,sidebar.x+fontheight*5.8, fontheight*0.75+y_offset);
		lcd_main.message("write", "cancel");
		lcd_main.message("moveto" ,sidebar.x+fontheight*7.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "ok");

		y_offset+=2.1*fontheight;
		lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width - 9,fontheight+y_offset,block_darkest);
		lcd_main.message("frgb" , block_colour);
		lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "click to copy this state into another:");
		
		y_offset += 1.1* fontheight;
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
			if(sc!=sidebar.selected){
				c = config.get("palette::gamut["+Math.floor(sc*cll/MAX_STATES)+"]::colour");
				lcd_main.message("paintrect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,c );							
				if(stateexists) lcd_main.message("framerect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,menucolour );
				if(slotfilled) lcd_main.message("framerect", sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,255,0,0 );
				click_rectangle( sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,mouse_index,1 );							
				mouse_click_actions[mouse_index] = add_to_state;
				mouse_click_parameters[mouse_index] = sc;
				mouse_click_values[mouse_index] = block;
				mouse_index++;
				if(states.contains("names::"+sc)){
					var sn=states.get("names::"+sc);
					sn = sn.split(".");
					if(!Array.isArray(sn)) sn = [sn];
					for(var si=0;si<sn.length;si++){
						lcd_main.message("moveto",9 + fontheight*(statex+0.9-0.2*sn[si].length), y_offset+fontheight*(1-0.25*(sn.length-si)));
						lcd_main.message("frgb", block_darkest);
						lcd_main.message("write",sn[si]);
					}
				}	
			}
			statex+=1;
			if(statex>7){
				y_offset += 1* fontheight;
				statex=0;
			}
		}
		y_offset += 1.1* fontheight;

		lcd_main.message("paintrect", sidebar.x+fontheight*5, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,block_dark);
		click_rectangle( sidebar.x+fontheight*5, y_offset, sidebar.x+fontheight*8,fontheight+y_offset,mouse_index,1);
		mouse_click_actions[mouse_index] = delete_state;
		mouse_click_parameters[mouse_index] = sidebar.selected;
		mouse_click_values[mouse_index] = -1;	
		mouse_index++;				
		lcd_main.message("frgb" , 255,60,60);
		lcd_main.message("moveto" ,sidebar.x+fontheight*5.2, fontheight*0.75+y_offset);
		lcd_main.message("write", "delete state");
		
	}else if(sidebar.mode == "file_menu"){
		// FILE MENU ##############################################################################################################
		var cavg = (menudarkest[0]+menudarkest[1]+menudarkest[2])/3;
		var	greydarkest = [cavg,cavg,cavg];
		cavg = (menucolour[0]+menucolour[1]+menucolour[2])/3;
		var greycolour = [cavg,cavg,cavg];
		var file_menu_x = mainwindow_width - 9 - fontheight * 15;
		if(sidebar.mode != sidebar.lastmode){
			sidebar.lastmode = sidebar.mode;
			audio_to_data_poly.setvalue(0,"vis_scope", 0);
			remove_midi_scope();
			redraw_flag.targets=[];
			sidebar.selected = -1;
			read_songs_folder();
		}
		setfontsize(fontheight/1.6);
		lcd_main.message("paintrect", file_menu_x, y_offset, file_menu_x+fontheight*2.1, y_offset+fontheight,greydarkest );
		click_rectangle( file_menu_x, y_offset, file_menu_x+fontheight*2.2, y_offset+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = load_song;
		mouse_click_parameters[mouse_index] = "";
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		if(!playing){
			lcd_main.message("frgb" , greycolour);
		}else{
			if(danger_button == mouse_index){
				lcd_main.message("frgb" , 255,50,50);
			}else{
				lcd_main.message("frgb" , greycolour[0], greycolour[1]*0.3, greycolour[2]*0.2);
			}
		}
		lcd_main.message("moveto", file_menu_x + fontheight*0.2, y_offset+fontheight*0.75);
		lcd_main.message("write", "load");

		lcd_main.message("paintrect", file_menu_x + fontheight*2.2, y_offset, file_menu_x+fontheight*4.3, y_offset+fontheight,greydarkest );
		click_rectangle( file_menu_x + fontheight*2.2, y_offset, file_menu_x+fontheight*4.4, y_offset+fontheight,mouse_index,1 );
		mouse_click_actions[mouse_index] = merge_song;
		mouse_click_parameters[mouse_index] = "";
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		lcd_main.message("frgb" , greycolour);
		lcd_main.message("moveto", file_menu_x + fontheight*2.4, y_offset+fontheight*0.75);
		lcd_main.message("write", "merge");
		
		if(selected.block.indexOf(1)!=-1){
			lcd_main.message("paintrect", file_menu_x + fontheight*4.4, y_offset, file_menu_x+fontheight*6.5, y_offset+fontheight,greydarkest );
			click_rectangle( file_menu_x + fontheight*4.4, y_offset, file_menu_x+fontheight*6.6, y_offset+fontheight,mouse_index,1 );
			lcd_main.message("frgb" , greycolour);
			mouse_click_actions[mouse_index] = save_song;
			mouse_click_parameters[mouse_index] = 1;
			mouse_click_values[mouse_index] = "";
			mouse_index++;
			setfontsize(fontheight/3.2);
			lcd_main.message("moveto", file_menu_x + fontheight*4.6, y_offset+fontheight*0.45);
			lcd_main.message("write", "save");
			lcd_main.message("moveto", file_menu_x + fontheight*4.6, y_offset+fontheight*0.75);
			lcd_main.message("write", "selected");
			setfontsize(fontheight/1.6);
		}

		lcd_main.message("paintrect", file_menu_x + fontheight*6.6, y_offset, file_menu_x+fontheight*8.7, y_offset+fontheight,greydarkest );
		click_rectangle( file_menu_x + fontheight*6.6, y_offset, file_menu_x+fontheight*8.8, y_offset+fontheight,mouse_index,1 );
		lcd_main.message("frgb" , greycolour);
		mouse_click_actions[mouse_index] = save_song;
		mouse_click_parameters[mouse_index] = 0;
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		lcd_main.message("moveto", file_menu_x + fontheight*6.8, y_offset+fontheight*0.75);
		lcd_main.message("write", "save");				

		lcd_main.message("paintrect", file_menu_x + fontheight*8.8, y_offset, file_menu_x+fontheight*10.9, y_offset+fontheight,greydarkest );
		click_rectangle( file_menu_x + fontheight*8.8, y_offset, file_menu_x+fontheight*11.0, y_offset+fontheight,mouse_index,1 );
		lcd_main.message("frgb" , greycolour);
		mouse_click_actions[mouse_index] = select_folder;
		mouse_click_parameters[mouse_index] = "";
		mouse_click_values[mouse_index] = "";
		mouse_index++;
		setfontsize(fontheight/3.2);
		lcd_main.message("moveto", file_menu_x + fontheight*9.0, y_offset+fontheight*0.45);
		lcd_main.message("write", "change");
		lcd_main.message("moveto", file_menu_x + fontheight*9.0, y_offset+fontheight*0.75);
		lcd_main.message("write", "folder");
		setfontsize(fontheight/1.6);			

		lcd_main.message("paintrect", mainwindow_width - 9 - fontheight * 2.2, y_offset, mainwindow_width - 9, y_offset+fontheight,greydarkest );
		click_rectangle( mainwindow_width - 9 - fontheight * 2.2, y_offset, mainwindow_width - 9, y_offset+fontheight,mouse_index,1 );
		if(danger_button == mouse_index){
			lcd_main.message("frgb" , 255,50,50);
		}else{
			lcd_main.message("frgb", greycolour);
		}
		mouse_click_actions[mouse_index] = clear_everything_btn;
		mouse_click_parameters[mouse_index] = "";
		mouse_click_values[mouse_index] = mouse_index;
		mouse_index++;
		setfontsize(fontheight/3.2);
		lcd_main.message("moveto", mainwindow_width -9 - fontheight*2, y_offset+fontheight*0.45);
		lcd_main.message("write", "clear");
		lcd_main.message("moveto", mainwindow_width -9 - fontheight*2, y_offset+fontheight*0.75);
		lcd_main.message("write", "everything");
		setfontsize(fontheight/1.6);


		y_offset += 0.4*fontheight;

		for(i=0;i<songlist.length;i++){
			y_offset += 1.1*fontheight;
			if(i==currentsong){
				lcd_main.message("paintrect", file_menu_x , y_offset, mainwindow_width-9, y_offset+fontheight,greycolour );
				lcd_main.message("frgb", 0, 0, 0 );
			}else{
				lcd_main.message("paintrect", file_menu_x , y_offset, mainwindow_width-9, y_offset+fontheight,greydarkest );	
				lcd_main.message("frgb" , greycolour);
			}
			lcd_main.message("moveto", file_menu_x + fontheight*0.2, y_offset+fontheight*0.75);
			lcd_main.message("write" , songlist[i]);
			click_rectangle( file_menu_x , y_offset, mainwindow_width, y_offset+1.1*fontheight,mouse_index,1 );
			mouse_click_actions[mouse_index] = select_song;
			mouse_click_parameters[mouse_index] = i;
			mouse_click_values[mouse_index] = i;
			mouse_index++;
		}
		setfontsize(fontheight/3.2);
	}else{		
// BLOCK SCOPES AND PARAMS #######################################################################################################
				
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
			
			var tii,ts;

			if((sidebar.mode == "settings")||(sidebar.mode == "settings_flockpreset")||(sidebar.mode == "add_state")||(sidebar.mode == "connections")||(sidebar.mode == "help")||(sidebar.mode == "flock")||(sidebar.mode == "panel_assign")){
			}else{
				sidebar.mode = "block";
			}
			if(sidebar.selected != block) sidebar.lastmode = "retrig";
			var bvs = voicemap.get(block);
			if(!Array.isArray(bvs)) bvs = [bvs];
			if(sidebar.scopes.voicenum >= bvs.length) sidebar.scopes.voicenum = -1;
			var listvoice=-1;
			if(sidebar.scopes.voicenum>=0) listvoice  = bvs[sidebar.scopes.voicenum] - MAX_NOTE_VOICES;// voicemap.get(block+"["+sidebar.scopes.voicenum+"]") - MAX_NOTE_VOICES; 
			if(listvoice != sidebar.scopes.voice) sidebar.lastmode="retrig";
			if(sidebar.mode != sidebar.lastmode){
				sidebar.lastmode = sidebar.mode;
				sidebar.scopes.voice = -1;
				audio_to_data_poly.setvalue(0,"vis_scope", 0);
				remove_midi_scope();
				redraw_flag.targets=[];
				redraw_flag.targets[0]=0;
				if(sidebar.mode == "block"){
					//get scope info together, turn on scopes
					if(block_type=="audio"){
						if(sidebar.scopes.voicenum != -1){
							sidebar.scopes.voicelist = [];
							for(tii=0;tii<NO_IO_PER_BLOCK;tii++){
								audio_to_data_poly.setvalue((listvoice+1+tii*MAX_AUDIO_VOICES),"vis_scope", 1);
								sidebar.scopes.voicelist[tii] = (listvoice+tii*MAX_AUDIO_VOICES);
							}	
							sidebar.scopes.width = (sidebar.width + fontheight * 0.1)/NO_IO_PER_BLOCK;
							messnamed("scope_size",(sidebar.scopes.width)/2);
							sidebar.scopes.voice = listvoice;
						}else{
							//post("if sidebar.scopes.voicenum is -1 display scopes for all voices");
							sidebar.scopes.voicelist = [];
							for(i=0;i<bvs.length;i++){
								for(tii=0;tii<NO_IO_PER_BLOCK;tii++){
									audio_to_data_poly.setvalue((bvs[i]+1+tii*MAX_AUDIO_VOICES - MAX_NOTE_VOICES),"vis_scope", 1);
									sidebar.scopes.voicelist[tii+i*NO_IO_PER_BLOCK] = (bvs[i]+tii*MAX_AUDIO_VOICES - MAX_NOTE_VOICES);
								}
							}	
							sidebar.scopes.width = (sidebar.width + fontheight * 0.1)/(bvs.length*NO_IO_PER_BLOCK);
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
						post("setting up hardware scopes",ts);
						if(typeof ts == "number") ts= [ts];
						if(!is_empty(ts)){
							if(ts[0] != sidebar.scopes.voice){
								for(tii=0;tii<ts.length;tii++){
									audio_to_data_poly.setvalue(ts[tii]+voffset,"vis_scope", 1);
									sidebar.scopes.voicelist[tii] = ts[tii]+voffset-1;
								}
								sidebar.scopes.voice = ts[0];
							}
							sidebar.scopes.width = (sidebar.width + fontheight * 0.1)/ts.length;
							messnamed("scope_size",(sidebar.scopes.width)/2);
							// post("scopes width",ts.length,"scopes list",sidebar.scopes.voicelist);
						}
					}else{
						if((listvoice+MAX_NOTE_VOICES) != sidebar.scopes.midi){
							//post(sidebar.scopes.midi,"s.s.m<<  >>listvoi",listvoice+MAX_NOTE_VOICES);
							assign_midi_scope("voice",listvoice+MAX_NOTE_VOICES, 0);
						}
					}
				}
				sidebar.selected = block;
			}
						

			if((block_type!="hardware")&&(blocktypes.get(block_name+"::block_ui_patcher")!="blank.ui")&&(!blocktypes.contains(block_name+"::no_edit"))){
				sidebar.editbtn = 1.1;
				sidebar.editdark = block_darkest.slice();
				sidebar.editcolour = block_colour.slice();
				//WAS :: now moved to the main topbar
				//lcd_main.message("paintrect", sidebar.x+5.9*fontheight,y_offset,sidebar.x+6.9*fontheight,y_offset+fontheight,block_darkest);
				click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editbtn_index,1);
				mouse_click_actions[sidebar.editbtn_index] = set_display_mode;
				if(displaymode=="custom"){
					lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editcolour);
					lcd_main.message("frgb" , sidebar.editdark);
					mouse_click_parameters[sidebar.editbtn_index] = "custom_fullscreen";
				}else if(displaymode=="custom_fullscreen"){
					lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editcolour);
					lcd_main.message("frgb" , sidebar.editdark);
					mouse_click_parameters[sidebar.editbtn_index] = "custom";
				}else{
					lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editdark);
					lcd_main.message("frgb" , sidebar.editcolour);
					mouse_click_parameters[sidebar.editbtn_index] = "custom";
				}
				mouse_click_values[sidebar.editbtn_index] = block;
				//mouse_index++;
				lcd_main.message("moveto" ,sidebar.editbtn_x+fontheight*0.1, 9+fontheight*0.75);
				lcd_main.message("write", "edit");
			}else if(blocktypes.contains(block_name+"::plugin_name")){
				sidebar.editbtn = 1.1;
				sidebar.editdark = block_darkest;
				sidebar.editcolour = block_colour;
				lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,block_darkest);
				click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,sidebar.editbtn_index,1);
				mouse_click_actions[sidebar.editbtn_index] = show_vst_editor;
				mouse_click_parameters[sidebar.editbtn_index] = block;
				mouse_click_values[sidebar.editbtn_index] = block;
				mouse_index++;
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,sidebar.editbtn_x+fontheight*0.1, 9+fontheight*0.75);
				lcd_main.message("write", "edit");
			}else{
				sidebar.editbtn = 0;
				lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0,0);
				click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0);				
			}

			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*(5.8/*-editbtn*/),fontheight+y_offset,block_darkest);
			click_rectangle( sidebar.x, y_offset, sidebar.x+fontheight*(5.8/*-editbtn*/),fontheight+y_offset,mouse_index,1);
			mouse_click_actions[mouse_index] = set_sidebar_mode;
			mouse_click_parameters[mouse_index] = "block";
			mouse_click_values[mouse_index] = "";	
			mouse_index++;				
			var bnt = block_label.split('.');
			lcd_main.message("frgb" , block_colour);
			if(bnt.length>1){
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.35+y_offset);
				lcd_main.message("write", bnt[0]);
				if(bnt.length>2){
					bntt = bnt[1]+"."+bnt[2];
				}else{
					bntt = bnt[1];
				}
			}else{
				bntt = bnt[0];
			}
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			if(bntt.length<15) setfontsize(fontheight/1.6);
			lcd_main.message("write", bntt);
			setfontsize(fontheight/3.2);
			click_rectangle( sidebar.x + fontheight*5.9, y_offset, sidebar.x+fontheight*6.9, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = bypass_selected_block;
			if(blocks.get("blocks["+block+"]::bypass")){
				lcd_main.message("paintrect", sidebar.x + fontheight*5.9, y_offset, sidebar.x+fontheight*6.9, fontheight+y_offset,128,128,128 );
				lcd_main.message("moveto", sidebar.x + fontheight*6.05, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , 0,0,0);
				lcd_main.message("write", "bypass");	
				lcd_main.message("frgb" , block_colour);
				mouse_click_parameters[mouse_index] = 0;
			}else{
				mouse_click_parameters[mouse_index] = 1;
				lcd_main.message("paintrect", sidebar.x + fontheight*5.9, y_offset, sidebar.x+fontheight*6.9, fontheight+y_offset,block_darkest );
				lcd_main.message("moveto", sidebar.x + fontheight*6.05, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , 128,128,128);
				lcd_main.message("write", "bypass");
			}
			mouse_click_values[mouse_index] = "";	
			mouse_index++;
			click_rectangle( sidebar.x + fontheight*7, y_offset, sidebar.x+fontheight*8, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = mute_selected_block;
			if(blocks.get("blocks["+block+"]::mute")){
				lcd_main.message("paintrect", sidebar.x + fontheight*7, y_offset, sidebar.x+fontheight*8, fontheight+y_offset,128,128,128 );
				lcd_main.message("moveto", sidebar.x + fontheight*7.15, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , 0,0,0);
				lcd_main.message("write", "mute");	
				lcd_main.message("frgb" , block_colour);
				mouse_click_parameters[mouse_index] = 0;
			}else{
				mouse_click_parameters[mouse_index] = 1;
				lcd_main.message("paintrect", sidebar.x + fontheight*7, y_offset, sidebar.x+fontheight*8, fontheight+y_offset,block_darkest );
				lcd_main.message("moveto", sidebar.x + fontheight*7.15, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , 128,128,128);
				lcd_main.message("write", "mute");
			}
			mouse_click_values[mouse_index] = "";	
			mouse_index++;
			y_offset += 1.1*fontheight;
					
			if(sidebar.mode == "block"){
				sidebar.scopes.starty = y_offset;
				sidebar.scopes.endy = y_offset+2*fontheight;
				sidebar.scopes.bg = block_darkest;
				sidebar.scopes.fg = block_colour;
				
				if(block_type == "audio" || block_type == "hardware"){
					if(sidebar.scopes.voicenum != -1){
						for(i=0;i<NO_IO_PER_BLOCK;i++){
							lcd_main.message("paintrect", sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,block_darkest);
							click_rectangle( sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,mouse_index,2);
						}
						mouse_click_actions[mouse_index] = scope_zoom;
						mouse_click_parameters[mouse_index] = "-1";
						mouse_click_values[mouse_index] = "";	
						mouse_index++;
					}else{
						for(i=0;i<sidebar.scopes.voicelist.length;i++){
							lcd_main.message("paintrect", sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,block_darkest);
							click_rectangle( sidebar.x+i*sidebar.scopes.width,sidebar.scopes.starty,sidebar.x+(i+1)*sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,mouse_index,2);
							mouse_click_actions[mouse_index] = scope_zoom;
							mouse_click_parameters[mouse_index] = Math.floor(i>>1);//sidebar.scopes.voicelist[i] % MAX_AUDIO_VOICES;
							mouse_click_values[mouse_index] = "";	
							mouse_index++;
						}
					}

					y_offset += fontheight*2.1;						
				}else{
					y_offset += fontheight*2.1;
					lcd_main.message("paintrect", sidebar.x, sidebar.scopes.starty,mainwindow_width-9,sidebar.scopes.endy,block_darkest);
					click_rectangle( sidebar.x, sidebar.scopes.starty,mainwindow_width-9,sidebar.scopes.endy,mouse_index,1);
					mouse_click_actions[mouse_index] = scope_midinames;
					mouse_click_parameters[mouse_index] = "";
					mouse_click_values[mouse_index] = "";	
					mouse_index++;
				}
			}
			if((sidebar.mode == "block")||(sidebar.mode == "add_state")){
				var groups = [];
				var params = [];
				var knob = { x:0 , y:0 };
				
				if(!has_params){
					lcd_main.message("paintrect", sidebar.x , y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
					lcd_main.message("moveto" ,sidebar.x + fontheight*0.2, fontheight+y_offset-9);
					lcd_main.message("frgb" , block_dark);
					lcd_main.message("write", "no parameters");
					y_offset += fontheight*1.1;
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
					var slidercount; //used to hide sliders that apply to not-yet-active voices
					var maxnamelabely,namelabely,x1,x2,y1,y2,p_type,p_values,pv,namearr,tk,wk,wrap;
					var getmap = 0;
					if(automap.available_k!=-1){
						if(automap.mapped_k!=block){
							note_poly.setvalue( automap.available_k, "maptarget", block);
							automap.mapped_k=block;
						}
					}
					if(automap.available_c!=-1){
						if((automap.mapped_c!=block) && (block_name != "core.input.control")){
							var maplist = [];
							var map_x = 0;
							var map_y = 0;
							var controllername = automap.devicename_c;
							var map_rows = 1;
							var map_cols = 128;
							if(io_dict.contains("controllers::"+controllername+"::rows")){
								map_rows = io_dict.get("controllers::"+controllername+"::rows");
								map_cols = io_dict.get("controllers::"+controllername+"::columns");
							}
							getmap=1;
							automap.mapped_c=block;
						} 
					}
					for(i=0;i<groups.length;i++){
						colour=block_colour;
						if(groups[i].contains("colour")){
							var blend_colour = groups[i].get("colour");
							colour[0]=(colour[0]*3+blend_colour[0])>>2;
							colour[1]=(colour[1]*3+blend_colour[1])>>2;
							colour[2]=(colour[2]*3+blend_colour[2])>>2;
						}
						h_slider = 3;
						if(groups[i].contains("height")){
							h_slider = groups[i].get("height");
						}
						plist = groups[i].get("contains");
						if(!Array.isArray(plist)) plist = [plist];
						slidercount=plist.length;
						var columns = Math.max(1,slidercount);
						var opvf = groups[i].contains("onepervoice");
						w_slider = (sidebar.width + fontheight * 0.1)/columns;
						maxnamelabely =0;
						y1 = y_offset +  fontheight * (4 * knob.y);
						y2 = y_offset +  fontheight * (4 * knob.y + h_slider+(h_slider==0));
						for(t=0;t<slidercount;t++){
							var curp = plist[t];
							wk=0;
							for(tk=t;tk<slidercount;tk++){
								if(plist[tk]==plist[t]) wk++;
							}
							if(params[curp].contains("name")){
								if(getmap==1){
									maplist[maplist.length]= MAX_PARAMETERS*block+curp;
									map_x++;
									if(map_x>=map_cols){
										map_x=0;
										map_y++;
										if(map_y>=map_rows){
											getmap=-1;
										}
									}
								}
								x1 = sidebar.x + w_slider*knob.x;
								x2 = sidebar.x + w_slider*(knob.x+wk) - fontheight*0.1;
								p_type = params[curp].get("type");
								p_values = params[curp].get("values");
								wrap = params[curp].get("wrap");
								pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+curp);
								namelabely=y1+fontheight*(0.4+h_slider);
								namearr = params[curp].get("name");
								namearr = namearr.split("_");
								var flags = (p_values[0]=="bi");
								if(opvf){
									flags |= 2;
									//flags |= 4 * t;
								}

								if(p_type=="button"){
									paramslider_details[curp]=[x1,y1,x2,y2,colour[0],colour[1],colour[2],mouse_index,block,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider];
									draw_button(x1,y1,x2,y2,colour[0]/2,colour[1]/2,colour[2]/2,mouse_index,p_values[0]);
									mouse_click_actions[mouse_index] = sidebar_button;
									mouse_click_parameters[mouse_index] = block;
									mouse_click_values[mouse_index] = "show_edit";
									mouse_index++;
								}else{
									if(h_slider==0){
										paramslider_details[curp]=[x1,y1,x2,y2,colour[0]/2,colour[1]/2,colour[2]/2,mouse_index,block,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider];
									}else{
										paramslider_details[curp]=[x1,y1,x2,y2,colour[0],colour[1],colour[2],mouse_index,block,curp,flags,namearr,namelabely,p_type,wrap,block_name,h_slider];
									}
									namelabely = labelled_parameter_v_slider(curp);
									paramslider_details[curp][17]=namelabely;
									if(namelabely>maxnamelabely) maxnamelabely=namelabely;
									//paramslider_details is used for quick redraw of a single slider. index is curp
									//ie is mouse_click_parameters[index][0]
									mouse_click_actions[mouse_index] = sidebar_parameter_knob;
									mouse_click_parameters[mouse_index] = [curp, block];
									if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")){
										//if it's a menu_b or menu_i store the slider index + 1 in mouse-values
										mouse_click_values[mouse_index] = curp+1;
									}else{
										mouse_click_values[mouse_index] = "";
									}								
									mouse_index++;
								}
								knob.x+=wk;
								if(knob.x>=columns){
									knob.x = 0;
									y_offset += fontheight * (h_slider + 0.1 + 1.1*(h_slider==0));
								}	
							}
							t += wk-1;
						}
						if(maxnamelabely>(y2)){
							y_offset += maxnamelabely - y2;
						}
						if(map_x!=0){ //wrap round to the next row, padding maplist with -1s
							if(getmap==1){
								var tm;
								for(tm=0;tm<(map_cols-map_x);tm++){
									maplist[maplist.length]=-1;
								}
								map_x=0;
								map_y++;
								if(map_y>=map_rows){
									getmap=-1;
								}
							}									
						}
					}
					if(getmap!=0){
						//post("maplist",maplist);
						note_poly.setvalue(automap.available_c,"maplist",maplist);
						note_poly.setvalue(automap.available_c,"mapcolour",blocks.get("blocks["+block+"]::space::colour"));
					}
				}
				colour=block_colour;
				y_offset += fontheight * 4 * knob.y;
			}else if(sidebar.mode == "flock"){
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_colour );
				click_rectangle( sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "block";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				
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
						w_slider = (sidebar.width + fontheight * 0.1)/columns;
						maxnamelabely =0;
						y1 = y_offset +  fontheight * (4 * knob.y);
						y2 = y_offset +  fontheight * (4 * knob.y + h_slider+(h_slider==0));
						for(t=0;t<plist.length;t++){
							wk=0;
							for(tk=t;tk<plist.length;tk++){
								if(plist[tk]==plist[t]) wk++;
							}
							if(params[plist[t]].contains("name")){
								x1 = sidebar.x + w_slider*knob.x;
								x2 = sidebar.x + w_slider*(knob.x+wk) - fontheight*0.1;
								cx[plist[t]] = (x1+x2)*0.5;
								cy[plist[t]] = (y1+y2)*0.5;
								p_type = params[plist[t]].get("type");
								p_values = params[plist[t]].get("values");
								wrap = params[plist[t]].get("wrap");
								pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+plist[t]);
								if(p_type=="button"){
									lcd_main.message("framerect", x1, y1, x2, y2, 50,50,50 );
								}else{
									if(h_slider==0){
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
									lcd_main.message("moveto",x1+fontheight*0.1,namelabely);
									lcd_main.message("write",namearr[c]);				
									namelabely+=0.4*fontheight;
								}
								lcd_main.message("moveto",x1+fontheight*0.1,namelabely);
								if(namelabely>maxnamelabely) maxnamelabely=namelabely;
								
								if(p_type == "menu_f"){
									if(wrap){
										pv *= (p_values.length);
										pv = Math.floor(pv);
										var pv2 = (pv+1) % (p_values.length);
										pv = pv % (p_values.length);											
									}else{
										pv *= (p_values.length-1);
										pv = Math.floor(pv);
										var pv2 = Math.min(pv+1,p_values.length-1);
										pv = Math.min(pv,p_values.length-1);											
									}
									lcd_main.message("write", p_values[pv]+ "-"+ p_values[pv2]);										
								}else if((p_type == "menu_i")||(p_type == "menu_b")){
									pv *= p_values.length;
									pv = Math.min(Math.floor(pv),p_values.length-1);
									lcd_main.message("write", p_values[pv]);
								}else if((p_type == "float") || (p_type == "int") || (p_type=="float4") || (p_type=="note")){
									var pvp;
									if(p_values[3] == "lin"){
										pv = p_values[1] + (p_values[2]-p_values[1])*pv;
									}else if(p_values[3] == "exp"){
										if(p_values[0] == "uni"){
											pv = Math.pow(2, pv) - 1;
										}else{
											pv -=0.5;
											pv *=2;
											if(pv>=0){
												pv = Math.pow(2, pv) - 1;
											}else{
												pv = -(Math.pow(2, -pv) - 1);
											}
											pv += 1;
											pv /= 2;
										}
										pv = p_values[1] + (p_values[2]-p_values[1])*pv;
									}
									if(p_type == "int"){
										pvp = Math.floor(pv);
									}else if(p_type == "note"){
										pvp = note_names[Math.floor(pv)];
									}else if(p_type == "float4"){
										pvp = pv.toPrecision(4);
									}else{
										var pre=2;
										if(pv>99){
											pre=3;
											if(pv>999){
												pre=4;
												if(pv>9999){
													pre=5;
												}
											}
										}
										pvp = pv.toPrecision(pre);
									}
									lcd_main.message("write", pvp);
								}
								knob.x+=wk;
								if(knob.x>=columns){
									knob.x = 0;
									//knob.y++;
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
					setfontsize(fontheight/3.2);
				}
				y_offset += fontheight * 4 * knob.y;
				//y_offset += fontheight*1.1;
			}else if(sidebar.mode == "panel_assign"){
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_colour );
				click_rectangle( sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "block";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				
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
						w_slider = (sidebar.width + fontheight * 0.1)/columns;
						maxnamelabely =0;
						y1 = y_offset +  fontheight * (4 * knob.y);
						y2 = y_offset +  fontheight * (4 * knob.y + h_slider+(h_slider==0));
						for(t=0;t<plist.length;t++){
							wk=0;
							for(tk=t;tk<plist.length;tk++){
								if(plist[tk]==plist[t]) wk++;
							}
							if(params[plist[t]].contains("name")){
								x1 = sidebar.x + w_slider*knob.x;
								x2 = sidebar.x + w_slider*(knob.x+wk) - fontheight*0.1;
								cx[plist[t]] = (x1+x2)*0.5;
								cy[plist[t]] = (y1+y2)*0.5;
								p_type = params[plist[t]].get("type");
								p_values = params[plist[t]].get("values");
								wrap = params[plist[t]].get("wrap");
								pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+plist[t]);
								if(p_type=="button"){
									lcd_main.message("framerect", x1, y1, x2, y2, 50,50,50 );
								}else{
									if(h_slider==0){
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
									lcd_main.message("moveto",x1+fontheight*0.1,namelabely);
									lcd_main.message("write",namearr[c]);				
									namelabely+=0.4*fontheight;
								}
								lcd_main.message("moveto",x1+fontheight*0.1,namelabely);
								if(namelabely>maxnamelabely) maxnamelabely=namelabely;
								
								if(p_type == "menu_f"){
									if(wrap){
										pv *= (p_values.length);
										pv = Math.floor(pv);
										var pv2 = (pv+1) % (p_values.length);
										pv = pv % (p_values.length);											
									}else{
										pv *= (p_values.length-1);
										pv = Math.floor(pv);
										var pv2 = Math.min(pv+1,p_values.length-1);
										pv = Math.min(pv,p_values.length-1);											
									}
									lcd_main.message("write", p_values[pv]+ "-"+ p_values[pv2]);										
								}else if((p_type == "menu_i")||(p_type == "menu_b")){
									pv *= p_values.length;
									pv = Math.min(Math.floor(pv),p_values.length-1);
									lcd_main.message("write", p_values[pv]);
								}else if((p_type == "float") || (p_type == "int") || (p_type=="float4") || (p_type=="note")){
									var pvp;
									if(p_values[3] == "lin"){
										pv = p_values[1] + (p_values[2]-p_values[1])*pv;
									}else if(p_values[3] == "exp"){
										if(p_values[0] == "uni"){
											pv = Math.pow(2, pv) - 1;
										}else{
											pv -=0.5;
											pv *=2;
											if(pv>=0){
												pv = Math.pow(2, pv) - 1;
											}else{
												pv = -(Math.pow(2, -pv) - 1);
											}
											pv += 1;
											pv /= 2;
										}
										pv = p_values[1] + (p_values[2]-p_values[1])*pv;
									}
									if(p_type == "int"){
										pvp = Math.floor(pv);
									}else if(p_type == "note"){
										pvp = note_names[Math.floor(pv)];
									}else if(p_type == "float4"){
										pvp = pv.toPrecision(4);
									}else{
										pvp = pv.toPrecision(3);
									}
									lcd_main.message("write", pvp);
								}
								knob.x+=wk;
								if(knob.x>=columns){
									knob.x = 0;
									//knob.y++;
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
					setfontsize(fontheight/3.2);
				}
				y_offset += fontheight * 4 * knob.y;
				//y_offset += fontheight*1.1;
			}else if(sidebar.mode == "settings"){				
				if(has_params){
					lcd_main.message("paintrect", sidebar.x , y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
					click_rectangle( sidebar.x , y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
					lcd_main.message("frgb" , block_colour);
					lcd_main.message("moveto" ,sidebar.x + fontheight*0.2, 0.75*fontheight+y_offset);
					lcd_main.message("write", "parameters");
					mouse_click_actions[mouse_index] = set_sidebar_mode;
					mouse_click_parameters[mouse_index] = "block";
					mouse_click_values[mouse_index] = "";	
					mouse_index++;
					var groups = [];
					var params = [];
					var knob = { x:0 , y:0 };
					params = blocktypes.get(block_name+"::parameters");
					if(blocktypes.getsize(block_name+"::parameters")==1) params = [params];
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
							var blend_colour = groups[i].get("colour");
							colour[0]=(colour[0]*3+blend_colour[0])>>2;
							colour[1]=(colour[1]*3+blend_colour[1])>>2;
							colour[2]=(colour[2]*3+blend_colour[2])>>2;
						}
						y1 = y_offset +  fontheight * 0.1;
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
								x1 = sidebar.x + fontheight*2.2+ w_slider*knob.x;
								x2 = sidebar.x + w_slider*(knob.x+wk) + fontheight*2.1;
								p_type = params[plist[t]].get("type");
								p_values = params[plist[t]].get("values");
								wrap = params[plist[t]].get("wrap");
								pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*block+plist[t]);
								if(p_type=="button"){
									paramslider_details[plist[t]]=[x1,y1,x2,y2,colour[0],colour[1],colour[2],mouse_index,block,plist[t],p_values[0],"",0,p_type,wrap,block_name,h_slider];
									draw_button(x1,y1,x2,y2,colour[0]/2,colour[1]/2,colour[2]/2,mouse_index,p_values[0]);
									mouse_click_actions[mouse_index] = sidebar_button;
									mouse_click_parameters[mouse_index] = block;
									mouse_click_values[mouse_index] = "show_edit";
									mouse_index++;
								}else{
									if(h_slider==0){
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
									mouse_click_parameters[mouse_index] = [plist[t], block];
									if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")){
										//if it's a menu_b or menu_i store the next position in mouse_click_values
										mouse_click_values[mouse_index] = plist[t];//(pv+1/p_values.length) % 1;
									}else{
										mouse_click_values[mouse_index] = "";
									}								
									mouse_index++;
								}
								knob.x+=wk;
							}
							t += wk-1;
						}
						knob.x += 0.2;
					}
				}
				colour=block_colour;
				y_offset += fontheight*1.1;
				//y_offset += fontheight * 4 * knob.y;				
			}else if(has_params){
				//parameters header only displayed if not in block OR flock assign modes
				lcd_main.message("paintrect", sidebar.x , y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
				click_rectangle( sidebar.x , y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,sidebar.x + fontheight*0.2, 0.75*fontheight+y_offset);
				lcd_main.message("write", "parameters ("+blocktypes.getsize(block_name+"::parameters")+") ...");
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "block";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
			
				y_offset += fontheight*1.1;
			}				
		// STATES LIST ##############################################################################################################
			if(sidebar.mode == "add_state"){
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_colour );
				click_rectangle( sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "states";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;					
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb", 0,0,0 );
				lcd_main.message("write", "add state (ctrl+click to remove)");
				y_offset += 1.2* fontheight;
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
					click_rectangle( sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,mouse_index,1 );							
					mouse_click_actions[mouse_index] = add_to_state;
					mouse_click_parameters[mouse_index] = sc;
					mouse_click_values[mouse_index] = block;
					mouse_index++;
					if(states.contains("names::"+sc)){
						var sn=states.get("names::"+sc);
						sn = sn.split(".");
						if(!Array.isArray(sn)) sn = [sn];
						for(var si=0;si<sn.length;si++){
							lcd_main.message("moveto", sidebar.x + fontheight*(statex+1-0.2*sn[si].length), y_offset+fontheight*(1-0.25*(sn.length-si)));
							lcd_main.message("frgb", 0,0,0);//c[0]*bg_dark_ratio, c[1]*bg_dark_ratio, c[2]*bg_dark_ratio);
							lcd_main.message("write", sn[si]);
						}
					}	
					statex+=1.0124;
					if(statex>7.1){
						y_offset += 1* fontheight;
						statex=0;
					}
				}
				y_offset += 0.1* fontheight;
			}else if(has_params){
				click_rectangle( sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "add_state";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;					
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("write", "states");
				
				var cll = config.getsize("palette::gamut")/MAX_STATES;
				var c = new Array(3);
				var sc=0;
				var scw = 6.5*fontheight / MAX_STATES;
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
					c = config.get("palette::gamut["+Math.floor(sc*cll)+"]::colour");
					if(slotfilled){
						lcd_main.message("paintrect", sidebar.x+fontheight*1.5 +scw*statex, y_offset+fontheight*0.2, sidebar.x+fontheight*1.5 +scw*(statex+0.9), fontheight*0.8+y_offset,c );							
						click_rectangle( sidebar.x+fontheight*1.5 +scw*statex, y_offset+fontheight*0.2, sidebar.x+fontheight*1.5 +scw*(statex+0.9), fontheight*0.8+y_offset,mouse_index,1 );							
						mouse_click_actions[mouse_index] = fire_block_state;
						mouse_click_parameters[mouse_index] = sc;
						mouse_click_values[mouse_index] = block;
						mouse_index++;
					}
					statex+=1;
				}
				
				
				y_offset += 1.1* fontheight;					
			}
			if((sidebar.mode == "settings")||(sidebar.mode == "settings_flockpreset")){
		// BLOCK SETTINGS ##############################################################################################################
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_colour );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb", 0,0,0 );
				lcd_main.message("write", "block settings");
				y_offset += 1.1* fontheight;

				lcd_main.message("paintrect", mainwindow_width-9-6.5*fontheight, y_offset, mainwindow_width-9-5.5*fontheight, fontheight+y_offset,block_darkest );
				click_rectangle( mainwindow_width-9-6.5*fontheight, y_offset, mainwindow_width-9-5.5*fontheight, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = hard_reload_block;
				mouse_click_parameters[mouse_index] = block;
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				lcd_main.message("frgb" ,255,128,50);
				lcd_main.message("moveto" ,mainwindow_width-9-6.4*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("write", "re-");
				lcd_main.message("moveto" ,mainwindow_width-9-6.4*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "load");

				lcd_main.message("paintrect", mainwindow_width-9-5.4*fontheight, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,block_darkest );
				click_rectangle( mainwindow_width-9-5.4*fontheight, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "edit_label";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,mainwindow_width-9-5.3*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("write", "re-");
				lcd_main.message("moveto" ,mainwindow_width-9-5.3*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "name");

				lcd_main.message("paintrect", mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight+y_offset,block_darkest );
				click_rectangle( mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = open_patcher;
				mouse_click_parameters[mouse_index] = block;
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,mainwindow_width-9-4.2*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("write", "open");
				lcd_main.message("moveto" ,mainwindow_width-9-4.2*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "patch");
				
				lcd_main.message("paintrect", mainwindow_width-9-3.2*fontheight, y_offset, mainwindow_width-9-2.2*fontheight, fontheight+y_offset,block_darkest );
				click_rectangle( mainwindow_width-9-3.2*fontheight, y_offset, mainwindow_width-9-2.2*fontheight, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = copy_block;
				mouse_click_parameters[mouse_index] = block;
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,mainwindow_width-9-3.1*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "copy");
				lcd_main.message("paintrect", mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9-1.1*fontheight, fontheight+y_offset,block_darkest );
				click_rectangle( mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9-1.1*fontheight, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = swap_block_button;
				mouse_click_parameters[mouse_index] = block;
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "swap");
				click_rectangle( mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = remove_block_btn;
				mouse_click_parameters[mouse_index] = block;
				mouse_click_values[mouse_index] = mouse_index;	
				if(danger_button == mouse_index){
					lcd_main.message("paintrect", mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,255,0,0 );
					lcd_main.message("frgb" , 0,0,0);
				}else{
					lcd_main.message("paintrect", mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
					lcd_main.message("frgb", 255,0,0);
				}
				mouse_index++;
				// lcd_main.message("frgb" , 255,0,0);
				lcd_main.message("moveto" ,mainwindow_width-9-0.8*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "del");
				y_offset += 1.1* fontheight;
				
				// polyphony
				var max_p = blocktypes.get(blocks.get("blocks["+block+"]::name")+"::max_polyphony");
				if(max_p ==0) {
					max_p=9999999999999;
				}
				if((max_p != 1)&&(block_type!="hardware")&&((!blocktypes.contains(block_name+"::plugin_name")))){
					var current_p = blocks.get("blocks["+block+"]::poly::voices");
					lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,block_darkest );
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("frgb", block_colour );
					lcd_main.message("write", "polyphony");
					if( current_p > 1 ){
						lcd_main.message("paintrect", mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight+y_offset,block_dark );
						click_rectangle( mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight+y_offset,mouse_index,1 );
						mouse_click_actions[mouse_index] = voicecount;
						mouse_click_parameters[mouse_index] = block;
						mouse_click_values[mouse_index] = ( current_p - 1);	
						mouse_index++;
						lcd_main.message("moveto" ,mainwindow_width-9-4.1*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("frgb", block_colour );
						lcd_main.message("write", "-");
					}else{
						lcd_main.message("paintrect", mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight+y_offset,block_darkest );
					}
					lcd_main.message("paintrect", mainwindow_width-9-3.2*fontheight, y_offset, mainwindow_width-9-1.1*fontheight, fontheight+y_offset,block_darkest );
					lcd_main.message("moveto" ,mainwindow_width-9-3.0*fontheight, fontheight*0.5+y_offset);
					lcd_main.message("write", "voices");
					lcd_main.message("frgb", block_colour);
					lcd_main.message("moveto" ,mainwindow_width-9-3.0*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", current_p);
					if(current_p<max_p){
						lcd_main.message("paintrect", mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_dark);
						click_rectangle( mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
						mouse_click_actions[mouse_index] = voicecount;
						mouse_click_parameters[mouse_index] = block;
						mouse_click_values[mouse_index] = (current_p + 1);	
						mouse_index++;
						lcd_main.message("moveto" ,mainwindow_width-9-0.8*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("frgb", block_colour );
						lcd_main.message("write", "+");
					}else{
						lcd_main.message("paintrect", mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest);
					}
					y_offset += 1.1* fontheight;
					lcd_main.message("paintrect", mainwindow_width-9-6.5*fontheight, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,block_darkest);
					click_rectangle( mainwindow_width-9-6.5*fontheight, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,mouse_index,1 );
					mouse_click_actions[mouse_index] = cycle_block_mode;
					mouse_click_parameters[mouse_index] = block;
					mouse_click_values[mouse_index] = "stack";	
					mouse_index++;
					lcd_main.message("moveto" ,mainwindow_width-9-6.3*fontheight, fontheight*0.5+y_offset);
					lcd_main.message("frgb", block_dark );
					lcd_main.message("write", "stack mode");
					lcd_main.message("frgb", block_colour );
					lcd_main.message("moveto" ,mainwindow_width-9-6.3*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", blocks.get("blocks["+block+"]::poly::stack_mode"));
											
					//y_offset += 1.1* fontheight;
					lcd_main.message("paintrect", mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-2.2*fontheight, fontheight+y_offset,block_darkest);
					click_rectangle( mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-2.2*fontheight, fontheight+y_offset,mouse_index,1 );
					mouse_click_actions[mouse_index] = cycle_block_mode;
					mouse_click_parameters[mouse_index] = block;
					mouse_click_values[mouse_index] = "choose";	
					mouse_index++;
					lcd_main.message("moveto" ,mainwindow_width-9-4.1*fontheight, fontheight*0.5+y_offset);
					lcd_main.message("frgb", block_dark );
					lcd_main.message("write", "choose mode");
					lcd_main.message("frgb", block_colour );
					lcd_main.message("moveto" ,mainwindow_width-9-4.1*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", blocks.get("blocks["+block+"]::poly::choose_mode"));

					//y_offset += 1.1* fontheight;
					lcd_main.message("paintrect", mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest);
					click_rectangle( mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
					mouse_click_actions[mouse_index] = cycle_block_mode;
					mouse_click_parameters[mouse_index] = block;
					mouse_click_values[mouse_index] = "steal";	
					mouse_index++;
					lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.5+y_offset);
					lcd_main.message("frgb", block_dark );
					lcd_main.message("write", "steal mode");
					lcd_main.message("frgb", block_colour );
					lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", blocks.get("blocks["+block+"]::poly::steal_mode"));
					y_offset += 1.1* fontheight;
					
					
				}

				//oversampling settings
				if(UPSAMPLING && (block_type == "audio")){
					var current_up = blocks.get("blocks["+block+"]::upsample");
					lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,block_darkest );
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("frgb", block_colour );
					lcd_main.message("write", "upsampling");
					if( current_up > 1 ){
						lcd_main.message("paintrect", mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight+y_offset,block_dark );
						click_rectangle( mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight+y_offset,mouse_index,1 );
						mouse_click_actions[mouse_index] = change_upsampling;
						mouse_click_parameters[mouse_index] = block;
						mouse_click_values[mouse_index] = ( current_up >> 1);	
						mouse_index++;
						lcd_main.message("moveto" ,mainwindow_width-9-4.1*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("frgb", block_colour );
						lcd_main.message("write", "-");
					}else{
						lcd_main.message("paintrect", mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight+y_offset,block_darkest );
					}
					lcd_main.message("paintrect", mainwindow_width-9-3.2*fontheight, y_offset, mainwindow_width-9-1.1*fontheight, fontheight+y_offset,block_darkest );
					lcd_main.message("moveto" ,mainwindow_width-9-3.0*fontheight, fontheight*0.5+y_offset);
					lcd_main.message("write", "voices");
					lcd_main.message("frgb", block_colour);
					lcd_main.message("moveto" ,mainwindow_width-9-3.0*fontheight, fontheight*0.75+y_offset);
					lcd_main.message("write", current_up+"x");
					if(current_up<128){
						lcd_main.message("paintrect", mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_dark);
						click_rectangle( mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
						mouse_click_actions[mouse_index] = change_upsampling;
						mouse_click_parameters[mouse_index] = block;
						mouse_click_values[mouse_index] = (current_up << 1);	
						mouse_index++;
						lcd_main.message("moveto" ,mainwindow_width-9-0.8*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("frgb", block_colour );
						lcd_main.message("write", "+");
					}else{
						lcd_main.message("paintrect", mainwindow_width-9-1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest);
					}
					y_offset += 1.1* fontheight;

				}



				// panel assigns
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,block_darkest );
				lcd_main.message("paintrect", mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-2.2*fontheight, fontheight+y_offset,block_dark );
				//lcd_main.message("frgb", menucolour );
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "panel");
				lcd_main.message("moveto" ,mainwindow_width-9-4.2*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "assign");
				click_rectangle( mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-2.2*fontheight, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "panel_assign";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				click_rectangle( mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = toggle_panel;
				mouse_click_parameters[mouse_index] = block;
				mouse_click_values[mouse_index] = 0;	
				mouse_index++;
				lcd_main.message("paintrect", mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
				lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("frgb", block_dark );
				lcd_main.message("write", "enable");
				lcd_main.message("frgb", block_colour );
				lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.75+y_offset);
				if(blocks.get("blocks["+block+"]::panel::enable")){
					lcd_main.message("write", "on");
				}else{
					lcd_main.message("write", "off");
				}
				y_offset += fontheight*1.1;





				// flock 
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,block_darkest );
				lcd_main.message("paintrect", mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-2.2*fontheight, fontheight+y_offset,block_dark );
				//lcd_main.message("frgb", menucolour );
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "flock");
				lcd_main.message("moveto" ,mainwindow_width-9-4.1*fontheight, fontheight*0.75+y_offset);
				lcd_main.message("write", "assign");
				click_rectangle( mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9-2.2*fontheight, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "flock";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
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
						click_rectangle( mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
						mouse_click_actions[mouse_index] = set_sidebar_mode;
						mouse_click_parameters[mouse_index] = "settings";
						mouse_click_values[mouse_index] = "settings";	
						mouse_index++;
						lcd_main.message("paintrect", mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_colour);
						lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("frgb", block_darkest );
						lcd_main.message("write", "choose");
						lcd_main.message("frgb", block_darkest );
						lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("write", "preset");
						y_offset += fontheight*1.1;		
						//TODO there'll be a flock_presets dict, here you'd list the names of entries. these are hard presets btw, no user saving.
						var presetlist = flock_presets.getkeys();
						for(var pri=0; pri<presetlist.length; pri++){
							lcd_main.message("paintrect", sidebar.x+ 2.1*fontheight, y_offset, mainwindow_width-9, 0.65*fontheight+y_offset,block_darkest);
							lcd_main.message("moveto" ,sidebar.x+ 2.3*fontheight, fontheight*0.5+y_offset);
							lcd_main.message("frgb", block_colour );
							lcd_main.message("write", presetlist[pri]);
							click_rectangle( sidebar.x+ 2.1*fontheight, y_offset, mainwindow_width-9, 0.65*fontheight+y_offset,mouse_index,1);
							mouse_click_actions[mouse_index] = set_flock_preset;
							mouse_click_parameters[mouse_index] = presetlist[pri];
							mouse_click_values[mouse_index] = block;	
							mouse_index++;						
							y_offset += fontheight*0.75
						}
						y_offset += fontheight*1.1;	
					}else{
						click_rectangle( mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
						mouse_click_actions[mouse_index] = set_sidebar_mode;
						mouse_click_parameters[mouse_index] = "settings_flockpreset";
						mouse_click_values[mouse_index] = "settings_flockpreset";	
						mouse_index++;
						lcd_main.message("paintrect", mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,block_dark);
						lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("frgb", block_darkest );
						lcd_main.message("write", "choose");
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-1.9*fontheight, fontheight*0.75+y_offset);
						lcd_main.message("write", "preset");
						y_offset += fontheight*1.1;
						draw_h_slider(mainwindow_width-9-6.5*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::weight"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::weight";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-6.3*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "weight");
						draw_h_slider(mainwindow_width-9-3.2*fontheight, y_offset, mainwindow_width-9, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::tension"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::tension";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-3.0*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "tension");
						y_offset += 0.75* fontheight;
						draw_h_slider(mainwindow_width-9-6.5*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::friction"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::friction";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-6.3*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "friction");
						draw_h_slider(mainwindow_width-9-3.2*fontheight, y_offset, mainwindow_width-9, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::bounce"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::bounce";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-3.0*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "bounce");
						y_offset += 0.75* fontheight;
						draw_h_slider(mainwindow_width-9-6.5*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,-1+2*blocks.get("blocks["+block+"]::flock::attrep"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::attrep";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-6.3*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "attract/repel");
						draw_h_slider(mainwindow_width-9-3.2*fontheight, y_offset, mainwindow_width-9, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,-1+2*blocks.get("blocks["+block+"]::flock::align"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::align";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-3.0*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "align");
						y_offset += 0.75* fontheight;
						draw_h_slider(mainwindow_width-9-6.5*fontheight, y_offset, mainwindow_width-9-3.3*fontheight, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,-1+2*blocks.get("blocks["+block+"]::flock::twist"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::twist";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-6.3*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "twist");
						draw_h_slider(mainwindow_width-9-3.2*fontheight, y_offset, mainwindow_width-9, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::flock::brownian"));
						mouse_click_actions[mouse_index] = block_edit;
						mouse_click_parameters[mouse_index] = "blocks["+block+"]::flock::brownian";
						mouse_click_values[mouse_index] = 0;
						mouse_index++;
						lcd_main.message("frgb", block_colour );
						lcd_main.message("moveto" ,mainwindow_width-9-3.0*fontheight, fontheight*0.5+y_offset);
						lcd_main.message("write", "brownian");
						y_offset += 0.75* fontheight;
						
					}
				}

				// error 
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9-4.4*fontheight, fontheight+y_offset,block_darkest );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.5+y_offset);
				lcd_main.message("frgb", block_colour );
				lcd_main.message("write", "parameter");
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "error");
				draw_h_slider(mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::error::spread"));
				mouse_click_actions[mouse_index] = block_edit;
				mouse_click_parameters[mouse_index] = "blocks["+block+"]::error::spread";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("frgb", block_colour );
				lcd_main.message("moveto" ,mainwindow_width-9-4.1*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("write", "spread");
				y_offset+=fontheight*0.75;
				draw_h_slider(mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::error::drift"));
				mouse_click_actions[mouse_index] = block_edit;
				mouse_click_parameters[mouse_index] = "blocks["+block+"]::error::drift";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("frgb", block_colour );
				lcd_main.message("moveto" ,mainwindow_width-9-4.1*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("write", "drift");
				y_offset+=fontheight*0.75;
				draw_h_slider(mainwindow_width-9-4.3*fontheight, y_offset, mainwindow_width-9, fontheight*0.65+y_offset,block_colour[0],block_colour[1],block_colour[2],mouse_index,blocks.get("blocks["+block+"]::error::lockup"));
				mouse_click_actions[mouse_index] = block_edit;
				mouse_click_parameters[mouse_index] = "blocks["+block+"]::error::lockup";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("frgb", block_colour );
				lcd_main.message("moveto" ,mainwindow_width-9-4.1*fontheight, fontheight*0.5+y_offset);
				lcd_main.message("write", "panel lockup");
				y_offset+=fontheight*0.75;
			}else{
				lcd_main.message("frgb", block_colour);
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
				click_rectangle( sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "settings";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;
				lcd_main.message("frgb" , block_colour);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "block settings ...");
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
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_colour );
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("frgb", 0,0,0);
				lcd_main.message("write", "connections");
				y_offset += 1.1* fontheight;
				if(conn_count){
					for(var pass=0;pass<2;pass++){
						for(i=0;i<cm;i++){
							setfontsize(fontheight/3.2);
							if(connections.contains("connections["+i+"]::from::number")){
								var comp;
								if(pass==0){
									comp = connections.get("connections["+i+"]::from::number");
								}else{
									comp = connections.get("connections["+i+"]::to::number");
								}
								if((comp == block)){
									lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9 - 3.3*fontheight, fontheight*1.6+y_offset,block_darkest );
									click_rectangle( sidebar.x, y_offset, mainwindow_width-9 - 3.3*fontheight, fontheight*1.7+y_offset,mouse_index,1 );
									mouse_click_actions[mouse_index] = connection_select;
									mouse_click_parameters[mouse_index] = 0; //"connections["+i+"]::conversion::mute";
									mouse_click_values[mouse_index] = i;
									mouse_index++;
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
									var t_i_no = connections.get("connections["+i+"]::to::input::number");
									var t_type = connections.get("connections["+i+"]::to::input::type");
									if(f_type=="parameters"){
										var f_o_name = blocktypes.get(f_name+"::parameters["+f_o_no+"]::name");
									}else{
										var f_o_name = blocktypes.get(f_name+"::connections::out::"+f_type+"["+f_o_no+"]");
									}
									if(t_type=="parameters"){
										var t_i_name = blocktypes.get(t_name+"::parameters["+t_i_no+"]::name");
									}else{
										var t_i_name = blocktypes.get(t_name+"::connections::in::"+t_type+"["+t_i_no+"]");
									}
									var f_o_v = ""; var t_i_v="";
									if(blocks.get("blocks["+f_number+"]::poly::voices")>1) f_o_v = connections.get("connections["+i+"]::from::voice");
									if(blocks.get("blocks["+t_number+"]::poly::voices")>1) t_i_v = connections.get("connections["+i+"]::to::voice");
									lcd_main.message("moveto" ,sidebar.x+fontheight*0.95, fontheight*0.45+y_offset);
									if(pass==1){
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
	
									var col=new Array(3);
									if(connections.get("connections["+i+"]::to::input::type")=="audio"){
										col = audiocolour;
									}else if(connections.get("connections["+i+"]::to::input::type")=="hardware"){
										col = hardwarecolour;
									}else if(connections.get("connections["+i+"]::to::input::type")=="matrix"){
										col = matrixcolour;
									}else if(connections.get("connections["+i+"]::to::input::type")=="midi"){
										col = midicolour;
									}else if(connections.get("connections["+i+"]::to::input::type")=="block"){
										col = blockcontrolcolour;
									}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
										col = parameterscolour;
									}
									
									if(mute){
										lcd_main.message("paintrect",mainwindow_width-9-fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,128,128,128);
										lcd_main.message("frgb", 0, 0, 0);
										lcd_main.message("moveto",mainwindow_width-9-fontheight*0.9, fontheight*0.9+y_offset);
										lcd_main.message("write", "mute");
										lcd_main.message("frgb",col[0],col[1],col[2]);
									}else{
										lcd_main.message("paintrect",mainwindow_width-9-fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,menudark);
										lcd_main.message("frgb" , menucolour);
										lcd_main.message("moveto",mainwindow_width-9-fontheight*0.9, fontheight*0.9+y_offset);
										lcd_main.message("write","mute");
									}
									click_rectangle(mainwindow_width-9-fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index, 1);
									mouse_click_actions[mouse_index] = connection_edit;
									mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::mute";
									mouse_click_values[mouse_index] = !mute;
									mouse_index++;
									if((connections.get("connections["+i+"]::from::output::type")!="matrix") && (!force_unity)){
										draw_h_slider_labelled(mainwindow_width-9-fontheight*3.2, y_offset+fontheight*1.1, mainwindow_width-9, fontheight*1.6+y_offset,col[0],col[1],col[2],mouse_index,scale);
										mouse_click_actions[mouse_index] = connection_edit;
										mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::scale";
										mouse_click_values[mouse_index] = 0;
										mouse_index++;
											//	lcd_main.message("frgb", menucolour);
									}else{
										lcd_main.message("moveto", mainwindow_width-9-fontheight*3.0, y_offset+fontheight*1.6);
										lcd_main.message("write","gain locked @ unity");
									}
									if(connections.get("connections["+i+"]::from::output::type")=="hardware"){
										if(connections.get("connections["+i+"]::to::input::type")=="audio"){
											var v1;
											var v2;
											var nv1 = connections.get("connections["+i+"]::from::voice");
											if(connections.gettype("connections["+i+"]::from::voice")!="array"){
												if(connections.get("connections["+i+"]::from::voice")=="all"){
													v1 = connection_menu.get("from::voices");
												}else{
													v1 = 1;
												}
											}else{
												v1 = nv1.length;
											}
											var nv2 = connections.get("connections["+i+"]::to::voice");
											post(connections.gettype("connections["+i+"]::to::voice"));
											if(connections.gettype("connections["+i+"]::to::voice")!="array"){
												if(connections.get("connections["+i+"]::to::voice")=="all"){
													v2 = connection_menu.get("to::voices");
												}else{
													v2 = 1;
												}
											}else{
												v2 = nv2.length;
											}
											draw_spread(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2);	
											draw_spread_levels(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2,scale);	
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
											mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_index++;
										}else if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
											draw_vector(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;
											draw_2d_slider(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
											mouse_index++;
										}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
											draw_h_slider(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;
										}
									}else if(connections.get("connections["+i+"]::from::output::type")=="audio"){
										if(force_unity){
										}else if((connections.get("connections["+i+"]::to::input::type")=="hardware")	|| (connections.get("connections["+i+"]::to::input::type")=="audio")){
											var v1;
											var v2;
											var nv1 = connections.get("connections["+i+"]::from::voice");
											if(connections.gettype("connections["+i+"]::from::voice")!="array"){
												if(connections.get("connections["+i+"]::from::voice")=="all"){
													v1 = connection_menu.get("from::voices");
												}else{
													v1 = 1;
												}
											}else{
												v1 = nv1.length;
											}
											var nv2 = connections.get("connections["+i+"]::to::voice");
											if(connections.gettype("connections["+i+"]::to::voice")!="array"){
												if(connections.get("connections["+i+"]::to::voice")=="all"){
													v2 = connection_menu.get("to::voices");
												}else{
													v2 = 1;
												}
											}else{
												v2 = nv2.length;
											}
											
											draw_spread(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2);				
											draw_spread_levels(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2,scale);				
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
											mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_index++;
										}else if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
											draw_vector(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;
											draw_2d_slider(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
											mouse_index++;
										}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
											draw_h_slider(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;
										}
									}else if(connections.get("connections["+i+"]::from::output::type")=="midi"){
										if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
											draw_2d_slider(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
											mouse_index++;			
										}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
											draw_vector(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;
											draw_h_slider(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;			
										}else if((connections.get("connections["+i+"]::to::input::type")=="audio")||(connections.get("connections["+i+"]::to::input::type")=="hardware")){
											draw_vector(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;
											draw_h_slider(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;									
										}
									}else if(connections.get("connections["+i+"]::from::output::type")=="parameters"){
										if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
											draw_vector(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*2.2, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
											mouse_click_values[mouse_index] = 0;
											mouse_index++;
											draw_2d_slider(mainwindow_width-9-fontheight*2.1, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
											mouse_click_actions[mouse_index] = connection_edit;
											mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
											mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
											mouse_index++;			
										}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
											draw_h_slider(mainwindow_width-9-fontheight*3.2, y_offset, mainwindow_width-9-fontheight*1.1, fontheight+y_offset,col[0],col[1],col[2],mouse_index,vector);
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
			}else{
				click_rectangle( sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
				mouse_click_actions[mouse_index] = set_sidebar_mode;
				mouse_click_parameters[mouse_index] = "connections";
				mouse_click_values[mouse_index] = "";	
				mouse_index++;					
				lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
				lcd_main.message("frgb", block_colour);
				lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
				lcd_main.message("write", "connections ("+conn_count+") ...");
				y_offset += 1.1* fontheight;
			}
			if(blocktypes.contains(block_name+"::help_text")){
				if(sidebar.mode == "help"){
					click_rectangle( sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
					mouse_click_actions[mouse_index] = set_sidebar_mode;
					mouse_click_parameters[mouse_index] = "block";
					mouse_click_values[mouse_index] = "";	
					mouse_index++;					
					lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_colour);
					lcd_main.message("frgb", 0,0,0 );
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("write", "help");
					y_offset += 1.1* fontheight;
					lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, mainwindow_height-9,block_darkest);
					lcd_main.message("frgb", block_colour);
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					setfontsize(fontheight/2);
					lcd_main.message("textface", "normal");
					var hint=blocktypes.get(block_name+"::help_text")+" ";
					var hintrows = 0.4+ hint.length / 27+hint.split("£").length-1;
					var rowstart=0;
					var rowend=28;
					hint = hint+"                       ";
					var bold=0;
					var sameline=0;
					for(var ri=0;ri<hintrows;ri++){
						while((hint[rowend]!=' ') && (rowend>1+rowstart)){ rowend--; }
						var sliced = hint.slice(rowstart,rowend);
						if(!sameline) {
							lcd_main.message("moveto",sidebar.x+fontheight*0.2,y_offset+fontheight*(0.75+0.4*ri));
						}else{
							ri--;
						}
						sameline=0;
						var newlineind = sliced.indexOf("£");
						var boldind = sliced.indexOf("*");		
						if((boldind>-1)&&(newlineind>-1)){
							if(boldind<newlineind){
								newlineind=-1;
							}else{
								boldind=-1;
							}
						}		
						if(newlineind>-1){
							rowend = rowstart+ sliced.indexOf("£");
							sliced = hint.slice(rowstart,rowend);
							sameline=0;
						}
						if(boldind>-1){
							sameline=1;
							bold=1-bold;
							rowend = rowstart+ sliced.indexOf("*");
							sliced = hint.slice(rowstart,rowend);
						}
						lcd_main.message("write",sliced);
						if(!sameline){
							rowstart=rowend+1;
							rowend+=28;
						}else{
							var t = rowstart+28;
							rowstart=rowend+1
							rowend=t;
						}
						if(bold){
							lcd_main.message("textface", "bold");
						}else{
							lcd_main.message("textface", "normal");
						}	
					}
					if(!bold) lcd_main.message("textface", "bold");
				}else{
					click_rectangle( sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
					mouse_click_actions[mouse_index] = set_sidebar_mode;
					mouse_click_parameters[mouse_index] = "help";
					mouse_click_values[mouse_index] = "";	
					mouse_index++;					
					lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,block_darkest );
					lcd_main.message("frgb", block_colour);
					lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
					lcd_main.message("write", "help");
					y_offset += 1.1* fontheight;				
				}
			}
		}else if(selected.block_count > 1){ 
		// MULTI BLOCKS SELECTED ########################################################################################################
			if(sidebar.mode != "blocks"){
				audio_to_data_poly.setvalue(0,"vis_scope",0);
				sidebar.mode = "blocks";
				redraw_flag.targets=[];
			}
		   // nothing, maybe just muteall/unmuteall buttons? copy + paste? delete? group?
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*4.7,fontheight+y_offset,menudarkest);
			lcd_main.message("paintrect", sidebar.x + fontheight*4.8, y_offset, sidebar.x+fontheight*5.8, fontheight+y_offset,menudarkest );
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			lcd_main.message("frgb" , menucolour);
			lcd_main.message("write", "multiple blocks selected");
			lcd_main.message("moveto", sidebar.x + fontheight*4.9, fontheight*0.75+y_offset);
			lcd_main.message("write", "copy");
			click_rectangle( sidebar.x + fontheight*4.8, y_offset, sidebar.x+fontheight*5.8, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = copy_block;
			mouse_click_parameters[mouse_index] = "";
			mouse_click_values[mouse_index] = "";	
			mouse_index++;					
			sidebar.editbtn = 0;
			lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0,0);
			click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0);				
			
			lcd_main.message("paintrect", sidebar.x + fontheight*5.9, y_offset, sidebar.x+fontheight*6.9, fontheight+y_offset,menudark );
			click_rectangle( sidebar.x + fontheight*5.9, y_offset, sidebar.x+fontheight*6.9, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = mute_selected_block;
			mouse_click_parameters[mouse_index] = 0;
			mouse_click_values[mouse_index] = "";	
			mouse_index++;	
			lcd_main.message("frgb" , menucolour);				
			lcd_main.message("moveto", sidebar.x + fontheight*6, fontheight*0.5+y_offset);
			lcd_main.message("write", "un");
			lcd_main.message("moveto", sidebar.x + fontheight*6, fontheight*0.75+y_offset);
			lcd_main.message("write", "mute");
			lcd_main.message("paintrect", sidebar.x + fontheight*7, y_offset, sidebar.x+fontheight*8, fontheight+y_offset,menucolour );
			click_rectangle( sidebar.x + fontheight*7, y_offset, sidebar.x+fontheight*8, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = mute_selected_block;
			mouse_click_parameters[mouse_index] = 1;
			mouse_click_values[mouse_index] = "";	
			mouse_index++;
			lcd_main.message("frgb" , 0,0,0);				
			lcd_main.message("moveto", sidebar.x + fontheight*7.1, fontheight*0.75+y_offset);
			lcd_main.message("write", "mute");		
			y_offset += 1.1*fontheight;
			var block_label;
			
			for(i=0;i<MAX_BLOCKS;i++){
				if(selected.block[i]){
					block_label = blocks.get("blocks["+i+"]::label");
					block_colour = blocks.get("blocks["+i+"]::space::colour");
					lcd_main.message("frgb" , block_colour);				
					lcd_main.message("moveto", sidebar.x + 0.1*fontheight, fontheight*(0.4)+y_offset);
					lcd_main.message("write", block_label);
					y_offset+=0.5*fontheight;
				}
			}
			y_offset+=0.5*fontheight;
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*8, fontheight+y_offset, menudarkest );
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
				click_rectangle( sidebar.x+fontheight*statex, y_offset, sidebar.x+fontheight*(statex+0.9), fontheight*0.9+y_offset,mouse_index,1 );							
				mouse_click_actions[mouse_index] = add_to_state;
				mouse_click_parameters[mouse_index] = sc;
				mouse_click_values[mouse_index] = -2;
				mouse_index++;
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
				if(statex>7.1){
					y_offset += 1* fontheight;
					statex=0;
				}
			}
			y_offset += 0.1* fontheight;
			y_offset+=0.5*fontheight;
			lcd_main.message("paintrect", sidebar.x, y_offset, sidebar.x+fontheight*5.8, fontheight+y_offset, menudarkest );
			lcd_main.message("frgb" , menucolour);				
			lcd_main.message("moveto", sidebar.x + fontheight*0.2, fontheight*0.75+y_offset);
			lcd_main.message("write", "polyphony");		

			lcd_main.message("paintrect", sidebar.x + fontheight*5.9, y_offset, sidebar.x+fontheight*6.9, fontheight+y_offset,menudarkest );
			click_rectangle( sidebar.x + fontheight*5.9, y_offset, sidebar.x+fontheight*6.9, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = multiselect_polychange;
			mouse_click_parameters[mouse_index] = -1;
			mouse_click_values[mouse_index] = "";	
			mouse_index++;	
			lcd_main.message("frgb" , menucolour);				
			//lcd_main.message("moveto", sidebar.x + fontheight*6, fontheight*0.5+y_offset);
			//lcd_main.message("write", "un");
			lcd_main.message("moveto", sidebar.x + fontheight*6, fontheight*0.75+y_offset);
			lcd_main.message("write", "-");
			lcd_main.message("paintrect", sidebar.x + fontheight*7, y_offset, sidebar.x+fontheight*8, fontheight+y_offset,menudarkest );
			click_rectangle( sidebar.x + fontheight*7, y_offset, sidebar.x+fontheight*8, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = multiselect_polychange;
			mouse_click_parameters[mouse_index] = 1;
			mouse_click_values[mouse_index] = "";	
			mouse_index++;
			lcd_main.message("frgb" , menucolour);				
			lcd_main.message("moveto", sidebar.x + fontheight*7.1, fontheight*0.75+y_offset);
			lcd_main.message("write", "+");		


			y_offset += 1.1*fontheight;


		}else if(selected.wire_count == 1){ // if 1 connection selected
			// CONNECTION DETAIL VIEW #######################################################################################################
			i = selected.wire.indexOf(1);
			sidebar.editbtn = 0;
			lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0,0);
			click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0);				

			lcd_main.message("paintrect", mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9-1.1*fontheight, fontheight+y_offset,menudarkest );
			click_rectangle( mainwindow_width-9-2.1*fontheight, y_offset, mainwindow_width-9-1.1*fontheight, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = insert_menu_button; //insert_block_in_connection;
			mouse_click_parameters[mouse_index] = i;
			mouse_click_values[mouse_index] = 0;
			mouse_index++;
			
			lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9-fontheight*2.2, fontheight+y_offset,menudarkest );
			click_rectangle( mainwindow_width-9-fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,mouse_index,1 );
			mouse_click_actions[mouse_index] = remove_connection_btn;
			mouse_click_parameters[mouse_index] = i;
			mouse_click_values[mouse_index] = mouse_index;
			if(danger_button == mouse_index){
				lcd_main.message("paintrect", mainwindow_width-9-fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,120,0,0 );
				lcd_main.message("frgb" , 255,50,50);
			}else{
				lcd_main.message("paintrect", mainwindow_width-9-fontheight, y_offset, mainwindow_width-9, fontheight+y_offset,menudarkest );
				lcd_main.message("frgb" , 255,0,0);
			}
			mouse_index++;
			lcd_main.message("moveto" , mainwindow_width-9-fontheight*0.8, fontheight*0.75+y_offset);
			lcd_main.message("write", "del");
			lcd_main.message("frgb", menucolour );

			lcd_main.message("moveto" , mainwindow_width-9-fontheight*2, fontheight*0.75+y_offset);
			lcd_main.message("write", "ins");
			
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			setfontsize(fontheight/1.6);

			lcd_main.message("write", "connection");

			y_offset += 1.1* fontheight;

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
			
			if(f_type=="parameters"){
				var f_o_name = blocktypes.get(f_name+"::parameters["+f_o_no+"]::name");
			}else{
				var f_o_name = blocktypes.get(f_name+"::connections::out::"+f_type+"["+f_o_no+"]");
			}
			if(t_type=="parameters"){
				var t_i_name = blocktypes.get(t_name+"::parameters["+t_i_no+"]::name");
			}else{
				var t_i_name = blocktypes.get(t_name+"::connections::in::"+t_type+"["+t_i_no+"]");
			}
			var f_o_v = connections.get("connections["+i+"]::from::voice");
			var t_i_v = connections.get("connections["+i+"]::to::voice");
			if(!Array.isArray(f_o_v)) f_o_v=[f_o_v];
			if(!Array.isArray(t_i_v)) t_i_v = [t_i_v];
			f_o_v.sort();
			t_i_v.sort();
			var f_v_no = blocks.get("blocks["+f_number+"]::poly::voices");
			var t_v_no = blocks.get("blocks["+t_number+"]::poly::voices");
			
			sidebar.mode = "wire";
			sidebar.scopes.starty = y_offset;
			sidebar.scopes.endy = y_offset+2*fontheight;
			lcd_main.message("paintrect", sidebar.x, sidebar.scopes.starty,mainwindow_width-9,sidebar.scopes.endy,menudarkest);
			sidebar.scopes.bg=menudarkest;
			sidebar.scopes.fg=menucolour;
			click_rectangle( sidebar.x, sidebar.scopes.starty,mainwindow_width-9,sidebar.scopes.endy,mouse_index,2);
			mouse_click_actions[mouse_index] = scope_zoom;
			mouse_click_parameters[mouse_index] = "";
			mouse_click_values[mouse_index] = "";	
			mouse_index++;
			y_offset += fontheight*2.1;
			if((t_type=="midi")&&(f_type!="midi")){
				y_offset+=fontheight*2.1;
				lcd_main.message("paintrect", sidebar.x, sidebar.scopes.endy+fontheight*0.1,mainwindow_width-9,sidebar.scopes.endy+fontheight*2.1,menudarkest);
			}
			if(sidebar.mode != sidebar.lastmode){
				sidebar.lastmode = sidebar.mode;
				audio_to_data_poly.setvalue(0,"vis_scope", 0);
				remove_midi_scope();
				redraw_flag.targets=[];
				sidebar.selected = -1;

				var tii;

				if((t_type=="midi")||(t_type=="block")||(t_type=="parameters")){
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
					assign_midi_scope("connection",i,m_index);
					sidebar.scopes.width = (sidebar.width + fontheight * 0.1);
				}else if(f_type=="audio"){
					post("assigning connection audio scope block",f_number,"voice",f_o_v,"output",f_o_no,"\n");
					sidebar.scopes.voicelist = [];
					audio_to_data_poly.setvalue(0, "vis_scope", 0);
					var listvoice;
					if(!blocks.get("blocks["+f_number+"]::subvoices")>1){
						if(f_o_v=="all"){
							listvoice = voicemap.get(f_number);
							if(typeof listvoice == "number") listvoice = [listvoice];
							for(tii=0;tii<listvoice.length;tii++) listvoice[tii] -= MAX_NOTE_VOICES;
						}else{
							listvoice = f_o_v.slice();
							var t_listvoice = voicemap.get(f_number);
							if(typeof listvoice == "number") listvoice = [listvoice];
							if(typeof t_listvoice == "number") t_listvoice = [t_listvoice];
							for(tii=0;tii<listvoice.length;tii++) listvoice[tii] = t_listvoice[listvoice[tii]-1]-MAX_NOTE_VOICES;
						}
					}else{
						if(f_o_v=="all"){
							listvoice = voicemap.get(f_number);
							if(typeof listvoice == "number") listvoice = [listvoice, listvoice + MAX_AUDIO_VOICES];
							for(tii=0;tii<listvoice.length;tii++) listvoice[tii] -= MAX_NOTE_VOICES;
						}else{
							listvoice = f_o_v.slice();
							var t_listvoice = voicemap.get(f_number);
							if(typeof listvoice == "number") listvoice = [listvoice, listvoice + MAX_AUDIO_VOICES];
							if(typeof t_listvoice == "number") t_listvoice = [t_listvoice, t_listvoice + MAX_AUDIO_VOICES];
							for(tii=0;tii<listvoice.length;tii++) listvoice[tii] = t_listvoice[listvoice[tii]-1]-MAX_NOTE_VOICES;
						}						
					}
					
//					post("\nLISTVOICE",listvoice);
					for(tii=0;tii<listvoice.length;tii++){
						audio_to_data_poly.setvalue((listvoice[tii]+1+f_o_no*MAX_AUDIO_VOICES),"vis_scope", 1);
						sidebar.scopes.voicelist[tii] = (listvoice[tii]+f_o_no*MAX_AUDIO_VOICES);
					}
					sidebar.scopes.voice = f_number; 
//						post("scopes voicelist",sidebar.scopes.voicelist,"f_o_v",f_o_v);
					sidebar.scopes.width = (sidebar.width + fontheight * 0.1)/listvoice.length;
					messnamed("scope_size",(sidebar.scopes.width)/2);
				}else if(f_type=="hardware"){
//					post("todo assign connection hardware scope block",f_number,"voice",f_o_v,"output",f_o_no,"\n");
					if(blocktypes.contains(f_name+"::connections::out::hardware_channels")){
						var listch = blocktypes.get(f_name+"::connections::out::hardware_channels");
						if(typeof listch == "number") listch = [listch];
						var voffset=MAX_AUDIO_VOICES+MAX_NOTE_VOICES;
						if(!is_empty(listch)){
							sidebar.scopes.voicelist = [];
							audio_to_data_poly.setvalue(listch[f_o_no]+voffset,"vis_scope", 1);
							sidebar.scopes.voicelist[0] = listch[f_o_no]+voffset-1;
							sidebar.scopes.width = (sidebar.width + fontheight * 0.1);
							messnamed("scope_size",(sidebar.scopes.width)/2);
							sidebar.scopes.voice = f_number; 
//							post("\nSCOPES: ",sidebar.scopes.voicelist);
						}
					}
				}else { //from midi
/*					sidebar.scopes.voice = -1;
					post("assigning midi scope block",f_number,"voice",f_o_v,"output",f_o_no,"\n");
					var listvoice = f_o_v.slice();
					var voffset = -1;
					if(f_o_v=="all"){
						listvoice = voicemap.get(f_number);
						voffset=0;
					}
					if(typeof listvoice == "number") listvoice = [listvoice];
					sidebar.scopes.voicelist = [];
					audio_to_data_poly.setvalue(0, "vis_scope", 1);
					if(!is_empty(listvoice)){
						for(tii=0;tii<listvoice.length;tii++){
							sidebar.scopes.voicelist[tii] = listvoice[tii]+voffset;
						}							
					}
					sidebar.scopes.midi = f_number; 
//						post("scopes voicelist",sidebar.scopes.voicelist);
					sidebar.scopes.width = (sidebar.width + fontheight * 0.1);
					messnamed("midi_scope_source_voices",sidebar.scopes.voicelist);
					messnamed("midi_scope_source_output",f_o_no);
				*/				}
			}
			
			var frametop=y_offset;
			lcd_main.message("paintrect", sidebar.x, frametop, mainwindow_width-9, fontheight*9.1+y_offset,menudarkest );
			
			lcd_main.message("frgb" , menudark);
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.8+y_offset);
			lcd_main.message("write", "from");
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*3.2+y_offset);
			lcd_main.message("write", "to");
			lcd_main.message("frgb", menucolour );

			lcd_main.message("moveto" ,sidebar.x+fontheight*2, fontheight*0.8+y_offset);
			lcd_main.message("write", f_label);
			lcd_main.message("moveto" ,sidebar.x+fontheight*2, fontheight*1.6+y_offset);
			lcd_main.message("write", f_o_name);
			var vi;
			var vx=sidebar.x+fontheight*2;
			for(vi=0;vi<=f_v_no;vi++){
				if(vx>mainwindow_width-9-fontheight){
					vx=sidebar.x+fontheight*2;
					y_offset+=fontheight * 0.8;
				}
				if(vi==0){
					click_rectangle( vx-fontheight*0.1, fontheight*1.9+y_offset, vx+fontheight*1.1, fontheight*2.5+y_offset, mouse_index,1);
					if(f_o_v == "all"){
						lcd_main.message("paintrect", vx-fontheight*0.1, fontheight*1.9+y_offset, vx+fontheight*1.1, fontheight*2.5+y_offset, menucolour);
						lcd_main.message("frgb", 0,0,0 );
					}else{
						lcd_main.message("paintrect", vx-fontheight*0.1, fontheight*1.9+y_offset, vx+fontheight*1.1, fontheight*2.5+y_offset, menudark);
						lcd_main.message("frgb", menucolour );
					}
					lcd_main.message("moveto" ,vx, fontheight*2.4+y_offset);
					lcd_main.message("write", "all");
					vx+=fontheight*1.3;
				}else{
					click_rectangle( vx-fontheight*0.1, fontheight*1.9+y_offset, vx+fontheight*0.4, fontheight*2.5+y_offset, mouse_index,1);
					if(f_o_v.indexOf(vi)!=-1){
						lcd_main.message("paintrect", vx-fontheight*0.1, fontheight*1.9+y_offset, vx+fontheight*0.4, fontheight*2.5+y_offset, menucolour);
						lcd_main.message("frgb", 0,0,0 );
					}else{
						lcd_main.message("paintrect", vx-fontheight*0.1, fontheight*1.9+y_offset, vx+fontheight*0.4, fontheight*2.5+y_offset, menudark);
						lcd_main.message("frgb", menucolour );
					}
					lcd_main.message("moveto" ,vx, fontheight*2.4+y_offset);
					lcd_main.message("write", vi);
					vx+=fontheight*0.6;
					if(vi>9) vx+=fontheight*0.5;
				}	
				mouse_click_actions[mouse_index] = connection_edit_voices;
				mouse_click_parameters[mouse_index] = i; 
				mouse_click_values[mouse_index] = ["from", vi];
				mouse_index++;
				
			}
			lcd_main.message("frgb", menucolour );
			lcd_main.message("moveto" ,sidebar.x+fontheight*2, fontheight*3.2+y_offset);
			lcd_main.message("write", t_label);
			lcd_main.message("moveto" ,sidebar.x+fontheight*2, fontheight*4.0+y_offset);
			lcd_main.message("write", t_i_name);
			var vi;
			var vx=sidebar.x+fontheight*2;
			for(vi=0;vi<=t_v_no;vi++){
				if(vx>mainwindow_width-9-fontheight){
					vx=sidebar.x+fontheight*2;
					y_offset+=fontheight * 0.8;
				}					
				if(vi==0){
					click_rectangle( vx-fontheight*0.1, fontheight*4.3+y_offset, vx+fontheight*1.7, fontheight*4.9+y_offset, mouse_index,1);
					var w=0;
					if((t_i_no == 0) && ((t_type == "midi")||(t_type == "block"))) w=0.5;
					if(t_i_v == "all"){
						lcd_main.message("paintrect", vx-fontheight*0.1, fontheight*4.3+y_offset, vx+fontheight*(w+1.1), fontheight*4.9+y_offset, menucolour);
						lcd_main.message("frgb", 0,0,0 );
					}else{
						lcd_main.message("paintrect", vx-fontheight*0.1, fontheight*4.3+y_offset, vx+fontheight*(w+1.1), fontheight*4.9+y_offset, menudark);
						lcd_main.message("frgb", menucolour );
					}
					lcd_main.message("moveto" ,vx, fontheight*4.8+y_offset);
					if(w>0){
						lcd_main.message("write", "poly");
						vx+=fontheight*(1.3+w);	
					}else{
						lcd_main.message("write", "all");
						vx+=fontheight*1.3;
					}
					var t_i_no = connections.get("connections["+i+"]::to::input::number");
			var t_type
				}else{
					click_rectangle( vx-fontheight*0.1, fontheight*4.3+y_offset, vx+fontheight*0.4, fontheight*4.9+y_offset, mouse_index,1);
					if(t_i_v.indexOf(vi)!=-1){
						lcd_main.message("paintrect", vx-fontheight*0.1, fontheight*4.3+y_offset, vx+fontheight*0.4, fontheight*4.9+y_offset, menucolour);
						lcd_main.message("frgb", 0,0,0 );
					}else{
						lcd_main.message("paintrect", vx-fontheight*0.1, fontheight*4.3+y_offset, vx+fontheight*0.4, fontheight*4.9+y_offset, menudark);
						lcd_main.message("frgb", menucolour );
					}
					lcd_main.message("moveto" ,vx, fontheight*4.8+y_offset);
					lcd_main.message("write", vi);
					vx+=fontheight*0.6;
					if(vi>9)vx+=fontheight*0.5;
				}
				mouse_click_actions[mouse_index] = connection_edit_voices;
				mouse_click_parameters[mouse_index] = i; 
				mouse_click_values[mouse_index] = ["to",vi];
				mouse_index++;					
			}
			
			y_offset += 5.2*fontheight;
			
			var mute = connections.get("connections["+i+"]::conversion::mute");
			var scale = connections.get("connections["+i+"]::conversion::scale");
			var vector = connections.get("connections["+i+"]::conversion::vector");
			var offset = connections.get("connections["+i+"]::conversion::offset");
			var offset2 = connections.get("connections["+i+"]::conversion::offset2");
			var force_unity = connections.get("connections["+i+"]::conversion::force_unity");

			var col=new Array(3);
			if(connections.get("connections["+i+"]::to::input::type")=="audio"){
				col = audiocolour;
			}else if(connections.get("connections["+i+"]::to::input::type")=="hardware"){
				col = hardwarecolour;
			}else if(connections.get("connections["+i+"]::to::input::type")=="matrix"){
				col = matrixcolour;
			}else if(connections.get("connections["+i+"]::to::input::type")=="midi"){
				col = midicolour;
			}else if(connections.get("connections["+i+"]::to::input::type")=="block"){
				col = blockcontrolcolour;
			}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
				col = parameterscolour;
			}
			
			if(mute){
				lcd_main.message("paintrect",mainwindow_width-9-fontheight*2.6, y_offset, mainwindow_width-9, fontheight*2.6+y_offset,128,128,128);
				lcd_main.message("frgb", 0, 0, 0);
				lcd_main.message("moveto",mainwindow_width-9-fontheight*2.4, fontheight*2.4+y_offset);
				lcd_main.message("write", "mute");
				lcd_main.message("frgb",col[0],col[1],col[2]);
			}else{
				lcd_main.message("paintrect",mainwindow_width-9-2.6*fontheight, y_offset, mainwindow_width-9, fontheight*2.6+y_offset,menudark);
				lcd_main.message("frgb", 128,128,128 );
				lcd_main.message("moveto",mainwindow_width-9-fontheight*2.4, fontheight*2.4+y_offset);
				lcd_main.message("write","mute");
			}
			click_rectangle(mainwindow_width-9-fontheight*2.6, y_offset, mainwindow_width-9, fontheight*2.6+y_offset,mouse_index, 1);
			mouse_click_actions[mouse_index] = connection_edit;
			mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::mute";
			mouse_click_values[mouse_index] = !mute;
			mouse_index++;
			if((connections.get("connections["+i+"]::from::output::type")!="matrix") && (!force_unity)){
				draw_h_slider_labelled(sidebar.x, y_offset+fontheight*2.7, mainwindow_width-9-fontheight*1.1, fontheight*4.0+y_offset,col[0],col[1],col[2],mouse_index,scale);
				mouse_click_actions[mouse_index] = connection_edit;
				mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::scale";
				mouse_click_values[mouse_index] = 0;
				mouse_index++;
				lcd_main.message("paintrect", mainwindow_width-9-fontheight,y_offset+fontheight*2.7,mainwindow_width-9,y_offset+4*fontheight,menudark);
				lcd_main.message("frgb", menucolour );
				lcd_main.message("moveto",mainwindow_width-9-fontheight*0.8, fontheight*3.8+y_offset);
				lcd_main.message("write","ø");
				click_rectangle(mainwindow_width-9-fontheight,y_offset+fontheight*2.7,mainwindow_width,y_offset+4*fontheight,mouse_index, 1);
				mouse_click_actions[mouse_index] = connection_edit;
				mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::scale";
				mouse_click_values[mouse_index] = -scale;
				mouse_index++;
	
				lcd_main.message("frgb", menucolour);
			}else{
				lcd_main.message("moveto", sidebar.x+fontheight*0.2, y_offset+fontheight*3.7);
				lcd_main.message("write", "gain locked @ unity");
			}
			if(connections.get("connections["+i+"]::from::output::type")=="hardware"){
				if(connections.get("connections["+i+"]::to::input::type")=="audio"){
					var v1;
					var v2;
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
					
					draw_spread(sidebar.x, y_offset, mainwindow_width-9-fontheight*5.3, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2);				
					draw_spread_levels(mainwindow_width-9-fontheight*5.2, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2,scale);				
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_index++;
				}else if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
					draw_vector(sidebar.x, y_offset, mainwindow_width-9-fontheight*5.4, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_2d_slider(mainwindow_width-9-fontheight*5.3, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset, col[0],col[1],col[2],mouse_index,offset,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
					mouse_index++;
					lcd_main.message("moveto", (mainwindow_width-9-fontheight*5.1), (fontheight*1.8+y_offset));
					if(offset<0.5){
						lcd_main.message("write", (Math.floor(offset*256)-128));
					}else{
						lcd_main.message("write", "+"+(Math.floor(offset*256)-128));
					}
					lcd_main.message("moveto", (mainwindow_width-9-fontheight*5.1), (fontheight*2.4+y_offset));
					if(offset2<0.5){
						lcd_main.message("write", (Math.floor(offset2*256)-128));
					}else{
						lcd_main.message("write", "+"+(Math.floor(offset2*256)-128));
					}
				}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
					draw_h_slider(sidebar.x, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
				}
			}else if(connections.get("connections["+i+"]::from::output::type")=="audio"){
				if(force_unity){

				}else if((connections.get("connections["+i+"]::to::input::type")=="hardware") || (connections.get("connections["+i+"]::to::input::type")=="audio")){
					var v1;
					var v2;
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
					
					draw_spread(sidebar.x, y_offset, mainwindow_width-9-fontheight*5.3, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2);				
					draw_spread_levels(mainwindow_width-9-fontheight*5.2, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,vector,offset,v1,v2,scale);				
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_index++;
				}else if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
					draw_vector(sidebar.x, y_offset, mainwindow_width-9-fontheight*5.4, fontheight*2.6+y_offset, col[0],col[1],col[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_2d_slider(mainwindow_width-9-fontheight*5.3, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset, col[0],col[1],col[2],mouse_index,offset,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
					mouse_index++;
				}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
					draw_h_slider(sidebar.x, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
				}
			}else if((connections.get("connections["+i+"]::from::output::type")=="midi")||(connections.get("connections["+i+"]::from::output::type")=="block")){
				if(connections.get("connections["+i+"]::to::input::type")=="midi"){
					var dispn;
					lcd_main.message("frgb",menudark);
					lcd_main.message("moveto",mainwindow_width-9-fontheight*5.1,y_offset+fontheight*0.6);
					lcd_main.message("write","pitch");
					lcd_main.message("moveto",mainwindow_width-9-fontheight*5.1,y_offset+fontheight*1.2);
					dispn=Math.floor(offset*256-128);
					if(dispn>0) dispn="+"+dispn;
					lcd_main.message("write", dispn);
					lcd_main.message("moveto",mainwindow_width-9-fontheight*5.1,y_offset+fontheight*1.8);
					lcd_main.message("write","vel");
					lcd_main.message("moveto",mainwindow_width-9-fontheight*5.1,y_offset+fontheight*2.4);
					dispn = Math.floor(offset2*256-128);
					if(dispn>0) dispn="+"+dispn;
					lcd_main.message("write", dispn);
					
					draw_2d_slider(mainwindow_width-9-fontheight*5.3, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
					mouse_index++;			
				}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
					draw_vector(sidebar.x, y_offset, mainwindow_width-9-fontheight*5.4, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_h_slider(mainwindow_width-9-fontheight*5.3, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;			
				}else if((connections.get("connections["+i+"]::to::input::type")=="audio")||(connections.get("connections["+i+"]::to::input::type")=="hardware")){
					draw_vector(sidebar.x, y_offset, mainwindow_width-9-fontheight*5.4, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_h_slider(mainwindow_width-9-fontheight*5.3, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,2*offset-1,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;			
				}
			}else if(connections.get("connections["+i+"]::from::output::type")=="parameters"){
				if((connections.get("connections["+i+"]::to::input::type")=="midi")||(connections.get("connections["+i+"]::to::input::type")=="block")){
					draw_vector(sidebar.x, y_offset, mainwindow_width-9-fontheight*5.3, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,vector);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;
					draw_2d_slider(mainwindow_width-9-fontheight*5.3, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,offset,offset2);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::offset";
					mouse_click_values[mouse_index] = "connections["+i+"]::conversion::offset2";
					mouse_index++;			
				}else if(connections.get("connections["+i+"]::to::input::type")=="parameters"){
					draw_h_slider(sidebar.x, y_offset, mainwindow_width-9-fontheight*2.7, fontheight*2.6+y_offset,col[0],col[1],col[2],mouse_index,2*vector-1);
					mouse_click_actions[mouse_index] = connection_edit;
					mouse_click_parameters[mouse_index] = "connections["+i+"]::conversion::vector";
					mouse_click_values[mouse_index] = 0;
					mouse_index++;			
				}			
			}
	   
		}else if(selected.wire_count > 1){
// MULTI CONNECTION VIEW
			sidebar.editbtn = 0;
//			lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0,0);
//			click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0,0);				
			sidebar.mode = "wires";
			if(sidebar.mode != sidebar.lastmode){
				sidebar.scroll.position = 0;
				sidebar.lastmode = sidebar.mode;
				audio_to_data_poly.setvalue(0,"vis_scope", 0);
				remove_midi_scope();
				redraw_flag.targets=[];
				sidebar.selected = -1;
			}
		// if multi connections selected
		   // connection adjust view - gain control, offset if applicable, muteall/unmuteall		
		}else if(sidebar.mode == "input_scope"){
			sidebar.scroll.position = 0;
			if(sidebar.mode != sidebar.lastmode){
				sidebar.lastmode = sidebar.mode;
			}
			sidebar.editbtn = 0;
			lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0,0);
			click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0);				
			
			lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,menudarkest );
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			lcd_main.message("frgb", menucolour);
			setfontsize(fontheight/1.6);
			lcd_main.message("write", "input",sidebar.scopes.voice+1);
			
			y_offset += fontheight*1.1;
			
			//need to get the name of this input, and the block it's on.
			var bk = blocktypes.getkeys();
			var t;
			for(b in bk){
				if(blocktypes.contains(bk[b]+"::connections::out::hardware_channels")){
					t = blocktypes.get(bk[b]+"::connections::out::hardware_channels");
					if(typeof t == "number") t = [t];
					for(var ti = 0; ti<t.length; ti++){
						if(t[ti]==sidebar.scopes.voice+1){
							lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,menudarkest );
							lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
							lcd_main.message("frgb", menucolour);
							setfontsize(fontheight/2.4);
							lcd_main.message("write", bk[b],blocktypes.get(bk[b]+"::connections::out::hardware["+ti+"]"));
							
							y_offset += fontheight*1.1;
						}
					}
				}
			}
			
			sidebar.scopes.starty = y_offset;
			sidebar.scopes.endy = y_offset+4*fontheight;
			sidebar.scopes.bg = menudarkest;
			sidebar.scopes.fg = menucolour;
			sidebar.scopes.width = (sidebar.width + fontheight * 0.1);
			
			lcd_main.message("paintrect", sidebar.x,sidebar.scopes.starty,sidebar.x+sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,block_darkest);
			
			click_rectangle( sidebar.x,sidebar.scopes.starty,sidebar.x+sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,mouse_index,2);
			
			mouse_click_actions[mouse_index] = scope_zoom;
			mouse_click_parameters[mouse_index] = "";
			mouse_click_values[mouse_index] = "";	
			mouse_index++;			
			
			audio_to_data_poly.setvalue(0,"vis_scope", 0);
			sidebar.scopes.midi = -1;
			audio_to_data_poly.setvalue(1+sidebar.scopes.voice+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK,"vis_scope",1);
			sidebar.scopes.voicelist = [sidebar.scopes.voice+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK];			
			messnamed("scope_size",(sidebar.scopes.width)/2);
			
		}else if(sidebar.mode == "output_scope"){
			sidebar.scroll.position = 0;
			if(sidebar.mode != sidebar.lastmode){
				sidebar.lastmode = sidebar.mode;
			}
			sidebar.editbtn = 0;
			lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0,0);
			click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0);				

			lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,menudarkest );
			lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
			lcd_main.message("frgb", menucolour);
			setfontsize(fontheight/1.6);
			lcd_main.message("write", "output",sidebar.scopes.voice+1);

			y_offset += fontheight*1.1;
		
			var bk = blocktypes.getkeys();
			var t;
			for(b in bk){
				if(blocktypes.contains(bk[b]+"::connections::in::hardware_channels")){
					t = blocktypes.get(bk[b]+"::connections::in::hardware_channels");
					if(typeof t == "number") t = [t];
					for(var ti = 0; ti<t.length; ti++){
						if(t[ti]==sidebar.scopes.voice+1){
							lcd_main.message("paintrect", sidebar.x, y_offset, mainwindow_width-9, fontheight+y_offset,menudarkest );
							lcd_main.message("moveto" ,sidebar.x+fontheight*0.2, fontheight*0.75+y_offset);
							lcd_main.message("frgb", menucolour);
							setfontsize(fontheight/2.4);
							lcd_main.message("write", bk[b],blocktypes.get(bk[b]+"::connections::in::hardware["+ti+"]"));
							
							y_offset += fontheight*1.1;
						}
					}
				}
			}

			sidebar.scopes.starty = y_offset;
			sidebar.scopes.endy = y_offset+4*fontheight;
			sidebar.scopes.bg = menudarkest;
			sidebar.scopes.fg = menucolour;
			sidebar.scopes.width = (sidebar.width + fontheight * 0.1);

			lcd_main.message("paintrect", sidebar.x,sidebar.scopes.starty,sidebar.x+sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,block_darkest);
			click_rectangle( sidebar.x,sidebar.scopes.starty,sidebar.x+sidebar.scopes.width-0.1*fontheight,sidebar.scopes.endy,mouse_index,2);
			
			mouse_click_actions[mouse_index] = scope_zoom;
			mouse_click_parameters[mouse_index] = "";
			mouse_click_values[mouse_index] = "";	
			mouse_index++;			
						
			audio_to_data_poly.setvalue(0,"vis_scope", 0);
			sidebar.scopes.midi = -1;
			sidebar.scopes.voicelist = [sidebar.scopes.voice+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS];
			audio_to_data_poly.setvalue(1+sidebar.scopes.voice+MAX_AUDIO_VOICES*NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS,"vis_scope",1);
			messnamed("scope_size",(sidebar.scopes.width)/2);
			
		}else{
			sidebar.editbtn = 0;
//			lcd_main.message("paintrect", sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0,0);
//			click_rectangle( sidebar.editbtn_x,9,sidebar.editbtn_x+fontheight,9+fontheight,0,0);
			sidebar.mode = "none";
			if(sidebar.mode != sidebar.lastmode){
				sidebar.lastmode = sidebar.mode;
				audio_to_data_poly.setvalue(0,"vis_scope", 0);
				remove_midi_scope();
				redraw_flag.targets=[];
				sidebar.selected = -1;
				sidebar.scroll.position = 0;
			}
		}	
	}

	if((sidebar.mode!="block")&&(sidebar.mode!="settings")&&(sidebar.mode!="settings_flockpreset")&&(sidebar.mode!="add_state")&&(sidebar.mode!="help")){ // DISABLE AUTOMAPPED MIDI CONTROLLERS
		if(automap.available_c != -1){
			if(automap.mapped_c != -1){
				automap.mapped_c = -1;
				note_poly.setvalue(automap.available_c,"automapped", 0);
			}
		}
		if(automap.available_k != -1){
			if(automap.mapped_k != -1){
				automap.mapped_k = -1;
				note_poly.setvalue(automap.available_k,"automapped", 0);
			}
		}
	}
	if(y_offset>mainwindow_height) sidebar.scroll.max = sidebar.scroll.position+y_offset-mainwindow_height;
	if((sidebar.scroll.max>0)){ //&&(sidebar.mode != "none")){
		lcd_main.message("frgb", menudarkest);
		lcd_main.message("moveto",mainwindow_width-5,0);
		lcd_main.message("lineto",mainwindow_width-5,mainwindow_height);		
		var l = mainwindow_height / (mainwindow_height + sidebar.scroll.max);
		var l2 = mainwindow_height * l;
		var p = sidebar.scroll.position * l;
		lcd_main.message("frgb", menucolour);
		lcd_main.message("moveto",mainwindow_width-5,p);
		lcd_main.message("lineto",mainwindow_width-5,p+l2);
	}
//	lcd_main.message("bang");
	//outlet(8,"bang");
}

function remove_midi_scope(){
	if(sidebar.scopes.midi>-1){
		var z=[];
		for(var i =0;i<128;i++)z[i]=0;
		midi_scope_buffer.poke(1,0,z);// clear buffer
		for(var i=0;i<sidebar.scopes.midivoicelist.length;i++){
			remove_from_midi_routemap(sidebar.scopes.midivoicelist[i], MAX_MOD_IDS-1);
			set_conversion(MAX_MOD_IDS*(1 + sidebar.scopes.midivoicelist[i])-1,0,0,0,0,0,0,0);
		}
		messnamed("update_midi_routemap","bang");
		sidebar.scopes.midi = -1;
		sidebar.scopes.midivoicelist=[];
	}
}

function assign_midi_scope(typ,num, props){
	if(typ=="block"){
		// this would be more complicated - add to all
		var vl = voicemap.get(num);
		if(!Array.isArray(vl)) vl=[vl];
		for(var i=0;i<vl.length;i++){
			assign_midi_scopes("voice",vl[i],props);
		}
	}else if(typ=="voice"){
		sidebar.scopes.midi = num;
		if(!Array.isArray(props)) props = [props];
		for(var i =0;i<props.length;i++){
			var m_index = (num<<7) + props[i];
			sidebar.scopes.midivoicelist[i] = m_index;
			var c_ind = MAX_MOD_IDS * (1 + m_index) - 1;
			add_to_midi_routemap(m_index,MAX_MOD_IDS-1);
			set_conversion(c_ind,1,4,1,0.5,0.5,0,0);			
		}	
		messnamed("update_midi_routemap","bang");
		// need to add to midi routemap and bang that, and do conversion buffer
		// midi routemap row = voiceno<<7 + outputno
		// value added to row = MAX_MOD_IDS-1
		// conv buff pos = MAX_MOD_IDS*(1+outputno+voiceno<<7)-1
	}else if(typ=="connection"){
		// need to add to midi routemap and bang that, and COPY conversion buffer
		sidebar.scopes.midi = MAX_BLOCKS+num;
		sidebar.scopes.midivoicelist = props.slice();
		// props contains a list of m_indexes
		for(var i = 0;i<props.length;i++){
			var c_ind = MAX_MOD_IDS * (1 + props[i]) - 1;
			add_to_midi_routemap(props[i],MAX_MOD_IDS-1);
			var enab = 1-connections.get("connections["+num+"]::conversion::mute");
			var scale = connections.get("connections["+num+"]::conversion::scale");
			var offn = connections.get("connections["+num+"]::conversion::offset");
			var offv = connections.get("connections["+num+"]::conversion::offset2");
			var vect = connections.get("connections["+num+"]::conversion::vector");
			set_conversion(c_ind,enab,4,scale,offn,offv,vect,0);			
		}
		messnamed("update_midi_routemap","bang");
	}
}

function do_automap(type, voice, onoff, name){
	if(type=="controller"){
		if(onoff==0){
			automap.available_c = -1;
				note_poly.setvalue(automap.available_c,"automapped", 0);
		}else{
			automap.available_c = voice;
		} 
		automap.devicename_c = name;
	}else if(type=="keyboard"){
		if(onoff==0){
			if(automap.mapped_k!=-1){
				automap.mapped_k = -1;
				note_poly.setvalue(automap.available_k,"automapped", 0);
			}
			automap.available_k = -1;
		}else{
			automap.available_k = voice;
		}
	}
}


