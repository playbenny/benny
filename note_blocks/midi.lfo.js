var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var shape_buffer = new Buffer("osc_shape_lookup");
outlets = 3;
var config = new Dict;
config.name = "config";
var connections = new Dict;
connections.name = "connections";
var blocks = new Dict;
blocks.name = "blocks";
var width, height, x_pos, y_pos, unit;
var block = -1;
var blocks = new Dict;
blocks.name = "blocks"
var voicemap = new Dict;
voicemap.name =  "voicemap";
var mini = 0;
var v_list = [];
var cu; //first one's cursor pos, to see if we need to redraw
var gx,gy,gw,gh; //graph position (it has labels in not-mini mode so the size is not the size of the panel)
var vcol = [[255,0,0],[0,255,0],[0,0,255],[255,255,0],[0,255,255],[255,0,255]];
var bright = [];
var offs = [];
var textslow = 0;

function setup(x1,y1,x2,y2,sw,mode){
	outlet(0,"getvoice");
	menucolour = config.get("palette::menu");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	menudark = [menucolour[0]*0.2,menucolour[1]*0.2,menucolour[2]*0.2];
	width = x2-x1;
	mini=0;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	if(mode=="mini"){ 
		mini=1;
		gx=x1;
		gy=y1;
		gw=width;
		gh=height-1;
	}else{
		gx=x1; gy=y1; gw=width;
		gh = Math.floor(height * 14 / 18) - 1;
	}
	unit = height / 18;
	draw();
}

function draw(){
	if(block>=0){
		drawcurves();
		if(!mini){
			for(var v=0;v<v_list.length;v++){
				outlet(1,"moveto",gx+unit, gy+gh+unit*(0.4+v*0.5));
				outlet(1,"frgb",vcol[v][0]*bright[v],vcol[v][1]*bright[v],vcol[v][2]*bright[v]);
				vs = "voice: " + v;
				for(var i=0;i<connections.getsize("connections");i++){
					if(connections.contains("connections["+i+"]::from::number")){
						if(parseInt(connections.get("connections["+i+"]::from::number"))==block){
							if(parseInt(connections.get("connections["+i+"]::from::voice"))==v+1){
								// falls down if it's from multiple voices
								vs = vs + " to: "+blocks.get("blocks["+connections.get("connections["+i+"]::to::number")+"]::label");
								//need to eventually get block name instead
							}
						}
					}
				}
				outlet(1,"write",vs);
			}
		}
	}
}

function drawcurves(){
	if(block>=0){
		outlet(1, "paintrect", gx,gy,gx+gw+1,gy+gh+2,0,0.2,0);
		for(var v=0;v<v_list.length;v++){
			var ptr =  MAX_DATA*v_list[v];
			var p = voice_data_buffer.peek(1,ptr);
			p = ((p + 1) - (p>=512)*511)|0;
			var val = voice_data_buffer.peek(1,ptr+p);
			if(val<1){
				post("\nval",val,"p",p);
			}else{
				var x = gx;
				var y = gy + gh*(2-val);
				bright[v] = 0.5*(val-1) + 0.7;
				outlet(1,"moveto",x,y)
				outlet(1,"frgb",vcol[v][0]*bright[v],vcol[v][1]*bright[v],vcol[v][2]*bright[v]);
				for(var i=2;i<gw;i+=3){
					p = (p + 1) |0;
					p -= (p>=512)*511;
					val = voice_data_buffer.peek(1,ptr + p);
					if(val>=1){
						y = (2 - val) * gh + gy;
						outlet(1,"lineto",x,y);
					}else{
						i=99999;
					}
					x+=3;
				}
			}
		}
	}
}

function update(){
	if(textslow++>30){
		draw();
		textslow=0;
	}else{
		drawcurves();
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
	var ps = config.getsize("palette::gamut");
	for(var i = 0; i<v_list.length;i++){
		vcol[i] = config.get("palette::gamut["+((i*20)%ps)+"]::colour");
		bright[i] = 1;
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function store(){
}

function keydown(key){
	
}
function enabled(){}