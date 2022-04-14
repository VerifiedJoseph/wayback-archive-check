/*jslint node: true */
/*global Audio, UI, Format, global, document, setTimeout, Intl */
"use strict";

var settings = {};
var defaults = Settings.getDefaults();

/**
 * Display the settings
 * @param {object} list
 */
function displaySettings(list) {
	// Timezone
	document.getElementById('timezone').value = list.timeZone;

	// Date format
	document.getElementById('date_format').value = list.dateFormat;

	// Time format
	document.getElementById('time_format').value = list.timeFormat;

	// Full date and time
	document.getElementById('full_date_time').checked = list.displayFullDate;

	// Time since
	document.getElementById('time_since_archive').checked = list.displayTimeSince;

	document.getElementById('page_check').checked = list.pageCheck;
	document.getElementById('domain_check').checked = list.domainCheck;
	document.getElementById('subdomain_check').checked = list.subdomainCheck;

	document.getElementById('hide_view_buttons').checked = list.hideViewButtons;

	// Log debug messages
	document.getElementById('debug_log').checked = list.logDebugInfo;

	// Disable the date and time options if 'full_date_time' is false. 
	if (list.displayFullDate === false) {
		// Grey out the option text
		Ui.addClass('note-date', 'disabled');
		Ui.addClass('note-time', 'disabled');

		// Disable the select dropdowns
		Ui.disableInput('date_format');
		Ui.disableInput('time_format');
	}
}

/*
 * Display current date and time as date/time select options.
 */
function displayDateTime() {
	var date = new Date(),
		dateSelect = document.getElementById('date_format'),
		timeSelect = document.getElementById('time_format');

	// Date formats
	dateSelect.options[0].textContent = Format.date(date, 'MMMM d, Y');
	dateSelect.options[1].textContent = Format.date(date, 'Y/m/d');
	dateSelect.options[2].textContent = Format.date(date, 'd/m/Y');
	dateSelect.options[3].textContent = Format.date(date, 'm/d/Y');

	// Time formats
	timeSelect.options[0].textContent = Format.time(date, 'h:mm a');
	timeSelect.options[1].textContent = Format.time(date, 'h:mm:ss a');
	timeSelect.options[2].textContent = Format.time(date, 'HH:mm');
	timeSelect.options[3].textContent = Format.time(date, 'HH:mm:ss');
}

function displayTimeZones() {
	var select = document.getElementById('timezone'),
		opt;

	// Set default (Automatic) timezone
	opt = document.createElement('option');
	opt.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
	opt.innerText = 'Automatic';
	opt.title = 'Automatic time zone: ' + Intl.DateTimeFormat().resolvedOptions().timeZone;
	select.appendChild(opt);

	// Create timezone list
	timezones.forEach(function (timezone) {
		opt = document.createElement('option');
		opt.value = timezone;
		opt.innerText = timezone;

		select.appendChild(opt);
	});
}

/**
 * Show message
 * @param {string} text
 * @param {string} text
 */
function message(text, hide = true) {
	Ui.content('status', text);
	Ui.display('status');

	if (hide === true) {
		setTimeout(function () { // Set Timeout
			Ui.hide('status');
		}, 1750);
	}
}


/*
	Save updated user settings
*/
function saveSettings() {
	var items = {
		timeZone: document.getElementById('timezone').value,
		dateFormat: document.getElementById('date_format').value,
		timeFormat: document.getElementById('time_format').value,

		displayFullDate: document.getElementById('full_date_time').checked,
		displayTimeSince: document.getElementById('time_since_archive').checked,

		pageCheck: document.getElementById('page_check').checked,
		domainCheck: document.getElementById('domain_check').checked,
		subdomainCheck: document.getElementById('subdomain_check').checked,
		hideViewButtons: document.getElementById('hide_view_buttons').checked,

		logDebugInfo: document.getElementById('debug_log').checked
	};

	if (items.pageCheck === false && items.domainCheck === false && items.subdomainCheck === false) {
		message('At least one check archive status option must be enabled', false);

	} else {
		var status = Settings.update(items);

		if (status === true) {
			message('Options saved');

		} else {
			message('An error occurred, Try again');
		}
	}
}

/*
	Reset user settings to defaults
*/
function resetSettings() {
	var status = Settings.reset();

	if (status === true) {
		message('Options reset');
		displaySettings(defaults);

	} else {
		message('An error occurred, try again');
	}
}

/*
	InputEvent handler callback
*/
function inputEventHandler(event) {
	var input = event.target;

	switch (input.id) {
		case 'full_date_time': // Display full date and time

			if (input.checked) {
				Ui.enableInput('date_format');
				Ui.enableInput('time_format');
				Ui.removeClass('note-date', 'disabled');
				Ui.removeClass('note-time', 'disabled');
			}

			break;
		case 'time_since_archive': // Display time since last archive

			if (input.checked) {
				Ui.addClass('note-date', 'disabled');
				Ui.addClass('note-time', 'disabled');

				Ui.disableInput('date_format');
				Ui.disableInput('time_format');
			}

			break;
		case 'save': // Save user options
			saveSettings();

			break;
		case 'reset': // Reset user options
			Ui.display('confirm');
			Ui.hide('options');

			break;
		case 'yes': // Yes, reset user options confirmed
			resetSettings();

			Ui.hide('confirm');
			Ui.display('options');

			break;
		case 'no': // No, hide rest confirm div
			Ui.hide('confirm');
			Ui.display('options');

			break;
	}
}

Settings.load().then(data => {
	settings = data;

	Debug.enable(settings.logDebugInfo);
	Debug.log('Settings loaded');

	displayDateTime();
	displayTimeZones();
	displaySettings(settings);
})

/*
	Add event listener for user inputs
*/
document.querySelector('body').addEventListener('click', inputEventHandler);
