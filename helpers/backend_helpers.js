/**
 * Created by fibanez on 9/8/15.
 */

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

exports.verify = function (data, field_names) {
    for (var i = 0; i < field_names.length; i++) {
        if (!data[field_names[i]]) {
            throw exports.error("missing_data", field_names[i] + " not optional");
        }
    }
    return true;
}

exports.error = function (code, message) {
    var e = new Error(code);
    e.description = message;
    return e;
};

exports.file_error = function (err) {
    err.description = err.message;
    err.message = "file_error";
    return err;
}

/**
 * Possible signatures:
 *  src, dst, callback
 *  src, dst, can_overwrite, callback
 */
exports.file_copy = function () {

    var src, dst, callback;
    var can_overwrite = false;

    if (arguments.length == 3) {
        src = arguments[0];
        dst = arguments[1];
        callback = arguments[2];
    } else if (arguments.length == 4) {
        src = arguments[0];
        dst = arguments[1];
        callback = arguments[3];
        can_overwrite = arguments[2]
    }

    function copy(err) {
        var is, os;

        if (!err && !can_overwrite) {
            return callback(backhelp.error("file_exists",
                "File " + dst + " exists."));
        }

        if (!fs.exists(dst)) {
            mkdirp(path.dirname(dst), function (err) {
                if (err) {
                    return callback(backhelp.error("create_dir", "Path " + path.dirname(dst) + "."));
                }

                fs.stat(src, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    is = fs.createReadStream(src);
                    os = fs.createWriteStream(dst);
                    is.on('end', function () {
                        callback(null);
                    });
                    is.on('error', function (e) {
                        callback(e);
                    });
                    is.pipe(os);
                });
            });
        }
    }

    fs.stat(dst, copy);
};

exports.delete_file = function () {

    var path, callback;

    if (arguments.length == 2) {
        path = arguments[0];
        callback = arguments[1];
    }

    function rm(err, stats) {
        if (err && err.code == "ENOENT")
            return callback(backhelp.error("file_no_exists", "File " + path + " does not exists."));
        else if (err)
            return callback(backhelp.error(err.toString()));
        else if (stats.isDirectory())
            fs.rmdir(path, callback);
        else
            fs.unlink(path, callback);
    }

    fs.stat(path, rm);
};

exports.valid_filename = function (fn) {
    var re = /[^\.a-zA-Z0-9_-]/;
    return typeof fn == 'string' && fn.length > 0 && !(fn.match(re));
};

exports.db_error = function () {
    return exports.error("server_error",
        "Something horrible has happened with our database!");
};

exports.album_already_exists = function () {
    return exports.error("album_already_exists",
        "An album with this name already exists.");
};

exports.missing_data = function (field) {
    return exports.error("missing_data", "You must provide: " + field);
};

exports.no_such_user = function () {
    return exports.error("no_such_user",
        "The specified user does not exist");
};

exports.user_already_registered = function () {
    return exports.error("user_already_registered",
        "This user appears to exist already!");
};

exports.no_such_photo_in_album = function () {
    return exports.error("no_such_photo",
        "The specified photo does not exist in the album");
};

exports.more_than_one = function () {
    return exports.error("more_than_one",
        "More than one entities found");
};

/**
 * node-mysql sometimes adds extra data to callbacks to be helpful.
 * this can mess up our waterfall, however, so we'll strip those
 * out.
 */
exports.mscb = function (cb) {
    return function (err, results) {
        cb(err, results);
    }
}