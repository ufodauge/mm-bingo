export const ErrorCodes = {
  Unexpected                 : "An unknown error has occurred.",
  UnimplementedFunctionCalled: "Attempting to call an unimplemented function.",
  UnknownThemeName           : "An unknown theme name was specified.",
  UnreadyRouter              : "The router is not ready.",
  UnsupportedFieldSize       : "An unsupported field size was specified.",
};

export type ErrorCode = string;
export const isErrorCode = (v: string): v is ErrorCode =>
  Object.values(ErrorCodes).includes(v);
