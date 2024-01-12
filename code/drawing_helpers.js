function click_clear(index,type){
	if(usermouse.left_button) return 1;
	//post("\nwiping click matrix");
	view_changed = true;
	click_rectangle(0,0,mainwindow_width,mainwindow_height,index,type); // wipe click matrix
}
function click_oval(x1,y1,x2,y2,index,type){
	click_rectangle(x1,y1,x2,y2,index,type); //sorry, i lied. TODO draw ovals here
}
// click-zone takes care of whether it needs to be drawn, increments the counter whatever
function click_zone(action,parameters,values,x1,y1,x2,y2,index,type){
	if(view_changed===true){
		mouse_click_actions[mouse_index] = action;
		mouse_click_parameters[mouse_index] = parameters;
		mouse_click_values[mouse_index] = values;
		click_rectangle(x1,y1,x2,y2,index,type);
	}
	mouse_index++;
}

function click_rectangle(x1,y1,x2,y2,index,type){
	x1=Math.max(0,x1) >> click_b_s;
	x2 = x2 >> click_b_s;
	if(x2 <= x1) return 0;
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
			lcd_block_textures.message("font",mainfont,25);
			lcd_block_textures.message("textface","bold");
			for(var t=0;t<bln.length;t++){
				lcd_block_textures.message("moveto",5, 28+t*29);
				lcd_block_textures.message("write",bln[t]);
			}
			lcd_block_textures.message("bang");
		}
	}
}

function block_texture_is(i,tex){
	blocks_cube_texture[i] = tex;
	if(Array.isArray(blocks_cube[i])){
		//post("received texture for existing block ",i,"it is",tex);
		if(blocks_cube[i].length){
			blocks_cube[i][0].texture = tex;
		}
	}
}

function menu_block_texture_is(i,tex){
	blocks_menu_texture[i] = tex;
	//post("\nreceived texture", i,tex,"... ");
	if(blocks_menu[i]!== undefined){
		//post("... for existing menu block ",i,"it is",tex);
		blocks_menu[i].texture = tex;
	}
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
			var g = f_to_db(gain);
			s = g.toPrecision(2)+"dB";
		}
		return s; 
	}
}

function draw_cpu_meter(){
	var pk = 9 + fontheight*(100-cpu_meter.peak[cpu_meter.pointer])*0.01;
	var avg = 9 + fontheight*(100-cpu_meter.avg[cpu_meter.pointer])*0.01;
	lcd_main.message("frgb", backgroundcolour_current);
	lcd_main.message("moveto", 5, 9);
	lcd_main.message("lineto", 5, 9+fontheight);
	lcd_main.message("frgb", 2.55*cpu_meter.peak[cpu_meter.pointer], Math.min(2.55*(120-cpu_meter.peak[cpu_meter.pointer]),255),55);
	lcd_main.message("moveto", 5, avg);
	lcd_main.message("lineto", 5, pk);
}

function setfontsize(size){
	if(cur_font_size!=size){
		cur_font_size=size;
		lcd_main.message("font",mainfont,size);
	}
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
function draw_button(x1,y1,x2,y2,r,g,b,index,label){
	var rat = bg_dark_ratio;
	if(usermouse.clicked2d==index) rat = 1 - rat;
	lcd_main.message("paintrect",x1,y1,x2,y2,r*rat,g*rat,b*rat);
	lcd_main.message("framerect",x1,y1,x2,y2,r,g,b);
	lcd_main.message("moveto",x1+5,(y1+y2)*0.5);
	rat = (usermouse.clicked2d != index) * 2;
	lcd_main.message("frgb",r*rat,g*rat,b*rat);
	lcd_main.message("write",label);
	/*if(view_changed===true)*/ click_rectangle(x1,y1,x2,y2,index,1);
}

function labelled_parameter_v_slider(sl_no){
	var p_values= blocktypes.get(paramslider_details[sl_no][15]+"::parameters["+paramslider_details[sl_no][9]+"]::values");
	var p_type=paramslider_details[sl_no][13];
	var wrap = paramslider_details[sl_no][14];

	var click_to_step = 0;
	if((p_type == "menu_b")||(p_type == "menu_i")||(p_type == "menu_f")){
		//if it's a menu_b or menu_i store the slider index + 1 in mouse-values
		click_to_step = sl_no+1;
	}								
	
	parameter_v_slider(paramslider_details[sl_no][0], paramslider_details[sl_no][1], paramslider_details[sl_no][2], paramslider_details[sl_no][3],paramslider_details[sl_no][4], paramslider_details[sl_no][5], paramslider_details[sl_no][6], paramslider_details[sl_no][7],paramslider_details[sl_no][8], paramslider_details[sl_no][9], paramslider_details[sl_no][10],click_to_step);
	
	if(paramslider_details[sl_no][16] == 0){ //if overlaid, the text is twice as bright
		lcd_main.message("frgb",paramslider_details[sl_no][4]*2, paramslider_details[sl_no][5]*2, paramslider_details[sl_no][6]*2);
	}else{
		lcd_main.message("frgb",paramslider_details[sl_no][4], paramslider_details[sl_no][5], paramslider_details[sl_no][6]);
	}
	
	namelabely=paramslider_details[sl_no][12];
	for(var c = 0;c<paramslider_details[sl_no][11].length;c++){
		lcd_main.message("moveto",paramslider_details[sl_no][0]+fontheight*0.1,namelabely);
		lcd_main.message("write",paramslider_details[sl_no][11][c]);				
		namelabely+=0.4*fontheight;
	}
	
	var pv,ov=-11.11;

	var vo = voicemap.get(paramslider_details[sl_no][8]);
	if(!Array.isArray(vo)) vo = [vo];
	var w = paramslider_details[sl_no][2] - paramslider_details[sl_no][0];
	var ww = w / vo.length;
	var x = paramslider_details[sl_no][0]+fontheight*0.1;
	var maskx = -1;
	for(var i=0;i<vo.length;i++){
		if(((sidebar.selected_voice>=0) && (sidebar.selected_voice!=i) &&(!(paramslider_details[sl_no][10]&4)))){
			x+=ww;
		}else{
			pv = voice_parameter_buffer.peek(1,MAX_PARAMETERS*vo[i]+paramslider_details[sl_no][9]);	
			pv = Math.min(1,Math.max(0,pv));
			if((pv!=ov)&&(x>maskx)){
				var label = get_parameter_label(p_type,wrap,pv,p_values);
				maskx = x + fontheight*0.2*label.length;
				//if(maskx<paramslider_details[sl_no][2]){
					lcd_main.message("moveto",x,namelabely);
					lcd_main.message("write",label);
					if(!(paramslider_details[sl_no][10]&2))ov=pv;
				//}
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
	}else if((p_type == "menu_i")||(p_type == "menu_b")){
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
		}
		pvp = p_values[1] + (p_values[2]-p_values[1]-0.0001)*pv;
		//pv = p_values[1] + (p_values[2]-p_values[1])*pv;
		if(p_type == "int"){
			pvp = Math.floor(p_values[1] + (0.99+p_values[2]-p_values[1])*pv);
		}else if(p_type == "note"){
			pvp = note_names[Math.floor(pvp)];
		}else if(p_type == "float4"){
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
			pvp = pv.toPrecision(4);
		}else{
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
			var pre=2;
			if(pv>=1){
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
	}
	//lcd_main.message("write", pvp);
	return pvp;
}

function parameter_v_slider(x1,y1,x2,y2,r,g,b,index,blockno,paramno,flags,click_to_step){
		// flags this was 'pol' now contains more info..
		// &= 1 - bipolar not unipolar
		// &= 2 - onepervoice
		// &= 4 - no per voice modulation on this one
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	var vlist = voicemap.get(blockno); 
	var ly, value;
	value = parameter_value_buffer.peek(1,MAX_PARAMETERS*blockno+paramno);
	var w = x2-x1; //-2;
	if(!Array.isArray(vlist)) vlist = [vlist];
	var ww = (w + 2*(flags&2))/vlist.length;
	var ww2 = ww - 2*(flags&2);
	var pvm = (((blockno == sidebar.selected)&&(sidebar.selected_voice >=0))||(flags&2)) &&(!(flags&4));
	if(view_changed===true) click_rectangle(x1,y1,x2+fontheight*0.1,y2,index+pvm,2);
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
					mouse_click_parameters[index] = [paramno, blockno, vlist[i]*MAX_PARAMETERS+paramno];
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
					mouse_click_parameters[index] = [paramno, blockno, vlist[i]*MAX_PARAMETERS+paramno];
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
	var t;
	if(Array.isArray(draw_wave[n-1])){
		//post("\nclearing wave graphic",n);
		var i = 0;
		while(i<4){
			if(Array.isArray(draw_wave[n-1][i])){
				t = 0;
				while(t<newl){
					draw_wave[n-1][i][t]=0;
					t++;
				} 
			} 
			i++;
		}
	}
}
function draw_waveform(x1,y1,x2,y2,r,g,b,buffer,index,highlight,zoom_offset,zoom_amount){
	if(zoom_amount==null){
		zoom_offset=-1;
		zoom_amount=1;
	}
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 3);
	var i,t,ch,s,dl,d,st;
	var hls;
	var hle ;
	var wmin,wmax;
	var w = Math.floor((x2-x1-1)/2);
	if(!Array.isArray(draw_wave[buffer-1])) draw_wave[buffer-1] = [[],[],[],[]];
	if(w!=draw_wave[buffer-1][0].length) {
		//post("\nclearing because W!=",w, draw_wave[buffer-1][0].length);
		draw_wave[buffer-1][0].length = w;
		clear_wave_graphic(buffer,w);
	}
	var length = waves_dict.get("waves["+buffer+"]::length");
	st = Math.floor(waves_dict.get("waves["+buffer+"]::start")*w);
	d = Math.floor(waves_dict.get("waves["+buffer+"]::divisions")*(MAX_WAVES_SLICES-0.0001))+1;
	dl = waves_dict.get("waves["+buffer+"]::end") - waves_dict.get("waves["+buffer+"]::start");
	dl /= d;
	hls = w*(highlight);
	hle = w*(highlight+dl);
	var zoom_l = 1/*(1+0.99*(zoom_amount<0)*zoom_amount)*dl*(1-Math.abs(zoom_amount))+(zoom_amount>0)*zoom_amount;
	var zoom_start = Math.min(1,Math.max(0,highlight+zoom_offset));
	var zoom_end = zoom_start+zoom_l*/; //this is all ready for when you implement zoom BUT first make it show markers based on the stored ones 
	//not just multiplying, ditto highlight pos and length. AND DO STRIPE WHILE YOUR AT IT
	var chunk = zoom_l*length/w;
	var chans = waves_dict.get("waves["+buffer+"]::channels");
	var h = 0.5*(y2-y1)/chans;
	dl *= w;
	for(ch=0;ch<chans;ch++){
		lcd_main.message("frgb",90,90,90);
		if(w>250){
			for(t=0;t<d;t++){
				i = Math.floor(t*dl+st);
				lcd_main.message("moveto",x1+i+i,y1+h*2*ch);
				lcd_main.message("lineto",x1+i+i,y1+h*2*(ch+1));
			}
			lcd_main.message("frgb",255,255,255);
			lcd_main.message("moveto",x1+st+st,y1+h*2*ch);
			lcd_main.message("lineto",x1+st+st,y1+h*2*(ch+1));
			i=Math.floor(waves_dict.get("waves["+buffer+"]::end")*w);
			lcd_main.message("moveto",x1+i+i,y1+h*2*ch);
			lcd_main.message("lineto",x1+i+i,y1+h*2*(ch+1));			
		}
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
			for(t=0;t<20;t++){
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

function draw_stripe(x1,y1,x2,y2,r,g,b,buffer,index){
	lcd_main.message("paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 3);
	var i,t,ch,s,dl,d,st;
	var wmin,wmax;
	var w = x2-x1;
	lcd_main.message("paintrect", x1+waves.zoom_start*w, y1, x1+waves.zoom_end*w,y2, r*bg_dark_ratio*2,g*bg_dark_ratio*2,b*bg_dark_ratio*2);
	w = Math.floor((w-1)/2);
	var chunk = waves_dict.get("waves["+buffer+"]::length")/w;
	var chans = waves_dict.get("waves["+buffer+"]::channels");
	var h = 0.5*(y2-y1)/chans;
	for(ch=0;ch<chans;ch++){
		lcd_main.message("frgb",50,50,50);
		st = Math.floor(waves_dict.get("waves["+buffer+"]::start")*w);
		d = Math.floor(waves_dict.get("waves["+buffer+"]::divisions")*(MAX_WAVES_SLICES-0.0001))+1;
		dl = waves_dict.get("waves["+buffer+"]::end") - waves_dict.get("waves["+buffer+"]::start");
		dl /= d;
		dl *= w;
		for(t=0;t<d;t++){
			i = Math.floor(t*dl+st);
			lcd_main.message("moveto",x1+i+i,y1+h*2*ch);
			lcd_main.message("lineto",x1+i+i,y1+h*2*(ch+1));
		}
		lcd_main.message("frgb",90,90,90);
		lcd_main.message("moveto",x1+st+st,y1+h*2*ch);
		lcd_main.message("lineto",x1+st+st,y1+h*2*(ch+1));
		i=Math.floor(waves_dict.get("waves["+buffer+"]::end")*w);
		lcd_main.message("moveto",x1+i+i,y1+h*2*ch);
		lcd_main.message("lineto",x1+i+i,y1+h*2*(ch+1));
		lcd_main.message("frgb",r,g,b);
		for(i=0;i<w;i++){
			wmin = draw_wave[buffer-1][ch*2][i];
			wmax = draw_wave[buffer-1][ch*2+1][i];
			for(t=0;t<20;t++){
				s=waves_buffer[buffer-1].peek(ch+1,Math.floor((i+Math.random())*chunk));
				if(s>wmax) wmax=s;
				if(s<wmin) wmin=s;
			}
			draw_wave[buffer-1][ch*2][i] = wmin;
			draw_wave[buffer-1][ch*2+1][i] = wmax;
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
		lcd_main.message("moveto", (x1+8), (y2-8));
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
		lcd_main.message("moveto", (x1+8), (y2-8));
		if(value<-0.7) {
			lcd_main.message("frgb", 0,0,0);
		}else{
			lcd_main.message("frgb", r,g,b);
		}
		lcd_main.message("write", gain_display(value));
	}
}

function draw_2d_slider(x1,y1,x2,y2,r,g,b,index,value_x,value_y){
	lcd_main.message("framerect",x1,y1,x2,y2,r,g,b);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 4);
	var lx = x1 + 8 + (x2-x1-16)*value_x;
	var ly = y1 + 8 + (y2-y1-16)*(1-value_y);
	lcd_main.message("paintrect",(lx-4),(ly-4),(lx+4),(ly+4) ,r,g,b);
}

function draw_vector(x1,y1,x2,y2,r,g,b,index,angle){
	lcd_main.message("framerect",x1,y1,x2,y2,r,g,b);
	lcd_main.message("frameoval",x1,y1,x2,y2,r,g,b);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 2);
	lcd_main.message("moveto",((x1+x2)/2),((y1+y2)/2));
	lcd_main.message("lineto",(((x1+x2)/2)+Math.sin(6.28*angle)*(x2-x1-16)/2),(((y1+y2)/2)-Math.cos(6.28*angle)*(y2-y1-16)/2));
}

function draw_spread_levels(x1,y1,x2,y2,r,g,b,index,vector,offset,v1,v2,scale){
	if((v1==1)&&(v2==1)) return;
	var cx,cy,l;
	var ux = (x2-x1)/v1;
	var uy = (y2-y1)/v2;
	var minl=99,maxl=-99;
	for(cx=v1-1;cx>=0;cx--){
		for(cy=0;cy<v2;cy++){
			l = Math.abs(scale)*spread_level(cx, cy, offset,vector, v1, v2);
			lcd_main.message("paintrect",x1+cx*ux,y1+cy*uy,x1+(cx+1)*ux,y1+(cy+1)*uy,r*l,g*l,b*l);
			if(l<minl)minl=l;
			if(l>maxl)maxl=l;
		}
	}
	if(sidebar.mode != "connections"){
		if(minl!=maxl){ //TODO THIS IS MESSY, WHOLE UI AROUND SPREAD NEEDS A LOT MORE EXPLAINING
			setfontsize( Math.min(uy,ux)*0.4);
			lcd_main.message("frgb", menucolour);
			for(cx=v1-1;cx>=0;cx--){
				for(cy=0;cy<v2;cy++){
					l = scale*spread_level(cx, cy, offset,vector, v1, v2);
					lcd_main.message("moveto",x1+(cx+0.05)*ux,y1+(cy+0.95)*uy);
					lcd_main.message("write",l.toPrecision(2));				
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

function wipe_midi_meters(){
	for(i = meters_updatelist.midi.length-1; i>=0; i--){
		var block=meters_updatelist.midi[i][0];
		var voice=meters_updatelist.midi[i][1];
		if(blocks_meter[block][voice] !== 'undefined'){
			var polyvoice = meters_updatelist.midi[i][2];
			if(polyvoice === null){
				post("\n\n\n\n unsafe poke");
				sughstghldfjsl
				return 0;
			}
			midi_meters_buffer.poke(1,polyvoice, [1,0,0,0,0,0,0]);
		}
	}
	meters_updatelist.midi = [];
}


function draw_spread(x1,y1,x2,y2,r,g,b,index,angle,amount,v1,v2){
	t = (1-amount)*(x2-x1-8)/2;
	lcd_main.message("paintrect",x1,y1,x2,y2,r/6,g/6,b/6);
	lcd_main.message("paintoval",x1,y1,x2,y2,0,0,0);
	lcd_main.message("frameoval",x1,y1,x2,y2,r/2,g/2,b/2);
	lcd_main.message("frameoval",(x1+t),(y1+t),(x2-t),(y2-t),r,g,b);
	if(view_changed===true) click_rectangle(x1,y1,x2,y2,index, 4);
	var cx = (x1+x2)/2;
	var cy = (y1+y2)/2;
	var r1 = (x2-x1)/2;
	var w = r1*0.1;
	var i=0;
	var col=[r,g,b];
	for(i=0;i<v1;i++){
		lcd_main.message("paintrect",(cx-w+r1*Math.sin(6.28*i/v1)),(cy-w-r1*Math.cos(6.28*i/v1)),(cx+w+r1*Math.sin(6.28*i/v1)),(cy+w-r1*Math.cos(6.28*i/v1)),col);
		if(i==0) col = [r/2,g/2,b/2];
	}
	r1 -= t;
	col=[r,g,b];
	for(i=0;i<v2;i++){
		lcd_main.message("paintrect",(cx-w+r1*Math.sin(6.28*(angle + i/v2))),(cy-w-r1*Math.cos(6.28*(angle + i/v2))),(cx+w+r1*Math.sin(6.28*(angle + i/v2))),(cy+w-r1*Math.cos(6.28*(angle + i/v2))),col);
		if(i==0) col = [r/2,g/2,b/2];
	}
}

function custom_ui_element(type,x1,y1,x2,y2,r,g,b,dataindex,paramindex,highlight){
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
	}else if(type=="param_v_scroll"){//0=block,1=paramno
		draw_v_slider(x1,y1,x2,y2,r,g,b,mouse_index,parameter_value_buffer.peek(1,MAX_PARAMETERS*dataindex+paramindex));
		mouse_click_actions[mouse_index] = sidebar_parameter_knob;
		mouse_click_parameters[mouse_index] = [paramindex, dataindex];
		mouse_click_values[mouse_index] = "";
		mouse_index++;
	}else if(type=="param_toggle"){//0=block,1=paramno
		draw_v_slider(x1,y1,x2,y2,r,g,b,mouse_index,parameter_value_buffer.peek(1,MAX_PARAMETERS*dataindex+paramindex)>0.5);
		mouse_click_actions[mouse_index] = sidebar_parameter_knob;
		mouse_click_parameters[mouse_index] = [paramindex, dataindex];
		mouse_click_values[mouse_index] = "";
		mouse_index++;
	}else if(type=="mouse_passthrough"){
		click_rectangle( x1,y1,x2,y2, mouse_index, 7);
		mouse_click_actions[mouse_index] = custom_mouse_passthrough;
		mouse_click_parameters[mouse_index] = dataindex; //custom_block+1;
		mouse_click_values[mouse_index] = 0;//[x1,y1,x2,y2];
		mouse_index++;
	}else if(type=="direct_mouse_passthrough"){
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
		click_rectangle( x1, y1, x2, y2, mouse_index, 7);
		mouse_click_actions[mouse_index] = custom_direct_mouse_button;
		mouse_click_parameters[mouse_index] = paramindex; //custom_block+1;
		mouse_click_values[mouse_index] = [r,g,b,dataindex,highlight];
		mouse_index++;				
	}
}

function flock_axes(v){
	flock_cubexy.enable = v;
	flock_cubexz.enable = v;
	flock_cubeyz.enable = v;
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
	var d = Math.max(w,h);
	
	camera_position[0] = (maxx+minx)*0.5;
	camera_position[1] = 0.5*(maxy+miny);
	if(resetz || (camera_position[2]<1)) camera_position[2] = 23*Math.sqrt(d/8);
/*	messnamed("camera_control", "anim", "moveto", camera_position, 0.5);
	messnamed("camera_control", "rotatexyz" , 0, 0, 0);
	messnamed("camera_control", "direction", 0, 0, -1);*/
	camera();
	redraw_flag.flag |= 8;	
}

function request_redraw(n){
	// post("\nreq redraw",n);
	if(displaymode=="blocks") redraw_flag.flag |= n;
}

function draw_menu_hint(){
	var col = menucolour;
	if(blocktypes.contains(usermouse.hover[1]+"::colour")) col = blocktypes.get(usermouse.hover[1]+"::colour");
	var cod = [col[0]*bg_dark_ratio,col[1]*bg_dark_ratio,col[2]*bg_dark_ratio];
	var topspace=(block_menu_d.mode == 3);
	lcd_main.message("clear");
	lcd_main.message("paintrect", sidebar.x,9,mainwindow_width-9,9+fontheight*(1+topspace),cod);
	setfontsize(fontheight/1.6);
	lcd_main.message("textface", "bold");
	
	lcd_main.message("paintrect",sidebar.x,9+fontheight*(topspace+2.21),mainwindow_width-10,9+fontheight*(3+topspace+0.45*hintrows),cod);
	lcd_main.message("frgb",col);
	lcd_main.message("moveto", sidebar.x+fontheight*0.2,9+fontheight*0.75);
	if(block_menu_d.mode == 1){
		lcd_main.message("write", "swap block:");
	}else if(block_menu_d.mode == 2){
		lcd_main.message("write", "insert block in connection:");
	}else if(block_menu_d.mode == 0){
		lcd_main.message("write", "add new block:");
	}else if(block_menu_d.mode == 3){
		lcd_main.message("write", "substitute for "); 
		lcd_main.message("moveto", sidebar.x+fontheight*0.2,9+fontheight*1.75);
		lcd_main.message("write",block_menu_d.swap_block_target);
	}

	if(blocktypes.contains(usermouse.hover[1]+"::help_text")){
		var hint=blocktypes.get(usermouse.hover[1]+"::help_text")+" ";
//		post("\n"+usermouse.hover[1]+" : "+hint);
		
		hint = hint+"                       ";
		var hintrows = 0.4+ hint.length / 27+hint.split("£").length-1;
		var rowstart=0;
		var rowend=36;
		lcd_main.message("paintrect", sidebar.x,9+fontheight*(1.1+topspace),mainwindow_width-9,9+fontheight*(2.1+topspace),cod);
		lcd_main.message("frgb",col);
		lcd_main.message("moveto", sidebar.x+fontheight*0.2,9+fontheight*(1.85+topspace));
		lcd_main.message("write", usermouse.hover[1]);
		setfontsize(fontheight/2.5);
		lcd_main.message("textface", "normal");
		var bold=0;
		for(var i=0;i<hintrows;i++){
			while((hint[rowend]!=' ')&&(rowend>1+rowstart)){ rowend--; }
			var sliced = hint.slice(rowstart,rowend);
			if(sliced.indexOf("£")>-1){
				rowend = rowstart+ sliced.indexOf("£");
				sliced = hint.slice(rowstart,rowend);
			}
			if(sliced.indexOf("*")>-1){
				post("sliced",rowstart,rowend,sliced.indexOf("*"));
				bold=1-bold;
				rowend = rowstart+ sliced.indexOf("*");
				sliced = hint.slice(rowstart,rowend);
			}
			lcd_main.message("moveto",sidebar.x+fontheight*0.2,9+fontheight*(2.9+topspace+0.45*(i)));
			lcd_main.message("write",sliced);
			rowstart=rowend+1;
			rowend+=36;
			if(bold){
				lcd_main.message("textface", "bold");
			}else{
				lcd_main.message("textface", "normal");
			}
		}
		lcd_main.message("bang");
	}
}
	