var express = require('express');
var router = express.Router();

var page_hdlr = require('../handlers/page.js');
var auth = require('../middlewares/authentication.js');

router.get('/:page_name', page_hdlr.generate);
router.get('/:page_name/:sub_page', auth.requireAuth, page_hdlr.generate);

router.get('/', function(req, res, next) {
    res.render('album', { title: 'Album' });
});

module.exports = router;