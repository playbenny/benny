outlets = 5;
inlets = 1;
var verbose = false;

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
var MAX_BLOCKS = 128;

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
    MAX_BLOCKS = config.get("MAX_BLOCKS");
    //post("\ncontroller manager loaded");
}

function block(bn){
    if(firstbootwait){
        var wait_task = new Task(done_waiting, this);
        wait_task.schedule(2000);    
    }
    blockno = bn;
    lastparam = -1;
    if(bn>-1){
        prev_blockno = bn;
        //the block message is what causes it to do the lookups
        if(blocks.contains("blocks["+blockno+"]::name")){
            blockname = blocks.get("blocks["+blockno+"]::name");
            if(verbose) post("\ncontroller manager initialising for block",blockno,blockname);
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
            if(firstbootwait&&verbose) post("there are",controllercount,"controllers available in this hardware configuration");
            selected = null; 
            selection_type = null;
            selected_in_dict = null;
            if(blocks.contains("blocks["+blockno+"]::selected_controller")&&(blocks.get("blocks["+blockno+"]::selected_controller")!="none")){
                selected_in_dict = blocks.get("blocks["+blockno+"]::selected_controller");
                if(verbose) post("\ncontroller selection from savefile:",selected_in_dict);
                set_param(selected_in_dict);
                var is = ispresent(selected_in_dict);
                //post("is present?",is);
                if(is==-1){
                    if(verbose) post("\nthis controller isn't available now, looking for substitutes:");
                    if(io.contains("controllers::"+selected_in_dict+"::substitute")){
                    //find substitute?
                        var subs = io.get("controllers::"+selected_in_dict+"::substitute");
                        if(!Array.isArray(subs)) subs = [subs];
                        for(var i = 0;i<subs.length;i++){
                            is = ispresent(subs[i]);
                            if(is>-1){
                                //this substitute is present, however first we need to check it's not in use already elsewhere
                                for(var ib=0;ib<MAX_BLOCKS;ib++){
                                    if(blocks.contains("blocks["+ib+"]::selected_controller")){
                                        var sc = blocks.get("blocks["+ib+"]::selected_controller");
                                        if(sc == subs[i]){
                                            if(verbose) post("\na potential substitute ("+subs[i]+") is present but is already in use by block "+ib+" ("+blocks.get("blocks["+ib+"]::name")+")");
                                            ib = MAX_BLOCKS;
                                            is = -1;
                                        }
                                    }
                                }
                                if(is>-1){
                                    if(verbose) post("\na substitute is present:",subs[i]);
                                    selected = subs[i];
                                    selection_type = "substitute";
                                    i = subs.length;
                                }
                            }else{
                                if(verbose) post("\n ",subs[i],"also not available");
                            }
                        }
                    }
                    if(selected == null){
                        if(verbose) post("\ndidn't find an available substitute, setting to 'none'");
                        selected = "none";
                        selection_type = "notfound";
                    }
                }else{
                    selected = selected_in_dict;
                    selection_type = "dict";
                }
            }else{
                if(verbose) post("\nno controller selection found in dict");
                selection_type = "notfoundindict";
                selected_in_dict = null;
                selected = "none";
            }
            if((selection_type == "notfound")||(selection_type == "notfoundindict")){
                var default_controller = null;
                if((blockname == "mixer.bus")&&(io.contains("controller_defaults::mixer_bus"))){
                    default_controller = io.get("controller_defaults::mixer_bus");
                }else if((blockname == "core.input.control.auto")&&(io.contains("controller_defaults::control_auto"))){
                    default_controller = io.get("controller_defaults::control_auto");
                }
                if(default_controller!=null){
                    is = ispresent(default_controller);
                    if(is>-1){
                        //default is present, however first we need to check it's not in use already elsewhere
                        for(var ib=0;ib<MAX_BLOCKS;ib++){
                            if(blocks.contains("blocks["+ib+"]::selected_controller")){
                                var sc = blocks.get("blocks["+ib+"]::selected_controller");
                                if(sc == default_controller){
                                    if(verbose) post("\na potential substitute ("+default_controller+") is present but is already in use by block "+ib+" ("+blocks.get("blocks["+ib+"]::name")+")");
                                    ib = MAX_BLOCKS;
                                    is = -1;
                                }
                            }
                        }
                        if(is>-1){
                            if(verbose) post("\na default is present:",default_controller);
                            selected = default_controller;
                            selection_type = "default";
                            set_param(default_controller);
                        }
                    }else{
                        if(verbose) post("\n ",default_controller,"also not available");
                    }
                }
            }
            if(verbose) post("\ninitialisation complete:",selected_in_dict,selection_type,selected,blockname);
        }
        var driver = "generic_midi_driver";
        if(selected!="none"){
            if(io.contains("controllers::"+selected+"::driver")){
                driver = io.get("controllers::"+selected+"::driver");
            }
        }
        outlet(4, "patchername", driver);
        outlet(3, blockname);
        outlet(2, selected);
        outlet(1, selection_type);
        outlet(0, selected_in_dict);
    }
}

function param(value){
    if(blockno>-1){
        if(firstbootwait&&(value==0)){
            if(verbose) post("\nblock",blockno,"ignoring the zero value received on block load");
        }else{
            firstbootwait = false;
            if(verbose) post("\nblock ",blockno," selection from the parameter slider:",value,controllerslist[value],"is present?:",ispresent(controllerslist[value]));
            if(controllerslist[value]==selected_in_dict){
                if(verbose) post("\nslider is same as value already stored in the dictionary");
            }else if((selection_type=="notfound")&&(selected=="none")){
                if(verbose) post("\nsaved controller wasn't found, ignoring 'none'.",controllerslist[value]);
            }else{
                blocks.replace("blocks["+blockno+"]::selected_controller",controllerslist[value]);
                selected_in_dict = controllerslist[value];
                selected = selected_in_dict;
                selection_type = "dict";
                if(verbose) post("\nslider selection:",controllerslist[value],"storing to dictionary");
                outlet(3, blockname);
                outlet(2, selected);
                outlet(1, selection_type);
				outlet(0, selected_in_dict);
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
    if(verbose) post("\nblock:",prev_blockno,"enable",enab);
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
            if(verbose) post("\nstoring controller selection to parameter",para,controllercount,0.99*(para+0.5)/controllercount);
            parameter_value_buffer.poke(1,blockno*MAX_PARAMETERS+parameternumber,0.99*(para+0.5)/controllercount);
        }
    }
}
