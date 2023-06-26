import { homedir, EOL, cpus, userInfo } from 'os';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { getAbsolutePath, logDir } from './helpers.js';
import { join } from 'path';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';

import { createHash } from 'crypto';

class Navigate {
  constructor() {
    this.currDir = homedir();
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

  readFile(path) {
    if (!path) {
      logDir(this.currDir, '-------- Invalid input! --------');
      return;
    }
    const absolutePath = getAbsolutePath(this.currDir, path);

    const stream = createReadStream(absolutePath, 'utf-8');
    stream.pipe(process.stdout);

    stream.on('open', () => {
      console.log('');
    });

    stream.on('end', () => {
      console.log('');
      logDir(this.currDir);
    });

    stream.on('error', () => {
      logDir(this.currDir, '-------- ReadStream operation failed! --------');
    });
  }

  async addFile(fileName) {
    if (!fileName) {
      logDir(currDir, '-------- Invalid input! --------');
      return;
    }
    const filePath = getAbsolutePath(this.currDir, fileName);

    try {
      const fileHandle = await fs.open(filePath, 'w');
      await fileHandle.close();

      console.log(`\n${fileName} create in ${this.currDir}`);
      logDir(this.currDir);
    } catch (err) {
      logDir(this.currDir, '-------- Add operation failed! --------');
    }
  }

  async renameFile(filePath, newFileName) {
    if (!filePath || !newFileName) {
      logDir(this.currDir, '-------- Invalid input! --------');
      return;
    }

    const oldFilePath = getAbsolutePath(this.currDir, filePath);
    const newFilePath = getAbsolutePath(this.currDir, newFileName);

    try {
      await fs.rename(oldFilePath, newFilePath);
      logDir(this.currDir, `${oldFilePath} renamed to ${newFileName}`);
    } catch (err) {
      logDir(this.currDir, '-------- Rename operation failed! --------');
    }
  }

  async removeFile(path, message = true) {
    if (!path) {
      logDir(this.currDir, '-------- Invalid input! --------');
      return;
    }

    const filePath = getAbsolutePath(this.currDir, path);
    try {
      await fs.unlink(filePath);

      if (message) {
        logDir(this.currDir, `${filePath} removed`);
      }
    } catch (err) {
      logDir(this.currDir, '-------- Remove operation failed! --------');
    }
  }

  async mooveFile(filePath, pathToNewDirectory, toDelete = false) {
    if (!filePath || !pathToNewDirectory) {
      logDir(this.currDir, '-------- Invalid input! --------');
      return;
    }

    const oldFilePath = getAbsolutePath(this.currDir, filePath);
    const newDirectory = getAbsolutePath(this.currDir, pathToNewDirectory);

    const [fileName] = oldFilePath.split('\\').slice(-1);

    const readStream = createReadStream(oldFilePath, 'utf-8');

    const writeStream = createWriteStream(join(newDirectory, fileName));

    readStream.pipe(writeStream);

    readStream.on('error', () => {
      logDir(this.currDir, '-------- ReadStream operation failed! --------');
    });

    writeStream.on('finish', async () => {
      console.log('');
      if (toDelete === true) {
        await this.removeFile(oldFilePath, false);
        logDir(this.currDir, `${fileName} mooved to ${newDirectory}`);
      } else {
        logDir(this.currDir, `${fileName} copied to ${newDirectory}`);
      }
    });
    writeStream.on('error', () => {
      logDir(this.currDir, '-------- WriteStream operation failed! --------');
    });
  }

  os(command) {
    switch (command) {
      case '--homedir':
        console.log('__dirname: ', __dirname);
        logDir(this.currDir, `Homedir: ${homedir()}`);
        break;
      case '--EOL':
        logDir(this.currDir, `EOL: ${JSON.stringify(EOL)}`);
        break;
      case '--cpus':
        console.table(cpus());
        logDir(this.currDir);
        break;
      case '--username':
        const { username } = userInfo();
        logDir(this.currDir, `Username: ${username}`);
        break;
      case '--architecture':
        logDir(this.currDir, `Node.js CPU architecture: ${process.arch}`);
        break;
      default:
        logDir(this.currDir, '-------- Invalid input! --------');
        break;
    }
  }

  compress(pathToFile, pathToDestination) {
    if (!pathToFile || !pathToDestination) {
      logDir(this.currDir, '-------- Invalid input! --------');
      return;
    }
    const absolutePathToFile = getAbsolutePath(this.currDir, pathToFile);
    const [fileName] = absolutePathToFile
      .split('\\')
      .slice(-1)[0]
      .split('.')
      .slice(0, -1);

    const compressedPathToFile = join(
      getAbsolutePath(this.currDir, pathToDestination),
      `${fileName}.br`
    );

    const readStream = createReadStream(absolutePathToFile);
    const writeStream = createWriteStream(compressedPathToFile);

    const botliStream = createBrotliCompress();

    readStream.pipe(botliStream).pipe(writeStream);

    writeStream.on('finish', () => {
      logDir(this.currDir, `File compressed to ${compressedPathToFile}`);
    });

    writeStream.on('error', (err) => {
      logDir(this.currDir, '-------- WriteStream operation failed! --------');
    });
    readStream.on('error', (err) => {
      logDir(this.currDir, '-------- ReadStream operation failed! --------');
    });
  }

  decompress(pathToFile, pathToDestination) {
    if (!pathToFile || !pathToDestination) {
      logDir(this.currDir, '-------- Invalid input! --------');
      return;
    }
    const absolutePathToFile = getAbsolutePath(this.currDir, pathToFile);
    const [fileName] = absolutePathToFile
      .split('\\')
      .slice(-1)[0]
      .split('.')
      .slice(0, -1);

    const compressedPathToFile = join(
      getAbsolutePath(this.currDir, pathToDestination),
      `${fileName}.txt`
    );

    const readStream = createReadStream(absolutePathToFile);
    const writeStream = createWriteStream(compressedPathToFile);

    const botliStream = createBrotliDecompress();

    readStream.pipe(botliStream).pipe(writeStream);

    writeStream.on('finish', () => {
      logDir(this.currDir, `File decompressed to ${compressedPathToFile}`);
    });

    writeStream.on('error', (err) => {
      logDir(this.currDir, '-------- WriteStream operation failed! --------');
    });
    readStream.on('error', (err) => {
      logDir(this.currDir, '-------- ReadStream operation failed! --------');
    });
  }

  getHash(path) {
    if (!path) {
      logDir(this.currDir, '-------- Invalid input! --------');
      return;
    }

    const absolutePath = getAbsolutePath(this.currDir, path);
    const readStream = createReadStream(absolutePath);
    const hashAlgorithm = 'sha256';
    const hash = createHash(hashAlgorithm);

    readStream.on('data', (data) => {
      hash.update(data);
    });

    readStream.on('end', () => {
      const hashValue = hash.digest('hex');
      logDir(this.currDir, `Hash (${hashAlgorithm}): ${hashValue}`);
    });

    // Event handler for error
    readStream.on('error', (err) => {
      logDir(this.currDir, '-------- ReadStream operation failed! --------');
    });
  }
}

export default Navigate;
