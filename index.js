var request = require('request');
var cheerio = require('cheerio');
var jar     = request.jar();
var hdrs    = null;
var userid  = null;
var ratings = {};
var RB_URL  = "http://www.ratebeer.com";

var get_userid = function(headers, callback) {
    request.get({url: RB_URL + "/latest", followRedirect: false, jar:true, header: hdrs}, function(error, response, body) {
        $ = cheerio.load(body);
        my_ratings = $('a:contains("Beer Ratings")').attr("href");
        match = my_ratings.match("^/user/([0-9]+)/beer-ratings/$");
        if (match != null) {
            userid = match[1];
        }
        callback();
    });
}

var get_catalogs = function(link, callback) {
    request.get({url: RB_URL + link, jar:true, header: hdrs}, function(error, response, body) {
        $ = cheerio.load(body);
        console.log(body)
        $('a:contains("Compile my ratings")').each(function(i, elem) {
            cur = $(this).attr('href');
            console.log(cur)
            match = cur.match("^/compileratings.asp");
            if (match != null) {
                download_catalog(cur, match[1])
            }
        });
    });
}

var download_catalog = function(url, index) {
    console.log("Downloading " + RB_URL + url);
    request.get({url: RB_URL + url, jar:true, header: hdrs}, function(error, response, body) {
        ratings[index] = body
    });
}

var ratebeer = module.exports = {
    login: function(user, password, callback) {
        var options = {
            jar: true,
            form: { "UserName": user, "pwd": password, "SaveInfo": "on" },
            url: RB_URL + '/signin/',
            headers: {
                'Referer': RB_URL + '/login.asp'
            }
        };
        var response = request.post(options, function(error, response, body) {
            hdrs = response.headers;
            console.log(response.toJSON());
            get_userid(hdrs, callback);
        });
    },
    user_info: function() {
        if (userid == null) {
            console.log("You are not logged in!");
            return;
        }
        console.log("Your user ID is " + userid);
    },
    get_ratings: function(callback) {
        if (userid == null) {
            console.log("You are not logged in!");
            return;
        }
        url = RB_URL + '/user/' + userid + '/'
        var response = request.get({url: url, jar:true, header: hdrs}, function(error, response, body) {
            $ = cheerio.load(body);
            compiled_ratings = $('a:contains("Compile My Ratings")').attr("href");
            match = compiled_ratings.match("^/compileratings/ratings_[0-9]+.txt");
            if (match != null) {
                console.log(compiled_ratings);
                get_catalogs(compiled_ratings, download_catalog)
            }
        });
    }
}
