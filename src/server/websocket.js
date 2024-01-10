const ws = require('nodejs-websocket');
exports.websocket = class websocket {
    constructor(port, db) {
        this.db = db;
        console.log("[Websocket] Starting...");
        this.ws = ws.createServer((connect) => {
            connect.on('text', (e) => {
                console.log(e);
                let post = JSON.parse(e);
                switch (post.type) {
                    case 'createLink':
                        this.message({ 'type': "new_user" });
                        break;
                    default:
                        break;
                }
            });
            connect.on('connect', (e) => {
                console.warn(e);
            });
            connect.on('close', (e) => {
                this.update_database();
            });
            connect.on('error', (e) => {
                // console.error(e);
            })
        }).listen(port, () => {
            this.update_database();
            console.log("[Websocket] Done...");
        });
    }
    update_database(){
        for (let index = 0; index < this.db.table.userlist.length; index++) {
            this.db.table.userlist[index].online = false;
        }
        this.message({ "type": "updateState" });
    }
    message(str) {
        this.ws.connections.forEach((connect) => {
            connect.sendText(JSON.stringify(str))
        })
        return true;
    };
}