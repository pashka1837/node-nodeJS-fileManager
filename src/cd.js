// import { curDir } from 'app.js';
import { util } from './utils.js';

export async function runCommandCD(pathToDir) {
  if (!(await util.isDir(pathToDir))) return console.log(`Invalid input`);
  process.chdir(pathToDir);
  const curDir = util.changePathView(process.cwd());
  console.log(`You are currently in ${curDir}`);
}
