/*jslint node: true */
/*global browser, UI, Snapshot, Settings, global, validate, Format, document, window */
"use strict";

var settings = {};
var url; // URL of the current tab.

/**
 * Create a new tab or update current.
 * @param {string} pageUrl
 */
function tab(pageUrl) {
	if (settings.openInCurrent === true) { // Open URL in the current tab.
		browser.tabs.update({
			url: pageUrl,
			active: true
		});

	} else { // Open URL in a new tab.
		browser.tabs.create({
			url: pageUrl
		});
	}

	// Close the popup. Firefox, MS Edge, and Vivaldi fail to do this automatically.
	window.close();
}

/**
 * Format and display data returned by Wayback Availability API
 * @param {object} response
 */
function snapshotData(data, type ='page') {
	try {
		if (data.error === true) {
			Debug.log('API Data not fetched for ' + url);
			throw new Error(browser.i18n.getMessage('ApiRequestFailed'));
		}

		if (data.available === false) {
			Debug.log('No snapshot returned for ' + url);
			throw new Error(browser.i18n.getMessage('ApiPageNotArchived'));
		}

		Ui.hide(type + '_message');

		// Convert timestamp to ISO 8601 format
		var isoString = Format.convertToIso(data.timestamp);

		if (settings.displayFullDate === true) { // Display Full date and time 
			Ui.content(type + '_date', Format.date(isoString));
			Ui.content(type + '_time', Format.time(isoString));
			Ui.display(type + '_timedate');

		} else { // Display time since (e.g: "1 hour ago")
			Ui.content(type + '_since', Format.timeSince(isoString, settings.timeZoneConvert));
			Ui.title(type + '_since', Format.date(isoString) + ' ' + Format.time(isoString));
			Ui.display(type + '_timesince');
		}

		if (type === 'page' && settings.hideViewButtons === false) {
			Ui.display('archive-version');
			Ui.display('archive-history');

			// Event listener for archive history button
			document.getElementById('archive-history').addEventListener('click', function () {
				tab(global.urls.calendar + url); // Create tab
			});

			// Event listener for archive version button
			document.getElementById('archive-version').addEventListener('click', function () {
				tab(global.urls.base + '/web/' + data.timestamp + '/' + url); // Create tab
			});
		}
	} catch (exception) {
		Ui.content(type + '_message', exception.message);
		//Ui.hide('archive-version');
		//Ui.hide('archive-history');
	}
}

function getDomian(url) {
	var regex = new RegExp(global.domainRegex);
	var domian;
	
	domian = url.match(regex);

	return domian[1];
}

/**
 * Is the URL valid?
 * @param {boolean} status
 */
function isValid(status) {
	if (status === true) { // URL is valid,
		if (settings.domainCheck === true && settings.pageCheck === true) {
			if (settings.hideViewButtons === true) {
				Ui.addClass('archive', 'long');
				Ui.addClass('overlay', 'long');
			} else {
				Ui.addClass('archive', 'long-with-buttons');
				Ui.addClass('overlay', 'long-with-buttons');
			}
		}

		if (settings.domainCheck === true) {
			var domain = getDomian(url);

			Snapshot.get(domain).then(data => {
				snapshotData(data, 'domain');	
			});
		}

		if (settings.pageCheck === true) {
			Snapshot.get(url).then(data => {
				snapshotData(data, 'page');	
			});
		}
	} else { // URL is not valid.
		
		// Disable archive button
		Ui.disableInput('archive-now');

		Ui.content('overlay-title', '');
		Ui.content('overlay-reason', browser.i18n.getMessage('UrlValidationFailed'));

		Ui.display('overlay');
		Ui.hide('page_details');
		Ui.hide('domain_details');

		// Add .overlay to #options-box
		Ui.addClass('options-box', 'overlay');
	}
}

Settings.load().then(data => {
	settings = data;

	Debug.enable(settings.logDebugInfo);
	Debug.log('Settings loaded');

	if (settings.domainCheck === false) {
		Ui.hide('domain_details');
	}

	if (settings.pageCheck === false) {
		Ui.hide('page_details');
	}

	var query = {
		currentWindow: true,
		active: true
	}

	browser.tabs.query(query, tabs => {
		var tab = tabs[0];

		// Since chrome 79 (Dec 2019), the property 'pendingUrl' is returned by the tabs.query API when a tab is loading.
		// Firefox (71) does not currently support this property.
		if (tab.status === 'loading' && tab.hasOwnProperty('pendingUrl')) {
			url = tabs[0].pendingUrl;
		} else {
			url = tabs[0].url;
		}

		console.log(tabs[0]);

		// Validate the current page URL
		validate(url, isValid);
	});
});

/*
	Event listener for opening options page
*/
document.getElementById('options').addEventListener('click', function () {
	browser.tabs.create({
		url: browser.runtime.getURL('html/options.html')
	});

	// Close the popup. Firefox, MS Edge, and Vivaldi fail to do this automatically.
	window.close();
});
