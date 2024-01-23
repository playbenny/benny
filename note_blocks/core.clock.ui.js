var MAX_DATA = 1024;
var MAX_BLOCKS = 64;
//var voice_data_buffer = new Buffer("voice_data_buffer"); 
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,unit,sx,rh,cw,maxl;
var block=-1;
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
var muted=0;
var beat=0;
var obeat=0;

var headpos=0;
var ohp=0;
var last_times=new Array();
var menudark;
var gamut=new Array();
var center = 0;
var ccol=128;
var beats_per_bar = 4; //TODO fetch timesig

function setup(x1,y1,x2,y2,sw){
	//	post("drawing sequencers");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	menucolour = config.get("palette::menu");
	menudark = [menucolour[0]>>2,menucolour[1]>>2,menucolour[2]>>2];
	for(var i=0;i<16;i++){
		gamut[i] = config.get("palette::gamut["+i*8+"]::colour");
	}
	width = x2-x1-1-(width<300);
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	unit = height / 18;
	draw();
}
function draw(){
	headpos = 0;
	ohp = 0;
	outlet(1,"paintrect",x_pos,y_pos,x_pos+width,y_pos+height,menucolour[0]*0.1,menucolour[1]*0.08,menucolour[2]*0.02);
}
function resync(){
	beat = -1;
}
function times(value,voice){
	if(headpos>63) draw();
	var xx;
	if(headpos!=ohp){
		ohp=headpos;
		xx=(0.5+(center/10000));
		if((xx>0)&&(xx<1)){
			xx = x_pos+width*xx;
			outlet(1,"setpixel",xx+1,y_pos+height*(headpos/64),ccol,ccol,ccol);
			outlet(1,"setpixel",xx,y_pos+height*(headpos/64),ccol,ccol,ccol);
			ccol=128;
		}
	}

	if(value!=last_times[voice]){
		last_times[voice]=value;
		//headpos+=0.01;
		xx=(0.5+((value-center)/10000));
		if((xx>0)&&(xx<1)){
			if(width<300){
				outlet(1,"setpixel",x_pos+width*xx,y_pos+height*(headpos/64),gamut[voice]);
			}else{
				outlet(1,"paintrect",x_pos+width*xx,y_pos+height*(headpos/64),x_pos+width*xx+2,y_pos+height*(headpos/64)+2,gamut[voice]);
			}
		} 
	}

	if(beat!=obeat){
		var nw=width-20;
		var nh=height-20;
		if(nw>nh)nw=nh;
		var xx=0.5*width + 0.5*nw*Math.sin(6.283*obeat/beats_per_bar);
		var yy=0.5*height - 0.5*nh*Math.cos(6.283*obeat/beats_per_bar);
		outlet(1,"paintrect",x_pos+xx-9,y_pos+yy-9,x_pos+xx+9,y_pos+yy+9,0,0,0);
		obeat = beat;
		
		xx=0.5*width + 0.5*nw*Math.sin(6.283*beat/beats_per_bar);
		yy=0.5*height - 0.5*nh*Math.cos(6.283*beat/beats_per_bar);
		if(beat==0){
			outlet(1,"paintrect",x_pos+xx-9,y_pos+yy-9,x_pos+xx+9,y_pos+yy+9,255,255,255);
		}else{
			outlet(1,"paintrect",x_pos+xx-9,y_pos+yy-9,x_pos+xx+9,y_pos+yy+9,menucolour);
		}
	}
}
function tick(t){
	headpos+=0.25;
	if((t%4)==0){
		beat++;
		beat = beat % beats_per_bar;
	}
}

function centerline(c){
	center = c;
	ccol=180;
}

function update(){
}
function mouse(x,y,l,s,a,c,scr){
}

function check_mute_state(){
	muted=0;
	if(blocks.contains("blocks["+block+"]::mute")){
		if(blocks.get("blocks["+block+"]::mute")==1) muted =1;
	}

	outlet(2,1-muted);
}

function voice_is(v){
	block = v;
	check_mute_state();
	for(var i=0;i<MAX_BLOCKS;i++){
		if((i!=block) && (blocks.contains("blocks["+i+"]::patcher"))){
			if(blocks.get("blocks["+i+"]::patcher")=="core.clock"){
				if(!muted){ //ie if we're not loading
					outlet(2,2); //this closes the gate, acquires the tempo, reopens the gate?
				}
			} 
		}
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function store(){

}