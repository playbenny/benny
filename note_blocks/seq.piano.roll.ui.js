outlets = 3;
var MAX_DATA = 16384;
var MAX_NOTE_VOICES = 64;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var parameter_value_buffer = new Buffer("parameter_value_buffer");
var config = new Dict;
config.name = "config";

var undo = new Dict;
undo.name = "undo";
var undo_stack = new Dict;
undo_stack.name = "undo_stack";

var width, height,x_pos,y_pos,unit,sx,sy,ux,uy;
var block=-1;
var voice;

var blockcolour=[128,128,128];
var pal = [];
var mini=0;
var blocks = new Dict;
blocks.name = "blocks";
var seqdict = new Dict;
seqdict.name = "seq-piano-roll";

var lowestnote = 128;
var highestnote = 0;
var currentquantise = 1;
var quantise_enable = 1;

var timesig = 4;
var tripletgrid = 0;

var sd, k;

// lanes: notes lane (0 or 1, hopefully not both, aim for 1), controllers (2-7), meta (8)
// notes lane gets both a notes view and (when maximised?) a velocities view

// laney is lane y coords, indexed by number not data-no.
// notelane[x] is the number of the lane that holds notes of data-no x
// vallane[x] is the number of teh lane that holds values of data-no x

// laneslist holds the lanes present in the data (eg [1,1,3,4] for notes and some ccs )
// lanetype is the type of that lane (0 notes 1 values 2 meta) (eg [0,1,1,1])

var notelane=[];
var vallane=[];
var metalane=[];

var laneslist = [];
var lanetype = [];
var laneused      = [1,1,0,0,0,0,0,0,0,0,0];
var maximisedlist = [1,0,0,0,0,0,0,0,0,0,0];
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
var selected_event_count = 0;
var seql;
var old_x,old_y,old_l,old_s,old_c;
var clicked = -1;
var drag = 0;
var drag_start_x;
var drag_start_y;
var drag_moved;

var drawflag = 0;
var draw_mouselayer_flag = 0;
var notenames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var nn=[];

var clipboard = [];

//in the meta lane, attach more values to the event, so you don't need too many lanes. however, having some 
//redundancy is good so you could eg stack probabilistic transposes
var metatypes = ["skip", "velocity randomisation", "cc randomisation", "note divide", "arp", "octaves up transpose", "octaves down transpose", "chromatic transpose", "chromatic transpose", "chromatic transpose"  ];
var metatype_params = [["chance/every"], ["range"], ["range"], ["division"], ["division","pattern"], ["chance/every","range"],["chance/every","range"],["chance/every","range"],["chance/every","range"],["chance/every","range"]]
// more types? trills and arps? splitting - eg if the param is 3 it divides the length by 3 and plays 3 notes?
// randomise velocity
var metatype_defaults = [ [-127], [64], [64], [2], [2,2], [-127,2], [-127, 2], [-127,1],[-127,1], [-127,1] ];

function playhead(p){
	playheadpos = p;
	drawflag = 1;
}

function playing(p){
	playstate = p;
}

function convert_to_lengths(){
	sd = seqdict.get(block+"::"+pattern);
	k = sd.getkeys();
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
				if(event[1]==0)event[1]=1;
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
	var csize = config.getsize("palette::gamut");
	var cstep = Math.ceil(csize/16);
	for(var i=0;i<16;i++){
		pal[i] = config.get("palette::gamut["+((i*cstep) % csize)+"]::colour");
		for(var ii=0;ii<3;ii++) pal[i][ii] = Math.min(255,2*pal[i][ii]);
	}
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
	zoom_to_pattern();
	draw();
}

function flag(f){
	if(f==null){
		drawflag |= 1;
	}else{
		drawflag |= f;
	}
}

function draw(){
	if(drawflag&2)get_note_range();
	if((drawflag&4) && mini)zoom_to_pattern();
	//post("draw",drawflag);
	drawflag = 0;
	pattern = Math.floor(parameter_value_buffer.peek(1, block*MAX_PARAMETERS,1)*16);
	if(!seqdict.contains(block+"::"+pattern)){
		post("\nno sequence data found, inserted default empty sequence");
		seqdict.setparse(block+"::"+pattern,"{}"); 
		seqdict.setparse(block+"::"+pattern+"::looppoints", "*");//
		seqdict.replace(block+"::"+pattern+"::looppoints", [256, 0, 0, 16]);
		zoom_to_pattern();
		get_note_range();
		drawflag=1;
		copytoseq();
		//return -1;
	}
	var loopnts = seqdict.get(block+"::"+pattern+"::looppoints");
	if(!Array.isArray(loopnts)){
		error("loop points not in seq");
		loopnts = [256,0,16,16];
		seqdict.setparse(block+"::"+pattern+"::looppoints", "*");//
		seqdict.replace(block+"::"+pattern+"::looppoints", [256, 0, 16, 16]);
		post("\ninserted default looppoints");
		zoom_to_pattern();
		get_note_range();
		drawflag = 1;
		copytoseq();
	}
	seql = loopnts[0];
	start = loopnts[1];
	loopstart = loopnts[2];
	looplength = loopnts[3];
	start += Math.floor((parameter_value_buffer.peek(1, block*MAX_PARAMETERS + 1,1)-0.5)*512);
	loopstart += Math.floor((parameter_value_buffer.peek(1, block*MAX_PARAMETERS + 2,1)-0.5)*512);
	looplength += Math.floor((parameter_value_buffer.peek(1, block*MAX_PARAMETERS + 3,1)-0.5)*512);
	sd = seqdict.get(block+"::"+pattern);
	if(sd == null) return 0;
	k = sd.getkeys();
	if(k == null) return 0;
	if(mini){
		var st = (width-2)*((start/seql)-zoom_start)*zoom_scale;
		var ls = (width-2)*((loopstart/seql)-zoom_start)*zoom_scale;
		var ls2 = Math.max(0,ls);
		var le = Math.min(width-2, ls + (width-2)*(looplength/seql)*zoom_scale);

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
		outlet(1,"moveto", x_pos + (width - 2) * (playheadpos-zoom_start) * zoom_scale, y_pos);
		outlet(1,"lineto", x_pos + (width - 2) * (playheadpos-zoom_start) * zoom_scale, y_pos+height - 2);
		var by = y_pos+height - 2;
		var sy = (height-3)/129;
		for(var i=1;i<k.length;i++){
			var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
			if((event == null)||(event[0]<zoom_start)||(event[0]>zoom_end)){
			}else if((event[1]>0)&&(event[1]!=9)){
				var ey = by - Math.abs(event[3])*sy;
				var ex1 = x_pos + (event[0]-zoom_start)*(width-2)*zoom_scale;
				//var ex1 = x_pos + event[0]*(width-1);
				var col = pal[(event[1]-1)];
				outlet(1,"frgb",col);
				outlet(1,"moveto",ex1,ey);
				outlet(1,"lineto",ex1,by);
			}else{
				var ey = by - (event[2]-lowestnote)*(height-3)/(highestnote-lowestnote+1);
				var ex1 = x_pos + (event[0]-zoom_start)*(width-2)*zoom_scale;
				var ex2 = Math.min(ex1+Math.max(1,event[4]*(width-2)*zoom_scale),x_pos+width-2);
				//var ex1 = x_pos + event[0]*(width-2);
				//var ex2 = Math.min(ex1+Math.max(1,event[4]*(width-2)),x_pos+width-2);
				var c = 0.2+0.8* Math.abs(event[3])/128;
				var col = [blockcolour[0]*c,blockcolour[1]*c,blockcolour[2]*c];
				outlet(1,"frgb",col);
				outlet(1,"moveto",ex1,ey);
				outlet(1,"lineto",ex2,ey);
			}
		}
	}else{
		//starting from the mini code but the following changes:
		//lanes (with maximising)
		//  store lane y positions
		//scroll and zoom (on x axis for all, on y axis for note lanes)
		//notes as rectangles
		if(laney.length==0) laneheights();
		laneused=[1,0,0,0,0,0,0,0,0,0];
		outlet(1,"paintrect",x_pos+9,y_pos,x_pos+width,y_pos+height*0.05,0,0,0);
		outlet(1,"frgb",blockcolour);
		outlet(1,"moveto",x_pos,y_pos+height*0.02);
		outlet(1,"write","start:"+start);
		outlet(1,"moveto",x_pos+width*0.1,y_pos+height*0.02);
		outlet(1,"write","loopstart:"+loopstart);
		outlet(1,"moveto",x_pos+width*0.2,y_pos+height*0.02);
		outlet(1,"write","length:"+looplength);

		outlet(0,"custom_ui_element","mouse_passthrough",x_pos - (x_pos==9)*9,y_pos,width+x_pos,height+y_pos,0,0,0,block,1);
	
		outlet(1,"paintrect",x_pos,y_pos+height*0.05,x_pos+width,y_pos+height*0.09,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
		var labelled=[];
		var st = (width-2)*((start/seql)-zoom_start)*zoom_scale;
		var ls = (width-2)*((loopstart/seql)-zoom_start)*zoom_scale;
		var ls2 = Math.max(0,ls);
		var le = Math.min(width-2, ls + (width-2)*(looplength/seql)*zoom_scale);
		mouse_lane = -1;
		hovered_event = -1;
		selected_event_count = 0;
		for(var l=0; l<laney.length-1; l++){
			var ll = laneslist[l]; //actual lane
			if((mouse_y>=laney[l])&&(mouse_y<laney[l+1])) mouse_lane = l;
			var r = 18;
			if((lanetype[l]==1)||(maximisedlist[l]==0)){
				if(ls>0) outlet(1,"paintrect",x_pos,laney[l],ls+x_pos,laney[l+1]-4,blockcolour[0]*0.05,blockcolour[1]*0.05,blockcolour[2]*0.05);
				outlet(1,"paintrect",x_pos+ls2,laney[l],le+x_pos,laney[l+1]-4,blockcolour[0]*0.1,blockcolour[1]*0.1,blockcolour[2]*0.1);
				if(le<(width-2)) outlet(1,"paintrect",x_pos+le,laney[l],width+x_pos,laney[l+1]-4,blockcolour[0]*0.03,blockcolour[1]*0.03,blockcolour[2]*0.03);
			}else if(lanetype[l]==0){
				r = (laney[l+1]-laney[l]-4)/(highestnote-lowestnote+1);
				var rr = laney[l];
				for(var yy = highestnote - lowestnote; yy >= 0; yy--){
					var nr = rr + r;
					var s = (0.5*maximisedlist[ll])+noteshade[(yy  + lowestnote) % 12];
					if(ls>0) outlet(1,"paintrect",x_pos,rr,ls+x_pos,nr,blockcolour[0]*0.05*s,blockcolour[1]*0.05*s,blockcolour[2]*0.05*s);
					outlet(1,"paintrect",x_pos+ls2,rr,le+x_pos,nr,blockcolour[0]*0.1*s,blockcolour[1]*0.1*s,blockcolour[2]*0.1*s);
					if(le<(width-2)) outlet(1,"paintrect",x_pos+le,rr,width+x_pos,nr,blockcolour[0]*0.03*s,blockcolour[1]*0.03*s,blockcolour[2]*0.03*s);
					rr=nr;
				}
			}else{// if(lanetype[l]==2){
				r = (laney[l+1]-laney[l]-4)/(metatypes.length+1);
				var rr = laney[l];
				for(var yy = metatypes.length; yy > 0; yy--){
					var nr = rr + r;
					var s = (0.5*maximisedlist[ll])+(((yy%2)+1)*0.5);
					if(ls>0) outlet(1,"paintrect",x_pos,rr,ls+x_pos,nr,blockcolour[0]*0.05*s,blockcolour[1]*0.05*s,blockcolour[2]*0.05*s);
					outlet(1,"paintrect",x_pos+ls2,rr,le+x_pos,nr,blockcolour[0]*0.1*s,blockcolour[1]*0.1*s,blockcolour[2]*0.1*s);
					if(le<(width-2)) outlet(1,"paintrect",x_pos+le,rr,width+x_pos,nr,blockcolour[0]*0.03*s,blockcolour[1]*0.03*s,blockcolour[2]*0.03*s);
					rr=nr;
				}
			}
			outlet(1,"paintrect",x_pos,laney[l+1]-4,width+x_pos,laney[l+1],0,0,0);
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
		var firstbeat_f = firstbeat - zoom_start*seql;
		var step = 1;
		while(bw*step<12){ step *= 2; }
		var bw2 = bw;
		var s2=1;
		if(bw2>48){
			if(tripletgrid){ bw2 /= 3; s2 *= 3; }
			while(bw2>48){ bw2 *= 0.5; s2 *= 2; }
		}
		var extleft=Math.floor(firstbeat_f*s2);
		outlet(1,"frgb",0,0,0);
		var bx = x_pos + bw*firstbeat_f - extleft*bw2; //(width-2)*(((firstbeat + b) / seql) - zoom_start) * zoom_scale;
		var s3 = 1/s2;
		for(var b = firstbeat-extleft;bx<x_pos+width-2;bx+=bw2){
			var test = (b*s2) % step;
			if((test < 0.00001)||(step-test < 0.00001)){
				outlet(1,"moveto",bx,y_pos+height*0.08);
				outlet(1,"lineto",bx,y_pos+height);
			}
			b+=s3;
		}
		currentquantise = s3;
		if(quantise_enable && !old_s){
			outlet(1,"frgb",blockcolour[0]*0.5,blockcolour[1]*0.5,blockcolour[2]*0.5);
		}else{
			outlet(1,"frgb",99,99,99);
		}
		outlet(1,"moveto",x_pos+width*0.3,y_pos+height*0.02);
		if(currentquantise<1){
			outlet(1,"write","grid: 1/"+Math.round(1/currentquantise));
		}else{
			outlet(1,"write","grid:"+currentquantise);
		}
		outlet(1,"frgb",blockcolour[0]*0.5,blockcolour[1]*0.5,blockcolour[2]*0.5);

		var bx = x_pos + bw*firstbeat_f; //(width-2)*(((firstbeat + b) / seql) - zoom_start) * zoom_scale;
		while(bw*step<24){ step *= 2; }
		for(var b = firstbeat;bx<x_pos+width-20;bx+=bw){
			if(b == start){
				outlet(1,"frgb",blockcolour[0]*0.2,blockcolour[1]*0.2,blockcolour[2]*0.2);
				outlet(1,"paintpoly",bx , y_pos+height*0.055, bx, y_pos+height*0.085, bx+height*0.03, y_pos+height*0.07, bx, y_pos+height*0.055);
				outlet(1,"frgb",blockcolour);
				outlet(1,"moveto",bx,y_pos+height*0.075);
				outlet(1,"write",Math.floor(b));
				outlet(1,"frgb",blockcolour[0]*0.5,blockcolour[1]*0.5,blockcolour[2]*0.5);
			}else if(b == loopstart){
				outlet(1,"frgb",blockcolour[0]*0.2,blockcolour[1]*0.2,blockcolour[2]*0.2);
				outlet(1,"framepoly",bx , y_pos+height*0.055, bx, y_pos+height*0.085, bx+height*0.03, y_pos+height*0.07, bx, y_pos+height*0.055);
				outlet(1,"frgb",blockcolour[0]*0.5,blockcolour[1]*0.5,blockcolour[2]*0.5);
				outlet(1,"moveto",bx,y_pos+height*0.075);
				outlet(1,"write",Math.floor(b));
			}else if(b == loopstart + looplength){
				outlet(1,"frgb",blockcolour[0]*0.2,blockcolour[1]*0.2,blockcolour[2]*0.2);
				outlet(1,"framepoly",bx , y_pos+height*0.055, bx, y_pos+height*0.085, bx-height*0.03, y_pos+height*0.07, bx, y_pos+height*0.055);
				outlet(1,"frgb",blockcolour[0]*0.5,blockcolour[1]*0.5,blockcolour[2]*0.5);
				outlet(1,"moveto",bx,y_pos+height*0.075);
				outlet(1,"write",Math.floor(b));
			}else if((b % step) == 0){//(2*Math.abs(b-Math.floor(b))<step)&&(bx>=x_pos)&&(bx<(x_pos+width-20))){
				outlet(1,"moveto",bx,y_pos+height*0.075);
				outlet(1,"write",Math.floor(b));
			}
			b++;
		}

		for(var l=0; l<laney.length-1; l++){
			var s = ((maximisedlist[l]==1) + 0.45);
			outlet(1,"frgb", blockcolour[0]*s,blockcolour[1]*s,blockcolour[2]*s);
			outlet(1,"moveto", x_pos+9,laney[l]+12);//Math.max(12,r*0.8));
			//outlet(1,"write", "lane "+laneslist[l]);
			if(lanetype[l]==0){
				outlet(1,"write", "notes "+laneslist[l]);
			}else if(laneslist[l]==0){
				outlet(1,"write", "velocity "+laneslist[l]);
			}else if(lanetype[l]==1){
				outlet(1,"write", "cc "+(laneslist[l]));
			}else if(lanetype[l]==2){
				outlet(1,"write", "meta");
				if(maximisedlist[l]==1){
					outlet(1,"frgb",blockcolour[0]*0.4,blockcolour[1]*0.4,blockcolour[2]*0.4);
					r = (laney[l+1]-laney[l]-4)/(metatypes.length+1);
					rr = laney[l]-0.2*r;
					for(var yy = 0; yy < metatypes.length; yy++){
						rr += r;
						outlet(1,"moveto",x_pos+18,rr);
						outlet(1,"write",metatypes[yy]);
					}
	
				}
			}			
		}
		var selx1,selx2,sely1,sely2;
		if(drag!=0){
			if(drag == -2){
				if(drag_start_x<old_x){
					selx1 = drag_start_x;
					selx2 = old_x;
				}else{
					selx1 = old_x;
					selx2 = drag_start_x;
				}
				if(drag_start_y<old_y){
					sely1 = drag_start_y;
					sely2 = old_y;
				}else{
					sely1 = old_y;
					sely2 = drag_start_y;
				}
				outlet(1,"paintrect",selx1,sely1,selx2,sely2,0,0,0);
			}
		}

		var ll = -99; var ll2 = -99;
		var by = -1; var sy = -1; var by2 = -1; var sy2=-1;
		for(var i=1;i<k.length;i++){ //[0] is the looppoints
			var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
			if((event == null)||((event[0]+event[4])<zoom_start)||(event[0]>zoom_end)){
			}else{
				if(event[1]==9){
					laneused[9] = 1;
					if(ll2!=9){
						ll2 = 9;
						by2 = laney[1+metalane[ll2]] - 4;
						sy2 = (laney[1+metalane[ll2]] - laney[metalane[ll2]] - 4)/(1 + metatypes.length);
					}
					var ey = by2 - (metatypes.length - event[2])*sy2;
					var ex1 = x_pos + (event[0]-zoom_start)*(width-2)*zoom_scale;
					var ex2 = Math.min(ex1+Math.max(1,event[4]*(width-2)*zoom_scale),x_pos+width-2);
					ex1 = Math.max(x_pos, ex1);
					var c = 0.2+0.8* Math.abs(event[3])/128;
					if(drag==-2){
						if((ex1>selx1)&&(ex2<selx2)&&(ey-sy2>sely1)&&(ey<sely2)){
							selected_events[k[i]] |= 4;
						}else{
							selected_events[k[i]] &= 3;
						}
					}
					col = pal[(8+event[2])% 16];
					if((hovered_event==k[i])||((mouse_y<=ey)&&(mouse_y>=ey-sy2)&&(mouse_x>=ex1)&&(mouse_x<=ex2))){
						hovered_event = k[i];
						if(selected_events[k[i]]){
							col = [(col[1]+64)*0.8,(col[2]+64)*0.8,(col[0]+64)*0.8];
						}else{
							col = [255,255,255];
						}
					}else if(selected_events[k[i]]){
						selected_event_count++;
						col = [col[1]*c,col[2]*c,col[0]*c];
					}else{
						col = [col[0]*c,col[1]*c,col[2]*c];
					}
					outlet(1,"paintrect",ex1,ey-Math.max(1,sy2),ex2,ey,col);
					//post("\nmeta rectangle",ex1,ey-Math.max(1,sy2),ex2,ey,col);
					if((maximisedlist[10] == 1)){
						//post("label",metatype_params[event[2]]);
						outlet(1,"moveto",ex1+4,ey-sy2*0.1);
						outlet(1,"frgb",0,0,0);
						outlet(1,"write",metatypes[event[2]]);
					}
				}else{
				//if(event[1]!=9){
					// all events have a value graph to draw: (apart from meta events)					
					if(event[1]!=ll){
						ll = event[1];
						laneused[event[1]] = 1;
						by = laney[1+vallane[ll]] - 6;
						sy = (laney[1+vallane[ll]] - laney[vallane[ll]] - 6)/128;			
					}
					var vey = by - Math.abs(event[3])*sy;
					var vex1 = x_pos + (event[0]-zoom_start)*(width-1)*zoom_scale;
					if(mouse_lane==vallane[ll]){
						if(Math.abs(mouse_x-vex1)<=4) hovered_event = k[i];
						if(drag==-2){
							if((vex1>selx1)&&(vex1<selx2)&&(by>sely1)&&(vey<sely2)){
								selected_events[k[i]] |= 2;
							}else{
								selected_events[k[i]] &= 1;
							}
						}
					}
				
					var col; // don't draw values until after the note lane bit in case they're hovered there
					if(lanetype[ll]==0){
						// some also have a note lane
						if(event[1]!=ll2){
							ll2 = event[1];
							by2 = laney[1+notelane[ll2]] - 4;
							sy2 = (laney[1+notelane[ll2]] - laney[notelane[ll2]] - 4)/(highestnote-lowestnote+1);	
						}
						if((event[2]<lowestnote)||(event[2]>highestnote)){
							drawflag = 2;
							return 0;
						}
						var ey = by2 - (event[2]-lowestnote)*sy2;
						var ex1 = x_pos + (event[0]-zoom_start)*(width-2)*zoom_scale;
						var ex2 = Math.min(ex1+Math.max(1,event[4]*(width-2)*zoom_scale),x_pos+width-2);
						ex1 = Math.max(x_pos, ex1);
						var c = 0.2+0.8* Math.abs(event[3])/128;
						if(drag==-2){
							if((ex1>selx1)&&(ex2<selx2)&&(ey-sy2>sely1)&&(ey<sely2)){
								selected_events[k[i]] |= 4;
							}else{
								selected_events[k[i]] &= 3;
							}
						}
						if((hovered_event==k[i])||((mouse_y<=ey)&&(mouse_y>=ey-sy2)&&(mouse_x>=ex1)&&(mouse_x<=ex2))){
							hovered_event = k[i];
							if(selected_events[k[i]]){
								col = [(blockcolour[1]+64)*0.8,(blockcolour[2]+64)*0.8,(blockcolour[0]+64)*0.8];
							}else{
								col = [255,255,255];
							}
						}else if(selected_events[k[i]]){
							selected_event_count++;
							col = [blockcolour[1]*c,blockcolour[2]*c,blockcolour[0]*c];
						}else{
							col = [blockcolour[0]*c,blockcolour[1]*c,blockcolour[2]*c];
						}
						outlet(1,"paintrect",ex1,ey-Math.max(1,sy2),ex2,ey,col);
						if((maximisedlist[notelane[ll]] == 1) && (labelled[event[2]]!=1)){
							labelled[event[2]] = 1;
							outlet(1,"moveto",ex1+4,ey-sy2*0.1);
							outlet(1,"frgb",0,0,0);
							outlet(1,"write",nn[event[2]]);
						}
					}else{
						if(ll>0){
							col = pal[(event[1]-1)];
						}else{
							col = blockcolour;
						}
						if(hovered_event == k[i]){
							if(selected_events[k[i]]){
								selected_event_count++;
								col = [(col[1]+64)*0.8,(col[2]+64)*0.8,(col[0]+64)*0.8];
							}else{
								col = [255,255,255];
							}
						}else if(selected_events[k[i]]){
							selected_event_count++;
							col = [col[1],col[2],col[0]];
						}
					}
					if(vex1>=x_pos){
						outlet(1,"frgb",col);
						outlet(1,"moveto",vex1,vey);
						outlet(1,"lineto",vex1,by);
					}
				}
			}
		}	
		if(hovered_event>-1){
			outlet(1,"frgb",blockcolour);
			var event = seqdict.get(block+"::"+pattern+"::"+hovered_event);
			outlet(1,"moveto",x_pos+9+width*0.36,y_pos+height*0.02);
			if(event[1]==0){
				outlet(1,"write","hovered note:",nn[event[2]],event[3].toFixed(2),"start:", time_to_beat_divs(event[0]), "length:",time_to_beat_divs(event[4]));
			}else if(event[1]==9){
				var displayedparams = "";
				var ind = 3;
				for(var p=0;p<metatype_params[event[2]].length;p++){
					if(metatype_params[event[2]][p]=="chance/every"){
						if(event[ind]<0){
							displayedparams += (128+event[ind]).toFixed(2) + "in every 128";
						}else{
							displayedparams += ((event[ind]/1.27).toFixed(2))+"% chance";
						}
					}else if(metatype_params[event[2]][p]=="range"){
						displayedparams += "range:" + (1 + Math.floor(event[ind] / 16));
					}else if(metatype_params[event[2]][p]=="division"){
						displayedparams += "division:" + (2 + Math.floor(event[ind] / 8));
					}
					if(ind==3){
						ind=5;
					}else{
						ind++;
					}
				}
				outlet(1,"write","hovered meta:",metatypes[event[2]],displayedparams,"start:", time_to_beat_divs(event[0]), "length:",time_to_beat_divs(event[4]));
			}else{
				outlet(1,"write","hovered cc:",event[1]-1,event[3].toFixed(2),"start:", time_to_beat_divs(event[0]), "length:",time_to_beat_divs(event[4]));
			}
		}else{
			if(selected_event_count==1){
				for(var se=0;se<selected_events.length;se++){
					if(selected_events[se]){
						outlet(1,"frgb",blockcolour[1],blockcolour[2],blockcolour[0]);
						var event = seqdict.get(block+"::"+pattern+"::"+se);
						outlet(1,"moveto",x_pos+9+width*0.36,y_pos+height*0.02);
						if(event[1]==0){
							outlet(1,"write","selected event:",nn[event[2]], event[3].toFixed(2),"start:", time_to_beat_divs(event[0]), "length:",time_to_beat_divs(event[4]));
						}else if(event[1]==9){
							outlet(1,"write","selected meta:",metatypes[event[2]],"start:", time_to_beat_divs(event[0]), "length:",time_to_beat_divs(event[4]));
						}else{
							outlet(1,"write","selected cc:",event[1], event[3].toFixed(2),"start:", time_to_beat_divs(event[0]), "length:",time_to_beat_divs(event[4]));
						}
					}
				}
			}
		}
		if(selected_event_count>0){
			outlet(1,"frgb",blockcolour[1],blockcolour[2],blockcolour[0]);
			outlet(1,"moveto",x_pos+9+width*0.36,y_pos+height*0.04);
			outlet(1,"write",selected_event_count,"events selected");
		}
	}
}

function get_note_range() {
	var nlowestnote = 128;
	var nhighestnote = -1;
	if(Array.isArray(k) && k.length>1){
		for (var i = 1; i < k.length; i++) { //[0] is the looppoints
			var event = seqdict.get(block + "::" + pattern + "::" + k[i]);
			if ((event[1] == 0) && (event[0] > zoom_start) && (event[0] < zoom_end)) {
				if (event[2] > nhighestnote) nhighestnote = event[2];
				if (event[2] < nlowestnote) nlowestnote = event[2];
			}
		}
	}
	if (nhighestnote == -1) {
		if (lowestnote > highestnote) {
			lowestnote = 50; 
			highestnote = 70;
		}
	} else {
		lowestnote = Math.max(0, nlowestnote - 10);
		highestnote = Math.min(127, nhighestnote + 10);
	}
}

function update(){
	if((block>=0) && drawflag){
		draw();
	}
}


function voice_is(v){
	post("\nvoiceis",v);
	block = v;
	if(block>=0){
		var voicemap = new Dict;
		voicemap.name = "voicemap";
		voice = voicemap.get(block);
		if(Array.isArray(voice))voice = voice[0];
		pattern = Math.floor(parameter_value_buffer.peek(1, block*MAX_PARAMETERS,1)*16);
		blockcolour = blocks.get("blocks["+block+"]::space::colour");
		for(var i=0;i<3;i++)blockcolour[i] = Math.min(255,2*blockcolour[i]);
		if(!blocks.contains("blocks["+v+"]::stored_piano_roll")) store();
		if(blocks.contains("blocks["+v+"]::stored_piano_roll")){ //look for saved seq data
			var sk = blocks.get("blocks["+v+"]::stored_piano_roll");
			var k = sk.getkeys();
			if(k!=null){
				lowestnote = 128;
				highestnote = 0;
				seqdict.setparse(block,"{}");
				laneused=[1,0,0,0,0,0,0,0,0,0]; //1,1,1,1,1,1,1,
				for(var i=0;i<k.length;i++){
					var d = blocks.get("blocks["+block+"]::stored_piano_roll::"+k[i]);
					seqdict.setparse(block+"::"+k[i], "{}");
					seqdict.replace(block+"::"+k[i], d);
					var dk = d.getkeys();
					if(dk!=null){
						for(var ii=0;ii<dk.length;ii++){
							if(dk[ii]!="looppoints"){
								var event = d.get(dk[ii]);
								laneused[event[1]] = 1;
								if(event[1]==0){
									if(event[2]>highestnote) highestnote = event[2];
									if(event[2]<lowestnote) lowestnote = event[2];
								}
							}
						}		
					}
				}
				laneslist = []; lanetype = [];
				laneused[0]=1;
				for(var ii=0;ii<laneused.length;ii++){
					maximisedlist[ii] = (ii==0);
					if(ii==9){
						laneslist.push(ii);
						lanetype.push(2);
						metalane[ii]=laneslist.length-1;							
					}else if(ii==0){
						laneslist.push(ii);
						lanetype.push(0);
						notelane[ii]=laneslist.length-1;							
						laneslist.push(ii);
						lanetype.push(1);
						vallane[ii]=laneslist.length-1;
					}else{
						laneslist.push(ii);
						lanetype.push(1);
						vallane[ii]=laneslist.length-1;
					}
				}
				lowestnote = Math.max(0, lowestnote-1);
				highestnote = Math.min(127, highestnote+1);
			}
		}else{
			seqdict.setparse(block,"{}");
			seqdict.setparse(block+"::"+pattern, "{}");
			seqdict.setparse(block+"::"+pattern+"::looppoints", "*");//
			seqdict.replace(block+"::"+pattern+"::looppoints", [256, 0, 0, 16]);
		}
		copytoseq();
		post("\nlaneslist",laneslist);
		post("\nlanetype",lanetype);
		post("\nnotelane",notelane);
		post("\nval lane",vallane);
		post("\nmeta lane",metalane);
		post("\nlane used",laneused);
	}
}

function copytoseq(){
	//post("\ncopytoseq",1+voice);
	messnamed("to_polys","note", "setvalue",1+voice,"copyfromdict");
}

function laneheights(){
	var used=0;
	var unused;
	for(var i=0;i<laneslist.length;i++) used += (laneused[i]|0);
	unused = laneslist.length - used;
	if(used==0) return -1;
	var maximised = 0;
	for(var i=0; i<laneslist.length; i++) {
		maximised += (maximisedlist[i]==1);
	}
	post("\nmaximised",maximised,"used",used,"unused",unused);
	maximised = 8 * maximised + used + 0.4*unused;
	maximised = height * 0.9/maximised;
	laney[0] = y_pos + height * 0.1;
	for(var i=1; i<=laneslist.length; i++){
		laney[i] = laney[i-1] + (8 * (maximisedlist[i-1]|0) + 0.4 + 0.6 * (laneused[Math.max(0,i-2)]|0)) * maximised;
	}
	post("\nlaney",laney);
	post("\nmaximisedlist",maximisedlist);
}

function voice_offset(){}
function loadbang(){
	for(var i=0;i<128;i++){
		nn[i]=notenames[i%12]+(Math.floor(i/12) - 2);
	}
	outlet(0,"getvoice");
}


function store(){
	if(block>=0){
		var sk = seqdict.get(block);
		if(sk!=null){
			messnamed("to_blockmanager","store_wait_for_me",block);
			var k = sk.getkeys();
			if(k!=null){
				blocks.setparse("blocks["+block+"]::stored_piano_roll","{}");
				for(var i=0;i<k.length;i++){
					blocks.setparse("blocks["+block+"]::stored_piano_roll::"+k[i], "{}");
					var d = seqdict.get(block+"::"+k[i]);
					if(d!=null){
						blocks.replace("blocks["+block+"]::stored_piano_roll::"+k[i], d);			
					}
				}
			}
			messnamed("to_blockmanager","store_ok_done",block);
		}
	}
}

function mouse(x,y,l,s,a,c,scr){
	if(scr==1) scr =0;
	moved = (x!=mouse_x)||(y!=mouse_y)||(scr!=0);
	mouse_x = x;
	mouse_y = y;
	//drawflag |= moved;
	if(scr){
		if(y<y_pos+0.1*height){
			if(y<y_pos+0.05*height){
				scroll_accumulator += scr;
				if(Math.abs(scroll_accumulator)>1){
					scr = 2*(scroll_accumulator>0)-1;
					scroll_accumulator = 0;
					var loopnts = seqdict.get(block+"::"+pattern+"::looppoints");
					if(x<x_pos+0.1*width){
						loopnts[1] += scr;
						loopnts[1] = Math.max(0,loopnts[1]);
						loopnts[1] = Math.min(loopnts[0],loopnts[1]);
					}else if(x<x_pos+0.2*width){
						loopnts[2] += scr;
						loopnts[2] = Math.max(0,loopnts[2]);
						loopnts[2] = Math.min(loopnts[0]-loopnts[3],loopnts[2]);
					}else if(x<x_pos+0.3*width){
						loopnts[3] += scr;
						loopnts[3] = Math.max(1,loopnts[3]); //? smaller would be fine
						loopnts[3] = Math.min(loopnts[0]-loopnts[2],loopnts[3]);
					}
					drawflag = 1;
					seqdict.replace(block+"::"+pattern+"::looppoints", loopnts);
					post("\nupdate lengths,",1+voice);
					messnamed("to_polys","note", "setvalue",1+voice,"updatelengths");
				}
			}else{
				if(s){
					var tl= zoom_end-zoom_start;
					scr /= -zoom_scale;
					if(scr<0){
						zoom_start = Math.max(0,zoom_start+scr*0.1);
						zoom_end = zoom_start+tl;
					}else{
						zoom_end = Math.min(1,zoom_end+scr*0.1);
						zoom_start = zoom_end-tl;
					}
					drawflag = 1;
				}else{
					scr *= 0.125;
					if(zoom_end-zoom_start>scr){
						var xx = (x-x_pos)/width;
						zoom_start = Math.max(0,zoom_start + scr*xx);
						zoom_end = Math.min(1, zoom_end - (1-xx)*scr);
						zoom_scale = 1 / (zoom_end-zoom_start);
						//post("\nzoom",zoom_start,zoom_end,zoom_scale);
					}
					drawflag = 1;
				}
			}
		}else if(hovered_event>-1){
			if(s) scr *= 0.1;
			if(selected_events[hovered_event]==0){
				var event = seqdict.get(block+"::"+pattern+"::"+hovered_event);
				//if ctrl held it adjusts length;
				if(c){
					event[4] -= scr*0.25/seql;
					event[4] = Math.max(event[4],0.000000001);
				}else{
					var v=0;
					if(event[3]>=0){
						v = Math.min(127,Math.max(0,event[3] + scr*10));
					}else if(event[3]<0){
						v = Math.max(-127,Math.min(0,event[3] - scr*10));
					}
					event[3] = v;
				}
				seqdict.replace(block+"::"+pattern+"::"+hovered_event,event);
				copytoseq();
			}else{
				for(i=0;i<k.length;i++){
					if(selected_events[k[i]]){
						var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
						if(c){
							event[4] -= scr*0.25/seql;
							event[4] = Math.max(event[4],0.000000001);
						}else{
							var v=0;
							if(event[3]>=0){
								v = Math.min(127,Math.max(0,event[3] + scr*10));
							}else if(event[3]<0){
								v = Math.max(-127,Math.min(0,event[3] - scr*10));
							}
							event[3] = v;
						}
						seqdict.replace(block+"::"+pattern+"::"+k[i],event);
						copytoseq();
					}
				}
			}
			drawflag = 1;
		}
	}else if(l==1){
		if(old_l==0){ //a click happens
			clicked = hovered_event;
			if((clicked == -1) && c) clicked = -2;
			drag_start_x = x;
			drag_start_y = y;
			if(clicked<0){
				drag = 3 + clicked;
			}else{
				drag = 3 + (selected_events[clicked]>0)|0;
				if(selected_events[clicked]){
					undo.clear();
					for(i=1;i<k.length;i++){
						if(selected_events[k[i]]>0){
							var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
							undo.replace(k[i],event);
						}
					}
				}else{
					undo.clear();
					var event = seqdict.get(block+"::"+pattern+"::"+hovered_event);
					undo.replace(hovered_event,event);
				}
			}
			drag_moved = 0;
			//post("\nset drag",drag);
			old_l = 1;
		}else{//already clicked, so a drag
			//post("\n---");
			if(drag>0){
				drag=-drag;
				if((hovered_event>-1) && (selected_events[hovered_event]!=1)){
					selected_event_count=1;
					selected_events=[];
					selected_events[hovered_event]=1;
				}
			}
			if(drag<0){
				drawflag=1;
				post("drag",drag);
				if(drag == -2){//selection area drag
				}else if(drag == -1){//pan view around??
				}else{//drag selection/or just the original hovered note
					var xx = (zoom_end-zoom_start)*(x - drag_start_x) / width;
					drag_start_x = x;
					var pp = 0;
					if(lanetype[mouse_lane]==0){
						pp = Math.round((highestnote-lowestnote+3)*(drag_start_y - y)/(laney[mouse_lane+1] - laney[mouse_lane]));
						if(pp!=0) drag_start_y = y;
					}
					if(selected_event_count>0){
						for(i=1;i<k.length;i++){
							if(selected_events[k[i]]>0){
								var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
								if(c){
									event[4] += xx;
									event[4] = Math.max(event[4],0.0000001);
								}else{
									event[2] += pp;
									event[0] += xx;
									event[0] = Math.min(1, Math.max(0,event[0]));
								}
								seqdict.replace(block+"::"+pattern+"::"+k[i],event);
								drawflag = 1;
								drag_moved = 1;
								copytoseq();
							}
						}
					}
				}
			}
		}
	}else{
		if(old_l==1){// a release
			if(drag<0){
				drag = 0;
				if(drag_moved)push_to_undo_stack("move");
				drawflag = 1;
			}else if(y<y_pos+0.1*height){
				if(y<y_pos+0.05*height){
					if(x<x_pos+0.36*width){
						if(x>x_pos+0.3*width){
							if((tripletgrid==1)||((currentquantise>=1)&&quantise_enable)){
								tripletgrid=0;
								quantise_enable=0;
							}else if(quantise_enable){
								tripletgrid=1;
							}else{
								quantise_enable=1;
							}
							drawflag=1;
						}
					}
				}else{
					if(a==1){
						zoom_to_pattern();
					}else if(c==1){
						zoom_start=0; zoom_end=1; zoom_scale=1;						
					}
					drawflag = 1;
				}
			}else if(hovered_event>-1){
				if(s||c){ //toggle selection
					selected_events[hovered_event] = 1 - ((selected_events[hovered_event]>0)|0);
					drawflag=1;				
				}else{
					selected_event_count=1;
					selected_events=[];
					selected_events[hovered_event]=1;
					drawflag=1;
				}
			}else{ //release on background
				if(c){ //create note
					var xx = ((x-x_pos)/width) * (zoom_end-zoom_start) + zoom_start;
					if((!s)&&quantise_enable){
						xx = Math.round(xx*seql/currentquantise)/(seql/currentquantise);
					}
					var vv = 100;
					var pp = 0;
					
					if(lanetype[mouse_lane]==0){//note lane
						pp = lowestnote + Math.floor((highestnote-lowestnote+1)*(1 - ((y-laney[mouse_lane]))/(laney[mouse_lane+1] - laney[mouse_lane])));
					}else if(lanetype[mouse_lane]==2){//meta lane
						pp = Math.floor((metatypes.length+1)*(((y-laney[mouse_lane]))/(laney[mouse_lane+1] - laney[mouse_lane])));
						vv = metatype_defaults[pp][0];
					}else{
						vv = 127 *(1-((y-laney[mouse_lane]))/(laney[mouse_lane+1] - laney[mouse_lane])); 
					}
					var ind = k[(k.length-1)]|0;
					ind++;
					while(k.indexOf(ind.toString())>-1) ind++;
					ind = ind.toString();
					if(mouse_lane>0)mouse_lane--;
					var event = [xx,mouse_lane,pp,vv,currentquantise/seql];
					if((lanetype[mouse_lane]==2)&&(metatype_defaults[pp].length>1)){
						for(var i=1;i<metatype_defaults[pp].length;i++){
							event.push(metatype_defaults[pp][i]);
						}
					}
					for(var ti=1;ti<k.length;ti++){ //check for duplicate events
						var ev = sd.get(k[ti]);
						if((ev[0]==xx)&&(ev[1]==mouse_lane)&&(ev[2]==pp)){
							ind = k[ti];
							break; 
						}
					}
					seqdict.replace(block+"::"+pattern+"::"+ind,event);
					undo.clear();
					undo.replace(ind,event);
					post("\npushing",undo.getkeys());
					push_to_undo_stack("create");
					copytoseq();
					drawflag=1;
				}else{ //select nothing
					selected_event_count=0;
					selected_events=[];
					drawflag=1;
				}
			}
		}
		if(moved){
			for(var i=0;i<laney.length-1;i++){
				if((y>laney[i])&&(y<laney[i+1])){
					if(maximisedlist[i]==0){
						for(var ii=0;ii<maximisedlist.length;ii++)maximisedlist[ii] = 0;
						maximisedlist[i]=1;
						//post("\nmaximised lane:",i);
						laneheights();
						drawflag=1;
						//post("calced new heights",laney,"maxl",maximisedlist);
					}else{
						drawflag = 1; //so all movement in the maximised lane causes a draw
						// there's a possibility to optimise this - either by storing a short list
						// of displayed note/bar coords and checking in that, or by using numbered
						// passthrough zones for the notes (this makes drawing much more expensive tho)
					}
				}
			}
		}
	}
	old_l = l;
	old_x = x;
	old_y = y;
	old_s = s;
	old_c = c;
}

function zoom_to_pattern() {
	var lp = seqdict.get(block + "::" + pattern + "::looppoints");
	if(!Array.isArray(lp)) return -1;
	var ns = Math.max(Math.min(lp[1] - 2, lp[2] - 2), 0);
	var ne = Math.max(lp[3] + 2, lp[1] + 8);
	ns /= lp[0];
	ne /= lp[0];
	zoom_start = ns;
	zoom_end = ne;
	zoom_scale = 1 / (ne - ns);
	get_note_range();
}

function keydown(key){
	var a=0;
	if(key>2000){
		key-=2048;
		a=1;
	}
	if(key>480){
		key-=512;
		old_s=1;
	}else{old_s = 0;}
	if(key>240){
		key-=256;
		old_c=1;
	}else{old_c = 0;}
	if(key == -15){
		zoom_start = 0; zoom_end = 1; zoom_scale = 1;
		for(var i=0;i<maximisedlist.length;i++)maximisedlist[i]=(i==0);
		drawflag=1;
	}else if((key == -9)||(key == -10)){//up down
		var dir = (key == -9) ? 1 : -1;
		if(old_s) dir *= 12;
		var rem=0;
		undo.clear();
		for(i=0;i<k.length;i++){
			if(selected_events[k[i]]){
				var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
				undo.replace(k[i],event);
				rem=1;
				var n = event[2] + dir;
				if((n>=0)&&(n<127)) event[2] = n;
				seqdict.replace(block+"::"+pattern+"::"+k[i],event);
			}
		}
		if(rem){
			push_to_undo_stack("move");
			copytoseq();
			drawflag = 1;
		}
	}else if((key == -11)||(key == -12)){//left right
		var loopnts = seqdict.get(block+"::"+pattern+"::looppoints");
		seql = loopnts[0];
		var ind = (old_c == 1) ? 4 : 0;
		var dir = (key == -12) ? 1 : -1;
		if(old_s) dir /= 16;
		if(a) dir /= 12;
		dir /= (seql);
		var rem=0;
		undo.clear();
		for(i=1;i<k.length;i++){
			if(selected_events[k[i]]){
				rem=1;
				var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
				undo.replace(k[i],event);
				event[ind] += dir;// + 100;
				event[ind] = Math.min(1,Math.max(0,event[ind]));
				seqdict.replace(block+"::"+pattern+"::"+k[i],event);
			}
		}
		if(rem){
			push_to_undo_stack("move");
			copytoseq();
			drawflag = 1;
		}
	}else if((key==97)&&(old_c)){ //select all
		for(i=1;i<k.length;i++) selected_events[k[i]]=1;
		drawflag = 1;
	}else if((key==-6)||(key==-7)){ //delete 
		undo.clear();
		var rem=0;
		if(hovered_event>-1){
			var event = seqdict.get(block+"::"+pattern+"::"+hovered_event);
			undo.replace(hovered_event,event);
			seqdict.remove(block+"::"+pattern+"::"+hovered_event);
			rem = 1;
		}else{
			for(i=1;i<k.length;i++){
				if(selected_events[k[i]]){
					var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
					undo.replace(k[i],event);
					rem=1;
					seqdict.remove(block+"::"+pattern+"::"+k[i]);
				}
			}
		}
		if(rem){
			drawflag = 1;
			copytoseq();
			push_to_undo_stack("delete");
		}	
	}else if(key==51){//3, toggles triplets
		tripletgrid = 1 - tripletgrid;
		drawflag = 1;
	}else if(key==113){//q, quantises selected notes
		var rem=0;
		undo.clear();
		for(i=1;i<k.length;i++){
			if(selected_events[k[i]]){
				var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
				undo.replace(k[i],event);
				var nt = Math.round(event[0] * seql/currentquantise)/(seql/currentquantise);
				if(event[0]!=nt){
					rem=1;
					event[0]=nt;
					seqdict.replace(block+"::"+pattern+"::"+k[i],event);
				}
			}
		}
		if(rem)	push_to_undo_stack("move");
		copytoseq();
		drawflag = 1;
	}else if(key==108){//l, makes selected notes legato
		var rem=0;
		undo.clear();
		for(i=1;i<k.length;i++){
			if(selected_events[k[i]]){
				var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
				undo.replace(k[i],event);
				var noteend = event[0] + event[4];
				var newend = (loopstart+looplength)/seql;
				for(var ii=k.length-1;ii>i;ii--){
					var e2 = seqdict.get(block+"::"+pattern+"::"+k[ii]);
					if((e2[0]<newend)&&(e2[0]>noteend)) newend=e2[0];
				}
				event[4] = newend - event[0];
				seqdict.replace(block+"::"+pattern+"::"+k[i],event);
			}
		}
		push_to_undo_stack("move");
		copytoseq();
		drawflag = 1;
	}else if((key==99)||(key==120)){ //ctrl c, ctrl x
		var mint=99;
		undo.clear();
		clipboard = [];
		for(i=1;i<k.length;i++){
			if(selected_events[k[i]]){
				var event = seqdict.get(block+"::"+pattern+"::"+k[i]);
				undo.replace(k[i],event);
				if(event[0]<mint)mint=event[0];
				clipboard.push(event);
				//post("\nadded event to clipboard:",event);
			}
		}
		for(i=0;i<clipboard.length;i++){
			clipboard[i][0]-=mint;
		}
		if(key==120){//also remove
			var rem=0;
			for(i=1;i<k.length;i++){
				if(selected_events[k[i]]){
					rem=1;
					seqdict.remove(block+"::"+pattern+"::"+k[i]);
				}
			}
			if(rem){
				push_to_undo_stack("delete");
				drawflag = 1;
				copytoseq();
			}	
		}
	}else if(key==118){ //ctrl v
		var offs=zoom_start + (old_x - x_pos)/(zoom_scale*width);
		if(quantise_enable && !old_s){
			offs=Math.round(offs*currentquantise*seql)/(currentquantise*seql);
		}
		selected_events=[];
		selected_event_count=0;
		undo.clear();
		var ind = k[(k.length-1)]|0;
		for(var i=0;i<clipboard.length;i++){
			var event = clipboard[i].slice();
			event[0] +=offs;
			ind++;
			while(k.indexOf(ind.toString())>-1) ind++;
			selected_events[ind]=1;
			selected_event_count++;
			ind = ind.toString();
			undo.replace(ind,event);
			seqdict.replace(block+"::"+pattern+"::"+ind,event);
			//post("\npasted event with offset",offs," and index",ind,"  :", event);
		}
		push_to_undo_stack("create");
		copytoseq();
		drawflag=1;	
	}else if(key==122){ //undo
		var usz = undo_stack.getsize("history")|0;
		usz--;
		post("\nlooking at history:",usz);
		while(!undo_stack.contains("history["+usz+"]::seq.piano.roll")){
			usz--;
			post(usz);
			if(usz<0) return 0;
		}
		undo = undo_stack.get("history["+usz+"]::seq.piano.roll");
		var uk = undo.getkeys();
		if(Array.isArray(uk))uk=uk[0];
		//post("\nundo keys",uk);
		undo = undo.get(uk);
		var events = undo.getkeys();
		if(uk=="move"){
			for(var i=0;i<events.length;i++){
				seqdict.replace(block+"::"+pattern+"::"+events[i],undo.get(events[i]));
			}
			undo_stack.remove("history["+usz+"]");
			copytoseq();
			drawflag=1;
		}else if(uk == "create"){
			for(var i=0;i<events.length;i++){
				seqdict.remove(block+"::"+pattern+"::"+events[i]);
			}
			undo_stack.remove("history["+usz+"]");
			copytoseq();
			drawflag=1;
		}else if(uk == "delete"){
			for(var i=0;i<events.length;i++){
				seqdict.replace(block+"::"+pattern+"::"+events[i],undo.get(events[i]));
			}
			undo_stack.remove("history["+usz+"]");
			copytoseq();
			drawflag=1;
		}
	}else{
		post("\nkey",key);
	}
}

function enabled(e){
	if(e==1){
		outlet(0,"getvoice");
	}	
}

function time_to_beat_divs(t){
	var tt = t * seql;
	var bars = Math.floor(tt / timesig);
	var beats = Math.floor(tt % timesig);
	var fract = ((tt % timesig) - beats).toFixed(2);
	return bars+":"+beats+":"+fract;
}

function push_to_undo_stack(action){
	var usz=undo_stack.getsize("history")|0;
	undo_stack.append("history","*");
	undo_stack.setparse("history["+usz+"]", '{ "seq.piano.roll" : { "'+action+'" : "*" } }');
	undo_stack.replace("history["+usz+"]::seq.piano.roll::"+action, undo);
}