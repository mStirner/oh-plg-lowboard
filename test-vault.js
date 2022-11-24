

C_VAULT.found({
    name: "Facebook Credentials",
    identifier: "FOO_BAR_BAZ",
}, async (vault) => {

    console.log("item", vault);

    console.log(vault.decrypt());

    /*
    await vault.secrets[0].encrypt("info@example.com");
    //await item.secrets[1].encrypt("Pa$$w0rd");

    let [username, password] = vault.secrets;

    console.log("Username/Password:", username.decrypt(), password.decrypt());
    */

    /*
    item.secrets[0].value = "info@example.com";

    //console.log("item", item);


    setTimeout(() => {

        console.log("set new value for username");
        item.secrets[0].value = "max.mueller@example.de";

    }, 5000);
    */


}, (filter) => {

    C_VAULT.add({
        ...filter,
        secrets: [{
            name: "Username",
            key: "username"
        }, {
            name: "Password",
            key: "password"
        }]
    });

});
