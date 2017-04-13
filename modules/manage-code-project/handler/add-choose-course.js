'use strict';

/**
 * @module manage-code-project/handler/add-choose-course
 */

const Projects = require('../../code-project/model/project');
const Courses = require('../../course/model/course');

 /**
  * Allows user to select course to add student to
  * @param {Request} request - Hapi request
  * @param {Reply} reply - Hapi Reply
  * @returns {Null} responds with HTML page
  */
function chooseUserCourseAdd (request, reply) {
    function presentView (projects, courses) {
        const courseWithProjects = [];

        projects.forEach((project) => {
            let index = 0;
            
            while (index < courses.length) {
                const projectCourseID = JSON.stringify(project.course);

                const courseID = JSON.stringify(courses[index]._id);

                if (projectCourseID === courseID) {
                    if (courseWithProjects.indexOf(courses[index]) === -1) {
                        courseWithProjects.push(courses[index]);
                    }
                }
                index += 1;
            }
        });

        const viewInfo = {courses: courseWithProjects};

        reply.view('modules/manage-code-project/view/add-choose-course', viewInfo);
    }

    function getCourses (projects) {
        Courses
            .find({})
            .then((courses) => {
                presentView(projects, courses);
            });
    }

    function getProjects () {
        Projects
            .find({})
            .then((projects) => {
                getCourses(projects);
            });
    }

    getProjects();
}

module.exports = chooseUserCourseAdd;
