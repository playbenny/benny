var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var parameter_value_buffer = new Buffer("parameter_value_buffer");
outlets = 4;
var config = new Dict;
config.name = "config";
var block_colour = [128,128,128];
var width, height,x_pos,y_pos,unit,u1,cw,cols,bv,clist;
var controller=-1;
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
var blocktypes = new Dict;
blocktypes.name = "blocktypes";
var b_list = [];
var v_list = []; // list of voices of the channels connected to this mixer
var v_name = []; 
var v_colour = [];
var v_type = [];
var omute = [];
var osolo = [];
var mcv = new Dict;
mcv.name = "mixer_channel_voicings";
var no_voicings = 1;
var oshape = [];
var osweep = [];
var oamount = [];
var shape = [];
var sweep = [];
var amount = [];
var stored_controller = "";

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
		var tco = Math.floor(0.99*clist.length * voice_parameter_buffer.peek(1,bv*MAX_PARAMETERS));
		if(tco!=controller){
			controller = tco;
			post("\nMixer controller selection:",clist[controller]);
			outlet(2,clist[controller]);
			blocks.replace("blocks["+block+"]::selected_controller",clist[controller]);
		}	
	}
}

function draw(){
	update(1);
}

function update(force){
	if(block>=0){
		var x=0;
		for(var b=0;b<b_list.length;b++){
			var fgc = b_colour[b];
			var bgc = [fgc[0]*0.2,fgc[1]*0.2,fgc[2]*0.2];
			// because the sliders for channels are actually static mod offsets, so it's a single opv-enabled parameter slider really.
			for(var v=v_list[b].length-1;v>=0;v--){
				var mute = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v] + 5);
				if((omute[b][v]!=mute)||force){
					omute[b][v] = mute;
					outlet(0,"custom_ui_element","opv_button",x_pos+(x+v)*cw,y_pos+height-unit*4,x_pos+(x+v+1)*cw-2,y_pos+height-unit*2,130,130,130,5,v_list[b][v],"mute",b_list[b]);
				}
				var solo = voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[b][v] + 6);
				if((osolo[b][v]!=solo)||force){
					osolo[b][v] = solo;
					outlet(0,"custom_ui_element","opv_button",x_pos+(x+v)*cw,y_pos+height-unit*2,x_pos+(x+v+1)*cw-2,y_pos+height,255,20,20,6,v_list[b][v],"solo",b_list[b]);
				}
				if(check_eq_params_for_changes(b,v)||force){
					draw_eq_curve(shape[b][v],amount[b][v],sweep[b][v],x_pos+(x+v)*cw,y_pos,x_pos+(x+v+1)*cw-2,y_pos+unit*4,fgc,bgc);
					oshape[b][v] = shape[b][v]; oamount[b][v] = amount[b][v]; osweep[b][v] = sweep[b][v];
				}
			}
			var xx = x+v_list[b].length;
			draw_channels(b,v,x_pos+x*cw,y_pos+unit*4.1,x_pos+xx*cw-u1,y_pos+height-unit*4.1,fgc,bgc);
			x = xx;
		}
	}
}

function check_eq_params_for_changes(b,v){
	var dr=0;
	//for(var b=0;b<b_list.length;b++){
	//	for(var v=0;v<v_list[b].length;v++){
			//draw_mutesolo(block,v,x_pos+x,y_pos+height*0.4,x_pos+x+cw-u1,y_pos+height,fgc,bgc);
			shape[b][v] = Math.floor(0.99*no_voicings*voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[b][v]+2));
			amount[b][v] = voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[b][v]+3);
			sweep[b][v] = Math.pow(2, 4*voice_parameter_buffer.peek(1,MAX_PARAMETERS*v_list[b][v]+4)-2);
			if((shape[b][v]!=oshape[b][v])||(amount[b][v]!=oamount[b][v])||(sweep[b][v]!=osweep[b][v])) dr = 1;
	//	}
	//}
	return dr;
}

function draw_eq_curve(shp,amnt,swp,x1,y1,x2,y2,fg,bg){
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	var h=y2-y1;
	var voicing = mcv.get(shp);
	/* the numbers in a voicings list:
	low: freq, res, -1=hpf, otherwise it's shelf gain
	mid: f, res, gain (db)
	high: f, res
	width */
	//post("\nvoicing",shp,"is",voicing);
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
			outlet(1,"moveto",x+x1,y2-Math.max(1,g));
		}else{
			outlet(1,"lineto",x+x1,y2-g);
		}
	}
}


function draw_channels(b,v,x1,y1,x2,y2,fg,bg){
	outlet(1,"paintrect",x1,y1,x2,y2,bg);
	var h=y2-y1;
	if(b_type[b]=="mix.channel.stereo"){
		outlet(0,"custom_ui_element","param_v_scroll",x1+u1,y1,x2-u1,y2,fg[0],fg[1],fg[2],[block,5+r]);
	}
}


function voice_is(v){
	block = v;
	scan_for_channels();
	bv = map.get(v);
	if(Array.isArray(bv)) bv=bv[0];
	clist = blocktypes.get("mix.bus::parameters[0]::values");
	if(!Array.isArray(clist)) clist = [clist];
	if(blocks.contains("blocks["+v+"]::stored_controller")){
		stored_controller = blocks.get("blocks["+v+"]::stored_controller");
		post("\nfound a stored controller in savefile:",stored_controller);
		controller = clist.indexof(stored_controller);
		if(controller!=-1){
			parameter_value_buffer.poke(1,0.99*bv*MAX_PARAMETERS,controller/clist.length);
		}else{
			post("\nerror restoring controller selection");
		}
		
	}
	var voicings_list = mcv.getkeys();
	if(!Array.isArray(voicings_list)) voicings_list = [voicings_list];
	no_voicings = voicings_list.length;

}

function scan_for_channels(){
	if(block>=0){
		var bx_list=[];
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
					bx_list.push(blocks.get("blocks["+b+"]::space::x"));
				}
			}
			shape[b] = [];
			oshape[b] = [];
			amount[b] = [];
			oamount[b] = [];
			sweep[b] = [];
			osweep[b] = [];
			omute[b] = [];
			osolo[b] = [];
		}
		post("\nsorting mixer channel groups by x position",bx_list);
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
		for(var bb=0;bb<b_list.length;bb++){
			b=b_list[bb];
			//if(blocks.contains("blocks["+b+"]::name")){
				var nam = blocks.get("blocks["+b+"]::name");
				var n2 = nam.split(".");
				if((n2[0] == "mix")&&(n2[1] != "bus")){
					//b_list.push(b);
					//bx_list.push(blocks.get("blocks["+b+"]::space::x"));
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
					for(var t=0;t<vl.length;t++){
						outlet(3,vl[t]*MAX_PARAMETERS);
					}
					parameter_value_buffer.poke(1, b*MAX_PARAMETERS, [0.39, 0.5, 0, 0.25, 0.5, 0, 0]);

					cols += vl.length;
					post("\nadded mixer channel, block ",b,"voices",vl.length," : ",vl,"type",nam);
				}
			//}
		}
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		block_dark = [block_colour[0]>>1,block_colour[1]>>1,block_colour[2]>>1];
		block_darkest = [block_colour[0]*0.2, block_colour[1]*0.2, block_colour[2]*0.2];
		for(var i=0;i<3;i++)block_colour[i] = Math.min(255,1.5*block_colour[i]);
		cw = (width+u1) / cols;
		outlet(3,"bang");
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