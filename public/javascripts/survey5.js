/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */
function saveFormData() {
	const form = document.querySelector("form");
	const formData = new FormData(form);
	const data = {};
	for (const [key, value] of formData.entries()) {
		if (key.endsWith("[]")) {
			const arrKey = key.slice(0, -2);
			if (!data[arrKey]) data[arrKey] = [];
			data[arrKey].push(value);
		} else {
			data[key] = value;
		}
	}
	sessionStorage.setItem("profiling_socio", JSON.stringify(data));
}

function loadSavedData() {
	const saved = JSON.parse(sessionStorage.getItem("profiling_socio") || "{}");
	for (const key in saved) {
		if (Array.isArray(saved[key])) {
			saved[key].forEach((val) => {
				const el = document.querySelector(`[name="${key}[]"][value="${val}"]`);
				if (el) {
					el.checked = true;
					if (val === "99") {
						if (key === "savings_location") {
							document
								.getElementById("savings_others_div")
								.classList.remove("d-none");
						} else if (key === "house_classification") {
							document
								.getElementById("house_others_div")
								.classList.remove("d-none");
						}
					}
				}
			});
		} else {
			const el = document.querySelector(`[name="${key}"]`);
			if (el) {
				el.value = saved[key];
				if (key === "house_ownership" && saved[key] === "99") {
					document
						.getElementById("ownership_others_div")
						.classList.remove("d-none");
				}
			}
		}
	}
}

function goPrev() {
	saveFormData();
	window.location.href = "/survey4";
}

function submitEntry() {
	const errors = [];

	const requiredFields = [
		{ id: "income_monthly", name: "Monthly Income" },
		{ id: "expenses_weekly", name: "Weekly Expenses" },
		{ id: "has_savings", name: "Savings Status" },
		{ id: "house_ownership", name: "House Ownership" },
		{ id: "house_classification", name: "House Classification" },
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
	window.location.href = "/final";
}

function toggleOthersText(checkbox, inputId) {
	const inputField = document.getElementById(inputId);
	if (checkbox.checked) {
		inputField.classList.remove("d-none");
		inputField.querySelector("input").required = true;
	} else {
		inputField.classList.add("d-none");
		inputField.querySelector("input").required = false;
		inputField.querySelector("input").value = "";
	}
}

function toggleOwnershipOthers(select) {
	const othersDiv = document.getElementById("ownership_others_div");
	if (select.value === "99") {
		othersDiv.classList.remove("d-none");
		othersDiv.querySelector("input").required = true;
	} else {
		othersDiv.classList.add("d-none");
		othersDiv.querySelector("input").required = false;
		othersDiv.querySelector("input").value = "";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const today = new Date().toISOString().split("T")[0];
	const listeningDateEl = document.getElementById("date");
	const listingDateEl = document.getElementById("listing_date");
	if (listeningDateEl && !listeningDateEl.value) {
		listeningDateEl.value = today;
	}
	if (listingDateEl) {
		listingDateEl.value = today;
	}
	loadSavedData();
});
