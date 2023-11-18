//var MAX_DATA = 1024;
var MAX_PARAMETERS = 256;
//var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,w3;
var block=-1;
var map = new Dict;
map.name = "voicemap";
//var blocks = new Dict;
//blocks.name = "blocks"
var v_list = [];
var values=[0,0,0];
var ov=[0,0,0];

var note=[],vel=[],yv=[],mode=[];

function setup(x1,y1,x2,y2,sw){
	menucolour = config.get("palette::menu");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	w3=width/3;
	draw();
}

function getparams(){
	note[0] = Math.floor(128*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0],1));
	note[1] = Math.floor(128*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+1,1));
	note[2] = Math.floor(128*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+2,1));
	vel[0] = Math.floor(128*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+3,1));
	vel[1] = Math.floor(128*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+4,1));
	vel[2] = Math.floor(128*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+5,1));
	yv[0] = 2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+6,1)-1;
	yv[1] = 2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+7,1)-1;
	yv[2] = 2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+8,1)-1;
	mode[0] = Math.floor(3*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+9,1));
	mode[1] = Math.floor(3*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+10,1));
	mode[2] = Math.floor(3*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[0]+11,1));
}

function draw(){
	if(block>=0){
		getparams();
		for(var i=0;i<3;i++){
			c = 0.2 + values[i];
			outlet(1,"paintrect",w3*(i+0.05)+x_pos,y_pos+0.05*height,w3*(i+0.95)+x_pos,height*0.95+y_pos,c,c,c);
			outlet(0,"custom_ui_element","mouse_passthrough",w3*(i+0.05)+x_pos,y_pos+0.05*height,w3*(i+0.95)+x_pos,height*0.95+y_pos,0,0,0,block+1,block+1,0);
		}	
		//outlet(1,"bang");
	}
}

function update(){
	if(block>=0){
		var c;
		for(var i=0;i<3;i++){
			if(ov[i]!=values[i]){
				c = 0.2 + values[i];
				ov[i]=values[i];
				outlet(1,"paintrect",w3*(i+0.05)+x_pos,y_pos+0.05*height,w3*(i+0.95)+x_pos,height*0.95+y_pos,c,c,c);
				outlet(0,"custom_ui_element","mouse_passthrough",w3*(i+0.05)+x_pos,y_pos+0.05*height,w3*(i+0.95)+x_pos,height*0.95+y_pos,0,0,0,block+1,block+1,0);
			}
		}	
		//outlet(1,"bang");
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
	var xx = (x-x_pos)/width;
	var yy = 1 - ((y-y_pos)/height);
	if((xx>=0)&&(xx<=1)&&(yy>=0)&&(yy<1)){
		xx = Math.floor(xx*3);
		if(mode[xx]==0){
			if(l==0){
				values[xx] = 0;
				send_note(xx,note[xx],0);
			}else{
				values[xx] = Math.min(Math.max(0,yy*yv[xx]+vel[xx]),127);	
				send_note(xx,note[xx],values[xx]);
			}
		}else if(mode[xx]==1){
			if(l==1){
				if(values[xx]>0){
					values[xx] = 0;
					send_note(xx,note[xx],0);
				}else{
					values[xx] = Math.min(Math.max(0,yy*yv[xx]+vel[xx]),127);
					send_note(xx,note[xx],values[xx]);
				}
			}
		}else if(mode[xx]==2){
			if(l==1){
				if(values[xx]>0){
					values[xx] = Math.min(Math.max(0,yy*yv[xx]+vel[xx]),127);	
					send_note(xx,note[xx],-values[xx]);
					update();			
					values[xx] = 0;
				}
			}
		}
	}
}
	
function store(){
	//nothing to store for this block
}

function send_note(xx,note,vel){
	//post("\ntodo send note",xx,note,vel);
	messnamed("utility.buttons",block,xx,note,vel);
}