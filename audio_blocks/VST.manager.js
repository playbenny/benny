outlets = 1;
setoutletassist(0,"output");
var projectpath;

var MAX_GROUPS=4;

var block_name="none";
var plugin_name;
var paramcount;
var groups = new Array(MAX_GROUPS);
var group_colours = new Array(MAX_GROUPS); //set each to -1 if colour disabled
var group_height = new Array(MAX_GROUPS);
var plugin_type;

var new_blockfile = new Dict;
new_blockfile.name = "new_blockfile";
var paramnames = new Dict;
paramnames.name = "parameter_names";
var paramdefaults = new Dict;
paramdefaults.name = "parameter_values";

var blocktypes = new Dict;
blocktypes.name = "blocktypes";

var maxmin = new Dict;
maxmin.name = "parameter_maxmin";

var pbendr = 2;
var ups = 1;

function grp_colour(group,r,g,b){
	group_colours[group]=[r,g,b];
}

function grp_height(group,h){
	group_height[group]=h;
}

function pbendrange(r){
	pbendr = r;
}
function oversample(r){
	ups = Math.pow(2,r);
}

function group_contents(g){
	var a = arrayfromargs(messagename, arguments);
	var cont = new Array();
	var i;
	if(block_name != "none"){
		if(a.length>2){
			for(i=0;i<a.length-2;i++) cont[i]=a[i+2];		
			//			new_blockfile.replace(block_name+"::groups["+g+"]::contents",cont);
			//post(cont.length,cont);
			//if(cont.length>1){
				groups[g] = cont;
				post("\ngroup",g,"contents",cont);
			//}else{
			//	groups[g] = [cont[0],cont[0]];
				//post(groups[g]);
			//}
		}
	}	
}

function plug_name(name){
	plugin_name = name;
}

function blck_name(name){
	var s1 = name;
	var s2 = s1.toLowerCase();
	var last="";
	var nxt="";
	var segl=0;
	var result="";
	for(var i=0; i<s1.length; i++){
 		if((s1[i]!==s2[i])&&(last!=".")&&(segl>3)){
			segl=0;
 			result = result +'£' +s1[i];
			last=".";
		}else{
			if(s1[i]==".") segl=0;
			segl++;
 			result = result + s1[i];
			last=s1[i];
		}
	}
	var rsplit = result.split("£");
	if(rsplit.length==1){
		block_name = result;
	}else{
		block_name = rsplit[0];
		for(i=1;i<rsplit.length;i++){
			last = rsplit[i-1].split(".");
			nxt = rsplit[i].split(".");
			segl = last[last.length-1].length+nxt[0].length;
			if((segl<=8)&&(last[last.length-1] != "vst")){
				//merge
				block_name += rsplit[i];
			}else{
				block_name += "." + rsplit[i];
			}	
		}
	}
	post("\nblock name is",block_name);
}

function plug_type(type){
	plugin_type = type;
	if(block_name!="none"){
		
	}
}

function num_params(num){
	paramcount = num;
}

function scan_check(type, name){
	var r = check_exists(name);
	if(r == 0){
		r = check_library(name);
		if(r == 1){
			copy_from_library(name);
		}
	}
	outlet(0, "exists", r, type, name); //1 if it exists or was copied from lib
}

function copy_from_library(name){
	post(" copied from library");
	var bucket = new Dict;
	bucket.import_json(projectpath+"/data/vst_library/vst."+name+".json");
	bucket.export_json(projectpath+"/audio_blocks/vst."+name+".json");
}

function check_exists(name){
	/*post("\nlooking for:",projectpath+"audio_blocks/vst."+name+".json ");
	var testfile = new File(projectpath+"audio_blocks/vst."+name+".json");
	if(testfile.isopen){
		post("\n",name," configured OK");
		testfile.close();
		testfile.freepeer();
		return 1;
	}else{
		//post("NO");
		testfile.close();
		testfile.freepeer();
		return 0;
	}*/
	var k = blocktypes.getkeys();
	var f = 0;
	for(var i=0;i<k.length;i++){
		if(blocktypes.contains(k[i]+"::plugin_name")){
			if(blocktypes.get(k[i]+"::plugin_name")==name){
				f=1;i=999999;
			}
		}
	}
	if(f==1){
		post("\n",name," configured OK");
		return 1;
	}else{
		post("\n",name," NOT FOUND");
		return 0;
	}
}

function check_library(name){
	//post("\nlooking for:",projectpath+"data/vst_library/vst."+name+".json ");
	var testfile = new File(projectpath+"data/vst_library/vst."+name+".json");
	if(testfile.isopen){
		post("\n",name," found in library");
		testfile.close();
		testfile.freepeer();
		return 1;
	}else{
		post("\n",name," not yet configured");
		testfile.close();
		testfile.freepeer();
		return 0;
	}
}

function scan_for_amxd_configs(){
	var f = new Folder(projectpath+"audio_blocks");
	
	f.reset();
	while (!f.end) {
		if(f.extension == ".json"){
			var t = f.filename;
			t = t.split('.')[0];
			if(t=="amxd"){
				post("\n  existing amxd config: "+f.filename);
				outlet(0, "exists", 1, "amxd", f.filename); //1 if it exists or was copied from lib
			}
		}
		f.next();
	}
	f.close();
}

function scan_for_amxds(path){

}

function transfer_params_and_defaults(){
	var i,name,def;
	//var paramdetails = new Array();
	var orthogonal = 2; //if >0 then like hardware blocks this has 2 voices, 
				// one for left one for right inputs/outputs, so it works with the
				// spread fn etc. if = 0 then behaves as before and lets you stack
				// voices of a vst.
	new_blockfile.parse('{}');
	if(plugin_type == "amxd"){
		new_blockfile.parse(block_name +': { "patcher" : "amxd.loader" }'); 
	}else{
		new_blockfile.parse(block_name +': { "patcher" : "vst.loader" }'); 
	}
	new_blockfile.replace(block_name + "::type","audio");
	new_blockfile.replace(block_name + "::help_text", plugin_name);
	new_blockfile.replace(block_name + "::block_ui_patcher","blank.ui");
	new_blockfile.replace(block_name + "::max_polyphony", 0 /*orthogonal*/); //if this is 0 then 
	new_blockfile.replace(block_name + "::plugin_name",plugin_name);
	new_blockfile.replace(block_name + "::plugin_type",plugin_type);
	new_blockfile.replace(block_name + "::pitchbend_range",pbendr);
	new_blockfile.replace(block_name + "::upsample", ups);
	var conns = new Dict;
	if(orthogonal==0){
		conns.parse('{ "in" : { "audio" : [ "L", "R" ] , "midi" : [ "notes in", "pitchbend", "modulation", "aftertouch", "sustain" ] } , "out" : { "audio" : [ "L", "R" ] }  }');
		new_blockfile.replace(block_name + "::subvoices",1);
	}else{
		new_blockfile.replace(block_name + "::subvoices",2);
		conns.parse('{ "in" : { "audio" : [ "audio in" ] , "midi" : [ "notes in", "pitchbend", "modulation", "aftertouch", "sustain"  ] } , "out" : { "audio" : [ "audio out" ], "midi" : [ "notes out" ], "parameters" : [ "pitchbend", "modulation", "aftertouch", "sustain" ] }  }');		
	}
	new_blockfile.replace(block_name + "::connections",conns);
	new_blockfile.replace(block_name + "::parameters", "A");
	for(i=0;i<paramcount;i++){
		name = paramnames.get(i);
		def = paramdefaults.get(i+1);
		if(Array.isArray(def)) def = def[0];
		if(i>0) new_blockfile.append(block_name+"::parameters", "B");
		new_blockfile.setparse(block_name+'::parameters['+i+']', ' { "name" : "'+name+'"}');//' , "default" : '+def+' , "type" : "float", "values" : ["uni",0,1,"lin"]');
		new_blockfile.replace(block_name + "::parameters["+i+"]::default",def);
		new_blockfile.replace(block_name + "::parameters["+i+"]::type","float");
		new_blockfile.replace(block_name + "::parameters["+i+"]::wrap",0);
		if(plugin_type == "amxd"){
			var mm = maxmin.get(i+1);
			var pol = "uni";
			if(+mm[1]==-mm[0]) pol = "bi";
			new_blockfile.replace(block_name + "::parameters["+i+"]::values", pol, mm[1],mm[0], "lin");
		}else{
			new_blockfile.replace(block_name + "::parameters["+i+"]::values", "uni", 0,1, "lin");
		}
	}
	if(groups[0].length == 0){
		post("cannot save file with empty first group\n");
		return -1;
	}
	new_blockfile.replace(block_name + "::groups",'A');
	for(i=1;i<MAX_GROUPS;i++){
		if(groups[i].length!=0){
			new_blockfile.append(block_name + "::groups",'B');
		}
	}
	var t=0;
	for(i=0;i<MAX_GROUPS;i++){
		if(groups[i].length!=0){
			if(groups[i][0]!=-1){
				new_blockfile.setparse(block_name+'::groups['+t+']', ' { "height" : '+group_height[i]+'}');
				if(group_colours[i][0]!=-1) new_blockfile.replace(block_name + "::groups["+t+"]::colour",group_colours[i]);
				if(group_height[i]!=-1) new_blockfile.replace(block_name + "::groups["+t+"]::contains",groups[i]);
				t++;
			}else{
				new_blockfile.remove(block_name+"::groups["+t+"]");
			}
		}
	}
}

function loadbang(){
	var i;
	for(i=0;i<MAX_GROUPS;i++){
		groups[i] = new Array();
		group_height[i] = 1;
		group_colours[i] = [-1,-1,-1];
	}
	var path = this.patcher.filepath;
	projectpath = path.split("audio_blocks/");
	projectpath = projectpath[0];
	post("\npath is",projectpath);
	scan_for_amxd_configs();
}