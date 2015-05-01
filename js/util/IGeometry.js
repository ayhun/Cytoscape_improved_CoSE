function IGeometry() {
}

/**
 * This method calculates *half* the amount in x and y directions of the two
 * input rectangles needed to separate them keeping their respective
 * positioning, and returns the result in the input array. An input
 * separation buffer added to the amount in both directions. We assume that
 * the two rectangles do intersect.
 */
IGeometry.calcSeparationAmount = function (rectA, rectB, overlapAmount, separationBuffer)
{
  if (!rectA.intersects(rectB)) {
    throw "assert failed";
  }
  var directions = new Array(2);
  IGeometry.decideDirectionsForOverlappingNodes(rectA, rectB, directions);
  overlapAmount[0] = Math.min(rectA.getRight(), rectB.getRight()) -
          Math.max(rectA.x, rectB.x);
  overlapAmount[1] = Math.min(rectA.getBottom(), rectB.getBottom()) -
          Math.max(rectA.y, rectB.y);
  // update the overlapping amounts for the following cases:

  /* Case x.1:
   *
   * rectA
   * 	|                       |
   * 	|        _________      |
   * 	|        |       |      |
   * 	|________|_______|______|
   * 			 |       |
   *           |       |
   *        rectB
   */
  if ((rectA.getX() <= rectB.getX()) && (rectA.getRight() >= rectB.getRight()))
  {
    overlapAmount[0] += Math.min((rectB.getX() - rectA.getX()),
            (rectA.getRight() - rectB.getRight()));
  }
  /* Case x.2:
   *
   * rectB
   * 	|                       |
   * 	|        _________      |
   * 	|        |       |      |
   * 	|________|_______|______|
   * 			 |       |
   *           |       |
   *        rectA
   */
  else if ((rectB.getX() <= rectA.getX()) && (rectB.getRight() >= rectA.getRight()))
  {
    overlapAmount[0] += Math.min((rectA.getX() - rectB.getX()),
            (rectB.getRight() - rectA.getRight()));
  }

  /* Case y.1:
   *          ________ rectA
   *         |
   *         |
   *   ______|____  rectB
   *         |    |
   *         |    |
   *   ______|____|
   *         |
   *         |
   *         |________
   *
   */
  if ((rectA.getY() <= rectB.getY()) && (rectA.getBottom() >= rectB.getBottom()))
  {
    overlapAmount[1] += Math.min((rectB.getY() - rectA.getY()),
            (rectA.getBottom() - rectB.getBottom()));
  }
  /* Case y.2:
   *          ________ rectB
   *         |
   *         |
   *   ______|____  rectA
   *         |    |
   *         |    |
   *   ______|____|
   *         |
   *         |
   *         |________
   *
   */
  else if ((rectB.getY() <= rectA.getY()) && (rectB.getBottom() >= rectA.getBottom()))
  {
    overlapAmount[1] += Math.min((rectA.getY() - rectB.getY()),
            (rectB.getBottom() - rectA.getBottom()));
  }

  // find slope of the line passes two centers
  var slope = Math.abs((rectB.getCenterY() - rectA.getCenterY()) /
          (rectB.getCenterX() - rectA.getCenterX()));
  // if centers are overlapped
  if ((rectB.getCenterY() == rectA.getCenterY()) &&
          (rectB.getCenterX() == rectA.getCenterX()))
  {
    // assume the slope is 1 (45 degree)
    slope = 1.0;
  }

  // change y
  var moveByY = slope * overlapAmount[0];
  // change x
  var moveByX = overlapAmount[1] / slope;
  // now we have two pairs:
  // 1) overlapAmount[0], moveByY
  // 2) moveByX, overlapAmount[1]

  // use pair no:1
  if (overlapAmount[0] < moveByX)
  {
    moveByX = overlapAmount[0];
  }
  // use pair no:2
  else
  {
    moveByY = overlapAmount[1];
  }

  // return half the amount so that if each rectangle is moved by these
  // amounts in opposite directions, overlap will be resolved

  overlapAmount[0] = -1 * directions[0] * ((moveByX / 2) + separationBuffer);
  overlapAmount[1] = -1 * directions[1] * ((moveByY / 2) + separationBuffer);
}

/**
 * This method decides the separation direction of overlapping nodes
 * 
 * if directions[0] = -1, then rectA goes left
 * if directions[0] = 1,  then rectA goes right
 * if directions[1] = -1, then rectA goes up
 * if directions[1] = 1,  then rectA goes down
 */
IGeometry.decideDirectionsForOverlappingNodes = function (rectA, rectB, directions)
{
  if (rectA.getCenterX() < rectB.getCenterX())
  {
    directions[0] = -1;
  }
  else
  {
    directions[0] = 1;
  }

  if (rectA.getCenterY() < rectB.getCenterY())
  {
    directions[1] = -1;
  }
  else
  {
    directions[1] = 1;
  }
}

/**
 * This method calculates the intersection (clipping) points of the two
 * input rectangles with line segment defined by the centers of these two
 * rectangles. The clipping points are saved in the input double array and
 * whether or not the two rectangles overlap is returned.
 */
IGeometry.getIntersection2 = function (rectA, rectB, result)
{
  //result[0-1] will contain clipPoint of rectA, result[2-3] will contain clipPoint of rectB

  var p1x = rectA.getCenterX();
  var p1y = rectA.getCenterY();
  var p2x = rectB.getCenterX();
  var p2y = rectB.getCenterY();

  //if two rectangles intersect, then clipping points are centers
  if (rectA.intersects(rectB))
  {
    result[0] = p1x;
    result[1] = p1y;
    result[2] = p2x;
    result[3] = p2y;
    return true;
  }

  //variables for rectA
  var topLeftAx = rectA.getX();
  var topLeftAy = rectA.getY();
  var topRightAx = rectA.getRight();
  var bottomLeftAx = rectA.getX();
  var bottomLeftAy = rectA.getBottom();
  var bottomRightAx = rectA.getRight();
  var halfWidthA = rectA.getWidthHalf();
  var halfHeightA = rectA.getHeightHalf();

  //variables for rectB
  var topLeftBx = rectB.getX();
  var topLeftBy = rectB.getY();
  var topRightBx = rectB.getRight();
  var bottomLeftBx = rectB.getX();
  var bottomLeftBy = rectB.getBottom();
  var bottomRightBx = rectB.getRight();
  var halfWidthB = rectB.getWidthHalf();
  var halfHeightB = rectB.getHeightHalf();

  //flag whether clipping points are found
  var clipPointAFound = false;
  var clipPointBFound = false;


  // line is vertical
  if (p1x == p2x)
  {
    if (p1y > p2y)
    {
      result[0] = p1x;
      result[1] = topLeftAy;
      result[2] = p2x;
      result[3] = bottomLeftBy;
      return false;
    }
    else if (p1y < p2y)
    {
      result[0] = p1x;
      result[1] = bottomLeftAy;
      result[2] = p2x;
      result[3] = topLeftBy;
      return false;
    }
    else
    {
      //not line, return null;
    }
  }
  // line is horizontal
  else if (p1y == p2y)
  {
    if (p1x > p2x)
    {
      result[0] = topLeftAx;
      result[1] = p1y;
      result[2] = topRightBx;
      result[3] = p2y;
      return false;
    }
    else if (p1x < p2x)
    {
      result[0] = topRightAx;
      result[1] = p1y;
      result[2] = topLeftBx;
      result[3] = p2y;
      return false;
    }
    else
    {
      //not valid line, return null;
    }
  }
  else
  {
    //slopes of rectA's and rectB's diagonals
    var slopeA = rectA.height / rectA.width;
    var slopeB = rectB.height / rectB.width;

    //slope of line between center of rectA and center of rectB
    var slopePrime = (p2y - p1y) / (p2x - p1x);
    var cardinalDirectionA;
    var cardinalDirectionB;
    var tempPointAx;
    var tempPointAy;
    var tempPointBx;
    var tempPointBy;

    //determine whether clipping point is the corner of nodeA
    if ((-slopeA) == slopePrime)
    {
      if (p1x > p2x)
      {
        result[0] = bottomLeftAx;
        result[1] = bottomLeftAy;
        clipPointAFound = true;
      }
      else
      {
        result[0] = topRightAx;
        result[1] = topLeftAy;
        clipPointAFound = true;
      }
    }
    else if (slopeA == slopePrime)
    {
      if (p1x > p2x)
      {
        result[0] = topLeftAx;
        result[1] = topLeftAy;
        clipPointAFound = true;
      }
      else
      {
        result[0] = bottomRightAx;
        result[1] = bottomLeftAy;
        clipPointAFound = true;
      }
    }

    //determine whether clipping point is the corner of nodeB
    if ((-slopeB) == slopePrime)
    {
      if (p2x > p1x)
      {
        result[2] = bottomLeftBx;
        result[3] = bottomLeftBy;
        clipPointBFound = true;
      }
      else
      {
        result[2] = topRightBx;
        result[3] = topLeftBy;
        clipPointBFound = true;
      }
    }
    else if (slopeB == slopePrime)
    {
      if (p2x > p1x)
      {
        result[2] = topLeftBx;
        result[3] = topLeftBy;
        clipPointBFound = true;
      }
      else
      {
        result[2] = bottomRightBx;
        result[3] = bottomLeftBy;
        clipPointBFound = true;
      }
    }

    //if both clipping points are corners
    if (clipPointAFound && clipPointBFound)
    {
      return false;
    }

    //determine Cardinal Direction of rectangles
    if (p1x > p2x)
    {
      if (p1y > p2y)
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(slopeA, slopePrime, 4);
        cardinalDirectionB = IGeometry.getCardinalDirection(slopeB, slopePrime, 2);
      }
      else
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(-slopeA, slopePrime, 3);
        cardinalDirectionB = IGeometry.getCardinalDirection(-slopeB, slopePrime, 1);
      }
    }
    else
    {
      if (p1y > p2y)
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(-slopeA, slopePrime, 1);
        cardinalDirectionB = IGeometry.getCardinalDirection(-slopeB, slopePrime, 3);
      }
      else
      {
        cardinalDirectionA = IGeometry.getCardinalDirection(slopeA, slopePrime, 2);
        cardinalDirectionB = IGeometry.getCardinalDirection(slopeB, slopePrime, 4);
      }
    }
    //calculate clipping Point if it is not found before
    if (!clipPointAFound)
    {
      switch (cardinalDirectionA)
      {
        case 1:
          tempPointAy = topLeftAy;
          tempPointAx = p1x + (-halfHeightA) / slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 2:
          tempPointAx = bottomRightAx;
          tempPointAy = p1y + halfWidthA * slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 3:
          tempPointAy = bottomLeftAy;
          tempPointAx = p1x + halfHeightA / slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
        case 4:
          tempPointAx = bottomLeftAx;
          tempPointAy = p1y + (-halfWidthA) * slopePrime;
          result[0] = tempPointAx;
          result[1] = tempPointAy;
          break;
      }
    }
    if (!clipPointBFound)
    {
      switch (cardinalDirectionB)
      {
        case 1:
          tempPointBy = topLeftBy;
          tempPointBx = p2x + (-halfHeightB) / slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 2:
          tempPointBx = bottomRightBx;
          tempPointBy = p2y + halfWidthB * slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 3:
          tempPointBy = bottomLeftBy;
          tempPointBx = p2x + halfHeightB / slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
        case 4:
          tempPointBx = bottomLeftBx;
          tempPointBy = p2y + (-halfWidthB) * slopePrime;
          result[2] = tempPointBx;
          result[3] = tempPointBy;
          break;
      }
    }

  }

  return false;
}

/**
 * This method returns in which cardinal direction does input point stays
 * 1: North
 * 2: East
 * 3: South
 * 4: West
 */
IGeometry.getCardinalDirection = function (slope, slopePrime, line)
{
  if (slope > slopePrime)
  {
    return line;
  }
  else
  {
    return 1 + line % 4;
  }
}

/**
 * This method calculates the intersection of the two lines defined by
 * point pairs (s1,s2) and (f1,f2).
 */
IGeometry.getIntersection = function (s1, s2, f1, f2)
{
  if (f2 == null) {
    return IGeometry.getIntersection2(s1, s2, f1);
  }
  var x1 = s1.x;
  var y1 = s1.y;
  var x2 = s2.x;
  var y2 = s2.y;
  var x3 = f1.x;
  var y3 = f1.y;
  var x4 = f2.x;
  var y4 = f2.y;

  var x, y; // intersection point

  var a1, a2, b1, b2, c1, c2; // coefficients of line eqns.

  var denom;

  a1 = y2 - y1;
  b1 = x1 - x2;
  c1 = x2 * y1 - x1 * y2;  // { a1*x + b1*y + c1 = 0 is line 1 }

  a2 = y4 - y3;
  b2 = x3 - x4;
  c2 = x4 * y3 - x3 * y4;  // { a2*x + b2*y + c2 = 0 is line 2 }

  denom = a1 * b2 - a2 * b1;

  if (denom == 0)
  {
    return null;
  }

  x = (b1 * c2 - b2 * c1) / denom;
  y = (a2 * c1 - a1 * c2) / denom;

  return new Point(x, y);
}

/**
 * This method finds and returns the angle of the vector from the + x-axis
 * in clockwise direction (compatible w/ Java coordinate system!).
 */
IGeometry.angleOfVector = function (Cx, Cy, Nx, Ny)
{
  var C_angle;

  if (Cx != Nx)
  {
    C_angle = Math.atan((Ny - Cy) / (Nx - Cx));

    if (Nx < Cx)
    {
      C_angle += Math.PI;
    }
    else if (Ny < Cy)
    {
      C_angle += IGeometry.TWO_PI;
    }
  }
  else if (Ny < Cy)
  {
    C_angle = IGeometry.ONE_AND_HALF_PI; // 270 degrees
  }
  else
  {
    C_angle = IGeometry.HALF_PI; // 90 degrees
  }

//		assert 0.0 <= C_angle && C_angle < TWO_PI;
  if (0.0 > C_angle && C_angle < TWO_PI) {
    throw "assert failed";
  }

  return C_angle;
}

/**
 * This method converts the given angle in radians to degrees.
 */
IGeometry.radian2degree = function (rad)
{
  return 180.0 * rad / Math.PI;
}

/**
 * This method checks whether the given two line segments (one with point
 * p1 and p2, the other with point p3 and p4) intersect at a point other
 * than these points.
 */
IGeometry.doIntersect = function (p1, p2, p3, p4)
{
  //linesIntersect function is ported from the Line2D class in jdk
  var result = linesIntersect(p1.x, p1.y,
          p2.x, p2.y, p3.x, p3.y,
          p4.x, p4.y);

  return result;
}

var linesIntersect = function (x1, y1, x2, y2, x3, y3, x4, y4)
{
  return ((relativeCCW(x1, y1, x2, y2, x3, y3) *
          relativeCCW(x1, y1, x2, y2, x4, y4) <= 0)
          && (relativeCCW(x3, y3, x4, y4, x1, y1) *
                  relativeCCW(x3, y3, x4, y4, x2, y2) <= 0));
}

var relativeCCW = function (x1, y1, x2, y2, px, py)
{
  x2 -= x1;
  y2 -= y1;
  px -= x1;
  py -= y1;
  var ccw = px * y2 - py * x2;
  if (ccw == 0.0) {
    // The point is colinear, classify based on which side of
    // the segment the point falls on.  We can calculate a
    // relative value using the projection of px,py onto the
    // segment - a negative value indicates the point projects
    // outside of the segment in the direction of the particular
    // endpoint used as the origin for the projection.
    ccw = px * x2 + py * y2;
    if (ccw > 0.0) {
      // Reverse the projection to be relative to the original x2,y2
      // x2 and y2 are simply negated.
      // px and py need to have (x2 - x1) or (y2 - y1) subtracted
      //    from them (based on the original values)
      // Since we really want to get a positive answer when the
      //    point is "beyond (x2,y2)", then we want to calculate
      //    the inverse anyway - thus we leave x2 & y2 negated.
      px -= x2;
      py -= y2;
      ccw = px * x2 + py * y2;
      if (ccw < 0.0) {
        ccw = 0.0;
      }
    }
  }
  return (ccw < 0.0) ? -1 : ((ccw > 0.0) ? 1 : 0);
}

// TODO may not produce correct test results, since parameter order of
// RectangleD constructor is changed
IGeometry.testClippingPoints = function ()
{
  var rectA = new RectangleD(5, 6, 2, 4);
  var rectB;

  rectB = new RectangleD(0, 4, 1, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(1, 4, 1, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(1, 3, 3, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------		
  rectB = new RectangleD(2, 3, 2, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(3, 3, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(3, 2, 4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------		
  rectB = new RectangleD(6, 3, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------		
  rectB = new RectangleD(9, 2, 4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(9, 3, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(8, 3, 2, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(11, 3, 3, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(11, 4, 1, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(10, 4, 1, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(10, 5, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(9, 4.5, 2, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(10, 5.8, 0.4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------		
  rectB = new RectangleD(11, 6, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(10, 7.8, 0.4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(9, 7.5, 1, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(10, 7, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(10, 9, 2, 6);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(11, 9, 2, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(12, 8, 4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(7, 9, 2, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(8, 9, 4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(10, 9, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(6, 10, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(3, 8, 4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(3, 9, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(2, 8, 4, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(2, 8, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(1, 8, 2, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(1, 8.5, 1, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(3, 7, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(1, 7.5, 1, 4);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(3, 7.8, 0.4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(1, 6, 2, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------		
  rectB = new RectangleD(3, 5.8, 0.4, 2);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(1, 5, 1, 3);
  IGeometry.findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(1, 4, 3, 3);
  IGeometry.findAndPrintClipPoints(rectA, rectB);
//----------------------------------------------
  rectB = new RectangleD(4, 4, 3, 3);
//		findAndPrintClipPoints(rectA, rectB);

  rectB = new RectangleD(5, 6, 2, 4);
//		findAndPrintClipPoints(rectA, rectB);
}

IGeometry.findAndPrintClipPoints = function (rectA, rectB)
{
  console.log("---------------------");
  var clipPoints = new Array(4);

  console.log("RectangleA  X: " + rectA.x + "  Y: " + rectA.y + "  Width: " + rectA.width + "  Height: " + rectA.height);
  console.log("RectangleB  X: " + rectB.x + "  Y: " + rectB.y + "  Width: " + rectB.width + "  Height: " + rectB.height);
  IGeometry.getIntersection(rectA, rectB, clipPoints);

  console.log("Clip Point of RectA X:" + clipPoints[0] + " Y: " + clipPoints[1]);
  console.log("Clip Point of RectB X:" + clipPoints[2] + " Y: " + clipPoints[3]);
}

/*
 * Main method for testing purposes.
 */
//IGeometry.testClippingPoints();

// -----------------------------------------------------------------------------
// Section: Class Constants
// -----------------------------------------------------------------------------
/**
 * Some useful pre-calculated constants
 */
IGeometry.HALF_PI = 0.5 * Math.PI;
IGeometry.ONE_AND_HALF_PI = 1.5 * Math.PI;
IGeometry.TWO_PI = 2.0 * Math.PI;
IGeometry.THREE_PI = 3.0 * Math.PI;