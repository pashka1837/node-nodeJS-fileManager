import { argv, stdout, stdin } from 'node:process';
import { readdir, opendir, open, appendFile, rename } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import * as readline from 'node:readline/promises';
// import { pipeline } from 'node:stream/promises';
import os from 'node:os';
import { Transform, finished, pipeline } from 'node:stream';
// import path as my_path from 'path';
import { util } from './utils.js';

// const { filename } = pathTo(import.meta.url);
// const { dirname } = pathTo(import.meta.url);
const username = getUserName(argv);
// const homeDir = util.changePathView(os.homedir());
// const getRootDir = () => my_path.parse(process.cwd()).root;
// console.log(getRootDir());
const homeDir1 = new URL('./', import.meta.url);
const homeDir =
  `C:/Users/pashk/Documents/Web_Development/Edu/RSschool/node-nodeJS-fileManager/src`.toLowerCase();
let curDir = homeDir;
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  removeHistoryDuplicates: true,
  historySize: 4,
});

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

function handleData(data) {
  if (!data) return false;
  const commands = data
    .toLowerCase()
    .split(` `)
    .filter((command) => command !== ``);
  const query = {};
  if (commands.length > 1) {
    for (let i = 1; i < commands.length; i += 1) {
      const curComand = commands[i]
        .split('/')
        .filter((char) => char !== '')
        .join('/');
      query[`property${i}`] = curComand;
    }
  }
  query.command = commands[0];
  return query;
}

async function checkPath(dest, access = false, isFile = false, isDir = false) {
  if (!dest) return false;
  let pathTo;
  dest.includes(`c:`) ? (pathTo = dest) : (pathTo = `${curDir}/${dest}`);
  if (access) {
    const accessPath = await util.isExists(pathTo);
    return accessPath && pathTo;
  }
  if (isFile) {
    const file = await util.isFile(pathTo);
    return file && file;
  }
  if (isDir) {
    const dir = await util.isDir(pathTo);
    return dir && dir;
  }
}

async function runCommandCD(pathTo) {
  console.log(`in cd`, pathTo);
  const dir = await checkPath(pathTo, false, false, true);
  if (!dir) return console.log(`Invalid input`);
  curDir = dir.path.toLowerCase();
  console.log(`You are currently in ${curDir}`);
  await dir.close();
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

async function runCommandCAT(pathTo) {
  const file = await checkPath(pathTo, false, true);
  console.log(file);
  if (!file) return console.log(`Invalid input`);
  const readStream = file.createReadStream();
  let str = ``;
  for await (const chunk of readStream) {
    str += chunk;
  }
  console.log(`You are currently in ${curDir}`);
  stdout.write(`${str}\n`);
}

async function runCommandADD(fileName) {
  if (await checkPath(fileName, true))
    return console.log(`File already exists`);
  await appendFile(`${curDir}/${fileName}`, '')
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}
async function runCommandRN(pathToFile, newFileName) {
  const oldPath = await checkPath(pathToFile, true);
  if (!oldPath) return console.log(`Invalid input`);
  let newPath = oldPath.split('/');
  newPath.pop();
  newPath = `${newPath.join('/')}/${newFileName}`;
  await rename(pathToFile, newPath).catch(() =>
    console.log(`Operation failed`)
  );
}

async function handleLines(data) {
  const query = handleData(data);
  if (query.command === `.exit`) {
    stdout.write(
      `Thank you for using File Manager, ${username}, goodbye! ${os.EOL}`
    );
    return rl.close();
  }
  switch (query.command) {
    case 'cd':
      await runCommandCD(query.property1);
      break;
    case 'up':
      await runCommandUP();
      break;
    case 'ls':
      await runCommandLS();
      break;
    case 'cat':
      await runCommandCAT(query.property1);
      break;
    case 'add':
      await runCommandADD(query.property1);
      break;
    case 'rn':
      await runCommandRN(query.property1, query.property2);
      break;
    default:
      console.log(`Invalid input`);
  }
}

function runFM() {
  stdout.write(
    `Welcome to the File Manager, ${username}! ${os.EOL}You are currently in ${curDir} ${os.EOL}`
  );
  rl.on(`line`, handleLines);
}

runFM();
