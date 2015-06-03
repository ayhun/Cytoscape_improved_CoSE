;
(function ($$) {
  function DimensionD(width, height) {
    this.width = 0;
    this.height = 0;
    if (width !== null && height !== null) {
      this.height = height;
      this.width = width;
    }
  }

  DimensionD.prototype.getWidth = function ()
  {
    return this.width;
  };

  DimensionD.prototype.setWidth = function (width)
  {
    this.width = width;
  };

  DimensionD.prototype.getHeight = function ()
  {
    return this.height;
  };

  DimensionD.prototype.setHeight = function (height)
  {
    this.height = height;
  };

  function HashMap() {
    this.map = {};
    this.keys = [];
  }

  HashMap.prototype.put = function (key, value) {
    var theId = UniqueIDGeneretor.createID(key);
    if (!this.contains(theId)) {
      this.map[theId] = value;
      this.keys.push(key);
    }
  };

  HashMap.prototype.contains = function (key) {
    var theId = UniqueIDGeneretor.createID(key);
    return this.map[key] != null;
  };

  HashMap.prototype.get = function (key) {
    var theId = UniqueIDGeneretor.createID(key);
    return this.map[theId];
  };

  HashMap.prototype.keySet = function () {
    return this.keys;
  };

  function HashSet() {
    this.set = {};
  }
  ;

  HashSet.prototype.add = function (obj) {
    var theId = UniqueIDGeneretor.createID(obj);
    if (!this.contains(theId))
      this.set[theId] = obj;
  };

  HashSet.prototype.remove = function (obj) {
    delete this.set[UniqueIDGeneretor.createID(obj)];
  };

  HashSet.prototype.clear = function () {
    this.set = {};
  };

  HashSet.prototype.contains = function (obj) {
    return this.set[UniqueIDGeneretor.createID(obj)] == obj;
  };

  HashSet.prototype.isEmpty = function () {
    return this.size() === 0;
  };

  HashSet.prototype.size = function () {
    return Object.keys(this.set).length;
  };

//concats this.set to the given list
  HashSet.prototype.addAllTo = function (list) {
    var keys = Object.keys(this.set);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      list.push(this.set[keys[i]]);
    }
  };
  HashSet.prototype.size = function () {
    return Object.keys(this.set).length;
  };
  HashSet.prototype.addAll = function (list) {
    var s = list.length;
    for (var i = 0; i < s; i++) {
      var v = list[i];
      this.add(v);
    }
  };

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

  function IMath() {
  }

  /**
   * This method returns the sign of the input value.
   */
  IMath.sign = function (value) {
    if (value > 0)
    {
      return 1;
    }
    else if (value < 0)
    {
      return -1;
    }
    else
    {
      return 0;
    }
  }

  IMath.floor = function (value) {
    return value < 0 ? Math.ceil(value) : Math.floor(value);
  }

  IMath.ceil = function (value) {
    return value < 0 ? Math.floor(value) : Math.ceil(value);
  }

  function Integer() {
  }

  Integer.MAX_VALUE = 2147483647;
  Integer.MIN_VALUE = -2147483648;

  /* 
   *This class is the javascript implementation of the Point.java class in jdk
   */
  function Point(x, y, p) {
    this.x = null;
    this.y = null;
    if (x == null && y == null && p == null) {
      this.x = 0;
      this.y = 0;
    }
    else if (typeof x == 'number' && typeof y == 'number' && p == null) {
      this.x = x;
      this.y = y;
    }
    else if (x.constructor.name == 'Point' && y == null && p == null) {
      p = x;
      this.x = p.x;
      this.y = p.y;
    }
  }

  Point.prototype.getX = function () {
    return this.x;
  }

  Point.prototype.getY = function () {
    return this.y;
  }

  Point.prototype.getLocation = function () {
    return new Point(this.x, this.y);
  }

  Point.prototype.setLocation = function (x, y, p) {
    if (x.constructor.name == 'Point' && y == null && p == null) {
      p = x;
      this.setLocation(p.x, p.y);
    }
    else if (typeof x == 'number' && typeof y == 'number' && p == null) {
      //if both parameters are integer just move (x,y) location
      if (parseInt(x) == x && parseInt(y) == y) {
        this.move(x, y);
      }
      else {
        this.x = Math.floor(x + 0.5);
        this.y = Math.floor(y + 0.5);
      }
    }
  }

  Point.prototype.move = function (x, y) {
    this.x = x;
    this.y = y;
  }

  Point.prototype.translate = function (dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  Point.prototype.equals = function (obj) {
    if (obj.constructor.name == "Point") {
      var pt = obj;
      return (this.x == pt.x) && (this.y == pt.y);
    }
    return this == obj;
  }

  Point.prototype.toString = function () {
    return new Point().constructor.name + "[x=" + this.x + ",y=" + this.y + "]";
  }

  /* 
   *This class is the javascript implementation of the Point.java class in jdk
   */
  function PointD(x, y) {
    if (x == null && y == null) {
      this.x = 0;
      this.y = 0;
    } else {
      this.x = x;
      this.y = y;
    }
  }

  PointD.prototype.getX = function ()
  {
    return this.x;
  };

  PointD.prototype.getY = function ()
  {
    return this.y;
  };

  PointD.prototype.setX = function (x)
  {
    this.x = x;
  };

  PointD.prototype.setY = function (y)
  {
    this.y = y;
  };

  PointD.prototype.getDifference = function (pt)
  {
    return new DimensionD(this.x - pt.x, this.y - pt.y);
  };

  PointD.prototype.getCopy = function ()
  {
    return new PointD(this.x, this.y);
  };

  PointD.prototype.translate = function (dim)
  {
    this.x += dim.width;
    this.y += dim.height;
    return this;
  };

  /**
   * This class implements a generic quick sort. To use it, simply extend this
   * class and provide a comparison method.
   *
   * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
   */

  function QuickSort(objectArray) {
    if (objectArray != null && Array.isArray(objectArray))
      this.objectArray = objectArray;
    else
      this.objectArray = [];
  }
  ;

//this method is to be removed
  QuickSort.prototype.compare = function (a, b) {
    return a > b;
  }

  QuickSort.prototype.getObjectAt = function (i)
  {
    return this.objectArray[i];
  };

  QuickSort.prototype.setObjectAt = function (i, o)
  {
    this.objectArray[i] = o;
  };

  QuickSort.prototype.quicksort = function (lo, hi)
  {
    if (lo == null || hi == null) {
      var endIndex = this.objectArray.length - 1;
      if (endIndex >= 0)
        this.quicksort(0, endIndex);
    } else {
      var i = lo;
      var j = hi;
      var temp;
      var middleIndex = Math.floor((lo + hi) / 2);
      var middle = this.getObjectAt(middleIndex);

      do
      {
        while (this.compare(this.getObjectAt(i), middle))
          i++;
        while (this.compare(middle, this.getObjectAt(j)))
          j--;

        if (i <= j)
        {
          temp = this.getObjectAt(i);
          this.setObjectAt(i, this.getObjectAt(j));
          this.setObjectAt(j, temp);
          i++;
          j--;
        }
      } while (i <= j);

      //  recursion
      if (lo < j)
        this.quicksort(lo, j);
      if (i < hi)
        this.quicksort(i, hi);
    }
  };

  function RandomSeed() {
  }

  RandomSeed.seed = 1;
  RandomSeed.x = 0;

  RandomSeed.nextDouble = function () {
    RandomSeed.x = Math.sin(RandomSeed.seed++) * 10000;
    return RandomSeed.x - Math.floor(RandomSeed.x);
  };

  function RectangleD(x, y, width, height) {
    /**
     * Geometry of rectangle
     */
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

    if (x != null && y != null && width != null && height != null) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  }

// -----------------------------------------------------------------------------
// Section: Accessors
// -----------------------------------------------------------------------------
  RectangleD.prototype.getX = function ()
  {
    return this.x;
  };

  RectangleD.prototype.setX = function (x)
  {
    this.x = x;
  };

  RectangleD.prototype.getY = function ()
  {
    return this.y;
  };

  RectangleD.prototype.setY = function (y)
  {
    this.y = y;
  };

  RectangleD.prototype.getWidth = function ()
  {
    return this.width;
  };

  RectangleD.prototype.setWidth = function (width)
  {
    this.width = width;
  };

  RectangleD.prototype.getHeight = function ()
  {
    return this.height;
  };

  RectangleD.prototype.setHeight = function (height)
  {
    this.height = height;
  };


// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------
  RectangleD.prototype.getRight = function ()
  {
    return this.x + this.width;
  };

  RectangleD.prototype.getBottom = function ()
  {
    return this.y + this.height;
  };

  RectangleD.prototype.intersects = function (a)
  {
    if (this.getRight() < a.x)
    {
      return false;
    }

    if (this.getBottom() < a.y)
    {
      return false;
    }

    if (a.getRight() < this.x)
    {
      return false;
    }

    if (a.getBottom() < this.y)
    {
      return false;
    }

    return true;
  };

  RectangleD.prototype.getCenterX = function ()
  {
    return this.x + this.width / 2;
  };

  RectangleD.prototype.getMinX = function ()
  {
    return this.getX();
  };

  RectangleD.prototype.getMaxX = function ()
  {
    return this.getX() + this.width;
  };

  RectangleD.prototype.getCenterY = function ()
  {
    return this.y + this.height / 2;
  };

  RectangleD.prototype.getMinY = function ()
  {
    return this.getY();
  };

  RectangleD.prototype.getMaxY = function ()
  {
    return this.getY() + this.height;
  };

  RectangleD.prototype.getWidthHalf = function ()
  {
    return this.width / 2;
  };

  RectangleD.prototype.getHeightHalf = function ()
  {
    return this.height / 2;
  };

  /**
   * This class is for transforming certain world coordinates to device ones.
   *  
   * Following example transformation translates (shifts) world coordinates by
   * (10,20), scales objects in the world to be twice as tall but half as wide
   * in device coordinates. In addition it flips the y coordinates.
   * 
   *			(wox,woy): world origin (x,y)
   *			(wex,wey): world extension x and y
   *			(dox,doy): device origin (x,y)
   *			(dex,dey): device extension x and y
   *
   *										(dox,doy)=(10,20)
   *											*--------- dex=50
   *											|
   *			 wey=50							|
   *				|							|
   *				|							|
   *				|							|
   *				*------------- wex=100		|
   *			(wox,woy)=(0,0)					dey=-100
   *
   * In most cases, we will set all values to 1.0 except dey=-1.0 to flip the y
   * axis.
   */

  function Transform(x, y) {
    this.lworldOrgX = 0.0;
    this.lworldOrgY = 0.0;
    this.ldeviceOrgX = 0.0;
    this.ldeviceOrgY = 0.0;
    this.lworldExtX = 1.0;
    this.lworldExtY = 1.0;
    this.ldeviceExtX = 1.0;
    this.ldeviceExtY = 1.0;
  }

// ---------------------------------------------------------------------
// Section: Get/set methods for instance variables.
// ---------------------------------------------------------------------

  /* World related */

  Transform.prototype.getWorldOrgX = function ()
  {
    return this.lworldOrgX;
  }

  Transform.prototype.setWorldOrgX = function (wox)
  {
    this.lworldOrgX = wox;
  }

  Transform.prototype.getWorldOrgY = function ()
  {
    return this.lworldOrgY;
  }

  Transform.prototype.setWorldOrgY = function (woy)
  {
    this.lworldOrgY = woy;
  }

  Transform.prototype.getWorldExtX = function ()
  {
    return this.lworldExtX;
  }

  Transform.prototype.setWorldExtX = function (wex)
  {
    this.lworldExtX = wex;
  }

  Transform.prototype.getWorldExtY = function ()
  {
    return this.lworldExtY;
  }

  Transform.prototype.setWorldExtY = function (wey)
  {
    this.lworldExtY = wey;
  }

  /* Device related */

  Transform.prototype.getDeviceOrgX = function ()
  {
    return this.ldeviceOrgX;
  }

  Transform.prototype.setDeviceOrgX = function (dox)
  {
    this.ldeviceOrgX = dox;
  }

  Transform.prototype.getDeviceOrgY = function ()
  {
    return this.ldeviceOrgY;
  }

  Transform.prototype.setDeviceOrgY = function (doy)
  {
    this.ldeviceOrgY = doy;
  }

  Transform.prototype.getDeviceExtX = function ()
  {
    return this.ldeviceExtX;
  }

  Transform.prototype.setDeviceExtX = function (dex)
  {
    this.ldeviceExtX = dex;
  }

  Transform.prototype.getDeviceExtY = function ()
  {
    return this.ldeviceExtY;
  }

  Transform.prototype.setDeviceExtY = function (dey)
  {
    this.ldeviceExtY = dey;
  }

// ---------------------------------------------------------------------
// Section: x or y coordinate transformation
// ---------------------------------------------------------------------

  /**
   * This method transforms an x position in world coordinates to an x
   * position in device coordinates.
   */
  Transform.prototype.transformX = function (x)
  {
    var xDevice = 0.0;
    var worldExtX = this.lworldExtX;
    if (worldExtX != 0.0)
    {
      xDevice = this.ldeviceOrgX +
              ((x - this.lworldOrgX) * this.ldeviceExtX / worldExtX);
    }

    return xDevice;
  }

  /**
   * This method transforms a y position in world coordinates to a y
   * position in device coordinates.
   */
  Transform.prototype.transformY = function (y)
  {
    var yDevice = 0.0;
    var worldExtY = this.lworldExtY;
    if (worldExtY != 0.0)
    {
      yDevice = this.ldeviceOrgY +
              ((y - this.lworldOrgY) * this.ldeviceExtY / worldExtY);
    }


    return yDevice;
  }

  /**
   * This method transforms an x position in device coordinates to an x
   * position in world coordinates.
   */
  Transform.prototype.inverseTransformX = function (x)
  {
    var xWorld = 0.0;
    var deviceExtX = this.ldeviceExtX;
    if (deviceExtX != 0.0)
    {
      xWorld = this.lworldOrgX +
              ((x - this.ldeviceOrgX) * this.lworldExtX / deviceExtX);
    }


    return xWorld;
  }

  /**
   * This method transforms a y position in device coordinates to a y
   * position in world coordinates.
   */
  Transform.prototype.inverseTransformY = function (y)
  {
    var yWorld = 0.0;
    var deviceExtY = this.ldeviceExtY;
    if (deviceExtY != 0.0)
    {
      yWorld = this.lworldOrgY +
              ((y - this.ldeviceOrgY) * this.lworldExtY / deviceExtY);
    }


    return yWorld;
  }

// ---------------------------------------------------------------------
// Section: point, dimension and rectagle transformation
// ---------------------------------------------------------------------

  /**
   * This method transforms the input point from the world coordinate system
   * to the device coordinate system.
   */
  Transform.prototype.transformPoint = function (inPoint)
  {
    var outPoint =
            new PointD(this.transformX(inPoint.x),
                    this.transformY(inPoint.y));
    return outPoint;
  }

  /**
   * This method transforms the input dimension from the world coordinate 
   * system to the device coordinate system.
   */
  Transform.prototype.transformDimension = function (inDimension)
  {
    var outDimension =
            new DimensionD(
                    this.transformX(inDimension.width) -
                    this.transformX(0.0),
                    this.transformY(inDimension.height) -
                    this.transformY(0.0));
    return outDimension;
  }

  /**
   * This method transforms the input rectangle from the world coordinate
   * system to the device coordinate system.
   */
  Transform.prototype.transformRect = function (inRect)
  {
    var outRect = new RectangleD();
    var inRectDim = new DimensionD(inRect.width, inRect.height);
    var outRectDim = this.transformDimension(inRectDim);
    outRect.setWidth(outRectDim.width);
    outRect.setHeight(outRectDim.height);
    outRect.setX(this.transformX(inRect.x));
    outRect.setY(this.transformY(inRect.y));
    return outRect;
  }

  /**
   * This method transforms the input point from the device coordinate system
   * to the world coordinate system.
   */
  Transform.prototype.inverseTransformPoint = function (inPoint)
  {
    var outPoint =
            new PointD(this.inverseTransformX(inPoint.x),
                    this.inverseTransformY(inPoint.y));
    return outPoint;
  }

  /** 
   * This method transforms the input dimension from the device coordinate 
   * system to the world coordinate system.
   */
  Transform.prototype.inverseTransformDimension = function (inDimension)
  {
    var outDimension =
            new DimensionD(
                    this.inverseTransformX(inDimension.width - this.inverseTransformX(0.0)),
                    this.inverseTransformY(inDimension.height - this.inverseTransformY(0.0)));
    return outDimension;
  }

  /**
   * This method transforms the input rectangle from the device coordinate
   * system to the world coordinate system. The result is in the passed 
   * output rectangle object.
   */
  Transform.prototype.inverseTransformRect = function (inRect)
  {
    var outRect = new RectangleD();
    var inRectDim = new DimensionD(inRect.width, inRect.height);
    var outRectDim = this.inverseTransformDimension(inRectDim);
    outRect.setWidth(outRectDim.width);
    outRect.setHeight(outRectDim.height);
    outRect.setX(this.inverseTransformX(inRect.x));
    outRect.setY(this.inverseTransformY(inRect.y));
    return outRect;
  }

// ---------------------------------------------------------------------
// Section: Remaining methods.
// ---------------------------------------------------------------------

  /**
   * This method adjusts the world extensions of this transform object
   * such that transformations based on this transform object will 
   * preserve the aspect ratio of objects as much as possible.
   */
  Transform.prototype.adjustExtToPreserveAspectRatio = function ()
  {
    var deviceExtX = this.ldeviceExtX;
    var deviceExtY = this.ldeviceExtY;

    if (deviceExtY != 0.0 && deviceExtX != 0.0)
    {
      var worldExtX = this.lworldExtX;
      var worldExtY = this.lworldExtY;

      if (deviceExtY * worldExtX < deviceExtX * worldExtY)
      {
        this.setWorldExtX((deviceExtY > 0.0) ? deviceExtX * worldExtY / deviceExtY : 0.0);
      }
      else
      {
        this.setWorldExtY((deviceExtX > 0.0) ? deviceExtY * worldExtX / deviceExtX : 0.0);
      }
    }
  }

  function UniqueIDGeneretor() {
  }

  UniqueIDGeneretor.lastID = 0;

  UniqueIDGeneretor.createID = function (obj) {
    if (UniqueIDGeneretor.isPrimitive(obj)) {
      return obj;
    }
    if (obj.uniqueID != null) {
      return obj.uniqueID;
    }
    obj.uniqueID = UniqueIDGeneretor.getString();
    UniqueIDGeneretor.lastID++;
    return obj.uniqueID;
  }

  UniqueIDGeneretor.getString = function (id) {
    if (id == null)
      id = UniqueIDGeneretor.lastID;
    return "Object#" + id + "";
  }

  UniqueIDGeneretor.isPrimitive = function (arg) {
    var type = typeof arg;
    return arg == null || (type != "object" && type != "function");
  }

  /**
   * This class represents an edge (l-level) for layout purposes.
   */

  function LEdge(source, target, vEdge) {
    LGraphObject.call(this, vEdge);
//  -----------------------------------------------------------------------------
// Section: Instance variables
// -----------------------------------------------------------------------------
    /*
     * Source and target nodes of this edge
     */
    this.source = null;
    this.target = null;

    /*
     * Whether this edge is an intergraph one
     */
    this.isInterGraph;

    /*
     * The length of this edge ( l = sqrt(x^2 + y^2) )
     */
    this.length;
    this.lengthX;
    this.lengthY;

    /*
     * Whether source and target node rectangles intersect, requiring special
     * treatment
     */
    this.isOverlapingSourceAndTarget = false;

    /*
     * Bend points for this edge
     */
    this.bendpoints;

    /*
     * Lowest common ancestor graph (lca), and source and target nodes in lca
     */
    this.lca;
    this.sourceInLca;
    this.targetInLca;

    this.vGraphObject;

    /*
     * Constructor
     */
    // in java: super(vEdge);
    this.vGraphObject = vEdge;

    this.bendpoints = [];

    this.source = source;
    this.target = target;
  }

  LEdge.prototype = Object.create(LGraphObject.prototype);

  for (var prop in LGraphObject) {
    LEdge[prop] = LGraphObject[prop];
  }

// -----------------------------------------------------------------------------
// Section: Accessors
// -----------------------------------------------------------------------------
  /**
   * This method returns the source node of this edge.
   */
  LEdge.prototype.getSource = function ()
  {
    return this.source;
  };

  /**
   * This method sets the source node of this edge.
   */
  LEdge.prototype.setSource = function (source)
  {
    this.source = source;
  };

  /**
   * This method returns the target node of this edge.
   */
  LEdge.prototype.getTarget = function ()
  {
    return this.target;
  };

  /**
   * This method sets the target node of this edge.
   */
  LEdge.prototype.setTarget = function (target)
  {
    this.target = target;
  };

  /**
   * This method returns whether or not this edge is an inter-graph edge.
   */
  LEdge.prototype.isInterGraph = function ()
  {
    return this.isInterGraph;
  };

  /**
   * This method returns the length of this edge. Note that this value might
   * be out-dated at times during a layout operation.
   */
  LEdge.prototype.getLength = function ()
  {
    return this.length;
  };

  /**
   * This method returns the x component of the length of this edge. Note that
   * this value might be out-dated at times during a layout operation.
   */
  LEdge.prototype.getLengthX = function ()
  {
    return this.lengthX;
  };

  /**
   * This method returns the y component of the length of this edge. Note that
   * this value might be out-dated at times during a layout operation.
   */
  LEdge.prototype.getLengthY = function ()
  {
    return this.lengthY;
  };

  /**
   * This method returns whether or not this edge has overlapping source and
   * target.
   */
  LEdge.prototype.isOverlapingSourceAndTarget = function ()
  {
    return this.isOverlapingSourceAndTarget;
  };

  /**
   * This method resets the overlapping source and target status of this edge.
   */
  LEdge.prototype.resetOverlapingSourceAndTarget = function ()
  {
    this.isOverlapingSourceAndTarget = false;
  };

  /**
   * This method returns the list of bend points of this edge.
   */
  LEdge.prototype.getBendpoints = function ()
  {
    return this.bendpoints;
  };

  /**
   * This method clears all existing bendpoints and sets given bendpoints as 
   * the new ones.
   */
  LEdge.prototype.reRoute = function (bendPoints)
  {
    this.bendpoints = [];

    this.bendpoints = this.bendpoints.concat(bendPoints);
  };

  LEdge.prototype.getLca = function ()
  {
    return this.lca;
  };

  LEdge.prototype.getSourceInLca = function ()
  {
    return this.sourceInLca;
  };

  LEdge.prototype.getTargetInLca = function ()
  {
    return this.targetInLca;
  };

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------
  /**
   * This method returns the end of this edge different from the input one.
   */
  LEdge.prototype.getOtherEnd = function (node)
  {
    if (this.source === node)
    {
      return this.target;
    }
    else if (this.target === node)
    {
      return this.source;
    }
    else
    {
      throw "Node is not incident with this edge";
    }
  }

  /**
   * This method finds the other end of this edge, and returns its ancestor
   * node, possibly the other end node itself, that is in the input graph. It
   * returns null if none of its ancestors is in the input graph.
   */
  LEdge.prototype.getOtherEndInGraph = function (node, graph)
  {
    var otherEnd = this.getOtherEnd(node);
    var root = graph.getGraphManager().getRoot();

    while (true)
    {
      if (otherEnd.getOwner() == graph)
      {
        return otherEnd;
      }

      if (otherEnd.getOwner() == root)
      {
        break;
      }

      otherEnd = otherEnd.getOwner().getParent();
    }

    return null;
  };

  /**
   * This method updates the length of this edge as well as whether or not the
   * rectangles representing the geometry of its end nodes overlap.
   */
  LEdge.prototype.updateLength = function ()
  {
    var clipPointCoordinates = new Array(4);

    this.isOverlapingSourceAndTarget =
            IGeometry.getIntersection(this.target.getRect(),
                    this.source.getRect(),
                    clipPointCoordinates);

    if (!this.isOverlapingSourceAndTarget)
    {
      // target clip point minus source clip point gives us length

      this.lengthX = clipPointCoordinates[0] - clipPointCoordinates[2];
      this.lengthY = clipPointCoordinates[1] - clipPointCoordinates[3];

      if (Math.abs(this.lengthX) < 1.0)
      {
        this.lengthX = IMath.sign(this.lengthX);
      }

      if (Math.abs(this.lengthY) < 1.0)
      {
        this.lengthY = IMath.sign(this.lengthY);
      }

      this.length = Math.sqrt(
              this.lengthX * this.lengthX + this.lengthY * this.lengthY);
    }
  };

  /**
   * This method updates the length of this edge using the end nodes centers
   * as opposed to clipping points to simplify calculations involved.
   */
  LEdge.prototype.updateLengthSimple = function ()
  {
    // target center minus source center gives us length

    this.lengthX = this.target.getCenterX() - this.source.getCenterX();
    this.lengthY = this.target.getCenterY() - this.source.getCenterY();

    if (Math.abs(this.lengthX) < 1.0)
    {
      this.lengthX = IMath.sign(this.lengthX);
    }

    if (Math.abs(this.lengthY) < 1.0)
    {
      this.lengthY = IMath.sign(this.lengthY);
    }

    this.length = Math.sqrt(
            this.lengthX * this.lengthX + this.lengthY * this.lengthY);
  }

// -----------------------------------------------------------------------------
// Section: Testing methods
// -----------------------------------------------------------------------------
  /**
   * This method prints the topology of this edge.
   */
  LEdge.prototype.printTopology = function ()
  {
//  console.log( (this.label == null ? "?" : this.label) + "[" +
//    (this.source.label == null ? "?" : this.source.label) + "-" +
//    (this.target.label == null ? "?" : this.target.label) + "] ");
  }

  function LGraph(parent, obj2, vGraph) {
    LGraphObject.call(this, vGraph);
    /*
     * Nodes maintained by this graph
     */
    this.nodes;

    /*
     * Edges whose source and target nodes are in this graph
     */
    this.edges;

    /*
     * Owner graph manager
     */
    this.graphManager;

    /*
     * Parent node of this graph. This should never be null (the parent of the
     * root graph is the root node) when this graph is part of a compound
     * structure (i.e. a graph manager).
     */
    this.parent;

    /*
     * Geometry of this graph (i.e. that of its tightest bounding rectangle,
     * also taking margins into account)
     */
    this.top;
    this.left;
    this.bottom;
    this.right;

    /*
     * Estimated size of this graph based on estimated sizes of its contents
     */
    this.estimatedSize = Integer.MIN_VALUE;

    /*
     * Margins of this graph to be applied on bouding rectangle of its contents
     */
    this.margin = LayoutConstants.DEFAULT_GRAPH_MARGIN;

    /*
     * Whether the graph is connected or not, taking indirect edges (e.g. an
     * edge connecting a child node of a node of this graph to another node of
     * this graph) into account.
     */
    this.isConnected;


    this.edges = [];
    this.nodes = [];
    this.isConnected = false;
    this.parent = parent;

    if (obj2 != null && obj2 instanceof LGraphManager) {
      this.graphManager = obj2;
    }
    else if (obj2 != null && obj2 instanceof Layout) {
      this.graphManager = obj2.graphManager;
    }
  }

//extends LGraphObject
  LGraph.prototype = Object.create(LGraphObject.prototype);
  for (var prop in LGraphObject) {
    LGraph[prop] = LGraphObject[prop];
  }

  /**
   * This method returns the list of nodes in this graph.
   */
  LGraph.prototype.getNodes = function () {
    return this.nodes;
  };

  /**
   * This method returns the list of edges in this graph.
   */
  LGraph.prototype.getEdges = function () {
    return this.edges;
  };

  /**
   * This method returns the graph manager of this graph.
   */
  LGraph.prototype.getGraphManager = function ()
  {
    return this.graphManager;
  };

  /**
   * This method returns the parent node of this graph. If this graph is the
   * root of the nesting hierarchy, then null is returned.
   */
  LGraph.prototype.getParent = function ()
  {
    return this.parent;
  };

  /**
   * This method returns the left of the bounds of this graph. Notice that
   * bounds are not always up-to-date.
   */
  LGraph.prototype.getLeft = function ()
  {
    return this.left;
  };

  /**
   * This method returns the right of the bounds of this graph. Notice that
   * bounds are not always up-to-date.
   */
  LGraph.prototype.getRight = function ()
  {
    return this.right;
  };

  /**
   * This method returns the top of the bounds of this graph. Notice that
   * bounds are not always up-to-date.
   */
  LGraph.prototype.getTop = function ()
  {
    return this.top;
  };

  /**
   * This method returns the bottom of the bounds of this graph. Notice that
   * bounds are not always up-to-date.
   */
  LGraph.prototype.getBottom = function ()
  {
    return this.bottom;
  };

  /**
   * This method returns the bigger of the two dimensions of this graph.
   */
  LGraph.prototype.getBiggerDimension = function ()
  {
    if (!(this.right - this.left >= 0) && (this.bottom - this.top >= 0)) {
      throw "assert failed";
    }
    return Math.max(this.right - this.left, this.bottom - this.top);
  };

  /**
   * This method returns whether this graph is connected or not.
   */
  LGraph.prototype.isConnected = function ()
  {
    return this.isConnected;
  };

  /**
   * This method returns the margins of this graph to be applied on the
   * bounding rectangle of its contents.
   */
  LGraph.prototype.getMargin = function ()
  {
    return this.margin;
  };

  /**
   * This method sets the margins of this graphs to be applied on the
   * bounding rectangle of its contents.
   */
  LGraph.prototype.setMargin = function (margin)
  {
    this.margin = margin;
  };

  LGraph.prototype.add = function (obj1, sourceNode, targetNode) {
    if (sourceNode == null && targetNode == null) {
      newNode = obj1;
      if (this.graphManager == null) {
        throw "Graph has no graph mgr!";
      }
      if (this.getNodes().indexOf(newNode) > -1) {
        throw "Node already in graph!";
      }
      newNode.setOwner(this);
      this.getNodes().push(newNode);

      return newNode;
    }
    else {
      newEdge = obj1;
      if (!(this.getNodes().indexOf(sourceNode) > -1 && (this.getNodes().indexOf(targetNode)) > -1)) {
        throw "Source or target not in graph!";
      }

      if (!(sourceNode.owner == targetNode.owner && sourceNode.owner == this)) {
        throw "Both owners must be this graph!";
      }

      if (sourceNode.owner != targetNode.owner)
      {
        return null;
      }

      // set source and target
      newEdge.source = sourceNode;
      newEdge.target = targetNode;

      // set as intra-graph edge
      newEdge.isInterGraph = false;

      // add to graph edge list
      this.getEdges().push(newEdge);

      // add to incidency lists
      sourceNode.edges.push(newEdge);

      if (targetNode != sourceNode)
      {
        targetNode.edges.push(newEdge);
      }

      return newEdge;
    }
  };

  LGraph.prototype.remove = function (obj) {
    var node = obj;
    if (obj instanceof LNode) {
      if (node == null) {
        throw "Node is null!";
      }
      if (!(node.owner != null && node.owner == this)) {
        throw "Owner graph is invalid!";
      }
      if (this.graphManager == null) {
        throw "Owner graph manager is invalid!";
      }

      // remove incident edges first (make a copy to do it safely)
      var edgesToBeRemoved = node.edges.slice();

      var edge;
      var s = edgesToBeRemoved.length;
      for (var i = 0; i < s; i++)
      {
        edge = edgesToBeRemoved[i];

        if (edge.isInterGraph)
        {
          this.graphManager.remove(edge);
        }
        else
        {
          edge.source.owner.remove(edge);
        }
      }

      // now the node itself
      var index = this.nodes.indexOf(node);
      if (index == -1) {
        throw "Node not in owner node list!";
      }

      this.nodes.splice(index, 1);
    }
    else if (obj instanceof LEdge) {
      var edge = obj;
      if (edge == null) {
        throw "Edge is null!";
      }
      if (!(edge.source != null && edge.target != null)) {
        throw "Source and/or target is null!";
      }
      if (!(edge.source.owner != null && edge.target.owner != null &&
              edge.source.owner == this && edge.target.owner == this)) {
        throw "Source and/or target owner is invalid!";
      }

      // remove edge from source and target nodes' incidency lists

      var sourceIndex = edge.source.edges.indexOf(edge);
      var targetIndex = edge.target.edges.indexOf(edge);
      if (!(sourceIndex > -1 && targetIndex > -1)) {
        throw "Source and/or target doesn't know this edge!";
      }

      edge.source.edges.splice(sourceIndex, 1);

      if (edge.target != edge.source)
      {
        edge.target.edges.splice(targetIndex, 1);
      }

      // remove edge from owner graph's edge list

      var index = edge.source.owner.getEdges().indexOf(edge);
      if (index == -1) {
        throw "Not in owner's edge list!";
      }

      edge.source.owner.getEdges().splice(index, 1);
    }
  };

  /**
   * This method calculates, updates and returns the left-top point of this
   * graph including margins.
   */
  LGraph.prototype.updateLeftTop = function ()
  {
    var top = Integer.MAX_VALUE;
    var left = Integer.MAX_VALUE;
    var nodeTop;
    var nodeLeft;

    var nodes = this.getNodes();
    var s = nodes.length;

    for (var i = 0; i < s; i++)
    {
      var lNode = nodes[i];
      nodeTop = Math.floor(lNode.getTop());
      nodeLeft = Math.floor(lNode.getLeft());

      if (top > nodeTop)
      {
        top = nodeTop;
      }

      if (left > nodeLeft)
      {
        left = nodeLeft;
      }
    }

    // Do we have any nodes in this graph?
    if (top == Integer.MAX_VALUE)
    {
      return null;
    }

    this.left = left - this.margin;
    this.top = top - this.margin;

    // Apply the margins and return the result
    return new Point(this.left, this.top);
  };

  /**
   * This method calculates and updates the bounds of this graph including
   * margins in a recursive manner, so that
   * all compound nodes in this and lower levels will have up-to-date boundaries.
   * Recursiveness of the function is controlled by the parameter named "recursive".
   */
  LGraph.prototype.updateBounds = function (recursive)
  {
    // calculate bounds
    var left = Integer.MAX_VALUE;
    var right = -Integer.MAX_VALUE;
    var top = Integer.MAX_VALUE;
    var bottom = -Integer.MAX_VALUE;
    var nodeLeft;
    var nodeRight;
    var nodeTop;
    var nodeBottom;

    var nodes = this.nodes;
    var s = nodes.length;
    for (var i = 0; i < s; i++)
    {
      var lNode = nodes[i];

      // if it is a recursive call, and current node is compound
      if (recursive && lNode.child != null)
      {
        lNode.updateBounds();
      }
      nodeLeft = Math.floor(lNode.getLeft());
      nodeRight = Math.floor(lNode.getRight());
      nodeTop = Math.floor(lNode.getTop());
      nodeBottom = Math.floor(lNode.getBottom());

      if (left > nodeLeft)
      {
        left = nodeLeft;
      }

      if (right < nodeRight)
      {
        right = nodeRight;
      }

      if (top > nodeTop)
      {
        top = nodeTop;
      }

      if (bottom < nodeBottom)
      {
        bottom = nodeBottom;
      }
    }

//  var boundingRect = new Rectangle(left, top, right - left, bottom - top);
    var boundingRect = new RectangleD(left, top, right - left, bottom - top);

    // Do we have any nodes in this graph?
    if (left == Integer.MAX_VALUE)
    {
      this.left = Math.floor(this.parent.getLeft());
      this.right = Math.floor(this.parent.getRight());
      this.top = Math.floor(this.parent.getTop());
      this.bottom = Math.floor(this.parent.getBottom());
    }

    this.left = boundingRect.x - this.margin;
    this.right = boundingRect.x + boundingRect.width + this.margin;
    this.top = boundingRect.y - this.margin;
    // Label text dimensions are to be added for the bottom of the compound!
    this.bottom = boundingRect.y + boundingRect.height + this.margin;
  };

  /**
   * This method returns the bounding rectangle of the given list of nodes. No
   * margins are accounted for, and it returns a rectangle with top-left set
   * to Integer.MAX_VALUE if the list is empty.
   */
  LGraph.calculateBounds = function (nodes)
  {
    var left = Integer.MAX_VALUE;
    var right = -Integer.MAX_VALUE;
    var top = Integer.MAX_VALUE;
    var bottom = -Integer.MAX_VALUE;
    var nodeLeft;
    var nodeRight;
    var nodeTop;
    var nodeBottom;

    //Iterator<LNode> itr = nodes.iterator();
    var s = nodes.length;

    for (var i = 0; i < s; i++)
    {
      var lNode = nodes[i];
      nodeLeft = Math.floor(lNode.getLeft());
      nodeRight = Math.floor(lNode.getRight());
      nodeTop = Math.floor(lNode.getTop());
      nodeBottom = Math.floor(lNode.getBottom());

      if (left > nodeLeft)
      {
        left = nodeLeft;
      }

      if (right < nodeRight)
      {
        right = nodeRight;
      }

      if (top > nodeTop)
      {
        top = nodeTop;
      }

      if (bottom < nodeBottom)
      {
        bottom = nodeBottom;
      }
    }

    var boundingRect = new RectangleD(left, top, right - left, bottom - top);

    return boundingRect;
  };

  /**
   * This method returns the depth of the parent node of this graph, if any,
   * in the inclusion tree (nesting hierarchy).
   */
  LGraph.prototype.getInclusionTreeDepth = function ()
  {
    if (this == this.graphManager.getRoot())
    {
      return 1;
    }
    else
    {
      return this.parent.getInclusionTreeDepth();
    }
  };

  /**
   * This method returns estimated size of this graph.
   */
  LGraph.prototype.getEstimatedSize = function ()
  {
    if (this.estimatedSize == Integer.MIN_VALUE) {
      throw "assert failed";
    }
    return this.estimatedSize;
  };

  /**
   * This method sets the estimated size of this graph. We use this method to
   * directly set this size in certain exceptional cases rather than
   * calculating it from scratch (see calcEstimatedSize method).
   */
  LGraph.prototype.setEstimatedSize = function (size)
  {
    this.estimatedSize = size;
  };

  /*
   * This method calculates and returns the estimated size of this graph as
   * well as the estimated sizes of the nodes in this graph recursively. The
   * estimated size of a graph is based on the estimated sizes of its nodes.
   * In fact, this value is the exact average dimension for non-compound nodes
   * and it is a rather rough estimation on the dimension for compound nodes.
   */
  LGraph.prototype.calcEstimatedSize = function ()
  {
    var size = 0;
//  Iterator itr = this.nodes.iterator();
    var nodes = this.nodes;
    var s = nodes.length;

    for (var i = 0; i < s; i++)
    {
      var lNode = nodes[i];
      size += lNode.calcEstimatedSize();
    }

    if (size == 0)
    {
      this.estimatedSize = LayoutConstants.EMPTY_COMPOUND_NODE_SIZE;
    }
    else
    {
      this.estimatedSize = Math.floor(size / Math.sqrt(this.nodes.length));
    }

    return Math.floor(this.estimatedSize);
  };

  /**
   * This method updates whether this graph is connected or not, taking
   * indirect edges (e.g. an edge connecting a child node of a node of this
   * graph to another node of this graph) into account.
   */
  LGraph.prototype.updateConnected = function ()
  {
    if (this.nodes.length == 0)
    {
      this.isConnected = true;
      return;
    }

    var toBeVisited = [];
    var visited = new HashSet();
    var currentNode = this.nodes[0];
    var neighborEdges;
    var currentNeighbor;

    toBeVisited = toBeVisited.concat(currentNode.withChildren());

    while (toBeVisited.length > 0)
    {
      currentNode = toBeVisited.shift();
      visited.add(currentNode);

      // Traverse all neighbors of this node
      neighborEdges = currentNode.getEdges();
      var s = neighborEdges.length;
      for (var i = 0; i < s; i++)
      {
        var neighborEdge = neighborEdges[i];
        currentNeighbor =
                neighborEdge.getOtherEndInGraph(currentNode, this);

        // Add unvisited neighbors to the list to visit
        if (currentNeighbor != null &&
                !visited.contains(currentNeighbor))
        {
          toBeVisited = toBeVisited.concat(currentNeighbor.withChildren());
        }
      }
    }

    this.isConnected = false;

    if (visited.size() >= this.nodes.length)
    {
      var noOfVisitedInThisGraph = 0;

      var s = visited.size();
      for (var visitedId in visited.set)
      {
        var visitedNode = visited.set[visitedId];
        if (visitedNode.owner == this)
        {
          noOfVisitedInThisGraph++;
        }
      }

      if (noOfVisitedInThisGraph == this.nodes.length)
      {
        this.isConnected = true;
      }
    }
  };

  /**
   * This method reverses the given edge by swapping the source and target
   * nodes of the edge.
   * 
   * @param edge	edge to be reversed
   */
  LGraph.prototype.reverse = function (edge)
  {
    var index = edge.source.getOwner().getEdges().indexOf(edge);
    edge.source.getOwner().getEdges().splice(index, 1);
    edge.target.getOwner().getEdges().push(edge);

    var swap = edge.source;
    edge.source = edge.target;
    edge.target = swap;
  };

  /**
   * This method prints the topology of this graph.
   */
  LGraph.prototype.printTopology = function ()
  {
//  var str = "?";
//  if(this.label != null){
//    str = this.label;
//  }
//  console.log(str + ": ");
//  console.log("Nodes: ");
    var node;
    var nodes = this.nodes;
    var s = nodes.length;
    for (var i = 0; i < s; i++)
    {
      node = nodes[i];
      node.printTopology();
    }
  };

  /* 
   * To change this license header, choose License Headers in Project Properties.
   * To change this template file, choose Tools | Templates
   * and open the template in the editor.
   */

  function LGraphManager(layout) {
    /*
     * Graphs maintained by this graph manager, including the root of the
     * nesting hierarchy
     */
    this.graphs = null;

    /*
     * Inter-graph edges in this graph manager. Notice that all inter-graph
     * edges go here, not in any of the edge lists of individual graphs (either
     * source or target node's owner graph).
     */
    this.edges = null;

    /*
     * All nodes (excluding the root node) and edges (including inter-graph
     * edges) in this graph manager. For efficiency purposes we hold references
     * of all layout objects that we operate on in arrays. These lists are
     * generated once we know that the topology of the graph manager is fixed,
     * immediately before layout starts.
     */
    this.allNodes = null;
    this.allEdges = null;

    /*
     * Similarly we have a list of nodes for which gravitation should be
     * applied. This is determined once, prior to layout, and used afterwards.
     */
    this.allNodesToApplyGravitation = null;

    /*
     * The root of the inclusion/nesting hierarchy of this compound structure
     */
    this.rootGraph = null;

    /*
     * Layout object using this graph manager
     */
    this.layout = layout;

    /*
     * Cluster Manager of all graphs managed by this graph manager
     */
//  this.clusterManager = null;


    this.graphs = [];
    this.edges = [];
    this.allNodes = null;
    this.allEdges = null;
    this.allNodesToApplyGravitation = null;
    this.rootGraph = null;
//  this.clusterManager = new ClusterManager();
  }

  /**
   * This method adds a new graph to this graph manager and sets as the root.
   * It also creates the root graph as the parent of the root graph.
   */
  LGraphManager.prototype.addRoot = function ()
  {
    var ngraph = this.layout.newGraph();
    var nnode = this.layout.newNode(null);
    var root = this.add(ngraph, nnode);
    this.setRootGraph(root);
    return this.rootGraph;
  };

  LGraphManager.prototype.add = function (newGraph, parentNode, newEdge, sourceNode, targetNode)
  {
    //there are just 2 parameters are passed then it adds an LGraph else it adds an LEdge
    if (newEdge == null && sourceNode == null && targetNode == null) {
      if (newGraph == null) {
        throw "Graph is null!";
      }
      if (parentNode == null) {
        throw "Parent node is null!";
      }
      if (this.graphs.indexOf(newGraph) > -1) {
        throw "Graph already in this graph mgr!";
      }

      this.graphs.push(newGraph);

      if (newGraph.parent != null) {
        throw "Already has a parent!";
      }
      if (parentNode.child != null) {
        throw  "Already has a child!";
      }

      newGraph.parent = parentNode;
      parentNode.child = newGraph;

      return newGraph;
    }
    else {
      //change the order of the parameters
      targetNode = newEdge;
      sourceNode = parentNode;
      newEdge = newGraph;
      var sourceGraph = sourceNode.getOwner();
      var targetGraph = targetNode.getOwner();

      if (!(sourceGraph != null && sourceGraph.getGraphManager() == this)) {
        throw "Source not in this graph mgr!";
      }
      if (!(targetGraph != null && targetGraph.getGraphManager() == this)) {
        throw "Target not in this graph mgr!";
      }

      if (sourceGraph == targetGraph)
      {
        newEdge.isInterGraph = false;
        return sourceGraph.add(newEdge, sourceNode, targetNode);
      }
      else
      {
        newEdge.isInterGraph = true;

        // set source and target
        newEdge.source = sourceNode;
        newEdge.target = targetNode;

        // add edge to inter-graph edge list
        if (this.edges.indexOf(newEdge) > -1) {
          throw "Edge already in inter-graph edge list!";
        }

        this.edges.push(newEdge);

        // add edge to source and target incidency lists
        if (!(newEdge.source != null && newEdge.target != null)) {
          throw "Edge source and/or target is null!";
        }

        if (!(newEdge.source.edges.indexOf(newEdge) == -1 && newEdge.target.edges.indexOf(newEdge) == -1)) {
          throw "Edge already in source and/or target incidency list!";
        }

        newEdge.source.edges.push(newEdge);
        newEdge.target.edges.push(newEdge);

        return newEdge;
      }
    }
  };

  LGraphManager.prototype.remove = function (lObj) {
    /**
     * If the lObj is an LGraph instance then, this method removes the input graph 
     * from this graph manager. 
     */
    if (lObj instanceof LGraph) {
      var graph = lObj;
      if (graph.getGraphManager() != this) {
        throw "Graph not in this graph mgr";
      }
      if (!(graph == this.rootGraph || (graph.parent != null && graph.parent.graphManager == this))) {
        throw "Invalid parent node!";
      }

      // first the edges (make a copy to do it safely)
      var edgesToBeRemoved = [];

      edgesToBeRemoved = edgesToBeRemoved.concat(graph.getEdges());

      var edge;
      var s = edgesToBeRemoved.length;
      for (var i = 0; i < s; i++)
      {
        edge = edgesToBeRemoved[i];
        graph.remove(edge);
      }

      // then the nodes (make a copy to do it safely)
      var nodesToBeRemoved = [];

      nodesToBeRemoved = nodesToBeRemoved.concat(graph.getNodes());

      var node;
      s = nodesToBeRemoved.length;
      for (var i = 0; i < s; i++)
      {
        node = nodesToBeRemoved[i];
        graph.remove(node);
      }

      // check if graph is the root
      if (graph == this.rootGraph)
      {
        this.setRootGraph(null);
      }

      // now remove the graph itself
      var index = this.graphs.indexOf(graph);
      this.graphs.splice(index, 1);

      // also reset the parent of the graph
      graph.parent = null;
    }
    /**
     * If the lObj is an LEdge instance then, this method removes the input inter-graph 
     * edge from this graph manager.
     */
    else if (lObj instanceof LEdge) {
      edge = lObj;
      if (edge == null) {
        throw "Edge is null!";
      }
      if (!edge.isInterGraph) {
        throw "Not an inter-graph edge!";
      }
      if (!(edge.source != null && edge.target != null)) {
        throw "Source and/or target is null!";
      }

      // remove edge from source and target nodes' incidency lists

      if (!(edge.source.edges.indexOf(edge) != -1 && edge.target.edges.indexOf(edge) != -1)) {
        throw "Source and/or target doesn't know this edge!";
      }

      var index = edge.source.edges.indexOf(edge);
      edge.source.edges.splice(index, 1);
      index = edge.target.edges.indexOf(edge);
      edge.target.edges.splice(index, 1);

      // remove edge from owner graph manager's inter-graph edge list

      if (!(edge.source.owner != null && edge.source.owner.getGraphManager() != null)) {
        throw "Edge owner graph or owner graph manager is null!";
      }
      if (edge.source.owner.getGraphManager().edges.indexOf(edge) == -1) {
        throw "Not in owner graph manager's edge list!";
      }

      var index = edge.source.owner.getGraphManager().edges.indexOf(edge);
      edge.source.owner.getGraphManager().edges.splice(index, 1);
    }
  };

  /**
   * This method calculates and updates the bounds of the root graph.
   */
  LGraphManager.prototype.updateBounds = function ()
  {
    this.rootGraph.updateBounds(true);
  };

  /**
   * This method returns the cluster manager of all graphs managed by this
   * graph manager.
   */
//LGraphManager.prototype.getClusterManager = function ()
//{
//  return this.clusterManager;
//};

  /**
   * This method retuns the list of all graphs managed by this graph manager.
   */
  LGraphManager.prototype.getGraphs = function ()
  {
    return this.graphs;
  };

  /**
   * This method returns the list of all inter-graph edges in this graph
   * manager.
   */
  LGraphManager.prototype.getInterGraphEdges = function ()
  {
    return this.edges;
  };

  /**
   * This method returns the list of all nodes in this graph manager. This
   * list is populated on demand and should only be called once the topology
   * of this graph manager has been formed and known to be fixed.
   */
  LGraphManager.prototype.getAllNodes = function ()
  {
    if (this.allNodes == null)
    {
      var nodeList = [];

      var graphs = this.getGraphs();
      var s = graphs.length;
      for (var i = 0; i < s; i++)
      {
        nodeList = nodeList.concat(graphs[i].getNodes());
      }

      this.allNodes = nodeList;
    }

    return this.allNodes;
  };

  /**
   * This method nulls the all nodes array so that it gets re-calculated with
   * the next invocation of the accessor. Needed when topology changes.
   */
  LGraphManager.prototype.resetAllNodes = function ()
  {
    this.allNodes = null;
  };

  /**
   * This method nulls the all edges array so that it gets re-calculated with
   * the next invocation of the accessor. Needed when topology changes. 
   */
  LGraphManager.prototype.resetAllEdges = function ()
  {
    this.allEdges = null;
  };

  /**
   * This method nulls the all nodes to apply gravition array so that it gets 
   * re-calculated with the next invocation of the accessor. Needed when
   * topology changes. 
   */
  LGraphManager.prototype.resetAllNodesToApplyGravitation = function ()
  {
    this.allNodesToApplyGravitation = null;
  };

  /**
   * This method returns the list of all edges (including inter-graph edges)
   * in this graph manager. This list is populated on demand and should only
   * be called once the topology of this graph manager has been formed and
   * known to be fixed.
   */
  LGraphManager.prototype.getAllEdges = function ()
  {
    if (this.allEdges == null)
    {
      var edgeList = [];

      var graphs = this.getGraphs();
      var s = graphs.length;
      for (var i = 0; i < graphs.length; i++)
      {
        edgeList = edgeList.concat(graphs[i].getEdges());
      }

      edgeList = edgeList.concat(this.edges);

      this.allEdges = edgeList;
    }

    return this.allEdges;
  };

  /**
   * This method returns the array of all nodes to which gravitation should be
   * applied.
   */
  LGraphManager.prototype.getAllNodesToApplyGravitation = function ()
  {
    return this.allNodesToApplyGravitation;
  };

  /**
   * This method sets the array of all nodes to which gravitation should be
   * applied from the input list.
   */
  LGraphManager.prototype.setAllNodesToApplyGravitation = function (nodeList)
  {
    if (this.allNodesToApplyGravitation != null) {
      throw "assert failed";
    }

    this.allNodesToApplyGravitation = nodeList;
  };

  /**
   * This method returns the root graph (root of the nesting hierarchy) of
   * this graph manager. Nesting relations must form a tree.
   */
  LGraphManager.prototype.getRoot = function ()
  {
    return this.rootGraph;
  };

  /**
   * This method sets the root graph (root of the nesting hierarchy) of this
   * graph manager. Nesting relations must form a tree.
   * @param graph
   */
  LGraphManager.prototype.setRootGraph = function (graph)
  {
    if (graph.getGraphManager() != this) {
      throw "Root not in this graph mgr!";
    }

    this.rootGraph = graph;

    // root graph must have a root node associated with it for convenience
    if (graph.parent == null)
    {
      graph.parent = this.layout.newNode("Root node");
    }
  };

  /**
   * This method returns the associated layout object, which operates on this
   * graph manager.
   */
  LGraphManager.prototype.getLayout = function ()
  {
    return this.layout;
  };

  /**
   * This method sets the associated layout object, which operates on this
   * graph manager.
   */
  LGraphManager.prototype.setLayout = function (layout)
  {
    this.layout = layout;
  };

  /**
   * This method checks whether one of the input nodes is an ancestor of the
   * other one (and vice versa) in the nesting tree. Such pairs of nodes
   * should not be allowed to be joined by edges.
   */
  LGraphManager.prototype.isOneAncestorOfOther = function (firstNode, secondNode)
  {
    if (!(firstNode != null && secondNode != null)) {
      throw "assert failed";
    }

    if (firstNode == secondNode)
    {
      return true;
    }

    // Is second node an ancestor of the first one?

    var ownerGraph = firstNode.getOwner();
    var parentNode;

    do
    {
      parentNode = ownerGraph.getParent();

      if (parentNode == null)
      {
        break;
      }

      if (parentNode == secondNode)
      {
        return true;
      }

      ownerGraph = parentNode.getOwner();
      if (ownerGraph == null)
      {
        break;
      }
    } while (true);

    // Is first node an ancestor of the second one?

    ownerGraph = secondNode.getOwner();

    do
    {
      parentNode = ownerGraph.getParent();

      if (parentNode == null)
      {
        break;
      }

      if (parentNode == firstNode)
      {
        return true;
      }

      ownerGraph = parentNode.getOwner();
      if (ownerGraph == null)
      {
        break;
      }
    } while (true);

    return false;
  };

  /**
   * This method calculates the lowest common ancestor of each edge.
   */
  LGraphManager.prototype.calcLowestCommonAncestors = function ()
  {
    var edge;
    var sourceNode;
    var targetNode;
    var sourceAncestorGraph;
    var targetAncestorGraph;

    var edges = this.getAllEdges();
    var s = edges.length;
    for (var i = 0; i < s; i++)
    {
      edge = edges[i];

      sourceNode = edge.source;
      targetNode = edge.target;
      edge.lca = null;
      edge.sourceInLca = sourceNode;
      edge.targetInLca = targetNode;

      if (sourceNode == targetNode)
      {
        edge.lca = sourceNode.getOwner();
        continue;
      }

      sourceAncestorGraph = sourceNode.getOwner();

      while (edge.lca == null)
      {
        targetAncestorGraph = targetNode.getOwner();

        while (edge.lca == null)
        {
          if (targetAncestorGraph == sourceAncestorGraph)
          {
            edge.lca = targetAncestorGraph;
            break;
          }

          if (targetAncestorGraph == this.rootGraph)
          {
            break;
          }

          if (edge.lca != null) {
            throw "assert failed";
          }
          edge.targetInLca = targetAncestorGraph.getParent();
          targetAncestorGraph = edge.targetInLca.getOwner();
        }

        if (sourceAncestorGraph == this.rootGraph)
        {
          break;
        }

        if (edge.lca == null)
        {
          edge.sourceInLca = sourceAncestorGraph.getParent();
          sourceAncestorGraph = edge.sourceInLca.getOwner();
        }
      }

      if (edge.lca == null) {
        throw "assert failed";
      }
    }
  };

  /**
   * This method finds the lowest common ancestor of given two nodes.
   * 
   * @param firstNode
   * @param secondNode
   * @return lowest common ancestor
   */
  LGraphManager.prototype.calcLowestCommonAncestor = function (firstNode, secondNode)
  {
    if (firstNode == secondNode)
    {
      return firstNode.getOwner();
    }

    var firstOwnerGraph = firstNode.getOwner();

    do
    {
      if (firstOwnerGraph == null)
      {
        break;
      }

      var secondOwnerGraph = secondNode.getOwner();

      do
      {
        if (secondOwnerGraph == null)
        {
          break;
        }

        if (secondOwnerGraph == firstOwnerGraph)
        {
          return secondOwnerGraph;
        }

        secondOwnerGraph = secondOwnerGraph.getParent().getOwner();
      } while (true);

      firstOwnerGraph = firstOwnerGraph.getParent().getOwner();
    } while (true);

    return firstOwnerGraph;
  };

  /*
   * Auxiliary method for calculating depths of nodes in the inclusion tree.
   */
  LGraphManager.prototype.calcInclusionTreeDepths = function (graph, depth) {
    if (graph == null && depth == null) {
      graph = this.rootGraph;
      depth = 1;
    }
    var node;

    var nodes = graph.getNodes();
    var s = nodes.length;
    for (var i = 0; i < s; i++)
    {
      node = nodes[i];

      node.inclusionTreeDepth = depth;

      if (node.child != null)
      {
        this.calcInclusionTreeDepths(node.child, depth + 1);
      }
    }
  };

  LGraphManager.prototype.includesInvalidEdge = function ()
  {
    var edge;

    var s = this.edges.length;
    for (var i = 0; i < s; i++)
    {
      edge = this.edges[i];

      if (this.isOneAncestorOfOther(edge.source, edge.target))
      {
        return true;
      }
    }
    return false;
  };

  /**
   * This method prints the topology of this graph manager.
   */
  LGraphManager.prototype.printTopology = function ()
  {
    this.rootGraph.printTopology();

    var graph;
    var s = this.graphs.length;

    for (var i = 0; i < s; i++)
    {
      graph = this.graphs[i];

      if (graph != this.rootGraph)
      {
        graph.printTopology();
      }
    }
  };

  function LGraphObject(vGraphObject) {
    /**
     * Associated view object
     */
    this.vGraphObject = null;

    /**
     * Label
     */
    this.label = null;

    this.vGraphObject = vGraphObject;
  }

  /**
   * This class represents a node (l-level) for layout purposes. A node maintains
   * a list of its incident edges, which includes inter-graph edges. Every node
   * has an owner graph, except for the root node, which resides at the top of the
   * nesting hierarchy along with its child graph (the root graph).
   * gm, loc, size, vNode
   * gm, vNode, loc, size
   */

  function LNode(gm, loc, size, vNode) {
    //Alternative constructor 1 : LNode(LGraphManager gm, Point loc, Dimension size, Object vNode)
    if (size == null && vNode == null) {
      vNode = loc;
    }

    LGraphObject.call(this, vNode);

    //Alternative constructor 2 : LNode(Layout layout, Object vNode)
    if (gm.graphManager != null)
      gm = gm.graphManager;

    // -----------------------------------------------------------------------------
    // Section: Instance variables
    // -----------------------------------------------------------------------------
    /*
     * Owner graph manager of this node
     */
    this.graphManager = null;

    /**
     * Possibly null child graph of this node
     */
    this.child;

    /*
     * Owner graph of this node; cannot be null
     */
    this.owner;

    /*
     * List of edges incident with this node
     */
    this.edges;

    /*
     * Geometry of this node
     */
    this.rect;

    /*
     * List of clusters, this node belongs to.
     */
//  this.clusters;

    /*
     * Estimated initial size (needed for compound node size estimation)
     */
    this.estimatedSize = Integer.MIN_VALUE;

    /*
     * Depth of this node in nesting hierarchy. Nodes in the root graph are of
     * depth 1, nodes in the child graph of a node in the graph are of depth 2,
     * etc.
     */
    this.inclusionTreeDepth = Integer.MAX_VALUE;

    // -----------------------------------------------------------------------------
    // Section: Constructors and initialization
    // -----------------------------------------------------------------------------
    //in java: super(vNode);
    this.vGraphObject = vNode;
    //in java: this.initialize();
    this.edges = [];
//  this.clusters = [];
    //---------------------------
    this.graphManager = gm;

    if (size != null && loc != null)
      this.rect = new RectangleD(loc.x, loc.y, size.width, size.height);
    else
      this.rect = new RectangleD();
  }

  LNode.prototype = Object.create(LGraphObject.prototype);
  for (var prop in LGraphObject) {
    LNode[prop] = LGraphObject[prop];
  }

// -----------------------------------------------------------------------------
// Section: Accessors
// -----------------------------------------------------------------------------
  /**
   * This method returns the list of incident edges of this node.
   */
  LNode.prototype.getEdges = function ()
  {
    return this.edges;
  };

  /**
   * This method returns the child graph of this node, if any. Only compound
   * nodes will have child graphs.
   */
  LNode.prototype.getChild = function ()
  {
    return this.child;
  };

  /**
   * This method sets the child graph of this node. Only compound nodes will
   * have child graphs.
   */
  LNode.prototype.setChild = function (child)
  {
    if (child != null)
      if (!(child == null || child.getGraphManager() == this.graphManager))
        throw "Child has different graph mgr!";

    this.child = child;
  };

  /**
   * This method returns the owner graph of this node.
   */
  LNode.prototype.getOwner = function ()
  {
    if (this.owner != null) {
      if (!(this.owner == null || this.owner.getNodes().indexOf(this) > -1)) {
        throw "assert failed";
      }
    }

    return this.owner;
  };

  /**
   * This method sets the owner of this node as input graph.
   */
  LNode.prototype.setOwner = function (owner)
  {
    this.owner = owner;
  };

  /**
   * This method returns the width of this node.
   */
  LNode.prototype.getWidth = function ()
  {
    return this.rect.width;
  };

  /**
   * This method sets the width of this node.
   */
  LNode.prototype.setWidth = function (width)
  {
    this.rect.width = width;
  };

  /**
   * This method returns the height of this node.
   */
  LNode.prototype.getHeight = function ()
  {
    return this.rect.height;
  };

  /**
   * This method sets the height of this node.
   */
  LNode.prototype.setHeight = function (height)
  {
    this.rect.height = height;
  };

  /**
   * This method returns the x coordinate of the center of this node.
   */
  LNode.prototype.getCenterX = function ()
  {
    return this.rect.x + this.rect.width / 2;
  };

  /**
   * This method returns the y coordinate of the center of this node.
   */
  LNode.prototype.getCenterY = function ()
  {
    return this.rect.y + this.rect.height / 2;
  };

  /**
   * This method returns the center of this node.
   */
  LNode.prototype.getCenter = function ()
  {
    return new PointD(this.rect.x + this.rect.width / 2,
            this.rect.y + this.rect.height / 2);
  };

  /**
   * This method returns the location (upper-left corner) of this node.
   */
  LNode.prototype.getLocation = function ()
  {
    return new PointD(this.rect.x, this.rect.y);
  };

  /**
   * This method returns the geometry of this node.
   */
  LNode.prototype.getRect = function ()
  {
    return this.rect;
  };

  /**
   * This method returns the diagonal length of this node.
   */
  LNode.prototype.getDiagonal = function ()
  {
    return Math.sqrt(this.rect.width * this.rect.width +
            this.rect.height * this.rect.height);
  };

  /**
   * This method returns half the diagonal length of this node.
   */
  LNode.prototype.getHalfTheDiagonal = function ()
  {
    return Math.sqrt(this.rect.height * this.rect.height +
            this.rect.width * this.rect.width) / 2;
  };

  /**
   * This method sets the geometry of this node.
   */
  LNode.prototype.setRect = function (upperLeft, dimension)
  {
    this.rect.x = upperLeft.x;
    this.rect.y = upperLeft.y;
    this.rect.width = dimension.width;
    this.rect.height = dimension.height;
  };

  /**
   * This method sets the center of this node.
   */
  LNode.prototype.setCenter = function (cx, cy)
  {
    this.rect.x = cx - this.rect.width / 2;
    this.rect.y = cy - this.rect.height / 2;
  };

  /**
   * This method sets the location of this node.
   */
  LNode.prototype.setLocation = function (x, y)
  {
    this.rect.x = x;
    this.rect.y = y;
  };

  /**
   * This method moves the geometry of this node by specified amounts.
   */
  LNode.prototype.moveBy = function (dx, dy)
  {
    this.rect.x += dx;
    this.rect.y += dy;
  };

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------
  /**
   * This method returns all nodes emanating from this node.
   */
  LNode.prototype.getEdgeListToNode = function (to)
  {
    var edgeList = [];
    var edge;

    for (var obj in this.edges)
    {
      edge = obj;

      if (edge.target == to)
      {
        if (edge.source != this)
          throw "Incorrect edge source!";

        edgeList.push(edge);
      }
    }

    return edgeList;
  };

  /**
   *	This method returns all edges between this node and the given node.
   */
  LNode.prototype.getEdgesBetween = function (other)
  {
    var edgeList = [];
    var edge;

    for (var obj in this.edges)
    {
      edge = this.edges[obj];

      if (!(edge.source == this || edge.target == this))
        throw "Incorrect edge source and/or target";

      if ((edge.target == other) || (edge.source == other))
      {
        edgeList.push(edge);
      }
    }

    return edgeList;
  };

  /**
   * This method returns whether or not input node is a neighbor of this node.
   */
  LNode.prototype.isNeighbor = function (node)
  {
    var edge;

    for (var obj in this.edges)
    {
      edge = obj;

      if (edge.source == node || edge.target == node)
      {
        return true;
      }
    }

    return false;
  };

  /**
   * This method returns a set of neighbors of this node.
   */
  LNode.prototype.getNeighborsList = function ()
  {
    var neighbors = new HashSet();
    var edge;

    for (var obj in this.edges)
    {
      edge = this.edges[obj];

      if (edge.source == this)
      {
        neighbors.add(edge.target);
      }
      else
      {
        if (!edge.target == this)
          throw "Incorrect incidency!";
        neighbors.add(edge.source);
      }
    }

    return neighbors;
  };

  /**
   * This method returns a set of successors (outgoing nodes) of this node.
   */
  LNode.prototype.getSuccessors = function ()
  {
    var neighbors = new HashSet();
    var edge;

    for (var obj in this.edges)
    {
      edge = obj;

      if (!(edge.source.equals(this) || edge.target.equals(this)))
        throw	"Incorrect incidency!";

      if (edge.source.equals(this))//**************************************************
      {
        neighbors.add(edge.target);
      }
    }

    return neighbors;
  };

  /**
   * This method forms a list of nodes, composed of this node and its children
   * (direct and indirect).
   */
  LNode.prototype.withChildren = function ()
  {
    var withNeighborsList = [];
    var childNode;

    withNeighborsList.push(this);

    if (this.child != null)
    {
      var nodes = this.child.getNodes();
      for (var i = 0; i < nodes.length; i++)
      {
        childNode = nodes[i];

        withNeighborsList = withNeighborsList.concat(childNode.withChildren());
      }
    }

    return withNeighborsList;
  };

  /**
   * This method returns the estimated size of this node, taking into account
   * node margins and whether this node is a compound one containing others.
   */
  LNode.prototype.getEstimatedSize = function () {
    if (this.estimatedSize == Integer.MIN_VALUE) {
      throw "assert failed";
    }
    return this.estimatedSize;
  };

  /*
   * This method calculates the estimated size of this node. If the node is
   * a compound node, the operation is performed recursively. It also sets the
   * initial sizes of compound nodes based on this estimate.
   */
  LNode.prototype.calcEstimatedSize = function () {
    if (this.child == null)
    {
      return this.estimatedSize = Math.floor((this.rect.width + this.rect.height) / 2);
    }
    else
    {
      this.estimatedSize = this.child.calcEstimatedSize();
      this.rect.width = this.estimatedSize;
      this.rect.height = this.estimatedSize;

      return this.estimatedSize;
    }
  };

  /**
   * This method positions this node randomly in both x and y dimensions. We
   * assume the center to be at (WORLD_CENTER_X, WORLD_CENTER_Y).
   */
  LNode.prototype.scatter = function () {
    var randomCenterX;
    var randomCenterY;

    var minX = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
    var maxX = LayoutConstants.INITIAL_WORLD_BOUNDARY;
    randomCenterX = LayoutConstants.WORLD_CENTER_X +
            (RandomSeed.nextDouble() * (maxX - minX)) + minX;

    var minY = -LayoutConstants.INITIAL_WORLD_BOUNDARY;
    var maxY = LayoutConstants.INITIAL_WORLD_BOUNDARY;
    randomCenterY = LayoutConstants.WORLD_CENTER_Y +
            (RandomSeed.nextDouble() * (maxY - minY)) + minY;

    this.rect.x = randomCenterX;
    this.rect.y = randomCenterY
  };

  /**
   * This method updates the bounds of this compound node.
   */
  LNode.prototype.updateBounds = function () {
    if (this.getChild() == null) {
      throw "assert failed";
    }
    if (this.getChild().getNodes().length != 0)
    {
      // wrap the children nodes by re-arranging the boundaries
      var childGraph = this.getChild();
      childGraph.updateBounds(true);

      this.rect.x = childGraph.getLeft();
      this.rect.y = childGraph.getTop();

      this.setWidth(childGraph.getRight() - childGraph.getLeft() +
              2 * LayoutConstants.COMPOUND_NODE_MARGIN);
      this.setHeight(childGraph.getBottom() - childGraph.getTop() +
              2 * LayoutConstants.COMPOUND_NODE_MARGIN +
              LayoutConstants.LABEL_HEIGHT);
    }
  };

  /**
   * This method returns the depth of this node in the inclusion tree (nesting
   * hierarchy).
   */
  LNode.prototype.getInclusionTreeDepth = function ()
  {
    if (this.inclusionTreeDepth == Integer.MAX_VALUE) {
      throw "assert failed";
    }
    return this.inclusionTreeDepth;
  };

  /**
   * This method returns all parents (direct or indirect) of this node in the
   * nesting hierarchy.
   */
  LNode.prototype.getAllParents = function () {
    var parents = [];
    var rootNode = this.owner.getGraphManager().getRoot().getParent();
    var parent = this.owner.getParent();

    while (true)
    {
      if (parent != rootNode)
      {
        parents.push(parent);
      }
      else
      {
        break;
      }

      parent = parent.getOwner().getParent();
    }

    parents.push(rootNode);

    return parents;
  };

  /**
   * This method transforms the layout coordinates of this node using input
   * transform.
   */
  LNode.prototype.transform = function (trans)
  {
    var left = this.rect.x;

    if (left > LayoutConstants.WORLD_BOUNDARY)
    {
      left = LayoutConstants.WORLD_BOUNDARY;
    }
    else if (left < -LayoutConstants.WORLD_BOUNDARY)
    {
      left = -LayoutConstants.WORLD_BOUNDARY;
    }

    var top = this.rect.y;

    if (top > LayoutConstants.WORLD_BOUNDARY)
    {
      top = LayoutConstants.WORLD_BOUNDARY;
    }
    else if (top < -LayoutConstants.WORLD_BOUNDARY)
    {
      top = -LayoutConstants.WORLD_BOUNDARY;
    }

    var leftTop = new PointD(left, top);
    var vLeftTop = trans.inverseTransformPoint(leftTop);

    this.setLocation(vLeftTop.x, vLeftTop.y);
  };

  /**
   * This method returns the left of this node.
   */
  LNode.prototype.getLeft = function ()
  {
    return this.rect.x;
  };

  /**
   * This method returns the right of this node.
   */
  LNode.prototype.getRight = function ()
  {
    return this.rect.x + this.rect.width;
  };

  /**
   * This method returns the top of this node.
   */
  LNode.prototype.getTop = function ()
  {
    return this.rect.y;
  };

  /**
   * This method returns the bottom of this node.
   */
  LNode.prototype.getBottom = function ()
  {
    return this.rect.y + this.rect.height;
  };

  /**
   * This method returns the parent of clustered object.
   * If it is a root object, then null should be returned.
   */
  LNode.prototype.getParent = function ()
  {
    if (this.owner == null)
    {
      return null;
    }

    return this.owner.getParent();
  };

// -----------------------------------------------------------------------------
// Section: Class variables
// -----------------------------------------------------------------------------
  /*
   * Used for random initial positioning
   */
//  LNode.random = new RandomSeed(Layout.RANDOM_SEED);
// -----------------------------------------------------------------------------
// Section: Testing methods
// -----------------------------------------------------------------------------
  /**
   * This method prints the topology of this node.
   */
  LNode.prototype.printTopology = function ()
  {
    console.log(this.rect.x + "\t" + this.rect.getY() + "\t" + this.rect.getWidth() + "\t" + this.rect.getHeight());
  }

  function Layout(isRemoteUse) {
    /**
     * Layout Quality: 0:proof, 1:default, 2:draft
     */
    this.layoutQuality = LayoutConstants.DEFAULT_QUALITY;

    /**
     * Whether layout should create bendpoints as needed or not
     */
    this.createBendsAsNeeded =
            LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;

    /**
     * Whether layout should be incremental or not
     */
    this.incremental = LayoutConstants.DEFAULT_INCREMENTAL;

    /**
     * Whether we animate from before to after layout node positions
     */
    this.animationOnLayout =
            LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;

    /**
     * Whether we animate the layout process or not
     */
    this.animationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;

    /**
     * Number iterations that should be done between two successive animations
     */
    this.animationPeriod = LayoutConstants.DEFAULT_ANIMATION_PERIOD;

    /**
     * Whether or not leaf nodes (non-compound nodes) are of uniform sizes. When
     * they are, both spring and repulsion forces between two leaf nodes can be
     * calculated without the expensive clipping point calculations, resulting
     * in major speed-up.
     */
    this.uniformLeafNodeSizes =
            LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;

    /*
     * Geometric abstraction of the compound graph
     */
    //this.graphManager = null;

    /*
     * Whether layout is finished or not
     */
    this.isLayoutFinished = null;

    /*
     * Whether this layout is a sub-layout of another one (e.g. CoSE called
     * within CiSE for laying out the cluster graph)
     */
    this.isSubLayout = null;

    /**
     * This is used for creation of bendpoints by using dummy nodes and edges.
     * Maps an LEdge to its dummy bendpoint path.
     */
    this.edgeToDummyNodes = new HashMap();

    /**
     * Indicates whether the layout is called remotely or not.
     */
    this.isRemoteUse = null;

    this.graphManager = new LGraphManager(this);//this.newGraphManager();
    this.isLayoutFinished = false;
    this.isSubLayout = false;
    this.isRemoteUse = false;


    //assert (this.graphManager != null);
    if (isRemoteUse != null) {
      this.isRemoteUse = isRemoteUse;
    }
  }


  /**
   * Used for deterministic results on consecutive executions of layout.
   */
  Layout.RANDOM_SEED = 1;

  Layout.prototype.getGraphManager = function () {
    return this.graphManager;
  };

  Layout.prototype.getAllNodes = function () {
    return this.graphManager.getAllNodes();
  };

  Layout.prototype.getAllEdges = function () {
    return this.graphManager.getAllEdges();
  };

  Layout.prototype.getAllNodesToApplyGravitation = function () {
    return this.graphManager.getAllNodesToApplyGravitation();
  };

  /*
   * This method creates a new graph manager associated with this layout.
   */
  Layout.prototype.newGraphManager = function () {
    var gm = new LGraphManager(this);
    this.graphManager = gm;
    return gm;
  };

  /**
   * This method creates a new graph associated with the input view graph.
   */
  Layout.prototype.newGraph = function (vGraph)
  {
    return new LGraph(null, this.graphManager, vGraph);
  };

  /**
   * This method creates a new node associated with the input view node.
   */
  Layout.prototype.newNode = function (vNode)
  {
    return new LNode(this.graphManager, vNode);
  };

  /**
   * This method creates a new edge associated with the input view edge.
   */
  Layout.prototype.newEdge = function (vEdge)
  {
    return new LEdge(null, null, vEdge);
  };

  /**
   * This method coordinates the layout operation. It returns true upon
   * success, false otherwise.
   */
  Layout.prototype.runLayout = function ()
  {
    this.isLayoutFinished = false;

    if (!this.isSubLayout)
    {
      this.doPreLayout();
    }

    this.initParameters();
    var isLayoutSuccessfull;

    if ((this.graphManager.getRoot() == null)
            || this.graphManager.getRoot().getNodes().length == 0
            || this.graphManager.includesInvalidEdge())
    {
      isLayoutSuccessfull = false;
    }
    else
    {
      // calculate execution time
      var startTime = 0;

      if (!this.isSubLayout)
      {
        startTime = new Date().getTime()
      }

      isLayoutSuccessfull = this.layout();

      if (!this.isSubLayout)
      {
        var endTime = new Date().getTime();
        var excTime = endTime - startTime;

        console.log("Total execution time: " + excTime + " miliseconds.");
      }
    }

    if (isLayoutSuccessfull)
    {
      if (!this.isSubLayout)
      {
        this.doPostLayout();
      }
    }

    this.isLayoutFinished = true;

    return isLayoutSuccessfull;
  };

  /**
   * This method performs the operations required before layout.
   */
  Layout.prototype.doPreLayout = function ()
  {
  };

  /**
   * This method performs the operations required after layout.
   */
  Layout.prototype.doPostLayout = function ()
  {
    //assert !isSubLayout : "Should not be called on sub-layout!";
    // Propagate geometric changes to v-level objects
    this.transform();
    this.update();
  };

  /**
   * This method updates the geometry of the target graph according to
   * calculated layout.
   */
  Layout.prototype.update2 = function () {
    // update bend points
    if (this.createBendsAsNeeded)
    {
      this.createBendpointsFromDummyNodes();

      // reset all edges, since the topology has changed
      this.graphManager.resetAllEdges();
    }

    // perform edge, node and root updates if layout is not called
    // remotely
    if (!this.isRemoteUse)
    {
      // update all edges
      var edge;
      var allEdges = this.graphManager.getAllEdges();
      for (var i = 0; i < allEdges.length; i++)
      {
        edge = allEdges[i];
//      this.update(edge);
      }

      // recursively update nodes 
      var node;
      var nodes = this.graphManager.getRoot().getNodes();
      for (var i = 0; i < nodes.length; i++)
      {
        node = nodes[i];
//      this.update(node);
      }

      // update root graph
      this.update(this.graphManager.getRoot());
    }
  };

  Layout.prototype.update = function (obj) {
    if (obj == null) {
      this.update2();
    }
    else if (obj instanceof LNode) {
      var node = obj;
      if (node.getChild() != null)
      {
        // since node is compound, recursively update child nodes
        var nodes = node.getChild().getNodes();
        for (var i = 0; i < nodes.length; i++)
        {
          update(nodes[i]);
        }
      }

      // if the l-level node is associated with a v-level graph object,
      // then it is assumed that the v-level node implements the
      // interface Updatable.
      if (node.vGraphObject != null)
      {
        // cast to Updatable without any type check
        var vNode = node.vGraphObject;

        // call the update method of the interface 
        vNode.update(node);
      }
    }
    else if (obj instanceof LEdge) {
      var edge = obj;
      // if the l-level edge is associated with a v-level graph object,
      // then it is assumed that the v-level edge implements the
      // interface Updatable.

      if (edge.vGraphObject != null)
      {
        // cast to Updatable without any type check
        var vEdge = edge.vGraphObject;

        // call the update method of the interface 
        vEdge.update(edge);
      }
    }
    else if (obj instanceof LGraph) {
      var graph = obj;
      // if the l-level graph is associated with a v-level graph object,
      // then it is assumed that the v-level object implements the
      // interface Updatable.

      if (graph.vGraphObject != null)
      {
        // cast to Updatable without any type check
        var vGraph = graph.vGraphObject;

        // call the update method of the interface 
        vGraph.update(graph);
      }
    }
  };

  /**
   * This method is used to set all layout parameters to default values
   * determined at compile time.
   */
  Layout.prototype.initParameters = function () {
    if (!this.isSubLayout)
    {
      this.layoutQuality = layoutOptionsPack.layoutQuality;
      this.animationDuringLayout = layoutOptionsPack.animationDuringLayout;
      this.animationPeriod = Math.floor(Layout.transform(layoutOptionsPack.animationPeriod,
              LayoutConstants.DEFAULT_ANIMATION_PERIOD));
      this.animationOnLayout = layoutOptionsPack.animationOnLayout;
      this.incremental = layoutOptionsPack.incremental;
      this.createBendsAsNeeded = layoutOptionsPack.createBendsAsNeeded;
      this.uniformLeafNodeSizes = layoutOptionsPack.uniformLeafNodeSizes;
    }

    if (this.animationDuringLayout)
    {
      animationOnLayout = false;
    }
  };

  Layout.prototype.transform = function (newLeftTop) {
    if (newLeftTop == undefined) {
      this.transform(new PointD(0, 0));
    }
    else {
      // create a transformation object (from Eclipse to layout). When an
      // inverse transform is applied, we get upper-left coordinate of the
      // drawing or the root graph at given input coordinate (some margins
      // already included in calculation of left-top).

      var trans = new Transform();
      var leftTop = this.graphManager.getRoot().updateLeftTop();

      if (leftTop != null)
      {
        trans.setWorldOrgX(newLeftTop.x);
        trans.setWorldOrgY(newLeftTop.y);

        trans.setDeviceOrgX(leftTop.x);
        trans.setDeviceOrgY(leftTop.y);

        var nodes = this.getAllNodes();
        var node;

        for (var i = 0; i < nodes.length; i++)
        {
          node = nodes[i];
          node.transform(trans);
        }
      }
    }
  };

  Layout.prototype.positionNodesRandomly = function (graph) {
    if (graph == undefined) {
      //assert !this.incremental;
      this.positionNodesRandomly(this.getGraphManager().getRoot());
      this.getGraphManager().getRoot().updateBounds(true);
    }
    else {
      var lNode;
      var childGraph;

      var nodes = graph.getNodes();
      for (var i = 0; i < nodes.length; i++)
      {
        lNode = nodes[i];
        childGraph = lNode.getChild();

        if (childGraph == null)
        {
          lNode.scatter();
        }
        else if (childGraph.getNodes().length == 0)
        {
          lNode.scatter();
        }
        else
        {
          this.positionNodesRandomly(childGraph);
          lNode.updateBounds();
        }
      }
    }
  };

  /**
   * This method returns a list of trees where each tree is represented as a
   * list of l-nodes. The method returns a list of size 0 when:
   * - The graph is not flat or
   * - One of the component(s) of the graph is not a tree.
   */
  Layout.prototype.getFlatForest = function ()
  {
    var flatForest = [];
    var isForest = true;

    // Quick reference for all nodes in the graph manager associated with
    // this layout. The list should not be changed.
    var allNodes = this.graphManager.getRoot().getNodes();

    // First be sure that the graph is flat
    var isFlat = true;

    for (var i = 0; i < allNodes.length; i++)
    {
      if (allNodes[i].getChild() != null)
      {
        isFlat = false;
      }
    }

    // Return empty forest if the graph is not flat.
    if (!isFlat)
    {
      return flatForest;
    }

    // Run BFS for each component of the graph.

    var visited = new HashSet();
    var toBeVisited = [];
    var parents = new HashMap();
    var unProcessedNodes = [];

    unProcessedNodes = unProcessedNodes.concat(allNodes);

    // Each iteration of this loop finds a component of the graph and
    // decides whether it is a tree or not. If it is a tree, adds it to the
    // forest and continued with the next component.

    while (unProcessedNodes.length > 0 && isForest)
    {
      toBeVisited.push(unProcessedNodes[0]);

      // Start the BFS. Each iteration of this loop visits a node in a
      // BFS manner.
      while (toBeVisited.length > 0 && isForest)
      {
        //pool operation
        var currentNode = toBeVisited[0];
        toBeVisited.splice(0, 1);
        visited.add(currentNode);

        // Traverse all neighbors of this node
        var neighborEdges = currentNode.getEdges();

        for (var i = 0; i < neighborEdges.length; i++)
        {
          var currentNeighbor =
                  neighborEdges[i].getOtherEnd(currentNode);

          // If BFS is not growing from this neighbor.
          if (parents.get(currentNode) != currentNeighbor)
          {
            // We haven't previously visited this neighbor.
            if (!visited.contains(currentNeighbor))
            {
              toBeVisited.push(currentNeighbor);
              parents.put(currentNeighbor, currentNode);
            }
            // Since we have previously visited this neighbor and
            // this neighbor is not parent of currentNode, given
            // graph contains a component that is not tree, hence
            // it is not a forest.
            else
            {
              isForest = false;
              break;
            }
          }
        }
      }

      // The graph contains a component that is not a tree. Empty
      // previously found trees. The method will end.
      if (!isForest)
      {
        flatForest = [];
      }
      // Save currently visited nodes as a tree in our forest. Reset
      // visited and parents lists. Continue with the next component of
      // the graph, if any.
      else
      {
        var temp = [];
        visited.addAllTo(temp);
        flatForest.push(temp);
        //flatForest = flatForest.concat(temp);
        //unProcessedNodes.removeAll(visited);
        for (var i = 0; i < temp.length; i++) {
          var value = temp[i];
          var index = unProcessedNodes.indexOf(value);
          if (index > -1) {
            unProcessedNodes.splice(index, 1);
          }
        }
        visited = new HashSet();
        parents = new HashMap();
      }
    }

    return flatForest;
  };

  /**
   * This method creates dummy nodes (an l-level node with minimal dimensions)
   * for the given edge (one per bendpoint). The existing l-level structure
   * is updated accordingly.
   */
  Layout.prototype.createDummyNodesForBendpoints = function (edge)
  {
    var dummyNodes = [];
    var prev = edge.source;

    var graph = this.graphManager.calcLowestCommonAncestor(edge.source, edge.target);

    for (var i = 0; i < edge.bendpoints.length; i++)
    {
      // create new dummy node
      var dummyNode = this.newNode(null);
      dummyNode.setRect(new Point(0, 0), new Dimension(1, 1));

      graph.add(dummyNode);

      // create new dummy edge between prev and dummy node
      var dummyEdge = this.newEdge(null);
      this.graphManager.add(dummyEdge, prev, dummyNode);

      dummyNodes.add(dummyNode);
      prev = dummyNode;
    }

    var dummyEdge = this.newEdge(null);
    this.graphManager.add(dummyEdge, prev, edge.target);

    this.edgeToDummyNodes.put(edge, dummyNodes);

    // remove real edge from graph manager if it is inter-graph
    if (edge.isInterGraph())
    {
      this.graphManager.remove(edge);
    }
    // else, remove the edge from the current graph
    else
    {
      graph.remove(edge);
    }

    return dummyNodes;
  };

  /**
   * This method creates bendpoints for edges from the dummy nodes
   * at l-level.
   */
  Layout.prototype.createBendpointsFromDummyNodes = function ()
  {
    var edges = [];
    edges = edges.concat(this.graphManager.getAllEdges());
    edges = this.edgeToDummyNodes.keySet().concat(edges);

    for (var k = 0; k < edges.length; k++)
    {
      var lEdge = edges[k];

      if (lEdge.bendpoints.length > 0)
      {
        var path = this.edgeToDummyNodes.get(lEdge);

        for (var i = 0; i < path.length; i++)
        {
          var dummyNode = path[i];
          var p = new PointD(dummyNode.getCenterX(),
                  dummyNode.getCenterY());

          // update bendpoint's location according to dummy node
          var ebp = lEdge.bendpoints.get(i);
          ebp.x = p.x;
          ebp.y = p.y;

          // remove the dummy node, dummy edges incident with this
          // dummy node is also removed (within the remove method)
          dummyNode.getOwner().remove(dummyNode);
        }

        // add the real edge to graph
        this.graphManager.add(lEdge, lEdge.source, lEdge.target);
      }
    }
  };

  Layout.transform = function (sliderValue, defaultValue, minDiv, maxMul) {
    if (minDiv != undefined && maxMul != undefined) {
      var value = defaultValue;

      if (sliderValue <= 50)
      {
        var minValue = defaultValue / minDiv;
        value -= ((defaultValue - minValue) / 50) * (50 - sliderValue);
      }
      else
      {
        var maxValue = defaultValue * maxMul;
        value += ((maxValue - defaultValue) / 50) * (sliderValue - 50);
      }

      return value;
    }
    else {
      var a, b;

      if (sliderValue <= 50)
      {
        a = 9.0 * defaultValue / 500.0;
        b = defaultValue / 10.0;
      }
      else
      {
        a = 9.0 * defaultValue / 50.0;
        b = -8 * defaultValue;
      }

      return (a * sliderValue + b);
    }
  };

  /**
   * This method takes a list of lists, where each list contains l-nodes of a
   * tree. Center of each tree is return as a list of.
   */
  Layout.findCenterOfEachTree = function (listofLists)
  {
    var centers = [];

    for (var i = 0; i < listofLists.length; i++)
    {
      var list = listofLists[i];
      var center = findCenterOfTree(list);
      centers[i] = center;
    }

    return centers;
  };

  /**
   * This method finds and returns the center of the given nodes, assuming
   * that the given nodes form a tree in themselves.
   */
  Layout.findCenterOfTree = function (nodes)
  {
    var list = [];
    list = list.concat(nodes);

    var removedNodes = [];
    var remainingDegrees = new HashMap();
    var foundCenter = false;
    var centerNode = null;

    if (list.length == 1 || list.length == 2)
    {
      foundCenter = true;
      centerNode = list[0];
    }

    for (var i = 0; i < list.length; i++)
    {
      var node = list[i];
      var degree = node.getNeighborsList().size();
      remainingDegrees.put(node, node.getNeighborsList().size());

      if (degree == 1)
      {
        removedNodes.push(node);
      }
    }

    var tempList = [];
    tempList = tempList.concat(removedNodes);

    while (!foundCenter)
    {
      var tempList2 = [];
      tempList2 = tempList2.concat(tempList);
      tempList = [];

      for (var i = 0; i < list.length; i++)
      {
        var node = list[i];

        var index = list.indexOf(node);
        if (index >= 0) {
          list.splice(index, 1);
        }

        var neighbours = node.getNeighborsList();

        for (var j in neighbours.set)
        {
          var neighbour = neighbours.set[j];
          if (removedNodes.indexOf(neighbour) < 0)
          {
            var otherDegree = remainingDegrees.get(neighbour);
            var newDegree = otherDegree - 1;

            if (newDegree == 1)
            {
              tempList.push(neighbour);
            }

            remainingDegrees.put(neighbour, newDegree);
          }
        }
      }

      removedNodes = removedNodes.concat(tempList);

      if (list.length == 1 || list.length == 2)
      {
        foundCenter = true;
        centerNode = list[0];
      }
    }

    return centerNode;
  };

  /**
   * During the coarsening process, this layout may be referenced by two graph managers
   * this setter function grants access to change the currently being used graph manager
   */
  Layout.prototype.setGraphManager = function (gm)
  {
    this.graphManager = gm;
  };

  function LayoutConstants() {
  }

  /**
   * Layout Quality
   */
  LayoutConstants.PROOF_QUALITY = 0;
  LayoutConstants.DEFAULT_QUALITY = 1;
  LayoutConstants.DRAFT_QUALITY = 2;

  /**
   * Default parameters
   */
  LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED = false;
//LayoutConstants.DEFAULT_INCREMENTAL = true;
  LayoutConstants.DEFAULT_INCREMENTAL = false;
  LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT = true;
  LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT = false;
  LayoutConstants.DEFAULT_ANIMATION_PERIOD = 50;
  LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES = false;

// -----------------------------------------------------------------------------
// Section: General other constants
// -----------------------------------------------------------------------------
  /*
   * Margins of a graph to be applied on bouding rectangle of its contents. We
   * assume margins on all four sides to be uniform.
   */
  LayoutConstants.DEFAULT_GRAPH_MARGIN = 10;

  /*
   * The height of the label of a compound. We assume the label of a compound
   * node is placed at the bottom with a dynamic width same as the compound
   * itself.
   */
  LayoutConstants.LABEL_HEIGHT = 20;

  /*
   * Additional margins that we maintain as safety buffer for node-node
   * overlaps. Compound node labels as well as graph margins are handled
   * separately!
   */
  LayoutConstants.COMPOUND_NODE_MARGIN = 5;

  /*
   * Default dimension of a non-compound node.
   */
  LayoutConstants.SIMPLE_NODE_SIZE = 40;

  /*
   * Default dimension of a non-compound node.
   */
  LayoutConstants.SIMPLE_NODE_HALF_SIZE = LayoutConstants.SIMPLE_NODE_SIZE / 2;

  /*
   * Empty compound node size. When a compound node is empty, its both
   * dimensions should be of this value.
   */
  LayoutConstants.EMPTY_COMPOUND_NODE_SIZE = 40;

  /*
   * Minimum length that an edge should take during layout
   */
  LayoutConstants.MIN_EDGE_LENGTH = 1;

  /*
   * World boundaries that layout operates on
   */
  LayoutConstants.WORLD_BOUNDARY = 1000000;

  /*
   * World boundaries that random positioning can be performed with
   */
  LayoutConstants.INITIAL_WORLD_BOUNDARY = LayoutConstants.WORLD_BOUNDARY / 1000;

  /*
   * Coordinates of the world center
   */
  LayoutConstants.WORLD_CENTER_X = 1200;
  LayoutConstants.WORLD_CENTER_Y = 900;

  function layoutOptionsPack(){}

  layoutOptionsPack.layoutQuality; // proof, default, draft
  layoutOptionsPack.animationDuringLayout; // T-F
  layoutOptionsPack.animationOnLayout; // T-F
  layoutOptionsPack.animationPeriod; // 0-100
  layoutOptionsPack.incremental; // T-F
  layoutOptionsPack.createBendsAsNeeded; // T-F
  layoutOptionsPack.uniformLeafNodeSizes; // T-F

  layoutOptionsPack.defaultLayoutQuality = LayoutConstants.DEFAULT_QUALITY;
  layoutOptionsPack.defaultAnimationDuringLayout = LayoutConstants.DEFAULT_ANIMATION_DURING_LAYOUT;
  layoutOptionsPack.defaultAnimationOnLayout = LayoutConstants.DEFAULT_ANIMATION_ON_LAYOUT;
  layoutOptionsPack.defaultAnimationPeriod = 50;
  layoutOptionsPack.defaultIncremental = LayoutConstants.DEFAULT_INCREMENTAL;
  layoutOptionsPack.defaultCreateBendsAsNeeded = LayoutConstants.DEFAULT_CREATE_BENDS_AS_NEEDED;
  layoutOptionsPack.defaultUniformLeafNodeSizes = LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES;

  function setDefaultLayoutProperties() {
    layoutOptionsPack.layoutQuality = layoutOptionsPack.defaultLayoutQuality;
    layoutOptionsPack.animationDuringLayout = layoutOptionsPack.defaultAnimationDuringLayout;
    layoutOptionsPack.animationOnLayout = layoutOptionsPack.defaultAnimationOnLayout;
    layoutOptionsPack.animationPeriod = layoutOptionsPack.defaultAnimationPeriod;
    layoutOptionsPack.incremental = layoutOptionsPack.defaultIncremental;
    layoutOptionsPack.createBendsAsNeeded = layoutOptionsPack.defaultCreateBendsAsNeeded;
    layoutOptionsPack.uniformLeafNodeSizes = layoutOptionsPack.defaultUniformLeafNodeSizes;
  }

  setDefaultLayoutProperties();

  function fillCoseLayoutOptionsPack() {
    layoutOptionsPack.defaultIdealEdgeLength = CoSEConstants.DEFAULT_EDGE_LENGTH;
    layoutOptionsPack.defaultSpringStrength = 50;
    layoutOptionsPack.defaultRepulsionStrength = 50;
    layoutOptionsPack.defaultSmartRepulsionRangeCalc = CoSEConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION;
    layoutOptionsPack.defaultGravityStrength = 50;
    layoutOptionsPack.defaultGravityRange = 50;
    layoutOptionsPack.defaultCompoundGravityStrength = 50;
    layoutOptionsPack.defaultCompoundGravityRange = 50;
    layoutOptionsPack.defaultSmartEdgeLengthCalc = CoSEConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
    layoutOptionsPack.defaultMultiLevelScaling = CoSEConstants.DEFAULT_USE_MULTI_LEVEL_SCALING;

    layoutOptionsPack.idealEdgeLength = layoutOptionsPack.defaultIdealEdgeLength;
    layoutOptionsPack.springStrength = layoutOptionsPack.defaultSpringStrength;
    layoutOptionsPack.repulsionStrength = layoutOptionsPack.defaultRepulsionStrength;
    layoutOptionsPack.smartRepulsionRangeCalc = layoutOptionsPack.defaultSmartRepulsionRangeCalc;
    layoutOptionsPack.gravityStrength = layoutOptionsPack.defaultGravityStrength;
    layoutOptionsPack.gravityRange = layoutOptionsPack.defaultGravityRange;
    layoutOptionsPack.compoundGravityStrength = layoutOptionsPack.defaultCompoundGravityStrength;
    layoutOptionsPack.compoundGravityRange = layoutOptionsPack.defaultCompoundGravityRange;
    layoutOptionsPack.smartEdgeLengthCalc = layoutOptionsPack.defaultSmartEdgeLengthCalc;
    layoutOptionsPack.multiLevelScaling = layoutOptionsPack.defaultMultiLevelScaling;
  }



  function FDLayout() {
    Layout.call(this);

    this.useSmartIdealEdgeLengthCalculation = FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
    this.idealEdgeLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
    this.springConstant = FDLayoutConstants.DEFAULT_SPRING_STRENGTH;
    this.repulsionConstant = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH;
    this.gravityConstant = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH;
    this.compoundGravityConstant = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
    this.gravityRangeFactor = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR;
    this.compoundGravityRangeFactor = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
    this.displacementThresholdPerNode = (3.0 * FDLayoutConstants.DEFAULT_EDGE_LENGTH) / 100;
    this.coolingFactor = 1.0;
    this.initialCoolingFactor = 1.0;
    this.totalDisplacement = 0.0;
    this.oldTotalDisplacement = 0.0;
    this.maxIterations = FDLayoutConstants.MAX_ITERATIONS;
    this.totalIterations = null;

    /**
     * Number of layout iterations that has not been animated (rendered)
     */
    this.notAnimatedIterations = null;

    /**
     * Threshold for convergence (calculated according to graph to be laid out)
     */
    this.totalDisplacementThreshold = null;

    /**
     * Maximum node displacement in allowed in one iteration
     */
    this.maxNodeDisplacement = null;

    /**
     * Repulsion range & edge size of a grid
     */
    this.repulsionRange = null;

    /**
     * Screen is divided into grid of squares.
     * At each iteration, each node is placed in its grid square(s)
     * Grid is re-calculated after every tenth iteration.
     */
    this.grid = null;
  }

  FDLayout.prototype = Object.create(Layout.prototype);

  for (var prop in Layout) {
    FDLayout[prop] = Layout[prop];
  }

  FDLayout.prototype.initParameters = function () {
    Layout.prototype.initParameters.call(this, arguments);

    if (this.layoutQuality == LayoutConstants.DRAFT_QUALITY)
    {
      this.displacementThresholdPerNode += 0.30;
      this.maxIterations *= 0.8;
    }
    else if (this.layoutQuality == LayoutConstants.PROOF_QUALITY)
    {
      this.displacementThresholdPerNode -= 0.30;
      this.maxIterations *= 1.2;
    }

    this.totalIterations = 0;
    this.notAnimatedIterations = 0;

//    this.useFRGridVariant = layoutOptionsPack.smartRepulsionRangeCalc;
  };

  FDLayout.prototype.calcIdealEdgeLengths = function () {
    var edge;
    var lcaDepth;
    var source;
    var target;
    var sizeOfSourceInLca;
    var sizeOfTargetInLca;

    var allEdges = this.getGraphManager().getAllEdges();
    for (var i = 0; i < allEdges.length; i++)
    {
      edge = allEdges[i];

      edge.idealLength = this.idealEdgeLength;

      if (edge.isInterGraph)
      {
        source = edge.getSource();
        target = edge.getTarget();

        sizeOfSourceInLca = edge.getSourceInLca().getEstimatedSize();
        sizeOfTargetInLca = edge.getTargetInLca().getEstimatedSize();

        if (this.useSmartIdealEdgeLengthCalculation)
        {
          edge.idealLength += sizeOfSourceInLca + sizeOfTargetInLca -
                  2 * LayoutConstants.SIMPLE_NODE_SIZE;
        }

        lcaDepth = edge.getLca().getInclusionTreeDepth();

        edge.idealLength += FDLayoutConstants.DEFAULT_EDGE_LENGTH *
                FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR *
                (source.getInclusionTreeDepth() +
                        target.getInclusionTreeDepth() - 2 * lcaDepth);
      }
    }
  };

  FDLayout.prototype.initSpringEmbedder = function () {
    if (this.incremental)
    {
      this.coolingFactor = 0.8;
      this.initialCoolingFactor = 0.8;
      this.maxNodeDisplacement =
              FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL;
    }
    else
    {
      this.coolingFactor = 1.0;
      this.initialCoolingFactor = 1.0;
      this.maxNodeDisplacement =
              FDLayoutConstants.MAX_NODE_DISPLACEMENT;
    }

    this.maxIterations =
            Math.max(this.getAllNodes().length * 5, this.maxIterations);

    this.totalDisplacementThreshold =
            this.displacementThresholdPerNode * this.getAllNodes().length;

    this.repulsionRange = this.calcRepulsionRange();
  };

  FDLayout.prototype.calcSpringForces = function () {
    var lEdges = this.getAllEdges();
    var edge;

    for (var i = 0; i < lEdges.length; i++)
    {
      edge = lEdges[i];

      this.calcSpringForce(edge, edge.idealLength);
    }
  };

  FDLayout.prototype.calcRepulsionForces = function () {
    var i, j;
    var nodeA, nodeB;
    var lNodes = this.getAllNodes();
    var processedNodeSet;

    for (i = 0; i < lNodes.length; i++)
    {
      nodeA = lNodes[i];

      for (j = i + 1; j < lNodes.length; j++)
      {
        nodeB = lNodes[j];

        // If both nodes are not members of the same graph, skip.
        if (nodeA.getOwner() != nodeB.getOwner())
        {
          continue;
        }

        this.calcRepulsionForce(nodeA, nodeB);
      }
    }
//    }
  };

  FDLayout.prototype.calcGravitationalForces = function () {
    var node;
    var lNodes = this.getAllNodesToApplyGravitation();

    for (var i = 0; i < lNodes.length; i++)
    {
      node = lNodes[i];
      this.calcGravitationalForce(node);
    }
  };

  FDLayout.prototype.moveNodes = function () {
    var lNodes = this.getAllNodes();
    var node;

    for (var i = 0; i < lNodes.length; i++)
    {
      node = lNodes[i];
      node.move();
    }
  }

  FDLayout.prototype.calcSpringForce = function (edge, idealLength) {
    var sourceNode = edge.getSource();
    var targetNode = edge.getTarget();

    var length;
    var springForce;
    var springForceX;
    var springForceY;

    // Update edge length
    if (this.uniformLeafNodeSizes &&
            sourceNode.getChild() == null && targetNode.getChild() == null)
    {
      edge.updateLengthSimple();
    }
    else
    {
      edge.updateLength();

      if (edge.isOverlapingSourceAndTarget)
      {
        return;
      }
    }

    length = edge.getLength();

    // Calculate spring forces
    springForce = this.springConstant * (length - idealLength);

    // Project force onto x and y axes
    springForceX = springForce * (edge.getLengthX() / length);
    springForceY = springForce * (edge.getLengthY() / length);

    // Apply forces on the end nodes
    sourceNode.springForceX += springForceX;
    sourceNode.springForceY += springForceY;
    targetNode.springForceX -= springForceX;
    targetNode.springForceY -= springForceY;
  };

  FDLayout.prototype.calcRepulsionForce = function (nodeA, nodeB) {
    var rectA = nodeA.getRect();
    var rectB = nodeB.getRect();
    var overlapAmount = new Array(2);
    var clipPoints = new Array(4);
    var distanceX;
    var distanceY;
    var distanceSquared;
    var distance;
    var repulsionForce;
    var repulsionForceX;
    var repulsionForceY;

    if (rectA.intersects(rectB))
            // two nodes overlap
            {
              // calculate separation amount in x and y directions
              IGeometry.calcSeparationAmount(rectA,
                      rectB,
                      overlapAmount,
                      FDLayoutConstants.DEFAULT_EDGE_LENGTH / 2.0);

              repulsionForceX = overlapAmount[0];
              repulsionForceY = overlapAmount[1];
            }
    else
            // no overlap
            {
              // calculate distance

              if (this.uniformLeafNodeSizes &&
                      nodeA.getChild() == null && nodeB.getChild() == null)
                      // simply base repulsion on distance of node centers
                      {
                        distanceX = rectB.getCenterX() - rectA.getCenterX();
                        distanceY = rectB.getCenterY() - rectA.getCenterY();
                      }
              else
                      // use clipping points
                      {
                        IGeometry.getIntersection(rectA, rectB, clipPoints);

                        distanceX = clipPoints[2] - clipPoints[0];
                        distanceY = clipPoints[3] - clipPoints[1];
                      }

              // No repulsion range. FR grid variant should take care of this.
              if (Math.abs(distanceX) < FDLayoutConstants.MIN_REPULSION_DIST)
              {
                distanceX = IMath.sign(distanceX) *
                        FDLayoutConstants.MIN_REPULSION_DIST;
              }

              if (Math.abs(distanceY) < FDLayoutConstants.MIN_REPULSION_DIST)
              {
                distanceY = IMath.sign(distanceY) *
                        FDLayoutConstants.MIN_REPULSION_DIST;
              }

              distanceSquared = distanceX * distanceX + distanceY * distanceY;
              distance = Math.sqrt(distanceSquared);

              repulsionForce = this.repulsionConstant / distanceSquared;

              // Project force onto x and y axes
              repulsionForceX = repulsionForce * distanceX / distance;
              repulsionForceY = repulsionForce * distanceY / distance;
            }

    // Apply forces on the two nodes
    nodeA.repulsionForceX -= repulsionForceX;
    nodeA.repulsionForceY -= repulsionForceY;
    nodeB.repulsionForceX += repulsionForceX;
    nodeB.repulsionForceY += repulsionForceY;
  };

  FDLayout.prototype.calcGravitationalForce = function (node) {
    var ownerGraph;
    var ownerCenterX;
    var ownerCenterY;
    var distanceX;
    var distanceY;
    var absDistanceX;
    var absDistanceY;
    var estimatedSize;
    ownerGraph = node.getOwner();

    ownerCenterX = (ownerGraph.getRight() + ownerGraph.getLeft()) / 2;
    ownerCenterY = (ownerGraph.getTop() + ownerGraph.getBottom()) / 2;
    distanceX = node.getCenterX() - ownerCenterX;
    distanceY = node.getCenterY() - ownerCenterY;
    absDistanceX = Math.abs(distanceX);
    absDistanceY = Math.abs(distanceY);

    // Apply gravitation only if the node is "roughly" outside the
    // bounds of the initial estimate for the bounding rect of the owner
    // graph. We relax (not as much for the compounds) the estimated
    // size here since the initial estimates seem to be rather "tight".

    if (node.getOwner() == this.graphManager.getRoot())
            // in the root graph
            {
              Math.floor(80);
              estimatedSize = Math.floor(ownerGraph.getEstimatedSize() *
                      this.gravityRangeFactor);

              if (absDistanceX > estimatedSize || absDistanceY > estimatedSize)
              {
                node.gravitationForceX = -this.gravityConstant * distanceX;
                node.gravitationForceY = -this.gravityConstant * distanceY;
              }
            }
    else
            // inside a compound
            {
              estimatedSize = Math.floor((ownerGraph.getEstimatedSize() *
                      this.compoundGravityRangeFactor));

              if (absDistanceX > estimatedSize || absDistanceY > estimatedSize)
              {
                node.gravitationForceX = -this.gravityConstant * distanceX *
                        this.compoundGravityConstant;
                node.gravitationForceY = -this.gravityConstant * distanceY *
                        this.compoundGravityConstant;
              }
            }
  };

  FDLayout.prototype.isConverged = function () {
    var converged;
    var oscilating = false;

    if (this.totalIterations > this.maxIterations / 3)
    {
      oscilating =
              Math.abs(this.totalDisplacement - this.oldTotalDisplacement) < 2;
    }

    converged = this.totalDisplacement < this.totalDisplacementThreshold;

    this.oldTotalDisplacement = this.totalDisplacement;

    return converged || oscilating;
  };

  FDLayout.prototype.animate = function () {
    if (this.animationDuringLayout && !this.isSubLayout)
    {
      if (this.notAnimatedIterations == this.animationPeriod)
      {
        this.update();
        this.notAnimatedIterations = 0;
      }
      else
      {
        this.notAnimatedIterations++;
      }
    }
  };

  FDLayout.prototype.calcGrid = function (g) {
    var i, j;
    var grid;

    var sizeX = 0;
    var sizeY = 0;

    sizeX = Math.ceil((g.getRight() - g.getLeft()) / this.repulsionRange);
    sizeY = Math.ceil((g.getBottom() - g.getTop()) / this.repulsionRange);

    grid = new Array(sizeX);

    for (var i = 0; i < sizeX; i++) {
      grid[i] = new Array(sizeY);
    }

    for (i = 0; i < sizeX; i++)
    {
      for (j = 0; j < sizeY; j++)
      {
        grid[i][j] = [];
      }
    }
    return grid;
  };

  FDLayout.prototype.addNodeToGrid = function (v, grid, left, top) {
    var startX = 0;
    var finishX = 0;
    var startY = 0;
    var finishY = 0;

    startX = Math.floor((v.getRect().x - left) / this.repulsionRange);
    finishX = Math.floor((v.getRect().width + v.getRect().x - left) / this.repulsionRange);
    startY = Math.floor((v.getRect().y - top) / this.repulsionRange);
    finishY = Math.floor((v.getRect().height + v.getRect().y - top) / this.repulsionRange);

    for (var i = startX; i <= finishX; i++)
    {
      for (var j = startY; j <= finishY; j++)
      {
        grid[i][j].push(v);
        v.setGridCoordinates(startX, finishX, startY, finishY);
      }
    }
  };

  FDLayout.prototype.calculateRepulsionForceOfANode = function (grid, nodeA, processedNodeSet) {
    var i, j;
    if (this.totalIterations % FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD == 1)
    {
      var surrounding = [];
      var nodeB;

      for (i = (nodeA.startX - 1); i < (nodeA.finishX + 2); i++)
      {
        for (j = (nodeA.startY - 1); j < (nodeA.finishY + 2); j++)
        {
          if (!((i < 0) || (j < 0) || (i >= grid.length) || (j >= grid[0].length)))
          {
            var temp = grid[i][j];
            for (var i = 0; i < temp.length; i++)
            {
              nodeB = temp[i];

              // If both nodes are not members of the same graph, 
              // or both nodes are the same, skip.
              if ((nodeA.getOwner() != nodeB.getOwner())
                      || (nodeA == nodeB))
              {
                continue;
              }

              // check if the repulsion force between 
              // nodeA and nodeB has already been calculated
              if ($.inArray(nodeB, processedNodeSet) < 0 && $.inArray(nodeB, surrounding) < 0)
              {
                var distanceX = Math.abs(nodeA.getCenterX() - nodeB.getCenterX()) -
                        ((nodeA.getWidth() / 2) + (nodeB.getWidth() / 2));
                var distanceY = Math.abs(nodeA.getCenterY() - nodeB.getCenterY()) -
                        ((nodeA.getHeight() / 2) + (nodeB.getHeight() / 2));

                // if the distance between nodeA and nodeB 
                // is less then calculation range
                if ((distanceX <= this.repulsionRange) && (distanceY <= this.repulsionRange))
                {
                  //then add nodeB to surrounding of nodeA
                  surrounding.add(nodeB);
                }
              }
            }
          }
        }
      }
      nodeA.surrounding = surrounding;
    }

    for (i = 0; i < nodeA.surrounding.length; i++)
    {
      this.calcRepulsionForce(nodeA, nodeA.surrounding[i]);
    }
  };

  FDLayout.prototype.calcRepulsionRange = function () {
    return 0.0;
  };

  function FDLayoutConstants() {
  }

  FDLayoutConstants.getUserOptions = function (options) {
    if (options.nodeRepulsion != null)
      FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = options.nodeRepulsion;
    if (options.idealEdgeLength != null) {
      FDLayoutConstants.DEFAULT_EDGE_LENGTH = options.idealEdgeLength;
      CoSEConstants.DEFAULT_EDGE_LENGTH = options.idealEdgeLength;
    }
    if (options.edgeElasticity != null)
      FDLayoutConstants.DEFAULT_SPRING_STRENGTH = options.edgeElasticity;
    if (options.nestingFactor != null)
      FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = options.nestingFactor;
    if (options.gravity != null)
      FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = options.gravity;
    if (options.numIter != null)
      FDLayoutConstants.MAX_ITERATIONS = options.numIter;
  }

  FDLayoutConstants.MAX_ITERATIONS = 2500;

  FDLayoutConstants.DEFAULT_EDGE_LENGTH = 50;
  FDLayoutConstants.DEFAULT_SPRING_STRENGTH = 0.45;
  FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = 4500.0;
  FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = 0.4;
  FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = 1.0;
  FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = 2.0;
  FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = 1.5;
  FDLayoutConstants.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION = true;
  FDLayoutConstants.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION = true;
  FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL = 100.0;
  FDLayoutConstants.MAX_NODE_DISPLACEMENT = FDLayoutConstants.MAX_NODE_DISPLACEMENT_INCREMENTAL * 3;
  FDLayoutConstants.MIN_REPULSION_DIST = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 10.0;
  FDLayoutConstants.CONVERGENCE_CHECK_PERIOD = 100;
  FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = 0.1;
  FDLayoutConstants.MIN_EDGE_LENGTH = 1;
  FDLayoutConstants.GRID_CALCULATION_CHECK_PERIOD = 10;

  function FDLayoutEdge(source, target, vEdge) {
    LEdge.call(this, source, target, vEdge);
    this.idealLength = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
  }

  FDLayoutEdge.prototype = Object.create(LEdge.prototype);

  for (var prop in LEdge) {
    FDLayoutEdge[prop] = LEdge[prop];
  }

  function FDLayoutNode(gm, loc, size, vNode) {
    // alternative constructor is handled inside LNode
    LNode.call(this, gm, loc, size, vNode);
// -----------------------------------------------------------------------------
// Section: Instance variables
// -----------------------------------------------------------------------------
    /*
     * Spring, repulsion and gravitational forces acting on this node
     */
    this.springForceX = 0;
    this.springForceY = 0;
    this.repulsionForceX = 0;
    this.repulsionForceY = 0;
    this.gravitationForceX = 0;
    this.gravitationForceY = 0;

    /*
     * Amount by which this node is to be moved in this iteration
     */
    this.displacementX = 0;
    this.displacementY = 0;

    /**
     * Start and finish grid coordinates that this node is fallen into
     */
    this.startX = 0;
    this.finishX = 0;
    this.startY = 0;
    this.finishY = 0;

    /**
     * Geometric neighbors of this node 
     */
    this.surrounding = [];

//    this.move = FDLayoutNode.prototype.move;
//    this.setGridCoordinates = FDLayoutNode.prototype.setGridCoordinates;
  }

  FDLayoutNode.prototype = Object.create(LNode.prototype);

  for (var prop in LNode) {
    FDLayoutNode[prop] = LNode[prop];
  }

// -----------------------------------------------------------------------------
// Section: FR-Grid Variant Repulsion Force Calculation
// -----------------------------------------------------------------------------
  /**
   * This method sets start and finish grid coordinates
   */
  FDLayoutNode.prototype.setGridCoordinates = function (_startX, _finishX, _startY, _finishY)
  {
    this.startX = _startX;
    this.finishX = _finishX;
    this.startY = _startY;
    this.finishY = _finishY;

  };

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------
  /*
   * This method recalculates the displacement related attributes of this
   * object. These attributes are calculated at each layout iteration once,
   * for increasing the speed of the layout.
   */
  FDLayoutNode.prototype.move = function ()
  {
    throw "Abstract method is not overridden: FDLayoutNode->move()";
  };

  function CoSENode(gm, loc, size, vNode) {

    // alternative constructor is handled inside LNode
    FDLayoutNode.call(this, gm, loc, size, vNode);
// -----------------------------------------------------------------------------
// Section: Instance variables
// -----------------------------------------------------------------------------
    /**
     * This node is constructed by contracting pred1 and pred2 from Mi-1
     * next is constructed by contracting this node and another node from Mi
     */
    this.pred1;
    this.pred2;
    this.next;

    /**
     * Processed flag for CoSENode is needed during the coarsening process
     * a node can be the next node of two different nodes. 
     * so it can already be processed during the coarsening process
     */
    this.processed;
  }


  CoSENode.prototype = Object.create(FDLayoutNode.prototype);
  for (var prop in FDLayoutNode) {
    CoSENode[prop] = FDLayoutNode[prop];
  }

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------
  /*
   * This method recalculates the displacement related attributes of this
   * object. These attributes are calculated at each layout iteration once,
   * for increasing the speed of the layout.
   */
  CoSENode.prototype.move = function ()
  {
//  throw "buraya bak bakalim extend ettigin class'dan graphManager gelmiş mi"
    var layout = this.graphManager.getLayout();
    this.displacementX = layout.coolingFactor *
            (this.springForceX + this.repulsionForceX + this.gravitationForceX);
    this.displacementY = layout.coolingFactor *
            (this.springForceY + this.repulsionForceY + this.gravitationForceY);

//  if (Math.abs(this.displacementX) > layout.maxNodeDisplacement)
//  {
//    this.displacementX = layout.maxNodeDisplacement *
//            IMath.sign(this.displacementX);
//  }
//
//  if (Math.abs(this.displacementY) > layout.maxNodeDisplacement)
//  {
//    this.displacementY = layout.maxNodeDisplacement *
//            IMath.sign(this.displacementY);
//  }

    if (Math.abs(this.displacementX) > layout.coolingFactor * layout.maxNodeDisplacement)
    {
      this.displacementX = layout.coolingFactor * layout.maxNodeDisplacement *
              IMath.sign(this.displacementX);
    }

    if (Math.abs(this.displacementY) > layout.coolingFactor * layout.maxNodeDisplacement)
    {
      this.displacementY = layout.coolingFactor * layout.maxNodeDisplacement *
              IMath.sign(this.displacementY);
    }

    // a simple node, just move it
    if (this.child == null)
    {
      this.moveBy(this.displacementX, this.displacementY);
    }
    // an empty compound node, again just move it
    else if (this.child.getNodes().length == 0)
    {
      this.moveBy(this.displacementX, this.displacementY);
    }
    // non-empty compound node, propogate movement to children as well
    else
    {
      this.propogateDisplacementToChildren(this.displacementX,
              this.displacementY);
    }

    layout.totalDisplacement +=
            Math.abs(this.displacementX) + Math.abs(this.displacementY);

    this.springForceX = 0;
    this.springForceY = 0;
    this.repulsionForceX = 0;
    this.repulsionForceY = 0;
    this.gravitationForceX = 0;
    this.gravitationForceY = 0;
    this.displacementX = 0;
    this.displacementY = 0;
  };

  /*
   * This method applies the transformation of a compound node (denoted as
   * root) to all the nodes in its children graph
   */
  CoSENode.prototype.propogateDisplacementToChildren = function (dX, dY)
  {
    var nodes = this.getChild().getNodes();
    var node;
    for (var i = 0; i < nodes.length; i++)
    {
      node = nodes[i];
      if (node.getChild() == null)
      {
        node.moveBy(dX, dY);
        node.displacementX += dX;
        node.displacementY += dY;
      }
      else
      {
        node.propogateDisplacementToChildren(dX, dY);
      }
    }
  };

// -----------------------------------------------------------------------------
// Section: Getters and setters
// -----------------------------------------------------------------------------
  CoSENode.prototype.setPred1 = function (pred1)
  {
    this.pred1 = pred1;
  };

  CoSENode.prototype.getPred1 = function ()
  {
    return pred1;
  };

  CoSENode.prototype.setPred2 = function (pred2)
  {
    this.pred2 = pred2;
  };

  CoSENode.prototype.getPred2 = function ()
  {
    return pred2;
  };

  CoSENode.prototype.setNext = function (next)
  {
    this.next = next;
  };

  CoSENode.prototype.getNext = function ()
  {
    return next;
  };

  CoSENode.prototype.setProcessed = function (processed)
  {
    this.processed = processed;
  };

  CoSENode.prototype.isProcessed = function ()
  {
    return processed;
  };

  function CoSELayout() {
    FDLayout.call(this);
    this.level = null;
    this.noOfLevels = null;
    this.MList = null;
  }

  CoSELayout.prototype = Object.create(FDLayout.prototype);

  for (var prop in FDLayout) {
    CoSELayout[prop] = FDLayout[prop];
  }

  CoSELayout.prototype.newGraphManager = function () {
    var gm = new CoSEGraphManager(this);
    this.graphManager = gm;
    return gm;
  };

  CoSELayout.prototype.newGraph = function (vGraph) {
    return new CoSEGraph(null, this.graphManager, vGraph);
  };

  CoSELayout.prototype.newNode = function (vNode) {
    return new CoSENode(this.graphManager, vNode);
  };

  CoSELayout.prototype.newEdge = function (vEdge) {
    return new CoSEEdge(null, null, vEdge);
  };

  CoSELayout.prototype.initParameters = function () {
    FDLayout.prototype.initParameters.call(this, arguments);
    if (!this.isSubLayout) {
      if (layoutOptionsPack.idealEdgeLength < 10)
      {
        this.idealEdgeLength = 10;
      }
      else
      {
        this.idealEdgeLength = layoutOptionsPack.idealEdgeLength;
      }

      this.useSmartIdealEdgeLengthCalculation =
              layoutOptionsPack.smartEdgeLengthCalc;
      this.springConstant =
              Layout.transform(layoutOptionsPack.springStrength,
                      FDLayoutConstants.DEFAULT_SPRING_STRENGTH, 5.0, 5.0);
      this.repulsionConstant =
              Layout.transform(layoutOptionsPack.repulsionStrength,
                      FDLayoutConstants.DEFAULT_REPULSION_STRENGTH, 5.0, 5.0);
      this.gravityConstant =
              Layout.transform(layoutOptionsPack.gravityStrength,
                      FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH);
      this.compoundGravityConstant =
              Layout.transform(layoutOptionsPack.compoundGravityStrength,
                      FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH);
      this.gravityRangeFactor =
              Layout.transform(layoutOptionsPack.gravityRange,
                      FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR);
      this.compoundGravityRangeFactor =
              Layout.transform(layoutOptionsPack.compoundGravityRange,
                      FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR);
    }
  };

  CoSELayout.prototype.layout = function () {
    var createBendsAsNeeded = layoutOptionsPack.createBendsAsNeeded;
    if (createBendsAsNeeded)
    {
      this.createBendpoints();

      // reset edge list, since the topology has changed
      this.graphManager.resetAllEdges();
    }

    this.level = 0;
    return this.classicLayout();
  };

  CoSELayout.prototype.classicLayout = function () {
    this.calculateNodesToApplyGravitationTo();
    this.graphManager.calcLowestCommonAncestors();
    this.graphManager.calcInclusionTreeDepths();
    this.graphManager.getRoot().calcEstimatedSize();
    this.calcIdealEdgeLengths();
    if (!this.incremental)
    {
      var forest = this.getFlatForest();

      // The graph associated with this layout is flat and a forest
      if (forest.length > 0)

      {
        this.positionNodesRadially(forest);
      }
      // The graph associated with this layout is not flat or a forest
      else

      {
        this.positionNodesRandomly();
      }
    }

    this.initSpringEmbedder();
    this.runSpringEmbedder();

    console.log("Classic CoSE layout finished after " +
            this.totalIterations + " iterations");

    return true;
  };

  CoSELayout.prototype.runSpringEmbedder = function () {
    var functions = {};

    do
    {
      this.totalIterations++;

      if (this.totalIterations % FDLayoutConstants.CONVERGENCE_CHECK_PERIOD == 0)
      {
        if (this.isConverged())
        {
          break;
        }

        this.coolingFactor = this.initialCoolingFactor *
                ((this.maxIterations - this.totalIterations) / this.maxIterations);

//				this.updateAnnealingProbability();
      }
      this.totalDisplacement = 0;
      this.graphManager.updateBounds();
      this.calcSpringForces();
      this.calcRepulsionForces();
      this.calcGravitationalForces();
      this.moveNodes();
      this.animate();


      var all = this.graphManager.getAllNodes();
      var rect1 = all[0].rect;
      var rect2 = all[1].rect;
      var rect3 = all[2].rect;
      var asd = 0;
    }
    while (this.totalIterations < this.maxIterations);

    this.graphManager.updateBounds();
  };

  CoSELayout.prototype.calculateNodesToApplyGravitationTo = function () {
    var nodeList = [];
    var graph;

    var graphs = this.graphManager.getGraphs();
    var size = graphs.length;
    var i;
    for (i = 0; i < size; i++)
    {
      graph = graphs[i];

      graph.updateConnected();

      if (!graph.isConnected)
      {
        nodeList = nodeList.concat(graph.getNodes());
      }
    }

    this.graphManager.setAllNodesToApplyGravitation(nodeList);
  };

  CoSELayout.prototype.createBendpoints = function () {
    var edges = [];
    edges = edges.concat(this.graphManager.getAllEdges());
    var visited = new HashSet();
    var i;
    for (i = 0; i < edges.length; i++)
    {
      var edge = edges[i];

      if (!visited.contains(edge))
      {
        var source = edge.getSource();
        var target = edge.getTarget();

        if (source == target)
        {
          edge.getBendpoints().push(new PointD());
          edge.getBendpoints().push(new PointD());
          this.createDummyNodesForBendpoints(edge);
          visited.add(edge);
        }
        else
        {
          var edgeList = [];

          edgeList = edgeList.concat(source.getEdgeListToNode(target));
          edgeList = edgeList.concat(target.getEdgeListToNode(source));

          if (!visited.contains(edgeList[0]))
          {
            if (edgeList.length > 1)
            {
              var k;
              for (k = 0; k < edgeList.length; k++)
              {
                var multiEdge = edgeList[k];
                multiEdge.getBendpoints().push(new PointD());
                this.createDummyNodesForBendpoints(multiEdge);
              }
            }
            visited.addAll(list);
          }
        }
      }

      if (visited.size() == edges.length)
      {
        break;
      }
    }
  };

  CoSELayout.prototype.positionNodesRadially = function (forest) {
    // We tile the trees to a grid row by row; first tree starts at (0,0)
    var currentStartingPoint = new Point(0, 0);
    var numberOfColumns = Math.ceil(Math.sqrt(forest.length));
    var height = 0;
    var currentY = 0;
    var currentX = 0;
    var point = new PointD(0, 0);

    for (var i = 0; i < forest.length; i++)
    {
      if (i % numberOfColumns == 0)
      {
        // Start of a new row, make the x coordinate 0, increment the
        // y coordinate with the max height of the previous row
        currentX = 0;
        currentY = height;

        if (i != 0)
        {
          currentY += CoSEConstants.DEFAULT_COMPONENT_SEPERATION;
        }

        height = 0;
      }

      var tree = forest[i];

      // Find the center of the tree
      var centerNode = Layout.findCenterOfTree(tree);

      // Set the staring point of the next tree
      currentStartingPoint.x = currentX;
      currentStartingPoint.y = currentY;

      // Do a radial layout starting with the center
      point =
              CoSELayout.radialLayout(tree, centerNode, currentStartingPoint);

      if (point.y > height)
      {
        height = Math.floor(point.y);
      }

      currentX = Math.floor(point.x + CoSEConstants.DEFAULT_COMPONENT_SEPERATION);
    }

    this.transform(
            new PointD(LayoutConstants.WORLD_CENTER_X - point.x / 2,
                    LayoutConstants.WORLD_CENTER_Y - point.y / 2));
  };

  CoSELayout.radialLayout = function (tree, centerNode, startingPoint) {
    var radialSep = Math.max(this.maxDiagonalInTree(tree),
            CoSEConstants.DEFAULT_RADIAL_SEPARATION);
    CoSELayout.branchRadialLayout(centerNode, null, 0, 359, 0, radialSep);
    var bounds = LGraph.calculateBounds(tree);

    var transform = new Transform();
    transform.setDeviceOrgX(bounds.getMinX());
    transform.setDeviceOrgY(bounds.getMinY());
    transform.setWorldOrgX(startingPoint.x);
    transform.setWorldOrgY(startingPoint.y);

    for (var i = 0; i < tree.length; i++)
    {
      var node = tree[i];
      node.transform(transform);
    }

    var bottomRight =
            new PointD(bounds.getMaxX(), bounds.getMaxY());

    return transform.inverseTransformPoint(bottomRight);
  };

  CoSELayout.branchRadialLayout = function (node, parentOfNode, startAngle, endAngle, distance, radialSeparation) {
    // First, position this node by finding its angle.
    var halfInterval = ((endAngle - startAngle) + 1) / 2;

    if (halfInterval < 0)
    {
      halfInterval += 180;
    }

    var nodeAngle = (halfInterval + startAngle) % 360;
    var teta = (nodeAngle * IGeometry.TWO_PI) / 360;

    // Make polar to java cordinate conversion.
    var cos_teta = Math.cos(teta);
    var x_ = distance * Math.cos(teta);
    console.log(x_);
    var y_ = distance * Math.sin(teta);

    node.setCenter(x_, y_);

    // Traverse all neighbors of this node and recursively call this
    // function.

    var neighborEdges = [];
    var childCount = neighborEdges.length;

    if (parentOfNode != null)
    {
      childCount--;
    }

    var branchCount = 0;

    var incEdgesCount = neighborEdges.length;
    var startIndex;

    var edges = node.getEdgesBetween(parentOfNode);

    // If there are multiple edges, prune them until there remains only one
    // edge.
    while (edges.length > 1)
    {
      //neighborEdges.remove(edges.remove(0));
      var temp = edges[0];
      edges.splice(0, 1);
      var index = neighborEdges.indexOf(temp);
      if (index >= 0) {
        neighborEdges.splice(index, 1);
      }
      incEdgesCount--;
      childCount--;
    }

    if (parentOfNode != null)
    {
      //assert edges.length == 1;
      startIndex = (neighborEdges.indexOf(edges[0]) + 1) % incEdgesCount;
    }
    else
    {
      startIndex = 0;
    }

    var stepAngle = Math.abs(endAngle - startAngle) / childCount;

    for (var i = startIndex;
            branchCount != childCount;
            i = (++i) % incEdgesCount)
    {
      var currentNeighbor =
              neighborEdges.get(i).getOtherEnd(node);

      // Don't back traverse to root node in current tree.
      if (currentNeighbor == parentOfNode)
      {
        continue;
      }

      var childStartAngle =
              (startAngle + branchCount * stepAngle) % 360;
      var childEndAngle = (childStartAngle + stepAngle) % 360;

      thiss.branchRadialLayout(currentNeighbor,
              node,
              childStartAngle, childEndAngle,
              distance + radialSeparation, radialSeparation);

      branchCount++;
    }
  };

  CoSELayout.maxDiagonalInTree = function (tree) {
    var maxDiagonal = Integer.MIN_VALUE;

    for (var i = 0; i < tree.length; i++)
    {
      var node = tree[i];
      var diagonal = node.getDiagonal();

      if (diagonal > maxDiagonal)
      {
        maxDiagonal = diagonal;
      }
    }

    return maxDiagonal;
  };

  CoSELayout.prototype.uncoarsen = function () {
    var allNodes = this.graphManager.getAllNodes();
    for (var i = 0; i < allNodes.length; i++)
    {
      var v = allNodes[i];
      // set positions of v.pred1 and v.pred2
      v.getPred1().setLocation(v.getLeft(), v.getTop());

      if (v.getPred2() != null)
      {
        v.getPred2().setLocation(v.getLeft() + this.idealEdgeLength,
                v.getTop() + this.idealEdgeLength);
      }
    }
  }
  ;
  CoSELayout.prototype.calcRepulsionRange = function () {
    // formula is 2 x (level + 1) x idealEdgeLength
    return (2 * (this.level + 1) * this.idealEdgeLength);
  };

  /**
   * @brief : Logs a debug message in JS console, if DEBUG is ON
   */
  var logDebug = function (text) {
    if (DEBUG) {
      console.debug(text);
    }
  };

  /* 
   * To change this license header, choose License Headers in Project Properties.
   * To change this template file, choose Tools | Templates
   * and open the template in the editor.
   */

  function CoSEGraphManager(layout) {
    LGraphManager.call(this, layout);
  }

//Extends LGraphManager
  CoSEGraphManager.prototype = Object.create(LGraphManager.prototype);
  for (var prop in LGraphManager) {
    CoSEGraphManager[prop] = LGraphManager[prop];
  }

  /**
   * This method returns a list of CoSEGraphManager. 
   * Returned list holds graphs finer to coarser (M0 to Mk)
   * Additionally, this method is only called by M0.
   */
  CoSEGraphManager.prototype.coarsenGraph = function ()
  {
    // MList holds graph managers from M0 to Mk
    var MList = [];
    var prevNodeCount;
    var currNodeCount;

    // "this" graph manager holds the finest (input) graph
    MList.push(this);

    // coarsening graph G holds only the leaf nodes and the edges between them 
    // which are considered for coarsening process
    var G = new CoarseningGraph(this.getLayout());

    // construct G0
    convertToCoarseningGraph(this.getRoot(), G);
    currNodeCount = G.getNodes().length;

    var lastM, newM;
    // if two graphs Gi and Gi+1 have the same order, 
    // then Gi = Gi+1 is the coarsest graph (Gk), so stop coarsening process
    do {
      prevNodeCount = currNodeCount;

      // coarsen Gi
      G.coarsen();

      // get current coarsest graph lastM = Mi and construct newM = Mi+1
      lastM = MList[MList.length - 1];
      newM = coarsen(lastM);

      MList.push(newM);
      currNodeCount = G.getNodes().length;

    } while ((prevNodeCount != currNodeCount) && (currNodeCount > 1));

    // change currently being used graph manager
    this.getLayout().setGraphManager(this);

    MList.splice(MList.length - 1, 1);
    return MList;
  }

  /**
   * This method converts given CoSEGraph to CoarseningGraph G0
   * G0 consists of leaf nodes of CoSEGraph and edges between them
   */
  CoSEGraphManager.prototype.convertToCoarseningGraph = function (coseG, G)
  {
    // we need a mapping between nodes in M0 and G0, for constructing the edges of G0
    var map = new HashMap();

    // construct nodes of G0
    var nodes = coseG.getNodes();
    var s = nodes.length;
    for (var i = 0; i < s; i++)
    {
      var v = nodes[i];
      // if current node is compound, 
      // then make a recursive call with child graph of current compound node 
      if (v.getChild() != null)
      {
        convertToCoarseningGraph(v.getChild(), G);
      }
      // otherwise current node is a leaf, and should be in the G0
      else
      {
        // v is a leaf node in CoSE graph, and is referenced by u in G0
        var u = new CoarseningNode();
        u.setReference(v);

        // construct a mapping between v (from CoSE graph) and u (from coarsening graph)
        map.put(v, u);

        G.add(u);
      }
    }

    // construct edges of G0
    var edges = coseG.getEdges();
    s = edges.length;
    for (var i = 0; i < s; i++)
    {
      var e = edges[i];
      // if neither source nor target of e is a compound node
      // then, e is an edge between two leaf nodes
      if ((e.getSource().getChild() == null) && (e.getTarget().getChild() == null))
      {
        G.add(new CoSEEdge(), map.get(e.getSource()), map.get(e.getTarget()));
      }
    }
  }

  /**
   * This method gets Mi (lastM) and coarsens to Mi+1
   * Mi+1 is returned.
   */
  CoSEGraphManager.prototype.coarsen = function (lastM)
  {
    // create Mi+1 and root graph of it
    var newM = new CoSEGraphManager(lastM.getLayout());

    // change currently being used graph manager
    newM.getLayout().setGraphManager(newM);
    newM.addRoot();

    newM.getRoot().vGraphObject = lastM.getRoot().vGraphObject;

    // construct nodes of the coarser graph Mi+1
    this.coarsenNodes(lastM.getRoot(), newM.getRoot());

    // change currently being used graph manager
    lastM.getLayout().setGraphManager(lastM);

    // add edges to the coarser graph Mi+1
    this.addEdges(lastM, newM);

    return newM;
  }

  /**
   * This method coarsens nodes of Mi and creates nodes of the coarser graph Mi+1
   * g: Mi, coarserG: Mi+1
   */
  CoSEGraphManager.prototype.coarsenNodes = function (g, coarserG)
  {
    var nodes = g.getNodes();
    var s = nodes.length;
    for (var i = 0; i < s; i++)
    {
      var v = nodes[i];
      // if v is compound
      // then, create the compound node v.next with an empty child graph
      // and, make a recursive call with v.child (Mi) and v.next.child (Mi+1)
      if (v.getChild() != null)
      {
        v.setNext(coarserG.getGraphManager().getLayout().newNode(null));
        coarserG.getGraphManager().add(coarserG.getGraphManager().getLayout().newGraph(null),
                v.getNext());
        v.getNext().setPred1(v);
        coarserG.add(v.getNext());

        //v.getNext().getChild().vGraphObject = v.getChild().vGraphObject;

        coarsenNodes(v.getChild(), v.getNext().getChild());
      }
      else
      {
        // v.next can be referenced by two nodes, so first check if it is processed before
        if (!v.getNext().isProcessed())
        {
          coarserG.add(v.getNext());
          v.getNext().setProcessed(true);
        }
      }

      //v.getNext().vGraphObject = v.vGraphObject;

      // set location
      v.getNext().setLocation(v.getLocation().x, v.getLocation().y);
      v.getNext().setHeight(v.getHeight());
      v.getNext().setWidth(v.getWidth());
    }
  }

  /**
   * This method adds edges to the coarser graph.
   * It should be called after coarsenNodes method is executed
   * lastM: Mi, newM: Mi+1
   */
  CoSEGraphManager.prototype.addEdges = function (lastM, newM)
  {
    var allEdges = lastM.getAllEdges();
    var s = allEdges().length;
    for (var i = 0; i < s; i++)
    {
      var e = allEdges[i];
      // if e is an inter-graph edge or source or target of e is compound 
      // then, e has not contracted during coarsening process. Add e to the coarser graph.			
      if ((e.isInterGraph()) ||
              (e.getSource().getChild() != null) ||
              (e.getTarget().getChild() != null))
      {
        // check if e is not added before
        if ((e.getSource()).getNext().getNeighborsList().
                indexof((e.getTarget()).getNext()) == -1)
        {
          newM.add(newM.getLayout().newEdge(null),
                  (e.getSource()).getNext(),
                  (e.getTarget()).getNext());
        }
      }

      // otherwise, if e is not contracted during coarsening process
      // then, add it to the  coarser graph
      else
      {
        if ((e.getSource()).getNext() != (e.getTarget()).getNext())
        {
          // check if e is not added before
          if ((e.getSource()).getNext().getNeighborsList().
                  indexof((e.getTarget()).getNext()) == -1)
          {
            newM.add(newM.getLayout().newEdge(null),
                    (e.getSource()).getNext(),
                    (e.getTarget()).getNext());
          }
        }
      }
    }
  }

  function CoSEGraph(parent, graphMgr, vGraph) {
    LGraph.call(this, parent, graphMgr, vGraph);
  }

//extends LGraph
  CoSEGraph.prototype = Object.create(LGraph.prototype);
  for (var prop in LGraph) {
    CoSEGraph[prop] = LGraph[prop];
  }

  function CoSEEdge(source, target, vEdge) {
    FDLayoutEdge.call(this, source, target, vEdge);
  }

  CoSEEdge.prototype = Object.create(FDLayoutEdge.prototype);
  for (var prop in FDLayoutEdge) {
    CoSEEdge[prop] = FDLayoutEdge[prop];
  }

  function CoSEConstants() {
  }

//CoSEConstants inherits static props in FDLayoutConstants
  for (var prop in FDLayoutConstants) {
    CoSEConstants[prop] = FDLayoutConstants[prop];
  }

  CoSEConstants.DEFAULT_USE_MULTI_LEVEL_SCALING = false;
  CoSEConstants.DEFAULT_RADIAL_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH;
  CoSEConstants.DEFAULT_COMPONENT_SEPERATION = 60;







  'use strict';
  var DEBUG;

  _CoSELayout.allChildren = [];
  _CoSELayout.idToLNode = {};
  _CoSELayout.toBeTiled = {};

  var defaults = {
    // Called on `layoutready`
    ready: function () {
    },
    // Called on `layoutstop`
    stop: function () {
    },
    // Number of iterations between consecutive screen positions update (0 -> only updated on the end)
    refresh: 0,
    // Whether to fit the network view after when done
    fit: true,
    // Padding on fit
    padding: 10,
    // Whether to enable incremental mode
    incremental: false,
    // Whether to use the JS console to print debug messages
    debug: false,
    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: 4500,
    // Node repulsion (overlapping) multiplier
    nodeOverlap: 10,
    // Ideal edge (non nested) length
    idealEdgeLength: 50,
    // Divisor to compute edge forces
    edgeElasticity: 0.45,
    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 0.1,
    // Gravity force (constant)
    gravity: 0.4,
    // Maximum number of iterations to perform
    numIter: 2500,
    // Initial temperature (maximum node displacement)
    initialTemp: 200,
    // Cooling factor (how the temperature is reduced between consecutive iterations
    coolingFactor: 0.95,
    // Lower temperature threshold (below this point the layout will end)
    minTemp: 1,
    // For enabling tiling
    tile: true
  };

  var layout = new CoSELayout();
  function _CoSELayout(options) {

    this.options = $$.util.extend({}, defaults, options);
    FDLayoutConstants.getUserOptions(this.options);
    fillCoseLayoutOptionsPack();
  }

  _CoSELayout.prototype.run = function () {
    _CoSELayout.allChildren = [];
    _CoSELayout.idToLNode = {};
    _CoSELayout.toBeTiled = {};
    layout = new CoSELayout();
    //var options = this.options;
//    var layout = this;

    // cy is automatically populated for us in the constructor
    this.cy = this.options.cy; // jshint ignore:line;

    this.cy.trigger('layoutstart');

    var gm = layout.newGraphManager();
    this.gm = gm;

    var nodes = this.options.eles.nodes();
    var edges = this.options.eles.edges();

    this.root = gm.addRoot();
    this.orphans = [];
    for (var i = 0; i < nodes.length; i++) {
      var theNode = nodes[i];
      var p_id = theNode.data("parent");
      if (p_id != null) {
        if (_CoSELayout.allChildren[p_id] == null) {
          _CoSELayout.allChildren[p_id] = [];
        }
        _CoSELayout.allChildren[p_id].push(theNode);
      }
      else {
        this.orphans.push(theNode);
      }
    }

    if (!this.options.tile) {
      this.processChildrenList(this.root, this.orphans);
    }
    else {
      // Find zero degree nodes and create a complex for each level
      var memberGroups = this.groupZeroDegreeMembers();

      // Tile and clear children of each complex
      var tiledMemberPack = this.clearComplexes(this.options);

      // Separately tile and clear zero degree nodes for each level
      var tiledZeroDegreeNodes = this.clearZeroDegreeMembers(memberGroups);
    }


    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var sourceNode = _CoSELayout.idToLNode[edge.data("source")];
      var targetNode = _CoSELayout.idToLNode[edge.data("target")];
      var e1 = gm.add(layout.newEdge(), sourceNode, targetNode);

      if (sourceNode.owner.getNodes().indexOf(sourceNode) > -1 && targetNode.owner.getNodes().indexOf(targetNode) > -1)
        var e1 = gm.add(layout.newEdge(), sourceNode, targetNode);
    }
    
    
    var t1 = $$.Thread();
    t1.require(DimensionD);
    t1.require(HashMap);
    t1.require(HashSet);
    t1.require(IGeometry);
    t1.require(IMath);
    t1.require(Integer);
    t1.require(Point);
    t1.require(PointD);
    t1.require(QuickSort);
    t1.require(RandomSeed);
    t1.require(RectangleD);
    t1.require(Transform);
    t1.require(UniqueIDGeneretor);
    t1.require(LGraphObject);
    t1.require(LGraph);
    t1.require(LEdge);
    t1.require(LGraphManager);
    t1.require(LNode);
    t1.require(Layout);
    t1.require(LayoutConstants);
    t1.require(layoutOptionsPack);
    t1.require(FDLayout);
    t1.require(FDLayoutConstants);
    t1.require(FDLayoutEdge);
    t1.require(FDLayoutNode);
    t1.require(CoSEConstants);
    t1.require(CoSEEdge);
    t1.require(CoSEGraph);
    t1.require(CoSEGraphManager);
    t1.require(CoSELayout);
    t1.require(CoSENode);
//    t1.require(_CoSELayout);
    var finished = false;

    var nodes = this.options.eles.nodes();
    var edges = this.options.eles.edges();

    // First I need to create the data structure to pass to the worker
    var pData = {
      'nodes': [],
      'edges': []
    };

    nodes.each(
            function (i, node) {
              var nodeId = this._private.data.id;
              var parentId = node.parent().id();
              var w = node.width();
              var posX = node.position('x');
              var posY = node.position('y');
              var h = node.height();
              pData[ 'nodes' ].push({
                id: nodeId,
                pid: parentId,
                x: posX,
                y: posY,
                width: w,
                height: h
              });
            });

    edges.each(
            function () {
              var srcNodeId = this.source().id();
              var tgtNodeId = this.target().id();
              var edgeId = this._private.data.id;
              pData[ 'edges' ].push({
                id: edgeId,
                source: srcNodeId,
                target: tgtNodeId
              });
            });



    t1.pass(pData).run(function (pData) {
      var log = function (msg) {
        broadcast({log: msg});
      };

      log("start thread");
      
      //the layout will be run in the thread and the results are to be passed
      //to the main thread with the result map
      var layout_t = new CoSELayout();
      var gm_t = layout_t.newGraphManager();
      
//      var root_t = gm_t.addRoot();
      var ngraph = gm_t.layout.newGraph();console.log("here1");
      var nnode = gm_t.layout.newNode(null);console.log("here2");
      var root = gm_t.add(ngraph, nnode);console.log("here3");
      root.graphManager = gm_t;
      gm_t.setRootGraph(root);console.log("here4");
      var root_t = gm_t.rootGraph;console.log("here5");

      //maps for inner usage of the thread
      var orphans_t = [];
      var idToLNode_t = {};
      var childrenMap = {};

      //A map of node id to corresponding node position and sizes
      //it is to be returned at the end of the thread function
      var result = {};
      
//      log("here 6");
      
      //this function is similar to processChildrenList function in the main thread
      //it is to process the nodes in correct order recursively
      var processNodes = function (parent, children) {
        var size = children.length;
        for (var i = 0; i < size; i++) {
          var theChild = children[i];
          var children_of_children = childrenMap[theChild.id];
          var theNode;

          if (theChild.width != null
                  && theChild.height != null) {
            theNode = parent.add(new CoSENode(gm_t,
                    new PointD(theChild.x, theChild.y),
                    new DimensionD(parseFloat(theChild.width),
                            parseFloat(theChild.height))));
          }
          else {
            theNode = parent.add(new CoSENode(gm_t));
          }
          theNode.id = theChild.id;
          idToLNode_t[theChild.id] = theNode;

          if (isNaN(theNode.rect.x)) {
            theNode.rect.x = 0;
          }

          if (isNaN(theNode.rect.y)) {
            theNode.rect.y = 0;
          }

          if (children_of_children != null && children_of_children.length > 0) {
            var theNewGraph;
            theNewGraph = layout_t.getGraphManager().add(layout_t.newGraph(), theNode);
            theNewGraph.graphManager = gm_t;
            processNodes(theNewGraph, children_of_children);
          }
        }
      }
      
      //fill the chidrenMap and orphans_t maps to process the nodes in the correct order
      var nodes = pData.nodes;
      for (var i = 0; i < nodes.length; i++) {
        var theNode = nodes[i];
        var p_id = theNode.pid;
        if (p_id != null) {
          if (childrenMap[p_id] == null) {
            childrenMap[p_id] = [];
          }
          childrenMap[p_id].push(theNode);
        }
        else {
          orphans_t.push(theNode);
        }
      }

      processNodes(root_t, orphans_t);

      //handle the edges
      var edges = pData.edges;
      for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        var sourceNode = idToLNode_t[edge.source];
        var targetNode = idToLNode_t[edge.target];
        var e1 = gm_t.add(layout_t.newEdge(), sourceNode, targetNode);
        
//        if (sourceNode.owner.getNodes().indexOf(sourceNode) > -1 && targetNode.owner.getNodes().indexOf(targetNode) > -1)
//          var e1 = gm.add(layout.newEdge(), sourceNode, targetNode);
      }

      log("before run");
      //run the layout crated in this thread
      layout_t.runLayout();
      log("after run");

      //fill the result map
      for (var id in idToLNode_t) {
        var lNode = idToLNode_t[id];
        var rect = lNode.rect;
        result[id] = {
          id: id,
          x: rect.x,
          y: rect.y,
          w: rect.width,
          h: rect.height
        };
      }
      log("end");
      //return the result map to pass it to the then function as parameter
      return result;//.runLayout();
    }).then(function (result) {
      //refresh the lnode positions and sizes by using result map
      for (var id in result) {
        var lNode = _CoSELayout.idToLNode[id];
        var node = result[id];
        lNode.rect.x = node.x;
        lNode.rect.y = node.y;
        lNode.rect.width = node.w;
        lNode.rect.height = node.h;
      }
      finished = true;
      t1.stop();
    });

    t1.on('message', function (e) {
      var logMsg = e.message.log;
      if (logMsg != null) {
        console.log('Thread log: ' + logMsg);
        return;
      }
    });


//    while(!finished);
    //Thread.sleep(3000);

    if (this.options.tile) {

      // Repopulate members
      this.repopulateZeroDegreeMembers(tiledZeroDegreeNodes);

      this.repopulateComplexes(tiledMemberPack);

      this.options.eles.nodes().updateCompoundBounds();
    }



    //add nodes to the graph manager in correct order
//    this.processChildrenList(root, orphans);



    this.options.eles.nodes().positions(function (i, ele) {
      var theId = ele.data('id');
      var lNode = _CoSELayout.idToLNode[theId];
      console.log(theId + "\t" + lNode.getRect().getX() + "\t" + lNode.getRect().getY());

      return {
        x: lNode.getRect().getCenterX(),
        y: lNode.getRect().getCenterY()
      };
    });

    if (this.options.fit)
      this.options.cy.fit(this.options.padding);

    console.log(FDLayoutConstants.DEFAULT_EDGE_LENGTH);

    //trigger layoutready when each node has had its position set at least once
    this.cy.one('layoutready', this.options.ready);
    this.cy.trigger('layoutready');

    // trigger layoutstop when the layout stops (e.g. finishes)
    this.cy.one('layoutstop', this.options.stop);
    this.cy.trigger('layoutstop');

    return this; // chaining
  };

  var getToBeTiled = function (node) {
    var id = node.data("id");
    //firstly check the previous results
    if (_CoSELayout.toBeTiled[id] != null) {
      return _CoSELayout.toBeTiled[id];
    }

    //only compound nodes are to be tiled
    var children = node.children();
    if (children == null || children.length == 0) {
      _CoSELayout.toBeTiled[id] = false;
      return false;
    }

    //a compound node is not to be tiled if all of its compound children are not to be tiled
    for (var i = 0; i < children.length; i++) {
      var theChild = children[i];

      if (theChild.degree(false) > 0) {
        _CoSELayout.toBeTiled[id] = false;
        return false;
      }

      //pass the children not having the compound structure
      if (theChild.children() == null || theChild.children().length == 0) {
        _CoSELayout.toBeTiled[theChild.data("id")] = false;
        continue;
      }

      if (!getToBeTiled(theChild)) {
        _CoSELayout.toBeTiled[id] = false;
        return false;
      }
    }
    _CoSELayout.toBeTiled[id] = true;
    return true;
  }

  /**
   * This method finds each zero degree node in the graph that are not owned by a complex. 
   * If the number of zero degree nodes at any level is less than 2, no need to tile. 
   * Otherwise, create a dummy complex for each group. 
   */
  _CoSELayout.prototype.groupZeroDegreeMembers = function () {
    // array of [parent_id x oneDegreeNode_id] 
    var tempMemberGroups = [];
    var memberGroups = [];

    // Find all zero degree nodes which aren't covered by a complex
    var zeroDegree = this.cy.nodes().filter(function (i, ele) {
      if (this.degree(false) == 0 && ele.parent().length > 0 && !getToBeTiled(ele.parent()[0]))
        return true;
      else
        return false;
    });

    // Create a map of parent node and its zero degree members
    for (var i = 0; i < zeroDegree.length; i++)
    {
      var node = zeroDegree[i];
      var p_id = node.parent().id();

      if (typeof tempMemberGroups[p_id] === "undefined")
        tempMemberGroups[p_id] = [];

      tempMemberGroups[p_id] = tempMemberGroups[p_id].concat(node);
    }

    // If there are at least two nodes at a level, create a dummy complex for them
    for (var p_id in tempMemberGroups) {
      if (tempMemberGroups[p_id].length > 1) {
        var dummyComplexId = "DummyComplex_" + p_id;
        memberGroups[dummyComplexId] = tempMemberGroups[p_id];

        // Create a dummy complex
        if (this.options.cy.getElementById(dummyComplexId).empty()) {
          this.options.cy.add({
            group: "nodes",
            data: {id: dummyComplexId, parent: p_id,
            },
            position: {x: Math.random() * this.options.cy.container().clientWidth,
              y: Math.random() * this.options.cy.container().clientHeight}
          });
        }
      }
    }

    return memberGroups;
  };

  /**
   *  This method finds all the roots in the graph and performs depth first search
   *  to find all complexes.
   */
  _CoSELayout.prototype.performDFSOnComplexes = function (options) {
    var complexOrder = [];

    // Find roots
    var roots = this.options.cy.filter(function (i, ele) {
      if (ele.isParent() == true)
        return true;
      return false;
    });

    // Perform dfs to get the inner complex first
    this.cy.elements().dfs(roots, function (i, depth) {
      if (getToBeTiled(this)) {
        complexOrder.push(this);
      }
    }, options.directed);

    return complexOrder;
  };

  /**
   * Removes children of each complex in the given list. Return a map of 
   * complexes and their children.
   */
  _CoSELayout.prototype.clearComplexes = function (options) {
    var childGraphMap = [];

    // Get complex ordering by finding the inner one first
    var complexOrder = this.performDFSOnComplexes(options);

    this.processChildrenList(this.root, this.orphans);

    for (var i = 0; i < complexOrder.length; i++) {
      // find the corresponding layout node
      var lComplexNode = _CoSELayout.idToLNode[complexOrder[i].id()];

      childGraphMap[complexOrder[i].id()] = complexOrder[i].children();

      // Remove children of complexes 
//      lComplexNode.child.nodes = []; 
//      this.gm.remove(lComplexNode.child);

      lComplexNode.child = null;
    }

    // Tile the removed children
    var tiledMemberPack = this.tileComplexMembers(childGraphMap);

    return tiledMemberPack;
  };

  /**
   * This method tiles each given member group separately. After each group is tiled,
   * the members are removed from the graph.
   */
  _CoSELayout.prototype.clearZeroDegreeMembers = function (memberGroups) {
    var tiledZeroDegreePack = [];

    for (var id in memberGroups) {
      var complexNode = _CoSELayout.idToLNode[id];

      tiledZeroDegreePack[id] = this.tileNodes(memberGroups[id]);

      // Set the width and height of the dummy complex as calculated
      complexNode.rect.width = tiledZeroDegreePack[id].width;
      complexNode.rect.height = tiledZeroDegreePack[id].height;
    }
    return tiledZeroDegreePack;
  };

  /**
   *  Make the child graph of each complex visible and adjust the orientations
   */
  _CoSELayout.prototype.repopulateComplexes = function (tiledMemberPack) {
    for (var i in tiledMemberPack) {
      var lComplexNode = _CoSELayout.idToLNode[i];

//      this.adjustLocations(tiledMemberPack[i], lComplexNode.rect.x - lComplexNode.rect.width / 2, 
//        lComplexNode.rect.y - lComplexNode.rect.height / 2 );
      this.adjustLocations(tiledMemberPack[i], lComplexNode.rect.x, lComplexNode.rect.y);
    }
  };

  /**
   * This method restores the deleted zero degree members and when the repopulation 
   * is completed, associated dummy complex is removed from the graph.
   */
  _CoSELayout.prototype.repopulateZeroDegreeMembers = function (tiledPack) {
    for (var i in tiledPack) {
      var complex = this.cy.getElementById(i);
      var complexNode = _CoSELayout.idToLNode[i];

      // Adjust the positions of nodes wrt its complex
//        this.adjustLocations(tiledPack[i], complexNode.rect.x - complexNode.rect.width / 2, 
//          complexNode.rect.y - complexNode.rect.height / 2 );
      this.adjustLocations(tiledPack[i], complexNode.rect.x, complexNode.rect.y);

      // Remove the dummy complex
      complex.remove();
    }
  };

  /**
   * This method places each zero degree member wrt given (x,y) coordinates (top left). 
   */
  _CoSELayout.prototype.adjustLocations = function (organization, x, y) {
    x += organization.complexMargin;
    y += organization.complexMargin;

    var left = x;

    for (var i = 0; i < organization.rows.length; i++) {
      var row = organization.rows[i];
      x = left;
      var maxHeight = 0;

      for (var j = 0; j < row.length; j++) {
        var lnode = row[j];

        var node = this.cy.getElementById(lnode.id);

        node.position({
          x: x + lnode.rect.width / 2,
          y: y + lnode.rect.height / 2
        });

        lnode.rect.x = x;// + lnode.rect.width / 2;
        lnode.rect.y = y;// + lnode.rect.height / 2;

        x += lnode.rect.width + organization.horizontalPadding;

        if (lnode.rect.height > maxHeight)
          maxHeight = lnode.rect.height;
      }

      y += maxHeight + organization.verticalPadding;
    }
  };

  /**
   * Tile the children nodes of each complex and set the estimated width and height values
   * for future layout operations
   */
  _CoSELayout.prototype.tileComplexMembers = function (childGraphMap) {
    var tiledMemberPack = [];

    for (var id in childGraphMap) {
      // Access layoutInfo nodes to set the width and height of complexes
      var complexNode = _CoSELayout.idToLNode[id];

      tiledMemberPack[id] = this.tileNodes(childGraphMap[id]);

      complexNode.rect.width = tiledMemberPack[id].width + 20;
      complexNode.rect.height = tiledMemberPack[id].height + 20;
    }

    return tiledMemberPack;
  };

  /**
   *  This method places each node in the given list.
   */
  _CoSELayout.prototype.tileNodes = function (nodes) {
    var organization = {
      rows: [],
      rowWidth: [],
      rowHeight: [],
      complexMargin: 10,
      width: 20,
      height: 20,
      verticalPadding: 10,
      horizontalPadding: 10
    };

    var layoutNodes = [];

    // Get layout nodes
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var lNode = _CoSELayout.idToLNode[node.id()];

      var owner = lNode.owner;
      owner.remove(lNode);

      this.gm.resetAllNodes();
      this.gm.getAllNodes();

//      this.gm.resetAllEdges();
//      this.gm.getAllEdges();

      layoutNodes.push(lNode);
    }

    // Sort the nodes in ascending order of their areas
    layoutNodes.sort(function (n1, n2) {
      if (n1.rect.width * n1.rect.height > n2.rect.width * n2.rect.height)
        return -1;
      if (n1.rect.width * n1.rect.height < n2.rect.width * n2.rect.height)
        return 1;
      return 0;
    });

    // Create the organization -> tile members
    for (var i = 0; i < layoutNodes.length; i++) {
      var lNode = layoutNodes[i];

      if (organization.rows.length == 0) {
        this.insertNodeToRow(organization, lNode, 0);
      }
      else if (this.canAddHorizontal(organization, lNode.rect.width, lNode.rect.height)) {
        this.insertNodeToRow(organization, lNode, this.getShortestRowIndex(organization));
      }
      else {
        this.insertNodeToRow(organization, lNode, organization.rows.length);
      }

      this.shiftToLastRow(organization);
    }

    return organization;
  };

  /**
   * This method performs tiling. If a new row is needed, it creates the row
   * and places the new node there. Otherwise, it places the node to the end
   * of the specified row.
   */
  _CoSELayout.prototype.insertNodeToRow = function (organization, node, rowIndex) {
    var minComplexSize = organization.complexMargin * 2;

    // Add new row if needed
    if (rowIndex == organization.rows.length) {
      var secondDimension = [];

      organization.rows.push(secondDimension);
      organization.rowWidth.push(minComplexSize);
      organization.rowHeight.push(0);
    }

    // Update row width
    var w = organization.rowWidth[rowIndex] + node.rect.width;

    if (organization.rows[rowIndex].length > 0) {
      w += organization.horizontalPadding;
    }

    organization.rowWidth[rowIndex] = w;
    // Update complex width
    if (organization.width < w) {
      organization.width = w;
    }

    // Update height
    var h = node.rect.height;
    if (rowIndex > 0)
      h += organization.verticalPadding;

    var extraHeight = 0;
    if (h > organization.rowHeight[rowIndex]) {
      extraHeight = organization.rowHeight[rowIndex];
      organization.rowHeight[rowIndex] = h;
      extraHeight = organization.rowHeight[rowIndex] - extraHeight;
    }

    organization.height += extraHeight;

    // Insert node
    organization.rows[rowIndex].push(node);
  };

  /**
   * Scans the rows of an organization and returns the one with the min width
   */
  _CoSELayout.prototype.getShortestRowIndex = function (organization) {
    var r = -1;
    var min = Number.MAX_VALUE;

    for (var i = 0; i < organization.rows.length; i++) {
      if (organization.rowWidth[i] < min) {
        r = i;
        min = organization.rowWidth[i];
      }
    }
    return r;
  };

  /**
   * Scans the rows of an organization and returns the one with the max width
   */
  _CoSELayout.prototype.getLongestRowIndex = function (organization) {
    var r = -1;
    var max = Number.MIN_VALUE;

    for (var i = 0; i < organization.rows.length; i++) {

      if (organization.rowWidth[i] > max) {
        r = i;
        max = organization.rowWidth[i];
      }
    }

    return r;
  };

  /**
   * This method checks whether adding extra width to the organization violates
   * the aspect ratio(1) or not.
   */
  _CoSELayout.prototype.canAddHorizontal = function (organization, extraWidth, extraHeight) {

    var sri = this.getShortestRowIndex(organization);

    if (sri < 0) {
      return true;
    }

    var min = organization.rowWidth[sri];

    if (min + organization.horizontalPadding + extraWidth <= organization.width)
      return true;

    var hDiff = 0;

    // Adding to an existing row
    if (organization.rowHeight[sri] < extraHeight) {
      if (sri > 0)
        hDiff = extraHeight + organization.verticalPadding - organization.rowHeight[sri];
    }

    var add_to_row_ratio;
    if (organization.width - min >= extraWidth + organization.horizontalPadding) {
      add_to_row_ratio = (organization.height + hDiff) / (min + extraWidth + organization.horizontalPadding);
    } else {
      add_to_row_ratio = (organization.height + hDiff) / organization.width;
    }

    // Adding a new row for this node
    hDiff = extraHeight + organization.verticalPadding;
    var add_new_row_ratio;
    if (organization.width < extraWidth) {
      add_new_row_ratio = (organization.height + hDiff) / extraWidth;
    } else {
      add_new_row_ratio = (organization.height + hDiff) / organization.width;
    }

    if (add_new_row_ratio < 1)
      add_new_row_ratio = 1 / add_new_row_ratio;

    if (add_to_row_ratio < 1)
      add_to_row_ratio = 1 / add_to_row_ratio;

    return add_to_row_ratio < add_new_row_ratio;
  };

  /**
   * If moving the last node from the longest row and adding it to the last
   * row makes the bounding box smaller, do it.
   */
  _CoSELayout.prototype.shiftToLastRow = function (organization) {
    var longest = this.getLongestRowIndex(organization);
    var last = organization.rowWidth.length - 1;
    var row = organization.rows[longest];
    var node = row[row.length - 1];

    var diff = node.width + organization.horizontalPadding;

    // Check if there is enough space on the last row
    if (organization.width - organization.rowWidth[last] > diff && longest != last) {
      // Remove the last element of the longest row
      row.splice(-1, 1);

      // Push it to the last row
      organization.rows[last].push(node);

      organization.rowWidth[longest] = organization.rowWidth[longest] - diff;
      organization.rowWidth[last] = organization.rowWidth[last] + diff;
      organization.width = organization.rowWidth[this.getLongestRowIndex(organization)];

      // Update heights of the organization
      var maxHeight = Number.MIN_VALUE;
      for (var i = 0; i < row.length; i++) {
        if (row[i].height > maxHeight)
          maxHeight = row[i].height;
      }
      if (longest > 0)
        maxHeight += organization.verticalPadding;

      var prevTotal = organization.rowHeight[longest] + organization.rowHeight[last];

      organization.rowHeight[longest] = maxHeight;
      if (organization.rowHeight[last] < node.height + organization.verticalPadding)
        organization.rowHeight[last] = node.height + organization.verticalPadding;

      var finalTotal = organization.rowHeight[longest] + organization.rowHeight[last];
      organization.height += (finalTotal - prevTotal);

      this.shiftToLastRow(organization);
    }
  };

  /**
   * @brief : called on continuous layouts to stop them before they finish
   */
  _CoSELayout.prototype.stop = function () {
    this.stopped = true;

    return this; // chaining
  };

  _CoSELayout.prototype.processChildrenList = function (parent, children) {
    var size = children.length;
    for (var i = 0; i < size; i++) {
      var theChild = children[i];
      this.cy.nodes().length;
      var children_of_children = theChild.children();
      var theNode;

      if (theChild.width() != null
              && theChild.height() != null) {
        theNode = parent.add(new CoSENode(layout.graphManager,
                new PointD(theChild.position('x'), theChild.position('y')),
                new DimensionD(parseFloat(theChild.width()),
                        parseFloat(theChild.height()))));
      }
      else {
        theNode = parent.add(new CoSENode(this.graphManager));
      }
      theNode.id = theChild.data("id");
      _CoSELayout.idToLNode[theChild.data("id")] = theNode;

      if (isNaN(theNode.rect.x)) {
        theNode.rect.x = 0;
      }

      if (isNaN(theNode.rect.y)) {
        theNode.rect.y = 0;
      }

      if (children_of_children != null && children_of_children.length > 0) {
        var theNewGraph;
        theNewGraph = layout.getGraphManager().add(layout.newGraph(), theNode);
        this.processChildrenList(theNewGraph, children_of_children);
      }
    }
  };



  // register the layout
  $$('layout', 'cose2', _CoSELayout);

})(cytoscape);
