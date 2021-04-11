import path from 'path'
import express from 'express'
import fs from 'fs'

const app = express()

let pngHeader
const fd = fs.createReadStream(path.join(__dirname, 'files', 'ok.png'))
fd.on('data', (data) => {
  if (!pngHeader) {
    pngHeader = data
  }
})

const bloat = Buffer.alloc(10 * 1024)

app.get('/stream-bomb', (req, res) => {
  res.header('content-type', 'image/png')
  res.header('transfer-encoding', 'chunked')
  res.writeHead(200)

  res.write(pngHeader)

  // Send garbage until the client closes the connection
  const sendBloat = () => {
    while (res.write(bloat));
  }

  sendBloat()
  res.socket.on('drain', sendBloat)
})

app.get('/empty', (req, res) => {
  res.header('content-type', 'image/png')
  res.header('transfer-encoding', 'chunked')
  res.writeHead(200)
  res.end()
})

app.use('/', express.static(path.join(__dirname, 'files')))

const server = app.listen(27273, () => {})

module.exports = server
