/// <reference lib="deno.ns" />
import { Glob } from "glob";
import esbuild from "esbuild";
import { copy } from "jsr:@std/fs";

await esbuild.build({
  sourcemap: false,
  platform: "browser",
  entryPoints: ["src/background.ts", "src/content.ts", "src/popup.ts"],
  outdir: "dist/",
  bundle: true,
  legalComments: "eof",
});

const assetStream = new Glob(["src/*.html", "src/*.css", "src/*.json"], {
  withFileTypes: true,
});
assetStream.stream().on("data", async (path) => {
  await Deno.copyFile(path.fullpath(), "dist/" + path.name);
});

copy("src/images/", "dist/images/", { overwrite: true });

await esbuild.stop();
