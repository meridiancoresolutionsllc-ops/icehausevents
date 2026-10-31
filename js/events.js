(function () {
	var today = new Date();
	today.setHours(0, 0, 0, 0);

	var eventsContainer = document.querySelector('.events');
	if (!eventsContainer) return;

	eventsContainer.querySelectorAll('.event-block[data-event-date]').forEach(function (block) {
		var eventDate = new Date(block.getAttribute('data-event-date') + 'T00:00:00');
		if (eventDate < today) {
			block.remove();
		}
	});

	if (eventsContainer.querySelectorAll('.event-block').length === 0) {
		var noEvents = eventsContainer.querySelector('.no-events');
		if (noEvents) noEvents.hidden = false;
	}
})();
