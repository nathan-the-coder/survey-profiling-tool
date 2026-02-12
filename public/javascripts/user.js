const API_URL = 'https://survey-profiling-tool-backend.vercel.app';
const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');
const detailsContent = document.getElementById('detailsContent');
let debounceTimer;

searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (query.length < 2) {
        autocompleteList.classList.add('d-none');
        return;
    }
    debounceTimer = setTimeout(() => fetchParticipants(query), 300);
});

async function fetchParticipants(query) {
    try {
        const url = `${API_URL}/search-participants?q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: { 'X-Username': sessionStorage.getItem('username') || 'Guest' }
        });
        const data = await response.json();
        const results = Array.isArray(data) ? data : data.results || data.data || [];
        showAutocomplete(results);
    } catch (_err) {
        autocompleteList.innerHTML = '<div class="p-2 text-danger">Search failed. Please try again.</div>';
        autocompleteList.classList.remove('d-none');
    }
}

function showAutocomplete(results) {
    autocompleteList.innerHTML = '';
    if (results.length === 0) {
        autocompleteList.innerHTML = '<div class="p-2 text-muted">No results found</div>';
    } else {
        results.forEach(item => {
            const div = document.createElement('div');
            div.className = 'p-2 border-bottom';
            div.style.cursor = 'pointer';
            div.innerHTML = `<strong>${item.full_name}</strong><br><small class="text-muted">${item.relation_to_head_code || 'Member'} - ${item.purok_gimong}, ${item.barangay_name}</small>`;
            div.addEventListener('click', () => {
                searchInput.value = item.full_name;
                autocompleteList.classList.add('d-none');
                fetchParticipantDetails(item.id);
            });
            autocompleteList.appendChild(div);
        });
    }
    autocompleteList.classList.remove('d-none');
}

async function fetchParticipantDetails(participantId) {
    try {
        const response = await fetch(`${API_URL}/participant/${participantId}`, {
            headers: { 'X-Username': sessionStorage.getItem('username') || 'Guest' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.error?.includes('Access denied')) {
            detailsContent.innerHTML = `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>${data.error}</div>`;
        } else {
            showParticipantDetails(data);
        }
        participantModal.show();
    } catch (err) {
        detailsContent.innerHTML = `<div class="alert alert-danger">Failed to load participant details: ${err.message}</div>`;
        participantModal.show();
    }
}

function showParticipantDetails(data) {
    const { household, family_members, health_conditions, socio_economic, userRole, userParish } = data;
    let accessInfo = '';
    if (userRole === 'parish' && userParish) {
        accessInfo = `<div class="alert alert-info"><i class="bi bi-info-circle me-2"></i><strong>Access Level:</strong> Parish User - Viewing ${household.parish_name || 'N/A'} data only</div>`;
    } else if (userRole === 'archdiocese') {
        accessInfo = `<div class="alert alert-success"><i class="bi bi-shield-check me-2"></i><strong>Access Level:</strong> Archdiocese User - Full access to all parishes</div>`;
    }
    
    let html = `${accessInfo}
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Household Information</h6>
                <p><strong>Address:</strong> ${household.purok_gimong || 'N/A'}, ${household.barangay_name || 'N/A'}, ${household.municipality || 'N/A'}</p>
                <p><strong>Parish:</strong> ${household.parish_name || 'N/A'}</p>
                <p><strong>Family Members:</strong> ${household.num_family_members || 'N/A'}</p>
                <p><strong>Years in Community:</strong> ${household.years_residency || 'N/A'}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary">Socio-Economic</h6>
                <p><strong>Income Range:</strong> ${socio_economic?.income_monthly_code || 'N/A'}</p>
                <p><strong>House Ownership:</strong> ${socio_economic?.house_lot_ownership_code || 'N/A'}</p>
                <p><strong>House Classification:</strong> ${socio_economic?.house_classification_code || 'N/A'}</p>
            </div>
        </div>
    `;
    
    if (family_members && family_members.length > 0) {
        html += `<hr><h6 class="text-primary">Family Members</h6><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Name</th><th>Relation</th><th>Age</th><th>Education</th><th>Occupation</th></tr></thead><tbody>`;
        family_members.forEach(member => {
            html += `<tr><td>${member.full_name || 'N/A'}</td><td>${member.relation_to_head_code || 'N/A'}</td><td>${member.age || 'N/A'}</td><td>${member.highest_educ_attainment || 'N/A'}</td><td>${member.occupation || 'N/A'}</td></tr>`;
        });
        html += '</tbody></table></div>';
    }
    
    if (health_conditions) {
        html += `<hr><h6 class="text-primary">Health Conditions</h6><div class="row"><div class="col-md-6"><p><strong>Common Illness:</strong> ${health_conditions.common_illness_codes || 'N/A'}</p><p><strong>Water Source:</strong> ${health_conditions.potable_water_source_code || 'N/A'}</p></div><div class="col-md-6"><p><strong>Toilet Facility:</strong> ${health_conditions.toilet_facility_code || 'N/A'}</p><p><strong>Garbage Disposal:</strong> ${health_conditions.garbage_disposal_code || 'N/A'}</p></div></div>`;
    }
    
    detailsContent.innerHTML = html;
}

const participantModal = new bootstrap.Modal(document.getElementById('participantModal'));

document.addEventListener('click', (e) => {
    if (!e.target.closest('.position-relative')) {
        autocompleteList.classList.add('d-none');
    }
});

document.querySelector('#signoutBtn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/login';
});

const username = sessionStorage.getItem('username');
document.querySelector('#name').textContent = username;

let userRole = 'Respondents';
if (username === 'Archdiocese of Tuguegarao') {
    userRole = 'Archdiocese';
} else if (username?.includes('Parish')) {
    userRole = 'Parish';
}

if (userRole === 'parish') {
    document.querySelector('.navbar').style.backgroundColor = '#457507';
} else if (userRole === 'archdiocese') {
    document.querySelector('.navbar').style.backgroundColor = '#dc3545';
} else {
    document.querySelector('.navbar').style.backgroundColor = '#457507';
}

const roleBadge = document.createElement('span');
roleBadge.className = `badge ms-2 ${userRole === 'Archdiocese' ? 'bg-danger' : 'bg-primary'}`;
roleBadge.textContent = userRole;
document.querySelector('#name').appendChild(roleBadge);

loadAllParticipants();

async function loadAllParticipants() {
    try {
        const response = await fetch(`${API_URL}/all-participants`, {
            headers: { 'X-Username': sessionStorage.getItem('username') || 'Guest' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        displayParticipantsTable(data);
    } catch (_err) {
        document.getElementById('participantsTableBody').innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load participants. Please refresh the page.</td></tr>`;
    }
}

function displayParticipantsTable(participants) {
    const tbody = document.getElementById('participantsTableBody');
    if (!participants || participants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No participants found</td></tr>';
        return;
    }
    tbody.innerHTML = participants.map(participant => `
        <tr>
            <td>${participant.full_name || 'N/A'}</td>
            <td>${participant.relation_to_head_code || 'N/A'}</td>
            <td>${participant.purok_gimong || ''}, ${participant.barangay_name || ''}</td>
            <td>${participant.parish_name || 'N/A'}</td>
            <td>${participant.age || 'N/A'}</td>
            <td><button class="btn btn-sm btn-primary" onclick="fetchParticipantDetails(${participant.id})"><i class="bi bi-eye"></i> View</button></td>
        </tr>
    `).join('');
}