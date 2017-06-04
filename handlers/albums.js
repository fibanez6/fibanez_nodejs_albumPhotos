/**
 * Created by fibanez on 20/9/15.
 */
var helpers = require('./../helpers/helpers'),
    local = require('../local.config.js'),
    album_dm = require("../datamanager/mongo/album"), // mongo
    //album_dm = require("../datamanager/mongoose/album"), // mongoose
    async = require('async'),
    Photo = require('../models/mongo/photo'),
    Album = require('../models/mongo/album'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore');

exports.version = "0.1.0";

/**
 * Album module methods.
 */
exports.create_album = function (req, res) {
    async.waterfall([
        // make sure the albumid is valid
        function (cb) {
            if (!req.body || !req.body.name) {
                cb(helpers.no_such_album());
                return;
            }

            // UNDONE: we should add some code to make sure the album
            // doesn't already exist!
            cb(null);
        },
        function (cb) {
            album_dm.create_album(new Album(req.body), cb);
        }
    ],
    function (err, results) {
        if (err) {
            helpers.send_failure(res, err);
        } else {
            var a = new Album(results);
            helpers.send_success(res, {album: a.response_obj() });
        }
    });
};

exports.album_by_name_json = function (req, res) {
    async.waterfall([
        // get the album
        function (cb) {
            if (!req.params || !req.params.album_name)
                cb(helpers.no_such_album());
            else
                album_dm.album_by_name(req.params.album_name, cb);
        }
    ],
    function (err, results) {
        if (err) {
            helpers.send_failure(res, err);
        } else if (!results) {
            helpers.send_failure(res, helpers.no_such_album());
        } else {
            var a = new Album(results);
            helpers.send_success(res, { album: a.response_obj() });
        }
    });
};

exports.list_all = function (req, res, render_page) {
    album_dm.all_albums("date", true, 0, 25, function (err, results) {
        if (err) {
            helpers.send_failure(res, err);
        } else {
            var out = [];
            if (results) {
                for (var i = 0; i < results.length; i++) {
                    out.push(new Album(results[i]).response_obj());
                }
            }
            helpers.send_success(res, { albums: out }, render_page);
        }
    });
};

exports.upload_dropzone = function (req, res, render_page, template) {
    async.parallel([
        // get the album
        function (cb) {
            if (!req.params || !req.params.album_name)
                cb(helpers.no_such_album());
            else
                album_dm.album_by_name(req.params.album_name, cb);
        },
        function (cb) {
            if(template) {
                fs.readFile(template, 'utf8', function (err, data) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, {template: data});
                    }
                });
            } else {
                cb(null,null);
            }
        }
    ],
    function (err, results) {
        if (err) {
            helpers.send_failure(res, err);
        } else if (!results) {
            helpers.send_failure(res, helpers.no_such_album());
        } else {
            var out = {};
            var albumfound = false;
            _.each(results, function(elt) {
                if (elt) {
                    if (elt._id) {
                        albumfound = true;
                        _.extend(out, {album: (new Album(elt)).response_obj() });
                    } else {
                        _.extend(out,elt);
                    }
                }
            });
            if (albumfound)
                helpers.send_success(res, out ,render_page);
            else
                helpers.send_failure(res, helpers.no_such_album());
        }
    });
};

exports.photos_for_album_json = function(req, res) {
    async.waterfall([
            function (cb) {
                _photos_for_album(req, res, cb);
            }
        ],
        function (err, results) {
            helpers.send_success(res, results);
        });
};

exports.photos_for_album = function(req, res) {
    var render_page = "album/display";
    async.waterfall([
            function (cb) {
                _photos_for_album(req, res, cb);
            }
        ],
        function (err, results) {
            helpers.send_success(res, results, render_page);
        });
};

function _photos_for_album (req, res, callback) {
    var page_num = req.query.page ? req.query.page : 0;
    var page_size = req.query.page_size ? req.query.page_size : 1000;

    page_num = parseInt(page_num);
    page_size = parseInt(page_size);
    if (isNaN(page_num)) page_num = 0;
    if (isNaN(page_size)) page_size = 1000;

    var album;
    async.waterfall([
        function (cb) {
            // first get the album.
            if (!req.params || !req.params.album_name)
                cb(helpers.no_such_album());
            else
                album_dm.album_by_name(req.params.album_name, cb);
        },

        function (album_data, cb) {
            if (!album_data) {
                cb(helpers.no_such_album());
                return;
            }
            album = new Album(album_data);
            album.photos(page_num, page_size, cb);
        },
        function (photos, cb) {
            var out = [];
            for (var i = 0; i < photos.length; i++) {
                out.push(photos[i].response_obj());
            }
            cb(null, out);
        }
    ],
    function (err, results) {
        if (err) {
            helpers.send_failure(res, err);
            return;
        }
        if (!results) results = [];
        var out = {
            photos: results,
            album: album.response_obj()
        };
        callback(null, out);
    });
};

/*
 MULTER
 */
//exports.add_photo_to_album = function (req, res) {
//    var album;
//    async.waterfall([
//        // make sure we have everything we need.
//        function (cb) {
//            if (!req.body)
//                cb(helpers.missing_data("POST data"));
//            else if (!req.file || req.file.length === 0)
//                cb(helpers.missing_data("a file"));
//            else if (!helpers.is_image(req.file.originalname))
//                cb(helpers.not_image());
//            else
//                // get the album
//                album_dm.album_by_name(req.params.album_name, cb);
//        },
//
//        function (album_dm, cb) {
//            if (!album_dm) {
//                cb(helpers.no_such_album());
//                return;
//            }
//
//            album = new Album(album_dm);
//            req.body.name = req.file.originalname;
//            album.add_photo(req.body, cb);
//        }
//    ],
//    function (err, p) {
//        if (err) {
//            helpers.send_failure(res, err);
//            return;
//        }
//        var out = {
//            photo: p.response_obj(),
//            album_dm: album.response_obj()
//        };
//        helpers.send_success(res, out);
//    });
//};

exports.add_photos_to_album = function (req, res, files) {
    var album;

    async.waterfall([
        // make sure we have everything we need.
        function (cb) {
            if (!req.body)
                cb(helpers.missing_data("POST data"));
            else if (!files || files.length === 0)
                cb(helpers.missing_data("a file"));
            else
                // get the album
                album_dm.album_by_name(req.params.album_name, cb);
        },

        function (album_data, cb) {
            if (!album_data) {
                cb(helpers.no_such_album());
                return;
            }

            album = new Album(album_data);

            async.forEachLimit(files, 5, function(file, callback) {
                    file = _.mapObject(file, function(val, key) {
                        if (_.isString(val) && val.indexOf('#{albumname}') > 1) {
                            return val.replace('#{albumname}', album.name);
                        } else {
                            return val;
                        }
                    });
                    file.path = local.config.upload_options.uploadDir +"/"+file.name;
                    file.thumbnail_path = local.config.upload_options.uploadDir +"/thumbnail/"+file.name;
                    file.albumid = album.name;
                    album.add_photo(file, cb);
                },
                function(err) {
                    if (err) {
                        cb(err);
                    }
                });
        }
    ],
    function (err, p) {
        if (err) {
            helpers.send_failure(res, err);
            return;
        }
        var out = {
            action: "add",
            photo: p.response_obj(),
            album_data: album.response_obj()
        };
        helpers.send_success(res, out);
    });
};

exports.delete_photo_from_album = function (req, res) {
    var album;
    var photo;
    async.waterfall([
        // make sure we have everything we need.
        function (cb) {
            if (!req.body || !req.params)
                cb(helpers.missing_data("DELETE data"));
            else if (!req.body.album && req.body.album !== req.params.album_name)
                cb(helpers.missing_data("an album"));
            else if (!req.body.photo && req.body.photo !== req.params.photo_name)
                cb(helpers.missing_data("a photo"));
            else
            // get the album
                album_dm.album_by_name(req.params.album_name, cb);
        },

        function (album_data, cb) {
            if (!album_data) {
                cb(helpers.no_such_album());
                return;
            }

            album = new Album(album_data);
            album.get_photo_by_name(req.params.photo_name, cb);
        },

        function (photo_data, cb) {
            album.delete_photo(photo_data, cb);
        }
    ],
    function (err, p) {
        if (err) {
            helpers.send_failure(res, err);
            return;
        }
        var out = {
            action: "delete",
            photo: p.response_obj()
        };
        helpers.send_success(res, out);
    });
};