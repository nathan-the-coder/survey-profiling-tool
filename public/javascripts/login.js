document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please enter both username and password',
                confirmButtonColor: '#457507',
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
            const response = await axios.post('https://survey-profiling-tool-backend.vercel.app/login', {
                username: username,
                password: password,
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Login Successfully!',
                confirmButtonColor: '#457507',
                timer: 2000,
                timerProgressBar: true,
            }).then(() => {
                sessionStorage.setItem('username', response.data.user.username);
                
                // Determine user role and redirect accordingly
                const userRole = response.data.user.role || 
                    (username === 'Archdiocese of Tuguegarao' ? 'archdiocese' : 
                     username.toLowerCase().includes('admin') ? 'admin' : 'parish');
                
                if (userRole === 'admin' || username.toLowerCase().includes('admin')) {
                    window.location.href = '/admin/users';
                } else if (username === 'Archdiocese of Tuguegarao' || userRole === 'archdiocese') {
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
                confirmButtonColor: '#457507',
            });
        }
    });
});