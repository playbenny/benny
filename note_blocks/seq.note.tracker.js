var MAX_DATA = 1024;
var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,unit,sx,rh,cw,maxl;
var block=-1;
var menucolour;
var display_row_offset = 0;
var display_col_offset = 0;
var currentvel=100;
var cursorx=0;
var cursorx2=0;
var cursory=0;
var baseoct=4;
var mini=0;
var drawflag=0;
var namelist;
var note_names = new Array(128);
var voicemap = new Dict;
voicemap.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var copy = new Dict;
copy.name = "copy";
var v_list = [];
var keymap = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 28, -1, 14, 16, -1, 19, 21, 23, -1, 26, -1, -1, -1, 31, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 30, -1, 32, -1, -1, -1, -1, 8, 5, 4, 17, -1, 7, 9, 25, 11, -1, -1, 12, 10, 27, 29, 13, 18, 2, 20, 24, 6, 15, 3, 22, 1, -1, -1, -1, -1, -1];
var cursors = new Array(128); //holds last drawn position of playheads (per row)
var start=[],lstart=[],end=[],lon=[],divs=[],offs=[];
var sel_sx,sel_sx2,sel_sy,sel_ex=-1,sel_ex2,sel_ey=-1;
//data format: for each voice the buffer holds:
// 0 - playhead position (updated by player voice)
// 1-1023 data values
function setup(x1,y1,x2,y2,sw){ 
	menucolour = config.get("palette::menu");
	mini=0;
	width = x2-x1;
	if(width<sw*0.6){ mini=1;}
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	showcols=Math.floor(5*width/height);
	unit = height / 18;
	display_row_offset = 0;
	display_col_offset = 0;
	cursorx=0;
	cursorx2=0;
	cursory=0;
	baseoct=4;
	currentvel=100;
	namelist = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	for(i=0;i<128;i++){
		note_names[i] = namelist[i%12]+(Math.floor(i/12)-2);
	}
	draw();
}
function draw(){
	if(block>=0){
		drawflag=0;
		var c,r,i,rr,rc;
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		for(i=0;i<v_list.length;i++) {
			cursors[i]=-1;
		}
		if(mini) showcols = v_list.length;
		i= showcols; //Math.min(4,Math.max(3,v_list.length));
		rh = 0.5*unit;
		sy = 1.2*unit*(mini==0);
		sx = 1.2*unit*(mini==0);
		cw = (width - sx)/(i-0.05);
		maxl = Math.floor((height-sy)/rh);
		outlet(1,"paintrect",x_pos,y_pos,width+x_pos,height+y_pos,menucolour[0]*0.1,menucolour[1]*0.1,menucolour[2]*0.1);
		//outlet(1,"paintrect",9+x_pos,9+y_pos,sx-9+x_pos,sy-9+y_pos,menucolour[0]*0.1,menucolour[1]*0.1,menucolour[2]*0.1);
		if(!mini){
			outlet(1,"font","Consolas",rh*0.8);
			outlet(1,"frgb",menucolour);
			outlet(1,"moveto",x_pos,rh*1.0+y_pos);
			outlet(1,"write","oct");
			outlet(1,"moveto",x_pos,rh*1.7+y_pos);
			outlet(1,"write",baseoct);
		}
		for(r=0;r<maxl;r++){			
			rr = r+display_row_offset;
			rc = ((rr%2)==0)+((rr%4)==0)+((rr%8)==0)+((rr%16)==0);
			rc = (4+rc)/24;
			
			outlet(1,"paintrect",x_pos,sy+rh*r+y_pos,sx-9+x_pos,sy+rh*(r+1)+y_pos,menucolour[0]*rc,menucolour[1]*rc,menucolour[2]*rc);
			if(!mini){
				outlet(1,"moveto",x_pos,sy+rh*(r+0.75)+y_pos);
				outlet(1,"frgb",menucolour);
				outlet(1,"write",rr);
			}
		}
		for(c=display_col_offset;c<Math.min(display_col_offset+showcols,v_list.length);c++){
			cursors[c] = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
			start[c]  = Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c],1));//TODOMath.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c])*512);
			lstart[c] = Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1,1));//Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]+1)*512)+1;
			end[c]  = lstart[c] + Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2,1));
			lon[c] = Math.floor(2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+3,1));
//			offs[c] =  Math.floor(1024*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+4,1)-512);
			divs[c] =  Math.floor(2 + 14*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+5,1));
//			post("c,ls,le,lo",c,lstart[c],end[c],lon[c]);
			if(!mini){
				if(cursorx == c){
					outlet(1,"frgb",menucolour);
				}else{
					outlet(1,"frgb",menucolour[0]*0.5,menucolour[1]*0.5,menucolour[2]*0.5);
				}
				outlet(1,"moveto", sx+cw*(c-display_col_offset+0.01)+x_pos, rh*1.0+y_pos);
				outlet(1,"write", "voice");
				outlet(1,"moveto", sx+cw*(c-display_col_offset+0.01)+x_pos, rh*1.7+y_pos);
				outlet(1,"write", c+1);
			}
			for(r=0;r<maxl;r++){			
				drawcell((c-display_col_offset),r);
			}
		}
		if(!mini){
			outlet(0,"custom_ui_element","mouse_passthrough",x_pos,sy+y_pos,width+x_pos,height+y_pos,0,0,0,block,0);
		}
		outlet(1,"bang");
	}
}

function update(){
	var c,o,ph;
	if(drawflag){
		draw();
		return 0;
	}
	for(c=display_col_offset;c<v_list.length;c++){
		ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
		t_start  = Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c],1));
		t_lstart = Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1,1));
		t_end  = t_lstart + Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2,1));
		t_lon =  Math.floor(2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+3,1));
//		offs[c] =  Math.floor(1024*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+4,1)-512);
		t_divs =  Math.floor(2 + 14*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+5,1));

		var d=0;
		if(t_start!=start[c]){
			start[c] = t_start;
			d = 1;
		}
		if(t_lstart!=lstart[c]){
			lstart[c] = t_lstart;
			d = 1;
		}
		if(t_end!=end[c]){
			end[c]=t_end;
			d = 1;
		}
		if(t_lon!=lon[c]){
			lon[c]=t_lon;
			d = 1;
		}
		if(t_divs != divs[c]){
			divs[c] = t_divs;
			d = 1;
		}
		if(d==1){
			for(r=0;r<maxl;r++){			
				drawcell((c-display_col_offset),r);
			}
		}else if(cursors[c]!=ph){
			o = cursors[c]-display_row_offset;
			cursors[c]=ph;
			//redraw cell that was old cursor
			if((o>=0)&&(o<maxl)){
				drawcell(c-display_col_offset,o);	
			}
			
			//draw new cursor cell
			o = cursors[c]-display_row_offset;
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
		var cc = c+display_col_offset;
		rr = r+display_row_offset;
		rc = ((rr%2)==0)+((rr%4)==0)+((rr%8)==0)+((rr%16)==0);
		rc = rc/24;
		fc = [menucolour[0]*0.25,menucolour[1]*0.25,menucolour[2]*0.25];
		var lp=1;
		if((rr>=start[cc])&&(rr<end[cc])){
			rc+=0.1;
			fc=[menucolour[0],menucolour[1],menucolour[2]];
			if((rr>=lstart[cc])&& lon[cc]){
				fc[1]*=1.3;
				fc[0]*=0.8;
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
				outlet(1,"paintrect",sx+c*cw+x_pos,sy+rh*r+y_pos,sx+(c+0.475)*cw+x_pos,sy+rh*(r+1)+y_pos,fc[0]*rc,fc[1]*rc*lp,fc[2]*rc);
				ts=0.5;
			}
			if((cc==sel_ex)&&(sel_ex2<1)){
				outlet(1,"paintrect",sx+(c+0.475)*cw+x_pos,sy+rh*r+y_pos,sx+(c+0.95)*cw+x_pos,sy+rh*(r+1)+y_pos,fc[0]*rc,fc[1]*rc*lp,fc[2]*rc);
				te=0.5;
			}
			var rc2 = rc + 0.2;
			outlet(1,"paintrect",sx+(c+0.95*ts)*cw+x_pos,sy+rh*r+y_pos,sx+(c+0.95*te)*cw+x_pos,sy+rh*(r+1)+y_pos,fc[0]*rc2,fc[1]*rc2*lp*0.5,255*rc2);
		}else{// all not
			outlet(1,"paintrect",sx+c*cw+x_pos,sy+rh*r+y_pos,sx+(c+0.95)*cw+x_pos,sy+rh*(r+1)+y_pos,menucolour[0]*rc,menucolour[1]*rc*lp,menucolour[2]*rc);
		}
		if(!mini){
			outlet(1,"frgb",fc);
			values = voice_data_buffer.peek(1,MAX_DATA*v_list[(cc)]+1+2*rr,2);
			var incell = ((cursorx==(cc))&&(cursory==rr));
			var x=0;
			var washighlight=0;
			for(i=0;i<2;i++){		
				ll=3;
				ss="...";
				if(values[i]!=0){
					if(i!=1){
						if(values[i]==-1){
							ss="off";
						}else{
							ss = note_names[values[i]-1];
						}
					}else{
						ss = Math.floor(values[i]-1);
					}
				}
				if(incell && (i==cursorx2)){
					outlet(1,"paintrect",sx+(c+(x)/7)*cw+x_pos,sy+rh*r+y_pos,sx+(c+(x+ll)/7)*cw+x_pos,sy+rh*(r+1)+y_pos,0,0,0);
					outlet(1,"frgb",255,255,255);
					washighlight=1;
				}else if(washighlight){
					washighlight=0;
					outlet(1,"frgb",fc);
				}
				ss = ("....." + ss).slice(-ll); 
				outlet(1,"moveto",sx+(c+x/7)*cw+3+x_pos,sy+rh*(r+0.75)+y_pos);
				outlet(1,"write",ss);
				x+=ll+1;
			}
		}else{
			values = voice_data_buffer.peek(1,MAX_DATA*v_list[(cc)]+1+2*rr,2);
			for(i=0;i<2;i++){
				if(values[i]!=0) outlet(1,"paintrect",sx+(c+(i*4)/7)*cw+x_pos,sy+rh*r+y_pos,sx+(c+(i*4+1)/7)*cw+x_pos,sy+rh*(r+1)+y_pos,fc);
			}
		}
	}
}

function mouse(x,y,lb,sh,al,ct,scr){
	var ox = cursorx;
	var oy = cursory;
	var xx = x-x_pos;
	var yy = y-y_pos;
	var clickx = (xx-sx)/cw;
	clickx += display_col_offset;
	var clickx2 = Math.floor((clickx % 1)*2);
	clickx = Math.floor(clickx);
	var clicky = Math.floor((yy-sy)/rh);

	if(scr!=0){
		if((clickx<0)||(clickx>v_list.length-1)||(clicky<0)||(clicky>maxl)){
			//outside cells, so scrolls
			if(sh==0){
				if(scr<0){
					cursory=(cursory+1);
					if(cursory>511)cursory=511;
				}else{
					cursory-=1;
					if(cursory<0)cursory=0;
				}
			}else{
				if(scr<0){
					cursorx2++;
					if(cursorx2>1){
						cursorx2=0;
						cursorx=(cursorx+1)%v_list.length;
					}
				}else{
					cursorx2--;
					if(cursorx2<1){
						cursorx2=5;
						cursorx=(cursorx+v_list.length-1)%v_list.length;
					}
				}			
			}
		}else{
			cursorx2 = clickx2;
			cursorx = Math.min(v_list.length-1,Math.floor(clickx));	
			cursory = clicky;
			if(((clickx>sel_sx)||((clickx==sel_sx)&&(clickx2>=sel_sx2)))&&((clickx<sel_ex)||((clickx==sel_ex)&&(clickx2<=sel_ex2)))&&(clicky>=sel_sy)&&(clicky<=sel_ey)){
				for(var tx=sel_sx;tx<=sel_ex;tx++){
					for(var ty=sel_sy;ty<=sel_ey;ty++){
						var ts=0;
						var te=2;
						if((tx==sel_sx)&&(sel_sx2>0)) ts=1;
						if((tx==sel_ex)&&(sel_ex2<1)) te=1;
						for(var tt=ts;tt<te;tt++){
							var v = voice_data_buffer.peek(1,MAX_DATA*v_list[tx]+tt+1+2*ty);
							if(v>0){
								if(scr>0){
									v++;
								}else{
									v--;
									if(v<0)v=0;
								}
								voice_data_buffer.poke(1,MAX_DATA*v_list[tx]+tt+1+2*ty,v);
							}
						}
					}
				}
			}else{
				var v = voice_data_buffer.peek(1,MAX_DATA*v_list[(clickx)]+clickx2+1+2*(clicky+display_row_offset));
				if(v>0){
					if(scr>0){
						v++;
					}else{
						v--;
						if(v<0)v=0;
					}
					voice_data_buffer.poke(1,MAX_DATA*v_list[clickx]+clickx2+1+2*(clicky+display_row_offset),v);
				}
			}
		}
	}else if(lb){
		//todo shift select, copy paste?
		if(sh){
			sel_sx = cursorx+display_col_offset;
			sel_sx2 = cursorx2;
			sel_sy = cursory+display_row_offset;
			cursorx2 = clickx2;
			cursorx = Math.min(v_list.length-1,Math.floor(clickx));	
			cursory = clicky;
			sel_ex = cursorx+display_col_offset;
			sel_ex2 = cursorx2;
			sel_ey = cursory+display_row_offset;
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
			//post("\nselection ",sel_sx,sel_ex,sel_sy,sel_ey,sel_sx2,sel_ex2);
			drawflag=1;
		}else{
			cursorx2 = clickx2;
			cursorx = Math.min(v_list.length-1,Math.floor(clickx));	
			cursory = clicky;
			sel_ex=-1;
			sel_ey=-1;
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
		}else if(cursorx-display_col_offset>showcols-1){
			display_col_offset=cursorx-1;
			df=1;
		}
	}
	if(df){
		if(cursorx!=ox)	messnamed("to_blockmanager","select_voice",cursorx,0);
		drawflag=1;
	}else{
		if((cursorx!=ox)||(cursory!=oy)){
			drawcell(ox-display_col_offset,oy-display_row_offset);
			if(cursorx!=ox)	messnamed("to_blockmanager","select_voice",cursorx,0);
		}
		drawcell(cursorx-display_col_offset,cursory-display_row_offset);		
	}
}
function keydown(key){
	var ox = cursorx;
	var oy = cursory;
	switch(key){
		case -15:
			cursorx=0;
			cursorx2=0;
			cursory=0;
			break;
		case -9:
			cursory=(cursory+511) & 511;
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -4://enter homes cursor and moves down
			cursorx2=0;
		case -10://arrow just moves down
			cursory=(cursory+1) & 511;
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -11:
			cursorx2--;
			if(cursorx2<0){
				cursorx2=1;
				cursorx=(cursorx+v_list.length-1)%v_list.length;
			}
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -12:
			cursorx2++;
			if(cursorx2>1){
				cursorx2=0;
				cursorx=(cursorx+1)%v_list.length;
			}
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
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
				if(cursorx2>1){
					cursorx2=0;
					cursorx=(cursorx+1)%v_list.length;
				}
				sel_ex2 = cursorx2;
				sel_ex = cursorx;
			}else if(sel_sx==cursorx){
				cursorx2++;
				if(cursorx2>1){
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
					cursorx2=1;
					cursorx=(cursorx+v_list.length-1)%v_list.length;
				}
				sel_ex2 = cursorx2;
				sel_ex = cursorx;
			}else if(sel_sx==cursorx){
				cursorx2--;
				if(cursorx2<0){
					cursorx2=1;
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
				cursory=(cursory+1) & 511;
				sel_ey=cursory;
			}else if(sel_sy==cursory){
				cursory=(cursory+511) & 511;
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
				cursory=(cursory+511) & 511;
				sel_ey=cursory;
			}else if(sel_sy==cursory){
				cursory=(cursory+511) & 511;
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
		case 61:
		case 573:
			currentvel++;
			if(currentvel>128)currentvel=128;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory+1,currentvel+1);
			drawflag=1;
			break;
		case 45:
			currentvel--;
			if(currentvel<0)currentvel=0;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory+1,currentvel+1);
			drawflag=1;
			break;
		case -6:
			//del
			if(sel_ex==-1){
				for(i=cursory;i<512;i++){
					var rowvalues;
					if(i<511){
						rowvalues = voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+1+2*(i+1),2);
					}else{
						rowvalues = [0,0];
					}
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*i,rowvalues);
				}
			}else{
				for(i=sel_sy;i<=sel_ey;i++){
					for(var tx=0;tx<=v_list.length;tx++){
						for(var tx2=0;tx2<2;tx2++){
							if(((tx==sel_sx)&&(tx2>=sel_sx2)||(tx>sel_sx))){
								if(((tx==sel_ex)&&(tx2<=sel_ex2))||(tx<sel_ex)){
									voice_data_buffer.poke(1, MAX_DATA*v_list[tx]+1+2*i+tx2,0);
								}
							}
						}
					}
				}
			}
			drawflag=1;
			break;
		case -8:
			//insert
			for(i=511;i>cursory;i--){
				var rowvalues = voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+1+2*(i-1),2);
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*i,rowvalues);
			}
			var rowvalues=[0,0];
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory,rowvalues);
			drawflag=1;
			break;
		case -7:
		case 46:
			if(cursorx2==0){
				var rowvalues=[0,0];
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory,rowvalues);
			}else{
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory+cursorx2,0);
			}
			cursory=(cursory+1) & 511;
			drawflag=1;
			break;
		case 353: //ctl-a
			sel_sx=0;
			sel_sx2=0;
			sel_ex=v_list.length-1;
			sel_ex2=1;
			sel_sy=0;
			sel_ey=511;
			drawflag=1;
			break;
		case 355: //ctl-c
			break;
			case 361: //ctl-I (interpolate)
			if((sel_sy!=sel_ey)&&(sel_ey>-1)){
				var v1 = voice_data_buffer.peek(1, MAX_DATA*v_list[sel_sx]+1+2*(sel_sy)+sel_sx2);
				var v2 = voice_data_buffer.peek(1, MAX_DATA*v_list[sel_ex]+1+2*(sel_ey)+sel_ex2);
				if((v1>0)&&(v2>0)){
					for(i=sel_sy;i<=sel_ey;i++){
						voice_data_buffer.poke(1, MAX_DATA*v_list[sel_sx]+1+2*i+sel_sx2,Math.floor((v2*i+v1*(sel_ey-i))/(sel_ey-sel_sy)));
					}
				}
			}
			break;
		case 364: //ctl-l
			sel_sx=cursorx;
			sel_sx2=cursorx2;
			sel_ex=sel_sx;
			sel_ex2=sel_sx2;
			sel_sy=0;
			sel_ey=511;
			drawflag=1;
			break;
		case 374: //ctl-v
		case 376: //ctl-x
		default:
			if(cursorx2!=1){
				if(key==49){
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory+cursorx2,-1);
				}else if(key==47){
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory+cursorx2,0);
				}else if(key>0){
					if(keymap[key]>-1){
						var t=voice_data_buffer.peek(1,MAX_DATA*v_list[cursorx]+1+2*cursory+1);
						if(t<=0) t = currentvel+1;
						voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory+cursorx2,baseoct*12+keymap[key]);
						voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory+1,t);
						//cursorx2=(cursorx2+1) & 1;
					}
				}
				cursory=(cursory+1) & 511;
			}else{
				var t=key-48;
				if((t>=0)&&(t<10)){
					var o=voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+1+2*cursory+cursorx2)-1;
					if(o<100){
						o*=10;
						o+=t;
					}else{
						o=t;
					}
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+1+2*cursory+cursorx2,o+1);
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
	if(cursorx-display_col_offset<=1){
		display_col_offset=Math.max(0,cursorx-1);
		drawflag=1;
	}else if(cursorx-display_col_offset>=showcols-1){
		display_col_offset=cursorx-1;
		drawflag=1;
	}
	if(drawflag){
		if(cursorx!=ox)	messnamed("to_blockmanager","select_voice",cursorx,0);
	}else{
		if((cursorx!=ox)||(cursory!=oy)){
			drawcell(ox-display_col_offset,oy-display_row_offset);
			if(cursorx!=ox)	messnamed("to_blockmanager","select_voice",cursorx,0);
		}
		drawcell(cursorx-display_col_offset,cursory-display_row_offset);		
	}
}

function voice_is(v){
	block = v;
	if(block>0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
//	post("seq.grid.ui loaded, block is",block);
}
function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}


function store(){
	var r;
	var transf_arr = new Array(MAX_DATA); //this isn't the shortest it possibly could be but i think we can handle it.
	for(r=0;r<v_list.length;r++){
		transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list[r], MAX_DATA);
		blocks.replace("blocks["+block+"]::voice_data::"+r, transf_arr);
	}
}