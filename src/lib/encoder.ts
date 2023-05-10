import assert from "assert";
import crypto from "crypto";

const key = process.env.NEXT_PUBLIC_KEY!;

export const encrypt = (str: string): [string, string] => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(str, "utf8", "hex");
  encrypted += cipher.final("hex");

  console.log(iv);

  return [encrypted, iv.toString("hex")];
};

export const decrypt = (code: string, hex: string): string => {
  const decArray = hex.match(/.{1,2}/g)?.map((hex) => parseInt(hex, 16));
  assert(decArray !== undefined);
  const iv = Buffer.from(decArray);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(code, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

