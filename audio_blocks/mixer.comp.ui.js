var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var block_colour = [128,128,128];
var width, height,x_pos,y_pos,unit,cw,cols;
var block=-1;
var namelist;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var v_list = [];
var meter = [];
var ometer = [];
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
	if(block>=0){
		scan_for_channels();
		draw();
	}
}

function draw(){
	if(block>=0){
		outlet(0, "custom_ui_element", "mouse_passthrough", x_pos,y_pos,x_pos+width,y_pos+height,0,0,0,block,0);
		update(1);
	}
}

function update(force){
	if(force||(check_meters_for_changes()==1)){
		var x=0;
		for(var v=0;v<v_list.length;v++){
			draw_comp_meters(x,v);
			x+=cw;
		}
		x = 0;
		outlet(1,"frgb",255,255,255);
		for(var v=0;v<v_list.length;v++){
			outlet(1,"moveto", x_pos+x+4, y_pos + 4+height*0.3);
			outlet(1,"write",channelnames[v]);
			x+=cw;
		}
	}
}

function check_meters_for_changes(){
	var dr=0;
	for(var v=0;v<v_list.length;v++){
		meter[v] = voice_data_buffer.peek(1, MAX_DATA*v_list[v],3);
		if((meter[v][0]!=ometer[v][0])||(meter[v][1]!=ometer[v][1])||(meter[v][2]!=ometer[v][2])) dr = 1;
		ometer[v] = meter[v].concat();
	}
	return dr;
}

function draw_comp_meters(x,v){
	post("\nmeters",meter[v]);
	outlet(1, "paintrect",x_pos+(x+v)*cw,y_pos,x_pos+(x+v+0.3)*cw,y_pos+unit*4,block_darkest);
	var metery = height * Math.max(-1,Math.log(meter[v][0]));
	post(metery);
	outlet(1, "paintrect",x_pos+(x+v)*cw,y_pos,x_pos+(x+v+0.1)*cw,y_pos-metery,block_colour);
	metery = height * Math.max(-1,Math.log(meter[v][1]));
	post(metery);
	outlet(1, "paintrect",x_pos+(x+v+0.1)*cw,y_pos,x_pos+(x+v+0.2)*cw,y_pos-metery,block_colour);
	metery = height * Math.max(-1,Math.log(meter[v][2]));
	post(metery);
	outlet(1, "paintrect",x_pos+(x+v+0.2)*cw,y_pos,x_pos+(x+v+0.3)*cw,y_pos-metery,block_colour);
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
		for(var i=0;i<cols;i++){ meter[i] = [0,0,0]; ometer[i] = [0,0,0]; }
		block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
		block_darkest = [block_colour[0]*0.2, block_colour[1]*0.2, block_colour[2]*0.2];
		cw = (width+unit*0.1) / cols;
	}
}

function voice_offset(){}

function loadbang(){
	outlet(0,"getvoice");
}

function store(){
}

function enabled(){}