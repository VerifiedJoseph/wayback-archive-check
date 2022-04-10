/*jslint node: true */
/*global settings, Intl, spacetime */

"use strict";

const Format = {
	/**
	 * Convert 14 digit Wayback Availability API timestamp (YYYYMMDDhhmmss) into ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
	 * @param {string} timestamp API timestamp
	 * @return {string}
	 */
	convertToIso: function (timestamp) {
		return timestamp.replace(
			/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
			'$1-$2-$3T$4:$5:$6Z'
		);
	},

	/**
	 * Format time stamp into a readable date format
	 * @param {string} isoString Date in ISO 8601 format
	 * @param {string} customFormat Custom date format
	 * @return {string}
	 */
	date: function(isoString, customFormat) {
		var d = spacetime(isoString),
			format = settings.dateFormat;

		if (customFormat) {
			format = customFormat;
		}

		// Set timezone
		d = d.goto(settings.timeZone);

		if (format === 'Y/m/d' || format === 'ymd') {
			return d.format('ymd');
		}

		if (format === 'd/m/Y' || format === 'dmy') {
			return d.format('dmy');
		}

		if (format === 'm/d/Y' || format === 'mdy') {
			return d.format('mdy');
		}

		// default - April 04, 2018
		return d.unixFmt('MMMM d, Y');
	},

	/**
	 * Format time stamp into a readable time format
	 * @param {string} isoString Date in ISO 8601 format
	 * @param {string} customFormat Custom date format
	 * @return {string}
	 */
	time: function (isoString, customFormat) {
		var d = spacetime(isoString),
			format = settings.timeFormat;

		if (customFormat) {
			format = customFormat;
		}

		// Set timezone
		d = d.goto(settings.timeZone);

		if (format === 'h:mm a' || format === 'g:i A') { // 12 Hour clock
			return d.unixFmt('hh:mm a');
		}

		if (format === 'h:mm:ss a' || format === 'g:i:s A') { // 12 Hour clock with seconds
			return d.unixFmt('hh:mm:ss a');
		}

		if (format === 'HH:mm' || format === 'H:i') { // 24 Hour clock
			return d.format('time-24');
		}

		if (format === 'HH:mm:ss' || format === 'H:i:s') { // 24 Hour clock with seconds
			return d.unixFmt('HH:mm:ss');
		}

		// default - 12 Hour clock
		return d.unixFmt('HH:mm a');
	},

	/**
	 * Format time stamp to a time ago string. example: "1 hour ago"
	 * @param {string} isoString
	 * @return {string}
	 */
	timeSince: function (isoString) {
		var before = spacetime(isoString),
			now = spacetime();

		// Set timezone
		before = before.goto(settings.get('timeZone'));
		now = now.goto(settings.get('timeZone'));

		var diif = now.since(before).diff;

		if (diif.years > 1) {
			return diif.years + ' years ago';
		}

		if (diif.years === 1) {

			if (diif.months > 0) {
				return '1 year, ' + diif.months + ' months ago';
			}

			if (diif.days > 0) {
				return '1 year, ' + diif.days + ' days ago';
			}

			return '1 year ago';
		}

		if (diif.months > 1) {

			if (diif.days > 0) {
				return diif.months + ' months, ' + diif.days + ' days ago';
			}

			return diif.months + " months ago";
		}

		if (diif.months === 1) {

			if (diif.days > 0) {
				return '1 month, ' + diif.days + ' days ago';
			}

			return '1 month ago';
		}

		if (diif.days > 1) {
			return diif.days + ' days ago';
		}

		if (diif.days === 1) {
			return '1 days ago';
		}

		if (diif.hours === 1) {
			return '1 hour ago';
		}

		if (diif.hours > 1) {
			return diif.hours + " hours ago";
		}

		if (diif.minutes === 1) {
			return diif.minutes + " minute ago";
		}

		if (diif.minutes > 1) {
			return diif.minutes + " minutes ago";
		}

		return diif.seconds + " seconds ago";
	}
}
