/**
 * Created by fibanez on 10/8/15.
 */
var helpers = require('./../helpers/helpers.js'),
    fs = require('fs');

exports.version = "0.1.0";

exports.generate = function (req, res) {

    var page = req.params.page_name;
    if (req.params.sub_page && req.params.page_name == 'admin')
        page = req.params.page_name + "_" + req.params.sub_page;

    res.render('page', { title: 'Page', page: page });
};