/**
 * Created by fibanez on 24/8/15.
 */

var fs = require('fs'),
    crypto = require("crypto"),
    local = require('../../local.config.js'),
    db = require('./../../middlewares/mongo.js'),
    path = require("path"),
    async = require('async'),
    backhelp = require("./../../helpers/backend_helpers.js");

exports.version = "0.1.0";

exports.create_album = function (data, callback) {
    var final_album;
    var write_succeeded = false;
    async.waterfall([
        // validate data.
        function (cb) {
            try {
                backhelp.verify(data,
                    [ "name", "title", "description" ]);
                if (!backhelp.valid_filename(data.name))
                    throw invalid_album_name();
            } catch (e) {
                cb(e);
                return;
            }
            cb(null, data);
        },

        // create the album in mongo.
        function (album_data, cb) {
            var currentDate = Date.now();
            var write = album_data;
            write._id = album_data.name;
            write.created_at = currentDate;
            write.updated_at = currentDate;
            write.url = photo_data.albumid+"/"+photo_data.filename;
            db.albums.insert(write, { w: 1, safe: true }, cb);
        },

        // make sure the folder exists.
        function (new_album, cb) {
            write_succeeded = true;
            final_album = new_album.ops[0];
            fs.mkdir(local.config.static_content
                + "albums/" + data.name, cb);
        }
    ],
    function (err, results) {
        // convert file errors to something we like.
        if (err) {
            if (write_succeeded)
                db.albums.remove({ _id: data.name }, function () {});
            if (err instanceof Error && err.code == 11000)
                callback(backhelp.album_already_exists());
            else if (err instanceof Error && err.errno != undefined)
                callback(backhelp.file_error(err));
            else
                callback(err);
        } else {
            callback(err, err ? null : final_album);
        }
    });
};

exports.album_by_name = function (name, callback) {
    db.albums.find({ _id: name }).toArray(function (err, results) {
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            callback(null, null);
        } else if (results.length == 1) {
            callback(null, results[0]);
        } else {
            console.error("More than one album named: " + name);
            console.error(results);
            callback(backhelp.db_error());
        }
    });
};

exports.photos_for_album = function (album_name, pn, ps, callback) {
    var sort = { date: -1 };
    db.photos.find({ albumid: album_name })
        .skip(pn)
        .limit(ps)
        .sort(sort)
        .toArray(callback);
};

exports.all_albums = function (sort_field, sort_desc, skip, count, callback) {
    var sort = {};
    sort[sort_field] = sort_desc ? -1 : 1;
    db.albums.find()
        .sort(sort)
        .limit(count)
        .skip(skip)
        .toArray(callback);
};

exports.add_photo = function (photo_data, callback) {
    var final_photo;
    var write_succeeded = false;
    var base_fn = photo_data.filename ? photo_data.filename : photo_data.name;
    var save_path = local.config.static_album_path + photo_data.albumid + "/" + base_fn;
    var save_thumbnail_path = local.config.static_album_path + photo_data.albumid + "/thumbnail/" + base_fn;
    async.waterfall([
        // validate data
        function (cb) {
            try {
                backhelp.verify(photo_data,
                    [ "albumid" ]);

                photo_data.filename = base_fn;
                if (!backhelp.valid_filename(photo_data.albumid))
                    throw invalid_album_name();
            } catch (e) {
                cb(e);
                return;
            }

            cb(null, photo_data);
        },

        // add the photo to the collection
        function (pd, cb) {
            var currentDate = new Date();
            var write = pd;
            write._id = pd.albumid + "_" + base_fn;
            //write.url = "http://nodejs.fibanez.com/albums/"+pd.albumid+"/"+pd.filename;
            write.created_at = currentDate;
            write.updated_at = currentDate;
            db.photos.insert(write, { w: 1, safe: true }, cb);
        },

        // now copy the temp file to static content
        function (new_photo, cb) {
            write_succeeded = true;
            final_photo = new_photo.ops[0];
            async.parallel([
                // copy main photo to static album
                function(cb) {
                    backhelp.file_copy(photo_data.path, save_path, true, cb);
                },
                // copy thumbnail photo to static album
                function(cb) {
                    backhelp.file_copy(photo_data.thumbnail_path, save_thumbnail_path, true, cb);
                }
            ], cb);
        }
    ],

    function (err, results) {
        if (err && write_succeeded)
            db.photos.remove(final_photo);

        if (err) {
            callback(backhelp.file_error(err));
        } else {
            // clone the object
            var pd = JSON.parse(JSON.stringify(final_photo));
            pd.path = save_path;
            pd.thumbnail_path = save_thumbnail_path;
            //pd.filename = base_fn;
            callback(null, pd);
        }
    });
};

exports.get_photo_by_name = function (photo_data, callback) {
    var pd = {
        _id: photo_data.albumid + "_" + photo_data.name
    };
    db.photos.find(pd).toArray(function (err, results) {
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            callback(backhelp.no_such_photo_in_album());
        } else if (results.length == 1) {
            callback(null, results[0]);
        } else {
            console.error("More than one photo named: " + name);
            console.error(results);
            callback(backhelp.more_than_one());
        }
    });
};

exports.delete_photo = function (photo_data, callback) {
    photo_data.path = local.config.static_album_path + photo_data.albumid + "/" + photo_data.filename;
    async.waterfall([
        function (cb) {
            db.photos.remove({_id: photo_data._id}, function(error) {
                if(error) {
                    cb(error);
                    return;
                } else
                    cb(null, photo_data.path);
            });
        },
        function (filepath, cb) {
            backhelp.delete_file(filepath, cb);
        }
    ],

    function (err) {
        if (err) {
            callback(backhelp.file_error(err));
        } else {
            callback(null);
        }
    });

};

function invalid_album_name() {
    return backhelp.error("invalid_album_name",
        "Album names can have letters, #s, _ and, -");
}

function invalid_filename() {
    return backhelp.error("invalid_filename",
        "Filenames can have letters, #s, _ and, -");
}

