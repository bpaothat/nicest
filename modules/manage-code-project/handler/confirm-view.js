'use strict';

/**
 * @module manage-code-project/handler/confirm-view
 */

/**
 * View configuration before generating the project
 * @param {Request} request - Hapi request
 * @param {Reply} reply - Hapi Reply
 * @returns {Null} responds with HTML page
 */
function confirmView (request, reply) {
    const action = request
        .yar
        .get('action');

    const displayInfo = {action: action};

    reply.view('modules/manage-code-project/view/confirm', displayInfo);
}

module.exports = confirmView;
