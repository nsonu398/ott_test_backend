// controllers/stream.controller.js
const fs = require('fs');
const path = require('path');

const videosDirectory = path.join(__dirname, '../videos');

// Updated streamVideo function
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
  }
  
  // Improved range handling
  if (range) {
    // Parse Range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    
    // Calculate a reasonable end position - capped at 2MB chunks for better seeking
    // This helps with faster seeking by limiting chunk size
    const end = parts[1] 
      ? parseInt(parts[1], 10) 
      : Math.min(start + 2000000, fileSize - 1); // 2MB chunks or end of file
    
    const chunksize = (end - start) + 1;
    
    // Set additional headers to improve seeking behavior
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Allow caching for 24 hours
      'X-Content-Type-Options': 'nosniff'
    };
    
    res.writeHead(206, headers);
    
    const file = fs.createReadStream(videoPath, { 
      start, 
      end,
      highWaterMark: 64 * 1024 // Increase buffer size for better performance
    });
    
    // Handle errors in the stream
    file.on('error', (err) => {
      console.error(`Error streaming file: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).send('Error streaming video');
      }
    });
    
    // Stream the file
    file.pipe(res);
  } else {
    // Handle requests without range header
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    });
    
    fs.createReadStream(videoPath, {
      highWaterMark: 64 * 1024 // Increase buffer size
    }).pipe(res);
  }
};


