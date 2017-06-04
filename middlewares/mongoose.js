/**
 * Created by fibanez on 21/9/15.
 */

var mongoose = require('mongoose'),
    local = require("../local.config.js");

var url = local.config.mongo_config.url
    ? local.config.mongo_config.url
    : 'mongodb://localhost/PhotoAlbums';


exports.init = function (callback) {
    mongoose.connect(url, callback);
};
