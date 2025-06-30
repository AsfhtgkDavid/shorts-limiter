/// <reference lib="deno.ns" />
import { Glob } from "glob";
import esbuild from "esbuild";
import { copy } from "jsr:@std/fs";

async function globCopy(glob: Glob<{ withFileTypes: true }>, dist: string) {
  for await (const path of glob) {
    console.log(path.fullpath());
    try {
      await Deno.copyFile(path.fullpath(), `${dist}/${path.name}`);
    } catch (err) {
      console.error(
        `Failed to copy ${path.fullpath()} to ${dist}/${path.name}`,
      );
      throw err;
    }
  }
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

await globCopy(
  new Glob([
    `${srcDir}/*.html`,
    `${srcDir}/*.css`,
    `${srcDir}/*.json`,
  ], {
    withFileTypes: true,
  }),
  `${distDir}/`,
);

await globCopy(
  new Glob([`${srcDir}/images/*-*.png`], { withFileTypes: true }),
  `${distDir}/images`,
);

await copy(`${srcDir}/_locales/`, `${distDir}/_locales/`, { overwrite: true });

await esbuild.stop();
