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