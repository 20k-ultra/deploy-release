const core = require('@actions/core');
const github = require('@actions/github');

let owner, repo, sha, octokit;

async function run() {
	try {
		const token = core.getInput('token', { required: true });
		const commitHash = github.context.payload.pull_request.head.sha;
		owner = getOwner(github.context.payload.pull_request.base.repo.url);
		repo = getRepo(github.context.payload.pull_request.base.repo.url);
		sha = getSha(github.context.payload);
		octokit = github.getOctokit(token);

		// Try to get the check which built the release
		const checks = await getCheckRuns(commitHash);
		const buildCheck = getBuildCheck(checks.check_runs);
		// Output the releaseId for the build
		core.setOutput('releaseId', buildCheck.output.text);
		console.log(`Will be deploying release: ${buildCheck.output.text}`);
		// Deploy this release via balena cli
	} catch (error) {
		core.setFailed(error.message);
	}
}

function getBuildCheck(checks) {
	return checks.filter((c) => c.name === 'build release')[0];
}

async function getCheckRuns(sha) {
	return (
		await octokit.request(
			'GET /repos/{owner}/{repo}/commits/{ref}/check-runs',
			{
				owner,
				repo,
				ref: sha,
			},
		)
	).data;
}

function getOwner(url) {
	return new URL(url).pathname.split('/')[2];
}

function getRepo(url) {
	return new URL(url).pathname.split('/')[3];
}

function getSha(context) {
	const url = context.pull_request._links.statuses.href.split('/');
	return url[url.length - 1];
}

run();
