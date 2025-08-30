// this gets the number of the last entry 
// in the seq dict, so that overdub 
// adds not replaces
outlets = 1;
var seqs = new Dict;
seqs.name = 'seq-piano-roll';

function getsize(block,seq){
	var sqs = seqs.get(block);
	var sq = sqs.get(seq);
	var size = parseInt(sq.getkeys().pop());
	outlet(0, size);
}