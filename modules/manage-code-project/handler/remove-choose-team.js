'use strict';

/**
 * @module manage-code-project/handler/remove-choose-team
 */

const Projects = require('../../code-project/model/project');

 /**
  * Allows user to remove a member from a code project
  * @param {Request} request - Hapi request
  * @param {Reply} reply - Hapi Reply
  * @returns {Null} responds with HTML page
  */
function chooseUserTeamRemove (request, reply) {
    function presentView (projects) {
        const viewInfo = {
            projects: projects
        };

        reply.view('modules/manage-code-project/view/remove-choose-team', viewInfo);
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

module.exports = chooseUserTeamRemove;
