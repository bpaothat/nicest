'use strict';

/**
 * @module manage-code-project/task/remove-slack-user
 */

const request = require('request');
const querystring = require('querystring');

/**
 * Promise wrapper for request, abstracts the http api
 * @private
 * @param {Object} data - request object
 * @returns {Promise.<String>} promise will resolve to response body or reject with error code
 */
function requestPromise (data) {
    return new Promise((resolve, reject) => {
        request(data, (error, headers, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}

/**
 *
 * Takes in user meta data and removes user from Slack channels
 * @param {String} accessToken - Slack API access token
 * @param {String} userEmail - User's Slack email
 * @param {Array} groups - {Array} of {String} group id's
 * @returns  {Promise} - Resolved when user has been removed from channels
 */
function removeSlackUser (accessToken, groups) {
    // Collect promises for all channels
    const promises = [];

    // API URL for removing from channels and groups
    const slackChannelURL = 'https://slack.com/api/channels.kick';
    const slackGroupURL = 'https://slack.com/api/groups.kick';

    // API URL for retrieving public channel information
    const slackChannelListURL = 'https://slack.com/api/channels.list';

    const userListURL = 'https://slack.com/api/users.list';

    // Retrieves public channels
    const qs = querystring.stringify({
        exclude_archived: true,
        token: accessToken
    });

    requestPromise({
        json: true,
        method: 'GET',
        uri: `${slackChannelListURL}?${qs}`
    })
        .then((data) => {
            const userListPromise = [];

            const qsUserList = querystring.stringify({
                presence: true,
                token: accessToken
            });

            requestPromise({
                json: true,
                method: 'POST',
                uri: `${userListURL}?${qsUserList}`
            });

            return Promise.all(userListPromise)
                .then((list) => {
                    // Array to store channels
                    const channels = [];

                    // console.log(list[0].profile)
                    // Adds channels to channels array
                    data.channels.forEach((channel) => {
                        channels.push(channel.id);
                    });

                    // Loops through all the public channels the user needs to be removed from
                    channels.forEach((channelID) => {
                        // Pass API method parameters via query string
                        const channelQS = querystring.stringify({
                            channel: channelID,
                            token: accessToken,
                            user: userid
                        });

                        // Removes user from channel
                        promises.push(
                        requestPromise({
                            json: true,
                            method: 'POST',
                            uri: `${slackChannelURL}?${channelQS}`
                        })

                    );
                    });

                    groups.forEach((groupID) => {
                        const groupQS = querystring.stringify({
                            channel: groupID,
                            token: accessToken,
                            user: userid
                        });

                        promises.push(
                        requestPromise({
                            json: true,
                            method: 'POST',
                            uri: `${slackGroupURL}?${groupQS}`
                        })
                    );
                    });

                    return Promise.all(promises);
                }).catch((error) => {
                    console.log(error);
                });
        });
}

module.exports = removeSlackUser;
