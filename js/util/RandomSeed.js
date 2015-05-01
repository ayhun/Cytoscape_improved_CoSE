function RandomSeed(_seed) {
  this.seed = _seed;
  this.x = 0;
}

RandomSeed.prototype.nextDouble = function () {
  this.x = Math.sin(this.seed++) * 10000;
  return this.x - Math.floor(this.x);
};