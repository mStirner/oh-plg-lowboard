# Introduction
Plugin for a custom WebSocket API on a Raspberry Pi that controlls a WS2801 light strip.

# Development
Add plugin item via HTTP API:<br />
[PUT] `http://{{HOST}}:{{PORT}}/api/plugins/`
```json
{
    "name": "Lowboard WebSocket API",
    "enabled": true,
    "version": 1,
    "intents": [
        "devices", 
        "endpoints", 
        "ssdp", 
        "vault", 
        "store"
    ]
}
```
Response:
```json
{
    "_id": "63a09fe041d049eca2f93ac6",
    "name": "Lowboard WebSocket API",
    "enabled": true,
    "version": 1,
    "intents": [
        "devices",
        "endpoints",
        "ssdp",
        "vault",
        "store"
    ],
    "timestamps": {
        "created": 1671471072269,
        "updated": null
    },
    "uuid": "13eb86e9-c14e-48c3-96e0-532cd49ec9dd",
    "autostart": true
}
```
Mount the source code into the backend plugins folder
```sh
sudo mount --bind ~/projects/OpenHaus/plugins/oh-plg-lowboard/ ~/projects/OpenHaus/backend/plugins/13eb86e9-c14e-48c3-96e0-532cd49ec9dd/
```