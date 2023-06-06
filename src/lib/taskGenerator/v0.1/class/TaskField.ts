import { UnsupportedFieldSizeException } from "@/class/exception/unsupportedFieldSize";
import { getLineTypesByIndex } from "@/lib/getLineTypeByIndex";
import { LineType } from "@/types/lineType";
import { Task } from "@/types/task";
import { TaskData } from "@/types/taskData";

import { Random } from "./Random";
import { TaskList } from "./TaskList";

type TaskFieldStrategy = {
  getSize: () => number;
  generateMagicSquare: (random: Random) => number[];
};

class BasicTaskFieldStrategy implements TaskFieldStrategy {
  getSize = () => 5;
  generateMagicSquare = (random: Random) => {
    const size = this.getSize();
    const muls = random.shuffleArray([...Array(size)].map((_, i) => size * i));
    const mods = random.shuffleArray([...Array(size)].map((_, i) => i));

    const result = [...Array(size ** 2)].map((_, i) => {
      const x = Math.floor(i / size);
      const y = i % size;

      return muls[(x * 3 + y) % size] + mods[(y * 3 + x) % size];
    });
    return result;
  };
}

export class TaskField {
  private _taskFieldStrategy: TaskFieldStrategy;
  private _lang: string;
  private _field: number[];
  private _checkList: { [key in LineType]: bigint };
  private _random: Random;

  constructor(size: number, seed: number, lang: string) {
    if (size !== 5) {
      throw new UnsupportedFieldSizeException(size);
    }
    this._taskFieldStrategy = new BasicTaskFieldStrategy();

    this._lang = lang;

    this._checkList = {
      bltr: BigInt(0b0),
      tlbr: BigInt(0b0),
      card: BigInt(0b0),
    };
    for (let i = 0; i < size; i++) {
      this._checkList[`col${i + 1}`] = BigInt(0b0);
      this._checkList[`row${i + 1}`] = BigInt(0b0);
    }

    this._random = new Random(seed);
    this._field = this._taskFieldStrategy.generateMagicSquare(this._random);
  }

  generateTasks(data: TaskData["data"]): Task[] {
    const taskList = new TaskList(data, this._lang);

    const tasks: Task[] = this._field.map((weight, position) => {
      const task = this._random
        .shuffleArray(taskList.getTasksByWeight(weight))
        .find((task) => {
          return this.checkFilter(task.filter, position);
        }) ?? {
        index: -1,
        difficulty: weight,
        text: `Error!: A task of difficulty ${
          weight + 1
        } cannot be assignable.`,
        filter: BigInt(0),
        lineTypes: [],
        trackers: [],
      };

      const size = this._taskFieldStrategy.getSize();

      this.updateFilter(task.filter, position);
      task.lineTypes = getLineTypesByIndex(position, size);

      return task;
    });

    return tasks;
  }

  private getRowsByPosition = (pos: number): LineType[] => {
    const size = this._taskFieldStrategy.getSize();

    const rows: LineType[] = [
      `row${Math.floor(pos / size) + 1}`,
      `col${(pos % size) + 1}`,
    ];

    if (pos % (size + 1) === 0) {
      rows.push("tlbr");
    }

    if (pos % (size - 1) === 0 && ![0, size * size].includes(pos)) {
      rows.push("bltr");
    }

    return rows;
  };

  private updateFilter(filter: bigint, position: number) {
    this.getRowsByPosition(position).forEach((v) => {
      this._checkList[v] |= filter;
    });
  }

  private checkFilter(filter: bigint, position: number): unknown {
    return this.getRowsByPosition(position).every((v) => {
      return (this._checkList[v] & filter) === BigInt(0b0);
    });
  }
}
