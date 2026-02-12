/** biome-ignore-all lint/correctness/noUnusedVariables: unused variables are used outside of js */
function addRow() {
    const table = document.getElementById('membersTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input name="m_name[]" class="form-control form-control-sm" required></td>
        <td>
            <select name="m_relation[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Stepson">Stepson</option>
                <option value="Grandson">Grandson</option>
                <option value="Relative">Relative</option>
                <option value="Others">Others</option>
            </select>
        </td>
        <input type="hidden" name="m_role[]" value="Member">
        <td><select name="m_sex[]" class="form-select form-select-sm">
            <option value="Male">Male</option><option value="Female">Female</option>
        </select></td>
        <td><input name="m_age[]" type="number" class="form-control form-control-sm" min="0"></td>
        <td>
            <select name="m_civil[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Common Law">Common Law</option>
                <option value="Widowed">Widowed</option>
            </select>
        </td>
        <td>
            <select name="m_religion[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="Roman Catholic">Roman Catholic</option>
                <option value="Islam">Islam</option>
                <option value="Others">Others</option>
            </select>
        </td>
        <td>
            <select name="m_sacraments[]" class="form-select form-select-sm">
                <option value="">Select...</option>
                <option value="None">None</option>
                <option value="Baptism">Baptism</option>
                <option value="Confirmation">Confirmation</option>
            </select>
        </td>
        <td><select name="m_studying[]" class="form-select form-select-sm">
            <option value="Yes">Yes</option><option value="No">No</option>
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
                <option value="Regular">Regular</option>
                <option value="Contractual">Contractual</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Self-Employed">Self-Employed</option>
            </select>
        </td>
        <td><select name="m_immunized[]" class="form-select form-select-sm">
            <option value="N/A">N/A</option><option value="Yes">Yes</option><option value="No">No</option>
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
    const saved = JSON.parse(sessionStorage.getItem('survey_primary') || '{}');
    if (saved.head_name) document.querySelector('[name="head_name"]').value = saved.head_name;
    if (saved.spouse_name) document.querySelector('[name="spouse_name"]').value = saved.spouse_name;
    
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
                    <option value="Son" ${(saved.m_relation?.[idx] || '') === 'Son' ? 'selected' : ''}>Son</option>
                    <option value="Daughter" ${(saved.m_relation?.[idx] || '') === 'Daughter' ? 'selected' : ''}>Daughter</option>
                    <option value="Stepson" ${(saved.m_relation?.[idx] || '') === 'Stepson' ? 'selected' : ''}>Stepson</option>
                    <option value="Grandson" ${(saved.m_relation?.[idx] || '') === 'Grandson' ? 'selected' : ''}>Grandson</option>
                    <option value="Relative" ${(saved.m_relation?.[idx] || '') === 'Relative' ? 'selected' : ''}>Relative</option>
                    <option value="Others" ${(saved.m_relation?.[idx] || '') === 'Others' ? 'selected' : ''}>Others</option>
                </select></td>
                <input type="hidden" name="m_role[]" value="Member">
                <td><select name="m_sex[]" class="form-select form-select-sm">
                    <option value="Male" ${(saved.m_sex?.[idx] || '') === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${(saved.m_sex?.[idx] || '') === 'Female' ? 'selected' : ''}>Female</option>
                </select></td>
                <td><input name="m_age[]" type="number" class="form-control form-control-sm" value="${saved.m_age?.[idx] || ''}"></td>
                <td><select name="m_civil[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="Single" ${(saved.m_civil?.[idx] || '') === 'Single' ? 'selected' : ''}>Single</option>
                    <option value="Married" ${(saved.m_civil?.[idx] || '') === 'Married' ? 'selected' : ''}>Married</option>
                    <option value="Common Law" ${(saved.m_civil?.[idx] || '') === 'Common Law' ? 'selected' : ''}>Common Law</option>
                    <option value="Widowed" ${(saved.m_civil?.[idx] || '') === 'Widowed' ? 'selected' : ''}>Widowed</option>
                </select></td>
                <td><select name="m_religion[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="Roman Catholic" ${(saved.m_religion?.[idx] || '') === 'Roman Catholic' ? 'selected' : ''}>Roman Catholic</option>
                    <option value="Islam" ${(saved.m_religion?.[idx] || '') === 'Islam' ? 'selected' : ''}>Islam</option>
                    <option value="Others" ${(saved.m_religion?.[idx] || '') === 'Others' ? 'selected' : ''}>Others</option>
                </select></td>
                <td><select name="m_sacraments[]" class="form-select form-select-sm">
                    <option value="">Select...</option>
                    <option value="None" ${(saved.m_sacraments?.[idx] || '') === 'None' ? 'selected' : ''}>None</option>
                    <option value="Baptism" ${(saved.m_sacraments?.[idx] || '') === 'Baptism' ? 'selected' : ''}>Baptism</option>
                    <option value="Confirmation" ${(saved.m_sacraments?.[idx] || '') === 'Confirmation' ? 'selected' : ''}>Confirmation</option>
                </select></td>
                <td><select name="m_studying[]" class="form-select form-select-sm">
                    <option value="Yes" ${(saved.m_studying?.[idx] || '') === 'Yes' ? 'selected' : ''}>Yes</option>
                    <option value="No" ${(saved.m_studying?.[idx] || '') === 'No' ? 'selected' : ''}>No</option>
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
                    <option value="Regular" ${(saved.m_work_status?.[idx] || '') === 'Regular' ? 'selected' : ''}>Regular</option>
                    <option value="Contractual" ${(saved.m_work_status?.[idx] || '') === 'Contractual' ? 'selected' : ''}>Contractual</option>
                    <option value="Unemployed" ${(saved.m_work_status?.[idx] || '') === 'Unemployed' ? 'selected' : ''}>Unemployed</option>
                    <option value="Self-Employed" ${(saved.m_work_status?.[idx] || '') === 'Self-Employed' ? 'selected' : ''}>Self-Employed</option>
                </select></td>
                <td><select name="m_immunized[]" class="form-select form-select-sm">
                    <option value="N/A" ${(saved.m_immunized?.[idx] || '') === 'N/A' ? 'selected' : ''}>N/A</option>
                    <option value="Yes" ${(saved.m_immunized?.[idx] || '') === 'Yes' ? 'selected' : ''}>Yes</option>
                    <option value="No" ${(saved.m_immunized?.[idx] || '') === 'No' ? 'selected' : ''}>No</option>
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