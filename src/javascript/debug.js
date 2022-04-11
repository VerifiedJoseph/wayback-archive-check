/*jslint node: true */
/*global console */

"use strict";

const Debug = {
	enabled: false,

	/**
	 * Enable logging
	 * @param {boolean} status 
	 */
	enable: function (status) {
		this.enabled = status;
	},

	/**
	 * Log text in the console
	 * @param {string} text
	 */
	log: function (text) {
		if (this.enabled === true && text !== undefined) {
			console.log(text);
		}
	}
}
