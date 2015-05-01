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

//  console.log("Edges: ");
//  var edge;
//  var edges = this.edges;
//  var s = edges.length;
//  for (var i = 0; i < s; i++)
//  {
//    edge = edges[i];
//    edge.printTopology();
//  }
//  console.log("\n");
};