import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip, createUnzip } from 'node:zlib';
import { util } from './utils.js';

async function handleZIP(from, to, kindOfZip) {
  const curDir = util.changePathView(process.cwd());
  try {
    await pipeline(createReadStream(from), kindOfZip, createWriteStream(to));
    console.log(`You are currently in ${curDir}`);
  } catch {
    console.log(`Operation failed`);
  }
}
export async function runCommandCOMPRESS(
  pathToFile,
  pathToDest,
  unzip = false
) {
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  let fileName = `${pathToFile.split('/').pop()}`;
  let zip;
  if (unzip) {
    zip = createUnzip();
    const name = fileName.split('.');
    name.pop();
    fileName = name.join('.');
  } else {
    zip = createGzip();
    fileName += `.gz`;
  }
  const fileDest = `${pathToDest}/${fileName}`;
  if (await util.isDir(pathToDest)) {
    if (await util.isFile(fileDest))
      return console.log(`This file is already exists`);
    await handleZIP(pathToFile, fileDest, zip);
    return;
  }
  if (await util.isFile(pathToDest))
    return console.log(`This file is already exists`);
  await handleZIP(pathToFile, pathToDest, zip);
}
