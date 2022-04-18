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
	 * Get path from URL
	 * @param {string} url
	 * @return {string} URL path
	 */
	getPath: function(url) {
		var regex = new RegExp(global.pathRegex);
		var path = url.match(regex);
		return path[1];
	},

	/**
	 * Check if URL hostname is an IP address
	 * 
	 * @param {string} url 
	 * @returns boolean
	 */
	isIpAddress: function(url) {
		return global.ipRegex.test(url);
	},

	/**
	 * Check if URL hostname has a www. subdomain
	 * 
	 * @param {string} url 
	 * @returns boolean
	 */
	hasWww: function(url) {
		return global.wwwRegex.test(url);
	},

	/**
	 * Check if URL hostname has a non-www subdomain
	 * 
	 * @param {string} url 
	 * @returns boolean
	 */
	hasSubdomain: function(url) {
		return global.subdomainRegex.test(url);
	}
}
