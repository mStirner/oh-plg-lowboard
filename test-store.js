C_STORE.found({
    namespace: info.uuid
}, (item) => {
    console.log("----------------------------\r\n");

    // create lean config object
    let obj = item.lean();
    let events = item.changes();

    // listen for changes
    events.on("changed", (key, value) => {

        if (key === "pairing") {
            if (value) {

                // acquire API key from Gateway
                // store it in vault
                logger.info("Gateway is in paring mode");

            } else {

                logger.info("Gateway leaved paring mode");

            }
        }

        console.log(Object.getOwnPropertyDescriptors(item).config.value[0])

    });

    //console.log(Object.getOwnPropertyDescriptors(item).config.value[0])


    setTimeout(() => {
        console.log();
        item.config[0].value = true;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 1);

    setTimeout(() => {
        console.log();
        obj.pairing = false;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 2);

    // reverse ture/false setting methods:

    setTimeout(() => {
        console.log();
        obj.pairing = true;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 3);

    setTimeout(() => {
        console.log();
        item.config[0].value = false;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 4);




    setTimeout(() => {
        console.log();
        item.config[0].value = true;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 5);

    setTimeout(() => {
        console.log();
        item.config[0].value = false
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 6);

    setTimeout(() => {
        console.log();
        obj.pairing = true;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 7);

    setTimeout(() => {
        console.log();
        obj.pairing = false;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 8);

    setTimeout(() => {
        console.log();
        item.config[0].value = true;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 9);

    setTimeout(() => {
        console.log();
        obj.pairing = false;
        //console.log("getter/setter", Object.getOwnPropertyDescriptor(item.config[0], "value"), item.config[0].value, obj.pairing);
    }, 1000 * 10);


    console.log("\r\n----------------------------");
}, (filter) => {


    C_STORE.add({
        ...filter,
        config: [{
            key: "pairing",
            type: "boolean",
            value: false,
            description: "Is device ready for pairing?"
        }]
    });

});