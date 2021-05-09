const express = require('express');
const path = require('path');
const DBConnector = require('./database/db.js')

const port = 3003;
const app = express();

app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/go', (req, res) => {
    // const db_conn = new DBConnector('./database/source/gent-1.db');
    const db_conn = new DBConnector('./database/source/IDE-gf.db');

    db_conn.query().then((data) => {
        console.log('done!');
        res.send(data);
    }, (err) => {
        console.log('Error!', err.message);
        // TODO add error handler
        // if (err && err.code === 'QLITE_ERROR') {
        //     console.log('Some SQL problem occurred. Check your database please.');
        // }
    });

});

app.get('/favicon.ico', (req, res) => res.sendStatus(204))

app.listen(port);
