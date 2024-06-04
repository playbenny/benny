outlets = 4;
inlets = 1;

var firstbootwait = true;

var parameter_value_buffer = new Buffer("parameter_value_buffer");

var blocks = new Dict();
blocks.name = "blocks";
var io = new Dict();
io.name = "io";
var blocktypes = new Dict();
blocktypes.name = "blocktypes";
var config = new Dict();
config.name = "config";

var MAX_PARAMETERS = 256;

var controllerslist = [];
var controllersavailablelist = [];

var blockno = -1;
var blockname = null;
var parameternumber = -1; //the number of the parameter that holds the controller number
var controllercount = -1; //the number of controllers on the parameter slider
var lastparam;

var selected_in_dict = null;
var selected = null;
var selection_type = null; //null, dict, param

var prev_blockno = -1;
var block_enable = 0;

function loadbang(){
    MAX_PARAMETERS = config.get("MAX_PARAMETERS");
    //post("\ncontroller manager loaded");
}

function block(bn){
    if(firstbootwait){
        var wait_task = new Task(done_waiting, this);
        wait_task.schedule(2000);    
    }
    blockno = bn;
    lastparam = -1;
    if(bn>-1) prev_blockno = bn;
    //the block message is what causes it to do the lookups
    if(blocks.contains("blocks["+blockno+"]::name")){
        blockname = blocks.get("blocks["+blockno+"]::name");
        post("\ncontroller manager initialising for block",blockno,blockname);
        var l = blocktypes.getsize(blockname+"::parameters");
        for(var i = 0;i<l;i++){
            if(blocktypes.get(blockname+"::parameters["+i+"]::name")=="controller"){
                parameternumber = i;
                i = 99999;
            }
        }
        if(i<99999){
            post("\nthis block has no controller parameter?");
            return -1;
        }
        controllerslist = blocktypes.get(blockname+"::parameters["+parameternumber+"]::values");
        controllercount = controllerslist.length;
        if(firstbootwait) post("there are",controllercount,"controllers available in this hardware configuration");
        selected = null; 
        selection_type = null;
        selected_in_dict = null;
        if(blocks.contains("blocks["+blockno+"]::selected_controller")&&(blocks.get("blocks["+blockno+"]::selected_controller")!="none")){
            selected_in_dict = blocks.get("blocks["+blockno+"]::selected_controller");
            post("\ncontroller selection from savefile:",selected_in_dict);
            set_param(selected_in_dict);
            var is = ispresent(selected_in_dict);
            //post("is present?",is);
            if(is==-1){
                post("\nthis controller isn't available now, looking for substitutes:");
                if(io.contains("controllers::"+selected_in_dict+"::substitute")){
                //find substitute?
                    var subs = io.get("controllers::"+selected_in_dict+"::substitute");
                    if(!Array.isArray(subs)) subs = [subs];
                    for(var i = 0;i<subs.length;i++){
                        is = ispresent(subs[i]);
                        if(is>-1){
                            post("\nfound substitute:",subs[i]);
                            selected = subs[i];
                            selection_type = "substitute";
                        }else{
                            post("\n ",subs[i],"also not available");
                        }
                    }
                }
                if(selected == null){
                    post("\ndidn't find an available substitute, setting to 'none'");
                    selected = "none";
                    selection_type = "notfound";
                }
            }else{
                selected = selected_in_dict;
                selection_type = "dict";
            }
        }else{
            post("\nno controller selection found in dict");
            selection_type = "notfoundindict";
            selected_in_dict = null;
            selected = "none";
        }
    }
    outlet(3, blockname);
    outlet(2, selected);
    outlet(1, selection_type);
}

function param(value){
    if(blockno>-1){
        if(firstbootwait&&(value==0)){
            //post("\nignoring the zero value received on block load");
        }else{
            firstbootwait = false;
            //post("\nselection from the parameter slider:",value,controllerslist[value],"is present?:",ispresent(controllerslist[value]));
            if(controllerslist[value]==selected_in_dict){
                //post("\nslider is same as value already stored in the dictionary");
            }else if((selection_type=="notfound")&&(selected=="none")){
                post("\nsaved controller wasn't found, ignoring 'none'.",controllerslist[value]);
            }else{
                blocks.replace("blocks["+blockno+"]::selected_controller",controllerslist[value]);
                selected_in_dict = controllerslist[value];
                selected = selected_in_dict;
                selection_type = "dict";
                post("\nslider selection:",controllerslist[value],"storing to dictionary");
                outlet(3, blockname);
                outlet(2, selected);
                outlet(1, selection_type);   
            }
        } 
    }
}

function checkparam(){
    if(blockno>-1){
        var gotparam = Math.floor(parameter_value_buffer.peek(1,blockno*MAX_PARAMETERS+parameternumber)*controllercount);
        if(gotparam != lastparam){
            //post("\nparam read",gotparam);
            lastparam = gotparam;
            param(lastparam);
        }
    }
}

function append(inputname){
    controllersavailablelist.push(inputname);
}

function enabled(enab){
    if(firstbootwait&&enab){

    }else{
        if(enab && (blockno==-1) && (prev_blockno!=-1)){
            block(prev_blockno);
        }else if(!enab){
            if(blockno!=-1){
                block(-1);
            }
        }
    }
}

function ispresent(controller){
    var is = -1;
    for(var i = 0; i<controllersavailablelist.length; i++){
        if(controllersavailablelist[i]==controller){
            is = i;
            i = 99999;
        }
    }
    return is;
}

function clear(){
    controllersavailablelist = [];
}
function done_waiting(){
    firstbootwait=false;
}
function set_param(value){
    if(blockno > -1){
        var para = -1;
        for(var i = 0;i<controllercount;i++){
            if(value == controllerslist[i]) para = i;
        }
        if(para > -1){
            //post("\nstoring controller selection to parameter",0.99*(para+0.5)/controllercount);
            parameter_value_buffer.poke(1,blockno*MAX_PARAMETERS+parameternumber,0.99*(para+0.5)/controllercount);
        }
    }
}