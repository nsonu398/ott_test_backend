// controllers/content.controller.js
const fs = require('fs');
const path = require('path');

const videosDirectory = path.join(__dirname, '../videos');

// Helper function to get video metadata
const getVideoMetadata = (filename) => {
  const id = path.parse(filename).name;
  const fileStats = fs.statSync(path.join(videosDirectory, filename));
  
  // Calculate duration (just a placeholder, would need a proper library for this)
  const fileSizeInMB = fileStats.size / (1024 * 1024);
  const estimatedDurationInMinutes = Math.round(fileSizeInMB / 5); // Rough estimate: 5MB per minute
  
  return {
    id,
    title: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '), // Convert filename to title
    description: `This is a video about ${id.replace(/_/g, ' ')}.`,
    poster_url: `https://api.ott.chandrasekharsahu.com:3000/thumbnails/${id}.jpg`,
    backdrop_url: `https://api.ott.chandrasekharsahu.com:3000/thumbnails/${id}.jpg`,
    video_url: `/api/stream/${id}`,
    rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3 and 5
    release_year: 2023,
    categories: ["Entertainment"],
    duration: `${estimatedDurationInMinutes} min`,
    is_original: false,
    trailer_url: null,
    maturity_rating: "All",
    is_premium: false
  };
};

exports.getAllVideos = (req, res) => {
  try {
    const allowedExtensions = ['.mp4', '.avi', '.mkv'];

    const videoFiles = fs.readdirSync(videosDirectory)
      .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()));
    
    const videos = videoFiles.map(file => getVideoMetadata(file));
    
    res.json({ data: videos });
  } catch (error) {
    console.error('Error getting all videos:', error);
    res.status(500).json({ message: 'Error retrieving videos' });
  }
};

exports.getVideoById = (req, res) => {
  try {
    const { id } = req.params;
    const videoFileName = `${id}.mp4`;
    const videoPath = path.join(videosDirectory, videoFileName);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const videoMetadata = getVideoMetadata(videoFileName);
    
    res.json({ data: videoMetadata });
  } catch (error) {
    console.error('Error getting video by ID:', error);
    res.status(500).json({ message: 'Error retrieving video' });
  }
};