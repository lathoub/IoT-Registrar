import urlJoin from "url-join";
import utils from "../../../utils/utils.js";

async function get(neutralUrl, format, callback) {

  var content = {};
  content.title = global.config.title; // Requirement 2 B
  content.description = global.config.description;
  content.attribution = global.config.metadata.attribution;

  content.links = [];
  content.links.push({
    href: urlJoin(neutralUrl, `?f=${format}`),
    rel: `self`,
    type: utils.getTypeFromFormat(format),
    title: `This document`,
  });

  content.links.push({
    href: global.config.metadata.licenseUrl,
    rel: `license`,
    title: global.config.metadata.licenseName,
    type: `text/html`,
  });

  return callback(undefined, content);
}

export default {
  get,
};
