module.exports = function (grunt, options) {

    var buildType = grunt.option('buildType');
    var buildVersion = grunt.option('buildVersion');
    var tasks = ['teamcity', 'node_version', 'jshint', 'mochaTest', 'connect', 'lp_blanket_mocha', 'uglify'];

    if ('release' === buildType) {
        tasks.push('lpRelease');
    }

    // computation...
    return {
        'tasks': ['availabletasks'],
        'default': tasks,
        'test': [
            'node_version',
            'mochaTest',
            'connect',
            'lp_blanket_mocha'
        ]
    };
};
