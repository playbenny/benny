var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer"); 
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,w4,h4;
var rows = 4;
var cols = 4;
var paramcount = 16;
var block=-1;
var map = new Dict;
map.name = "voicemap";
var blocks = new Dict;
blocks.name = "blocks";
var states = new Dict;
states.name = "states";
var blocktypes = new Dict;
blocktypes.name = "blocktypes";
var connections = new Dict;
connections.name = "connections";
var io = new Dict;
io.name = "io";
var gamutl;
var v_list = [];
var fullscreen = 0;
var endreturns_enabled = 0;
var menucolour,menudark,menumid;
var btnhgt = 0.75;
var clicked = 0;

var conn_no = [];
var conn_target = [];
var conn_inlet = [];
var controllername;

var editmode = 0;
var edittarget = 0; //target dial
var corners = [];
var fontheight = 20;

function setup(x1,y1,x2,y2,sw){ 
	// not done - needs to work out which controller it is, get row and column count from config
	menucolour = config.get("palette::menu");
	menudark = [menucolour[0]*0.2, menucolour[1]*0.2, menucolour[2]*0.2];
	menumid = [menucolour[0]*0.5, menucolour[1]*0.5, menucolour[2]*0.5];
	gamutl = config.getsize("palette::gamut");
	fontheight = config.get("fontheight");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	width = x2-x1;
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	fullscreen = (width > sw * 0.34);
	if(block>=0)get_connections_list();
	w4=width/cols;
	h4=(height - fontheight)/(rows);//+btnhgt);
	draw();
}
function draw(){
	if(block>=0){
		update(1);
		drawbuttons();
	}
}

function drawbuttons() {
	outlet(0, "custom_ui_element", "mouse_passthrough", x_pos, h4 * rows + y_pos, width + x_pos, height + y_pos, 0, 0, 0, block, 0);
	var colour = (clicked == 1) ? menucolour : (editmode) ? menudark : menumid;
	outlet(1, "framerect", x_pos, height - 0.95 * fontheight + y_pos, width * 0.248 + x_pos, height + y_pos - fontheight * 0.1, colour);
	outlet(1, "moveto", x_pos + width * 0.03, y_pos + height - 0.3*fontheight);
	outlet(1, "write", "zero all");
	var colour = (clicked == 2) ? menucolour : (editmode) ? menudark : menumid;
	outlet(1, "framerect", width * 0.252 + x_pos, height - 0.95 * fontheight + y_pos, width * 0.498 + x_pos, height + y_pos - fontheight * 0.1, colour);
	outlet(1, "moveto", x_pos + width * 0.28, y_pos + height - 0.6*fontheight);
	outlet(1, "write", "return to");
	outlet(1, "moveto", x_pos + width * 0.28, y_pos + height - 0.3*fontheight);
	outlet(1, "write", "initial");
	var colour = (clicked == 3) ? menucolour : (editmode) ? menudark : menumid;
	outlet(1, "framerect", width * 0.502 + x_pos, height - 0.95 * fontheight + y_pos, width * 0.748 + x_pos, height + y_pos - fontheight * 0.1, colour);
	outlet(1, "moveto", x_pos + width * 0.53, y_pos + height - 0.6*fontheight);
	outlet(1, "write", "store");
	outlet(1, "moveto", x_pos + width * 0.53, y_pos + height - 0.3*fontheight);
	outlet(1, "write", "initial");
	if(editmode){
		var colour = (clicked == 4) ? menucolour : menumid;
		outlet(1, "paintrect", width * 0.752 + x_pos, height - 0.95 * fontheight + y_pos, width + x_pos, height + y_pos  - fontheight * 0.1, colour);
		outlet(1, "frgb", (clicked != 4) ? menucolour : menudark);
	}else{
		var colour = (clicked == 4) ? menucolour : menumid;
		outlet(1, "framerect", width * 0.752 + x_pos, height - 0.95 * fontheight + y_pos, width + x_pos, height + y_pos  - fontheight * 0.1, colour);
	}
	outlet(1, "moveto", x_pos + width * 0.78,y_pos + height - 0.3*fontheight);
	outlet(1, "write", "edit mode");
}

function update(force){
	var r,b,y,x,c,cc;
	var w = 0.9;
	var changed = Math.floor(voice_data_buffer.peek(1,MAX_DATA*v_list));
	if(force || changed ){
		if(changed>0){
			if(edittarget != changed -1) outlet(1,"paintrect",x_pos,y_pos,x_pos+width,h4 * rows + y_pos, 0,0,0);
			edittarget = changed - 1;
		}
		for(y=0;y<rows;y++){
			for(x=0;x<cols;x++){
				var knobno = x+y*cols;
				var readindex=(MAX_DATA*v_list+knobno+1)|0;
				//r = voice_parameter_buffer.peek(1,(MAX_PARAMETERS*v_list+knobno+2)|0) * gamutl;
				r = voice_data_buffer.peek(1,(readindex + 2*paramcount)|0) * gamutl;
				// r=voice_parameter_buffer.peek(1,(MAX_PARAMETERS*v_list+knobno+2)|0)*1.05;
				// r=((12.6 - (r*r*r))%1) * gamutl;
				r |= 0;
				r %= gamutl;
				//post("\nC is",readindex,r,i,t);
				cc=config.get("palette::gamut["+r+"]::colour"); 
				c = cc;
				if(!editmode){
					b=voice_data_buffer.peek(1,readindex + paramcount);
				}else{
					b = (knobno != edittarget);
				}
				//post("\n",i,t,readindex,b,c[0]);	
				if(b!=0){
					b=0.2;
					c[0] = (cc[0] * b) | 0;
					c[1] = (cc[1] * b) | 0;
					c[2] = (cc[2] * b) | 0;
				}
				outlet(1,"paintrect",w4*(x+0.05)+x_pos,h4*(y+0.05)+y_pos,w4*(x+0.95)+x_pos,h4*(y+0.95)+y_pos,c[0],c[1],c[2]);
				if(!editmode){
					outlet(0,"custom_ui_element","data_v_scroll",w4*(x+0.1)+x_pos,h4*(y+0.1)+y_pos,w4*(x+w)+x_pos,h4*(y+0.9)+y_pos,c[0],c[1],c[2],readindex);
				}else{
					var tx = edittarget % cols;
					if((tx == x) || ((tx<cols*0.5)&&((x<tx)||(x>tx+cols*0.5))) || ((tx>=cols*0.5)&&((x>tx)||(x<tx-cols*0.5)))){
						outlet(0,"custom_ui_element","data_v_scroll",w4*(x+0.1)+x_pos,h4*(y+0.1)+y_pos,w4*(x+w)+x_pos,h4*(y+0.9)+y_pos,c[0],c[1],c[2],readindex);
					}
				}
				if(fullscreen && !editmode && Array.isArray(conn_target[knobno])){
					outlet(1,"frgb",cc[0]*1.2,cc[1]*1.2,cc[2]*1.2);
					for(var i=0;i<conn_target[knobno].length;i++){
						outlet(1,"moveto",w4*(x+0.15)+x_pos,h4*(y+0.2+0.1*i)+y_pos);
						outlet(1,"write", conn_target[knobno][i] + " | " + conn_inlet[knobno][i]);
						outlet(0,"custom_ui_element","select_connection",w4*(x+0.15)+x_pos,h4*(y+0.1+0.1*i)+y_pos,w4*(x+0.85)+x_pos,h4*(y+0.2+0.1*i)+y_pos,conn_no[knobno][i])
					}
				}
			}
		}
		if(editmode){
			var readindex=(MAX_DATA*v_list+edittarget+1)|0;
			var tx = edittarget % cols;
			// var ty = Math.floor(edittarget / cols);
			corners = [];
			if(tx<cols*0.5){
				corners = [x_pos+(tx+1.1) * w4, y_pos+0.1*h4, x_pos+(tx+0.9 + cols*0.5) * w4, h4*(rows-0.1)+y_pos ];
			}else{
				corners = [x_pos + (tx+0.1 - cols*0.5)*w4, y_pos+0.1*h4, x_pos + (tx-0.1)*w4, h4*(rows-0.1)+y_pos ];
			}
			r = voice_data_buffer.peek(1,(readindex + 2*paramcount)|0) * gamutl;
			r |= 0;
			r %= gamutl;
			cc=config.get("palette::gamut["+r+"]::colour"); 
			outlet(1,"paintrect",corners,0,0,0);
			outlet(1,"framerect",corners,cc);
			var y_o = corners[1]+0.5*fontheight;
			outlet(1,"moveto", corners[0]+fontheight*0.1, y_o);
			outlet(1,"frgb",menumid);
			outlet(1,"write","number: "+edittarget);
			y_o += 0.5*fontheight;
			outlet(1,"moveto", corners[0]+fontheight*0.1, y_o);
			outlet(1,"frgb",menumid);
			var val = voice_data_buffer.peek(1,readindex);
			outlet(1,"write","value: ");
			outlet(1,"frgb",menucolour);
			outlet(1,"write",(val*128).toPrecision(3));
			outlet(1, "framerect" , corners[0] * 0.5 + corners[2] * 0.5 ,y_o-fontheight*0.3,corners[2]-fontheight*0.1,y_o+fontheight*0.1,(clicked==5)? menucolour : menudark);
			outlet(1,"moveto", corners[0]*0.5+corners[2]*0.5+ fontheight*0.1, y_o);
			outlet(1,"frgb",menumid);
			outlet(1,"write","store initial");
			y_o += 0.5*fontheight;
			outlet(1,"moveto", corners[0]+ fontheight*0.1, y_o);
			outlet(1,"frgb",cc);
			outlet(1,"write","colour:");
			y_o += 0.5*fontheight;
			var cs = 2*gamutl/(corners[2]-corners[0]- fontheight*0.2);
			c=0;
			for(var x1= Math.floor(corners[0]+fontheight*0.1); x1<corners[2]-fontheight*0.1; x1+=2){
				outlet(1,"frgb",config.get("palette::gamut["+Math.floor(c)+"]::colour"));
				c+=cs;
				outlet(1,"moveto",x1,y_o);
				outlet(1,"lineto",x1,y_o-fontheight*0.4);
			}
			outlet(0, "custom_ui_element", "mouse_passthrough", corners[0],corners[1],corners[2],y_o, 0, 0, 0, block, 0);

			if(endreturns_enabled){
				y_o += 0.5*fontheight;
				outlet(1,"moveto", corners[0]+fontheight*0.1, y_o);
				outlet(1,"frgb",menumid);
				outlet(1,"write","end zone forces:");
				c = menucolour;
				y_o += fontheight * 0.1;
				outlet(0,"custom_ui_element","data_h_scroll",corners[0]+w4*0.2,y_o,corners[2]-w4*0.2,y_o + w4*0.06,c[0],c[1],c[2],readindex+3*paramcount);
				outlet(0,"custom_ui_element","data_h_scroll",corners[0]+w4*0.2,y_o+w4*0.94,corners[2]-w4*0.2,y_o + w4*1,c[0],c[1],c[2],readindex+5*paramcount);
				var x1 = voice_data_buffer.peek(1,readindex+3*paramcount);
				var x2 = voice_data_buffer.peek(1,readindex+5*paramcount);
				y_o += w4 * 0.1;
				outlet(0,"custom_ui_element","data_v_scroll",corners[0]+w4*0.1,y_o,corners[0]+w4*0.16,y_o + w4*0.8,c[0],c[1],c[2],readindex+4*paramcount);
				outlet(0,"custom_ui_element","data_v_scroll",corners[2]-w4*0.16,y_o,corners[2]-w4*0.1,y_o + w4*0.8,c[0],c[1],c[2],readindex+6*paramcount);
				outlet(1,"framerect",corners[0]+w4*0.2,y_o,corners[2]-w4*0.2,y_o+w4*0.8,menudark);
				outlet(1,"moveto",corners[0]+w4*0.2,y_o+w4*0.4);
				outlet(1,"lineto",corners[2]-w4*0.2-2,y_o+w4*0.4);
				outlet(1,"frgb",menucolour);
				var y1 = (1-voice_data_buffer.peek(1,readindex+4*paramcount));
				var y2 = (1-voice_data_buffer.peek(1,readindex+6*paramcount));
				outlet(1,"moveto",corners[0]+w4*0.2,y_o+w4*0.8*y1);
				if(x1<=x2){
					outlet(1,"lineto",corners[0]+x1*(corners[2]-corners[0]-w4*0.4)+w4*0.2,y_o+w4*0.4);
					outlet(1,"lineto",corners[0]+x2*(corners[2]-corners[0]-w4*0.4)+w4*0.2,y_o+w4*0.4);
				}else{
					//the first line has the same gradient as the first one above, but stops at x2's position instead of at x1 (where it hits the axis).
					//eg from y1 to 0.5, but we're taking x2/x1 so y = y1 * (1 - x1/x2) + 0.5 * x1/x2
					outlet(1,"lineto",corners[0]+x2*(corners[2]-corners[0]-w4*0.4)+w4*0.2,y_o+w4*0.8*(y1 * (1 - x2/x1) + 0.5 * x2/x1));
					outlet(1,"lineto",corners[0]+x1*(corners[2]-corners[0]-w4*0.4)+w4*0.2,y_o+w4*0.8*(y2 * (1 - (1-x1)/(1-x2)) + 0.5 * (1-x1)/(1-x2)));
				}
				outlet(1,"lineto",corners[2]-w4*0.2-2,y_o+w4*0.8*y2);
				outlet(1,"frgb",cc);
				outlet(1,"moveto",corners[0]+val*(corners[2]-corners[0]-w4*0.4)+w4*0.2,y_o);
				outlet(1,"lineto",corners[0]+val*(corners[2]-corners[0]-w4*0.4)+w4*0.2,y_o+w4*0.8);
				y_o += w4*0.8 + fontheight * 0.5;
			}
			if(Array.isArray(conn_target[edittarget])){
				y_o += 0.5*fontheight;
				outlet(1,"moveto", corners[0]+ fontheight*0.1, y_o);
				outlet(1,"frgb",menucolour);
				outlet(1,"write","connections:");
				outlet(1,"frgb",cc[0]*1.2,cc[1]*1.2,cc[2]*1.2);
				for(var i=0;i<conn_target[edittarget].length;i++){
					y_o += 0.5*fontheight;
					if(y_o>corners[3])break;
					outlet(1,"moveto",corners[0]+ fontheight*0.1,y_o);
					outlet(1,"write", conn_target[edittarget][i] + " | " + conn_inlet[edittarget][i]);
					outlet(0,"custom_ui_element","select_connection",corners[0]+ fontheight*0.1,y_o-fontheight*0.3,corners[2],y_o+fontheight*0.2,conn_no[edittarget][i]);
				}
			}
		}
		voice_data_buffer.poke(1,MAX_DATA*v_list,0);
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = map.get(block);
		if(typeof v_list!="number") v_list = v_list[0];
		controllername = blocks.get("blocks["+block+"]::selected_controller");
		if(io.contains("controllers::"+controllername)){
			post("\ngetting controller info for ui");
			rows = io.get("controllers::"+controllername+"::rows");
			cols = io.get("controllers::"+controllername+"::columns");
			var type = io.get("controllers::"+controllername+"::type");
			endreturns_enabled = 0;
			if((type == "encoder")||(io.contains("controllers::"+controllername+"::value"))) endreturns_enabled = 1;
			messnamed("to_polys","note","setvalue",v_list+1,"endreturns_enabled",endreturns_enabled);
			paramcount = rows * cols;
			var s = MAX_DATA*v_list+1+paramcount*3;
			for(var i=0;i<paramcount;i++){
				voice_data_buffer.poke(1,s+i,0.1);
				voice_data_buffer.poke(1,s+i+paramcount,0.5);
				voice_data_buffer.poke(1,s+i+paramcount*2,0.9);
				voice_data_buffer.poke(1,s+i+paramcount*3,0.5);
			}
			check_for_legacy_colours();
		}
		get_connections_list();
	}
}

function check_for_legacy_colours(){
	if(states.contains("states::current::"+block)){
		var stored=states.get("states::current::"+block); //legacy colour data is always 131 long
		if(stored.length == 131){
			post("\ncopying legacy led colours");
			for(var i=0;i<paramcount;i++){
				var x = stored[i+3]*1.05;
				x = x*x*x;
				x = (12.63 - x)%1;
				voice_data_buffer.poke(1,MAX_DATA*v_list+1+paramcount*2+i,x);
				post(x);
			}
		}
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function keydown(){}

function mouse(x,y,l,s,a,c,scr){
	clicked = 0;
	if(y>rows*h4+y_pos){
		var x2 = (x - x_pos)*(4/width);
		if(x2<1){//x_pos+0.5*width){
			if(l==1){
				clicked = 1;
			}else{
				//zero all
				//post(" zero");
				for(var i=0;i<rows*cols;i++){
					voice_data_buffer.poke(1,MAX_DATA*v_list+i+1,0);
				}
				voice_data_buffer.poke(1,MAX_DATA*v_list,1);
			}
		}else if(x2<2){
			if(l==1){
				clicked = 2;
			}else{
				//recall from dict
				if(blocks.contains("blocks["+block+"]::voice_data::0")){
					var tra2 = [];
					tra2=blocks.get("blocks["+block+"]::voice_data::0");
					tra2.splice(paramcount+1);
					voice_data_buffer.poke(1, MAX_DATA*v_list, tra2);
				}
			}
		}else if(x2<3){
			if(l==1){
				clicked = 3;
			}else{
				//store to dict
				var transf_arr = []; 
				transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list, 1+ rows*cols);
				transf_arr[0] = 1;
				if(blocks.contains("blocks["+block+"]::voice_data::0")){
					var tra2 = [];
					tra2=blocks.get("blocks["+block+"]::voice_data::0");
					if(tra2.length>transf_arr.length){
						for(var i=transf_arr.length;i<tra2.length;i++) transf_arr[i] = tra2[i];
					}
				}
				blocks.replace("blocks["+block+"]::voice_data::0", transf_arr);
			}
		}else if(x2<4){
			if(l==1){
				clicked = 4;
			}else{
				editmode = 1 - editmode;
				if(editmode == 1){
					voice_data_buffer.poke(1,MAX_DATA*v_list,edittarget+1); // forces a redraw
				}
			}
		}
	}else{
		ty = (y-corners[1])/fontheight;
		post("\nedit?",ty,x);
		if(ty>0.6){
			if(ty<1.1){
				if(l){
					clicked = 5;
				}else{
					var readindex=(MAX_DATA*v_list+edittarget+1)|0;
					blocks.replace("blocks["+block+"]::voice_data::0["+edittarget+1+"]",voice_data_buffer.peek(1,readindex));
				}
			}else if(ty<2.02){
				var nc = Math.max(0,Math.min(1,(x - corners[0] - w4*0.1) / (w4 * 1.8)));
				voice_data_buffer.poke(1,MAX_DATA*v_list + 1 + paramcount*2 + edittarget,nc);
				// post("\ncolour",nc,"to",paramcount*2 + edittarget,paramcount*2 , edittarget);
			}
		}
	}
}
	
function store(){
	/*
	messnamed("to_blockmanager","store_wait_for_me",block);
	//store needs to store some of the data, but not all!
	var transf_arr = [];
	transf_arr = voice_data_buffer(1, MAX_DATA*v_list + 1+paramcount*2, 5*paramcount);
	if(blocks.contains("blocks["+block+"]::voice_data::0")){ //copy existing section of data to retain it
		var tra2 = [];
		tra2=blocks.get("blocks["+block+"]::voice_data::0");
		for(var i=1;i<=paramcount;i++) transf_arr[i]=tra2[i];
	}else{
		for(var i=1;i<=rows*cols;i++) transf_arr[i]=0;
	}
	transf_arr[0] = 1;
	blocks.replace("blocks["+block+"]::voice_data::0", transf_arr);
	messnamed("to_blockmanager","store_ok_done",block);*/
}


function enabled(){}

function get_connections_list(){
	if(controllername != blocks.get("blocks["+block+"]::selected_controller")) voice_is(block);
	conn_no = [];
	conn_target = [];
	conn_inlet = [];
	for(var i=0;i<connections.getsize("connections");i++){
		if(connections.contains("connections["+i+"]::from")){
			if(connections.get("connections["+i+"]::from::number") == block){
				var knobno = connections.get("connections["+i+"]::from::output::number");
				var target = connections.get("connections["+i+"]::to::number");
				var targetname = blocks.get("blocks["+target+"]::name");
				var targetlabel = blocks.get("blocks["+target+"]::label");
				var tl = targetlabel.split('.');
				if(tl.length > 2){
					var ta = tl.pop();
					var tb = tl.pop();
					targetlabel = tb+"."+ta;
				}
				var target_inlet = connections.get("connections["+i+"]::to::input::number");
				var type = connections.get("connections["+i+"]::to::input::type");
				if(type != "parameters"){
					var target_inlet_label = blocktypes.get(targetname+"::connections::in::"+type+"["+target_inlet+"]");
				}else{
					var target_inlet_label = blocktypes.get(targetname+"::parameters["+target_inlet+"]::name");
				}
				if(!Array.isArray(conn_no[knobno])){
					conn_no[knobno] = [];
					conn_target[knobno] = [];
					conn_inlet[knobno] = [];
				}
				conn_no[knobno].push(i);
				conn_target[knobno].push(targetlabel);
				conn_inlet[knobno].push(target_inlet_label);
				//post("\n- found relevant connection:",i,knobno,target,targetname,targetlabel,target_inlet,type,target_inlet_label);
			}
		}
	}
}