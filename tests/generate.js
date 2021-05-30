/**
 * This script generates testing data in a form of SQLite database file,
 * which is then used as an input for visualization.
 * 
 * Testing data need to be described in a config file of /configs folder.
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const utils = require('./utils');

const CONFIG_NAME = 'config.json';
const CONFIG_FILE = path.join(__dirname, 'configs', CONFIG_NAME);
const DB_PATH = path.join(__dirname, 'db');

var db;
generate();

function generate() {
    const databases_data = read_config();
    for (let database_data of databases_data) {
        create_db(database_data);
    }
}


function read_config() {
    const raw_data = fs.readFileSync(CONFIG_FILE);
    return JSON.parse(raw_data);
}


function create_db(database_data) {
    const name = database_data.name;
    const data = database_data.data;

    if (!fs.existsSync(DB_PATH)){
        fs.mkdirSync(DB_PATH);
    }

    const file_path = path.join(DB_PATH, name);
    db = new sqlite3.Database(file_path, function() {
        create_table(data);
    });
}


function create_table(data) {
    db.run(`CREATE TABLE IF NOT EXISTS Resources (
        Id INTEGER PRIMARY KEY,
        sId TEXT,
        type INTEGER)`);

    db.run(`CREATE TABLE IF NOT EXISTS PlannedTimeWindow (
        Id INTEGER PRIMARY KEY,
        OperationId TEXT,
        EquipmentId TEXT,
        TimeWindowType INTEGER,
        TimeWindowStart TEXT,
        TimeWindowEnd TEXT,
        Layer INTEGER)`, function() {
            insert_rows(data);
        });
}


function insert_rows(data) {
    const r_stmt = db.prepare(`INSERT INTO Resources
        (sId, type) VALUES (?,?)`);
    const ptw_stmt = db.prepare(`INSERT INTO PlannedTimeWindow
        (OperationId, EquipmentId, TimeWindowType, TimeWindowStart, TimeWindowEnd, Layer) VALUES (?,?,?,?,?,?)`);

    const date_start = new Date(data.date_start);
    const date_end = new Date(data.date_end);

    for (let category of data.categories) {
        // make operations for each resource in category
        for (let i = 0; i < category.details.res_number; i++) {

            const resource = make_resource(category, i);
            r_stmt.run(resource.id, resource.type);

            // if 'layers' is set, generate random number of them
            let layers;
            if (resource.layers) {
                layers = utils.random_number(1, 5);
            } else {
                layers = 1;
            }

            for (let layer = 1; layer <= layers; layer++) {
                const operations = make_operations(date_start, date_end, category, resource, layer);

                for (let op of operations) {
                    ptw_stmt.run(op.op_id, op.res_id, op.op_type,
                        op.time_start.toISOString(), op.time_end.toISOString(), op.layer);
                }
            }
        }
    }
}


function make_resource(category, index) {
    const resource = {};

    resource.id = category.type + '-' + (index + 1);
    resource.type = utils.resource_type(category.type);

    resource.layers = false;
    if (category.details.layers) {
        // 30% of resources of this category have multiple layers
        if (Math.random() < 0.3) {
            resource.layers = true;
        }
    }

    return resource;
}


function make_operations(date_start, date_end, category, resource, layer) {
    const operations = [];

    // array of random dates, each one is start of full operation
    const dates = [];
    // ops_number - number of full operations
    const ops_number = utils.random_number(category.details.ops_range[0], category.details.ops_range[1]);
    for (let i = 0; i < ops_number; i++) {
        dates.push(utils.random_date(date_start, date_end));
    }
    dates.sort((a, b) => a - b);

    // make phase operations for each full operation
    for (let i = 0; i < ops_number; i++) {
        let min_date = dates[i];
        let max_date = (i + 1 < ops_number) ? dates[i + 1] : date_end;

        let operation_id = resource.id + '---op-' + (i + 1);
        if (resource.layers) {
            operation_id += '---layer' + layer;
        }

        const phases = make_phases(min_date, max_date, resource, layer, operation_id);
        operations.push(...phases);
    }

    return operations;
}


function make_phases(min_date, max_date, resource, layer, operation_id) {
    const phases = [];
    const phases_number = utils.random_number(1, 4);

    // each full operation consists of at minimum one phase operation
    for (let i = 0; i < phases_number; i++ ) {
        // phase operations go one after another
        // all of them finish before next full operation
        const time_start = min_date;
        const time_end = utils.random_date(min_date, max_date);

        const phase = {};

        phase.op_id = operation_id;
        phase.res_id = resource.id;
        phase.op_type = utils.generate_op_type(i, phases_number);
        phase.time_start = time_start;
        phase.time_end = time_end;
        phase.layer = layer;

        phases.push(phase);

        // does next phase starts right after previous one?
        if (utils.random_number(1, 2) == 1) {
            min_date = time_end;
        } else {
            min_date = utils.random_date(time_end, max_date);
        }
    }

    return phases;
}
