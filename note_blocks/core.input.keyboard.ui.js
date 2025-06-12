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
				event = [ event[0], event[1], 0 , event[2], 0 ];
				seqdict.replace(block+"::"+k[i],event);
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
			var event = seqdict.get(block+"::"+k[i]);
			if(event==null){
			}else if((event[1]<2) && (event[3]==0)){
				seqdict.remove(block+"::"+k[i]);
				// post("\nremoved ",k[i],":",event);
			}
		}
	}
	drawflag = 1;
	messnamed("core_keyboard_xfer","lengths_done");
}

function setup(x1,y1,x2,y2,sw,mode){ 
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	mini=0;
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	unit = height / 18;
	mini=(mode=="mini")|0;
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
*/}

function enabled(){}