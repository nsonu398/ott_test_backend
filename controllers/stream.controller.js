// controllers/stream.controller.js
const fs = require('fs');
const path = require('path');

const videosDirectory = path.join(__dirname, '../videos');

exports.streamVideo = (req, res) => {
  const { id } = req.params;
  const videosDir = path.join(videosDirectory);
  
  // Get all files in the directory
  const files = fs.readdirSync(videosDir);
  
  // Find a file that starts with the requested ID (regardless of extension)
  const videoFile = files.find(file => {
    // Match files that start with the ID followed by a dot
    return file.startsWith(`${id}.`);
  });
  
  // If no matching file found
  if (!videoFile) {
    return res.status(404).json({ message: 'Video not found' });
  }
  
  const videoPath = path.join(videosDirectory, videoFile);
  
  // Get video stats
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  // Determine MIME type based on file extension
  const fileExtension = path.extname(videoFile).toLowerCase();
  let contentType = 'video/mp4'; // Default content type
  
  // Set appropriate content type based on file extension
  switch(fileExtension) {
    case '.mp4':
      contentType = 'video/mp4';
      break;
    case '.webm':
      contentType = 'video/webm';
      break;
    case '.ogg':
      contentType = 'video/ogg';
      break;
    case '.mov':
      contentType = 'video/quicktime';
      break;
    case '.mkv':
      contentType = 'video/x-matroska';
      break;
    case '.avi':
      contentType = 'video/x-msvideo';
      break;
    case '.flv':
      contentType = 'video/x-flv';
      break;
    case '.wmv':
      contentType = 'video/x-ms-wmv';
      break;
    // Add more types as needed
  }
  
  if (range) {
    // Parse Range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    
    // Set appropriate headers for streaming
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    
    // Stream the file
    file.pipe(res);
  } else {
    // If no range header, send the whole file
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    });
    
    fs.createReadStream(videoPath).pipe(res);
  }
};