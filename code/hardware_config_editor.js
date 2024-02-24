outlets = 1;
inlets = 1;

/*
var myObj = this.patcher.newdefault(<obj_pos_x>, <obj_pos_y>, "<max_obj_name>");

Add arguments to Object when creating it:
var anotherObject = p.newdefault(100, 100, "combine", "text", "::", "moretext")

Add Object to Presentation:
maxObject.presentation(1); // note that it's a function

Move Object:maxObject.message("patching_position", [posX, posY]);

Create a new "bpatcher" object with attributes:
var myNewObject = p.newdefault(100, 100, "bpatcher", "@name", "myPatch", "@args", name);

Get patcher file path: var filepath = this.patcher.filepath;

Add Object to Presentation:
maxObject.presentation(1); // note that it's a function

Move Object:maxObject.message("patching_position", [posX, posY]);

Rescale Max Object:
this.patcher.script("sendbox", <max_obj>.varname, "patching_rect", [ <obj_pos_x>, <obj_pos_y>, <obj_size_x>, <obj_size_y> ]);

Hide a Max Object:
<max_obj>.hidden = val;

Rescale Max Object in Presentation:
this.patcher.script("sendbox", <max_obj>.varname, "presentation_rect", [ <obj_pos_x>, <obj_pos_y>, <obj_size_x>, <obj_size_y> ]);


*/

var unit = {
	header : 30,
	row : 20,
	col : 150
}

var filepath = "";
var midi_interfaces = {
	in : [],
	out : [],
	not_present_in : [],
	not_present_out : []
}
var configfile = new Dict;
configfile.name = "configfile";

var controls = { //basically build a structure here that mirrors the json's structure, just to hold max objects - labels and interface ones
	keyboards : {
		header : 0,
		label : [],
		control : [], //button to rotate through assignment groups
		value : [] //holds which group or if disabled
		// key should be [[1,2],3,[4,5]] where subarrays represent substitutable groups
	},
	matrix_switch :{
		header : 0,
		label: [],
		control : [] //from here on control will hold various types or subarrays of controls
	},
	controllers : {
		item : {
			header : 0,
			label : [],
			control : [],
			section : {
				header :0,
				name :[],
				control : []
			}
		}
	},
	hardware : {
		item : {
			header : 0,
			label : [],
			control : [],
			connections : {
				in : {
					label : [],
					control : []
				},
				out : {
					label : [],
					control : []
				}	
			}
		}
	}

}

function loadbang(){
	configfile.parse("{}");
	post("\nhardware editor starting");
	filepath = this.patcher.filepath;
	filepath = filepath.split("/patchers");
	filepath = filepath[0];
	post("\n path is",filepath);
	outlet(0,"getmidi","bang");
	outlet(0,"library","read",filepath+"/data/hardware_library.json");
/*
	myObj = this.patcher.newdefault(10, 10, "umenu");
	myObj.message("append","test1");
	myObj.message("append","test2");
	myObj.presentation(1);
	myObj.presentation_position(100,100);
*/
	post("\ninterfaces list:\nins:",midi_interfaces.in,"\nouts:",midi_interfaces.out);
}

function configloaded(path){
	post("\nhardware config file loaded");
	//jobs when you load a file:
	// - scan for midi interfaces that aren't present
	// - scan for hw or controllers that aren't in the library
	// render the controls
	var in_list = [];
	var out_list = [];
	var d = configfile.get("io::keyboards");
	if(d!==null){
		for(var i = 0; i<d.length ; i++){
			if(Array.isArray(d[i])){
				for(var ii =0; ii<d[i].length;ii++){
					in_list.push(d[i][ii]);
				}
			}else{
				in_list.push(d[i]);
			}
		}
	}
	d = configfile.get("io::controllers");
	var k = d.getkeys();
	for(var i=0;i<k.length;i++){
		in_list.push(d.get(k[i]+"::name"));
	}
	post("\n collected in list",in_list);
	for(var i=0;i<in_list.length;i++){
		if(midi_interfaces.in.indexOf(in_list[i])==-1){
			midi_interfaces.not_present_in.push(in_list[i]);
		}
	}
	for(var i=0;i<out_list.length;i++){
		if(midi_interfaces.out.indexOf(out_list[i])==-1){
			midi_interfaces.not_present_out.push(out_list[i]);
		}
	}
	render_controls();
}

function midiins(name){
	midi_interfaces.in.push(name);
}

function midiouts(name){
	midi_interfaces.out.push(name);
}

function render_controls(){
	post("\ndelet");
	deleteall();
	post("\nrender");
	var y_pos = 50;
	var ii=0;
	if(typeof controls.keyboards.header !== "object") controls.keyboards.header = this.patcher.newdefault(10, 100, "comment");
	controls.keyboards.header.message("set", "keyboards");
	controls.keyboards.header.presentation(1);
	controls.keyboards.header.presentation_position(10,y_pos);
	y_pos+=unit.header;
	var d = configfile.get("io::keyboards");
	for(var i=0;i<midi_interfaces.in.length;i++){
		if(typeof controls.keyboards.label[ii] !== "object") controls.keyboards.label[ii] = this.patcher.newdefault(10, 100, "comment");
		controls.keyboards.label[ii].message("set", midi_interfaces.in[i]);
		controls.keyboards.label[ii].presentation(1);
		controls.keyboards.label[ii].presentation_position(20,y_pos);
		y_pos+=unit.row;
		ii++;
	}
	for(var i=0;i<midi_interfaces.not_present_in.length;i++){
		if(typeof controls.keyboards.label[ii] !== "object") controls.keyboards.label[ii] = this.patcher.newdefault(10, 100, "comment");
		controls.keyboards.label[ii].message("set", "("+ midi_interfaces.not_present_in[i]+")");
		controls.keyboards.label[ii].presentation(1);
		controls.keyboards.label[ii].presentation_position(20,y_pos);
		var group = -1;
		var grpsflag = 0;
		for(var p=0;p<d.length;p++){
			if(Array.isArray(d[p])){
				grpsflag = 1;
				for(var pp=0;pp<d[p].length;pp++){
					if(d[p][pp] == midi_interfaces.not_present_in[i]) group = p; 
				}
			}else{
				if(d[p] == midi_interfaces.not_present_in[i]) group = p; 
			}
		}
		var c;
		if(group==-1){
			group = "disabled";
			c = [0.7, 0.55, 0. , 1];
		}else{
			if(grpsflag){
				group = "substitution group "+(group+1);
			}else{
				group = "enabled";
			}
			c = [1.000, 0.792, 0.000, 1.000];
		}
		if(typeof controls.keyboards.control[ii] !== "object") controls.keyboards.control[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  group, "@textoncolor", c, "@varname", "keyboards.control."+ii);
		controls.keyboards.control[ii].listener = new MaxobjListener(controls.keyboards.control[ii], keybcallback);
		controls.keyboards.control[ii].presentation(1);
		controls.keyboards.control[ii].presentation_position(20+unit.col,y_pos);
		controls.keyboards.value[ii] = [midi_interfaces.not_present_in[i],group];
		y_pos+=unit.row;
		ii++;
	}

}

function keybcallback(data){
	post("\nvalue",data.value);
	post(" - object",data.maxobject.varname);
	var id = data.maxobject.varname.split('.');
	var ch=0;
	if(id[0]=="keyboards"){
		var v = controls.keyboards.value[id[2]];
		var d = configfile.get("io::keyboards");
		if(v[1]=="enabled"){//so disable it //actually //so move everything else into a group
			post("\ndisabling");
			for(var p=0;p<d.length;p++){
				if(Array.isArray(d[p])){ //actually if it says 'enabled' it's not in a subarray is it
					for(pp=0;pp<d[p].length;pp++){
						if(d[p][pp]==v[0]){
							d[p].splice(pp,1);
							ch=1;
						}
					}
				}else{
					if(d[p]==v[0]){
						d.splice(p,1);
						ch=1;
					}
				}
			}
		}else if(v[1]=="disabled"){//so enable it
			post("\nenabling");
			d.push(v[0]);
			ch=1;
		}else{
			post("\nelse");
		}
		if(ch){
			configfile.replace("io::keyboards",d);
			post("\nreplaced,",d);
		}
	}
	if(ch) render_controls();
}
/*
    Listen to a Max Object for attributes or value changes:
    var myListener = new MaxobjListener(<max_obj>, <callback_function>);
    The Callback function can be used like this:
    function MyCallback(data)
    {
    data.value; // the output of the Max object
    data.maxobject; // the object itself
    }

    To make the "this" inside a callback refer to the current object, you can write the callback directly inside the object in this way:

var MyCallback = (function(data) 
{
post(this.myObjProperty); 
} ).bind(this);
*/

function deleteall(){
	if(typeof controls.keyboards.header == "object") this.patcher.remove(controls.keyboards.header);
	for(var i=0;i<controls.keyboards.control.length;i++){
		this.patcher.remove(controls.keyboards.control[i]);
		this.patcher.remove(controls.keyboards.label[i]);
	}
	controls.keyboards.control=[];
	controls.keyboards.label=[];

}