function createMemberCard(data = {}, index = null) {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.closest('.member-card').remove()">✕</button>
        <h6>Member #${index !== null ? index + 1 : document.querySelectorAll('.member-card').length + 1}</h6>
        <div class="row g-3">
            <div class="col-md-4">
                <label class="form-label">Full Name</label>
                <input type="text" name="m_name[]" class="form-control" value="${data.name || ''}" placeholder="Enter name" required>
            </div>
            <div class="col-md-4">
                <label class="form-label">Relation</label>
                <select name="m_relation[]" class="form-select">
                    <option value="">Select...</option>
                    <option value="1" ${(data.relation === '1') ? 'selected' : ''}>Son</option>
                    <option value="2" ${(data.relation === '2') ? 'selected' : ''}>Daughter</option>
                    <option value="3" ${(data.relation === '3') ? 'selected' : ''}>Stepson</option>
                    <option value="7" ${(data.relation === '7') ? 'selected' : ''}>Grandson</option>
                    <option value="13" ${(data.relation === '13') ? 'selected' : ''}>Relative</option>
                    <option value="99" ${(data.relation === '99') ? 'selected' : ''}>Others</option>
                </select>
            </div>
            <input type="hidden" name="m_role[]" value="Member">
            <div class="col-md-3">
                <label class="form-label">Sex</label>
                <select name="m_sex[]" class="form-select">
                    <option value="1" ${(data.sex === '1') ? 'selected' : ''}>Male</option>
                    <option value="2" ${(data.sex === '2') ? 'selected' : ''}>Female</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Age</label>
                <input type="number" name="m_age[]" class="form-control" value="${data.age || ''}" placeholder="Age" min="0">
            </div>
            <div class="col-md-3">
                <label class="form-label">Civil Status</label>
                <select name="m_civil[]" class="form-select">
                    <option value="">Select...</option>
                    <option value="1" ${(data.civil === '1') ? 'selected' : ''}>Single</option>
                    <option value="2" ${(data.civil === '2') ? 'selected' : ''}>Married</option>
                    <option value="3" ${(data.civil === '3') ? 'selected' : ''}>Common Law</option>
                    <option value="4" ${(data.civil === '4') ? 'selected' : ''}>Widowed</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Religion</label>
                <select name="m_religion[]" class="form-select">
                    <option value="">Select...</option>
                    <option value="1" ${(data.religion === '1') ? 'selected' : ''}>Roman Catholic</option>
                    <option value="2" ${(data.religion === '2') ? 'selected' : ''}>Islam</option>
                    <option value="99" ${(data.religion === '99') ? 'selected' : ''}>Others</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Sacraments</label>
                <select name="m_sacraments[]" class="form-select">
                    <option value="">Select...</option>
                    <option value="1" ${(data.sacraments === '1') ? 'selected' : ''}>None</option>
                    <option value="2" ${(data.sacraments === '2') ? 'selected' : ''}>Baptism</option>
                    <option value="3" ${(data.sacraments === '3') ? 'selected' : ''}>Confirmation</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Studying?</label>
                <select name="m_studying[]" class="form-select">
                    <option value="1" ${(data.studying === '1') ? 'selected' : ''}>Yes</option>
                    <option value="2" ${(data.studying === '2') ? 'selected' : ''}>No</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Education</label>
                <select name="m_educ[]" class="form-select">
                    <option value="">Select...</option>
                    <option value="Pre-School" ${(data.educ === 'Pre-School') ? 'selected' : ''}>Pre-School</option>
                    <option value="Elementary" ${(data.educ === 'Elementary') ? 'selected' : ''}>Elementary</option>
                    <option value="Junior High" ${(data.educ === 'Junior High') ? 'selected' : ''}>Junior High</option>
                    <option value="Senior High" ${(data.educ === 'Senior High') ? 'selected' : ''}>Senior High</option>
                    <option value="College" ${(data.educ === 'College') ? 'selected' : ''}>College</option>
                    <option value="Post-Graduate" ${(data.educ === 'Post-Graduate') ? 'selected' : ''}>Post-Graduate</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Occupation</label>
                <input type="text" name="m_job[]" class="form-control" value="${data.job || ''}" placeholder="e.g., Student, Farmer">
            </div>
            <div class="col-md-4">
                <label class="form-label">Work Status</label>
                <select name="m_work_status[]" class="form-select">
                    <option value="">Select...</option>
                    <option value="1" ${(data.work_status === '1') ? 'selected' : ''}>Regular</option>
                    <option value="2" ${(data.work_status === '2') ? 'selected' : ''}>Contractual</option>
                    <option value="3" ${(data.work_status === '3') ? 'selected' : ''}>Unemployed</option>
                    <option value="4" ${(data.work_status === '4') ? 'selected' : ''}>Self-Employed</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Immunized? <small class="text-muted">(0-5 yrs)</small></label>
                <select name="m_immunized[]" class="form-select">
                    <option value="66" ${(data.immunized === '66') ? 'selected' : ''}>N/A</option>
                    <option value="1" ${(data.immunized === '1') ? 'selected' : ''}>Yes</option>
                    <option value="2" ${(data.immunized === '2') ? 'selected' : ''}>No</option>
                </select>
            </div>
        </div>
    `;
    return card;
}

function addRow() {
    const container = document.getElementById('membersContainer');
    const emptyMsg = container.querySelector('p');
    if (emptyMsg) emptyMsg.remove();
    
    const card = createMemberCard();
    container.appendChild(card);
}

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

function loadSavedData() {
    const saved = JSON.parse(sessionStorage.getItem('survey_primary') || '{}');
    const container = document.getElementById('membersContainer');
    
    if (saved.head_name) document.querySelector('[name="head_name"]').value = saved.head_name;
    if (saved.head_marriage) document.querySelector('[name="head_marriage"]').value = saved.head_marriage;
    if (saved.head_religion) document.querySelector('[name="head_religion"]').value = saved.head_religion;
    if (saved.head_sex) document.querySelector('[name="head_sex"]').value = saved.head_sex;
    if (saved.head_age) document.querySelector('[name="head_age"]').value = saved.head_age;
    if (saved.head_educ) document.querySelector('[name="head_educ"]').value = saved.head_educ;
    if (saved.head_job) document.querySelector('[name="head_job"]').value = saved.head_job;
    if (saved.head_work_status) document.querySelector('[name="head_work_status"]').value = saved.head_work_status;
    if (saved.spouse_name) document.querySelector('[name="spouse_name"]').value = saved.spouse_name;
    if (saved.spouse_marriage) document.querySelector('[name="spouse_marriage"]').value = saved.spouse_marriage;
    if (saved.spouse_religion) document.querySelector('[name="spouse_religion"]').value = saved.spouse_religion;
    if (saved.spouse_sex) document.querySelector('[name="spouse_sex"]').value = saved.spouse_sex;
    if (saved.spouse_age) document.querySelector('[name="spouse_age"]').value = saved.spouse_age;
    if (saved.spouse_educ) document.querySelector('[name="spouse_educ"]').value = saved.spouse_educ;
    if (saved.spouse_job) document.querySelector('[name="spouse_job"]').value = saved.spouse_job;
    if (saved.spouse_work_status) document.querySelector('[name="spouse_work_status"]').value = saved.spouse_work_status;

    if (saved.m_name && Array.isArray(saved.m_name)) {
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
            const card = createMemberCard(cardData, idx);
            container.appendChild(card);
        });
    } else {
        addRow();
    }
}

function goNext() {
    saveFormData();
    window.location.href = '/survey4';
}

function goPrev() {
    saveFormData();
    window.location.href = '/survey';
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
});