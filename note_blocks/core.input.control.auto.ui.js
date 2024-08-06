var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,w4,h4;
var rows = 4;
var cols = 4;
var block=-1;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var io = new Dict;
io.name = "io";
var gamutl;
var v_list = [];


function setup(x1,y1,x2,y2,sw){ 
	// not done - needs to work out which controller it is, get row and column count from config
	menucolour = config.get("palette::menu");
	gamutl = config.getsize("palette::gamut");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	w4=width/cols;
	h4=height/rows;
	//post(block);
	draw();
}
function draw(){
	if(block>=0){
		update(1);
	}
}

function update(force){
	var r,b,y,x,c;

	if(force || voice_data_buffer.peek(1,MAX_DATA*v_list)){
		for(y=0;y<rows;y++){
			for(x=0;x<cols;x++){
				var readindex=(MAX_DATA*v_list+x+y*cols+1)|0;
				r=voice_parameter_buffer.peek(1,(MAX_PARAMETERS*v_list+x+y*cols+2)|0)*1.05;
				r=((12.6 - (r*r*r))%1) * gamutl;
				r|=0;
				//post("\nC is",readindex,r,i,t);
				c=config.get("palette::gamut["+r+"]::colour"); 
				b=voice_data_buffer.peek(1,readindex + rows*cols);
				//post("\n",i,t,readindex,b,c[0]);	
				if(b!=0){
					b=0.2;
					c[0] = (c[0] * b) | 0;
					c[1] = (c[1] * b) | 0;
					c[2] = (c[2] * b) | 0;
				}
				outlet(1,"paintrect",w4*(x+0.05)+x_pos,h4*(y+0.05)+y_pos,w4*(x+0.95)+x_pos,h4*(y+0.95)+y_pos,c[0],c[1],c[2]);
				outlet(0,"custom_ui_element","data_v_scroll",w4*(x+0.1)+x_pos,h4*(y+0.1)+y_pos,w4*(x+0.9)+x_pos,h4*(y+0.9)+y_pos,c[0],c[1],c[2],readindex);	
			}
		}
		voice_data_buffer.poke(1,MAX_DATA*v_list,0);
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = map.get(block);
		if(typeof v_list!="number") v_list = v_list[0];
		var controllername = blocks.get("blocks["+block+"]::selected_controller");
		if(io.contains("controllers::"+controllername)){
			post("\ngetting controller info for ui");
			rows = io.get("controllers::"+controllername+"::rows");
			cols = io.get("controllers::"+controllername+"::columns");
		}
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function mouse(x,y,l,s,a,c,scr){
}
	
function store(){
	//nothing to store for this block, the paramdata just holds comms between ui and the block
}
function enabled(){}