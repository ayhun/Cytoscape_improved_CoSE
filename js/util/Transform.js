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
