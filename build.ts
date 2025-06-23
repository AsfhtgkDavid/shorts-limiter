import { copy } from "esbuild-plugin-copy";
import esbuild from "esbuild";

await esbuild.build({
  sourcemap: false,
  platform: "browser",
  entryPoints: ["src/background.ts", "src/content.ts", "src/popup.ts"],
  outdir: "dist/",
  bundle: true,
  legalComments: "eof",
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: [
        {
          from: ["./src/images/*.png"],
          to: ["./dist/images/"],
        },
        {
            from: ["./src/*.html", "./src/*.css", "./src/*.json"],
            to: ["./dist/"]
        }
      ],
    }),
  ],
});

await esbuild.stop();
