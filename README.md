# IoT Registrar

## Every time a device wakes up:

:serviceUrl/register

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
}```
