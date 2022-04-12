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

/**
 * 
 */
function createMoreChecksList(url) {
	var checks = [];
	var protocol = Url.getProtocol(url);
	var domain = Url.getDomain(url);
	var path = Url.getPath(url);

	if (Url.hasWww(url) === false) {
		checks.push(protocol + 'www.' + domain);

		if (path !== '/') {
			checks.push(protocol + 'www.' + domain + path);
		}
	} 

	if (Url.hasWww(url) === true) {
		var regex = new RegExp('^www\\.', '')
		var domainNoWWW = domain.replace(regex, '');
		console.log(domainNoWWW);

		checks.push(protocol + domainNoWWW);

		if (path !== '/') {
			checks.push(protocol + domainNoWWW + path);
		}
	}

	if (Url.hasSubdomain(url) === true && Url.hasWww(url) === false) {
		console.log(Url.getSubdomain(url));

		var regex = new RegExp('^'+ Url.getSubdomain(url) +'\\.', '')
		var domainNoSub = domain.replace(regex, '');

		checks.push(protocol + domainNoSub);

		if (path !== '/') {
			checks.push(protocol + domainNoSub + path);
		}

		checks.push(protocol + 'www.' + domainNoSub);

		if (path !== '/') {
			checks.push(protocol + 'www.' + domainNoSub + path);
		}
	}

	var select = document.getElementById('checks');

	checks.forEach((url) => {
		var opt = document.createElement('option');
		opt.value = url;
		opt.innerText = url;
		select.appendChild(opt);
	});
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
		if (settings.hideMoreChecksButton === false) {
			Ui.display('more-checks');

			if (Url.isIpAddress(url) === true) {
				Ui.disableInput('more-checks');
				Ui.display('more-checks');
				Ui.title('more-checks', 'Disabled. URL hostname is an IP address');

			} else {
				createMoreChecksList(url);

				// Event listener for more checks button
				document.getElementById('more-checks').addEventListener('click', function () {
					Ui.display('more');
					Ui.hide('main');
					Ui.hide('more-checks');
					Ui.display('back');
				});

				// Event listener for back button
				document.getElementById('back').addEventListener('click', function () {
					Ui.display('main');
					Ui.hide('more');
					Ui.hide('back');
					Ui.hide('check_details');
					Ui.display('more-checks');

					document.getElementById('checks').options[0].selected = true;
				});

				// Event listener for checks dropdown
				document.getElementById('checks').addEventListener('change', function(e) {
					if (Ui.isDisplayed('check_details') === false) {
						Ui.display('check_details');
					}

					Ui.content('check_message', 'Loading');
					Ui.hide('check_timedate', '');
					Ui.hide('copy-button');
					Ui.display('check_message');

					getSnapshot(e.target.value, function(data) {
						Ui.display('copy-button');

						snapshotData(data, 'check');
					});
				});
			}

			// Event listener for copy button
			document.getElementById('copy-button').addEventListener('click', function (e) {
				var value = document.getElementById('checks').value;

				navigator.clipboard.writeText(value).then(function() {
					Debug.log('Copied to clipboard');

					Ui.content('copy-button', 'Copied');
					Ui.disableInput('copy-button');

					setTimeout(function () { // Set Timeout
						Ui.content('copy-button', 'Copy URL');
						Ui.enableInput('copy-button');
					}, 1750);
				}, function(err) {
					console.error('Could not copy: ', err);
				});
			});
		}

		if (settings.domainCheck === true) {
			var domain = Url.getDomain(url);

			getSnapshot(domain, function(data) {
				snapshotData(data, 'domain');
			});
		}

		if (settings.pageCheck === true) {
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
