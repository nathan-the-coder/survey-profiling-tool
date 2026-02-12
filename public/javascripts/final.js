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

const religionMap = {
    '1': 'Roman Catholic',
    '2': 'Islam',
    '99': 'Others'
};

const sexMap = {
    '1': 'Male',
    '2': 'Female'
};

const workStatusMap = {
    '1': 'Regular',
    '2': 'Contractual',
    '3': 'Unemployed',
    '4': 'Self-Employed'
};

const civilMap = {
    '1': 'Single',
    '2': 'Married',
    '3': 'Common Law',
    '4': 'Widowed'
};

const sacramentMap = {
    '1': 'None',
    '2': 'Baptism',
    '3': 'Confirmation'
};

const marriageMap = {
    '1': 'Civil',
    '2': 'Church'
};

const studyingMap = {
    '1': 'Yes',
    '2': 'No'
};

const immunizedMap = {
    '1': 'Yes',
    '2': 'No',
    '66': 'N/A'
};

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '-';
}

function loadSurveyData() {
    const general = JSON.parse(sessionStorage.getItem('survey_general') || '{}');
    const primary = JSON.parse(sessionStorage.getItem('survey_primary') || '{}');
    const health = JSON.parse(sessionStorage.getItem('survey_health') || '{}');
    const socio = JSON.parse(sessionStorage.getItem('survey_socio') || '{}');
    
    setText('gen-purokGimong', general.purokGimong);
    setText('gen-barangayName', general.barangayName);
    setText('gen-municipalityselect', general['municipality-select'] || general.municipalityselect);
    setText('gen-provinceName', general.provinceName);
    setText('gen-modeOfTransportation', general.modeOfTransportation);
    setText('gen-roadStructure', general.road_Structure);
    setText('gen-urbanRural', general.urban_ruralClassification);
    setText('gen-parish', general.nameOfParish);
    setText('gen-diocese', general.diocesePrelatureName);
    setText('gen-residency', general.yrOfResInTheCommunity);
    setText('gen-familyMembers', general.numOfFamMembers);
    setText('gen-familyStructure', general.familyStructure);
    setText('gen-dialect', general.lclDialect);
    setText('gen-ethnicity', general.ethnicity);
    
    setText('head-name', primary.head_name);
    setText('head-marriage', marriageMap[primary.head_marriage]);
    setText('head-religion', religionMap[primary.head_religion]);
    setText('head-sex', sexMap[primary.head_sex]);
    setText('head-age', primary.head_age);
    setText('head-educ', primary.head_educ);
    setText('head-job', primary.head_job);
    setText('head-work', workStatusMap[primary.head_work_status]);
    
    setText('spouse-name', primary.spouse_name);
    setText('spouse-marriage', marriageMap[primary.spouse_marriage]);
    setText('spouse-religion', religionMap[primary.spouse_religion]);
    setText('spouse-sex', sexMap[primary.spouse_sex]);
    setText('spouse-age', primary.spouse_age);
    setText('spouse-educ', primary.spouse_educ);
    setText('spouse-job', primary.spouse_job);
    setText('spouse-work', workStatusMap[primary.spouse_work_status]);
    
    const membersTable = document.getElementById('membersTable');
    if (membersTable) {
        membersTable.innerHTML = '';
        if (primary.m_name && Array.isArray(primary.m_name)) {
            primary.m_name.forEach((name, idx) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${name || '-'}</td>
                    <td>${primary.m_relation?.[idx] || '-'}</td>
                    <td>${sexMap[primary.m_sex?.[idx]] || primary.m_sex?.[idx] || '-'}</td>
                    <td>${primary.m_age?.[idx] || '-'}</td>
                    <td>${civilMap[primary.m_civil?.[idx]] || primary.m_civil?.[idx] || '-'}</td>
                    <td>${religionMap[primary.m_religion?.[idx]] || primary.m_religion?.[idx] || '-'}</td>
                    <td>${sacramentMap[primary.m_sacraments?.[idx]] || primary.m_sacraments?.[idx] || '-'}</td>
                    <td>${studyingMap[primary.m_studying?.[idx]] || primary.m_studying?.[idx] || '-'}</td>
                    <td>${primary.m_educ?.[idx] || '-'}</td>
                    <td>${primary.m_job?.[idx] || '-'}</td>
                    <td>${workStatusMap[primary.m_work_status?.[idx]] || primary.m_work_status?.[idx] || '-'}</td>
                    <td>${immunizedMap[primary.m_immunized?.[idx]] || primary.m_immunized?.[idx] || '-'}</td>
                `;
                membersTable.appendChild(row);
            });
        }
    }
    
    const illnessMap = {
        '00': 'None', '01': 'Fever', '02': 'Flu', '03': 'Cough',
        '04': 'Cold', '05': 'Diarrhea', '07': 'Asthma', '13': 'Heart Disease',
        '15': 'High Blood', '99': 'Others'
    };
    const treatmentMap = {
        '01': 'Traditional Healers', '02': 'Private Doctors',
        '05': 'Brgy. Health Station', '06': 'Rural Health Unit',
        '10': 'Private Clinic', '99': 'Others'
    };
    const waterMap = {
        '1': 'Local Water System', '5': 'Own Artesian Well',
        '11': 'Water Refilling Station', '12': 'NAWASA', '99': 'Others'
    };
    const lightingMap = {
        '1': 'Electricity', '2': 'Kerosene (Gaas)', '4': 'Solar Lamp', '99': 'Others'
    };
    const cookingMap = {
        '1': 'Woods', '2': 'Charcoal', '4': 'LPG', '5': 'Electricity', '99': 'Others'
    };
    const garbageMap = {
        '1': 'Segregating waste', '2': 'Collected by garbage truck',
        '6': 'Burning', '99': 'Others'
    };
    const toiletMap = {
        '1': 'Water-sealed flush (own)', '2': 'Water-sealed flush (shared)',
        '3': 'Closed pit', '5': 'No toilet'
    };
    const toiletDistMap = {
        '1': 'Below 200 meters', '2': '201-500 meters', '5': 'More than 1000 meters'
    };
    
    setText('health-illness', illnessMap[health.common_illness] || health.common_illness_others || '-');
    setText('health-treatment', treatmentMap[health.treatment_source] || health.treatment_source_others || '-');
    setText('health-water', waterMap[health.water_source] || health.water_source_others || '-');
    setText('health-lighting', lightingMap[health.lighting_source] || health.lighting_others || '-');
    setText('health-cooking', cookingMap[health.cooking_source] || health.cooking_others || '-');
    setText('health-garbage', garbageMap[health.garbage_disposal] || health.garbage_others || '-');
    setText('health-toilet', toiletMap[health.toilet_type] || '-');
    setText('health-toiletDist', toiletDistMap[health.toilet_distance] || '-');
    
    const incomeMap = {
        '1': '₱3,000 and below', '2': '₱3,001 - ₱6,000', '3': '₱6,001 - ₱9,000',
        '4': '₱9,001 - ₱12,000', '5': '₱12,001 - ₱15,000', '6': '₱15,001 - ₱18,000',
        '7': '₱18,001 - ₱21,000', '8': '₱21,001 - ₱24,000', '9': '₱24,001 - ₱27,000',
        '10': '₱27,001 - ₱30,000', '11': '₱30,001 and up'
    };
    const expensesMap = {
        '1': '₱300 and below', '2': '₱301 - ₱600', '3': '₱601 - ₱900',
        '4': '₱901 - ₱1,200', '5': '₱1,201 - ₱1,500', '6': '₱1,501 - ₱1,800',
        '7': '₱1,801 - ₱2,100', '8': '₱2,101 - ₱2,400', '9': '₱2,401 - ₱2,700',
        '10': '₱2,701 - ₱3,000', '11': '₱3,001 and up'
    };
    const savingsMap = { '1': 'Yes', '2': 'None' };
    const savingsLocMap = {
        '1': 'House', '2': 'Bank', '3': 'E-money (GCash, etc.)',
        '4': 'Microfinance / ASA', '99': 'Others', '66': 'Not Applicable'
    };
    const ownershipMap = {
        '1': 'Owned', '2': 'Rented House', '3': 'Tenanted',
        '4': 'Rent Free', '5': 'Caretaker', '99': 'Others'
    };
    const houseClassMap = {
        '1': 'Concrete', '2': 'Semi-Concrete', '3': 'Indigenous Materials',
        '4': 'Galvanized Iron / Aluminum', '5': 'Barong-barong', '6': 'Makeshift', '99': 'Others'
    };
    const distMap = {
        '1': 'Walking Distance (Ideal)', '2': '5-15 Minute Drive',
        '3': '30-Minute Drive', '4': 'Over 45 Minutes - 1 Hour+'
    };
    
    setText('soc-income', incomeMap[socio.income_monthly] || '-');
    setText('soc-expenses', expensesMap[socio.expenses_weekly] || '-');
    setText('soc-savings', savingsMap[socio.has_savings] || '-');
    setText('soc-savingsLoc', savingsLocMap[socio.savings_location] || '-');
    setText('soc-ownership', ownershipMap[socio.house_ownership] || '-');
    setText('soc-houseClass', houseClassMap[socio.house_classification] || '-');
    setText('soc-landArea', socio.land_area || '-');
    setText('soc-assets', socio.assets ? socio.assets.join(', ') : '-');
    setText('soc-livestock', socio.livestock_owned || '-');
    setText('soc-livestockOther', socio.livestock_for_others || '-');
    setText('soc-church', distMap[socio.distance_church] || '-');
    setText('soc-market', distMap[socio.distance_market] || '-');
    setText('soc-companion', socio.missionary_companion || '-');
    setText('soc-date', socio.listing_date || '-');
}