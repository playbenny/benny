outlets = 3;
var MAX_DATA = 16384;
var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;
//var voice_data_buffer = new Buffer("voice_data_buffer"); 
//var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var parameter_value_buffer = new Buffer("parameter_value_buffer");
var config = new Dict;
config.name = "config";

var width, height,x_pos,y_pos,unit,sx,sy,ux,uy;
var block=-1;

var blockcolour=[128,128,128];
var mini=0;
var blocks = new Dict;
blocks.name = "blocks";
var seqdict = new Dict;
seqdict.name = "core-keyb-loop-xfer";

var lowestnote,highestnote,ccpresent;
var playheadpos = 0;
var playstate = 0;

function playhead(p){
	playheadpos = p;
}
function playing(p){
	playstate = p;
}
function convert_to_lengths(){
	var sd = seqdict.get(block);
	var k = sd.getkeys();
	if(k==null){
		drawflag = 1;
		return -1;
	}
	lowestnote = 128; highestnote = 0; ccpresent = 0;
	for(var i=0;i<k.length;i++){
		if(k[i]!="looppoints"){
			var event = seqdict.get(block+"::"+k[i]); //[time,type,note,vel]
			if(event == null){
			}else if(event[1]>1){
				ccpresent = 1;
			}else if(event[3]>0){ //noteon, find its length
				if(event[2]<lowestnote) lowestnote = event[2];
				if(event[2]>highestnote) highestnote = event[2];
				for(var ii=1;ii<=k.length;ii++){
					var ti = (i+ii) % k.length;
					if(k[ti]!="looppoints"){
						var tev = seqdict.get(block+"::"+k[ti]);
						if(tev == null){
						}else if(event[2]==tev[2]){ //note match
							var tt = tev[0]-event[0];
							tt = (tt + 1) % 1;
							event.push(tt); //store length
							if(tev[3]==0){
								seqdict.remove(block+"::"+k[ti]); //used up noteoff, remove it.
							}
							ii = 99999;
						}
					}
				}
				if(ii<9999){
					//post("\nFAILED TO FIND LENGTH FOR THIS NOTE",event);
					event.push(0);
				}
				seqdict.replace(block+"::"+k[i],event);
			}else if(event[3]<0){
				if(event[2]<lowestnote) lowestnote = event[2];
				if(event[2]>highestnote) highestnote = event[2];
				event.push(0);
				seqdict.replace(block+"::"+k[i],event);
			}
		}
	}
	for(var i=0;i<k.length;i++){
		if(k[i]!="looppoints"){
			var event = seqdict.get(block+"::"+k[i]); //[time,note,vel]
			if(event==null){
			}else if(event[3]==0) seqdict.remove(block+"::"+k[i]);
		}
	}
	drawflag = 1;
}

function setup(x1,y1,x2,y2,sw){ 
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	mini=0;
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	unit = height / 18;
	if(width<sw*0.6){ 
		mini=1;
	}
	draw();
}

function flag(){
	drawflag = 1;
}
function draw(){
	if(block>=0){
		drawflag=0;
		var mode = Math.floor(parameter_value_buffer.peek(1, block*MAX_PARAMETERS + 5, 1)*3);
		outlet(1,"paintrect",x_pos,y_pos,width+x_pos,height+y_pos,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
		if(mode>0){
			outlet(1,"frgb", blockcolour[0]*0.2,blockcolour[1]*0.2,blockcolour[2]*0.2);
			outlet(1,"moveto", x_pos + (width - 2) * playheadpos , y_pos);
			outlet(1,"lineto", x_pos + (width - 2) * playheadpos , y_pos+height - 2);
		}else{
			outlet(1,"frgb", blockcolour);
			outlet(1,"moveto",x_pos+9, y_pos +height /4);
			if(playstate){
				outlet(1,"write", "history")
			}
		}
		var sd = seqdict.get(block);
		var k = sd.getkeys();
		if(k==null){
			return 0;
		}
		var by = y_pos+height - 2;
		var sy = (height-3)/129;
		for(var i=0;i<k.length;i++){
			if(k[i]!="looppoints"){
				var event = seqdict.get(block+"::"+k[i]);
				if(event == null){
				}else if(event[1]>1){
					if(mode==0) event[0] = (1 + event[0] - playheadpos) % 1;
					var ey = by - Math.abs(event[3])*sy;
					var ex1 = x_pos + event[0]*(width-1);
					var col = [(event[1] & 1)*255,(event[1] & 2)*255,(event[1] & 4)*255];
					outlet(1,"frgb",col);
					outlet(1,"moveto",ex1,ey);
					outlet(1,"lineto",ex1,by);
				}else{
					if(mode==0) event[0] = (1 + event[0] - playheadpos) % 1;
					var ey = by - (event[2]-lowestnote)*(height-3)/(highestnote-lowestnote+1);
					var ex1 = x_pos + event[0]*(width-2);
					var ex2 = Math.min(ex1+Math.max(1,event[4]*(width-2)),x_pos+width-2);
					var c = 0.2+0.8* Math.abs(event[3])/128;
					var col = [blockcolour[0]*c,blockcolour[1]*c,blockcolour[2]*c];
					outlet(1,"frgb",col);
					outlet(1,"moveto",ex1,ey);
					outlet(1,"lineto",ex2,ey);
				}
			}
		}
	}
}
/*			outlet(0,"custom_ui_element","mouse_passthrough",x_pos,y_pos,width+x_pos,height+y_pos,0,0,0,block,0);
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
			}*/


function update(){
	messnamed("core.input.keyboard",block,"redraw");
	if(drawflag){
		draw();
		return 0;
	}
}


function voice_is(v){
	block = v;
	if(block>=0){
		blockcolour = blocks.get("blocks["+block+"]::space::colour");
		for(var i=0;i<3;i++)blockcolour[i] = Math.min(255,2*blockcolour[i]);
	}
}
function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}


function store(){
/*	messnamed("to_blockmanager","store_wait_for_me",block);
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
	messnamed("to_blockmanager","store_ok_done",block);*/
}

function enabled(){}