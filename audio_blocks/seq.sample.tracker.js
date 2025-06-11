var MAX_DATA = 16384;
var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;
var MAX_WAVES = 16;
var MAX_WAVES_SLICES = 1024;
var MAX_PATTERN_LENGTH = 128;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var blockcolour = [128,128,128];
var width, height,x_pos,y_pos,unit,sx,rh,cw,maxl,showcols;
var block=-1;
var display_row_offset = 0;
var display_col_offset = 0;
var currentwave=0;
var currentslice=0;
var currentvel=100;
var cursorx=0;
var cursorx2=0;
var cursory=0;
var s=[];
var l=[];
var l_on=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var pattern=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var baseoct=4;
var mini=0;
var drawflag=0;
var namelist;
var note_names = new Array(128);
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var waves_dict = new Dict;
waves_dict.name = "waves";
var copy = new Dict;
copy.name = "copy";
var v_list = [];
var keymap = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 28, -1, 14, 16, -1, 19, 21, 23, -1, 26, -1, -1, -1, 31, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 30, -1, 32, -1, -1, -1, -1, 8, 5, 4, 17, -1, 7, 9, 25, 11, -1, -1, 12, 10, 27, 29, 13, 18, 2, 20, 24, 6, 15, 3, 22, 1, -1, -1, -1, -1, -1];
var fx_names = ["Arpeggio", "B", "Cut", "Delay", "E", "Fade", "retriGger", "Hold", "I", "Jump", "K", "L", "harMonic", "N", "Offset", "Pitchslide UP", "Qitchslide down", "Ramp", "Sometimes", "porTamento", "hUrry", "reVerse", "daWdle", "X", "Y", "Z"];
var fx_descs = ["chiptune style arpeggio, the values are [note1][note2][rate] or [note1][rate]",
".",
"stops the sample playback partway through the row, value is % of a row","actions the row slightly late, value is % of a row ",
".",
"fades the volume down linearly (see also: Ramp), value is how far it goes down in 1 row.",
"does a roll, [rate][volume incdec] or [rate][volume incdec][pitch incdec] incdec values 5 = static, 0 = decreases fast 9 = increases fast",
"holds playback at a point using the timestretch",
".",
"to random octave. [-ve range][+ve range] or [+ve range]",
".",".",
"multiplies the playback rate by this integer. numbers >100 are treated as negative",
".",
"starts playback after the slice marker by this offset (in % of a slice)",
"slides pitch up (see also Qitchslide down)",
"slides pitch down",
"ramps the volume up linearly (see also: Fade)",
"not probability based - uses a counter instead, you set the increment amount and when it wraps (at 128) the note plays. increment amount = 128 means play every time, = 1 means play every 128 times. the counter is per-column of the tracker.",
"slides the existing sample to the note rather than retriggering",
"use timestretch to play the sample faster",
"1 = reverse playback, 0=forward",
"use timestretch to play the sample slower (see also hurry)",
".",".","."];
var cursors = new Array(128); //holds last drawn position of playheads (per row)
var sel_sx,sel_sx2,sel_sy,sel_ex=-1,sel_ex2,sel_ey=-1;

//data format: for each voice the buffer holds:
// 0 - start (*128)
// 1 - length (*128+1)
// 2 - playhead position (updated by player voice)
// 3-131? data values
function setup(x1,y1,x2,y2,sw,mode){ 
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	MAX_WAVES = config.get("MAX_WAVES");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	showcols=Math.floor(2*width/height);
	if(mode=="mini"){ 
		mini=1;
		showcols = v_list.length;		
	}else{
		mini=0;
	}
	unit = height / 18;
	display_row_offset = 0;
	display_col_offset = 0;
	cursorx=0;
	cursorx2=0;
	cursory=0;
	baseoct=4;
	currentwave=0;
	currentslice=0;
	currentvel=100;
	namelist = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	for(i=0;i<128;i++){
		note_names[i] = namelist[i%12]+(Math.floor(i/12)-2);
	}
	if(block>=0){
		v_list = map.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		draw();
	}
}
function draw(){
	if(block>=0){
		drawflag=0;
		outlet(1,"paintrect",x_pos,y_pos,width+x_pos,height+y_pos,0,0,0);
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
				l[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2)*127.999)+1;
				s[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1)*127.999);
				cursors[c] = Math.floor((l[c]+s[c])*voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
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
		var tl  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2)*127.999)+1;
		var ts  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1)*127.999);
		var e = tl+ts;
		ph = Math.floor(e*voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
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

function draw_fx_hint(fx){
	outlet(1,"moveto",3+sx+0.75*cw+x_pos,rh*0.75+y_pos);
	outlet(1,"textface","bold");
	outlet(1,"write",fx_names[fx]);
	var x=3+sx+1*cw+x_pos;
	var str=fx_descs[fx].split(" ");
	var ws = "";
	var y=rh*0.75+y_pos;
	var xx = x;
	for(var i=0;i<str.length;i++){
		ws = ws + " " + str[i];
		xx += str[i].length * unit * 0.27;
		if((xx>(x_pos+width))||(i==str.length-1)){
			//post("\n\n\nxx is ",xx,"x+w is",x_pos+width);
			outlet(1,"moveto",x,y);
			outlet(1,"write",ws);
			ws="";
			xx=x;
			y+=rh*0.7;
		}
	}
}

function draw_wave_hint(wave,slice){
	if(waves_dict.contains("waves["+(1+wave)+"]::name")){
		outlet(0, "custom_ui_element","waveform_slice_highlight",3+sx+0.75*cw+x_pos, y_pos, -9+width+x_pos, sy+y_pos,blockcolour[0]*1.1,blockcolour[1]*1.1,blockcolour[2]*1.1,block,wave+1,-slice); 
	} 
}

function mouse(x,y,lb,sh,al,ct,scr){
	var ox = cursorx;
	var oy = cursory;
	var clickx = (x-sx-x_pos)/cw;
	clickx += display_col_offset;
	var clickx2 = Math.floor((clickx % 1)*6);
	var clicky = Math.floor((y-sy-y_pos)/rh);
	clicky += display_row_offset;
	
	if(scr!=0){
		if((clickx<0)||(clickx>v_list.length)||(clicky<display_row_offset)||(clicky>maxl+display_row_offset)){
			if(sh==0){
				if(scr<0){
					cursory++;
					if(cursory>511) cursory=511;
				}else{
					cursory--;
					if(cursory<0)cursory=0;
				}
			}else{
				if(scr<0){
					cursorx2++;
					if(cursorx2>5){
						cursorx2=0;
						cursorx=(cursorx+1)%v_list.length;
					}
				}else{
					cursorx2--;
					if(cursorx2<0){
						cursorx2=5;
						cursorx=(cursorx+v_list.length-1)%v_list.length;
					}
				}			
			}
		}else{
			cursorx2 = clickx2;
			cursorx = Math.min(v_list.length-1,Math.floor(clickx));	
			cursory = clicky;
			if(sel_ex==-1){
				var v = voice_data_buffer.peek(1,MAX_DATA*v_list[cursorx]+cursorx2+1+6*((cursory+MAX_PATTERN_LENGTH*pattern[cursorx])));
				if(v>0){
					if(scr>0){
						v++;
					}else{
						v--;
						if(v<1)v=1;
					}
					voice_data_buffer.poke(1,MAX_DATA*v_list[cursorx]+cursorx2+1+6*((cursory+MAX_PATTERN_LENGTH*pattern[cursorx])),v);
					drawflag=1;
				}
			}
			if((cursorx>=sel_sx)&&(cursorx2>=sel_sx2)&&(cursorx<=sel_ex)&&(cursorx2<=sel_ex2)&&(cursory>=sel_sy)&&(cursory<=sel_ey)){
				//youve scrolled on a value in a selected area, change them all
				for(var tx=sel_sx;tx<=sel_ex;tx++){
					var tx2 = clickx2;
					if(((tx==sel_sx)&&(tx2>=sel_sx2))||(tx>sel_sx)){
						if(((tx==sel_ex)&&(tx2<=sel_ex2))||(tx<sel_ex)){
							for(var ty=sel_sy;ty<=sel_ey;ty++){
								var v = voice_data_buffer.peek(1,MAX_DATA*v_list[tx]+tx2+1+6*((ty+MAX_PATTERN_LENGTH*pattern[tx])));
								if(v>0){
									if(scr>0){
										v++;
									}else{
										v--;
										if(v<1)v=1;
									}
									voice_data_buffer.poke(1,MAX_DATA*v_list[tx]+tx2+1+6*((ty+MAX_PATTERN_LENGTH*pattern[tx])),v);
								}
							}
						}
					}
				}
				drawflag=1;
			}else{
				var v = voice_data_buffer.peek(1,MAX_DATA*v_list[cursorx]+clickx2+1+6*(clicky+display_row_offset+MAX_PATTERN_LENGTH*pattern[tx]));
				if(v>0){
					if(scr>0){
						v++;
					}else{
						v--;
						if(v<0)v=0;
					}
					voice_data_buffer.poke(1,MAX_DATA*v_list[cursorx]+clickx2+1+6*(clicky+display_row_offset+MAX_PATTERN_LENGTH*pattern[tx]),v);
					drawflag=1;
				}
			}
		}
	}else if(lb){
		if(sh){
			sel_sx = cursorx;
			sel_sx2 = cursorx2;
			sel_sy = cursory;
			cursorx2 = clickx2;
			cursorx = Math.min(v_list.length-1,Math.floor(clickx));	
			cursory = clicky;
			sel_ex = cursorx;
			sel_ex2 = cursorx2;
			sel_ey = cursory;
			if(sel_ey<sel_sy){
				var t = sel_sy;
				sel_sy = sel_ey;
				sel_ey = t;
			}
			if(sel_sx>sel_ex){
				var t = sel_sx;
				var t2 = sel_sx2;
				sel_sx = sel_ex;
				sel_sx2 = sel_ex2;
				sel_ex = t;
				sel_ex2 = t2;
			}
			drawflag=1;
		}else{		
	/*		cursorx = (x-sx-x_pos)/cw;
			cursorx += display_col_offset;
			cursorx2 = Math.floor((cursorx % 1)*6);
			cursorx = Math.min(v_list.length-1,Math.floor(cursorx));	
			cursory = Math.floor((y-sy-y_pos)/rh);
			cursory += display_row_offset;*/
			cursory = clicky;
			cursorx2 = clickx2;
			sel_ex=-1;
			sel_ey=-1;
			cursorx = Math.min(v_list.length-1,Math.floor(clickx));	
			drawflag=1;
		}
	}
	var df=0;
	if(lb==0){
		if(cursory-display_row_offset>30){
			display_row_offset=cursory-30;
			df=1;
		}else if(cursory-display_row_offset<5){
			display_row_offset=Math.max(0,cursory-5);
			df=1;
		}
		if(cursorx-display_col_offset<1){
			display_col_offset=Math.max(0,cursorx-1);
			df=1;
		}else if(cursorx-display_col_offset>=showcols-2){
			display_col_offset=cursorx-showcols+2;
			df=1;
		}
	}
	if(df){
		drawflag=1;
		if(cursorx!=ox)	messnamed("to_blockmanager","select_voice",cursorx,0);
	}else{
		if((cursorx!=ox)||(cursory!=oy)){
			drawcell(ox-display_col_offset,oy-display_row_offset);
		}
		if(cursorx!=ox)	messnamed("to_blockmanager","select_voice",cursorx,0);
		drawcell(cursorx-display_col_offset,cursory-display_row_offset);		
	}
}


function copy_selection(){
	var col=0;
	var column_contents=[];
	if(sel_ex!=-1){
		for(var tx=0;tx<=v_list.length;tx++){
			for(var tx2=0;tx2<6;tx2++){
				if(((tx==sel_sx)&&(tx2>=sel_sx2)||(tx>sel_sx))){
					if(((tx==sel_ex)&&(tx2<=sel_ex2))||(tx<sel_ex)){
						column_contents[col] = [];
						for(var i=sel_sy;i<=sel_ey;i++){
							column_contents[col][i-sel_sy] = voice_data_buffer.peek(1, MAX_DATA*v_list[tx]+1+6*(i+MAX_PATTERN_LENGTH*pattern[tx])+tx2);
						}
						col++;
					}
				}
			}
		}
	}else{
		return 0;
	}
	if(col){
		copy.setparse("data","{}");
//		copy.replace("data::columns",col);
		copy.setparse("data::column_contents","[ * ]");
		for(var i =0;i<col;i++){
			copy.setparse("data::column_contents::"+i, "[ * ]");
			copy.replace("data::column_contents::"+i,column_contents[i]);
		}
	}
}

function paste_columns(){
	if(copy.contains("data::column_contents")){
		var td = copy.get("data::column_contents");
		var cols = td.getkeys();
		var tx=cursorx;
		var tx2=cursorx2;
		for(var i=0;i<cols.length;i++){
			var ty=cursory;
			var col = td.get(cols[i]);
			for(y=0;y<col.length;y++){
				voice_data_buffer.poke(1, MAX_DATA*v_list[tx]+1+6*(ty+MAX_PATTERN_LENGTH*pattern[tx])+tx2,col[y]);
				ty++;
			}
			tx2++;
			if(tx2>5){
				tx++;
				tx2=0;
				if(tx>=v_list.length) i=999999999;
			}
		}
		drawflag=1;
	}
}

function delete_selection(){
	if(sel_ex==-1){
		for(i=cursory;i<127;i++){
			var rowvalues;
			if(i<126){
				rowvalues = voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+1+6*(i+1+MAX_PATTERN_LENGTH*pattern[cursorx]),6);
			}else{
				rowvalues = [0,0,0,0,0,0];
			}
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(i+MAX_PATTERN_LENGTH*pattern[cursorx]),rowvalues);
		}
	}else{
		for(i=sel_sy;i<=sel_ey;i++){
			for(var tx=0;tx<=v_list.length;tx++){
				for(var tx2=0;tx2<6;tx2++){
					if(((tx==sel_sx)&&(tx2>=sel_sx2)||(tx>sel_sx))){
						if(((tx==sel_ex)&&(tx2<=sel_ex2))||(tx<sel_ex)){
							voice_data_buffer.poke(1, MAX_DATA*v_list[tx]+1+6*(i+MAX_PATTERN_LENGTH*pattern[tx])+tx2,0);
						}
					}
				}
			}
		}
	}
	drawflag=1;
}

function keydown(key){
	var ox = cursorx;
	var oy = cursory;
	switch(key){
		case -15:
			cursorx=0;
			cursorx2=0;
			cursory=0;
			messnamed("to_blockmanager","select_voice",cursorx,0);
			break;
		case -9:
			cursory=(cursory+127) & 127;
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -10:
		case -4:
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			cursory=(cursory+1) & 127;
			break;
		case -11:
			cursorx2--;
			if(cursorx2<0){
				cursorx2=5;
				cursorx=(cursorx+v_list.length-1)%v_list.length;
				messnamed("to_blockmanager","select_voice",cursorx,0);
			}
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -12:
			cursorx2++;
			if(cursorx2>5){
				cursorx2=0;
				cursorx=(cursorx+1)%v_list.length;
				messnamed("to_blockmanager","select_voice",cursorx,0);
			}
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -13:
			cursory -= 16;
			if(cursory<0) cursory=0;
			break;
		case -14:
			cursory += 16;
			if(cursory>127) cursory=127;
			break;
		case 500:
			if(sel_ex==-1){
				sel_ex=cursorx;
				sel_sx=cursorx;
				sel_ex2=cursorx2;
				sel_sx2=cursorx2;
				sel_ey=cursory;
				sel_sy=cursory;
			}
			if(sel_ex==cursorx){
				cursorx2++;
				if(cursorx2>5){
					cursorx2=0;
					cursorx=(cursorx+1)%v_list.length;
				}
				sel_ex2 = cursorx2;
				sel_ex = cursorx;
			}else if(sel_sx==cursorx){
				cursorx2++;
				if(cursorx2>5){
					cursorx2=0;
					cursorx=(cursorx+1)%v_list.length;
				}
				sel_sx2 = cursorx2;
				sel_sx = cursorx;
			}
			break;
		case 501:
			if(sel_ex==-1){
				sel_ex=cursorx;
				sel_sx=cursorx;
				sel_ex2=cursorx2;
				sel_sx2=cursorx2;
				sel_ey=cursory;
				sel_sy=cursory;
			}
			if(sel_ex==cursorx){
				cursorx2--;
				if(cursorx2<0){
					cursorx2=5;
					cursorx=(cursorx+v_list.length-1)%v_list.length;
				}
				sel_ex2 = cursorx2;
				sel_ex = cursorx;
			}else if(sel_sx==cursorx){
				cursorx2--;
				if(cursorx2<0){
					cursorx2=5;
					cursorx=(cursorx+v_list.length-1)%v_list.length;
				}
				sel_sx2 = cursorx2;
				sel_sx = cursorx;
			}
			break;
		case 502:
			if(sel_ex==-1){
				sel_ex=cursorx;
				sel_sx=cursorx;
				sel_ex2=cursorx2;
				sel_sx2=cursorx2;
				sel_ey=cursory;
				sel_sy=cursory;
			}
			if(sel_ey==cursory){
				cursory=(cursory+1) & 127;
				sel_ey=cursory;
			}else if(sel_sy==cursory){
				cursory=(cursory+127) & 127;
				sel_sy==cursory;
			}
			drawflag=1;
			break;
		case 503:
			if(sel_ex==-1){
				sel_ex=cursorx;
				sel_sx=cursorx;
				sel_ex2=cursorx2;
				sel_sx2=cursorx2;
				sel_ey=cursory;
				sel_sy=cursory;
			}
			if(sel_ey==cursory){
				cursory=(cursory+127) & 127;
				sel_ey=cursory;
			}else if(sel_sy==cursory){
				cursory=(cursory+127) & 127;
				sel_sy==cursory;
			}
			drawflag=1;
			break;	
		case 108:
			baseoct++;
			if(baseoct>10)baseoct=10;
			drawflag=1;
			break;
		case 44:
			baseoct--;
			if(baseoct<0)baseoct=0;
			break;
		case 620:
			currentwave++;
			if(currentwave>128)currentwave=128;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+2,currentwave+1);
			drawflag=1;
			break;
		case 556:
			currentwave--;
			if(currentwave<0)currentwave=0;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+2,currentwave+1);
			drawflag=1;
			break;
		case 4716:
			currentslice++;
			if(currentslice>MAX_WAVES_SLICES)currentslice=MAX_WAVES_SLICES;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+3,currentslice+1);
			drawflag=1;
			break;
		case 4652:
			currentslice--;
			if(currentslice<0)currentslice=0;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+3,currentslice+1);
			drawflag=1;
			break;	
		case 6764:
			currentvel++;
			if(currentvel>128)currentvel=128;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+1,currentvel+1);
			drawflag=1;
			break;
		case 6700:
			currentvel--;
			if(currentvel<0)currentvel=0;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+1,currentvel+1);
			drawflag=1;
			break;
		case 46: // . is clear
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+cursorx2+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+1,0);
			drawflag=1;
			break;
		case 355:
			copy_selection();
			break;
		case 376:
			copy_selection();
			delete_selection();
			break;
		case 374:
			paste_columns();
			break;
		case -6:
		case -7:
			// del or delete
			delete_selection();
			drawflag=1;
			break;
		case -8:
			//insert
			for(i=MAX_PATTERN_LENGTH;i>cursory;i--){
				var rowvalues = voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+1+6*(i-1+MAX_PATTERN_LENGTH*pattern[cursorx]),6);
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(i+MAX_PATTERN_LENGTH*pattern[cursorx]),rowvalues);
			}
			var rowvalues=[0,0,0,0,0,0];
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx]),rowvalues);
			drawflag=1;
			break;
		case -7:
			if(cursorx2==0){
				var rowvalues=[0,0,0,0,0,0];
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx]),rowvalues);
			}else{
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+cursorx2,0);
			}
			drawflag=1;
			break;
		case 353: //ctl-a
			sel_sx=0;
			sel_sx2=0;
			sel_ex=v_list.length-1;
			sel_ex2=5;
			sel_sy=0;
			sel_ey=127;
			drawflag=1;
			break;
		case 361: //ctl-I (interpolate)
			if((sel_sy!=sel_ey)&&(sel_ey>-1)){
				var v1 = voice_data_buffer.peek(1, MAX_DATA*v_list[sel_sx]+1+6*(sel_sy+MAX_PATTERN_LENGTH*pattern[cursorx])+sel_sx2);
				var v2 = voice_data_buffer.peek(1, MAX_DATA*v_list[sel_ex]+1+6*(sel_ey+MAX_PATTERN_LENGTH*pattern[cursorx])+sel_ex2);
				if((v1>0)&&(v2>0)){
					for(i=sel_sy;i<=sel_ey;i++){
						voice_data_buffer.poke(1, MAX_DATA*v_list[sel_sx]+1+6*(i+MAX_PATTERN_LENGTH*pattern[cursorx])+sel_sx2,Math.floor((v2*i+v1*(sel_ey-i))/(sel_ey-sel_sy)));
					}
				}
			}
			break;
		case 364: //ctl-L (sel column)
			sel_sx=cursorx;
			sel_sx2=cursorx2;
			sel_ex=sel_sx;
			sel_ex2=sel_sx2;
			sel_sy=0;
			sel_ey=127;
			drawflag=1;
			break;
		default:
			if(cursorx2==0){
				if(key==49){
					var rowvalues=[-1,0,0,0];
					//post("off");
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx]),rowvalues);
				}else if(key>0){
					if(keymap[key]>-1){
						var rowvalues = [baseoct*12+keymap[key],currentvel+1,currentwave+1,currentslice+1];
						var t=voice_data_buffer.peek(1,MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+1);
						if(t>0) rowvalues[1]=t;
						t=voice_data_buffer.peek(1,MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+2);
						if(t>0) rowvalues[2]=t;
						t=voice_data_buffer.peek(1,MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+3);
						if(t>0) rowvalues[3]=t;
						voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx]),rowvalues);
					}
				}
				cursory=(cursory+1) & 127;
			}else if((cursorx2==1)||(cursorx2==3)||(cursorx2==5)){
				var t=key-48;
				if((t>=0)&&(t<10)){
					var o=voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+cursorx2)-1;
					if((o>0)&&(o<100)){
						o*=10;
						o+=t;
					}else{
						o=t;
					}
					if(cursorx2==1) currentvel = o |0;
					if(cursorx2==3) currentslice = (o-1) |0;
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+cursorx2,o+1);
				}
			}else if((cursorx2==2)){
				var t=key-48;
				if((t>=0)&&(t<10)){
					var o=voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+cursorx2)-1;
					if((o>0)&&(o<10)){
						o*=10;
						o+=t;
					}else{
						o=t;
					}
					if(cursorx2==2) currentwave = --o |0;
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+cursorx2,o+1);
				}
			}else if((cursorx2==4)){
				var t=key-96;
				//post("fx",t);
				if((t>=0)&&(t<=26)){					
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+6*(cursory+MAX_PATTERN_LENGTH*pattern[cursorx])+cursorx2,t+1);
				}
			}
			
			break;
	}
	if(cursory-display_row_offset>30){
		display_row_offset=cursory-30;
		drawflag=1;
	}else if(cursory-display_row_offset<5){
		display_row_offset=Math.max(0,cursory-5);
		drawflag=1;
	}
	if(cursorx-display_col_offset<=showcols){
		display_col_offset=Math.max(0,cursorx-1);
		drawflag=1;
	}else if(cursorx-display_col_offset>=showcols-1){
		display_col_offset=cursorx-showcols+1;
		drawflag=1;
	}
	if(!drawflag){
		if((cursorx!=ox)||(cursory!=oy)){
			drawcell(ox-display_col_offset,oy-display_row_offset);
		}
		drawcell(cursorx-display_col_offset,cursory-display_row_offset);		
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = map.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		blockcolour = blocks.get("blocks["+block+"]::space::colour");
		for(var i=0;i<3;i++)blockcolour[i] = Math.min(255,2*blockcolour[i]);
	}
	outlet(0,"request_waves_remapping","ui",v);
}

function voice_offset(){}

function loadbang(){
	outlet(0,"getvoice");
}

function quer(){
	post("vlist is",v_list);
}

function store(){
	messnamed("to_blockmanager","store_wait_for_me",block);
	var r;
	var transf_arr = new Array(MAX_DATA);
	for(r=0;r<v_list.length;r++){
		transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list[r], 16*MAX_PATTERN_LENGTH*6+10);
		var d = 0;
		while(d==0){
			d = transf_arr.pop();
		}
		transf_arr.push(d);
		//post("\nsaving, voice",v_list[r]," data has a length of ",transf_arr.length);
		blocks.replace("blocks["+block+"]::voice_data::"+r, transf_arr);
	}
	messnamed("to_blockmanager","store_ok_done",block);
}
function remapping_sizechange(froom,too){
	post("\nwavetable size change, not implemented",froom,too);
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
}