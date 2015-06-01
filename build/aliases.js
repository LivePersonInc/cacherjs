module.exports = function (grunt, options) {

    var tasks = ['node_version', 'jshint', 'mochaTest', 'uglify'];

    // computation...
    return {
        'tasks': ['availabletasks'],
        'default': tasks,
        'test': [
            'node_version',
            'mochaTest'
        ]
    };
};
