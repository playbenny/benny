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
var oleft = 0;
var channelnames = [];

function setup(x1,y1,x2,y2,sw){
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
	if(block>=0){
		scan_for_channels();
		draw();
	}
}

function draw(){
	if(block>=0){
		var x=0;
		var fgc = block_colour;
		var bgc = [fgc[0]*0.15,fgc[1]*0.15,fgc[2]*0.15];
		check_params_for_changes()
		outlet(0, "custom_ui_element", "mouse_passthrough", x_pos,y_pos,x_pos+width,y_pos+height,0,0,0,block,0);
		for(var v=0;v<v_list.length;v++){
			draw_eq_curve_tape(shape[v],amount[v],sweep[v],x_pos+x,y_pos,x_pos+x+cw-2,y_pos+height,fgc,bgc);
			oshape[v] = shape[v]; oamount[v] = amount[v]; osweep[v] = sweep[v];
			outlet(1,"moveto", x_pos+x+4, y_pos + 4+height*0.3);
			outlet(1,"frgb",255,255,255);
			outlet(1,"write",channelnames[v]);
			x+=cw;
		}
	}
}

function update(){
	if(check_params_for_changes()==1){
		var x=0;
		var fgc = block_colour;
		var bgc = [fgc[0]*0.1,fgc[1]*0.15,fgc[2]*0.15];
		for(var v=0;v<v_list.length;v++){
			draw_eq_curve_tape(shape[v],amount[v],sweep[v],x_pos+x,y_pos,x_pos+x+cw-2,y_pos+height,fgc,bgc);
			oshape[v] = shape[v]; oamount[v] = amount[v]; osweep[v] = sweep[v];
			outlet(1,"moveto", x_pos+x+4, y_pos + 4+height*0.3);
			outlet(1,"frgb",255,255,255);
			outlet(1,"write",channelnames[v]);
			x+=cw;
		}
	}
}

// IN MIXER TAPE 'SHAPE' BECOMES THE FINAL HIGHPASS


function check_params_for_changes(){
	var dr=0;
	for(var v=0;v<v_list.length;v++){
		//draw_mutesolo(block,v,x_pos+x,y_pos+height*0.4,x_pos+x+cw-u1,y_pos+height,fgc,bgc);
		shape[v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[v]+2);
		amount[v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[v]+3);
		sweep[v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[v]+4);
		if((shape[v]!=oshape[v])||(amount[v]!=oamount[v])||(sweep[v]!=osweep[v])) dr = 1;
	}
	return dr;
}


function draw_eq_curve_tape(shp,amnt,swp,x1,y1,x2,y2,fg,bg){
	shp = Math.pow(2, 9*shp+4);
	swp = Math.pow(2, 9*swp+2);
	amnt = -2 + 4*amnt;
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	var h=0.5 * (y2-y1-1);
	var voicing = [ shp, (amnt>0) ? 0.05*amnt*amnt*amnt : -(0.02*amnt*amnt*amnt*amnt*amnt), Math.pow(swp,0.9), swp, 0.1+(0.16*amnt*amnt*amnt*amnt),  Math.abs(amnt)*0.3+0.36,(amnt>0) ? amnt*amnt*0.2 : -amnt*amnt*0.4];
	var w=x2-x1; // we want to show about 12 octaves, starting at 6Hz, so one pixel is 12/w octaves
	var step=0.12*w; //Math.pow(2,12/w);
	var w2 = 0.2 / w;
	voicing[0] = Math.log(voicing[0]*0.2+0.01)*step; //1/log(2)
	voicing[3] = Math.log(voicing[3]*0.2+0.01)*step;
	voicing[2] = Math.log(voicing[2]*0.2+0.01)*step; //this is the dip before the 
	outlet(1,"frgb",0.2*fg[0],0.2*fg[0],0);
	//voicing[5] = Math.pow(2,voicing[5]*0.16667)-1;
	var liney=[];
	var i = 0;
	for(x=0;x<w;x+=2){
		var g = 0;
		var d;
		// if(voicing[2]==-1){//hpf
		if(x<voicing[0]){
			d = (voicing[0]-x);
			g -= d*d*w2;
		}
		d = (voicing[0]*0.8-x);
		g += Math.min(0.9,0.3*voicing[1])*Math.pow(2.718,-d*d*0.005*Math.abs(voicing[1]));
		g += 1;
		var g2 = g;
		if(amnt!=0){
			var d = x-voicing[3];
			d *= 0.3+Math.pow(Math.abs(amnt),0.5);
			g += Math.pow(2.718, -d*d*0.005*voicing[4])* amnt;
			d = x-(voicing[2]);
			// d *= 0.4+Math.pow(Math.abs(amnt),0.6);
			g2 -= Math.pow(2.718, -d*d*0.005*voicing[5])* voicing[6];
		}
		liney[i] = y2-1-Math.min(Math.max(1,h * (g + g2 - 1)),2*h-1);
		i++;
		g = Math.floor(g* h);
		g2 = Math.floor(g2* h);
		if((g!=g2)){
			outlet(1,"moveto",x+x1,y2-1-Math.min(Math.max(1,g),2*h-1));
			outlet(1,"lineto",x+x1,y2-1-Math.min(Math.max(1,g2),2*h-1));
		}
	}
	i=1;
	outlet(1,"frgb",fg);
	outlet(1, "moveto",x1,liney[i]);
	for(x=2;x<w;x+=2){
		outlet(1,"lineto",x+x1,liney[i]);
		i++;
	}
}

function mouse(x,y,leftbutton,shift,alt,ctrl){
	if(oleft!=leftbutton){
		oleft=leftbutton;
		if(leftbutton==0){//release
			x = (x - x_pos) * cols / width;
			x = Math.floor(x);
			messnamed("to_blockmanager","name_mixer_channel",block,x);
		}
	}
}

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
		if(blocks.contains("blocks["+block+"]::channel_names")){
			channelnames = blocks.get("blocks["+block+"]::channel_names");
			if(!Array.isArray(channelnames)) channelnames = [channelnames];
			if(channelnames.length<vl.length){
				for(var i=channelnames.length;i<vl.length;i++){
					channelnames[i]=(i+1).toString();
				}
				blocks.replace("blocks["+block+"]::channel_names",channelnames);
			}
		}else{
			channelnames=[];
			for(var i=0;i<cols;i++) channelnames.push((i+1));
		}
		block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
		block_darkest = [block_colour[0]*0.2, block_colour[1]*0.2, block_colour[2]*0.2];
		for(var i=0;i<3;i++)block_colour[i] = Math.min(255,1.5*block_colour[i]);
		cw = (width+u1) / cols;
		for(var i=0;i<cols;i++){
			omute.push(-1);
			osolo.push(-1);
		}
		var voicings_list = mcv.getkeys();
		if(!Array.isArray(voicings_list)) voicings_list = [voicings_list];
		no_voicings = voicings_list.length;
	}
}

function voice_offset(){}

function loadbang(){
	outlet(0,"getvoice");
}

function store(){
}

function enabled(){}