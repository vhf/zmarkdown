"use strict";

const FileType = require('file-type');

const fs = require('fs');

const isSvg = require('is-svg');

const path = require('path');

const {
  promisify
} = require('util');

const http = require('http');

const https = require('https');

const shortid = require('shortid');

const visit = require('unist-util-visit');

const rimraf = require('rimraf');

const {
  Transform
} = require('stream');

const isImage = headers => {
  return headers['content-type'].substring(0, 6) === 'image/';
};

const getSize = (headers = {}) => {
  const size = parseInt(headers['content-length'], 10);

  if (Number.isNaN(size)) {
    return 0;
  }

  return size;
};

const mkdir = path => new Promise((resolve, reject) => {
  fs.mkdir(path, err => {
    if (err) reject(new Error(`Failed to create dir ${path}`));
    resolve();
  });
});

const checkFileType = async (name, data) => {
  if (!data.length) {
    throw new Error(`Empty file: ${name}`);
  }

  return FileType.fromBuffer(data).catch(() => {}).then((type = {
    mime: ''
  }) => {
    if (!type.mime || type.mime === 'application/xml') {
      if (!isSvg(data.toString())) {
        return Promise.reject(new Error(`Could not detect ${name} mime type, not SVG either`));
      }
    } else if (type.mime.slice(0, 6) !== 'image/') {
      return Promise.reject(new Error(`Detected mime of local file '${name}' is not an image/ type`));
    }

    return Promise.resolve();
  });
}; // Creates a Transform stream which raises an error if the file type
// is wrong or if the file is not a image.


const makeValidatorStream = (fileName, maxSize) => {
  let firstChunk = true;
  let totalSize = 0;
  return new Transform({
    flush(cb) {
      if (totalSize === 0) {
        cb(new Error(`File at ${fileName} is empty`));
        return;
      }

      cb(null);
    },

    transform(chunk, encoding, cb) {
      totalSize += chunk.length;

      if (maxSize && maxSize < totalSize) {
        cb(new Error(`File at ${fileName} weighs more than ${maxSize}`));
        return;
      }

      if (firstChunk) {
        checkFileType(fileName, chunk).then(() => {
          firstChunk = false;
          cb(null, chunk);
        }).catch(error => {
          cb(error);
        });
      } else {
        cb(null, chunk);
      }
    }

  });
};

const checkAndCopy = async (from, to) => {
  const data = await promisify(fs.readFile)(from);
  await checkFileType(from, data);

  try {
    await promisify(fs.copyFile)(from, to);
  } catch (err) {
    throw new Error(`Failed to copy ${from} to ${to}`);
  }
};

function plugin({
  disabled = false,
  maxFileSize = 1000000,
  dirSizeLimit = 10000000,
  downloadDestination = '/tmp',
  defaultImagePath = false,
  defaultOn = {
    statusCode: false,
    mimeType: false,
    fileTooBig: false
  },
  localUrlToLocalPath,
  httpRequestTimeout = 5000 // in milliseconds

} = {}) {
  // Sends an HTTP request, checks headers and resolves a readable stream
  // if headers are valid.
  // Rejects with an error if headers are invalid.
  const initDownload = url => new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const proto = parsedUrl.protocol === 'https:' ? https : http;
    const options = Object.assign({}, parsedUrl, {
      timeout: httpRequestTimeout
    });
    const req = proto.get(options, res => {
      const {
        headers,
        statusCode
      } = res;
      let error;
      const fileSize = getSize(headers);

      if (statusCode !== 200) {
        error = new Error(`Received HTTP${statusCode} for: ${url}`);
        error.replaceWithDefault = defaultOn && defaultOn.statusCode;
      } else if (!isImage(headers)) {
        error = new Error(`Content-Type of ${url} is not an image/ type`);
        error.replaceWithDefault = defaultOn && defaultOn.mimeType;
      } else if (maxFileSize && fileSize > maxFileSize) {
        error = new Error(`File at ${url} weighs ${headers['content-length']}, ` + `max size is ${maxFileSize}`);
        error.replaceWithDefault = defaultOn && defaultOn.fileTooBig;
      }

      if (error) {
        req.abort();
        res.resume();
        reject(error);
        return;
      }

      resolve(res);
    });
    req.on('timeout', () => {
      req.abort();
      reject(new Error(`Request for ${url} timed out`));
    });
    req.on('error', err => reject(err));
  });

  const downloadAndSave = (node, sourceUrl, httpResponse, destinationPath) => new Promise((resolve, reject) => httpResponse.on('error', function (error) {
    reject(error);
    httpResponse.destroy(error);
  }).pipe(makeValidatorStream(sourceUrl, maxFileSize)).on('error', function (error) {
    reject(error);
    httpResponse.destroy(error);
  }).pipe(fs.createWriteStream(destinationPath)).on('error', function (error) {
    reject(error);
    httpResponse.destroy(error);
  }).on('close', e => {
    resolve();
  }));

  const doDownloadTasks = async tasks => {
    await Promise.all(tasks.map(task => initDownload(task.url).then(res => {
      task.res = res;
    }, error => {
      task.error = error;
    })));

    if (dirSizeLimit) {
      let totalSize = 0;

      for (const task of tasks) {
        if (task.error) {
          continue;
        }

        const fileSize = getSize(task.res.headers);

        if (totalSize + fileSize >= dirSizeLimit) {
          const e = new Error(`Cannot download ${task.url} because destination ` + 'directory reached size limit');
          task.error = e;
          task.res.destroy(e);
        } else {
          totalSize += fileSize;
        }
      }
    }

    await Promise.all(tasks.map(task => {
      if (!task.error) {
        return downloadAndSave(task.node, task.url, task.res, task.destination).catch(error => {
          task.error = error;
        });
      } else {
        return null;
      }
    }));
  };

  const doLocalCopyTasks = tasks => Promise.all(tasks.map(task => {
    if (task.localSourcePath.includes('../')) {
      task.error = new Error(`Dangerous absolute image URL detected: ${task.localSourcePath}`);
      return null;
    }

    return checkAndCopy(task.localSourcePath, task.destination).catch(error => {
      task.error = error;
    });
  }));

  return async function transform(tree, vfile) {
    if (disabled) return; // images are downloaded to destinationPath

    const destinationPath = path.join(downloadDestination, shortid.generate()); // allow to fallback when image is not found

    const defaultImageDestination = defaultImagePath ? path.join(downloadDestination, defaultImagePath) : false;
    let downloadTasks = [];
    let localCopyTasks = [];
    visit(tree, 'image', async node => {
      const {
        url,
        position
      } = node; // Empty URL make nasty error messages, so ignore them

      if (!url) {
        vfile.message('URL is empty', position);
        return;
      }

      let parsedURI;

      try {
        parsedURI = new URL(url);
      } catch (error) {
        vfile.message(`Invalid URL: ${url}`, position, url);
        return;
      }

      const extension = path.extname(parsedURI.pathname);
      const filename = `${shortid.generate()}${extension}`;
      const destination = path.join(destinationPath, filename);

      if (!parsedURI.host) {
        let localPath;

        if (typeof localUrlToLocalPath === 'function') {
          localPath = localUrlToLocalPath(url);
        } else if (Array.isArray(localUrlToLocalPath) && localUrlToLocalPath.length === 2) {
          const [from, to] = localUrlToLocalPath;
          localPath = url.replace(new RegExp(`^${from}`), to);
        } else {
          return;
        }

        localCopyTasks.push({
          node,
          url,
          destination,
          localSourcePath: localPath
        });
        return;
      }

      if (!['http:', 'https:'].includes(parsedURI.protocol)) {
        vfile.message(`Protocol '${parsedURI.protocol}' not allowed.`, position, url);
        return;
      }

      downloadTasks.push({
        node,
        url,
        destination
      });
    }); // Group by URL in order to download each file only once

    const groupTasksByUrl = tasks => {
      const map = new Map();

      for (const task of tasks) {
        const otherTasks = map.get(task.url) || [];
        map.set(task.url, otherTasks.concat([task]));
      }

      return Array.from(map.values()).map(taskGroup => Object.assign({}, taskGroup[0], {
        nodes: taskGroup.map(t => t.node)
      }));
    };

    downloadTasks = groupTasksByUrl(downloadTasks);
    localCopyTasks = groupTasksByUrl(localCopyTasks);
    const tasks = downloadTasks.concat(localCopyTasks);

    if (!tasks.length) {
      return tree;
    }

    let successfulTasks = [];
    await mkdir(destinationPath);

    try {
      await Promise.all([doDownloadTasks(downloadTasks), doLocalCopyTasks(localCopyTasks)]);
      const failedTasks = tasks.filter(t => t.error);
      successfulTasks = tasks.filter(t => !t.error);

      for (const task of failedTasks) {
        for (const node of task.nodes) {
          // mutates the AST even in case of error if requested
          if (defaultImageDestination && task.error.replaceWithDefault) {
            node.url = defaultImageDestination;
          }

          vfile.message(task.error, node.position, task.url);
        }
      }

      for (const task of successfulTasks) {
        for (const node of task.nodes) {
          // mutates the AST!
          node.url = task.destination;
        }
      }
    } catch (err) {
      vfile.message(err);
      await promisify(rimraf)(destinationPath);
    }

    if (successfulTasks.length) {
      vfile.data.imageDir = destinationPath;
    } else {
      await promisify(rimraf)(destinationPath);
    }

    return tree;
  };
}

module.exports = plugin;