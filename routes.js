const { postTranslateHandler, getTranslateHistoryHandler } = require('./handler');

const routes = [
    {
        method: 'POST',
        path: '/translate',
        handler: postTranslateHandler
    },
    {
        method: 'GET',
        path: '/translate/history',
        handler: getTranslateHistoryHandler
    }
];

module.exports = routes;