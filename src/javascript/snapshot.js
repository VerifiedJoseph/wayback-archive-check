/*jslint node: true */
/*global global */

"use strict";

function getSnapshot(url, callback) {
	var data = {
		available: false,
		error: true,
		timestamp: ''
	};

	fetch(global.urls.api, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
		},
		body: 'url=' + encodeURIComponent(url)
	})
	.then(async (response) => {
		var json = await response.json();

		data.error = false;

		if (response.status === 200) {
			if (json.results[0].archived_snapshots.hasOwnProperty('closest')) {
				data.available = json.results[0].archived_snapshots.closest.available;
				data.timestamp = json.results[0].archived_snapshots.closest.timestamp;
			}
		}
	})
	.catch(err => {
		Debug.log(err.message);

	}).finally(function() {
		callback(data);
	});
}
