var layoutOptionsPack = {};

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