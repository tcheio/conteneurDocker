const express = require('express');
const app = express();
const promBundle = require("express-prom-bundle");
const path = require('path');
const fs = require('fs');
const { log } = require('console');

const posters = process.env.POSTER_DIR;

if (typeof posters !== 'string') {
  console.error('The POSTER_DIR environment variable is not defined or is not a string.');
  process.exit(1);
}

const moviesFolderPath = path.join(__dirname, posters);
console.log(moviesFolderPath);

const metricsMiddleware = promBundle({
    includeMethod: true, 
    includePath: true, 
    includeStatusCode: true, 
    includeUp: true,
    customLabels: {project_name: 'posters', project_type: 'test_metrics_labels'},
    promClient: {
        collectDefaultMetrics: {
        }
      }
});
// add the prometheus middleware to all routes
app.use(metricsMiddleware)



// Endpoint to return a list of movie files in the 'movies' folder
app.get('/movies', (req, res) => {
  fs.readdir(moviesFolderPath, (err, movieFiles) => {
    if (err) {
      console.error('Error reading folder:', err);
      res.status(500).json({ error: 'Error reading folder' });
      return;
    }

    res.json(movieFiles);
  });
});

// Serve movie posters from the 'movies' directory
app.use('/movies', express.static(moviesFolderPath));

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});