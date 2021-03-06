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
  var nnode=this.layout.newNode(null);
  var root = this.add(ngraph,nnode );
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

//  console.log("Inter-graph edges:");
//  var edge;
//
//  s = this.edges.length;
//  for (var i = 0; i < s; i++)
//  {
//    edge = this.edges[i];
//
//    edge.printTopology();
//  }
//
//  console.log("\n");
//  console.log("\n");
};