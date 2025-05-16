require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let urls = [];
let counter = 0;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;
  console.log('url', url);
  let parsedUrl;
  let exactUrl;
  let urlat;
  try {
    urlat = new URL(url);
    parsedUrl = new URL(url)?.hostname;
    exactUrl = urlat.origin;

    console.log('2', urlat, exactUrl);
  } catch (err) {
    return res.json({ error: '1:invalid url' });
  }

  // if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
  //   return res.json({ error: '2:invalid url' });
  // }

  dns.lookup(parsedUrl, (err) => {
    if (err) return res.json({ error: 'invalid url' });

    const found = urls.find((url) => url.original_url === urlat.href);
    if (found) return res.json(found);
    console.log('3', found);

    const newEntry = {
      original_url: urlat.href,
      short_url: ++counter,
    };
    urls.push(newEntry);
    console.log('4', newEntry);

    return res.json(newEntry);
  });
});
app.get('/api/shorturl/:short_url', function (req, res) {
  const { short_url } = req.params;
  const found = urls.find((url) => url.short_url == short_url);

  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
