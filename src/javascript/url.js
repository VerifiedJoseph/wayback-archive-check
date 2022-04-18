/*jslint node: true */
/*global console */

"use strict";

const Url = {
	/**
	 * Get protocol from URL
	 * @param {string} url
	 * @return {string} protocol (http:// or https://)
	 */
	getProtocol: function(url) {
		var regex = new RegExp(global.protocolRegex);
		var protocol = url.match(regex);
		return protocol[0];
	},

	/**
	 * Get domain from URL
	 * @param {string} url
	 * @return {string} domain
	 */
	getDomain: function(url) {
		var regex = new RegExp(global.domainRegex);
		var domain = url.match(regex);
		return domain[1];
	},

	/**
	 * Get first subdomain from URL
	 * @param {string} url
	 * @return {string} subdomain
	 */
	getSubdomain: function(url) {
		var regex = new RegExp(global.subdomainRegex);
		var subdomain = url.match(regex);
		return subdomain[1];
	},

	/**
	 * Check if URL hostname is an IP address
	 * 
	 * @param {string} url 
	 * @returns boolean
	 */
	isIpAddress: function(url) {
		return global.ipRegex.test(url);
	}
}
