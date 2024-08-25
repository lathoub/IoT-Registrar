import accepts from "accepts";
import observations from "../models/observations.js";
import utils from "../utils/utils.js";

export async function post(req, res) {
  // (ADR) /core/no-trailing-slash Leave off trailing slashes from URIs (if not, 404)
  // https://gitdocumentatie.logius.nl/publicatie/api/adr/#/core/no-trailing-slash
  if (utils.ifTrailingSlash(req, res)) return;

  const apiKey = req.get("API-KEY");

  let formatFreeUrl = utils.getFormatFreeUrl(req);

  let accept = accepts(req);
  let format = accept.type(["json", "html"]);

  await observations.post(
    formatFreeUrl,
    format,
    req.body,
    apiKey,
    function (err, content, location) {
      if (err) {
        res
          .status(err.httpCode)
          .json({ code: err.code, description: err.description });
        return;
      }

      res.set("Location", location);

      switch (format) {
        case "json":
          res.status(200).json(content);
          break;
        default:
          res.status(400).json({
            code: "InvalidParameterValue",
            description: `${accept} is an invalid format`,
          });
      }
    }
  );
}
