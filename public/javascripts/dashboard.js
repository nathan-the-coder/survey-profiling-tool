const API_URL = window.API_URL || 'https://survey-profiling-tool-backend.vercel.app';
const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');
const participantModal = new bootstrap.Modal(document.getElementById('participantModal'));
let debounceTimer;
let allParticipants = [];
let currentUserRole = '';
let currentUsername = '';

const username = sessionStorage.getItem('username') || 'Guest';
currentUsername = username;

// Determine user role
if (username === 'Archdiocese of Tuguegarao') {
    currentUserRole = 'archdiocese';
} else if (username === 'SJCB_Admin' || username.toLowerCase().includes('admin')) {
    currentUserRole = 'admin';
} else if (username.includes('Parish')) {
    currentUserRole = 'parish';
} else {
    currentUserRole = 'parish';
}

// Display user role
document.getElementById('userRoleDisplay').textContent = `${username} (${currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)})`;

// Show admin actions if admin
if (currentUserRole === 'admin') {
    document.getElementById('adminActions').style.display = 'flex';
}

// Filter elements
const filterName = document.getElementById('filterName');
const filterAddress = document.getElementById('filterAddress');
const filterParish = document.getElementById('filterParish');
const filterRelation = document.getElementById('filterRelation');
const filterMinAge = document.getElementById('filterMinAge');
const filterMaxAge = document.getElementById('filterMaxAge');
const clearFiltersBtn = document.getElementById('clearFilters');

// Mapping tables for code to text
const maps = {
    sex: { '1': 'Male', '2': 'Female' },
    civil: { '1': 'Single', '2': 'Married', '3': 'Common Law', '4': 'Widowed', '5': 'Divorced', '6': 'Separated', '7': 'Annulled', '8': 'Unknown' },
    sacrament: { '1': 'Not yet Baptized', '2': 'Baptism only', '3': 'Baptism & Confirmation', '4': 'First Holy Communion', '5': 'Holy Matrimony', '6': 'Holy Orders', '66': 'Not Applicable' },
    religion: { '1': 'Roman Catholic', '2': 'Islam', '3': 'UCCP/Protestant', '4': 'Jehova\'s Witnesses', '6': 'Iglesia ni Cristo', '7': 'Four Square Church', '8': 'Seventh Day Adventist', '9': 'Mormons', '10': 'Born Again', '11': 'Bible Baptist', '12': 'Church of Christ', '13': 'Others' },
    relation: { 
        '1': 'Son', '2': 'Daughter', '3': 'Stepson', '4': 'Stepdaughter',
        '5': 'Son-In-Law', '6': 'Daughter-In-Law', '7': 'Grandson', '8': 'Granddaughter',
        '9': 'Father', '10': 'Mother', '11': 'Father-In-Law', '12': 'Mother-In-Law',
        '13': 'Relative', '14': 'Brother', '15': 'Sister', '16': 'Brother-In-Law',
        '17': 'Sister-In-Law', '18': 'Uncle', '19': 'Aunt', '20': 'Nephew',
        '21': 'Niece', '22': 'Other Relative'
    },
    education: { '1': 'No Education', '2': 'Elementary Undergraduate', '3': 'Elementary Graduate', '4': 'High School Undergraduate', '5': 'High School Graduate', '6': 'College Undergraduate', '7': 'College Graduate', '8': 'Vocational', '9': 'Post-Graduate', '10': 'Master\'s Degree', '11': 'Doctorate Degree' },
    income: { '1': '₱3,000 and below', '2': '₱3,001 - ₱6,000', '3': '₱6,001 - ₱9,000', '4': '₱9,001 - ₱12,000', '5': '₱12,001 - ₱15,000', '6': '₱15,001 - ₱18,000', '7': '₱18,001 - ₱21,000', '8': '₱21,001 - ₱24,000', '9': '₱24,001 - ₱27,000', '10': '₱27,001 - ₱30,000', '11': '₱30,001 and up' },
    ownership: { '1': 'Owned', '2': 'Rented House', '3': 'Tenanted', '4': 'Rent Free', '5': 'Caretaker', '99': 'Others' },
    houseClass: { '1': 'Concrete', '2': 'Semi-Concrete', '3': 'Indigenous Materials', '4': 'Galvanized Iron / aluminum', '5': 'Barong-barong', '6': 'Makeshift', '99': 'Others' }
};

const mapArrayValue = (value, map) => {
    if (!value) return '-';
    try {
        let valArr;
        if (Array.isArray(value)) {
            valArr = value;
        } else if (typeof value === 'string') {
            try {
                valArr = JSON.parse(value);
                if (!Array.isArray(valArr)) valArr = [valArr];
            } catch {
                valArr = value.split(',');
            }
        } else {
            valArr = [value];
        }
        if (Array.isArray(valArr)) {
            return valArr.map(v => map[String(v).trim()] || String(v).trim()).filter(v => v !== '').join(', ') || '-';
        }
        return map[String(valArr)] || valArr || '-';
    } catch {
        return value || '-';
    }
};

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

async function loadDashboardStats() {
    try {
        // Get stats from participants data
        const response = await fetch(`${API_URL}/all-participants`, {
            headers: { 'X-Username': username }
        });
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            document.getElementById('totalParticipants').textContent = data.length;
            
            // Count unique households (would need household_id from API)
            document.getElementById('totalHouseholds').textContent = '-';
            
            // Count unique parishes
            const parishes = [...new Set(data.map(p => p.parish_name).filter(Boolean))];
            document.getElementById('totalParishes').textContent = parishes.length;
            
            // This month count (would need date info from API)
            document.getElementById('thisMonthCount').textContent = '-';
        }
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

async function loadAllParticipants() {
    const tbody = document.getElementById('participantsTableBody');
    try {
        const response = await fetch(`${API_URL}/all-participants`, {
            headers: { 'X-Username': username }
        });
        const data = await response.json();
        allParticipants = data || [];
        applyFilters();
        loadDashboardStats();
    } catch (_err) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading data.</td></tr>';
    }
}

function displayParticipantsTable(participants) {
    const tbody = document.getElementById('participantsTableBody');
    if (!participants || participants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No participants found matching your filters</td></tr>';
        updateShowingInfo(0, 0);
        return;
    }
    
    tbody.innerHTML = participants.map(p => `
        <tr>
            <td>${p.full_name || 'N/A'}</td>
            <td>${p.relation_to_head_code || 'N/A'}</td>
            <td>${p.purok_gimong || ''}, ${p.barangay_name || ''}</td>
            <td>${p.parish_name || 'N/A'}</td>
            <td>${p.age || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="fetchParticipantDetails(${p.id})">
                    <i class="bi bi-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
    
    updateShowingInfo(participants.length, allParticipants.length);
}

function applyFilters() {
    let filtered = [...allParticipants];
    
    const nameFilter = filterName?.value?.toLowerCase() || '';
    if (nameFilter) {
        filtered = filtered.filter(p => p.full_name?.toLowerCase().includes(nameFilter));
    }
    
    const addressFilter = filterAddress?.value?.toLowerCase() || '';
    if (addressFilter) {
        filtered = filtered.filter(p => 
            (p.purok_gimong?.toLowerCase().includes(addressFilter) || 
             p.barangay_name?.toLowerCase().includes(addressFilter))
        );
    }
    
    const parishFilter = filterParish?.value?.toLowerCase() || '';
    if (parishFilter) {
        filtered = filtered.filter(p => p.parish_name?.toLowerCase().includes(parishFilter));
    }
    
    const relationFilter = filterRelation?.value || '';
    if (relationFilter) {
        filtered = filtered.filter(p => p.relation_to_head_code === relationFilter);
    }
    
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
    if (filterName) filterName.value = '';
    if (filterAddress) filterAddress.value = '';
    if (filterParish) filterParish.value = '';
    if (filterRelation) filterRelation.value = '';
    if (filterMinAge) filterMinAge.value = '';
    if (filterMaxAge) filterMaxAge.value = '';
    applyFilters();
}

if (filterName) filterName.addEventListener('input', applyFilters);
if (filterAddress) filterAddress.addEventListener('input', applyFilters);
if (filterParish) filterParish.addEventListener('input', applyFilters);
if (filterRelation) filterRelation.addEventListener('change', applyFilters);
if (filterMinAge) filterMinAge.addEventListener('input', applyFilters);
if (filterMaxAge) filterMaxAge.addEventListener('input', applyFilters);
if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);

async function fetchParticipantDetails(id) {
    try {
        console.log('Fetching details for participant ID:', id);
        const response = await fetch(`${API_URL}/participant/${id}`, {
            headers: { 'X-Username': username }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            if (response.status === 403) {
                alert('Access denied. You can only view participants from your parish.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        showParticipantDetails(data, id);
    } catch (err) {
        console.error('Fetch error:', err);
        alert('Failed to fetch details. Check console for more information.');
    }
}

function showParticipantDetails(data, participantId) {
    // Validate data
    if (!data) {
        console.error('No data received');
        document.getElementById('detailsContent').innerHTML = '<div class="alert alert-danger">Failed to load participant details: No data received</div>';
        participantModal.show();
        return;
    }
    
    // Destructure with defaults
    const { 
        household = {}, 
        family_members = [], 
        health_conditions = {}, 
        socio_economic = {} 
    } = data;
    
    // Show edit/delete buttons for archdiocese and admin
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    
    if (editBtn && deleteBtn && (currentUserRole === 'archdiocese' || currentUserRole === 'admin')) {
        editBtn.classList.remove('d-none');
        editBtn.onclick = () => enableEditMode(participantId, data);
        
        if (currentUserRole === 'admin') {
            deleteBtn.classList.remove('d-none');
            deleteBtn.onclick = () => deleteParticipant(participantId);
        }
    }
    
    let html = `
        <div class="alert alert-${currentUserRole === 'admin' ? 'danger' : 'success'} mb-3">
            <i class="bi bi-${currentUserRole === 'admin' ? 'shield-lock' : 'shield-check'} me-2"></i>
            <strong>Access:</strong> ${currentUserRole === 'admin' ? 'Administrator Full Access' : 'Archdiocese Full Access'}
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Household Information</h6>
                <p><strong>Address:</strong> ${household?.purok_gimong || 'N/A'}, ${household?.barangay_name || 'N/A'}, ${household?.municipality || 'N/A'}</p>
                <p><strong>Parish:</strong> ${household?.parish_name || 'N/A'}</p>
                <p><strong>Family Members:</strong> ${household?.num_family_members || 'N/A'}</p>
                <p><strong>Years in Community:</strong> ${household?.years_residency || 'N/A'}</p>
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
        html += `
            <hr>
            <h6 class="text-primary">Family Members</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Relation</th>
                            <th>Age</th>
                            <th>Education</th>
                            <th>Occupation</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${family_members.map(m => `
                            <tr>
                                <td>${m.full_name || 'N/A'}</td>
                                <td>${m.relation_to_head_code || 'N/A'}</td>
                                <td>${m.age || 'N/A'}</td>
                                <td>${m.highest_educ_attainment || 'N/A'}</td>
                                <td>${m.occupation || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    if (health_conditions) {
        html += `
            <hr>
            <h6 class="text-primary">Health Conditions</h6>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Common Illness:</strong> ${health_conditions.common_illness_codes || 'N/A'}</p>
                    <p><strong>Water Source:</strong> ${health_conditions.potable_water_source_code || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Toilet Facility:</strong> ${health_conditions.toilet_facility_code || 'N/A'}</p>
                    <p><strong>Garbage Disposal:</strong> ${health_conditions.garbage_disposal_code || 'N/A'}</p>
                </div>
            </div>
        `;
    }
    
    document.getElementById('detailsContent').innerHTML = html;
    participantModal.show();
}

async function deleteParticipant(participantId) {
    if (!confirm('Are you sure you want to delete this participant? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/participant/${participantId}`, {
            method: 'DELETE',
            headers: { 'X-Username': username }
        });
        
        if (response.ok) {
            participantModal.hide();
            loadAllParticipants();
            alert('Participant deleted successfully');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to delete participant');
        }
    } catch (err) {
        alert('Failed to delete participant');
    }
}

function enableEditMode(participantId, data) {
    // This would open an edit form - for now just alert
    alert('Edit functionality will be implemented here. Participant ID: ' + participantId);
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.position-relative')) autocompleteList.classList.add('d-none');
});

const signoutBtn = document.getElementById('signoutBtn');
if (signoutBtn) {
    signoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '/login';
    });
}

loadAllParticipants();
