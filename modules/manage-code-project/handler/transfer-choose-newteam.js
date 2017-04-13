'use strict';

/**
 * @module manage-code-project/handler/transfer-choose-newteam
 */

const Projects = require('../../code-project/model/project');

 /**
  * Allows user to choose team that user will be transfered to
  * @param {Request} request - Hapi request
  * @param {Reply} reply - Hapi Reply
  * @returns {Null} responds with HTML page
  */
function chooseUserNewTeamTransfer (request, reply) {
    const course = request
        .yar
        .get('course');

    const oldTeam = request
        .yar
        .get('oldTeam');

    function presentView (projects) {
        const availableTeams = [];

        projects.forEach((project) => {
            if (project._id.toString() !== oldTeam._id) {
                availableTeams.push(project);
            }
        });
        const viewInfo = {projects: availableTeams
            
        reply.view('modules/manage-code-project/view/transfer-choose-newteam', viewInfo);
    }

    function getProjects () {
        Projects
            .find(course)
            .then((projects) => {
                presentView(projects);
            });
    }

    getProjects();
}

module.exports = chooseUserNewTeamTransfer;
