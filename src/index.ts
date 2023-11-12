import { promises as fs } from "fs";
import path from "path";
import { promiseLimit } from "@node-libraries/promise-limit";

type GitHubFile = {
  url: string;
  relativePath: string;
};

const parseUrl = async (url: string) => {
  const reg = new RegExp(
    "https://github.com/(.+?/.+?)/?(?:tree/(.+?)(?:/(.+)|$)|$)",
  );
  const result = reg.exec(url);
  if (!result) return undefined;
  const repository = result[1];
  const branch =
    result[2] ??
    (await fetch(`https://github.com/${repository}`)
      .then((v) => v.text())
      .then(
        (v) =>
          v.match(
            /<span class="css-truncate-target" data-menu-button>([^<]+)<\/span>/,
          )?.[1],
      ));

  return {
    repository,
    branch,
    absolutePath: result[3]?.replace(/\/$/, ""),
  };
};

export const getGitHubFileList = async (
  url: string,
): Promise<GitHubFile[] | undefined> => {
  const result = await parseUrl(url);
  if (!result) throw "Failed to parse url";
  const { repository, branch, absolutePath } = result;
  return fetch(`https://github.com/${repository}/find/${branch}`)
    .then((v) => v.text())
    .then((v) => v.match(/<virtual-filter-input[\s\S]*src="(.*)"/m)?.[1])
    .then(
      (v) =>
        v &&
        fetch("https://github.com" + v, {
          headers: {
            accept: "application/json",
            "accept-encoding": "gzip, deflate, br",
          },
        })
          .then((v) => (v?.ok ? v.json() : undefined))
          .then(
            (v) =>
              v.paths
                ?.filter(
                  (filePath: string) =>
                    !filePath || filePath.match(`^${absolutePath}/`),
                )
                .map((filePath: string) => ({
                  url: `https://raw.githubusercontent.com/${repository}/${branch}/${filePath}`,
                  relativePath: path.posix.relative(absolutePath, filePath),
                })),
          ),
    )
    .catch(() => undefined);
};

export const downloadGitHubFiles = async (
  files: GitHubFile[],
  outdir: string,
  options?: {
    parallels?: number;
  },
) => {
  const ps = promiseLimit();
  for (const { url, relativePath } of files) {
    ps.add(async () => {
      const target = path.resolve(outdir, relativePath);
      const value = await fetch(url).then((v) => v.blob());
      if (value) {
        const targetDir = path.dirname(target);
        if (target) {
          await fs.mkdir(targetDir, { recursive: true }).catch(() => undefined);
          await fs.writeFile(target, value.stream() as never);
        }
      }
    });
    await ps.wait(options?.parallels || 5);
  }
  await ps.all();
};
