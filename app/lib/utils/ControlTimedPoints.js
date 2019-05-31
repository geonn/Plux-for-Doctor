
function set(c1, c2){
  this.c1 = c1;
  this.c2 = c2;
}

set.prototype.reset = function(c1, c2){
  this.c1 = c1;
  this.c2 = c2;
  return this;
}

exports.set = set;
