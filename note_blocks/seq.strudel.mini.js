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
var textCursor = null;
var cursorState = 0;
var typedMessage = null;
var typingRow = -1;
var rowwidth = 30;


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
	if(block>=0){
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		if(mini){
			unit = height / (6 * Math.sqrt(v_list.length));
		}else{
			unit = height / (12 * Math.sqrt(v_list.length));
		}
		// post("\nwidth/unit =",width/unit);
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
	outlet(0,"custom_ui_element","mouse_passthrough",x_pos,y_pos,width+x_pos,height+y_pos,0,0,0,block,1);

	for(var v=0;v<v_list.length;v++){
		var patternString = "";
		if(blocks.contains("blocks["+block+"]::stored_patterns::"+p[v]+"::"+v+"::pattern")){
			patternString = blocks.get("blocks["+block+"]::stored_patterns::"+p[v]+"::"+v+"::pattern");
		}
		outlet(1,"paintrect",x_pos,y_pos+2+v*rh,x_pos+width,y_pos+(v+1)*rh-2,col[0]*0.25,col[1]*0.25,col[2]*0.25);
		outlet(1,"moveto",x_pos+4,y_pos+2+unit+rh*v);
		outlet(1,"font",config.get("monofont"),unit);
		if(typedMessage!=null && typingRow==v){
			textCursor = Math.min(textCursor,typedMessage.length);
			renderText(typedMessage,v, textCursor);
		}else if(patternString!=""){
			renderText(patternString,v,-1);
		}else{
			outlet(1,"frgb",col[0]*0.4,col[1]*0.4,col[2]*0.4);
			outlet(1,"write","type a pattern here...");
		}
	}
}

function renderText(message, row, cursor){
	//cycles through colours based on bracket depth.
	var depth = 0;
	var colour = 0;
	var pal_len = config.getsize("palette::gamut");
	var x = x_pos+4;
	var x_step = unit/1.8;
	y = y_pos+rh*row+unit;
	function scaleRGB(s, c){
		return [s*c[0],s*c[1],s*c[2]];
	}
	var bri = (row == typingRow)*0.4 + 0.7;
	outlet(1,"frgb",scaleRGB(bri,config.get("palette::gamut["+colour+"]::colour")));
	for(var i=0;i<message.length;i++){
		if(i==cursor){
			outlet(1,"moveto",x-0.2*unit,y);
			outlet(1,"frgb",menucolour);
			outlet(1,"write",cursorState<0.5 ? '|' : ' ');
			cursorState = (cursorState+0.1)%1;
			outlet(1,"frgb",scaleRGB(bri,config.get("palette::gamut["+colour+"]::colour")));
		}
		if((message[i] == '[') || (message[i] == '<')){
			depth++;
			colour = (depth * 4) % pal_len;
			outlet(1,"frgb",scaleRGB(bri,config.get("palette::gamut["+colour+"]::colour")));
		}
		outlet(1,"moveto",x,y);
		outlet(1,"write",message[i]);
		if((message[i] == ']') || (message[i] == '>')){
			depth--;
			if(depth<0)depth =0;
			colour = (depth * 4) % pal_len;
			outlet(1,"frgb",scaleRGB(bri,config.get("palette::gamut["+colour+"]::colour")));
		}
		x+=x_step;
		if(x>x_pos+width-unit){
			x = x_pos + 4; 
			y+=unit;
			rowwidth=i+1;
		}
	}
}

function update(){
	if(block>=0){
		var r,i;
		for(i=0;i<v_list.length;i++) {
			var pp = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i])*15.99);
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
		typingRow=-1;
	}else if(key==-11){
		textCursor--;
	}else if(key==-12){
		textCursor++;
	}else if(key==-6){
		typedMessage = typedMessage.slice(0,textCursor).concat(typedMessage.slice(textCursor+1));
	}else if(key==-7){
		typedMessage = typedMessage.slice(0,textCursor-1).concat(typedMessage.slice(textCursor));
		textCursor--;
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
			}else if(key==559 || key==575){
				key = 63;//?
			}else if(key==569){
				key = 40;//(
			}else if(key==560){
				key = 41;//)
			}else if(key==557){
				key = 95;//_
			}
		}else if(key == -2){
			key = 32;
		}
		// post("\nhigh key",key,String.fromCharCode(key-512));
		var s = String.fromCharCode(key);
		
		if(typedMessage == null){
			typingRow = Math.floor(v_list.length * (y-y_pos) / height);
			textCursor = Math.floor(1.8*(x-x_pos)/unit);
			typedMessage = "";
		}
		typedMessage = typedMessage.slice(0,textCursor)+s+typedMessage.slice(textCursor);
		textCursor++;	
	}
	fulldraw();
}

var scrcounter=0;
var mouseflag =0;
function mouse(x,y,l,s,a,c,scr){
	if(l==1){
		var newrow = Math.floor(v_list.length * (y-y_pos) / height);
		if(typingRow!=newrow){
			typingRow = newrow;
			if(blocks.contains("blocks["+block+"]::stored_patterns::"+p[typingRow]+"::"+typingRow+"::pattern")){
				typedMessage = blocks.get("blocks["+block+"]::stored_patterns::"+p[typingRow]+"::"+typingRow+"::pattern");
			}
			textCursor = Math.floor(1.8*(x-x_pos-4)/unit);
			textCursor += Math.floor((y-y_pos-rh*newrow)/unit)*rowwidth;
		}else{
			textCursor = Math.floor(1.8*(x-x_pos-4)/unit);
			textCursor += Math.floor((y-y_pos-rh*newrow)/unit)*rowwidth;
		}
		mouseflag = 1;
	}else if(scr!=0 && scr!=1){
		if(typingRow>-1){
			scrcounter+=scr;
			if(scrcounter>1){
				textCursor++;
				scrcounter=0;
				textCursor = Math.max(0, textCursor+2*(scr>0)-1);
			}else if(scrcounter<-1){
				textCursor--;
				scrcounter=0;
				textCursor = Math.max(0, textCursor+2*(scr>0)-1);
			}
		}
		mouseflag=1;
	}else if(mouseflag){
		fulldraw();
		mouseflag=0;
	}
}

function parseTypedMessage(){
	var v = typingRow;
	blocks.replace("blocks["+block+"]::stored_patterns::"+p[v]+"::"+v+"::pattern",typedMessage);
	messnamed("strudel_mini",block,v,"bang");
	post("\nparse");
	typedMessage = null;
	typingRow = -1;
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
