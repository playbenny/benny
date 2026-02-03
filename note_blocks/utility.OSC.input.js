var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
var shape_buffer = new Buffer("osc_shape_lookup");
outlets = 4;
var config = new Dict;
config.name = "config";
var connections = new Dict;
connections.name = "connections";
var blocks = new Dict;
blocks.name = "blocks";
var width, height, x_pos, y_pos, unit;
var block = -1;
var blocks = new Dict;
blocks.name = "blocks"
var voicemap = new Dict;
voicemap.name =  "voicemap";
var mini = 0;
var v_list = [];
var cu; //first one's cursor pos, to see if we need to redraw
var gx,gy,gw,gh; //graph position (it has labels in not-mini mode so the size is not the size of the panel)
var vcol = [[255,0,0],[0,255,0],[0,0,255],[255,255,0],[0,255,255],[255,0,255]];
var bright = [];
var offs = [];
var textslow = 0;

function setup(x1,y1,x2,y2,sw,mode){
	outlet(0,"getvoice");

}



function update(){
	
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
        if(blocks.contains("blocks["+block+"]::OSC_settings")){
            // post("\nexisting OSC settings found",JSON.stringify(blocks.get("blocks["+block+"]::OSC_settings")));
            outlet(3, "port", blocks.get("blocks["+block+"]::OSC_settings::port"));
	// 					outlet(0,'display', 'bba','set', `${p.blockPath}`);
  // outlet(0,'display', 'addr1','set', p.voices.join('\n'));
  // outlet(0,'display', 'addr2','set', p.outputs.join('\n'));
            //outlet(3, 
        }    
	}

}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function store(){
}

function keydown(key){
	
}
function enabled(){}