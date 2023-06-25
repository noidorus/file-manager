import { homedir } from 'os';
import { isAbsolute, join, resolve } from 'path';
import { promises as fs } from 'fs';
import { getAbsolutePath, logDir } from './helpers.js';

class Navigate {
  constructor() {
    this._currDir = homedir();
  }

  get currDir() {
    return this._currDir;
  }

  set currDir(val) {
    this._currDir = val;
  }

  goUp() {
    const splittedPath = this.currDir.split(`\\`);
    if (splittedPath.length > 1) {
      const newDir = splittedPath.slice(0, -1);
      if (newDir.length === 1) {
        this.currDir = `${newDir[0]}\\`;
      } else {
        this.currDir = newDir.join('\\');
      }
    }

    logDir(this.currDir);
  }

  async logList() {
    try {
      const files = await fs.readdir(this.currDir, { withFileTypes: true });

      const table = files.map((file) => {
        const data = { Name: file.name };

        if (file.isFile()) {
          data['Type'] = 'file';
        } else if (file.isDirectory()) {
          data['Type'] = 'directory';
        } else {
          data['Type'] = 'unknow type file';
        }

        return data;
      });
      console.table(table);

      logDir(this.currDir);
    } catch (err) {
      logDir(this.currDir, '-------- Operation failed! --------');
    }
  }

  async goTo(path) {
    if (!path) {
      logDir(this.currDir, '-------- Invalid input! --------');
      return;
    }

    try {
      const absolutePath = getAbsolutePath(this.currDir, path);

      await fs.stat(absolutePath);
      this.currDir = absolutePath;
      logDir(this.currDir);
    } catch (err) {
      logDir(this.currDir, '-------- Operation failed! --------');
    }
  }
}

export default Navigate;
