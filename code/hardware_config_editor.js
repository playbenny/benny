outlets = 1;
inlets = 1;

/*
var myObj = this.patcher.newdefault(<obj_pos_x>, <obj_pos_y>, "<max_obj_name>");

Add arguments to Object when creating it:
var anotherObject = p.newdefault(100, 100, "combine", "text", "::", "moretext")

Add Object to Presentation:
maxObject.presentation(1); // note that it's a function

Move Object:maxObject.message("patching_position", [posX, posY]);

Create a new "bpatcher" object with attributes:
var myNewObject = p.newdefault(100, 100, "bpatcher", "@name", "myPatch", "@args", name);

Get patcher file path: var filepath = this.patcher.filepath;
*/

function loadbang(){
	post("\nhardware editor starting");
	var filepath = this.patcher.filepath;
	post("\n path is",filepath);
	myObj = this.patcher.newdefault(10, 10, "umenu");
	myObj.message("append","test1");
	myObj.message("append","test2");
}
