import os from 'node:os';
import { homeDir } from './app.js';

export async function runCommandOS(data) {
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
