# github-files

Download the file at the given github address

## usage

```sh
Usage: github-files [options] [command]

Options:
  -V, --version                      output the version number
  -h, --help                         display help for command

Commands:
  list [options] <url>               Retrieving the file list
    -j, --json                        output json format
  download [options] <url> [outdir]  Download files
    -p, --parallels <parallels>       Number of parallel downloads
  help [command]                     display help for command
```

- Download files in the output folder with a parallel number of 5.

```sh
npx github-files download https://github.com/node-libraries/scaffold/tree/master/src output -p 5
```

## When called from a programme

```ts
import { getGitHubFileList, downloadGitHubFiles } from "github-files";

const main = async () => {
  const files = await getGitHubFileList(
    "https://github.com/node-libraries/scaffold/tree/master/src"
  );
  if (files) await downloadGitHubFiles(files, "output");
};
main();
```
