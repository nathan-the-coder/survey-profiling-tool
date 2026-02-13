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

	const requiredFields = [
		{ id: "water_source", name: "Water Source" },
		{ id: "lighting_source", name: "Lighting Source" },
		{ id: "cooking_source", name: "Cooking Fuel" },
		{ id: "garbage_disposal", name: "Garbage Disposal" },
		{ id: "toilet_type", name: "Toilet Type" },
	];

	requiredFields.forEach((field) => {
		const el = document.getElementById(field.id);
		if (!el?.value || el.value === "") {
			errors.push(`${field.name} is required`);
		}
	});

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
