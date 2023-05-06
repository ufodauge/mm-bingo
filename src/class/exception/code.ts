export const ErrorCodes = {
  Unexpected: "不明なエラーです。",
  UnimplementedFunctionCalled: "未実装の関数を呼び出そうとしています。",
  UnknownThemeName: "不明なテーマ名が指定されました。",
  UnreadyRouter: "Router が準備できていません。"
};

export type ErrorCode = string;
export const isErrorCode = (v: string): v is ErrorCode =>
  Object.values(ErrorCodes).includes(v);
