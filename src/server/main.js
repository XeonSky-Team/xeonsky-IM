const db = require('./database');
const webs = require('./websocket');
const http = require('http');
const querystring = require('querystring');
const hash = require("crypto-js");
const { v4: uuidv4 } = require('uuid');

const config = {            //配置文件
    'websocket': {
        'port': 40800
    },
    'httpd': {
        'port': 40801
    }
}

const database = new db.database();     // 临时数据库
const ws = new webs.websocket(config.websocket.port, database);        // Websocket推送服务

database.newdb('userlist');
database.newdb('message');

console.log("    _|_|_|  _|      _|  _|    _|        _|  ");
console.log("  _|          _|  _|    _|  _|          _|  ");
console.log("  _|  _|_|      _|      _|_|            _|  ");
console.log("  _|    _|      _|      _|  _|    _|    _|  ");
console.log("    _|_|_|      _|      _|    _|    _|_|    ");

console.log("[httpAuth] Starting...");


http.createServer((r, w) => {
    var post = {};
    r.on('data', (c) => { post += c; });
    r.on('end', () => {
        w.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
        post = querystring.parse(post);
        let output = {}
        switch (post.type) {
            case 'createLink':
                output = createLink(post.username, post.password);
                break;
            case 'enterMessage':
                output = enterMessage(post.uuid, post.message);
                break;
            case 'getMessage':
                output = getMessage(post.uuid, post.mid);
                break;
            case 'getUserlist':
                output = getUserlist(post.uuid);
                break;
            case 'getoldMessage':
                output = getoldMessage(post.uuid);
                break;
            default:
                break;
        }
        w.end(JSON.stringify(output));
    })
}).listen(config.httpd.port, () => {
    console.log("[httpAuth] Server listen On http://127.0.0.1:" + config.httpd.port)
    console.log("[httpAuth] done...");
});

function authUUID(uuid) {
    let user_arr = database.read('userlist', 'uuid', uuid);
    if (user_arr.online = true) {
        return true;
    } else {
        return false;
    }
}

function enterMessage(uuid, mess) {
    if (authUUID(uuid)) {
        if (mess.length < 1 || mess == null || mess == undefined || mess == '') {
            return { 'type': "enterMessage", 'back': false };
        } else {
            let user_arr = database.read('userlist', 'uuid', uuid);
            let id = database.into('message', 'username', user_arr.username);
            database.update('message', 'dbid', id, 'message', mess);
            ws.message({ 'type': "message", 'mid': id });
            return { 'type': "enterMessage", 'back': true }
        }
    }
    return { 'type': "enterMessage", 'back': false };
}

function createLink(username, password) {
    if (username.length < 1) { return { 'type': "createLink", 'back': "userERROR" } }
    if (password.length < 1) { return { 'type': "createLink", 'back': "pwERROR" } }
    let user_arr = database.read('userlist', 'username', username);
    password = hash.SHA256(password).toString();
    if (user_arr.password == undefined) { user_arr.password = '0' }
    if (user_arr.password.length < 1 || user_arr.password == '0') {
        database.into('userlist', 'username', username);
        database.update('userlist', 'username', username, 'password', password);
        database.update('userlist', 'username', username, 'online', true);
        let uuid = hash.SHA256(uuidv4()).toString();
        database.update('userlist', 'username', username, 'uuid', uuid);
        return { 'type': "createLink", 'back': "pass", 'uuid': uuid }
    } else {
        if (user_arr.password == password) {
            database.update('userlist', 'username', username, 'online', true);
            return { 'type': "createLink", 'back': "pass", 'uuid': user_arr.uuid }
        } else {
            return { 'type': "createLink", 'back': "pwNone" }
        }
    }
}

function getUserlist(uuid) {
    if (authUUID(uuid)) {
        let userlists = JSON.parse(JSON.stringify(database.table.userlist));      // 复制数组防止脱敏造成影响
        for (let index = 0; index < userlists.length; index++) {
            userlists[index].uuid = null;
            userlists[index].password = null;
        }
        return { 'type': "getUserlist", 'back': true, 'userlist': userlists }
    }
    return { 'type': "getUserlist", 'back': false }
}
function getMessage(uuid, mid) {
    if (authUUID(uuid)) {
        let message = database.read('message', 'dbid', mid);
        return { 'type': "getMessage", 'back': true, 'nickname': message.username, 'message': message.message }
    }
    return { 'type': "getUserlist", 'back': false }
}
function getoldMessage(uuid) {
    if (authUUID(uuid)) {
        let messlists = JSON.parse(JSON.stringify(database.table.message));
        let mess = [];
        for (let index = messlists.length-1; index > messlists.length-21; index--) {
            mess[mess.length] = messlists[index];
        }
        return { 'type': "getoldMessage", 'back': true, "message": mess }
    }
    return { 'type': "getUserlist", 'back': false }
}