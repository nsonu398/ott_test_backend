// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const https = require('https');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3000;

// SSL certificate paths
const privateKey = fs.readFileSync('./certs/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./certs/cert.pem', 'utf8');
const ca = fs.readFileSync('./certs/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Middleware
app.use(cors({
  origin: ['https://ott.chandrasekharsahu.com', 
    'https://ott-web-ff562.web.app', 
    'https://ott-web-ff562.firebaseapp.com', 
    'http://localhost:52862'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the videos directory
app.use('/thumbnails', express.static(path.join(__dirname, 'videos')));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server',
  });
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start both servers
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});

// Optional: HTTP server that redirects to HTTPS
// app.listen(PORT, () => {
//   console.log(`HTTP Server running on port ${PORT}`);
// });