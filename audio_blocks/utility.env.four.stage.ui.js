outlets = 3;

var MAX_DATA = 16384;
var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;

var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var logexp_lookup = new Buffer("logexp");

var config = new Dict;
config.name = "config";
var blocks = new Dict;
blocks.name = "blocks";
var blockcolour = [128,128,128];
var vcol = [];

var width, height,x_pos,y_pos,rh;
var block=-1;
var mini=0;
var drawflag=0;

var map = new Dict;
map.name = "voicemap";

var envtimes = [];
var envlevels = [];
var envcurve = [];
var stages=4;
var envlength = [];
var longest;
var lowest = [];
var px = [], py = [];
var opx = [], opy = [];
var opxs = [], opxf = [];
var tf;
var midpt = [], rng = [];

function setup(x1,y1,x2,y2,sw,mode){ 
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	mini=(mode=="mini")|0;
	if(block>=0){
		voice_is(block);
		rh = Math.floor(height / v_list.length);
		draw();
	}
}

function update(){
	if(block>0){
		var change = getparams();
		if((change&1)||drawflag){
			draw();
		}else if(change>1){
			var c2=2;
			for(var c=0;c<v_list.length;c++){
				if(change&c2){
					efficientdraw(c);
				}
				c2*=2;
			}
		}
	}
}

function stagecount(s){
	stages = s;
	drawflag = 1;
}

function draw(){
	tf = width/longest; //length in pixels of 1 ms of envelope
	outlet(1,"paintrect",x_pos,y_pos,width+x_pos,height+y_pos,0,0,0);
	for(var c=0;c<v_list.length;c++){
		var prevlev=0;
		var x=x_pos+2;
		outlet(1,"frgb",48,48,48);
		outlet(1,"moveto",x_pos+width-2,y_pos+rh*c+midpt[c]*(rh-4));
		outlet(1,"lineto",x_pos,y_pos+rh*c+midpt[c]*(rh-4));
		outlet(1,"frgb",vcol[c]);

		for(var i=0;i<stages;i++){
			var ft = 1/(tf*envtimes[c][i]);
			for(var p=(i==0);p<(tf*envtimes[c][i]);p+=1){ //stage 0 starts from 1 as 0 is the moveto
				var pos = p* ft;
				var v;
				var cu = envcurve[c][i];
				if(envlevels[c][i]>prevlev) cu = 1-cu;
				if(cu<=0.5){
					v = 2 *(logexp_lookup.peek(1,Math.floor(8192+8192*pos)) * (0.5-cu) + cu*pos);
				}else{
					v = 2 *(logexp_lookup.peek(2,Math.floor(8192+8192*pos)) * (cu-0.5) + (1-cu)*pos);	
				}
				outlet(1,"lineto",x,y_pos+rh*c+(rh-4)*(midpt[c] - rng[c]*(prevlev+ (envlevels[c][i]-prevlev)*v)));
				x+=1;
			}
			x-=1;
			prevlev = envlevels[c][i];
		}
		py[c] = voice_data_buffer.peek(1,MAX_DATA*v_list[c]);
		px[c] = voice_data_buffer.peek(1,MAX_DATA*v_list[c]+1);
		var pxs = Math.floor(px[c]);
		var pxf = px[c]-pxs;
		x=0;
		for(i=0;i<pxs;i++){
			x+=envtimes[c][i];
		}
		x+=envtimes[c][pxs]*pxf;
		x*=tf;
		x+=x_pos;
		var y = y_pos + rh*c + (rh-4)*(midpt[c]-rng[c]*py[c]);
		//outlet(1,"frgb",vcol[c]);
		outlet(1,"paintrect",x-2,y-2,x+2,y+2,255,255,255);
		opx[c] = x;
		opy[c] = y;
		opxs[c] = pxs;
		opxf[c] = pxf;
	}
	drawflag=0;
}

function efficientdraw(c){
	outlet(1,"paintrect",opx[c]-2,opy[c]-2,opx[c]+2,opy[c]+2,0,0,0);
	var pxs = Math.floor(px[c]);
	var pxf = px[c]-pxs;
	var x=0; var x2=0; var x3=0;
	for(var i=0;i<stages;i++){
		x+=envtimes[c][i];
		if(i<pxs) x2=x;
		if(i<opxs[c]) x3=x;
	}
	x=x_pos+x3*tf;
	outlet(1,"frgb",vcol[c]);

	var i = opxs[c];
	var prevlev = (i>0)?envlevels[c][i-1] : 0;
	var ft = 1/(tf*envtimes[c][i]);
	var m="moveto";
	var y;
	for(var p=(i==0);p<(tf*envtimes[c][i]);p+=2){ //stage 0 starts from 1 as 0 is the moveto
		if((x>opx[c]-4)&&(x<opx[c]+4)){
			var pos = p* ft;
			var v;
			var cu = envcurve[c][i];
			if(envlevels[c][i]>prevlev) cu = 1-cu;
			if(cu<=0.5){
				v = 2 *(logexp_lookup.peek(1,Math.floor(8192+8192*pos)) * (0.5-cu) + cu*pos);
			}else{
				v = 2 *(logexp_lookup.peek(2,Math.floor(8192+8192*pos)) * (cu-0.5) + (1-cu)*pos);	
			}
			y = y_pos+rh*c+(rh-4)*(midpt[c] - rng[c]*(prevlev+ (envlevels[c][i]-prevlev)*v));
			if((y>opy[c]-4)&&(y<opy[c]+4)){
				outlet(1,m,x,y);
				m="lineto";
			}
		}
		x+=2;
	}
	x=x2;
	x+=envtimes[c][pxs]*pxf;
	x*=tf;
	x+=x_pos;
	y = y_pos + rh*c + (rh-4)*(midpt[c]-rng[c]*py[c]);
	//outlet(1,"frgb",vcol[c]);
	outlet(1,"paintrect",x-2,y-2,x+2,y+2,255,255,255);
	opx[c] = x;
	opy[c] = y;
	opxs[c] = pxs;
}

function getparams(){
	var nostring="";
	var change = 0;
	longest = 0;
	var c2=2;
	for(var c=0;c<v_list.length;c++){
		lowest[c]=-0.1;
		for(var i=0;i<stages;i++){
			var l = 2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+i)-1;
			change |= (l != envlevels[c][i]);
			envlevels[c][i] = l;
			if(l<lowest[c])lowest[c]=l;
		}
		var rang = 1.01 - lowest[c];
		midpt[c] = 1 + (lowest[c]/rang);
		rng[c] = 1/rang;
		var tt=0;
		for(var i=0;i<stages;i++){
			var t = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+i+stages*2);
			var t = (Math.pow(1000, t) - 1+0.0000000001)*60.06006006006006006006006006006;
			change |= (t != envtimes[c][i]);
			envtimes[c][i] = t;
			tt+=t;
		}
		envlength[c]=tt;
		longest = Math.max(tt,longest);
		for(var i=0;i<stages;i++){
			var l = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+i+stages*4);
			change |= (l != envcurve[c][i]);
			envcurve[c][i] = l;
		}
		/*var r = voice_data_buffer.peek(1,MAX_DATA*v_list[c]);
		if((((rh-4)*rng[c])*Math.abs(r-py[c])>1)){
			change |= c2;
			py[c] = r;
		}*/ //save effort, just check for change of x pos as y wont change unless y does (except rare circumstances we don't care about)
		py[c] = voice_data_buffer.peek(1,MAX_DATA*v_list[c]);
		var r = voice_data_buffer.peek(1,MAX_DATA*v_list[c]+1);
		var rr=Math.floor(r);
		rr = (rr==-1) ? 1 : rr;
		if(((tf*envtimes[c][rr])*Math.abs(r-px[c])>1)){
			change |= c2;
			px[c] = r;
		}
		c2*=2;
	}
	return change;
}

function mouse(x,y,lb,sh,al,ct,scr){
}
function keydown(key){
}
function voice_is(v){
	block = v;
	if(block>=0){
		v_list = map.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		blockcolour = blocks.get("blocks["+block+"]::space::colour");
		for(var i=0;i<3;i++)blockcolour[i] = Math.min(255,2*blockcolour[i]);
		for(var i=0;i<v_list.length;i++){
			envlevels[i]=[];
			envcurve[i]=[];
			envtimes[i]=[];
			vcol[i] = config.get("palette::gamut["+((i*20) % config.getsize("palette::gamut"))+"]::colour");
		}
		tf = width/longest; //length in pixels of 1 ms of envelope
	}
}

function loadbang(){
	outlet(0,"getvoice");
}

function voice_offset(){}
function store(){}
function enabled(){}