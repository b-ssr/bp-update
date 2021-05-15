module.exports = {

    random_date: function (start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    },

    random_number: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    resource_type: function(type) {
        switch (type) {
            case 'machines':
                return 0;
            case 'personnel':
                return 2;
            case 'tools':
                return 3;
            default:
                return 99;
        }
    },

    operation_type: function(type) {
        switch (type) {
            case 0:
                return 'iterating';
            case 1:
                return 'installing';
            case 2:
                return 'starting'
            default:
                return 99;
        }
    },

    generate_op_type: function(index, phases_number) {
        switch (phases_number) {
            case 1:
                return 0;
            case 2:
                if (index == 0) {
                    return 1;
                }
                return 0;
            case 3:
            case 4:
                if (index == 0) {
                    return 1;
                } else if (index == 1){
                    return 2;
                }
                return 0;
        }
    }

}