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
        var loadb = this.patcher.newdefault(0, 0, "loadbang");
        for(var b=0;b<blockstoadd.length;b++){
            var bn = blockstoadd[b].get("name");
            var patcher = blocktypes.get(bn+"::patcher");
            var voices = blockstoadd[b].get("poly::voices");
            post("\nadding block:",bn,"with patcher",patcher,",",voices,"voice(s)");
            polys[b] = this.patcher.newdefault(10+180*x, 80*y, "poly~","blank.audio",voices);
            controls[ii] = this.patcher.newdefault(10+180*x, 80*y-20, "message");
            controls[ii].message("set", "patchername", patcher);
            ii++;
            controls[ii] = this.patcher.newdefault(70+180*x, 80*y+25, "sel","getvoice");
            ii++;
            controls[ii] = this.patcher.newdefault(70+180*x, 80*y+50, "message");
            controls[ii].message("set", "voice_offset",voiceoffset+paramoffsets[b],",","voice_is",(voiceoffset+paramoffsets[b])/MAX_PARAMETERS);
            ii++;
            controls[ii] = this.patcher.newdefault(70+180*x, 80*y+75, "prepend","setvalue",0);
            this.patcher.connect(loadb,0,controls[ii-3],0);
            this.patcher.connect(controls[ii-3],0,polys[b],0);
            this.patcher.connect(polys[b],2,controls[ii-2],0);
            this.patcher.connect(controls[ii-2],0,controls[ii-1],0);
            this.patcher.connect(controls[ii-1],0,controls[ii-0],0);
            this.patcher.connect(controls[ii],0,polys[b],0);
            x++;
            ii++;
            if(x>=columns){x=0;y++;}
            polys[b].patchername(patcher); //only load the real patcher once it's all wired up ready
        }

        var connectionstoadd = new_encapsulated.get(name+"::encapsulated::connections");
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
            var mute = connectionstoadd[c].get("conversoin::mute");
            if(mute){
                //skip it
            }else{
                if((ftyp=="audio")&&(ttyp=="audio")){
                    var mx,my;
                    if(fb<0){
                        mx = 10+100*(-fb-1); 
                        my = 30;    
                    }else{
                        mx = fb % columns;
                        my = 1 + Math.floor(fb/columns);
                        mx *= 180;
                        my *= 80;
                    }
                    controls[ii] = this.patcher.newdefault(mx, my, "*~", gain);
                    if(fb<0){
                        this.patcher.connect(audio_ins[-1-fb],0,controls[ii],0);
                        this.patcher.connect(controls[ii],0,polys[tb],tno);
                    }else if(tb<0){
                        this.patcher.connect(polys[fb],fno,controls[ii],0);
                        this.patcher.connect(controls[ii],0,audio_outs[-1-tb],0);
                    }else{
                        this.patcher.connect(polys[fb],fno,controls[ii],0);
                        this.patcher.connect(controls[ii],0,polys[tb],tno);
                    }
                    ii++;
                }
            }
        }
    }
}