#!/usr/bin/env node

import path from "path";
import { exit } from "process";
import { Command } from "commander";
import { download } from "./download.js";
import { help } from "./help.js";
import { list } from "./list.js";

const pkg = require(path.resolve(__dirname, "../../../package.json"));
const program = new Command(pkg.name);
program.version(pkg.version);

program.addCommand(list);
program.addCommand(download);
program.addCommand(help, { isDefault: true });
program.parseAsync(process.argv).catch((e) => {
  console.error(e);
  exit(1);
});
