/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */

// --- Navigation ---
function editEntry() {
    window.location.href = '/survey';
}

// --- Data Normalization Logic ---

/**
 * Cleans data by mapping keys and converting "Select..." placeholders to null.
 * Also handles generic array cleaning for any field that is an array.
 */
function normalizeData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const normalized = {};
    const keyMappings = {
        'municipality-select': 'municipalityName',
        'municipalityselect': 'municipalityName',
        'road_Structure': 'roadStructure' // Ensuring consistency
    };

    const emptyPlaceholders = [
        '', 'Select...', 'Select a municipality', 'Select number...', 
        'Select structure...', 'Choose classification', 'Choose duration...', 
        'Select type...', 'Choose mode of transportation...', 'Choose Road Structure',
        null, undefined
    ];
    
    for (const key in data) {
        let value = data[key];
        const mappedKey = keyMappings[key] || key;

        if (Array.isArray(value)) {
            // Clean up arrays (remove empty strings/placeholders)
            value = value.filter(v => !emptyPlaceholders.includes(v));
            if (value.length === 0) value = null;
        } else {
            if (emptyPlaceholders.includes(value)) {
                value = null;
            }
        }
        normalized[mappedKey] = value;
    }
    return normalized;
}

// --- Submission Logic ---

function submitEntry() {
    // 1. Retrieve Data
    const rawData = {
        general: JSON.parse(sessionStorage.getItem('profiling_general') || '{}'),
        primary: JSON.parse(sessionStorage.getItem('profiling_primary') || '{}'),
        health: JSON.parse(sessionStorage.getItem('profiling_health') || '{}'),
        socio: JSON.parse(sessionStorage.getItem('profiling_socio') || '{}')
    };
    
    // 2. Normalize Data
    const allData = {
        general: normalizeData(rawData.general),
        primary: normalizeData(rawData.primary),
        health: normalizeData(rawData.health),
        socio: normalizeData(rawData.socio)
    };
    
    // 3. UI Feedback
    Swal.fire({
        title: 'Submitting Entry...',
        text: 'Please wait while your data is being saved.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
    
    // 4. API Call
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
            let errorMessage = 'An error occurred while submitting your entry.';
            if (error.response) {
                errorMessage = error.response.data?.error || error.response.statusText || errorMessage;
            } else if (error.request) {
                errorMessage = 'Cannot connect to server. Please check your internet connection.';
            }
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: errorMessage,
                confirmButtonColor: '#457507',
            });
        });
}

// --- Display Logic ---

document.addEventListener('DOMContentLoaded', () => {
    loadProfilingData();
});

// Mapping Configurations
const maps = {
    religion: { '1': 'Roman Catholic', '2': 'Islam', '99': 'Others' },
    sex: { '1': 'Male', '2': 'Female' },
    workStatus: { '1': 'Regular/Permanent', '2': 'Contractual', '3': 'Worker for different employers', '5': 'Others', '6': 'Not Applicable' },
    civil: { '1': 'Single', '2': 'Married', '3': 'Common Law', '4': 'Widowed', '5': 'Divorced', '6': 'Separated', '7': 'Annulled', '8': 'Unknown' },
    sacrament: { '1': 'Not yet Baptized', '2': 'Baptism only', '3': 'Baptism & Confirmation', '4': 'First Holy Communion', '5': 'Holy Matrimony', '6': 'Holy Orders', '66': 'Not Applicable' },
    marriage: { '1': 'Civil', '2': 'Church' },
    studying: { '1': 'Yes', '2': 'No' },
    immunized: { '1': 'Yes', '2': 'No', '66': 'N/A' },
    occupation: { '01': 'Farming', '02': 'Tenant', '03': 'Fishing', '04': 'Vending', '05': 'Hired Labor', '06': 'Employed', '07': 'OFW', '08': 'Domestic Worker', '09': 'Entertainment', '99': 'Others' },
    transportation: { 'Bicycle': 'Bicycle', 'Tricycle': 'Tricycle', 'Motorcycle': 'Motorcycle', 'Jeepney': 'Jeepney', 'Van': 'Van', 'Private Vehicle': 'Private Vehicle' },
    illness: { '00': 'None', '01': 'Fever', '02': 'Flu', '03': 'Cough', '04': 'Cold', '05': 'Diarrhea', '07': 'Asthma', '09': 'Dengue', '13': 'Heart Disease', '15': 'High Blood', '99': 'Others' },
    treatment: { '01': 'Traditional Healers', '02': 'Private Doctors', '03': 'RHU Doctors', '05': 'Brgy. Health Station', '06': 'Rural Health Unit', '99': 'Others' },
    water: { '1': 'Local Water System', '2': 'Spring Water', '5': 'Own Artesian Well', '11': 'Water Refilling Station', '12': 'NAWASA', '99': 'Others' },
    lighting: { '1': 'Electricity', '4': 'Solar Panel / Lamp', '6': 'Generator', '7': 'None' },
    cooking: { '1': 'Woods', '2': 'Charcoal', '4': 'LPG', '5': 'Electricity' },
    garbage: { '1': 'Segregating', '2': 'Truck Collection', '5': 'Composting', '6': 'Burning' },
    toilet: { '1': 'Water-Sealed (Own)', '2': 'Water-Sealed (Shared)', '5': 'No Toilet' },
    distance: { '1': 'Walking Distance', '2': '5-15 Minute Drive', '3': '30-Minute Drive', '4': '1 Hour+' },
    income: { '1': '₱3,000 and below', '2': '₱3,001 - ₱6,000', '11': '₱30,001 and up' },
    expenses: { '1': '₱300 and below', '5': '₱1,201 - ₱1,500', '11': '₱3,001 and up' },
    savingsLoc: { '1': 'House', '2': 'Bank', '3': 'E-money', '4': 'Microfinance', '66': 'N/A' },
    ownership: { '1': 'Owned', '2': 'Rented', '4': 'Rent Free' },
    houseClass: { '1': 'Concrete', '2': 'Semi-Concrete', '3': 'Indigenous', '6': 'Makeshift' }
};

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '-';
}

function mapArrayValue(value, map) {
    if (!value) return '-';
    const valArr = Array.isArray(value) ? value : String(value).split(',');
    return valArr.map(v => map[v.trim()] || v.trim()).filter(v => v !== '').join(', ') || '-';
}

function loadProfilingData() {
    const general = JSON.parse(sessionStorage.getItem('profiling_general') || '{}');
    const primary = JSON.parse(sessionStorage.getItem('profiling_primary') || '{}');
    const health = JSON.parse(sessionStorage.getItem('profiling_health') || '{}');
    const socio = JSON.parse(sessionStorage.getItem('profiling_socio') || '{}');

    // Section I: General Information
    setText('gen-purokGimong', general.purokGimong);
    setText('gen-barangayName', general.barangayName);
    setText('gen-municipalityselect', general.municipalityName || general['municipality-select'] || general.municipalityselect);
    setText('gen-provinceName', general.provinceName);
    setText('gen-modeOfTransportation', mapArrayValue(general.modeOfTransportation, maps.transportation));
    setText('gen-roadStructure', general.roadStructure || general.road_Structure);
    setText('gen-parish', general.nameOfParish);
    setText('gen-diocese', general.diocesePrelatureName);
    setText('gen-residency', general.yrOfResInTheCommunity);
    setText('gen-familyMembers', general.numOfFamMembers);
    setText('gen-familyStructure', general.familyStructure);
    setText('gen-dialect', general.lclDialect);

    // Section II: Primary Information (Parents)
    const setParentRow = (prefix, data) => {
        setText(`${prefix}-name`, data[`${prefix}_name`]);
        setText(`${prefix}-marriage`, maps.marriage[data[`${prefix}_marriage`]]);
        setText(`${prefix}-religion`, data[`${prefix}_religion_others`] || maps.religion[data[`${prefix}_religion`]] || '-');
        setText(`${prefix}-sex`, maps.sex[data[`${prefix}_sex`]]);
        setText(`${prefix}-age`, data[`${prefix}_age`]);
        setText(`${prefix}-educ`, data[`${prefix}_educ`]);
        setText(`${prefix}-job`, data[`${prefix}_job_others`] || maps.occupation[data[`${prefix}_job`]] || data[`${prefix}_job`] || '-');
        setText(`${prefix}-work`, data[`${prefix}_work_status_others`] || maps.workStatus[data[`${prefix}_work_status`]] || '-');
    };
    setParentRow('head', primary);
    setParentRow('spouse', primary);

    // Household Members Table
    const membersTable = document.getElementById('membersTable');
    if (membersTable && primary.m_name && Array.isArray(primary.m_name)) {
        membersTable.innerHTML = primary.m_name.map((name, idx) => {
            const sacraments = mapArrayValue(primary.m_sacraments?.[idx], maps.sacrament);
            const workStatus = maps.workStatus[primary.m_work_status?.[idx]] || primary.m_work_status_others?.[idx] || '-';
            
            return `
                <tr>
                    <td>${name || '-'}</td>
                    <td>${primary.m_relation?.[idx] || '-'}</td>
                    <td>${maps.sex[primary.m_sex?.[idx]] || '-'}</td>
                    <td>${primary.m_age?.[idx] || '-'}</td>
                    <td>${maps.civil[primary.m_civil?.[idx]] || '-'}</td>
                    <td>${primary.m_religion?.[idx] || '-'}</td>
                    <td>${sacraments}</td>
                    <td>${maps.studying[primary.m_studying?.[idx]] || '-'}</td>
                    <td>${primary.m_educ?.[idx] || '-'}</td>
                    <td>${maps.occupation[primary.m_job?.[idx]] || '-'}</td>
                    <td>${workStatus}</td>
                    <td>${maps.immunized[primary.m_immunized?.[idx]] || '-'}</td>
                    <td>${primary.m_organization?.[idx] || '-'}</td>
                    <td>${primary.m_position?.[idx] || '-'}</td>
                </tr>`;
        }).join('');
    }

    // Section III: Health
    setText('health-illness', mapArrayValue(health.common_illness, maps.illness));
    setText('health-treatment', mapArrayValue(health.treatment_source, maps.treatment));
    setText('health-water', mapArrayValue(health.water_source, maps.water));
    setText('health-lighting', mapArrayValue(health.lighting_source, maps.lighting));
    setText('health-cooking', mapArrayValue(health.cooking_source, maps.cooking));
    setText('health-garbage', mapArrayValue(health.garbage_disposal, maps.garbage));
    setText('health-toilet', mapArrayValue(health.toilet_type, maps.toilet));
    setText('health-toiletDist', maps.distance[health.toilet_distance] || '-');

    // Section IV: Socio-Economic
    setText('soc-income', maps.income[socio.income_monthly]);
    setText('soc-expenses', maps.expenses[socio.expenses_weekly]);
    setText('soc-savings', socio.has_savings === '1' ? 'Yes' : 'None');
    setText('soc-savingsLoc', mapArrayValue(socio.savings_location, maps.savingsLoc));
    setText('soc-ownership', mapArrayValue(socio.house_ownership, maps.ownership));
    setText('soc-houseClass', mapArrayValue(socio.house_classification, maps.houseClass));
    setText('soc-landArea', socio.land_area);
    setText('soc-assets', Array.isArray(socio.assets) ? socio.assets.join(', ') : '-');
    setText('soc-livestock', socio.livestock_owned);
    setText('soc-church', maps.distance[socio.distance_church]);
    setText('soc-market', maps.distance[socio.distance_market]);
    setText('soc-companion', socio.missionary_companion);
}