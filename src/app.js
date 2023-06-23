import { readdir, readFile, appendFile, rename, rm } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { argv, stdout, stdin } from 'node:process';
import { createGzip, createUnzip } from 'node:zlib';
import * as readline from 'node:readline/promises';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'path';
import { util } from './utils.js';

const homeDir = util.changePathView(os.homedir());
let curDir = homeDir;
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  removeHistoryDuplicates: true,
  historySize: 4,
});

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
  if (commands.length > 3) return false;
  console.log(commands);
  const query = {};
  if (commands.length > 1) {
    commands.slice(1).forEach((command, i) => {
      query[`property${i + 1}`] = util.changePathView(
        path.resolve(`${curDir}`, `${command}`)
      );
    });
  }
  query.command = commands[0];
  return query;
}

async function runCommandCD(pathToDir) {
  console.log(`in cd`, pathToDir);
  if (!(await util.isDir(pathToDir))) return console.log(`Invalid input`);
  process.chdir(pathToDir);
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

async function runCommandCAT(pathToFile) {
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  const readStream = createReadStream(pathToFile);
  let str = ``;
  for await (const chunk of readStream) str += chunk;
  console.log(`You are currently in ${curDir}\n${str}\n`);
}

async function runCommandADD(pathToFile) {
  if (await util.isExists(pathToFile))
    return console.log(`File already exists`);
  await appendFile(pathToFile, '')
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}

async function runCommandRN(pathToOldFile, pathToNewFile) {
  if (!(await util.isExists(pathToOldFile)))
    return console.log(`Invalid input`);
  if (await util.isExists(pathToNewFile))
    return console.log(`File with this name is already exists`);
  await rename(pathToOldFile, pathToNewFile)
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}

async function runCommandCP(pathToFile, pathToNewDir) {
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  if (!(await util.isDir(pathToNewDir))) return console.log(`Invalid input`);
  const fileName = pathToFile.split('/').pop();
  if (await util.isFile(`${pathToNewDir}/${fileName}`))
    return console.log(`File with this name is already exists`);
  try {
    await pipeline(
      createReadStream(pathToFile),
      createWriteStream(`${pathToNewDir}/${fileName}`)
    );
    console.log(`You are currently in ${curDir}`);
    return true;
  } catch {
    console.log(`Operation failed`);
    return false;
  }
}
async function runCommandMV(pathToFile, pathToNewDir) {
  (await runCommandCP(pathToFile, pathToNewDir)) &&
    (await rm(pathToFile).catch(() => console.log(`Operation failed`)));
}

async function runCommandRM(pathToFile) {
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  await rm(pathToFile)
    .then(() => console.log(`You are currently in ${curDir}`))
    .catch(() => console.log(`Operation failed`));
}

async function runCommandHASH(pathToFile) {
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  const fileContent = await readFile(pathToFile).catch(() =>
    console.log(`Operation failed`)
  );
  const hash = createHash(`sha256`).update(fileContent).digest(`hex`);
  console.log(`You are currently in ${curDir}\n`, hash);
}
async function handleZIP(from, to, kindOfZip) {
  try {
    await pipeline(createReadStream(from), kindOfZip, createWriteStream(to));
    console.log(`You are currently in ${curDir}`);
  } catch {
    console.log(`Operation failed`);
  }
}

async function runCommandCOMPRESS(pathToFile, pathToDest, unzip = false) {
  if (!(await util.isFile(pathToFile))) return console.log(`Invalid input`);
  let fileName = `${pathToFile.split('/').pop().split('.')[0]}`;
  let zip;
  if (unzip) {
    zip = createUnzip();
    fileName += '.txt';
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

async function runCommandDECOMPRESS(pathToFile, pathToDest) {
  await runCommandCOMPRESS(pathToFile, pathToDest, true);
}

async function runCommandOS(data) {
  const commands = data
    .toLowerCase()
    .split(` `)
    .filter((command) => command !== ``);
  if (!commands[1] || commands.length > 2) return console.log(`Invalid input`);
  switch (commands[1]) {
    case '--eol':
      console.log(os.EOL);
      break;
    case '--cpus':
      console.log(os.cpus());
      break;
    case '--homedir':
      console.log(homeDir);
      break;
    case '--username':
      try {
        const user = os.userInfo().username;
        console.log(user);
      } catch {
        console.log(`No user detected`);
      }
      break;
    case '--architecture':
      console.log(os.arch());
      break;
    default:
      console.log(`Invalid input`);
  }
}

async function handleLines(data) {
  const query = handleData(data);
  if (query.command === `.exit`) return rl.close();
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
    case 'compress':
      await runCommandCOMPRESS(query.property1, query.property2);
      break;
    case 'decompress':
      await runCommandDECOMPRESS(query.property1, query.property2);
      break;
    case 'os':
      await runCommandOS(data);
      break;
    default:
      console.log(`Invalid input`);
  }
}

async function runFM() {
  const username = getUserName(argv);
  console.log(
    `Welcome to the File Manager, ${username}! ${os.EOL}You are currently in ${curDir} ${os.EOL}`
  );
  process.chdir(homeDir);
  for await (const line of rl) handleLines(line);
  process.on('exit', () =>
    console.log(
      `Thank you for using File Manager, ${username}, goodbye! ${os.EOL}`
    )
  );
}

await runFM();
