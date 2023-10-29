import { BaseException } from "./base";
import { ErrorCodes } from "./code";

export class UnsupportedFieldSizeException extends BaseException {
  constructor(size: number, readonly e?: Error) {
    super(ErrorCodes.UnsupportedFieldSize, `size: ${size}`, e);
  }

  public describe(): void {
    super.describe();
  }
}
