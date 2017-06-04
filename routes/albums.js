var express = require('express'),
    local = require('../local.config.js'),
    album_hdlr = require('../handlers/albums.js'),
    auth = require('../middlewares/authentication.js'),
    //multer  = require('multer'),
    //upload = multer({ dest: 'uploads/' }),
    uploader = require('blueimp-file-upload-expressjs')(local.config.upload_options),
    _ = require('underscore');

var router = express.Router();

/* GET users listing. */
router.get('/list.json', album_hdlr.list_all);

router.put('/albums.json', auth.requireAuth, album_hdlr.create_album);
router.get('/:album_name.json', album_hdlr.album_by_name_json);

router.get('/:album_name/photos', album_hdlr.photos_for_album);
router.get('/:album_name/photos.json', album_hdlr.photos_for_album_json);

router.get('/:album_name/upload', auth.requireAuth, function(req, res, next) {
    album_hdlr.upload_dropzone(req, res, "album/upload_photos", local.config.dropzone.previewTemplate);
});

/* blueimp-file-upload-expressjs */
router.post('/:album_name/uploadfile', auth.requireAuth, function (req, res) {
    uploader.post(req, res, function (nullvalue, arr) {
        album_hdlr.add_photos_to_album(req, res, arr.files);
    });
});

/* Upload files */
/* MULTER */
//router.put('/:album_name/photo.json', auth.requireAuth, upload.single('photo_file'), album_hdlr.add_photo_to_album);
/* Dropzone with multer */
//router.post('/uploadfile', upload.array('file'), function (req, res) {
//    console.log("ok");
//    res.sendStatus(200);
//});


router.delete('/:album_name/:photo_name', auth.requireAuth, album_hdlr.delete_photo_from_album);

router.delete('/files/:name', auth.requireAuth, function (req, res) {
    uploader.delete(req, res, function (obj) {
        res.send(JSON.stringify(obj));
    });
});


router.get('/add', auth.requireAuth, function(req, res, next) {
    album_hdlr.list_all(req, res, "album/add_photo");
});
router.get('/create', auth.requireAuth, function(req, res, next) {
    album_hdlr.list_all(req, res, "album/add_album");
});

router.get('/:album_name/', function(req, res) {
    if (!req.params || !req.params.album_name) {
        res.render('album/index', { title: 'Album' });
    } else {
        album_hdlr.photos_for_album(req, res);
    }
});

router.get('/',function(req, res, next) {
    album_hdlr.list_all(req, res, 'album/index')
});


module.exports = router;


