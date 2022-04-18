/*jslint node: true */
/*global chrome, browser */
"use strict";

/*
	Global options
*/
var global = {
	urls: {
		base: 'https://web.archive.org',
		calendar: 'https://web.archive.org/web/*/',
		api: 'https://archive.org/wayback/available'
	},

	// URL and IPv4 validation with hostname capture
	urlRegex: /^https?:\/\/(?:([a-zA-Z0-9-.]{1,256}\.[a-z]{2,20}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)))(?:\:[0-9]{2,4})?\/(?:.+)?$/,
	domainRegex: /^https?:\/\/([a-zA-Z0-9-.]{1,256})/,
	subdomainRegex: /^https:\/\/(?!www\.)([a-zA-Z0-9-]+)\.[a-zA-Z0-9-]+\.[a-z]{2,20}/,
	wwwRegex: /^https?:\/\/www\./,
	protocolRegex: /^https?:\/\//,
	ipRegex: /^https?:\/\/((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\:[0-9]{2,4})?)\//,

	// List of hostnames to not archive
	hostnameDenylist: [
		'archive.org',
		'web.archive.org',
		'127.0.0.1',
		'localhost'
	],
};

/* 
	Check api type (chrome (based. e.g: opera), Firefox or MS Edge)
*/
if (typeof chrome !== 'undefined' && typeof browser === 'undefined') {
	var browser = chrome;
}
