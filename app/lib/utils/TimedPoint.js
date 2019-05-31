
function set(x, y){
  this.x = x;
  this.y = y;
  this.timestamp = new Date().getTime()+new Date().getMilliseconds();

  return this;
}

set.prototype.reset = set;

set.prototype.velocityFrom = function(start){
  var diff = this.timestamp - start.timestamp;
  if(diff <= 0) {
      diff = 1;
  }
  var dist = Math.sqrt(Math.pow(start.x - this.x, 2) + Math.pow(start.y - this.y, 2));
  var velocity = dist / diff;
  if(isNaN(velocity)){
    velocity = 0;
  }
  return velocity;
}

exports.set = set;
