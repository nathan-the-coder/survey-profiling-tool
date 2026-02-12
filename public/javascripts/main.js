
// API base URL - change to your Vercel URL in production
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5500' 
    : 'https://survey-profiling-tool-backend.vercel.app';

const forms = document.querySelectorAll("form");

let overallData = [];

// API helper functions
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-Username': localStorage.getItem('username') || 'Archdiocese of Tuguegarao'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Test backend connection
async function testConnection() {
    try {
        const result = await apiCall('/api/test-connection');
        return result;
    } catch (_error) {
    }
}

// Search participants
async function searchParticipants(query) {
    try {
        const results = await apiCall(`/api/search?q=${encodeURIComponent(query)}`);
        return results;
    } catch (error) {
        return [];
    }
}

forms.forEach(form => {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(form);
            
            let data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            })

            overallData.push(data);
            
            // Send data to backend if needed
            if (form.dataset.apiEndpoint) {
                await apiCall(form.dataset.apiEndpoint, 'POST', data);
            }
        } catch (_error) {
        }
    });
});

// Test connection on page load
document.addEventListener('DOMContentLoaded', testConnection);