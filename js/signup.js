/*
 * Mailing list signup (MailerLite classic web form).
 *
 * The form posts to MailerLite inside a hidden iframe so visitors stay on
 * the page. Before sending, we check the email and the reCAPTCHA box
 * (MailerLite requires it); after the iframe loads, we show the success
 * message.
 */
(function () {
	'use strict';

	var form = document.getElementById('list-form');
	if (!form) return;

	var email = document.getElementById('list-email');
	var error = document.getElementById('list-error');
	var success = document.getElementById('list-success');
	var frame = document.querySelector('iframe[name="ml-submit-frame"]');
	var button = form.querySelector('button[type="submit"]');
	var submitting = false;

	var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function showError(msg) {
		error.textContent = msg;
		error.hidden = false;
	}

	function clearError() {
		error.textContent = '';
		error.hidden = true;
	}

	function captchaResponse() {
		try {
			return window.grecaptcha ? window.grecaptcha.getResponse() : '';
		} catch (e) {
			return '';
		}
	}

	form.addEventListener('submit', function (e) {
		clearError();
		var value = email.value.trim();

		if (!EMAIL_RE.test(value)) {
			e.preventDefault();
			showError('Please enter a valid email address.');
			email.focus();
			return;
		}

		if (!captchaResponse()) {
			e.preventDefault();
			showError("Please tick the “I'm not a robot” box.");
			return;
		}

		email.value = value;
		submitting = true;
		button.disabled = true;
		button.textContent = 'Sending…';
	});

	frame.addEventListener('load', function () {
		if (!submitting) return; // ignore the iframe's initial blank load
		submitting = false;
		form.hidden = true;
		success.hidden = false;
		success.setAttribute('tabindex', '-1');
		success.focus({ preventScroll: true });
	});

	email.addEventListener('input', clearError);
})();
