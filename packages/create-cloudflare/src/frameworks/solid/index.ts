import { mkdirSync } from "fs";
import { logRaw, updateStatus } from "helpers/cli";
import { blue, brandColor, dim } from "helpers/colors";
import {
  detectPackageManager,
  installPackages,
  runFrameworkGenerator,
} from "helpers/command";
import { compatDateFlag, usesTypescript, writeFile } from "helpers/files";
import { viteConfig } from "./templates";
import type { PagesGeneratorContext, FrameworkConfig } from "types";

const { npm } = detectPackageManager();

const generate = async (ctx: PagesGeneratorContext) => {
  // Create the project directory and navigate to it
  mkdirSync(ctx.project.path);
  process.chdir(ctx.project.path);

  // Run the create-solid command
  await runFrameworkGenerator(ctx, `${npm} create solid@latest`);

  logRaw("");
};

const configure = async () => {
  // Install the pages adapter
  const pkg = "solid-start-cloudflare-pages";
  await installPackages([pkg], {
    dev: true,
    startText: "Adding the Cloudflare Pages adapter",
    doneText: `${brandColor(`installed`)} ${dim(pkg)}`,
  });

  // modify the vite config
  const viteConfigPath = usesTypescript()
    ? `./vite.config.ts`
    : `./vite.config.js`;
  writeFile(viteConfigPath, viteConfig);
  updateStatus(
    `Adding the Cloudflare Pages adapter to ${blue("vite.config.js")}`
  );
};

const config: FrameworkConfig = {
  generate,
  configure,
  displayName: "Solid",
  packageScripts: {
    "pages:dev": `wrangler pages dev ${compatDateFlag()} --proxy 3000 -- ${npm} run dev`,
    "pages:deploy": `${npm} run build build && wrangler pages publish ./dist/public`,
  },
};
export default config;
