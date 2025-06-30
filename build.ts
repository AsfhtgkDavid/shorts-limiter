/// <reference lib="deno.ns" />
import { Glob } from "glob";
import esbuild from "esbuild";
import { copy } from "jsr:@std/fs";

function globCopy(glob: Glob<{ withFileTypes: true }>, dist: string) {
  glob.stream().on("data", async (path) => {
    console.log(path.fullpath())
    await Deno.copyFile(path.fullpath(), `${dist}/${path.name}`);
  });
}

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

Deno.mkdir("dist/images", { recursive: true });

globCopy(
  new Glob([
    `${srcDir}/*.html`,
    `${srcDir}/*.css`,
    `${srcDir}/*.json`,
  ], {
    withFileTypes: true,
  }),
  `${distDir}/`,
);

globCopy(
  new Glob([`${srcDir}/images/*-*.png`], { withFileTypes: true }),
  `${distDir}/images`,
);

await copy(`${srcDir}/_locales/`, `${distDir}/_locales/`, { overwrite: true });

await esbuild.stop();
