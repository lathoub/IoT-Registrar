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

async function createSensors(serviceUrl, body) {
  let path = join(__dirname, body.type, body.version);
  let fileName = join(path, "sensors.json");
  var sensors = readObject(fileName);
  for (var i = 0; i < sensors.length; i++) {
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

async function createObsProps(serviceUrl, body) {
  let path = join(__dirname, body.type, body.version);
  let fileName = join(path, "observedProperties.json");
  var observedProperties = readObject(fileName);
  for (var i = 0; i < observedProperties.length; i++) {
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

async function createThing(serviceUrl, body, sensors, observedProperties) {
  let path = join(__dirname, body.type, body.version);
  let fileName = join(path, "thing.json");
  var thing = readObject(fileName);

  thing.name = body.name;
  thing.description = body.name;
  thing.properties.type = body.type;
  thing.properties.version = body.version;

  thing.Locations = [];
  if (body.location !== undefined) thing.Locations.push(body.location);

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

export async function launch(serviceUrl, body, callback) {
  let content = {};
  content.links = [];

  let thing = {};
  await http
    .get(`${serviceUrl}/Things?$filter=name eq '${body.name}'`)
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
    let sensors = await createSensors(serviceUrl, body);
    let observedProperties = await createObsProps(serviceUrl, body);
    content = await createThing(serviceUrl, body, sensors, observedProperties);

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
  let location = content["@iot.selfLink"];
  delete content["@iot.selfLink"];

  return callback(undefined, content, location);
}
