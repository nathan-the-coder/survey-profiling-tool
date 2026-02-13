/**
 * Professional Form Validation Module
 * Provides reusable validation functions with visual feedback
 */

const FormValidator = {
	showError: function (input, message) {
		const formGroup =
			input.closest(".col-md-6, .col-md-4, .col-md-3, .col-12") ||
			input.parentElement;

		input.classList.add("is-invalid");

		let feedbackEl = formGroup.querySelector(".invalid-feedback");
		if (!feedbackEl) {
			feedbackEl = document.createElement("div");
			feedbackEl.className = "invalid-feedback";
			formGroup.appendChild(feedbackEl);
		}
		feedbackEl.textContent = message;
		feedbackEl.style.display = "block";
	},

	clearError: function (input) {
		const formGroup =
			input.closest(".col-md-6, .col-md-4, .col-md-3, .col-12") ||
			input.parentElement;
		input.classList.remove("is-invalid");

		const feedbackEl = formGroup.querySelector(".invalid-feedback");
		if (feedbackEl) {
			feedbackEl.style.display = "none";
		}
	},

	clearAllErrors: function (form) {
		form.querySelectorAll(".is-invalid").forEach((el) => {
			el.classList.remove("is-invalid");
		});
		form.querySelectorAll(".invalid-feedback").forEach((el) => {
			el.style.display = "none";
		});
	},

	showFieldError: function (fieldId, message) {
		const field = document.getElementById(fieldId);
		if (field) {
			this.showError(field, message);
		}
	},

	validateRequired: function (input, fieldName) {
		const value = input.value.trim();
		if (!value || value === "") {
			this.showError(input, `${fieldName} is required`);
			return false;
		}
		this.clearError(input);
		return true;
	},

	validateSelect: function (select, fieldName) {
		const value = select.value.trim();
		if (!value || value === "" || value === "Select...") {
			this.showError(select, `Please select a ${fieldName}`);
			return false;
		}
		this.clearError(select);
		return true;
	},

	validateMinLength: function (input, minLength, fieldName) {
		const value = input.value.trim();
		if (value.length < minLength) {
			this.showError(
				input,
				`${fieldName} must be at least ${minLength} characters`,
			);
			return false;
		}
		this.clearError(input);
		return true;
	},

	validateMaxLength: function (input, maxLength, fieldName) {
		const value = input.value.trim();
		if (value.length > maxLength) {
			this.showError(
				input,
				`${fieldName} must not exceed ${maxLength} characters`,
			);
			return false;
		}
		this.clearError(input);
		return true;
	},

	validateNumber: function (input, fieldName) {
		const value = input.value.trim();
		if (value && Number.isNaN(Number(value))) {
			this.showError(input, `${fieldName} must be a valid number`);
			return false;
		}
		this.clearError(input);
		return true;
	},

	validateRange: function (input, min, max, fieldName) {
		const value = parseInt(input.value, 10);
		if (input.value && (value < min || value > max)) {
			this.showError(input, `${fieldName} must be between ${min} and ${max}`);
			return false;
		}
		this.clearError(input);
		return true;
	},

	validateCheckboxGroup: function (groupName, minRequired = 1) {
		const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
		const checked = document.querySelectorAll(
			`input[name="${groupName}"]:checked`,
		);

		if (checked.length < minRequired) {
			const groupContainer = checkboxes[0]?.closest(
				".checkbox-group, .mb-4, .col-12",
			);
			if (groupContainer) {
				let feedbackEl = groupContainer.querySelector(".invalid-feedback");
				if (!feedbackEl) {
					feedbackEl = document.createElement("div");
					feedbackEl.className = "invalid-feedback d-block";
					feedbackEl.style.display = "block";
					groupContainer.appendChild(feedbackEl);
				}
				feedbackEl.textContent = `Please select at least ${minRequired} option(s)`;
			}
			return false;
		}

		const feedbackEl = checkboxes[0]
			?.closest(".checkbox-group, .mb-4, .col-12")
			?.querySelector(".invalid-feedback");
		if (feedbackEl) feedbackEl.style.display = "none";
		return true;
	},

	validateForm: function (formId, rules) {
		const form = document.getElementById(formId);
		if (!form) return false;

		this.clearAllErrors(form);
		let isValid = true;
		let firstErrorField = null;

		rules.forEach((rule) => {
			const input =
				document.getElementById(rule.field) ||
				document.querySelector(`[name="${rule.field}"]`);
			if (!input) return;

			let fieldValid = true;

			switch (rule.type) {
				case "required":
					fieldValid = this.validateRequired(input, rule.name);
					break;
				case "select":
					fieldValid = this.validateSelect(input, rule.name);
					break;
				case "minLength":
					fieldValid = this.validateMinLength(input, rule.value, rule.name);
					break;
				case "maxLength":
					fieldValid = this.validateMaxLength(input, rule.value, rule.name);
					break;
				case "number":
					fieldValid = this.validateNumber(input, rule.name);
					break;
				case "range":
					fieldValid = this.validateRange(
						input,
						rule.value[0],
						rule.value[1],
						rule.name,
					);
					break;
				case "checkbox":
					fieldValid = this.validateCheckboxGroup(rule.field, rule.value);
					break;
				case "email":
					{
						const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
						if (!emailRegex.test(input.value)) {
							this.showError(input, `Please enter a valid email address`);
							fieldValid = false;
						} else {
							this.clearError(input);
						}
					}
					break;
			}

			if (!fieldValid) {
				isValid = false;
				if (!firstErrorField) firstErrorField = input;
			}
		});

		if (firstErrorField) {
			firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
			setTimeout(() => firstErrorField.focus(), 300);
		}

		return isValid;
	},

	showValidationError: function (title, message) {
		Swal.fire({
			icon: "error",
			title: title || "Validation Error",
			text: message || "Please check the form for errors",
			confirmButtonColor: "#457807",
		});
	},

	showFieldErrors: function (errors) {
		if (errors.length === 0) return;

		const errorList = errors.map((e) => `• ${e}`).join("<br>");
		Swal.fire({
			icon: "error",
			title: "Please fill in required fields",
			html: errorList,
			confirmButtonColor: "#457807",
		});
	},
};

window.FormValidator = FormValidator;
