
function set(startPoint, control1, control2, endPoint){
  this.startPoint = startPoint;
  this.control1 = control1;
  this.control2 = control2;
  this.endPoint = endPoint;
}

set.prototype.reset = function(startPoint, control1, control2, endPoint){
  this.startPoint = startPoint;
  this.control1 = control1;
  this.control2 = control2;
  this.endPoint = endPoint;
  return this;
}

set.prototype.length = function(start){
  var steps = 5;
  var length = 0;
  var cx, cy, px = 0, py = 0, xDiff, yDiff;

  for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      cx = point(t, this.startPoint.x, this.control1.x,
              this.control2.x, this.endPoint.x);
      cy = point(t, this.startPoint.y, this.control1.y,
              this.control2.y, this.endPoint.y);
      if (i > 0) {
          xDiff = cx - px;
          yDiff = cy - py;
          length += Math.sqrt(xDiff * xDiff + yDiff * yDiff);
      }
      px = cx;
      py = cy;
  }
  return length;
}
exports.reset = set;
exports.set = set;

function point(t, start, c1, c2, end) {
    return start * (1.0 - t) * (1.0 - t) * (1.0 - t)
            + 3.0 * c1 * (1.0 - t) * (1.0 - t) * t
            + 3.0 * c2 * (1.0 - t) * t * t
            + end * t * t * t;
}
