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