var MAX_DATA = 16384;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
outlets = 3;
var config = new Dict;
config.name = "config";
var block_colour = [128,128,128];
var width, height,x_pos,y_pos,unit,u1,cw,cols;
var block=-1;
var map = new Dict;
map.name = "voicemap";
var v_list = [];
var colour = [];

function setup(x1,y1,x2,y2,sw){
	MAX_DATA = config.get("MAX_DATA");
	width = x2-x1;
	height = y2-y1;
	var flag = 0;
	if(x_pos!=x1) flag = 1;
	x_pos = x1;
	y_pos = y1;
	if(block>=0){
		if(flag) outlet(1,"paintrect",x1,y1,x2,y2,0,0,0);
		draw();
	}
}

function draw(){
	if(block>=0){
		update(1);
	}
}

function update(force){
	var rx = width * 0.16667;
	var ry = height * 0.5;
	for(i=0;i<v_list.length;i++){
		var pos = voice_data_buffer.peek(1,v_list[i]*MAX_DATA,3);
		outlet(1,"setpixel", x_pos + rx + rx * pos[0], y_pos + ry + ry*pos[1],colour[i]);
		outlet(1,"setpixel", x_pos + 3*rx + rx * pos[0], y_pos + ry + ry*pos[2],colour[i]);
		outlet(1,"setpixel", x_pos + 5*rx + rx * pos[1], y_pos + ry + ry*pos[2],colour[i]);
	}
}


function mouse(x,y,leftbutton,shift,alt,ctrl){
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list=[];
		v_list = map.get(block);
		if(!Array.isArray(v_list)) v_list = [v_list];
		var p = 6.28 / v_list.length;
		for(var i=0;i<v_list.length;i++){
			colour[i] = [ (Math.sin(i*p)+1)*128, (Math.sin(i*p+2.1)+1)*128, (Math.sin(i*p+ 4.19)+1)*128 ];
		}

	}
}



function voice_offset(){}

function loadbang(){
	outlet(0,"getvoice");
}

function store(){
}

function enabled(){}