import { argv, stdout, stdin } from 'node:process';
import {
  readdir,
  readFile,
  opendir,
  open,
  appendFile,
  rename,
  rm,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import * as readline from 'node:readline/promises';
import { pipeline } from 'node:stream/promises';
import os from 'node:os';
import { Transform, finished } from 'node:stream';
import path from 'path';
import { util } from './utils.js';

// const { filename } = pathTo(import.meta.url);
// const { dirname } = pathTo(import.meta.url);
const username = getUserName(argv);
// const homeDir = util.changePathView(os.homedir());
const rootDir = util.changePathView(path.parse(process.cwd()).root);
console.log(rootDir, os.homedir());
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
  console.log(commands);
  const query = {};
  if (commands.length > 1) {
    for (let i = 1; i < commands.length; i += 1) {
      const curComand = commands[i]
        .split('/')
        .filter((char) => char !== '')
        .join('/');
      query[`property${i}`] = util.changePathView(
        path.resolve(`${curDir}`, `${curComand}`)
      );
    }
  }
  query.command = commands[0];
  return query;
}

async function checkPath(dest, access = false, isFile = false, isDir = false) {
  if (!dest) return false;
  if (access) return await util.isExists(dest);
  if (isFile) return await util.isFile(dest);
  if (isDir) return await util.isDir(dest);
}

async function runCommandCD(pathTo) {
  const pathToDir = await checkPath(pathTo, false, false, true);
  if (!pathToDir) return console.log(`Invalid input`);
  curDir = pathToDir;
  console.log(`You are currently in ${curDir}`);
}

async function runCommandUP() {
  await handleLines(`cd ..`);
}

async function runCommandLS() {
  try {
    const files = await readdir(`${curDir}`, { withFileTypes: true });
    const modFiles = files.map((file) => {
      if (file.isDirectory()) return { Name: file.name, Type: 'directory' };
      if (file.isFile()) return { Name: file.name, Type: 'file' };
      return { Name: file.name, Type: 'unknown' };
    });
    console.log(`You are currently in ${curDir}`);
    console.table(modFiles);
  } catch {
    console.log(`Operation failed`);
  }
}

async function runCommandCAT(pathTo) {
  const pathToFile = await checkPath(pathTo, false, true);
  if (!pathToFile) return console.log(`Invalid input`);
  const readStream = createReadStream(pathToFile);
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
  await appendFile(fileName, '')
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}

async function runCommandRN(pathToOldFile, pathToNewFile) {
  if (!(await checkPath(pathToOldFile, true)))
    return console.log(`Invalid input`);
  if (await checkPath(pathToNewFile, true))
    return console.log(`File with this name is already exists`);
  await rename(pathToOldFile, pathToNewFile)
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}

async function runCommandCP(pathToFile, pathToNewDir) {
  if (!(await checkPath(pathToFile, false, true)))
    return console.log(`Invalid input`);
  if (!(await checkPath(pathToNewDir, false, false, true)))
    return console.log(`Invalid input`);
  const fileName = pathToFile.split('/').pop();
  if (await checkPath(`${pathToNewDir}/${fileName}`, false, true))
    return console.log(`File with this name is already exists`);
  try {
    await pipeline(
      createReadStream(pathToFile),
      createWriteStream(`${pathToNewDir}/${fileName}`)
    );
    console.log(`You are currently in ${curDir}`);
  } catch {
    console.log(`Operation failed`);
  }
}
async function runCommandMV(pathToFile, pathToNewDir) {
  await runCommandCP(pathToFile, pathToNewDir);
  await rm(pathToFile).catch(() => console.log(`Operation failed`));
}

async function runCommandRM(pathToFile) {
  if (!(await checkPath(pathToFile, false, true)))
    return console.log(`Invalid input`);
  await rm(pathToFile)
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}

async function runCommandHASH(pathToFile) {
  if (!(await checkPath(pathToFile, false, true)))
    return console.log(`Invalid input`);
  const fileContent = await readFile(pathToFile).catch(() =>
    console.log(`Operation failed`)
  );
  const hash = createHash(`sha256`).update(fileContent).digest(`hex`);
  console.log(`You are currently in ${curDir}\n`, hash);
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
    case 'cp':
      await runCommandCP(query.property1, query.property2);
      break;
    case 'mv':
      await runCommandMV(query.property1, query.property2);
      break;
    case 'rm':
      await runCommandRM(query.property1);
      break;
    case 'hash':
      await runCommandHASH(query.property1);
      break;
    default:
      console.log(`Invalid input`);
  }
}
process.on('exit', () =>
  console.log(
    `Thank you for using File Manager, ${username}, goodbye! ${os.EOL}`
  )
);

function runFM() {
  stdout.write(
    `Welcome to the File Manager, ${username}! ${os.EOL}You are currently in ${curDir} ${os.EOL}`
  );
  rl.on(`line`, handleLines);
}

runFM();
