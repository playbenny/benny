function read_songs_folder(){ //also loads all song json files, and constructs the wave preload list.
	var f = new Folder(SONGS_FOLDER);
	post("reading songs folder: ",SONGS_FOLDER,"\n");
	f.reset();
	var i=0, ts, tss;
	songlist = [];
	while(!f.end){
		if(f.extension == ".json"){
			ts = f.filename.split(".");
			tss = "";
			for(var t=0;t<ts.length-1;t++){
				tss = tss + ts[t];
				if(t>0) tss = tss + ".";
			}
			var tsd = f.moddate.toString();
			songlist[i] = tss;//f.filename;
			if(songs.contains(tss)){
				if(tsd!=songs_moddate[i]) songs.remove(tss);
			}
			if(!songs.contains(tss)){
				song.import_json(SONGS_FOLDER+f.filename);
				songs_moddate[i] = tsd;
				post("\npreloaded songfile:",f.filename);
				var songkeys = song.getkeys();
				for(k in songkeys){
					//post(songkeys[k]);
					if(k==0){
						songs.setparse(tss+"::"+songkeys[k]);
					}else{
						songs.setparse(tss+"::"+songkeys[k], "*");
					}
					var typ = song.gettype(songkeys[k]);
					var typ2="";
					if(typ=="array"){
						typ2 = song.gettype(songkeys[k]+"[0]");
//						post("FIRST ELEMENT TYPE",typ2);
					}
					if(typ2=="dictionary"){
						//have to iterate through the outer array
						var siz = song.getsize(songkeys[k]);
						for(var kk=0;kk<siz;kk++){
							if(kk==0){
								songs.append(tss+"::"+songkeys[k]);
							}else{
								songs.append(tss+"::"+songkeys[k],"*");
							}
							songs.setparse(tss+"::"+songkeys[k]+"["+kk+"]", "*");
							songs.replace(tss+"::"+songkeys[k]+"["+kk+"]", song.get(songkeys[k]+"["+kk+"]"));
						}
	
					}else{
						songs.replace(tss+"::"+songkeys[k], song.get(songkeys[k]));
					}
				}
			}
			i++;
		}
		f.next();
	}
	f.close();
	for(var i=0;i<songlist.length;i++){
		if(songs.contains(songlist[i]+"::waves")){
			var ws=songs.getsize(songlist[i]+"::waves");
			for(var t=0;t<ws;t++){
				var pat = songs.get(songlist[i]+"::waves["+t+"]::path");
				var nam = songs.get(songlist[i]+"::waves["+t+"]::name");
				if(pat!=null){
					preload_list.push([pat,nam]);
					//polybuffer_load_wave(pat,nam);
				}
			}
		}
		var bc=0, vc_n=0, vc_a=0, vc_h=0;
		if(songs.contains(songlist[i]+"::blocks")){
			var bs=songs.getsize(songlist[i]+"::blocks");
			for(var t=0;t<bs;t++){
				if(songs.contains(songlist[i]+"::blocks["+t+"]::type")){
					bc++;
					var ty = songs.get(songlist[i]+"::blocks["+t+"]::type");
					var vc = songs.get(songlist[i]+"::blocks["+t+"]::poly::voices");
					if(songs.contains(songlist[i]+"::blocks["+t+"]::subvoices")){
						var sb=songs.get(songlist[i]+"::blocks["+t+"]::subvoices");
						if(sb>1) vc/=sb;
					}
					if(ty=="note"){
						vc_n += vc;
					}else if(ty=="audio"){
						vc_a += vc;
					}else if(ty="hardware"){
						vc_h += vc;
					}
				}
			}
		}
		songs_info[i]=[bc,vc_n,vc_a,vc_h];
	}	
}

function preload_all_waves(){
	if(!waves_preloading) preload_list = [];
	if(preload_list.length>0){
		var t = preload_list.pop();
		if(polybuffer_load_wave(t[0],t[1])==-1){
			post("\n preloaded wave",t[1]);
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

function polybuffer_load_wave(wavepath,wavename){ //loads wave into polybuffer if not already loaded.
	var exists=-1;
	for(var i=0;i<polybuffer_names.length;i++){
		if(polybuffer_names[i] == wavename) exists=i;
	}
	if(exists==-1){
		waves_polybuffer.append(wavepath);
		//post("(loading)")
		get_polybuffer_info();
		return -1;
	}else{
		//post("[cache hit!",exists,"]");
		return exists;
	}
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
	//>> TODO send polybuffer into to other blocks?
}

//max calls this once a buffer is loaded
function buffer_loaded(number,path,name,buffername){
//	post("buffer",number,"has loaded into polyslot",polyslot);
	waves_buffer[number]= new Buffer(buffername);
	post("length",waves_buffer[number].length(),waves_buffer[number].framecount(),waves_buffer[number].channelcount(),"name",name);
	var tn=+number+1;
	var exists=0;
	if(waves_dict.contains("waves["+tn+"]::name")){
		if(waves_dict.get("waves["+tn+"]::path")==path){
			post("not overwriting existing wave info in dictionary");
			exists=1;
		}else{
			post("path doesn't match so overwriting",waves_dict.get("waves["+tn+"]::path"),path);
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
	for(var i=0;i<waves_buffer[number].channelcount()*2;i++){
		draw_wave[number][i]=new Array(3200);
		for(var t=0;t<3200;t++) draw_wave[number][i][t]=0;
	}
	if(displaymode=="waves") redraw_flag.flag |= 4;
	store_wave_slices(tn);
	waves.age[number]=++waves.seq_no;
}

function load_next_song(slow){
	var oc = usermouse.ctrl;
	usermouse.ctrl = slow;
	load_song();
	currentsong++;
	if(currentsong==songlist.length)currentsong=0;
	usermouse.ctrl = oc;
}

function load_song(){
	if(playing) play_button();
	clear_everything();
	loading.merge = 0;
	loading.dont_automute=1;
	loading.progress=-1;
	loading.mute_new=0;
	loading.bundling=12;
	loading.wait=1;
	if(usermouse.ctrl){
		loading.bundling=1;
		loading.wait=40;
		post("\n\nTROUBLESHOOTING SLOW LOAD MODE\n\n");
	}
	import_song();
}

function merge_song(){
	loading.progress=-1;
	loading.merge = 1;
	if(playing){
		loading.mute_new=1;
		loading.bundling=2;
	}else{
		loading.mute_new=0;
		loading.bundling=4;
	}
	song_select.previous_name = song_select.current_name;
	song_select.previous_blocks = song_select.current_blocks.slice();
	song_select.current_name = songlist[currentsong];
	song_select.current_blocks = [];
	song_select.show = 1;
	if(MERGE_PURGE>0) purge_muted_trees();
	import_song();
}

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
		post("loading from song",songlist[currentsong],"\n");
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
			if(songs.contains(songlist[currentsong]+"::blocks["+b+"]::name")){
				tx=songs.get(songlist[currentsong]+"::blocks["+b+"]::space::x");
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
		if(songs.contains(songlist[currentsong]+"::notepad")){ //TODO - it should swap topbar for progress meter, clear the songlist and write out the notes in its place
			post("\n\n\nSONG NOTES\n\n"+songs.get(songlist[currentsong]+"::notepad"));
		}
		loading.progress++;
		loading.ready_for_next_action=loading.wait;//loading.bundling;
	}else if(loading.progress<MAX_BLOCKS){
		if(loading.progress == 0){
			if(songs.contains(songlist[currentsong]+"::waves")){
				build_wave_remapping_list();
				post("\nloading waves, size",songs.getsize(songlist[currentsong]+"::waves"));
				for(i=0;i<songs.getsize(songlist[currentsong]+"::waves");i++){
					var ii=i+1;
					if(songs.contains(songlist[currentsong]+"::waves["+ii+"]::path")){
						t = waves.remapping[i];
						if(t==-1)t=i;
						var tt = t+1;
						post("\n loading song wave"+i+" into slot "+t+" its path is "+songs.get(songlist[currentsong]+"::waves["+ii+"]::path"));
						var pat = songs.get(songlist[currentsong]+"::waves["+ii+"]::path");
						var nam = songs.get(songlist[currentsong]+"::waves["+ii+"]::name");
						var polyslot = polybuffer_load_wave(pat,nam);
						if(polyslot == -1 ){
							polyslot = waves_polybuffer.count;
						}else{
							polyslot++;
						}
						post("this wave is in polyslot",polyslot);
						waves_dict.replace("waves["+tt+"]", songs.get(songlist[currentsong]+"::waves["+ii+"]"));
						waves_dict.replace("waves["+tt+"]::buffername","waves."+polyslot);
						buffer_loaded(t,pat,nam,"waves."+polyslot);
					}else{post("no wave ",i);}
				}
			}
			if(songs.contains(songlist[currentsong]+"::notepools")){
				post("\nloading notepools");
				notepools_dict.replace("notepools", songs.get(songlist[currentsong]+"::notepools"));
				//messnamed("LOAD_NOTEPOOLS","bang");
			}
		}
		for(b=loading.progress;b<MAX_BLOCKS;b++){
			thisblock = songs.get(songlist[currentsong]+"::blocks["+b+"]");
			//post("\n",b,"type",typeof thisblock, thisblock.toString());
			if(thisblock.contains("name")){
				block_name = thisblock.get("name");
				if(loading.wait>1) post("\nloading block "+b+" : "+block_name);
				if(!blocktypes.contains(block_name+"::type")){//this block doesn't exist in this installation/hardware config!
					if(thisblock.contains("substitute")){
						//use that then
						post("the block type",block_name,"is not available in this hardware configuration. using");
						block_name = thisblock.get("substitute");
						post(block_name,"instead as a substitute");
						thisblock.replace("name",block_name);
						thisblock.replace("type",blocktypes.get(block_name+"::type")); //i think you might need to do a better job here
						//need to go through all connections, if connected to this block and type = hardware,
						//adjust to type = audio.
						var con_l = songs.getsize(songlist[currentsong]+"::connections");
						for(;con_l-- >=0;){
							if(songs.contains(songlist[currentsong]+"::connections["+con_l+"]::from")){
								if((songs.get(songlist[currentsong]+"::connections["+con_l+"]::from::number")==b)&&(songs.get(songlist[currentsong]+"::connections["+con_l+"]::from::output::type")=="hardware")){
									songs.replace(songlist[currentsong]+"::connections["+con_l+"]::from::output::type","audio");
								}
							}
							if(songs.contains(songlist[currentsong]+"::connections["+con_l+"]::to")){
								if((songs.get(songlist[currentsong]+"::connections["+con_l+"]::to::number")==b)&&(songs.get(songlist[currentsong]+"::connections["+con_l+"]::to::input::type")=="hardware")){
									songs.replace(songlist[currentsong]+"::connections["+con_l+"]::to::input::type","audio");
								}
							}
						}
					}else if(block_menu_d.swap_block_target == -1){
						post("the block type",block_name,"was not found and no automatic substitution is known, prompting user for substitute selection");
						block_menu_d.swap_block_target = block_name; //this isn't how it's used for swap, remember to set back to -1 when done.
						loading.progress = b;
						block_menu_d.mode = 3;
						set_display_mode("block_menu"); //clicking a block on this page (the only option!) will send it back here with the answer, somehow
						return -1;
					}else{
						post("loading selected susbstitute",block_menu_d.swap_block_target);
						block_name = block_menu_d.swap_block_target;
						block_menu_d.swap_block_target = -1;
						thisblock.replace("name",block_name);
						thisblock.replace("type",blocktypes.get(block_name+"::type")); //i think you might need to do a better job here
					}
				}
				t=0;
				var excl = blocktypes.contains(block_name+"::exclusive");
				var ui = blocktypes.get(block_name+"::block_ui_patcher");
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
				if((t == 0) && (ui != "blank.ui")){
					for(i=0;i<MAX_BLOCKS;i++){
						if((loaded_ui_patcherlist[i] == ui) && (ui_patcherlist[i] == "recycling")){
							//post("\nrecycling ui and block number:",i,ui);
							t= 1;
							loading.mapping[b] = i;
							//ui_patcherlist[i] = ui; //something muteouts 0? - if there's a mechanism to disable ui patchers then here you should enable..
							i=MAX_BLOCKS;
						}
					}
				}
				if(t==0){
					loading.mapping[b] = next_free_block();
				}
				if(!excl){
					song_select.current_blocks.push(loading.mapping[b]);
					// exclusive blocks aren't added to the 'select merged song' button
				}
				blocks.replace("blocks["+loading.mapping[b]+"]",thisblock);
				tx = blocks.get("blocks["+loading.mapping[b]+"]::space::x");
				blocks.replace("blocks["+loading.mapping[b]+"]::space::x",tx+loading.xoffset);
				if(!blocks.contains("blocks["+loading.mapping[b]+"]::label")) blocks.replace("blocks["+loading.mapping[b]+"]::label", block_name);
				load_block(block_name,loading.mapping[b],songs.get(songlist[currentsong]+"::states::current::"+b),excl);
			}
		}
		
		loading.progress=MAX_BLOCKS;
		meters_updatelist.hardware = [];
		meters_updatelist.meters = [];
		meters_enable = 0;
		//draw_blocks(); //block cubes need to exist in order for connections to be created but this is called after voicecount anyway
		center_view(1);
		loading.ready_for_next_action=loading.wait;
	}else if(loading.progress<MAX_BLOCKS+loading.mapping.length){
		t = MAX_BLOCKS+loading.mapping.length;
		i=loading.bundling;//*4; //this determines how many of these are done at once (before handing exection back to max etc), i don't think they take long though?
		do {
			b=loading.progress-MAX_BLOCKS;
			//post("\nloading block voices and data for block", b, "<b map>", loading.mapping[b],typeof loading.mapping[b]);
			if(typeof loading.mapping[b] !=='undefined') load_process_block_voices_and_data(loading.mapping[b]);
			loading.progress++;
			i--;
			if(i==0) t = 0;		
		} while (loading.progress<t);
		output_blocks_poly.setvalue(0,"load_complete");
		loading.ready_for_next_action=loading.wait;
		if(t!=0) center_view(1);
		//redraw_flag.flag |= 2;
	}else if(loading.progress<MAX_BLOCKS+loading.mapping.length+songs.getsize(songlist[currentsong]+"::connections")){
		t=MAX_BLOCKS+loading.mapping.length+songs.getsize(songlist[currentsong]+"::connections");
		i=3*loading.bundling; //7;
		do{ 
			b=loading.progress-MAX_BLOCKS-loading.mapping.length;
			//post("\nloading connection number",b);
			if(songs.contains(songlist[currentsong]+"::connections["+b+"]::from")){
				new_connection = songs.get(songlist[currentsong]+"::connections["+b+"]");
				new_connection.replace("from::number",loading.mapping[new_connection.get("from::number")]);
				new_connection.replace("to::number",loading.mapping[new_connection.get("to::number")]);
				connections.append("connections",new_connection);
				var co = connections.getsize("connections")-1;
				make_connection(co);
				new_connection.clear();		
				draw_wire(co);	//better to draw the wires as you go than risk a cpu spike from trying to do them all at once later
			}
			loading.progress++;
			i--;
			if(i==0) t = 0;
		} while (loading.progress<t);
		
		loading.ready_for_next_action=loading.wait;
		//redraw_flag.flag |= 2;
	}else{ 
		var stpv = [];
		if(songs.contains(songlist[currentsong]+"::states")){
			post("\ndeleting all states of old song");
			delete_state(-1,-1); //delete all existing states
			post("\nloading states");
			var l=loading.wave_paramlist.length;
			post(" - looking for ",l,"blocks with wave remappings");
			for(i=0;i<MAX_STATES;i++){
				for(b=0;b<loading.mapping.length;b++){
					if(songs.contains(songlist[currentsong]+"::states::"+i+"::"+b)){
						stpv = songs.get(songlist[currentsong]+"::states::"+i+"::"+b);
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
						if(songs.contains(songlist[currentsong]+"::states::"+i+"::static_mod::"+b)){
							stpv = songs.get(songlist[currentsong]+"::states::"+i+"::static_mod::"+b);
							states.replace("states::"+i+"::static_mod::"+b,stpv);
						}
					}
				}
			}
			for(b=0;b<loading.mapping.length;b++){
				if(songs.contains(songlist[currentsong]+"::states::current::"+b)){
					stpv = songs.get(songlist[currentsong]+"::states::current::"+b);
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
				if(songs.contains(songlist[currentsong]+"::states::current::static_mod::"+b)){
					stpv = songs.get(songlist[currentsong]+"::states::current::static_mod::"+b);
					var vl=voicemap.get(loading.mapping[b]);
					if(!Array.isArray(vl)) vl=[vl];
					for(i=0;i<stpv.length;i+=3){
						safepoke(parameter_static_mod,1,vl[stpv[i]]*MAX_PARAMETERS+stpv[i+1],stpv[i+2]);
					}
				}
			}
			if(songs.contains(songlist[currentsong]+"::names")){
				states.replace("names",songs.get(songlist[currentsong]+"::names"));
			}
		}
		if(songs.contains(songlist[currentsong]+"::panels_order")){
			var po = songs.get(songlist[currentsong]+"::panels_order");
			post("\nloading panels order: ",po);
			for(i=0;i<po.length;i++){
				panels_order[panels_order.length]=loading.mapping[po[i]];
			}
		}
		for(i=0;i<loading.mutelist.length;i++){
			mute_particular_block(loading.mutelist[i][0],loading.mutelist[i][1]);
		}
		
		loading.mutelist=[];
		loading.ready_for_next_action = 0;
		loading.progress = 0;
		//set_display_mode("blocks");
		set_sidebar_mode("none");
		build_mod_sum_action_list();
		//draw_blocks();
		//prep_meter_updatelist();
		loading.mapping = [];
		messnamed("output_queue_pointer_reset","bang");
		changed_queue_pointer = 0;
		redraw_flag.flag|=12;
		if(preload_list.length>0) preload_task.schedule(5000); //if you interupted preloading waves, just restart it in 5secs
	}
}

function build_wave_remapping_list(){
	if(songs.contains(songlist[currentsong]+"::waves")){
		var i,a,ii;
		var freelist = []
		post("\nchecking if any waves need remapping");
		for(i=0;i<MAX_WAVES;i++){
			freelist[i]=1;
			ii=i+1;
			if(waves_dict.contains("waves[" +ii+"]::name")) {
				freelist[i]=0;
				post("found an existing wave",i);
			}
		}
//		post("\nfreelist = ",freelist," agelist = ",waves.age);
		for(i=0;i<MAX_WAVES;i++){
			a=-1;
			var lowest = waves.seq_no;
			var lowp=-1;
			do {
				a++;
				if(waves.age[a]<lowest){
					lowest=waves.age[a];
					lowp=a;
				}
				if(a==MAX_WAVES){
					a=lowp;
					freelist[a]=1;
					waves.age[a]=waves.seq_no++;
				}
			} while (freelist[a]==0);
			//post("\nmapping new wave "+i+" to slot "+a);
			waves.remapping[i]=a;
			freelist[a]=0;
		}
		post("\nremapping table goes like this ",waves.remapping);
	}
}

function load_process_block_voices_and_data(block){
	var drawn=1;
	t = blocks.get("blocks["+block +"]::poly::voices");
	if(loading.wait>1) post("\nrestoring block "+block+" voices ("+t+") and data");
	if(t!=1){
		drawn=0;
		blocks.replace("blocks["+block +"]::poly::voices",1)
		voicecount(block, t);
	}
	if(blocks.contains("blocks["+block+"]::voice_data") && voicemap.contains(block)){
		var v_list = voicemap.get(block);
		if(!Array.isArray(v_list)) v_list = [v_list];
		t = v_list.length;
		if(loading.wait>1) post("\n- restoring data, voicelist",v_list,"so vlist lenght is",v_list.length,"and t is",t);
		for(i=0;i<t;i++){
			var vdata= new Array(MAX_DATA);
			//post("\nvoice",i,"index",MAX_DATA*v_list[i]);
			vdata = blocks.get("blocks["+block+"]::voice_data::"+i);
			//post("\nvdata length:",vdata.length);//,"\nvdata:\n",vdata);
			safepoke(voice_data_buffer,1, MAX_DATA*v_list[i], vdata);
		}
	}	
	if(drawn==1) draw_block(block); //used to be outside the loop with a 'draw_blocks()' but maybe this is quicker?)
}

function load_block(block_name,block_index,paramvalues,was_exclusive){
	if(loading.wait>1) post("\nloading block: ",block_name," into ",block_index," was_exclu=",was_exclusive);//,"index",block_index,"paramvalues",paramvalues);
	var new_voice=-1;
	var type = blocktypes.get(block_name+"::type");
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
		//if(type=="hardware") 
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
		hardware_list[new_voice] = block_name;
		offs=MAX_NOTE_VOICES+MAX_AUDIO_VOICES;
	}
	//post("\n\nHERE, VOICEALLOC ",type,block_name,new_voice,offs);
	var ui = blocktypes.get(block_name+"::block_ui_patcher");
	if((ui == "") || (ui == 0) || is_empty(ui)){
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
				safepoke(parameter_error_spread_buffer,1,MAX_PARAMETERS*voiceoffset+i,0);
				safepoke(parameter_static_mod,1,MAX_PARAMETERS*voiceoffset+i,0);
				param_error_drift[voiceoffset][i]=0;
			}
			p_default = 0;
			p_type = params[i].get("type");
			p_values = params[i].get("values");
			if(p_type == "float"){
				if(p_values[0]=="bi"){
					p_default = 0.5;
				}
			}else if(p_type == "wave"){
				var curwav = Math.floor(MAX_WAVES * paramvalues[i+1]);
				post("\nprocessing remapping for block",block_index,block_name," wave was ",curwav," and will be ",waves.remapping[curwav]);
				paramvalues[i+1] = (waves.remapping[curwav]+0.2)/MAX_WAVES;
				loading.wave_paramlist.push([block_index,i]);
			}
			if(params[i].contains("default")){
				p_default = params[i].get("default");
			}
			
			if(i+1<paramvalues.length){
				safepoke(parameter_value_buffer,1, MAX_PARAMETERS*block_index +i,paramvalues[i+1]);
				param_defaults[block_index][i] = paramvalues[i+1]; //p_default; << new blocks the default is the default, when you load a song the default is the startup value of that param in the song instead.
			}else{ // in the rare case that you've added some paramters to a block it should still load saves without errors.
				safepoke(parameter_value_buffer,1, MAX_PARAMETERS*block_index +i,p_default);
				param_defaults[block_index][i] = p_default;
			}
		}		
	}
	// if the block has per-voice data it gets loaded after voicecount
	// tell the polyalloc voice about its new job
	voicealloc_poly.setvalue((block_index +1),"type",type);
	voicealloc_poly.setvalue((block_index +1),"voicelist",(new_voice+1));
	var stack = poly_alloc.stack_modes.indexOf(blocks.get("blocks["+block_index+"]::poly::stack_mode"));
	var choose = poly_alloc.choose_modes.indexOf(blocks.get("blocks["+block_index+"]::poly::choose_mode"));
	var steal = poly_alloc.steal_modes.indexOf(blocks.get("blocks["+block_index+"]::poly::steal_mode"));
	
	voicealloc_poly.setvalue((block_index +1),"stack_mode",stack);  
	voicealloc_poly.setvalue((block_index +1),"choose_mode",choose);
	voicealloc_poly.setvalue((block_index +1),"steal_mode",steal);  
	
	panelslider_visible[block_index] = [];
	
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

function save_song(selectedonly){
	if(selectedonly) post("\nTODO save selected blocks only isn't done yet sorry, this will save the whole thing.");
	post("collecting data to save\n");
//copy current param values into states[0]
	var b,p,psize;
	var store = [];
	var per_v = [];
	for(b=0;b<MAX_BLOCKS;b++){
		if(ui_patcherlist[b]!='blank.ui') ui_poly.setvalue( b+1, "store");//query any ui blocks if they have data to store in data
		store[b] = [];
		per_v[b] = [];
		var vl = voicemap.get(b);
		if(!Array.isArray(vl)) vl = [vl];
		
		if(blocks.contains("blocks["+b+"]::name")){
			psize = blocktypes.getsize(blocks.get("blocks["+b+"]::name")+"::parameters");
			for(p=0;p<psize;p++){ 
				store[b][p+1]=parameter_value_buffer.peek(1, MAX_PARAMETERS*b+p);
				for(var v=0;v<vl.length;v++){
					var tv=parameter_static_mod.peek(1,vl[v]*MAX_PARAMETERS+p);
					if(tv!=0){
						per_v[b].push(v,p,tv); // per voice static parameter mod is stored in savefile as voice, param, modval triplets
					}
				}
			}
			store[b][0] = 0;
			if(blocks.contains("blocks["+b+"]::mute")) store[b][0] = blocks.get("blocks["+b+"]::mute");
		}
	}
	if(states.contains("states::current")) states.remove("states::current");
	for(b=0;b<MAX_BLOCKS;b++){
		if(store[b].length) states.replace("states::current::"+b,store[b]);
		if(per_v[b].length) states.replace("states::current::static_mod::"+b,per_v[b]);
	}
	post("current state stored");
	if(panels_order.length){
		blocks.replace("panels_order",panels_order);
	}
	if(fullscreen){
		fullscreen=0;
		world.message("fullscreen",0);
	}
//copy blocks and connections and states and properties into one dict
	messnamed("trigger_save_as","bang");
	set_sidebar_mode("none");
}

function folder_select(folderstr){
//	post("new songs folder selected",folderstr);
	if(folderstr!="cancel"){
		if(folder_target == "song"){
			SONGS_FOLDER = folderstr;
			post("\nselected new songs folder:",folderstr);
			userconfig.replace("SONGS_FOLDER",folderstr);
			userconfig.writeagain();
			read_songs_folder();
		}else if(folder_target == "record"){
			post("\nselected new record folder:",folderstr);
			config.replace("RECORD_FOLDER",folderstr);
			userconfig.replace("RECORD_FOLDER",folderstr);
			userconfig.writeagain();
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
	audio_poly.setvalue( 0, "kill");
	audio_to_data_poly.setvalue(0, "vis_meter", 0);
	audio_to_data_poly.setvalue(0, "vis_scope", 0);
	audio_to_data_poly.setvalue(0, "out_value", 0);
	audio_to_data_poly.setvalue(0, "out_trigger", 0);
	sidebar.selected_voice = -1;
//	matrix.message("clear"); //clears the audio matrix
	messnamed("clear_matrix","bang");

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
			wires[b][bl].freepeer();
		}
		wires[b] = [];
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
	//messnamed("update_midi_routemap","bang");
	messnamed("MAX_NOTE_VOICES",MAX_NOTE_VOICES);

	post("clearing everything\n");
	sigouts.setvalue(0,0); // clear sigs
	song_select.previous_name="";
	song_select.previous_blocks=[];
	song_select.current_blocks=[];
	song_select.current_name="";
	song_select.show=0;
}
