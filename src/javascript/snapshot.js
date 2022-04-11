/*jslint node: true */
/*global Request, global */

"use strict";

const Snapshot = {
	data: {
		available: false,
		error: true,
		timestamp: ''
	},

	get: function (url) {
		return new Promise(function (resolve) {
			fetch(global.urls.api, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
					},
					body: 'url=' + encodeURIComponent(url)
				})
				.then(async (response) => {
					var json = await response.json();

					Snapshot.data.error = false;

					if (response.status === 200) {
						if (json.results[0].archived_snapshots.hasOwnProperty('closest')) {
							Snapshot.data.available = json.results[0].archived_snapshots.closest.available;
							Snapshot.data.timestamp = json.results[0].archived_snapshots.closest.timestamp;
						}
					}
				})
				.catch(err => {
					console.log(err);
				})
				.finally(function () {
					return resolve(Snapshot.data);
				});
		});
	},
}
