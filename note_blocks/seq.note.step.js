outlets = 3;
var MAX_DATA = 16384;
var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;
var UNIVERSAL_COLUMNS = 6;
var UNIVERSAL_PATTERNS = 16;
var max_rows = 10;
var pattsize = 1;
var step_time = 125; //ms per step, measured by voice 0 and reported back
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,unit,sx,sy,ux,uy;
var block=-1;
var blockcolour=[128,128,128];
var currentvel=100;
var selected_graph = 0; //0=off, 1=vel, 2=len, 3=delay, 4=chance
var selected_voice=0;
var mini=0;
var drawflag=0;
var namelist = ["C ","C#","D ","D#","E ","F ","F#","G ","G#","A ","A#","B "];
var brightlist = [1,0,1,0,1,1,0,1,0,1,0,1];
var note_names = new Array(128);
var voicemap = new Dict;
voicemap.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var copy = new Dict;
copy.name = "copy";
var v_list = [];
var b_list = [];
var rowmap = []; //for each column, this holds the actual row each data-row maps to.
var keymap = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 28, -1, 14, 16, -1, 19, 21, 23, -1, 26, -1, -1, -1, 31, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 30, -1, 32, -1, -1, -1, -1, 8, 5, 4, 17, -1, 7, 9, 25, 11, -1, -1, 12, 10, 27, 29, 13, 18, 2, 20, 24, 6, 15, 3, 22, 1, -1, -1, -1, -1, -1];
var cursors = new Array(128); //holds last drawn position of playheads (per row)
var start=[],lstart=[],end=[],lon=[],divs=[],pattern_offs=[];
var rcol = []; //row colour. calc'd for the selected voice (grouping stretches out this list of colours)
//explainer: if a row is 'grouped' into a round robin then the colour sequence doesn't advance, to keep it making sense.
var sel_sx,sel_sx2,sel_sy,sel_ex=-1,sel_ex2,sel_ey=-1;
//var discont_x,discont_x2,bh;
var view_x=0,view_x2=16,view_w=16,view_y=48,view_y2=72,view_h=24;
var graph_y,graph_y2,graph_h;
var colnames=["note","vel","len","del","skip","group"];
var scr_accum_x=0,scr_accum_y=0;
//data format: for each voice the buffer holds:
// 0 - playhead position (updated by player voice)
// 1-16383 data values, split over a flexible number of columns (6) and patterns (16)
// COLUMNS:
// - note (0=blank, 1-128=notes)
// - vel (0=blank, 1-128=values 0-127)
// - length (0=blank, default tracker behaviour, 1=0, a negative vel zero-length note, 2-128 = max length if not cut off, in ms? or rows?
// - delay (in ms?)
// - probability (0=blank, 100%, positive = ratchet, negative = probability)
// - grouping (if 0 step is ungrouped. if negative then this step + that number = the first step of the group, where the current loop counter is stored as a positive number - 1=1st step.)
function setup(x1,y1,x2,y2,sw){ 
	MAX_DATA = config.get("MAX_DATA");
	UNIVERSAL_COLUMNS = config.get("UNIVERSAL_COLUMNS");
	UNIVERSAL_PATTERNS = config.get("UNIVERSAL_PATTERNS");
	max_rows = Math.floor((MAX_DATA-1)/(UNIVERSAL_COLUMNS*UNIVERSAL_PATTERNS));
	pattsize = max_rows*UNIVERSAL_COLUMNS;
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	mini=0;
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	if(width<sw*0.6){ 
		mini=1;
		if(block>=0) generate_extended_v_list();
		var m=1;
		for(i=0;i<v_list.length;i++){
			m  = Math.max(m, Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+1,1)) + Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+2,1)));
		}
		view_x2=m;
	}else{
		if(block>=0) generate_extended_v_list();
		view_x2=16; view_x=0; view_w=16;
	}
	unit = height / 18;
	selected_voice=0;
	selected_graph=1;
	sy = y_pos + 1.7*unit*(mini==0);
	sx = x_pos + 1.2*unit*(mini==0);
	graph_h = 0.2 * height;// * (selected_graph!=0);
	graph_y2 = y2;
	graph_y = y2 - graph_h;
	calcscaling();
	currentvel=100;
	for(i=0;i<128;i++){
		note_names[i] = namelist[i%12]+(Math.floor(i/12)-2);
	}
	draw();
}

function calcscaling() {
	if(view_x<0){
		view_x2-=view_x;
		view_x=0;
	}
	if(view_y<0){
		view_y2-=view_y;
		view_y = 0;
	}
	if(view_x2>=max_rows){
		view_x-=view_x2-max_rows;
		view_x2=max_rows;
	}
	if(view_y2>=128){
		view_y-=view_y2-128;
		view_y2=128;
	}
	view_w = view_x2 - view_x;
	view_h = view_y2 - view_y;
	ux = (width - sx) / view_w;
	uy = (graph_y - sy - 0.1 * unit) / view_h;
}

function draw(){
	if(block>=0){
		drawflag=0;
		var c,r,i,rc;
		for(i=0;i<v_list.length;i++){
			cursors[i]=-1;
		}
		outlet(1,"paintrect",x_pos,y_pos,width+x_pos,height+y_pos,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
		if(!mini){
			outlet(0,"custom_ui_element","mouse_passthrough",x_pos,y_pos,width+x_pos,height+y_pos,0,0,0,block,0);
			outlet(0,"setfontsize",Math.min(unit*0.4,uy*0.8));//draw side note list scrollbar
			for(var y=view_y;y<view_y2;y++){
				var shade = (3 + brightlist[y%12]) * 0.10;
				outlet(1,"paintrect",x_pos,sy+(view_y2-y-1)*uy,sx-unit*0.1,sy+(view_y2-y)*uy,blockcolour[0]*shade,blockcolour[1]*shade,blockcolour[2]*shade);
				outlet(1,"moveto",x_pos+4,sy+(view_y2-y)*uy-unit*0.1);
				outlet(1,"frgb",blockcolour);
				outlet(1,"write",note_names[y]);
			}
			outlet(0,"setfontsize",unit*0.4);
			for(var g=1;g<UNIVERSAL_COLUMNS-1;g++){ // draw graph select buttons
				var se = 0.1 + 0.6*(selected_graph==g);
				outlet(1,"paintrect",x_pos,graph_y+graph_h*(g-1)/(UNIVERSAL_COLUMNS-2),sx-unit*0.1,graph_y+graph_h*g/(UNIVERSAL_COLUMNS-2),blockcolour[0]*se,blockcolour[1]*se,blockcolour[2]*se);
				if(g != selected_graph){
					outlet(1,"frgb",blockcolour);
				}else{
					outlet(1,"frgb",0,0,0);
				}
				outlet(1,"moveto",x_pos+4,graph_y+graph_h*(g-0.3)/(UNIVERSAL_COLUMNS-2));
				outlet(1,"write",colnames[g]);
			}
			for(c=0;c<v_list.length;c++){ // calculate rowmap
				var r2= 0; 
				if(!Array.isArray(rowmap[c])) rowmap[c]=[];
				for(r=0;r<view_x2;r++){
					rowmap[c][r] = r2;
					if(voice_data_buffer.peek(1, MAX_DATA*v_list[c] + 1 + pattern_offs[c] + UNIVERSAL_COLUMNS*r + 5)>=0) r2++;				
				}
			}
			var or2=-1;
			for(r=0;r<view_x2;r++){ // draw time bar along top and checkerboardish cells
				r2=rowmap[selected_voice][r];
				rc = 0.1*Math.sqrt(((r2%2)==0)+((r2%4)==0)+((r2%8)==0)+((r2%16)==0))+0.4;
				rcol[r] = rc;
				var loop = lon[selected_voice] && (r2>=lstart[selected_voice]) && (r2<end[selected_voice]);
				if(loop){
					rc *= 0.8;
					loop = 1.7;
				}else{loop=1;}		
				if((r>=view_x)){
					outlet(1,"paintrect",sx+ux*(r-view_x),sy-unit*0.6,sx+ux*(r-view_x+1),sy-unit*0.1,blockcolour[0]*rc,blockcolour[1]*rc*loop,blockcolour[2]*rc);
					if(or2!=r2){
						outlet(1,"moveto",sx+ux*(r-view_x)+4,sy-unit*0.2);
						outlet(1,"frgb",blockcolour);
						outlet(1,"write",r2);
						or2=r2;
					}
					for(var y=view_y;y<view_y2;y++){
						var shade = rc * (3 + brightlist[y%12]) * 0.07;
						outlet(1,"paintrect",sx+ux*(r-view_x),sy+(view_y2-y-1)*uy,sx+ux*(r+1-view_x),sy+(view_y2-y)*uy,blockcolour[0]*shade,blockcolour[1]*shade*loop,blockcolour[2]*shade);
					}
				}
			}
		}
		outlet(0,"setfontsize",unit*0.4);
		for(c=0;c<v_list.length;c++){
			cursors[c] = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
			start[c]  = Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c],1));
			lstart[c] = Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1,1));
			end[c]  = lstart[c] + Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2,1));
			lon[c] = Math.floor(2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+3,1));
			pattern_offs[c] = pattsize * Math.floor(UNIVERSAL_PATTERNS*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+9,1));
			divs[c] =  Math.floor(2 + 14*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+5,1));
			for(r=view_x;r<view_x2;r++) drawcell(c,r);
			if(!mini){
				if(selected_voice == c){
					if(b_list[c]==block){
						outlet(1,"frgb",blockcolour);
					}else{
						outlet(1,"frgb",128,128,128);
					}
				}else{
					if(b_list[c]==block){
						outlet(1,"frgb",blockcolour[0]*0.5,blockcolour[1]*0.5,blockcolour[2]*0.5);
					}else{
						outlet(1,"frgb",64,64,64);
					}
				}
				
				var c2=Math.max(0,c-1);
				if((c==0)||(b_list[c]!=b_list[c2])){
					outlet(1,"moveto", width*c/v_list.length+x_pos, unit*0.4+y_pos);
					if(b_list[c]==block){
						outlet(1,"write", "this block:" + blocks.get("blocks["+block+"]::label"));
					}else{
						outlet(1,"write", "block "+b_list[c] + " "+blocks.get("blocks["+b_list[c]+"]::label"));
					}
				} 
				outlet(1,"moveto", width*c/v_list.length+x_pos, unit*0.85+y_pos);
				outlet(1,"write", "voice " + (c+1));
			}
		}
	}
}

function update(){
	var c,o,ph;
	if(drawflag){
		draw();
		return 0;
	}
	for(c=0;c<v_list.length;c++){
		ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
		t_start  = Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c],1));
		t_lstart = Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1,1));
		t_end  = t_lstart + Math.floor(512*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2,1));
		t_lon =  Math.floor(2*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+3,1));
		t_p_offs =  pattsize * Math.floor(UNIVERSAL_PATTERNS*voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+9,1));
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
		if(t_p_offs!=pattern_offs[c]){
			pattern_offs[c]=t_p_offs;
			d = 1;
		}
		if(t_divs != divs[c]){
			divs[c] = t_divs;
			d = 1;
		}
		if(d==1){
			drawflag = 1;
			/*for(r=view_x;r<view_x2;r++){			
				drawcell(c,r);
			}*/
		}else if(cursors[c]!=ph){
			o = cursors[c];
			cursors[c]=ph;
			//redraw cell that was old cursor
			if((o>=view_x)&&(o<view_x2)){
				drawcell(c,o);	
			}
			
			//draw new cursor cell
			o = cursors[c];
			if((o>=view_x)&&(o<view_x2)){
				drawcell(c,o);	
			}
		}
	}
}

function drawcell(cc,rr){
	if(rr<view_x) return 0;
	if(rr>view_x2) return 0;
	var values = voice_data_buffer.peek(1,MAX_DATA*v_list[cc]+1+UNIVERSAL_COLUMNS*rr+pattern_offs[cc],UNIVERSAL_COLUMNS);
	var y = values[0];
	var shade = 0.5 + values[1]/256;
	if(cursors[cc]==rr) shade *= 2;
	var loop = lon[cc] && (rr>=lstart[cc]) && (rr<end[cc]);
	if(loop){
		shade *= 0.8;
		loop = 1.7;
	}else{loop=1;}
	if((y>view_y)&&(y<view_y2)){
		y--;
		if(cc==selected_voice){
			drawtype = "paintrect";
		}else{
			drawtype = "framerect";
		}
		var w = values[2];
		var nx = view_x2;
		for(t=rr+1;t<=view_x2;t++){
			if(voice_data_buffer.peek(1,MAX_DATA*v_list[cc]+2+UNIVERSAL_COLUMNS*t+pattern_offs[cc])>0){
				var td = voice_data_buffer.peek(1,MAX_DATA*v_list[cc]+4+UNIVERSAL_COLUMNS*t+pattern_offs[cc])
				if(td>0){
					td = td*7.9285714/step_time;
					nx=Math.min(nx,t+td);
				}else{
					nx=Math.min(nx,t);//-rr;
					t=999999999999999;
				}
			}
		}
		post("\nnx",nx);
		var d = values[3];
		if(d>0){
			d = d*7.9285714/step_time;
			if(cc==selected_voice){// a little indicator line for when a note starts
				outlet(1,"frgb",blockcolour[0]*shade,blockcolour[1]*loop*shade,blockcolour[2]*shade);
				outlet(1,"moveto",sx+ux*(rr-view_x),sy+(view_y2-y-0.5)*uy);
				outlet(1,"lineto",sx+ux*(rr-view_x+d),sy+(view_y2-y-0.5)*uy);
			}
		}else{d=0;}
		if(w==0){
			//find the next note,set w
			w = nx - rr - d;
		}else if(w==1){ //instantaneous
			w = 0.2;
		}else{//length in ms so
			w = (w-2)*7.9285714;
			w /= step_time;
			w = Math.min(Math.max(w,0.2),nx-rr-d);
		}
		post("d",d,"w",w);
		outlet(1,drawtype,sx+ux*(rr-view_x+d),sy+(view_y2-y-1)*uy,sx+ux*(rr+w+d-view_x),sy+(view_y2-y)*uy,blockcolour[0]*shade,blockcolour[1]*loop*shade,blockcolour[2]*shade);
	}
	if(cc==selected_voice){ //draw sliders whether it's in view (y axis) or not
		if(selected_graph>0){
			var steps=((selected_graph==2)||(selected_graph==3)) ? 1000:128;
			var v= values[selected_graph]-1;
			v /= steps;
			if(v>0){
				outlet(1,"paintrect", sx+ux*(rr-view_x),graph_y2-graph_h*v,sx+ux*(rr+1-view_x),graph_y2,blockcolour[0]*shade,blockcolour[1]*loop*shade,blockcolour[2]*shade);//,MAX_DATA*v_list[cc]+1+UNIVERSAL_COLUMNS*rr+pattern_offs[cc]+selected_graph,1);
			}else if(selected_graph==4){
				outlet(1,"paintrect", sx+ux*(rr-view_x),graph_y,sx+ux*(rr+1-view_x),graph_y-graph_h*v,blockcolour[0]*shade,blockcolour[1]*loop*shade,blockcolour[2]*shade);//,MAX_DATA*v_list[cc]+1+UNIVERSAL_COLUMNS*rr+pattern_offs[cc]+selected_graph,1);
			}
		}else{
			var steps=128;
			var gy,gy2,gh=graph_h/(UNIVERSAL_COLUMNS-2);
			for(var g=1;g<UNIVERSAL_COLUMNS-1;g++){
				if(g==2) steps=1000;
				if(g==4) steps=128;
				var v= values[g]-1;
				v /= steps;
				gy=graph_y+(g-1)*gh;
				gy2=graph_y+g*gh;
				if(v>0){
					outlet(1,"paintrect", sx+ux*(rr-view_x),gy2-gh*v,sx+ux*(rr+1-view_x),gy2,blockcolour[0]*shade,blockcolour[1]*loop*shade,blockcolour[2]*shade);//,MAX_DATA*v_list[cc]+1+UNIVERSAL_COLUMNS*rr+pattern_offs[cc]+selected_graph,1);
				}else if((g>3)&(values[g]<-1)){
					outlet(1,"paintrect", sx+ux*(rr-view_x),gy,sx+ux*(rr+1-view_x),gy-gh*v,blockcolour[0]*shade,blockcolour[1]*loop*shade,blockcolour[2]*shade);//,MAX_DATA*v_list[cc]+1+UNIVERSAL_COLUMNS*rr+pattern_offs[cc]+selected_graph,1);
				}				
			}
		}
	}
	return 0;
}

function mouse(x,y,lb,sh,al,ct,scr){
	if(x<sx){//left column
		if(y>graph_y){
			if(lb){
				var g = Math.floor(1+(UNIVERSAL_COLUMNS-2)*(y-graph_y)/graph_h);
				if(g==selected_graph) g =0;
				selected_graph = g;
				drawflag=1;
			}
		}else if(y>=sy){
			if(scr){
				scr_accum_y+=scr*5;
				if(Math.abs(scr_accum_y)>1){
					scr = (scr>0)?1:-1;
					scr_accum_y=0;
					if(ct){
						view_y+=scr;
						view_y2-=scr;
						calcscaling();
					}else{
						view_y+=scr;
						view_y2+=scr;
						calcscaling();
					}
					drawflag = 1;
				}
			}
		}
	}else if(y<sy){//top rows
		if(y<sy-unit*0.6){//very top, voice select
			selected_voice = Math.floor(v_list.length*x/width);
			drawflag = 1;
		}else{//timeline (a timeline? in this software? call it something else please you imperialist pig)
			if(x>sx){
				if(scr){
					scr_accum_x+=scr*5;
					if(Math.abs(scr_accum_x)>1){
						scr = (scr>0)?1:-1;
						scr_accum_x=0;
						if(ct){
							view_x+=scr;
							view_x2-=scr;
							calcscaling();
						}else{
							view_x+=scr;
							view_x2+=scr;
							calcscaling();
						}
						drawflag = 1;
					}
				}else if(lb && al){//toggle the clicked cell into a group
					cursory = Math.floor(view_x + view_w * (x-sx)/(width-sx));
					toggle_grouping();
					drawflag = 1;
				}
			}
		}
	}else if(y<graph_y){ //main grid
		if(lb){
			var clickx = Math.floor(view_x + view_w * (x-sx)/(width-sx));
			var clicky = 1 + Math.floor(view_y2 - view_h * (y-sy)/(graph_y-sy));
			var tn = voice_data_buffer.peek(1,MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*clickx+pattern_offs[selected_voice]);
			if(tn==clicky) clicky = 0;
			if(clicky!=0){
				voice_data_buffer.poke(1,MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*clickx+pattern_offs[selected_voice],clicky);
				var tv = voice_data_buffer.peek(1,MAX_DATA*v_list[selected_voice]+2+UNIVERSAL_COLUMNS*clickx+pattern_offs[selected_voice]);
				if(tv==0) voice_data_buffer.poke(1,MAX_DATA*v_list[selected_voice]+2+UNIVERSAL_COLUMNS*clickx+pattern_offs[selected_voice],currentvel);
			}else{
				voice_data_buffer.poke(1,MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*clickx+pattern_offs[selected_voice],[0,0,0,0,0,0]);
			}
			drawflag = 1;
		}
	}else{ //graph bit
		var clickx = Math.floor(view_x + view_w * (x-sx)/(width-sx));
		var clicky = (y-graph_y) * (1 + (selected_graph==0)*(UNIVERSAL_COLUMNS-3))/graph_h;
		var slider = selected_graph;
		if(selected_graph==0) slider = Math.floor(clicky+1);
		clicky = 1-(clicky%1);
		var steps = ((slider==2)||(slider==3)) ? 1000:128;
		if(scr){
			var tv=	voice_data_buffer.peek(1,MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*clickx+pattern_offs[selected_voice],UNIVERSAL_COLUMNS);
			if(tv[0] > 0){
				tv[slider] += scr * steps * 0.1;
				if(slider<4){
					if(tv[slider]<-1) tv[slider] = -1;
				}else{
					if(tv[4]<-100) tv[4]=-100;
				}
				if(tv[slider]>steps)tv[slider]=steps; 
				voice_data_buffer.poke(1,MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*clickx+pattern_offs[selected_voice]+slider,tv[slider]);
				drawflag = 1; //IDEALLY NO, JUST UPDATE THE ONE SLIDER
			}
		}else if(lb){
			clicky *= steps;
			voice_data_buffer.poke(1,MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*clickx+pattern_offs[selected_voice]+slider,clicky);
		}
	}
}

function request_sidebar_sel(){
	if(b_list[selected_voice]==block){
		messnamed("to_blockmanager","select_block_and_voice",b_list[selected_voice],selected_voice);
	}else{
		var c = selected_voice;
		var b=b_list[c];
		while(b_list[c]==b){
			c--;
		}
		c = selected_voice - c - 1;
		post("\nrequesting block and voice",b_list[selected_voice],c);
		messnamed("to_blockmanager","select_block_and_voice",b_list[selected_voice],c);
	}
}

function copy_selection(){
	var col=0;
	var column_contents=[];
	if(sel_ex!=-1){
		for(var tx=0;tx<=v_list.length;tx++){
			for(var tx2=0;tx2<UNIVERSAL_COLUMNS;tx2++){
				if(((tx==sel_sx)&&(tx2>=sel_sx2)||(tx>sel_sx))){
					if(((tx==sel_ex)&&(tx2<=sel_ex2))||(tx<sel_ex)){
						column_contents[col] = [];
						for(var i=sel_sy;i<=sel_ey;i++){
							column_contents[col][i-sel_sy] = voice_data_buffer.peek(1, MAX_DATA*v_list[tx]+1+UNIVERSAL_COLUMNS*i+pattern_offs[tx]+tx2);
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
		var tx=selected_voice;
		var tx2=selected_graph;
		for(var i=0;i<cols.length;i++){
			var ty=cursory;
			var col = td.get(cols[i]);
			for(y=0;y<col.length;y++){
				voice_data_buffer.poke(1, MAX_DATA*v_list[tx]+1+UNIVERSAL_COLUMNS*ty+pattern_offs[tx]+tx2,col[y]);
				ty++;
			}
			tx2++;
			if(tx2>1){
				tx++;
				tx2=0;
				if(tx>=v_list.length) i=999999999;
			}
		}
		drawflag=1;
	}
}

function toggle_grouping(){
	var currently = voice_data_buffer.peek(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS-1);
	if(currently==0){
		if(cursory==0)cursory++;
		var above = voice_data_buffer.peek(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice]-1);
		if(above==0){
			//starting a new group? so the one above gets added (set to 1) and this one gets set as 1st, -1
			voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice]-1,1);
			voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice]-1+UNIVERSAL_COLUMNS,-1);
		}else if(above<0){
			//above was already a group so you just add yourself to that
			voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice]-1+UNIVERSAL_COLUMNS,above-1);
		}else if(above>0){
			//i'm not sure how this could arise
			voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice]-1+UNIVERSAL_COLUMNS,-1);
		}
	}else{ //whether you're removing the first cell of a group, or one in the middle, it makes sense to remove all the ones after too?
		var yyy = MAX_DATA*v_list[selected_voice]+UNIVERSAL_COLUMNS*(cursory+1)+pattern_offs[selected_voice];
		var yy=yyy+UNIVERSAL_COLUMNS; //after
		while(voice_data_buffer.peek(1,yy)!=0){
			voice_data_buffer.poke(1, yy,0);
			yy+=UNIVERSAL_COLUMNS;
		}
		var yy=yyy;
		while(voice_data_buffer.peek(1,yy)!=0){
			voice_data_buffer.poke(1, yy,0);
			yy-=UNIVERSAL_COLUMNS;
		}
	}
	drawflag=1;
}

function delete_selection(){
	var i;
	if(sel_ex==-1){
		for(i=cursory;i<max_rows;i++){
			var rowvalues;
			if(i<max_rows-1){
				rowvalues = voice_data_buffer.peek(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*(i+1),UNIVERSAL_COLUMNS);
			}else{
				rowvalues = [0,0,0,0,0,0];
			}
			voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*i,rowvalues);
		}
	}else{
		for(i=sel_sy;i<=sel_ey;i++){
			for(var tx=0;tx<=v_list.length;tx++){
				for(var tx2=0;tx2<2;tx2++){
					if(((tx==sel_sx)&&(tx2>=sel_sx2)||(tx>sel_sx))){
						if(((tx==sel_ex)&&(tx2<=sel_ex2))||(tx<sel_ex)){
							voice_data_buffer.poke(1, MAX_DATA*v_list[tx]+1+pattern_offs[tx]+UNIVERSAL_COLUMNS*i+tx2,0);
						}
					}
				}
			}
		}
	}
	drawflag=1;
}

function keydown(key){
	var ox = selected_voice;
	return 0;
	var oy = cursory;
	switch(key){
		case -15:
			selected_voice=0;
			selected_graph=0;
			cursory=0;
			break;
		case -9:
			cursory--;
			if(cursory<0) cursory+=max_rows;
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -4://enter homes cursor and moves down
			selected_graph=0;
		case -10://arrow just moves down
			cursory=(cursory+1) % max_rows;
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -11:
			selected_graph--;
			if(selected_graph<0){
				selected_graph=UNIVERSAL_COLUMNS-2;
				selected_voice=(selected_voice+v_list.length-1)%v_list.length;
			}
			sel_ex=-1;
			sel_ey=-1;
			drawflag=1;
			break;
		case -12:
			selected_graph++;
			if(selected_graph>UNIVERSAL_COLUMNS-2){
				selected_graph=0;
				selected_voice=(selected_voice+1)%v_list.length;
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
			if(cursory>=max_rows) cursory=max_rows-1;
			break;
		case 35:
			toggle_grouping();
			break;
		case 500:
			if(sel_ex==-1){
				sel_ex=selected_voice;
				sel_sx=selected_voice;
				sel_ex2=selected_graph;
				sel_sx2=selected_graph;
				sel_ey=cursory;
				sel_sy=cursory;
			}
			if(sel_ex==selected_voice){
				selected_graph++;
				if(selected_graph>UNIVERSAL_COLUMNS-2){
					selected_graph=0;
					selected_voice=(selected_voice+1)%v_list.length;
				}
				sel_ex2 = selected_graph;
				sel_ex = selected_voice;
			}else if(sel_sx==selected_voice){
				selected_graph++;
				if(selected_graph>UNIVERSAL_COLUMNS-2){
					selected_graph=0;
					selected_voice=(selected_voice+1)%v_list.length;
				}
				sel_sx2 = selected_graph;
				sel_sx = selected_voice;
			}
			break;
		case 501:
			if(sel_ex==-1){
				sel_ex=selected_voice;
				sel_sx=selected_voice;
				sel_ex2=selected_graph;
				sel_sx2=selected_graph;
				sel_ey=cursory;
				sel_sy=cursory;
			}
			if(sel_ex==selected_voice){
				selected_graph--;
				if(selected_graph<0){
					selected_graph=UNIVERSAL_COLUMNS-2;
					selected_voice=(selected_voice+v_list.length-1)%v_list.length;
				}
				sel_ex2 = selected_graph;
				sel_ex = selected_voice;
			}else if(sel_sx==selected_voice){
				selected_graph--;
				if(selected_graph<0){
					selected_graph=UNIVERSAL_COLUMNS-2;
					selected_voice=(selected_voice+v_list.length-1)%v_list.length;
				}
				sel_sx2 = selected_graph;
				sel_sx = selected_voice;
			}
			break;
		case 502:
			if(sel_ex==-1){
				sel_ex=selected_voice;
				sel_sx=selected_voice;
				sel_ex2=selected_graph;
				sel_sx2=selected_graph;
				sel_ey=cursory;
				sel_sy=cursory;
			}
			if(sel_ey==cursory){
				cursory=(cursory+1) % max_rows;
				sel_ey=cursory;
			}else if(sel_sy==cursory){
				cursory=(cursory+max_rows-1) % max_rows;
				sel_sy==cursory;
			}
			drawflag=1;
			break;
		case 503:
			if(sel_ex==-1){
				sel_ex=selected_voice;
				sel_sx=selected_voice;
				sel_ex2=selected_graph;
				sel_sx2=selected_graph;
				sel_ey=cursory;
				sel_sy=cursory;
			}
			if(sel_ey==cursory){
				cursory=(cursory+max_rows-1) % max_rows;
				sel_ey=cursory;
			}else if(sel_sy==cursory){
				cursory=(cursory+max_rows-1) % max_rows;
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
			var tv=voice_data_buffer.peek(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*cursory+selected_graph);
			if(tv>0){
				tv++;
				if(tv>128)tv=128;
				if(selected_graph==1)	currentvel = tv-1;
				voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*cursory+selected_graph,tv);
			}
			drawflag=1;
			break;
		case 45:
			var tv=voice_data_buffer.peek(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*cursory+selected_graph);
			if(tv>0){
				tv--;
				if(tv<1)tv=1;
				if(selected_graph==1)	currentvel = tv-1;
				voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*cursory+selected_graph,tv);
			}
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
			//del or delete
			delete_selection();
			break;
		case -8:
			//insert
			for(i=max_rows-1;i>cursory;i--){
				var rowvalues = voice_data_buffer.peek(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*(i-1),UNIVERSAL_COLUMNS);
				voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*i+pattern_offs[selected_voice],rowvalues);
			}
			var rowvalues=[0,0,0,0,0,0];
			voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice],rowvalues);
			drawflag=1;
			break;
		case -7:
		case 46:
			if(selected_graph==0){
				var rowvalues=[0,0,0,0,0,0];
				voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice],rowvalues);
			}else{
				voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+selected_graph+pattern_offs[selected_voice],0);
			}
			cursory=(cursory+1) % max_rows;
			drawflag=1;
			break;
		case 353: //ctl-a
			sel_sx=0;
			sel_sx2=0;
			sel_ex=v_list.length-1;
			sel_ex2=UNIVERSAL_COLUMNS-1;
			sel_sy=0;
			sel_ey=max_rows-1;
			drawflag=1;
			break;
		case 355: //ctl-c
			copy_selection();
			break;
		case 361: //ctl-I (interpolate)
			if((sel_sy!=sel_ey)&&(sel_ey>-1)){
				var v1 = voice_data_buffer.peek(1, MAX_DATA*v_list[sel_sx]+1+UNIVERSAL_COLUMNS*(sel_sy)+sel_sx2+pattern_offs[sel_sx]);
				var v2 = voice_data_buffer.peek(1, MAX_DATA*v_list[sel_ex]+1+UNIVERSAL_COLUMNS*(sel_ey)+sel_ex2+pattern_offs[sel_sx]);
				if((v1>0)&&(v2>0)){
					for(i=sel_sy;i<=sel_ey;i++){
						voice_data_buffer.poke(1, MAX_DATA*v_list[sel_sx]+1+UNIVERSAL_COLUMNS*i+pattern_offs[sel_sx]+sel_sx2,Math.floor((v2*i+v1*(sel_ey-i))/(sel_ey-sel_sy)));
					}
				}
			}
			break;
		case 364: //ctl-l
			sel_sx=selected_voice;
			sel_sx2=selected_graph;
			sel_ex=sel_sx;
			sel_ex2=sel_sx2;
			sel_sy=0;
			sel_ey=max_rows-1;
			drawflag=1;
			break;
		case 374: //ctl-v
			paste_columns();
			break;
		case 376: //ctl-x
			copy_selection();
			delete_selection();
			break;
		default:
			if(selected_graph==0){
				if(key==49){
					voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice],-1);
				}else if(key==47){
					voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice],0);
				}else if(key>0){
					if(keymap[key]>-1){
						var t=voice_data_buffer.peek(1,MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice]);
						if(t<=0) t = currentvel+1;
						voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+pattern_offs[selected_voice],baseoct*12+keymap[key]);
						voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+UNIVERSAL_COLUMNS*cursory+1+pattern_offs[selected_voice],t);
						//selected_graph=(selected_graph+1) & 1;
					}
				}
				cursory=(cursory+1) % max_rows;
			}else{
				var t=key-48;
				if((t>=0)&&(t<10)){
					var o=voice_data_buffer.peek(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*cursory+selected_graph)-1;
					o*=10;
					if(o>0){
						o+=t;
					}else{
						o-=t;
					}
					if(selected_graph==1){
						if((o>128)||(o<0)) o=t;
					}else if((selected_graph==2)||(selected_graph==3)){
						if(o>999)o=t;
						if(o<0) o=t;
					}else if(selected_graph==4){
						if((o>128)||(o<-128)) o=t;
					}
					voice_data_buffer.poke(1, MAX_DATA*v_list[selected_voice]+1+pattern_offs[selected_voice]+UNIVERSAL_COLUMNS*cursory+selected_graph,o+1);
				}
			}	
			break;
	}
	if(drawflag){
		if(selected_voice!=ox) request_sidebar_sel();
	}else{
		if((selected_voice!=ox)||(cursory!=oy)){
			drawcell(ox,oy);
			if(selected_voice!=ox) request_sidebar_sel();
		}
		drawcell(selected_voice,cursory);		
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		generate_extended_v_list();
		blockcolour = blocks.get("blocks["+block+"]::space::colour");
		for(var i=0;i<3;i++)blockcolour[i] = Math.min(255,2*blockcolour[i]);
	}
//	post("seq.grid.ui loaded, block is",block);
}
function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}


function store(){
	var r;
	var transf_arr = []; //this isn't the shortest it possibly could be but i think we can handle it.
	for(r=0;r<v_list.length;r++){
		transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list[r], MAX_DATA);
		var d = 0;
		while(d==0){
			d = transf_arr.pop();
		}
		transf_arr.push(d);
		blocks.replace("blocks["+block+"]::voice_data::"+r, transf_arr);
	}
}

function reset_round_robins(){
	for(var c = 0; c<v_list.length; c++){
		var ov=-1;
		for(var r = max_rows; r>0; r--){ //r is row+1 in this loop
			var v = voice_data_buffer.peek(1, MAX_DATA*v_list[c] + UNIVERSAL_COLUMNS * r + pattern_offs[c]);
			if(v>0){
				if(ov>=0){
					//orphaned counter, wipe it
					voice_data_buffer.peek(1, MAX_DATA*v_list[c] + UNIVERSAL_COLUMNS * r + pattern_offs[c], 0);
				}else{
					voice_data_buffer.peek(1, MAX_DATA*v_list[c] + UNIVERSAL_COLUMNS * r + pattern_offs[c], 1);	
				}
			}
			ov = v;
		}
	}
}


function generate_extended_v_list() {
	v_list = voicemap.get(block);
	if (!Array.isArray(v_list)) v_list = [v_list];
	for (var i = 0; i < v_list.length; i++) b_list[i] = block;
	if(!mini){
		for (var i = blocks.getsize("blocks") + 1; i > 0; i--) {
			if (i != block) {
				if (blocks.contains("blocks[" + i + "]::patcher")) {
					if (blocks.get("blocks[" + i + "]::patcher") == "universal.step.sequence") {
						var xlist = voicemap.get(i);
						if (!Array.isArray(xlist)) xlist = [xlist];
						while (xlist.length) {
							v_list.push(xlist.shift());
							b_list.push(i);
						}
					}
				}
			}
		}
	}
}

function steptime_is(time){
	step_time = time;
}