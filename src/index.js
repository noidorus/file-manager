import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

import Controller from './scripts/controller.js';
import { getUsername, logDir } from './scripts/helpers.js';

class FileManager {
  constructor() {
    this.controller = new Controller();
    this.username = getUsername(process.argv.slice(2));
  }

  initApp() {
    const { username, controller } = this;

    console.log(`Welcome to the File Manager, ${username}!`);
    logDir(controller.currDir);

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

  start() {
    this.initApp();
  }

  async validateData(data) {
    const [comand, ...args] = data.split(' ');
    const { controller } = this;

    switch (comand) {
      case 'up':
        controller.goUp();
        break;
      case 'cd':
        await controller.goTo(args[0]);
        break;
      case 'ls':
        await controller.logList();
        break;
      case 'cat':
        controller.readFile(args[0]);
        break;
      case 'add':
        controller.addFile(args[0]);
        break;
      case 'rn':
        controller.renameFile(args[0], args[1]);
        break;
      case 'cp':
        controller.mooveFile(args[0], args[1]);
        break;
      case 'mv':
        controller.mooveFile(args[0], args[1], true);
        break;
      case 'rm':
        controller.removeFile(args[0], true);
        break;
      case 'os':
        controller.os(args[0]);
        break;
      case 'compress':
        controller.compress(args[0], args[1]);
        break;
      case 'decompress':
        controller.decompress(args[0], args[1]);
        break;
      case 'hash':
        controller.getHash(args[0]);
        break;
      default:
        logDir(controller.currDir, '-------- Invalid input! --------');
        break;
    }
  }
}

const fileManager = new FileManager();
fileManager.start();
