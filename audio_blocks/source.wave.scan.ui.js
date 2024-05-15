var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;
var MAX_WAVES = 16;
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
var parameter_value_buffer = new Buffer("parameter_value_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos;
var unit,vo=-1;
var block=-1;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var waves_dict = new Dict;
waves_dict.name = "waves";
var v_list = [];
var blockcolour = [64,64,64];
var o_hl=new Array(100);
var o_w=-1;

function setup(x1,y1,x2,y2,sw){ //has screen width too so it can plot a little fx/waveform hint window bottom right
//	post("drawing sequencers");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	if(width != o_w){
		for(var i=0;i<v_list.length;i++) {
			wave = 1+ Math.floor(MAX_WAVES*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i],1));
			messnamed("to_blockmanager","clear_wave_graphic",wave,width);
		}
		o_w = width;
	}
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	unit = height / 18;
	o_hl = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
	if(block>=0){
		v_list = map.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		draw();
	}
}

function draw(){
	if(block>=0){
		var i;
		//var c,r,ph,rr,rc,fc;
		unit = height / v_list.length;
		var wave = 1;
		var highlight = 2;
		for(i=0;i<v_list.length;i++) {
			//need to find out if highlight has changed, only draw if it has.
			wave = 1+ Math.floor(MAX_WAVES*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i],1));
			highlight = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+7,1);
			if(o_hl[i]!=highlight){
				o_hl[i]=highlight;
				outlet(0, "custom_ui_element","waveform_slice_highlight",x_pos, y_pos, width+x_pos, (1+i)*unit+y_pos,blockcolour[0],blockcolour[1],blockcolour[2],block+1,wave,highlight); 
			}
		}
	}
}

function mouse(x,y,l,s,a,c,scr){
	//post("\nmouse",x,y,l,s,a,c,scr);
	if((x>=x_pos)&&(x<=x_pos+width)){
		if((y>=y_pos)&&(y<=y_pos+height)){
			var tx=x-x_pos;
			tx/=width; //this next line checks for modulation - any difference between voice value and block value, and inverts that so that you get what you clicked. if possible.
			var rx = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+7)-parameter_value_buffer.peek(1, MAX_PARAMETERS*block+7);
			//post("\ncurrent diff is:",rx,"you want",tx,"so i'll set it to",tx-rx);
			parameter_value_buffer.poke(1, MAX_PARAMETERS*block+7,Math.min(1,Math.max(0,tx-rx)));
		}
	}
}
function update(){
	draw();
}

function keydown(){}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = map.get(block);
		if(v_list == null){
			post("\nNULL VLIST");
			block=-1;
		}
		if(typeof v_list=="number") v_list = [v_list];

		blockcolour = blocks.get("blocks["+block+"]::space::colour");
	}
}

function voice_offset(v){
	vo = v;
}

function loadbang(){
	outlet(0,"getvoice");
}

function quer(){
	post("vlist is",v_list);
}

function store(){

}
function enabled(){}