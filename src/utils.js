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
    if (!pathToDest) return false;
    const file = await fsPromises
      .access(pathToDest)
      .then(() => true)
      .catch(() => false);
    if (!file) return false;
    return true;
  },
  async isDir(pathToDest) {
    if (!pathToDest) return false;
    const stat = await fsPromises.lstat(pathToDest).catch(() => false);
    if (!stat) return false;
    if (!stat.isDirectory()) return false;
    return true;
  },
  async isFile(pathToDest) {
    if (!pathToDest) return false;
    const stat = await fsPromises.lstat(pathToDest).catch(() => false);
    if (!stat) return false;
    if (!stat.isFile()) return false;
    return true;
  },
  changePathView(str) {
    return str.replace(/\\/g, '/').toLowerCase();
  },
};

export { pathTo, util };
