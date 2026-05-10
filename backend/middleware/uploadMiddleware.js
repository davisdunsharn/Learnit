const multer = require('multer');

// store the file in memory as a buffer — we send it straight to OCR.space
// no need to save it to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max — OCR.space free tier limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
    }

    cb(null, true);
  }
});

module.exports = upload;