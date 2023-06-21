import { argv, stdout, stdin } from 'node:process';
import { readdir, opendir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import * as readline from 'node:readline/promises';
// import { pipeline } from 'node:stream/promises';
import os from 'node:os';
import { Transform, finished, pipeline } from 'node:stream';
import { pathTo, util } from './utils.js';

const { filename } = pathTo(import.meta.url);
const { dirname } = pathTo(import.meta.url);
const username = getUserName(argv);
// const homeDir = changePathView(os.homedir());
const homeDir1 = new URL('./', import.meta.url);
const homeDir = `C:/Users/pashk/Documents/Web_Development/Edu/RSschool/node-nodeJS-fileManager/src`;
let curDir = homeDir;
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  removeHistoryDuplicates: true,
  historySize: 4,
});
function changePathView(str) {
  return str.replace(/\\/g, '/');
}

// const myTrans = new Transform({
//   transform(chunk, ecnoding, callback) {
//     const str = chunk.toString();
//     let newStr = ``;
//     for (let i = str.length - 1; i > -1; i--) {
//       newStr += str[i];
//     }
//     callback(null, `${newStr}\n`);
//   },
// });

function getUserName(myArgs) {
  let usernameArg = myArgs.slice(2)[0];
  if (!usernameArg) return `Anon`;
  usernameArg = usernameArg.replace(/\s/g, '');
  const indexOfUserName = usernameArg.split('').indexOf('=') + 1;
  if (!usernameArg[indexOfUserName]) return `Anon`;
  return usernameArg.slice(indexOfUserName);
}

async function checkPath(data) {
  const dest = data.split(' ')[1];
  let path;
  if (!dest) return false;
  dest.includes(`C:`) ? (path = dest) : (path = curDir + dest);
  if (!(await util.isExists(`${path}`))) return false;
  return path;
}

async function runCommandCD(data) {
  const path = await checkPath(data);
  if (!path) return console.log(`Invalid input`);
  const isDir = await util.isDir(path);
  if (!isDir) return console.log(`Operation failed`);
  curDir = changePathView(path);
  console.log(`You are currently in ${curDir}`);
}

function runCommandUP() {
  if (curDir === `C:`) return console.log(`You are currently in ${curDir}`);
  curDir = curDir.split('/');
  curDir.pop();
  curDir = curDir.join('/');
  console.log(`You are currently in ${curDir}`);
}

async function runCommandLS() {
  try {
    const files = await readdir(curDir, { withFileTypes: true });
    const modFiles = files.map((file) => {
      if (file.isDirectory) return { Name: file.name, Type: 'directory' };
      if (file.isFile) return { Name: file.name, Type: 'file' };
      return { Name: file.name, Type: 'unknown' };
    });
    console.log(`You are currently in ${curDir}`);
    console.table(modFiles);
  } catch {
    console.log(`Operation failed`);
  }
}

async function runCommandCAT(data) {
  const path = await checkPath(data);
  if (!path) return console.log(`Invalid input`);
  const readStream = createReadStream(path);
  let str = ``;
  for await (const chunk of readStream) {
    str += chunk;
  }
  console.log(`You are currently in ${curDir}`);
  stdout.write(`${str}\n`);
}

async function handleLines(data) {
  const command = data.split(' ')[0];
  if (command === `.exit`) return rl.close();
  switch (command) {
    case 'cd':
      await runCommandCD(data);
      break;
    case 'up':
      await runCommandUP();
      break;
    case 'ls':
      await runCommandLS();
      break;
    case 'cat':
      await runCommandCAT(data);
      break;
    default:
      console.log(`Invalid input`);
  }
}

async function runFM() {
  stdout.write(
    `Welcome to the File Manager, ${username}! ${os.EOL}You are currently in ${curDir} ${os.EOL}`
  );
  rl.on(`line`, handleLines);
}

runFM();
