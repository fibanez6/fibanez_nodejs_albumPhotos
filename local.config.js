exports.config = {

    app_url: "http://localhost:3000",

    db_config: {
        host: "host",
        user: "user",
        password: "pass",
        database: "database",

        pooled_connections: 125,
        idle_timeout_millis: 3000
    },

    mongo_config: {
        host: "host",
        port: port,
        dabaseName: "database",
        poolSize: 5
    },

    mongoose_config: {
        url: "mongodb:url"
    },

    facebook_config: {
        clientID: "clientId",
        clientSecret: "secret",
        callbackURL: "/auth/facebook/callback"
    },

    upload_options: {
        tmpDir:  __dirname + '/uploads/tmp',
        uploadDir: __dirname + '/uploads/files',
        uploadUrl:  '/albums/#{albumname}/',
        storage : {
            type : 'local'
        }
    },

    upload_full_options: {
        tmpDir:  __dirname + '/uploads/tmp',
        uploadDir: __dirname + '/uploads/files',
        uploadUrl:  '/albums/#{albumname}/',
        maxPostSize: 11000000000, // 11 GB
        minFileSize:  1,
        maxFileSize:  10000000000, // 10 GB
        acceptFileTypes:  /.+/i,
        // Files not matched by this regular expression force a download dialog,
        // to prevent executing any scripts in the context of the service domain:
        inlineFileTypes:  /\.(gif|jpe?g|png)/i,
        imageTypes:  /\.(gif|jpe?g|png)/i,
        copyImgAsThumb : true, // required
        imageVersions :{
            maxWidth : 200,
            maxHeight : 200
        },
        accessControl: {
            allowOrigin: '*',
            allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
            allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
        },
        storage : {
            type : 'local'
        }
    },

    dropzone: {
        previewTemplate: 'public/templates/dropzone.html'
    },

    static_album_path: "public/albums/",
    static_content: "public/"
};