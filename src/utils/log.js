
/** 
 * Set environment parameter to enable logging
 * e.g in launch.json.
 * 
 *  "env": {
			"BRACKET_PEEK_LOGGING": "true"
		},
 */
const loggingEnabled = process.env.BRACKET_PEEK_LOGGING == 'true';

module.exports = function () {
    if (loggingEnabled) console.log(...arguments);
}