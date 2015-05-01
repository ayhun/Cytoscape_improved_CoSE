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