// Get the newsletter form
const newsletterForm = document.querySelector('.newsletter-form');

newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the email 
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput.value;

    try {
        // Send email to backend using fetch
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        console.log('Response status:', response.status);
        console.log('Response data:', data);

        // Handle status codes
        if (response.status === 201 || response.status === 200) {
            // Success
            alert(data.message);
            emailInput.value = ''; // Clear input
        } else if (response.status === 400) {
            // Bad request (bad email)
            alert('Error: ' + data.message);
        } else {
            // Server error
            alert('Server error: ' + data.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to sign up. Check console for details.');
    }
});
