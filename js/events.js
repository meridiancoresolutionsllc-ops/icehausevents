(function () {
	var TIME_ZONE = 'America/Chicago';
	var CUTOFF_HOUR = 5; // events disappear at 5am Central the day after their date

	function tzOffsetMinutes(date, timeZone) {
		var dtf = new Intl.DateTimeFormat('en-US', {
			timeZone: timeZone,
			hourCycle: 'h23',
			year: 'numeric', month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit', second: '2-digit'
		});
		var parts = {};
		dtf.formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
		var asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
		return (asUTC - date.getTime()) / 60000;
	}

	function cutoffInstant(dateStr) {
		var parts = dateStr.split('-').map(Number);
		var year = parts[0], month = parts[1], day = parts[2];
		var guess = Date.UTC(year, month - 1, day + 1, CUTOFF_HOUR, 0, 0);
		// Two passes so the DST offset is read near the true answer, not the
		// naive guess (matters right around a spring-forward/fall-back date).
		var firstPass = guess - tzOffsetMinutes(new Date(guess), TIME_ZONE) * 60000;
		var offsetMinutes = tzOffsetMinutes(new Date(firstPass), TIME_ZONE);
		return new Date(guess - offsetMinutes * 60000);
	}

	var now = new Date();

	// Any element tagged with data-event-date (list rows, the spotlight, the
	// hero "next up" chip) is removed once its event is over.
	document.querySelectorAll('[data-event-date]').forEach(function (el) {
		if (now >= cutoffInstant(el.getAttribute('data-event-date'))) {
			el.remove();
		}
	});

	// Scheduled content. data-show-from / data-hide-from take a full timestamp
	// with its UTC offset, e.g. "2026-11-16T18:00:00-06:00" (6 PM Central).
	// Elements with data-show-from ship with the `hidden` attribute and are
	// revealed at that moment; data-hide-from removes an element at that moment.
	document.querySelectorAll('[data-show-from]').forEach(function (el) {
		if (now >= new Date(el.getAttribute('data-show-from'))) {
			el.hidden = false;
		} else {
			el.remove();
		}
	});
	document.querySelectorAll('[data-hide-from]').forEach(function (el) {
		if (now >= new Date(el.getAttribute('data-hide-from'))) {
			el.remove();
		}
	});

	// Keep events in date order, soonest first. A ticket sorts by its own date;
	// a group (Haus 57 Thursdays) sorts by its next remaining date, so it moves
	// down the page as its earlier dates pass.
	var list = document.querySelector('.events');
	if (list) {
		var sortDate = function (el) {
			if (el.classList.contains('event-group')) {
				var dates = Array.prototype.map.call(
					el.querySelectorAll('[data-event-date]'),
					function (d) { return d.getAttribute('data-event-date'); }
				).sort();
				return dates[0] || el.getAttribute('data-event-date') || '9999-12-31';
			}
			return el.getAttribute('data-event-date') || '9999-12-31';
		};
		// Weekly cards (Haus 57): only the soonest remaining one stays on the page,
		// so exactly one Thursday "pops up" each week alongside the main events.
		var weekly = Array.prototype.filter.call(list.querySelectorAll('.ticket[data-weekly]'), function () { return true; })
			.sort(function (a, b) { return sortDate(a) < sortDate(b) ? -1 : 1; });
		weekly.slice(1).forEach(function (el) { el.remove(); });

		var tickets = Array.prototype.filter.call(list.children, function (el) {
			return el.classList.contains('ticket');
		});
		var groups = Array.prototype.filter.call(list.children, function (el) {
			return el.classList.contains('event-group');
		});
		var tail = list.querySelector('.no-events');
		tickets
			.map(function (el, i) { return { el: el, key: sortDate(el), i: i }; })
			.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : a.i - b.i; })
			.forEach(function (item) { list.insertBefore(item.el, tail); });
		// Schedules (the Haus 57 Thursdays block) always sit below the main events.
		groups.forEach(function (el) { list.insertBefore(el, tail); });
	}

	// The first ticket card on the page (the soonest ticketed event) gets
	// id="next" so the header "Get Tickets" button jumps to it.
	// Weekly cards (data-weekly) are reservations, not tickets, so they're skipped.
	var featured = document.querySelector('.events .ticket:not([data-weekly])');
	if (featured && featured.id !== 'next') {
		var current = document.getElementById('next');
		if (current) current.removeAttribute('id');
		if (featured.id) {
			// It already has its own anchor (e.g. #gallery27): point "#next" links there.
			var target = '#' + featured.id;
			document.querySelectorAll('a[href="#next"]').forEach(function (a) {
				a.setAttribute('href', target);
			});
		} else {
			featured.id = 'next';
		}
	}

	// If no featured event is left, point any links to it
	// (e.g. the header "Get Tickets" button) at the Upcoming list instead.
	if (!document.getElementById('next')) {
		document.querySelectorAll('a[href="#next"]').forEach(function (a) {
			a.setAttribute('href', '#events');
		});
	}

	var eventsContainer = document.querySelector('.events');
	if (!eventsContainer) return;

	if (eventsContainer.querySelectorAll('.event-block').length === 0) {
		var noEvents = eventsContainer.querySelector('.no-events');
		if (noEvents) noEvents.hidden = false;
	}
})();
