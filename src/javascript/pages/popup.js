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
function snapshotData(data, type = 'page') {
	try {
		if (data.error === true) {
			Debug.log('API Data not fetched for ' + url);
			throw new Error(browser.i18n.getMessage('ApiRequestFailed'));
		}

		if (data.available === false) {
			Debug.log('No snapshot returned  for ' + url);
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
	}
}

function createSubdomainChecks(parsed) {
	var subdomainsArray = parsed.subdomain.split('.');
	var select = document.getElementById('subdomain_select');

	// Default 
	var opt = document.createElement('option');
	var value = Url.getProtocol(url) + parsed.subdomain + '.' + parsed.domain;

	opt.value = value;
	opt.innerText = value;
	select.appendChild(opt);

	// More
	if (subdomainsArray.length > 1) {
		subdomainsArray.forEach((subdomain, index) => {
			if (index !== 0) {
				var next = index + 1;

				if (subdomainsArray[next] && subdomainsArray[next] !== subdomain) {
					subdomain += '.' + subdomainsArray[next];
				}

				var opt = document.createElement('option');
				var value = Url.getProtocol(url) + subdomain + '.' + parsed.domain;
	
				opt.value = value;
				opt.innerText = value;
				select.appendChild(opt);
			}
		});

		document.getElementById('subdomain_select').addEventListener('change', function(e) {
			Ui.content('subdomain_message', 'Loading');
			Ui.hide('subdomain_timedate', '');
			Ui.display('subdomain_message');

			getSnapshot(e.target.value, function(data) {
				snapshotData(data, 'subdomain');
			});
		});

		Ui.display('subdomain_select_div');
	}
}

Settings.load().then(data => {
	settings = data;

	Debug.enable(settings.logDebugInfo);
	Debug.log('Settings loaded');

	if (settings.domainCheck === true) {
		Ui.display('domain_details');
	}

	if (settings.subdomainCheck === true) {
		Ui.display('subdomain_details');
	}

	if (settings.pageCheck === false) {
		Ui.hide('page_details');
	}

	var query = {
		currentWindow: true,
		active: true
	}

	return browser.tabs.query(query);
}).then(tabs => {
	var tab = tabs[0];

	// Since chrome 79 (Dec 2019), the property 'pendingUrl' is returned by the tabs.query API when a tab is loading.
	// Firefox (71) does not currently support this property.
	if (tab.status === 'loading' && tab.hasOwnProperty('pendingUrl')) {
		url = tab.pendingUrl;
	} else {
		url = tab.url;
	}

	// Validate the current page URL
	return validate(url);
}).then(valid => {
	if (valid === true) { // URL is valid
		var parsed = psl.parse(Url.getDomain(url));

		if (settings.domainCheck === true) {
			Ui.title('domain_title', Url.getProtocol(url) + parsed.domain);

			getSnapshot(Url.getProtocol(url) + parsed.domain, function(data) {
				snapshotData(data, 'domain');
			});
		}

		if (settings.subdomainCheck === true) {
			try {
				if (Url.isIpAddress(url) === true) {
					throw new Error('Hostname is an IP address');
				}

				if (parsed.subdomain === null) {
					throw new Error('No subdomain detected for: ' + url);
				}

				if (parsed.subdomain === 'www') {
					throw new Error('No non-www subdomain detected for: ' + url);
				}

				var subdomainUrl = Url.getProtocol(url) + parsed.subdomain + '.' +  parsed.domain;

				createSubdomainChecks(parsed);
				Ui.title('subdomain_title', subdomainUrl);

				getSnapshot(subdomainUrl, function(data) {
					snapshotData(data, 'subdomain');
				});

			} catch (exception) {
				Debug.log(exception.message);
				Ui.content('subdomain_message', 'Not detected');
			}
		}

		if (settings.pageCheck === true) {
			Ui.title('page_title', url);

			getSnapshot(url, function(data) {
				snapshotData(data, 'page');
			});
		}
	} else { // URL is not valid.
		Ui.content('overlay-title', '');
		Ui.content('overlay-reason', browser.i18n.getMessage('UrlValidationFailed'));
		Ui.addClass('options-box', 'overlay');

		Ui.display('overlay');
		Ui.hide('main');
	}
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
