/**
 * Created by fibanez on 20/9/15.
 */
/**
 * Photo class.
 */
var local = require('../../local.config.js');

function Photo (photo_data) {
    this.filename = photo_data.filename;
    this.created_at = photo_data.created_at;
    this.updated_at = photo_data.updated_at;
    this.albumid = photo_data.albumid;
    this.description = photo_data.description;
    //this.url = photo_data.url;
    this.url = photo_data.albumid+"/"+photo_data.filename;
    this.thumbnailUrl = photo_data.thumbnailUrl;
    this._id = photo_data._id;
}

Photo.prototype._id = null;
Photo.prototype.filename = null;
Photo.prototype.created_at = null;
Photo.prototype.updated_at = null;
Photo.prototype.albumid = null;
Photo.prototype.description = null;
Photo.prototype.url = null;
Photo.prototype.thumbnailUrl = null;
Photo.prototype.response_obj = function() {
    return {
        filename: this.filename,
        created_at: this.created_at,
        updated_at: this.updated_at,
        albumid: this.albumid,
        url: "/albums/"+this.url,
        thumbnailUrl: this.thumbnailUrl,
        description: this.description
    };
};

module.exports = Photo;
