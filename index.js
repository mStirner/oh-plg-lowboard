const { Agent } = require("http");
const WebSocket = require("ws");

// used to prevent conflics for device discovering via labels
// use plugin UUID for this?
const MAGIC = "8d89fe9e-1f86-480b-bd25-005b8cadaf19";
const LABELS = [
    "lowboard=true",
    "vendor=custom",
    "led-strip=ws2801",
    `magic=${MAGIC}`
];

module.exports = (info, logger, init) => {
    return init([
        "devices",
        "endpoints"
    ], (scope, [
        C_DEVICES,
        C_ENDPOINTS
    ]) => {

        logger.info("Lowboard plugin", info);
        logger.info("To add new device, add them with the following labels:", LABELS);

        C_DEVICES.found({
            labels:LABELS
        }, (device) => {

            logger.debug("Device found", device);

            C_ENDPOINTS.found({
                labels:[
                    `device=${device._id}`,
                    `magic=${MAGIC}`,
                    "lowboard=true",
                    "vendor=custom",
                    "led-strip=ws2801"
                ]
            }, (endpoint) => {

                let iface = device.interfaces[0];

                iface.on("attached", (socket) => {

                    logger.debug("Connector attached socket");

                    let agent = iface.httpAgent();

                    let ws = new WebSocket(`ws://${iface.settings.host}:${iface.settings.port}`, {
                        agent
                    });

                    ws.on("error", (err) => {
                        console.error("[%s]", ws.url, err);
                    });

                    ws.on("pong", () => {
                        console.log("Pong received");
                    })

                    ws.on("open", () => {
                        console.log("WebSocket connected to:", ws.url);



                        //ws.send(`{"fx":"straight"}`);


                        endpoint.commands.forEach((command) => {
                            command.setHandler((cmd, iface, params, done) => {
                                if (ws.readyState === 1) {

                                    logger.trace("send payload", cmd, cmd.payload);

                                    ws.send(cmd.payload);

                                    done(null, true)

                                } else {

                                    done(new Error("NOT_READY"));

                                }
                            });
                        });


                    });

                });                

            }, async (query) => {

                let endpoint = await C_ENDPOINTS.add({
                    name: `Lowboard (${device._id})`,
                    device: device._id,
                    ...query,
                    commands: [{
                        name: "FX = Rainbow",
                        alias: "FX_RAINBOW",
                        payload: JSON.stringify({
                            fx: "rainbow"
                        })
                    }, {
                        name: "FX = Straight",
                        alias: "FX_STRAIGHT",
                        payload: JSON.stringify({
                            fx: "straight"
                        })
                    }, {
                        name: "FX = Lightning",
                        alias: "FX_LIGHTNING",
                        payload: JSON.stringify({
                            fx: "lightning"
                        })
                    }, {
                        name: "FX = Raindrop",
                        alias: "FX_RAINDROP",
                        payload: JSON.stringify({
                            fx: "raindrop"
                        })
                    }, {
                        name: "FX = Aus",
                        alias: "FX_OFF",
                        payload: JSON.stringify({
                            fx: "clear"
                        })
                    }].map((cmd) => {
                        cmd.interface = device.interfaces[0]._id;
                        return cmd;
                    })
                });
    
                logger.verbose("Added new device/endpoint", device._id, endpoint._id);

            });

        
        }, async (query) => {

            logger.info("No device/lowboard found, add one with the following labels:", query.labels);

        });




    });
};
