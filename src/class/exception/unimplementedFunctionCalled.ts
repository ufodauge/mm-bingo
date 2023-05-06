import { BaseException } from "./base";
import { ErrorCodes } from "./code";

export class UnimplementedFunctionCalledException extends BaseException {
  constructor(readonly e?: Error) {
    super(ErrorCodes.UnimplementedFunctionCalled, undefined, e);
  }
}
