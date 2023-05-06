export default class Random {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(seed: number = 19681106) {
    this.x = 31415926535;
    this.y = 8979323846;
    this.z = 2643383279;
    this.w = seed;
  }

  // XorShift
  next(): number {
    let t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    return (this.w = this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8)));
  }

  // min以上max以下の乱数を生成する
  nextInt(min: number, max: number): number {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }
}
