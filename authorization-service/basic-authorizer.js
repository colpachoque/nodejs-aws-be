const generatePolicy = (principalId, resource, effect = 'Allow') => ({
	principalId,
	policyDocument: {
		Version: '2012-10-17',
		Statement: [
			{
				Action: 'execute-api:Invoke',
				Effect: effect,
				Resource: resource,
			}
		]
	}
});

export const basicAuthorizer = (event, context, callback) => {
	console.log('In basic authorizer', event);

	if (event['type'] !== 'TOKEN') {
		callback('Unauthorized');
	}

	try {
		const authToken = event.authorizationToken,
			encodedCredentials = authToken.split(' ')[1],
			buff = Buffer.from(encodedCredentials, 'base64'),
			plainCredentials = buff.toString('utf-8').split(':'),
			username = plainCredentials[0],
			password = plainCredentials[1],
			storedPassword = process.env[username],
			effect = !storedPassword || storedPassword !== password ? 'Deny' : 'Allow',
			policy = generatePolicy(encodedCredentials, event.methodArn, effect);

		console.log('Stored password', storedPassword);
		console.log('Process env username', process.env);
		console.log(`username - ${username}, password - ${password}`);
		callback(null, policy);

	} catch (e) {
		callback(`Unauthorized: ${e.message}`);
	}
};
