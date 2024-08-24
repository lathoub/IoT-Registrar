import { extname } from 'path';
import url from 'url';

var encodings = function (req, res, next) {

  var mediaType = req.query.f
    || req.query.accept
    || extname(req.path).replace(/^\./, '')

  delete req.query.f;
  delete req.query.accept;

  if (mediaType) {
    if (['json', 'geojson', 'application/json'].includes(mediaType))
      req.headers['accept'] = 'application/json,' + req.headers['accept']
    else if (['yaml', 'application/vnd.oai.openapi;version=3.0'].includes(mediaType))
      req.headers['accept'] = 'text/yaml,' + req.headers['accept']
    else if (['json', 'application/vnd.oai.openapi+json;version=3.0'].includes(mediaType))
      req.headers['accept'] = 'application/json,' + req.headers['accept']
    else if (['html', 'text/html'].includes(mediaType))
      req.headers['accept'] = 'text/html,' + req.headers['accept']
    else {
      res.status(400).json({'code': 'InvalidParameterValue', 'description': `${mediaType} is an invalid format`})
      return
    }
  }

  next()
}

export default encodings