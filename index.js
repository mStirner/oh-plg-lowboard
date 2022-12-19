const { Agent } = require("http");
const WebSocket = require("ws");

module.exports = (info, logger, init) => {
    return init([
        "devices",
        "endpoints"
    ], (scope, [
        C_DEVICES,
        C_ENDPOINTS
    ]) => {

        logger.info("Lowboard plugin", info);

        C_DEVICES.found({
            meta: {
                manufacturer: "custom",
                model: "lowboard"
            }
        }, (device) => {

            console.log("Device found", device._id)

            // endpoint handling ------------------------------------------------

            // FIXME: Do this better, than timeout
            setTimeout(() => {

                let endpoint = C_ENDPOINTS.items.find((endpoint) => {
                    return endpoint.device === device._id;
                });



                let iface = device.interfaces[0];


                iface.on("attached", (socket) => {

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

            }, 1000);

            // endpoint handling ------------------------------------------------

        }, async (query) => {

            let device = await C_DEVICES.add({
                name: "Lowboard",
                interfaces: [{
                    settings: {
                        host: "lowboard.lan",
                        port: 8080
                    }
                }],
                ...query
            });

            let endpoint = await C_ENDPOINTS.add({
                name: "Lowboard",
                device: device._id,
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




    });
};
