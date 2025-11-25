// config/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ensure uploads folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// file filter: allow images and pdfs
const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpg", "image/jpeg", "image/gif", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only images and PDFs are allowed."), false);
};

// filename sanitizer: keep extension, prefix with timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
    const filename = `${Date.now()}_${base}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB per file
  },
});

export default upload;
export { UPLOAD_DIR };
