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