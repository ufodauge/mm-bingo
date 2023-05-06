import { BaseException } from "./base";
import { ErrorCodes } from "./code";

export class UnknownThemeNameException extends BaseException {
  constructor(themeName: string, readonly e?: Error) {
    super(ErrorCodes.UnknownThemeName, `ThemeName: ${themeName}`, e);
  }

  public describe(): void {
    super.describe();
  }
}
