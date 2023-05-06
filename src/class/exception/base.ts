import { ErrorCode, ErrorCodes } from "./code";

export abstract class BaseException extends Error {
  private moduleError: Error | undefined;
  private customText: string | undefined;

  constructor(message: ErrorCode, customText?: string, readonly e?: Error) {
    super();
    this.moduleError = e;
    this.message = message || ErrorCodes.Unexpected;
    this.customText = customText;

    this.describe();
  }

  public appendText(): void {}

  protected describe() {
    const errorType = this.constructor.name;
    const moduleErrorMessage = this.moduleError?.message;
    const errorMessage = this.message;

    const message =
      // ------------------------------------------
      `ErrorType: ${errorType}
      ${moduleErrorMessage ? `ModuleErrorMessage: ${moduleErrorMessage}` : ""}
      ErrorMessage: ${errorMessage}${
        this.customText ? "\n" + this.customText : ""
      }`;

    console.error(message);
  }
}
