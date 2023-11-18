var MAX_DATA = 1024;
var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
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
var namelist;
var note_names = new Array(128);
var voicemap = new Dict;
voicemap.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var v_list = [];
var keymap = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 28, -1, 14, 16, -1, 19, 21, 23, -1, 26, -1, -1, -1, 31, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 30, -1, 32, -1, -1, -1, -1, 8, 5, 4, 17, -1, 7, 9, 25, 11, -1, -1, 12, 10, 27, 29, 13, 18, 2, 20, 24, 6, 15, 3, 22, 1, -1, -1, -1, -1, -1];
var cursors = new Array(128); //holds last drawn position of playheads (per row)
//data format: for each voice the buffer holds:
// 0 - start (*128)
// 1 - length (*128+1)
// 2 - playhead position (updated by player voice)
// 3-131? data values
function setup(x1,y1,x2,y2,sw){ 
//	post("drawing sequencers");
	menucolour = config.get("palette::menu");
	mini=0;
	width = x2-x1;
	if(width<500){ mini=1;}
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
	
	//post(block);
	draw();
}
function draw(){
	if(block>=0){
		var c,r,i,ph,rr,rc,fc;
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
			outlet(0,"setfontsize",rh*0.8);
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
			ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]+2));
			l  = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]+1)*512)+1;
			s  = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c])*512);
			
			outlet(0,"custom_ui_element","data_v_scroll",sx+cw*(c-display_col_offset+0.33)+x_pos, y_pos, sx+cw*(c-display_col_offset+0.64)+x_pos, sy-9+y_pos,menucolour[0],menucolour[1],menucolour[2],MAX_DATA*v_list[c]);
			outlet(0,"custom_ui_element","data_v_scroll",sx+cw*(c-display_col_offset+0.66)+x_pos, y_pos, sx+cw*(c-display_col_offset+0.96)+x_pos, sy-9+y_pos,menucolour[0],menucolour[1],menucolour[2],MAX_DATA*v_list[c]+1);
			if(!mini){
				outlet(1,"moveto", sx+cw*(c-display_col_offset+0.01)+x_pos, rh*1.0+y_pos);
				outlet(1,"write", "voice");
				outlet(1,"moveto", sx+cw*(c-display_col_offset+0.01)+x_pos, rh*1.7+y_pos);
				outlet(1,"write", c+1);
				outlet(1,"frgb", 0,0,0);
				outlet(1,"moveto", sx+cw*(c-display_col_offset+0.34)+x_pos, rh*1.0+y_pos);
				outlet(1,"write", "start");
				outlet(1,"moveto", sx+cw*(c-display_col_offset+0.34)+x_pos, rh*1.7+y_pos);
				outlet(1,"write", s);
				outlet(1,"moveto", sx+cw*(c-display_col_offset+0.67)+x_pos, rh*1.0+y_pos);
				outlet(1,"write", "length");
				outlet(1,"moveto", sx+cw*(c-display_col_offset+0.67)+x_pos, rh*1.7+y_pos);
				outlet(1,"write", l);
			}
			cursors[c]=ph;
			for(r=0;r<maxl;r++){			
				drawcell((c-display_col_offset),r);
			}
		}
		if(!mini){
			outlet(0,"custom_ui_element","mouse_passthrough",x_pos,sy+y_pos,width+x_pos,height+y_pos,block,0);
		}
		//outlet(1,"bang");
	}
}

function drawcell(c,r){
	if((c>=0)&&(c<showcols)){
		var rr,rc,fc,i,ll,ss;
		var values;
		rr = r+display_row_offset;
		rc = ((rr%2)==0)+((rr%4)==0)+((rr%8)==0)+((rr%16)==0);
		rc = rc/24;
		fc = [menucolour[0]*0.25,menucolour[1]*0.25,menucolour[2]*0.25];
		if((rr>=s)&&(rr<s+l)){
			rc+=0.1;
			fc=menucolour;
		}
		if(cursors[c]==rr){
			rc=(rc+0.3)*1.5;
			fc=[0,0,0];
		}
		outlet(1,"paintrect",sx+c*cw+x_pos,sy+rh*r+y_pos,sx+(c+0.95)*cw+x_pos,sy+rh*(r+1)+y_pos,menucolour[0]*rc,menucolour[1]*rc,menucolour[2]*rc);
		if(!mini){
			outlet(1,"frgb",fc);
			values = voice_data_buffer.peek(1,MAX_DATA*v_list[(c+display_col_offset)]+3+2*rr,2);
		//	post(values,"\n");
			var incell = ((cursorx==(c+display_col_offset))&&(cursory==rr));
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
			values = voice_data_buffer.peek(1,MAX_DATA*v_list[(c+display_col_offset)]+3+2*rr,2);
			for(i=0;i<2;i++){
				if(values[i]!=0) outlet(1,"paintrect",sx+(c+(i*4)/7)*cw+x_pos,sy+rh*r+y_pos,sx+(c+(i*4+1)/7)*cw+x_pos,sy+rh*(r+1)+y_pos,fc);
			}
		}
	}
}

function mouse(x,y,l,s,a,c,scr){
	var ox = cursorx;
	var oy = cursory;
	var xx = x-x_pos;
	var yy = y-y_pos;
	if(scr!=0){
		if(s==0){
			if(scr<0){
				cursory=(cursory+1) & 127;
			}else{
				cursory=(cursory+127) & 127;
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
		//todo shift select, copy paste?
		cursorx = (xx-sx)/cw;
		cursorx2 = Math.floor((cursorx % 1)*2);
		cursorx = Math.floor(cursorx);	
		cursory = Math.floor((yy-sy)/rh);
	}
	var df=0;
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
	}else if(cursorx-display_col_offset>1){
		display_col_offset=cursorx-1;
		df=1;
	}
	if(df){
		draw();
	}else{
		if((cursorx!=ox)||(cursory!=oy)){
			drawcell(ox-display_col_offset,oy-display_row_offset);
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
			break;
		case -4://enter homes cursor and moves down
			cursorx2=0;
		case -10://arrow just moves down
			cursory=(cursory+1) & 511;
			break;
		case -11:
			cursorx2--;
			if(cursorx2<0){
				cursorx2=1;
				cursorx=(cursorx+v_list.length-1)%v_list.length;
			}
			break;
		case -12:
			cursorx2++;
			if(cursorx2>1){
				cursorx2=0;
				cursorx=(cursorx+1)%v_list.length;
			}
			break;
		case 108:
			baseoct++;
			if(baseoct>10)baseoct=10;
			draw();
			break;
		case 44:
			baseoct--;
			if(baseoct<0)baseoct=0;
			break;
		case 61:
			currentvel++;
			if(currentvel>128)currentvel=128;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory+1,currentvel+1);
			draw();
			break;
		case 45:
			currentvel--;
			if(currentvel<0)currentvel=0;
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory+1,currentvel+1);
			draw();
			break;
		case -6:
			//optionally del could move everything up one?
			for(i=cursory;i<512;i++){
				var rowvalues = voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+3+2*(i+1),2);
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*i,rowvalues);
			}
			draw();
			break;
		case -8:
			//insert
			for(i=511;i>cursory;i--){
				var rowvalues = voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+3+2*(i-1),2);
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*i,rowvalues);
			}
			var rowvalues=[0,0];
			voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory,rowvalues);
			draw();
			break;
		case -7:
		case 46:
			if(cursorx2==0){
				var rowvalues=[0,0];
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory,rowvalues);
			}else{
				voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory+cursorx2,0);
			}
			draw();
			break;
		default:
			if(cursorx2!=1){
				if(key==49){
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory+cursorx2,-1);
				}else if(key==47){
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory+cursorx2,0);
				}else if(key>0){
					if(keymap[key]>-1){
						var t=voice_data_buffer.peek(1,MAX_DATA*v_list[cursorx]+3+2*cursory+1);
						if(t<=0) t = currentvel+1;
						voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory+cursorx2,baseoct*12+keymap[key]);
						voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory+1,t);
						//cursorx2=(cursorx2+1) & 1;
						cursory=(cursory+1) & 511;
					}
				}
			}else{
				var t=key-48;
				if((t>=0)&&(t<10)){
					var o=voice_data_buffer.peek(1, MAX_DATA*v_list[cursorx]+3+2*cursory+cursorx2)-1;
					if(o<100){
						o*=10;
						o+=t;
					}else{
						o=t;
					}
					voice_data_buffer.poke(1, MAX_DATA*v_list[cursorx]+3+2*cursory+cursorx2,o+1);
				}
			}
			
			break;
	}
	var df=0;
	if(cursory-display_row_offset>30){
		display_row_offset=cursory-30;
		df=1;
	}else if(cursory-display_row_offset<5){
		display_row_offset=Math.max(0,cursory-5);
		df=1;
	}
	if(cursorx-display_col_offset<=showcols){
		display_col_offset=Math.max(0,cursorx-1);
		df=1;
	}else if(cursorx-display_col_offset>=showcols-1){
		display_col_offset=cursorx-1;
		df=1;
	}
	if(df){
		draw();
	}else{
		if((cursorx!=ox)||(cursory!=oy)){
			drawcell(ox-display_col_offset,oy-display_row_offset);
		}
		drawcell(cursorx-display_col_offset,cursory-display_row_offset);		
	}
}
function update(){
	var c,o;
	for(c=0;c<v_list.length;c++){
		ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]+2));
		if(cursors[c]!=ph){
			l  = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]+1)*512)+1;
			s  = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c])*512);
			o = cursors[c]-display_row_offset;
			cursors[c]=ph;
			//redraw cell that was old cursor
			if((o>=0)&&(o<maxl)){
				drawcell(c,o);	
			}
			
			//draw new cursor cell
			if(cursors[c]-display_row_offset<maxl){
				drawcell(c,cursors[c]-display_row_offset);
			}
		}
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