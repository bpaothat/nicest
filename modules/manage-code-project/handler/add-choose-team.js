'use strict';

/**
 * @module manage-code-project/handler/add-choose-team
 */

const Projects = require('../../code-project/model/project');

 /**
  * Allows user to select team to add user to
  * @param {Request} request - Hapi request
  * @param {Reply} reply - Hapi Reply
  * @returns {Null} responds with HTML page
  */
function chooseUserTeamAdd (request, reply) {
    function presentView (projects) {
        const viewInfo = {projects: projects};

        reply.view('modules/manage-code-project/view/add-choose-team', viewInfo);
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

module.exports = chooseUserTeamAdd;
