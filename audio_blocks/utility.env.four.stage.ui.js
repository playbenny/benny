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

function setup(x1,y1,x2,y2,sw){ 
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	if(width<sw*0.5){ 
		mini=1;
	}else{
		mini=0;
	}
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
		}else if(change&2){
			var c2=2;
			for(var c=0;c<v_list.length;c++){
				if(change&c2) efficientdraw(c);
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
			for(var p=(i==0);p<(tf*envtimes[c][i]);p+=2){ //stage 0 starts from 1 as 0 is the moveto
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
				x+=2;
			}
			x-=2;
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
		if(((tf*envtimes[c][Math.floor(r)])*Math.abs(r-px[c])>1)){
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
	}
}

function loadbang(){
	outlet(0,"getvoice");
}

function voice_offset(){}
function store(){}
function enabled(){}


/*

		var c,r,i,rr,rc;
		for(i=0;i<v_list.length;i++) {
			cursors[i]=-1;
		}
		i= showcols; 
		rh = 0.5*unit;
		sy = 1.2*unit;
		sx = 1.2*unit;
		cw = (width - sx)/i;
		maxl = Math.floor((height-sy)/rh);
		if(!mini){
			outlet(1,"paintrect",x_pos+sx,y_pos,x_pos+width,sy+y_pos,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
			outlet(1,"frgb",blockcolour);
			outlet(1,"moveto",3+sx+x_pos,rh*0.75+y_pos);
			outlet(1,"write","octave");
			outlet(1,"moveto",3+sx+x_pos,rh*1.45+y_pos);
			outlet(1,"write",baseoct-2);
			outlet(1,"moveto",3+sx+0.2*cw+x_pos,rh*0.75+y_pos);
			outlet(1,"write","vel");
			outlet(1,"moveto",3+sx+0.2*cw+x_pos,rh*1.45+y_pos);
			outlet(1,"write",currentvel);
			outlet(1,"moveto",3+sx+0.4*cw+x_pos,rh*0.75+y_pos);
			outlet(1,"write","wave");
			outlet(1,"moveto",3+sx+0.4*cw+x_pos,rh*1.45+y_pos);
			outlet(1,"write",(1+currentwave));
			if(waves_dict.contains("waves["+(1+currentwave)+"]::name")){
				var wnam = waves_dict.get("waves["+(1+currentwave)+"]::name");
				outlet(1,"moveto",3+sx+0.4*cw+x_pos,rh*2.15+y_pos);
				var wns = wnam.split(".");
				wns.length -= 1;
				var wn = wns[0];
				for(i=1;i<wns.length;i++){
					wn=wn+"."+wns[i];
				}
				outlet(1,"write",wn);
			}
			outlet(1,"moveto",3+sx+0.55*cw+x_pos,rh*0.75+y_pos);
			outlet(1,"write","slice");
			outlet(1,"moveto",3+sx+0.55*cw+x_pos,rh*1.45+y_pos);
			outlet(1,"write",currentslice);
			if(cursorx2<4) draw_wave_hint(currentwave,currentslice);
			for(c=display_col_offset;c<Math.min(display_col_offset+showcols,v_list.length);c++){
				cursors[c] = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
				l[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2)*127.999)+1;
				s[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1)*127.999);
				l_on[c] = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+3)
				pattern[c] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+11)*15.999);
				outlet(1,"moveto", 3+sx+cw*(c-display_col_offset)+x_pos, rh*2.15+y_pos);
				if(cursorx == c){
					outlet(1,"frgb",blockcolour);
				}else{
					outlet(1,"frgb",blockcolour[0]*0.5,blockcolour[1]*0.5,blockcolour[2]*0.5);
				}
				outlet(1,"write", "voice", c+1);
				for(r=0;r<maxl;r++){			
					drawcell((c-display_col_offset),r);
				}
			}
		}
		for(r=0;r<maxl;r++){			
			rr = r+display_row_offset;
			rc = ((rr%2)==0)+((rr%4)==0)+((rr%8)==0)+((rr%16)==0);
			rc = (4+rc)/24;
			
			outlet(1,"paintrect",x_pos,sy+rh*r+y_pos,sx-9+x_pos,sy+rh*(r+1)+y_pos,blockcolour[0]*rc,blockcolour[1]*rc,blockcolour[2]*rc);
			outlet(1,"moveto",3+x_pos,sy+rh*(r+0.75)+y_pos);
			if(!mini){
				outlet(1,"frgb",blockcolour);
				outlet(1,"write",rr);
			}
		}
		outlet(0,"custom_ui_element","mouse_passthrough",x_pos,sy+y_pos,width+x_pos,height+y_pos,0,0,0,block,0);
	}
}


function update(){
	if(drawflag){
		draw();
		return 0;
	}
	var c,o;
	for(c=display_col_offset;c<v_list.length;c++){
		ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
		var tl  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2)*127.999)+1;
		var ts  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1)*127.999);
		var to = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+3);
		var tp = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+11)*15.999);
		var d=0;
		if(tl!=l[c]){
			l[c]=tl;
			d=1;
		}
		if(ts!=s[c]){
			s[c]=ts;
			d=1;
		}
		if(to!=l_on[c]){
			l_on[c]=tl;
			d=1;
		}
		if(tp!=pattern[c]){
			pattern[c]=tp;
			d=1;
		}
		if(d){
			for(r=0;r<maxl;r++){			
				drawcell((c-display_col_offset),r);
			}
		}else if(cursors[c]!=ph){
			//l[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2)*128)+1;
			//s[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1)*128);
			o = cursors[c]-display_row_offset;
			cursors[c]=ph;
			//redraw cell that was old cursor
			if((o>=0)&&(o<maxl)){
				drawcell(c-display_col_offset,o);	
			}
			
			//draw new cursor cell
			o=cursors[c]-display_row_offset;
			if((o>=0)&&(o<maxl)){
				drawcell(c-display_col_offset,o);
			}
		}
	}
}


function drawcell(c,r){
	if((c>=0)&&(c<showcols)){
		var rr,rc,fc,i,ll,ss;
		var values;
		rr = r+display_row_offset;
		rc = ((rr%2)==0)+((rr%4)==0)+((rr%8)==0)+((rr%16)==0);
		rc = rc/24;
		fc = [blockcolour[0]*0.25,blockcolour[1]*0.25,blockcolour[2]*0.25];
		var lp=1;
		var cc=c+display_col_offset;
		if((rr>=s[cc])&&(rr<s[cc]+l[cc])){
			rc+=0.1;
			fc=[blockcolour[0],blockcolour[1],blockcolour[2]];
			if(l_on[cc]){
				fc[1]*=2.1;
				fc[0]*=1.7;
				fc[2]*=1.3;
				lp=1.5;
			}
		}
		if(cursors[cc]==rr){
			rc=(rc+0.3)*1.5;
			fc=[0,0,0];
		}
		if((rr>=sel_sy)&&(rr<=sel_ey)&&(cc>=sel_sx)&&(cc<=sel_ex)){
			var ts=0,te=1;
			if((cc==sel_sx)&&(sel_sx2>0)){
				ts=sel_sx2/6;
				outlet(1,"paintrect",sx+c*cw+x_pos,sy+rh*r+y_pos,sx+(c+ts)*cw+x_pos,sy+rh*(r+1)+y_pos,fc[0]*rc,fc[1]*rc*lp,fc[2]*rc);
			}
			if((cc==sel_ex)&&(sel_ex2<6)){
				te=(sel_ex2+1)/6;
				outlet(1,"paintrect",sx+(c+te)*cw+x_pos,sy+rh*r+y_pos,sx+(c+0.95)*cw+x_pos,sy+rh*(r+1)+y_pos,fc[0]*rc,fc[1]*rc*lp,fc[2]*rc);
			}
			var rc2 = rc + 0.2;
			outlet(1,"paintrect",sx+(c+0.95*ts)*cw+x_pos,sy+rh*r+y_pos,sx+(c+0.95*te)*cw+x_pos,sy+rh*(r+1)+y_pos,fc[0]*rc2,fc[1]*rc2*lp*0.5,255*rc2);
		}else{// all not
			outlet(1,"paintrect",sx+c*cw+x_pos,sy+rh*r+y_pos,sx+(c+0.95)*cw+x_pos,sy+rh*(r+1)+y_pos,blockcolour[0]*rc,blockcolour[1]*rc*lp,blockcolour[2]*rc);
		}

		outlet(1,"frgb",fc);
		values = voice_data_buffer.peek(1,MAX_DATA*v_list[(cc)]+1+6*(rr+MAX_PATTERN_LENGTH*pattern[cc]),6);
	//	post(values,"\n");
		var incell = ((cursorx==(cc))&&(cursory==rr));
		var x=0;
		var washighlight=0;
		for(i=0;i<6;i++){		
			//outlet(1,"write","... ... .. ... . ..");
			if(!mini){
				if(i==2){
					ll=2;
					ss="..";
				}else if(i==4){
					ll=1;
					ss=".";
				}else if(i==5){
					ll=3;
					ss="...";
				}else{
					ll=3;
					ss="...";
				}
				if(values[i]!=0){
					if(i==0){
						if(values[i]==-1){
							ss="off";
						}else{
							ss = note_names[values[i]-1];
						}
					}else if(i==4){
						ss = String.fromCharCode(63+values[i]);
					}else{
						ss = (values[i]-1);
						if(i==2) ss++;
						//if(i==3) ss++;
					}
				}
			}
			if(incell && (i==cursorx2)){
				outlet(1,"paintrect",sx+(c+(x-1)/20)*cw+x_pos,sy+rh*r+y_pos,sx+(c+(x+ll+1)/20)*cw+x_pos,sy+rh*(r+1)+y_pos,0,0,0);
				outlet(1,"frgb",255,255,255);
				if(!mini){
					washighlight=1;
					if((cursorx2>=4)&&(values[4]>1)){
						if(values[4]>1) draw_fx_hint(values[4]-2);
					}else if((cursorx2<4)){
						if(values[2]>0) draw_wave_hint(values[2]-1,values[3]-1);
					}
				}
			}else if(washighlight){
				washighlight=0;
				outlet(1,"frgb",fc);
			}
			if(!mini){
				if(i>0) ss = ("....." + ss).slice(-ll); 
				outlet(1,"moveto",sx+(c+x/20)*cw+3+x_pos,sy+rh*(r+0.75)+y_pos);
				outlet(1,"write",ss);
			}
			x+=ll+1;
		}
	}
}

function mouse(x,y,lb,sh,al,ct,scr){
}



function keydown(key){
	switch(key){
		case -15:
}
}


function remapping(froom,too){
	post("\nremapping_list "+froom +" -> "+too+" .. ");
	var cx,cy,cv,ct=0;
	for(cx=0;cx<v_list.length;cx++){
		for(cy=0;cy<128*16;cy++){
			cv = voice_data_buffer.peek(1, MAX_DATA*v_list[cx]+1+6*cy+2);
			if(cv==froom+1){
				voice_data_buffer.poke(1, MAX_DATA*v_list[cx]+1+6*cy+2,-(too+1));
				ct++;
			}
		}
	}
	post("remapped "+ct+" notes");
}
function finalise_remapping(){
	var cx,cy,cv;
	for(cx=0;cx<v_list.length;cx++){
		for(cy=0;cy<128*16;cy++){
			cv = voice_data_buffer.peek(1, MAX_DATA*v_list[cx]+1+6*cy+2);
			if(cv<0){
				voice_data_buffer.poke(1, MAX_DATA*v_list[cx]+1+6*cy+2,-cv);
			}
		}
	}
}

function enabled(v){
}*/