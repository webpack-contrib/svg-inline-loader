var webpackConf = {
    cache: true,
    debug: true,
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                test: /\.json$/,
                loaders: ['json'],
            },
        ]
    },
    entry: [
        './index.js'
    ],
    resolve: {
        extensions: ["", ".js", ".jsx"],
    },
};

module.exports = function(config) {
    var conf = {
        basePath: '.',
        frameworks: ['mocha'],
        files: [
            './tests/**/*.js',
        ],
        exclude: [],
        preprocessors: {
            './tests/**/*.js': ['webpack'],
        },
        reporters: ['spec'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_DEBUG,
        browsers: ['Chrome'],
        browserNoActivityTimeout: 100000,
        plugins: [
            'karma-spec-reporter',
            'karma-mocha',
            'karma-chrome-launcher',
            'karma-webpack',
        ],
        webpack: webpackConf,
        autoWatch: true,
        singleRun: false
    };

    if (process.env.NODE_ENV === 'CI') {
        conf.autoWatch = false;
        conf.singleRun = true;
    }

    config.set(conf);
};
