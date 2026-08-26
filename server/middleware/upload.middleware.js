// src/middleware/upload.middleware.js
//
// Handles multipart/form-data file uploads for listings (images + optional
// ownership documents). Files are saved to local disk under /uploads for now.
//
// IMPORTANT FOR LATER: local disk storage works fine on your own machine,
// but most hosting platforms (Render, Vercel, Heroku, etc.) wipe local files
// on every redeploy or don't support writing to disk at all. Before going
// live, swap this for cloud storage (e.g. AWS S3, Cloudinary) — only this
// file needs to change; nothing else in the app touches the filesystem
// directly.

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

function makeStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let subfolder = 'listings';
      if (file.fieldname === 'documents') subfolder = 'documents';
      if (file.fieldname === 'photo') subfolder = 'avatars';
      const destDir = path.join(process.cwd(), 'uploads', subfolder);
      if (!fs.existsSync(destDir)) {
        try {
          fs.mkdirSync(destDir, { recursive: true });
        } catch {}
      }
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

function imageFileFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for the "images" field'));
  }
}

function documentFileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Documents must be JPG, PNG, WEBP, or PDF'));
  }
}

// Used on the create/update listing routes. Accepts up to 10 images and
// up to 3 ownership documents in the same request.
const uploadListingFiles = multer({
  storage: makeStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'images') return imageFileFilter(req, file, cb);
    if (file.fieldname === 'documents') return documentFileFilter(req, file, cb);
    cb(new Error('Unexpected field: ' + file.fieldname));
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 3 },
]);

// Profile photo upload — single image, 2MB limit
const profilePhotoUpload = multer({
  storage: makeStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).single('photo');

module.exports = { uploadListingFiles, profilePhotoUpload };
