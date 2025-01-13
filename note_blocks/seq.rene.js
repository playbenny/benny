var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
var quant_buffer = new Buffer("QUANTPOOL");
var index_buffer = new Buffer("INDEXPOOL");

outlets = 3;
var config = new Dict;
config.name = "config";
var blocks = new Dict;
blocks.name = "blocks";

var width, height,x_pos,y_pos,w4,h4;
var blockcolour, blockdark;

var basenote = 0;
var scale = 0;

var block=-1;
var voicemap = new Dict;
voicemap.name = "voicemap";
//var blocks = new Dict;
//blocks.name = "blocks"
var v_list = [];
var cursors = []; //holds last drawn position of playheads (per row)
var cell = new Array(16); //holds how many cursors are in this cell this update
var rs = []; //copies of params
var mini = 0;
var note_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function setup(x1,y1,x2,y2,sw){
	//	post("drawing sequencers");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	menucolour = config.get("palette::menu");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	w4=width/3.95;
	h4=height/3.95;
	mini = (width<sw*0.5);
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		draw();
	}	
}

function draw(){
	if(block>=0){
		update(1);
	}
}
/*		var c,r;
		var i,t,c;
		for(i=0;i<16;i++) cell[i]=0;
		for(i=0;i<v_list.length;i++) {
			cursors[i]=-1;
			cell[Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[i]))] += 1/v_list.length;
		}
		
		for(i=0;i<4;i++){
			for(t=0;t<4;t++){
				c=225*cell[i+4*t]+30;
				outlet(1,"paintrect",w4*(i+0.05)+x_pos,h4*(t+0.05)+y_pos,w4*(i+0.95)+x_pos,h4*(t+0.95)+y_pos,c,c,c);
				r=i+4*t;
				outlet(0,"custom_ui_element","param_v_scroll",w4*(i+0.1)+x_pos,h4*(t+0.1)+y_pos,w4*(i+0.45)+x_pos,h4*(t+0.9)+y_pos,menucolour[0],menucolour[1],menucolour[2],[block,5+r]);
				outlet(0,"custom_ui_element","param_v_scroll",w4*(i+0.55)+x_pos,h4*(t+0.55)+y_pos,w4*(i+0.9)+x_pos,h4*(t+0.9)+y_pos,menucolour[0],menucolour[1],menucolour[2],block,21+r);
				outlet(0,"custom_ui_element","param_toggle",w4*(i+0.55)+x_pos,h4*(t+0.1)+y_pos,w4*(i+0.9)+x_pos,h4*(t+0.45)+y_pos,menucolour[0],menucolour[1],menucolour[2],block,37+r);
			}
		}	
		//outlet(1,"bang");
	}
}*/

function update(force){
	var i,t,c,draw;
	var offs = MAX_PARAMETERS*v_list[0];
	var b = Math.floor(voice_parameter_buffer.peek(1,offs) * 99.999);
	var s = 1+ Math.floor(voice_parameter_buffer.peek(1,offs+53) * 8.999);
	var smode = voice_parameter_buffer.peek(1,offs+54) > 0.5;
	if(force){
		draw = 1;
		basenote = b;
		scale = s;
	}else{
		draw = 0;
		if(b!=basenote){
			basenote = b; 
			draw=1;
		}
		if(s!=scale){
			scale = s;
			draw=1;
		}
		offs += 5;
		for(i=0;i<48;i++){
			var tp = voice_parameter_buffer.peek(1, offs+i);
			if(rs[i]!=tp){
				rs[i]=tp;
				draw = 1;
			}
		}
		for(i=0;i<16;i++) cell[i]=0;
		for(i=0;i<v_list.length;i++) {
			c= Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[i]));
			if(c!=cursors[i]){
				cursors[i]=c;
				draw=1;
			}
			cell[c] += 1/v_list.length;
		}
	}
	if(draw){
		for(i=0;i<4;i++){
			for(t=0;t<4;t++){
				r=i+4*t;
				c=225*cell[r]+30;
				outlet(1,"paintrect",w4*i+x_pos,h4*t+y_pos,w4*(i+0.95)+x_pos,h4*(t+0.95)+y_pos,c,c,c);
				
				outlet(0,"custom_ui_element","param_v_scroll",w4*(i+0.05)+x_pos,h4*(t+0.05)+y_pos,w4*(i+0.65)+x_pos,h4*(t+0.9)+y_pos,blockcolour[0],blockcolour[1],blockcolour[2],block,5+r);
				outlet(0,"custom_ui_element","param_v_scroll",w4*(i+0.75)+x_pos,h4*(t+0.30)+y_pos,w4*(i+0.9)+x_pos,h4*(t+0.9)+y_pos,blockcolour[0],blockcolour[1],blockcolour[2],block,21+r);
				outlet(0,"custom_ui_element","param_toggle",w4*(i+0.75)+x_pos,h4*(t+0.05)+y_pos,w4*(i+0.9)+x_pos,h4*(t+0.20)+y_pos,menucolour[0],menucolour[1],menucolour[2],block,37+r);

			}
		}	
		if(!mini){
			for(i=0;i<4;i++){
				for(t=0;t<4;t++){
					r=i+4*t;
					c=225*cell[r]+30;
					outlet(1,"frgb", c);
					outlet(1,"moveto", w4*(i+0.15)+x_pos,h4*(t+0.85)+y_pos);
					var n = Math.floor(24*rs[r]);
					if(smode==0){
						n = quant_buffer.peek(scale, n + basenote);
					}else{
						n = index_buffer.peek(scale, n) + basenote;
					}
					var nn = note_names[(n%12)] + Math.floor(n/12);
					outlet(1,"write", nn);
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
		blockcolour = blocks.get("blocks["+block+"]::space::colour");
		blockdark = [blockcolour[0]*0.2,blockcolour[1]*0.2,blockcolour[2]*0.2];
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
function enabled(){}