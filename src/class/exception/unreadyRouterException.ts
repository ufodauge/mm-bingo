import { BaseException } from "./base";
import { ErrorCodes } from "./code";

export class UnreadyRouterException extends BaseException {
  constructor(readonly e?: Error) {
    super(ErrorCodes.UnreadyRouter, "", e);
  }

  public describe(): void {
    super.describe();
  }
}
