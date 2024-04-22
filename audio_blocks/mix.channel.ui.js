var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var block_colour = [128,128,128];
var width, height,x_pos,y_pos,unit,u1,cw,cols;
var block=-1;
var display_row_offset = 0;
var display_col_offset = 0;
var mini=0;
var drawflag=0;
var namelist;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var v_list = [];
var omute = [];
var osolo = [];
var mcv = new Dict;
mcv.name = "mixer_channel_voicings";
var no_voicings = 1;
var oshape = [];
var osweep = [];
var oamount = [];
var shape = [];
var sweep = [];
var amount = [];

function setup(x1,y1,x2,y2,sw){
	//block_colour = config.get("palette::menu");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	if(width<sw*0.54){ 
		mini=1;
	}
	unit = height / (mini?10:18);
	u1 = 0.1 * unit;
	var voicings_list = mcv.getkeys();
	if(!Array.isArray(voicings_list)) voicings_list = [voicings_list];
	no_voicings = voicings_list.length;
	post("\nno_vo",no_voicings);
	if(block>=0){
		scan_for_channels();
		//check_params_for_changes();
		draw();
	}
}

function draw(){
	if(block>=0){
		var x=0;
		var fgc = block_colour;
		var bgc = [fgc[0]*0.2,fgc[1]*0.2,fgc[2]*0.2];

		check_params_for_changes()
		for(var v=0;v<v_list.length;v++){
			draw_eq_curve(shape[v],amount[v],sweep[v],x_pos+x,y_pos,x_pos+x+cw-2,y_pos+height,fgc,bgc);
			oshape[v] = shape[v]; oamount[v] = amount[v]; osweep[v] = sweep[v];
			x+=cw;
		}
	}
}

function update(){
	if(check_params_for_changes()==1){
		var x=0;
		var fgc = block_colour;
		var bgc = [fgc[0]*0.2,fgc[1]*0.2,fgc[2]*0.2];
		for(var v=0;v<v_list.length;v++){
			draw_eq_curve(shape[v],amount[v],sweep[v],x_pos+x,y_pos,x_pos+x+cw-2,y_pos+height,fgc,bgc);
			oshape[v] = shape[v]; oamount[v] = amount[v]; osweep[v] = sweep[v];
			x+=cw;
		}
	}
}


function check_params_for_changes(){
	var dr=0;
	for(var v=0;v<v_list.length;v++){
		//draw_mutesolo(block,v,x_pos+x,y_pos+height*0.4,x_pos+x+cw-u1,y_pos+height,fgc,bgc);
		shape[v] = Math.floor(no_voicings*voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[v]+2));
		amount[v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[v]+3);
		sweep[v] = Math.pow(2, 4*voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[v]+4)-2);
		if((shape[v]!=oshape[v])||(amount[v]!=oamount[v])||(sweep[v]!=osweep[v])) dr = 1;
	}
	return dr;
}

function draw_eq_curve(shp,amnt,swp,x1,y1,x2,y2,fg,bg){
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	var h=y2-y1;
	var voicing = mcv.get(shp);
	/* the numbers in a voicings list:
	low: freq, res, -1=hpf, otherwise it's shelf gain
	mid: f, res, gain (db)
	high: f, res
	width */
	//post("\nvoicing",voicing);
	//post("\nfreqs",voicing[0],voicing[3],voicing[6]);
	voicing[0] *= swp;
	voicing[3] *= swp;
	voicing[6] *= swp;
	var w=x2-x1; // we want to show about 12 octaves, starting at 6Hz, so one pixel is 12/w octaves
	var step=0.12*w; //Math.pow(2,12/w);
	var w2 = 0.2 / w;
	voicing[0] = Math.log(voicing[0]*0.2+0.01)*step; //1/log(2)
	voicing[3] = Math.log(voicing[3]*0.2+0.01)*step;
	voicing[6] = Math.log(voicing[6]*0.2+0.01)*step;
	outlet(1,"frgb",fg);
	//voicing[2] = Math.pow(2,voicing[2]*0.16667);
	voicing[5] = Math.pow(2,voicing[5]*0.16667)-1;
	for(x=0;x<w;x+=2){
		var g = 0;
		if(voicing[2]==-1){//hpf
			if(x<voicing[0]){
				var d = (voicing[0]-x);
				g -= d*d*w2;
			}
			//g += voicing[1]*Math.pow(2.718,-d*d*0.005*Math.abs(voicing[1]));
		}else{
			if(x<voicing[0]){
				g += voicing[2];
			}else{
				var d = x-voicing[0];
				g += voicing[2]*(Math.pow(2.718,-d*d*0.005*voicing[1]));
			}
		}
		if(voicing[5]!=0){
			var d = x-voicing[3];
			g += voicing[5]*Math.pow(2.718, -d*d*0.005*Math.abs(voicing[4]));
		}
		if(x>=voicing[6]){
			var d = (x-voicing[6]);
			g -= d*d*w2;
		}
		g+=1;
		g = g * amnt + (1-amnt);
		g *= 0.5 * h;
		if((x==0)||(g<1)){
			outlet(1,"moveto",x+x1,y2-Math.max(1,g));
		}else{
			outlet(1,"lineto",x+x1,y2-g);
		}
	}
}

function draw_channels(b,v,x1,y1,x2,y2,fg,bg){
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	var h=y2-y1;
	if(b_type[b]=="mix.channel.stereo"){
		outlet(0,"custom_ui_element","param_v_scroll",x1+u1,h*0.6+y1,x2-u1,y2,fg[0],fg[1],fg[2],[block,5+r]);
	}
}
function draw_mutesolo(b,v,x1,y1,x2,y2,fg,bg){
	outlet(0,"custom_ui_element","opv_button",x1,y1,x2,0.5*(y1+y2),130,130,130,5,v_list[v],"mute",block);
	outlet(0,"custom_ui_element","opv_button",x1,0.5*(y1+y2),x2,y2,255,20,20,6,v_list[v],"solo",block);
}
/*		drawflag=0;
		outlet(1,"paintrect",x_pos,y_pos,width+x_pos,height+y_pos,0,0,0);
		var c,r,i,rr,rc;
		for(i=0;i<v_list.length;i++) {
			cursors[i]=-1;
		}
		i= showcols; 
		rh = 0.5*unit;
		sy = 1.2*unit;
		sx = 1.2*unit;
		cw = (width - sx)/i;
		maxl = Math.floor((height-sy)/rh);
		if(!mini){
			outlet(1,"paintrect",x_pos+sx,y_pos,x_pos+width,sy+y_pos,block_colour[0]*0.1,block_colour[1]*0.1,block_colour[2]*0.1);
			outlet(0,"setfontsize",rh*0.8);
			outlet(1,"frgb",block_colour);
			outlet(1,"moveto",3+sx+x_pos,rh*0.75+y_pos);
			outlet(1,"write","octave");
			outlet(1,"moveto",3+sx+x_pos,rh*1.45+y_pos);
			outlet(1,"write",baseoct-2);
			outlet(1,"moveto",3+sx+0.2*cw+x_pos,rh*0.75+y_pos);
			outlet(1,"write","vel");
			outlet(1,"moveto",3+sx+0.2*cw+x_pos,rh*1.45+y_pos);
			outlet(1,"write",currentvel);
			outlet(1,"moveto",3+sx+0.4*cw+x_pos,rh*0.75+y_pos);
			outlet(1,"write","wave");
			outlet(1,"moveto",3+sx+0.4*cw+x_pos,rh*1.45+y_pos);
			outlet(1,"write",(1+currentwave));
			outlet(1,"moveto",3+sx+0.55*cw+x_pos,rh*0.75+y_pos);
			outlet(1,"write","slice");
			outlet(1,"moveto",3+sx+0.55*cw+x_pos,rh*1.45+y_pos);
			outlet(1,"write",currentslice+1);
			if(cursorx2<4) draw_wave_hint(currentwave,currentslice);
			for(c=display_col_offset;c<Math.min(display_col_offset+showcols,v_list.length);c++){
				cursors[c] = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
				l[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2)*127.999)+1;
				s[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1)*127.999);
				l_on[c] = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+3)
				outlet(1,"moveto", 3+sx+cw*(c-display_col_offset)+x_pos, rh*2.15+y_pos);
				if(cursorx == c){
					outlet(1,"frgb",block_colour);
				}else{
					outlet(1,"frgb",block_colour[0]*0.5,block_colour[1]*0.5,block_colour[2]*0.5);
				}
				outlet(1,"write", "voice", c+1);
				for(r=0;r<maxl;r++){			
					drawcell((c-display_col_offset),r);
				}
			}
		}
		for(r=0;r<maxl;r++){			
			rr = r+display_row_offset;
			rc = ((rr%2)==0)+((rr%4)==0)+((rr%8)==0)+((rr%16)==0);
			rc = (4+rc)/24;
			
			outlet(1,"paintrect",x_pos,sy+rh*r+y_pos,sx-9+x_pos,sy+rh*(r+1)+y_pos,block_colour[0]*rc,block_colour[1]*rc,block_colour[2]*rc);
			outlet(1,"moveto",3+x_pos,sy+rh*(r+0.75)+y_pos);
			if(!mini){
				outlet(1,"frgb",block_colour);
				outlet(1,"write",rr);
			}
		}
		outlet(0,"custom_ui_element","mouse_passthrough",x_pos,sy+y_pos,width+x_pos,height+y_pos,0,0,0,block,0);*/



function voice_is(v){
	block = v;
	scan_for_channels();
}

function scan_for_channels(){
	if(block>=0){
		v_list=[];
		var vl = map.get(block);
		if(!Array.isArray(vl)) vl = [vl];
		v_list = vl;
		cols = vl.length;
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
		block_darkest = [block_colour[0]*0.2, block_colour[1]*0.2, block_colour[2]*0.2];
		for(var i=0;i<3;i++)block_colour[i] = Math.min(255,1.5*block_colour[i]);
		cw = (width+u1) / cols;
		for(var i=0;i<cols;i++){
			omute.push(-1);
			osolo.push(-1);
		}
	}
}

function voice_offset(){}

function loadbang(){
	outlet(0,"getvoice");
}

function quer(){
	post("vlist is",v_list);
}

function store(){
}

function enabled(){}