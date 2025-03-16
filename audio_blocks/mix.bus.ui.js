//TODO HERE -
//remove unused things?
//comp meters : bring over check for change fn from channel ui
//when you scan voices store the 3 colours you want to use per-channel (at the moment they seem to be looked up for ntohing?)

var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var MAX_AUDIO_VOICES = 64;
var MAX_NOTE_VOICES = 64;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var parameter_value_buffer = new Buffer("parameter_value_buffer");
var scope_buffer = new Buffer("scope_buffer");
outlets = 4;
var config = new Dict;
config.name = "config";
var ovhash = -1;
var block_colour = [128,128,128];
var width, height,x_pos,y_pos,unit,u1,cw,cols,bv;
var controller=-1;
var block=-1;
var display_row_offset = 0;
var display_col_offset = 0;
var bg_dark_ratio= 0.2;
var mini=0;
var drawflag=0;
var namelist;
var voicemap = new Dict;
voicemap.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var connections = new Dict;
connections.name = "connections";
var blocktypes = new Dict;
blocktypes.name = "blocktypes";
var b_list = [];
var v_list = []; // list of voices of the channels connected to this mixer
var v_name = []; 
var v_colour = [];
var b_colour = [];
var v_type = [];
var omute = [];
var osolo = [];
var mcv = new Dict;
mcv.name = "mixer_channel_voicings";
var no_voicings = 1;
var oshape = [];
var osweep = [];
var oamount = [];
var level = [];
var pan = [];
var olevel = [];
var opan = [];
var shape = [];
var sweep = [];
var amount = [];
var meter = [];
var ometer = [];
var channelnames = [];
var col_to_chan = []; //holds block,channel

var mous = {
	x : 0,
	y : 0,
	l : 0
};

var mainfont,fontsmall;

function setup(x1,y1,x2,y2,sw){
	//block_colour = config.get("palette::menu");
	MAX_DATA = config.get("MAX_DATA");
	MAX_AUDIO_VOICES = config.get("MAX_AUDIO_VOICES");
	MAX_NOTE_VOICES = config.get("MAX_NOTE_VOICES");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	mainfont = config.get("mainfont");
	fontsmall = config.get("fontsmall");
	var w = x2-x1;
	if(w!=width){
		ovhash=-1;
	}
	width = w;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	if(sw==-1){
		mini=2;
	}else if(width<sw*0.54){ 
		mini=1;
	}else{
		mini=0;
	}
	unit = height / 18;
	u1 = 0.1 * unit;
	if(block>=0){
		// post("\nmixer setup",block);
		scan_for_channels();
		if(b_list.length==0){
			outlet(1,"moveto",x_pos+20,y_pos+2*unit);
			outlet(1,"write","once you connect channels they'll show here");
		}else{
			draw();
		}
	}
}

function draw(){
	update(1);
}

function update(force){
	if(block>=0){
		var x=0;
		outlet(1,"font",mainfont,fontsmall); //'small' size font. this is 1/18th, i'm not sure it's a great way of doing it.
		var mutemsg="mute";
		var solomsg="solo";
		if(cw<20){
			mutemsg="";
			solomsg="";
		}else if(cw<70){
			mutemsg="m";
			solomsg="s";
		}
		if(mini==2){//bottom bar view is different layout
			// because the sliders for channels are actually static mod offsets, so it's a single opv-enabled parameter slider really.
			for(var b=0;b<b_list.length;b++){
				var fgc = b_colour[b];
				var bgc = [fgc[0]*0.15,fgc[1]*0.15,fgc[2]*0.15];
				for(var v=v_list[b].length-1;v>=0;v--){
					level[b][v] = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v]);
					if((olevel[b][v]!=level[b][v])||force){
						olevel[b][v] = level[b][v];
						outlet(0,"custom_ui_element","opv_v_slider_passthrough",x_pos+(x+v)*cw+12,y_pos,x_pos+(x+v+0.5)*cw-4,y_pos+height-4*unit,[fgc[0]*1.1,fgc[1]*1.1,fgc[2]*1.1],0,v_list[b][v],b_list[b]);
						draw_slider(x_pos+(x+v)*cw+12,y_pos,x_pos+(x+v+0.5)*cw-4,y_pos+height-4*unit,fgc[0]*0.8,fgc[1]*0.8,fgc[2]*0.8,level[b][v]);
					}
					var mute = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v] + 5);
					if((omute[b][v]!=mute)||force){
						omute[b][v] = mute;
						outlet(0,"custom_ui_element","opv_button",x_pos+(x+v+0.5)*cw,y_pos+height-unit*11.6,x_pos+(x+v+1)*cw-8,y_pos+height-unit*8,130,130,130,5,v_list[b][v],mutemsg,b_list[b]);
					}
					var solo = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v] + 6);
					if((osolo[b][v]!=solo)||force){
						osolo[b][v] = solo;
						outlet(0,"custom_ui_element","opv_button",x_pos+(x+v+0.5)*cw,y_pos+height-unit*7.6,x_pos+(x+v+1)*cw-8,y_pos+height-4*unit,255,20,20,6,v_list[b][v],solomsg,b_list[b]);
					}
					if((v_type[b][v]=="mixer.mono.basic")||(v_type[b][v]=="mixer.stereo.basic")){
						if(check_eq_params_for_changes(b,v)||force){
							outlet(0,"custom_ui_element","opv_2d_slider_passthrough",x_pos+(x+v+0.5)*cw,y_pos,x_pos+(x+v+1)*cw-8,y_pos+height-unit*12,0,0,0,3,v_list[b][v],b_list[b],4);
							draw_eq_curve_basic(shape[b][v],amount[b][v],sweep[b][v],x_pos+(x+v+0.5)*cw,y_pos,x_pos+(x+v+1)*cw-8,y_pos+height-unit*12,fgc,bgc);
							oshape[b][v] = shape[b][v]; oamount[b][v] = amount[b][v]; osweep[b][v] = sweep[b][v];
						}
					}else if((v_type[b][v]=="mixer.mono.tape")||(v_type[b][v]=="mixer.stereo.tape")){
						if(check_eq_params_for_changes(b,v)||force){
							outlet(0,"custom_ui_element","opv_2d_slider_passthrough",x_pos+(x+v+0.5)*cw,y_pos,x_pos+(x+v+1)*cw-8,y_pos+height-unit*12,0,0,0,3,v_list[b][v],b_list[b],4);
							draw_eq_curve_tape(shape[b][v],amount[b][v],sweep[b][v],x_pos+(x+v+0.5)*cw,y_pos,x_pos+(x+v+1)*cw-8,y_pos+height-unit*12,fgc,bgc);
							oshape[b][v] = shape[b][v]; oamount[b][v] = amount[b][v]; osweep[b][v] = sweep[b][v];
						}
					}else if((v_type[b][v]=="mixer.mono.comp")||(v_type[b][v]=="mixer.stereo.comp")){
						var hh = (height-unit*12);
						outlet(1, "paintrect",x_pos+(x+v+0.5)*cw,y_pos,x_pos+(x+v+0.8)*cw,y_pos+hh,0,0,0);
						var metery = hh * Math.max(-1,Math.log(voice_data_buffer.peek(1, MAX_DATA*v_list[b][v])));
						outlet(1, "paintrect",x_pos+(x+v+0.5)*cw,y_pos,x_pos+(x+v+0.6)*cw,y_pos-metery,fgc);
						metery = hh * Math.max(-1,Math.log(voice_data_buffer.peek(1, MAX_DATA*v_list[b][v]+1)));
						outlet(1, "paintrect",x_pos+(x+v+0.6)*cw,y_pos,x_pos+(x+v+0.7)*cw,y_pos-metery,fgc);
						metery = hh * Math.max(-1,Math.log(voice_data_buffer.peek(1, MAX_DATA*v_list[b][v]+2)));
						outlet(1, "paintrect",x_pos+(x+v+0.7)*cw,y_pos,x_pos+(x+v+0.8)*cw,y_pos-metery,fgc);
						if(check_eq_params_for_changes(b,v)||force){
							outlet(0,"custom_ui_element","opv_v_slider_passthrough",x_pos+(x+v+0.3)*cw,y_pos,x_pos+(x+v+1)*cw-2,y_pos+hh,fgc,2,v_list[b][v],b_list[b]);
							draw_slider(x_pos+(x+v+0.8)*cw,y_pos,x_pos+(x+v+1)*cw-8,y_pos+hh,fgc[0],fgc[1],fgc[2],shape[b][v]);
							oshape[b][v] = shape[b][v]; oamount[b][v] = amount[b][v]; osweep[b][v] = sweep[b][v];
						}
					}else{ post("unknown channel",v_type[b][v]);}
					if(force){
						outlet(1,"frgb",fgc);
						if(channelnames[b] !== undefined){
							outlet(1,"moveto",x_pos+(x+v)*cw,y_pos+height-2*unit);
							outlet(1,"write",channelnames[b][v]);
						}
						if(v==0){
							outlet(1,"frgb",[fgc[0]*0.7,fgc[1]*0.7,fgc[2]*0.7]);
							outlet(1,"moveto",x_pos+(x+v)*cw,y_pos+height-0.6*unit);
							outlet(1,"write",b_name[b]);
						}
					}
					var meter = scope_buffer.peek(2,1+(v_list[b][v]-MAX_NOTE_VOICES));
					outlet(1,"moveto",x_pos+(x+v)*cw,y_pos+height-4.2*unit);
					outlet(1,"frgb",fgc);
					outlet(1,"lineto",x_pos+(x+v)*cw,y_pos+(1-meter)*(height-4.2*unit));
					outlet(1,"frgb",bgc);
					outlet(1,"lineto",x_pos+(x+v)*cw,y_pos);
					meter = scope_buffer.peek(2,1+(v_list[b][v]+MAX_AUDIO_VOICES-MAX_NOTE_VOICES));
					outlet(1,"moveto",4+x_pos+(x+v)*cw,y_pos+height-4.2*unit);
					outlet(1,"frgb",fgc);
					outlet(1,"lineto",4+x_pos+(x+v)*cw,y_pos+(1-meter)*(height-4.2*unit));
					outlet(1,"frgb",bgc);
					outlet(1,"lineto",4+x_pos+(x+v)*cw,y_pos);
				}	
				var xx = x+v_list[b].length;
				x = xx;		
			}					
			if(force){
				outlet(0, "custom_ui_element", "mouse_passthrough", x_pos,y_pos+height-4*unit,x_pos+width,y_pos+height,0,0,0,block,0);
			}
		}else{
			for(var b=0;b<b_list.length;b++){
				var fgc = b_colour[b];
				var bgc = [fgc[0]*0.15,fgc[1]*0.15,fgc[2]*0.15];
				var dc = [0.4*fgc[0],0.4*fgc[1],0.4*fgc[2]];
				for(var v=v_list[b].length-1;v>=0;v--){
					var mute = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v] + 5);
					if((omute[b][v]!=mute)||force){
						omute[b][v] = mute;
						outlet(0,"custom_ui_element","opv_button",x_pos+(x+v)*cw,y_pos+height-unit*2,x_pos+(x+v+1)*cw-2,y_pos+height-unit,130,130,130,5,v_list[b][v],"mute",b_list[b]);
					}
					var solo = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v] + 6);
					if((osolo[b][v]!=solo)||force){
						osolo[b][v] = solo;
						outlet(0,"custom_ui_element","opv_button",x_pos+(x+v)*cw,y_pos+height-unit,x_pos+(x+v+1)*cw-2,y_pos+height,255,20,20,6,v_list[b][v],"solo",b_list[b]);
					}
					if((v_type[b][v]=="mixer.mono.basic")||(v_type[b][v]=="mixer.stereo.basic")){
						if(check_eq_params_for_changes(b,v)||force){
							outlet(0,"custom_ui_element","opv_2d_slider_passthrough",x_pos+(x+v)*cw,y_pos,x_pos+(x+v+1)*cw-2,y_pos+unit*3,0,0,0,3,v_list[b][v],b_list[b],4);
							draw_eq_curve_basic(shape[b][v],amount[b][v],sweep[b][v],x_pos+(x+v)*cw,y_pos,x_pos+(x+v+1)*cw-2,y_pos+unit*3,fgc,bgc);
							oshape[b][v] = shape[b][v]; oamount[b][v] = amount[b][v]; osweep[b][v] = sweep[b][v];
							outlet(0,"custom_ui_element","opv_v_slider_passthrough",x_pos+(x+v)*cw,y_pos+unit*3.1,x_pos+(x+v+1)*cw-2,y_pos+unit*4,fgc[0],fgc[1],fgc[2],2,v_list[b][v],b_list[b]);
							outlet(1,"paintrect",x_pos+(x+v)*cw,y_pos+unit*3.1,x_pos+(x+v+1)*cw-2,y_pos+unit*4,bgc);
							outlet(1,"moveto",x_pos+(x+v+0.1)*cw,y_pos+unit*3.7);
							outlet(1,"frgb",fgc);
							var vnlist = ["clean", "sub", "kick", "body", "mid", "hi-mid", "high"];
							outlet(1,"write",vnlist[Math.floor(vnlist.length*0.999*shape[b][v])]);
						}
					}else if((v_type[b][v]=="mixer.mono.tape")||(v_type[b][v]=="mixer.stereo.tape")){
						if(check_eq_params_for_changes(b,v)||force){
							outlet(0,"custom_ui_element","opv_2d_slider_passthrough",x_pos+(x+v)*cw,y_pos,x_pos+(x+v+1)*cw-2,y_pos+unit*4,0,0,0,3,v_list[b][v],b_list[b],4);
							draw_eq_curve_tape(shape[b][v],amount[b][v],sweep[b][v],x_pos+(x+v)*cw,y_pos,x_pos+(x+v+1)*cw-2,y_pos+unit*4,fgc,bgc);
							oshape[b][v] = shape[b][v]; oamount[b][v] = amount[b][v]; osweep[b][v] = sweep[b][v];
						}
					}else if((v_type[b][v]=="mixer.mono.comp")||(v_type[b][v]=="mixer.stereo.comp")){
						
						outlet(1, "paintrect",x_pos+(x+v)*cw,y_pos,x_pos+(x+v+0.3)*cw,y_pos+unit*4,bgc);
						var metery = unit * 4 * Math.max(-1,Math.log(voice_data_buffer.peek(1, MAX_DATA*v_list[b][v])));
						outlet(1, "paintrect",x_pos+(x+v)*cw,y_pos,x_pos+(x+v+0.1)*cw,y_pos-metery,dc);
						metery = unit * 4 * Math.max(-1,Math.log(voice_data_buffer.peek(1, MAX_DATA*v_list[b][v]+1)));
						outlet(1, "paintrect",x_pos+(x+v+0.1)*cw,y_pos,x_pos+(x+v+0.2)*cw,y_pos-metery,dc);
						metery = unit * 4 * Math.max(-1,Math.log(voice_data_buffer.peek(1, MAX_DATA*v_list[b][v]+2)));
						outlet(1, "paintrect",x_pos+(x+v+0.2)*cw,y_pos,x_pos+(x+v+0.3)*cw,y_pos-metery,dc);
						shape[b][v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[b][v]+2);
						if(check_eq_params_for_changes(b,v)||force){
							outlet(0,"custom_ui_element","opv_v_slider_passthrough",x_pos+(x+v+0.3)*cw,y_pos,x_pos+(x+v+1)*cw-2,y_pos+unit*4.0,fgc,2,v_list[b][v],b_list[b]);
							draw_slider(x_pos+(x+v+0.3)*cw,y_pos,x_pos+(x+v+1)*cw-2,y_pos+unit*4.0,dc[0],dc[1],dc[2],shape[b][v]);
							oshape[b][v] = shape[b][v]; oamount[b][v] = amount[b][v]; osweep[b][v] = sweep[b][v];
						}
					}

					level[b][v] = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v]);
					if(force||(olevel[b][v]!=level[b][v])){
						olevel[b][v] = level[b][v];
						outlet(0,"custom_ui_element","opv_v_slider_passthrough",x_pos+(x+v)*cw,y_pos+unit*5.1,x_pos+(x+v+1)*cw-2,y_pos+height-unit*2.1,fgc,0,v_list[b][v],b_list[b]);
						draw_slider(x_pos+(x+v)*cw+8,y_pos+unit*5.1,x_pos+(x+v+1)*cw-2,y_pos+height-unit*2.1,dc[0],dc[1],dc[2],level[b][v]);
					}
					pan[b][v] = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v]+1);
					if(force||(opan[b][v]!=pan[b][v])){
						opan[b][v] = pan[b][v];
						outlet(0,"custom_ui_element","opv_v_slider_passthrough",x_pos+(x+v)*cw,y_pos+unit*4.1,x_pos+(x+v+1)*cw-2,y_pos+unit*5.1,fgc,1,v_list[b][v],b_list[b]);
						draw_pan_slider(x_pos+(x+v)*cw,y_pos+unit*4.1,x_pos+(x+v+1)*cw-2,y_pos+unit*5.0,fgc[0],fgc[1],fgc[2],pan[b][v]);
					}
					var meter = scope_buffer.peek(2,1+(v_list[b][v]-MAX_NOTE_VOICES));
					outlet(1,"moveto",x_pos+(x+v)*cw,y_pos+height-2.1*unit-2);
					outlet(1,"frgb",fgc);
					outlet(1,"lineto",x_pos+(x+v)*cw,y_pos+unit*5.1 + (1-meter)*(height-7.3*unit));
					outlet(1,"frgb",bgc);
					outlet(1,"lineto",x_pos+(x+v)*cw,y_pos+unit*5.1);
					meter = scope_buffer.peek(2,1+(v_list[b][v]+MAX_AUDIO_VOICES-MAX_NOTE_VOICES));
					outlet(1,"moveto",4+x_pos+(x+v)*cw,y_pos+height-2.1*unit-2);
					outlet(1,"frgb",fgc);
					outlet(1,"lineto",4+x_pos+(x+v)*cw,y_pos+unit*5.1+(1-meter)*(height-7.3*unit));
					outlet(1,"frgb",bgc);
					outlet(1,"lineto",4+x_pos+(x+v)*cw,y_pos+unit*5.1);
				}
				var xx = x+v_list[b].length;
				x = xx;
			}
		}
	}
}

function check_eq_params_for_changes(b,v){
	var dr=0;
	shape[b][v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[b][v]+2);
	amount[b][v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[b][v]+3);
	sweep[b][v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[b][v]+4);
	if((shape[b][v]!=oshape[b][v])||(amount[b][v]!=oamount[b][v])||(sweep[b][v]!=osweep[b][v])) dr = 1;
	return dr;
}

function mouse(x,y,leftbutton,shift,alt,ctrl){
	// post("\nmouse",x,y,leftbutton,shift,alt,ctrl);
	if(leftbutton==1){
		if(mous.l==0){ //a click happened
			mous.l=1;
			if(y>(y_pos+height-4*unit)){
				var xx = Math.floor((x-x_pos)*cols/width);
				// post("\nclicked column",xx,"which is",col_to_chan[xx]);
				if(ctrl){
					messnamed("to_blockmanager","name_mixer_channel",col_to_chan[xx][0],col_to_chan[xx][1]);
				}else{
					messnamed("to_blockmanager","select_block",col_to_chan[xx][0],col_to_chan[xx][0]);
				}
			}
		}
	}else{
		if(mous.l==1){ //release
			mous.l=0; 
		}
	}
}

function draw_eq_curve_basic(shp,amnt,swp,x1,y1,x2,y2,fg,bg){
	shp = Math.floor(no_voicings*0.999*shp);
	swp = Math.pow(2, 4*swp-2);
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	var h=y2-y1-1;
	var voicing = mcv.get(shp);
	/* the numbers in a voicings list:
	low: freq, res, -1=hpf, otherwise it's shelf gain
	mid: f, res, gain (db)
	high: f, res
	width */
	// post("\nvoicing",shp,"of",no_voicings,"is:",voicing);
	//post("\nfreqs",voicing[0],voicing[3],voicing[6]);
	voicing[0] *= swp;
	voicing[3] *= swp;
	voicing[6] *= swp;
	var w=x2-x1; // we want to show about 12 octaves, starting at 6Hz, so one pixel is 12/w octaves
	var step=0.12*w; //Math.pow(2,12/w);
	var w2 = 0.2 / w;
	voicing[0] = Math.log(voicing[0]*0.2+0.01)*step; //1/log(2)
	voicing[3] = Math.log(voicing[3]*0.2+0.01)*step;
	voicing[6] = Math.log(voicing[6]*0.2+0.01)*step;
	outlet(1,"frgb",fg);
	//voicing[2] = Math.pow(2,voicing[2]*0.16667);
	voicing[5] = Math.pow(2,voicing[5]*0.16667)-1;
	for(x=0;x<w;x+=2){
		var g = 0;
		if(voicing[2]==-1){//hpf
			if(x<voicing[0]){
				var d = (voicing[0]-x);
				g -= d*d*w2;
			}
			//g += voicing[1]*Math.pow(2.718,-d*d*0.005*Math.abs(voicing[1]));
		}else{
			if(x<voicing[0]){
				g += voicing[2];
			}else{
				var d = x-voicing[0];
				g += voicing[2]*(Math.pow(2.718,-d*d*0.005*voicing[1]));
			}
		}
		if(voicing[5]!=0){
			var d = x-voicing[3];
			g += voicing[5]*Math.pow(2.718, -d*d*0.005*Math.abs(voicing[4]));
		}
		if(x>=voicing[6]){
			var d = (x-voicing[6]);
			g -= d*d*w2;
		}
		g+=1;
		g = g * amnt + (1-amnt);
		g *= 0.5 * h;
		if((x==0)||(g<1)){
			outlet(1,"moveto",x+x1,y2-1-Math.max(1,g));
		}else{
			outlet(1,"lineto",x+x1,y2-g);
		}
	}
}

function draw_eq_curve_tape(shp,amnt,swp,x1,y1,x2,y2,fg,bg){
	shp = Math.pow(2, 9*shp+4);
	swp = Math.pow(2, 9*swp+2);
	amnt = -2 + 4*amnt;
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	var h=0.5 * (y2-y1-1);
	var voicing = [ shp, (amnt>0) ? 0.05*amnt*amnt*amnt : -(0.02*amnt*amnt*amnt*amnt*amnt), Math.pow(swp,0.9), swp, 0.1+(0.16*amnt*amnt*amnt*amnt),  Math.abs(amnt)*0.3+0.36,(amnt>0) ? amnt*amnt*0.2 : -amnt*amnt*0.4];
	var w=x2-x1; // we want to show about 12 octaves, starting at 6Hz, so one pixel is 12/w octaves
	var step=0.12*w; //Math.pow(2,12/w);
	var w2 = 0.2 / w;
	voicing[0] = Math.log(voicing[0]*0.2+0.01)*step; //1/log(2)
	voicing[3] = Math.log(voicing[3]*0.2+0.01)*step;
	voicing[2] = Math.log(voicing[2]*0.2+0.01)*step; //this is the dip before the 
	outlet(1,"frgb",0.2*fg[0],0.2*fg[0],0);
	//voicing[5] = Math.pow(2,voicing[5]*0.16667)-1;
	var liney=[];
	var i = 0;
	for(x=0;x<w;x+=2){
		var g = 0;
		var d;
		// if(voicing[2]==-1){//hpf
		if(x<voicing[0]){
			d = (voicing[0]-x);
			g -= d*d*w2;
		}
		d = (voicing[0]*0.8-x);
		g += Math.min(0.9,0.3*voicing[1])*Math.pow(2.718,-d*d*0.005*Math.abs(voicing[1]));
		g += 1;
		var g2 = g;
		if(amnt!=0){
			var d = x-voicing[3];
			d *= 0.3+Math.pow(Math.abs(amnt),0.5);
			g += Math.pow(2.718, -d*d*0.005*voicing[4])* amnt;
			d = x-(voicing[2]);
			// d *= 0.4+Math.pow(Math.abs(amnt),0.6);
			g2 -= Math.pow(2.718, -d*d*0.005*voicing[5])* voicing[6];
		}
		liney[i] = y2-1-Math.min(Math.max(1,h * (g + g2 - 1)),2*h-1);
		i++;
		g = Math.floor(g* h);
		g2 = Math.floor(g2* h);
		if((g!=g2)){
			outlet(1,"moveto",x+x1,y2-1-Math.min(Math.max(1,g),2*h-1));
			outlet(1,"lineto",x+x1,y2-1-Math.min(Math.max(1,g2),2*h-1));
		}
	}
	i=1;
	outlet(1,"frgb",fg);
	outlet(1, "moveto",x1,liney[i]);
	for(x=2;x<w;x+=2){
		outlet(1,"lineto",x+x1,liney[i]);
		i++;
	}
}

function voice_is(v){
	block = v;
	ovhash = -1;
	scan_for_channels();
	bv = voicemap.get(v);
	if(Array.isArray(bv)) bv=bv[0];
}

function scan_for_channels(){
	if(block>=0){
		var bx_list=[];
		var tb_list=[];
		var hash = 0;
		for(var c=0;c<connections.getsize("connections");c++){
			if(connections.contains("connections["+c+"]::to")&&(connections.get("connections["+c+"]::to::number")==block)){
				var b = connections.get("connections["+c+"]::from::number");
				if(blocks.contains("blocks["+b+"]::name")){
					var nam = blocks.get("blocks["+b+"]::name");
					var n2 = nam.split(".");
					if((n2[0] == "mixer")&&(n2[1] != "bus")){
						tb_list.push(b);
						var x=blocks.get("blocks["+b+"]::space::x");
						bx_list.push(x);
						var vl= voicemap.get(b);
						if(!Array.isArray(vl)){
							hash+= b+1;
						}else{
							hash += (b+1) * (vl.length+99.9*x);
						}
						// post("\nb",(b+1),"size",vl.length);
					}
				}
			}
		}
		for(var b=0;b<blocks.getsize("blocks");b++){
			
			if(!Array.isArray(shape[b])){
				shape[b] = [];
				oshape[b] = [];
				amount[b] = [];
				oamount[b] = [];
				sweep[b] = [];
				osweep[b] = [];
				omute[b] = [];
				osolo[b] = [];
				level[b] = [];
				olevel[b] = [];
				pan[b] = [];
				opan[b] = [];
				meter[b] = [0,0,0]; 
				ometer[b] = [0,0,0]; 
			}
		}
		// post("\nnew hash",hash);
		if(hash!=ovhash){
			// post("\nhash:",hash,"ovhash",ovhash);
			ovhash=hash;
			b_list = tb_list.slice();
			v_list=[];
			v_type=[];
			b_name=[];
			b_colour=[];
			b_type=[];
			cols = 0;
			// post("\nsorting mixer channel groups by x position",bx_list);
			for(var bb=1;bb<b_list.length;bb++){
				if(bx_list[bb]<bx_list[bb-1]){
					var bt=b_list[bb-1];
					b_list[bb-1]=b_list[bb];
					b_list[bb]=bt;
					bt=bx_list[bb-1];
					bx_list[bb-1]=bx_list[bb];
					bx_list[bb]=bt;
					bb--;
				}
			}
			channelnames=[];
			col_to_chan=[];
			for(var bb=0;bb<b_list.length;bb++){
				b=b_list[bb];
				var nam = blocks.get("blocks["+b+"]::name");
				if(blocks.contains("blocks["+b+"]::label")){
					b_name.push(blocks.get("blocks["+b+"]::label"));
					b_type.push(nam);
				}else{
					b_name.push(nam);
					b_type.push(nam);
				}
				b_colour.push(blocks.get("blocks["+b+"]::space::colour"));
				var vl = voicemap.get(b);
				if(!Array.isArray(vl)) vl = [vl];
				v_list.push(vl);
				var cnams = [];
				if(blocks.contains("blocks["+b+"]::channel_names")){
					cnams = blocks.get("blocks["+b+"]::channel_names");
					if(!Array.isArray(cnams))cnams = [cnams];
					// post("\nfound names:",cnams);
				}else{
					for(var t=0;t<vl.length;t++) cnams.push((t+1));
				}
				channelnames[bb]=[];//cnams.concat();
				var tl=[];
				for(var t=0;t<vl.length;t++){
					outlet(3,vl[t]*MAX_PARAMETERS);
					channelnames[bb].push(cnams[t]);
					tl.push(nam);
				}
				if(!Array.isArray(tl))tl=[tl];
				v_type.push(tl);
				//parameter_value_buffer.poke(1, b*MAX_PARAMETERS, [0.39, 0.5, 0, 0.25, 0.5, 0, 0]);

				cols += vl.length;
				for(var tv=0;tv<vl.length;tv++) col_to_chan.push([b,tv]);
				// post("\nadded mixer channel, block ",b,"voices",vl.length," : ",vl,"type",nam);
			}
			block_colour = blocks.get("blocks["+block+"]::space::colour");
			block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
			block_darkest = [block_colour[0]*0.2, block_colour[1]*0.2, block_colour[2]*0.2];
			for(var i=0;i<3;i++)block_colour[i] = Math.min(255,1.5*block_colour[i]);
			outlet(3,"bang");
		}
		cw = (width+u1) / cols;
	}
	var voicings_list = mcv.getkeys();
	if(!Array.isArray(voicings_list)) voicings_list = [voicings_list];
	no_voicings = 7; //voicings_list.length; //NB if you change voicingslist!...
	// post("\nchannel types:",b_type);
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

function draw_slider(x1,y1,x2,y2,r,g,b,value){
	outlet(1,"paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	
	var ly;
 	if(value>=0) {
		if(value>=1){
			var m = 1 - (value % 1)*0.9;
			outlet(1,"paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		ly = y1 + (y2 - y1) * (1-(value%1));
		outlet(1,"paintrect",x1,ly,x2,y2,r,g,b);
	}else{
		if(value<=-1){
			var m = 1 - (value % 1)*0.9;
			outlet(1,"paintrect",x1,y1,x2,y2,(r*m),(g*m),(b*m));
		}
		ly = y1 + (y2-y1)*(1+(value%1));
		outlet(1,"paintrect",x1,y1,x2,ly,r,g,b);
	}
}
function draw_pan_slider(x1,y1,x2,y2,r,g,b,value){
	outlet(1,"paintrect",x1,y1,x2,y2,r*bg_dark_ratio,g*bg_dark_ratio,b*bg_dark_ratio);
	var w = x2 - x1;
	w -= 4;
	var x = x1 + 1 + w*value;
	outlet(1,"moveto", x, y1);
	outlet(1,"frgb",r,g,b);
	outlet(1,"lineto", x, y2-2);
}