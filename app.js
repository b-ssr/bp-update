const express = require('express');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const DBConnector = require('./database/db.js');

const port = 3003;
const app = express();


app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(fileUpload());


let DB_FILE = null;
const UPLOAD_PATH = path.join(__dirname, 'upload');

app.get('/', (req, res) => {
    clear_upload();
    res.render('index.html');
});


app.post('/upload', (req, res) => {
    DB_FILE = req.files.dbFile;

    if (!fs.existsSync(UPLOAD_PATH)){
        fs.mkdirSync(UPLOAD_PATH);
    }
    const filePath = path.join(UPLOAD_PATH, DB_FILE.name);

    DB_FILE.mv(filePath, function(err) {
        if (err) {
            // TODO show error message
            console.log('UPLOAD ERROR!');
            // res.send('UPLOAD ERROR: ' + error.message);
            res.redirect('/');
        } else {
            res.redirect('/chart');
        }
    });
});


app.get('/chart', (req, res) => {
    if (DB_FILE) {
        const db = new DBConnector(path.join(UPLOAD_PATH, DB_FILE.name));

        db.query().then((data) => {
            res.render('chart.html', { data: JSON.stringify(data) });
        }).catch((error) => {
            // TODO show error message
            console.log('DATABASE ERROR!');
            // res.send('DATABASE ERROR: ' + error.message);
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});


app.get('/favicon.ico', (req, res) => res.sendStatus(204))


function clear_upload() {
    fs.readdir(UPLOAD_PATH, (err, files) => {
        if (files) {
            files.forEach(file => {
                fs.unlink(path.join(UPLOAD_PATH, file), (error) => {
                    if (!error) {
                        console.log("Database file '" + file + "' was deleted from /upload directory.");
                    }
                });
            });
        }
    });
}

app.listen(port);
