/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */
function saveFormData() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        if (key.endsWith('[]')) {
            const arrKey = key.slice(0, -2);
            if (!data[arrKey]) data[arrKey] = [];
            data[arrKey].push(value);
        } else {
            data[key] = value;
        }
    }
    sessionStorage.setItem('profiling_socio', JSON.stringify(data));
}

function loadSavedData() {
    const saved = JSON.parse(sessionStorage.getItem('profiling_socio') || '{}');
    for (const key in saved) {
        if (Array.isArray(saved[key])) {
            saved[key].forEach(val => {
                const el = document.querySelector(`[name="${key}[]"][value="${val}"]`);
                if (el) el.checked = true;
            });
        } else {
            const el = document.querySelector(`[name="${key}"]`);
            if (el) el.value = saved[key];
        }
    }
}

function goPrev() {
    saveFormData();
    window.location.href = '/survey4';
}

function submitEntry() {
    saveFormData();
    window.location.href = '/final';
}

function toggleOthersText(checkbox, inputId) {
    const inputField = document.getElementById(inputId);
    if (checkbox.checked) {
        inputField.classList.remove('d-none');
        inputField.querySelector('input').required = true;
    } else {
        inputField.classList.add('d-none');
        inputField.querySelector('input').required = false;
        inputField.querySelector('input').value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
        loadSavedData();
    });