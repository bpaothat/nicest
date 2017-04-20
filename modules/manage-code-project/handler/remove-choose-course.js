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
     * Present a view where user can select course to remove user from
     * @param {Projects} projects - All projects in Nicest
     * @param {Courses} courses - All courses in Nicest
     * @returns {Null} responds with HTML page that allows user to choose a course 
     */
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

        reply.view('modules/manage-code-project/view/remove-choose-course', viewInfo);
    }

    /**
     * Gets all courses in Nicest and passes projects into presentView function
     * @param {Projects} projects - all projects in Nicest
     * @returns {Null} calls presentView function
     */
    function getCourses (projects) {
        Courses
            .find({})
            .then((courses) => {
                presentView(projects, courses);
            });
    }

    /**
     * Gets all projects in Nicest and calls getCourses
     * @returns {Null} calls getCourses function
     */
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
