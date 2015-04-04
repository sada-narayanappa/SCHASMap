BinOp = function(opts) {
   this.options = opts

}

BinOp.prototype.Set = function(i,j) {
   this.i = i;
   this.j = j;
}

BinOp.prototype.Add = function() {
   console.log( this.i + this.j);
}

BinOp.prototype.Sub = function() {
   console.log( this.i - this.j);
}

b = new BinOp();
b.Set(4,3);
b.Add();
b.Sub();