MATRIX_OUT_CHANNELS = 16;
MATRIX_IN_CHANNELS = 16; //make these configurable if you ever discover a matrix with >16!

outlets = 1;
inlets = 1;
var unit = {
	header : 10,
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

var selected = {
	section : "none",
	item : -1
}

var a_clock_out_list = [1,2,3,4,5,6,7,8,9,10,11,12,24,48,96,192];

var library_hardware = this.patcher.getnamed("hardware_library");
var library_controllers = this.patcher.getnamed("controller_library");
var testmatrix = this.patcher.getnamed("testmatrix");
var latency_test_list = this.patcher.getnamed("latency_test_list");
var latency_test_button = this.patcher.getnamed("latency_test_button");
var latency_test_time = this.patcher.getnamed("latency_test_time");
var latency_test_text = this.patcher.getnamed("latency_test_text");

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
	selected.section = "none";
	selected.item = -1;
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
	if(!configfile.contains("io::matrix")) configfile.setparse("io::matrix", "{}");
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

	var matrix_ext = "none", matrix_soundcard = "none", special_controller = "none";
	if(configfile.contains("io::matrix::external")) matrix_ext = configfile.get("io::matrix::external");
	if(configfile.contains("io::matrix::soundcard")) matrix_soundcard = configfile.get("io::matrix::soundcard");
	if(configfile.contains("io::special_controller")) special_controller = configfile.get("io::special_controller");
	//post("\nstored values - ext driver:",matrix_ext," soundcard driver:",matrix_soundcard);

	if(selected.section != "keyboards"){
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "keyboards");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "show", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.keyboards");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		//values[ii] = [0,0];
		ii++;
		y_pos+=unit.row;
	}else{
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "keyboards");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "hide", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.none");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		//values[ii] = [0,0];
		ii++;
		y_pos+=unit.row + unit.header;

		var d = configfile.get("io::keyboards");
		//y_pos+=unit.header;
		for(var i=0;i<midi_interfaces.in.length;i++){
			var enab = -1;
			if(d!=null) enab = d.indexOf(midi_interfaces.in[i]);
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
	}
	y_pos+=unit.header;

	var cd = configfile.get("io::controllers");
	var cdk;
	if(cd!=null) cdk = cd.getkeys();
	if(cdk==null) cdk=[];

	if(selected.section != "controllers"){
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "controllers ("+cdk.length+")");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "show", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.controllers");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		//values[ii] = [0,0];
		ii++;
		y_pos+=unit.row;
	}else{
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "controllers ("+cdk.length+")");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,10+1.7*unit.col,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "hide", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.none");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		//values[ii] = [0,0];
		ii++;
		y_pos+=unit.row + unit.header;

		for(var p=0;p<cdk.length;p++){
			if(p!=selected.item){
				controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
				controls[ii].message("set", cdk[p]);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20,y_pos,1.7*unit.col,20);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "show", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.controllers."+p);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
				values[ii] = [cdk[p]];
				ii++;
				y_pos+=unit.row;
			}else{
				controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
				controls[ii].message("set", cdk[p]);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20,y_pos,1.7*unit.col,20);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "hide", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.controllers.-1");
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
				values[ii] = [cdk[p]];
				ii++;
				y_pos+=unit.row;

				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove controller", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.controller."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20,y_pos,unit.col-100,20);
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
				if(d==null) d = [];
				if(!Array.isArray(d)) d = [d];
				post("\n---",cdk[p],"d is",d,"MII",midi_interfaces.in);
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
						//post("\nAAA",ii,midi_interfaces.in[i],"-",enab,"-ypos",y_pos);
						controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  midi_interfaces.in[i], "@textoncolor", c, "@varname", "substitute."+ii);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
						values[ii] = [midi_interfaces.in[i],enab,cdk[p]];
						
						ii++;
						add_midimonitors(midi_interfaces.in[i]);
						y_pos+=unit.row;
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
						//post("\nBBB",ii,midi_interfaces.not_present_in[i],"-",enab,"-ypos",y_pos);
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

				//choose as default for control.auto or default for mixer.bus
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "use as default for core.input.control.auto");
				controls[ii].presentation(1);
				controls[ii].presentation_position(30,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "controller_defaults.control_auto."+ii);
				if(configfile.contains("io::controller_defaults::control_auto")){
					controls[ii].message("set", (configfile.get("io::controller_defaults::control_auto")==cdk[p]));
				}else{
					controls[ii].message("set", 0);
				}
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row*2;
				ii++;

				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "use as default for mixer.bus");
				controls[ii].presentation(1);
				controls[ii].presentation_position(30,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "controller_defaults.mixer_bus."+ii);
				if(configfile.contains("io::controller_defaults::mixer_bus")){
					controls[ii].message("set", (configfile.get("io::controller_defaults::mixer_bus")==cdk[p]));
				}else{
					controls[ii].message("set", 0);
				}
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row*2;
				ii++;

				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "use as default for grid input");
				controls[ii].presentation(1);
				controls[ii].presentation_position(30,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "controller_defaults.grid."+ii);
				if(configfile.contains("io::controller_defaults::grid")){
					controls[ii].message("set", (configfile.get("io::controller_defaults::grid")==cdk[p]));
				}else{
					controls[ii].message("set", 0);
				}
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row*2;
				ii++;

				//"outputs" : 16,
				controls[ii] = this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "number of outputs");
				controls[ii].presentation(1);
				controls[ii].presentation_position(30,y_pos);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.outputs."+ii, "@minimum", 0, "@maximum", 256);
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
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.channel."+ii, "@minimum", 1, "@maximum", 16);
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
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.first."+ii, "@minimum", 0, "@maximum", 127);
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
					controls[ii] = this.patcher.newdefault(10, 100, "flonum" , "@varname", "controller.scaling."+ii, "@minimum", -1, "@maximum", 1);
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
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.columns."+ii, "@minimum", 1, "@maximum", 64);
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
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controller.rows."+ii, "@minimum", 1, "@maximum", 64);
				controls[ii].message("set", cd.get(cdk[p]+"::rows"));
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p]];
				y_pos+=unit.row+unit.header;
				ii++;
	
				//"colour" :
				if(cd.contains(cdk[p]+"::colour")){
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "led colour cc");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.colour.channel."+ii, "@minimum", 1, "@maximum", 16);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.colour.first."+ii, "@minimum", 0, "@maximum", 127);
					controls[ii].message("set", cd.get(cdk[p]+"::colour::first"));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
					values[ii] = [cdk[p]];
					y_pos+=unit.row+unit.header;
					ii++;
	
				}else{
					//add key button
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "led colour cc");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "led brightness cc");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.brightness.channel."+ii, "@minimum", 1, "@maximum", 16);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.brightness.first."+ii, "@minimum", 0, "@maximum", 127);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.brightness.dim."+ii, "@minimum", 0, "@maximum", 127);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.brightness.bright."+ii, "@minimum", 0, "@maximum", 127);
					controls[ii].message("set", cd.get(cdk[p]+"::brightness::bright"));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
					values[ii] = [cdk[p]];
					y_pos+=unit.row+unit.header;
					ii++;
				}else{
					//add key button
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "led brightness cc");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "value feedback messages");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.value.channel."+ii, "@minimum", 1, "@maximum", 16);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.value.first."+ii, "@minimum", 0, "@maximum", 127);
					controls[ii].message("set", cd.get(cdk[p]+"::value::first"));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
					values[ii] = [cdk[p]];
					y_pos+=unit.row+unit.header;
					ii++;
	
				}else{
					//add key button
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "led value cc");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "reset buttons");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.resets.channel."+ii, "@minimum", 1, "@maximum", 16);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.resets.first."+ii, "@minimum", 0, "@maximum", 127);
					controls[ii].message("set", cd.get(cdk[p]+"::resets::first"));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
					values[ii] = [cdk[p]];
					y_pos+=unit.row+unit.header;
					ii++;
	
				}else{
					//add key button
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "reset buttons");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "controller buttons");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.buttons.channel."+ii, "@minimum", 1, "@maximum", 16);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.buttons.first."+ii, "@minimum", 0, "@maximum", 127);
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
					controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey.buttons.count."+ii, "@minimum", 0, "@maximum", 256);
					controls[ii].message("set", cd.get(cdk[p]+"::buttons::count"));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-20,20);
					values[ii] = [cdk[p]];
					y_pos+=unit.row+unit.header;
					ii++;
	
					if(cd.contains(cdk[p]+"::buttons::globals")){
						//	"globals" : {
						var tv;
						controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
						controls[ii].message("set", "button map to global functions");
						controls[ii].presentation(1);
						controls[ii].presentation_rect(40,y_pos,unit.col+80,20);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.automap_toggle."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.automap_page."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.lock_automap_control."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.lock_automap_keyboard."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.lock_automap_cue."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.toggle_display_mode."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.play."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.resync."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.panic."+ii, "@minimum", -1, "@maximum", 127);
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
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "controllersubkey2.buttons.globals.mute_selected."+ii, "@minimum", -1, "@maximum", 127);
						tv = cd.get(cdk[p]+"::buttons::globals::mute_selected");
						if(tv==null)tv=-1;
						controls[ii].message("set", tv);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(50+unit.col,y_pos,unit.col-30,20);
						values[ii] = [cdk[p]];
						y_pos+=unit.row+unit.header;
						ii++;
					}else{
						//add key button
						controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
						controls[ii].message("set", "button map to global functions");
						controls[ii].presentation(1);
						controls[ii].presentation_rect(40,y_pos,80+unit.col,20);
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
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "controller buttons");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(30,y_pos,unit.col+90,20);
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
				controls[ii].presentation_rect(20,y_pos,2*unit.col,20);
				values[ii] = midi_interfaces.not_used_in[i];
				ii++;			
				y_pos+=unit.row;
			}
		}
		y_pos += unit.header;
		library_controllers.presentation(1);
		library_controllers.presentation_rect(20,y_pos,2*unit.col,20);
		y_pos+=unit.row;
	}

	y_pos+=unit.header;
	
	var cd = configfile.get("hardware");
	var cdk = null;
	if(cd!=null) cdk = cd.getkeys();
	if(cdk==null) cdk=[];
	latency_test_list.message("clear");
	for(var p=0;p<cdk.length;p++){
		latency_test_list.message("append",cdk[p]);
	}

	if(selected.section!="hardware"){
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "hardware ("+cdk.length+")");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "show", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.hardware");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		//values[ii] = [0,0];
		ii++;
		y_pos+=unit.row;
	}else{
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "hardware ("+cdk.length+")");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "hide", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.none");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		//values[ii] = [0,0];
		ii++;
		y_pos+=unit.row + unit.header;
	
		for(var p=0;p<cdk.length;p++){
			if(selected.item != p){
				controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
				controls[ii].message("set", cdk[p]);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20,y_pos,1.7*unit.col,20);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "show", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.hardware."+p);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
				//values[ii] = [0,0];
				ii++;
				y_pos+=unit.row;
			}else{
				controls[ii]= this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  , "@varname", "hardwarename."+ii, "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1], "@keymode", 1);
				//controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
				controls[ii].message("set", cdk[p]);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20,y_pos,1.7*unit.col,20);
				values[ii] = [cdk[p]];
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "hide", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.hardware.-1");
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
				//values[ii] = [0,0];
				ii++;
				y_pos+=unit.row+unit.header;
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove block", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.block."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p],"block"];
				ii++;
				y_pos+=unit.row+unit.header;
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
				controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.max_polyphony."+ii, "@minimum", 0, "@maximum", 128);
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
				y_pos+=unit.header;

				controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
				controls[ii].message("set", "connections");
				controls[ii].presentation(1);
				controls[ii].presentation_rect(30,y_pos,2*unit.col - 10,20);
				y_pos+=unit.row+unit.header;
				ii++;
				
				if(cd.contains(cdk[p]+"::connections::in::hardware")){
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "in (to hardware, from benny)");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40,y_pos,2*unit.col-20,20);
					y_pos+=unit.row+unit.header;
					ii++;
					var hwl,hwc,mc;
					hwl = cd.get(cdk[p]+"::connections::in::hardware");
					hwc = cd.get(cdk[p]+"::connections::in::hardware_channels");
					
					if(matrix_ext!="none"){
						mc = cd.get(cdk[p]+"::connections::in::matrix_channels");
					}
					for(var i = 0; i< hwc.length;i++){
						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "input name");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;

						controls[ii] = this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  ,"@keymode", 1,  "@varname", "hardware.in.name."+ii);
						if(i<hwl.length){
							controls[ii].message("set",hwl[i].split(" "));
							controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
							controls[ii].presentation(1);
							controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,22);
							values[ii] = [cdk[p],i];
							ii++;
						}
						y_pos+=unit.row;

						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						if(matrix_ext!="none"){
							controls[ii].message("set", "audio channel (0 = none)");
						}else{
							controls[ii].message("set", "audio channel");
						}
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;

						if(matrix_ext!="none"){
							controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.in.channel."+ii, "@minimum", 0, "@maximum", 256);
						}else{
							controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.in.channel."+ii, "@minimum", 1, "@maximum", 256);
						}
						controls[ii].message("set", hwc[i]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(unit.col+20,y_pos,60,20);
						values[ii] = [cdk[p],i];
						ii++;	
						y_pos += unit.row;

						if(matrix_ext!="none"){
							if(!Array.isArray(mc)) mc=[];
							if(mc[i]==null) mc[i] = 0;
							post("\nMCi is ",mc[i]);
							controls[ii] = this.patcher.newdefault(10, 100, "comment");
							controls[ii].message("set", "matrix channel (0 = none)");
							controls[ii].presentation(1);
							controls[ii].presentation_rect(40,y_pos,unit.col,20);
							ii++;
	
							controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.in.matrixchannel."+ii, "@minimum", 0, "@maximum", MATRIX_IN_CHANNELS);
							controls[ii].message("set", mc[i]);
							controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
							controls[ii].presentation(1);
							controls[ii].presentation_rect(unit.col+20,y_pos,60,20);
							values[ii] = [cdk[p],i];
							ii++;	
							y_pos += unit.row;
						}

						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "send test signal");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "hardwaretestsignal."+ii);
						controls[ii].message("append","none");
						controls[ii].message("append","tones");
						controls[ii].message("append","pink noise");
						controls[ii].message("append","lfo");
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
						values[ii] = [cdk[p],hwc[i]];
						y_pos+=unit.row+unit.header;
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove channel", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.in.channel."+ii);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
						values[ii] = [cdk[p],i];
						ii++;			
						y_pos+=unit.row+unit.header;
					}
				}
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add a hardware input channel", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.in.channel."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p],"connections::in::hardware"];
				ii++;			
				y_pos+=unit.row+unit.header;

				if(cd.contains(cdk[p]+"::connections::in::midi")){
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "midi in (to hardware, from benny)");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40,y_pos,unit.col*2-20,20);
					y_pos+=unit.row+unit.header;
					ii++;
		
					controls[ii] = this.patcher.newdefault(10, 100, "comment");
					controls[ii].message("set", "choose midi port");
					controls[ii].presentation(1);
					controls[ii].presentation_position(40,y_pos);
					ii++;
					controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "hardware.midi.inport."+ii);
					controls[ii].message("append","none");
					var subs=midi_interfaces.out;
					values[ii] = [cdk[p],["none"]];
					for(var s=0;s<subs.length;s++){
						controls[ii].message("append",subs[s]);
						values[ii][1].push(subs[s]);
					}
					var subs=midi_interfaces.not_present_out;
					for(var s=0;s<subs.length;s++){
						controls[ii].message("append",subs[s]);
						values[ii][1].push(subs[s]);
					}
					controls[ii].message("setsymbol", cd.get(cdk[p]+"::midi_in"));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
					y_pos+=unit.row+unit.header;
					ii++;			
		
					hwl = cd.get(cdk[p]+"::connections::in::midi");
					hwc = cd.get(cdk[p]+"::connections::in::midi_channels");
					hwr = cd.get(cdk[p]+"::connections::in::midi_ranges");
					for(var i = 0; i< hwc.length;i++){
						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "input name");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;

						controls[ii] = this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  ,"@keymode", 1,  "@varname", "hardware.midi.in.name."+ii);
						if(i<hwl.length){
							controls[ii].message("set",hwl[i].split(" "));
							controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
							controls[ii].presentation(1);
							controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,22);
							values[ii] = [cdk[p],i];
							ii++;
						}
						y_pos+=unit.row;

						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "midi channel");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.in.channel."+ii, "@minimum", 1, "@maximum", 16);
						controls[ii].message("set", hwc[i]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,60,20);
						values[ii] = [cdk[p],i];
						ii++;	
						y_pos+=unit.row;

						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "note range minimum");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;						
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.in.range1."+ii, "@minimum", 0, "@maximum", 127);
						controls[ii].message("set", hwr[i][0]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,60,20);
						values[ii] = [cdk[p],i];
						ii++;	
						y_pos+=unit.row;
						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "note range maximum");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.in.range2."+ii, "@minimum", 0, "@maximum", 127);
						controls[ii].message("set", hwr[i][1]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,60,20);
						values[ii] = [cdk[p],i];
						ii++;	
						y_pos+=22;
						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "send midi test");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "hardwaremiditestsignal."+ii);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
						values[ii] = [cdk[p],i];
						y_pos+=unit.row;
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove midi input", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.midi.in.channel."+ii);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
						values[ii] = [cdk[p],i];
						ii++;			
						y_pos+=unit.row+unit.header;
					}
				}
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add a midi input channel", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.midi.in.channel."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p],"connections::in::hardware"];
				ii++;			
				y_pos+=unit.row+unit.header;
		
				if(cd.contains(cdk[p]+"::connections::out::hardware")){
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "out (from hardware, to benny)");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40,y_pos,unit.col*2-20,20);
					y_pos+=unit.row+unit.header;
					ii++;
					var hwl,hwc,mc;
					hwl = cd.get(cdk[p]+"::connections::out::hardware");
					hwc = cd.get(cdk[p]+"::connections::out::hardware_channels");
					var dcb,ipgate;
					if(cd.contains(cdk[p]+"::connections::out::dc_block")){
						dcb = cd.get(cdk[p]+"::connections::out::dc_block");
					}else{
						dcb = [];
						for(var dci=0;dci<hwc.length;dci++) dcb.push(1);
					}
					if(cd.contains(cdk[p]+"::connections::out::input_gate")){
						ipgate = cd.get(cdk[p]+"::connections::out::input_gate");
					}else{
						ipgate = [];
						for(var dci=0;dci<hwc.length;dci++) ipgate.push(1);
					}

					if(matrix_ext!="none"){
						mc = cd.get(cdk[p]+"::connections::out::matrix_channels");
					}
					for(var i = 0; i< hwc.length;i++){
						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "output name");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  ,"@keymode", 1,  "@varname", "hardware.out.name."+ii);
						if(i<hwl.length){
							controls[ii].message("set",hwl[i].split(" "));
							controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
							controls[ii].presentation(1);
							controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,22);
							values[ii] = [cdk[p],i];
							ii++;
						}
						y_pos+=unit.row;

						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						if(matrix_ext!="none"){
							controls[ii].message("set", "audio channel (0 = none)");
						}else{
							controls[ii].message("set", "audio channel");
						}
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						if(matrix_ext!="none"){
							controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.out.channel."+ii, "@minimum", 0, "@maximum", 256);
						}else{
							controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.out.channel."+ii, "@minimum", 1, "@maximum", 256);
						}
						controls[ii].message("set", hwc[i]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,60,20);
						values[ii] = [cdk[p],i];
						ii++;	
						y_pos+=unit.row;

						if(matrix_ext!="none"){
							if(!Array.isArray(mc)) mc=[];
							if(mc[i]==null) mc[i] = -1;
							controls[ii] = this.patcher.newdefault(10, 100, "comment");
							controls[ii].message("set", "matrix channel (0 = none)");
							controls[ii].presentation(1);
							controls[ii].presentation_rect(40,y_pos,unit.col,20);
							ii++;
							controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.out.matrixchannel."+ii, "@minimum", 0, "@maximum", MATRIX_OUT_CHANNELS-1);
							controls[ii].message("set", mc[i]);
							controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
							controls[ii].presentation(1);
							controls[ii].presentation_rect(20+unit.col,y_pos,60,20);
							values[ii] = [cdk[p],i];
							ii++;	
							y_pos+=unit.row;
						}

						controls[ii] = this.patcher.newdefault(10, 100, "meter~");
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,22);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "adc~");
						controls[ii].message("list", hwc[i]);
						this.patcher.connect(controls[ii],0,controls[ii-1],0);
						ii++;
						y_pos+=unit.row;

						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "dc block");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "hardware.out.dcblock."+ii);
						controls[ii].message("set", dcb[i]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
						values[ii] = [cdk[p],i];
						ii++;
						y_pos += unit.row;
						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "gate (saves cpu by switching off silent inputs)");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "hardware.out.inputgate."+ii);
						controls[ii].message("set", ipgate[i]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
						values[ii] = [cdk[p],i];
						ii++;
						y_pos += unit.row*2;


						y_pos+=22+unit.header;
						controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove channel", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.out.channel."+ii);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
						values[ii] = [cdk[p],i];
						ii++;			
						y_pos+=unit.row+unit.header;
					}
				}
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add a hardware output channel", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.out.channel."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p]];
				ii++;			
				y_pos+=unit.row+unit.header;

				if(cd.contains(cdk[p]+"::connections::out::midi")){
					controls[ii] = this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.594, 0.449, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					controls[ii].message("set", "midi out (from hardware, to benny)");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(40,y_pos,unit.col*2-20,20);
					y_pos+=unit.row+unit.header;
					ii++;
		
					controls[ii] = this.patcher.newdefault(10, 100, "comment");
					controls[ii].message("set", "choose midi port");
					controls[ii].presentation(1);
					controls[ii].presentation_position(40,y_pos);
					ii++;
					controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "hardware.midi.outport."+ii);
					controls[ii].message("append","none");
					var subs=midi_interfaces.in;
					values[ii]=[cdk[p],["none"]];
					for(var s=0;s<subs.length;s++){
						controls[ii].message("append",subs[s]);
						values[ii][1].push(subs[s]);
					}
					var subs=midi_interfaces.not_present_in;
					for(var s=0;s<subs.length;s++){
						controls[ii].message("append",subs[s]);
						values[ii][1].push(subs[s]);
					}
					controls[ii].message("setsymbol", cd.get(cdk[p]+"::midi_out"));
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
					y_pos+=unit.row+unit.header;
					ii++;			
		
					hwl = cd.get(cdk[p]+"::connections::out::midi");
					hwc = cd.get(cdk[p]+"::connections::out::midi_channels");
					hwr = cd.get(cdk[p]+"::connections::out::midi_ranges");
					for(var i = 0; i< hwc.length;i++){
						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "output name");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "textedit", "@border", 0, "@rounded", 0  ,"@keymode", 1,  "@varname", "hardware.midi.out.name."+ii);
						if(i<hwl.length){
							controls[ii].message("set",hwl[i].split(" "));
							controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
							controls[ii].presentation(1);
							controls[ii].presentation_rect(20+unit.col,y_pos,unit.col-60,22);
							values[ii] = [cdk[p],i];
							ii++;
						}
						y_pos+=unit.row;
						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "midi channel");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.out.channel."+ii, "@minimum", 1, "@maximum", 16);
						controls[ii].message("set", hwc[i]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(unit.col+20,y_pos,60,20);
						values[ii] = [cdk[p],i];
						ii++;	

						add_midimonitors(cdk[p]);

						y_pos+=22;

/*						controls[ii] = this.patcher.newdefault(10, 100, "comment");
						controls[ii].message("set", "note range minimum");
						controls[ii].presentation(1);
						controls[ii].presentation_position(40,y_pos);
						ii++;

						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.out.range1."+ii);
						controls[ii].message("set", hwr[i][0]);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(2*unit.col-100,y_pos,60,20);
						values[ii] = [cdk[p],i];
						ii++;	
						controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "hardware.midi.out.range2."+ii);
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
						ii++;*/
						controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "remove midi output", "@textoncolor", [1.000, 0.2, 0.200, 1.000], "@varname", "remove.hardware.midi.out.channel."+ii);
						controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
						controls[ii].presentation(1);
						controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
						values[ii] = [cdk[p],i];
						ii++;			
						y_pos+=2*unit.row;
					}
				}
				controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add a midi output channel", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.midi.out.channel."+ii);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
				values[ii] = [cdk[p],"connections::out::hardware"];
				ii++;			
				y_pos+=unit.row+unit.header;
			}
		}
		y_pos+=unit.header;
	
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "add another hardware block", "@textoncolor", [0, 1.0,0, 1.000], "@varname", "add.hardware.newblock."+ii);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20,y_pos,unit.col*2,20);
		values[ii] = ["hardware.newblock", cdk.length];
		ii++;			
		y_pos+=unit.row + unit.header;
	
		library_hardware.presentation(1);
		library_hardware.presentation_rect(20,y_pos,2*unit.col,20);
		y_pos+=unit.row;
	}
	y_pos += unit.header;
	
	if(selected.section != "sync"){
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "midi clock and sync");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "show", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.sync");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		//values[ii] = [0,0];
		ii++;
		y_pos+=unit.row;
	}else{
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "midi clock and sync");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "hide", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.none");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		//values[ii] = [0,0];
		ii++;
		y_pos+=unit.row + unit.header;

		var d = configfile.get("io::sync");
		//y_pos+=unit.header;
		midi_interfaces.all_in = midi_interfaces.in.concat(midi_interfaces.not_present_in);
		if(midi_interfaces.all_in.length>0){
			controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
			controls[ii].message("set", "midi clock in");
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20,y_pos,2*unit.col,20);
			ii++;
			y_pos+=unit.row + unit.header;

			controls[ii] = this.patcher.newdefault(10, 100, "umenu", "@varname", "sync.midi_in.selected."+ii);//, "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
			controls[ii].message("append", "none");
			values[ii] = ["none"];
			for(var i=0;i<midi_interfaces.all_in.length;i++){
				controls[ii].message("append", midi_interfaces.all_in[i]);
				values[ii].push(midi_interfaces.all_in[i]);
			}
			controls[ii].presentation(1);
			controls[ii].presentation_rect(40,y_pos,unit.col,20);
			if(configfile.contains("io::sync::midi_clock_in::selected")){
				pp = d.get("midi_clock_in::selected");
			} else {
				pp = "none";
			}
			controls[ii].message("setsymbol", pp);
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			ii++;

			if(pp!="none"){
				controls[ii]= this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", "ppqn");
				controls[ii].presentation(1);
				controls[ii].presentation_rect(40+unit.col,y_pos,unit.col-80,20);
				ii++;
				controls[ii] = this.patcher.newdefault(10, 100, "umenu", "@varname", "sync.midi_in.ppqn."+ii);//, "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
				for(var pp=24;pp<385;pp*=2) controls[ii].message("append", pp);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(40+1.5*unit.col,y_pos,0.5*unit.col-20,20);
				pp=24;
				if(configfile.contains("io::sync::midi_clock_in::ppqn")) pp = d.get("midi_clock_in::ppqn");
				controls[ii].message("setsymbol", pp);
				values[ii] = midi_interfaces.all_in[i];
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				ii++;
			}
			y_pos+=unit.row + unit.header;
		}

		midi_interfaces.all_out = midi_interfaces.out.concat(midi_interfaces.not_present_out);
		if(midi_interfaces.all_out.length>0){
			controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
			controls[ii].message("set", "midi clock out");
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20,y_pos,2*unit.col,20);
			ii++;
			y_pos+=unit.row + unit.header;
			for(var i=0;i<midi_interfaces.all_out.length;i++){
				var enab = 0;
				if(configfile.contains("io::sync::midi_clock_out::"+midi_interfaces.all_out[i])) enab = d.get("midi_clock_out::"+midi_interfaces.all_out[i]+"::enable");
				controls[ii]= this.patcher.newdefault(10, 100, "comment");
				controls[ii].message("set", midi_interfaces.all_out[i]);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(40,y_pos,unit.col-20,20);
				ii++;

				controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "sync.midi_out.enable."+ii);
				controls[ii].message("set", enab);
				controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
				controls[ii].presentation(1);
				controls[ii].presentation_rect(20+unit.col,y_pos,20,20);
				values[ii] = midi_interfaces.all_out[i];
				ii++;
				if(enab==1){
					controls[ii]= this.patcher.newdefault(10, 100, "comment");
					controls[ii].message("set", "ppqn");
					controls[ii].presentation(1);
					controls[ii].presentation_rect(80+unit.col,y_pos,unit.col-80,20);
					ii++;
					controls[ii] = this.patcher.newdefault(10, 100, "umenu", "@varname", "sync.midi_out.ppqn."+ii);//, "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
					for(var pp=24;pp<385;pp*=2) controls[ii].message("append", pp);
					controls[ii].presentation(1);
					controls[ii].presentation_rect(20+1.5*unit.col,y_pos,0.5*unit.col-20,20);
					pp=24;
					if(configfile.contains("io::sync::midi_clock_out::"+midi_interfaces.all_out[i]+"::ppqn")) pp = d.get("midi_clock_out::"+midi_interfaces.all_out[i]+"::ppqn");
					controls[ii].message("setsymbol", pp);
					values[ii] = midi_interfaces.all_out[i];
					controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
					ii++;
				}
				y_pos+=unit.row;
			}
		}
		y_pos+=unit.header;
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [0.694, 0.549, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "clock out via audio");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20,y_pos,2*unit.col,20);
		ii++;
		y_pos+=unit.header + unit.row;
		var enab = 0;
		if(configfile.contains("io::sync::audio_clock_out")) enab = d.get("audio_clock_out::enable");
		controls[ii]= this.patcher.newdefault(10, 100, "comment");
		controls[ii].message("set", "enable");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(40,y_pos,unit.col-20,20);
		ii++;

		controls[ii] = this.patcher.newdefault(10, 100, "toggle" , "@varname", "sync.audio_clock_out.enable."+ii);
		controls[ii].message("set", enab);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(90,y_pos,20,20);
		ii++;
		if(enab){
			controls[ii]= this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "output channel");
			controls[ii].presentation(1);
			controls[ii].presentation_rect(unit.col - 100,y_pos,unit.col,20);
			ii++;
	
			controls[ii] = this.patcher.newdefault(10, 100, "number" , "@varname", "sync.audio_clock_out.channel", "@minimum", 0, "@maximum", 64);
			controls[ii].message("set", configfile.get("io::sync::audio_clock_out::channel"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(unit.col,y_pos,40,20);
			ii++;

			controls[ii]= this.patcher.newdefault(10, 100, "comment");
			controls[ii].message("set", "ppqn");
			controls[ii].presentation(1);
			controls[ii].presentation_rect(unit.col+80,y_pos,unit.col-100,20);
			ii++;

			controls[ii] = this.patcher.newdefault(10, 100, "umenu", "@varname", "sync.audio_clock_out.ppqn."+ii);//, "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
			
			for(var pp=0;pp<a_clock_out_list.length;pp++) controls[ii].message("append", a_clock_out_list[pp]);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+1.5*unit.col,y_pos,0.5*unit.col-20,20);
			pp=24;
			if(configfile.contains("io::sync::audio_clock_out::ppqn")) pp = d.get("audio_clock_out::ppqn");
			controls[ii].message("setsymbol", pp);
			values[ii] = midi_interfaces.all_out[i];
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			ii++;
		}	
		y_pos+=unit.row;
	}

	y_pos+=unit.header;

	if(selected.section!="advanced"){
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "advanced settings");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "show", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.advanced");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		ii++;
		y_pos+=unit.row;
	}else{
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "advanced settings");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(10,y_pos,1.7*unit.col+10,20);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "textbutton" , "@text",  "hide", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", "show.none");
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+1.7*unit.col,y_pos,0.3*unit.col,20);
		ii++;
		y_pos+=unit.row + unit.header;

		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "external matrix driver");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20,y_pos,unit.col,20);
		ii++;
	
		controls[ii] = this.patcher.newdefault(10, 100, "umenu", "@varname", "drivers.1."+ii);//, "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("prefix", filepath+"/hardware_configs/drivers/external_matrix");
		controls[ii].message("populate");
		controls[ii].message("append", "none");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		controls[ii].message("setsymbol", matrix_ext);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "send", "matrix_ext");
		this.patcher.connect(controls[ii-1],1,controls[ii],0);
		ii++;
		y_pos+=unit.row+unit.header;

		if(matrix_ext!="none"){
			controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
			controls[ii].message("set", "matrix control midi interface");
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20,y_pos,unit.col,20);
			ii++;
			controls[ii] = this.patcher.newdefault(10, 100, "umenu" , "@varname", "matrix.external_midi_out."+ii);
			controls[ii].message("append","none");
			var subs=midi_interfaces.out;
			values[ii] = [];
			for(var s=0;s<subs.length;s++){
				controls[ii].message("append",subs[s]);
				values[ii].push(subs[s]);
			}
			var subs=midi_interfaces.not_present_out;
			for(var s=0;s<subs.length;s++){
				controls[ii].message("append",subs[s]);
				values[ii].push(subs[s]);
			}
			controls[ii].message("setsymbol", configfile.get("io::matrix::external_midi_out"));
			controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
			controls[ii].presentation(1);
			controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
			y_pos+=unit.row;
			ii++;			
			y_pos+=unit.row+unit.header;			
		}
	
		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "soundcard mixer driver");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20,y_pos,unit.col,20);
		ii++;
	
		controls[ii]= this.patcher.newdefault(10, 100, "umenu", "@varname", "drivers.2."+ii);//, "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("prefix", filepath+"/hardware_configs/drivers/soundcard_mixer");
		controls[ii].message("populate");
		controls[ii].message("append", "none");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		controls[ii].message("setsymbol", matrix_soundcard);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "send", "matrix_soundcard");
		this.patcher.connect(controls[ii-1],1,controls[ii],0);
		ii++;
	
		y_pos+=unit.row + unit.header;

		controls[ii]= this.patcher.newdefault(10, 100, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("set", "special controller driver");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20,y_pos,unit.col,20);
		ii++;
	
		controls[ii] = this.patcher.newdefault(10, 100, "umenu", "@varname", "drivers.1."+ii);//, "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
		controls[ii].message("prefix", filepath+"/hardware_configs/drivers/special_controller");
		controls[ii].message("populate");
		controls[ii].message("append", "none");
		controls[ii].presentation(1);
		controls[ii].presentation_rect(20+unit.col,y_pos,unit.col,20);
		controls[ii].message("setsymbol", special_controller);
		controls[ii].listener = new MaxobjListener(controls[ii], keybcallback);
		ii++;
		controls[ii] = this.patcher.newdefault(10, 100, "send", "special_controller");
		this.patcher.connect(controls[ii-1],1,controls[ii],0);
		ii++;
		y_pos+=unit.row+unit.header;

		latency_test_list.presentation(1);
		latency_test_button.presentation(1);
		latency_test_time.presentation(1); 
		latency_test_text.presentation(1); 

		latency_test_list.presentation_rect(20,y_pos,unit.col*1.7-20,20);
		latency_test_button.presentation_rect(unit.col*1.7,y_pos,20,20);
		latency_test_time.presentation_rect(20+unit.col*1.7,y_pos,unit.col*0.3,20); 
		y_pos+=unit.row+unit.header;
		latency_test_text.presentation_rect(20,y_pos,unit.col*2,unit.row*10); 
	}

}

function keybcallback(data){
	//post("\nvalue",data.value);
	if(data.maxobject==null){post("\nnot a max object", data.value, data); return -1;}
	//post(" - object",data.maxobject.varname);
	var id = data.maxobject.varname.split('.');
	var dontredraw=0;

	if(id[0]=="show"){
		if(id.length<3) id[2] = -1;
		selected.section = id[1];
		selected.item = id[2];
		//post("\n\nselected section",selected.section,selected.item);
	}else if(id[0]=="keyboards"){
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
		if(!Array.isArray(d)) d = [d];
		//post("\n\nsubsbutton id",id,"v",v,"d",d);
		if(v[1]=="enabled"){ 
			p = d.indexOf(v[0]);
			if(p != -1){
				d.splice(p,1);
				configfile.replace("io::controllers::"+v[2]+"::substitute",d);
			}
		}else if(v[1]=="disabled"){//so enable it
			configfile.append("io::controllers::"+v[2]+"::substitute",v[0]);
		}
	}else if(id[0]=="controller"){
		var v = values[id[2]];
		dontredraw = 1;
		if(id[1]=="type"){
			dontredraw = 0;
			if(data.value==0){
				configfile.replace("io::controllers::"+v[0]+"::"+id[1],"encoder");
			}else{
				configfile.replace("io::controllers::"+v[0]+"::"+id[1],"potentiometer");
			}
		}else{
			configfile.replace("io::controllers::"+v[0]+"::"+id[1],data.value);
		}
	}else if(id[0]=="controller_defaults"){
		post("\nhandling default selection:",id);
		var v = values[id[2]];
		if(Array.isArray(v)) v = v[0];
		post("v is",v);
		if(configfile.contains("io::controller_defaults")){
			var okd = configfile.get("io::controller_defaults");
			var ok = okd.getkeys();
			for(ik = 0;ik<ok.length;ik++){
				post("\n ok",ok[ik],"value",configfile.get("io::controller_defaults::"+ok[ik]));
				if((ok[ik]!=id[1])&&(configfile.get("io::controller_defaults::"+ok[ik])==v)){
					configfile.remove("io::controller_defaults::"+ok[ik]);
					post("REMOVED");
				}
			}
		}
		configfile.replace("io::controller_defaults::"+id[1],v);
	}else if(id[0]=="controllersubkey"){
		var v = values[id[3]];
		var vv = data.value;
		if(id[2]=="type"){
			if((id[1]=="buttons")||(id[1]=="resets")||(id[1]=="value")){
				if(vv==0){
					vv = "note";
				}else{
					vv = "cc";
				}
			}else if((id[1]=="brightness")||(id[1]=="colour")){
				if(vv == 0){
					vv = "midifighter";
				}else if(vv == 1){
					vv = "novation launchcontrol";
				}
			}
		}
		dontredraw = 1;
		//post("\nid4 = ",id[3],"v = ",v,"\n replace","io::controllers::"+v[0]+"::"+id[1]+"::"+id[2]+"::"+id[3],data.value);
		configfile.replace("io::controllers::"+v[0]+"::"+id[1]+"::"+id[2],vv);
	}else if(id[0]=="controllersubkey2"){
		var v = values[id[4]];
		dontredraw = 1;
		//post("\nid4 = ",id[4],"v = ",v,"\n replace","io::controllers::"+v[0]+"::"+id[1]+"::"+id[2]+"::"+id[3],data.value);
		configfile.replace("io::controllers::"+v[0]+"::"+id[1]+"::"+id[2]+"::"+id[3],data.value);
	}else if(id[0]=="matrix"){
		var v = values[id[2]];
		dontredraw = 1;
		//post("\nMATRIX, id",id[2]," datav",data.value,"V",v,"OR",v[data.value-1]);
		//post("\nid4 = ",id[4],"v = ",v,"\n replace","io::controllers::"+v[0]+"::"+id[1]+"::"+id[2]+"::"+id[3],data.value);
		configfile.replace("io::matrix::"+id[1],v[data.value-1]);
	}else if(id[0]=="sync"){
		if(id[1]=="midi_in"){
			if(id[2]=="selected"){
				if(!configfile.contains("io::sync::midi_clock_in")){
					// configfile.setparse("io::sync","{}");
					// configfile.setparse("io::sync::midi_clock_in","{}");
					configfile.setparse("io::sync","{ 'midi_clock_in' : '{}' }");
				}
				configfile.replace("io::sync::midi_clock_in::selected",values[id[3]][data.value]);
				//  post("\nSYNC id",id,"answer",values[id[3]][data.value],"value",data.value,"name",values[id[3]]);
			}else if(id[2]=="ppqn"){
				configfile.replace("io::sync::midi_clock_in::ppqn",Math.pow(2,data.value)*24);
			}
		}else if(id[1]=="midi_out"){
			if(id[2]=="enable"){
				if(!configfile.contains("io::sync::midi_clock_out::"+values[id[3]])){
					// configfile.setparse("io::sync","{}");
					// configfile.setparse("io::sync::midi_clock_in","{}");
					configfile.setparse("io::sync::midi_clock_out::"+values[id[3]],"{}");
				}
				if(data.value == 0){
					configfile.remove("io::sync::midi_clock_out::"+values[id[3]]);
				}else{
					configfile.replace("io::sync::midi_clock_out::"+values[id[3]]+"::enable",data.value);
				}
				// post("\nSYNC id",id,"value",data.value,"name",values[id[3]]);
			}else if(id[2]=="ppqn"){
				configfile.replace("io::sync::midi_clock_out::"+values[id[3]]+"::ppqn",Math.pow(2,data.value)*24);
			}
		}else if(id[1]=="audio_clock_out"){
			if(id[2]=="ppqn"){
				configfile.replace("io::sync::audio_clock_out::ppqn",a_clock_out_list[data.value]);
			}else{
				configfile.replace("io::sync::audio_clock_out::"+id[2],data.value);
			}
		}
	}else if(id[0]=="hardware"){
		dontredraw = 1;
		if(id[1]=="in"){
			if(id[2]=="channel"){
				//post("\nset in channel object",+id[3]+2,"to ",data.value);
				var oc = configfile.get("hardware::"+values[id[3]][0]+"::connections::in::hardware_channels["+values[id[3]][1]+"]");
				if(oc>0) for(var oo=0;oo<3;oo++) testmatrix.message(oo,oc-1,0);
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::in::hardware_channels["+values[id[3]][1]+"]",data.value);
				dontredraw = 0;
				//controls[t+2].message("bang");//"list", data.value);
			}else if(id[2]=="name"){
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::in::hardware["+values[id[3]][1]+"]",data.value);
				//post("\nname",data.value,"info",values[id[3]]);
			}else if(id[2]=="matrixchannel"){
				var t=+id[3];
				//post("\nset in matrix channel object hardware::"+values[id[3]][0]+"::connections::in::matrix_channels["+values[id[3]][1]+"]",data.value);
				var tarr = [];
				if(!configfile.contains("hardware::"+values[id[3]][0]+"::connections::in::matrix_channels")){
					configfile.replace("hardware::"+values[id[3]][0]+"::connections::in::matrix_channels","*");
					for(var tt=configfile.getsize("hardware::"+values[id[3]][0]+"::connections::in::hardware");tt>=0;tt--) tarr.push(0);
				}else{
					tarr = configfile.get("hardware::"+values[id[3]][0]+"::connections::in::matrix_channels");
					if(!Array.isArray(tarr)) tarr = [tarr];
				}
				tarr[values[id[3]][1]] = data.value;
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::in::matrix_channels",tarr);
				//configfile.replace("hardware::"+values[id[3]][0]+"::connections::in::matrix_channels["+values[id[3]][1]+"]",data.value);
				//controls[t+2].message("list", data.value);
			}
		}else if(id[1]=="out"){
			if(id[2]=="channel"){
				var t=+id[3];
				post("\nset out channel object",t+2,"to ",data.value,"\nie ","hardware::"+values[id[3]][0]+"::connections::out::hardware_channels["+values[id[3]][1]+"]",data.value);
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::hardware_channels["+values[id[3]][1]+"]",data.value);
				dontredraw = 0;
			}else if(id[2]=="name"){
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::hardware["+values[id[3]][1]+"]",data.value);
				post("\nname",data.value,"info",values[id[3]]);
			}else if(id[2]=="matrixchannel"){
				var t=+id[3];
				post("\nset out matrix channel object",t+2,"to ",data.value,"\nie ","hardware::"+values[id[3]][0]+"::connections::out::hardware_channels["+values[id[3]][1]+"]",data.value);
				var tarr = [];
				if(!configfile.contains("hardware::"+values[id[3]][0]+"::connections::out::matrix_channels")){
					configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::matrix_channels","*");
					for(var tt=configfile.getsize("hardware::"+values[id[3]][0]+"::connections::out::hardware");tt>=0;tt--) tarr.push(0);
				}
				tarr[values[id[3]][1]] = data.value;
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::matrix_channels",tarr);
				//configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::matrix_channels["+values[id[3]][1]+"]",data.value);
				//controls[t+2].message("list", data.value);
			}else if(id[2]=="dcblock"){
				var t=+id[3];
				var tarr = [];
				if(!configfile.contains("hardware::"+values[t][0]+"::connections::out::dc_block")){
					configfile.replace("hardware::"+values[t][0]+"::connections::out::dc_block","*");
					for(var tt=configfile.getsize("hardware::"+values[t][0]+"::connections::out::hardware");tt>0;tt--) tarr.push(1);
				}else{
					tarr = configfile.get("hardware::"+values[t][0]+"::connections::out::dc_block");
					if(!Array.isArray(tarr)) tarr = [tarr];
				}
				tarr[values[t][1]] = data.value;
				configfile.replace("hardware::"+values[t][0]+"::connections::out::dc_block",tarr);
			}else if(id[2]=="inputgate"){
				var t=+id[3];
				var tarr = [];
				if(!configfile.contains("hardware::"+values[id[3]][0]+"::connections::out::input_gate")){
					configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::input_gate","*");
					for(var tt=configfile.getsize("hardware::"+values[id[3]][0]+"::connections::out::hardware");tt>0;tt--) tarr.push(1);
				}else{
					tarr = configfile.get("hardware::"+values[id[3]][0]+"::connections::out::input_gate");
					if(!Array.isArray(tarr)) tarr = [tarr];
				}
				tarr[values[id[3]][1]] = data.value;
				configfile.replace("hardware::"+values[id[3]][0]+"::connections::out::input_gate",tarr);
			}
		}else if(id[1]=="midi"){
			if(id[2]=="inport"){
				post("\nwrite inport",values[id[3]][0],values[id[3]][1][data.value]);
				configfile.replace("hardware::"+values[id[3]][0]+"::midi_in",values[id[3]][1][data.value]);
			}else if(id[2]=="outport"){
				post("\nwrite outport",values[id[3]][0],values[id[3]][1][data.value]);
				configfile.replace("hardware::"+values[id[3]][0]+"::midi_out",values[id[3]][1][data.value]);
			}else{
				if(id[3]=="channel"){
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::"+id[2]+"::midi_channels["+values[id[4]][1]+"]",data.value);
				}else if(id[3]=="name"){
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::"+id[2]+"::midi["+values[id[4]][1]+"]",data.value);
				}else if(id[3]=="range1"){
					var r=configfile.get("hardware::"+values[id[4]][0]+"::connections::"+id[2]+"::midi_ranges["+values[id[4]][1]+"]");
					r[0] = data.value;
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::"+id[2]+"::midi_ranges["+values[id[4]][1]+"]",r);
				}else if(id[3]=="range2"){
					var r=configfile.get("hardware::"+values[id[4]][0]+"::connections::"+id[2]+"::midi_ranges["+values[id[4]][1]+"]");
					r[1] = data.value;
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::"+id[2]+"::midi_ranges["+values[id[4]][1]+"]",r);
				}else{
					post("\n????\nhw midi:",d,"::",id," -- ",values[id[4]]);	
					var v = values[id[4]];
					post("\nwrote: ","hardware::"+v[0]+"::connections::midi::"+id[2]+"::"+id[3],data.value);
					configfile.replace("hardware::"+v[0]+"::connections::midi::"+id[2]+"::"+id[3],data.value);

				}

			}
		}else{
			post("\n-- id is ",id," -- values[id[2]] is",values[id[2]]);
			var v = values[id[2]];
			post("\nwrote: ","hardware::"+v[0]+"::"+id[1],data.value);
			configfile.replace("hardware::"+v[0]+"::"+id[1],data.value);
		}
	}else if(id[0]=="hardwaretestsignal"){
		dontredraw = 1;
		post("\nsetting matrix",values[id[1]][1]-1,"for row",data.value - 1);
		for(var oo=0;oo<3;oo++) testmatrix.message(oo,values[id[1]][1]-1,0);
		if(data.value>0) for(var oo=0;oo<32;oo++) testmatrix.message(data.value-1,oo,oo==values[id[1]][1]-1);
	}else if(id[0]=="hardwarename"){
		var newname = data.value.toString();
		post("\nrename?");
		if(newname!=values[id[1]]){
			post("\nrenaming ",values[id[1]]," to ",newname);
			var ohw = configfile.get("hardware");
			var ohwk = ohw.getkeys();
			configfile.setparse("hardware","{}");
			for(var o=0;o<ohwk.length;o++){
				var targ;
				if(ohwk[o]!=values[id[1]]){
					targ = ohwk[o];
					// copy
				}else{
					// replace
					targ = newname;
				}
				configfile.setparse("hardware::"+targ,"{}");
				var cd = ohw.get(ohwk[o]);//configfile.get("hardware::"+values[id[1]]);
				if(cd!==null){
					var ck = cd.getkeys();
					if(ck==null)ck=[];
					for(var tc=0;tc<ck.length;tc++){
						if(ck[tc]!=="connections"){
							configfile.replace("hardware::"+targ+"::"+ck[tc].toString(),cd.get(ck[tc]));
							post("\nreplace ","hardware::"+targ+"::"+ck[tc].toString(),cd.get(ck[tc]));
						}
					}
					configfile.setparse("hardware::"+targ+"::connections","{}");
					if(ohw.contains(ohwk[o]+"::connections::in")){
						configfile.setparse("hardware::"+targ+"::connections::in","{}");
						var cd = ohw.get(ohwk[o]+"::connections::in");
						if(cd!==null){
							var ck = cd.getkeys();
							if(ck==null)ck=[];
							for(var tc=0;tc<ck.length;tc++){
								configfile.replace("hardware::"+targ+"::connections::in::"+ck[tc].toString(),cd.get(ck[tc]));
								post("\nreplace ","hardware::"+targ+"::connections::in::"+ck[tc].toString(),cd.get(ck[tc]));
							}
						}
					}
					if(ohw.contains(ohwk[o]+"::connections::out")){
						configfile.setparse("hardware::"+targ+"::connections::out","{}");
						var cd = ohw.get(ohwk[o]+"::connections::out");
						if(cd!==null){
							var ck = cd.getkeys();
							if(ck==null)ck=[];
							for(var tc=0;tc<ck.length;tc++){
								configfile.replace("hardware::"+targ+"::connections::out::"+ck[tc].toString(),cd.get(ck[tc]));
								post("\nreplace ","hardware::"+targ+"::connections::out::"+ck[tc].toString(),cd.get(ck[tc]));
							}
						}
					}
				}
			}
		}
	}else if(id[0]=="add"){
		if(id[1]=="controller"){
			if(id[2]=="colour"){
				configfile.setparse("io::controllers::"+values[id[3]],"{}");
				configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
				configfile.replace("io::controllers::"+values[id[3]]+"::type","midifighter");
				configfile.replace("io::controllers::"+values[id[3]]+"::channel", 1);
			}else if(id[2]=="value"){
				configfile.setparse("io::controllers::"+values[id[3]],"{}");
				configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
				configfile.replace("io::controllers::"+values[id[3]]+"::type","cc");
				configfile.replace("io::controllers::"+values[id[3]]+"::channel", 1);
			}else if(id[2]=="brightness"){
				configfile.setparse("io::controllers::"+values[id[3]],"{}");
				configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
				configfile.replace("io::controllers::"+values[id[3]]+"::type","midifighter");
				configfile.replace("io::controllers::"+values[id[3]]+"::channel", 1);
				configfile.replace("io::controllers::"+values[id[3]]+"::dim", 0);
				configfile.replace("io::controllers::"+values[id[3]]+"::bright", 127);
			}else if(id[2]=="resets"){
				configfile.setparse("io::controllers::"+values[id[3]],"{}");
				configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
				configfile.replace("io::controllers::"+values[id[3]]+"::type","cc");
				configfile.replace("io::controllers::"+values[id[3]]+"::channel", 1);
			}else if(id[2]=="buttons"){
				if(id[3]=="globals"){
					configfile.setparse("io::controllers::"+values[id[4]],"{}");
					configfile.replace("io::controllers::"+values[id[4]]+"::automap_toggle",0);
					configfile.replace("io::controllers::"+values[id[4]]+"::automap_page",1);
				}else{
					configfile.setparse("io::controllers::"+values[id[3]],"{}");
					configfile.replace("io::controllers::"+values[id[3]]+"::first",0);
					configfile.replace("io::controllers::"+values[id[3]]+"::type","cc");
					configfile.replace("io::controllers::"+values[id[3]]+"::channel", 1);
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
					if(!configfile.contains("hardware::"+values[id[4]][0]+"::connections::in")) configfile.setparse("hardware::"+values[id[4]][0]+"::connections::in" , "{ }");
					configfile.setparse("hardware::"+values[id[4]][0]+"::connections::in::hardware" , "{ }");
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
					if(!configfile.contains("hardware::"+values[id[4]][0]+"::connections::out")) configfile.setparse("hardware::"+values[id[4]][0]+"::connections::out" , "{ }");
					configfile.setparse("hardware::"+values[id[4]][0]+"::connections::out::hardware" , "{ }");
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware",["new"]);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels",[0]);
				}
			}else if(id[2]=="midi"){
				post("\nadd midi",id); 
				post(values[id[5]]);
				var d = id[3];
				if(!configfile.contains("hardware::"+values[id[5]][0]+"::connections")) configfile.setparse("hardware::"+values[id[5]][0]+"::connections::"+d,"{ }");
				if(configfile.contains("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi")){
					var tn = configfile.get("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi");
					var tc = configfile.get("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi_channels");
					var tr = configfile.get("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi_ranges");
					tn.push("new");
					tc.push(0);
					tr.push([0,127]);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi",tn);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi_channels",tc);
					var tra=[];
					for(var trt=0;trt<tr.length;trt++) tra.push("*");
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi_ranges",tra);
					for(var trt=0;trt<tr.length;trt++) configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi_ranges["+trt+"]",tr[trt]);
				}else{
					if(!configfile.contains("hardware::"+values[id[5]][0]+"::connections"+d))	configfile.setparse("hardware::"+values[id[5]][0]+"::connections::"+d , "{ }");
					configfile.setparse("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi" , "{ }");
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi",["new"]);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi_channels",[0]);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi_ranges",["*"]);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+d+"::midi_ranges[0]",[0,127]);
				}
				if(!configfile.contains("hardware::"+values[id[5]][0]+"::midi_handler")){
					configfile.replace("hardware::"+values[id[5]][0]+"::midi_handler","generic.hardware.midi.handler");
				}
			}else{
				configfile.setparse("hardware::"+values[id[3]][0],"{}");
				configfile.replace("hardware::"+values[id[3]][0]+"::type", "hardware");
				configfile.replace("hardware::"+values[id[3]][0]+"::substitute" , []);
				configfile.replace("hardware::"+values[id[3]][0]+"::max_polyphony" , 1);
				configfile.replace("hardware::"+values[id[3]][0]+"::help_text" , "about your block");
				configfile.replace("hardware::"+values[id[3]][0]+"::exclusive", 0);
				configfile.replace("hardware::"+values[id[3]][0]+"::click_out",  0);
				configfile.replace("hardware::"+values[id[3]][0]+"::cue_out", 0);
				configfile.replace("hardware::"+values[id[3]][0]+"::talk_in", 0);
				configfile.replace("hardware::"+values[id[3]][0]+"::connections", "{}");
				selected.item=values[id[3]][1];
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
				configfile.remove("io::controllers::"+values[id[2]]);
			}
		}else if(id[1] == "hardware"){
			if(id[2] == "in"){
				var tn = configfile.get("hardware::"+values[id[4]][0]+"::connections::in::hardware");
				var tc = configfile.get("hardware::"+values[id[4]][0]+"::connections::in::hardware_channels");
				tn.splice(values[id[4]][1],1);
				tc.splice(values[id[4]][1],1);
				if(tn.length==0){
					configfile.remove("hardware::"+values[id[4]][0]+"::connections::in::hardware");
					configfile.remove("hardware::"+values[id[4]][0]+"::connections::in::hardware_channels");
				}else{
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::in::hardware",tn);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::in::hardware_channels",tc);
				}
			}else if(id[2]=="out"){
				var tc = configfile.get("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels");
				var tn = configfile.get("hardware::"+values[id[4]][0]+"::connections::out::hardware");
				tn.splice(values[id[4]][1],1);
				tc.splice(values[id[4]][1],1);
				if(tn.length==0){
					configfile.remove("hardware::"+values[id[4]][0]+"::connections::out::hardware");
					configfile.remove("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels");
				}else{
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware",tn);
					configfile.replace("hardware::"+values[id[4]][0]+"::connections::out::hardware_channels",tc);
				}
			}else if(id[2]=="midi"){
				var tr = configfile.get("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi_ranges");
				var tc = configfile.get("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi_channels");
				var tn = configfile.get("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi");
				tc.splice(values[id[5]][1],1);
				tn.splice(values[id[5]][1],1);
				tr.splice(values[id[5]][1],1);
				if(tc.length==0){
					configfile.remove("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi");
					configfile.remove("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi_channels");
					configfile.remove("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi_ranges");
				}else{
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi",tn);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi_channels",tc);
					configfile.replace("hardware::"+values[id[5]][0]+"::connections::"+id[3]+"::midi_ranges",tr);
				}
			}else if(id[2]=="block"){
				configfile.remove("hardware::"+values[id[3]][0]);
				selected.item = -1;
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
	if(dontredraw != 1) render_controls();
}

function deleteall(){
	post("\nremoving ",ii," controls");
	for(;ii>=0;ii--){
		this.patcher.remove(controls[ii]);
	}
	controls=[];
	values=[];
	library_hardware.presentation(0);
	library_controllers.presentation(0);
	latency_test_list.presentation(0);
	latency_test_button.presentation(0);
	latency_test_time.presentation(0); 
	latency_test_text.presentation(0); 
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

function matrix_ext(path){
	if(path.indexOf(":")!=-1) path = path.split(":")[1];
	if(path.indexOf("none")!=-1) path = "none";
	post("\next matrix driver",path);
	configfile.replace("io::matrix::external",path);
}

function matrix_soundcard(path){
	if(path.indexOf(":")!=-1) path = path.split(":")[1];
	if(path.indexOf("none")!=-1) path = "none";
	post("\nsoundcard matrix driver",path);
	configfile.replace("io::matrix::soundcard",path);
}

function special_controller(path){
	if(path.indexOf(":")!=-1) path = path.split(":")[1];
	if(path.indexOf("none")!=-1) path = "none";
	post("\nspecial controller driver",path);
	configfile.replace("io::special_controller",path);
}