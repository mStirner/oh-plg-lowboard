const WebSocket = require("ws");

const infinity = require("../../helper/infinity.js");
const debounce = require("../../helper/debounce.js");


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
            labels: LABELS
        }, (device) => {

            logger.debug("Device found", device);

            C_ENDPOINTS.found({
                labels: [
                    `device=${device._id}`,
                    `magic=${MAGIC}`,
                    "lowboard=true",
                    "vendor=custom",
                    "led-strip=ws2801"
                ]
            }, (endpoint) => {

                // feedback
                logger.debug("Wait 10s before doing anything...");

                // without this timeout, the first bridge call fails with a timeout error
                // could this because there is a chance that no connectir is vailable?
                // pending requests are nowhere stored, if no connector is available at the time the iface.bridge()/iface.httpAgent is called
                // it just goes into void and is never processed
                // TODO: remove timeout when https://github.com/OpenHausIO/backend/issues/503 fixed
                setTimeout(() => {

                    // feedback
                    logger.debug("Init retry logic & connecto to WebSocket...");

                    // debounce calls to worker 100ms
                    // redo can be called multiple times
                    // e.g. from ws events "error" & "close"
                    let worker = debounce((redo) => {

                        let iface = device.interfaces[0];
                        let { host, port } = iface.settings;
                        let agent = iface.httpAgent();

                        let ws = new WebSocket(`ws://${host}:${port}`, {
                            agent
                        });

                        ws.once("error", (err) => {
                            logger.error(`WebSocket error: ${err.message}`);
                            redo();
                        });

                        ws.once("close", () => {
                            logger.error(`WebSocket closed from "${ws.url}"`);
                            redo();
                        });

                        ws.once("open", () => {

                            logger.info("WebSocket connected to:", ws.url);

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

                    }, 100);

                    // wrap worker into infinity
                    // delay call to worker
                    infinity(worker, 5000);

                }, 10000);

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
