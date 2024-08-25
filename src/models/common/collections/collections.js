import urlJoin from "url-join";
import utils from "../../../utils/utils.js";

function getLinks(neutralUrl, format, name, links) {
  links.push({
    href: urlJoin(neutralUrl, name),
    rel: `self`,
    title: `The Document`,
  });
}

function getContent(neutralUrl, format, name, document) {
  var content = {};
  // A local identifier for the collection that is unique for the dataset;
  content.id = name; // required
  // An optional title and description for the collection;
  content.title = document.name;
  content.description = document.description;
  content.attribution = document.attribution;

  content.links = [];

  // Requirement 15 A and B
  getLinks(neutralUrl, format, name, content.links);

  content.itemType = "provider";

  return content;
}

function get(neutralUrl, format, callback) {
  // (OAPIC P2) Requirement 3A: The content of that response SHALL be based upon the JSON schema collections.yaml.
  var content = {};
  // An optional title and description for the collection;
  content.title = global.config.title;
  content.description = global.config.description;
  content.links = [];
  // (OAPIC P2) Requirement 2B. The API SHALL support the HTTP GET operation on all links to a Collections Resource that have the relation type
  content.links.push({
    href: urlJoin(neutralUrl, `f=${format}`),
    rel: `self`,
    type: utils.getTypeFromFormat(format),
    title: `This document`,
  });
  utils.getAlternateFormats(format, ["json", "html"]).forEach((altFormat) => {
    content.links.push({
      href: urlJoin(neutralUrl, `f=${altFormat}`),
      rel: `alternate`,
      type: utils.getTypeFromFormat(altFormat),
      title: `This document as ${altFormat}`,
    });
  });

  content.collections = [];

  for (var key in global.config.providers) {
    if (Object.prototype.hasOwnProperty.call(global.config.providers, key)) {
      var provider = getContent(
        neutralUrl,
        format,
        key,
        global.config.providers[key]
      );
      content.collections.push(provider);
    }
  }

  return callback(undefined, content);
}

export default {
  get,
};
