/**
 * Created by fibanez on 21/9/15.
 */

var mongoose = require('mongoose');

exports.version = "0.1.0";

var ObjectIdSchema = mongoose.Schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;

var PhotoSchema = new mongoose.Schema({
    _id: { type: ObjectIdSchema, default: function () { return new ObjectId()} },
    filename: { type: String, required: true, unique: true },
    albumid: String,
    url: String,
    thumbnailUrl: String,
    description: String,
    created_at: Date,
    updated_at: Date
});

// on every save, add the date
PhotoSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});

var Photo = mongoose.model('Photo', PhotoSchema);

module.exports = Photo;