outlets = 1;
inlets = 1;
var unit = {
	header : 10,
	row : 22,
	col : 1000
}

var filepath = "";
var config = new Dict;
config.name = "config";
var userconfig = new Dict;
userconfig.name = "userconfig";

var config_descriptions = new Dict;
config_descriptions.name = "config_descriptions";
var config_choices = new Dict;
config_choices.name = "config_choices";

var labels = [];
var buttons = [];
var resets = [];

var y_pos = 10;
var l_i=0; var b_i=0;

function loadbang(){
	config.parse("{}");
	post("\nui preferences editor starting");
	filepath = this.patcher.filepath;
	filepath = filepath.split("/patchers");
	filepath = filepath[0];
	post("\n path is",filepath);
	config.import_json(filepath+"/config.json");
	userconfig.import_json(filepath+"/userconfig.json");
	config_descriptions.import_json(filepath+"/data/config.descriptions.json");
	config_choices.import_json(filepath+"/data/config.choices.json");
	create_ui();
}

function create_ui(){
	c_i = 0;
	// header
	labels[c_i]= this.patcher.newdefault(10, 100+20*c_i, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1], "@fontface", "bold");
	labels[c_i].message("set", "benny ui settings");
	labels[c_i].presentation(1);
	labels[c_i].presentation_rect(10,y_pos,0.7*unit.col-10,20);
	c_i++;
	labels[c_i]= this.patcher.newdefault(10, 100+20*c_i, "comment", "@bgcolor", [1.000, 0.792, 0.000, 1.000], "@textcolor", [0,0,0,1]);
	labels[c_i].message("set", "saved automatically but restart benny for them to take effect");
	labels[c_i].presentation(1);
	labels[c_i].presentation_rect(0.7*unit.col,y_pos,0.3*unit.col,20);
	c_i++;
	y_pos+=unit.row + unit.header;
	var ck = config.getkeys();
	for(var i=0;i<ck.length;i++){
		var ch = config_choices.get(ck[i]);
		if((ch != "DONT")&&(ch != "FOLDER")&&(ch != "FPS")&&(ch != "ORDER_LIST")&&(ch != "FONT")){
			//post("\n"+ck[i]+" - default: "+config.get(ck[i]));
			labels[c_i]= this.patcher.newdefault(10, 100+20*c_i, "comment");
			labels[c_i].message("set", ck[i]);
			labels[c_i].presentation(1);
			labels[c_i].presentation_rect(10,y_pos,0.2*unit.col+10,20);
			c_i++;
	
			var def = config.get(ck[i]);
			var current = def;
			if(userconfig.contains(ck[i])){
				current = userconfig.get(ck[i]);
			}
			/*if(ch == "FOLDER"){
				labels[c_i]= this.patcher.newdefault(10, 100+20*c_i, "comment");
				labels[c_i].message("set", current);
				labels[c_i].presentation(1);
				labels[c_i].presentation_rect(0.3*unit.col,y_pos,0.4*unit.col+10,20);
				c_i++;
				buttons[b_i] = this.patcher.newdefault(50, 100+20*b_i, "textbutton" , "@text",  "set", "@textoncolor", [1.000, 0.792, 0.000, 1.000], "@varname", ck[i]);
				buttons[b_i].listener = new MaxobjListener(buttons[b_i], callback);
				buttons[b_i].presentation(1);
				buttons[b_i].presentation_rect(0.25*unit.col,y_pos,0.05*unit.col,20);
				b_i++;
			}else */if(ch == "ORDER_LIST"){
			}else if(ch == "FPS"){
			}else if(ch == "FONT"){
				labels[c_i]= this.patcher.newdefault(10, 100+20*c_i, "comment");
				labels[c_i].message("set", current);
				labels[c_i].presentation(1);
				labels[c_i].presentation_rect(0.3*unit.col,y_pos,0.4*unit.col+10,20);
				c_i++;
			}else if(ch == "TOGGLE"){
				buttons[b_i] = this.patcher.newdefault(50, 100+20*b_i, "toggle", "@varname", ck[i]);
				buttons[b_i].message("set", current);
				buttons[b_i].listener = new MaxobjListener(buttons[b_i], callback);
				buttons[b_i].presentation(1);
				buttons[b_i].presentation_rect(0.3*unit.col,y_pos,20,20);
				resets[b_i] = this.patcher.newdefault(100,100+20*b_i, "button", "@varname", "reset."+ck[i]);
				resets[b_i].listener = new MaxobjListener(resets[b_i], reset_callback);
				resets[b_i].presentation(1);
				resets[b_i].presentation_rect(unit.col,y_pos,20,20);
				b_i++;
			}else if(Array.isArray(ch)){
				if(ch[0] == "float"){
					buttons[b_i] = this.patcher.newdefault(50, 100+20*b_i, "flonum", "@minimum", ch[1],"@maximum",ch[2], "@varname", ck[i]);
					buttons[b_i].message("set", current);
					buttons[b_i].listener = new MaxobjListener(buttons[b_i], callback);
					buttons[b_i].presentation(1);
					buttons[b_i].presentation_rect(0.3*unit.col,y_pos,0.2*unit.col,20);
					resets[b_i] = this.patcher.newdefault(100,100+20*b_i, "button", "@varname", "reset."+ck[i]);
					resets[b_i].listener = new MaxobjListener(resets[b_i], reset_callback);
					resets[b_i].presentation(1);
					resets[b_i].presentation_rect(unit.col,y_pos,20,20);
					b_i++;
				}else if(ch[0] == "int"){
					buttons[b_i] = this.patcher.newdefault(50, 100+20*b_i, "number", "@minimum", ch[1],"@maximum",ch[2], "@varname", ck[i]);
					buttons[b_i].message("set", current);
					buttons[b_i].listener = new MaxobjListener(buttons[b_i], callback);
					buttons[b_i].presentation(1);
					buttons[b_i].presentation_rect(0.3*unit.col,y_pos,0.2*unit.col,20);
					resets[b_i] = this.patcher.newdefault(100,100+20*b_i, "button", "@varname", "reset."+ck[i]);
					resets[b_i].listener = new MaxobjListener(resets[b_i], reset_callback);
					resets[b_i].presentation(1);
					resets[b_i].presentation_rect(unit.col,y_pos,20,20);
					b_i++;
				}else{
					buttons[b_i] = this.patcher.newdefault(10,  100+20*b_i, "umenu", "@varname", ck[i]);
					for(ii=0;ii<ch.length;ii++){
						buttons[b_i].message("append",ch[ii]);	
					}
					buttons[b_i].message("set", ch.indexOf(current));
					buttons[b_i].listener = new MaxobjListener(buttons[b_i], callback);
					buttons[b_i].presentation(1);
					buttons[b_i].presentation_rect(0.3*unit.col,y_pos,0.2*unit.col,20);
					resets[b_i] = this.patcher.newdefault(100,100+20*b_i, "button", "@varname", "reset."+ck[i]);
					resets[b_i].listener = new MaxobjListener(resets[b_i], reset_callback);
					resets[b_i].presentation(1);
					resets[b_i].presentation_rect(unit.col,y_pos,20,20);
					b_i++;
				}
			}
	
			if(config_descriptions.contains(ck[i])){
				var desc = config_descriptions.get(ck[i]);
				if(typeof desc === "string"){
					var l = Math.ceil((20+desc.length) / 70);
					labels[c_i]= this.patcher.newdefault(10, 100+20*c_i, "comment");
					labels[c_i].message("set", config_descriptions.get(ck[i])+"                                                          ");
					labels[c_i].presentation(1);
					labels[c_i].presentation_rect(10+0.5*unit.col,y_pos,0.5*unit.col-40,50+20*l);
					c_i++;
					y_pos+=unit.row*(l-1);
				}
			}

			if(i==0){
				labels[c_i]= this.patcher.newdefault(10, 100+20*c_i, "comment");
				labels[c_i].message("set", "reset to default >");
				labels[c_i].presentation(1);
				labels[c_i].presentation_rect(0.9*unit.col,y_pos,0.1*unit.col,20);
				c_i++;
			}

			y_pos+=unit.row;

			y_pos+=unit.header;
		}
	}
}

function callback(data){
	//post("\ncallback",data.value,data.maxobject.varname);
	var ch = config_choices.get(data.maxobject.varname);
	if(ch=="FOLDER"){
		error("\nnot implemented yet");
	}else if(ch=="TOGGLE"){
		if(data.value != config.get(data.maxobject.varname)){
			userconfig.replace(data.maxobject.varname,data.value);
		}else if(userconfig.contains(data.maxobject.varname)){
			userconfig.remove(data.maxobject.varname);
		}
	}else if(ch=="ORDER_LIST"){
		
	}else if(Array.isArray(ch)){
		if(ch[0]=="float"){
			if(data.value != config.get(data.maxobject.varname)){
				userconfig.replace(data.maxobject.varname,data.value);
			}else if(userconfig.contains(data.maxobject.varname)){
				userconfig.remove(data.maxobject.varname);
			}
		}else if(ch[0]=="int"){
			if(data.value != config.get(data.maxobject.varname)){
				userconfig.replace(data.maxobject.varname,data.value);
			}else if(userconfig.contains(data.maxobject.varname)){
				userconfig.remove(data.maxobject.varname);
			}
		}else{
			if(data.value != config.get(data.maxobject.varname)){
				userconfig.replace(data.maxobject.varname,ch[data.value]);
			}else if(userconfig.contains(data.maxobject.varname)){
				userconfig.remove(data.maxobject.varname);
			}
		}
	}
	save_userconfig();
}

function reset_callback(data){
	if(data.value==0){
		var t = data.maxobject.varname;
		t = t.split("eset.")[1];
		if(userconfig.contains(t)){
			for(var i=0;i<buttons.length;i++){
				if(buttons[i].varname == t){
					buttons[i].message("set",config.get(t));
				}
			}
			userconfig.remove(t);
			save_userconfig();
		}
	}
}

function save_userconfig(){
	userconfig.writeagain();//(filepath+"/userconfig.json");
	post("\nsaving userconfig.json");
	messnamed("to_blockmanager","process_userconfig");
	messnamed("to_blockmanager","read_settings_from_config");
	messnamed("to_blockmanager","request_redraw",4);
}