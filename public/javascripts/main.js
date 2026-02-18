
// API base URL - uses environment variable from layout.ejs
const API_BASE_URL = window.API_URL || 'http://localhost:5000';

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
