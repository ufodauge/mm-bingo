import { Task } from "@/types/task";

import Random from "./Random";
import { LineType } from "@/types/lineType";

export default class MagicSquare {
  /**
   * the board size ( 5x5 magic square -> size = 5 )
   * size >= 3
   */
  private size: number;

  /**
   * magic square
   */
  private magicSquare: number[];

  /**
   * checker of if any tasks have same tag in a same row.
   */
  private checkList: { [key: string]: number };

  private random: Random;

  constructor(size: number, seed: number) {
    if (size % 2 === 0) {
      throw new Error("Currently the board size must be odd number.");
    }
    if (size <= 2) {
      throw new Error("The board size must be larger than 2.");
    }

    this.size = size;

    this.checkList = { bltr: 0b0, tlbr: 0b0 };
    for (let i = 0; i < size; i++) {
      this.checkList[`col${i + 1}`] = 0b0;
      this.checkList[`row${i + 1}`] = 0b0;
    }

    this.random = new Random(seed);

    // this.magicSquare = [...Array<number>(this.size * this.size)];
    // this.generate();
    this.magicSquare = this.generateMagicSquare();
    this.assertMagicSquare();
  }

  private generateMagicSquare = (): number[] => {
    if (this.size % 2 === 0) {
      // this.generateOddMS();
      throw new Error("Currently the board size doesn't supported.");
    } else if (this.size === 3) {
      return this.generate3x3MS();
    } else {
      return this.generateOddMS();
    }
  };

  private generate3x3MS = (): number[] => {
    // this is the only way to represent 3x3 magic square.
    return [7, 0, 5, 2, 4, 6, 3, 8, 1];
  };

  private generateOddMS = (): number[] => {
    const muls = [...Array(this.size)].map((_, i) => this.size * i);
    const mods = [...Array(this.size)].map((_, i) => i);

    this.shuffleArray(muls);
    this.shuffleArray(mods);

    return [...Array(this.size ** 2)].map((_, i) => {
      const x = Math.floor(i / this.size);
      const y = i % this.size;

      return muls[(x * 3 + y) % this.size] + mods[(y * 3 + x) % this.size];
    });
  };

  // generateEvenMS = () => {};

  /**
   * return task or error task if some tasks are assignable.
   */
  getAssignableTask = (tasks: Task[], pos: number): Task =>
    this.shuffleArray(tasks).find((task) =>
      this.checkFilter(task.filter, pos)
    ) || {
      index: pos,
      difficulty: this.getDifficulty(pos),
      text: "Error!",
      filter: 0,
      lineTypes: [],
      trackers: [],
    };

  /**
   * get row's labels by position
   */
  getRowsByPosition = (pos: number): LineType[] => {
    const rows: LineType[] = [
      `row${Math.floor(pos / this.size)}`,
      `col${pos % this.size}`,
    ];

    if (pos % (this.size + 1) === 0) {
      rows.push("tlbr");
    }

    if (
      pos % (this.size - 1) === 0 &&
      ![0, this.size * this.size].includes(pos)
    ) {
      rows.push("bltr");
    }

    return rows;
  };

  /**
   *
   */
  checkFilter = (filter: number, pos: number): boolean => {
    return this.getRowsByPosition(pos).every(
      (v) => (this.checkList[v] & filter) === 0b0
    );
  };

  /**
   * update filter of the position
   */
  updateFilter = (filter: number, pos: number) => {
    this.getRowsByPosition(pos).forEach((v) => (this.checkList[v] &= filter));
  };

  /**
   * Get difficulty by the position
   */
  getDifficulty = (pos: number): number => this.magicSquare[pos] + 1;

  private shuffleArray = (array: any[]): any[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.random.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  /**
   * Asserts generated magic square is ok
   */
  private assertMagicSquare = (): this is MagicSquare => {
    const ms2d: number[][] = this.magicSquare.reduce<number[][]>(
      (acc, current, i) => {
        const x = i % this.size;
        const y = Math.floor(i / this.size);

        acc[y] = acc[y] || [];
        acc[y][x] = current;

        return acc;
      },
      []
    );

    const targetValue =
      ((this.size * this.size + 1) * this.size) / 2 - this.size;

    let bltr = 0,
      tlbr = 0;
    for (let i = 0; i < ms2d.length; i++) {
      let a = 0,
        b = 0;
      for (let j = 0; j < ms2d[i].length; j++) {
        a += ms2d[i][j];
        b += ms2d[j][i];
      }
      tlbr += ms2d[i][i];
      bltr += ms2d[ms2d.length - i - 1][i];

      if (a !== targetValue) {
        console.error(
          `row${i + 1}, expect ${targetValue}, but the sum of the row ${a}`
        );
        return false;
      }
      if (b !== targetValue) {
        console.error(
          `col${i + 1}, expect ${targetValue}, but the sum of the row ${b}`
        );
        return false;
      }
    }

    if (tlbr !== targetValue) {
      console.error(
        `tlbr, expect ${targetValue}, but the sum of the row ${tlbr}`
      );
      return false;
    }

    if (bltr !== targetValue) {
      console.error(
        `bltr, expect ${targetValue}, but the sum of the row ${bltr}`
      );
      return false;
    }

    return true;
  };
}
