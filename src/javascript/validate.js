/*jslint node: true */
/*global debug, global */

"use strict";

/**
 * Validate a URL or IP address (IPv4)
 * @param {string} url
 * @return {boolean}
 */
function validate(url) {
	var hostname,
		urlRegex = new RegExp(global.urlRegex);

	Debug.log('Vaildating URL: ' + url);

	try {
		// Validate URL format
		if (urlRegex.test(url) === false) {
			throw new Error('URL format is not valid: ' + url);
		}

		// Get hostname with regex
		hostname = url.match(urlRegex);

		// Check deny list for hostname 
		if (global.hostnameDenylist.includes(hostname[1])) {
			throw new Error('URL hostname in deny list, blocking archive.');
		}

		Debug.log('URL is valid: ' + url);

		return true;
	} catch (exception) {
		return false;
		Debug.log(exception.message);
	}
}
