import { join } from "path";
import YAML from "yaml";
import fs from "fs";

const __dirname = import.meta.dirname;
if (__dirname === undefined) console.log("need node 20.16 or higher");

async function post(neutralUrl, format, body, apiKey, callback) {

  // get path to providers folder
  let path = process.env.PROVIDER_PATH || join(__dirname, "../../providers", apiKey);

  // get Provider
  var provider = global.config.providers[apiKey];

  // find filename of dynamic script to execute
  let fileName = join(path, provider.service);
  if (!fs.existsSync(fileName))
    return callback(
      {
        httpCode: 500,
        code: `server error`,
        description: `${provider.service} does not exist`,
      },
      undefined
    );

  // execute the registration script per provider
  await import(fileName)
    .then((module) => {
      module.register(provider.url, body, provider, function (err, content) {
        if (err) {
          callback(err, undefined);
          return;
        }

        callback(undefined, content);
      });
    })
    .catch((error) => {
      return callback(
        {
          httpCode: 500,
          code: `Server error`,
          description: `${error.message}`,
        },
        undefined
      );
    });
}

export default {
  post,
};
