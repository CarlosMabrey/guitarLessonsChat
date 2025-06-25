import formidable, { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

const TEMP_IMG_DIR = path.join(process.cwd(), 'src', 'lib', 'db', 'tempImg');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle image upload
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data.' });
      }
      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      const uploadedFile = Array.isArray(file) ? file[0] : file;
      const ext = path.extname(uploadedFile.originalFilename || uploadedFile.newFilename || uploadedFile.name || '');
      const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      if (!fs.existsSync(TEMP_IMG_DIR)) {
        fs.mkdirSync(TEMP_IMG_DIR, { recursive: true });
      }
      const destPath = path.join(TEMP_IMG_DIR, safeName);
      try {
        fs.copyFileSync(uploadedFile.filepath, destPath);
      } catch (e) {
        return res.status(500).json({ error: 'Failed to save uploaded image.' });
      }
      // Return a URL to access the image
      return res.status(200).json({ tempUrl: `/api/tempImg?file=${safeName}` });
    });
  } else if (req.method === 'GET') {
    // Serve the image file
    const { file } = req.query;
    if (!file) {
      return res.status(400).json({ error: 'No file specified.' });
    }
    const filePath = path.join(TEMP_IMG_DIR, file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
