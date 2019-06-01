
let Promise = require('bluebird');

var insert = function (req, params, ddoc) {
    return new Promise(function (resolve, reject) {
        if (req.user != undefined) {
            let conn = initConn(params);
            Promise.promisifyAll(conn);

            conn.then(function (cloudantConnection) {
                let cloudantDb = cloudantConnection;

                let author = req.user.id;
                ddoc.author = author;
                insertDocument(cloudantDb, ddoc, resultInsert => {
                    resolve(resultInsert)
                });
            });
        } else {
            console.log("[INSERT] USER PROBLEM: " + JSON.stringify(req.user));
        }
    });
}

var update = function (req, params, ddoc) {
    return new Promise(function (resolve, reject) {
        if (req.user != undefined) {
            let conn = initConn(params);
            Promise.promisifyAll(conn);

            conn.then(function (cloudantConnection) {
                let cloudantDb = cloudantConnection;

                let author = req.user.cn;
                ddoc.author = author;

                updateDocument(cloudantDb, ddoc, resultInsert => {
                    resolve(resultInsert)
                });
            });
        } else {
            console.log("[INSERT] USER PROBLEM: " + JSON.stringify(req.user));
        }
    });
}

var deleteDoc = function (req, params, ddoc) {
    return new Promise(function (resolve, reject) {
        if (req.user != undefined) {
            let conn = initConn(params);
            Promise.promisifyAll(conn);

            conn.then(function (cloudantConnection) {
                let cloudantDb = cloudantConnection;

                let author = req.user.id;
                ddoc.author = author;

                deleteDocument(cloudantDb, ddoc, resultInsert => {
                    resolve(resultInsert)
                });
            });
        } else {
            console.log("[DELETE] DOCUMENT PROBLEM: " + JSON.stringify(req.user));
        }
    });
}

var insertDocument = function (cloudantDb, ddoc, callback) {
    cloudantDb.insert(ddoc, function (error, response) {
        if (error) {
            throw error
            callback(true)
        }

        console.log('Created design document with books index')
        callback(true)
    })
};

var deleteDocument = function (cloudantDb, ddoc, callback) {
    cloudantDb.destroy(ddoc._id, ddoc._rev, function (error, response) {
        if (error) {
            throw error
            callback(true)
        }

        console.log('Document deleted')
        callback(true)
    })
};





var updateDocument = function (cloudantDb, ddoc, callback) {
    cloudantDb.insert(ddoc, ddoc._id, function (error, response) {
        if (error) {
            console.log(error)
            throw error
            callback(true)
        }

        console.log('Created design document with books index')
        callback(true)
    })
};

var getDocument = function (params, query) {
    return new Promise(function (resolve, reject) {
        let conn = initConn(params);
        Promise.promisifyAll(conn);
        conn.then(function (cloudantConnection) {
            let cloudantDb = cloudantConnection;

            readViewSearchIndexDocument(cloudantDb, query, result => {
                resolve(result)
            });
        });
    });
};

var readViewSearchIndexDocument = function (cloudantDb, selector, callback) {
    return new Promise(function (resolve, reject) {
        cloudantDb.find(selector, function (err, result) {
            if (err) {
                reject(err)
                throw err;
            }
            callback(result.docs)
        })
    })
};

var searchDuplicatedDescription = function (params, type, description, callback) {
    return new Promise(function (resolve, reject) {
        let conn = initConn(params);
        Promise.promisifyAll(conn);
        conn.then(function (cloudantConnection) {
            cloudantConnection.search('training', 'descriptionDuplicated', { q: 'type:"' + type.toUpperCase() + '" AND description:"' + description.toUpperCase() + '"' }, (err, result) => {
                if (err) {
                    console.log(JSON.stringify(err));
                    reject(err);
                    throw err;
                } else {
                    resolve(result.total_rows);
                }
            });
        });
    });
}

var readViewDocument = function (cloudantDb, design, view, callback) {
    return new Promise(function (resolve, reject) {
        cloudantDb.view(
            design,
            view,
            { 'include_docs': true },
            function (error, response) {
                if (!error) {
                    let result;
                    try {
                        result = JSON.stringfy(response.rows);
                    } catch (err) {
                        result = response.rows;
                    }

                    callback(result);
                } else {
                    // console.error('error', error);
                    reject(error);

                }
            }
        );
    });
};

var readViewSearchIndexDocument = function (cloudantDb, selector, callback) {
    return new Promise(function (resolve, reject) {
        cloudantDb.find(selector, function (err, result) {
            if (err) {
                reject(err)
                throw err;
            }
            callback(result.docs)
        })
    })
};

var initConn = function (message) {
    return new Promise(function (resolve, reject) {

        let cloudantOrError = getCloudantAccount(message);
        if (typeof cloudantOrError !== 'object') {
            return Promise.reject(cloudantOrError);
        }
        let cloudant = cloudantOrError;

        let dbName = message.dbname;
        let docId = message.docid || message.id;
        let params = {};

        if (!dbName) {
            return Promise.reject('dbname is required.');
        }

        let cloudantDb = cloudant.use(dbName);

        if (typeof message.params === 'object') {
            params = message.params;
        } else if (typeof message.params === 'string') {
            try {
                params = JSON.parse(message.params);
            } catch (e) {
                return Promise.reject('params field cannot be parsed. Ensure it is valid JSON.');
            }
        }


        Promise.promisifyAll(cloudantDb);

        resolve(cloudantDb);
    });
};

var getCloudantAccount = function (params) {

    let Cloudant = require('@cloudant/cloudant');
    let cloudant;

    if (!params.iamApiKey && params.url) {
        cloudant = Cloudant(params.url);
    } else {
        checkForBXCreds(params);

        if (!params.host) {
            return 'Cloudant account host is required.';
        }

        if (!params.iamApiKey) {
            if (!params.username || !params.password) {
                return 'You must specify parameter/s of iamApiKey or username/password';
            }
        }

        let protocol = params.protocol || 'https';
        if (params.iamApiKey) {
            let dbURL = `${protocol}://${params.host}`;
            if (params.port) {
                dbURL += ':' + params.port;
            }
            cloudant = new Cloudant({
                url: dbURL,
                plugins: { iamauth: { iamApiKey: params.iamApiKey, iamTokenUrl: params.iamUrl } }
            });
        } else {
            let url = `${protocol}://${params.username}:${params.password}@${params.host}`;
            if (params.port) {
                url += ':' + params.port;
            }
            cloudant = Cloudant(url);
        }
    }
    return cloudant;
};
var checkForBXCreds = function (params) {

    if (params.__bx_creds && (params.__bx_creds.cloudantnosqldb || params.__bx_creds.cloudantNoSQLDB)) {
        let cloudantCreds = params.__bx_creds.cloudantnosqldb || params.__bx_creds.cloudantNoSQLDB;

        if (!params.host) {
            params.host = cloudantCreds.host || (cloudantCreds.username + '.cloudant.com');
        }
        if (!params.iamApiKey && !cloudantCreds.apikey) {
            if (!params.username) {
                params.username = cloudantCreds.username;
            }
            if (!params.password) {
                params.password = cloudantCreds.password;
            }
        } else if (!params.iamApiKey) {
            params.iamApiKey = cloudantCreds.apikey;
        }
    }
}


module.exports = {
    insert,
    insertDocument,
    update,
    updateDocument,
    deleteDoc,
    deleteDocument,
    getDocument,
    readViewSearchIndexDocument,
    readViewDocument,
    readViewSearchIndexDocument,
    initConn,
    getCloudantAccount,
    checkForBXCreds,
    searchDuplicatedDescription
};