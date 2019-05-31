var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var Context = require("android.content.Context");
var Bitmap = require("android.graphics.Bitmap");
var Matrix = require("android.graphics.Matrix");
var Canvas = require("android.graphics.Canvas");
var Color = require("android.graphics.Color");
var Paint = require("android.graphics.Paint");
var RectF = require("android.graphics.RectF");
var AttributeSet = require("android.util.AttributeSet");
var MotionEvent = require("android.view.MotionEvent");
var View = require("android.view.View");

var bitmap = null;
var bitmapCanvas = null;

var Bezier = require('/utils/Bezier');
var TimedPoint = require("/utils/TimedPoint");
var ControlTimedPoints = require("/utils/ControlTimedPoints");

var mPoints = [];
var mIsEmpty;
var mHasEditState;
var mLastTouchX;
var mLastTouchY;
var mLastVelocity;
var mLastWidth;
var mDirtyRect;
var mBitmapSavedState;
var mPointsCache = [];
var mControlTimedPointsCached = new ControlTimedPoints.set();
var mBezierCached = new Bezier.set();

var mMinWidth = 3;
var mMaxWidth = 20;
var mVelocityFilterWeight = 0.9;
var penColor =Color.BLACK;
var mPaint = new Paint();
var mSignatureBitmap = null;
var mSignatureBitmapCanvas = null;

mPaint.setAntiAlias(true);
mPaint.setStyle(Paint.Style.STROKE);
mPaint.setStrokeCap(Paint.Cap.ROUND);
mPaint.setStrokeJoin(Paint.Join.ROUND);
mDirtyRect = new RectF();

clearView();

var customView;
var Activity = require('android.app.Activity'),
    activity = new Activity(Ti.Android.currentActivity);

var MyView = android.view.View.extend({
    onDraw: function(canvas) {
      //this.super.onDraw(canvas);
      console.log("ondraw");
      if (mSignatureBitmap != null) {
        console.log("ondraw mSignatureBitmap");
          canvas.drawBitmap(mSignatureBitmap, 0, 0, mPaint);
      }

			//canvas.drawPath(mPath, mPaint);
      // implementation here
    },
		onTouchEvent: function(event){
			var eventX = event.getX();
      var eventY = event.getY();

      switch (event.getAction()) {
        case MotionEvent.ACTION_DOWN:
          customView.getParent().requestDisallowInterceptTouchEvent(true);
          mPoints = [];
          mLastTouchX = eventX;
          mLastTouchY = eventY;
          addPoint(getNewPoint(eventX, eventY));
        case MotionEvent.ACTION_MOVE:
          resetDirtyRect(eventX, eventY);
          addPoint(getNewPoint(eventX, eventY));
          setIsEmpty(false);
          break;
        case MotionEvent.ACTION_UP:
          resetDirtyRect(eventX, eventY);
          addPoint(getNewPoint(eventX, eventY));
          customView.getParent().requestDisallowInterceptTouchEvent(true);
          break;
        default:
          return false;
      }

			 customView.invalidate((mDirtyRect.left - mMaxWidth),(mDirtyRect.top - mMaxWidth),(mDirtyRect.right + mMaxWidth),(mDirtyRect.bottom + mMaxWidth));
			 return true;
		}
});

customView = new MyView(activity);
$.win.add(customView);

function clearView(){
    mPoints = [];
    mLastVelocity = 0;
    mLastWidth = (mMinWidth + mMaxWidth) / 2;

    if (mSignatureBitmap != null) {
        mSignatureBitmap = null;
        ensureSignatureBitmap();
    }

    setIsEmpty(true);

    //customView.invalidate();
}

function setIsEmpty(newValue) {
    mIsEmpty = newValue;
}

function ensureSignatureBitmap() {
    if (mSignatureBitmap == null) {
        mSignatureBitmap = Bitmap.createBitmap( customView.getWidth(), customView.getHeight(), Bitmap.Config.ARGB_8888);
        mSignatureBitmapCanvas = new Canvas(mSignatureBitmap);
    }
}

function getNewPoint(x, y) {
    var mCacheSize = mPointsCache.length;
    var timedPoint;
    if (mCacheSize == 0) {
        // Cache is empty, create a new point
        timedPoint = new TimedPoint.set(x,y);
        return timedPoint;
    } else {
        // Get point from cache
        timedPoint = mPointsCache.pop();
        return timedPoint.reset(x, y);
    }

}

function resetDirtyRect(eventX, eventY) {

    // The mLastTouchX and mLastTouchY were set when the ACTION_DOWN motion event occurred.
    mDirtyRect.left = Math.min(mLastTouchX, eventX);
    mDirtyRect.right = Math.max(mLastTouchX, eventX);
    mDirtyRect.top = Math.min(mLastTouchY, eventY);
    mDirtyRect.bottom = Math.max(mLastTouchY, eventY);
}

function addPoint(newPoint) {
  mPoints.push(newPoint);
  var pointsCount = mPoints.length;

  if (pointsCount > 3) {
    var tmp = calculateCurveControlPoints(mPoints[0], mPoints[1], mPoints[2]);
    var c2 = tmp.c2;
    recyclePoint(tmp.c1);

    tmp = calculateCurveControlPoints(mPoints[0], mPoints[1], mPoints[2]);
    var c3 = tmp.c1;
    recyclePoint(tmp.c2);

    var curve = mBezierCached.reset(mPoints[0], c2, c3, mPoints[2]);
    var startPoint = curve.startPoint;
    var endPoint = curve.endPoint;

    var velocity = endPoint.velocityFrom(startPoint);
        velocity = (isNaN(velocity))?0.0:velocity;
        velocity = mVelocityFilterWeight * velocity
                    + (1 - mVelocityFilterWeight) * mLastVelocity;
    var newWidth = strokeWidth(velocity);

    //addBezier(curve, mLastWidth, newWidth);
    mPaint.setStrokeWidth(newWidth);
    ensureSignatureBitmap();
    mSignatureBitmapCanvas.drawPoint(mPoints[0].x, mPoints[0].y, mPaint);
    mLastVelocity = velocity;
    mLastWidth = newWidth;

    recyclePoint(mPoints.shift());
    recyclePoint(c2);
    recyclePoint(c3);

  }else if (pointsCount == 1) {
      // To reduce the initial lag make it work with 3 mPoints
      // by duplicating the first point
      firstPoint = mPoints[0];
      mPoints.push(getNewPoint(firstPoint.x, firstPoint.y));
  }
  this.mHasEditState = true;
}

function addBezier(curve, startWidth, endWidth) {
    ensureSignatureBitmap();
    var originalWidth = mPaint.getStrokeWidth();
    var widthDelta = endWidth - startWidth;
    var drawSteps = Math.ceil(curve.length());
    console.log("addBezier drawSteps "+Math.ceil(curve.length()));
    for (var i = 0; i < drawSteps; i++) {
        // Calculate the Bezier (x, y) coordinate for this step.
        var t = i / drawSteps;
        var tt = t * t;
        var ttt = tt * t;
        var u = 1 - t;
        var uu = u * u;
        var uuu = uu * u;

        var x = uuu * curve.startPoint.x;
        x += 3 * uu * t * curve.control1.x;
        x += 3 * u * tt * curve.control2.x;
        x += ttt * curve.endPoint.x;

        var y = uuu * curve.startPoint.y;
        y += 3 * uu * t * curve.control1.y;
        y += 3 * u * tt * curve.control2.y;
        y += ttt * curve.endPoint.y;

        // Set the incremental stroke width and draw.
        mPaint.setStrokeWidth(startWidth + ttt * widthDelta);
        //console.log(x+" addBezier drawPoint "+y+" "+startWidth + ttt * widthDelta);
        mSignatureBitmapCanvas.drawPoint(x, y, mPaint);
        expandDirtyRect(x, y);
    }

    mPaint.setStrokeWidth(originalWidth);
}

function calculateCurveControlPoints(s1, s2, s3) {
    var dx1 = s1.x - s2.x;
    var dy1 = s1.y - s2.y;
    var dx2 = s2.x - s3.x;
    var dy2 = s2.y - s3.y;

    var m1X = (s1.x + s2.x) / 2.0;
    var m1Y = (s1.y + s2.y) / 2.0;
    var m2X = (s2.x + s3.x) / 2.0;
    var m2Y = (s2.y + s3.y) / 2.0;

    var l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    var l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    var dxm = (m1X - m2X);
    var dym = (m1Y - m2Y);
    var k = l2 / (l1 + l2);
    k = (isNaN(k))?0.0:k;
    var cmX = m2X + dxm * k;
    var cmY = m2Y + dym * k;

    var tx = s2.x - cmX;
    var ty = s2.y - cmY;

    return mControlTimedPointsCached.reset(getNewPoint(m1X + tx, m1Y + ty), getNewPoint(m2X + tx, m2Y + ty));
}

function recyclePoint(point){
    mPointsCache.push(point);
}

function strokeWidth(velocity) {
    return Math.max(mMaxWidth / (velocity + 1), mMinWidth);
}

function expandDirtyRect(historicalX, historicalY) {
    if (historicalX < mDirtyRect.left) {
        mDirtyRect.left = historicalX;
    } else if (historicalX > mDirtyRect.right) {
        mDirtyRect.right = historicalX;
    }
    if (historicalY < mDirtyRect.top) {
        mDirtyRect.top = historicalY;
    } else if (historicalY > mDirtyRect.bottom) {
        mDirtyRect.bottom = historicalY;
    }
}

function closeWindow(){
	$.win.close();
}
