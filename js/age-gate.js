(function () {
	var STORAGE_KEY = 'icehaus_age_verified';
	var MIN_AGE = 21;

	var gate = document.getElementById('age-gate');
	if (!gate) return;

	if (localStorage.getItem(STORAGE_KEY) === 'true') {
		gate.classList.add('is-hidden');
		return;
	}

	document.body.style.overflow = 'hidden';

	var askView = document.getElementById('age-gate-ask');
	var deniedView = document.getElementById('age-gate-denied');
	var form = document.getElementById('age-gate-form');
	var dobInput = document.getElementById('age-gate-dob');
	var errorEl = document.getElementById('age-gate-error');
	var yesBtn = document.getElementById('age-gate-yes');
	var noBtn = document.getElementById('age-gate-no');

	function calculateAge(birthDate, today) {
		var age = today.getFullYear() - birthDate.getFullYear();
		var hasHadBirthdayThisYear =
			today.getMonth() > birthDate.getMonth() ||
			(today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
		if (!hasHadBirthdayThisYear) age--;
		return age;
	}

	function allow() {
		try {
			localStorage.setItem(STORAGE_KEY, 'true');
		} catch (e) {}
		document.body.style.overflow = '';
		gate.classList.add('is-hidden');
	}

	function deny() {
		askView.hidden = true;
		deniedView.hidden = false;
	}

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		errorEl.hidden = true;

		if (!dobInput.value) {
			errorEl.hidden = false;
			return;
		}

		var parts = dobInput.value.split('-').map(Number);
		var birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
		var today = new Date();

		if (isNaN(birthDate.getTime()) || birthDate > today) {
			errorEl.hidden = false;
			return;
		}

		if (calculateAge(birthDate, today) >= MIN_AGE) {
			allow();
		} else {
			deny();
		}
	});

	yesBtn.addEventListener('click', allow);
	noBtn.addEventListener('click', deny);
})();
