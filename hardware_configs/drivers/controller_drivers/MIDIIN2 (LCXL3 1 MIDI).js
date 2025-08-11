inlets = 1;
outlets = 1;

var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
var parameter_value_buffer = new Buffer("parameter_value_buffer"); 


var config = new Dict;
config.name = "config";
var blocks = new Dict;
blocks.name = "blocks";
var blocktypes = new Dict;
blocktypes.name = "blocktypes";
var voicemap = new Dict;
voicemap.name = "voicemap";

var MAX_PARAMETERS=256;

var arc_type = [];//0 slider 1 menuf 2 menu
var arc_pol = []; //0 uni or 1 bi
var arc_voices = []; //actually holds memory location not voiceno
var arc_index = [];
var arc_name = [];

var ov = [];
var ovv = [];
var iv = [];
var oknob = -1;

var bar_brightness = 4;
var point_brightness = 10;

var brightnesslist = [];

var automap = 0;

function loadbang(){
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
}

function automapped(v){
	automap = v;
}

function brightness(){
	brightnesslist = arrayfromargs(arguments);
//	for(var i=0;i<brightnesslist.length;i++){
//	}
}

function value(knob,value){
	iv[knob] = value/128;
	if(arc_name[knob]){
		// post("\nknob",knob,"value",value,"name",arc_name[knob]);
		var msg=[240, 0, 32, 41, 2, 21, 4, 13+knob, 65 , 247];
		outlet(0, msg);
		msg = [240, 0, 32,41, 2, 21, 6, 13+knob, 0];
		for(var i=0;i<arc_name[knob].length;i++){
			msg.push(arc_name[knob].charCodeAt(i));
		}
		msg.push(247);
		outlet(0, msg);
		msg = [240, 0, 32,41, 2, 21, 6, 13+knob, 1];
		var valtext = value.toString();
		for(var i=0;i<arc_name[knob].length;i++){
			msg.push(valtext.charCodeAt(i));
		}
		msg.push(247);
		outlet(0, msg);
	}
}

function target(arc,index){
	arc_index[arc] = index;
	if(index == -1){
		// outlet(0,"/monome/ring/all",arc,0);
	}else if(index == -0.5){
		// outlet(0,"/monome/ring/all",arc,4);
	}else if(index>=0){
		var t_block = Math.floor( index / MAX_PARAMETERS);
		var t_param = index - t_block * MAX_PARAMETERS;
		var btype = blocks.get("blocks["+t_block+"]::name");
		var ptype = blocktypes.get(btype+"::parameters["+t_param+"]::type");
		arc_name[arc] = blocktypes.get(btype+"::parameters["+t_param+"]::name");
		var pvalues = blocktypes.get(btype+"::parameters["+t_param+"]::values");
		var vl = voicemap.get(t_block);
		if(!Array.isArray(vl))vl = [vl];
		ovv[arc] = [];
		for(var i =0;i<vl.length;i++) vl[i] = MAX_PARAMETERS*vl[i]+t_param;
		// post("\narc",arc," map to block ",t_block," param ",t_param," type ", btype, "param type",ptype, "pvals",pvalues,"voices",vl);
		arc_voices[arc]=vl;
		if((ptype == "int")||(ptype == "float")||(ptype == "float4")){
			arc_pol[arc] = (pvalues[0] == "bi");
			arc_type[arc] = 0;
		}else if((ptype == "menu_f")){
			arc_type[arc] = 1;
			arc_pol[arc] = pvalues.length;
		}else if((ptype == "menu_l")||(ptype == "menu_i")||(ptype == "menu_b")||(ptype == "menu_d")){
			arc_pol[arc] = pvalues.length;
			arc_type[arc] = 2;
		}
	}else if(index<-1){
		var t_block = Math.floor( -index / MAX_PARAMETERS);
		var t_param = -index - t_block * MAX_PARAMETERS;
		var btype = blocks.get("blocks["+t_block+"]::name");
		var ptype = blocktypes.get(btype+"::parameters["+t_param+"]::type");
		arc_name[arc] = blocktypes.get(btype+"::parameters["+t_param+"]::name");
		var pvalues = blocktypes.get(btype+"::parameters["+t_param+"]::values");
		var vl = voicemap.get(t_block);
		if(!Array.isArray(vl))vl = [vl];
		vl = [vl[arc]];
		ovv[arc] = [];
		for(var i =0;i<vl.length;i++) vl[i] = MAX_PARAMETERS*vl[i]+t_param;
		// post("\narc",arc," map to block ",t_block," param ",t_param," type ", btype, "param type",ptype, "pvals",pvalues,"voices",vl);
		arc_voices[arc]=vl;
		if((ptype == "int")||(ptype == "float")||(ptype == "float4")){
			arc_pol[arc] = (pvalues[0] == "bi");
			arc_type[arc] = 0;
		}else if((ptype == "menu_f")){
			arc_type[arc] = 1;
			arc_pol[arc] = pvalues.length;
		}else if((ptype == "menu_l")||(ptype == "menu_i")||(ptype == "menu_b")||(ptype == "menu_d")){
			arc_pol[arc] = pvalues.length;
			arc_type[arc] = 2;
		}
	}
}

function update(){
	if(automap){
		for(var arc=0;arc<4;arc++){
			if(arc_index[arc]>=0){
				var change = 0;
				var v = parameter_value_buffer.peek(1,arc_index[arc]);
				if(v!=ov[arc]){
					change = 1;
					ov[arc] = v;
				}
				for(var i=0;i<arc_voices[arc].length;i++){
					v = voice_parameter_buffer.peek(1,arc_voices[arc][i]);
					if(v!=ovv[arc][i]){
						ovv[arc][i] = v;
						change = 1;
					}
				}
				if(change){
					var leds = [];
					for(var i = 64;i>0;i--)leds.push(0);
					var s = 0;
					var l = 64;
					//first draw the bars etc
					if(arc_type[arc]==0){
						s = 36;
						l = 56;
						if(arc_pol[arc]==0){ //uni
							v = 4 + 56 * ov[arc];
							//v = (v>=64) ? v-64 : v;
							var vv = Math.floor(v);
							for(var i=0;i<64;i++){
								var ii = i + 32;
								ii = (ii>=64)? (ii-64):ii;
								leds[ii] = bar_brightness*((i>4)&&(i<v)) + (i==vv)*(Math.floor((v-vv)*bar_brightness));
							}	
						}else{
							s = 36;
							l = 56;
							v = 36 + 56 * ov[arc];
							v = (v>=64) ? v-64 : v;
							var vv = Math.floor(v);
							if(ov[arc]<0.5){
								for(var i=0;i<64;i++){
									leds[i] = bar_brightness*((i>v)) + (i==vv)*(Math.floor((v-vv)*bar_brightness));
								}	
							}else{
								for(var i=0;i<64;i++){
									leds[i] = bar_brightness*((i<v)) + (i==vv)*(Math.floor((v-vv)*bar_brightness));
								}	
							}
						}
					}else{
						s= 32;
						l= 64;
						v = Math.floor(arc_pol[arc] * ov[arc]);
						var ps = 32 / arc_pol[arc];
						for(var i=0;i<64;i++){
							var b = bar_brightness * ((Math.floor(i*arc_pol[arc]/64)==v) ? 1.2 : 0.6);
							var ii = i + 32;
							ii = (ii>=64)? (ii-64):ii;
							leds[ii] = Math.floor(b * Math.pow(1-Math.min(1,Math.abs((i % (2*ps)) - ps)/(ps-0.5)),0.1));
						}
					}
					//then add on the voice values as interpolated dots
					for(var i =0;i<arc_voices[arc].length;i++){
						var wv = (s + l*ovv[arc][i]);
						wv = (wv>=64) ? (wv-64) : wv;
						var vv = Math.floor(wv);
						wv -= vv;
						v2 = vv+1;
						v2 = (v2>=64) ? v2-64 : v2;
						leds[vv] = Math.min(15,leds[vv]+(1-wv)*point_brightness) |0;
						leds[v2] = Math.min(15,leds[v2]+(wv)*point_brightness) |0;
					}
					outlet(0,"/monome/ring/map",arc,leds);
				}
			}else if(arc_index[arc]<-1){ // opv sliders
				var change = 0;
				var v = voice_parameter_buffer.peek(1,arc_voices[arc][0]);
				if(v!=ov[arc]){
					change = 1;
					ov[arc] = v;
				}
				if(change){
					var leds = [];
					for(var i = 64;i>0;i--)leds.push(0);
					var s = 0;
					var l = 64;
					//first draw the bars etc
					if(arc_type[arc]==0){
						s = 36;
						l = 56;
						if(arc_pol[arc]==0){ //uni
							v = 4 + 56 * ov[arc];
							//v = (v>=64) ? v-64 : v;
							var vv = Math.floor(v);
							for(var i=0;i<64;i++){
								var ii = i + 32;
								ii = (ii>=64)? (ii-64):ii;
								leds[ii] = bar_brightness*((i>4)&&(i<v)) + (i==vv)*(Math.floor((v-vv)*bar_brightness));
							}	
						}else{
							s = 36;
							l = 56;
							v = 36 + 56 * ov[arc];
							v = (v>=64) ? v-64 : v;
							var vv = Math.floor(v);
							if(ov[arc]<0.5){
								for(var i=0;i<64;i++){
									leds[i] = bar_brightness*((i>v)) + (i==vv)*(Math.floor((v-vv)*bar_brightness));
								}	
							}else{
								for(var i=0;i<64;i++){
									leds[i] = bar_brightness*((i<v)) + (i==vv)*(Math.floor((v-vv)*bar_brightness));
								}	
							}
						}
					}else{
						s= 32;
						l= 64;
						v = Math.floor(arc_pol[arc] * ov[arc]);
						var ps = 32 / arc_pol[arc];
						for(var i=0;i<64;i++){
							var b = bar_brightness * ((Math.floor(i*arc_pol[arc]/64)==v) ? 1.2 : 0.6);
							var ii = i + 32;
							ii = (ii>=64)? (ii-64):ii;
							leds[ii] = Math.floor(b * Math.pow(1-Math.min(1,Math.abs((i % (2*ps)) - ps)/(ps-0.5)),0.1));
						}
					}
					//then add on the voice values as interpolated dots
					var wv = (s + l*ovv[arc][0]);
					wv = (wv>=64) ? (wv-64) : wv;
					var vv = Math.floor(wv);
					wv -= vv;
					v2 = vv+1;
					v2 = (v2>=64) ? v2-64 : v2;
					leds[vv] = Math.min(15,leds[vv]+(1-wv)*point_brightness) |0;
					leds[v2] = Math.min(15,leds[v2]+(wv)*point_brightness) |0;
					outlet(0,"/monome/ring/map",arc,leds);
				}
			}
		}
	}else{
		var leds = [];
		for(var arc=0;arc<4;arc++){
			if(ov[arc] != iv[arc]){
				ov[arc] = iv[arc];
				v = 4 + 56 * ov[arc];
				var vv = Math.floor(v);
				for(var i=0;i<64;i++){
					var ii = i + 32;
					ii = (ii>=64)? (ii-64):ii;
					leds[ii] = Math.floor((0.2+brightnesslist[arc])*bar_brightness*((i>4)&&(i<v)) + (i==vv)*(((v-vv)*bar_brightness)));
				}	
				outlet(0,"/monome/ring/map",arc,leds);
			}
		}
	}
}