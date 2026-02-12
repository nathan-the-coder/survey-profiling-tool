/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */
function addRow() {
    const table = document.getElementById('membersTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input name="m_name[]" class="form-control form-control-sm" required></td>
        <td>
            <select name="m_relation[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="1">Son</option>
                <option value="2">Daughter</option>
                <option value="3">Stepson</option>
                <option value="7">Grandson</option>
                <option value="13">Relative</option>
                <option value="99">Others</option>
            </select>
        </td>
        <input type="hidden" name="m_role[]" value="Member">
        <td><select name="m_sex[]" class="form-select form-select-sm">
            <option value="1">Male</option><option value="2">Female</option>
        </select></td>
        <td><input name="m_age[]" type="number" class="form-control form-control-sm" min="0"></td>
        <td>
            <select name="m_civil[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="1">Single</option>
                <option value="2">Married</option>
                <option value="3">Common Law</option>
                <option value="4">Widowed</option>
            </select>
        </td>
        <td>
            <select name="m_religion[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="1">Roman Catholic</option>
                <option value="2">Islam</option>
                <option value="99">Others</option>
            </select>
        </td>
        <td>
            <select name="m_sacraments[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="1">None</option>
                <option value="2">Baptism</option>
                <option value="3">Confirmation</option>
            </select>
        </td>
        <td><select name="m_studying[]" class="form-select form-select-sm">
            <option value="1">Yes</option><option value="2">No</option>
        </select></td>
        <td>
            <select name="m_educ[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="Pre-School">Pre-School</option>
                <option value="Elementary">Elementary</option>
                <option value="Junior High">Junior High</option>
                <option value="Senior High">Senior High</option>
                <option value="College">College</option>
                <option value="Post-Graduate">Post-Graduate</option>
            </select>
        </td>
        <td><input name="m_job[]" class="form-control form-control-sm"></td>
        <td>
            <select name="m_work_status[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="1">Regular</option>
                <option value="2">Contractual</option>
                <option value="3">Unemployed</option>
                <option value="4">Self-Employed</option>
            </select>
        </td>
        <td><select name="m_immunized[]" class="form-select form-select-sm">
            <option value="66">N/A</option><option value="1">Yes</option><option value="2">No</option>
        </select></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()"><i class="bi bi-trash"></i></button></td>
    `;
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
    let saved = JSON.parse(sessionStorage.getItem('survey_primary') || '{}');
    
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
        const tbody = document.querySelector('#membersTable tbody');
        tbody.innerHTML = '';
        saved.m_name.forEach((name, idx) => {
            const table = document.getElementById('membersTable');
            const newRow = table.insertRow();
            newRow.innerHTML = `
                <td><input name="m_name[]" class="form-control form-control-sm" value="${name || ''}" required></td>
                <td><select name="m_relation[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="1" ${(saved.m_relation?.[idx] || '') === '1' ? 'selected' : ''}>Son</option>
                    <option value="2" ${(saved.m_relation?.[idx] || '') === '2' ? 'selected' : ''}>Daughter</option>
                    <option value="3" ${(saved.m_relation?.[idx] || '') === '3' ? 'selected' : ''}>Stepson</option>
                    <option value="7" ${(saved.m_relation?.[idx] || '') === '7' ? 'selected' : ''}>Grandson</option>
                    <option value="13" ${(saved.m_relation?.[idx] || '') === '13' ? 'selected' : ''}>Relative</option>
                    <option value="99" ${(saved.m_relation?.[idx] || '') === '99' ? 'selected' : ''}>Others</option>
                </select></td>
                <input type="hidden" name="m_role[]" value="Member">
                <td><select name="m_sex[]" class="form-select form-select-sm">
                    <option value="1" ${(saved.m_sex?.[idx] || '') === '1' ? 'selected' : ''}>Male</option>
                    <option value="2" ${(saved.m_sex?.[idx] || '') === '2' ? 'selected' : ''}>Female</option>
                </select></td>
                <td><input name="m_age[]" type="number" class="form-control form-control-sm" value="${saved.m_age?.[idx] || ''}"></td>
                <td><select name="m_civil[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="1" ${(saved.m_civil?.[idx] || '') === '1' ? 'selected' : ''}>Single</option>
                    <option value="2" ${(saved.m_civil?.[idx] || '') === '2' ? 'selected' : ''}>Married</option>
                    <option value="3" ${(saved.m_civil?.[idx] || '') === '3' ? 'selected' : ''}>Common Law</option>
                    <option value="4" ${(saved.m_civil?.[idx] || '') === '4' ? 'selected' : ''}>Widowed</option>
                </select></td>
                <td><select name="m_religion[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="1" ${(saved.m_religion?.[idx] || '') === '1' ? 'selected' : ''}>Roman Catholic</option>
                    <option value="2" ${(saved.m_religion?.[idx] || '') === '2' ? 'selected' : ''}>Islam</option>
                    <option value="99" ${(saved.m_religion?.[idx] || '') === '99' ? 'selected' : ''}>Others</option>
                </select></td>
                <td><select name="m_sacraments[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="1" ${(saved.m_sacraments?.[idx] || '') === '1' ? 'selected' : ''}>None</option>
                    <option value="2" ${(saved.m_sacraments?.[idx] || '') === '2' ? 'selected' : ''}>Baptism</option>
                    <option value="3" ${(saved.m_sacraments?.[idx] || '') === '3' ? 'selected' : ''}>Confirmation</option>
                </select></td>
                <td><select name="m_studying[]" class="form-select form-select-sm">
                    <option value="1" ${(saved.m_studying?.[idx] || '') === '1' ? 'selected' : ''}>Yes</option>
                    <option value="2" ${(saved.m_studying?.[idx] || '') === '2' ? 'selected' : ''}>No</option>
                </select></td>
                <td><select name="m_educ[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="Pre-School" ${(saved.m_educ?.[idx] || '') === 'Pre-School' ? 'selected' : ''}>Pre-School</option>
                    <option value="Elementary" ${(saved.m_educ?.[idx] || '') === 'Elementary' ? 'selected' : ''}>Elementary</option>
                    <option value="Junior High" ${(saved.m_educ?.[idx] || '') === 'Junior High' ? 'selected' : ''}>Junior High</option>
                    <option value="Senior High" ${(saved.m_educ?.[idx] || '') === 'Senior High' ? 'selected' : ''}>Senior High</option>
                    <option value="College" ${(saved.m_educ?.[idx] || '') === 'College' ? 'selected' : ''}>College</option>
                    <option value="Post-Graduate" ${(saved.m_educ?.[idx] || '') === 'Post-Graduate' ? 'selected' : ''}>Post-Graduate</option>
                </select></td>
                <td><input name="m_job[]" class="form-control form-control-sm" value="${saved.m_job?.[idx] || ''}"></td>
                <td><select name="m_work_status[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="1" ${(saved.m_work_status?.[idx] || '') === '1' ? 'selected' : ''}>Regular</option>
                    <option value="2" ${(saved.m_work_status?.[idx] || '') === '2' ? 'selected' : ''}>Contractual</option>
                    <option value="3" ${(saved.m_work_status?.[idx] || '') === '3' ? 'selected' : ''}>Unemployed</option>
                    <option value="4" ${(saved.m_work_status?.[idx] || '') === '4' ? 'selected' : ''}>Self-Employed</option>
                </select></td>
                <td><select name="m_immunized[]" class="form-select form-select-sm">
                    <option value="66" ${(saved.m_immunized?.[idx] || '') === '66' ? 'selected' : ''}>N/A</option>
                    <option value="1" ${(saved.m_immunized?.[idx] || '') === '1' ? 'selected' : ''}>Yes</option>
                    <option value="2" ${(saved.m_immunized?.[idx] || '') === '2' ? 'selected' : ''}>No</option>
                </select></td>
                <td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()"><i class="bi bi-trash"></i></button></td>
            `;
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