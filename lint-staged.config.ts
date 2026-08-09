// export default {
//   'apps/**/*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
// }

export default {
  "apps/**/*.{ts,tsx}": (files: string[]) => {
    const filesByWorkspace: Record<string, string[]> = {};
    files.forEach((file) => {
      const match = file.match(/^(apps\/[^/]+)\//);
      if (match) {
        const workspace = match[1];
        if (!filesByWorkspace[workspace]) {
          filesByWorkspace[workspace] = [];
        }
        filesByWorkspace[workspace].push(file);
      }
    });

    const commands: string[] = [];
    Object.entries(filesByWorkspace).forEach(([workspace, workspaceFiles]) => {
      const workspaceName = workspace.split("/")[1];
      commands.push(
        `pnpm --filter ${workspaceName} eslint --fix ${workspaceFiles.join(" ")}`,
      );
      commands.push(`prettier --write ${workspaceFiles.join(" ")}`);
    });

    return commands;
  },
};
