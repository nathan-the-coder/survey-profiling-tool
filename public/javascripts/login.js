document.addEventListener('DOMContentLoaded', () => {
    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (togglePassword && passwordInput && toggleIcon) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleIcon.classList.toggle('bi-eye-slash');
            toggleIcon.classList.toggle('bi-eye');
        });
    }
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter both username and password',
                confirmButtonColor: '#457807',
            });
            return;
        }
        
        Swal.fire({
            title: 'Logging in...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        
        try {
            // Use API_URL from environment
            const apiUrl = window.API_URL || 'http://localhost:5000';
            
            const response = await axios.post(`${apiUrl}/login`, {
                username: username,
                password: password,
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Login Successfully!',
                confirmButtonColor: '#457807',
                timer: 2000,
                timerProgressBar: true,
            }).then(() => {
                sessionStorage.setItem('username', response.data.user.username);
                sessionStorage.setItem('userRole', response.data.user.role);
                sessionStorage.setItem('parish_id', response.data.user.parish_id);
                
                // Use role from server response
                const userRole = response.data.user.role || 'parish';
                
                if (userRole === 'admin') {
                    window.location.href = '/admin';
                } else if (userRole === 'archdiocese') {
                    window.location.href = '/archdiocese';
                } else {
                    window.location.href = '/user';
                }
            });
        } catch (error) {
            let errorMessage = 'Login failed';
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Invalid username or password';
                } else if (error.response.status === 500) {
                    errorMessage = 'Server error. Please try again.';
                } else {
                    errorMessage = error.response.data?.message || 'Server error';
                }
            } else if (error.request) {
                errorMessage = 'Cannot connect to server. Make sure backend is running on port 5500.';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: errorMessage,
                confirmButtonColor: '#457807',
            });
        }
    });
});
