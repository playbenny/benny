var MAX_PARAMETERS = 256;
//var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
var loop_buffer = new Buffer("continuity");
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,w3;
var block=-1;
var map = new Dict;
map.name = "voicemap";
//var blocks = new Dict;
//blocks.name = "blocks"
var v_list = [];

var samplerate = 48000;
var param_ind;

var l_pos = 0,l_start = 0,l_end = 0, l_on = 0;
var o_l_pos =0, o_l_start=0,o_l_end=0, o_l_on = 0;

var wavestripe = [];
var wavestripe_onepx = 1;

var redraw = 2;

function setup(x1,y1,x2,y2,sw,mode){
	menucolour = config.get("palette::menu");
	width = Math.floor(x2-x1);
	height = Math.floor(y2-y1);
	x_pos = Math.floor(x1);
	y_pos = Math.floor(y1);
	wavestripe = []; // length of wavestripe = width-a border: 4 in total
	// so useful to know how big a chunk of buffer each pixel is?
	wavestripe_onepx = samplerate*100 / (width);
	redraw = 2;
	draw();
}

function getparams(){
	redraw = 0;
	var wm=(width);
	p_len = Math.floor(128*voice_parameter_buffer.peek(1, param_ind,1));
	p_fb = Math.floor(128*voice_parameter_buffer.peek(1, param_ind+1,1));
	p_hp = Math.floor(128*voice_parameter_buffer.peek(1, param_ind+2,1));
	p_cutfade = Math.floor(128*voice_parameter_buffer.peek(1, param_ind+3,1));
	//+4 is controller number
	l_on = voice_parameter_buffer.peek(1, param_ind+5,1)>0;
	if(l_on){
		l_pos = Math.floor(l_start+((l_end-l_start)*voice_parameter_buffer.peek(1, param_ind+6,1)));
		l_start = (wm*voice_parameter_buffer.peek(1, param_ind+7,1));
		l_end = (wm*voice_parameter_buffer.peek(1, param_ind+8,1));		
	}else{
		l_pos = Math.floor(wm*voice_parameter_buffer.peek(1, param_ind+6,1));
		l_start = 0;
		l_end = wm;
	}
	if(l_pos!=o_l_pos){
		o_l_pos=l_pos;
		redraw=1;
	}
	if(l_start!=o_l_start){
		o_l_start = l_start;
		redraw=2;
	}
	if(l_end!=o_l_end){
		o_l_end = l_end;
		redraw =2;
	}
	if(l_on!=o_l_on){
		o_l_on = l_on;
		redraw = 2;
	}
}

function draw(){
	if(block>=0){
		getparams();
		redraw = 1;
		drawstripe(x_pos,y_pos,x_pos+width,y_pos+height*0.5-1);
		drawcontrols();
	}
}

function drawcontrols(){
	outlet(1,"paintrect",x_pos,y_pos,x_pos+width,y_pos+height,0,0,0);
	outlet(1,"framerect",x_pos,y_pos+height*0.5+1,x_pos+width*0.25-1,y_pos+height,menucolour);
	outlet(1,"moveto",x_pos+width*0.06,y_pos+height*0.77);
	//outlet(1,"frgb", 0,0,0);
	if(!l_on){
		outlet(1,"write","LOOP");
		outlet(0,"custom_ui_element","direct_button",x_pos,y_pos+height*0.5+1,x_pos+width*0.25-1,y_pos+height,"output",block,"loop",1,v_list[0],0);
	}else{
		outlet(1,"write","STOP");
		outlet(0,"custom_ui_element","direct_button",x_pos,y_pos+height*0.5+1,x_pos+width*0.25-1,y_pos+height,"output",block,"loop",0,v_list[0],0);
		//draw buttons for: bend, move, resize
		outlet(1,"framerect",x_pos+width*0.25+1,y_pos+height*0.5+1,x_pos+width,y_pos+height*0.66-1,menucolour);
		outlet(0,"custom_ui_element","direct_mouse_passthrough",x_pos+width*0.25+1,y_pos+height*0.5+1,x_pos+width,y_pos+height*0.66-1,"output",block,"bend",0,v_list[0],0);
		outlet(1,"moveto",x_pos+width*0.51,y_pos+height*0.61);
		outlet(1,"write","<<< bend >>>");
		outlet(1,"framerect",x_pos+width*0.25+1,y_pos+height*0.66+1,x_pos+width,y_pos+height*0.82-1,menucolour);
		outlet(0,"custom_ui_element","direct_mouse_passthrough",x_pos+width*0.25+1,y_pos+height*0.66+1,x_pos+width,y_pos+height*0.82-1,"output",block,"move",0,v_list[0],0);
		outlet(1,"moveto",x_pos+width*0.51,y_pos+height*0.77);
		outlet(1,"write","<<< move >>>");
		outlet(1,"framerect",x_pos+width*0.25+1,y_pos+height*0.82+1,x_pos+width*0.5-1,y_pos+height,menucolour);
		outlet(0,"custom_ui_element","direct_button",x_pos+width*0.25+1,y_pos+height*0.82+1,x_pos+width*0.5-1,y_pos+height,"output",block,"half",0,v_list[0],0);
		outlet(1,"moveto",x_pos+width*0.34,y_pos+height*0.95);
		outlet(1,"write","half");
		outlet(1,"framerect",x_pos+width*0.5+1,y_pos+height*0.82+1,x_pos+width*0.75-1,y_pos+height,menucolour);
		outlet(0,"custom_ui_element","direct_button",x_pos+width*0.5+1,y_pos+height*0.82+1,x_pos+width*0.75-1,y_pos+height,"output",block,"reset_size",0,v_list[0],0);
		outlet(1,"moveto",x_pos+width*0.58,y_pos+height*0.95);
		outlet(1,"write","reset");
		outlet(1,"framerect",x_pos+width*0.75+1,y_pos+height*0.82+1,x_pos+width,y_pos+height,menucolour);
		outlet(0,"custom_ui_element","direct_button",x_pos+width*0.75+1,y_pos+height*0.82+1,x_pos+width,y_pos+height,"output",block,"double",0,v_list[0],0);
		outlet(1,"moveto",x_pos+width*0.82,y_pos+height*0.95);
		outlet(1,"write","double");
	}
	//outlet(1,"bang");
}

function drawstripe(x1,y1,x2,y2){
	if(redraw){
		//post("\nredraw wave strip, onepx=",wavestripe_onepx,width,l_on,l_pos,l_start,l_end ,x1);
		var h = (y2 - y1)*0.5;
		var xx=0;
		//outlet(1,"frgb",0,0,200);
		var c=1;
		var ls=-1;
		var le=-1;
		var lp=l_pos+x1;
		if(l_on){
			le=l_end+x1;
			ls=l_start+x1;
		}
		for(var x=x1;x<x2;x++){
			var min=1, max = -1;
			if((x==lp+1)&&(!l_on)){
				outlet(1,"frgb", 0,0,0);
				c=2;
			}else if(x==lp-1){
				outlet(1,"frgb", 255,255,255);
				c=1;
			}else if((x>=ls)&&(x<=le)){
				outlet(1,"frgb", 0,100,200);
				c=1;
			}else if(c>0){
				outlet(1,"frgb", 0,0, 200);
				c=0;
			}
			if(c==2){
				max=1;
				min=-1;
			}else{
				for(var i=0;i<4;i++){
					var xxx=wavestripe_onepx * Math.random();
					xxx = (xxx + xx) | 0;
					var yy = loop_buffer.peek(1,xxx,1);
					if(yy<min)min=yy;
					if(yy>max)max=yy;
				}
				if(min<-1){
					outlet(1,"frgb",255,0,0);
					c=1;
					min=-1;
				}
				if(max>1){
					outlet(1,"frgb",255,0,0);
					c=1;
					max=1;
				}
			}
			outlet(1,"moveto", x, y1 + (min+1)*h);
			outlet(1,"lineto", x, y1 + (max+1)*h);
			xx+=wavestripe_onepx;
		}
	}
}

function update(){
	if(block>=0){
		getparams();
		if(redraw==2){
			drawcontrols();
			drawstripe(x_pos,y_pos,x_pos+width,y_pos+height*0.5-1);
		}else{
			drawstripe(x_pos,y_pos,x_pos+width,y_pos+height*0.5-1);
		}
		//redraw = 1;
	}
}

function voice_is(v){
	block = v;
	if(block>0){
		v_list = map.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
	param_ind = MAX_PARAMETERS * v_list[0];
}

function voice_offset(){}

function set_samplerate(rate){
	samplerate = rate;
}

function loadbang(){
	outlet(0,"getvoice");
}

function mouse(x,y,l,s,a,c,scr){
	var xx = (x-x_pos)/width;
	var yy = 1 - ((y-y_pos)/height);
	if((xx>=0)&&(xx<=1)&&(yy>=0)&&(yy<1)){
		yy = Math.floor(yy*6);
		if(yy<3){
			//click in buffer - should jump?
		}else{

		}

	}
}
	
function store(){
	//nothing to store for this block
}

/*function send_note(xx,note,vel){
	//post("\ntodo send note",xx,note,vel);
	messnamed("utility.buttons",block,xx,note,vel);
}*/
function enabled(){}