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
var paramsarray=[];

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
	mini=1;
	gx=x1;
	gy=y1+2;
	gw=width;
	gh=height-3;
	unit = height / 8;
	gh-=unit;
	drawcurves();
}

function draw(){
	drawcurves(1);
}

function drawcurves(force){
	if(block>=0){
		var par = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list,10);
		
		var draw=0;
		for(var i=0;i<10;i++){
			if(par[i]!=paramsarray[i]){
				draw=1;
				paramsarray[i]=par[i];
			}
		}
		if(draw||force){
			outlet(1, "paintrect", gx,gy-2,gx+gw+1,gy+height,0,0.2,0);
			//outlet(1, "moveto", gx+20,gy);
			//outlet(1, "frgb", menucolour);
			//outlet(1, "lineto", gx+20,gy+gh);
			var ra1=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list);
			var ra2=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+4);
			ra1 = Math.floor((Math.pow(100, ra1) - 1)*0.01010101010101010101010101010101*127) + 1;
			ra2 = Math.floor((Math.pow(100, ra2) - 1)*0.01010101010101010101010101010101*127) + 1;
			var ph1=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+1);
			var ph2=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+5);
			var wa1=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+2);
			var wa2=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+6);
			wa1 = (wa1<0.5) ? (8 - 14*wa1) : (2 - 2*wa1);
			wa2 = (wa2<0.5) ? (8 - 14*wa2) : (2 - 2*wa2);
			var ga1=2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+3)-1;
			var ga2=2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+7)-1;
	
			var div=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+8);
			div = Math.floor((Math.pow(100, div) - 1)*0.01010101010101010101010101010101*127) + 1;
	
			var ym = gh/div;
			var y=gy;
			outlet(1,"frgb",38,28,4);
			for(var i=0;i<div;i++){
				outlet(1,"moveto",gx,y);
				outlet(1,"lineto",gx+gw,y);
				y+=ym;
			}
	
			var bar=voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list+9);
			bar = Math.floor((Math.pow(100, bar) - 1)*0.01010101010101010101010101010101*127) + 1;
	
			//cu=voice_data_buffer.peek(1, MAX_DATA*v_list[0]);
			var xm = 1/gw;
			var i=0;
			var tot=[];
			var v=ga1*Math.pow(((((i*xm)+ph1)*ra1)%1),wa1);
			outlet(1,"moveto",gx,gy+gh*((9.999999999-v)%1));
			tot[0]=v;
			outlet(1,"frgb",80,35,0);
			for(var i=1;i<gw;i+=1){
				v=ga1*Math.pow(((((i*xm)+ph1)*ra1)%1),wa1);
				outlet(1,"lineto",gx+i,gy+gh*((9.999999999-v)%1));
				tot[i]=v;
			}
			i=0;
			v = ga2*Math.pow(((((i*xm)+ph2)*ra2)%1),wa2);
			tot[0]+=v;
			outlet(1,"moveto",gx,gy+gh*((9.999999999-v)%1));
			outlet(1,"frgb",77,45,0);
			for(i=1;i<gw;i+=1){
				v = ga2*Math.pow(((((i*xm)+ph2)*ra2)%1),wa2);
				outlet(1,"lineto",gx+i,gy+gh*((9.999999999-v)%1));
				tot[i]+=v;
			}
			outlet(1,"frgb",180,55,20);
			var ov=(10+tot[tot.length-1]*div)%1;
			var xing=[];
			var act="moveto";
			for(ii=0;ii<=gw;ii+=1){
				i=ii%gw;
				outlet(1,act,gx+i,gy+gh*((9.999999999-tot[i])%1));
				v=(10+tot[i]*div)%1;
				if((v<ov)&&((ov-v)>0.8)) xing.push([gx+i,gy+gh*Math.ceil(div*((9.999999999-tot[i])%1))/div]);
				if((v>ov)&&((v-ov)>0.8)) xing.push([gx+i,gy+gh*Math.floor(div*((9.999999999-tot[i])%1))/div]);
				ov=v;
				act="lineto";
			}
			for(i=0;i<xing.length;i++){
				outlet(1,"paintrect",xing[i][0]-1,xing[i][1]-1,xing[i][0]+1,xing[i][1]+1,255,255,255);
				outlet(1,"moveto",xing[i][0],gy+gh+3);
				outlet(1,"lineto",xing[i][0],gy+gh+unit);
			}
		}
	}
}

var forceevery = 10;
function update(){
	forceevery--;
	if(forceevery>0){
		drawcurves(0);
	}else{
		drawcurves(1);
		forceevery = 30;
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = voicemap.get(block);
		if(Array.isArray(v_list)) v_list = v_list[0];
	}
//		vcol[i] = config.get("palette::gamut["+i*20+"]::colour");
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