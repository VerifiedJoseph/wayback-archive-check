/*jslint node: true */
/*global browser, Intl */

"use strict";

const Settings = {
	defaults: {
		// Date and time formats
		dateFormat: 'MMMM d, Y', // Default date format (e.g: May 17, 2019)
		timeFormat: 'h:mm a', // Default date time (e.g: 04:16 PM)
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Default timezone from system
		displayFullDate: true, // Display full time and date using user selected formats
		displayTimeSince: false, // Display time past since date (e.g: "1 hour ago")

		hideViewButtons: false,

		domainCheck: false,
		subdomainCheck: false,
		pageCheck: true,

		// Debug
		logDebugInfo: false // Log debug messages in the developer console.
	},

	load: function () {
		return browser.storage.sync.get(this.defaults);
	},

	getDefaults: function () {
		return this.defaults;
	},

	/**
	 * Save updated user settings to storage
	 * @param {object} items
	 * @param {callback} callback
	 * @callback {boolean} status
	 */
	update: function (items) {
		var storage = browser.storage.sync.set(items);

		storage.catch(error => {
			console.log(error);

			return false;
		});

		return true;
	},

	reset: function () {
		return this.update(this.defaults);
	}
}
