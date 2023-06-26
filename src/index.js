import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

import Navigate from './scripts/navigate.js';
import FilesOperations from './scripts/filesOperations.js';
import { logDir } from './scripts/helpers.js';

class FileManager {
  constructor() {
    this.navigate = new Navigate();
    this.files = new FilesOperations();
    this.username = getUsername();
  }

  start() {
    this.initApp();
  }

  initApp() {
    const { username, navigate } = this;

    console.log(`Welcome to the File Manager, ${username}!`);
    logDir(navigate.currDir);

    process.stdin.on('data', (buffer) => {
      const data = buffer.toString().trim();

      if (buffer.includes('.exit')) {
        process.exit();
      } else {
        this.validateData(data);
      }
    });

    process.on('SIGINT', () => {
      process.exit();
    });

    process.on('exit', () =>
      console.log(`\n\nThank you for using File Manager, ${username}, goodbye`)
    );
  }

  async validateData(data) {
    const [comand, ...args] = data.split(' ');
    const { navigate, files } = this;

    switch (comand) {
      case 'up':
        navigate.goUp();
        break;
      case 'cd':
        await navigate.goTo(args[0]);
        break;
      case 'ls':
        await navigate.logList();
        break;
      case 'cat':
        files.readFile(navigate.currDir, args[0]);
        break;
      case 'add':
        files.addFile(navigate.currDir, args[0]);
        break;
      case 'rn':
        files.renameFile(navigate.currDir, args[0], args[1]);
        break;
      case 'cp':
        files.mooveFile(navigate.currDir, args[0], args[1]);
        break;
      case 'mv':
        files.mooveFile(navigate.currDir, args[0], args[1], true);
        break;
      case 'rm':
        files.removeFile(navigate.currDir, args[0], true);
        break;
      default:
        logDir(navigate.currDir, '-------- Invalid input! --------');
        break;
    }
  }
}

function getUsername() {
  const [username] = process.argv
    .slice(2)
    .filter((val) => val.includes('--username'))
    .map((val) => val.split('=')[1]);

  if (!username) {
    throw new Error(
      'You need to enter the username in the arguments in the format "--username=your_username"'
    );
  }
  return username;
}

const fileManager = new FileManager();
fileManager.start();
