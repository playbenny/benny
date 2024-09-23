var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,rh;
var block = -1;
var blocks = new Dict;
blocks.name = "blocks"
var voicemap = new Dict;
voicemap.name =  "voicemap";
var mini = 0;
var block_colour=[];
var v_list = [];
var l = [], cw = [];
var cursors = []; //holds last drawn position of playheads (per row)
//data format: for each voice the buffer holds:
// 0 - start (*128)
// 1 - length (*128+1)
// 2 - playhead position (updated by player voice)
// 3-131? data values
var notelist = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function setup(x1,y1,x2,y2,sw){
//	post("drawing sequencers");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	mini=0;
	if(width<sw*0.6){ mini=1;}
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	if(block>=0){
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		draw();
	} 
}

function draw(){
	if(block>=0){
		for(var i=0;i<v_list.length;i++) {
			cursors[i]=-1;
			l[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i])*128)+1;
		}
		fulldraw();
	}
}

function fulldraw(){
	var c,r,ph;
	rh = height / v_list.length;
	for(r=0;r<v_list.length;r++){
		cw[r] = (width)/(l[r] - 0.1);
		ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[r]));		
		cursors[r]=ph;
		for(c=l[r]-1;c>=0;c--){		
			outlet(0,"custom_ui_element","data_v_scroll", c*cw[r]+x_pos,r*rh+y_pos,(1+c)*cw[r]+x_pos,(r+0.9)*rh+y_pos,block_colour[0],block_colour[1],block_colour[2],MAX_DATA*v_list[r]+1+c,1);
		}
	}
}

function update(){
	if(block>=0){
		var r,i;
		change = 0;
		for(i=0;i<v_list.length;i++) {
			//cursors[i]=-1;
			var ll = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i])*128)+1;
			if(l[i]!=ll){
				l[i]=ll;
				cw[i] = (width)/(l[i] - 0.1);
				change = 1;
			}
		}
		if(change==1){
			outlet(1,"paintrect",x_pos,y_pos,x_pos+width,y_pos+height,0,0,0);
			fulldraw();
			return 0;
		}		
		for(r=0;r<v_list.length;r++){
			ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[r]));
			if(cursors[r]!=ph){
				//redraw slider that was old cursor
				if((cursors[r]>=0)&&(cursors[r]<l[r])){
					outlet(0,"custom_ui_element","data_v_scroll", cursors[r]*cw[r]+x_pos,r*rh+y_pos,(1+cursors[r])*cw[r]+x_pos,(r+0.9)*rh+y_pos,block_colour[0],block_colour[1],block_colour[2],MAX_DATA*v_list[r]+1+cursors[r],1);
				}
				cursors[r]=ph;
				//draw new cursor slider
				if(cursors[r]<l[r]){
					outlet(0,"custom_ui_element","data_v_scroll", ph*cw[r]+x_pos,r*rh+y_pos,(1+ph)*cw[r]+x_pos,(r+0.9)*rh+y_pos,255,255,255,MAX_DATA*v_list[r]+1+ph,1);
				}
			}
		}
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function store(){
	messnamed("to_blockmanager","store_wait_for_me",block);
	if(block>=0){
		var i,s,r;
		v_list = voicemap.get(block);
		if(v_list== null) return 0;
		if(!Array.isArray(v_list)) v_list = [v_list];
		var transf_arr = [];
		for(r=0;r<v_list.length;r++){
			transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list[r], l[r]+1);
			if(Array.isArray(transf_arr)){
				var d = 0;
				while(d==0){
					d = transf_arr.pop();
				}
				transf_arr.push(d);
				blocks.replace("blocks["+block+"]::voice_data::"+r, transf_arr);
			}
		}
	}
	messnamed("to_blockmanager","store_ok_done",block);
}

function keydown(key){
	
}
function enabled(){
	
}