import assert from "assert";
import zlib from "zlib";

const password = process.env.NEXT_PUBLIC_PASSWORD;

// TODO 
export const Encode = (str: string): string => {
  assert(password, "Password?");

  const content = encodeURIComponent(str + password);
  const result = zlib.gzipSync(content);
  const value = result.toString("base64");

  return value;
};

export const Decode = (code: string): string => {
  assert(password, "Password?");

  const buffer = Buffer.from(code, "base64");
  const result = zlib.unzipSync(buffer);
  const str = decodeURIComponent(result.toString());

  return str.replace(password, "");
};
