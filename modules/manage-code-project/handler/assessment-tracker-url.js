'use strict';

/**
 * @module manage-code-project/handler/assessment-tracker-url
 */

/**
 * Allows user to enter in assessment tracker url
 * @param {Request} request - Hapi request
 * @param {Reply} reply - Hapi Reply
 * @returns {Null} responds with HTML page
 */
function assessmentTrackerUrl (request, reply) {
    const useAssessmentTracker = request
        .yar
        .get("assessmentTracker");
        
    if (useAssessmentTracker !== null) {
        reply.view('modules/manage-code-project/view/assessment-tracker-url', displayInfo);
    } else {
        reply.view('modules/manage-code-project/view/confirm', displayInfo);
    }

}

module.exports = assessmentTrackerUrl;
