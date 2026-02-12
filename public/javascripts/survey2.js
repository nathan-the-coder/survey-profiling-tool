// Toggle occupation input visibility
function toggleOccupationInput(select, inputId) {
    const input = document.getElementById(inputId);
    if (select.value === 'Others') {
        input.classList.remove('d-none');
    } else {
        input.classList.add('d-none');
        input.value = '';
    }
}

// Create a member card HTML string
function createMemberCardHTML(data, index) {
    const memberNum = index !== null ? index + 1 : (document.querySelectorAll('.member-card').length + 1);
    const civilOptions = [
        { value: '', text: 'Select...' },
        { value: '1', text: 'Single' },
        { value: '2', text: 'Married' },
        { value: '3', text: 'Common Law' },
        { value: '4', text: 'Widowed' },
        { value: '5', text: 'Divorced' },
        { value: '6', text: 'Separated' },
        { value: '7', text: 'Annulled' },
        { value: '8', text: 'Unknown' }
    ];
    
    const religionOptions = [
        { value: '', text: 'Select...' },
        { value: '1', text: 'Roman Catholic' },
        { value: '2', text: 'Islam' },
        { value: '3', text: 'UCCP/Protestant' },
        { value: '4', text: "Jehova's Witnesses" },
        { value: '6', text: 'Iglesia ni Cristo' },
        { value: '7', text: 'Four Square Church' },
        { value: '8', text: 'Seventh Day Adventist' },
        { value: '9', text: 'Mormons' },
        { value: '10', text: 'Born Again' },
        { value: '11', text: 'Bible Baptist' },
        { value: '12', text: 'Church of Christ' },
        { value: '13', text: 'Others Please Specify...' }
    ];
    
    const sacramentOptions = [
        { value: '', text: 'Select...' },
        { value: '1', text: 'None' },
        { value: '2', text: 'Baptism' },
        { value: '3', text: 'Confirmation' },
        { value: '4', text: 'First Communion' },
        { value: '5', text: 'Marriage' },
        { value: '6', text: 'Holy Orders' }
    ];
    
    const educationOptions = [
        { value: '', text: 'Select...' },
        { value: 'Pre-School', text: 'Pre-School' },
        { value: 'Elementary', text: 'Elementary' },
        { value: 'Junior High', text: 'Junior High' },
        { value: 'Senior High', text: 'Senior High' },
        { value: 'College', text: 'College' },
        { value: 'Post-Graduate', text: 'Post-Graduate' }
    ];
    
    const workStatusOptions = [
        { value: '', text: 'Select...' },
        { value: '1', text: 'Regular' },
        { value: '2', text: 'Contractual' },
        { value: '3', text: 'Unemployed' },
        { value: '4', text: 'Self-Employed' }
    ];
    
    const immunizedOptions = [
        { value: '66', text: 'N/A' },
        { value: '1', text: 'Yes' },
        { value: '2', text: 'No' }
    ];
    
    const studyingOptions = [
        { value: '1', text: 'Yes' },
        { value: '2', text: 'No' }
    ];
    
    const relationOptions = [
        { value: '', text: 'Select...' },
        { value: '1', text: 'Son' },
        { value: '2', text: 'Daughter' },
        { value: '3', text: 'Stepson' },
        { value: '7', text: 'Grandson' },
        { value: '13', text: 'Relative' },
        { value: '99', text: 'Others' }
    ];
    
    const occupationOptions = [
        { value: '', text: 'Select...' },
        { value: 'Farming', text: 'Farming' },
        { value: 'Tenant', text: 'Tenant' },
        { value: 'Fishing', text: 'Fishing' },
        { value: 'Vending', text: 'Vending' },
        { value: 'Hired Labor', text: 'Hired Labor' },
        { value: 'Employed', text: 'Employed' },
        { value: 'OFW', text: 'OFW' },
        { value: 'Domestic Worker', text: 'Domestic Worker' },
        { value: 'Entertainment', text: 'Entertainment' },
        { value: 'Others', text: 'Others' }
    ];
    
    function selectOption(options, selectedValue) {
        return options.map(opt => 
            `<option value="${opt.value}" ${selectedValue === opt.value ? 'selected' : ''}>${opt.text}</option>`
        ).join('');
    }
    
    return `
        <div class="member-card">
            <button type="button" class="remove-btn" onclick="this.closest('.member-card').remove()">X</button>
            <h6>Member #${memberNum}</h6>
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Full Name</label>
                    <input type="text" name="m_name[]" class="form-control" value="${data.name || ''}" placeholder="Enter name" required>
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
                        <option value="1" ${data.sex === '1' ? 'selected' : ''}>Male</option>
                        <option value="2" ${data.sex === '2' ? 'selected' : ''}>Female</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Age</label>
                    <input type="number" name="m_age[]" class="form-control" value="${data.age || ''}" placeholder="Age" min="0">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Civil Status</label>
                    <select name="m_civil[]" class="form-select">
                        ${selectOption(civilOptions, data.civil)}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Religion</label>
                    <select name="m_religion[]" class="form-select">
                        ${selectOption(religionOptions, data.religion)}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Sacraments</label>
                    <select name="m_sacraments[]" class="form-select">
                        ${selectOption(sacramentOptions, data.sacraments)}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Studying?</label>
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
                    <input type="text" name="m_job_others" id="m_job_others_${memberNum}" class="form-control mt-2 ${data.job !== 'Others' ? 'd-none' : ''}" placeholder="Please specify occupation">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Status of Work</label>
                    <select name="m_work_status[]" class="form-select">
                        ${selectOption(workStatusOptions, data.work_status)}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Immunized? <small class="text-muted">(0-5 yrs)</small></label>
                    <select name="m_immunized[]" class="form-select">
                        ${selectOption(immunizedOptions, data.immunized)}
                    </select>
                </div>
            </div>
        </div>
    `;
}

// Add a new member row
function addRow() {
    const container = document.getElementById('membersContainer');
    const emptyMsg = container.querySelector('p');
    if (emptyMsg) emptyMsg.remove();
    
    const card = document.createElement('div');
    card.innerHTML = createMemberCardHTML({}, null);
    container.appendChild(card.firstElementChild);
}

// Save form data to sessionStorage
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
    
    sessionStorage.setItem('survey_primary', JSON.stringify(data));
}

// Navigate to next page
function goNext() {
    saveFormData();
    window.location.href = '/survey4';
}

// Navigate to previous page
function goPrev() {
    saveFormData();
    window.location.href = '/survey';
}

// Load saved data from sessionStorage
function loadSavedData() {
    const saved = JSON.parse(sessionStorage.getItem('survey_primary') || '{}');
    const container = document.getElementById('membersContainer');
    
    // Load head fields
    const headFields = ['head_name', 'head_marriage', 'head_religion', 'head_sacraments', 'head_sex', 'head_age', 'head_educ', 'head_work_status', 'head_job'];
    headFields.forEach(field => {
        const el = document.querySelector(`[name="${field}"]`);
        if (el && saved[field]) {
            el.value = saved[field];
            if (el.onchange) el.onchange();
        }
    });
    
    // Load spouse fields
    const spouseFields = ['spouse_name', 'spouse_marriage', 'spouse_religion', 'spouse_sacraments', 'spouse_sex', 'spouse_age', 'spouse_educ', 'spouse_work_status', 'spouse_job'];
    spouseFields.forEach(field => {
        const el = document.querySelector(`[name="${field}"]`);
        if (el && saved[field]) {
            el.value = saved[field];
            if (el.onchange) el.onchange();
        }
    });
    
    // Load household members
    if (saved.m_name && Array.isArray(saved.m_name) && saved.m_name.length > 0) {
        container.innerHTML = '';
        saved.m_name.forEach((name, idx) => {
            const cardData = {
                name: name,
                relation: saved.m_relation?.[idx],
                sex: saved.m_sex?.[idx],
                age: saved.m_age?.[idx],
                civil: saved.m_civil?.[idx],
                religion: saved.m_religion?.[idx],
                sacraments: saved.m_sacraments?.[idx],
                studying: saved.m_studying?.[idx],
                educ: saved.m_educ?.[idx],
                job: saved.m_job?.[idx],
                work_status: saved.m_work_status?.[idx],
                immunized: saved.m_immunized?.[idx]
            };
            const div = document.createElement('div');
            div.innerHTML = createMemberCardHTML(cardData, idx);
            container.appendChild(div.firstElementChild);
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
});
