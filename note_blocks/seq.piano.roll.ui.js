outlets = 3;
var MAX_DATA = 16384;
var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
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
seqdict.name = "seq-piano-roll";

var lowestnote = 0;
var highestnote = 128;
var laneslist = [0,0,0,0,0,0,0,0,0,0,0];
var maximisedlist = [0,0,0,0,0,0,0,0,0,0,0];
var noteshade = [1,0.75,1,0.75,1,1,0.75,1,0.75,1,0.75,1];
var laney = [];
var playheadpos = 0;
var playstate = 0;
var pattern = 0;

var start = 0;
var loopstart = 0;
var looplength = 0;

var zoom_start = 0;
var zoom_end = 1;
var zoom_scale = 1;

var mouse_x, mouse_y, mouse_lane, scroll_accumulator = 0;
var hovered_event = -1;
var selected_events = [];

var drawflag = 0;
var draw_mouselayer_flag = 0;

function playhead(p){
	playheadpos = p;
	drawflag = 1;
}
function playing(p){
	playstate = p;
}
function convert_to_lengths(){
	var sd = seqdict.get(block+"::"+pattern);
	var k = sd.getkeys();
	if(k==null){
		drawflag = 1;
		return -1;
	}
	lowestnote = 128; highestnote = 0;
	for(var i=0;i<k.length;i++){
		if(k[i]!="looppoints"){
			var event = seqdict.get(block+"::"+pattern+"::"+k[i]); //[time,type,note,vel]
			if(event == null){
			}else if(event[1]>1){
				laneslist[event[1]] = 1;
			}else if(event[3]>0){ //noteon, find its length
				if(event[2]<lowestnote) lowestnote = event[2];
				if(event[2]>highestnote) highestnote = event[2];
				for(var ii=1;ii<=k.length;ii++){
					var ti = (i+ii) % k.length;
					if(k[ti]!="looppoints"){
						var tev = seqdict.get(block+"::"+pattern+"::"+k[ti]);
						if(tev == null){
						}else if(event[2]==tev[2]){ //note match
							var tt = tev[0]-event[0];
							tt = (tt + 1) % 1;
							event.push(tt); //store length
							if(tev[3]==0){
								seqdict.remove(block+"::"+pattern+"::"+k[ti]); //used up noteoff, remove it.
							}
							ii = 99999;
						}
					}
				}
				if(ii<9999){
					//post("\nFAILED TO FIND LENGTH FOR THIS NOTE",event);
					event.push(0);
				}
				seqdict.replace(block+"::"+pattern+"::"+k[i],event);
			}else if(event[3]<0){
				if(event[2]<lowestnote) lowestnote = event[2];
				if(event[2]>highestnote) highestnote = event[2];
				event.push(0);
				seqdict.replace(block+"::"+pattern+"::"+k[i],event);
			}
		}
	}
	for(var i=0;i<k.length;i++){
		if(k[i]!="looppoints"){
			var event = seqdict.get(block+"::"+pattern+"::"+k[i]); //[time,note,vel]
			if(event==null){
			}else if(event[3]==0) seqdict.remove(block+"::"+pattern+"::"+k[i]);
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
	if(width<sw*0.5){ 
		mini=1;
	}
	if(block>-1) laneheights();
	draw_mouselayer_flag = 1;
	draw();
}

function flag(){
	drawflag = 1;
}

function draw(){
	if(block >= 0){
		drawflag = 0;
		pattern = Math.floor(parameter_value_buffer.peek(1, block*MAX_PARAMETERS,1)*16);
		if(!seqdict.contains(block+"::"+pattern)) return -1;
		var loopnts = seqdict.get(block+"::"+pattern+"::looppoints");
		seql = loopnts[0];
		start = loopnts[1];
		loopstart = loopnts[2];
		looplength = loopnts[3];
		start += Math.floor((parameter_value_buffer.peek(1, block*MAX_PARAMETERS + 1,1)-0.5)*512);
		loopstart += Math.floor((parameter_value_buffer.peek(1, block*MAX_PARAMETERS + 2,1)-0.5)*512);
		looplength += Math.floor((parameter_value_buffer.peek(1, block*MAX_PARAMETERS + 3,1)-0.5)*512);
		if(mini){
			var st = (width-2)*(start/seql);
			var ls = (width-2)*(loopstart/seql);
			var le = ls + (width-2)*(looplength/seql);
			if(le<(width-2)){
				outlet(1,"paintrect",x_pos+le,y_pos,width+x_pos,height+y_pos,blockcolour[0]*0.03,blockcolour[1]*0.03,blockcolour[2]*0.03);
			}
			if(ls==0){
				outlet(1,"paintrect",x_pos,y_pos,le+x_pos,height+y_pos,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
			}else{
				outlet(1,"paintrect",x_pos,y_pos,ls+x_pos,height+y_pos,blockcolour[0]*0.05,blockcolour[1]*0.05,blockcolour[2]*0.05);
				outlet(1,"paintrect",x_pos+ls,y_pos,le+x_pos,height+y_pos,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
			}
			outlet(1,"frgb", blockcolour[0]*0.12,blockcolour[1]*0.12,blockcolour[2]*0.12);
			outlet(1,"moveto", x_pos + st , y_pos);
			outlet(1,"lineto", x_pos + st , y_pos+height - 2);
			outlet(1,"frgb", blockcolour[0]*0.2,blockcolour[1]*0.2,blockcolour[2]*0.2);
			outlet(1,"moveto", x_pos + (width - 2) * playheadpos , y_pos);
			outlet(1,"lineto", x_pos + (width - 2) * playheadpos , y_pos+height - 2);
			var sd = seqdict.get(block+"::"+pattern);
			if(sd == null) return 0;
			var k = sd.getkeys();
			if(k == null) return 0;
			var by = y_pos+height - 2;
			var sy = (height-3)/129;
			for(var i=0;i<k.length;i++){
				if(k[i]!="looppoints"){
					var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
					if(event == null){
					}else if(event[1]>1){
						var ey = by - Math.abs(event[3])*sy;
						var ex1 = x_pos + event[0]*(width-1);
						var col = [(event[1] & 1)*255,(event[1] & 2)*255,(event[1] & 4)*255];
						outlet(1,"frgb",col);
						outlet(1,"moveto",ex1,ey);
						outlet(1,"lineto",ex1,by);
					}else{
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
		}else{
			//starting from the mini code but the following changes:
			//lanes (with maximising)
			//  store lane y positions
			//scroll and zoom (on x axis for all, on y axis for note lanes)
			//notes as rectangles
			if(laney.length==0) laneheights();
			outlet(1,"paintrect",x_pos+9,y_pos,x_pos+width,y_pos+height*0.05,0,0,0);
			outlet(1,"frgb",blockcolour);
			outlet(1,"moveto",x_pos+9,y_pos+height*0.02);
			outlet(1,"write","start:"+start);
			outlet(1,"moveto",x_pos+9+width*0.2,y_pos+height*0.02);
			outlet(1,"write","loopstart:"+loopstart);
			outlet(1,"moveto",x_pos+9+width*0.4,y_pos+height*0.02);
			outlet(1,"write"," length:"+looplength);
			
			//if(draw_mouselayer_flag){
				outlet(0,"custom_ui_element","mouse_passthrough",x_pos,y_pos,width+x_pos,height+y_pos,0,0,0,block,1);
			//	draw_mouselayer_flag = 0;
			//}
			outlet(1,"paintrect",x_pos,y_pos+height*0.05,x_pos+width,y_pos+height*0.09,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
			//for();
			var st = (width-2)*((start/seql)-zoom_start)*zoom_scale;
			var ls = (width-2)*((loopstart/seql)-zoom_start)*zoom_scale;
			var le = Math.min(width-2, ls + (width-2)*(looplength/seql)*zoom_scale);
			mouse_lane = -1;
			hovered_event = -1;
			for(var l=0; l<laney.length-1; l++){
				if((mouse_y>=laney[l])&&(mouse_y<laney[l+1])) mouse_lane = l;
				var r = 18;
				if(l>1){
					if(ls>0) outlet(1,"paintrect",x_pos,laney[l],ls+x_pos,laney[l+1]-4,blockcolour[0]*0.05,blockcolour[1]*0.05,blockcolour[2]*0.05);
					outlet(1,"paintrect",x_pos+ls,laney[l],le+x_pos,laney[l+1]-4,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
					if(le<(width-2)) outlet(1,"paintrect",x_pos+le,laney[l],width+x_pos,laney[l+1]-4,blockcolour[0]*0.03,blockcolour[1]*0.03,blockcolour[2]*0.03);
				}else{
					r = (laney[l+1]-laney[l]-4)/(highestnote-lowestnote+1);
					var rr = laney[l];
					for(var yy = highestnote - lowestnote; yy >= 0; yy--){
						var nr = rr + r;
						var s = noteshade[(yy  + lowestnote) % 12];
						if(ls>0) outlet(1,"paintrect",x_pos,rr,ls+x_pos,nr,blockcolour[0]*0.05*s,blockcolour[1]*0.05*s,blockcolour[2]*0.05*s);
						outlet(1,"paintrect",x_pos+ls,rr,le+x_pos,nr,blockcolour[0]*0.1*s,blockcolour[1]*0.1*s,blockcolour[2]*0.1*s);
						if(le<(width-2)) outlet(1,"paintrect",x_pos+le,rr,width+x_pos,nr,blockcolour[0]*0.03*s,blockcolour[1]*0.03*s,blockcolour[2]*0.03*s);
						rr=nr;
					}
				}
			}

			if((st>=zoom_start)&&(st<=zoom_end)){
				outlet(1,"frgb", blockcolour[0]*0.12,blockcolour[1]*0.12,blockcolour[2]*0.12);
				for(var l=0; l<laney.length-1; l++){
					outlet(1,"moveto", x_pos + (st - zoom_start) * zoom_scale , laney[l]);
					outlet(1,"lineto", x_pos + (st - zoom_start) * zoom_scale , laney[l+1]-6);
				}
			}				
			if((playheadpos>=zoom_start)&&(playheadpos<=zoom_end)){
				outlet(1,"frgb", blockcolour[0]*0.2,blockcolour[1]*0.2,blockcolour[2]*0.2);
				for(var l=0; l<laney.length-1; l++){
					outlet(1,"moveto", x_pos + (width - 2) * (playheadpos - zoom_start) * zoom_scale , laney[l]);
					outlet(1,"lineto", x_pos + (width - 2) * (playheadpos - zoom_start) * zoom_scale , laney[l+1]-6);
				}
			}
			var shown_range_in_beats = seql / zoom_scale;
			var firstbeat = Math.ceil(zoom_start*seql);
			var bw = (width-2)/shown_range_in_beats;
			var step = 24 / bw;
			if(step<1){
				step = 1 / Math.ceil(1 / step);
			}else{
				step = Math.ceil(step);
			}
			outlet(1,"frgb",0,0,0);
			for(var b = -1;b<shown_range_in_beats;b+=Math.min(step,1)){
				var bx = x_pos + (width-2)*(((firstbeat + b) / seql) - zoom_start) * zoom_scale;
				if((bx>=x_pos)&&(bx<(x_pos+width-2))){
					outlet(1,"moveto",bx,y_pos+height*0.08);
					outlet(1,"lineto",bx,y_pos+height);
				}
			}
			outlet(1,"frgb",blockcolour[0]*0.5,blockcolour[1]*0.5,blockcolour[2]*0.5);
			for(var b = 0;b<shown_range_in_beats;b+=step){
				var bx = x_pos + (width-2)*(((firstbeat + b) / seql) - zoom_start) * zoom_scale;
				if((Math.abs(b-Math.floor(b))<step)&&(bx>=x_pos)&&(bx<(x_pos+width-20))){
					outlet(1,"moveto",bx,y_pos+height*0.07);
					outlet(1,"write",Math.floor(firstbeat+b));
				}	
			}

			outlet(1,"frgb", blockcolour[0]*0.2,blockcolour[1]*0.2,blockcolour[2]*0.2);
			for(var l=0; l<laney.length-1; l++){
				outlet(1,"moveto", x_pos+9,laney[l]+Math.max(18,r*0.8));
				outlet(1,"write", "lane "+laneslist[l]);
			}


			var sd = seqdict.get(block+"::"+pattern);
			if(sd == null) return 0;
			var k = sd.getkeys();
			if(k == null) return 0;
			var ll = -99;
			var by = -1; var sy = -1;
			for(var i=0;i<k.length;i++){
				if(k[i]!="looppoints"){
					var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
					if((event == null)||(event[0]<zoom_start)||(event[0]>zoom_end)){
					}else if(event[1]>1){
						if(event[1]!=ll){
							ll = event[1];
							by = laney[1+ll] - 4;
							sy = (laney[1+ll] - laney[ll] - 3)/129;			
						}
						var ey = by - Math.abs(event[3])*sy;
						var ex1 = x_pos + (event[0]-zoom_start)*(width-1)*zoom_scale;
						var col;
						if((mouse_lane==ll)&&(Math.abs(mouse_x-ex1)<=4)){
							hovered_event = k[i];
							col = [255,255,255];
						}
						col = [(event[1] & 1)*255,(event[1] & 2)*255,(event[1] & 4)*255];
						outlet(1,"frgb",col);
						outlet(1,"moveto",ex1,ey);
						outlet(1,"lineto",ex1,by);
					}else{
						if((event[2]<lowestnote)||(event[2]>highestnote)){
							drawflag = 1;
							post("\naborting draw to recalibrate and redo");
							voice_is(block);
							return -1;
						}
						if(event[1]!=ll){
							ll = event[1];
							by = laney[1+ll] - 4;
							sy = (laney[1+ll] - laney[ll] - 4)/(highestnote-lowestnote+1);			
						}
						var ey = by - (event[2]-lowestnote)*sy;
						var ex1 = x_pos + (event[0]-zoom_start)*(width-2)*zoom_scale;
						var ex2 = Math.min(ex1+Math.max(1,event[4]*(width-2)*zoom_scale),x_pos+width-2);
						var col;
						if((mouse_y<=ey)&&(mouse_y>=ey-sy)&&(mouse_x>=ex1)&&(mouse_x<=ex2)){
							hovered_event = k[i];
							col = [255,255,255];
						}else{
							var c = 0.2+0.8* Math.abs(event[3])/128;
							col = [blockcolour[0]*c,blockcolour[1]*c,blockcolour[2]*c];
						}
						outlet(1,"paintrect",ex1,ey-sy,ex2,ey,col);
					}
				}
			}	
			if(hovered_event>-1){
				outlet(1,"frgb",blockcolour);
				var event = seqdict.get(block+"::"+pattern+"::"+hovered_event);
				outlet(1,"moveto",x_pos+9+width*0.6,y_pos+height*0.02);
				outlet(1,"write","selected event:",event[2],event[3],event[4]*seql);
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
	if(drawflag){
		draw();
		return 0;
	}
}


function voice_is(v){
	block = v;
	if(block>=0){
		var voicemap = new Dict;
		voicemap.name = "voicemap";
		var voice = voicemap.get(block);
		if(Array.isArray(voice))voice = voice[0];
		blockcolour = blocks.get("blocks["+block+"]::space::colour");
		for(var i=0;i<3;i++)blockcolour[i] = Math.min(255,2*blockcolour[i]);
		if(blocks.contains("blocks["+v+"]::stored_piano_roll")){ //look for saved seq data
			var sk = blocks.get("blocks["+v+"]::stored_piano_roll");
			var k = sk.getkeys();
			if(k!=null){
				lowestnote = 128;
				highestnote = 0;
				seqdict.setparse(block,"{}");
				var ll=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
				for(var i=0;i<k.length;i++){
					var d = blocks.get("blocks["+block+"]::stored_piano_roll::"+k[i]);
					seqdict.setparse(block+"::"+k[i], "{}");
					seqdict.replace(block+"::"+k[i], d);
					var dk = d.getkeys();
					for(var ii=0;ii<dk.length;ii++){
						if(dk[ii]!="looppoints"){
							var event = d.get(dk[ii]);
							ll[event[1]] = 1;
							maximisedlist[event[1]] = 0;
							if(event[1]<=1){
								if(event[2]>highestnote) highestnote = event[2];
								if(event[2]<lowestnote) lowestnote = event[2];
							}
						}
					}		
				}
				laneslist = [];
				for(var ii=0;ii<ll.length;ii++){
					if(ll[ii]) laneslist.push(ii);
				}
				lowestnote = Math.max(0, lowestnote-1);
				highestnote = Math.min(127, highestnote+1);
			}
		}
		messnamed("note_poly","setvalue",1+voice,"copyfromdict");
	}
}

function laneheights(){
	var used = laneslist.length; 
	var maximised = 0;
	if(used==0) return -1;
	for(var i=0; i<laneslist.length; i++) maximised += maximisedlist[laneslist[i]];
	maximised = 4 * maximised + used;
	maximised = height * 0.9/maximised;
	laney[0] = y_pos + height * 0.1;
	for(var i=1; i<=laneslist.length; i++) laney[i] = laney[i-1] + (4 * maximisedlist[i-1] + 1) * maximised;
	//post("\n",laneslist.length," lane heights:",laney);
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}


function store(){
	messnamed("to_blockmanager","store_wait_for_me",block);
	var sk = seqdict.get(block);
	var k = sk.getkeys();
	if(k!=null){
		blocks.setparse("blocks["+block+"]::stored_piano_roll","{}");
		for(var i=0;i<k.length;i++){
			var d = seqdict.get(block+"::"+k[i]);
			blocks.setparse("blocks["+block+"]::stored_piano_roll::"+k[i], "{}");
			blocks.replace("blocks["+block+"]::stored_piano_roll::"+k[i], d);			
		}
	}
	messnamed("to_blockmanager","store_ok_done",block);
}

function mouse(x,y,l,s,a,c,scr){
	if(scr==1)scr =0;
	moved = (x!=mouse_x)||(y!=mouse_y)||(scr!=0);
	mouse_x = x;
	mouse_y = y;
	drawflag |= moved;
	if(scr){
		if(y<y_pos+0.1*height){
			if(y<y_pos+0.05*height){
				scroll_accumulator += scr;
				if(Math.abs(scroll_accumulator)>1){
					scr = 2*(scroll_accumulator>0)-1;
					scroll_accumulator = 0;
					var loopnts = seqdict.get(block+"::"+pattern+"::looppoints");
					if(x<x_pos+0.2*width){
						loopnts[1] += scr;
					}else if(x<x_pos+0.4*width){
						loopnts[2] += scr;
					}else if(x<x_pos+0.6*width){
						loopnts[3] += scr;
					}
					seqdict.replace(block+"::"+pattern+"::looppoints", loopnts);
				}
			}else{
				if(s){
					zoom_start = Math.max(0,zoom_start+scr);
					zoom_end = Math.min(1,zoom_end+scr);
					zoom_scale = 1 / (zoom_end-zoom_start);
				}else{
					if(zoom_end-zoom_start>scr){
						var xx = (x-x_pos)/width;
						zoom_start = Math.max(0,zoom_start + scr*xx);
						zoom_end = Math.min(1, zoom_end - (1-xx)*scr);
						zoom_scale = 1 / (zoom_end-zoom_start);
						//post("\nzoom",zoom_start,zoom_end,zoom_scale);
					}
				}
			}
		}else if(hovered_event>-1){
			var event = seqdict.get(block+"::"+pattern+"::"+hovered_event);
			var v=0;
			if(event[3]>=0){
				v = Math.min(127,Math.max(0,event[3] - scr*10));
			}else if(event[3]<0){
				v = Math.max(-127,Math.min(0,event[3] + scr*10));
			}
			event[3] = v;
			seqdict.replace(block+"::"+pattern+"::"+hovered_event,event);
		}
	}else if(l==1){
		if(y<y_pos+0.1*height){
			if(y<y_pos+0.05*height){
				
			}else{
				if(a==1){
					zoom_start=0; zoom_end=1; zoom_scale=1;
				}else{

				}
			}
		}
	}else{
		if(moved){
			for(var i=0;i<laney.length-1;i++){
				if((y>laney[i])&&(y<laney[i+1])&&(maximisedlist[i]==0)){
					for(var ii=0;ii<maximisedlist.length;ii++)maximisedlist[ii] = 0;
					maximisedlist[i]=1;
					post("\n",i);
					laneheights();
					drawflag=1;
					post("calced new heights",laney,"maxl",maximisedlist);
				}
			}
		}
	}
}

function keydown(key){
	if(key == -15){
		zoom_start = 0; zoom_end = 1; zoom_scale = 1;
		for(var i=0;i<maximisedlist.length;i++)maximisedlist[i]=0;
		drawflag=1;
	}
}

function enabled(){}