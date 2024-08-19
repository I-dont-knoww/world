// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework

import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

export const MIME_TYPES = {
    default: 'application/octet-stream',
    html: 'text/html; charset=UTF-8',
    js: 'application/javascript',
    mjs: 'application/javascript',
    css: 'text/css',
    png: 'image/png',
    jpg: 'image/jpg',
    gif: 'image/gif',
    ico: 'image/x-icon',
    svg: 'image/svg+xml'
};


const toBool = [() => true, () => false];

async function prepareFile(url, relativeStaticPath) {
    const staticPath = path.join(process.cwd(), relativeStaticPath);

    const paths = [staticPath, url];
    if (url.endsWith('/')) paths.push('index.html');

    const filePath = path.join(...paths);

    const pathTraversal = !filePath.startsWith(staticPath);
    const exists = await fs.promises.access(filePath).then(...toBool);
    const found = !pathTraversal && exists;

    const streamPath = found ? filePath : staticPath + '/404.html';
    const ext = path.extname(streamPath).substring(1).toLowerCase();
    const stream = fs.createReadStream(streamPath);

    return { found, ext, stream };
}

/**
 * @param {string} relativeStaticPath
 * @param {number} port
 * @returns {http.Server}
 */
export default function FileServer(relativeStaticPath, port) {
    return http.createServer(async function (req, res) {
        const file = await prepareFile(req.url, relativeStaticPath);
        const statusCode = file.found ? 200 : 404;
        const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;

        res.writeHead(statusCode, { 'Content-Type': mimeType });
        file.stream.pipe(res);
    }).listen(port);
}