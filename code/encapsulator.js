outlets = 1;
inlets = 1;

var blocks = new Dict;
blocks.name = "blocks";
var blocktypes = new Dict;
blocktypes.name = "blocktypes";
var new_encapsulated = new Dict;
new_encapsulated.name = "new_encapsulated";
var voicemap = new Dict;
voicemap.name = "voicemap";
var config = new Dict;
config.name = "config";

var block=-1;
var controls = [];
var polys = [];
var voice=-1;

var connectionstoadd = [];
var connectionswithvectordelay=[];

function blockno(bb){
    if(block!=bb){
        block=bb;
        var columns = 3;
        voice = voicemap.get(bb);
        if(Array.isArray(voice))voice=voice[0];
        var MAX_PARAMETERS = config.get("MAX_PARAMETERS");
        var voiceoffset = MAX_PARAMETERS * voice;
        var ii=0;
        var name = new_encapsulated.getkeys();
        post("\nencapsulator is birthing a new block. \nname:",name);
        var blockstoadd = new_encapsulated.get(name+"::encapsulated::blocks");
        if(!Array.isArray(blockstoadd))blockstoadd=[blockstoadd];
        var x=0; var y=1;
        var paramoffsets = new_encapsulated.get(name+"::param_offsets");
        var loadb = this.patcher.newdefault(300, 10, "loadbang");
        var midiroute = this.patcher.getnamed("midiroute");
        var m2=0;
        for(var b=0;b<blockstoadd.length;b++){
            var bn = blockstoadd[b].get("name");
            var patcher = blocktypes.get(bn+"::patcher");
            var voices = blockstoadd[b].get("poly::voices");
            post("\nadding block:",bn,"with patcher",patcher,",",voices,"voice(s)");
            polys[b] = this.patcher.newdefault(10+200*x, 200*y, "poly~","blank.audio",voices);
            controls[ii] = this.patcher.newdefault(10+200*x, 200*y-50, "message");
            controls[ii].message("set", "patchername", patcher);
            ii++;
            controls[ii] = this.patcher.newdefault(70+200*x, 200*y+30, "sel","getvoice");
            ii++;
            controls[ii] = this.patcher.newdefault(70+200*x, 200*y+60, "message");
            controls[ii].message("set", "voice_offset",voiceoffset+paramoffsets[b],",","voice_is",(voiceoffset+paramoffsets[b])/MAX_PARAMETERS);
            ii++;
            controls[ii] = this.patcher.newdefault(70+200*x, 200*y+90, "prepend","setvalue",0);
            this.patcher.connect(loadb,0,controls[ii-3],0);
            this.patcher.connect(controls[ii-3],0,polys[b],0);
            this.patcher.connect(polys[b],2,controls[ii-2],0);
            this.patcher.connect(controls[ii-2],0,controls[ii-1],0);
            this.patcher.connect(controls[ii-1],0,controls[ii-0],0);
            this.patcher.connect(controls[ii],0,polys[b],0);
            ii++;
            //532 271
            var mins = [];
            if(blocktypes.contains(bn+"::connections::in::midi")) mins = blocktypes.get(bn+"::connections::in::midi");
            if(!Array.isArray(mins))mins = [mins];
            for(var m=0;m<mins.length;m++){
                controls[ii] = this.patcher.newdefault(532 + 20*m2, 300+120*m2,"unpack 0 0.");
                this.patcher.connect(midiroute,m2,controls[ii],0);
                ii++;
                controls[ii] = this.patcher.newdefault(532 + 20*m2, 330+120*m2,"+",128*m);
                this.patcher.connect(controls[ii-1],0,controls[ii],0);
                ii++;
                controls[ii] = this.patcher.newdefault(532 + 20*m2, 360+120*m2,"pack 0 0.");
                this.patcher.connect(controls[ii-2],1,controls[ii],1);
                this.patcher.connect(controls[ii-1],0,controls[ii],0);
                ii++;
                controls[ii] = this.patcher.newdefault(532 + 20*m2, 390+120*m2,"prepend","notes");
                this.patcher.connect(controls[ii-1],0,controls[ii],0);
                this.patcher.connect(controls[ii],0,polys[b],0);
                ii++;
                m2++;
            }
            x++;
            if(x>=columns){x=0;y++;}
            polys[b].patchername(patcher); //only load the real patcher once it's all wired up ready
        }

        connectionstoadd = new_encapsulated.get(name+"::encapsulated::connections");
        var audio_ins = [];
        var audio_outs = [];
        audio_ins[0] = this.patcher.getnamed("audio_in_1");
        audio_ins[1] = this.patcher.getnamed("audio_in_2");
        audio_outs[0] = this.patcher.getnamed("audio_out_1");
        audio_outs[1] = this.patcher.getnamed("audio_out_2");

        for(var c=0;c<connectionstoadd.length;c++){
            var fb = connectionstoadd[c].get("from::number");
            var tb = connectionstoadd[c].get("to::number");
            post("\nconnection",fb,tb);
            var ftyp = connectionstoadd[c].get("from::output::type");
            var ttyp = connectionstoadd[c].get("to::input::type");
            post("types",ftyp,ttyp);
            var fno = connectionstoadd[c].get("from::output::number");
            var tno = connectionstoadd[c].get("to::input::number");
            var gain = connectionstoadd[c].get("conversion::scale");
            var mute = connectionstoadd[c].get("conversion::mute");
            if(mute){
                //skip it
            }else{
                if((ftyp=="audio")&&(ttyp=="audio")){
                    //check if this connection completes a feedback loop. ie
                    //start at the destination, trace out all possible trees from that block
                    var feedback = traceaudiotree(tb,fb);
                    if(feedback){
                        post("\nfeedback loop found for connection",c,"tapin/out inserted");
                        connectionswithvectordelay[c]=1;
                    }
                    //if any of those hit the source block, boom. insert a delay on this wire.
                    //flag the wires that have delays already on them.
                    var mx,my;
                    if(fb<0){
                        mx = 10+200*(-fb-1); 
                        my = 40;    
                    }else{
                        mx = fb % columns;
                        my = 1 + Math.floor(fb/columns);
                        mx *= 200;
                        my *= 200;
                        my += 30;
                    }
                    controls[ii] = this.patcher.newdefault(mx, my, "*~", gain);
                    var iii=ii;
                    if(feedback==1){
                        ii++;
                        controls[ii] = this.patcher.newdefault(mx,my+30,"tapin~",1);
                        this.patcher.connect(controls[ii-1],0,controls[ii],0);
                        ii++;
                        controls[ii] = this.patcher.newdefault(mx,my+60,"tapout~",1);
                        this.patcher.connect(controls[ii-1],0,controls[ii],0);
                    }

                    if(fb<0){
                        this.patcher.connect(audio_ins[-1-fb],0,controls[iii],0);
                        this.patcher.connect(controls[ii],0,polys[tb],tno);
                    }else if(tb<0){
                        this.patcher.connect(polys[fb],fno,controls[iii],0);
                        this.patcher.connect(controls[ii],0,audio_outs[-1-tb],0);
                    }else{
                        this.patcher.connect(polys[fb],fno,controls[iii],0);
                        this.patcher.connect(controls[ii],0,polys[tb],tno);
                    }
                    ii++;
                }else if((ftyp=="midi")&&(ttyp=="midi")){
                    if(fb<0){

                    }
                }
            }
        }
    }
}

function traceaudiotree(examine,avoid){
    for(var c=0;c<connectionstoadd.length;c++){
        if(connectionswithvectordelay[c] != 1){
            if((connectionstoadd[c].get("from::number")==examine)&&(connectionstoadd[c].get("from::output::type")=="audio")&&(connectionstoadd[c].get("to::input::type")=="audio")){
                var t = connectionstoadd[c].get("to::number");
                if(t==avoid){
                    return 1;
                }else{
                    var r = traceaudiotree(t,avoid);
                    if(r==1) return 1;
                }
            }
        }
    }
    return 0;
}