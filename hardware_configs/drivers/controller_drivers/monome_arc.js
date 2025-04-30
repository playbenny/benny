inlets = 1;
outlets = 1;

var config = new Dict;
config.name = "config";
var blocks = new Dict;
blocks.name = "blocks";
var blocktypes = new Dict;
blocktypes.name = "blocktypes";

var MAX_PARAMETERS=256;

function loadbang(){
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");

function target(arc,index){
	var t_block = Math.floor( index / MAX_PARAMETERS);
	var t_param = index - t_block * MAX_PARAMETERS;
	var btype = blocks.get("blocks["+t_block+"]::name");
	
	post("\narc",arc," map to block ",t_block," param ",t_param," type ", btype);
}