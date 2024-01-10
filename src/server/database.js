/* JS临时轻量数据库 Powered By GK 21wl */
const xeonstore = require('./xeon-store');
const store = new xeonstore.xeonstore();

exports.database = class database {
    constructor() {
        this.table = store.get('table');
        try {
            this.table['text'] = {};
        } catch (e) {
            this.table = {};
        }
        console.log("[Database] Starting...");
        console.log("[Database] Done...");
    }
    save() {
        store.set('table', this.table);
    }
    newdb(database) {                          // 新建数据库
        try {
            if (this.table[database].length < 0) {
            }else{
                return true;
            }
        } catch (e) {
        }
        this.table[database] = [];
        this.save();
    }
    into(database, key, value) {           // 增
        try {
            let i = this.table[database].length;
            this.table[database][i] = {};
            this.table[database][i].dbid = i;
            this.table[database][i][key] = value;
            this.save();
            return i;
        } catch (e) {
            console.error(e);
        }
    }
    delete(database, key, value) {         // 删
        try {
            for (let index = 0; index < this.table[database].length; index++) {
                const element = this.table[database][index];
                if (element[key] == value) {
                    this.table[database][index] = null;
                }
            }
            this.save();
            return true;
        } catch (e) {
            console.error(e);
        }
    }
    update(database, key, value, nk, nv) {   // 改
        try {
            let addr;
            for (let index = 0; index < this.table[database].length; index++) {
                const element = this.table[database][index];
                if (element[key] == value) {
                    addr = index;
                }
            }
            this.table[database][addr][nk] = nv;
            this.save();
            return true;
        } catch (e) {
            console.error(e);
        }
    }
    read(database, key, value) {           //查
        try {
            for (let index = 0; index < this.table[database].length; index++) {
                const element = this.table[database][index];
                if (element[key] == value) {
                    element.id = index;
                    return element;
                }
            }
            this.save();
            return {};
        } catch (e) {
            console.error(e);
        }
    }
}