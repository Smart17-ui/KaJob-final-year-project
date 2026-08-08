const JOBS_URL = "http://127.0.0.1:8000/api/jobs/";

const accessToken = localStorage.getItem("access_token");

function redirectToLogin() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    localStorage.removeItem("available_roles");

    window.location.replace("login.html");
}

if (!accessToken) {
    redirectToLogin();
}

const userData = localStorage.getItem("user");
const greetName = document.getElementById("greet-name");

if (userData && greetName) {
    try {
        const user = JSON.parse(userData);

        greetName.textContent =
            user.first_name ||
            user.name ||
            "User";

    } catch (error) {
        console.error("Unable to read user data:", error);
    }
}

const logoutButton = document.getElementById("logout-btn");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        redirectToLogin();
    });
}

const navToggle = document.getElementById("nav-toggle");

if (navToggle) {
    navToggle.addEventListener("click", () => {
        const tabs = document.querySelector(".kj-tabs");

        if (tabs) {
            tabs.classList.toggle("mobile-open");
        }
    });
}

const tabs = document.querySelectorAll(".kj-tabs a");

tabs.forEach((tab) => {
    tab.addEventListener("click", (event) => {
        const toastMessage = tab.dataset.toast;

        if (tab.getAttribute("href") === "#") {
            event.preventDefault();
        }

        if (toastMessage) {
            showToast(toastMessage);
        }

        tabs.forEach((item) => {
            item.classList.remove("active");
        });

        tab.classList.add("active");
    });
});

function showToast(message) {
    let toast = document.querySelector(".toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

const categoryButtons = document.querySelectorAll("#chip-row .chip");

categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        categoryButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const category = button.dataset.category;

        loadJobs(category);
    });
});

async function loadJobs(category = "All") {
    const jobList = document.getElementById("job-list");

    if (!jobList) {
        return;
    }

    jobList.innerHTML = "<p>Loading jobs...</p>";

    try {
        const response = await fetch(JOBS_URL, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (response.status === 401) {
            redirectToLogin();
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load jobs.");
        }

        const data = await response.json();

        const jobs = Array.isArray(data)
            ? data
            : data.results || [];

        const filteredJobs =
            category === "All"
                ? jobs
                : jobs.filter((job) =>
                    job.category &&
                    job.category.toLowerCase() === category.toLowerCase()
                );

        displayJobs(filteredJobs);

    } catch (error) {
        console.error("Error loading jobs:", error);

        jobList.innerHTML = `
            <p>Unable to load jobs. Please try again.</p>
        `;
    }
}

function displayJobs(jobs) {
    const jobList = document.getElementById("job-list");

    if (!jobList) {
        return;
    }

    jobList.innerHTML = "";

    if (jobs.length === 0) {
        jobList.innerHTML = `
            <p>No jobs available.</p>
        `;
        return;
    }

    jobs.forEach((job) => {
        const jobCard = document.createElement("article");

        jobCard.className = "job-ticket";

        jobCard.innerHTML = `
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/>

                <circle
                    cx="12"
                    cy="9.5"
                    r="2.4"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>

            <div class="row-top">
                <div>
                    <h4>${escapeHTML(job.title || "Untitled job")}</h4>

                    <div class="loc">
                        ${escapeHTML(
                            job.location ||
                            job.address ||
                            "Location not specified"
                        )}
                    </div>
                </div>

                <span class="pay">
                    ${formatPay(job.pay || job.amount)}
                </span>
            </div>

            <div class="meta-row">
                <span class="posted">
                    ${formatPostedDate(job.created_at)}
                </span>

                <span class="badge">
                    ${escapeHTML(job.category || "General")}
                </span>
            </div>
        `;

        jobList.appendChild(jobCard);
    });
}

function formatPay(amount) {
    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        return "Pay not specified";
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
        return escapeHTML(String(amount));
    }

    return `K${numericAmount.toLocaleString()}`;
}

function formatPostedDate(date) {
    if (!date) {
        return "Recently posted";
    }

    const createdDate = new Date(date);

    if (Number.isNaN(createdDate.getTime())) {
        return "Recently posted";
    }

    const now = new Date();

    const difference =
        now.getTime() - createdDate.getTime();

    const minutes = Math.floor(
        difference / (1000 * 60)
    );

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return createdDate.toLocaleDateString();
}

function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}

loadJobs();