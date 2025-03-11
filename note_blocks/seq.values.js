var MAX_DATA = 16384;
var MAX_PARAMETERS = 256;
var voice_data_buffer = new Buffer("voice_data_buffer"); 
var voice_parameter_buffer = new Buffer("voice_parameter_buffer");
outlets = 3;
var config = new Dict;
config.name = "config";
var width, height,x_pos,y_pos,unit,sx,rh,cw,maxl=-1;
var block = -1;
var blocks = new Dict;
blocks.name = "blocks"
var voicemap = new Dict;
voicemap.name =  "voicemap";
var mini = 0;
var v_list = [];
var l = [];
var s = [];
var p = [];
var cursors = []; //holds last drawn position of playheads (per row)
//data format: for each voice the buffer holds:
// 0 - start (*128)
// 1 - length (*128+1)
// 2 - playhead position (updated by player voice)
// 3-131? data values
var notelist = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var menucolour,menudark,block_colour=[0,255,0];

function setup(x1,y1,x2,y2,sw){
//	post("drawing sequencers");
	menucolour = config.get("palette::menu");
	MAX_DATA = config.get("MAX_DATA");
	MAX_PARAMETERS = config.get("MAX_PARAMETERS");
	menudark = [menucolour[0]*0.2,menucolour[1]*0.2,menucolour[2]*0.2];
	width = x2-x1;
	mini=0;
	if(width<sw*0.6){ mini=1;}
	height = y2-y1;
	x_pos = x1;
	y_pos = y1;
	unit = height / 18;
	if(block>=0){
		block_colour = blocks.get("blocks["+block+"]::space::colour");
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		draw();
	} 
}

function draw(){
	if(block>=0){
		var i;
		maxl=1;
		for(i=0;i<v_list.length;i++) {
			cursors[i]=-1;
			l[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+3)*127.99)+1;
			s[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+2)*127.99);
			p[i] = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i])*15.99);
			if(l[i]+s[i]>maxl) maxl = l[i]+s[i];
		}
		fulldraw();
	}
}

function fulldraw(){
	var i,c,r,ph;
	cw = (width)/(maxl - 0.1);
	i = Math.max(2 - mini,v_list.length);
	rh = height / i;
	sx = 0;
	for(r=0;r<v_list.length;r++){
		ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[r]));		
		cursors[r]=ph;
		for(c=maxl-1;c>=0;c--){		
			var shade = (c==ph) ? 3 : (0.4+0.6*((c>=s[r])&&(c<s[r]+l[r])));	
			outlet(0,"custom_ui_element","data_v_scroll", sx+c*cw+x_pos,r*rh+y_pos,sx+(0.9+c)*cw+x_pos,(r+0.9)*rh+y_pos,shade * block_colour[0],shade * block_colour[1],shade * block_colour[2],MAX_DATA*v_list[r]+128*p[r]+1+c,1);
			if(!mini){
				outlet(1,"moveto",sx+c*cw+x_pos+0.1*unit,r*rh+y_pos+unit*0.4);
				outlet(1,"write",c);
				i=Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[r]+128*p[r]+1+c)*128);
				if(i>0){
					i--;
					outlet(1,"frgb",menucolour);
					outlet(1,"moveto",sx+c*cw+x_pos+0.1*unit,r*rh+y_pos+unit*0.8);
					outlet(1,"write",i);
					outlet(1,"moveto", sx + c * cw + x_pos + 0.1 * unit, r * rh + y_pos + unit*1.2);
					outlet(1,"write", notelist[i % 12] + "-" + Math.floor(i/12));
				}
			}
		}
	}
}

function update(){
	if(block>=0){
		var r,i;
		maxl=1;
		change = 0;
		for(i=0;i<v_list.length;i++) {
			//cursors[i]=-1;
			var pp = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+7)*15.99);
			if(p[i]!=pp){
				p[i]=pp;
				change = 1;
			}
			var ll = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+3)*127.99)+1;
			if(l[i]!=ll){
				l[i]=ll;
				change = 1;
			}
			ll = Math.floor(voice_parameter_buffer.peek(1, MAX_PARAMETERS*v_list[i]+2)*127.99);
			if(s[i] != ll){
				s[i]=ll;
				change = 1;
			}
			if(l[i]+s[i]>maxl) maxl = l[i]+s[i];
		}
		if(change==1){
			outlet(1,"paintrect",x_pos,y_pos,x_pos+width,y_pos+height,0,0,0);
			fulldraw();
			return 0;
		}		
		for(r=0;r<v_list.length;r++){
			ph = Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[r]));
			if(cursors[r]!=ph){
				//redraw slider that was old cursor
				if((cursors[r]>=0)&&(cursors[r]<maxl)){
					var shade = (0.4+0.6*((cursors[r]>=s[r])&&(cursors[r]<s[r]+l[r])));
					outlet(0,"custom_ui_element","data_v_scroll", sx+cursors[r]*cw+x_pos,r*rh+y_pos,sx+(0.9+cursors[r])*cw+x_pos,(r+0.9)*rh+y_pos,shade *block_colour[0],shade *block_colour[1],shade *block_colour[2],MAX_DATA*v_list[r]+128*p[r]+1+cursors[r],1);
					if(!mini){
						outlet(1,"moveto",sx+cursors[r]*cw+x_pos+0.1*unit,r*rh+y_pos+unit*0.5);
						outlet(1,"write",cursors[r]);
						i=Math.floor(voice_data_buffer.peek(1, MAX_DATA*v_list[r]+128*p[r]+1+cursors[r])*127.99);
						if(i>0){
							i--;
							outlet(1,"frgb",menucolour);
							outlet(1,"moveto",sx+cursors[r]*cw+x_pos+0.1*unit,r*rh+y_pos+unit*0.8);
							outlet(1,"write",i);
							outlet(1,"moveto",sx+cursors[r]*cw+x_pos+0.1*unit,r*rh+y_pos+unit*1.2);
							outlet(1,"write",notelist[i%12]+"-"+Math.floor(i/12));
						}					
					}
				}
				cursors[r]=ph;
				//draw new cursor slider
				if(cursors[r]<maxl){
					outlet(0,"custom_ui_element","data_v_scroll", sx+ph*cw+x_pos,r*rh+y_pos,sx+(0.9+ph)*cw+x_pos,(r+0.9)*rh+y_pos,255,255,255,MAX_DATA*v_list[r]+128*p[r]+1+ph,1);
				}
			}
		}
	}
}

function voice_is(v){
	block = v;
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
	}
}

function voice_offset(){}
function loadbang(){
	outlet(0,"getvoice");
}

function store(){
	messnamed("to_blockmanager","store_wait_for_me",block);
	if(block>=0){
		v_list = voicemap.get(block);
		if(typeof v_list=="number") v_list = [v_list];
		for(var i=0;i<v_list.length;i++){
			maxl=1;
			for(var l = MAX_DATA-1;l>0;l--){
				if(voice_data_buffer.peek(1, MAX_DATA*v_list[i]+l)!=0){
					maxl=l+1;
					l=0;
				}
			}
			var transf_arr = [];
			transf_arr = voice_data_buffer.peek(1, MAX_DATA*v_list[i], maxl);
			blocks.replace("blocks["+block+"]::voice_data::"+i, transf_arr);
		}		
	}else{
		post("error storing seq.values - unknown block",block,v_list);
	}
	messnamed("to_blockmanager","store_ok_done",block);
}

function keydown(key){
	
}
function enabled(){}