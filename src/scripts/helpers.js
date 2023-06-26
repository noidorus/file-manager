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

export const getUsername = (args) => {
  const [username] = args
    .filter((val) => val.includes('--username'))
    .map((val) => val.split('=')[1]);

  if (!username) {
    throw new Error(
      'You need to enter the username in the arguments in the format "--username=your_username"'
    );
  }
  return username;
};
