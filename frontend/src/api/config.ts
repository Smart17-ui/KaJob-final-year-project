/** Shared API origin so authentication and protected requests use the same backend. */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://kajob-final-year-project.onrender.com/api";

export default API_BASE_URL;
