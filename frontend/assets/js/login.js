const API_URL = "http://127.0.0.1:8000/api/auth/login/";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const loginEye = document.getElementById("login-eye");
const loginError = document.getElementById("login-error");

// ============================================
// SHOW ERROR
// ============================================

function showError(message) {


loginError.textContent = message;
loginError.classList.add("show");


}

// ============================================
// CLEAR ERROR
// ============================================

function clearError() {


loginError.textContent = "";
loginError.classList.remove("show");


}

// ============================================
// PASSWORD VISIBILITY
// ============================================

loginEye.addEventListener("click", () => {


if (passwordInput.type === "password") {

    passwordInput.type = "text";

    loginEye.setAttribute(
        "aria-label",
        "Hide password"
    );

} else {

    passwordInput.type = "password";

    loginEye.setAttribute(
        "aria-label",
        "Show password"
    );

}


});

// ============================================
// CLEAR ERROR WHEN TYPING
// ============================================

emailInput.addEventListener("input", clearError);
passwordInput.addEventListener("input", clearError);

// ============================================
// LOGIN
// ============================================

loginForm.addEventListener("submit", async (event) => {


event.preventDefault();

clearError();

const email = emailInput.value.trim();
const password = passwordInput.value;

const submitButton = document.getElementById("login-button");


// ========================================
// CLIENT-SIDE VALIDATION
// ========================================

if (!email || !password) {

    showError(
        "Please enter your email and password."
    );

    return;
}


// ========================================
// DISABLE BUTTON
// ========================================

submitButton.disabled = true;
submitButton.textContent = "Logging in...";


try {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })

    });


    // ====================================
    // READ RESPONSE SAFELY
    // ====================================

    let data = {};

    try {

        data = await response.json();

    } catch (jsonError) {

        data = {};

    }


    console.log("Login response:", response.status, data);


    // ====================================
    // LOGIN FAILED
    // ====================================

    if (!response.ok) {

        let errorMessage =
            "Invalid email or password.";


        /*
         * Your Django LoginView returns:
         *
         * {
         *     "error": "..."
         * }
         */

        if (data && data.error) {

            errorMessage = data.error;

        }


        /*
         * Handle Django serializer errors too.
         */

        else if (
            data &&
            typeof data === "object"
        ) {

            const errors = [];

            Object.entries(data).forEach(
                ([field, messages]) => {

                    if (Array.isArray(messages)) {

                        errors.push(
                            messages.join(", ")
                        );

                    } else {

                        errors.push(
                            String(messages)
                        );

                    }

                }
            );


            if (errors.length > 0) {

                errorMessage =
                    errors.join(" ");

            }

        }


        showError(errorMessage);

        return;

    }


    // ====================================
    // CHECK TOKENS
    // ====================================

    if (
        !data.tokens ||
        !data.tokens.access ||
        !data.tokens.refresh
    ) {

        showError(
            "Login succeeded, but authentication tokens were not returned."
        );

        return;

    }


    // ====================================
    // SAVE TOKENS
    // ====================================

    localStorage.setItem(
        "access_token",
        data.tokens.access
    );

    localStorage.setItem(
        "refresh_token",
        data.tokens.refresh
    );


    // ====================================
    // SAVE ROLE
    // ====================================

    if (data.selected_role) {

        localStorage.setItem(
            "user_role",
            data.selected_role
        );

    }


    // ====================================
    // SAVE AVAILABLE ROLES
    // ====================================

    if (data.available_roles) {

        localStorage.setItem(
            "available_roles",
            JSON.stringify(data.available_roles)
        );

    }


    // ====================================
    // SAVE USER
    // ====================================

    if (data.user) {

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

    }


    // ====================================
    // LOGIN SUCCESS
    // ====================================

    window.location.href = "home.html";


} catch (error) {

    console.error("Login error:", error);

    showError(
        "Unable to connect to the server. Please make sure the Django backend is running."
    );


} finally {

    submitButton.disabled = false;
    submitButton.textContent = "Log in";

}


});
