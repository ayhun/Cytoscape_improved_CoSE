;
(function ($$) {
  'use strict';
  var DEBUG;

  var allChildren = [];
  var idToLNode = {};
  var toBeTiled = {};

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
    FDLayoutConstants.getUserOptions(options);
    fillCoseLayoutOptionsPack();
  }

  _CoSELayout.prototype.run = function () {
    var options = this.options;
    allChildren = [];
    idToLNode = {};
    toBeTiled = {};
    layout = new CoSELayout();
    //var options = this.options;
    var eles = this.options.eles; // elements to consider in the layout
//    var layout = this;

    // cy is automatically populated for us in the constructor
    this.cy = this.options.cy; // jshint ignore:line;

    this.cy.trigger('layoutstart');

    var gm = layout.newGraphManager();
    this.gm = gm;

    var nodes = this.cy.nodes();
    var edges = this.cy.edges();

    this.root = gm.addRoot();
    this.orphans = [];
    for (var i = 0; i < nodes.length; i++) {
      var theNode = nodes[i];
      var p_id = theNode.data("parent");
      if (p_id != null) {
        if (allChildren[p_id] == null) {
          allChildren[p_id] = [];
        }
        allChildren[p_id].push(theNode);
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
      var tiledMemberPack = this.clearComplexes(options);

      // Separately tile and clear zero degree nodes for each level
      var tiledZeroDegreeNodes = this.clearZeroDegreeMembers(memberGroups);
    }


    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var sourceNode = idToLNode[edge.data("source")];
      var targetNode = idToLNode[edge.data("target")];
      var e1 = gm.add(layout.newEdge(), sourceNode, targetNode);

      if (sourceNode.owner.getNodes().indexOf(this) > -1 && targetNode.owner.getNodes().indexOf(this) > -1)
        var e1 = gm.add(layout.newEdge(), sourceNode, targetNode);
    }

    layout.runLayout();

    if (this.options.tile) {
      //fill the toBeTiled map
      for (var i = 0; i < nodes.length; i++) {
        getToBeTiled(nodes[i]);
      }

      // Repopulate members
      this.repopulateZeroDegreeMembers(tiledZeroDegreeNodes);

      this.repopulateComplexes(tiledMemberPack);

      cy.nodes().updateCompoundBounds();
    }



    //add nodes to the graph manager in correct order
//    this.processChildrenList(root, orphans);



    this.cy.nodes().positions(function (i, ele) {
      var theId = ele.data('id');
      var lNode = idToLNode[theId];
      console.log(theId + "\t" + lNode.getRect().getX() + "\t" + lNode.getRect().getY());

      return {
        x: lNode.getRect().getCenterX(),
        y: lNode.getRect().getCenterY()
      };
    });

    if (this.options.fit)
      this.options.cy.fit(this.options.padding);
//      this.options.cy.fit(20);

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
    if (toBeTiled[id] != null) {
      return toBeTiled[id];
    }

    //only compound nodes are to be tiled
    var children = node.children();
    if (children == null || children.length == 0) {
      toBeTiled[id] = false;
      return false;
    }

    //a compound node is not to be tiled if all of its compound children are not to be tiled
    for (var i = 0; i < children.length; i++) {
      var theChild = children[i];

      if (theChild.degree(false) > 0) {
        toBeTiled[id] = false;
        return false;
      }

      //pass the children not having the compound structure
      if (theChild.children() == null || theChild.children().length == 0) {
        toBeTiled[theChild.data("id")] = false;
        continue;
      }

      if (!getToBeTiled(theChild)) {
        toBeTiled[id] = false;
        return false;
      }
    }
    toBeTiled[id] = true;
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
        if (this.cy.getElementById(dummyComplexId).empty()) {
          this.cy.add({
            group: "nodes",
            data: {id: dummyComplexId, parent: p_id,
            },
            position: {x: Math.random() * this.cy.container().clientWidth,
              y: Math.random() * this.cy.container().clientHeight}
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
    var roots = this.cy.filter(function (i, ele) {
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
    var tempallnodes = this.gm.getAllNodes();

//    this.allNodes = this.gm.getAllNodes();

    for (var i = 0; i < complexOrder.length; i++) {
      // find the corresponding layout node
      var lComplexNode = idToLNode[complexOrder[i].id()];

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
      var complexNode = idToLNode[id];

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
      var lComplexNode = idToLNode[i];

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
      var complexNode = idToLNode[i];

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

        node._private.position.x = x + lnode.rect.width / 2;
        node._private.position.y = y + lnode.rect.height / 2;

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
      var complexNode = idToLNode[id];

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
      var lNode = idToLNode[node.id()];

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
      var children_of_children = allChildren[theChild.data("id")];
      var theNode;

      if (theChild._private.data.sbgnbbox.w !== null
              && theChild._private.data.sbgnbbox.h !== null) {
        theNode = parent.add(new CoSENode(layout.graphManager,
                new PointD(theChild._private.data.sbgnbbox.x, theChild._private.data.sbgnbbox.y),
                new DimensionD(parseFloat(theChild._private.data.sbgnbbox.w),
                        parseFloat(theChild._private.data.sbgnbbox.h))));
      }
      else {
        theNode = parent.add(new CoSENode(this.graphManager));
      }
      theNode.id = theChild.data("id");
      idToLNode[theChild.data("id")] = theNode;
      if (children_of_children != null && children_of_children.length > 0) {
        var theNewGraph;
        theNewGraph = layout.getGraphManager().add(layout.newGraph(), theNode);
        this.processChildrenList(theNewGraph, children_of_children);
      }
    }
  };
  // register the layout
  $$('layout', 'cose', _CoSELayout);

})(cytoscape);
