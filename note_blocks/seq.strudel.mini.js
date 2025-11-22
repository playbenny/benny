var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
// var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var parameter_value_buffer = new Buffer("parameter_value_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,unit,rh;
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
var p = [];
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
	typedMessage = null;
	if(block>=0){
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		//if(!mini) get_connections();
		draw();
	} 
}

function draw(){
	if(block>=0){
		for(var i=0;i<v_list.length;i++) {
			p[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i])*15.99);
		}
		fulldraw();
	}
}

function fulldraw(){
	rh = height / v_list.length;
	var col = block_colour;
	for(var v=0;v<v_list.length;v++){
		var patternString = "";
		if(blocks.contains("blocks["+block+"]::stored_patterns::"+p[v]+"::"+v+"::pattern")){
			patternString = blocks.get("blocks["+block+"]::stored_patterns::"+p[v]+"::"+v+"::pattern");
		}

		outlet(1,"paintrect",x_pos,y_pos+2+v*rh,x_pos+width,y_pos+(v+1)*rh-2,col[0]*0.25,col[1]*0.25,col[2]*0.25);
		outlet(1,"moveto",x_pos+4,y_pos+2+(v+0.2)*rh);
		if(typedMessage!=null && typingRow==v){
			outlet(1,"frgb",menucolour);
			outlet(1,"write",typedMessage);
		}else if(patternString!=""){
			outlet(1,"frgb",block_colour);
			outlet(1,"write",patternString);
		}else{
			outlet(1,"frgb",col[0]*0.4,col[1]*0.4,col[2]*0.4);
			outlet(1,"write","type a pattern here...");
		}
	}
}

function update(){
	if(block>=0){
		var r,i;
		for(i=0;i<v_list.length;i++) {
			var pp = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+7)*15.99);
			if(p[i]!=pp){
				p[i]=pp;
				change = 1;
			}
		}
		if(change==1){
			outlet(1,"paintrect",x_pos,y_pos,x_pos+width,y_pos+height,0,0,0);
			fulldraw();
			return 0;
		}
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
	messnamed("to_blockmanager","store_ok_done",block);
}

var typedMessage = null;
var typingRow = -1;

function keydown(key,x,y){
	if(typedMessage == null){
		typingRow = Math.floor(v_list.length * (y-y_pos) / height);
		if(blocks.contains("blocks["+block+"]::stored_patterns::"+p[typingRow]+"::"+typingRow+"::pattern")){
			typedMessage = blocks.get("blocks["+block+"]::stored_patterns::"+p[typingRow]+"::"+typingRow+"::pattern");
		}
	}
	if(key == -4){//enter
		parseTypedMessage();
	}else if(key == -3){//esc
		typedMessage=null;
	}else if((key==-6)||(key==-7)){
		typedMessage = typedMessage.slice(0, -1);
	}else{
		if(key>512){
			if(key==556){
				key = 60;
			}else if(key==558){
				key = 62;
			}else if(key==547){
				key = 126;
			}else if(key==561){
				key = 33;
			}else if(key==568){
				key = 42;
			}
		}else if(key == -2){
			key = 32;
		}
		// post("\nhigh key",key,String.fromCharCode(key-512));
		var s = String.fromCharCode(key);
		
		if(typedMessage == null){
			typingRow = Math.floor(v_list.length * (y-y_pos) / height);
		}
		if(typedMessage == null) typedMessage = "";
		typedMessage = typedMessage.concat(s);
	
	}
	fulldraw();
}
function parseTypedMessage(){
	var v = typingRow;
	blocks.replace("blocks["+block+"]::stored_patterns::"+p[v]+"::"+v+"::pattern",typedMessage);
	messnamed("strudel_mini",block,v,"bang");
	typedMessage = null;
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
