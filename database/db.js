const sqlite3 = require('sqlite3').verbose();

// const DB_SOURCE = './db/gent-1.db';
// const DB_SOURCE = './db/IDE-gf.db';

class DBConnector {

    constructor(source) {
        this.db = new sqlite3.Database(source, (err) => {
            if (err) {
                console.log('Could not connect to database', err);
            } else {
                console.log('Successfully connected to database');
            }
        });
    }


    query() {
        const query =
            `SELECT
                ptw.EquipmentId AS EquipmentId,
                ptw.OperationId AS OperationId,
                ptw.TimeWindowType AS OperationType,
                ptw.TimeWindowStart AS TimeStart,
                ptw.TimeWindowEnd AS TimeEnd,
                r.type AS ResourceType
            FROM Resources r INNER JOIN PlannedTimeWindow ptw
            ON r.sId = ptw.EquipmentId`;
            // ORDER BY resource id ???
            // how can i know that resources are ordered? see format method

        return new Promise((resolve, reject) => {
            this.db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.format(rows));
                }
            });
        });
    }


    format(rows) {
        let resource = {};
        let resources = [];

        for (let row of rows) {
            if (resource.id != row.EquipmentId) {
                if (Object.keys(resource).length) {
                    resources.push(resource);
                }
                resource = {};
                resource.operations = [];
                resource.id = row.EquipmentId;
                resource.type = this.get_resource_type(row.ResourceType);
            }
            resource.operations.push({
                id: row.OperationId,
                type: this.get_operation_type(row.OperationType),
                time_start: row.TimeStart,
                time_end: row.TimeEnd
            })
        }
        resources.push(resource);
        return resources;
    }


    get_resource_type(type) {
        switch (type) {
            case 0:
                return 'machines';
            case 2:
                return 'personnel'
            case 3:
                return 'tools';
            default:
                return 'undefined';
        }
    }


    get_operation_type(type) {
        switch (type) {
            case 0:
                return 'iterating';
            case 1:
                return 'installing';
            case 2:
                return 'starting'
            case 3:
                return 'full';
            default:
                return 'undefined';
        }
    }
}

module.exports = DBConnector;
