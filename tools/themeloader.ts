/// <reference lib="deno.ns" />
import { parse } from "jsr:@std/ini";

function beautifyRgb(rgbStr: string): string {
  const rgb = rgbStr.split(",");
  return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
}

const decoder = new TextDecoder();
const theme = decoder.decode(
  Deno.readFileSync(Deno.args[Deno.args.length - 1]),
);

const o = parse(theme);

const win = "Colors:Window";
const button = "Colors:Button";
const view = "Colors:View";

const values = [
  ["--main", o[win]["BackgroundNormal"]],
  ["--background", o[win]["BackgroundAlternate"]],
  ["--regular-text", o[win]["ForegroundNormal"]],
  ["--green-accent", o[win]["ForegroundPositive"]],
  ["--red-accent", o[win]["ForegroundNegative"]],
  ["--default-border", o[win]["ForegroundInactive"]],
  ["--decoration-hover", o[win]["DecorationHover"]],
  ["--button-background", o[button]["BackgroundAlternate"]],
  ["--foreground-link", o[win]["ForegroundLink"]],
  ["--input-background", o[view]["BackgroundNormal"]],
];

let css = "";

css += `:root {\n`;
for (let value of values) {
  css += `  ${value[0]}: rgb(${beautifyRgb(value[1])});\n`;
}

css += `  --red-transparent: rgba(${
  beautifyRgb(o[win]["ForegroundNegative"])
}, 0.2);\n`;
css += `  --green-transparent: rgba(${
  beautifyRgb(o[win]["ForegroundPositive"])
}, 0.2);\n`;

css += "}";

console.log(css);
