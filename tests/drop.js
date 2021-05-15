const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db');

const R_TABLE = 'Resources';
const PTW_TABLE = 'PlannedTimeWindow';


function drop_all() {
    fs.readdir(DB_PATH, (err, files) => {
        if (files) {
            files.forEach(file => {
                const file_path = path.join(DB_PATH, file);

                const db = new sqlite3.Database(file_path);

                console.log(`Dropping table '${R_TABLE}' from database '${file}'...`);
                db.run('DROP TABLE IF EXISTS ' + R_TABLE, function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });

                console.log(`Dropping table ${PTW_TABLE}' from database '${file}'...`);
                db.run('DROP TABLE IF EXISTS ' + PTW_TABLE, function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            });
        }
    });
}

drop_all();