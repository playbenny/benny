let blocks, connections;
let vertices, edges;

let listSources = [];
let listLoops = [];
let listSinks = [];

function msg_dictionary(a){
	if(a.blocks){
		// post("blocks dict");
		blocks = JSON.parse(JSON.stringify(a.blocks));
    // post("\nBLOCKS:",JSON.stringify(blocks));
	}else if(a.connections){
		// post("connections dict");
    connections = JSON.parse(JSON.stringify(a.connections));
    // post("\n",JSON.stringify(connections));
    build_graph();
    calculate_levels();
    build_graph();
    currentChain = 0;
    chains = [];
    calculate_chains();
    findMinimalHittingSet();
    draw();
	}
	//post(JSON.stringify(a));
}

function build_graph(){
  vertices = [];
  incount = [];
  outcount = []; //index by vertice number = block number
  edges = [];

  blocks.forEach((b,i) => {
    if(b.name){
      vertices.push(i);
      incount[i] = 0;
      outcount[i] = 0;
    }
  });
    // it needs the connections in order of lowest voice# (eg 1, 2, [3,4,5], [7,8], "all") so do this as 2 passes
    // for each block, look at all the connections that go from it, store connectionno / lowestvoice as pairs
  connections.forEach((c) => {
    if(c.from){
      let lv;
      if(c.from.voice == "all"){
        lv = -1;
      }else if(Array.isArray(c.from.voice)){
        lv = Math.min(...c.from.voice);
      }else{
        lv = c.from.voice;
      }
      edges.push([c.from.number , c.to.number, lv]);
      // post("\nconnection:",i,": [",c.from.number,",",c.to.number,"]");    
    }
  });
  // post("\nconnections pre sort:\n\n",JSON.stringify(edges));
  edges.sort((a,b) => a[2] - b[2]);
  edges.forEach((e) => {
    outcount[e[0]]++;
    incount[e[1]]++;
    let dummy = e.pop();}
  );
  // post("\n\nconnections after sort:\n\n",JSON.stringify(edges));
}

let level = 0;
let blocklevel,levelblocks,endlevelblocks;

function calculate_levels(){
  // how many steps is any given block from either end?
  blocklevel = [];
  levelblocks = [];
  endlevelblocks = [];
  let reps = 0;
  let minlevel = -1;
  let maxlevel = 0;

  while(vertices.length && reps++<999){
    level = minlevel;
    while(removeALayerOfSinks()){
      level--;
    }
    minlevel = level;
    level = maxlevel;
    while(removeALayerOfSources()){
      level++;
    }
    maxlevel = level;
    while(removeMostDifferent()){
      level++;
    }
  }
  post("\ncompleted ordering in",reps,"steps");
  let middleoffset = level - minlevel - 1;
  blocklevel.forEach((bl,b) => {
    bl.forEach((l,i) => {
      if(l<0) blocklevel[b][i]+=middleoffset;
    });
  });
  endlevelblocks.forEach((lb,i)=>{
    if(lb.length) levelblocks[middleoffset-i] = [...endlevelblocks[i]];
  });
  // levelblocks.forEach((l,i) => {post("\nlevelblocks:",i," is ",...l)});
}

function removeMostDifferent() {
  let maxd = -1;
  let mdi = null;
  vertices.forEach((v, i) => {
    let d = outcount[v] - incount[v];
    // post("\nvertex",v,"d",d);
    if (d > maxd) {
      // post("MAX");
      maxd = d;
      mdi = i;
    }
  });
  if (mdi != null) {
    post("\nremove most different - ",vertices[mdi]);
    storeBlockLevel(vertices[mdi],level);
    listLoops.push(vertices[mdi]);
    for (let e = 0; e < edges.length;) {
      if (edges[e][0] == vertices[mdi]) {
        incount[edges[e][1]]--;
        edges.splice(e, 1);
      } else if (edges[e][1] == vertices[mdi]) {
        outcount[edges[e][0]]--;
        edges.splice(e, 1);
      } else {
        e++;
      }
    }
    vertices.splice(mdi, 1);
    return 1;
  }
  return 0;
}

function removeALayerOfSinks(){
  let queue = [];
  vertices.forEach((v) => {
    if(outcount[v]==0 && blocks[v].name.split('.')[0] != 'core') queue.push(v);
  });
  if(queue.length){
    post("\nremoving a layer of sinks, level",-level,":",...queue);
    endlevelblocks[-level] = [...queue];
    queue.forEach(v => {
      removeSink(v);
    });
    return 1;
  }else{
    endlevelblocks[-level] = [];
    return 0;
  }
}

function removeALayerOfSources(){
  let queue = [];
  vertices.forEach((v) => {
    if(incount[v]==0) queue.push(v);
  });
  if(queue.length){
    post("\nremoving a layer of sources, level",level,":",...queue);
    levelblocks[level] = [...queue];
    queue.forEach(v => {
      removeSource(v);
    });
    return 1;
  }else{
    return 0;
  }
}

function removeSink(v){
  for (let e = 0; e < edges.length;) {
    if (edges[e][1] == v) {
      outcount[edges[e][0]]--;
      edges.splice(e, 1);
    } else {
      e++;
    }
  }
  storeBlockLevel(v,level);
  listSinks.unshift(v);
  vertices.splice(vertices.indexOf(v), 1);
}

function removeSource(v){
  for (let e = 0; e < edges.length;) {
    if (edges[e][0] == v) {
      incount[edges[e][1]]--;
      edges.splice(e, 1);
    } else {
      e++;
    }
  }
  storeBlockLevel(v,level);
  listSources.push(v);
  vertices.splice(vertices.indexOf(v), 1);
}

function storeBlockLevel(v,l){
  if(!Array.isArray(blocklevel[v])) blocklevel[v] = [];
  blocklevel[v].push(l);
  // post("\nstored block level",v,l,"so now:",blocklevel[v]);
}

let currentChain = 0;
let chains = [];
function calculate_chains(){
  // this should run down the trees, assigning things a y coordinate (x in old benny)
  currentChain = 0;
  const startinglist = levelblocks.slice(-1)[0];
  post("\nchainfinding: start from blocks in last row:", startinglist);
  startinglist.forEach(v => { //for each thing in the last row:
    // post("\nSTART:",v);
    getChain(v, [v]);
    currentChain++;
  });
}

function getChain(v, visited){
  //returns all the chains vertex v is in.
  visited.push(v);
  if(currentChain>59)return currentChain;
  post("\n-->",v,blocks[v].name,"level",blocklevel[v],"chains",JSON.stringify(chains[v]));
  let ret = chains[v];
  if(!Array.isArray(ret))ret=[];
  let queue = [];
  if(blocklevel[v]>0){
    edges.forEach((e) => {
      if(e[1] == v){
        if(e[0] != v){
          if((parseInt(blocklevel[e[0]]) > parseInt(blocklevel[e[1]])) && Array.isArray(chains[e[1]]) && chains[e[1]].length>0){
            post("\nfeedback loop, stopped recursion",parseInt(blocklevel[e[0]]),parseInt(blocklevel[e[1]]));
          }else if(queue.indexOf(e[0]) == -1 && visited.indexOf(e[0]) == -1){
            queue.push(e[0]);
          }
        }
      }
    });
    post("\nfrom block",v,"queue created is:",queue);
    queue.forEach((t,i) => {
      if(i>0){
        currentChain++;
      }
      post("->",t);
      let r = [...getChain(t,visited)];
      r.forEach((i) => {
        if(ret.indexOf(i)==-1) ret.push(i); 
      });
    });
  }
  if(ret.indexOf(currentChain)==-1) ret.push(currentChain);
  chains[v] = [...ret];
  post("\nblock",v,"is now in these chains:",...ret);
  return ret;
}

// todo:
// remove the items that are in a loop. (via the 'remove most different' thing) and flag them as such!
//   - use a new array s3 for the loopy ones.
// use connections dict instead of edges so that you can do the recursion in order of the voice things
// are connected to.
// check it's not adding too many rows by mistake?
// find a way to get the minimal set that intersects all of these? ('minimal hitting set')
// "If you want to enumerate all minimal sets X then you can do it this way: start with X 
// = union of all sets; find the next element of X than can be removed; then make two recursive calls,
//  one where this element is removed, and one where this element is marked as "don't remove"."
//implement scroll through rows - the selected row is in the center of the screen.
function draw(scroll){
  if(scroll == null) scroll = 10;

  let maxlev;

  for(let v = 0;v<blocks.length;v++){
    if(Array.isArray(blocklevel[v])){
      maxlev = 900; //minlev = 0;
      blocklevel[v].forEach(l => {
        maxlev = Math.min(maxlev, l);
        // minlev =*/ Math.min(maxlev, l);
      });
      blocks[v].space.y = maxlev * -1.25;
      blocks[v].space.experiment_x = maxlev;
      post("\nblock",v,blocks[v].name,"level",maxlev,"levelblocks[]",levelblocks[maxlev],"chains",chains[v]);
      if(Array.isArray(chains[v])){
        let dist = 999;
        let closest;
        chains[v].forEach(x => {
          if(Math.abs(x-scroll)<dist){
            dist = Math.abs(x-scroll);
            closest = x;
          }
        })
        blocks[v].space.x = (closest) * 2.5;
        blocks[v].space.experiment_y = closest;
      }else{
        blocks[v].space.x = -2;
      }
    }
  }
  let od = { 'blocks': blocks };
  outlet_dictionary(0, od);
}

function findMinimalHittingSet(){
  //looking for the minimum set that intersects with every single block's "chains" array.
  // algorithm goes: initialise with the union of all, 
  let hitting = [];
  for(let i=0;i<currentChain;i++) hitting.push(i);
  // then iterate, for each chain number, 
  
  let shortest = 999;
  let reps = 0;
  removeAndTest(0, hitting);
  hitting = hitting.filter((v) => v!=-1);
  post("\n\nminimalhittingset", ...hitting);
  for(i=0;i<chains.length;i++) cleanChain(i);
  return hitting;
  // 2 branches, one with it removed and one with it kept.
  // test fn takes (where_you_re_up_to, [array of not removed things])
  function removeAndTest(step, testme){
    if(reps++ > 9999) return -1;
    // post("\nremoveandtest",step,">>",...testme);
    if(step < testme.length && testIntersections(testme)){
      let newtest = [...testme];
      newtest[step] = -1;
      removeAndTest(step+1,newtest);
      removeAndTest(step+1,testme);
    }
    let count = testme.length;
    testme.forEach(t => {if(t==-1)count--;});
    // post("\nlength:",count);
    if(count<shortest){
      post("\nSTORED:",count);//...testme);
      shortest = count;
      hitting = [...testme];
    }
  }
  function testIntersections(testme){
    for(let v = 0;v<blocks.length;v++){
      if(Array.isArray(chains[v])){
        let found = 0;
        for(var i=0; i<chains[v].length; i++){
          l = chains[v][i];
          if(testme.indexOf(l)!=-1){
            found = 1;
            i = 9999999999;
          }
        }
        if(found == 0 )return 0;
      }
    }
    return 1;
  }
  function cleanChain(v){
    if(!Array.isArray(chains[v])){
      post("\nFAULT: chain was empty?",v,chains[v], typeof chains[v]);
      chains[v]=[chains[v]];
    }      
    chains[v].forEach((t,i)=> {
      chains[v][i] = hitting.indexOf(chains[v][i]);
    });
    chains[v] = chains[v].filter((x) => x>-1);
  }
}
  // post("\nio counts:");
  /*for(i=0;i<vertices.length;){
    v = vertices[i];
    // post("\nblock:",v," in",incount[v]," out",outcount[v]);
    if (incount[v]==0 && outcount[v]==0){
      // post(" no connections, column -1");
      column[v] = -1;
      vertices.splice(i,1);
    }else{
      i++;
    }
  }
  /*vertices.forEach((v) => {
    post("\nblock:",v," in",incount[v]," out",outcount[v]);
  });*/



/*
let s1 = []; 
let s2 = [];
let currentcol = 0;
let sorted = [];
function algorithmGR(){
  s1 = [];
  s2 = [];
  currentcol = 0;
  seplevel = 0;
  let reps = 0;
  while((reps++) < 999 && vertices.length>0){
    removeSinks();
    removeSources();
    currentcol++;
    removeMostDifferent();
  }
  post("\nlist1",s1,"\nlist2",s2);
  sorted = [...s1,...s2];
  post("\nsorted list:");//, s);
}

// layout algo
// set all sources to x = 0, lay out in order 

function alignBlocksColumnsMethod() {
  let subgraph_y = new Array(100).fill(0);
  let topx = 0;
  let max_sgy = 0;
  for (seplevel = 0; (seplevel<99 && ((subgraph_count[seplevel] | 0) <= 1)); seplevel++);
  post("\nbase seplevel", seplevel);
  sorted.forEach((b) => {
    post("\nblock", b, blocks[b].label);
    let sg = subgraph[b][seplevel];
    if (sg == null) {
      sg = subgraph_y.indexOf(max_sgy);
    }
    subgraph_y[sg] = (subgraph_y[sg] | 0) + 1;
    max_sgy = Math.max(max_sgy, subgraph_y[sg]);
    if (column[b] == -1) {
      blocks[b].space.x = 5 * topx;
      topx++;
      blocks[b].space.y = 5;
    } else {
      blocks[b].space.x = 5 * sg;
      blocks[b].space.y = -1.5 * subgraph_y[sg];
    }
    post("level:",blocklevel[b]);
    post("xy:", blocks[b].space.x, ",", blocks[b].space.y, "subgraphs:", subgraph[b]);
  });
  let od = { 'blocks': blocks };
  outlet_dictionary(0, od);
}

function removeMostDifferent() {
  let maxd = -1;
  let mdi = null;
  vertices.forEach((v, i) => {
    let d = outcount[v] - incount[v];
    // post("\nvertex",v,"d",d);
    if (d > maxd) {
      // post("MAX");
      maxd = d;
      mdi = i;
    }
  });
  if (mdi != null) {
    // post("\nremove most different\n - ",vertices[mdi]);
    s1.push(vertices[mdi]);
    column[vertices[mdi]] = currentcol;
    for (let e = 0; e < edges.length;) {
      if (edges[e][0] == vertices[mdi]) {
        // post("and connection",e,"(",edges[e],")");
        incount[edges[e][1]]--;
        // post("new incount",incount[edges[e][1]]);
        edges.splice(e, 1);
      } else if (edges[e][1] == vertices[mdi]) {
        // post("and connection",e,"(",edges[e],")");
        outcount[edges[e][0]]--;
        // post("new outcount",outcount[edges[e][0]]);
        edges.splice(e, 1);
      } else {
        e++;
      }
    }
    vertices.splice(mdi, 1);
  }
}

function removeSources() {
  let i;
  let max=-1;
  for(let ii = 0; ii < vertices.length; ii++){
    if((incount[vertices[i]] == 0) && (outcount[vertices[ii]]>max)){
      max = outcount[vertices[ii]];
      i = ii;
    }
  }
  let reps = 0;
  while((reps++ < 999) && max>-1){
    if (incount[vertices[i]] == 0) {
      post("\nremove sources",i);
      // post("\n - ",vertices[i],blocks[vertices[i]].name);
      s1.push(vertices[i]);
      column[vertices[i]] = currentcol;
      for (let e = 0; e < edges.length;) {
        if (edges[e][0] == vertices[i]) {
          // post("and connection",e,"(",edges[e],")");
          incount[edges[e][1]]--;
          // post("new incount",incount[edges[e][0]]);
          edges.splice(e, 1);
        } else {
          e++;
        }
      }
      vertices.splice(i, 1);
      max=-1;
      i = 0;
      for(let ii = 0; ii < vertices.length; ii++){
        if((incount[vertices[i]] == 0) && (outcount[vertices[ii]]>max)){
          max = incount[vertices[ii]];
          i = ii;
        }
      }
    } else {
      i++;
    }
  }
}

blocklevel = [];// indexed by block, -1 = rightmost, -2 next over left etc..
function removeSinks() {
  post("\nremovesinks");
  // rewrite this to remove a whole layer of sinks at a time, and tag them as a 'level'
  let level = -1;
  let count = 1;
  while(count>0){
    count = 0;
    for (let i = 0; i < vertices.length;i++) {
      if (outcount[vertices[i]] == 0) {
        count++;
        post("\nremove ",vertices[i],blocks[vertices[i]].name);
        s2.unshift(vertices[i]);
        column[vertices[i]] = currentcol;
        blocklevel[vertices[i]] = level;
      }
    }
      post("count was ",count);
    if(count>0){
      for (let i = 0; i <vertices.length;){
        if (outcount[vertices[i]] == 0) {
          for (let e = 0; e < edges.length;) {
            if (edges[e][1] == vertices[i]) {
              // post("and connection",e,"(",edges[e],")");
              outcount[edges[e][0]]--;
              post("new outcount",outcount[edges[e][0]]);
              edges.splice(e, 1);
            } else {
              e++;
            }
          }
          vertices.splice(i, 1);
        } else {
          i++;
        }
      }
      findSeparate();
      level--;
    }
  }
}

let seplevel = 0;

function findSeparate(){
  let label = 0;
  vertices.forEach((v,i) => {
    // post("\ntest starting at",v);
    label += floodFill(v,label);
  });
  post("\non level:",seplevel,"found ",label,"subgraphs");
  subgraph_count[seplevel] = label;
  seplevel++;
}

function floodFill(v,label){
  // post("fill",v);
  if(subgraph[v][seplevel]==null){
    subgraph[v][seplevel] = label;
    edges.forEach((e) => {
      // if(e[1]==v) floodFill(e[0],label);
      if(e[0]==v) floodFill(e[1],label);
    });
    return 1;
  }
  return 0;
}

*/