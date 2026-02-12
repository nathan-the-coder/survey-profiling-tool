const API_URL = 'https://survey-profiling-tool-backend.vercel.app';
const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');
const participantModal = new bootstrap.Modal(document.getElementById('participantModal'));
let debounceTimer;

const username = sessionStorage.getItem('username') || 'Guest';
document.getElementById('nameDisplay').textContent = username;

let userRole = 'Guest';
if (username === 'Archdiocese of Tuguegarao') {
    userRole = 'Archdiocese';
} else if (username.includes('Parish')) {
    userRole = 'Parish';
}

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
        const response = await fetch(`${API_URL}/search-participants?q=${encodeURIComponent(query)}`, {
            headers: { 'X-Username': username }
        });
        const data = await response.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        showAutocomplete(results);
    } catch (_err) {}
}

function showAutocomplete(results) {
    autocompleteList.innerHTML = '';
    if (results.length === 0) {
        autocompleteList.innerHTML = '<div class="p-2 text-muted">No results found</div>';
    } else {
        results.forEach(item => {
            const div = document.createElement('div');
            div.className = 'p-2 border-bottom autocomplete-item';
            div.style.cursor = 'pointer';
            div.innerHTML = `<strong>${item.full_name}</strong><br><small class="text-muted">${item.barangay_name}</small>`;
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

async function loadAllParticipants() {
    const tbody = document.getElementById('participantsTableBody');
    try {
        const response = await fetch(`${API_URL}/all-participants`, {
            headers: { 'X-Username': username }
        });
        const data = await response.json();
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No participants found</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(p => `
            <tr>
                <td>${p.full_name || 'N/A'}</td>
                <td>${p.relation_to_head_code || 'N/A'}</td>
                <td>${p.purok_gimong || ''}, ${p.barangay_name || ''}</td>
                <td>${p.parish_name || 'N/A'}</td>
                <td>${p.age || 'N/A'}</td>
                <td><button class="btn btn-sm btn-primary" onclick="fetchParticipantDetails(${p.id})"><i class="bi bi-eye"></i> View</button></td>
            </tr>
        `).join('');
    } catch (_err) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading data.</td></tr>';
    }
}

async function fetchParticipantDetails(id) {
    try {
        const response = await fetch(`${API_URL}/participant/${id}`, {
            headers: { 'X-Username': username }
        });
        const data = await response.json();
        showParticipantDetails(data);
    } catch (_err) {
        alert('Failed to fetch details.');
    }
}

function showParticipantDetails(data) {
    const { household, family_members, socio_economic } = data;
    
    const accessDiv = document.getElementById('accessIndicator');
    if (userRole === 'Archdiocese') {
        accessDiv.innerHTML = '<div class="alert alert-success small py-2"><i class="bi bi-shield-check me-2"></i>Archdiocese Full Access</div>';
    } else {
        accessDiv.innerHTML = `<div class="alert alert-info small py-2"><i class="bi bi-info-circle me-2"></i>Parish Access: ${household?.parish_name || 'N/A'}</div>`;
    }
    
    document.getElementById('modalFullName').textContent = family_members?.[0]?.full_name || 'N/A';
    document.getElementById('modalAddress').textContent = `${household?.purok_gimong || ''}, ${household?.barangay_name || ''}`;
    document.getElementById('modalParish').textContent = household?.parish_name || 'N/A';
    document.getElementById('modalFamilyCount').textContent = household?.num_family_members || 'N/A';
    document.getElementById('modalIncome').textContent = socio_economic?.income_monthly_code || 'N/A';
    document.getElementById('modalHouseOwnership').textContent = socio_economic?.house_lot_ownership_code || 'N/A';
    
    const familyTbody = document.getElementById('modalFamilyTable');
    familyTbody.innerHTML = family_members?.map(m => `
        <tr>
            <td>${m.full_name}</td>
            <td>${m.relation_to_head_code}</td>
            <td>${m.age}</td>
            <td>${m.educational_attainment_code}</td>
            <td>${m.occupation_code}</td>
        </tr>
    `).join('') || '<tr><td colspan="5">None</td></tr>';
    
    participantModal.show();
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.position-relative')) autocompleteList.classList.add('d-none');
});

document.getElementById('signoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = '/login';
});

loadAllParticipants();