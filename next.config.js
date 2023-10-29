require("dotenv").config();
const key = require("crypto").randomBytes(16).toString("hex");
const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const withVanillaExtract = createVanillaExtractPlugin();

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
  // experimental: {
  //   appDir: true,
  // },
};

module.exports = withVanillaExtract(nextConfig);
