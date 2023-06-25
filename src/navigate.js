import { homedir } from 'os';
import { isAbsolute, join, resolve } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

class Navigate {
  constructor() {
    this.currDir = homedir();
    console.log(`You are currently in ${this.currDir}`);
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
    } catch (err) {
      throw err;
    }
  }

  async goTo(path) {
    if (!path) {
      console.log('-------- Invalid input! --------');
      return;
    }

    try {
      if (isAbsolute(path)) {
        await fs.stat(path, { withFileTypes: true });
        this.currDir = path;
      } else {
        const absolutePath = join(this.currDir, path);

        await fs.stat(absolutePath);
        // console.log('path: ', absolutePath);
        this.currDir = absolutePath;
      }
    } catch (err) {
      console.log('-------- Operation failed! --------');
    }
  }
}

export default Navigate;
