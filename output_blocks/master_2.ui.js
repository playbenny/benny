//var MAX_DATA = 1024;
var MAX_PARAMETERS = 256;
//var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
var loop_buffer = new Buffer("continuity_buffer");
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

var l_pos = 0,l_start = 0,l_end = 0;
var o_l_pos =0, o_l_start=0,o_l_end=0;

var wavestripe = [];
var wavestripe_onepx = 1;

var redraw =1;

function setup(x1,y1,x2,y2,sw){
	menucolour = config.get("palette::menu");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	wavestripe = []; // length of wavestripe = width-a border: 4 in total
	// so useful to know how big a chunk of buffer each pixel is?
	wavestripe_onepx = samplerate*100 / (width - 4);
	draw();
}

function getparams(){
	redraw = 0;
	p_len = Math.floor(128*voice_parameter_buffer.peek(1, param_ind,1));
	p_fb = Math.floor(128*voice_parameter_buffer.peek(1, param_ind+1,1));
	p_hp = Math.floor(128*voice_parameter_buffer.peek(1, param_ind+2,1));
	p_cutfade = Math.floor(128*voice_parameter_buffer.peek(1, param_ind+3,1));
	//+4 is controller number
	l_pos = Math.floor((width-4)*voice_parameter_buffer.peek(1, param_ind+5,1));
	l_start = Math.floor((width-4)*voice_parameter_buffer.peek(1, param_ind+6,1));
	l_end = l_start+Math.floor((width-4)*voice_parameter_buffer.peek(1, param_ind+7,1));
	if(l_pos!=o_l_pos){
		o_l_pos=l_pos;
		redraw=1;
	}
	if(l_start!=o_l_start){
		o_l_start = l_start;
		redraw=1;
	}
	if(l_end!=o_l_end){
		o_l_end = l_end;
		redraw =1;
	}
}

function draw(){
	if(block>=0){
		getparams();
		drawstripe(x_pos+2,y_pos+2,x_pos+width-4,y_pos+height*0.5-1);
		outlet(1,"paintrect",x_pos+2,y_pos+height*0.5+1,x_pos+width*0.5-1,y_pos+height-2,menucolour);
		outlet(1,"moveto",x_pos+8,y_pos+height*0.8);
		outlet(1,"frgb", 0,0,0);
		outlet(1,"write","LOOP");
		outlet(1,"bang");
	}
}

function drawstripe(x1,y1,x2,y2){
	if(redraw){

		var h = (y2 - y1)*0.5;
		var xx=0;
		outlet(1,"frgb",0,0,200);
		var c=0;
		for(var x=x1;x<x2;x++){
			var min=0, max =0;
			if(x==l_pos){
				outlet(1,"frgb", 255,255,255);
				c=1;
			}else if((x>=l_start)&&(x<=l_end)){
				outlet(1,"frgb", 0,100,200);
				c=1;
			}else if(c>0){
				outlet(1,"frgb", 0,0, 200);
				c=0;
			}
			for(var i=0;i<10;i++){
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
			if(max<1){
				outlet(1,"frgb",255,0,0);
				c=1;
				max=1;
			}
			outlet(1,"moveto", x, y1 + (min+1)*h);
			outlet(1,"lineto", x, y1 + (max+1)*h);
			xx+=wavestripe_onepx;
		}
	}
}
function update(){
	if(block>=0){
		draw();
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
		xx = Math.floor(xx*3);
		if(mode[xx]==0){
			if(l==0){
				values[xx] = 0;
				send_note(xx,note[xx],0);
			}else{
				values[xx] = Math.min(Math.max(0,yy*yv[xx]+vel[xx]),127);	
				send_note(xx,note[xx],values[xx]);
			}
		}else if(mode[xx]==1){
			if(l==1){
				if(values[xx]>0){
					values[xx] = 0;
					send_note(xx,note[xx],0);
				}else{
					values[xx] = Math.min(Math.max(0,yy*yv[xx]+vel[xx]),127);
					send_note(xx,note[xx],values[xx]);
				}
			}
		}else if(mode[xx]==2){
			if(l==1){
				if(values[xx]>0){
					values[xx] = Math.min(Math.max(0,yy*yv[xx]+vel[xx]),127);	
					send_note(xx,note[xx],-values[xx]);
					update();			
					values[xx] = 0;
				}
			}
		}
	}
}
	
function store(){
	//nothing to store for this block
}

function send_note(xx,note,vel){
	//post("\ntodo send note",xx,note,vel);
	messnamed("utility.buttons",block,xx,note,vel);
}