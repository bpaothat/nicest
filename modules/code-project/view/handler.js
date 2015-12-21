'use strict';

const Octokat = require('octokat');
const User = require('../../user/model/user');
const Team = require('../../team/model/team');
const gatherGithubUsers = require('../task/gather-github-users');
const createGithubRepositories = require('../task/create-github-repositories');
const createTaigaBoards = require('../task/create-taiga-boards');
const seedGitRepositories = require('../task/seed-git-repositories');
const gatherCaUsers = require('../task/gather-ca-users');
const configureCaDashboard = require('../task/configure-ca-dashboard');
const httpInternalServerError = 500;

module.exports = {
    redirect (request, reply) {
        const prefix = request.route.realm.modifiers.route.prefix;

        if (typeof request.session.get('github-username') === 'string' && typeof request.session.get('github-password') === 'string') {
            reply().redirect(`${prefix}/recipe/code-project/choose-students`);
        } else {
            reply().redirect(`${prefix}/recipe/github/login?next=${prefix}/recipe/code-project/choose-students`);
        }
    },
    chooseStudents (request, reply) {
        if (request.query.type === 'team') {
            request.session.set({
                'code-project-student-type': 'team'
            });
            Team
                .find({})
                .select('_id name')
                .exec()
                .then((teams) => {
                    reply.view('modules/code-project/view/choose-students', {
                        students: teams,
                        studentType: 'team'
                    });
                });
        } else {
            request.session.set({
                'code-project-student-type': 'indvidual'
            });
            User
                .find({})
                .select('_id name')
                .exec()
                .then((users) => {
                    reply.view('modules/code-project/view/choose-students', {
                        students: users,
                        studentType: 'individual'
                    });
                });
        }
    },
    selectStudents (request, reply) {
        const prefix = request.route.realm.modifiers.route.prefix;

        request.session.set({
            'code-project-students': request.payload.students
        });

        reply().redirect(`${prefix}/recipe/code-project/choose-repository`);
    },
    chooseRepository (request, reply) {
        const Github = new Octokat({
            username: request.session.get('github-username'),
            password: request.session.get('github-password')
        });

        Github.me.repos.fetch().then((repos) => {
            reply.view('modules/code-project/view/choose-repository', {repos});
        });
    },
    selectRepository (request, reply) {
        const prefix = request.route.realm.modifiers.route.prefix;

        request.session.set({
            'github-project-repo': request.payload.repo,
            'github-project-is-private': request.payload.isPrivate,
            'github-project-has-wiki': request.payload.hasWiki,
            'github-project-has-issue-tracker': request.payload.hasIssueTracker
        });

        reply().redirect(`${prefix}/recipe/code-project/choose-issue-tracker`);
    },
    chooseIssueTracker (request, reply) {
        reply.view('modules/code-project/view/choose-issue-tracker');
    },
    selectIssueTracker (request, reply) {
        const prefix = request.route.realm.modifiers.route.prefix;

        request.session.set({
            'taiga-project-use-taiga': request.payload.useTaiga,
            'taiga-project-description': request.payload.description,
            'taiga-project-is-private': request.payload.isPrivate,
            'taiga-project-has-issues': request.payload.hasIssues,
            'taiga-project-has-backlog': request.payload.hasBacklog,
            'taiga-project-has-kanban': request.payload.hasKanban,
            'taiga-project-has-wiki': request.payload.hasWiki
        });

        if (request.payload.useTaiga) {
            reply().redirect(`${prefix}/recipe/code-project/taiga-login`);
        } else {
            reply().redirect(`${prefix}/recipe/code-project/choose-assessment-system`);
        }
    },
    loginView (request, reply) {
        reply.view('modules/code-project/view/taiga-login');
    },
    loginAction (request, reply) {
        const prefix = request.route.realm.modifiers.route.prefix;

        request.session.set({
            'taiga-username': request.payload.username,
            'taiga-password': request.payload.password
        });

        reply().redirect(`${prefix}/recipe/code-project/choose-assessment-system`);
    },
    chooseAssessmentSystem (request, reply) {
        reply.view('modules/code-project/view/choose-assessment-system');
    },
    selectAssessmentSystem (request, reply) {
        const prefix = request.route.realm.modifiers.route.prefix;

        request.session.set({
            'assessment-use-ca-dashboard': request.payload.useCADashboard
        });

        reply().redirect(`${prefix}/recipe/code-project/confirm`);
    },
    confirmView (request, reply) {
        const studentType = request.session.get('code-project-student-type');
        const repo = request.session.get('github-project-repo');
        const objectIds = request.session.get('code-project-students');

        if (studentType === 'team') {
            Team
                .find({
                    _id: {
                        $in: objectIds
                    }
                })
                .populate('members')
                .exec()
                .then((teams) => {
                    for (let teamIndex = 0; teamIndex < teams.length; teamIndex += 1) {
                        // find any invalid users
                        for (let userIndex = 0; userIndex < teams[teamIndex].members.length; userIndex += 1) {
                            const currentUser = teams[teamIndex].members[userIndex];

                            if (!currentUser.modules.github || !currentUser.modules.github.username || !currentUser.modules.taiga || !currentUser.modules.taiga.email) {
                                teams[teamIndex].hasInvalidMember = true;
                            }
                        }
                    }

                    reply.view('modules/code-project/view/confirm', {
                        repoUrl: `https://github.com/${repo}`,
                        repoName: (/[A-Za-z0-9\-]+$/).exec(repo),
                        studentType: 'team',
                        students: teams
                    });
                });
        } else {
            User
                .find({
                    _id: {
                        $in: objectIds
                    }
                })
                .select('_id name modules')
                .exec()
                .then((students) => {
                    reply.view('modules/code-project/view/confirm', {
                        repoUrl: `https://github.com/${repo}`,
                        repoName: (/[A-Za-z0-9\-]+$/).exec(repo),
                        studentType: 'user',
                        students
                    });
                });
        }
    },
    confirm (request, reply) {
        const prefix = request.route.realm.modifiers.route.prefix;

        const githubUsername = request.session.get('github-username');
        const githubPassword = request.session.get('github-password');
        const seedRepository = request.session.get('github-project-repo');
        const students = request.session.get('code-project-students');
        const isPrivate = request.session.get('github-project-is-private');
        const hasWiki = request.session.get('github-project-has-wiki');
        const hasIssueTracker = request.session.get('github-project-has-issue-tracker');
        const studentType = request.session.get('code-project-student-type');
        const useTaiga = request.session.get('taiga-project-use-taiga');
        const useAssessment = request.session.get('assessment-use-ca-dashboard');
        let githubRepositories;

        // Gather Github user information from Users/Teams
        gatherGithubUsers(seedRepository, githubUsername, studentType, students)

            // create repostories
            .then((temporaryGithubRepositories) => {
                githubRepositories = temporaryGithubRepositories;

                return createGithubRepositories(githubUsername, githubPassword, githubRepositories, {
                    private: isPrivate,
                    has_wiki: hasWiki,
                    has_issues: hasIssueTracker
                });
            })

            // create Taiga boards
            .then(() => {
                if (useTaiga) {
                    const taigaUsername = request.session.get('taiga-username');
                    const taigaPassword = request.session.get('taiga-password');
                    const taigaOptions = {
                        description: request.session.get('taiga-project-description'),
                        isPrivate: request.session.get('taiga-project-is-private'),
                        isBacklogActived: request.session.get('taiga-project-has-backlog'),
                        isIssuesActived: request.session.get('taiga-project-has-issues'),
                        isKanbanActivated: request.session.get('taiga-project-has-kanban'),
                        isWikiActivated: request.session.get('taiga-project-has-wiki')
                    };

                    createTaigaBoards(taigaUsername, taigaPassword, githubRepositories, taigaOptions);
                }
            })

            // gather CA Dashboard users
            .then(() => {
                if (useAssessment) {
                    return gatherCaUsers(seedRepository, githubUsername, studentType, students);
                }
                return null;
            })

            // setup CA Dashboard
            .then((caConfiguration) => {
                if (useAssessment) {
                    return configureCaDashboard(caConfiguration);
                }
                return null;
            })

            // add seed code to repositories
            // FIXME this is last because it can sometimes trigger a core dump crash
            .then(() => {
                const seedRepositoryURL = `https://github.com/${githubUsername}/${(/[A-Za-z0-9\-]+$/).exec(seedRepository)}`;
                const githubUrls = githubRepositories.map((element) => {
                    return element.url;
                });

                return seedGitRepositories(githubUsername, githubPassword, seedRepositoryURL, githubUrls);
            })

            // sucess redirect
            .then(() => {
                reply().redirect(`${prefix}/recipe/code-project/success`);
            })

            // failure redirect
            .catch((err) => {
                request.log('error', err.toString());
                reply().redirect(`${prefix}/recipe/code-project/error`);
            });
    },
    successView (request, reply) {
        reply.view('modules/code-project/view/success');
    },
    errorView (request, reply) {
        reply.view('modules/code-project/view/error').code(httpInternalServerError);
    }
};
