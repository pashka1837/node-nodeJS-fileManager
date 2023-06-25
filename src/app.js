import { argv, stdout, stdin } from 'node:process';
import * as readline from 'node:readline/promises';
import os from 'node:os';
import { util } from './utils.js';
import { handleData } from './handleData.js';
import { runCommandCD } from './cd.js';
import { runCommandUP } from './up.js';
import { runCommandLS } from './ls.js';
import { runCommandCAT } from './cat.js';
import { runCommandADD } from './add.js';
import { runCommandRM } from './rm.js';
import { runCommandRN } from './rn.js';
import { runCommandCP } from './cp.js';
import { runCommandMV } from './mv.js';
import { runCommandHASH } from './hash.js';
import { runCommandCOMPRESS } from './zip.js';
import { runCommandDECOMPRESS } from './unzip.js';
import { runCommandOS } from './os.js';

export const homeDir = util.changePathView(os.homedir());

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

export async function handleLines(data) {
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
    `Welcome to the File Manager, ${username}! ${os.EOL}You are currently in ${homeDir} ${os.EOL}`
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
