const https = require('https');

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Show exactly what env vars we have
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(200).json({
      debug: 'MISSING ENV VARS',
      cloudName: cloudName || 'MISSING',
      apiKey: apiKey ? 'OK' : 'MISSING',
      apiSecret: apiSecret ? 'OK' : 'MISSING'
    });
  }

  try {
    const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');
    const url  = 'https://api.cloudinary.com/v1_1/' + cloudName + '/resources/image?max_results=500&type=upload';

    const raw = await new Promise(function(resolve, reject) {
      https.get(url, { headers: { 'Authorization': 'Basic ' + auth } }, function(r) {
        let body = '';
        r.on('data', function(chunk) { body += chunk; });
        r.on('end', function() { resolve(body); });
        r.on('error', reject);
      }).on('error', reject);
    });

    const data = JSON.parse(raw);

    // If error from Cloudinary, show it
    if (data.error) {
      return res.status(200).json({ debug: 'CLOUDINARY ERROR', error: data.error });
    }

    const resources = data.resources || [];

    if (resources.length === 0) {
      return res.status(200).json({ debug: 'NO PHOTOS FOUND', totalCount: data.rate_limit_remaining });
    }

    const photos = resources.map(function(img) {
      const d     = new Date(img.created_at);
      const month = d.toLocaleString('en', { month: 'short' });
      const year  = d.getFullYear();
      const pid   = img.public_id;
      const base  = 'https://res.cloudinary.com/' + cloudName + '/image/upload/';
      return {
        thumb: base + 'q_auto,f_auto,w_600/'  + pid,
        hero:  base + 'q_auto,f_auto,w_400/'  + pid,
        full:  base + 'q_auto,f_auto,w_1600/' + pid,
        file:  base + 'q_auto,f_auto,w_1200/' + pid,
        date:  month + ' ' + year
      };
    });

    res.status(200).json(photos);

  } catch(err) {
    res.status(200).json({ debug: 'EXCEPTION', error: err.message });
  }
};
