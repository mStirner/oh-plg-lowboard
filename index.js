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

        /*
                C_DEVICES.add({
                    name: "Lowboard",
                    interfaces: [{
                        settings: {
                            host: "lowboard.lan",
                            port: 8080
                        }
                    }],
                    meta: {
                        manufacturer: "custom",
                        model: "lowboard"
                    }
                }, (err, device) => {
        
                    console.log(err || device);
        
                    C_ENDPOINTS.add({
                        name: "Lowboard",
                        device: device._id,
                        commands: [{
                            name: "Rainbow",
                            alias: "RAINBOW",
                            payload: JSON.stringify({
                                fx: "rainbow"
                            })
                        }, {
                            name: "Blank",
                            alias: "BLANK",
                            payload: JSON.stringify({
                                fx: "blank"
                            })
                        }].map((cmd) => {
                            cmd.interface = device.interfaces[0]._id;
                            return cmd;
                        })
                    }, (err, endpoint) => {
        
                        console.log(err || endpoint)
        
                    });
        
                });
        
                return;
                */

        const device = C_DEVICES.items.find((device) => {
            return device.name === "Lowboard";
        });

        console.log("Lowboard:", device)

        if (!device) {
            logger.debug("Device not found");

            C_DEVICES.add({
                name: "Lowboard",
                interfaces: [{
                    type: "ETHERNET",
                    settings: {
                        host: "lowboard.lan",
                        port: 8080,
                        socket: "tcp"
                    }
                }]
            }, (err, device) => {

                console.log(err || device);

                C_ENDPOINTS.add({
                    device: device._id,
                    name: "Lowboard",
                    commands: [{
                        interface: device.interfaces[0]._id,
                        name: "FX = Rainbow",
                        alias: "FX_RAINBOW",
                        payload: JSON.stringify({
                            fx: "rainbow"
                        })
                    }, {
                        interface: device.interfaces[0]._id,
                        name: "FX = Straight",
                        alias: "FX_OFF",
                        payload: JSON.stringify({
                            fx: "straight"
                        })
                    }, {
                        interface: device.interfaces[0]._id,
                        name: "FX = Lightning",
                        alias: "FX_OFF",
                        payload: JSON.stringify({
                            fx: "lightning"
                        })
                    }, {
                        interface: device.interfaces[0]._id,
                        name: "FX = Aus",
                        alias: "FX_OFF",
                        payload: JSON.stringify({
                            fx: "clear"
                        })
                    }]
                });

            });

            return;
        }

        const endpoint = C_ENDPOINTS.items.find((endpoint) => {
            return endpoint.device === device._id;
        });


        //console.log("device", device);
        //console.log("endpoint", endpoint);


        let iface = device.interfaces[0];


        //console.log(iface)

        iface.on("attached", (socket) => {

            console.log("iface attached", socket.__target)


            let agent = iface.httpAgent();

            /*
            let agent = new Agent();
            agent.createConnection = () => {
                console.log(">>>>>>> createConnectoin called")
                //let socket = iface.upstream;
                socket.ref = (...args) => { console.log("socket.ref called", ...args); };
                socket.unref = (...args) => { console.log("socket.unref called", ...args); };
                socket.setKeepAlive = (...args) => { console.log("socket.setKeepAlive called", ...args); };
                socket.setTimeout = (...args) => { console.log("socket.setTimeout called", ...args); };
                socket.setNoDelay = (...args) => { console.log("socket.setNoDelay called", ...args); };
                return socket;
            }
            */

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

                            console.log("send payload", cmd, cmd.payload)

                            let data = JSON.parse(cmd.payload);
                            let str = JSON.stringify(data);

                            // payload = json string
                            ws.send(str);

                            //ws.send(`{"fx":"rainbow"}`);

                            done(null, true)

                        } else {

                            done(new Error("NOT_READY"));

                        }
                    });
                });


            });

        });

    });
};