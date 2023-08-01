const input = document.querySelector('#uploadFile');
const uploadBtn = document.querySelector('#uploadBtn');
const downloadBtn = document.querySelector('#downloadBtn');
const baseUrl = 'http://localhost:8888';

const chunkSize = 1000000;

async function bindEvent() {
  uploadBtn.addEventListener('click', upload);
  downloadBtn.addEventListener('click', loadFileStream);
}

/**
 * 切片上传文件
 */
async function upload() {
  let result = null;
  const {files: [file]} = input;
  const name = file.name;
  const size = file.size;
  const type = file.type;
  const fileName = new Date().getTime() + '_' + file.name;
  let uploadSize = 0;
  while(uploadSize < size) {
    try {
      const formData = new FormData();
      const fileChunk = file.slice(uploadSize, uploadSize + chunkSize);
      formData.append('name', name);
      formData.append('size', size);
      formData.append('type', type);
      formData.append('fileName', fileName);
      formData.append('file', fileChunk);
      formData.append('uploadSize', uploadSize);
      result = await axios.post(baseUrl + '/upload', formData);
      uploadSize = uploadSize + chunkSize;
    } catch (error) {
      
    }
  }
  createVideo(result.data.data);
}

/**
 * 获取文件流
 */
async function loadFileStream() {
  const config = {
    responseType: 'blob'
  }
  const result = await axios.post(baseUrl + '/download', null, config);
  // 文件名需要指定后缀名
  const fileName = new Date().getTime() + '_' + 'video.mp4';
  downloadFile(result.data, fileName);
}

/**
 * 下载文件
 * 
 * @param {*} data 
 * @param {*} fileName 
 */
function downloadFile(data, fileName) {
  const blob = new Blob([data]);
  const a = document.createElement('a');
  const href = window.URL.createObjectURL(blob);
  a.href = href;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(href);
}

function createVideo(data) {
  const video = document.createElement('video');
  video.controls = true;
  video.width = 500;
  video.src = data.url;
  document.body.appendChild(video);
}

bindEvent();