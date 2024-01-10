var room_id = 0;
var room_now = 0;
var room_count = 0;
var room = [];
var div_room_temp;
var room_lock = false;
var ctrl = false;

class websocket_link {
    constructor(tmp, id) {
        this.id = id;
        this.mess = {};
        this.uuid = null;
        $("#gui-window").append(
            '<div class="xskim-gui_window-unit skyim-id-im" style="z-index:' + room_id + ';" id="room_' + room_id + '">'
            + tmp +
            '</div>'
        );
    }
    connect(user, pass, ip, port, sip, sport) {
        let post = null;
        $.ajaxSettings.async = false;
        this.authurl = "http://" + sip + ":" + sport + "";
        $.post(this.authurl, {
            client: 'javascript',
            type: 'createLink',
            username: user,
            password: pass
        }, (data) => {
            post = JSON.parse(data);
        }).fail(() => {
            app_alert('无法连接到服务器');
        });
        if (post.type == 'createLink') {
            switch (post.back) {
                case 'userERROR':
                    app_alert('用户名异常，可能是因为太短');
                    break;
                case 'pwERROR':
                    app_alert('密码异常，可能是因为太短');
                    break;
                case 'pass':
                    app_alert('登录成功');
                    this.uuid = post.uuid;
                    this.ws_connect(ip, port);
                    break;
                case 'pwNone':
                    app_alert('密码错误，请重试或者新建ID');
                    break;
                default:
                    app_alert('服务器数据异常，可能是版本不一致');
                    break;
            }
        } else {
            app_alert('服务器数据异常，可能是版本不一致');
        }
    }
    ws_connect(ip, port) {
        try {
            this.ws.close();
        } catch (e) { }
        this.ws = new WebSocket("ws://" + ip + ":" + port);
        this.ws.onopen = () => {
            let data = {
                type: 'createLink',
                uuid: this.uuid
            };
            $("#room_" + this.id + " .xskim-message_sidebar").removeClass("active");
            $("#room_" + this.id + " .xskim-message_login").fadeOut();
            $("#room_" + this.id + " .message-button").attr('onclick', 'room[' + this.id + '].ws.enterMessage()');
            room_lock = true;
            room_id = room_id + 1;
            $("#server_list").append('<div onclick="switch_room(' + this.id + ')">Server ' + this.id + '</div>');
            this.ws.send(JSON.stringify(data));
            this.getoldMessage(this.uuid);
        };
        this.ws.onclose = (e) => {
            app_alert('窗口已退出因为服务器关闭了连接');
            remove_room(this.id);
            console.error("[WebSocket] Error Connect Faild");
        };
        this.ws.onmessage = (e) => {
            let data = JSON.parse(e.data);
            switch (data.type) {
                case 'new_user':
                    this.getUserlist(this.uuid);
                    break;
                case 'message':
                    this.getMessage(this.uuid, data.mid);
                    break;
                case 'updateState':
                    this.getUserlist(this.uuid);
                    break;
                default:
                    break;
            }
        }
    }
    getoldMessage(uuid) {
        let cid = this.id
        $.post(this.authurl, {
            client: 'javascript',
            type: 'getoldMessage',
            uuid: uuid
        }, (data) => {
            let dat = JSON.parse(data);
            console.log(dat);
            for (let index = dat.message.length - 1; index >= 0; index--) {
                const obj = dat.message[index];
                if (obj == undefined) { continue; }
                let len = index;
                this.mess[len] = obj;
                $("#room_" + this.id + " .message-content").append(
                    '<div id="room' + this.id + '-' + len + '" style="display:none;">' +
                    '<div class="xskim-message_item">' +
                    '<div class="avatar"></div>' +
                    '<div class="info">' +
                    '<div class="name"></div>' +
                    '<div class="mess-box">' +
                    '<div class="mess"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
                );
                $('#room' + this.id + '-' + len + " .name").text(obj.username);
                // obj.message = obj.message.replace(/\n/g,"<br/>")
                // $('#room' + this.id + '-' + len + " .mess").html(obj.message);
                $('#room' + this.id + '-' + len + " .mess").text(obj.message);
                $('#room' + this.id + '-' + len).slideDown(100);
                $("#room_" + cid + " .xskim-message_content").attr("id", "room_" + cid + "_content");
                setTimeout(() => {
                    document.getElementById("room_" + cid + "_content").scrollTop = document.getElementById("room_" + cid + "_content").scrollHeight;
                }, 101);
            }
        }).fail(() => {
            app_alert('无法连接到服务器');
        });
    }
    getMessage(uuid, mid) {
        let cid = this.id
        $.post(this.authurl, {
            client: 'javascript',
            type: 'getMessage',
            uuid: uuid,
            mid: mid
        }, (data) => {
            let obj = JSON.parse(data);
            let len = mid;
            this.mess[len] = obj;
            $("#room_" + this.id + " .message-content").append(
                '<div id="room' + this.id + '-' + len + '" style="display:none;">' +
                '<div class="xskim-message_item">' +
                '<div class="avatar"></div>' +
                '<div class="info">' +
                '<div class="name"></div>' +
                '<div class="mess-box">' +
                '<div class="mess"></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
            );
            $('#room' + this.id + '-' + len + " .name").text(obj.nickname);
            // obj.message = obj.message.replace(/\n/g,"<br/>")
            // $('#room' + this.id + '-' + len + " .mess").html(obj.message);
            $('#room' + this.id + '-' + len + " .mess").text(obj.message);
            $('#room' + this.id + '-' + len).slideDown(100);
            $("#room_" + cid + " .xskim-message_content").attr("id", "room_" + cid + "_content");
            if (!ctrl) {
                setTimeout(() => {
                    document.getElementById("room_" + cid + "_content").scrollTop = document.getElementById("room_" + cid + "_content").scrollHeight;
                }, 101);
            }
        }).fail(() => {
            app_alert('无法连接到服务器');
        });
    }

    getUserlist(uuid) {
        $.post(this.authurl, {
            client: 'javascript',
            type: 'getUserlist',
            uuid: uuid
        }, (data) => {
            let temp = JSON.parse(data);
            $("#room_" + this.id + " .message-userlist").empty();
            for (let index = 0; index < temp.userlist.length; index++) {
                const element = temp.userlist[index];
                let online, onlinebtn;
                if (element.online) {
                    online = '在线';
                    onlinebtn = '#00ff00'
                } else {
                    online = '离线';
                    onlinebtn = '#dcdcdc'
                }
                $("#room_" + this.id + " .message-userlist").append(
                    '<div class="xskim-message_userlist_item">' +
                    '<div class="avatar">' + '</div>' +
                    '<div class="info">' +
                    '<div class="name">' + element.username + '</div>' +
                    '<div class="online"><div class="onlinebtn" style="background-color:'
                    + onlinebtn + ';"></div>' + online + '</div>' +
                    '</div>' +
                    '</div>'
                );
            }

        }).fail(() => {
            app_alert('无法连接到服务器');
        });
    }

    enterMessage() {
        let mess = $("#room_" + this.id + " .message-input").val();
        setTimeout(() => {
            $("#room_" + this.id + " .message-input").val(null);
        }, 10);
        if (mess.length < 1 || mess == null || mess == undefined || mess == '\n' || mess == '') {
            app_alert("不能发送空文本");
        } else {
            $.post(this.authurl, {
                client: 'javascript',
                type: 'enterMessage',
                uuid: this.uuid,
                message: mess
            }, (data) => {
                console.log(data);
            }).fail(() => {
                app_alert('无法连接到服务器');
            });
        }
    }
}
$(document).ready(function () {
    $.get("./pages/im_room.html", function (data) {
        $(".skyim-id-im").hide();
        room[room_id] = { name: 'main' };
        room_now = room_id;
        room[room_id].ws = new websocket_link(data, room_id);
        $("#room_" + room_id).fadeIn();
        $("#room_" + room_id + " .input_btn").click(() => {
            room[room_id].ws.connect(
                $("#room_" + room_id + " .input_username").val(),
                $("#room_" + room_id + " .input_password").val(),
                $("#room_" + room_id + " .input_address").val(),
                $("#room_" + room_id + " .input_port").val(),
                $("#room_" + room_id + " .input_saddress").val(),
                $("#room_" + room_id + " .input_sport").val()
            );
        });
        room_count++;
    });
});
function switch_room(id) {
    if (room_lock) {
        $(".skyim-id-im").hide();
        $("#room_" + id).fadeIn();
        room_now = id;
    } else {
        app_alert("请先完成当前操作");
    }
}
function new_room() {
    if (room_lock) {
        $.get("./pages/im_room.html", function (data) {
            $(".skyim-id-im").hide();
            room_lock = false;
            room[room_id] = { name: 'main' };
            room_now = room_id;
            room[room_id].ws = new websocket_link(data, room_id);
            $("#room_" + room_id).fadeIn();
            $("#room_" + room_id + " .input_btn").click(() => {
                room[room_id].ws.connect(
                    $("#room_" + room_id + " .input_username").val(),
                    $("#room_" + room_id + " .input_password").val(),
                    $("#room_" + room_id + " .input_address").val(),
                    $("#room_" + room_id + " .input_port").val(),
                    $("#room_" + room_id + " .input_saddress").val(),
                    $("#room_" + room_id + " .input_sport").val()
                );
            });
            room_count++;
        });
    }
}
function remove_room(id) {
    try {
        room[id].ws.close();
    } catch (e) { }
    room[id] = {};
    $('#room_' + id + '_content').remove();
    console.log(id);
    room_count--;
    if (room_count == 0) {
        $.get("./pages/im_room.html", function (data) {
            $(".skyim-id-im").hide();
            room_lock = false;
            room[room_id] = { name: 'main' };
            room_now = room_id;
            room[room_id].ws = new websocket_link(data, room_id);
            $("#room_" + room_id).fadeIn();
            $("#room_" + room_id + " .input_btn").click(() => {
                room[room_id].ws.connect(
                    $("#room_" + room_id + " .input_username").val(),
                    $("#room_" + room_id + " .input_password").val(),
                    $("#room_" + room_id + " .input_address").val(),
                    $("#room_" + room_id + " .input_port").val(),
                    $("#room_" + room_id + " .input_saddress").val(),
                    $("#room_" + room_id + " .input_sport").val()
                );
            });
            room_count++;
        });
    }
}

document.onkeydown = (e) => {
    if (e.key == 'Control') {
        ctrl = true
    }
    if (e.key == 'Enter' && ctrl == false) {
        room[room_now].ws.enterMessage();
    }
}
document.onkeyup = (e) => {
    if (e.key == 'Control') {
        ctrl = false
    }
}