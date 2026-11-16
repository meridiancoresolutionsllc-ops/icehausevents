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

	// The first ticket card still on the page is the featured event: it gets
	// id="next" so the header "Get Tickets" button and hero chip jump to it.
	var featured = document.querySelector('.events .ticket');
	if (featured && featured.id !== 'next') {
		var current = document.getElementById('next');
		if (current) current.removeAttribute('id');
		featured.id = 'next';
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
