const crypto = require('crypto');

module.exports = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, UPLOAD_PASSWORD } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: 'Missing Cloudinary env vars' });
  }

  const { password } = req.query;
  if (!UPLOAD_PASSWORD || password !== UPLOAD_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder    = 'daria';
  const toSign    = 'folder=' + folder + '&timestamp=' + timestamp + CLOUDINARY_API_SECRET;
  const signature = crypto.createHash('sha256').update(toSign).digest('hex');

  res.status(200).json({ cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, timestamp, signature, folder });
};
