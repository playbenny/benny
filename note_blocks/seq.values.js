var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var parameter_value_buffer = new Buffer("parameter_value_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,unit,sx,rh,cw,maxl=-1;
var block = -1;
var blocks = new Dict;
blocks.name = "blocks"
var connections = new Dict;
connections.name = "connections";
var blocktypes = new Dict;
blocktypes.name = "blocktypes";
var voicemap = new Dict;
voicemap.name =  "voicemap";
var mini = 0;
var v_list = [];
var l = [];
var s = [];
var p = [];
var rec = [];
var cursors = []; //holds last drawn position of playheads (per row)
//data format: for each voice the buffer holds:
// 0 - start (*128)
// 1 - length (*128+1)
// 2 - playhead position (updated by player voice)
// 3-131? data values
var notelist = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var menucolour,menudark,block_colour=[0,255,0];
var change;
var target_block = [];

function setup(x1,y1,x2,y2,sw,mode){
//	post("drawing sequencers");
	menucolour = config.get("palette::menu");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	menudark = [menucolour[0]*0.2,menucolour[1]*0.2,menucolour[2]*0.2];
	width = x2-x1;
	mini=0;
	mini=(mode=="mini")|0;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	unit = height / 18;
	typedMessage = "";
	if(block>=0){
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		if(!mini) get_connections();
		draw();
	} 
}

function draw(){
	if(block>=0){
		var i;
		maxl=1;
		for(i=0;i<v_list.length;i++) {
			cursors[i]=-1;
			l[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+3)*127.99)+1;
			s[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+2)*127.99);
			p[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+7)*15.99);
			rec[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+8)>0.5);
			if(l[i]+s[i]>maxl) maxl = l[i]+s[i];
		}
		fulldraw();
	}
}

function fulldraw(){
	var i,c,r,ph;
	var nonempty=[], found = 0;
	cw = (width)/(maxl - 0.1);
	i = Math.max(2 - mini,v_list.length);
	rh = height / (i-0.1);
	sx = 0;
	for(r=0;r<v_list.length;r++){
		ph = Math.floor(l[r]*voice_data_buffer.peek(1, MAX_DATA*v_list[r]));		
		cursors[r]=ph;
		var col =rec[r] ? [250,40,40] :  block_colour;
		for(c=maxl-1;c>=0;c--){		
			var shade = (c==ph) ? 3 : (0.4+0.6*((c>=s[r])&&(c<s[r]+l[r])));	
			outlet(0,"custom_ui_element","data_v_scroll", sx+c*cw+x_pos,r*rh+y_pos,sx+(0.9+c)*cw+x_pos,(r+0.9)*rh+y_pos,shade * col[0],shade * col[1],shade * col[2],MAX_DATA*v_list[r]+128*p[r]+1+c,1);
			var val = voice_data_buffer.peek(1, MAX_DATA*v_list[r]+128*p[r]+1+c);
			if(val!=0){
				nonempty[r]=1;
				found = 1;
			}
			if(!mini){
				outlet(1,"moveto",sx+c*cw+x_pos+0.1*unit,r*rh+y_pos+unit*0.4);
				outlet(1,"write",c);
				i=Math.floor(val*128);
				if(i>0){
					i--;
					outlet(1,"frgb",menucolour);
					outlet(1,"moveto",sx+c*cw+x_pos+0.1*unit,r*rh+y_pos+unit*0.8);
					outlet(1,"write",i);
					outlet(1,"moveto", sx + c * cw + x_pos + 0.1 * unit, r * rh + y_pos + unit*1.2);
					outlet(1,"write", notelist[i % 12] + "-" + Math.floor(i/12));
					if(target_block[r]){
						var yy = 1.8;
						// post("\nconn found for lane",r,JSON.stringify(target_block[r]));
						for(var dn=0;dn<target_block[r].length;dn++){
							if(c == 0){
								outlet(1,"frgb", shade * col[0],shade * col[1],shade * col[2]);
								outlet(1,"moveto", sx + c * cw + x_pos + 0.1 * unit, r * rh + y_pos + unit*yy);
								outlet(1,"write", "to:" + target_block[r][dn].destname + ":"+target_block[r][dn].paramlabel); 
							}
							yy += 0.4;
							outlet(1,"moveto", sx + c * cw + x_pos + 0.1 * unit, r * rh + y_pos + unit*yy);
							// apply offset and scale
							var tval = ((val - 1/128) * target_block[r][dn].scale) + 2*(target_block[r][dn].offset- 0.5);
							// add to base target param value and wrap 
							tval += parameter_value_buffer.peek(1, target_block[r][dn].paramaddress);
							if(target_block[r][dn].wrap){
								tval %= 1;
							}else{
								tval = Math.max(0,Math.min(1,tval));
							}
							tval = get_parameter_label(target_block[r][dn].ptype, target_block[r][dn].wrap, tval, target_block[r][dn].pvalues);
							outlet(1,"frgb",menucolour);
							outlet(1,"write", tval); 							
							yy += 0.6;
						}
					}
				}
			}
		}
	}
	change = 0;
	if(found){
		var n = blocks.get("blocks["+block+"]::patterns::names");
		if(n!=null){
			for(r=0;r<v_list.length;r++){
				if(nonempty[r]&&((n[p[r]]==null)||(n[p[r]]==""))) n[p[r]] = (1+p[r]).toString();
			}
			blocks.replace("blocks["+block+"]::patterns::names",n);
		}
	}
}

function update(){
	if(block>=0){
		var r,i;
		maxl=1;
		// change = 0;
		for(i=0;i<v_list.length;i++) {
			//cursors[i]=-1;
			var pp = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+7)*15.99);
			if(p[i]!=pp){
				p[i]=pp;
				change = 1;
			}
			var ll = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+3)*127.99)+1;
			if(l[i]!=ll){
				l[i]=ll;
				change = 1;
			}
			ll = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+2)*127.99);
			if(s[i] != ll){
				s[i]=ll;
				change = 1;
			}
			var rr = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+8)>0.5);
			if(rec[i]!=rr){
				rec[i]=rr;
				change = 1;
			}
			if(l[i]+s[i]>maxl) maxl = l[i]+s[i];
		}
		if(change==1){
			outlet(1,"paintrect",x_pos,y_pos,x_pos+width,y_pos+height,0,0,0);
			fulldraw();
			return 0;
		}
		// post("update");		
		for(r=0;r<v_list.length;r++){
			ph = Math.floor(l[r]*voice_data_buffer.peek(1, MAX_DATA*v_list[r]));
			if(cursors[r]!=ph){
				//redraw slider that was old cursor
				if((cursors[r]>=0)&&(cursors[r]<maxl)){
					var col = rec[r] ?[250,40,40] :  block_colour ;
					var shade = (0.4+0.6*((cursors[r]>=s[r])&&(cursors[r]<s[r]+l[r])));
					outlet(0,"custom_ui_element","data_v_scroll", sx+cursors[r]*cw+x_pos,r*rh+y_pos,sx+(0.9+cursors[r])*cw+x_pos,(r+0.9)*rh+y_pos,shade * col[0],shade *col[1],shade *col[2],MAX_DATA*v_list[r]+128*p[r]+1+cursors[r],1);
					if(!mini){
						outlet(1,"moveto",sx+cursors[r]*cw+x_pos+0.1*unit,r*rh+y_pos+unit*0.5);
						outlet(1,"write",cursors[r]);
						i=Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[r]+128*p[r]+1+cursors[r])*128);
						if(i>0){
							i--;
							outlet(1,"frgb",menucolour);
							outlet(1,"moveto",sx+cursors[r]*cw+x_pos+0.1*unit,r*rh+y_pos+unit*0.8);
							outlet(1,"write",i);
							outlet(1,"moveto",sx+cursors[r]*cw+x_pos+0.1*unit,r*rh+y_pos+unit*1.2);
							outlet(1,"write",notelist[i%12]+"-"+Math.floor(i/12));
						}					
					}
				}
				cursors[r]=ph;
				//draw new cursor slider
				if(cursors[r]<maxl){
					var gb = (rec[i]) ? 40:255;
					outlet(0,"custom_ui_element","data_v_scroll", sx+ph*cw+x_pos,r*rh+y_pos,sx+(0.9+ph)*cw+x_pos,(r+0.9)*rh+y_pos,255,gb,gb,MAX_DATA*v_list[r]+128*p[r]+1+ph,1);
				}
			}
		}
	}
	if(typedMessage!=""){
		var r = typingRow;
		outlet(1,"paintrect",x_pos + unit * 1, r*rh+y_pos + rh*0.3 , x_pos+width - unit*1,r*rh+y_pos+rh*0.3+unit*4,0,0,0);
		outlet(1,"framerect",x_pos + unit * 1.1, r*rh+y_pos + rh*0.3 + unit*0.1 , x_pos+width - unit*1.1,r*rh+y_pos+rh*0.3+unit*3.9,menucolour);
		outlet(1,"moveto",x_pos+ unit*1.4, r*rh+y_pos + rh*0.3 + unit * 2.5);
		outlet(1,"write",typedMessage+"_");
		outlet(1,"moveto",x_pos+ unit*1.4, r*rh+y_pos+ rh*0.3 + unit * 1.2);
		outlet(1, "frgb" , menudark);
		outlet(1,"write","numbers or midi note names (eg C#4) separated by commas")
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function store(){
	messnamed("to_blockmanager","store_wait_for_me",block);
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		for(var i=0;i<v_list.length;i++){
			maxl=1;
			for(var l = MAX_DATA-1;l>0;l--){
				if(voice_data_buffer.peek(1, MAX_DATA*v_list[i]+l)!=0){
					maxl=l+1;
					l=0;
				}
			}
			var transf_arr = [];
			transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list[i], maxl);
			blocks.replace("blocks["+block+"]::voice_data::"+i, transf_arr);
		}		
	}else{
		post("error storing seq.values - unknown block",block,v_list);
	}
	messnamed("to_blockmanager","store_ok_done",block);
}

var typedMessage = "";
var typingRow = -1;

function keydown(key,x,y){
	if(key == -4){//enter
		parseTypedMessage();
	}else if(key == -3){//esc
		typedMessage="";
	}else if((key==-6)||(key==-7)){
		typedMessage = typedMessage.slice(0, -1);
	}else{
		var s = String.fromCharCode(key);
		if("ABCDEFGabcdefg#0123456789,.".indexOf(s)>-1){
			if(typedMessage == ""){
				typingRow = Math.floor(v_list.length * (y-y_pos) / height);
			}
			typedMessage = typedMessage.concat(s);
		}else{
			// outlet(0,"keydown_not_needed_by_panel",key);
		}
	}
	fulldraw();
}
function parseTypedMessage(){
	var list = typedMessage.split(" ").join(",").split(",");
	if(!Array.isArray(list)) list = [list];
	for(var i=0;i<list.length;i++){
		var note = parseMidiNote(list[i]);
		if(!note) note = parseInt(list[i]);
		if(note >= 0){
			note += 1;
		}else{note = 0;}
		voice_data_buffer.poke(1, MAX_DATA*v_list[typingRow]+1+i, note/128);		
		// post("\npoked",MAX_DATA*v_list[typingRow]+1+i,note/128);
	}
	// post("\nrequest set length:",block,typingRow,v_list[typingRow],list.length);
	outlet(0,"request_set_voice_parameter",block,v_list[typingRow],3,list.length);
	typedMessage = "";
}

function parseMidiNote(note) {
    const midiNotePattern = /([A-Ga-g][#b]?)(\d+)/;
    const match = note.match(midiNotePattern);

    if (match) {
        const noteName = match[1].toUpperCase(); // Normalize to uppercase
        const octave = parseInt(match[2], 10);

        // Mapping of note names to MIDI note numbers
        const noteToNumber = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
            'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9,
            'A#': 10, 'B': 11
        };

        const noteNumber = (noteToNumber[noteName] + (octave) * 12) % 128; // MIDI note number

        return noteNumber;
    } else {
        return null; // No valid note found
    }
}

function enabled(){}

//currently only bothers with param-param ones
function get_connections(){
	target_block = [];
	for(var i=connections.getsize("connections")-1; i>=0; i--){
		if(connections.contains("connections["+i+"]::from")
			 && connections.get("connections["+i+"]::from::number") == block
			 && connections.get("connections["+i+"]::from::output::type") == "parameters"
			 && connections.get("connections["+i+"]::to::input::type") == "parameters"){
			var source = connections.get("connections["+i+"]::from::voice");
			var details = { };
			var number = connections.get("connections["+i+"]::to::input::number");
			details.toblock = connections.get("connections["+i+"]::to::number");
			if(blocks.contains("blocks["+details.toblock+"]::label")){
				details.destname = blocks.get("blocks["+details.toblock+"]::label");
			}else{
				details.destname = blocks.get("blocks["+details.toblock+"]::name");
			}
			details.destvoice = connections.get("connections["+i+"]::to::voice");
			if(details.destvoice == "all"){
				details.destvoice = voicemap.get(details.toblock);
				if(Array.isArray(details.destvoice)) details.destvoice = details.destvoice[0];
			}
			details.paramaddress = MAX_PARAMETERS * details.toblock + number;
			details.paramlabel = blocktypes.get(blocks.get("blocks["+details.toblock+"]::name")+"::parameters["+number+"]::name");
			details.pvalues = blocktypes.get(blocks.get("blocks["+details.toblock+"]::name")+"::parameters["+number+"]::values");
			details.ptype = blocktypes.get(blocks.get("blocks["+details.toblock+"]::name")+"::parameters["+number+"]::type");
			details.wrap = blocktypes.get(blocks.get("blocks["+details.toblock+"]::name")+"::parameters["+number+"]::wrap");
			details.scale = connections.get("connections["+i+"]::conversion::scale");
			details.offset = connections.get("connections["+i+"]::conversion::offset");
			var srclist;
			if(source == "all"){
				srclist = voicemap.get(block);
				if(!Array.isArray(srclist)) srclist = [srclist];
				for(var ii = 0; ii<srclist.length;ii++) srclist[ii]=ii;
			}else{
				srclist = [source - 1];
			}
			// post("\nnumber",i,"srclist",srclist,"details",JSON.stringify(details));
			for(var ii=0;ii<srclist.length;ii++){
				if(target_block[srclist[ii]]==null)target_block[srclist[ii]] = [];
				target_block[srclist[ii]].push(details);
			}
		}
	}
	// post("\ncollected connections,\n",JSON.stringify(target_block));
}


function get_parameter_label(p_type,wrap,pv,p_values){
	var pvp="";
	if(p_type == "menu_f"){
		var pv2;
		if(wrap){
			pv *= (p_values.length-0.0001);
			pv = Math.floor(pv);
			pv2 = (pv+1) % (p_values.length);
			pv = pv % (p_values.length);											
		}else{
			pv *= (p_values.length-1);
			pv = Math.floor(pv);
			pv2 = Math.min(pv+1,p_values.length-1);
			pv = Math.min(pv,p_values.length-1);											
		}
		if(pv==pv2){
			pvp = p_values[pv];	
		}else{
			pvp = p_values[pv]+ "-"+ p_values[pv2];
		}	
	}else if((p_type == "menu_i")||(p_type == "menu_b")||(p_type=="menu_l")||(p_type=="menu_d")||(p_type=="scale")){
		pv *= (p_values.length-0.0001);
		pv = Math.min(Math.floor(pv),p_values.length-1);
		pvp = p_values[pv];
	}else if((p_type == "wave")){
		pv *= (MAX_WAVES-0.0001);
		pv = Math.floor(pv+1);
		var wnam = "-";
		if(waves_dict.contains("waves["+pv+"]::name")) wnam = waves_dict.get("waves["+pv+"]::name");
		pvp = pv+" "+wnam;
	}else if((p_type == "float") || (p_type == "int") || (p_type=="float4") || (p_type=="note")){
		if(p_values[3] == "exp"){
			if(p_values[0] == "uni"){
				pv = Math.pow(2, pv) - 1;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = Math.pow(2, pv) - 1;
				}else{
					pv = -(Math.pow(2, -pv) - 1);
				}
				pv += 1;
				pv *= 0.5;
			}
		}else if(p_values[3] == "exp10"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(10, pv) - 1)*0.11111111111111111111111111111111;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(10, pv) - 1)*0.11111111111111111111111111111111;
				}else{
					pv = -0.11111111111111111111111111111111*(Math.pow(10, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp100"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(100, pv) - 1)*0.01010101010101010101010101010101;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(100, pv) - 1)*0.01010101010101010101010101010101;
				}else{
					pv = -0.01010101010101010101010101010101*(Math.pow(100, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp1000"){
			if(p_values[0] == "uni"){
				pv = (Math.pow(1000, pv) - 1)*0.001001001001001001001001001001;
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = (Math.pow(1000, pv) - 1)*0.001001001001001001001001001001;
				}else{
					pv = -0.001001001001001001001001001001*(Math.pow(1000, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp.1"){
			if(p_values[0] == "uni"){
				pv = -1.1111111111111111111111111111111*(Math.pow(.1, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.1111111111111111111111111111111*(Math.pow(0.1, pv) - 1);
				}else{
					pv = 1.1111111111111111111111111111111*(Math.pow(0.1, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp.01"){
			if(p_values[0] == "uni"){
				pv = -1.010101010101010101010101010101*(Math.pow(0.01, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.010101010101010101010101010101*(Math.pow(0.01, pv) - 1);
				}else{
					pv = 1.010101010101010101010101010101*(Math.pow(0.01, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "exp.001"){
			if(p_values[0] == "uni"){
				pv = -1.001001001001001001001001001001*(Math.pow(0.001, pv) - 1);
			}else{
				pv -=0.5;
				pv *=2;
				if(pv>=0){
					pv = -1.001001001001001001001001001001*(Math.pow(0.001, pv) - 1);
				}else{
					pv = 1.001001001001001001001001001001*(Math.pow(0.001, -pv) - 1);
				}
				pv += 1;
				pv /= 2;
			}
		}else if(p_values[3] == "s"){
			if(p_values[0] == "uni"){
				pv = 0.5 - 0.5 * Math.cos(pv*PI);
			}else{
				pv -=0.5;
				pv *=2;
				pv = 0.5 - 0.5 * Math.cos(pv*PI);
				pv += 1;
				pv /= 2;
			}
		}
		pvp = p_values[1] + (p_values[2]-p_values[1]-0.0001)*pv;
		if(p_type == "int"){
			pvp = Math.floor(p_values[1] + (0.99+p_values[2]-p_values[1])*pv);
		}else if(p_type == "note"){
			pvp = note_names[Math.floor(pvp)];
		}else if(p_type == "float4"){
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
			var pre = 4+Math.floor(Math.log(Math.abs(pv*10)+0.1)/Math.log(10));
			pvp = pv.toPrecision(pre);
		}else{
			pv = p_values[1] + (p_values[2]-p_values[1])*pv;
			var pre = 2+Math.floor(Math.log(Math.abs(pv*10)+0.1)/Math.log(10));
			pvp = pv.toPrecision(pre);
		}
	}
	return pvp;
}
