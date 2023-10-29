// XorShift
export class Random {
  private x: number;
  private y: number;
  private z: number;
  private w: number;

  constructor(seed: number = 19681106) {
    this.x = 31415926535;
    this.y = 8979323846;
    this.z = 2643383279;
    this.w = seed;
  }

  next(): number {
    let t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    return (this.w = this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8)));
  }

  generate(min: number, max: number): number {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }

  shuffleArray = <T>(array: T[]): T[] => {
    const copy = array.slice();

    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.generate(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  };
}
