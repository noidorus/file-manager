import { isAbsolute, join } from 'path';

export const getAbsolutePath = (currDir, path) => {
  return isAbsolute(path) ? path : join(currDir, path);
};

export const logDir = (currDir, message) => {
  if (message) {
    console.log(`\n${message}`);
  }
  console.log('');
  console.log(`You are currently in ${currDir}`);
  process.stdout.write('~ ');
};
