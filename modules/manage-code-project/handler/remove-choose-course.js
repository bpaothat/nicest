'use strict';

/**
 * @module manage-code-project/handler/remove-choose-course
 */

const Projects = require('../../code-project/model/project');
const Courses = require('../../course/model/course');

 /**
  * Allows user to select a course to remove a student from
  * @param {Request} request - Hapi request
  * @param {Reply} reply - Hapi Reply
  * @returns {Null} responds with HTML page
  */
function chooseUserCourseRemove (request, reply) {

    /**
     * Present a view where user can select
     * @param {Projects} projects - metadata for all projects
     * @param {Courses} courses - metadata for courses
     * @returns {Null} responds with HTML page
     */
    function presentView (projects, courses) {
        const courseWithProjects = [];

        projects.forEach((project) => {
            let index = 0;
            while (index < courses.length) {
                const projectCourseID = JSON.stringify(project.course);

                const courseID = JSON.stringify(courses[index]._id;
                    
                if (projectCourseID === courseID) {
                    if (courseWithProjects.indexOf(courses[index]) === -1) {
                        courseWithProjects.push(courses[index]);
                    }
                }
                index += 1;
            }
        });

        const viewInfo = {courses: courseWithProjects};

        reply.view('modules/manage-code-project/view/remove-choose-course', viewInfo);
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

module.exports = chooseUserCourseRemove;
