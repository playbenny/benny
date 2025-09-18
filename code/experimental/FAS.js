let blocks, connections;
let vertices, edges;

let s1 = [];
let s2 = [];

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
  connections.forEach((c,i) => {
    if(c.from){
      edges.push([c.from.number , c.to.number]);
      outcount[c.from.number]++;
      incount[c.to.number]++;
      // post("\nconnection:",i,": [",c.from.number,",",c.to.number,"]");
    }
  });
}

let level = 0;
let blocklevel,levelblocks,endlevelblocks;

function calculate_levels(){
  // how many steps is any given block from either end?
  blocklevel = [];
  levelblocks = [];
  endlevelblocks = [];
  let reps = 0;
  level = -1;
  while(vertices.length && reps++<999){
    while(removeALayerOfSinks()){
      level--;
    }
  }
  let minlevel = level;
  level = 0;
  reps = 0;
  while(vertices.length && reps++<999){
    while(removeALayerOfSources()){
      level++;
    }
  }
  let middleoffset = level - minlevel - 1;
  blocklevel.forEach((bl,b) => {
    bl.forEach((l,i) => {
      if(l<0) blocklevel[b][i]+=middleoffset;
    });
  });
  endlevelblocks.forEach((lb,i)=>{
    if(lb.length) levelblocks[middleoffset-i] = [...endlevelblocks[i]];
  });
  levelblocks.forEach((l,i) => {post("\nlevelblocks:",i," is ",...l)});
}

function removeALayerOfSinks(){
  let queue = [];
  vertices.forEach((v) => {
    if(outcount[v]==0) queue.push(v);
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
  s2.unshift(v);
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
  s1.push(v);
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
  // this should run down the trees, assigining things a y coordinate (x in old benny)
  currentChain = 0;
  const startinglist = levelblocks.slice(-1)[0];
  post("\n\nchainfinding: start from blocks in last row:", startinglist);
  startinglist.forEach(v => { //for each thing in the last row:
    post("\nSTART:",v);
    chains[v] = [currentChain];
    chains[v].push(...getChain(v));
    currentChain++;
  });
}

function getChain(v){
  //returns all the chains vertex v is in.
  post("\ngetchain for block",v,blocks[v].name);
  let ret = [];
  if(0 && Array.isArray(chains[v]) && chains[v].length>1){
    ret = [...chains[v]];
    if(ret.indexOf(currentChain)==-1) ret.push(currentChain);
    post("stopping at",v,"chain is",...ret);
    chains[v] = [...ret];
    return ret;
  }else{
    let first = 1;
    edges.forEach((e,i) => {
      if(e[1] == v){
        if(e[0] != v && (parseInt(blocklevel[e[0]]) < parseInt(blocklevel[e[1]]))){
          if(!first){
            currentChain++;
          } else{
            first = 0;
          }
          post("recursing to",e[0]);
          ret.push(...getChain(e[0]));
          if(ret.indexOf(currentChain)==-1) ret.push(currentChain);
        }
      }
    });
    if(ret.length == 0) ret.push(currentChain);
    post("chain for",v,"is",...ret);
    chains[v] = [...ret];
    return ret;
  }
}

function draw(){
  let maxlev;
  rowlist=[];
  for(let v = 0;v<blocks.length;v++){
    if(Array.isArray(blocklevel[v]) && Array.isArray(chains[v])) rowlist.push(chains[v][0]);
  }
  for(let v = 0;v<blocks.length;v++){
    if(Array.isArray(blocklevel[v])){
      maxlev = 900; //minlev = 0;
      blocklevel[v].forEach(l => {
        maxlev = /*Math.max(maxlev, l);
        // minlev =*/ Math.min(maxlev, l);
      });
      blocks[v].space.y = maxlev * -1.25;
      post("\nblock",v,blocks[v].name,"level",maxlev,"levelblocks[]",levelblocks[maxlev],"chains",chains[v]);
      if(Array.isArray(chains[v])){
        blocks[v].space.x = rowlist.indexOf(chains[v][0]) * 2;
      }else{
        blocks[v].space.x = -2;
      }
    }
  }
  let od = { 'blocks': blocks };
  outlet_dictionary(0, od);
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