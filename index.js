const core = require('@actions/core');
const github = require('@actions/github');

try {
  console.log('I am running because a PR was closed and merged into master.')
  console.log(`I need to find the releaseID from the PR which triggered this.`);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}