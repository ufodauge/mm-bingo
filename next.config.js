require("dotenv").config();
const randomBytes = require("crypto").randomBytes(32).toString("hex");
const isDevEnv = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: isDevEnv ? "" : "/speed-bingo-template",
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_PASSWORD: randomBytes,
  },
};

module.exports = nextConfig;
