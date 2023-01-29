import { Argument, program, Option } from "commander";
import { getGitHubFileList } from "..";

export const fileList = async (url: string, { json }: { json?: boolean }) => {
  const files = await getGitHubFileList(url);
  if (json) {
    console.log(JSON.stringify(files, undefined, "  "));
  } else {
    files?.forEach(({ url }) => console.log(url));
  }
};

export const list = program
  .createCommand("list")
  .description("Retrieving the file list")
  .addArgument(new Argument("[url]", "GitHub url").argRequired())
  .addOption(new Option("-j, --json", "output json format"))
  .action(fileList);
