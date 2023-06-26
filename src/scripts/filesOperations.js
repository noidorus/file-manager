import { promises as fs, createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { stdout } from 'process';
import { getAbsolutePath, logDir } from './helpers.js';

class FilesOperations {
  readFile(currDir, path) {
    if (!path) {
      logDir(currDir, '-------- Invalid input! --------');
      return;
    }
    const absolutePath = getAbsolutePath(currDir, path);

    const stream = createReadStream(absolutePath, 'utf-8');
    stream.pipe(process.stdout);

    stream.on('open', () => {
      console.log('');
    });

    stream.on('end', () => {
      console.log('');
      logDir(currDir);
    });

    stream.on('error', (err) => {
      logDir(currDir, '-------- ReadStream operation failed! --------');
    });
  }

  async addFile(currDir, fileName) {
    if (!fileName) {
      logDir(currDir, '-------- Invalid input! --------');
      return;
    }

    const filePath = join(currDir, fileName);

    try {
      const fileHandle = await fs.open(filePath, 'w');
      await fileHandle.close();

      console.log(`\n${fileName} create in ${currDir}`);
      logDir(currDir);
    } catch (err) {
      logDir(currDir, '-------- Add operation failed! --------');
    }
  }

  async renameFile(currDir, filePath, newFileName) {
    if (!filePath || !newFileName) {
      logDir(currDir, '-------- Invalid input! --------');
      return;
    }

    const oldFilePath = getAbsolutePath(currDir, filePath);
    const newFilePath = getAbsolutePath(currDir, newFileName);

    try {
      await fs.rename(oldFilePath, newFilePath);
      logDir(currDir, `${oldFilePath} renamed to ${newFileName}`);
    } catch (err) {
      logDir(currDir, '-------- Rename operation failed! --------');
    }
  }

  async removeFile(currDir, path, message = true) {
    if (!path) {
      logDir(currDir, '-------- Invalid input! --------');
    }

    const filePath = getAbsolutePath(currDir, path);
    try {
      await fs.unlink(filePath);

      if (message) {
        logDir(currDir, `${filePath} removed`);
      }
    } catch (err) {
      logDir(currDir, '-------- Remove operation failed! --------');
    }
  }

  async mooveFile(currDir, filePath, pathToNewDirectory, toDelete = false) {
    if (!filePath || !pathToNewDirectory) {
      logDir(currDir, '-------- Invalid input! --------');
      return;
      // mv test\test2.md C:\Users\huffpuff\test
    }

    const oldFilePath = getAbsolutePath(currDir, filePath);
    const newDirectory = getAbsolutePath(currDir, pathToNewDirectory);

    console.log('oldFilePath: ', oldFilePath);
    console.log('newDirectory: ', newDirectory);

    const [fileName] = oldFilePath.split('\\').slice(-1);

    const readStream = createReadStream(oldFilePath, 'utf-8');

    const writeStream = createWriteStream(join(newDirectory, fileName));

    readStream.pipe(writeStream);

    readStream.on('error', () => {
      logDir(currDir, '-------- ReadStream operation failed! --------');
    });

    readStream.on('end', async () => {
      console.log('');
      if (toDelete === true) {
        await this.removeFile(currDir, oldFilePath, false);

        logDir(currDir, `${fileName} mooved to ${newDirectory}`);
      } else {
        logDir(currDir, `${fileName} copied to ${newDirectory}`);
      }
    });

    writeStream.on('error', () => {
      logDir(currDir, '-------- WriteStream operation failed! --------');
    });
  }
}

export default FilesOperations;
