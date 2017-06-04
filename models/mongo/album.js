/**
 * Created by fibanez on 9/8/15.
 */
var album_data = require("../../datamanager/mongo/album.js"), // mongo
    Photo = require('./photo');

exports.version = "0.1.0";

/**
 * Album class.
 */
function Album (album_data) {
    this.name = album_data.name;
    this.created_at = album_data.created_at;
    this.updated_at = album_data.updated_at;
    this.title = album_data.title;
    this.main_image = album_data.main_image;
    this.description = album_data.description;
    this._id = album_data._id;
}

Album.prototype.name = null;
Album.prototype.created_at = null;
Album.prototype.updated_at = null;
Album.prototype.title = null;
Album.prototype.description = null;
Album.prototype.main_image = null;
Album.prototype.response_obj = function () {
    return {
        name: this.name,
        created_at: this.created_at,
        updated_at: this.updated_at,
        title: this.title,
        main_image: this.main_image,
        description: this.description };
};

Album.prototype.photos = function (pn, ps, callback) {
    if (this.album_photos != undefined) {
        callback(null, this.album_photos);
        return;
    }

    album_data.photos_for_album(
        this.name,
        pn, ps,
        function (err, results) {
            if (err) {
                callback(err);
                return;
            }

            var out = [];
            for (var i = 0; i < results.length; i++) {
                out.push(new Photo(results[i]));
            }

            this.album_photos = out;
            callback(null, this.album_photos);
        }
    );
};

Album.prototype.add_photo = function (data, callback) {
    album_data.add_photo(data, function (err, photo_data) {
        if (err)
            callback(err);
        else {
            var p = new Photo(photo_data);
            if (this.all_photos)
                this.all_photos.push(p);
            else
                this.app_photos = [ p ];

            callback(null, p);
        }
    });
};

Album.prototype.get_photo_by_name = function (photo_name, callback) {
    var data = {
        albumid: this.name,
        name: photo_name
    }
    album_data.get_photo_by_name(data, function (err, photo_data) {
        if (err)
            callback(err);
        else {
            var p = new Photo(photo_data);
            callback(null, p);
        }
    });
};

Album.prototype.delete_photo = function (photo_data, callback) {
    album_data.delete_photo(photo_data, function (err) {
        if (err)
            callback(err);
        else {
            callback(null,photo_data);
        }
    });
};

module.exports = Album;