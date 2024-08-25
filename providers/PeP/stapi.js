import { join } from "path";
import http from "axios";
import fs from "fs";
import { stringify } from "querystring";

const __dirname = import.meta.dirname;
if (__dirname === undefined) console.log("need node 20.16 or higher");

function readObject(fileName) {
  var rawData = fs.readFileSync(fileName);
  return JSON.parse(rawData);
}

function lookup(array, key) {
  for (var i = 0; i < array.length; i++)
    if (array[i]["name"] == key) return array[i];
  return null;
}

async function createSensors(serviceUrl, name, type, version) {
  let path = join(__dirname, type, version);
  let fileName = join(path, "sensors.json");
  var sensors = readObject(fileName);
  for (var i = 0; i < sensors.length; i++) {
    // TODO: create a check cache

    await http
      .get(`${serviceUrl}/Sensors?$filter=name eq '${sensors[i].name}'`)
      .then((r) => {
        if (r.data.value.length > 0) sensors[i] = r.data.value[0];
      })
      .catch((error) => {
        return null;
      });

    if (!sensors[i]["@iot.id"]) {
      await http
        .post(`${serviceUrl}/Sensors`, sensors[i])
        .then((r) => {
          if (201 != r.status) return null;
          var location = r.headers["location"];
          var id = location.substring(
            location.lastIndexOf("(") + 1,
            location.lastIndexOf(")")
          );
          sensors[i]["@iot.id"] = id;
        })
        .catch((error) => {
          return null;
        });
    }
  }
  return sensors;
}

async function createObsProps(serviceUrl, name, type, version) {
  let path = join(__dirname, type, version);
  let fileName = join(path, "observedProperties.json");
  var observedProperties = readObject(fileName);
  for (var i = 0; i < observedProperties.length; i++) {
    // TODO: create a check cache

    await http
      .get(
        `${serviceUrl}/ObservedProperties?$filter=name eq '${observedProperties[i].name}'`
      )
      .then((r) => {
        if (r.data.value.length > 0) observedProperties[i] = r.data.value[0];
      })
      .catch((error) => {
        return null;
      });

    if (!observedProperties[i]["@iot.id"]) {
      await http
        .post(`${serviceUrl}/ObservedProperties`, observedProperties[i])
        .then((r) => {
          if (201 != r.status) return null;
          var location = r.headers["location"];
          var id = location.substring(
            location.lastIndexOf("(") + 1,
            location.lastIndexOf(")")
          );
          observedProperties[i]["@iot.id"] = id;
        })
        .catch((error) => {
          return null;
        });
    }
  }
  return observedProperties;
}

async function createThing(
  serviceUrl,
  name,
  type,
  version,
  location,
  sensors,
  observedProperties
) {
  let path = join(__dirname, type, version);
  let fileName = join(path, "thing.json");
  var thing = readObject(fileName);

  thing.name = name;
  thing.description = name;
  thing.properties.type = type;
  thing.properties.version = version;

  thing.Locations = [];
  if (location !== undefined) thing.Locations.push(location);

  thing.Datastreams.forEach((datastream) => {
    datastream["Sensor"] = {
      "@iot.id": lookup(sensors, datastream["!sensorName"])["@iot.id"],
    };
    delete datastream["!sensorName"];
    datastream["ObservedProperty"] = {
      "@iot.id": lookup(observedProperties, datastream["!obsPropName"])[
        "@iot.id"
      ],
    };
    delete datastream["!obsPropName"];
  });

  //console.log(JSON.stringify(thing))

  await http
    .post(`${serviceUrl}/Things`, thing)
    .then((r) => {
      if (201 != r.status) return null;
      var location = r.headers["location"];
      var id = location.substring(
        location.lastIndexOf("(") + 1,
        location.lastIndexOf(")")
      );
      thing["@iot.id"] = id;
    })
    .catch((error) => {
      return null;
    });

  return thing;
}

export async function register(serviceUrl, body, provider, callback) {
  let content = {};
  content.links = [];

  // Split body using ,
  let bodyParts = body.split(",");
  if (bodyParts.Length <= 0)
    return callback(
      {
        httpCode: 500,
        code: "Server error",
        description: "message should contains at least 1 parameter",
      },
      undefined
    );

  let _type = "default";
  let _version = "default";
  let _name = bodyParts[0];
  let _location = undefined;
  if (bodyParts.length > 1) _type = bodyParts[1];
  if (bodyParts.length > 2) _version = bodyParts[2];
  if (bodyParts.length > 4) {
    let x = bodyParts[3];
    let y = bodyParts[4];
    // TODO: create geojson object
  }

  // if no cache has been made yet, prepare for it here
  if (provider.cache == undefined) provider.cache = [];

  // if the device is already in cache, return it here. No
  // need for additional slow HTTP call to the STAPI server
  let thing = provider.cache[_name]; // WRONG: should include type and version
  if (thing !== undefined) {
    // TODO check if location changed
    return callback(undefined, thing, undefined);
  }

  // Device is not in the cache - get it from STAPI
  await http
    .get(`${serviceUrl}/Things?$filter=name eq '${_name}'`)
    .then((r) => {
      if (r.data.value.length > 0) thing = r.data.value[0];
    })
    .catch((error) => {
      return callback(
        {
          httpCode: error.status,
          code: error.code,
          description: error.message,
        },
        undefined
      );
    });

  if (!thing["@iot.id"]) {
    let sensors = await createSensors(serviceUrl, _name, _type, _version);
    let observedProperties = await createObsProps(
      serviceUrl,
      _name,
      _type,
      _version
    );
    content = await createThing(
      serviceUrl,
      _name,
      _type,
      _version,
      _location,
      sensors,
      observedProperties
    );

    delete content["Datastreams"];
    delete content["Locations"];
  } else {
    content = thing;
    delete content["Datastreams@iot.navigationLink"];
    delete content["HistoricalLocations@iot.navigationLink"];
    delete content["Locations@iot.navigationLink"];
  }

  content.id = content["@iot.id"];
  delete content["@iot.id"];
  delete content["@iot.selfLink"];

  // add to the cache
  // provider.cache[_name] = content; // TODO: don't roll out just yet

  return callback(undefined, content);
}

export async function observations(serviceUrl, body, callback) {}
