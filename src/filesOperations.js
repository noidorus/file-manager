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
      logDir(currDir, '-------- Operation failed! --------');
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
      logDir(currDir, '-------- Operation failed! --------');
    }
  }

  async mooveFile(currDir, filePath, pathToNewDirectory) {
    if (!filePath || !pathToNewDirectory) {
      logDir(currDir, '-------- Invalid input! --------');
      return;
    }
  }

  async copyFile(currDir, filePath, pathToNewDirectory) {
    if (!filePath || !pathToNewDirectory) {
      logDir(currDir, '-------- Invalid input! --------');
      return;
    }

    const oldFilePath = getAbsolutePath(currDir, filePath);
    const newDirectory = getAbsolutePath(currDir, pathToNewDirectory);

    const [fileName] = oldFilePath.split('\\').slice(-1);

    const readStream = createReadStream(oldFilePath, 'utf-8');

    const writeStream = createWriteStream(join(newDirectory, fileName));

    readStream.pipe(writeStream);

    readStream.on('error', () => {
      logDir(currDir, '-------- ReadStream operation failed! --------');
    });

    readStream.on('end', () => {
      console.log('');
      logDir(currDir, `${fileName} copied to ${newDirectory}`);
    });

    writeStream.on('error', () => {
      logDir(currDir, '-------- WriteStream operation failed! --------');
    });
  }
}

export default FilesOperations;
