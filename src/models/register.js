import { join } from "path";
import YAML from "yaml";
import fs from "fs";

const __dirname = import.meta.dirname;
if (__dirname === undefined) console.log("need node 20.16 or higher");

async function post(neutralUrl, format, body, apiKey, callback) {
  let name = body.name; // mandatory
  if (name == undefined)
    return callback(
      {
        httpCode: 404,
        code: `Not Found`,
        description: "Id not provided as query parameter",
      },
      undefined
    );

  body.type = body.type || "default";
  body.version = body.version || "default";
  body.location = body.location || undefined;

  // get STAPI endpoint for this API-Key
  let path = process.env.PROVIDER_PATH || join(__dirname, "../../providers");
  path = join(path, apiKey);
  let fileName = join(path, "config.yml");
  if (!fs.existsSync(fileName))
    return callback(
      {
        httpCode: 500,
        code: `server error`,
        description: `config.yml does not exist`,
      },
      undefined
    );

  const yamlStr = fs.readFileSync(fileName);
  config = YAML.parse(yamlStr.toString());

  fileName = join(path, config.service);
  if (!fs.existsSync(fileName))
    return callback(
      {
        httpCode: 500,
        code: `server error`,
        description: `${config.service} does not exist`,
      },
      undefined
    );

  // execute the registration script per provider
  await import(fileName)
    .then((module) => {
      module.launch(config.url, body, function (err, content, location) {
        if (err) {
          callback(err, undefined);
          return;
        }

        callback(undefined, content, location);
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
