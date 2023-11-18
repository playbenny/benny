outlets = 3;
var MAX_DATA = 1024;
var MAX_POOLS = 8;
var pool_notes = new Array(MAX_POOLS);
var pool_shape = new Array(MAX_POOLS);
var keybx=[0,0.5,1,1.5,2,3,3.5,4,4.5,5,5.5,6];
var keyby=[0,1,0,1,0,0,1,0,1,0,1,0];
var colours=new Array(MAX_POOLS);
for(var i =0;i<MAX_POOLS;i++){
	pool_notes[i]=new Array();
	pool_shape[i]=new Array();
}

var voice_data_buffer = new Buffer("voice_data_buffer"); 
var width, height,x_pos,y_pos,unit,sx,rh,cw,maxl;
var block=-1;
var config = new Dict;
config.name = "config";
var blocks = new Dict;
blocks.name = "blocks"
var voicemap = new Dict;
voicemap.name =  "voicemap";
var v_list = new Array();
var cursors = new Array(128); //holds last drawn position of playheads (per row)
//data format: for each voice the buffer holds:
// 0 - start (*128)
// 1 - length (*128+1)
// 2 - playhead position (updated by player voice)
// 3-131? data values
function setup(x1,y1,x2,y2,sw){
//	post("drawing sequencers");
	menucolour = config.get("palette::menu");
	var cl = config.getsize("palette::gamut");
	//post("cl",cl);
	for(var i =0;i<MAX_POOLS;i++){
		colours[i]=config.get("palette::gamut["+i*cl/MAX_POOLS+"]::colour");
	}
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	unit = height / 18;
	draw();
}
function notes(){
	var args = arrayfromargs(arguments);
	pool_notes[args[0]-1]=new Array();
    for(var i=1;i<args.length;i++){
		pool_notes[args[0]-1][i-1]=args[i];
	}
	pool_changed=1;
//	post('\nnotes', args, 'n');
}
function scales(){
	var args = arrayfromargs(arguments);
	pool_shape[args[0]-1]=new Array();
    for(var i=1;i<args.length;i++){
		pool_shape[args[0]-1][i-1]=args[i];
	}
	pool_changed=1;
//	post('\nshape:', args, 'n');
}
function draw(){
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		rh = height/v_list.length;
		for(r=0;r<v_list.length;r++){
			if(v_list.length<=2){
				draw_keyboard(x_pos,y_pos+rh*r,x_pos+width,y_pos+rh*(r+0.45),r);
				draw_graphs(x_pos,y_pos+rh*(r+0.5),x_pos+width,y_pos+rh*(r+0.9),r);
			}else{
				draw_keyboard(x_pos,y_pos+rh*r,x_pos+width*0.7,y_pos+rh*(r+0.9),r);
				draw_graphs(x_pos+width*0.72,y_pos+rh*r,x_pos+width,y_pos+rh*(r+0.9),r);
			}
		}

		//outlet(1,"bang");
		pool_changed=0;
	}
}
function draw_keyboard(x1,y1,x2,y2,poolno){
	var xunit=(x2-x1)/13.9;
	var x;
	var c;
	var i,t;
	for(i=0;i<24;i++){
		if(keyby[i%12]==0){
			x = 7*(i>11) + keybx[i%12];
			c=[70,70,70];
			for(t=0;t<pool_notes[poolno].length;t++){
				if(pool_notes[poolno][t]==i+24) c = colours[poolno];
			}
			outlet(1,"paintrect",x1+xunit*x,y1,x1+xunit*(x+0.9),y2,c);
		}
	}
	for(var i=0;i<24;i++){
		if(keyby[i%12]==1){
			c=[40,40,40];
			for(t=0;t<pool_notes[poolno].length;t++){
				if(pool_notes[poolno][t]==i+24) c = colours[poolno];
			}
			x = 7*(i>11) + keybx[i%12];
			outlet(1,"paintrect",x1+xunit*x,y1,x1+xunit*(x+0.9),y1*0.3+0.7*y2,c);
		}
	}
}
function draw_graphs(x1,y1,x2,y2,poolno){
	outlet(1,"paintrect",x1,y1,x2,y2,128,128,128);
	var i;
	var xunit=(x2-x1)/pool_shape[poolno].length;
	var poolmax=0;
	for(i=0;i<pool_shape[poolno].length;i++){
		if(pool_shape[poolno][i]>poolmax) poolmax = pool_shape[poolno][i];
	}
	for(i=0;i<pool_shape[poolno].length;i++){
		//voice_data_buffer.poke(1,MAX_DATA*v_list[poolno]+i,pool_shape[poolno][i]/poolmax )
		//needs to store the shape value in the data storage?
		
		//outlet(0,"custom_ui_element","data_v_scroll",x1+xunit*i,y1,x1+xunit*(i+1),y2,colours[poolno],MAX_DATA*v_list[poolno]+i);
		outlet(1,"paintrect",x1+xunit*i,y1+(y2-y1)*(1-(pool_shape[poolno][i]/poolmax)),x1+xunit*(i+1),y2,colours[poolno]);
		outlet(1,"frgb",0,0,0);
		outlet(1,"moveto",x1+xunit*(i+0.1),y2+(xunit*0.1));
		outlet(1,"write",pool_shape[poolno][i]);
	}
}
function update(){
	if(pool_changed){
		draw();
	}
}

function voice_is(v){
	block = v;
	if(block>0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function store(){
/*	var r;
	var transf_arr = new Array(maxl+3);
	for(r=0;r<v_list.length;r++){
		transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list[r], maxl+3);
		blocks.replace("blocks["+block+"]::voice_data::"+r, transf_arr);
	}*/
}
function mouse(x,y,l,s,a,c,scr){
	
}