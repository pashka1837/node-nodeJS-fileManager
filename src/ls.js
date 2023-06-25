import { readdir } from 'node:fs/promises';
import { util } from './utils.js';
// import { curDir } from './app.js';

export async function runCommandLS() {
  const curDir = util.changePathView(process.cwd());
  try {
    const files = await readdir(`${curDir}`, { withFileTypes: true });
    const filesType = [];
    const foldersType = [];
    const uknownType = files.map((file) => {
      if (file.isFile()) filesType.push({ Name: file.name, Type: 'file' });
      if (file.isDirectory())
        foldersType.push({ Name: file.name, Type: 'directory' });
      return { Name: file.name, Type: 'unknown' };
    });
    filesType.sort();
    uknownType.sort();
    foldersType.sort();
    const modFiles = [...foldersType, ...filesType];
    console.log(`You are currently in ${curDir}`);
    console.table(modFiles);
  } catch {
    console.log(`Operation failed`);
  }
}
