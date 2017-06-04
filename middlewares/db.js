/**
 * Created by fibanez on 9/8/15.
 */
var mysql = require('mysql'),
    pool = require('generic-pool'),
    async = require('async'),
    local = require("../local.config.js");

var mysql_pool;

var config = {
    host:     local.config.db_config.host,
    user:     local.config.db_config.user,
    password: local.config.db_config.password,
    database: local.config.db_config.database
};

/**
 * Setup a client to automatically replace itself if it is disconnected.
 *
 * @param {Connection} client
 *   A MySQL connection instance.
 */
function handlerError(client) {
    client.on("error", function (err) {
        console.error('mysqldb error: ' + err);
        if (!err.fatal) {
            return;
        }

        if (err.code !== "PROTOCOL_CONNECTION_LOST") {
            throw err;
        }

        // client.config is actually a ConnectionConfig instance, not the original
        // configuration. For most situations this is fine, but if you are doing
        // something more advanced with your connection configuration, then
        // you should check carefully as to whether this is actually going to do
        // what you think it should do.
        client = mysql.createConnection(client.config);
        handlerError(client);
        client.connect(function (error) {
            if (error) {
                // Well, we tried. The database has probably fallen over.
                // That's fairly fatal for most applications, so we might as
                // call it a day and go home.
                //
                // For a real application something more sophisticated is
                // probably required here.
                process.exit(1);
            }
        });
    });
};

/**
 * Currently for initialisation, we
 * the database.  We won't even attempt to start up
 * if this fails, as it's pretty pointless.
 */
exports.init = function (callback) {

    conn_props = local.config.db_config;

    mysql_pool = pool.Pool({
        name     : 'mysql',
        create   : function (callback) {
            var c = mysql.createConnection(config);
            c.on('close', function (err) {
                console.log('mysqldb conn close');
            });
            handlerError(c);
            callback(null, c);
        },
        destroy           : function(client) { client.end(); },
        max               : conn_props.pooled_connections,
        idleTimeoutMillis : conn_props.idle_timeout_millis,
        log               : false
    });

    // run a test query to make sure it's working.
    exports.run_mysql_query("SELECT 1", [], function (err, results) {
        if (err != null) {
            callback(err);
            console.error("Unable to connect to database server. Aborting.");
        } else {
            console.log("Database initialised and connected.");
            callback(null);
        }
    });

};

exports.run_mysql_query = function (query, values, callback) {
    mysql_pool.acquire(function(err, mysqlconn) {
        mysqlconn.query(query, values, function (mysqlerr, mysqlresults) {
            mysql_pool.release(mysqlconn);
            callback(mysqlerr, mysqlresults);
        });
    });
};


exports.db = function (callback) {
    //mysql_pool.acquire(callback);
    mysql_pool.acquire(function(mysqlerr, mysqlconn) {
        mysql_pool.release(mysqlconn);
        callback(mysqlerr, mysqlconn);
    });
};
