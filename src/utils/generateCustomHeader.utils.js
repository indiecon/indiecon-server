// function to generate custom header for testing in the localhost

const encrypt = require('./encrypt.utils');

export const generateCustomHeader = () => {
	const origin = 'localhost';
	const timestamp = new Date().getTime();
	const randomString =
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15);

	const headerString = `${origin}::${timestamp}::${randomString}`;
	return {
		'x-custom-header-development: ': encrypt(headerString).responsePayload,
	};
};
