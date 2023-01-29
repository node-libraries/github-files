import { Argument, program, Option } from "commander";
import { downloadGitHubFiles, getGitHubFileList } from "..";

export const downloadFiles = async (
  url: string,
  outputPath: string | undefined,
  { parallels }: { parallels: string }
) => {
  const files = await getGitHubFileList(url);
  if (!files) {
    throw "Failure to retrieve file list";
  }
  await downloadGitHubFiles(files, outputPath ?? ".", {
    parallels: parallels ? Number(parallels) : 5,
  });
};

export const download = program
  .createCommand("download")
  .description("Download files")
  .addArgument(new Argument("[url]", "GitHub url").argRequired())
  .addArgument(new Argument("[outdir]", "Output dir"))
  .addOption(
    new Option("-p, --parallels <parallels>", "Number of parallel downloads")
  )
  .action(downloadFiles);
