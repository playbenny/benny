var MAX_DATA = 1024;
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
var width, height,x_pos,y_pos,unit;
var block=-1;
var blocks = new Dict;
blocks.name = "blocks"
var voicemap = new Dict;
voicemap.name =  "voicemap";
var mini=0;
var v_list = [];
var cu; //first one's cursor pos, to see if we need to redraw
var gx,gy,gw,gh; //graph position (it has labels in not-mini mode so the size is not the size of the panel)
var vcol=[[255,0,0],[0,255,0],[0,0,255],[255,255,0],[0,255,255],[255,0,255]];
var bright=[];
var textslow = 0;

function setup(x1,y1,x2,y2,sw){
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
	if(width<sw*0.6){ 
		mini=1;
		gx=x1;
		gy=y1;
		gw=width;
		gh=height-1;
	}else{
		gx=x1; gy=y1; gw=width;
		gh = Math.floor(height * 14 / 18);
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
		outlet(1, "paintrect", gx,gy,gx+gw+1,gy+gh+1,0,0.2,0);
		outlet(1, "moveto", gx+20,gy);
		outlet(1, "frgb", menucolour);
		outlet(1, "lineto", gx+20,gy+gh);
		for(var v=0;v<v_list.length;v++){
			var sh=Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[v])*4096);
			var shp=[shape_buffer.peek(1, sh),shape_buffer.peek(2, sh),shape_buffer.peek(3, sh),shape_buffer.peek(4, sh)];
			var ra=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[v]+1);
			ra = 1/(10000 - 9950*ra);
			var wa=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[v]+3);
			if(wa<0.5){
				wa = 8 - 14*wa;
			}else{
				wa = 2 - 2*wa;
			}
			var ph=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[v]+2);
			cu=voice_data_buffer.peek(1, MAX_DATA*v_list[0]);
			var stx=cu-100; //5 ticks per pixel, 20 pixels gap at the front
			var x=gx;
			var p = (cu * ra + ph) % 1;
			bright[v] = shp[0]*(1-Math.cos(p*6.283))*0.5;
			if(p<shp[3]){
				bright[v] += shp[1]*(p/shp[3]);
			}else{
				bright[v] += shp[1]*(1- (p-shp[3])/(1-shp[3])); //tri
				bright[v] += shp[2]; //sq
			}
			bright[v] = Math.pow(bright[v], wa);
			if(bright[v]<0) bright[v] = 0;
			if(bright[v]>1) bright[v] = 1;
			bright[v] = 0.7*bright[v] + 0.3;
			//post("\n bright ",bright[v], "p",p);
			for(var i=0;i<gw;i+=2){
				p = (stx * ra + ph) % 1;
				y=shp[0]*(1-Math.cos(p* 6.283))*0.5;
				if(p<shp[3]){
					y += shp[1]*(p/shp[3]);
				}else{
					y += shp[1]*(1- (p-shp[3])/(1-shp[3])); //tri
					y += shp[2]; //sq
				}
				y = 1 - Math.pow(y, wa);
				if(y<0) y=0;
				if(y>1) y=1;
				y *= gh;
				y += gy;
				if(i==0){
					outlet(1,"moveto",x,y)
					outlet(1,"frgb",vcol[v][0]*bright[v],vcol[v][1]*bright[v],vcol[v][2]*bright[v]);
				}else{
					outlet(1,"lineto",x,y);
				}
				x+=2;
				stx += 10;				
			}
		}
	}
}

function update(){
	var ocu=cu;
	if((voice_data_buffer.peek(1, MAX_DATA*v_list[0])-ocu)<5){
		if(textslow++>30){
			draw();
			textslow=0;
		}else{
			drawcurves();
		}
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
	for(var i = 0; i<v_list.length;i++){
		vcol[i] = config.get("palette::gamut["+i*20+"]::colour");
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