outlets = 1;
inlets = 1;
var unit = {
	header : 30,
	row : 20,
	col : 220
}

var filepath = "";
var midi_interfaces = {
	in : [],
	out : [],
	not_present_in : [],
	not_present_out : [],
	not_used_in : []
}
var configfile = new Dict;
configfile.name = "configfile";
var blocktypes = new Dict;
blocktypes.name = "blocktypes";

var controls = [];
var values = [];

var y_pos = 50;
var ii=0;


var library_hardware = this.patcher.getnamed("hardware_library");
var library_controllers = this.patcher.getnamed("controller_library");
var testmatrix = this.patcher.getnamed("testmatrix");
var testlist = this.patcher.getnamed("testlist");

function loadbang(){
	configfile.parse("{}");
	post("\nhardware editor starting");
	filepath = this.patcher.filepath;
	filepath = filepath.split("/patchers");
	filepath = filepath[0];
	var dropdown = this.patcher.getnamed("hw_list");
	dropdown.message("prefix", filepath+"/hardware_configs");
	post("\n path is",filepath);
	outlet(0,"getmidi","bang");
	outlet(0,"library","read",filepath+"/data/hardware_library.json");
	post("\ninterfaces list:\nins:",midi_interfaces.in,"\nouts:",midi_interfaces.out);
	import_blocktypes("audio_blocks");
}

function import_blocktypes(v)
{
	var f = new Folder(v);
	var d = new Dict;
		
	f.reset();
	while (!f.end) {
		if(f.extension == ".json"){
			post("\n  "+f.filename);
			d.import_json(f.filename);
			var keys = d.getkeys();
			if(keys==null){
				post("ERROR reading block definition json file");
			}else{
				keys = keys.toString();
				blocktypes.set(keys,d.get(keys));
			}
		}
		f.next();
	}
	f.close();
}

function configloaded(path){
	post("\nhardware config file loaded");
	//jobs when you load a file:
	// - scan for midi interfaces that aren't present
	// - scan for hw or controllers that aren't in the library
	// render the controls
	var in_list = [];
	var out_list = [];
	var d = configfile.get("io::controllers");
	var k = d.getkeys();
	for(var i=0;i<k.length;i++){
		in_list.push(d.get(k[i]+"::name"));
	}
	for(var i=0;i<midi_interfaces.in.length;i++){
		if(in_list.indexOf(midi_interfaces.in[i])==-1){
			midi_interfaces.not_used_in.push(midi_interfaces.in[i]);
		}
	}
	d = configfile.get("hardware");
	k = d.getkeys();
	if(k!==null){
		for(var i=0;i<k.length;i++){
			if(configfile.contains("hardware::"+k[i]+"::midi_in")){
				var tm = configfile.get("hardware::"+k[i]+"::midi_in");
				if(out_list.indexOf(tm)==-1){
					out_list.push(configfile.get("hardware::"+k[i]+"::midi_in"));
				}
			}
		}
	}
	d = configfile.get("io::keyboards");
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
	post("\n collected in list",in_list);
	post("\n and these interfaces are present but not used for controllers: ",midi_interfaces.not_used_in);
	for(var i=0;i<in_list.length;i++){
		if(midi_interfaces.in.indexOf(in_list[i])==-1){
			if(midi_interfaces.not_present_in.indexOf(in_list[i])==-1) midi_interfaces.not_present_in.push(in_list[i]);
		}
	}
	for(var i=0;i<out_list.length;i++){
		if(midi_interfaces.out.indexOf(out_list[i])==-1){
			if(midi_interfaces.not_present_out.indexOf(out_list[i])==-1) midi_interfaces.not_present_out.push(out_list[i]);
		}
	}
	render_controls();
}

function midiins(name){
	if(midi_interfaces.in.indexOf(name)==-1) midi_interfaces.in.push(name);
}

function midiouts(name){
	if(midi_interfaces.out.indexOf(name)==-1) midi_interfaces.out.push(name);
}

function render_controls(){
	deleteall();
	y_pos = 50;
	ii=0;
	controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
	controls[ii].message("set", "keyboards");
	controls[ii].presentation(1);
	controls[ii].presentation_rect(10,y_pos,2*unit.col+10,20);
	ii++;
	y_pos+=unit.row;
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
			add_midimonitors(midi_interfaces.in[i]);
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
	controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
	controls[ii].message("set", "controllers");
	controls[ii].presentation(1);
	controls[ii].presentation_rect(10,y_pos,2*unit.col+10,20);
	ii++;
	y_pos+=unit.row;
	var cd = configfile.get("io::controllers");
	var cdk = cd.getkeys();
	if(cdk==null)cdk=[];
	for(var p=0;p<cdk.length;p++){
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", cdk[p]);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20,y_pos,100+unit.col,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove controller", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.controller."+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
		values[ii] = [cdk[p]];
		ii++;

		add_midimonitors(cdk[p]);
		y_pos+=unit.row;

		//now all the general controller settings:
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "substitutes");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		//y_pos+=unit.row;
		ii++;
		d = cd.get(cdk[p]+"::substitute");
		if(!Array.isArray(d)) d = [d];
		for(var i=0;i<midi_interfaces.in.length;i++){
			if(midi_interfaces.in[i]!=cdk[p]){
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
				add_midimonitors(midi_interfaces.in[i]);

				y_pos+=unit.row;
				ii++;
			}
		}
		for(var i=0;i<midi_interfaces.not_present_in.length;i++){
			if(midi_interfaces.not_present_in[i]!=cdk[p]){
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
		}
		y_pos+=unit.row;
		//"outputs" : 16,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "number of outputs");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.outputs."+ii);
		controls[ii].message("set", cd.get(cdk[p]+"::outputs"));
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
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
		controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "controller.type."+ii);
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
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.channel."+ii);
		controls[ii].message("set", cd.get(cdk[p]+"::channel"));
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
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
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.first."+ii);
		controls[ii].message("set", cd.get(cdk[p]+"::first"));
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		//"scaling" : 0.125,
		if(cd.get(cdk[p]+"::type")=="encoder"){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "scaling");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "flonum" , "@varname", "controller.scaling."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::scaling"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
		}

		//"columns" : 4,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "number of columns");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.columns."+ii);
		controls[ii].message("set", cd.get(cdk[p]+"::columns"));
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
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
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.rows."+ii);
		controls[ii].message("set", cd.get(cdk[p]+"::rows"));
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		//"colour" :
		if(cd.contains(cdk[p]+"::colour")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "led colour cc");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove section", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.controller.colour."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::colour"];
			ii++;
			y_pos+=unit.row;
			//	"type" : "midifighter",
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "type");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "controllersubkey.colour.type."+ii);
			controls[ii].message("append", "midifighter");
			controls[ii].message("append", "novation launchcontrol");
			controls[ii].message("set", cd.get(cdk[p]+"::colour::type"));
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "midi channel");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.colour.channel."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::colour::channel"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
	
			//"first" : 0,
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "cc of first control's colour");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.colour.first."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::colour::first"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

		}else{
			//add key button
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "led colour cc");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add section", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.controller.colour."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::colour"];
			ii++;
			y_pos+=unit.row;
		}
		//"brightness" : {
		if(cd.contains(cdk[p]+"::brightness")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "led brightness cc");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove section", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.controller.brightness."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::brightness"];
			ii++;
			y_pos+=unit.row;
			//	"type" : "midifighter",
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "type");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "controllersubkey.brightness.type."+ii);
			controls[ii].message("append", "midifighter");
			controls[ii].message("append", "novation launchcontrol");
			controls[ii].message("set", cd.get(cdk[p]+"::brightness::type"));
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "midi channel");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.brightness.channel."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::brightness::channel"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
	
			//"first" : 0,
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "cc of first");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.brightness.first."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::brightness::first"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
			//	"dim" : 19,
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "cc out for dimmest");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.brightness.dim."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::brightness::dim"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;	
			//	"bright" : 48
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "cc out for brightest");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.brightness.bright."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::brightness::bright"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
		}else{
			//add key button
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "led brightness cc");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add section", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.controller.brightness."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::brightness"];
			ii++;
			y_pos += unit.row;
		}
		//"value" : {
		if(cd.contains(cdk[p]+"::value")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "value feedback messages");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove section", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.controller.value."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::value"];
			ii++;			
			y_pos+=unit.row;
			//	"type" : "midifighter",
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "type");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "controllersubkey.value.type."+ii);
			controls[ii].message("append", "note");
			controls[ii].message("append", "cc");
			controls[ii].message("set", cd.get(cdk[p]+"::value::type"));
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "midi channel");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.value.channel."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::value::channel"));
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
	
			//"first" : 0,
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "cc of first control");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.value.first."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::value::first"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

		}else{
			//add key button
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "led value cc");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add section", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.controller.value."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::value"];
			ii++;
			y_pos+=unit.row;
		}	
		//"resets" : {
		if(cd.contains(cdk[p]+"::resets")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "reset buttons");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove section", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.controller.resets."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::resets"];
			ii++;
			y_pos+=unit.row;
			//	"type" : "midifighter",
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "type");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "controllersubkey.resets.type."+ii);
			controls[ii].message("append", "note");
			controls[ii].message("append", "cc");
			controls[ii].message("set", cd.get(cdk[p]+"::resets::type"));
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			values[ii] = [cdk[p]+"::resets::type"];
			y_pos+=unit.row;
			ii++;

			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "midi channel");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.resets.channel."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::resets::channel"));
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			values[ii] = [cdk[p]+"::resets::channel"];
			y_pos+=unit.row;
			ii++;
	
			//"first" : 0,
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "cc of first reset");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.resets.first."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::resets::first"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

		}else{
			//add key button
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "reset buttons");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add section", "@textoncolor", [0, 1.0, 0, 1.0], "@varname", "add.controller.resets."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::resets"];
			ii++;
			y_pos+=unit.row;
		}	
		//"buttons" : {
		if(cd.contains(cdk[p]+"::buttons")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "controller buttons");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove section", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.controller.buttons."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::buttons"];
			ii++;			
			y_pos+=unit.row;
			//	"type" : "midifighter",
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "type");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "controllersubkey.buttons.type."+ii);
			controls[ii].message("append", "note");
			controls[ii].message("append", "cc");
			controls[ii].message("set", cd.get(cdk[p]+"::buttons::type"));
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "midi channel");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.buttons.channel."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::buttons::channel"));
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
	
			//"first" : 0,
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "cc/note of first button");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.buttons.first."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::buttons::first"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

			//"count" : 24,
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "number of buttons");
			controls[ii].presentation(1);
			controls[ii].presentation_position(40,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.buttons.count."+ii);
			controls[ii].message("set", cd.get(cdk[p]+"::buttons::count"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;

			if(cd.contains(cdk[p]+"::buttons::globals")){
				//	"globals" : {
				var tv;
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "button map to global functions");
				controls[ii].presentation(1);
				controls[ii].presentation_rect(40,y_pos,2*unit.col,20);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove section", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.controller.buttons.globals."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
				values[ii] = [cdk[p]+"::buttons::globals"];
				ii++;
				y_pos+=unit.row;
				//		"automap_toggle" : 0,
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "automap toggle");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.automap_toggle."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::automap_toggle");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		"automap_page" : 3
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "automap page");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.automap_page."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::automap_page");
				if(tv==null) tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		" lock controller automap" : 0,
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "controller automap lock");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.lock_automap_control."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::lock_automap_control");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		"keyboard automap lock" : 3
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "keyboard automap lock");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.lock_automap_keyboard."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::lock_automap_keyboard");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		"cue automap lock" : 0,
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "cue automap lock");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.lock_automap_cue."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::lock_automap_cue");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		"toggle display mode" : 3
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "panels/blocks toggle");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.toggle_display_mode."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::toggle_display_mode");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		"play" : 0,
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "play");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.play."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::play");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		"resync" : 3
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "resync");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.resync."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::resync");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		"panic" : 0,
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "panic");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.panic."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::panic");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
				//		"mute selected" : 3
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "mute selected");
				controls[ii].presentation(1);
				controls[ii].presentation_position(50,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.mute_selected."+ii);
				tv = cd.get(cdk[p]+"::buttons::globals::mute_selected");
				if(tv==null)tv=-1;
				controls[ii].message("set", tv);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row;
				ii++;
			}else{
				//add key button
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "button map to global functions");
				controls[ii].presentation(1);
				controls[ii].presentation_rect(40,y_pos,2*unit.col,20);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add section", "@textoncolor", [0, 1,0, 1], "@varname", "add.controller.buttons.globals."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
				values[ii] = [cdk[p]+"::buttons::globals"];
				ii++;
				y_pos+=unit.row;
			}
		}else{
			//add key button
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "controller buttons");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add section", "@textoncolor", [0, 1,0, 1], "@varname", "add.controller.buttons."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
			values[ii] = [cdk[p]+"::buttons"];
			ii++;			
			y_pos+=unit.row;
		}	
		y_pos+=unit.row;
	}
	//recalc list of not-used interfaces (ie possible controllers to add)
	var d = configfile.get("io::controllers");
	var k = d.getkeys();
	var in_list=[]; 
	midi_interfaces.not_used_in=[];
	if(k==null)k=[];
	for(var i=0;i<k.length;i++){
		in_list.push(d.get(k[i]+"::name"));
	}
	for(var i=0;i<midi_interfaces.in.length;i++){
		if(in_list.indexOf(midi_interfaces.in[i])==-1){
			midi_interfaces.not_used_in.push(midi_interfaces.in[i]);
		}
	}
	if(midi_interfaces.not_used_in.length>0){
		for(var i=0;i<midi_interfaces.not_used_in.length;i++){
			controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add controller: "+midi_interfaces.not_used_in[i], "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.controller."+ii);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20,y_pos,2*unit.col-40,20);
			values[ii] = [midi_interfaces.not_used_in[i]];
			ii++;			
			y_pos+=unit.row;
		}
	}
	library_controllers.presentation(1);
	library_controllers.presentation_rect(20,y_pos,2*unit.col,20);
	y_pos+=unit.row+2;

	y_pos+=unit.header;
	controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
	controls[ii].message("set", "hardware");
	controls[ii].presentation(1);
	controls[ii].presentation_rect(10,y_pos,2*unit.col+10,20);
	ii++;
	var cd = configfile.get("hardware");
	var cdk = cd.getkeys();
	y_pos+=unit.row; 

	for(var p=0;p<cdk.length;p++){
		testlist.message("append",cdk[p]);
		controls[ii]= this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  , "@keymode", 1, "@varname", "hardwarename."+ii, "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", cdk[p]);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20,y_pos,100+unit.col,20);
		values[ii] = [cdk[p]];
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove block", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.block."+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(120+unit.col,y_pos,unit.col-100,20);
		values[ii] = [cdk[p],"block"];
		ii++;
		y_pos+=unit.row;
		//now all the general hardware block settings:
		//			"help_text": "arp filter module",
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "help text");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  ,"@keymode", 1,  "@varname", "hardware.help_text."+ii);
		controls[ii].message("set",cd.get(cdk[p]+"::help_text").split(" "));
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,60);
		values[ii] = [cdk[p]];
		y_pos+=unit.row*3;
		ii++;

		//	"exclusive" : 1,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "exclusive");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "hardware.exclusive."+ii);
		if(cd.contains(cdk[p]+"::exclusive")){
			controls[ii].message("set", cd.get(cdk[p]+"::exclusive"));
		}else{
			controls[ii].message("set", 0);
		}
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;
		//	"max_polyphony" : 1,
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "max polyphony");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.max_polyphony."+ii);
		controls[ii].message("set", cd.get(cdk[p]+"::max_polyphony"));
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;
		//	"substitute" : "fx.filter.2pole",
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "substitute");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "hardware.substitute."+ii);
		controls[ii].message("append","none");
		var subs=blocktypes.getkeys();
		for(var s=0;s<subs.length;s++){
			controls[ii].message("append",subs[s]);
		}
		controls[ii].message("set", cd.get(cdk[p]+"::substitute"));
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		y_pos+=unit.row;
		ii++;

		if(cd.contains(cdk[p]+"::connections::in::hardware")&&!cd.contains(cdk[p]+"::connections::out::hardware")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "click out");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "hardware.click_out."+ii);
			if(cd.contains(cdk[p]+"::click_out")){
				controls[ii].message("set", (cd.get(cdk[p]+"::click_out"))>0);
			}else{
				controls[ii].message("set", 0);
			}
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "cue out");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "hardware.cue_out."+ii);
			if(cd.contains(cdk[p]+"::cue_out")){
				controls[ii].message("set", (cd.get(cdk[p]+"::cue_out"))>0);
			}else{
				controls[ii].message("set", 0);
			}
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
		}
		
		if(cd.contains(cdk[p]+"::connections::out::hardware")&&!cd.contains(cdk[p]+"::connections::in::hardware")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "talk mic in");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "hardware.talk_in."+ii);
			if(cd.contains(cdk[p]+"::talk_in")){
				controls[ii].message("set", (cd.get(cdk[p]+"::talk_in")>0));
			}else{
				controls[ii].message("set", 0);
			}
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;
		}
		controls[ii] = this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "connections");
		controls[ii].presentation(1);
		controls[ii].presentation_position(30,y_pos);
		y_pos+=unit.row;
		ii++;
		if(cd.contains(cdk[p]+"::connections::in::hardware")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "in (to hardware, from computer)");
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40,y_pos,unit.col,40);
			y_pos+=unit.row;
			ii++;
			hwl = cd.get(cdk[p]+"::connections::in::hardware");
			hwc = cd.get(cdk[p]+"::connections::in::hardware_channels");
			for(var i = 0; i< hwc.length;i++){
				controls[ii] = this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  ,"@keymode", 1,  "@varname", "hardware.in.name."+ii);
				if(i<hwl.length){
					controls[ii].message("set",hwl[i].split(" "));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(20+unit.col,y_pos,unit.col-60,22);
					values[ii] = [cdk[p],i];
					ii++;
				}
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.in.channel."+ii);
				controls[ii].message("set", hwc[i]);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(2*unit.col-40,y_pos,60,20);
				values[ii] = [cdk[p],i];
				ii++;	
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "send test signal");
				controls[ii].presentation(1);
				controls[ii].presentation_position(20+2*unit.col,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "hardwaretestsignal."+ii);
				controls[ii].message("append","none");
				controls[ii].message("append","tones");
				controls[ii].message("append","pink noise");
				controls[ii].message("append","lfo");
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+2.5*unit.col,y_pos,0.5*unit.col,20);
				values[ii] = [cdk[p],hwc[i]];
				y_pos+=unit.row;
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove channel", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.in.channel."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p],i];
				ii++;			
				y_pos+=2*unit.row;
			}
		}
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add a hardware input channel", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.in.channel."+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p],"connections::in::hardware"];
		ii++;			
		y_pos+=unit.row;

		/* MIDI CONNECTIONS :
						"in" : {
							"midi" : ["notes in"],
							"midi_channels" : [10],
							"midi_ranges" : [[35,51]]
						}
			and main keys:
						"midi_handler" : "generic.hardware.midi.handler",
					"midi_in" : "mio",
		also groups, parameters (-> cc mapping) eg
							"name" : "cctest1",
							"type" : "float",
							"values" : ["uni", 0, 1, "lin" ],
							"cc_channel" : 10,
							"cc_number" : 2,

		*/	
		if(cd.contains(cdk[p]+"::connections::in::midi")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "midi in (to hardware, from computer)");
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40,y_pos,unit.col,40);
			y_pos+=unit.row;
			ii++;

			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "choose midi port");
			controls[ii].presentation(1);
			controls[ii].presentation_position(30,y_pos);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "hardware.midi.port."+ii);
			controls[ii].message("append","none");
			var subs=midi_interfaces.out;
			for(var s=0;s<subs.length;s++){
				controls[ii].message("append",subs[s]);
			}
			var subs=midi_interfaces.not_present_out;
			for(var s=0;s<subs.length;s++){
				controls[ii].message("append",subs[s]);
			}
			controls[ii].message("set", cd.get(cdk[p]+"::midi_in"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
			values[ii] = [cdk[p]];
			y_pos+=unit.row;
			ii++;			

			hwl = cd.get(cdk[p]+"::connections::in::midi");
			hwc = cd.get(cdk[p]+"::connections::in::midi_channels");
			hwr = cd.get(cdk[p]+"::connections::in::midi_ranges");
			for(var i = 0; i< hwc.length;i++){
				controls[ii] = this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  ,"@keymode", 1,  "@varname", "hardware.midi.in.name."+ii);
				if(i<hwl.length){
					controls[ii].message("set",hwl[i].split(" "));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(20+unit.col,y_pos,unit.col-60,22);
					values[ii] = [cdk[p],i];
					ii++;
				}
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.in.channel."+ii);
				controls[ii].message("set", hwc[i]);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(2*unit.col-40,y_pos,60,20);
				values[ii] = [cdk[p],i];
				ii++;	
				y_pos+=22;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.in.range1."+ii);
				controls[ii].message("set", hwr[i][0]);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(2*unit.col-100,y_pos,60,20);
				values[ii] = [cdk[p],i];
				ii++;	
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.in.range1."+ii);
				controls[ii].message("set", hwr[i][1]);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(2*unit.col-40,y_pos,60,20);
				values[ii] = [cdk[p],i];
				ii++;	
				y_pos+=22;
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "send midi test");
				controls[ii].presentation(1);
				controls[ii].presentation_position(20+unit.col,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "hardwaremiditestsignal."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+1.5*unit.col,y_pos,20,20);
				values[ii] = [cdk[p],i];
				y_pos+=unit.row;
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove midi input", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.midi.in.channel."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p],i];
				ii++;			
				y_pos+=2*unit.row;
			}
		}
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add a midi input channel", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.midi.in.channel."+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p],"connections::in::hardware"];
		ii++;			
		y_pos+=unit.row;

		if(cd.contains(cdk[p]+"::connections::out::hardware")){
			controls[ii] = this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "out (from hardware, to computer)");
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40,y_pos,unit.col,40);
			y_pos+=unit.row;
			ii++;
			hwl = cd.get(cdk[p]+"::connections::out::hardware");
			hwc = cd.get(cdk[p]+"::connections::out::hardware_channels");
			for(var i = 0; i< hwc.length;i++){
				controls[ii] = this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  ,"@keymode", 1,  "@varname", "hardware.out.name."+ii);
				if(i<hwl.length){
					controls[ii].message("set",hwl[i].split(" "));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(20+unit.col,y_pos,unit.col-60,22);
					values[ii] = [cdk[p],i];
					ii++;
				}
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.out.channel."+ii);
				controls[ii].message("set", hwc[i]);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(2*unit.col-40,y_pos,60,20);
				values[ii] = [cdk[p],i];
				ii++;	
				controls[ii] = this.patcher.newdefault(10, 100, "meter~");
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col*2,y_pos,unit.col,22);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "adc~");
				controls[ii].message("list", hwc[i]);
				this.patcher.connect(controls[ii],0,controls[ii-1],0);
				ii++;
				y_pos+=22;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove channel", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.out.channel."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p],i];
				ii++;			
				y_pos+=2*unit.row;
			}
		}
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add a hardware output channel", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.out.channel."+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		values[ii] = [cdk[p]];
		ii++;			
		y_pos+=2*unit.row;
		//	"connections" : {
		//		"in" : {
		//			"hardware" : [ "in", "cutoff" ],
		//			"hardware_channels" : [ 5,6 ]
		//		"out" : {
		//			"hardware" : [ "out" ],
		//			"hardware_channels" : [ 2 ]
	}
	y_pos+=unit.row;

	controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add another hardware block", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.newblock."+ii);
	controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
	controls[ii].presentation(1);
	controls[ii].presentation_rect(0,y_pos,unit.col*2+20,20);
	values[ii] = ["hardware.newblock"];
	ii++;			
	y_pos+=unit.row;

	library_hardware.presentation(1);
	library_hardware.presentation_rect(20,y_pos,2*unit.col,20);
	y_pos+=unit.row+2;


}

function keybcallback(data){
	post("\nvalue",data.value);
	post(" - object",data.maxobject.varname);
	var id = data.maxobject.varname.split('.');
	if(id[0]=="keyboards"){
		var v = values[id[1]];
		var d = configfile.get("io::keyboards");
		if(v[1]=="enabled"){ 
			p = d.indexOf(v[0]);
			if(p != -1){
				d.splice(p,1);
				configfile.replace("io::keyboards",d);
			}
		}else if(v[1]=="disabled"){//so enable it
			configfile.append("io::keyboards",v[0]);
		}
	}else if(id[0]=="substitute"){
		var v = values[id[1]];
		var d = configfile.get("io::controllers::"+v[2]+"::substitute");
		if(v[1]=="enabled"){ 
			p = d.indexOf(v[0]);
			if(p != -1){
				d.splice(p,1);
				configfile.replace("io::keyboards",d);
			}
		}else if(v[1]=="disabled"){//so enable it
			configfile.append("io::controllers::"+v[2]+"::substitute",v[0]);
		}
	}else if(id[0]=="controller"){
		var v = values[id[2]];
		configfile.replace("io::controllers::"+v[0]+"::"+id[1],data.value);
	}else if(id[0]=="controllersubkey"){
		var v = values[id[3]];
		//post("\nid4 = ",id[3],"v = ",v,"\n replace","io::controllers::"+v[0]+"::"+id[1]+"::"+id[2]+"::"+id[3],data.value);
		configfile.replace("io::controllers::"+v[0]+"::"+id[1]+"::"+id[2],data.value);
	}else if(id[0]=="controllersubkey2"){
		var v = values[id[4]];
		//post("\nid4 = ",id[4],"v = ",v,"\n replace","io::controllers::"+v[0]+"::"+id[1]+"::"+id[2]+"::"+id[3],data.value);
		configfile.replace("io::controllers::"+v[0]+"::"+id[1]+"::"+id[2]+"::"+id[3],data.value);
	}else if(id[0]=="hardware"){
		if(id[1]=="in"){
			if(id[2]=="channel"){
				var t=+id[3];
				post("\nset in channel object",t+2,"to ",data.value);
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::in::hardware_channels["+values[id[3]][1]+"]",data.value);
				controls[t+2].message("list", data.value);
			}else if(id[2]=="name"){
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::in::hardware["+values[id[3]][1]+"]",data.value);
				post("\nname",data.value,"info",values[id[3]]);
			}
		}else if(id[1]=="out"){
			if(id[2]=="channel"){
				var t=+id[3];
				post("\nset out channel object",t+2,"to ",data.value,"\nie ","hardware::"+values[id[3]][0]+"::connections::out::hardware_channels["+values[id[3]][1]+"]",data.value);
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::hardware_channels["+values[id[3]][1]+"]",data.value);
				controls[t+2].message("list", data.value);
			}else if(id[2]=="name"){
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::hardware["+values[id[3]][1]+"]",data.value);
				post("\nname",data.value,"info",values[id[3]]);
			}
		}else{
			var v = values[id[2]];
			post("\nwrote: ","hardware::"+v[0]+"::"+id[1],data.value);
			configfile.replace("hardware::"+v[0]+"::"+id[1],data.value);
		}
	}else if(id[0]=="hardwaretestsignal"){
		//post("\nsetting matrix",values[id[1]][1],"for row",data.value - 1);
		for(var oo=0;oo<3;oo++) testmatrix.message(0,values[id[1]][1],0);
		if(data.value>0) for(var oo=0;oo<32;oo++) testmatrix.message(data.value-1,oo,oo==values[id[1]][1]);
	}else if(id[0]=="hardwarename"){
		var newname = data.value.toString();
		if(newname!=values[id[1]]){
			configfile.setparse("hardware::"+newname,"{}");
			var cd = configfile.get("hardware::"+values[id[1]]);
			if(cd!==null){
				var ck = cd.getkeys();
				for(var tc=0;tc<ck.length;tc++){
					if(ck[tc]!=="connections"){
						configfile.replace("hardware::"+newname+"::"+ck[tc].toString(),cd.get(ck[tc]));
						post("\nreplace ","hardware::"+newname+"::"+ck[tc].toString(),cd.get(ck[tc]));
					}
				}
				configfile.setparse("hardware::"+newname+"::connections","{}");
				if(configfile.contains("hardware::"+values[id[1]]+"::connections::in")){
					configfile.setparse("hardware::"+newname+"::connections::in","{}");
					var cd = configfile.get("hardware::"+values[id[1]]+"::connections::in");
					if(cd!==null){
						var ck = cd.getkeys();
						for(var tc=0;tc<ck.length;tc++){
							configfile.replace("hardware::"+newname+"::connections::in::"+ck[tc].toString(),cd.get(ck[tc]));
							post("\nreplace ","hardware::"+newname+"::connections::in::"+ck[tc].toString(),cd.get(ck[tc]));
						}
					}
				}
				if(configfile.contains("hardware::"+values[id[1]]+"::connections::out")){
					configfile.setparse("hardware::"+newname+"::connections::out","{}");
					var cd = configfile.get("hardware::"+values[id[1]]+"::connections::out");
					if(cd!==null){
						var ck = cd.getkeys();
						for(var tc=0;tc<ck.length;tc++){
							configfile.replace("hardware::"+newname+"::connections::out::"+ck[tc].toString(),cd.get(ck[tc]));
							post("\nreplace ","hardware::"+newname+"::connections::out::"+ck[tc].toString(),cd.get(ck[tc]));
						}
					}
				}
				configfile.remove("hardware::"+values[id[1]]);
			}
		}
	}else if(id[0]=="add"){
		if(id[1]=="controller"){
			if(id[2]=="colour"){
				configfile.setparse("io::controllers::"+values[id[3]],"{}");
				configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
				configfile.replace("io::controllers::"+values[id[3]]+"::type","midifighter");
				configfile.replace("io::controllers::"+values[id[3]]+"::channel", 0);
			}else if(id[2]=="value"){
				configfile.setparse("io::controllers::"+values[id[3]],"{}");
				configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
				configfile.replace("io::controllers::"+values[id[3]]+"::type","cc");
				configfile.replace("io::controllers::"+values[id[3]]+"::channel", 0);
			}else if(id[2]=="brightness"){
				configfile.setparse("io::controllers::"+values[id[3]],"{}");
				configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
				configfile.replace("io::controllers::"+values[id[3]]+"::type","midifighter");
				configfile.replace("io::controllers::"+values[id[3]]+"::channel", 0);
				configfile.replace("io::controllers::"+values[id[3]]+"::dim", 0);
				configfile.replace("io::controllers::"+values[id[3]]+"::bright", 127);
			}else if(id[2]=="resets"){
				configfile.setparse("io::controllers::"+values[id[3]],"{}");
				configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
				configfile.replace("io::controllers::"+values[id[3]]+"::type","cc");
				configfile.replace("io::controllers::"+values[id[3]]+"::channel", 0);
			}else if(id[2]=="buttons"){
				if(id[3]=="globals"){
					configfile.setparse("io::controllers::"+values[id[4]],"{}");
					configfile.replace("io::controllers::"+values[id[4]]+"::automap_toggle",0);
					configfile.replace("io::controllers::"+values[id[4]]+"::automap_page",1);
				}else{
					configfile.setparse("io::controllers::"+values[id[3]],"{}");
					configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
					configfile.replace("io::controllers::"+values[id[3]]+"::type","cc");
					configfile.replace("io::controllers::"+values[id[3]]+"::channel", 0);
				}
			}else{
				post("\nid2 is",id[2]);
				configfile.setparse("io::controllers::"+values[id[2]],"{}");
				configfile.replace("io::controllers::"+values[id[2]]+"::name", values[id[2]]);
				configfile.replace("io::controllers::"+values[id[2]]+"::substitute" , []);
				configfile.replace("io::controllers::"+values[id[2]]+"::outputs" , 16);
				configfile.replace("io::controllers::"+values[id[2]]+"::type" , "encoder");
				configfile.replace("io::controllers::"+values[id[2]]+"::channel", 1);
				configfile.replace("io::controllers::"+values[id[2]]+"::first",  0);
				configfile.replace("io::controllers::"+values[id[2]]+"::scaling", 0.125);
				configfile.replace("io::controllers::"+values[id[2]]+"::columns", 4);
				configfile.replace("io::controllers::"+values[id[2]]+"::rows", 4);
			}
		}else if(id[1] == "hardware"){
			post("\nadd hw ch",id,"vvv",values[id[4]]);
			if(id[2] == "in"){
				if(configfile.contains("hardware::"+values[id[4]][0]+"::connections::in::hardware")){
					var tn = configfile.get("hardware::"+values[id[4]][0]+"::connections::in::hardware");
					var tc = configfile.get("hardware::"+values[id[4]][0]+"::connections::in::hardware_channels");
					tn.push("new");
					tc.push(0);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::in::hardware",tn);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::in::hardware_channels",tc);
				}else{
					configfile.setparse("hardware::"+values[id[4]][0]+"::connections::in" , "{ }");
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::in::hardware",["new"]);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::in::hardware_channels",[0]);
				}
			}else if(id[2]=="out"){
				if(configfile.contains("hardware::"+values[id[4]][0]+"::connections::out::hardware")){
					var tn = configfile.get("hardware::"+values[id[4]][0]+"::connections::out::hardware");
					var tc = configfile.get("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels");
					tn.push("new");
					tc.push(0);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware",tn);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels",tc);
				}else{
					configfile.setparse("hardware::"+values[id[4]][0]+"::connections::out" , "{ }");
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware",["new"]);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels",[0]);
				}
			}else if(id[2]=="midi"){
				post("\nadd midi",id,values[id[5]]);
				if(configfile.contains("hardware::"+values[id[5]][0]+"::connections::in::midi")){
					var tn = configfile.get("hardware::"+values[id[5]][0]+"::connections::in::midi");
					var tc = configfile.get("hardware::"+values[id[5]][0]+"::connections::in::midi_channels");
					var tr = configfile.get("hardware::"+values[id[5]][0]+"::connections::in::midi_ranges");
					tn.push("new");
					tc.push(0);
					tr.push([0,127]);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::in::midi",tn);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::in::midi_channels",tc);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::in::midi_ranges",tr);
				}else{
					configfile.setparse("hardware::"+values[id[5]][0]+"::connections::in" , "{ }");
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::in::midi",["new"]);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::in::midi_channels",[0]);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::in::midi_ranges",["*"]);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::in::midi_ranges[0]",[0,127]);
				}
				if(!configfile.contains("hardware::"+values[id[5]][0]+"::midi_handler")){
					configfile.replace("hardware::"+values[id[5]][0]+"::midi_handler","generic.hardware.midi.handler");
				}
			}else{
				configfile.setparse("hardware::"+values[id[3]],"{}");
				configfile.replace("hardware::"+values[id[3]]+"::name", values[id[3]]);
				configfile.replace("hardware::"+values[id[3]]+"::substitute" , []);
				configfile.replace("hardware::"+values[id[3]]+"::max_polyphony" , 1);
				configfile.replace("hardware::"+values[id[3]]+"::help_text" , "about your block");
				configfile.replace("hardware::"+values[id[3]]+"::exclusive", 0);
				configfile.replace("hardware::"+values[id[3]]+"::click_out",  0);
				configfile.replace("hardware::"+values[id[3]]+"::cue_out", 0);
				configfile.replace("hardware::"+values[id[3]]+"::talk_in", 0);
				configfile.replace("hardware::"+values[id[3]]+"::connections", "{}");
			}
		}
	}else if(id[0]=="remove"){
		if(id[1]=="controller"){
			if(id[2]=="colour"){
				configfile.remove("io::controllers::"+values[id[3]]);
			}else if(id[2]=="value"){
				configfile.remove("io::controllers::"+values[id[3]]);
			}else if(id[2]=="brightness"){
				configfile.remove("io::controllers::"+values[id[3]]);
			}else if(id[2]=="resets"){
				configfile.remove("io::controllers::"+values[id[3]]);
			}else if(id[2]=="buttons"){
				if(id[3]=="globals"){
					configfile.remove("io::controllers::"+values[id[4]]);
				}else{
					configfile.remove("io::controllers::"+values[id[3]]);
				}
			}else{
				//post("\nid2 is",id[2]);
				configfile.remove("io::controllers::"+values[id[2]]);
			}
		}else if(id[1] == "hardware"){
			if(id[2] == "in"){
				var tn = configfile.get("hardware::"+values[id[4]][0]+"::connections::in::hardware");
				var tc = configfile.get("hardware::"+values[id[4]][0]+"::connections::in::hardware_channels");
				tn.splice(values[id[4]][1],1);
				tc.splice(values[id[4]][1],1);
				configfile.replace("hardware::"+values[id[4]][0]+"::connections::in::hardware",tn);
				configfile.replace("hardware::"+values[id[4]][0]+"::connections::in::hardware_channels",tc);
			}else if(id[2]=="out"){
				var tc = configfile.get("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels");
				var tn = configfile.get("hardware::"+values[id[4]][0]+"::connections::out::hardware");
				tn.splice(values[id[4]][1],1);
				tc.splice(values[id[4]][1],1);
				configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware",tn);
				configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels",tc);
			}else if(id[2]=="midi"){
				post("\nremove midi",id,values[id[5]]);
			}else{
				post("\nhw id2 =",id[2]);
			}
		}
	}else if(id[0]=="hardwaremiditestsignal"){
		post("\nstart hw midi test",id[1],data.value, values[id[1]]);
		var range = configfile.get("hardware::"+values[id[1]][0]+"::connections::in::midi_ranges["+values[id[1]][1]+"]");
		var ch = configfile.get("hardware::"+values[id[1]][0]+"::connections::in::midi_channels["+values[id[1]][1]+"]");
		var mport = configfile.get("hardware::"+values[id[1]][0]+"::midi_in");
		this.patcher.messnamed("miditester",range[0],range[1]-range[0],ch,mport);
	}
	deleteall();
	render_controls();
}

function deleteall(){
	for(var i=0;i<controls.length;i++){
		this.patcher.remove(controls[i]);
	}
	controls=[];
	values=[];
}

function add_midimonitors(interface){
	controls[ii] = this.patcher.newdefault(10, 100, "comment");
	controls[ii].message("set", "--- --- --");
	controls[ii].presentation(1);
	controls[ii].presentation_position(20+2*unit.col,y_pos);
	ii++;
	controls[ii] = this.patcher.newdefault(10, 100, "prepend set note");
	this.patcher.connect(controls[ii],0,controls[ii-1],0);
	ii++;
	controls[ii] = this.patcher.newdefault(10, 100, "prepend set cc  ");
	this.patcher.connect(controls[ii],0,controls[ii-2],0);
	ii++;
	controls[ii] = this.patcher.newdefault(10, 120, "pack", 0,0,0);
	this.patcher.connect(controls[ii],0,controls[ii-2],0);
	ii++;
	controls[ii] = this.patcher.newdefault(10, 120, "pack", 0,0,0);
	this.patcher.connect(controls[ii],0,controls[ii-2],0);
	ii++;
	controls[ii] = this.patcher.newdefault(10, 120, "notein", "@name", interface);
	this.patcher.connect(controls[ii],0,controls[ii-2],0);
	this.patcher.connect(controls[ii],1,controls[ii-2],1);
	this.patcher.connect(controls[ii],2,controls[ii-2],2);
	ii++;
	controls[ii] = this.patcher.newdefault(10, 120, "ctlin", "@name", interface);
	this.patcher.connect(controls[ii],0,controls[ii-2],0);
	this.patcher.connect(controls[ii],1,controls[ii-2],1);
	this.patcher.connect(controls[ii],2,controls[ii-2],2);
	ii++;
}