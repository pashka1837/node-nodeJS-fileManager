import path from 'path';
import { util } from './utils.js';

export function handleData(data) {
  const curDir = util.changePathView(process.cwd());
  if (!data) return false;
  const commands = data
    .toLowerCase()
    .split(` `)
    .filter((command) => command !== ``);
  if (commands.length > 3) return false;
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
