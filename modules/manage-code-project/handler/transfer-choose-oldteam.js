'use strict';

/**
 * @module manage-code-project/handler/transfer-choose-oldteam
 */

const Projects = require('../../code-project/model/project');

 /**
  * Allows user to choose team that user will be transfered from
  * @param {Request} request - Hapi request
  * @param {Reply} reply - Hapi Reply
  * @returns {Null} responds with HTML page
  */
function chooseUserOldTeamTransfer (request, reply) {
    request
        .yar
        .set({course: request.query});

    function presentView (projects) {
        const viewInfo = {projects: projects};
        reply.view('modules/manage-code-project/view/transfer-choose-oldteam', viewInfo);
    }

    function getProjects () {
        Projects
            .find(request.query)
            .then((projects) => {
                presentView(projects);
            });
    }

    getProjects();
}

module.exports = chooseUserOldTeamTransfer;
