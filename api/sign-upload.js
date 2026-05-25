const crypto = require('crypto');

module.exports = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, UPLOAD_PASSWORD } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: 'Missing Cloudinary environment variables.' });
  }

  const { password } = req.query;
  if (!UPLOAD_PASSWORD || password !== UPLOAD_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder    = 'daria';
  
  // Cloudinary signatures require parameters mapped alphabetically: context -> folder -> timestamp + Secret
  const toSign    = 'context=category=general&folder=' + folder + '&timestamp=' + timestamp + CLOUDINARY_API_SECRET;
  
  // Must use sha1 for Cloudinary upload API signatures
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  res.status(200).json({ 
    cloudName: CLOUDINARY_CLOUD_NAME, 
    apiKey: CLOUDINARY_API_KEY, 
    timestamp: timestamp, 
    signature: signature, 
    folder: folder 
  });
};