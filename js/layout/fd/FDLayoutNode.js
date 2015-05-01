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

