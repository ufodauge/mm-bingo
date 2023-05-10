require("dotenv").config();
const key = require("crypto").randomBytes(16).toString("hex");

const isDevEnv = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: isDevEnv ? "" : "/mm-bingo",
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_KEY: key,
  },
};

module.exports = nextConfig;
