const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db');


function clean_all() {
    fs.readdir(DB_PATH, (err, files) => {
        if (files) {
            files.forEach(file => {
                const file_path = path.join(DB_PATH, file);

                console.log(`Deleting database file '${file}'...`);

                fs.unlink(file_path, (err) => {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            });
        }
    });
}

clean_all();