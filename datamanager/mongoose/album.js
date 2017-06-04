/**
 * Created by fibanez on 21/9/15.
 */

var fs = require('fs'),
    crypto = require("crypto"),
    local = require('../../local.config.js'),
    path = require("path"),
    async = require('async'),
    Album = require('../../models/mongoose/album'),
    backhelp = require("./../../helpers/backend_helpers.js");

exports.version = "0.1.0";

exports.all_albums = function (sort_field, sort_desc, skip, count, callback) {
    var sort = {};
    sort[sort_field] = sort_desc ? -1 : 1;

    Album.find()
        .limit(count)
        .skip(skip)
        .sort(sort)
        .exec(function(err, results) {
            callback(null, results)
        });

};

exports.create_album = function (data, callback) {
    var final_album;
    var write_succeeded = false;
    async.waterfall([
        // validate data.
        function (cb) {
            try {
                backhelp.verify(data,
                    [ "name", "title", "date", "description" ]);
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

            var newAlbum = Album({
                name: album_data.name,
                title: album_data.title,
                description: album_data.description,
            });

            //var newAlbum = Album(album_data);

            //var write = JSON.parse(JSON.stringify(album_data));
            //write._id = album_data.name;
            //db.albums.insert(write, { w: 1, safe: true }, cb);
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