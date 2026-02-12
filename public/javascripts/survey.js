/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */
const municipalities = [
    'Abulug', 'Alcala', 'Allacapan', 'Amulung', 'Aparri', 
    'Baggao', 'Ballesteros', 'Buguey', 'Calayan', 'Camalaniugan', 
    'Claveria', 'Enrile', 'Gattaran', 'Gonzaga', 'Iguig', 
    'Lal-lo', 'Lasam', 'Pamplona', 'Peñablanca', 'Piat', 
    'Rizal', 'Sanchez-Mira', 'Santa Ana', 'Santa Praxedes', 
    'Santa Teresita', 'Santo Niño (Faire)', 'Solana', 'Tuao'
];

function saveFormData() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    sessionStorage.setItem('survey_general', JSON.stringify(data));
}

function loadSavedData() {
    const saved = JSON.parse(sessionStorage.getItem('survey_general') || '{}');
    for (const key in saved) {
        const el = document.querySelector(`[name="${key}"]`);
        if (el) el.value = saved[key];
    }
}

function goNext() {
    saveFormData();
    window.location.href = '/survey2';
}

function loadParishes() {
    fetch('https://survey-profiling-tool-backend.vercel.app/parishes')
        .then(response => response.json())
        .then(parishes => {
            const parishSelect = document.getElementById('nameOfParish');
            parishes.forEach(parish => {
                const option = document.createElement('option');
                option.value = parish;
                option.textContent = parish;
                parishSelect.appendChild(option);
            });
        })
        .catch(err => console.error('Failed to load parishes:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('municipality-select');
    municipalities.forEach(town => {
        const option = document.createElement('option');
        option.value = town;
        option.textContent = town;
        selectElement.appendChild(option);
    });
    
    loadParishes();
    loadSavedData();
});