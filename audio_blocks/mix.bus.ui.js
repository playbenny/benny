var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var block_colour = [128,128,128];
var width, height,x_pos,y_pos,unit,u1,cw,cols;
var block=-1;
var display_row_offset = 0;
var display_col_offset = 0;
var mini=0;
var drawflag=0;
var namelist;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var b_list = [];
var v_list = []; // list of voices of the channels connected to this mixer
var v_name = []; 
var v_colour = [];
var v_type = [];

function setup(x1,y1,x2,y2,sw){
	//block_colour = config.get("palette::menu");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	if(width<sw*0.54){ 
		mini=1;
	}
	unit = height / 18;
	u1 = 0.1 * unit;
	if(block>=0){
		scan_for_channels();
		draw();
	}
}

function draw(){
	if(block>=0){
		var x=0;
		for(var b=0;b<b_list.length;b++){
			var fgc = b_colour[b];
			var bgc = [fgc[0]*0.5,fgc[1]*0.5,fgc[2]*0.5];
			// because the sliders for channels are actually static mod offsets, so it's a single opv-enabled parameter slider really.
			for(var v=v_list[b].length-1;v>=0;v--){
				draw_mutesolo(b,v,x_pos+(x+v)*cw,y_pos+height-unit*4,x_pos+(x+v+1)*cw-u1,y_pos+height,fgc,bgc);
			}
			var xx = x+v_list[b].length;
			draw_channels(b,v,x_pos+x*cw,y_pos,x_pos+xx*cw-u1,y_pos+height-unit*4.1,fgc,bgc);
			x = xx;
		}
	}
}

function draw_channels(b,v,x1,y1,x2,y2,fg,bg){
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	var h=y2-y1;
	if(b_type[b]=="mix.channel.stereo"){
		outlet(0,"custom_ui_element","param_v_scroll",x1+u1,h*0.6+y1,x2-u1,y2,fg[0],fg[1],fg[2],[block,5+r]);
	}
}
function draw_mutesolo(b,v,x1,y1,x2,y2,fg,bg){
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	if(v==0){
		outlet(1,"moveto",x1+u1,y2-0.5*unit);
		outlet(1,"frgb",fg);
		outlet(1,"write",b_name[b])
	}
}
/*		drawflag=0;
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
			outlet(1,"paintrect",x_pos+sx,y_pos,x_pos+width,sy+y_pos,block_colour[0]*0.1,block_colour[1]*0.1,block_colour[2]*0.1);
			outlet(0,"setfontsize",rh*0.8);
			outlet(1,"frgb",block_colour);
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
			outlet(1,"moveto",3+sx+0.55*cw+x_pos,rh*0.75+y_pos);
			outlet(1,"write","slice");
			outlet(1,"moveto",3+sx+0.55*cw+x_pos,rh*1.45+y_pos);
			outlet(1,"write",currentslice+1);
			if(cursorx2<4) draw_wave_hint(currentwave,currentslice);
			for(c=display_col_offset;c<Math.min(display_col_offset+showcols,v_list.length);c++){
				cursors[c] = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[c]));
				l[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+2)*127.999)+1;
				s[c]  = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+1)*127.999);
				l_on[c] = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[c]+3)
				outlet(1,"moveto", 3+sx+cw*(c-display_col_offset)+x_pos, rh*2.15+y_pos);
				if(cursorx == c){
					outlet(1,"frgb",block_colour);
				}else{
					outlet(1,"frgb",block_colour[0]*0.5,block_colour[1]*0.5,block_colour[2]*0.5);
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
			
			outlet(1,"paintrect",x_pos,sy+rh*r+y_pos,sx-9+x_pos,sy+rh*(r+1)+y_pos,block_colour[0]*rc,block_colour[1]*rc,block_colour[2]*rc);
			outlet(1,"moveto",3+x_pos,sy+rh*(r+0.75)+y_pos);
			if(!mini){
				outlet(1,"frgb",block_colour);
				outlet(1,"write",rr);
			}
		}
		outlet(0,"custom_ui_element","mouse_passthrough",x_pos,sy+y_pos,width+x_pos,height+y_pos,0,0,0,block,0);*/

function update(){

}


function voice_is(v){
	block = v;
	scan_for_channels();
}

function scan_for_channels(){
	if(block>=0){
		var vx_list=[];
		v_list=[];
		b_list=[];
		b_name=[];
		b_colour=[];
		b_type=[];
		cols = 0;
		for(var b=0;b<blocks.getsize("blocks");b++){
			if(blocks.contains("blocks["+b+"]::name")){
				var nam = blocks.get("blocks["+b+"]::name");
				var n2 = nam.split(".");
				if((n2[0] == "mix")&&(n2[1] != "bus")){
					b_list.push(b);
					vx_list.push(blocks.get("blocks["+b+"]::space::x"));
					if(blocks.contains("blocks["+b+"]::label")){
						b_name.push(blocks.get("blocks["+b+"]::label"));
						b_type.push(nam);
					}else{
						b_name.push(nam);
						b_type.push(nam);
					}
					b_colour.push(blocks.get("blocks["+b+"]::space::colour"));
					var vl = map.get(b);
					if(!Array.isArray(vl)) vl = [vl];
					v_list.push(vl);
					cols += vl.length;
					post("\nadded mixer channel, block ",b,"voices",vl.length," : ",vl,"type",nam);
				}
			}
		}
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
		block_darkest = [block_colour[0]*0.2, block_colour[1]*0.2, block_colour[2]*0.2];
		for(var i=0;i<3;i++)block_colour[i] = Math.min(255,1.5*block_colour[i]);
		cw = (width+u1) / cols;
	}
}

function voice_offset(){}

function loadbang(){
	outlet(0,"getvoice");
}

function quer(){
	post("vlist is",v_list);
}

function store(){
}

function enabled(){}