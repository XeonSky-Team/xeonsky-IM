/* 重构electron-store */
const { app } = require('electron');
const userDataPath = app.getPath('userData');
const fs = require('fs');

exports.xeonstore = class xeonstore {
    constructor() {
        let data;
        this.time = 0;
        try {
            fs.accessSync(userDataPath + '/config.json', fs.constants.R_OK | fs.constants.W_OK);
            data = fs.readFileSync(userDataPath + '/config.json');
        } catch (err) {
            data = '{"store":{}}';
            fs.writeFile(userDataPath + '/config.json', '{"store":{}}', () => { });
        }
        try {
            this.config = JSON.parse(data);
        } catch (error) {
            this.config = { "store": {} }
            this.save();
        }
    }
    get(key) {
        return this.config.store[key];
    }
    set(key, value) {
        this.config.store[key] = value;
        this.save();
    }
    save() {
        if ((Date.parse(new Date()) - this.time) > 1000) {
            this.time = Date.parse(new Date());
            fs.writeFile(userDataPath + '/config.json', JSON.stringify(this.config), () => { });
        }
    }
}