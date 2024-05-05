outlets = 1;
inlets = 1;

var blockno = -1;
var blocks = new Dict();
blocks.name = "blocks";

var selected_in_dict = null;

function loadbang(){
    post("\ncontroller manager loaded");
}

function block(blockno){
    if(blocks.contains("blocks["+blockno+"]::name")){
        post("\nfound block");
        if(blocks.contains("blocks["+blockno+"]::selected_controller")){
            selected_in_dict = blocks.get("blocks["+blockno+"]::selected_controller");
            post("\ncontroller selection from savefile:",selected_in_dict);
        }else{
            post("\nno controller selection found in dict");
        }
    }
}