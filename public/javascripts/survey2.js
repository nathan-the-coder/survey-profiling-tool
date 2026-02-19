// Toggle occupation input visibility
window.toggleOccupationInput = (select, inputId) => {
	const input = document.getElementById(inputId);
	if (select.value === "99") {
		input.classList.remove("d-none");
	} else {
		input.classList.add("d-none");
		input.value = "";
	}
};

window.toggleOrgOthers = (select, inputId) => {
	const input = document.getElementById(inputId);
	if (select.value === "Others") {
		input.classList.remove("d-none");
	} else {
		input.classList.add("d-none");
		input.value = "";
	}
};

window.toggleWorkStatusOthers = (select, inputId) => {
	const input = document.getElementById(inputId);
	if (select.value === "5") {
		input.classList.remove("d-none");
	} else {
		input.classList.add("d-none");
		input.value = "";
	}
};

window.toggleReligionOthers = (select, inputId) => {
	const input = document.getElementById(inputId);
	if (select.value === "13" || select.value === "99") {
		input.classList.remove("d-none");
	} else {
		input.classList.add("d-none");
		input.value = "";
	}
};

// Create a member card HTML string
function createMemberCardHTML(data, index) {
	const memberNum =
		index !== null
			? index + 1
			: document.querySelectorAll(".member-card").length + 1;
	const civilOptions = [
		{ value: "", text: "Select..." },
		{ value: "1", text: "Single" },
		{ value: "2", text: "Married" },
		{ value: "3", text: "Common Law" },
		{ value: "4", text: "Widowed" },
		{ value: "5", text: "Divorced" },
		{ value: "6", text: "Separated" },
		{ value: "7", text: "Annulled" },
		{ value: "8", text: "Unknown" },
	];

	const religionOptions = [
		{ value: "", text: "Select..." },
		{ value: "1", text: "Roman Catholic" },
		{ value: "2", text: "Islam" },
		{ value: "3", text: "UCCP/Protestant" },
		{ value: "4", text: "Jehova's Witnesses" },
		{ value: "6", text: "Iglesia ni Cristo" },
		{ value: "7", text: "Four Square Church" },
		{ value: "8", text: "Seventh Day Adventist" },
		{ value: "9", text: "Mormons" },
		{ value: "10", text: "Born Again" },
		{ value: "11", text: "Bible Baptist" },
		{ value: "12", text: "Church of Christ" },
		{ value: "13", text: "Others Please Specify..." },
	];

	const sacramentOptions = [
		{ value: "", text: "Select..." },
		{ value: "1", text: "None" },
		{ value: "2", text: "Baptism" },
		{ value: "3", text: "Confirmation" },
		{ value: "4", text: "First Communion" },
		{ value: "5", text: "Marriage" },
		{ value: "6", text: "Holy Orders" },
	];

	const educationOptions = [
		{ value: "", text: "Select..." },
		{ value: "Pre-School", text: "Pre-School" },
		{ value: "Elementary", text: "Elementary" },
		{ value: "Junior High", text: "Junior High" },
		{ value: "Senior High", text: "Senior High" },
		{ value: "College", text: "College" },
		{ value: "Post-Graduate", text: "Post-Graduate" },
	];

	const workStatusOptions = [
		{ value: "", text: "Select..." },
		{ value: "1", text: "Regular/Permanent" },
		{ value: "2", text: "Contractual/Seasonal short term" },
		{ value: "3", text: "Worker for different employees" },
		{ value: "5", text: "Others" },
		{ value: "6", text: "Not Applicable" },
	];

	const immunizedOptions = [
		{ value: "66", text: "N/A" },
		{ value: "1", text: "Yes" },
		{ value: "2", text: "No" },
	];

	const studyingOptions = [
		{ value: "1", text: "Yes" },
		{ value: "2", text: "No" },
	];

	const relationOptions = [
		{ value: "", text: "Select..." },
		{ value: "1", text: "Son" },
		{ value: "2", text: "Daughter" },
		{ value: "3", text: "Stepson" },
		{ value: "4", text: "Stepdaughter" },
		{ value: "5", text: "Son-In-Law" },
		{ value: "6", text: "Daughter-In-Law" },
		{ value: "7", text: "Grandson" },
		{ value: "8", text: "Granddaughter" },
		{ value: "9", text: "Father" },
		{ value: "10", text: "Mother" },
		{ value: "11", text: "Father-In-Law" },
		{ value: "12", text: "Mother-In-Law" },
		{ value: "13", text: "Relative" },
		{ value: "14", text: "Brother" },
		{ value: "15", text: "Sister" },
		{ value: "16", text: "Brother-In-Law" },
		{ value: "17", text: "Sister-In-Law" },
		{ value: "18", text: "Uncle" },
		{ value: "19", text: "Aunt" },
		{ value: "20", text: "Nephew" },
		{ value: "21", text: "Niece" },
		{ value: "22", text: "Other Relative" },
		{ value: "23", text: "Domestic Helper" },
		{ value: "24", text: "Nonrelative" },
		{ value: "99", text: "Others" },
	];

	const occupationOptions = [
		{ value: "", text: "Select..." },
		{ value: "01", text: "Farming" },
		{ value: "02", text: "Tenant" },
		{ value: "03", text: "Fishing" },
		{ value: "04", text: "Vending" },
		{ value: "05", text: "Hired Labor" },
		{ value: "06", text: "Employed" },
		{ value: "07", text: "OFW" },
		{ value: "08", text: "Domestic Worker" },
		{ value: "09", text: "Entertainment" },
		{ value: "99", text: "Others" },
	];

	function selectOption(options, selectedValue) {
		return options
			.map(
				(opt) =>
					`<option value="${opt.value}" ${selectedValue === opt.value ? "selected" : ""}>${opt.text}</option>`,
			)
			.join("");
	}

	return `
        <div class="member-card">
            <button type="button" class="remove-btn" onclick="this.closest('.member-card').remove()">X</button>
            <h6>Member #${memberNum}</h6>
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Full Name</label>
                    <input type="text" name="m_name[]" class="form-control" value="${data.name || ""}" placeholder="Enter name" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Relation</label>
                    <select name="m_relation[]" class="form-select">
                        ${selectOption(relationOptions, data.relation)}
                    </select>
                </div>
                <input type="hidden" name="m_role[]" value="Member">
                <div class="col-md-3">
                    <label class="form-label">Sex</label>
                    <select name="m_sex[]" class="form-select">
                        <option value="1" ${data.sex === "1" ? "selected" : ""}>Male</option>
                        <option value="2" ${data.sex === "2" ? "selected" : ""}>Female</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Age</label>
                    <input type="number" name="m_age[]" class="form-control" value="${data.age || ""}" placeholder="Age" min="0">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Civil Status</label>
                    <select name="m_civil[]" class="form-select">
                        ${selectOption(civilOptions, data.civil)}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Religion</label>
                    <select name="m_religion[]" class="form-select" onchange="toggleReligionOthers(this, 'm_religion_others_${memberNum}')">
                        ${selectOption(religionOptions, data.religion)}
                    </select>
                    <input type="text" name="m_religion_others" id="m_religion_others_${memberNum}" class="form-control mt-2 ${data.religion !== "13" && data.religion !== "99" ? "d-none" : ""}" placeholder="Please specify religion" value="${data.religion_others || ""}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Sacraments</label>
                    <div class="row g-1">
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="m_sacraments[]" value="1" ${(data.sacraments || []).includes("1") ? "checked" : ""}>
                                <label class="form-check-label">Not yet Baptized</label>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="m_sacraments[]" value="2" ${(data.sacraments || []).includes("2") ? "checked" : ""}>
                                <label class="form-check-label">Baptism only</label>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="m_sacraments[]" value="3" ${(data.sacraments || []).includes("3") ? "checked" : ""}>
                                <label class="form-check-label">Baptism & Confirmation</label>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="m_sacraments[]" value="4" ${(data.sacraments || []).includes("4") ? "checked" : ""}>
                                <label class="form-check-label">First Holy Communion</label>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="m_sacraments[]" value="5" ${(data.sacraments || []).includes("5") ? "checked" : ""}>
                                <label class="form-check-label">Holy Matrimony</label>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="m_sacraments[]" value="6" ${(data.sacraments || []).includes("6") ? "checked" : ""}>
                                <label class="form-check-label">Holy Orders</label>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="m_sacraments[]" value="66" ${(data.sacraments || []).includes("66") ? "checked" : ""}>
                                <label class="form-check-label">Not Applicable</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Studying?</label>
                    <small class="text-muted d-block mb-1">Yes - if member was studying last school year (2024-2025).</small>
                    <select name="m_studying[]" class="form-select">
                        ${selectOption(studyingOptions, data.studying)}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Education</label>
                    <select name="m_educ[]" class="form-select">
                        ${selectOption(educationOptions, data.educ)}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Occupation</label>
                    <select name="m_job[]" class="form-select" onchange="toggleOccupationInput(this, 'm_job_others_${memberNum}')">
                        ${selectOption(occupationOptions, data.job)}
                    </select>
                    <input type="text" name="m_job_others" id="m_job_others_${memberNum}" class="form-control mt-2 ${data.job !== "99" ? "d-none" : ""}" placeholder="Please specify occupation">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Status of Work</label>
                    <select name="m_work_status[]" class="form-select" onchange="toggleWorkStatusOthers(this, 'm_work_status_others_${memberNum}')">
                        ${selectOption(workStatusOptions, data.work_status)}
                    </select>
                    <input type="text" name="m_work_status_others" id="m_work_status_others_${memberNum}" class="form-control mt-2 ${data.work_status !== "4" ? "d-none" : ""}" placeholder="Please specify work status" value="${data.work_status_others || ""}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Immunized? <small class="text-muted">(0-5 yrs)</small></label>
                    <small class="text-muted d-block mb-1">Yes – if child has been fully immunized with BCG, DPT123, OPV123 AMV before reaching one year old. Question is valid only to children 0-5 years old.</small>
                    <select name="m_immunized[]" class="form-select">
                        ${selectOption(immunizedOptions, data.immunized)}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Organization Involved</label>
                    <select name="m_organization[]" class="form-select" onchange="toggleOrgOthers(this, 'm_org_others_${memberNum}')">
                        <option value="">Select...</option>
                        <option value="Religious" ${data.organization === "Religious" ? "selected" : ""}>Religious</option>
                        <option value="Youth" ${data.organization === "Youth" ? "selected" : ""}>Youth</option>
                        <option value="Cultural" ${data.organization === "Cultural" ? "selected" : ""}>Cultural</option>
                        <option value="Political" ${data.organization === "Political" ? "selected" : ""}>Political</option>
                        <option value="Women's" ${data.organization === "Women's" ? "selected" : ""}>Women's</option>
                        <option value="Agricultural" ${data.organization === "Agricultural" ? "selected" : ""}>Agricultural</option>
                        <option value="Labor" ${data.organization === "Labor" ? "selected" : ""}>Labor</option>
                        <option value="Civic" ${data.organization === "Civic" ? "selected" : ""}>Civic</option>
                        <option value="Cooperatives" ${data.organization === "Cooperatives" ? "selected" : ""}>Cooperatives</option>
                        <option value="Others" ${data.organization === "Others" ? "selected" : ""}>Others</option>
                    </select>
                    <input type="text" name="m_organization_others" id="m_org_others_${memberNum}" class="form-control mt-2 ${data.organization !== "Others" ? "d-none" : ""}" placeholder="Please specify organization" value="${data.organization_others || ""}">
                </div>
            </div>
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Position</label>
                    <input type="text" name="m_position[]" class="form-control" value="${data.position || ""}" placeholder="Enter position">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Email</label>
                    <input type="email" name="m_email[]" class="form-control" value="${data.email || ""}" placeholder="Enter email address">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Phone Number</label>
                    <input type="text" name="m_phone_number[]" class="form-control" value="${data.phone_number || ""}" placeholder="Enter phone number">
                </div>
            </div>
        </div>
    `;
}

// Add a new member row
function addRow() {
	const container = document.getElementById("membersContainer");
	const emptyMsg = container.querySelector("p");
	if (emptyMsg) emptyMsg.remove();

	const card = document.createElement("div");
	card.innerHTML = createMemberCardHTML({}, null);
	container.appendChild(card.firstElementChild);
}

// Save form data to sessionStorage
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

	sessionStorage.setItem("profiling_primary", JSON.stringify(data));
}

// Navigate to next page
function goNext() {
	const errors = [];

	const getValue = (name) => {
		const el = document.querySelector(`[name="${name}"]`);
		console.log(`Checking ${name}:`, el?.value);
		return el?.value;
	};

	const headName = getValue("head_name");
	const headSex = getValue("head_sex");
	const headAge = getValue("head_age");
	const headMarriage = getValue("head_marriage");
	const headEduc = getValue("head_educ");
	const headJob = getValue("head_job");
	const headWorkStatus = getValue("head_work_status");

	console.log("Form values:", { headName, headSex, headAge, headMarriage, headEduc, headJob, headWorkStatus });

	if (!headName?.trim()) errors.push("Head Name is required");
	if (!headSex) errors.push("Head Sex is required");
	if (!headAge) errors.push("Head Age is required");
	if (!headMarriage) errors.push("Head Marriage Type is required");
	if (!headEduc) errors.push("Head Education is required");
	if (!headJob) errors.push("Head Occupation is required");
	if (!headWorkStatus) errors.push("Head Work Status is required");

	// Family members are now optional (supports newlyweds)

	if (errors.length > 0) {
		FormValidator.showFieldErrors(errors);
		return;
	}

	saveFormData();
	window.location.href = "/survey4";
}

// Navigate to previous page
function goPrev() {
	saveFormData();
	window.location.href = "/survey";
}

// Load saved data from sessionStorage
function loadSavedData() {
	const saved = JSON.parse(sessionStorage.getItem("profiling_primary") || "{}");
	const container = document.getElementById("membersContainer");

	// Load head fields
	const headFields = [
		"head_name",
		"head_marriage",
		"head_religion",
		"head_sex",
		"head_age",
		"head_educ",
		"head_work_status",
		"head_job",
		"head_email",
		"head_phone_number",
		"head_organization",
		"head_position",
	];
	headFields.forEach((field) => {
		const el = document.querySelector(`[name="${field}"]`);
		if (el && saved[field]) {
			el.value = saved[field];
			if (el.onchange) el.onchange();
		}
	});

	// Load head work status others
	if (saved.head_work_status === "5") {
		document
			.getElementById("head_work_status_others")
			.classList.remove("d-none");
		if (saved.head_work_status_others) {
			document.getElementById("head_work_status_others").value =
				saved.head_work_status_others;
		}
	}

	// Load head religion others
	if (saved.head_religion === "13" || saved.head_religion === "99") {
		document.getElementById("head_religion_others").classList.remove("d-none");
		if (saved.head_religion_others) {
			document.getElementById("head_religion_others").value =
				saved.head_religion_others;
		}
	}

	// Load head organization others
	if (saved.head_organization === "Others") {
		document.getElementById("head_org_others").classList.remove("d-none");
		if (saved.head_organization_others) {
			document.getElementById("head_org_others").value =
				saved.head_organization_others;
		}
	}

	// Load head sacraments (checkbox array)
	if (saved.head_sacraments && Array.isArray(saved.head_sacraments)) {
		saved.head_sacraments.forEach((val) => {
			const el = document.querySelector(
				`[name="head_sacraments[]"][value="${val}"]`,
			);
			if (el) el.checked = true;
		});
	}

	// Load spouse fields
	const spouseFields = [
		"spouse_name",
		"spouse_marriage",
		"spouse_religion",
		"spouse_sex",
		"spouse_age",
		"spouse_educ",
		"spouse_work_status",
		"spouse_job",
		"spouse_email",
		"spouse_phone_number",
		"spouse_organization",
		"spouse_position",
	];
	spouseFields.forEach((field) => {
		const el = document.querySelector(`[name="${field}"]`);
		if (el && saved[field]) {
			el.value = saved[field];
			if (el.onchange) el.onchange();
		}
	});

	// Load spouse work status others
	if (saved.spouse_work_status === "5") {
		document
			.getElementById("spouse_work_status_others")
			.classList.remove("d-none");
		if (saved.spouse_work_status_others) {
			document.getElementById("spouse_work_status_others").value =
				saved.spouse_work_status_others;
		}
	}

	// Load spouse religion others
	if (saved.spouse_religion === "13" || saved.spouse_religion === "99") {
		document
			.getElementById("spouse_religion_others")
			.classList.remove("d-none");
		if (saved.spouse_religion_others) {
			document.getElementById("spouse_religion_others").value =
				saved.spouse_religion_others;
		}
	}

	// Load spouse organization others
	if (saved.spouse_organization === "Others") {
		document
			.getElementById("spouse_org_others")
			.classList.remove("d-none");
		if (saved.spouse_organization_others) {
			document.getElementById("spouse_org_others").value =
				saved.spouse_organization_others;
		}
	}

	// Load spouse sacraments (checkbox array)
	if (saved.spouse_sacraments && Array.isArray(saved.spouse_sacraments)) {
		saved.spouse_sacraments.forEach((val) => {
			const el = document.querySelector(
				`[name="spouse_sacraments[]"][value="${val}"]`,
			);
			if (el) el.checked = true;
		});
	}

	// Load household members
	if (saved.m_name && Array.isArray(saved.m_name) && saved.m_name.length > 0) {
		container.innerHTML = "";
		saved.m_name.forEach((name, idx) => {
			const cardData = {
				name: name,
				relation: saved.m_relation?.[idx],
				sex: saved.m_sex?.[idx],
				age: saved.m_age?.[idx],
				civil: saved.m_civil?.[idx],
				religion: saved.m_religion?.[idx],
				religion_others: saved.m_religion_others?.[idx],
				sacraments: saved.m_sacraments?.[idx],
				studying: saved.m_studying?.[idx],
				educ: saved.m_educ?.[idx],
				job: saved.m_job?.[idx],
				work_status: saved.m_work_status?.[idx],
				work_status_others: saved.m_work_status_others?.[idx],
				immunized: saved.m_immunized?.[idx],
				organization: saved.m_organization?.[idx],
				organization_others: saved.m_organization_others?.[idx],
				position: saved.m_position?.[idx],
				email: saved.m_email?.[idx],
				phone_number: saved.m_phone_number?.[idx],
			};
			const div = document.createElement("div");
			div.innerHTML = createMemberCardHTML(cardData, idx);
			container.appendChild(div.firstElementChild);
		});
	}
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
	loadSavedData();
});
