
const forms = document.querySelectorAll("form");

let overallData = [];

forms.forEach(form => {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(form);
            
            let data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            })

            overallData.push(data);
        } catch (error) {
            console.error("Error reading form data: ", error);
        }
    });
})