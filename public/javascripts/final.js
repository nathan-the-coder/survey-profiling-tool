/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */
function editSurvey() {
    window.location.href = '/survey';
}

function normalizeData(data) {
    if (!data || typeof data !== 'object') return data;
    const normalized = {};
    const keyMappings = {
        'municipality-select': 'municipalityName',
        'municipalityselect': 'municipalityName'
    };
    
    for (const key in data) {
        let value = data[key];
        const mappedKey = keyMappings[key] || key;
        if (value === '' || value === 'Select a municipality' || value === 'Select number...' ||
            value === 'Select structure...' || value === 'Choose classification' || value === 'Choose duration...' ||
            value === 'Select type...' || value === 'Choose mode of transportation...' || value === 'Choose Road Structure' ||
            value === null || value === undefined) {
            value = null;
        }
        normalized[mappedKey] = value;
    }
    return normalized;
}

function normalizeArrayFields(data) {
    if (!data || typeof data !== 'object') return data;
    const normalized = {};
    for (const key in data) {
        const value = data[key];
        if (key === 'assets' && Array.isArray(value)) {
            normalized[key] = value.filter(v => v && v !== '');
        } else {
            normalized[key] = value;
        }
    }
    return normalized;
}

function submitSurvey() {
    let general = JSON.parse(sessionStorage.getItem('survey_general') || '{}');
    let primary = JSON.parse(sessionStorage.getItem('survey_primary') || '{}');
    let health = JSON.parse(sessionStorage.getItem('survey_health') || '{}');
    let socio = JSON.parse(sessionStorage.getItem('survey_socio') || '{}');
    
    general = normalizeData(general);
    primary = normalizeData(primary);
    health = normalizeData(health);
    socio = normalizeData(socio);
    socio = normalizeArrayFields(socio);
    
    const allData = { general, primary, health, socio };
    
    Swal.fire({
        title: 'Submitting Survey...',
        text: 'Please wait while your data is being saved.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
    
    axios.post('https://survey-profiling-tool-backend.vercel.app/submit-survey', { data: allData })
        .then(response => {
            Swal.fire({
                icon: 'success',
                title: 'Thank you for your cooperation!',
                text: 'Your data is submitted successfully!',
                confirmButtonColor: '#457507',
                timer: 3000,
                timerProgressBar: true,
            }).then(() => {
                sessionStorage.clear();
                window.location.href = '/';
            });
        })
        .catch(error => {
            let errorMessage = 'An error occurred while submitting your survey.';
            if (error.response) {
                errorMessage = error.response.data?.error || error.response.statusText || errorMessage;
            } else if (error.request) {
                errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
            }
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: errorMessage,
                confirmButtonColor: '#457507',
            });
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSurveyData();
});