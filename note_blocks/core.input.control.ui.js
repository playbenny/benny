// THIS WAS RENE, edit it!

var MAX_DATA = 1024;
//var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
//var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,w4,h4;
var block=-1;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks"
var gamutl;
var v_list = [];
var cursors = new Array(128); //holds last drawn position of playheads (per row)
var cell = new Array(16); //holds how many cursors are in this cell this update

function setup(x1,y1,x2,y2,sw){ 
	// not done - needs to work out which controller it is, get row and column count from config
	menucolour = config.get("palette::menu");
	gamutl = config.getsize("palette::gamut");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	w4=width/4;
	h4=height/4;
	//post(block);
	draw();
}
function draw(){
	if(block>=0){
		var r,i,t,c;
		for(i=0;i<4;i++){
			for(t=0;t<4;t++){
				var readindex=(MAX_DATA*(v_list+0.25)+i+t*4+1)|0;
				r=voice_data_buffer.peek(1,readindex)*1.05;
				r=((12.6 - (r*r*r))%1) * gamutl;
				r|=0;
				
				c=config.get("palette::gamut["+r+"]::colour");  //config.get("palette::gamut["+r+"]");
				b=voice_data_buffer.peek(1,(readindex+MAX_DATA*0.25)|0);
				if(b!=0){
					b=0.2;
					c[0] = (c[0] * b) | 0;
					c[1] = (c[1] * b) | 0;
					c[2] = (c[2] * b) | 0;
				}
				
				outlet(1,"paintrect",w4*(i+0.05)+x_pos,h4*(t+0.05)+y_pos,w4*(i+0.95)+x_pos,h4*(t+0.95)+y_pos,c[0],c[1],c[2]);
				outlet(0,"custom_ui_element","data_v_scroll",w4*(i+0.1)+x_pos,h4*(t+0.1)+y_pos,w4*(i+0.45)+x_pos,h4*(t+0.9)+y_pos,c[0],c[1],c[2],1+MAX_DATA*v_list+i+t*4);
			}
		}	
	}
}

function update(){
	var r,b,i,t,c;

	if(voice_data_buffer.peek(1,MAX_DATA*v_list)){
		for(i=0;i<4;i++){
			for(t=0;t<4;t++){
				var readindex=(MAX_DATA*(v_list+0.25)+i+t*4+1)|0;
				r=voice_data_buffer.peek(1,readindex)*1.05;
				r=((12.6 - (r*r*r))%1) * gamutl;
				r|=0;
				//post("\nC is",readindex,r,i,t);
				c=config.get("palette::gamut["+r+"]::colour"); 
				b=voice_data_buffer.peek(1,(readindex+MAX_DATA*0.25)|0);
				//post("\n",i,t,readindex,b,c[0]);	
				if(b!=0){
					b=0.2;
					c[0] = (c[0] * b) | 0;
					c[1] = (c[1] * b) | 0;
					c[2] = (c[2] * b) | 0;
				}
				outlet(1,"paintrect",w4*(i+0.05)+x_pos,h4*(t+0.05)+y_pos,w4*(i+0.95)+x_pos,h4*(t+0.95)+y_pos,c[0],c[1],c[2]);
				
				outlet(0,"custom_ui_element","data_v_scroll",w4*(i+0.1)+x_pos,h4*(t+0.1)+y_pos,w4*(i+0.45)+x_pos,h4*(t+0.9)+y_pos,c[0],c[1],c[2],MAX_DATA*v_list+i+t*4+1);				
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