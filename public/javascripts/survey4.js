function saveFormData() {
	const form = document.querySelector("form");
	const formData = new FormData(form);
	const data = {};

	for (const [key, value] of formData.entries()) {
		if (key.endsWith("[]")) {
			const baseKey = key.slice(0, -2);
			if (!data[baseKey]) {
				data[baseKey] = [];
			}
			data[baseKey].push(value);
		} else {
			data[key] = value;
		}
	}

	sessionStorage.setItem("profiling_health", JSON.stringify(data));
}

function loadSavedData() {
	const saved = JSON.parse(sessionStorage.getItem("profiling_health") || "{}");
	for (const key in saved) {
		const value = saved[key];

		if (Array.isArray(value)) {
			value.forEach((val) => {
				const el = document.querySelector(`[name="${key}[]"][value="${val}"]`);
				if (el) el.checked = true;
			});
		} else {
			const el = document.querySelector(`[name="${key}"]`);
			if (el) el.value = value;
		}
	}
}

function goNext() {
	const errors = [];

	const hasChecked = (name) => {
		return document.querySelectorAll(`[name="${name}"]:checked`).length > 0;
	};

	if (!hasChecked("water_source[]")) errors.push("Water Source is required");
	if (!hasChecked("lighting_source[]")) errors.push("Lighting Source is required");
	if (!hasChecked("cooking_source[]")) errors.push("Cooking Fuel is required");
	if (!hasChecked("garbage_disposal[]")) errors.push("Garbage Disposal is required");
	if (!hasChecked("toilet_type[]")) errors.push("Toilet Type is required");

	if (errors.length > 0) {
		FormValidator.showFieldErrors(errors);
		return;
	}

	saveFormData();
	window.location.href = "/survey5";
}

function goPrev() {
	saveFormData();
	window.location.href = "/survey2";
}

document.addEventListener("DOMContentLoaded", () => {
	loadSavedData();
});
