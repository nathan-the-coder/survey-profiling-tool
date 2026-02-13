/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */
const municipalities = [
	"Abulug",
	"Alcala",
	"Allacapan",
	"Amulung",
	"Aparri",
	"Baggao",
	"Ballesteros",
	"Buguey",
	"Calayan",
	"Camalaniugan",
	"Claveria",
	"Enrile",
	"Gattaran",
	"Gonzaga",
	"Iguig",
	"Lal-lo",
	"Lasam",
	"Pamplona",
	"Peñablanca",
	"Piat",
	"Rizal",
	"Sanchez-Mira",
	"Santa Ana",
	"Santa Praxedes",
	"Santa Teresita",
	"Santo Niño (Faire)",
	"Solana",
	"Tuao",
];

function saveFormData() {
	const form = document.querySelector("form");
	const formData = new FormData(form);
	const data = {};
	for (const [key, value] of formData.entries()) {
		if (data[key]) {
			if (Array.isArray(data[key])) {
				data[key].push(value);
			} else {
				data[key] = [data[key], value];
			}
		} else {
			data[key] = value;
		}
	}
	sessionStorage.setItem("profiling_general", JSON.stringify(data));
}

function loadSavedData() {
	const saved = JSON.parse(sessionStorage.getItem("profiling_general") || "{}");
	for (const key in saved) {
		const value = saved[key];
		if (Array.isArray(value)) {
			value.forEach((val) => {
				const el = document.querySelector(`[name="${key}"][value="${val}"]`);
				if (el && el.type === "checkbox") {
					el.checked = true;
				}
			});
		} else {
			const el = document.querySelector(`[name="${key}"]`);
			if (el) el.value = value;
		}
	}
}

function goNext() {
	const rules = [
		{ field: "nameOfParish", type: "select", name: "Parish" },
		{ field: "purokGimong", type: "required", name: "BEC Purok-Gimong" },
		{ field: "barangayName", type: "required", name: "Barangay Name" },
		{ field: "municipality-select", type: "select", name: "Municipality" },
		{ field: "provinceName", type: "required", name: "Province" },
		{
			field: "modeOfTransportation",
			type: "checkbox",
			name: "Transportation",
			value: 1,
		},
		{ field: "roadStructure", type: "select", name: "Road Structure" },
		{
			field: "yrOfResInTheCommunity",
			type: "select",
			name: "Years of Residency",
		},
		{
			field: "numOfFamMembers",
			type: "required",
			name: "Number of Family Members",
		},
		{ field: "familyStructure", type: "select", name: "Family Structure" },
	];

	if (!FormValidator.validateForm("profilingForm", rules)) {
		return;
	}

	saveFormData();
	window.location.href = "/survey2";
}

function loadParishes() {
	const parishSelect = document.getElementById("nameOfParish");
	const defaultParishes = [
		"St. Louis Cathedral",
		"Our Lady of Perpetual Help",
		"St. Joseph Parish",
		"Holy Family Parish",
		"St. Mary Parish",
	];

	// Add cache-busting and proper headers
	fetch("https://survey-profiling-tool-backend.vercel.app/parishes", {
		headers: {
			"X-Username": sessionStorage.getItem("username") || "Guest",
			"Cache-Control": "no-cache, no-store, must-revalidate",
			Pragma: "no-cache",
		},
		cache: "no-store",
	})
		.then((response) => {
			if (!response.ok) throw new Error("API not available");
			return response.json();
		})
		.then((parishes) => {
			parishes.forEach((parish) => {
				if (parish !== 'SJCB_Admin' && parish !== 'Archdiocese of Tuguegarao') {
					const option = document.createElement("option");
					option.value = parish;
					option.textContent = parish;
					parishSelect.appendChild(option);
				}
			});
		})
		.catch((err) => {
			defaultParishes.forEach((parish) => {
				const option = document.createElement("option");
				option.value = parish;
				option.textContent = parish;
				parishSelect.appendChild(option);
			});
		});
}

document.addEventListener("DOMContentLoaded", () => {
	const selectElement = document.getElementById("municipality-select");
	municipalities.forEach((town) => {
		const option = document.createElement("option");
		option.value = town;
		option.textContent = town;
		selectElement.appendChild(option);
	});

	loadParishes();
	loadSavedData();
});
