/// <reference lib="deno.ns" />
import { Glob } from "glob";
import esbuild from "esbuild";
import { copy } from "jsr:@std/fs";

const srcDir = "src";
const distDir = "dist";

await esbuild.build({
  sourcemap: false,
  platform: "browser",
  entryPoints: [
    `${srcDir}/background.ts`,
    `${srcDir}/content.ts`,
    `${srcDir}/popup.ts`,
  ],
  outdir: distDir,
  bundle: true,
  legalComments: "eof",
  splitting: true,
  format: "esm",
  chunkNames: "deps",
});

// content scripts are not supported as esm modules
await esbuild.build({
  sourcemap: false,
  platform: "browser",
  entryPoints: [`${srcDir}/content.ts`],
  outdir: distDir,
  bundle: true,
  legalComments: "eof",
});

const assetStream = new Glob([
  `${srcDir}/*.html`,
  `${srcDir}/*.css`,
  `${srcDir}/*.json`,
], {
  withFileTypes: true,
});
assetStream.stream().on("data", async (path) => {
  await Deno.copyFile(path.fullpath(), `${distDir}/${path.name}`);
});

copy(`${srcDir}/images/`, `${distDir}/images/`, { overwrite: true });

await esbuild.stop();
