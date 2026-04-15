import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include CSV data files in Vercel serverless function output
  outputFileTracingIncludes: {
    "/*": ["./data/**/*"],
  },
  // Don't bundle the ONNX/transformers packages — let Node.js require them at
  // runtime. Without this, Next.js tries to statically analyse the dynamic
  // import and fails when the native binaries aren't present in the build env.
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node", "onnxruntime-web"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
