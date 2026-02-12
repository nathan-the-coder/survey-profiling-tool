/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */
function saveFormData() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    sessionStorage.setItem('profiling_health', JSON.stringify(data));
}

function loadSavedData() {
    const saved = JSON.parse(sessionStorage.getItem('profiling_health') || '{}');
    for (const key in saved) {
        const el = document.querySelector(`[name="${key}"]`);
        if (el) el.value = saved[key];
    }
}

function goNext() {
    saveFormData();
    window.location.href = '/survey5';
}

function goPrev() {
    saveFormData();
    window.location.href = '/survey2';
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
});