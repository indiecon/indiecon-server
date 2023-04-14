// logger to log the in app errors coming from over the catch blocks into file in logs.
// log file name format: app_NODE_ENV_Date_Month_Year.logs.json (eg: app_development_23_12_2022.logs.json)

const fs = require('fs');
const path = require('path');

// errorId is the code of the responseId of the function like : "fjhajshf837489". You can search the code for the errorId and it would take you to the function where the error was generated.
// err is the error object generated by the catch block.
function errorLogger(errorId, err) {
	try {
		if (err && errorId) {
			const objectToLog = {
				errorId: errorId,
				error: {
					name: err.name ? err.name : 'No Name',
					message: err.message ? err.message : 'No Message',
					stack: err.stack ? err.stack : 'No Stack',
				},
				date: new Date().toString(),
			};

			if (process.env.NODE_ENV === 'development') console.log(objectToLog);

			// below part is for creating the log file based on the environment and on the current date with format as app_Date_Month_Year.logs.json (eg: app_development_23_12_2022.logs.json)
			const accessLogStream = fs.createWriteStream(
				path.join(
					__dirname,
					`../logs/${
						'app_' +
						process.env.NODE_ENV.toString() +
						'_' +
						new Date().getDate() +
						'_' +
						new Date().getMonth() +
						'_' +
						new Date().getFullYear()
					}.logs.json`
				),
				{ flags: 'a+' }
			);

			accessLogStream.write(JSON.stringify(objectToLog) + ' , ');
		}
	} catch (err) {
		console.log("There's an error in the errorLogger function.", err);
		process.exit(1);
	}
}

module.exports = { errorLogger };
