const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Image Schema
const imageSchema = new mongoose.Schema({
  imageData: Buffer,
  imageType: String,
  imageName: String,
  caption: String,
});

const Image = mongoose.model('Image', imageSchema);

// API Endpoints
app.post('/upload', upload.single('image'), (req, res) => {
  const newImage = new Image({
    imageData: req.file.buffer,
    imageType: req.file.mimetype,
    imageName: req.file.originalname,
    caption: req.body.caption,
  });

  newImage.save((err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send('Image uploaded successfully');
  });
});

app.get('/images', (req, res) => {
  Image.find({}, (err, images) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(images);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
