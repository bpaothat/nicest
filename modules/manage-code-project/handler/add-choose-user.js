'use strict';

/**
 * @module manage-code-project/handler/add-choose-user
 */

const Projects = require('../../code-project/model/project');
const Teams = require('../../team/model/team');
const Users = require('../../user/model/user');

 /**
  * Allows user to select a user to be added
  * @param {Request} request - Hapi request
  * @param {Reply} reply - Hapi Reply
  * @returns {Null} responds with HTML page
  */
function chooseUserAdd (request, reply) {
    function presentView (team, users) {
        const usersInTeam = [];

        users.forEach((user) => {
            if (team[0].members.indexOf(user._id) === -1) {
                if (usersInTeam.indexOf(user) === -1 && user.role === 'student') {
                    usersInTeam.push(user);
                }
            }
        });

        const viewInfo = {users: usersInTeam};

        reply.view('modules/manage-code-project/view/add-choose-user', viewInfo);
    }

    function getUsers (team) {
        Users
            .find({})
            .then((users) => {
                presentView(team, users);
            });
    }

    function getTeam (teamId) {
        Teams
            .find(teamId)
            .then((team) => {
                getUsers(team);
            });
    }

    function getProject () {
        Projects
            .find(request.query)
            .then((project) => {
                const argument = {};

                argument._id = project[0].team.toString();
                getTeam(argument);
            });
    }

    getProject();
}

module.exports = chooseUserAdd;
