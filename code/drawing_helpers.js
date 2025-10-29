function click_clear(index,type){
	if(usermouse.left_button) return 1;
	// post("\nwiping click matrix");
	view_changed = true;
	click_rectangle(0,0,mainwindow_width,mainwindow_height,index,type); // wipe click matrix
}
function click_oval(x1,y1,x2,y2,index,type){
	click_rectangle(x1,y1,x2,y2,index,type); //sorry, i lied. TODO draw ovals here
}
// click-zone takes care of whether it needs to be drawn, increments the counter whatever
function click_zone(action,parameters,values,x1,y1,x2,y2,index,type){
	if(view_changed===true){
		mouse_click_actions[index] = action;
		mouse_click_parameters[index] = parameters;
		mouse_click_values[index] = values;
		click_rectangle(x1,y1,x2,y2,index,type);
	}
	mouse_index++;
}

function click_rectangle(x1,y1,x2,y2,index,type){
	if(x2 <= x1) return 0;
	x1=Math.max(0,x1) >> click_b_s;
	x2 = x2 >> click_b_s;
	if(x2 <= x1) x2 = x1 + 1;
	y2 = y2 >> click_b_s;
	y1=Math.max(0,y1>>click_b_s);
	type &= 15;
	index &= 4095;
	var w = x2-x1+1;
	var c = (type<<12)+index;
	for(var y=y1;y<=y2;y++){
		var ty=y<<click_b_w;
		ty+=x1;
		for(var e=w;e--;ty++){
			click_i[ty] = c;
		}
	}
}

function draw_block_texture(block){
	var block_label = blocks.get("blocks["+block+"]::label");
	if(block_label!==null){
		var block_mute = blocks.get("blocks["+block+"]::mute");
		var block_bypass = blocks.get("blocks["+block+"]::bypass");
		var ts = block_label + block_mute + block_bypass + record_arm[block];
		//post("mute is",block_mute);
		//var ts = "m"+block_mute +"-"+ block_label;
		//post("\n\nTS IS ",ts);
		if(blocks_tex_sent[block]!=ts){
			//post("drawing texture:",block," label is ",block_label, "ts is ",ts," last sent was ",blocks_tex_sent[block]);
			blocks_tex_sent[block]=ts;
			//post("now its  ",blocks_tex_sent[block]);
			messnamed("texture_generator","block",block);
			var bln = block_label.split(".",4);
			var block_colour = blocks.get("blocks["+block+"]::space::colour");
			lcd_block_textures.message("brgb",block_colour);
			lcd_block_textures.message("clear");
			if(block_mute){
				lcd_block_textures.message("frgb",128,128,128);
				lcd_block_textures.message("paintpoly", 8,8, 8, 32, 96, 120, 120, 120, 120, 96, 32, 8, 8,8);
				lcd_block_textures.message("paintpoly", 120, 8, 120, 32, 32, 120, 8, 120, 8, 96, 96, 8, 120, 8);
			}else if(block_bypass){
				lcd_block_textures.message("frgb",128,128,128);
				lcd_block_textures.message("paintpoly", 8,8, 8, 32, 96, 120, 120, 120, 120, 96, 32, 8, 8,8);
				lcd_block_textures.message("paintpoly", 64, 120, 120, 120, 120, 64, 64, 120);
			}
			if(record_arm[block]){
				lcd_block_textures.message("frgb",255,255,255);
				lcd_block_textures.message("paintoval", 94,6,122,34);
				lcd_block_textures.message("frgb",255,58,50);
				lcd_block_textures.message("paintoval", 96,8,120,32);
			}
			lcd_block_textures.message("frgb",255,255,255);
			lcd_block_textures.message("font",mainfont,(block_label == blocks.get("blocks["+block+"]::name"))?16:25);
			lcd_block_textures.message("textface","normal");
			for(var t=0;t<bln.length;t++){
				lcd_block_textures.message("moveto",5, 28+t*29);
				lcd_block_textures.message("write",bln[t].replace(/_/g," "));
				if(t==0){
					lcd_block_textures.message("font",mainfont,25);
					lcd_block_textures.message("textface","bold");		
				}
			}
			lcd_block_textures.message("frgb",block_colour);
			lcd_block_textures.message("framerect",0,0,128,128); //hacky fix for the sloping texture edges on the block menu when text overflows
			lcd_block_textures.message("bang");
		}
	}
}

function block_texture_is(i,tex){
	blocks_cube_texture[i] = tex;
	if(Array.isArray(blocks_cube[i])){
		if(blocks_cube[i].length){
			messnamed("blocks_multiple","texture",blocks_cube_texture);
		}
	}
}

function menu_block_texture_is(i,tex){
	blocks_menu_texture[i] = tex;
}

function gain_display(gain){
	if(config.get("gain_display_format")=="x"){
		var s;
		s = gain.toPrecision(2)+"x";
		return s;
	}else{
		var s;
		if(gain===0){
			s="-inf";
		}else{
			var g = f_to_db(Math.abs(gain));
			s = g.toPrecision(2)+"dB";
			if(gain<0) s = "(inverted) "+s;
		}
		return s; 
	}
}

function draw_cpu_meter(){
	var pk = 7 + fontheight*(100-cpu_meter.peak[cpu_meter.pointer])*0.01;
	var avg = 7 + fontheight*(100-cpu_meter.avg[cpu_meter.pointer])*0.01;
	lcd_main.message("frgb", backgroundcolour_current);
	lcd_main.message("moveto", 5, 9);
	lcd_main.message("lineto", 5, 9+fontheight);
	lcd_main.message("frgb", 2.55*cpu_meter.peak[cpu_meter.pointer], Math.min(2.55*(120-cpu_meter.peak[cpu_meter.pointer]),255),55);
	lcd_main.message("moveto", 5, avg);
	lcd_main.message("lineto", 5, pk);
}

function shadeRGB(colour,shade){
	return [colour[0]*shade,colour[1]*shade,colour[2]*shade];
}

function clear_sidebar_paramslider_details(){
	if(displaymode=="panels"){
		for(var i=0;i<=MAX_PARAMETERS;i++){
			paramslider_details[i]=[];
		}
	}else{
		paramslider_details = [];
	}
}

function draw_v_slider(x1,y1,x2,y2,r,g,b,index,value){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	click_rectangle(x1,y1,x2,y2,index,2);
	var ly;
 	if(value>=0) {
		if(value>=1){
			var m = 1 - (value % 1)*0.9;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		ly = y1 + (y2 - y1) * (1-(value%1));
		lcd_main.message("paintrect",x1,ly,x2,y2,r,g,b);
	}else{
		if(value<=-1){
			var m = 1 - (value % 1)*0.9;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		ly = y1 + (y2-y1)*(1+(value%1));
		lcd_main.message("paintrect",x1,y1,x2,ly,r,g,b);
	}
}

function draw_button(x1,y1,x2,y2,r,g,b,index,label,value){
	// post("\ndrawing button",/*x1,y1,x2,y2,*/r,g,b,index,label,value);
	var rat = bg_dark_ratio*2;
	if((usermouse.clicked2d==index)||(value>=0.5)) rat = 1 - rat;
	lcd_main.message("paintrect",x1,y1,x2,y2,r*rat,g*rat,b*rat);
	lcd_main.message("framerect",x1,y1,x2,y2,r,g,b);
	rat = (usermouse.clicked2d != index) * 2;
	lcd_main.message("frgb",r*rat,g*rat,b*rat);
	if((y2-y1)>fontheight*0.7){
		label = label.split("_");
	}else{
		if(!Array.isArray(label)) label = [label];
	}
	for(var i=0;i<label.length;i++){
		lcd_main.message("moveto",x1+5,y1+fontheight*(0.4*(i+1)));
		lcd_main.message("write",label[i]);
	}
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index,1);
}

function parameter_button(p){
	var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramslider_details[p][11]+paramslider_details[p][9]);
	var statecount = (paramslider_details[p][17].length - 1) / 2;
	var pv2 = Math.floor(pv * statecount * 0.99999) * 2  + 1;
	//post("\ndrawing param button, values", statecount, pv, MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], paramslider_details[p][17], pv2, paramslider_details[p][17][pv2])
	draw_button(paramslider_details[p][0],paramslider_details[p][1],paramslider_details[p][2],paramslider_details[p][3],paramslider_details[p][4],paramslider_details[p][5],paramslider_details[p][6],paramslider_details[p][7], paramslider_details[p][17][pv2],pv);
	mouse_click_values[paramslider_details[p][7]] = [paramslider_details[p][17][0],paramslider_details[p][17][pv2+1], MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], (pv+(1/statecount)) % 1];
}

function parameter_menu_b(p){ //voice is in [11] blcok is in [8]
	//this is sort of incomplete - this type doesn't expect to be modulated so just asks for a redraw if it is
	//this fn doesn't calculate colour (requires a lookup of param details)
	if(paramslider_details[p][11]==null){
		var pv = parameter_value_buffer.peek(1,MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9]);
		var statecount = (paramslider_details[p][17].length);
		var pv2 = Math.floor(pv * statecount * 0.99999);
		draw_button(paramslider_details[p][0],paramslider_details[p][1],paramslider_details[p][2],paramslider_details[p][3],paramslider_details[p][4],paramslider_details[p][5],paramslider_details[p][6],paramslider_details[p][7], paramslider_details[p][17][pv2],pv);
		mouse_click_values[paramslider_details[p][7]] = [paramslider_details[p][17][0],paramslider_details[p][17][pv2+1], MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], (pv+(1.1/statecount)) % 1];
	}else{
		var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramslider_details[p][11]+paramslider_details[p][9]);
		var statecount = (paramslider_details[p][17].length);
		var pv2 = Math.floor(pv * statecount * 0.99999);
		//post("\nbutton, list is",paramslider_details[p][17],"pv2 is",pv2,"and label is",paramslider_details[p][17][pv2]);
		//post("\ndrawing param button, values", statecount, pv, MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], paramslider_details[p][17], pv2, paramslider_details[p][17][pv2], (pv+(1.1/statecount)) % 1)
		draw_button(paramslider_details[p][0],paramslider_details[p][1],paramslider_details[p][2],paramslider_details[p][3],paramslider_details[p][4],paramslider_details[p][5],paramslider_details[p][6],paramslider_details[p][7], paramslider_details[p][17][pv2],pv);
		mouse_click_values[paramslider_details[p][7]] = [paramslider_details[p][17][0],paramslider_details[p][17][pv2+1], MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], (pv+(1.1/statecount)) % 1];
	}
}

function parameter_menu_l(p){
	lcd_main.message("font",mainfont,fontsmall);
	var mi = paramslider_details[p][7];
	var statecount = (paramslider_details[p][17].length);// - 1) / 2;
	var pv = voice_parameter_buffer.peek(1, MAX_PARAMETERS*paramslider_details[p][15]+paramslider_details[p][9]); //
	var pv2 = Math.floor(pv * statecount * 0.99999);
	var colmod = -Math.floor(-statecount / paramslider_details[p][11]);
	var ys = (fontheight*paramslider_details[p][16] + fo1)/(colmod);
	var valcol = paramslider_details[p][4];
	var vc;
	var bx=0;by=0;bw = (paramslider_details[p][2]-paramslider_details[p][0]+fo1)/paramslider_details[p][11];
	for(var bl=0; bl<statecount; bl++){ //var bl=statecount-1;bl>=0;bl--){
		if(valcol.length==1){
			vc = valcol[0];
		}else{
			vc = valcol[bl];
		}
		if(bl==pv2){
			vc = [0.7*vc[0], 0.7*vc[1], 0.7*vc[2]];
		}else{
			vc = [0.3*vc[0], 0.3*vc[1], 0.3*vc[2]];
		}
		draw_button(paramslider_details[p][0]+bx*bw,paramslider_details[p][1]+by*ys,paramslider_details[p][0]+((bx+1)*bw)-fo1,paramslider_details[p][1]+(by+1)*ys-fo1,vc[0],vc[1],vc[2],mi, paramslider_details[p][17][bl],0);
		mouse_click_actions[mi] = send_button_message;
		mouse_click_parameters[mi] = paramslider_details[p][8];
		mouse_click_values[mi] = ["param","",MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], (bl+0.2)/statecount];
		mi++;
		bx++;
		if(bx>=paramslider_details[p][11]){
			by++; bx=0;
		}
	}
	return mi;
}
function parameter_menu_d(p){
	var mi = paramslider_details[p][7];
	var statecount = (paramslider_details[p][17].length);// - 1) / 2;
	var pv = voice_parameter_buffer.peek(1, MAX_PARAMETERS*paramslider_details[p][15]+paramslider_details[p][9]); //
	var pv2 = Math.floor(pv * statecount * 0.99999);
	//var colmod = -Math.floor(-statecount / paramslider_details[p][11]);
	var ys = fontheight*0.6;//(fontheight*paramslider_details[p][16] + fo1)/(colmod);
	var valcol = paramslider_details[p][4];
	var vc;
	var bx=0;by=0;bw = (paramslider_details[p][2]-paramslider_details[p][0]+fo1)/paramslider_details[p][11];
	if(sidebar.dropdown=="param."+p){
		for(var bl=0; bl<statecount; bl++){ //var bl=statecount-1;bl>=0;bl--){
			if(valcol.length==1){
				vc = valcol[0];
			}else{
				vc = valcol[bl];
			}
			if(bl==pv2){
			}else{
				vc = [0.3*vc[0], 0.3*vc[1], 0.3*vc[2]];
			}
			draw_button(paramslider_details[p][0]+bx*bw,paramslider_details[p][1]+by*ys,paramslider_details[p][0]+((bx+1)*bw)-fo1,paramslider_details[p][1]+(by+1)*ys-fo1,vc[0],vc[1],vc[2],mi, paramslider_details[p][17][bl],0);
			mouse_click_actions[mi] = send_button_message_dropdown;
			mouse_click_parameters[mi] = paramslider_details[p][8];
			mouse_click_values[mi] = ["param","",MAX_PARAMETERS*paramslider_details[p][8]+paramslider_details[p][9], (bl+0.2)/statecount];
			mi++;
			bx++;
			if(bx>=paramslider_details[p][11]){
				by++; bx=0;
			}
		}
	}else{
		bl = pv2;
		if(valcol.length==1){
			vc = valcol[0];
		}else{
			vc = valcol[bl];
		}
		vc = [0.5*vc[0], 0.5*vc[1], 0.5*vc[2]];
		draw_button(paramslider_details[p][0]+bx*bw,paramslider_details[p][1]+by*ys,paramslider_details[p][0]+((bx+1)*bw)-fo1,paramslider_details[p][1]+(by+1)*ys-fo1,vc[0],vc[1],vc[2],mi, paramslider_details[p][17][bl],0);
		mouse_click_actions[mi] = open_dropdown;
		mouse_click_parameters[mi] = "param."+p;
		mouse_click_values[mi] = "param."+p;
		mi++;
		if(statecount>0){			
			var x2=paramslider_details[p][0]+((bx+1)*bw)-fo1;
			var yo = paramslider_details[p][1]+by*ys;
			lcd_main.message("paintpoly", x2 - 4*fo1, yo + 2.5*fo1, x2 - fo1, yo + 2.5*fo1, x2 - 2.5*fo1, yo + 4*fo1, x2 - 4*fo1, yo + 2.5*fo1);
		}
		by++;
	}
	by--;
	//return mi;
	mouse_index = mi;
	return by*ys;
}


function labelled_parameter_v_slider(sl_no){
	var p_type=paramslider_details[sl_no][13];

	var click_to_step = 0;
	if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")||(p_type=="menu_l")||(p_type=="menu_d")){
		//if it's a menu_b or menu_i store the slider index + 1 in mouse-values
		click_to_step = sl_no+1;
	}								
	
	parameter_v_slider(paramslider_details[sl_no][0], paramslider_details[sl_no][1], paramslider_details[sl_no][2], paramslider_details[sl_no][3],paramslider_details[sl_no][4], paramslider_details[sl_no][5], paramslider_details[sl_no][6], paramslider_details[sl_no][7],paramslider_details[sl_no][8], paramslider_details[sl_no][9], paramslider_details[sl_no][10],click_to_step);
	
	if(paramslider_details[sl_no][16] == 0){ //if overlaid, the text is twice as bright
		lcd_main.message("frgb",paramslider_details[sl_no][4]*2, paramslider_details[sl_no][5]*2, paramslider_details[sl_no][6]*2);
	}else{
		lcd_main.message("frgb",paramslider_details[sl_no][4], paramslider_details[sl_no][5], paramslider_details[sl_no][6]);
	}
	lcd_main.message("font",mainfont,fontsmall);
	namelabely=paramslider_details[sl_no][12];
	for(var c = 0;c<paramslider_details[sl_no][11].length;c++){
		lcd_main.message("moveto",paramslider_details[sl_no][0]+fo1,namelabely);
		lcd_main.message("write",paramslider_details[sl_no][11][c]);				
		namelabely+=0.4*fontheight;
	}
	var pv,ov=-11.11;

	var vo = voicemap.get(paramslider_details[sl_no][8]);
	if(!Array.isArray(vo)) vo = [vo];
	var w = paramslider_details[sl_no][2] - paramslider_details[sl_no][0];
	var ww = w / vo.length;
	var x = paramslider_details[sl_no][0]+fo1;
	var maskx = -1;
	for(var i=0;i<vo.length;i++){
		if(((sidebar.selected_voice>=0) && (sidebar.selected_voice!=i) &&(!(paramslider_details[sl_no][10]&4)))){
			x+=ww;
		}else{
			pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*vo[i]+paramslider_details[sl_no][9]);	
			pv = Math.min(1,Math.max(0,pv));
			if((pv!=ov)&&(x>maskx)){
				var p_values= blocktypes.get(paramslider_details[sl_no][15]+"::parameters["+paramslider_details[sl_no][9]+"]::values");
				var wrap = paramslider_details[sl_no][14];
				var label = get_parameter_label(p_type,wrap,pv,p_values);
				maskx = x + fontheight*0.2*label.length;
				lcd_main.message("moveto",x,namelabely);
				lcd_main.message("write",label);
				if(!(paramslider_details[sl_no][10]&2))ov=pv;
			}
			x+=ww;
		}
	}
	return(namelabely+4);
}

function get_parameter_label(p_type,wrap,pv,p_values){
	var pvp="";
	if(p_type == "menu_f"){
		var pv2;
		if(wrap){
			pv *= (p_values.length-0.0001);
			pv = Math.floor(pv);
			pv2 = (pv+1) % (p_values.length);
			pv = pv % (p_values.length);											
		}else{
			pv *= (p_values.length-1);
			pv = Math.floor(pv);
			pv2 = Math.min(pv+1,p_values.length-1);
			pv = Math.min(pv,p_values.length-1);											
		}
		if(pv==pv2){
			pvp = p_values[pv];	
		}else{
			pvp = p_values[pv]+ "-"+ p_values[pv2];
		}	
	}else if((p_type == "menu_i")||(p_type == "menu_b")||(p_type=="menu_l")||(p_type=="menu_d")||(p_type=="scale")){
		pv *= (p_values.length-0.0001);
		pv = Math.min(Math.floor(pv),p_values.length-1);
		pvp = p_values[pv];
	}else if((p_type == "wave")){
		pv *= (MAX_WAVES-0.0001);
		pv = Math.floor(pv+1);
		var wnam = "-";
		if(waves_dict.contains("waves["+pv+"]::name")) wnam = waves_dict.get("waves["+pv+"]::name");
		pvp = pv+" "+wnam;
	}else if((p_type == "float") || (p_type == "int") || (p_type=="float4") || (p_type=="note")){
		if(p_values[3] == "exp"){
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
				pv *= 0.5;
			}
		}else if(p_values[3] == "exp10"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(10, pv) - 1)*0.11111111111111111111111111111111;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(10, pv) - 1)*0.11111111111111111111111111111111;
				}else{
					pv = -0.11111111111111111111111111111111*(Math.pow(10, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp100"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(100, pv) - 1)*0.01010101010101010101010101010101;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(100, pv) - 1)*0.01010101010101010101010101010101;
				}else{
					pv = -0.01010101010101010101010101010101*(Math.pow(100, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp1000"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(1000, pv) - 1)*0.001001001001001001001001001001;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(1000, pv) - 1)*0.001001001001001001001001001001;
				}else{
					pv = -0.001001001001001001001001001001*(Math.pow(1000, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp.1"){
			if(p_values[0] == "uni"){
				pv = -1.1111111111111111111111111111111*(Math.pow(.1, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.1111111111111111111111111111111*(Math.pow(0.1, pv) - 1);
				}else{
					pv = 1.1111111111111111111111111111111*(Math.pow(0.1, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp.01"){
			if(p_values[0] == "uni"){
				pv = -1.010101010101010101010101010101*(Math.pow(0.01, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.010101010101010101010101010101*(Math.pow(0.01, pv) - 1);
				}else{
					pv = 1.010101010101010101010101010101*(Math.pow(0.01, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp.001"){
			if(p_values[0] == "uni"){
				pv = -1.001001001001001001001001001001*(Math.pow(0.001, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.001001001001001001001001001001*(Math.pow(0.001, pv) - 1);
				}else{
					pv = 1.001001001001001001001001001001*(Math.pow(0.001, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "s"){
			if(p_values[0] == "uni"){
				pv = 0.5 - 0.5 * Math.cos(pv*PI);
			}else{
				pv -=0.5;
				pv *=2;
				pv = 0.5 - 0.5 * Math.cos(pv*PI);
				pv += 1;
				pv /= 2;
			}
		}
		pvp = p_values[1] + (p_values[2]-p_values[1]-0.0001)*pv;
		if(p_type == "int"){
			pvp = Math.floor(p_values[1] + (0.99+p_values[2]-p_values[1])*pv);
		}else if(p_type == "note"){
			pvp = note_names[Math.floor(pvp)];
		}else if(p_type == "float4"){
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
			var pre = 4+Math.floor(Math.log(Math.abs(pv*10)+0.1)/Math.log(10));
			pvp = pv.toPrecision(pre);
		}else{
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
			var pre = 2+Math.floor(Math.log(Math.abs(pv*10)+0.1)/Math.log(10));
			pvp = pv.toPrecision(pre);
		}
	}
	return pvp;
}

function parameter_v_slider(x1,y1,x2,y2,r,g,b,index,blockno,paramno,flags,click_to_step){
		// flags
		// &= 1 - bipolar not unipolar
		// &= 2 - onepervoice
		// &= 4 - no per voice modulation on this one
		// 
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	var vlist = voicemap.get(blockno); 
	var ly, value;
	value = parameter_value_buffer.peek(1,MAX_PARAMETERS*blockno+paramno);
	var w = x2-x1; //-2;
	if(!Array.isArray(vlist)) vlist = [vlist];
	var ww = (w + 2*(flags&2))/vlist.length;
	var ww2 = ww - 2*(flags&2);
	var pvm = (((blockno == sidebar.selected)&&(sidebar.selected_voice >=0))||(flags&2)) &&(!(flags&4));
	if(view_changed===true) click_rectangle(x1,y1,x2/*+fo1*/,y2,index+pvm,2);
	for(var i=0;i<vlist.length;i++){
		var tvalue = value+parameter_static_mod.peek(1,vlist[i]*MAX_PARAMETERS+paramno);
		if(tvalue > 1) tvalue = 1;
		if(tvalue < 0) tvalue = 0;
		if(flags & 1) tvalue = (2*tvalue)-1; //bipolar
		var mu=0.33; //post("\ndrawing slider",sl_no,blockno,paramno);
		if(tvalue>=0) {
			ly = y1  + (y2 - y1) * (1-tvalue);
			if(((i==sidebar.selected_voice)||(flags & 2))&&(pvm)){ 
				if(view_changed===true){
					click_rectangle(x1+ww*i-click_b_s,y1-1,x1+ww*(i+1)+1+click_b_s,y2+1,index,2);
					mouse_click_actions[index] = static_mod_adjust;
					mouse_click_parameters[index] = [paramno, blockno, vlist[i]];
					mouse_click_values[index] = "";
					if(click_to_step>0)mouse_click_values[index]=click_to_step;
				}
				mouse_index++;
				index++;
				mu=0.57;
			}
			lcd_main.message("paintrect",x1+ww*i,ly,x1+ww*i+ww2,y2,r*mu,g*mu,b*mu);
		}else{
			ly = y1 + (y2-y1)*(-tvalue);
			if(((i==sidebar.selected_voice)||(flags & 2))&&(pvm)){
				if(view_changed===true) {
					click_rectangle(x1+ww*i-click_b_s,y1-1,x1+ww*(i+1)+1+click_b_s,y2+1,index,2);
					mouse_click_actions[index] = static_mod_adjust;
					mouse_click_parameters[index] = [paramno, blockno, vlist[i]];
					mouse_click_values[index] = "";
					if(click_to_step>0)mouse_click_values[index]=click_to_step;
				}
				mouse_index++;
				index++;
				mu=0.5;				
			}
			lcd_main.message("paintrect",x1+ww*i,y1,x1+ww*i+ww2,ly,r*mu,g*mu,b*mu);
		}
	}

	ww2 -= 2;
	lcd_main.message("frgb",r,g,b);
	for(var i=0;i<vlist.length;i++){
		value = voice_parameter_buffer.peek(1,MAX_PARAMETERS*(vlist[i])+paramno);
		if(flags & 1){ //bipolar
			value = (2*value)-1;
			value = Math.min(Math.max(-1,value),1);
		}else{
			value = Math.min(Math.max(0,value),1);
		}
		if(value>=0){
			ly = y1 + (y2 - y1-2) * (1-value);		
		}else{
			ly = y1 + (y2 - y1-2)*(-value);
		}
		lcd_main.message("moveto",x1+(ww*i),ly);
		lcd_main.message("lineto",x1+(ww*i)+ww2,ly);
	}
}

function draw_h_slider(x1,y1,x2,y2,r,g,b,index,value){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 2);
	var lx;
 	if(value>=0) {
		if(value>=1){
			var m = 1 - (value % 1)*0.6;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		lx = x1 +  (x2 - x1) * (value % 1);
		lcd_main.message("paintrect",x1,y1,lx,y2,r>>1,g>>1,b>>1);
	}else{
		if(value<=-1){
			var m = 1 - ((-value) % 1)*0.6;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		lx = x1 + (x2 - x1) * (1-((-value) % 1));
		lcd_main.message("paintrect",lx,y1,x2,y2,r>>1,g>>1,b>>1);
	}
}

function clear_wave_graphic(n,newl){
	draw_wave[n-1] = [[],[],[],[]];
	return; //the stuff below is theoretically a hair faster as you create the array so you don't need to check for nans in the loop every time drawing it but it was causing problems
	if(!Array.isArray(draw_wave[n-1])) draw_wave[n-1]=[[],[],[],[]];
	var i = 0;
	while(i<4){
		if(!Array.isArray(draw_wave[n-1][i])) draw_wave[n-1][i] = [];
		var t = 0;
		while(t<newl){
			draw_wave[n-1][i][t]=0;
			t++;
		}  
		i++;
	}
}
function clear_wave_graphic_z(n,newl){
	if(!Array.isArray(draw_wave_z[n-1])) draw_wave_z[n-1]=[[],[],[],[]];
	if(newl==null) newl = draw_wave_z[n-1][0].length;
	var i = 0;
	while(i<4){
		if(!Array.isArray(draw_wave_z[n-1][i])) draw_wave_z[n-1][i] = [];
		var t = 0;
		while(t<newl){
			draw_wave_z[n-1][i][t]=1-(2*(i&1));
			t++;
		}  
		i++;
	}
}

function draw_waveform(x1,y1,x2,y2,r,g,b,buffer,index,highlight){
	// post("\ndraw waveform",buffer,"coords",x1,y1,x2,y2,"colours",r,g,b,highlight);
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	var w = Math.floor((x2-x1-1)/2);
	var i,t,ch,s,dl,d;
	var hls;
	var hle ;
	var wmin,wmax;
	var subsamples = 2; //for the stochastic rendering
	if(view_changed===true){
		click_rectangle(x1,y1,x2,y2,index, 3);
	}
	if((!Array.isArray(draw_wave[buffer-1]))||(w!=draw_wave[buffer-1][0].length)){
		draw_wave[buffer-1] = [[],[],[],[]];
		subsamples = 20;
	}
	var length = waves_dict.get("waves["+buffer+"]::length");
	st = Math.floor(waves_dict.get("waves["+buffer+"]::start")*w);
	d = Math.floor(waves_dict.get("waves["+buffer+"]::divisions")*(MAX_WAVES_SLICES-0.0001))+1;
	dl = waves_dict.get("waves["+buffer+"]::end") - waves_dict.get("waves["+buffer+"]::start");
	dl /= d;
	if(highlight<0){ //if highlight is >0 it's taken as a proportion through the wave, 0-1, as used by wavescan
		//if it's <0 then it's slice number
		highlight=-highlight/d;
	}
	hls = w*(highlight);
	hle = w*(highlight+dl);
	var chunk = length/w;
	var chans = waves_dict.get("waves["+buffer+"]::channels");
	var h = 0.5*(y2-y1)/chans;
	dl *= w;
	for(ch=0;ch<chans;ch++){
		var curc=1;
		if(highlight<1){ 
			lcd_main.message("frgb", r>>1,g>>1,b>>1);
			curc=0;
		}else{
			lcd_main.message("frgb",r,g,b);		
		}
		for(i=0;i<w;i++){
			wmin = draw_wave[buffer-1][ch*2][i];
			wmax = draw_wave[buffer-1][ch*2+1][i];
			if(isNaN(wmin))wmin=1;
			if(isNaN(wmax))wmax=-1;
			t=subsamples;
			for(;t>=0;t--){
				s=waves_buffer[buffer-1].peek(ch+1,Math.floor((i+Math.random())*chunk));
				if(s>wmax) wmax=s;
				if(s<wmin) wmin=s;
			}
			draw_wave[buffer-1][ch*2][i] = wmin;
			draw_wave[buffer-1][ch*2+1][i] = wmax;
			if((i>=hls)&&(i<=hle)&&(curc==0)){
				lcd_main.message("frgb",r,g,b);
				curc=1;
			}else if((i>hle)&&(curc==1)){
				curc=0;
				lcd_main.message("frgb", r>>1,g>>1,b>>1);
			}
			lcd_main.message("moveto",x1+i+i,y1+h*(1+wmin+2*ch)-1);
			lcd_main.message("lineto",x1+i+i,y1+h*(1+wmax+2*ch)+1);
		}
	}
}


function draw_zoomable_waveform(x1,y1,x2,y2,r,g,b,buffer,index,highlight){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 3);
	var i,t,ch,s,dl,d,st;
	var hls, hle, wmin,wmax;
	var w = Math.floor((x2-x1-1)/2);
	var samps=2,chngd=0;
	if(!Array.isArray(draw_wave_z[buffer-1])){
		draw_wave_z[buffer-1] = [[],[],[],[]];
		samps = 20;
		chngd=1;
	}
	if(w!=draw_wave_z[buffer-1][0].length) {
		//post("\nclearing because W!=",w, draw_wave[buffer-1][0].length);
		draw_wave_z[buffer-1][0].length = w;
		clear_wave_graphic_z(buffer,w);
		samps = 20;
		chngd=1;
	}
	var length = waves_dict.get("waves["+buffer+"]::length");
	st = waves_dict.get("waves["+buffer+"]::start");//*w);
	d = Math.floor(waves_dict.get("waves["+buffer+"]::divisions")*(MAX_WAVES_SLICES-0.0001))+1;
	dl = waves_dict.get("waves["+buffer+"]::end") - waves_dict.get("waves["+buffer+"]::start");
	dl /= d;
	hls = w*(highlight);
	hle = w*(highlight+dl);
	var chunk = (waves.zoom_end-waves.zoom_start)*length/w;
	var chunkstart = waves.zoom_start*length / chunk;
	var chans = waves_dict.get("waves["+buffer+"]::channels");
	var h = 0.5*(y2-y1)/chans;
	if(w>250){
		lcd_main.message("frgb",menucolour);
		var second=1;
		for(t=0;t<=d;t++){
			i = Math.floor(w*((t*dl+st)-waves.zoom_start)/(waves.zoom_end-waves.zoom_start));
			if((i>=0)&&(i<=w)){
				if(t==d){
					lcd_main.message("frgb",menudark);
					lcd_main.message("paintpoly",x1+i+i+2,y1,x1+i+i+2,y1-0.5*fontheight,x1+i+i+2-0.32*fontheight,y1-0.25*fontheight,x1+i+i+2,y1);
				}
				lcd_main.message("moveto",x1+i+i,y1);
				lcd_main.message("lineto",x1+i+i,y2-fo1);
				if(second==1){
					lcd_main.message("paintpoly",x1+i+i,y1,x1+i+i,y1-0.5*fontheight,x1+i+i+0.32*fontheight,y1-0.25*fontheight,x1+i+i,y1);
				}
			}
			if(second==1){
				lcd_main.message("frgb",menudarkest);
				second=0;
			}
		}
	}
	for(ch=0;ch<chans;ch++){
		var curc=1;
		if(highlight<1){ 
			lcd_main.message("frgb", r>>1,g>>1,b>>1);
			curc=0;
		}else{
			lcd_main.message("frgb",r,g,b);		
		}
		for(i=0;i<w;i++){
			wmin = draw_wave_z[buffer-1][ch*2][i];
			wmax = draw_wave_z[buffer-1][ch*2+1][i];
			if(isNaN(wmin)||isNaN(wmax)){post("nan",i); wmin=1; wmax=-1; samps=20;}
			for(t=0;t<samps;t++){
				s=waves_buffer[buffer-1].peek(ch+1,Math.floor((i+chunkstart+Math.random())*chunk));
				if(s>wmax){ wmax=s; chngd=1; }
				if(s<wmin){ wmin=s; chngd=1; }
			}
			draw_wave_z[buffer-1][ch*2][i] = wmin;
			draw_wave_z[buffer-1][ch*2+1][i] = wmax;
			if((i>=hls)&&(i<=hle)&&(curc==0)){
				lcd_main.message("frgb",r,g,b);
				curc=1;
			}else if((i>hle)&&(curc==1)){
				curc=0;
				lcd_main.message("frgb", r>>1,g>>1,b>>1);
			}
			lcd_main.message("moveto",x1+i+i,y1+h*(1+wmin+2*ch)-1);
			lcd_main.message("lineto",x1+i+i,y1+h*(1+wmax+2*ch)+1);
			//post("\n",i,x1+i+i,"dw len",draw_wave[buffer-1][ch*2].length,wmin,wmax);
		}
	}
	if(chngd){
		redraw_flag.deferred = 2;
	}
}

function draw_stripe(x1,y1,x2,y2,r,g,b,buffer,index){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 3);
	if(!Array.isArray(draw_wave[buffer-1])){
		draw_wave[buffer-1] = [[],[],[],[]];
	}
	var i,t,ch,s,dl,d,st;
	var wmin,wmax;
	var w = x2-x1;
//	post("\nok so",buffer,index,x1,waves.zoom_start,w);
	var zms=-1;zme=-1; ra = 1; rra=1;
	if(waves.selected == buffer-1){
		zms = Math.floor(waves.zoom_start*w*0.5);
		zme = Math.floor(waves.zoom_end*w*0.5);
		ra = (0.8-0.5*Math.abs(waves.zoom_end-waves.zoom_start));
		rra = 1/(0.1 + 0.8*Math.pow(waves.zoom_end-waves.zoom_start,2));
		lcd_main.message("paintrect", x1+zms*2, y1, x1+2*zme,y2, r*ra,g*ra,b*ra);
		zme++;
	}
	w = Math.floor((w-1)/2);
	var chunk = waves_dict.get("waves["+buffer+"]::length")/w;
	var chans = waves_dict.get("waves["+buffer+"]::channels");
	var h = 0.5*(y2-y1)/chans;
	st = waves_dict.get("waves["+buffer+"]::start");
	d = Math.floor(waves_dict.get("waves["+buffer+"]::divisions")*(MAX_WAVES_SLICES-0.0001))+1;
	dl = waves_dict.get("waves["+buffer+"]::end") - st;
	st = Math.floor(st*w);
	dl /= d;
	dl *= w;
	for(ch=0;ch<chans;ch++){
		if(!(waves.selected == buffer-1)||(dl!=1)){			
			lcd_main.message("frgb",menudarkest);
			for(t=0;t<d;t++){
				i = Math.floor(t*dl+st);
				lcd_main.message("moveto",x1+i+i,y1+h*2*ch);
				lcd_main.message("lineto",x1+i+i,y1+h*2*(ch+1));
			}
		}
		lcd_main.message("frgb",menudark);
		lcd_main.message("moveto",x1+st+st,y1+h*2*ch);
		lcd_main.message("lineto",x1+st+st,y1+h*2*(ch+1));
		i=Math.floor(waves_dict.get("waves["+buffer+"]::end")*w);
		lcd_main.message("moveto",x1+i+i,y1+h*2*ch);
		lcd_main.message("lineto",x1+i+i,y1+h*2*(ch+1));
		lcd_main.message("frgb",r,g,b);
		for(i=0;i<w;i++){
			wmin = draw_wave[buffer-1][ch*2][i];
			wmax = draw_wave[buffer-1][ch*2+1][i];
			if(isNaN(wmin))wmin=1;
			if(isNaN(wmax))wmax=-1;
			for(t=0;t<20;t++){
				s=waves_buffer[buffer-1].peek(ch+1,Math.floor((i+Math.random())*chunk));
				if(s>wmax) wmax=s;
				if(s<wmin) wmin=s;
			}
			draw_wave[buffer-1][ch*2][i] = wmin;
			draw_wave[buffer-1][ch*2+1][i] = wmax;
			if(i==zms) lcd_main.message("frgb", r*rra,g*rra,b*rra);
			if(i==zme) lcd_main.message("frgb", r,g,b);
			lcd_main.message("moveto",x1+i+i,y1+h*(1+wmin+2*ch)-1);
			lcd_main.message("lineto",x1+i+i,y1+h*(1+wmax+2*ch)+1);
		}
	}
}



function draw_h_slider_labelled(x1,y1,x2,y2,r,g,b,index,value){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 2);
	var lx;
 	if(value>=0) {
		if(value>=1){
			var m = 1 - (value % 1)*0.6;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		lx = x1 +  (x2 - x1) * (value % 1);
		lcd_main.message("paintrect",x1,y1,lx,y2,r>>1,g>>1,b>>1);
		lcd_main.message("moveto", (x1+2*fo1), (y2-2*fo1));
		if(value>0.3) {
			lcd_main.message("frgb", 0,0,0);
		}else{
			lcd_main.message("frgb" , r,g,b);
		}
		lcd_main.message("write", gain_display(value));
	}else{
		if(value<=-1){
			var m = 1 - ((-value) % 1)*0.6;
			lcd_main.message("paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		lx = x1 + (x2 - x1) * (1-((-value) % 1));
		lcd_main.message("paintrect",lx,y1,x2,y2,r>>1,g>>1,b>>1);
		lcd_main.message("moveto", (x1+2*fo1), (y2-2*fo1));
		if(value<-0.7) {
			lcd_main.message("frgb", 0,0,0);
		}else{
			lcd_main.message("frgb", r,g,b);
		}
		lcd_main.message("write", gain_display(value));
	}
}

function draw_2d_slider(x1,y1,x2,y2,r,g,b,index,value_x,value_y){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 4);
	var lx = x1 + 8 + (x2-x1-16)*value_x;
	var ly = y1 + 8 + (y2-y1-16)*(1-value_y);
	lcd_main.message("paintrect",(lx-4),(ly-4),(lx+4),(ly+4) ,r,g,b);
}

function draw_vector(x1,y1,x2,y2,r,g,b,index,angle){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	lcd_main.message("paintoval",x1,y1,x2,y2,0,0,0);
	lcd_main.message("frgb",r,g,b);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 2);
	lcd_main.message("moveto",((x1+x2)/2),((y1+y2)/2));
	lcd_main.message("lineto",(((x1+x2)/2)+Math.sin(6.28*angle)*(x2-x1-16)/2),(((y1+y2)/2)-Math.cos(6.28*angle)*(y2-y1-16)/2));
}

function draw_spread_levels(x1,y1,x2,y2,r,g,b,index,vector,offset,v1,v2,scale){
	if((v2==1)&&(v1==1)) return;
	if(bennyversion < 0.555) vector = -vector;
	var cx,cy,l;
	var ux = (x2-x1)/v2;
	var uy = (y2-y1)/v1;
	var minl=99,maxl=-99;
	for(cx=v2-1;cx>=0;cx--){
		for(cy=0;cy<v1;cy++){
			l = Math.abs(scale)*spread_level(cx, cy, offset,vector, v2, v1);
			lcd_main.message("paintrect",x1+cx*ux,y1+cy*uy,x1+(cx+1)*ux,y1+(cy+1)*uy,r*l,g*l,b*l);
			if(l<minl)minl=l;
			if(l>maxl)maxl=l;
		}
	}
	if(sidebar.mode != "connections"){
		lcd_main.message("font",mainfont,fontsmall);
		if(minl!=maxl){ //TODO THIS IS MESSY, WHOLE UI AROUND SPREAD NEEDS A LOT MORE EXPLAINING
			//lcd_main.message("font",mainfont, Math.min(uy,ux)*0.4);
			if(Math.min(uy,ux)*0.4>=fontsmall){
				lcd_main.message("frgb", menucolour);
				for(cx=v2-1;cx>=0;cx--){
					for(cy=0;cy<v1;cy++){
						l = scale*spread_level(cx, cy, offset,vector, v2, v1);
						lcd_main.message("moveto",x1+(cx+0.05)*ux,y1+(cy+0.95)*uy);
						lcd_main.message("write",l.toPrecision(2));				
					}
				}
			}
		}else{
			//maxl*=scale;
			lcd_main.message("frgb",0,0,0);
			lcd_main.message("moveto",(x1+5),(y1+(y2-y1)*0.95));
			lcd_main.message("write","x"+maxl.toPrecision(3));
		}
	}
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 4);
}

function find_scales_block(){
	for(var i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			if(blocks.get("blocks["+i+"]::name")=="core.scales.shapes"){
				scalesblock = i;
				break;
			}
		}
	}
	if(scalesblock==-1){
		var x=0; var y=0;
		var ss=sidebar.selected;
		if(sidebar.selected!=-1){
			if(blocks.contains("blocks["+sidebar.selected+"]::space")){
				x = -2+blocks.get("blocks["+sidebar.selected+"]::space::x");
				y = 2+blocks.get("blocks["+sidebar.selected+"]::space::y");
			}
		}
		//clear_blocks_selection();
		scalesblock = new_block("core.scales.shapes",x,y);
		draw_blocks();//scalesblock);
		selected.block[ss]=1;
		sidebar.selected = ss;
		//redraw_flag.deferred |= 2;
	}
}

function draw_keyboard(x1,y1,x2,y2,poolno,cp){
	var keybx=[0,0.5,1,1.5,2,3,3.5,4,4.5,5,5.5,6];
	var keyby=[0,1,0,1,0,0,1,0,1,0,1,0];
	var xunit=(x2-x1)/13.9;
	var x;
	//var cp = (poolno==0)?menudark : config.get("palette::gamut["+((poolno* config.getsize("palette::gamut")/8)|0)+"]::colour");
	var i,t=-1,pool_notes=[];
	if(scalesblock==-1){
		find_scales_block();
	}
	var v_list = voicemap.get(scalesblock);
	if(!Array.isArray(v_list))v_list=[v_list];
	if(v_list.length<poolno){
		voicecount(scalesblock,poolno);
		v_list = voicemap.get(scalesblock);
		if(!Array.isArray(v_list))v_list=[v_list];
	}
	// post("\ndrawing keyb",poolno,scalesblock,v_list);
	if(poolno!=0){ //chromatic is just grey keys
 		for(i=0;t<48;i++){
			var nt = indexpool_buffer.peek(poolno+1,i);
			if(t==nt){
				t=99
			}else{
				t=nt;
				if(t>=24) pool_notes.push(t-24);
			}
		}
	}
	for(i=0;i<24;i++){
		if(keyby[i%12]==0){
			x = 7*(i>11) + keybx[i%12];
			c=[70,70,70];
			for(t=0;t<pool_notes.length;t++){
				if(pool_notes[t]==i) c = cp;
			}
			lcd_main.message("paintrect",x1+xunit*x,y1,x1+xunit*(x+0.9),y2,c);
			if(poolno>0) custom_ui_element("direct_button",x1+xunit*x,y1,x1+xunit*(x+0.9),y2,"note",scalesblock,"togglenote",i,v_list[poolno-1]+1,poolno);//,v_list[0],0);
		}
	}
	for(var i=0;i<24;i++){
		if(keyby[i%12]==1){
			c=[40,40,40];
			for(t=0;t<pool_notes.length;t++){
				if(pool_notes[t]==i){
					c = cp;
				}
			}
			x = 7*(i>11) + keybx[i%12];
			lcd_main.message("paintrect",x1+xunit*x,y1,x1+xunit*(x+0.9),y1*0.3+0.7*y2,c);
			if(poolno>0) custom_ui_element("direct_button",x1+xunit*x,y1,x1+xunit*(x+0.9),y1*0.3+0.7*y2,"note",scalesblock,"togglenote",i,v_list[poolno-1]+1,poolno);//,v_list[0],0);
		}
	}
}

function wipe_midi_meters(){
	for(i = meters_updatelist.midi.length-1; i>=0; i--){
		var block=meters_updatelist.midi[i][0];
		var voice=meters_updatelist.midi[i][1];
		if(blocks_meter[block][voice] !== 'undefined'){
			var polyvoice = meters_updatelist.midi[i][2];
			midi_meters_buffer.poke(1,polyvoice, [1,0,0,0,0,0,0]);
		}
	}
	meters_updatelist.midi = [];
}


function draw_spread(x1,y1,x2,y2,r,g,b,index,angle,amount,v1,v2,fcol,tcol){
	if(fcol==null)fcol=[r,g,b];
	if(tcol==null)tcol=[r,g,b];
	if(bennyversion < 0.555) angle = -angle;
	t = (1-amount)*(x2-x1-8)/2;
	lcd_main.message("paintrect",x1,y1,x2,y2,r/6,g/6,b/6);
	lcd_main.message("paintoval",x1,y1,x2,y2,0,0,0);
	lcd_main.message("frameoval",x1,y1,x2,y2,tcol);
	lcd_main.message("frameoval",(x1+t),(y1+t),(x2-t),(y2-t),fcol);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 4);
	var cx = (x1+x2)/2;
	var cy = (y1+y2)/2;
	var r1 = (x2-x1)/2;
	var w = r1*0.1;
	var i=0;
	var col=tcol; //[r,g,b];
	for(i=0;i<v2;i++){ // destinations
		lcd_main.message("paintrect",(cx-w+r1*Math.sin(6.28*i/v2)),(cy-w-r1*Math.cos(6.28*i/v2)),(cx+w+r1*Math.sin(6.28*i/v2)),(cy+w-r1*Math.cos(6.28*i/v2)),col);
		if(i==0) col = shadeRGB(tcol,0.5);
	}
	col=shadeRGB(tcol,1.5);
	for(i=0;i<v2;i++){ // labels 
		lcd_main.message("moveto",(cx-w+((i<10)*2 - 0.33)*fo1+r1*Math.sin(6.28*i/v2)),(cy+w-1.3*fo1-r1*Math.cos(6.28*i/v2)));
		lcd_main.message("frgb", col);
		lcd_main.message("write",i+1);
		if(i==0) col = [0,0,0];
	}
	r1 -= t;
	col=fcol;
	for(i=0;i<v1;i++){ // sources
		lcd_main.message("paintrect",(cx-w+r1*Math.sin(6.28*(angle + i/v1))),(cy-w-r1*Math.cos(6.28*(angle + i/v1))),(cx+w+r1*Math.sin(6.28*(angle + i/v1))),(cy+w-r1*Math.cos(6.28*(angle + i/v1))),col);
		if(i==0) col = shadeRGB(fcol,0.5);
	}
	col=shadeRGB(fcol,1.5);
	for(i=0;i<v1;i++){ // labels
		lcd_main.message("moveto",(cx-w+((i<10)*2 - 0.33)*fo1+r1*Math.sin(6.28*(angle + i/v1))),(cy+w-1.3*fo1-r1*Math.cos(6.28*(angle + i/v1))));
		lcd_main.message("frgb", col);
		lcd_main.message("write",i+1);
		if(i==0) col = [0,0,0];
	}
}

function custom_ui_element(type,x1,y1,x2,y2,r,g,b,dataindex,paramindex,highlight,xp1,xp2,xp3,xp4){
	if(type=="data_v_scroll"){
		draw_v_slider(x1,y1,x2,y2,r,g,b,mouse_index,voice_data_buffer.peek(1,dataindex));
		mouse_click_actions[mouse_index] = data_edit;
		mouse_click_parameters[mouse_index] = [dataindex,0];
		mouse_click_values[mouse_index] = 0;
		if(paramindex==1){
			mouse_click_parameters[mouse_index] = [dataindex,1,y1,y2];
		}else if(paramindex==2){
			mouse_click_parameters[mouse_index] = [dataindex,2,x1,x2];
		} //for datasliders this holds the click_to_set value
		mouse_index++;			
	}else if(type=="data_h_scroll"){
		draw_h_slider(x1,y1,x2,y2,r,g,b,mouse_index,voice_data_buffer.peek(1,dataindex));
		mouse_click_actions[mouse_index] = data_edit;
		mouse_click_parameters[mouse_index] = [dataindex,0];
		mouse_click_values[mouse_index] = 0;
		if(paramindex==1){
			mouse_click_parameters[mouse_index] = [dataindex,1,y1,y2];
		}else if(paramindex==2){
			mouse_click_parameters[mouse_index] = [dataindex,2,x1,x2];
		} //for datasliders this holds the click_to_set value
		mouse_index++;			
	}else if(type=="param_v_scroll"){//0=block,1=paramno
		draw_v_slider(x1,y1,x2,y2,r,g,b,mouse_index,parameter_value_buffer.peek(1,MAX_PARAMETERS*dataindex+paramindex));
		mouse_click_actions[mouse_index] = sidebar_parameter_knob;
		mouse_click_parameters[mouse_index] = [paramindex, dataindex];
		mouse_click_values[mouse_index] = "";
		mouse_index++;
	}else if(type=="param_toggle"){//0=block,1=paramno
		var v = parameter_value_buffer.peek(1,MAX_PARAMETERS*dataindex+paramindex);
		v = 0.1 + 0.5*(v>0.5);
		var c = 1;
		if(v<=0.5) c=0.2;
		//post("\ndrawbutton",paramindex,v);
		//draw_v_slider(x1,y1,x2,y2,r,g,b,mouse_index,v>0.5);
		lcd_main.message("paintrect",x1,y1,x2,y2,r*c,g*c,b*c);
		click_rectangle(x1,y1,x2,y2,mouse_index,1);
		//draw_button(x1,y1,x2,y2,r,g,b,mouse_index,"",parameter_value_buffer.peek(1,MAX_PARAMETERS*dataindex+paramindex));
		mouse_click_actions[mouse_index] = do_parameter_toggle;
		mouse_click_parameters[mouse_index] = [paramindex, dataindex];
		mouse_click_values[mouse_index] = (v+0.5001) % 1;
		mouse_index++;
	}else if(type=="mouse_passthrough"){ //this one just sends mouse x/y,mouse values
		click_rectangle( x1,y1,x2,y2, mouse_index, 7);
		mouse_click_actions[mouse_index] = custom_mouse_passthrough;
		mouse_click_parameters[mouse_index] = dataindex+1; //custom_block+1;
		mouse_click_values[mouse_index] = paramindex; //0;//[x1,y1,x2,y2]; if 1 it reports mouseidle too
		//post("\ndrew passthrough mode",x1,y1,x2,y2,paramindex);
		mouse_index++;
	}else if(type=="direct_mouse_passthrough"){ // this one is more complicated but sends x y as a proportion of the button
		click_rectangle( x1,y1,x2,y2, mouse_index, 7);
		mouse_click_actions[mouse_index] = custom_direct_mouse_passthrough;
		mouse_click_parameters[mouse_index] = paramindex; //custom_block+1;
		mouse_click_values[mouse_index] = [r,g,b,dataindex,highlight,x1,y1,x2,y2];
		mouse_index++;
	}else if(type =="waveform_slice_highlight"){
		draw_waveform(x1,y1,x2,y2,r,g,b,paramindex,mouse_index,highlight)
		mouse_click_actions[mouse_index] = custom_mouse_passthrough;
		mouse_click_parameters[mouse_index] = dataindex;//+1; //custom_block+1;
		mouse_click_values[mouse_index] = 0;
		mouse_index++;		
	}else if(type =="direct_button"){ // draw the button yourself so you can get your text nice, leaves r,g,b free to carry target(type),target(number),message
		// so far only used on stretch looper. downside is it can't respond visually to mouse click
		click_rectangle( x1, y1, x2, y2, mouse_index, 7);
		mouse_click_actions[mouse_index] = custom_direct_mouse_button;
		mouse_click_parameters[mouse_index] = paramindex; //custom_block+1;
		mouse_click_values[mouse_index] = [r,g,b,dataindex,highlight];
		mouse_index++;				
	}else if(type=="opv_button"){
		var block = xp1;//dataindex; 
		var vc=view_changed;
		view_changed = true;
		var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramindex+dataindex);
		var m=(1 + (pv>0.5))*0.5;
		draw_button(x1,y1,x2,y2,r*m,g*m,b*m,mouse_index, highlight,pv>0.5);
		mouse_click_actions[mouse_index] = static_mod_adjust_custom_opv_button;
		mouse_click_parameters[mouse_index] = [dataindex, block, paramindex];
		mouse_click_values[mouse_index] = 0.99* (pv<=0.5);
		view_changed = vc;
		mouse_index++;		
	}else if(type=="opv_v_slider_passthrough"){
		var block = highlight; 
		var vc=view_changed;
		view_changed = true;
		var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramindex+dataindex);
		//post("\nslider",dataindex,block,paramindex,pv);
		// draw_v_slider(x1,y1,x2,y2,r*0.5,g*0.5,b*0.5,mouse_index, pv);
		click_rectangle(x1,y1,x2,y2,mouse_index,2);
		mouse_click_actions[mouse_index] = static_mod_adjust_custom;
		mouse_click_parameters[mouse_index] = [dataindex, block, paramindex,"custom_opv"];
		mouse_click_values[mouse_index] = null; //0.99* (pv<=0.5);
		view_changed = vc;
		mouse_index++;		
	}else if(type=="opv_2d_slider_passthrough"){
		var block = highlight; 
		var vc=view_changed;
		view_changed = true;
		var pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*paramindex+dataindex);
		//post("\nslider",dataindex,block,paramindex,pv);
		click_rectangle(x1,y1,x2,y2,mouse_index,4);
		// draw_v_slider(x1,y1,x2,y2,r*0.5,g*0.5,b*0.5,mouse_index, pv);
		mouse_click_actions[mouse_index] = static_mod_adjust_custom;
		mouse_click_parameters[mouse_index] = [xp1, block, paramindex,"custom_opv"];
		mouse_click_values[mouse_index] = [dataindex, block, paramindex,"custom_opv"]; //0.99* (pv<=0.5);
		view_changed = vc;
		mouse_index++;		
	}else if(type=="select_connection"){
		click_rectangle( x1,y1,x2,y2, mouse_index, 1);
		mouse_click_actions[mouse_index] = sidebar_select_connection;
		mouse_click_parameters[mouse_index] = r; //custom_block+1;
		mouse_click_values[mouse_index] = null;
		mouse_index++;				
	}
}

function flock_axes(v){
	flock_cubexy.enable = v;
	flock_cubexz.enable = v;
	flock_cubeyz.enable = v;
}

function request_redraw_if_visible(block){
	if(sidebar.selected==block) redraw_flag.flag |= 2;
}

function center_view(resetz){
	var i;
	var x,y;
	var maxx=0,minx=0,miny=0,maxy=0;
	for(i=0;i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::name")){
			x=blocks.get("blocks["+i+"]::space::x");
			y=blocks.get("blocks["+i+"]::space::y");
			if(x<minx){ 
				minx=x;
			}else if(x>maxx){
				maxx=x;
			}
			if(y<miny){
				miny=y;
			}else if(y>maxy){
				maxy=y;
			}
		}
	}
	var w = maxx-minx;
	var h = maxy-miny;
	h *= (mainwindow_width/mainwindow_height);
	var d = Math.max(w,h);
	
	
	camera_position[1] = 0.5*(maxy+miny);
	if((resetz) || (camera_position[2]<1)) camera_position[2] = 23*Math.sqrt(d/8);
	if(sidebar.mode!="none"){
		camera_position[0] = (maxx * 0.8 + minx * 0.2);
		if(sidebar.mode=="file_menu") camera_position[0] = (maxx);
		camera_position[2] *= 1.5;
	}else{
		camera_position[0] = (maxx+minx)*0.5;
	}
	camera();
	redraw_flag.flag |= 4;	
}

function request_voice_colour(block,voiceno,r,g,b){
	if((block<0)||(block==null)||(block>MAX_BLOCKS)){error("out of range"); return -1;}
	if(r == -1){
		var colour = null;
	}else{
		var colour = [r,g,b];
	}
	if(!Array.isArray(blocks_per_voice_colour_overrides[block])) blocks_per_voice_colour_overrides[block] = [];
	blocks_per_voice_colour_overrides[block][voiceno] = colour;
	redraw_flag.flag |= 8;
}

function wrap_dot_text(text,width_in_px){ // returns line wrapped array with spaces when concattenating two words into one line
	var thresh = 6 * width_in_px / fontheight;
	var bl2 = text.split(".");
	var rx=1;
	var out = [];
	var temp = "";
	for(var r=0;r<bl2.length;r++){
		rx+=1+bl2[r].length;
		// var rx2 = rx;
		//if(r+1<bl2.length) rx2 += bl2[r+1].length;
		if(rx>=thresh){
			if(temp!="") out.push(temp);
			temp = "";
			rx=0;
		}
		temp = temp + bl2[r]+" ";
	}
	if(temp!="") out.push(temp);
	return out;
}

function request_redraw(n){
	if(n<0){
		n = -n;
		if(displaymode!="blocks") n &= 19; //removes 4, block redraw and 8, block colours
		redraw_flag.deferred |= n;
	}else{
		if(displaymode!="blocks") n &= 19; //removes 4, block redraw and 8, block colours
		redraw_flag.flag |= n;
	}
}

function getBlockName(b){
	if(blocks.contains("blocks["+b+"]::label")){
		return blocks.get("blocks["+b+"]::label");
	}else{
		return blocks.get("blocks["+b+"]::name");
	}
}

function draw_menu_hint(){
	var topspace=(menu.mode == 3)+1.1*(loading.progress!=0);
	lcd_main.message("clear");
	lcd_main.message("paintrect", sidebar.x,9+1.1*(loading.progress!=0)*fontheight,sidebar.x2,9+(topspace+1)*fontheight,menudarkest);
	lcd_main.message("frgb",menucolour);
	lcd_main.message("textface", "bold");
	lcd_main.message("font",mainfont,fontsmall*2);
	lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(0.75+1.1*(loading.progress!=0)));
	if(menu.mode == 1){
		lcd_main.message("write", "swap block:");
		if(!menu.show_all_types){
			topspace += 1.1;
			lcd_main.message("paintrect",sidebar.x,9+fontheight*(topspace),sidebar.x2,9+fontheight*(topspace+1),menudark);
			lcd_main.message("frgb",0,0,0);
			lcd_main.message("font",mainfont,fontheight/2.5);
			lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.35));
			lcd_main.message("write","just showing (potentially) matching types,");
			lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.8));
			lcd_main.message("write","click here to show all");
			click_zone(menu_show_all,1,1,sidebar.x,9+fontheight*(topspace),sidebar.x2,9+fontheight*(topspace+1),mouse_index,1);		
		}
	}else if(menu.mode == 2){
		lcd_main.message("write", "insert block in connection:");
	}else if(menu.mode == 0){
		lcd_main.message("write", "add new block:");
	}else if(menu.mode == 3){
		lcd_main.message("write", "please choose a substitute for "); 
		lcd_main.message("moveto", sidebar.x+fontheight*0.2,9+fontheight*(1.75+1.1*(loading.progress!=0)));
		lcd_main.message("write", menu.swap_block_target);
	}

	if(menu.search!=""){
		topspace += 1.1;
		lcd_main.message("paintrect",sidebar.x,9+fontheight*(topspace),sidebar.x2,9+fontheight*(topspace+1),menucolour);
		lcd_main.message("frgb",0,0,0);
		lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.75));
		lcd_main.message("write","search: "+menu.search);
	}

	if(blocks_page.was_selected!=null && (!usermouse.shift != /*XOR*/ !config.get("ALWAYS_AUTOCONNECT_IF_YOU_CAN"))){
		topspace += 1.1;
		lcd_main.message("paintrect",sidebar.x,9+fontheight*(topspace),sidebar.x2,9+fontheight*(topspace+0.5),menudark);
		lcd_main.message("frgb",menucolour);
		lcd_main.message("font",mainfont,fontheight/2.5);
				lcd_main.message("textface", "normal");

		lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.35));
		var ft="from";
		if(blocks_page.new_block_click_pos[1] > blocks.get("blocks["+blocks_page.was_selected+"]::space::y")) ft = "to";
		lcd_main.message("write","will connect automatically",ft,":",getBlockName(blocks_page.was_selected));
		lcd_main.message("font",mainfont,fontheight);
		lcd_main.message("textface", "bold");
		topspace -= 0.5;
	}

	// if((matrix_menu_index[num] == undefined)||(num == -1)){
	// 	if((menu.search!="")&&(matrix_menu_index[0]!==undefined)){
	// 		num = matrix_menu_index[0];
	// 	// }else{
	// 	// 	lcd_main.message("bang");
	// 	// 	return 0;
	// 	}
	// }
	// menu.selected = num;
	if(menu.selected==undefined && (matrix_menu_index[0]!==undefined) ) menu.selected = matrix_menu_index[0];
	
	var type = blocks_menu[menu.selected].name;
	var col = menucolour;
	var cod;
	if(blocktypes.contains(type+"::colour")){
		col = blocktypes.get(type+"::colour");
		cod = shadeRGB(col, bg_dark_ratio);
		var av = 420/(col[0]+col[1]+col[2]*0.7+0.1);
		col = shadeRGB(col, av);
		if(automap.mapped_c == -0.5){
			mapcolours = [col[0], col[1], col[2]];
			for(var i=0;i<(automap.c_cols*automap.c_rows - 1);i++)mapcolours.push(-1);
			note_poly.message("setvalue", automap.available_c,"mapcolour",mapcolours);
		}
	}else{ cod = shadeRGB(col, bg_dark_ratio); }

	if(blocktypes.contains(type+"::help_text")){
		var block_name = type;
		var hint=blocktypes.get(block_name+"::help_text")+" ";
		//		post("\n"+usermouse.hover[1]+" : "+hint);
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
		get_io_name_and_description("parameters","out");	
		hint = hint+"                       ";
		var hintrows = 0.4+ hint.length / 27+hint.split("£").length-1;
		lcd_main.message("paintrect", sidebar.x,9+(topspace+1.1)*fontheight,sidebar.x2,9+fontheight*(2.1+topspace),cod);
		
		sidebar.used_height = 9+fontheight*(4.1+topspace+0.45*hintrows);
		lcd_main.message("paintrect",sidebar.x,9+fontheight*(topspace+2.2),sidebar.x2,sidebar.used_height ,cod);
		lcd_main.message("frgb",col);
		lcd_main.message("moveto", sidebar.x+fo1*2,9+fontheight*(topspace+0.75));
		var rowstart=0;
		var rowl = 54;
		var rowend=rowl;
		lcd_main.message("paintrect", sidebar.x,9+fontheight*(1.1+topspace),sidebar.x2,9+fontheight*(2.1+topspace),cod);
		lcd_main.message("frgb",col);
		lcd_main.message("moveto", sidebar.x+fontheight*0.2,9+fontheight*(1.85+topspace));
		lcd_main.message("write", block_name);
		lcd_main.message("font",mainfont,fontheight/2.5);
		lcd_main.message("textface", "normal");
		var bold=0;
		var sameline=0;
		for(var ri=0;ri<hintrows;ri++){
			while(((hint[rowend]!=' ')&&(hint[rowend]!='£')) && (rowend>1+rowstart)){ rowend--; }
			var sliced = hint.slice(rowstart,rowend);
			if(!sameline) {
				lcd_main.message("moveto",sidebar.x+fontheight*0.2,9+fontheight*(2.9+topspace+0.45*(ri)));
				//lcd_main.message("moveto",sidebar.x+fontheight*0.2,y_offset+fontheight*(0.75+0.4*ri));
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
				rowend+=rowl;
			}else{
				var t = rowstart+rowl;
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
	lcd_main.message("bang");
	sidebar_size();
}
	

function conn_draw_from_outputs_list(i, f_name, ty, y_offset, truncate) {
	var curr=-1;
	if(connections.get("connections["+i+"]::from::output::type")==ty){
		curr = (connections.get("connections["+i+"]::from::output::number"))
	}
	var desc = 0; // this enable displaying descriptions here, but it always feels like redundant text..
	if(sidebar.connection.help && (blocktypes.contains(f_name + "::connections::out::descriptions::" + ty))) desc = 1;
	var tty = ty;
	if(ty=="matrix") tty="matrix_channels";
	if(blocktypes.contains(f_name + "::connections::out::" + tty)){
		var l;
		if(ty!="matrix"){
			l = blocktypes.get(f_name + "::connections::out::" + ty);
		}else{
			l = blocktypes.get(f_name + "::connections::out::hardware");
		}
		if (!Array.isArray(l)) l = [l];
		var c = config.get("palette::connections::" + ty);
		var len = l.length;
		if(truncate!=null) len = Math.min(len,truncate);
		for (var o = 0; o < len; o++) {
			if(ty=="matrix"){
				if(blocktypes.get(f_name + "::connections::out::matrix_channels["+o+"]")==0){
					l[o]=null;
				}
			}
			if(l[o]!=null){
				if(curr==o){
					lcd_main.message("paintrect", sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, c);
					lcd_main.message("frgb", 0,0,0);
				}else{
					lcd_main.message("paintrect", sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, shadeRGB(c, bg_dark_ratio));
					lcd_main.message("frgb", c);
				}
				lcd_main.message("moveto", sidebar.x + fo1 * 14, y_offset + 4 * fo1);
				lcd_main.message("write", l[o]);
				lcd_main.message("frgb", shadeRGB(c, 0.5));
				lcd_main.message("write", ty);
				if(desc && (blocktypes.get(f_name + "::connections::out::descriptions::" + ty+"["+o+"]")!="")){
					lcd_main.message("moveto", sidebar.x + fo1 * 15, y_offset + 11 * fo1);
					//lcd_main.message("frgb", c);
					lcd_main.message("write", blocktypes.get(f_name + "::connections::out::descriptions::" + ty+"["+o+"]"));
					click_zone(conn_set_from_output, i, [ty, o], sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 13 * fo1, mouse_index, 1);
					y_offset+=7*fo1;
				}else{
					click_zone(conn_set_from_output, i, [ty, o], sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, mouse_index, 1);
				}
				y_offset+=7*fo1;
			}
		}
	}
	return y_offset;
}

function conn_draw_to_inputs_list(i, t_name, ty, y_offset) {
	var curr=-1;
	if(connections.get("connections["+i+"]::to::input::type")==ty){
		curr = (connections.get("connections["+i+"]::to::input::number"))
	}
	var l = [];
	var tty = ty;
	if(ty=="matrix") tty="matrix_channels";
	if(ty=="block"){
		l = ["mute toggle", "mute"];
	}else if(ty=="parameters"){
		var t = blocktypes.getsize(t_name+"::parameters");
		for(var p=0;p<t;p++){
			if(blocktypes.contains(t_name+"::parameters["+p+"]::nomap") && (blocktypes.get(t_name+"::parameters["+p+"]::nomap")==1)){
				//skip
				l.push(null);
			}else{
				l.push(blocktypes.get(t_name+"::parameters["+p+"]::name"));
			}
		}
	}else if(blocktypes.contains(t_name + "::connections::in::" + tty)){
		if(ty!="matrix"){
			l = blocktypes.get(t_name + "::connections::in::" + ty);
		}else{
			l = blocktypes.get(t_name + "::connections::in::hardware");
		}
		if (!Array.isArray(l)) l = [l];
	}
	if(l.length>0){
		var cc = config.get("palette::connections::" + ty);
		var c = cc;

		for (var o = 0; o < l.length; o++) {
			var used_already = 0;
			if(ty=="matrix"){
				if(blocktypes.get(t_name + "::connections::in::matrix_channels["+o+"]")==0){
					l[o]=null;
				}else{
					//lets check for conflicts. each matrix out (ie hw block input) can only have one connection
					for(var tc=connections.getsize("connections");tc>=0;tc--){
						if((tc!=i) && (connections.contains("connections["+tc+"]::to")) 
							&& (connections.get("connections["+tc+"]::to::number") == (connections.get("connections["+i+"]::to::number")))
							&& (connections.get("connections["+tc+"]::to::input::type")=="matrix")
							&& (connections.get("connections["+tc+"]::to::input::number") == o)){
							used_already = tc; //l[o]=null;
							c=[60,60,60];
							tc=-1;
						}
					}
					if(used_already==0)c=cc;
				}
			}
			if(l[o]!=null){
				if(curr==o){
					lcd_main.message("paintrect", sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, c);
					lcd_main.message("frgb", 0,0,0);
				}else{
					lcd_main.message("paintrect", sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, shadeRGB(c, bg_dark_ratio));
					lcd_main.message("frgb", c);
				}
				lcd_main.message("moveto", sidebar.x + fo1 * 14, y_offset + 4 * fo1);
				lcd_main.message("write", l[o]);
				lcd_main.message("frgb", shadeRGB(c, 0.5));
				if(used_already==0){
					lcd_main.message("write", ty);
					click_zone(conn_set_to_input, i, [ty, o], sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, mouse_index, 1);
				}else{
					lcd_main.message("write", "matrix (input already in use)");
					click_zone(sidebar_select_connection, used_already, 0, sidebar.x + fo1 * 12, y_offset, sidebar.x2, y_offset + 6 * fo1, mouse_index, 1);
				}
				y_offset+=7*fo1;
			}
		}
	}
	return y_offset;
}

function midi_indicator(number){
	if(midi_indicators.status[number]==0) midi_indicators.flag = 1;
	midi_indicators.status[number] = 1;
}
function ext_clock_indicator(){
	number=midi_indicators.list.length;
	if(midi_indicators.status[number]==0) midi_indicators.flag = 1;
	midi_indicators.status[number] = 1.3;
}

function draw_clock(){
	var cx2 = ((sidebar.mode == "none")&&!automap.lock_c &&!automap.lock_k &&!automap.lock_q) ? (mainwindow_width) : (sidebar.x);
	if(sidebar.mode == "file_menu") cx2 = sidebar.x2 - fontheight * 15;
	var cx = cx2 - fontheight*2 - 9;
	lcd_main.message("paintrect", cx,9,cx2,9+fontheight,0,0,0);
	lcd_main.message("font",mainfont,fontheight*0.8);
	var currentdate = new Date;
	if(set_timer_show){
		lcd_main.message("moveto",cx, 9+fontheight*0.8);
		if(sidebar.mode=="none"){
			lcd_main.message("frgb", menudark);
		}else if(sidebar.mode == "file_menu"){
			lcd_main.message("frgb", 60,60,60);
		}else{
			lcd_main.message("frgb", sidebar.scopes.fg);
		}
		if(set_timer_start == null){
			lcd_main.message("write", "0:00");			
		}else{
			var t = currentdate.getTime();
			t -= set_timer_start;
			t *= 0.001;
			t = Math.floor(t);
			var t2 = Math.floor(t/60);
			t = t - 60*t2;
			if(t<10) t = "0"+t;
			lcd_main.message("write", t2+":"+t);			
		}
		if(view_changed)click_zone(toggle_show_timer,0,0,cx,0,cx2,9+fontheight,mouse_index,1);
	}else{
		lcd_main.message("moveto",cx, 9+fontheight*0.8);
		var m = currentdate.getMinutes();
		if(m<10) m = "0"+m;
		var hh = (currentdate.getHours());
		var h = hh % 12;
		h += (hh==12)*12;
		if((m==20)&&(h==4)){
			lcd_main.message("frgb", 44,220,50); //i'm sorry
		}else if(sidebar.mode=="none"){
			lcd_main.message("frgb", menudarkest);
		}else if(sidebar.mode == "file_menu"){
			lcd_main.message("frgb", 30,30,30);
		}else{
			lcd_main.message("frgb", sidebar.scopes.bg);
		}
		lcd_main.message("write", h + ":" +m);			
		if(view_changed)click_zone(toggle_show_timer,1,1,cx,0,cx2,9+fontheight,mouse_index,1);
	}
	lcd_main.message("font",mainfont,fontsmall);
}

function long_sidebar_text(textcontent,size) {
	if(size!=null){
		lcd_main.message("font",mainfont,fontsmall*size);
	}else{
		size = 1;
		lcd_main.message("font",mainfont,fontsmall);
	}
	var t;
	var textcontentrows = 0.4 + textcontent.length * size / 45 + textcontent.split("£").length - 1;
	var rowstart = 0;
	var rowend = Math.ceil(7 * sidebar.width_in_units/size);
	textcontent = textcontent + "                       ";
	var bold = 0;
	var sameline = 0;
	for (var ri = 0; ri < textcontentrows; ri++) {
		while ((textcontent[rowend] != ' ') && (rowend > 1 + rowstart)) { rowend--; }
		var sliced = textcontent.slice(rowstart, rowend);
		if (!sameline) {
			lcd_main.message("moveto", sidebar.x + fontheight * 0.2, y_offset + fontheight * (0.75 + 0.4 * ri * size));
			if((y_offset + fontheight * (0.75 + 0.4 * ri * size))>mainwindow_height) break;
		} else {
			ri--;
		}
		sameline = 0;
		var newlineind = sliced.indexOf("£");
		var boldind = sliced.indexOf("*");
		if ((boldind > -1) && (newlineind > -1)) {
			if (boldind < newlineind) {
				newlineind = -1;
			} else {
				boldind = -1;
			}
		}
		if (newlineind > -1) {
			rowend = rowstart + sliced.indexOf("£");
			sliced = textcontent.slice(rowstart, rowend);
			sameline = 0;
		}
		if (boldind > -1) {
			sameline = 1;
			bold = 1 - bold;
			rowend = rowstart + sliced.indexOf("*");
			sliced = textcontent.slice(rowstart, rowend);
		}
		lcd_main.message("write", sliced);
		if (!sameline) {
			rowstart = rowend + 1;
			rowend += Math.ceil(7 * sidebar.width_in_units/size);
		} else {
			var t = rowstart + 46/size;
			rowstart = rowend + 1;
			rowend = t;
		}
		if (bold) {
			lcd_main.message("textface", "bold");
		} else {
			lcd_main.message("textface", "normal");
		}
	}
	lcd_main.message("font",mainfont,fontsmall);

	if (!bold) lcd_main.message("textface", "bold");
	y_offset = y_offset + fontheight * (0.75 + 0.4 * ri) * size;
}

function sidebar_notification(message){
	sidebar.notification = message;
	set_sidebar_mode("notification");
}

function timed_sidebar_notification(message, time){
	sidebar.notification = message;
	sidebar.notification_return = sidebar.mode;
	if(time<=0) time = 1000;
	set_sidebar_mode("notification");
	var notify_return_task = new Task(return_from_notify,this);
	notify_return_task.schedule(time);
}

function return_from_notify(){
	if(sidebar.mode == "notification") set_sidebar_mode(sidebar.notification_return);
}

function name_mixer_channel(block,chan){
	if(blocks.contains("blocks["+block+"]::name")&&(blocks.get("blocks["+block+"]::name").indexOf("mixer.")>-1)){
		post("\nnaming mixer channel");
		var channelnames=[];
		if(!blocks.contains("blocks["+block+"]::channel_names")){
			vl = voicemap.get(block);
			if(!Array.isArray(vl))vl=[vl];
			for(var i=0;i<vl.length;i++){
				channelnames.push((i+1));
			}
			blocks.replace("blocks["+block+"]::channel_names",channelnames);
		}else{
			channelnames = blocks.get("blocks["+block+"]::channel_names");
			if(!Array.isArray(channelnames))channelnames=[channelnames];
		}
		sidebar.text_being_edited = channelnames[chan].toString();
		sidebar.channelnaming = [block,chan];
		post("\nchan name edit: ",block,chan,sidebar.text_being_edited);
		set_sidebar_mode("edit_channel_name");
	}
}
function edited_channel_name(){
	if(sidebar.text_being_edited == "cancel"){
		
	}else{
		post("\nnaming params:",sidebar.channelnaming);
		var channelnames = blocks.get("blocks["+sidebar.channelnaming[0]+"]::channel_names");
		post("\nexisting names:",channelnames);
		channelnames[sidebar.channelnaming[1]] = sidebar.text_being_edited;
		post("\nnow:",channelnames);
		blocks.replace("blocks["+sidebar.channelnaming[0]+"]::channel_names",channelnames);
	}
	selected.block[sidebar.channelnaming[0]]=1;
	set_sidebar_mode("none");
}


function friendlytime(ms){
	if(ms<1000){
		return Math.floor(ms)+"ms";
	}else if(ms<60000){
		ms/=1000;
		return ms.toFixed(2)+"s";
	}else{
		ms/=1000;
		return Math.floor(ms/60)+"m"+Math.floor(ms%60)+"s";
	}
}
