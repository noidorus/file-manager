import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

import Navigate from './navigate.js';

class FileManager {
  constructor() {
    this.navigate = new Navigate();
    this.username = getUsername();
  }

  initApp() {
    console.log(`Welcome to the File Manager, ${this.username}!`);
    process.stdout.write('Hi write your command: ');

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
      console.log(`Thank you for using File Manager, ${this.username}, goodbye`)
    );
  }

  start() {
    this.initApp();
  }

  async validateData(data) {
    const [comand, ...args] = data.split(' ');

    switch (comand) {
      case 'up':
        this.navigate.goUp();
        break;
      case 'cd':
        await this.navigate.goTo(args[0]);
        break;
      case 'ls':
        await this.navigate.logList();
        break;
      default:
        console.log('-------- Invalid input! --------');
        break;
    }

    console.log('');
    console.log(`You are currently in ${this.navigate.currDir}`);
    console.log('');
    process.stdout.write('Write your command: ');
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
