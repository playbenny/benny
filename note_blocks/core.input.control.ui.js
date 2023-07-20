// THIS WAS RENE, edit it!

var MAX_DATA = 1024;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,w4,h4;
var block=-1;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks"
var v_list = [];
var cursors = new Array(128); //holds last drawn position of playheads (per row)
var cell = new Array(16); //holds how many cursors are in this cell this update

function setup(x1,y1,x2,y2,sw){
//	post("drawing sequencers");
	menucolour = config.get("palette::menu");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	w4=width/4;
	h4=height/4;
	post(block);
	draw();
}
function draw(){
	if(block>=0){
		var c,r,no,ve,on;
		var i,t,c;
		for(i=0;i<4;i++){
			for(t=0;t<4;t++){
				r=i+4*t;
				c=config.get("palette::gamut["+r+"]");
				//outlet(1,"paintrect",w4*(i+0.05)+x_pos,h4*(t+0.05)+y_pos,w4*(i+0.95)+x_pos,h4*(t+0.95)+y_pos,c);
				outlet(0,"custom_ui_element","param_v_scroll",w4*(i+0.1)+x_pos,h4*(t+0.1)+y_pos,w4*(i+0.45)+x_pos,h4*(t+0.9)+y_pos,c[0],c[1],c[2],[block,5+r]);
			}
		}	
		outlet(1,"bang");
	}
}

function update(){
	var i,t,c,draw=0;
	for(i=0;i<16;i++) cell[i]=0;
	for(i=0;i<v_list.length;i++) {
		c= Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[i]));
		if(c!=cursors[i]){
			cursors[i]=c;
			draw=1;
		}
		cell[c] += 1/v_list.length;
	}
	if(draw){
		for(i=0;i<4;i++){
			for(t=0;t<4;t++){
				r=i+4*t;
				c=225*cell[r]+30;
				outlet(1,"paintrect",w4*(i+0.05)+x_pos,h4*(t+0.05)+y_pos,w4*(i+0.95)+x_pos,h4*(t+0.95)+y_pos,c,c,c);
				
				outlet(0,"custom_ui_element","param_v_scroll",w4*(i+0.1)+x_pos,h4*(t+0.1)+y_pos,w4*(i+0.45)+x_pos,h4*(t+0.9)+y_pos,menucolour[0],menucolour[1],menucolour[2],block,5+r);
				outlet(0,"custom_ui_element","param_v_scroll",w4*(i+0.55)+x_pos,h4*(t+0.55)+y_pos,w4*(i+0.9)+x_pos,h4*(t+0.9)+y_pos,menucolour[0],menucolour[1],menucolour[2],block,21+r);
				outlet(0,"custom_ui_element","param_toggle",w4*(i+0.55)+x_pos,h4*(t+0.1)+y_pos,w4*(i+0.9)+x_pos,h4*(t+0.45)+y_pos,menucolour[0],menucolour[1],menucolour[2],block,37+r);
				
			}
		}	
	}
}

function voice_is(v){
	block = v;
	if(block>0){
		v_list = map.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function mouse(x,y,l,s,a,c,scr){
	}
	
function store(){
	//nothing to store for this block, the paramdata just holds cursor
}