'use strict';

const teamModel = require('./model/team');
const apiRoute = require('./api/route');
const viewRoute = require('./view/route');

/**
 * Registers the Team plugin
 * @param {Object} server - Hapi Server object
 * @param {Object} options - Plugin specific options
 * @param {Fuction} next - Callback to confirm plugin registration
 * @returns {Null} nothing
 */
function team (server, options, next) {
    server.route(apiRoute);
    server.route(viewRoute);

    server.expose(teamModel);

    next();
}

exports.register = team;

exports.register.attributes = {
    name: 'team',
    version: '0.1.0',
    dependencies: ['user']
};
