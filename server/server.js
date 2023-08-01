const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uploader = require('express-fileupload');
const {
  writeFileSync,
  appendFileSync,
  existsSync,
  createReadStream
} = require('fs');
const {
  resolve
} = require('path');

const PORT = 8888;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(uploader());
app.use('/', express.static('tempFile'));

app.all('*', (req, res, next) => {
  res.header('Access-Control-ALlow-Origin', '*'); // 允许跨域
  res.header('Access-Control-Allow-Methods', 'POST,GET');
  next();
});

app.listen(PORT, () => {
  console.log('server is running' + PORT);
});

/**
 * 文件上传
 */
app.post('/upload', (req, res) => {
  const {name, size, fileName, type, uploadSize} = req.body;
  // 指定文件存放路径
  const filePath = resolve(__dirname, './tempFile/' + fileName);
  const {file} = req.files;
  if (Number(req.body.uploadSize) === 0) {
    writeFileSync(filePath, file.data);
    res.send({
      msg: 'Create file',
      code: 200,
      data: {
        url: 'http://localhost:8888/' + fileName
      }
    });
    return;
  }
  if (existsSync(filePath)) {
    appendFileSync(filePath, file.data);
    res.send({
      msg: 'Append file',
      code: 200,
      data: {
        url: 'http://localhost:8888/' + fileName
      }
    });
    return;
  }
});

/**
 * 文件下载
 */
app.post('/download', (req, res) => {
  // 文件路径
  const filePath = resolve(__dirname, './tempFile/test.mp4');
  // 转换为流
  let readStream = createReadStream(filePath);
  // 设置返回类型
  res.writeHead(200, {
    'Content-Type': 'video/mp4'
  })
  readStream.pipe(res);
});