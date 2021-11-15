(function() {
    getById('hide_float_layer').onclick = function() {
        hide_float_layer();
    };
    // initialize version 
    send({
        url: 'http://localhost:5000/api/GetVersion',
        method: 'get',
        success: function(data) {
            getById('version').innerHTML = 'Version: ' + data
        },
    })
})();

nav = {};
nav.init = function() {
    //event init
    nav.initEvent();
};
nav.initEvent = function() {
    function navClickHandler(e) {
        var ev = ev || window.event;　　　　
        var target = ev.target;
        var id = target.id;
        if (id != null && id != undefined && id != '') {
            // console.log(id);
            if (id == 'nav_home') {
                show_main_content('homepage');
            } else if (id == 'nav_staff') {
                show_main_content('staff');
                if (staff.initialized == false) {
                    staff.init();
                }
            } else if (id == 'nav_products') {
                show_main_content('products');
                if (products.initialized == false) {
                    products.init();
                }
            } else if (id == 'nav_guest_book') {
                show_main_content('guest_book');
                if (guestBook.initialized == false) {
                    guestBook.init();
                }
            } else if (id == 'nav_login') {
                show_main_content('login');
            } else if (id == 'nav_register') {
                show_main_content('register');
            } else if (id == 'nav_logout') {
                show_main_content('homepage');
            }
        }
    }
    getById('nav').addEventListener('click', navClickHandler, false);
}

nav.init();



products = {
    initialized: false
};
products.init = function() {
    products.initData();
    products.initEvent();
    products.initialized = true;
};

products.initData = function() {
    send({
        url: 'http://localhost:5000/api/GetItems',
        method: 'get',
        success: function(data) {
            var products = JSON.parse(data);
            var productsHtml = [];
            products.forEach(
                product => {
                    productsHtml.push('<article class="one_quarter">' +
                        '<figure>' +
                        '<div>' +
                        '<img src="http://localhost:5000/api/GetItemPhoto/' + product.id + '">' +
                        '</div>' +
                        '<figcaption>' +
                        '<h3>' + product.name + '</h3>' +
                        '<p><span>$&nbsp;' + product.price + '</span></p>' +
                        '</figcaption>' +
                        '</figure>' +
                        '<p>' + product.description + '</p>' +
                        '<button onclick="return false;" class="button" id="buy_' + product.id + '" >Buy&nbsp;Now</button>' +
                        '</article>')
                }
            );
            getById('products_section').innerHTML = productsHtml.join('');
        },
    })
};

products.initEvent = function() {

    function productsClickHandler(e) {
        var ev = ev || window.event;　　　　
        var target = ev.target;
        if (target.id != undefined && target.id.startsWith('buy_')) {
            var username = getCookie('user_name')
            var auth = getCookie('auth')
            if (username == null || username == '' || auth == null || auth == '') {
                show_main_content('login');
                return;
            }

            var productId = target.id.replace('buy_', '');
            send({
                url: 'http://localhost:5000/api/PurchaseItem',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth
                },
                data: {
                    "productID": productId,
                    "quantity": 1
                },
                success: function(data) {
                    data = JSON.parse(data);
                    // console.log(data);
                    var text = 'Thank you ' + data.userName + ' for buying product. Your order ' + data.id + ' is being processed now!';
                    show_float_layer(text);
                },
                error: function(data) {
                    var text = 'Failed to handle your request now. Please try again. Code:' + data;
                    show_float_layer(text);
                }
            });
        }
    }
    getById('products_section').onclick = function(e) {
        e.stopPropagation();
        productsClickHandler(e);
        return false;
    };

    function productSearchHandler(e) {
        if (e.target.value != '') {
            send({
                url: 'http://localhost:5000/api/GetItems/' + e.target.value,
                method: 'get',
                success: function(data) {
                    var products = JSON.parse(data);
                    var productsHtml = [];
                    if (products.length > 0) {
                        products.forEach(
                            product => {
                                productsHtml.push('<article class="one_quarter">' +
                                    '<figure>' +
                                    '<div>' +
                                    '<img src="http://localhost:5000/api/GetItemPhoto/' + product.id + '">' +
                                    '</div>' +
                                    '<figcaption>' +
                                    '<h3>' + product.name + '</h3>' +
                                    '<p><span>$&nbsp;' + product.price + '</span></p>' +
                                    '</figcaption>' +
                                    '</figure>' +
                                    '<p>' + product.description + '</p>' +
                                    '<button onclick="return false;" class="button" id="buy_' + product.id + '" >Buy&nbsp;Now</button>' +
                                    '</article>')
                            }
                        );
                    } else {
                        productsHtml.push('<article class="one_quarter"><h2>Not Found</h2></article>')
                    }

                    getById('products_section').innerHTML = productsHtml.join('');
                },
            })
        } else {
            products.initData();
        }
    }
    getById('product_search').addEventListener('change', productSearchHandler);
};


// products.init();


staff = {
    initialized: false
}
staff.init = function() {
    staff.initData();
    staff.initialized = true;
}

staff.initData = function() {
    getById('staff_section').innerHTML = '';

    send({
        url: 'http://localhost:5000/api/GetAllStaff',
        method: 'get',
        success: function(data) {
            var staff = JSON.parse(data);
            staff.forEach(
                s => {
                    send({
                        url: 'http://localhost:5000/api/GetCard/' + s.id,
                        method: 'get',
                        success: function(data) {
                            var card = vCardParse(data);
                            // console.log(card)
                            getById('staff_section').innerHTML += '<article class="two_quarter">' +
                                '<img src="http://localhost:5000/api/GetStaffPhoto/' + s.id + '" width="150" height="150">' +
                                '<h3>' + card.fn + '<a href="http://localhost:5000/api/GetCard/' + s.id + '" target="_blank">&nbsp;&nbsp;&#128387;</a></h3>' +
                                '<h3><a href="tel:' + card.tel + '">' + card.tel + '</h3>' +
                                '<h3><a href="mailto:' + card.email[0].value + '">' + card.email[0].value + '</a></h3>' +
                                '<h3>' + card.categories + '</h3>' +
                                '</article>';
                        },
                    });
                }
            );
        },
    })
}

staff.initEvent = function(e) {

};

// pre load
staff.init();

guestBook = {
    initialized: false
};
guestBook.init = function() {
    guestBook.initData();
    guestBook.initEvent();
    guestBook.initialized = true;
};

guestBook.initData = function() {
    send({
        url: 'http://localhost:5000/api/GetComments',
        method: 'get',
        success: function(data) {
            var commentsHtml = ['<h3>Recent Comments</h3>'];
            data = data.replace('<html>', '')
                .replace('<head>', '')
                .replace('<title>', '')
                .replace('<body>', '')
                .replace('</html>', '')
                .replace('</head>', '')
                .replace('</title>', '')
                .replace('</body>', '')
            commentsHtml.push(data.replace('<html><head><title></title></head><body>'))

            getById('guest_book_recent_comments').innerHTML = commentsHtml.join('');
        },
    })
};

guestBook.initEvent = function() {
    function registerClickHandler(e) {
        var comment = getById('comment').value.trim();
        if (comment.length === 0) {
            show('comment_message');
            getById('comment_message').innerHTML = '<li>The Comment field is required.</li>';
            return;
        }
        var comment_user_name = getById('comment_user_name').value;
        send({
            url: 'http://localhost:5000/api/WriteComment',
            method: 'post',
            data: {
                "comment": comment,
                "name": comment_user_name
            },
            success: function(data) {
                getById('comment').value = '';
                getById('comment_user_name').value = '';
                hide('comment_message');
                guestBook.initData();
            },
            error: function(data) {
                show('comment_message');
                getById('comment_message').innerHTML = '<li>' + data + '</li>';
            }
        });

    }
    getById('comment_submit').onclick = function(e) {
        e.stopPropagation();
        hide('comment_message');
        registerClickHandler(e);
        return false;
    }
}

// guestBook.init();


user = {
    'register': {},
    'login': {},
    'logout': {}
};
user.init = function() {

    user.login.initData();
    user.register.initEvent();
    user.login.initEvent();
    user.logout.initEvent();
};
user.register.initEvent = function() {
    function registerClickHandler(e) {
        var username = getById('register_user_name').value;
        var password = getById('register_password').value;
        var address = getById('register_address').value;
        send({
            url: 'http://localhost:5000/api/Register',
            method: 'post',
            data: {
                "userName": username,
                "password": password,
                "address": address
            },
            success: function(data) {
                // console.log(data);
                getById('register_message').innerHTML = '<li>' + data + '</li>';
                show('register_message');
                if (data === 'User successfully registered.') {
                    setTimeout(function() {
                        show_main_content('login');
                    }, 2000);
                }
            },
            error: function(data) {
                getById('register_message').innerHTML = '<li>' + data + '</li>';
                show('register_message');
            }
        });

    }
    getById('register_submit').onclick = function(e) {
        e.stopPropagation();
        getById('register_message').innerHTML = '';
        hide('register_message')
        registerClickHandler(e);
        return false;
    }
}

user.login.initData = function() {
    var username = getCookie('user_name')
    if (username != '' && username != null) {
        hide(nav_login_li);
        show(nav_logout_li, 'inline');
        getById('nav_logout').innerHTML = '&nbsp;&#128748;&nbsp;&nbsp;' + username;
    } else {
        show(nav_login_li, 'inline');
        hide(nav_logout_li);
    }
}

user.login.initEvent = function() {
    function loginClickHandler(e) {
        var username = getById('user_name').value;
        var password = getById('password').value;
        var auth = 'Basic ' + utf8ToB64(username + ':' + password)
        send({
            url: 'http://localhost:5000/api/GetVersionA',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            },
            success: function(data) {
                // console.log(data);
                // save the username and authorization value
                setCookie("user_name", username);
                setCookie("auth", auth)
                hide(nav_login_li);
                show(nav_logout_li, 'inline');
                // console.log('username:' + username);
                getById('nav_logout').innerHTML = '&nbsp;&#128748;&nbsp;&nbsp;' + username;
                getById('user_name').value = '';
                getById('password').value = '';
                show_main_content('homepage');
            },
            error: function(data) {
                getById('login_message').innerHTML = '<li>error: status code is ' + data + '</li>';
                show('login_message')
            }
        });

    }
    getById('login_submit').onclick = function(e) {
        e.stopPropagation();
        getById('login_message').innerHTML = '';
        hide('login_message')
        loginClickHandler(e);
        return false;
    }
}


user.logout.initEvent = function() {
    function logoutClickHandler(e) {
        setCookie("user_name", '');
        setCookie("auth", '')
        show(nav_login_li, 'inline');
        hide(nav_logout_li);
        show_main_content('homepage');
    }
    getById('nav_logout').onclick = function(e) {
        e.stopPropagation();
        logoutClickHandler(e);
        return false;
    }
}

user.init();


function formatParams(data) {
    let arr = [];
    for (let name in data) {
        arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }
    arr.push(('v=' + Math.random()).replace('.', ''));
    return arr.join('&');
}

function send(options) {
    options = options || {};
    options.method = (options.method || 'GET').toUpperCase();
    options.headers = options.headers || { 'Content-Type': 'application/json' };
    options.dataType = options.dataType || 'json';
    options.timeout = options.timeout || 30000;

    let xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    }
    if (options.method == 'GET') {
        let params = formatParams(options.data);
        xhr.open('get', options.url + '?' + params, true);
        for (const [key, value] of Object.entries(options.headers)) {
            xhr.setRequestHeader(key, value);
        }
        xhr.send(null);
    } else if (options.method == 'POST') {
        xhr.open('post', options.url, true);
        for (const [key, value] of Object.entries(options.headers)) {
            xhr.setRequestHeader(key, value);
        }
        let params = '';
        if (options.dataType == 'json') {
            params = JSON.stringify(options.data);
        } else {
            params = formatParams(options.data);
        }
        xhr.send(params);
    }

    setTimeout(function() {
        if (xhr.readySate != 4) {
            xhr.abort();
        }
    }, options.timeout);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            let status = xhr.status;
            if ((status >= 200 && status < 300) || status == 304) {
                options.success && options.success(xhr.responseText, xhr.responseXML);
            } else {
                options.error && options.error(status);
            }
        }
    }
}

function utf8ToB64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function setCookie(name, value, expires, path, domain, secure) {
    var exp = new Date(),
        expires = arguments[2] || null,
        path = arguments[3] || "/",
        domain = arguments[4] || null,
        secure = arguments[5] || false;
    expires ? exp.setMinutes(exp.getMinutes() + parseInt(expires)) : "";
    document.cookie = name + '=' + escape(value) + (expires ? ';expires=' + exp.toGMTString() : '') + (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '');
}

function getCookie(name) {
    var reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"),
        val = document.cookie.match(reg);
    return val ? (val[2] ? unescape(val[2]) : "") : null;
}


function vCardParse(input) {
    var Re1 = /^(version|fn|title|categories|uid|tel):(.+)$/i;
    var Re2 = /^([^:;]+);([^:]+):(.+)$/;
    var ReKey = /item\d{1,2}\./;
    var fields = {};

    input.split(/\r\n|\r|\n/).forEach(function(line) {
        var results, key;

        if (Re1.test(line)) {
            results = line.match(Re1);
            key = results[1].toLowerCase();
            fields[key] = results[2];
        } else if (Re2.test(line)) {
            results = line.match(Re2);
            key = results[1].replace(ReKey, '').toLowerCase();

            var meta = {};
            results[2].split(';')
                .map(function(p, i) {
                    var match = p.match(/([a-z]+)=(.*)/i);
                    if (match) {
                        return [match[1], match[2]];
                    } else {
                        return ["TYPE" + (i === 0 ? "" : i), p];
                    }
                })
                .forEach(function(p) {
                    meta[p[0]] = p[1];
                });

            if (!fields[key]) fields[key] = [];

            fields[key].push({
                meta: meta,
                value: results[3].split(';')
            })
        }
    });

    return fields;
};

function getById(id) {
    return typeof(id) === "string" ? document.getElementById(id) : id;
}

function show(id, displayType = 'block') {
    getById(id).style.display = displayType;
}

function hide(id) {
    getById(id).style.display = 'none';
}


function show_main_content(id) {
    hide('homepage');
    hide('staff');
    hide('products');
    hide('guest_book');
    hide('login');
    hide('register');
    show(id);
    if (id === 'login') {
        getById('user_name').value = '';
        getById('password').value = '';
        getById('login_message').innerHTML = '';
    } else if (id === 'register') {
        getById('register_user_name').value = '';
        getById('register_password').value = '';
        getById('register_message').innerHTML = '';
    }
}

function show_float_layer(data) {
    getById('float_layer_content').innerHTML = data;
    show('float_layer_div');
}

function hide_float_layer() {
    getById('float_layer_content').innerHTML = '';
    hide('float_layer_div');
}