const API_URL = "http://127.0.0.1:8000/api/auth/register/";

const registerForm = document.getElementById("register-form");

const nameInput = document.getElementById("reg-name");
const emailInput = document.getElementById("reg-email");
const phoneInput = document.getElementById("reg-phone");
const passwordInput = document.getElementById("reg-password");
const confirmInput = document.getElementById("reg-confirm");

const confirmEye = document.getElementById("reg-confirm-eye");

const roleButtons = document.querySelectorAll(".role-toggle button");
const roleCaption = document.getElementById("role-caption");

let selectedRole = "worker";

// ==============================
// Role selection
// ==============================

roleButtons.forEach((button) => {
button.addEventListener("click", () => {

    roleButtons.forEach((btn) => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedRole = button.dataset.role;

    if (selectedRole === "worker") {
        roleCaption.textContent =
            "You'll browse nearby jobs and get paid for piecework.";
    } else {
        roleCaption.textContent =
            "You'll post jobs and find workers for your tasks.";
    }
});

});

// ==============================
// Show/hide confirm password
// ==============================

confirmEye.addEventListener("click", () => {

if (confirmInput.type === "password") {
    confirmInput.type = "text";
    confirmEye.setAttribute("aria-label", "Hide password");
} else {
    confirmInput.type = "password";
    confirmEye.setAttribute("aria-label", "Show password");
}

});

// ==============================
// Display error
// ==============================

function showError(message) {
alert(message);
}

// ==============================
// Split full name
// ==============================

function splitFullName(fullName) {

const parts = fullName.trim().split(/\s+/);

const firstName = parts.shift();
const lastName = parts.join(" ");

return {
    first_name: firstName,
    last_name: lastName
};

}

// ==============================
// Registration
// ==============================

registerForm.addEventListener("submit", async (event) => {

event.preventDefault();

const fullName = nameInput.value.trim();
const email = emailInput.value.trim();
const phone = phoneInput.value.trim();
const password = passwordInput.value;
const confirmPassword = confirmInput.value;


// ------------------------------
// Frontend validation
// ------------------------------

if (
    !fullName ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword
) {
    showError("Please fill in all fields.");
    return;
}


if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
}


// ------------------------------
// Split full name
// ------------------------------

const names = splitFullName(fullName);

if (!names.first_name || !names.last_name) {
    showError("Please enter your first and last name.");
    return;
}


// ------------------------------
// Convert frontend role
// to backend role
// ------------------------------

const role = selectedRole === "worker"
    ? "WORKER"
    : "CLIENT";


// ------------------------------
// Data expected by
// RegisterSerializer
// ------------------------------

const requestData = {
    email: email,
    first_name: names.first_name,
    last_name: names.last_name,
    phone_number: phone,
    password: password,
    role: role
};


console.log("Sending registration data:", requestData);


const submitButton = registerForm.querySelector(
    'button[type="submit"]'
);

submitButton.disabled = true;
submitButton.textContent = "Creating account...";


try {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },

        body: JSON.stringify(requestData)
    });


    const data = await response.json();

    console.log("Backend response:", data);


    // ------------------------------
    // Registration failed
    // ------------------------------

    if (!response.ok) {

        console.error("Registration error:", data);

        let errorMessage = "Registration failed.";

        if (typeof data === "object" && data !== null) {

            const errors = [];

            Object.entries(data).forEach(([field, messages]) => {

                if (Array.isArray(messages)) {
                    errors.push(
                        `${field}: ${messages.join(", ")}`
                    );
                } else {
                    errors.push(
                        `${field}: ${messages}`
                    );
                }

            });

            if (errors.length > 0) {
                errorMessage = errors.join("\n");
            }
        }

        showError(errorMessage);

        return;
    }


    // ------------------------------
    // Registration successful
    // ------------------------------

    console.log("Registration successful:", data);

    alert("Account created successfully. Please log in.");

    window.location.href = "login.html";


} catch (error) {

    console.error("Network error:", error);

    showError(
        "Unable to connect to the server. Please make sure the Django backend is running."
    );


} finally {

    submitButton.disabled = false;
    submitButton.textContent = "Create account";

}

});