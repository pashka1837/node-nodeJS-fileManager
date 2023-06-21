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
  async isExists(dest) {
    const file = await fsPromises
      .access(dest)
      .then(() => true)
      .catch(() => false);
    if (!file) return false;
    return true;
  },
  async isDir(dest) {
    const dir = await fsPromises
      .opendir(dest)
      .then(() => true)
      .catch(() => false);
    if (!dir) return false;
    return true;
  },
  async isFile(dest) {
    const file = await fsPromises
      .open(dest)
      .then(() => true)
      .catch(() => false);
    if (!file) return false;
    return true;
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
