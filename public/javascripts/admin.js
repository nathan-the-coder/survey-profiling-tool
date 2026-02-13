const API_URL = 'https://survey-profiling-tool-backend.vercel.app';
const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');
const participantModal = new bootstrap.Modal(document.getElementById('participantModal'));
let debounceTimer;
let allParticipants = []; // Store all participants for filtering

const username = sessionStorage.getItem('username');
if (!username) {
    window.location.href = '/login';
    throw new Error('No user logged in');
}
document.getElementById('nameDisplay').textContent = username;

let userRole = 'Guest';
if (username === 'Archdiocese of Tuguegarao') {
    userRole = 'Archdiocese';
} else if (username.includes('Parish')) {
    userRole = 'Parish';
}

// Filter elements
const filterOccupation = document.getElementById('filterOccupation');
const filterAddress = document.getElementById('filterAddress');
const filterParish = document.getElementById('filterParish');
const filterRelation = document.getElementById('filterRelation');
const filterMinAge = document.getElementById('filterMinAge');
const filterMaxAge = document.getElementById('filterMaxAge');
const clearFiltersBtn = document.getElementById('clearFilters');

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
    const totalParticipantsEl = document.getElementById('totalParticipants');
    
    try {
        const response = await fetch(`${API_URL}/all-participants`, {
            headers: {
                'X-Username': username,
                'Content-Type': 'application/json'
            }
        });
 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Ensure we are dealing with an array
        allParticipants = Array.isArray(data) ? data : [];
        
        if (allParticipants.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No record found in the database.</td></tr>';
            return;
        }

        // 1. Update the Summary Cards at the top
        if (totalParticipantsEl) totalParticipantsEl.textContent = allParticipants.length;
        updateDashboardStats(allParticipants);

        // 2. Render the table
        displayParticipantsTable(allParticipants);

    } catch (err) {
        console.error("Detailed Fetch Error:", err);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">
            Error: ${err.message}. Check console for details.
        </td></tr>`    
    }
}

function displayParticipantsTable(participants) {
    const tbody = document.getElementById('participantsTableBody');
    if (!tbody) return;

    // Map through the data and create rows
    const rows = participants.map(p => {
        // Handle potential null values properly
        const name = p.full_name || 'Unknown';
        const relation = p.relation_to_head_code || 'N/A';
        const address = `${p.purok_gimong || ''} ${p.barangay_name || ''}`.trim();
        const parish = p.parish_name || 'N/A';
        const age = p.age || 'N/A';
        const id = p.id;

        return `
            <tr>
                <td><div class="fw-bold">${name}</div></td>
                <td><span class="badge bg-light text-dark border">${relation}</span></td>
                <td><small>${address}</small></td>
                <td>${parish}</td>
                <td>${age}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="fetchParticipantDetails(${id})">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;
    updateShowingInfo(participants.length, allParticipants.length);
}

function updateDashboardStats(data) {
    // Household (Unique household_id)
    const totalHouseholds = new Set(data.map(p => p.household_id)).size;
    const hhEl = document.getElementById('totalHouseholds');
    if (hhEl) hhEl.textContent = totalHouseholds;

    // Parishes (Unique parish names)
    const totalParishes = new Set(data.map(p => p.parish_name).filter(Boolean)).size;
    const prEl = document.getElementById('totalParishes');
    if (prEl) prEl.textContent = totalParishes;
}

function applyFilters() {
    let filtered = [...allParticipants];
    
    // Occupation filter (NEW)
    const occupationFilter = filterOccupation?.value || '';
    if (occupationFilter) {
        // Assuming your data object has a property called 'occupation_code' or 'occupation'
        filtered = filtered.filter(p => p.occupation_code === occupationFilter);
    }
    
    // Address filter
    const addressFilter = filterAddress?.value?.toLowerCase() || '';
    if (addressFilter) {
        filtered = filtered.filter(p => 
            (p.purok_gimong?.toLowerCase().includes(addressFilter) || 
             p.barangay_name?.toLowerCase().includes(addressFilter))
        );
    }
    
    // Parish filter
    const parishFilter = filterParish?.value?.toLowerCase() || '';
    if (parishFilter) {
        filtered = filtered.filter(p => p.parish_name?.toLowerCase().includes(parishFilter));
    }
    
    // Relation filter
    const relationFilter = filterRelation?.value || '';
    if (relationFilter) {
        filtered = filtered.filter(p => p.relation_to_head_code === relationFilter);
    }
    
    // Age range filter
    const minAge = parseInt(filterMinAge?.value) || 0;
    const maxAge = parseInt(filterMaxAge?.value) || 999;
    if (minAge > 0 || maxAge < 999) {
        filtered = filtered.filter(p => {
            const age = parseInt(p.age) || 0;
            return age >= minAge && age <= maxAge;
        });
    }
    
    displayParticipantsTable(filtered);
}

function updateShowingInfo(filteredCount, totalCount) {
    const showingInfo = document.getElementById('showingInfo');
    if (showingInfo) {
        showingInfo.textContent = `Showing ${filteredCount} of ${totalCount} entries`;
    }
}

function clearFilters() {
    if (filterOccupation) filterOccupation.value = '';
    if (filterAddress) filterAddress.value = '';
    if (filterParish) filterParish.value = '';
    if (filterRelation) filterRelation.value = '';
    if (filterMinAge) filterMinAge.value = '';
    if (filterMaxAge) filterMaxAge.value = '';
    applyFilters();
}

// Add event listeners to filters
if (filterOccupation) filterOccupation.addEventListener('change', applyFilters);
if (filterAddress) filterAddress.addEventListener('input', applyFilters);
if (filterParish) filterParish.addEventListener('change', applyFilters);
if (filterRelation) filterRelation.addEventListener('change', applyFilters);
if (filterMinAge) filterMinAge.addEventListener('input', applyFilters);
if (filterMaxAge) filterMaxAge.addEventListener('input', applyFilters);
if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);

function loadParishes() {
    const parishSelect = document.getElementById('filterParish');
    
    if (!parishSelect) {
        return;
    }

    fetch(`${API_URL}/parishes`, {
        headers: { 'X-Username': sessionStorage.getItem('username') || 'Guest' }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        parishSelect.innerHTML = '<option value="">All Parishes</option>';
        
        const list = Array.isArray(data) ? data : (data.parishes || []);
        list.forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p;
            parishSelect.appendChild(option);
        });
    })
    .catch(err => {
        // Fallback to defaults so the UI isn't broken
        ['St. Louis Cathedral', 'St. Joseph Parish'].forEach(p => {
            const opt = document.createElement('option');
            opt.value = p; opt.textContent = p;
            parishSelect.appendChild(opt);
        });
    });
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
// Ensure the HTML is fully "drawn" before we try to find the dropdowns
document.addEventListener('DOMContentLoaded', () => {
    loadParishes();
    loadAllParticipants();
});
