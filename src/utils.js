import path from 'path';
import { fileURLToPath } from 'url';
import * as fsPromises from 'node:fs/promises';
import * as fs from 'node:fs';

function pathTo(filePath) {
  const filename = fileURLToPath(filePath);
  const dirname = path.dirname(filename);
  return { filename, dirname };
}
const util = {
  async isExists(pathToDest) {
    const file = await fsPromises
      .access(pathToDest)
      .then(() => true)
      .catch(() => false);
    if (!file) return false;
    return true;
  },
  async isDir(pathToDest) {
    const stat = await fsPromises.lstat(pathToDest).catch(() => false);
    if (!stat) return false;
    if (!stat.isDirectory()) return false;
    const dir = await fsPromises.opendir(pathToDest).catch(() => false);
    return dir;
  },
  async isFile(pathToDest) {
    const stat = await fsPromises.lstat(pathToDest).catch(() => false);
    if (!stat) return false;
    if (!stat.isFile()) return false;
    const file = await fsPromises
      .open(pathToDest)
      .catch(() => console.log(`Operation failed`));
    return file;
  },
  changePathView(str) {
    return str.replace(/\\/g, '/').toLowerCase();
  },
};
// async function isExists(dest) {
//   console.log(dest);
//   const file = await fsPromises
//     .access(dest)
//     .then(() => true)
//     .catch(() => false);
//   if (!file) return false;
//   return true;
// }

export { pathTo, util };
