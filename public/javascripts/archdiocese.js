const API_URL = 'https://survey-profiling-tool-backend.vercel.app';
const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');
const participantModal = new bootstrap.Modal(document.getElementById('participantModal'));
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
let debounceTimer;
let allParticipants = []; // Store all participants for filtering
let currentPage = 1;
const itemsPerPage = 15;
let currentEditData = null; // Store current edit data for saving

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

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedParticipants = participants.slice(startIndex, endIndex);

    // Map through the data and create rows
    const rows = paginatedParticipants.map(p => {
        // Handle potential null values properly
        const name = p.full_name || 'Unknown';
        const relation = p.role || 'N/A'; // Show role (HH Head, Spouse, Member)
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
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary" onclick="fetchParticipantDetails(${id})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-warning" onclick="editParticipant(${id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger" onclick="deleteParticipant(${id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;
    updateShowingInfo(paginatedParticipants.length, participants.length);
    renderPagination(participants);
}

function renderPagination(participants) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(participants.length / itemsPerPage);
    let paginationHTML = '';

    // Previous button
    paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Previous</a>
    </li>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Next button
    paginationHTML += `<li class="page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Next</a>
    </li>`;

    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(allParticipants.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayParticipantsTable(allParticipants);
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
    currentPage = 1; // Reset to first page when filters change
    let filtered = [...allParticipants];
    
    // Occupation filter
    const occupationFilter = filterOccupation?.value || '';
    if (occupationFilter) {
        // Using partial match since occupation stores full text
        filtered = filtered.filter(p => p.occupation?.toLowerCase().includes(occupationFilter.toLowerCase()));
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
    
    // Relation filter - filter by role (HH Head, Spouse, Member)
    const relationFilter = filterRelation?.value || '';
    if (relationFilter) {
        filtered = filtered.filter(p => p.role === relationFilter);
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
        list.filter(p => p !== 'SJCB_Admin' && p !== 'Archdiocese of Tuguegarao').forEach(p => {
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
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            alert(err.error || `Failed to fetch details (${response.status})`);
            return;
        }
        const data = await response.json();
        showParticipantDetails(data);
    } catch (_err) {
        alert('Failed to fetch details.');
    }
}

function showParticipantDetails(data) {
    const { household, family_members, health_conditions, socio_economic } = data;
    
    const accessDiv = document.getElementById('accessIndicator');
    if (userRole === 'Archdiocese') {
        accessDiv.innerHTML = '<div class="alert alert-success small py-2"><i class="bi bi-shield-check me-2"></i>Archdiocese Full Access</div>';
    } else {
        accessDiv.innerHTML = `<div class="alert alert-info small py-2"><i class="bi bi-info-circle me-2"></i>Parish Access: ${household?.parish_name || 'N/A'}</div>`;
    }

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
        studying: { '1': 'Yes', '2': 'No' },
        workStatus: { '1': 'Regular/Permanent', '2': 'Contractual', '3': 'Worker for different employers', '5': 'Others', '6': 'Not Applicable' },
        illness: { '00': 'None', '01': 'Fever', '02': 'Flu', '03': 'Cough', '04': 'Cold', '05': 'Diarrhea', '06': 'Cholera', '07': 'Asthma', '08': 'Typhoid Fever', '09': 'Dengue', '10': 'Pneumonia', '11': 'Chicken Pox', '12': 'Measles', '13': 'Heart Disease', '14': 'Lung Disease', '15': 'High Blood', '16': 'Anemia', '17': 'Malaria', '99': 'Others' },
        treatment: { '00': 'None', '01': 'Traditional Healers', '02': 'Private Doctors', '03': 'RHU Doctors', '04': 'Self-medication', '05': 'Brgy. Health Station', '06': 'Rural Health Unit', '07': 'Brgy. Health Worker', '08': 'Brgy. Nutrition Scholar', '09': 'CBHP/DHW', '10': 'Private Clinic', '99': 'Others' },
        water: { '1': 'Local Water System', '2': 'Spring Water', '3': 'River', '4': 'Open Well', '5': 'Own Artesian Well', '6': 'Community Artesian Well', '7': 'Community Faucet', '8': 'Electric Deep Well', '9': 'Free Flowing Water Pipe', '10': 'Rain Water', '11': 'Water Refilling Station', '12': 'NAWASA', '99': 'Others' },
        lighting: { '1': 'Electricity', '2': 'Kerosene (Gaas)', '3': 'LPG', '4': 'Solar Panel / Solar Lamp', '5': 'Battery', '6': 'Generator', '7': 'None', '99': 'Others' },
        cooking: { '1': 'Woods', '2': 'Charcoal', '3': 'Kerosene (Gas)', '4': 'LPG', '5': 'Electricity', '99': 'Others' },
        garbage: { '1': 'Segregating Waste', '2': 'Collected by Garbage Truck', '3': 'Recycling / Reusing at Home', '4': 'Selling / Giving Away Recyclables', '5': 'Composting', '6': 'Burning', '7': 'Dumping in Pit with Cover', '8': 'Dumping in Pit without Cover', '9': 'Throwing in Uninhabited Locations', '99': 'Others' },
        toilet: { '1': 'Water-Sealed Flush (Own)', '2': 'Water-Sealed Flush (Shared)', '3': 'Closed Pit', '4': 'Open Pit', '5': 'No Toilet', '99': 'Others' },
        toiletDist: { '1': 'Below 200 meters', '2': '201-500 meters', '3': '501-1000 meters', '4': 'More than 1000 meters' },
        distance: { '1': 'Walking Distance (Ideal)', '2': '5-15 Minute Drive', '3': '30-Minute Drive', '4': 'Over 45 Minutes - 1 Hour+' },
        income: { '1': '₱3,000 and below', '2': '₱3,001 - ₱6,000', '3': '₱6,001 - ₱9,000', '4': '₱9,001 - ₱12,000', '5': '₱12,001 - ₱15,000', '6': '₱15,001 - ₱18,000', '7': '₱18,001 - ₱21,000', '8': '₱21,001 - ₱24,000', '9': '₱24,001 - ₱27,000', '10': '₱27,001 - ₱30,000', '11': '₱30,001 and up' },
        expenses: { '1': '₱300 and below', '2': '₱301 - ₱600', '3': '₱601 - ₱900', '4': '₱901 - ₱1,200', '5': '₱1,201 - ₱1,500', '6': '₱1,501 - ₱1,800', '7': '₱1,801 - ₱2,100', '8': '₱2,101 - ₱2,400', '9': '₱2,401 - ₱2,700', '10': '₱2,701 - ₱3,000', '11': '₱3,001 and up' },
        savings: { 'true': 'Yes', 'false': 'None' },
        savingsLoc: { '1': 'House', '2': 'Bank', '3': 'E-money (GCash, etc.)', '4': 'Microfinance (Card, ASA, etc.)', '66': 'Not Applicable', '99': 'Others' },
        ownership: { '1': 'Owned', '2': 'Rented House', '3': 'Tenanted', '4': 'Rent Free', '5': 'Caretaker', '99': 'Others' },
        houseClass: { '1': 'Concrete', '2': 'Semi-Concrete', '3': 'Indigenous Materials', '4': 'Galvanized Iron / aluminum', '5': 'Barong-barong', '6': 'Makeshift', '99': 'Others' },
        transportation: { 'Bicycle': 'Bicycle', 'Tricycle': 'Tricycle', 'Motorcycle': 'Motorcycle', 'Jeepney': 'Jeepney', 'Van': 'Van', 'Private Vehicle': 'Private Vehicle' },
        livestock: { 'carabao': 'Carabao', 'cow': 'Cow', 'goat': 'Goat', 'chicken': 'Chicken', 'pig': 'Pig', 'geese': 'Geese', 'turkey': 'Turkey', 'duck': 'Duck', 'horse': 'Horse', 'sheep': 'Sheep', 'rabbit': 'Rabbit', 'others': 'Others' },
        assets: { 'refrigerator': 'Refrigerator', 'freezer': 'Freezer', 'stove': 'Stove', 'gas_range': 'Gas Range', 'rice_cooker': 'Rice Cooker', 'air_fryer': 'Air Fryer', 'microwave_oven': 'Microwave Oven', 'washing_machine': 'Washing Machine', 'air_conditioner': 'Air Conditioner', 'electric_fan': 'Electric Fan', 'electric_iron': 'Electric Iron', 'sewing_machine': 'Sewing Machine', 'am_radio': 'AM Radio', 'cassette_player': 'Cassette Player', 'television': 'Television', 'cd_dvd_vcd_player': 'CD / DVD / VCD Player', 'karaoke': 'Karaoke', 'landline': 'Landline Telephone', 'mobile_phone': 'Mobile Phone', 'tablet': 'Tablet', 'personal_computer': 'Personal Computer', 'vehicle': 'Car / Vehicle', 'others': 'Others' },
        organization: { 'Religious': 'Religious', 'Youth': 'Youth', 'Cultural': 'Cultural', 'Political': 'Political', 'Women\'s': 'Women\'s', 'Agricultural': 'Agricultural', 'Labor': 'Labor', 'Civic': 'Civic', 'Cooperatives': 'Cooperatives', 'Others': 'Others' }
    };

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || '-';
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

    // General Information
    setText('gen-purok', household?.purok_gimong);
    setText('gen-barangay', household?.barangay_name);
    setText('gen-municipality', household?.municipality);
    setText('gen-province', household?.province);
    setText('gen-parish', household?.parish_name);
    setText('gen-diocese', household?.diocese_prelature);
    setText('gen-residency', household?.years_residency);
    setText('gen-familyMembers', household?.num_family_members);
    setText('gen-familyStructure', household?.family_structure);
    setText('gen-dialect', household?.local_dialect);
    setText('gen-ethnicity', household?.ethnicity);
    setText('gen-transportation', mapArrayValue(household?.mode_of_transportation, maps.transportation));
    setText('gen-road', household?.road_structure);
    setText('gen-classification', household?.urban_rural_classification);

    // Family Members Table
    const familyTbody = document.getElementById('modalFamilyTable');
    familyTbody.innerHTML = family_members?.map(m => `
        <tr>
            <td>${m.full_name || '-'}</td>
            <td>${m.relation_to_head_code ? maps.relation[m.relation_to_head_code] : m.role || '-'}</td>
            <td>${maps.sex[String(m.sex_code)] || '-'}</td>
            <td>${m.age || '-'}</td>
            <td>${maps.civil[String(m.civil_status_code)] || '-'}</td>
            <td>${mapArrayValue(m.religion_code, maps.religion) || '-'}</td>
            <td>${mapArrayValue(m.sacraments_code, maps.sacrament)}</td>
            <td>${m.is_studying === true ? 'Yes' : (m.is_studying === false ? 'No' : '-')}</td>
            <td>${maps.education[String(m.highest_educ_attainment)] || '-'}</td>
            <td>${m.occupation || '-'}</td>
            <td>${maps.workStatus[String(m.status_of_work_code)] || '-'}</td>
            <td>${mapArrayValue(m.organization_code, maps.organization) || '-'}</td>
            <td>${m.position || '-'}</td>
        </tr>
    `).join('') || '<tr><td colspan="13">No family members</td></tr>';

    // Health & Living Conditions
    setText('health-illness', mapArrayValue(health_conditions?.common_illness_codes, maps.illness));
    setText('health-treatment', mapArrayValue(health_conditions?.treatment_source_code, maps.treatment));
    setText('health-water', mapArrayValue(health_conditions?.potable_water_source_code, maps.water));
    setText('health-lighting', mapArrayValue(health_conditions?.lighting_source_code, maps.lighting));
    setText('health-cooking', mapArrayValue(health_conditions?.cooking_source_code, maps.cooking));
    setText('health-garbage', mapArrayValue(health_conditions?.garbage_disposal_code, maps.garbage));
    setText('health-toilet', mapArrayValue(health_conditions?.toilet_facility_code, maps.toilet));
    setText('health-toiletDist', maps.toiletDist[String(health_conditions?.water_to_toilet_distance_code)] || '-');

    // Socio-Economic
    setText('soc-income', maps.income[String(socio_economic?.income_monthly_code)] || '-');
    setText('soc-expenses', maps.expenses[String(socio_economic?.expenses_weekly_code)] || '-');
    setText('soc-savings', maps.savings[String(socio_economic?.has_savings)] || '-');
    setText('soc-savingsLoc', mapArrayValue(socio_economic?.savings_location_code, maps.savingsLoc));
    setText('soc-ownership', mapArrayValue(socio_economic?.house_lot_ownership_code, maps.ownership));
    setText('soc-houseClass', mapArrayValue(socio_economic?.house_classification_code, maps.houseClass));
    setText('soc-landArea', socio_economic?.land_area_hectares || '-');
    setText('soc-church', maps.distance[String(socio_economic?.dist_from_church_code)] || '-');
    setText('soc-market', maps.distance[String(socio_economic?.dist_from_market_code)] || '-');
    setText('soc-organizations', mapArrayValue(socio_economic?.organizations, { '1': 'PCM', '2': 'BCC', '3': 'ICS', '4': 'CMA', '5': 'COP', '6': 'MWI', '7': 'YWL', '8': 'MCC', '9': 'Others' }));
    setText('soc-livestock', '-');
    setText('soc-assets', '-');
    
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

function editParticipant(participantId) {
    fetchParticipantDetailsForEdit(participantId);
}

async function fetchParticipantDetailsForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/participant/${id}`, {
            headers: { 'X-Username': username }
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            alert(err.error || `Failed to fetch details (${response.status})`);
            return;
        }
        const data = await response.json();
        populateEditForm(data);
    } catch (_err) {
        alert('Failed to fetch details.');
    }
}

function populateEditForm(data) {
    const { household, family_members, health_conditions, socio_economic } = data;
    currentEditData = data;
    
    // Populate household fields
    document.getElementById('edit-purok').value = household?.purok_gimong || '';
    document.getElementById('edit-barangay').value = household?.barangay_name || '';
    document.getElementById('edit-municipality').value = household?.municipality || '';
    document.getElementById('edit-province').value = household?.province || '';
    document.getElementById('edit-parish').value = household?.parish_name || '';
    document.getElementById('edit-residency').value = household?.years_residency || '';
    document.getElementById('edit-familyMembers').value = household?.num_family_members || '';
    document.getElementById('edit-familyStructure').value = household?.family_structure || '';
    
    // Populate health fields
    document.getElementById('edit-water').value = health_conditions?.potable_water_source_code || '';
    document.getElementById('edit-lighting').value = health_conditions?.lighting_source_code || '';
    document.getElementById('edit-cooking').value = health_conditions?.cooking_source_code || '';
    document.getElementById('edit-toilet').value = health_conditions?.toilet_facility_code || '';
    document.getElementById('edit-garbage').value = health_conditions?.garbage_disposal_code || '';
    
    // Populate socio-economic fields
    document.getElementById('edit-income').value = socio_economic?.income_monthly_code || '';
    document.getElementById('edit-expenses').value = socio_economic?.expenses_weekly_code || '';
    document.getElementById('edit-savings').value = String(socio_economic?.has_savings) || '';
    document.getElementById('edit-ownership').value = socio_economic?.house_lot_ownership_code || '';
    document.getElementById('edit-houseClass').value = socio_economic?.house_classification_code || '';
    
    // Populate family members table
    const familyTbody = document.querySelector('#editFamilyTable tbody');
    familyTbody.innerHTML = family_members?.map(m => `
        <tr>
            <td><input type="hidden" name="member_id" value="${m.member_id}"><input type="text" class="form-control form-control-sm" name="full_name" value="${m.full_name || ''}"></td>
            <td><select class="form-select form-select-sm" name="relation_to_head_code"><option value="">Select...</option>${getRelationOptions(m.relation_to_head_code)}</select></td>
            <td><select class="form-select form-select-sm" name="sex_code"><option value="">Select...</option>${getSexOptions(m.sex_code)}</select></td>
            <td><input type="number" class="form-control form-control-sm" name="age" value="${m.age || ''}"></td>
            <td><select class="form-select form-select-sm" name="civil_status_code"><option value="">Select...</option>${getCivilOptions(m.civil_status_code)}</select></td>
            <td><select class="form-select form-select-sm" name="religion_code"><option value="">Select...</option>${getReligionOptions(m.religion_code)}</select></td>
            <td><select class="form-select form-select-sm" name="sacraments_code"><option value="">Select...</option>${getSacramentOptions(m.sacraments_code)}</select></td>
            <td><select class="form-select form-select-sm" name="is_studying"><option value="">Select...</option><option value="true" ${m.is_studying === true ? 'selected' : ''}>Yes</option><option value="false" ${m.is_studying === false ? 'selected' : ''}>No</option></select></td>
            <td><select class="form-select form-select-sm" name="highest_educ_attainment"><option value="">Select...</option>${getEducationOptions(m.highest_educ_attainment)}</select></td>
            <td><input type="text" class="form-control form-control-sm" name="occupation" value="${m.occupation || ''}"></td>
            <td><select class="form-select form-select-sm" name="status_of_work_code"><option value="">Select...</option>${getWorkStatusOptions(m.status_of_work_code)}</select></td>
            <td><input type="text" class="form-control form-control-sm" name="organization_code" value="${typeof m.organization_code === 'string' ? m.organization_code.replace(/[\[\]"]/g, '') : ''}"></td>
            <td><input type="text" class="form-control form-control-sm" name="position" value="${m.position || ''}"></td>
        </tr>
    `).join('') || '<tr><td colspan="13">No family members</td></tr>';
    
    editModal.show();
}

function getRelationOptions(selected) {
    const opts = ['Son', 'Daughter', 'Stepson', 'Stepdaughter', 'Son-In-Law', 'Daughter-In-Law', 'Grandson', 'Granddaughter', 'Father', 'Mother', 'Father-In-Law', 'Mother-In-Law', 'Relative', 'Brother', 'Sister', 'Brother-In-Law', 'Sister-In-Law', 'Uncle', 'Aunt', 'Nephew', 'Niece', 'Other Relative'];
    return opts.map((o, i) => `<option value="${i + 1}" ${String(selected) === String(i + 1) ? 'selected' : ''}>${o}</option>`).join('');
}

function getSexOptions(selected) {
    return `<option value="1" ${String(selected) === '1' ? 'selected' : ''}>Male</option><option value="2" ${String(selected) === '2' ? 'selected' : ''}>Female</option>`;
}

function getCivilOptions(selected) {
    const opts = ['Single', 'Married', 'Common Law', 'Widowed', 'Divorced', 'Separated', 'Annulled', 'Unknown'];
    return opts.map((o, i) => `<option value="${i + 1}" ${String(selected) === String(i + 1) ? 'selected' : ''}>${o}</option>`).join('');
}

function getReligionOptions(selected) {
    const opts = ['Roman Catholic', 'Islam', 'UCCP/Protestant', "Jehova's Witnesses", 'Iglesia ni Cristo', 'Four Square Church', 'Seventh Day Adventist', 'Mormons', 'Born Again', 'Bible Baptist', 'Church of Christ', 'Others'];
    const codes = ['1', '2', '3', '4', '6', '7', '8', '9', '10', '11', '12', '13'];
    return codes.map((c, i) => `<option value="${c}" ${String(selected) === c ? 'selected' : ''}>${opts[i]}</option>`).join('');
}

function getSacramentOptions(selected) {
    const opts = ['None', 'Baptism', 'Confirmation', 'First Communion', 'Marriage', 'Holy Orders'];
    return opts.map((o, i) => `<option value="${i + 1}" ${String(selected) === String(i + 1) ? 'selected' : ''}>${o}</option>`).join('');
}

function getEducationOptions(selected) {
    const opts = ['No Education', 'Elementary Undergraduate', 'Elementary Graduate', 'High School Undergraduate', 'High School Graduate', 'College Undergraduate', 'College Graduate', 'Vocational', 'Post-Graduate', "Master's Degree", 'Doctorate Degree'];
    return opts.map((o, i) => `<option value="${i + 1}" ${String(selected) === String(i + 1) ? 'selected' : ''}>${o}</option>`).join('');
}

function getWorkStatusOptions(selected) {
    const opts = ['Regular/Permanent', 'Contractual', 'Worker for different employers', 'Others', 'Not Applicable'];
    return opts.map((o, i) => `<option value="${i + 1}" ${String(selected) === String(i + 1) ? 'selected' : ''}>${o}</option>`).join('');
}

// Save edit button handler
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'saveEditBtn') {
        saveParticipantChanges();
    }
});

async function saveParticipantChanges() {
    if (!currentEditData) {
        alert('No data to save');
        return;
    }
    
    const form = document.getElementById('editForm');
    const formData = new FormData(form);
    
    // Build update data
    const updateData = {
        household: {
            purok_gimong: formData.get('purok_gimong'),
            barangay_name: formData.get('barangay_name'),
            municipality: formData.get('municipality'),
            province: formData.get('province'),
            parish_name: formData.get('parish_name'),
            years_residency: formData.get('years_residency') ? parseInt(formData.get('years_residency')) : null,
            num_family_members: formData.get('num_family_members') ? parseInt(formData.get('num_family_members')) : null,
            family_structure: formData.get('family_structure')
        },
        health_conditions: {
            potable_water_source_code: formData.get('potable_water_source_code'),
            lighting_source_code: formData.get('lighting_source_code'),
            cooking_source_code: formData.get('cooking_source_code'),
            toilet_facility_code: formData.get('toilet_facility_code'),
            garbage_disposal_code: formData.get('garbage_disposal_code')
        },
        socio_economic: {
            income_monthly_code: formData.get('income_monthly_code'),
            expenses_weekly_code: formData.get('expenses_weekly_code'),
            has_savings: formData.get('has_savings') === 'true' ? true : (formData.get('has_savings') === 'false' ? false : null),
            house_lot_ownership_code: formData.get('house_lot_ownership_code'),
            house_classification_code: formData.get('house_classification_code')
        },
        family_members: []
    };
    
    // Get family members data from table
    const familyRows = document.querySelectorAll('#editFamilyTable tbody tr');
    familyRows.forEach(row => {
        const memberId = row.querySelector('input[name="member_id"]')?.value;
        if (memberId) {
            updateData.family_members.push({
                member_id: parseInt(memberId),
                full_name: row.querySelector('input[name="full_name"]')?.value,
                relation_to_head_code: row.querySelector('select[name="relation_to_head_code"]')?.value,
                sex_code: row.querySelector('select[name="sex_code"]')?.value ? parseInt(row.querySelector('select[name="sex_code"]').value) : null,
                age: row.querySelector('input[name="age"]')?.value ? parseInt(row.querySelector('input[name="age"]').value) : null,
                civil_status_code: row.querySelector('select[name="civil_status_code"]')?.value,
                religion_code: row.querySelector('select[name="religion_code"]')?.value,
                sacraments_code: row.querySelector('select[name="sacraments_code"]')?.value,
                is_studying: row.querySelector('select[name="is_studying"]')?.value === 'true' ? true : (row.querySelector('select[name="is_studying"]')?.value === 'false' ? false : null),
                highest_educ_attainment: row.querySelector('select[name="highest_educ_attainment"]')?.value,
                occupation: row.querySelector('input[name="occupation"]')?.value,
                status_of_work_code: row.querySelector('select[name="status_of_work_code"]')?.value,
                organization_code: row.querySelector('input[name="organization_code"]')?.value,
                position: row.querySelector('input[name="position"]')?.value
            });
        }
    });
    
    try {
        const response = await fetch(`${API_URL}/participant/${currentEditData.household?.household_id ? currentEditData.family_members?.[0]?.member_id : 0}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': username
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            editModal.hide();
            loadAllParticipants();
            alert('Participant updated successfully');
        } else {
            const error = await response.json().catch(() => ({}));
            alert(error.error || 'Failed to update participant');
        }
    } catch (err) {
        alert('Failed to save changes');
    }
}

// Ensure the HTML is fully "drawn" before we try to find the dropdowns
document.addEventListener('DOMContentLoaded', () => {
    loadParishes();
    loadAllParticipants();
});
