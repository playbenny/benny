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

var controls = [];
var values = [];

function loadbang(){
	configfile.parse("{}");
	post("\nhardware editor starting");
	filepath = this.patcher.filepath;
	filepath = filepath.split("/patchers");
	filepath = filepath[0];
	post("\n path is",filepath);
	outlet(0,"getmidi","bang");
	outlet(0,"library","read",filepath+"/data/hardware_library.json");
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
	deleteall();
	var y_pos = 50;
	var ii=0;
	controls[ii]= this.patcher.newdefault(10, 100, "comment");
	controls[ii].message("set", "keyboards");
	controls[ii].presentation(1);
	controls[ii].presentation_position(10,y_pos);
	ii++;
	var d = configfile.get("io::keyboards");
	//y_pos+=unit.header;
	for(var i=0;i<midi_interfaces.in.length;i++){
		var enab = d.indexOf(midi_interfaces.in[i]);
		var c;
		if(enab==-1){
			enab = "disabled";
			c = [0.5, 0.396, 0. , 1];
		}else{
			enab = "enabled";
			c = [1.000, 0.792, 0.000, 1.000];
		}
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  midi_interfaces.in[i], "@textoncolor", c, "@varname", "keyboards."+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [midi_interfaces.in[i],enab];
		y_pos+=unit.row;
		ii++;
	}
	for(var i=0;i<midi_interfaces.not_present_in.length;i++){
		var enab = d.indexOf(midi_interfaces.not_present_in[i]); 
		var c;
		if(enab==-1){
			enab = "disabled";
			c = [0.5, 0.396, 0. , 1];
		}else{
			enab = "enabled";
			c = [1.000, 0.792, 0.000, 1.000];
		}
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  midi_interfaces.not_present_in[i], "@textoncolor", c, "@varname", "keyboards."+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [midi_interfaces.not_present_in[i],enab];
		y_pos+=unit.row;
		ii++;
	}
	y_pos+=unit.header;
	controls[ii]= this.patcher.newdefault(10, 100, "comment");
	controls[ii].message("set", "controllers");
	controls[ii].presentation(1);
	controls[ii].presentation_position(10,y_pos);
	ii++;
	var cd = configfile.get("io::controllers");
	var cdk = cd.getkeys();
	y_pos+=unit.header;
	for(var p=0;p<cdk.length;p++){
		controls[ii]= this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", cdk[p]);
		controls[ii].presentation(1);
		controls[ii].presentation_position(20,y_pos);
		y_pos+=unit.row;
		ii++;
		//now all the general controller settings:
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "substitutes");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		//y_pos+=unit.row;
		ii++;
		d = cd.get(cdk[p]+"::substitute");
		if(!Array.isArray(d)) d = [d];
		post("\nsubs",d);
		for(var i=0;i<midi_interfaces.in.length;i++){
			var enab = d.indexOf(midi_interfaces.in[i]);
			var c;
			if(enab==-1){
				enab = "disabled";
				c = [0.5, 0.396, 0. , 1];
			}else{
				enab = "enabled";
				c = [1.000, 0.792, 0.000, 1.000];
			}
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  midi_interfaces.in[i], "@textoncolor", c, "@varname", "substitute."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
			values[ii] = [midi_interfaces.in[i],enab,cdk[i]];
			y_pos+=unit.row;
			ii++;
		}
		for(var i=0;i<midi_interfaces.not_present_in.length;i++){
			var enab = d.indexOf(midi_interfaces.not_present_in[i]); 
			var c;
			if(enab==-1){
				enab = "disabled";
				c = [0.5, 0.396, 0. , 1];
			}else{
				enab = "enabled";
				c = [1.000, 0.792, 0.000, 1.000];
			}
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  midi_interfaces.not_present_in[i], "@textoncolor", c, "@varname", "substitute."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
			values[ii] = [midi_interfaces.not_present_in[i],enab,cdk[p]];
			y_pos+=unit.row;
			ii++;
		}
		y_pos+=unit.row;
		//"outputs" : 16,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "number of outputs");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.outputs"+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].message("set", cd.get(cdk[p]+"::outputs"));
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		//"type" : "encoder",
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "type");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "controller.type"+ii);
		controls[ii].message("append", "encoder");
		controls[ii].message("append", "potentiometer");
		controls[ii].message("set", cd.get(cdk[p]+"::type"));
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		//"channel" : 1,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "midi channel");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.channel"+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].message("set", cd.get(cdk[p]+"::channel"));
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		//"first" : 0,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "cc of first control");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.first"+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].message("set", cd.get(cdk[p]+"::first"));
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		//"scaling" : 0.125,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "scaling");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "flonum" , "@varname", "controller.scaling"+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].message("set", cd.get(cdk[p]+"::scaling"));
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		//"columns" : 4,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "number of columns");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.columns"+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].message("set", cd.get(cdk[p]+"::columns"));
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		
		//"rows" : 4,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "number of rows");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.rows"+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].message("set", cd.get(cdk[p]+"::rows"));
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;




		y_pos+=unit.row;
	}
}

function keybcallback(data){
	post("\nvalue",data.value);
	post(" - object",data.maxobject.varname);
	var id = data.maxobject.varname.split('.');
	var ch=0;
	if(id[0]=="keyboards"){
		var v = values[id[1]];
		var d = configfile.get("io::keyboards");
		if(v[1]=="enabled"){ 
			p = d.indexOf(v[0]);
			if(p != -1){
				d.splice(p,1);
				configfile.replace("io::keyboards",d);
				ch=1;
			}
		}else if(v[1]=="disabled"){//so enable it
			configfile.append("io::keyboards",v[0]);
			ch=1;
		}
	}else if(id[0]=="substitute"){
		var v = values[id[1]];
		var d = configfile.get("io::controllers::"+v[2]+"::substitute");
		if(v[1]=="enabled"){ 
			p = d.indexOf(v[0]);
			if(p != -1){
				d.splice(p,1);
				configfile.replace("io::keyboards",d);
				ch=1;
			}
		}else if(v[1]=="disabled"){//so enable it
			configfile.append("io::controllers::"+v[2]+"::substitute",v[0]);
			ch=1;
		}
	}
	if(ch) render_controls();
}

function deleteall(){
	for(var i=0;i<controls.length;i++){
		this.patcher.remove(controls[i]);
	}
	controls=[];
	values=[];
}