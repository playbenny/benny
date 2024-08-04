function read_songs_folder(folder_name_or_path){ //also loads all song json files, and constructs the wave preload list.
	//clears, builds the list for this specific folder, and updates the songs dict

	if(folder_name_or_path=="songs"){
		var f = new Folder(SONGS_FOLDER);
		var df = 0;
	}else if(folder_name_or_path == "templates"){
		var f = new Folder(TEMPLATES_FOLDER);
		var df = 1;
	}else{
		var f = new Folder(folder_name_or_path);
		var df = 2;
	}
	post("\nreading songs from folder: ",folder_name_or_path);
	f.reset();
	if(df==0) songlist[0] = [];
	if(df==1) songlist[1] = [];
	var fpath = f.pathname;
	var i=0, tss;
	if(!Array.isArray(songs_moddate[df])) songs_moddate[df] = [];
	if(fpath[fpath.length-1] !== "/" ) fpath = fpath+"/";
	while(!f.end){
		if(f.extension == ".json"){
			/*ts = f.filename.split(".");
			tss = "";
			for(var t=0;t<ts.length-1;t++){
				tss = tss + ts[t];
				if(t>0) tss = tss + ".";
			}*/
			tss = f.filename.split(".json")[0];
			var tsd = f.moddate.toString();
			if(df<2) songlist[df][i] = tss;
			if(songs.contains(tss)){
				if(tsd!=songs_moddate[df][i]) songs.remove(tss);
			}
			if(!songs.contains(tss)){
				songs_moddate[df][i] = tsd;
				song.import_json(fpath+f.filename);
				copy_song_to_songs_dict(tss);
				post("\npreloaded songfile:",f.filename);
			}
			i++;
		}
		f.next();
	}
	f.close();


	if((preload_list.length == 0) && (df<2)){
		var blocktypes_count_cumulative = new Dict;
		for(var i=0;i<songlist[df].length;i++){
			var blocktypes_count_this = new Dict;
			if(songs.contains(songlist[df][i]+"::waves")){
				var ws=songs.getsize(songlist[df][i]+"::waves");
				for(var t=0;t<ws;t++){
					var pat = songs.get(songlist[df][i]+"::waves["+t+"]::path");
					var nam = songs.get(songlist[df][i]+"::waves["+t+"]::name");
					if(pat!=null){
						preload_list.push([pat,nam,songlist[df][i]+"::waves["+t+"]::"]);
						//polybuffer_load_wave(pat,nam);
					}
				}
			}
			var bc=0, vc_n=0, vc_a=0, vc_h=0;
			if(songs.contains(songlist[df][i]+"::blocks")){
				var bs=songs.getsize(songlist[df][i]+"::blocks");
				for(var t=0;t<bs;t++){
					if(songs.contains(songlist[df][i]+"::blocks["+t+"]::type")){
						bc++;
						var ty = songs.get(songlist[df][i]+"::blocks["+t+"]::type");
						var vc = songs.get(songlist[df][i]+"::blocks["+t+"]::poly::voices");
						if(songs.contains(songlist[df][i]+"::blocks["+t+"]::subvoices")){
							var sb=songs.get(songlist[df][i]+"::blocks["+t+"]::subvoices");
							if(sb>1) vc/=sb;
						}
						var nam = songs.get(songlist[df][i]+"::blocks["+t+"]::name");
						if(ty=="note"){
							vc_n += vc;
							if(blocktypes_count_this.contains("note::"+nam)){
								var tn = blocktypes_count_this.get("note::" + nam);
								blocktypes_count_this.replace("note::" + nam, vc+tn);
							}else{
								blocktypes_count_this.replace("note::" + nam, vc);
							}
						}else if(ty=="audio"){
							vc_a += vc;
							if(blocktypes_count_this.contains("audio::"+nam)){
								var tn = blocktypes_count_this.get("audio::" + nam);
							}else{
								blocktypes_count_this.replace("audio::" + nam, vc);
							}
						}else if(ty="hardware"){
							vc_h += vc;
						}
					}
				}
			}
			songs_info[i]=[bc,vc_n,vc_a,vc_h];
			var td = blocktypes_count_this.get("note");
			if(td!=null){
				var tdk = td.getkeys();
				for(var t=0;t<tdk.length;t++){
					var c = td.get(tdk[t]);
					var e = 0;
					if(blocktypes_count_cumulative.contains("note::"+tdk[t]))e = blocktypes_count_cumulative.get("note::"+tdk[t]);
					if(c>e){
						blocktypes_count_cumulative.replace("note::"+tdk[t],c);
						for(tt=e;tt<c;tt++) preload_note_voice_list.push(tdk[t]);
					}
				}
			}
			var td = blocktypes_count_this.get("audio");
			if(td!=null){
				var tdk = td.getkeys();
				for(var t=0;t<tdk.length;t++){
					var c = td.get(tdk[t]);
					var e = 0;
					if(blocktypes_count_cumulative.contains("audio::"+tdk[t]))e = blocktypes_count_cumulative.get("audio::"+tdk[t]);
					if(c>e){
						blocktypes_count_cumulative.replace("audio::"+tdk[t],c);
						for(tt=e;tt<c;tt++) preload_audio_voice_list.push(tdk[t]);
					}
				}
			}
		}
		post("\npreload lists prepared: ",preload_note_voice_list.length,"note blocks and",preload_audio_voice_list.length,"audio blocks.");
		//note_patcherlist = preload_note_voice_list.slice(0,MAX_NOTE_VOICES);
		//audio_patcherlist = preload_audio_voice_list.slice(0,MAX_AUDIO_VOICES);
		//still_checking_polys |= 3;
	}
}

function copy_song_to_songs_dict(tss) {
	var songkeys = song.getkeys();
	for (var k in songkeys) {
		//post(songkeys[k]);
		if (k == 0) {
			songs.setparse(tss + "::" + songkeys[k]);
		} else {
			songs.setparse(tss + "::" + songkeys[k], "*");
		}
		var typ = song.gettype(songkeys[k]);
		var typ2 = "";
		if (typ == "array") {
			typ2 = song.gettype(songkeys[k] + "[0]");
			//						post("FIRST ELEMENT TYPE",typ2);
		}
		if (typ2 == "dictionary") {
			//have to iterate through the outer array
			var siz = song.getsize(songkeys[k]);
			for (var kk = 0; kk < siz; kk++) {
				if (kk == 0) {
					songs.append(tss + "::" + songkeys[k]);
				} else {
					songs.append(tss + "::" + songkeys[k], "*");
				}
				songs.setparse(tss + "::" + songkeys[k] + "[" + kk + "]", "*");
				songs.replace(tss + "::" + songkeys[k] + "[" + kk + "]", song.get(songkeys[k] + "[" + kk + "]"));
			}
		} else {
			songs.replace(tss + "::" + songkeys[k], song.get(songkeys[k]));
		}
	}
}

function preload_all_waves(){
	if(usermouse.ctrl){
		waves_preloading = 0;
		preload_task.freepeer();
		post("\nAborting wave preload task because ctrl was held.");
		return 0;
	} 
	if(!waves_preloading) preload_list = [];
	if(preload_list.length>0){
		var t = preload_list.pop();
		post("\n preloading wave",t[1]);
		if(polybuffer_load_wave(t[0],t[1],t[2])==-1){
			preload_task.schedule(100);
		}else{
			preload_task.schedule(10);
		}
	}else{
		post("\nPreload waves complete. Number of items in the waves polybuffer:", waves_polybuffer.count); 
		post("Memory used in the waves polybuffer:", waves_polybuffer.size/1048576, "MB\n"); 
		preload_task.freepeer();
	}
}


function preload_some_wires(){
	if(preload_wires_counter < MAX_BLOCKS){
		var c = preload_wires_counter++;
		if(!Array.isArray(wires[c]))wires[c] = [];
		var segment = wires[c].length;
		for(;segment<MAX_BEZIER_SEGMENTS;segment++){
			if(typeof wires[c][segment] === 'undefined') {
				wires[c][segment] = new JitterObject("jit.gl.gridshape","benny");
				wires[c][segment].shape = "plane";
				wires[c][segment].name = "wires£"+c+"£"+segment;
				wires[c][segment].dim = [2,2];
				wires[c][segment].enable = 0;
				wires[c][segment].scale = [0,0,0];
			}else{post("\nsurprise in wire pre-instantiate task");}
		}
		preload_task2.schedule(100);
	}else{
		post("\ncompleted pre-instantiating wire polygons")
		preload_task2.freepeer();
	}
}

function create_blank_wave_buffer(number,length, channels,name){
	polybuffer_create_blank(length,channels);
	get_polybuffer_info();
	var buffername = "waves."+polybuffer_names.length;
	waves_buffer[number]= new Buffer(buffername);
	post("length",waves_buffer[number].length(),waves_buffer[number].framecount(),waves_buffer[number].channelcount(),"name",name,buffername);
	var d = new Dict;
	d.name = "temp";
	//if(number>waves_dict.getsize("waves")) 
	//	waves_dict.append("waves","*");
	d.replace("name",name+"$"+length+"$"+channels);
	d.replace("path","");
	d.replace("length",waves_buffer[number].framecount());
	d.replace("size",waves_buffer[number].length());
	d.replace("channels",waves_buffer[number].channelcount());
	d.replace("samplerate",waves_buffer[number].framecount()/waves_buffer[number].length());
	d.replace("start",0);
	d.replace("end",1);
	d.replace("divisions",0);
	d.replace("buffername",buffername);
	waves_dict.replace("waves["+number+1+"]",d);
	
	draw_wave[number] = new Array(2*waves_buffer[number].channelcount());
	for(var i=0;i<waves_buffer[number].channelcount();i++){
		var t=0;
		var ii=i*2;
		draw_wave[number][ii]=new Array((mainwindow_width/2)|0);
		draw_wave[number][ii+1]=new Array((mainwindow_width/2)|0);
		while(t<mainwindow_width/2){
			draw_wave[number][ii][t]=1;
			draw_wave[number][ii+1][t]=-1;
			t++;
		} 
	}
	redraw_flag.flag |= 4;
	store_wave_slices(number+1);
	waves.age[number]=++waves.seq_no;
}

function polybuffer_create_blank(length,channels){
	waves_polybuffer.appendempty(length,channels);
	get_polybuffer_info();
}


function check_exists(filepath){
	var testfile = new File(filepath);
	if(testfile.isopen){
		post(/*"\n",filepath,*/" found OK");
		testfile.close();
		testfile.freepeer();
		return 1;
	}else{
		post("NOT FOUND");
		testfile.close();
		testfile.freepeer();
		return 0;
	}
}

function polybuffer_load_wave(wavepath,wavename,dictpath){ //loads wave into polybuffer if not already loaded.
	if(wavename.split("$")[0] == "unsaved.looper"){ //creates a blank buffer if a looper block needs one
		var length = wavename.split("$")[1];
		var channels = wavename.split("$")[2];
		if(typeof length != 'number') length = 1000000;
		if(typeof channels != 'number') channels = 2;
		waves_polybuffer.appendempty(length,channels);
		get_polybuffer_info();
		return -1;
	}else{
		var exists=-1;
		for(var i=0;i<polybuffer_names.length;i++){
			if(polybuffer_names[i] == wavename){
				exists=i;
			}
		}
		if(exists==-1){
			if(check_exists(wavepath)){
				waves_polybuffer.append(wavepath);
				//post("\n(loading)")
				get_polybuffer_info();
				return -1;
			}else{
				var pathonly = wavepath.split(wavename)[0];
				var last_slash = pathonly.split("/");
				var last_folder = last_slash.pop();
				last_folder = last_slash.pop();
				var up_one = pathonly.split(last_folder)[0];
				for(var s=0;s<waves_search_paths.length;s++){
					if(waves_search_paths[s]==up_one){
						up_one = null;
						s=999;
					}
				}
				if(up_one != null) waves_search_paths.push(up_one);
				post("\nnot found in the same location as the save file, searching");
				//post(", trying search paths:",waves_search_paths);
				var r = -1;
				for(var s=0;s<=waves_search_paths.length;s++){
					post(".");
					if(s==waves_search_paths.length){
						//prompt the user to find this file
						post("\n\n\n\nCOULD NOT FIND WAVE:",wavepath,wavename);
						post("\nPLEASE FIND IT (or a replacement!) IN THE FILE DIALOG BOX THAT HAS POPPED UP");
						//if(preload_list.length>0){
							preload_list.push([wavepath,wavename,dictpath]); //put this one back on the preload list
							preload_task.freepeer(); //pause preloading
						//}
						messnamed("open_wave_dialog",wavename);
					}
					r = search_for_waves(waves_search_paths[s],wavename,dictpath);
					if(r!=-1){
						//post("\nfound something!",r);
						s=99999;
					}
				}
				if(r==-1)post("\nCOULD NOT FIND WAVE:",wavepath,wavename);
			}
		}else{
			post("[cache hit",exists,"]");
			return exists;
		}
	}
}

function open_wave_dialog(wavepath){
	post("\nyou chose",wavepath);
	var wavename = wavepath.split("/").pop();
	post("\n name", wavename);
	var addpath = wavepath.split(wavename)[0];
	post("\n path", addpath);
	waves_search_paths = [addpath];
	//polybuffer_load_wave(wavepath,wavename);
	var pll = preload_list.length-1;
	songs.replace(preload_list[pll][2]+"path",wavepath+wavename);
	songs.replace(preload_list[pll][2]+"name",wavename);
	post("\nreplaced dict entry"+preload_list[pll][2]+"path with ",wavepath);
	preload_task = new Task(preload_all_waves, this);
	preload_task.schedule(100);
}

function search_for_waves(path,wavename,dictpath){
	var ext = "."+wavename.split(".").pop();
	//post("\nsearching:",path,"for",wavename,"type",ext);
	var f = new Folder(path);
		
	f.reset();
	while (!f.end) {
		if(f.extension == ext){
			//post("\n  "+f.filename);
			if(f.filename==wavename){
				post("found it! in ",path);
				f.close();
				if((dictpath!=null)&&(path!=songs.get(dictpath+"path"))){
					songs.replace(dictpath+"path",path+wavename);
					songs.replace(dictpath+"name",wavename);
					post("\nreplaced dict entry"+dictpath+"path with ",path);	
				}
				return path;
			}
		}else if(f.filetype == "fold"){
			var addf=path+f.filename;
			for(var i=0;i<waves_search_paths.length;i++) if(waves_search_paths[i]==addf){ addf=null; i=9999; }
			if(addf!=null){
				waves_search_paths.push(path+f.filename);
				//post("\nadded folder"+addf+"to search path");
			}
		}/*else{
			post("\n--",f.filename,"--",f.filetype,"---",f.extension);
		}*/
		f.next();
	}
	f.close();

	return -1;
}

function get_polybuffer_info(){
	var t = waves_polybuffer.dump();
	if(Array.isArray(t)){
		for(var i=0;i<t.length/6;i++){
			polybuffer_names[i] = t[6*i+2];
			polybuffer_lengths[i] = t[6*i+3];
			polybuffer_samplerates[i] = t[6*i+5];
			polybuffer_channels[i] = t[6*i+4];
		}
	}
	messnamed("update_wave_colls","bang");
	//>> TODO send polybuffer into to other blocks?
}

//max calls this once a buffer is loaded
function buffer_loaded(number,path,name,buffername){
	waves_buffer[number]= new Buffer(buffername);
	post("buffer",number,"has loaded into polyslot",number,/*path,buffername);
	post("length",waves_buffer[number].length(),waves_buffer[number].framecount(),waves_buffer[number].channelcount(),*/"name",name);
	var tn=+number+1;
	var exists=0;
	if(waves_dict.contains("waves["+tn+"]::name")){
		if(waves_dict.get("waves["+tn+"]::path")==path){
			//post("not overwriting existing wave info in dictionary");
			exists=1;
		}else{
			post("\npath doesn't match so overwriting",waves_dict.get("waves["+tn+"]::path"),path);
		}
	}
	if(!exists){
		var d = new Dict;
		d.name = "temp";
		//if(number>waves_dict.getsize("waves")) 
		//	waves_dict.append("waves","*");
		d.replace("name",name);
		d.replace("path",path);
		d.replace("length",waves_buffer[number].framecount());
		d.replace("size",waves_buffer[number].length());
		d.replace("channels",waves_buffer[number].channelcount());
		d.replace("samplerate",waves_buffer[number].framecount()/waves_buffer[number].length());
		d.replace("start",0);
		d.replace("end",1);
		d.replace("divisions",0);
		d.replace("buffername",buffername);
		waves_dict.replace("waves["+tn+"]",d);
		tn++;
	}
	draw_wave[number] = new Array(2*waves_buffer[number].channelcount());
	for(var i=0;i<waves_buffer[number].channelcount();i++){
		var t=0;
		var ii=2*i;
		draw_wave[number][ii]=new Array((mainwindow_width/2)|0);
		draw_wave[number][ii+1]=new Array((mainwindow_width/2)|0);
		while(t<mainwindow_width/2){
			draw_wave[number][ii][t]=1;
			draw_wave[number][ii+1][t]=-1;
			t++;
		} 
	}
	if(displaymode=="waves") redraw_flag.flag |= 4;
	store_wave_slices(tn);
	waves.age[number]=++waves.seq_no;
	messnamed("update_wave_colls","bang");
	messnamed("wave_updated",number+1);
}

function load_next_song(slow){
	if(loading.progress!=0) return 0;
	var oc = usermouse.ctrl;
	usermouse.ctrl = slow;
	currentsong++;
	if(currentsong<0)currentsong=0;
	if(currentsong==songlist[0].length)currentsong=0;
	post("\nload next song: ", currentsong, songlist[0][currentsong]);
	load_song();
	usermouse.ctrl = oc;
}

function load_song(){
	if(currentsong<0) return -1;
	var df = (sidebar.files_page == "templates")|0;
	if(playing) play_button();
	meters_enable = 0;
	clear_everything();
	loading.merge = 0;
	loading.progress=-1;
	loading.mute_new=0;
	loading.bundling=16;
	loading.wait=1;
	loading.hardware_substitutions_occured = 0;
	loading.songname = songlist[df][currentsong];
	if(usermouse.ctrl){
		loading.bundling=1;
		loading.wait=20;
		if(usermouse.shift)loading.wait=2;
		post("\n\nTROUBLESHOOTING SLOW LOAD MODE\n\n");
	}
	import_song();
}

function merge_song(){
	meters_enable = 0;
	loading.progress=-1;
	loading.merge = 1;
	if(playing){
		loading.mute_new=1;
		loading.bundling=2;
	}else{
		loading.mute_new=0;
		loading.bundling=4;
	}
	//loading.wait=2;
	var df = (sidebar.files_page == "templates")|0;
	loading.songname = songlist[df][currentsong];
	song_select.previous_name = song_select.current_name;
	song_select.previous_blocks = song_select.current_blocks.slice();
	song_select.current_name = songlist[df][currentsong];
	song_select.current_blocks = [];
	song_select.show = 1;
	if(MERGE_PURGE>0) purge_muted_trees();
	import_song(songlist[df][currentsong]);
}

// this fn is called repeatedly, at each call it loads a bit more song, then sets a flag
// so it'll be called again next frame. this way it doesn't make the music glitch!
function import_song(){	
	var b,i,t;
	preload_task.cancel();
	//post("\nimport-displaymode is",displaymode);
	if(loading.progress==-1){
		//set_display_mode("loading");
		if(output_looper_active){
			post("\noutput looper is active so i should be setting it to fullscreen but i wont");
			// set_display_mode("custom_fullscreen",output_looper_block+1);
			clear_screens();
			set_sidebar_mode("none");
//			set_display_mode("blocks");
		}else{
			clear_screens();
			set_sidebar_mode("none");
		}
		set_display_mode("blocks");
		post("\nloading from song",loading.songname);
		loading.mapping = []; //loading.mapping[x] = the new blockno that block x has become
		var thisblock,block_name;
		state_fade.lastcolour = [0,0,0];
		clear_blocks_selection();
		// clear_screens();
		// merge sequence goes like this then
		//  - read blocks one by one
		//     - if hardware or exclusive type block look to see if already deployed and allocate as replacement
		//     - otherwise just allocate to first free block
		// ABSTRACT THIS OUT INTO A 'LOAD BLOCK' FN SO YOU CAN ACCOMODATE DIFFERENT MERGE/LOAD STYLES
		//    - load into poly
		//    - copy over parameters
		//    - copy over other data?
		//  = work through connections one by one, reassigning the to/from values, creating each connection
		//  - copy states dict over, reassigning blocknos using the loading.mapping

		//first calculate min max x for the existing and incoming patches
		var current_x_max=-999;
		var new_x_min=999;
		var tx;
		for(b=0;b<MAX_BLOCKS;b++){
			if(blocks.contains("blocks["+b+"]::name")){
				tx=blocks.get("blocks["+b+"]::space::x");
				if(tx>current_x_max) current_x_max=tx;
			}
			if(songs.contains(loading.songname+"::blocks["+b+"]::name")){
				tx=songs.get(loading.songname+"::blocks["+b+"]::space::x");
				if(tx<new_x_min) new_x_min=tx;
			}
		}
		loading.xoffset = 0;
		loading.wave_paramlist = [];
		loading.mutelist = [];
		loading.purgelist = [];
		if(current_x_max>-999){
			loading.xoffset = current_x_max + 4 - new_x_min;
		}
		/*if(songs.contains(loading.songname+"::notepad")){ //TODO - it should swap topbar for progress meter, clear the songlist and write out the notes in its place
			post("\n\n\nSONG NOTES\n\n"+songs.get(loading.songname+"::notepad"));
		}*/
		loading.conncount = songs.getsize(loading.songname+"::connections");
		loading.progress++;
		loading.ready_for_next_action=loading.wait;//loading.bundling;
	}else if(loading.progress<MAX_BLOCKS){
		if(loading.progress == 0){
			if(songs.contains(loading.songname+"::waves")){
				build_wave_remapping_list(loading.songname);
				post("\nloading waves, size",songs.getsize(loading.songname+"::waves"));
				for(i=0;i<songs.getsize(loading.songname+"::waves");i++){
					var ii=i+1;
					if(songs.contains(loading.songname+"::waves["+ii+"]::path")){
						t = waves.remapping[i];
						if(t==-1)t=i;
						var tt = t+1;
						//post("\n loading song wave"+i+" into slot "+t+" its path is "+songs.get(loading.songname+"::waves["+ii+"]::path"));
						var pat = songs.get(loading.songname+"::waves["+ii+"]::path");
						var nam = songs.get(loading.songname+"::waves["+ii+"]::name");
						var polyslot = polybuffer_load_wave(pat,nam);
						if(polyslot == -1 ){
							polyslot = waves_polybuffer.count;
						}else{
							polyslot++;
						}
						//post("this wave is in polyslot",polyslot);
						waves_dict.replace("waves["+tt+"]", songs.get(loading.songname+"::waves["+ii+"]"));
						waves_dict.replace("waves["+tt+"]::buffername","waves."+polyslot);
						buffer_loaded(t,pat,nam,"waves."+polyslot);
					}//else{post("no wave ",i);}
				}
			}
			if(songs.contains(loading.songname+"::notepools")){
				post("\nloading notepools");
				notepools_dict.replace("notepools", songs.get(loading.songname+"::notepools"));
				//messnamed("LOAD_NOTEPOOLS","bang");
			}
		}
		for(b=loading.progress;b<MAX_BLOCKS;b++){
			//post("\ntrying block",b,"loading.songname is",loading.songname);
			thisblock = songs.get(loading.songname+"::blocks["+b+"]");
			//post("\n",b,"type",typeof thisblock, thisblock.toString());
			if(thisblock.contains("name")){
				block_name = thisblock.get("name");
				var oname = block_name;
				if(loading.wait>1) post("\nloading block "+b+" : "+block_name);
				if(!blocktypes.contains(block_name+"::type")){//this block doesn't exist in this installation/hardware config!
					if(thisblock.contains("substitute")){
						//use that then
						block_name = thisblock.get("substitute");
						post("\n",oname,"is not available in this hardware configuration. substituting:",block_name);
						var oty = thisblock.get("type");
						var ty = blocktypes.get(block_name+"::type");
						thisblock.replace("name",block_name);
						thisblock.replace("type",ty);
						loading.hardware_substitutions_occured = 1;
						swap_block_check_connections(b,oname,oty,block_name,ty);
					}else if(loading.recent_substitutions.contains(block_name)){
						loading.hardware_substitutions_occured = 1;
						block_name = loading.recent_substitutions.get(block_name);
						post("\n",oname," is not available in this hardware configuration but you already picked ",block_name," as a replacement");
						var oty = thisblock.get("type");
						var ty = blocktypes.get(block_name+"::type");
						thisblock.replace("name",block_name);
						thisblock.replace("type",ty);
						swap_block_check_connections(b,oname,oty,block_name,ty);
					}else if(menu.swap_block_target == -1){
						post("\n",block_name,"was not found and no automatic substitution is known. please choose a substitue");
						loading.hardware_substitutions_occured = 1;
						menu.swap_block_target = block_name; //this isn't how it's used for swap, remember to set back to -1 when done.
						loading.progress = b;
						menu.camera_scroll=0;
						menu.mode = 3;
						initialise_block_menu(1);
						//set_display_mode("block_menu"); //clicking a block on this page (the only option!) will send it back here with the answer, somehow
						menu.search="";
						displaymode="block_menu";
						camera();
						return -1;
					}else{
						post("loading selected susbstitute",menu.swap_block_target);
						loading.hardware_substitutions_occured = 1;
						block_name = menu.swap_block_target;
						menu.swap_block_target = -1;
						var oty = thisblock.get("type");
						var ty = blocktypes.get(block_name+"::type");
						thisblock.replace("name",block_name);
						thisblock.replace("type",ty);
						swap_block_check_connections(b,oname,oty,block_name,ty);
					}
					if(thisblock.contains("panel::parameters")){
						post("\nclearing panel parameter selection because of substitution");
						thisblock.remove("panel::parameters");
					}
				}
				t=0;
				var excl = blocktypes.contains(block_name+"::exclusive");
				//var type = blocktypes.get(block_name+"::type");
				if(excl){
					if(loading.wait>1) post("\nblock flagged as exclusive: searching for existing copy of ",block_name);
					for(i=0;i<MAX_BLOCKS;i++){
						if(blocks.get("blocks["+i+"]::name") == block_name){
							post("found:",i)
							t= 1;
							loading.mapping[b] = i; //this next line stops orphaned bits of clock being left behind
							if(thisblock.get("poly::voices")<blocks.get("blocks["+i+"]::poly::voices")) thisblock.replace("poly::voices",blocks.get("blocks["+i+"]::poly::voices"));
							i=MAX_BLOCKS;
						}
					}
				}
				/*var ui = blocktypes.get(block_name+"::block_ui_patcher");
				if((t == 0) && (ui != "blank.ui") && (ui != "self")){
					for(i=0;i<MAX_BLOCKS;i++){
						if((loaded_ui_patcherlist[i] == ui) && (ui_patcherlist[i] == "recycling")){
							post("\nrecycling ui and block number:",i,ui);
							t= 1;
							loading.mapping[b] = i;
							//ui_patcherlist[i] = ui; //something muteouts 0? - if there's a mechanism to disable ui patchers then here you should enable..
							i=MAX_BLOCKS;
						}
					}
				}*/
				if(t==0){
					loading.mapping[b] = next_free_block(block_name);
				}
				if(!excl){
					song_select.current_blocks.push(loading.mapping[b]);
					// exclusive blocks aren't added to the 'select merged song' button
				}
				blocks.replace("blocks["+loading.mapping[b]+"]",thisblock);
				tx = blocks.get("blocks["+loading.mapping[b]+"]::space::x");
				blocks.replace("blocks["+loading.mapping[b]+"]::space::x",tx+loading.xoffset);
				if(!blocks.contains("blocks["+loading.mapping[b]+"]::label")) blocks.replace("blocks["+loading.mapping[b]+"]::label", block_name);
				load_block(block_name,loading.mapping[b],songs.get(loading.songname+"::states::current::"+b)||[],excl);
			}
		}
		loading.progress=MAX_BLOCKS;
		meters_updatelist.hardware = [];
		meters_updatelist.meters = [];
		meters_enable = 0;
		center_view(1);
		loading.ready_for_next_action=loading.wait;
	}else if(loading.progress<MAX_BLOCKS+loading.mapping.length){
		t = MAX_BLOCKS+loading.mapping.length;
		i=loading.bundling*2; //this determines how many of these are done at once (before handing exection back to max etc), i don't think they take long though?
		do {
			b=loading.progress-MAX_BLOCKS;
			if(loading.wait>1) post("\nloading block voices and data for block", b, "<b map>", loading.mapping[b],typeof loading.mapping[b]);
			if(typeof loading.mapping[b] !=='undefined') load_process_block_voices_and_data(loading.mapping[b]);
			loading.progress++;
			i--;
			if(i==0) t = 0;		
		} while (loading.progress<t);
		loading.ready_for_next_action=loading.wait;
		if(t!=0){
			output_blocks_poly.setvalue(0,"load_complete");
			center_view(1);
			post("\ndone loading blocks, voices and data");
		} 
	}else if(loading.progress<MAX_BLOCKS+loading.mapping.length+loading.conncount){
		t=MAX_BLOCKS+loading.mapping.length+loading.conncount;
		i=loading.bundling;
		do{ 
			b=loading.progress-MAX_BLOCKS-loading.mapping.length;
			if(loading.wait>1) post("\nloading connection number",b);
			if(songs.contains(loading.songname+"::connections["+b+"]::from")){
				new_connection = songs.get(loading.songname+"::connections["+b+"]");
				new_connection.replace("from::number",loading.mapping[new_connection.get("from::number")]);
				new_connection.replace("to::number",loading.mapping[new_connection.get("to::number")]);
				connections.append("connections",new_connection);
				var co = connections.getsize("connections")-1;
				make_connection(co,0);
				new_connection.clear();		
				draw_wire(co);	//better to draw the wires as you go than risk a cpu spike from trying to do them all at once later
			}
			loading.progress++;
			i--;
			if(i==0) t = 0;
		} while (loading.progress<t);
		loading.ready_for_next_action=loading.wait;
		if(t!=0){
			post("\ndone loading connections");
		}
	}else{ 
		var stpv = [];
		if((songs.contains(loading.songname+"::states"))&&((loading.songname != "autoload")||(config.get("AUTOLOAD_INCLUDES_STATES")==1))){
			post("\ndeleting all states of old song");
			delete_state(-1,-1); //delete all existing states
			post("\nloading states");
			var l=loading.wave_paramlist.length;
			post(" - looking for ",l,"blocks with wave remappings");
			for(i=0;i<MAX_STATES;i++){
				for(b=0;b<loading.mapping.length;b++){
					if(songs.contains(loading.songname+"::states::"+i+"::"+b)){
						stpv = songs.get(loading.songname+"::states::"+i+"::"+b);
						if(l>0){
							for(t=0;t<l;t++){
								if(loading.wave_paramlist[t][0]==loading.mapping[b]){
									//post("\nadjusting param no ",loading.wave_paramlist[t][1]," to ",stpv[loading.wave_paramlist[t][1]+1]);
									stpv[loading.wave_paramlist[t][1]+1] = (waves.remapping[Math.floor(MAX_WAVES*(stpv[loading.wave_paramlist[t][1]+1]))]+0.2) / MAX_WAVES;
									//post(" to ",stpv[loading.wave_paramlist[t][1]+1]);
								}
							}
						}
						states.replace("states::"+i+"::"+loading.mapping[b],stpv);
						if(songs.contains(loading.songname+"::states::"+i+"::static_mod::"+b)){
							stpv = songs.get(loading.songname+"::states::"+i+"::static_mod::"+b);
							states.replace("states::"+i+"::static_mod::"+b,stpv);
						}
					}
				}
			}
			for(b=0;b<loading.mapping.length;b++){
				if(songs.contains(loading.songname+"::states::current::"+b)){
					stpv = songs.get(loading.songname+"::states::current::"+b);
					if(l>0){
						for(t=0;t<l;t++){
							if(loading.wave_paramlist[t][0]==loading.mapping[b]){
								//post("\nadjusting ",stpv[loading.wave_paramlist[t][1]+1]);
								stpv[loading.wave_paramlist[t][1]+1] = (waves.remapping[Math.floor(MAX_WAVES*(stpv[loading.wave_paramlist[t][1]+1]))]+0.2) / MAX_WAVES;
								//post(" to ",stpv[loading.wave_paramlist[t][1]+1]);
							}
						}
					}
					states.replace("states::current::"+loading.mapping[b],stpv);
				}
			}
			
			for(b=0;b<loading.mapping.length;b++){
				if(songs.contains(loading.songname+"::states::current::static_mod::"+b)){
					if(!states.contains("states::current::static_mod")) states.setparse("states::current::static_mod","{}");
					if(!states.contains("states::current::static_mod::"+loading.mapping[b]))states.setparse("states::current::static_mod::"+loading.mapping[b],"{}");
					var vl=voicemap.get(loading.mapping[b]);
					if(!Array.isArray(vl)) vl=[vl];
					for(i=0;i<vl.length;i++){
						if(songs.contains(loading.songname+"::states::current::static_mod::"+b+"::"+i)){
							stpv = songs.get(loading.songname+"::states::current::static_mod::"+b+"::"+i);
							parameter_static_mod.poke(1,vl[i]*MAX_PARAMETERS,stpv);
							if(!states.contains("states::current::static_mod::"+loading.mapping[b]+"::"+i))states.setparse("states::current::static_mod::"+loading.mapping[b]+"::"+i,"[]");
							states.replace("states::current::static_mod::"+loading.mapping[b]+"::"+i,stpv);
						}
					}
				}
			}
			if(songs.contains(loading.songname+"::names")){
				states.replace("names",songs.get(loading.songname+"::names"));
			}
		}
		if(songs.contains(loading.songname+"::panels_order")){
			var po = songs.get(loading.songname+"::panels_order");
			post("\nloading panels order: ",po);
			for(i=0;i<po.length;i++){
				panels_order[panels_order.length]=loading.mapping[po[i]];
			}
			if(songs.contains(loading.songname+"::MAX_PANEL_COLUMNS")){
				MAX_PANEL_COLUMNS = 0 | songs.get(loading.songname+"::MAX_PANEL_COLUMNS");
			}
		}
		for(i=0;i<loading.mutelist.length;i++){
			mute_particular_block(loading.mutelist[i][0],loading.mutelist[i][1]);
		}
		messnamed("update_wave_colls","bang");
		if((still_checking_polys&7)==0){
			update_all_voices_mutestatus();
		}
		if(deferred_matrix.length) process_deferred_matrix();
		loading.mutelist=[];
		loading.ready_for_next_action = 0;
		loading.progress = 0;
		redraw_flag.flag|=12;
		rebuild_action_list=1;
		messnamed("output_queue_pointer_reset","bang");
		changed_queue_pointer = 0;
		
		if(preload_list.length>0) preload_task.schedule(5000); //if you interupted preloading waves, just restart it in 5secs
	}
}

function swap_block_check_connections(b,oldname,oldtype,newname,newtype){
	//this is just for during load, the connection hasn't been made yet so ammending the dict entry is enough
	var con_l = songs.getsize(loading.songname + "::connections");
	for (; con_l-- >= 0;) {
		if (songs.contains(loading.songname + "::connections[" + con_l + "]::from")) {
			if(songs.get(loading.songname + "::connections[" + con_l + "]::from::number") == b){
				if(songs.get(loading.songname + "::connections[" + con_l + "]::from::output::type") == "hardware"){
					songs.replace(loading.songname + "::connections[" + con_l + "]::from::output::type", "audio");
				}
			}
		}
		if (songs.contains(loading.songname + "::connections[" + con_l + "]::to")) {
			if(songs.get(loading.songname + "::connections[" + con_l + "]::to::number") == b){
				if(songs.get(loading.songname + "::connections[" + con_l + "]::to::input::type") == "hardware"){
					songs.replace(loading.songname + "::connections[" + con_l + "]::to::input::type", "audio");
				}
			}
		}
	}
}

function build_wave_remapping_list(){
	if(songs.contains(loading.songname+"::waves")){
		var i,a;
		var freelist = [];
		post("\nchecking if any waves need remapping");
		for(i=0;i<MAX_WAVES;i++){
			freelist[i]=1;
			if(waves_dict.contains("waves["+ (1+i)+"]::name")) {
				freelist[i]=0;
				//post("\nfound an existing wave",i," : ",waves_dict.get("waves[" +(1+i)+"]::name"));
			}/*else{
				post("\ndidn't find in "+i);
			}*/
		}
		//post("\nfreelist = ",freelist," agelist = ",waves.age);
		for(i=0;i<MAX_WAVES;i++){
			if(songs.contains(loading.songname+"::waves["+(1+i)+"]::name")){
				a=-1;
				var lowest = waves.seq_no;
				var lowp=-1;
				do {
					a++;
					//post("\nchecking ",a,"free is",freelist[a]);
					if(waves.age[a]<lowest){
						lowest=waves.age[a];
						lowp=a;
					}
					if(a==MAX_WAVES){
						//post("\nreached max, stealing slot",lopw+1);
						a=lowp;
						freelist[a]=1;
						waves.age[a]=waves.seq_no++;
					}
				} while (freelist[a]==0);
				//post("\nmapping new wave "+i+" : "+songs.get(loading.songname+"::waves["+(1+i)+"]::name")+" to slot "+(1+a));
				waves.remapping[i]=a;
				freelist[a]=0;
			}//else{post("\nskipped blank slot ",i);}
		}
		post("\nremapping table goes like this ",waves.remapping);
	}
}

function request_waves_remapping(type, voice){
	post("\n remapping request received,",type,voice,"the remapping i sent out is",waves.remapping);
	if(type=="audio"){
		audio_poly.setvalue((voice-MAX_NOTE_VOICES)+1,"remapping",waves.remapping);
	}else if(type=="ui"){
		ui_poly.setvalue(voice+1,"remapping",waves.remapping);
	}
}

function reload_voicedata(){
	//post("\nreload voice data",loading.mapping.length,loading.songname);
	for(var b=0;b<loading.mapping.length;b++){ //for(var block=0;block<MAX_BLOCKS;block++){
		var block = loading.mapping[b];
		//if(songs.contains(loading.songname+"::blocks["+b+"]::voice_data")) post("\nyes",b,block);
		if(songs.contains(loading.songname+"::blocks["+b+"]::voice_data") && voicemap.contains(block)){
			var v_list = voicemap.get(block);
			if(!Array.isArray(v_list)) v_list = [v_list];
			var t = v_list.length;
			for(var i=0;i<t;i++){
				if(songs.contains(loading.songname+"::blocks["+b+"]::voice_data::"+i)){
					var vdata= songs.get(loading.songname+"::blocks["+b+"]::voice_data::"+i);
					if(vdata == null) vdata=[];
					for(var pad=vdata.length;pad<MAX_DATA;pad++) vdata.push(0);
					voice_data_buffer.poke(1, MAX_DATA*v_list[i], vdata);
				}
			} //this takes 1ms per voice, in case you ever think of trying to optimise it..
		}
	}
}

function load_process_block_voices_and_data(block){
	var drawn=1;
	var t = blocks.get("blocks["+block +"]::poly::voices");
	if(loading.wait>1) post("\nrestoring block "+block+" voices ("+t+") and data");
	if(t!=1){
		drawn=0;
		blocks.replace("blocks["+block +"]::poly::voices",1);
		voicecount(block, t);
	}
	if(blocks.contains("blocks["+block+"]::voice_data") && voicemap.contains(block)){
		var v_list = voicemap.get(block);
		if(!Array.isArray(v_list)) v_list = [v_list];
		t = v_list.length;
		if(loading.wait>1) post("\n- restoring data, voicelist",v_list,"so vlist lenght is",v_list.length,"and t is",t);
		for(i=0;i<t;i++){
			var vdata= blocks.get("blocks["+block+"]::voice_data::"+i);
			if(vdata == null) vdata=[];
			for(var pad=vdata.length;pad<MAX_DATA;pad++) vdata.push(0);
			//voice_data_buffer.poke(1, MAX_DATA*v_list[i], vdata);
			voice_data_buffer.poke(1, MAX_DATA*v_list[i], vdata);
		} //this takes 1ms per voice, in case you ever think of trying to optimise it..
	}	
	if(drawn==1) draw_block(block); //used to be outside the loop with a 'draw_blocks()' but maybe this is quicker?)
}

function load_block(block_name,block_index,paramvalues,was_exclusive){
	if(loading.wait>1) post("\nloading block: ",block_name," into ",block_index," was_exclu=",was_exclusive);//,"index",block_index,"paramvalues",paramvalues);
	var new_voice=-1;
	var type = blocktypes.get(block_name+"::type");
	var hwmidi = "";
	if((type=="hardware")&&(blocktypes.contains(block_name+"::midi_handler"))){
		hwmidi = blocktypes.get(block_name+"::midi_handler");
	}
	var offs = 0;
	var recycled = 0;
	var up = 1;
	if(type == "audio"){
		if(blocks.contains("blocks["+block_index+"]::upsample")){
			up = UPSAMPLING * blocks.get("blocks["+block_index+"]::upsample");
			//post("\nrestoring saved upsample value");
		}else if(blocktypes.contains(block_name+"::upsample")){
			up = UPSAMPLING * blocktypes.get(block_name+"::upsample");
			blocks.replace("blocks["+block_index+"]::upsample", up);
			//post("\nusing default upsample value");
		}else {
			blocks.replace("blocks["+block_index+"]::upsample", 1);
			//post("\n no saved upsampling, no default upsampling, set to 1x");
		}
	}
	if(!(was_exclusive && loading.merge)){
		if(type == "audio"){
			var tnv = find_audio_voice_to_recycle(blocktypes.get(block_name+"::patcher"), up);
			new_voice = tnv[0];
			recycled = tnv[1];
		}else if(type == "note"){
			var tnv = find_note_voice_to_recycle(blocktypes.get(block_name+"::patcher"), up);
			new_voice = tnv[0];
			recycled = tnv[1];
		}else if((type=="hardware") && (hwmidi!="") && RECYCLING){
			var tnv = find_note_voice_to_recycle(hwmidi);
			new_voice = tnv[0];
			recycled = tnv[1]; //this is for the note voice that handles hardware midi
		}else{
			new_voice = next_free_voice(type,block_name);
		}
	}else{
		if(blocktypes.get(block_name+"::max_polyphony") == 1){
			var v_list = voicemap.get(block_index);
			if(!Array.isArray(v_list)) v_list = [v_list];
			new_voice = v_list[0];
			recycled = 1;
			post("\nblock was exclusive so i'm reusing voice",new_voice,"from the vlist",v_list);
		}else{
			post("\nblock was excl but poly so i'm just getting a free slot");
			new_voice = next_free_voice(type,block_name);
		}
	}
	if(type == "note"){
		note_patcherlist[new_voice] = blocktypes.get(block_name+"::patcher");
		still_checking_polys |= 1;
	}else if(type == "audio"){
		audio_patcherlist[new_voice] = blocktypes.get(block_name+"::patcher");	
		audio_upsamplelist[new_voice] = up;
		still_checking_polys |= 2;
		offs=MAX_NOTE_VOICES;
	}else if(type == "hardware"){
		if(hwmidi){
			note_patcherlist[new_voice] = hwmidi;
			offs=0;
		}else{
			offs=MAX_NOTE_VOICES+MAX_AUDIO_VOICES;
		}
	}
	var ui = blocktypes.get(block_name+"::block_ui_patcher");
	if((ui == "") || (ui == 0) || is_empty(ui) || (ui=="self")){
		ui_patcherlist[block_index] = "blank.ui";
	}else{
		ui_patcherlist[block_index] = ui;
	}
	still_checking_polys |= 4;
	voicemap.replace(block_index, new_voice+offs); //set the voicemap

	if(recycled){
		if(type=="audio"){
			audio_poly.setvalue(new_voice+1,"reset");
		}else if(type=="note"){
			note_poly.setvalue(new_voice+1,"reset");
		}
	}

	// and load the params
	if(blocktypes.contains(block_name+"::parameters")){
		var voiceoffset = new_voice + MAX_NOTE_VOICES*(type == "audio") + (MAX_NOTE_VOICES+MAX_AUDIO_VOICES)*(type == "hardware");
		var params = [];
		params = blocktypes.get(block_name+"::parameters");
		if(!Array.isArray(params)) params = [params];
		var p_type,p_values,p_default;
		if(new_voice!=-1){
			param_error_drift[voiceoffset]= [];
		}
		param_defaults[block_index] = [];
		for(var i=0;i<params.length;i++){
			if(new_voice!=-1){
				parameter_error_spread_buffer.poke(1,MAX_PARAMETERS*voiceoffset+i,0);
				parameter_static_mod.poke(1,MAX_PARAMETERS*voiceoffset+i,0);
				param_error_drift[voiceoffset][i]=0;
			}
			p_type = params[i].get("type");
			p_values = params[i].get("values");
			if(p_type == "wave"){
				var curwav = Math.floor(MAX_WAVES * paramvalues[i+1]);
				post("\nprocessing remapping for block",block_index,block_name," wave was ",curwav," and will be ",waves.remapping[curwav]);
				paramvalues[i+1] = (waves.remapping[curwav]+0.2)/MAX_WAVES;
				loading.wave_paramlist.push([block_index,i]);
			}
			if(params[i].contains("default")){
				p_default = params[i].get("default");
			}else{
				p_default = 0;
				if((p_type == "float") && (p_values[0]=="bi")){
					p_default = 0.5;
				}
			}
			
			if(i+1<paramvalues.length){
				parameter_value_buffer.poke(1, MAX_PARAMETERS*block_index +i,paramvalues[i+1]);
				param_defaults[block_index][i] = paramvalues[i+1]; //p_default; << new blocks the default is the default, when you load a song the default is the startup value of that param in the song instead.
			}else{ // in the rare case that you've added some paramters to a block it should still load saves without errors.
				parameter_value_buffer.poke(1, MAX_PARAMETERS*block_index +i,p_default);
				param_defaults[block_index][i] = p_default;
			}
			write_parameter_info_buffer(p_values,p_type,MAX_PARAMETERS*block_index+i);
		}		
	}
	// if the block has per-voice data it gets loaded after voicecount
	// tell the polyalloc voice about its new job
	if(hwmidi!=""){
		voicealloc_poly.setvalue((block_index+1),"type","note");
	}else{
		voicealloc_poly.setvalue((block_index+1),"type",type);
	}
	//voicealloc_poly.setvalue((block_index +1),"type",type);
	voicealloc_poly.setvalue((block_index +1),"voicelist",(new_voice+1));
	var stack = poly_alloc.stack_modes.indexOf(blocks.get("blocks["+block_index+"]::poly::stack_mode"));
	var choose = poly_alloc.choose_modes.indexOf(blocks.get("blocks["+block_index+"]::poly::choose_mode"));
	var steal = poly_alloc.steal_modes.indexOf(blocks.get("blocks["+block_index+"]::poly::steal_mode"));
	var returnmode = 0;
	if(blocks.contains("blocks["+block_index+"]::poly::return_mode")){
		returnmode = blocks.get("blocks["+block_index+"]::poly::return_mode");
	} 
	voicealloc_poly.setvalue((block_index +1),"stack_mode",stack);  
	voicealloc_poly.setvalue((block_index +1),"choose_mode",choose);
	voicealloc_poly.setvalue((block_index +1),"steal_mode",steal);  
	voicealloc_poly.setvalue((block_index +1),"return_mode",returnmode);
	panelslider_visible[block_index] = [];
	if(blocks.contains("blocks["+block_index+"]::panel::parameters")){
		var ppl = blocks.get("blocks["+block_index+"]::panel::parameters");
		var maxp = 0;
		if(blocktypes.contains(block_name+"::parameters")){
			maxp=blocktypes.getsize(block_name+"::parameters");
		}
		for(var pp=0;pp<ppl;pp++){
			if(ppl[pp]>=maxp){
				maxp=0;
				pp=999;
			}
		}
		if(maxp==0){
			blocks.remove("blocks["+block_index+"]::panel::parameters");
			post("\nremoving panel params that dont seem to exist in this config");
			if(!blocks.contains("blocks["+block_index+"]::block_ui_patcher")){
				blocks.remove("blocks["+block_index+"]::panel");
				post(" and removing it from the panels page entirely");
			}
		}
	}
	if(type=="audio"){ 
		audio_to_data_poly.setvalue((new_voice+1), "vis_meter", 1);
		audio_to_data_poly.setvalue((new_voice+1), "vis_scope", 0);
		audio_to_data_poly.setvalue((new_voice+1), "out_value", 0);
		audio_to_data_poly.setvalue((new_voice+1), "out_trigger", 0);
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "vis_meter", 1);
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "vis_scope", 0);
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "out_value", 0);
		audio_to_data_poly.setvalue((new_voice+1+MAX_AUDIO_VOICES), "out_trigger", 0);
	}else if(type=="hardware"){
		var split=0;//=MAX_AUDIO_VOICES+MAX_NOTE_VOICES;
		var ts, tii;
		ts="no";
		if(blocktypes.contains(block_name+"::connections::in::hardware_channels")){
			ts = blocktypes.get(block_name+"::connections::in::hardware_channels");	
			if(typeof ts=="number") ts=[ts];
			split = ts.length;
		}
		if(blocktypes.contains(block_name+"::connections::out::hardware_channels")){
			if(ts=="no"){
				ts = blocktypes.get(block_name+"::connections::out::hardware_channels");
				if(!Array.isArray(ts)) ts = [ts];
			}else{
				var ts2 = blocktypes.get(block_name+"::connections::out::hardware_channels");
				if(typeof ts2=="number") ts2=[ts2];				
				for(tii=0;tii<ts2.length;tii++){
					ts[ts.length]=ts2[tii];
				}
			}
		}
		if(ts!="no"){
			for(tii=0;tii<split;tii++){
				ts[tii] = ts[tii]+MAX_AUDIO_VOICES*2 + MAX_AUDIO_INPUTS;
				audio_to_data_poly.setvalue(ts[tii],"vis_meter", 1);
				audio_to_data_poly.setvalue(ts[tii],"vis_scope", 0);
				audio_to_data_poly.setvalue(ts[tii],"out_value", 0);
				audio_to_data_poly.setvalue(ts[tii],"out_trigger", 0);
				ts[tii] -= 1;
			}
			for(tii=split;tii<ts.length;tii++){
				ts[tii] = ts[tii]+MAX_AUDIO_VOICES*2;
				audio_to_data_poly.setvalue(ts[tii],"vis_meter", 1);
				audio_to_data_poly.setvalue(ts[tii],"vis_scope", 0);
				audio_to_data_poly.setvalue(ts[tii],"out_value", 0);
				audio_to_data_poly.setvalue(ts[tii],"out_trigger", 0);
				ts[tii]-=1;
			}
			hardware_metermap.replace(block_index,ts);
			if(blocktypes.get(block_name+"::max_polyphony")>1){
				voicecount(block_index,blocktypes.get(block_name+"::max_polyphony"));
			}
		}
	}

	if(type!="hardware"){
		var m = blocks.get("blocks["+block_index+"]::mute");
		if(m!=1)m=0;
		if((loading.mute_new==1)&&(was_exclusive==0)) m=1;
		loading.mutelist[loading.mutelist.length]=[block_index,m];
//		mute_particular_block(block_index,m);
	}
}

function save_song(selectedonly, saveas){ //saveas == 1 -> prompt for name
	post("\ncollecting data to save\nselo=",selectedonly,"saveas=",saveas);
	//copy current param values into states[0]
	var b,p,psize;
	var store = [];
	var per_v = [];
	if(states.contains("states::current")) states.remove("states::current");
	for(b=0;b<MAX_BLOCKS;b++){
		store[b] = [];
		per_v[b] = [];
		if(blocks.contains("blocks["+b+"]::name")){
			var vl = voicemap.get(b);
			if(!Array.isArray(vl)) vl = [vl];
			if((ui_patcherlist[b]!='blank.ui')&&(ui_patcherlist[b]!='self')) ui_poly.setvalue( b+1, "store");//query any ui blocks if they have data to store in data
			var ty=blocks.get("blocks["+b+"]::type");
			if(ty == "note"){
				for(v=0;v<vl.length;v++){
					note_poly.setvalue(vl[v]+1,"store");
				}
			}else if(ty == "audio"){
				for(v=0;v<vl.length;v++){			
					audio_poly.setvalue(vl[v]+1-MAX_NOTE_VOICES,"store");
				}
			}
			psize = blocktypes.getsize(blocks.get("blocks["+b+"]::name")+"::parameters");
			var pvm_vl=[],pvm=0;
			for(p=0;p<psize;p++){ 
				store[b][p+1]=parameter_value_buffer.peek(1, MAX_PARAMETERS*b+p);
				for(var v=0;v<vl.length;v++){
					var tv=parameter_static_mod.peek(1,vl[v]*MAX_PARAMETERS+p);
					if(tv!=0){
						pvm_vl[v]=1;
						pvm=1;
//						per_v[b].push(v,p,tv); // per voice static parameter mod is stored in savefile as voice, param, modval triplets
					}
				}
			}
			if(pvm==1){
				per_v[b] = new Dict;
				if(!states.contains("states::current")) states.setparse("states::current","{}");
				if(!states.contains("states::current::static_mod"))states.setparse("states::current::static_mod","{}");
				if(!states.contains("states::current::static_mod::"+b))states.setparse("states::current::static_mod::"+b,"{}");
				for(var v=0;v<vl.length;v++){
					if(pvm_vl[v]==1){
						if(!states.contains("states::current::static_mod::"+b+"::"+v))states.setparse("states::current::static_mod::"+b+"::"+v,"{}");
						var tv=parameter_static_mod.peek(1,vl[v]*MAX_PARAMETERS,psize);
						//post("\nadding",tv.length,"values to current/static/",b,"vl",v);
						states.replace("states::current::static_mod::"+b+"::"+v,tv);	
					}
				}
			}
			store[b][0] = 0;
			if(blocks.contains("blocks["+b+"]::mute")) store[b][0] = blocks.get("blocks["+b+"]::mute");
		}
	}
	for(b=0;b<MAX_BLOCKS;b++){
		if(store[b].length) states.replace("states::current::"+b,store[b]);
		//if(per_v[b].length) states.replace("states::current::static_mod::"+b,per_v[b]);
	}
	post("current state stored");
	if(panels_order.length){
		blocks.replace("panels_order",panels_order);
		blocks.replace("MAX_PANEL_COLUMNS",MAX_PANEL_COLUMNS);
	}
	if(fullscreen){
		fullscreen=0;
		world.message("fullscreen",0);
	}
//copy blocks and connections and states and properties into one dict
	if(selectedonly){
		//post("\nsaving selection only");
		messnamed("trigger_save_selected", "bang");
	}else if(saveas || (loading.songname=="") || (loading.songname=="autoload")){
		//post("\nsave as");
		messnamed("trigger_save_as","bang");
	}else{
		post("\nsave",loading.songname);
		messnamed("save_named",SONGS_FOLDER+loading.songname);
		//messnamed("trigger_save","bang");
	}
	set_sidebar_mode("none");
}

function save_selected_pruning(){
	var ss = new Dict;
	ss.name = "songselected";
	for(var i=0;i<MAX_BLOCKS;i++){
		if(selected.block[i]==0){
			if(ss.contains("blocks["+i+"]::name")){
				ss.setparse("blocks["+i+"]", "{}");
			}
		}
	}
	var l = ss.getsize("connections");
	for(i=0;i<l;i++){
		if(ss.contains("connections["+i+"]::from")){
			if(selected.block[ss.get("connections["+i+"]::from::number")]==0){
				ss.setparse("connections["+i+"]","{}");
			}else if(selected.block[ss.get("connections["+i+"]::to::number")]==0){
				ss.setparse("connections["+i+"]","{}");
			}
		}
	}
	if(ss.contains("states")){
		var sss = ss.get("states");
		var l = sss.getkeys();
		if(l!=null){
			if(!Array.isArray(l)) l = [l];
			var ll = l.length;
			for(i=0;i<ll;i++){
				var ssk = sss.get(l[i]);
				var k = ssk.getkeys();
				if(k!=null){
					var kl=k.length;
					var remd = 0;
					for(var ii=0;ii<kl;ii++){
						if(selected.block[k[ii]]==0){
							//post("\nabout to remove",l[i],"::",k[ii]);
							ss.remove("states::"+l[i]+"::"+k[ii]);
							remd = 1;
						}
					}
					if(remd && (l[i]!="current")){
						//post("\ncheck to see if we need to remove whole key");
						sss = ss.get("states");
						var ssk = sss.get(l[i]); //reget it because you've changed it..
						k = ssk.getsize();
						//post("\nstate pruning",l[i],remd,k);
						if(k==0) ss.remove("states::"+l[i]);
					}
				}
			}
		}

	}
	messnamed("trigger_save_selected_ready","bang");
}

function save_hotkey(){
	keyrepeat_task.cancel();
	if((loading.songname != "")&&(loading.songname!="autoload")&&(config.get("AUTO_INCREMENT_SAVE_KEY")==1)){
		//post("\nsong name was",loading.songname);
		var na = loading.songname.split(".json")[0];
		//post("\nNA",na);
		var num = na.match(/(\d+)(?!.*\d)/);///\d+/);//.pop();
		//post("num",num,"length",num.length);
		if(!Array.isArray(num)) num = [num|0];
		num = num.pop();//[num.length-1];
		num |= 0;
		var npos = na.lastIndexOf(num);
		if(npos==0) npos = na.length();
		var nas = na.slice(0,npos);
		num++;
		loading.songname = nas+num+".json";
		post("\nincrementing filename, saving as:",SONGS_FOLDER+loading.songname);
		save_song(0,0); //save
		//messnamed("save_named",SONGS_FOLDER+loading.songname);
	}else{
		if((loading.songname != "")&&(loading.songname!="autoload")){
			save_song(0,0); //save
		}else{
			save_song(0,1); //save as
		}
	}
}

function write_userconfig(){
	post("\nwriting userconfig");
	userconfig.writeagain();
}

function file_written(fname){//called when max reports successfully saving the current song dict so we have the filename
	loading.songname = fname.split("/").pop();
}

function folder_select(folderstr){
//	post("new songs folder selected",folderstr);
	if(folderstr!="cancel"){
		if(folder_target == "song"){
			SONGS_FOLDER = folderstr;
			post("\nselected new songs folder:",folderstr);
			userconfig.replace("SONGS_FOLDER",folderstr);
			write_userconfig();
			read_songs_folder("songs");
		}else if(folder_target == "template"){
			TEMPLATES_FOLDER = folderstr;
			post("\nselected new templates folder:",folderstr);
			userconfig.replace("TEMPLATES_FOLDER",folderstr);
			write_userconfig();
			read_songs_folder("templates");
		}else if(folder_target == "record"){
			post("\nselected new record folder:",folderstr);
			config.replace("RECORD_FOLDER",folderstr);
			userconfig.replace("RECORD_FOLDER",folderstr);
			write_userconfig();
			recording_flag = ((record_arm.indexOf(1)!=-1)+2*(folderstr!=""));
		}
	}
	if(fullscreen) world.message("fullscreen",fullscreen);
}

function purge_muted_trees(){
	//idea: collect all muted blocks, add them to purgelist
	//then, for everything on purgelist, look at everything it's connected to. if you're taking the only input off a thing, add that thing to purgelist. likewise if only output.
	// iterate.
	loading.purgelist = [];
	for(var i = 0; i<MAX_BLOCKS;i++){
		if(blocks.contains("blocks["+i+"]::mute")){
			if(blocks.get("blocks["+i+"]::mute")==1){
				loading.purgelist.push(i);
			}
		}
	}
	post("\ninitial purgelist, these blocks are muted so they're going:",loading.purgelist);
	process_purgelist();
}

function process_purgelist(){
	if(loading.purgelist.length>0){
		var block = loading.purgelist.pop();
		if(blocks.contains("blocks["+block+"]::name")){
			post("\npre-merge purge, ",block," is on the list, looking at what it's connected to");
			for(var i = 0, ll=connections.getsize("connections"); i<ll;i++){
				if(connections.contains("connections["+i+"]::from")){
					var from_no = connections.get("connections["+i+"]::from::number");
					var to_no = connections.get("connections["+i+"]::to::number");
					var cons=[];
					var cont=-1;
					if(loading.purgelist.indexOf(from_no)!=-1) to_no=-1;
					if(loading.purgelist.indexOf(to_no)!=-1) from_no=-1;
					if(from_no == block){
						post("\nit goes to",to_no,"which has the following inputs:");
						//block to_no is connected to the purged block. lets see if to_no has any other inputs, if not, purge it
						cont = to_no;
						for(var t=0, l=connections.getsize("connections");t<l;t++){
							if(connections.contains("connections["+t+"]::to")){
								if(connections.get("connections["+t+"]::to::number")==to_no){
									if(loading.purgelist.indexOf(connections.get("connections["+t+"]::from::number"))==-1){
										var bn=blocks.get("blocks["+connections.get("connections["+t+"]::from::number")+"]::name");
										var bnn=bn.split('.');
										post(connections.get("connections["+t+"]::from::number"),bn);
										if(bnn[0]!='core') cons.push(connections.get("connections["+t+"]::from::number"));
									}
								} 
							}
						}
					}else if(to_no == block){
						post("\nit comes from",from_no,"which has the following outputs");
						cont = from_no;
						//block from_no is connected to the purged block. lets see if from_no has any other outputs, if not, purge it
						for(var t=0, l=connections.getsize("connections");t<l;t++){
							if(connections.contains("connections["+t+"]::from")){
								if(connections.get("connections["+t+"]::from::number")==from_no){ 
									if(loading.purgelist.indexOf(connections.get("connections["+t+"]::to::number"))==-1){
										var bn=blocks.get("blocks["+connections.get("connections["+t+"]::to::number")+"]::name");
										var bnn=bn.split('.');
										post(connections.get("connections["+t+"]::to::number"),bn);
										if(bnn[0]!='core') cons.push(connections.get("connections["+t+"]::to::number")); 
									}
								}
							}
						}
					}
					if(cont!=-1){
						var a = [];
						for (var t=0, l=cons.length; t<l; t++){
							if (a.indexOf(cons[t]) === -1 && cons[t] !== ''){
								a.push(cons[t]);
							}
						}
						if(a.length<=1){
							post("\n- so i'm adding this block to the purgelist: ",cont);
							loading.purgelist.push(cont);
						}
					}
				}
			}
			post("doing removal now");
			remove_block(block);
			process_purgelist();
		}
	}
}

function clear_everything(){
	messnamed("pause_mod_processing",1);
	//messnamed("clear_all_buffers","bang"); 
	//you don't need to do this, everything that gets loaded or created will overwrite these buffers
	output_queue.poke(1,0,0);
	messnamed("output_queue_pointer_reset","bang");
	changed_queue.poke(1,0,0);
	changed_queue_pointer = 0;

	redraw_flag.paneltargets = [];

	var emptys="{}";
	for(i=0;i<=MAX_WAVES;i++)	emptys= emptys+",{}";
	waves_dict.parse('{ "waves" : ['+emptys+'] }');

	var i;

	wipe_midi_meters();
	remove_all_routings();

	//also empties all the dicts for re-initialisatoin:
	//audio_poly.setvalue( 0, "kill");
	audio_to_data_poly.setvalue(0, "vis_meter", 0);
	audio_to_data_poly.setvalue(0, "vis_scope", 0);
	audio_to_data_poly.setvalue(0, "out_value", 0);
	audio_to_data_poly.setvalue(0, "out_trigger", 0);
	sidebar.selected_voice = -1;
//	matrix.message("clear"); //clears the audio matrix
	messnamed("clear_matrix","bang");
	note_poly.setvalue(0,"enabled",0);
	audio_poly.setvalue(0,"enabled",0);

	for(i=0;i<MAX_WAVES;i++){
		waves.remapping[i]=i;
		waves.age[i]=0;
	}
	waves.seq_no = 0;
	waves.selected = -1;
	for(i=0;i<MAX_NOTE_VOICES;i++) note_patcherlist[i]='blank.note';
	for(i=0;i<MAX_AUDIO_VOICES;i++) audio_patcherlist[i]='blank.audio';
	for(i=0;i<MAX_BLOCKS;i++) {
		ui_patcherlist[i]='blank.ui';
		selected.block[i]=0;
		selected.wire[i]=0;
	}
	selected.anysel = 0;
	still_checking_polys = 0;//7;
	send_note_patcherlist(1);
	send_audio_patcherlist(1);
	send_ui_patcherlist(1);

	MAX_PANEL_COLUMNS = config.get("MAX_PANEL_COLUMNS");
	
	draw_wave = [];
	for(i=0;i<128;i++){
		quantpool.poke(1, i, i);
		indexpool.poke(1, i, i);
	}
	panels_order=[];
	
	for(i=MAX_AUDIO_VOICES * NO_IO_PER_BLOCK+1;i<1+MAX_AUDIO_VOICES * NO_IO_PER_BLOCK+MAX_AUDIO_INPUTS+MAX_AUDIO_OUTPUTS;i++){
		audio_to_data_poly.setvalue(i, "vis_meter", 1);
	}
	var emptys="{}";
	for(i=0;i<MAX_BLOCKS-1;i++)	emptys= emptys+",{}";
	blocks.parse('{ "blocks" : ['+emptys+'] }');

	connections.parse('{ "connections" : [ {} ] }');
	var b,bl;
	for(b in blocks_cube){
		for(bl in blocks_cube[b]){
			blocks_cube[b][bl].freepeer();			
		}
		blocks_cube[b] = [];
	}
	for(b in blocks_meter){
		for(bl in blocks_meter[b]){
			blocks_meter[b][bl].freepeer();
		}
		blocks_meter[b] = [];
	}
	for(b in wires){
		for(bl in wires[b]){
			wires[b][bl].enable = 0; 
			wires[b][bl].scale = [0,0,0];//freepeer();
		}
		//wires[b] = [];
		wires_colours[b] = [];
	}
	wire_ends = [];
	blocks_tex_sent=[];
	background_cube.shape = "cube";
	background_cube.scale = [10000, 10000, 1 ];
	background_cube.position = [0, 0, -200];
	background_cube.name = "background";
	background_cube.color = [0, 0, 0, 1];
	menu_background_cube.shape = "cube";
	menu_background_cube.scale = [1000, 1, 1000 ];
	menu_background_cube.position = [0, -200, 0];
	menu_background_cube.name = "block_menu_background";
	menu_background_cube.color = [0, 0, 0, 1];

	voicemap.parse('{ }');
	midi_routemap.parse('{ }');
	mod_routemap.parse('{ }');
	mod_param.parse('{ }');
	states.parse('{ }');

	i = MAX_PARAMETERS*(MAX_NOTE_VOICES+MAX_AUDIO_VOICES+MAX_HARDWARE_BLOCKS);
	is_flocked=[];
	for(;i-->=0;){
		is_flocked.push(0);
	}
	flocklist = [];
	//messnamed("update_midi_routemap","bang");
	messnamed("MAX_NOTE_VOICES",MAX_NOTE_VOICES);

	post("\nclearing everything");
	sigouts.setvalue(0,0); // clear sigs
	song_select.previous_name="";
	song_select.previous_blocks=[];
	song_select.current_blocks=[];
	song_select.current_name="";
	song_select.show=0;

	automap.lock_q = 0;
	automap.lock_c = 0;
	automap_lock_k = 0;
	automap.mapped_c = -1;
	automap.mapped_k = -1;
	automap.mapped_k_v = -1;
	automap.mapped_q = -1;
}
