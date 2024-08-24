# IoT-Registrar

## Sequence Diagram

```mermaid
sequenceDiagram
    Device->>Registrar: register (name[, type, version])
    Registrar->>Configuration: API-Key
    Configuration-->>Registrar: Provider
    Registrar->>Provider: get config.yml
    Provider-->>Registrar: config.yml
    Registrar->>Provider: get module
    Provider-->>Registrar: module
    Registrar->>Module: execute (name, type, version)
    Module->>Templates: get Sensor definition 
    Templates-->>Module: Sensor definition
    Module-->>Module: create Sensors
    Module->>Templates: get ObservedProperties definition 
    Templates-->>Module: ObservedProperties
    Module-->>Module: create ObservedProperties
    Module->>Templates: get Thing definition 
    Templates-->>Module: Thing definition
    Module-->>Module: create Thing
    Module-->>Provider: Thing
    Provider-->>Registrar: Thing
    Registrar-->>Device: Thing
```

## Every time a device wakes up:

POST :serviceUrl/`register`
API-KEY: PeP

Body:
```
{
	"name": "490154203237517"
}
```

Body with location:
```
{
	"name": "490154203237517",
	"location": {
		"name": "At the factory",
		"description": "initiele locatie",
		"encodingType": "application/vnd.geo+json",
		"location": {
			"type": "Point",
			"coordinates": [
				3.7,
				51.08
			]
		}
	}
}
```


Response:
```
{
	"name": "490154203237517",
	"description": "490154203237517",
	"properties": {
		"type": "default",
		"version": "default",
		"sendTable": [3600],
		"sendfrequency": 10
	},
	"id": 132
}
```
