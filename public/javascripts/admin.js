const API_URL = 'https://survey-profiling-tool-backend.vercel.app';
const username = sessionStorage.getItem('username') || 'Guest';

// Check if user is admin
if (username !== 'SJCB_Admin' && !username.toLowerCase().includes('admin')) {
    alert('Access denied. Admin only.');
    window.location.href = '/login';
}

document.querySelector('#name').textContent = username;

// Add admin badge
const roleBadge = document.createElement('span');
roleBadge.className = 'badge ms-2 bg-danger';
roleBadge.textContent = 'Admin';
document.querySelector('#name').appendChild(roleBadge);

let allUsers = [];

// Load users on page load
loadUsers();

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/api/users`, {
            headers: { 'X-Username': username }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        
        const data = await response.json();
        allUsers = data || [];
        displayUsers(allUsers);
    } catch (err) {
        document.getElementById('usersTableBody').innerHTML = 
            `<tr><td colspan="5" class="text-center text-danger">Failed to load users: ${err.message}</td></tr>`;
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td><span class="badge bg-${getRoleBadgeColor(user.role)}">${user.role || 'Parish'}</span></td>
            <td>${user.parish || 'N/A'}</td>
            <td><span class="badge bg-success">Active</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id}, '${user.username}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getRoleBadgeColor(role) {
    switch(role) {
        case 'admin': return 'danger';
        case 'archdiocese': return 'success';
        case 'parish': return 'primary';
        default: return 'secondary';
    }
}

// Search and filter
const searchInput = document.getElementById('searchUsers');
const roleFilter = document.getElementById('filterRole');

if (searchInput) {
    searchInput.addEventListener('input', filterUsers);
}

if (roleFilter) {
    roleFilter.addEventListener('change', filterUsers);
}

function filterUsers() {
    const searchTerm = searchInput?.value?.toLowerCase() || '';
    const selectedRole = roleFilter?.value || '';
    
    let filtered = allUsers;
    
    if (searchTerm) {
        filtered = filtered.filter(u => 
            u.username?.toLowerCase().includes(searchTerm) ||
            u.parish?.toLowerCase().includes(searchTerm)
        );
    }
    
    if (selectedRole) {
        filtered = filtered.filter(u => u.role === selectedRole);
    }
    
    displayUsers(filtered);
}

// Add user
document.getElementById('saveUserBtn').addEventListener('click', async () => {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    
    const userData = {
        username: formData.get('username'),
        password: formData.get('password'),
        role: formData.get('role'),
        parish: formData.get('parish') || null
    };
    
    try {
        const response = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': username
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
            form.reset();
            loadUsers();
            alert('User created successfully');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to create user');
        }
    } catch (err) {
        alert('Failed to create user');
    }
});

// Edit user
async function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editRole').value = user.role || 'parish';
    document.getElementById('editParish').value = user.parish || '';
    document.getElementById('editPassword').value = '';
    
    new bootstrap.Modal(document.getElementById('editUserModal')).show();
}

// Update user
document.getElementById('updateUserBtn').addEventListener('click', async () => {
    const userId = document.getElementById('editUserId').value;
    const form = document.getElementById('editUserForm');
    const formData = new FormData(form);
    
    const userData = {
        username: formData.get('username'),
        role: formData.get('role'),
        parish: formData.get('parish') || null
    };
    
    const password = formData.get('password');
    if (password) {
        userData.password = password;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': username
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            loadUsers();
            alert('User updated successfully');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to update user');
        }
    } catch (err) {
        alert('Failed to update user');
    }
});

// Delete user
async function deleteUser(userId, usernameToDelete) {
    if (!confirm(`Are you sure you want to delete user "${usernameToDelete}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'DELETE',
            headers: { 'X-Username': username }
        });
        
        if (response.ok) {
            loadUsers();
            alert('User deleted successfully');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to delete user');
        }
    } catch (err) {
        alert('Failed to delete user');
    }
}

// Sign out
document.querySelector('#signoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = '/login';
});

// Style navbar
document.querySelector('.navbar').style.backgroundColor = '#dc3545';
