import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { util } from './utils.js';

export async function runCommandHASH(pathToFile) {
  const curDir = util.changePathView(process.cwd());
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  const fileContent = await readFile(pathToFile).catch(() =>
    console.log(`Operation failed`)
  );
  const hash = createHash(`sha256`).update(fileContent).digest(`hex`);
  console.log(`You are currently in ${curDir}\n`, hash);
}
