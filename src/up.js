import { handleLines } from './app.js';

export async function runCommandUP() {
  await handleLines(`cd ..`);
}
