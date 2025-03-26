require("esbuild").buildSync({
  entryPoints: ["src/index.ts"], // メインのエントリーポイント
  bundle: true,
  outfile: "dist/output.js",
  platform: "browser",
  format: "iife", // GASで動くようにIIFEにする
  target: ["esnext"], // 必要に応じてES5に変更
  external: ["fs", "path"], // fsモジュールを除外
});
