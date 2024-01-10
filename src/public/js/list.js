var list_config = [
    {
        'title': "主页",
        'id': "menu_home",
        'icon': "./icon/home.svg"
    },
    {
        'title': "服务器",
        'id': "menu_server",
        'icon': "./icon/server.svg"
    },
    {
        'title': "关于",
        'id': "menu_about",
        'icon': "./icon/info.svg"
    }
]
var list_default = 'menu_home';
var menu_default = false;
var alert_list = [];
var alert_lock = true;
var alert_len = 0;


$(document).ready(function () {
    for (let index = 0; index < list_config.length; index++) {
        let temp_inf = null;
        $.ajaxSettings.async = false;
        $("#gui-menubar").append('<div class="item" title="' + list_config[index].title + '" id="' +
            list_config[index].id + '" onclick="menu_toggle(' + "'" + list_config[index].id + "'" + ');">' +
            '<img width="28px" height="28px" src="' + list_config[index].icon + '"></div>');
        $.get("./pages/menu/" + list_config[index].id + '.html', (data) => {
            $("#gui-menuinf").append('<div class="item" id="' + list_config[index].id + '-inf">' + data + '</div>');
        }).fail(() => {
            console.error('faild');
        });
    }
});
function menu_toggle(getid = 'index') {
    if (getid == 'index' || getid == list_default) {
        if (menu_default) {
            menu_default = false;
            menu_reload();
        } else {
            menu_default = true;
            menu_reload();
        }
    } else {
        menu_default = true;
        list_default = getid;
        menu_reload();
    }
}
function menu_reload() {
    for (let index = 0; index < list_config.length; index++) {
        $("#" + list_config[index].id).removeClass('active');
        $("#" + list_config[index].id + "-inf").hide();
    }
    if (menu_default) {
        $("#gui-menu").addClass('active');
        $("#" + list_default).addClass('active');
        $("#" + list_default + "-inf").fadeIn();
    } else {
        $("#gui-menu").removeClass('active');
    }
}
function app_alert(info) {
    $("#xskim-alert").text(info);
    $("#xskim-alert").fadeIn();
    setTimeout(() => {
        $("#xskim-alert").fadeOut();
    }, 2000)
}