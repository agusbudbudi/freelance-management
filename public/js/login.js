// Form switching functions
function switchToLogin() {
  document.getElementById("login-page").classList.add("active");
  document.getElementById("register-page").classList.remove("active");
  clearForms();
}

function switchToRegister() {
  document.getElementById("register-page").classList.add("active");
  document.getElementById("login-page").classList.remove("active");
  clearForms();
}

// Clear forms and errors
function clearForms() {
  document.getElementById("login-form").reset();
  document.getElementById("register-form").reset();
  clearErrors();
  hideAlerts();
  hidePasswordStrength();
}

function clearErrors() {
  document.querySelectorAll(".form-error").forEach((error) => {
    error.style.display = "none";
    error.textContent = "";
  });
  document.querySelectorAll(".form-control").forEach((input) => {
    input.classList.remove("error", "success");
  });
}

function hideAlerts() {
  document.querySelectorAll(".alert").forEach((alert) => {
    alert.style.display = "none";
  });
}

function hidePasswordStrength() {
  const strengthElement = document.getElementById("password-strength");
  if (strengthElement) {
    strengthElement.style.display = "none";
    strengthElement.className = "password-strength";
  }
}

// Password toggle functionality
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.parentElement.querySelector(".password-toggle i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("uil-eye");
    icon.classList.add("uil-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("uil-eye-slash");
    icon.classList.add("uil-eye");
  }
}

// Password strength checker
function checkPasswordStrength(password) {
  const strengthElement = document.getElementById("password-strength");
  const strengthBar = strengthElement.querySelector(".strength-fill");
  const strengthText = strengthElement.querySelector(".strength-text");

  if (password.length === 0) {
    strengthElement.style.display = "none";
    return;
  }

  strengthElement.style.display = "block";

  let strength = 0;
  let feedback = [];

  // Length check
  if (password.length >= 8) strength++;
  else feedback.push("at least 8 characters");

  // Uppercase check
  if (/[A-Z]/.test(password)) strength++;
  else feedback.push("uppercase letter");

  // Lowercase check
  if (/[a-z]/.test(password)) strength++;
  else feedback.push("lowercase letter");

  // Number check
  if (/\d/.test(password)) strength++;
  else feedback.push("number");

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  else feedback.push("special character");

  // Update UI based on strength
  strengthElement.className = "password-strength";
  if (strength <= 2) {
    strengthElement.classList.add("strength-weak");
    strengthText.textContent = "Weak password";
  } else if (strength <= 3) {
    strengthElement.classList.add("strength-medium");
    strengthText.textContent = "Medium strength";
  } else {
    strengthElement.classList.add("strength-strong");
    strengthText.textContent = "Strong password";
  }

  return strength;
}

// Show error message
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorElement = document.getElementById(inputId + "-error");

  input.classList.add("error");
  input.classList.remove("success");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// Show success state
function showSuccess(inputId) {
  const input = document.getElementById(inputId);
  const errorElement = document.getElementById(inputId + "-error");

  input.classList.remove("error");
  input.classList.add("success");
  errorElement.style.display = "none";
}

// Show alert message
function showAlert(alertId, message, type = "error") {
  const alert = document.getElementById(alertId);
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
                <i class="fas fa-${
                  type === "error" ? "exclamation-circle" : "check-circle"
                }"></i>
                ${message}
            `;
  alert.style.display = "block";
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Login form validation
function validateLoginForm() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  let isValid = true;
  clearErrors();

  // Email validation
  if (!email) {
    showError("login-email", "Email is required");
    isValid = false;
  } else if (!validateEmail(email)) {
    showError("login-email", "Please enter a valid email address");
    isValid = false;
  } else {
    showSuccess("login-email");
  }

  // Password validation
  if (!password) {
    showError("login-password", "Password is required");
    isValid = false;
  } else {
    showSuccess("login-password");
  }

  return isValid;
}

// Register form validation
function validateRegisterForm() {
  const fullName = document.getElementById("register-fullname").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById(
    "register-confirm-password"
  ).value;

  let isValid = true;
  clearErrors();

  // Full name validation
  if (!fullName) {
    showError("register-fullname", "Full name is required");
    isValid = false;
  } else if (fullName.length < 2) {
    showError("register-fullname", "Full name must be at least 2 characters");
    isValid = false;
  } else {
    showSuccess("register-fullname");
  }

  // Email validation
  if (!email) {
    showError("register-email", "Email is required");
    isValid = false;
  } else if (!validateEmail(email)) {
    showError("register-email", "Please enter a valid email address");
    isValid = false;
  } else {
    showSuccess("register-email");
  }

  // Password validation
  if (!password) {
    showError("register-password", "Password is required");
    isValid = false;
  } else if (password.length < 8) {
    showError(
      "register-password",
      "Password must be at least 8 characters long"
    );
    isValid = false;
  } else {
    const strength = checkPasswordStrength(password);
    if (strength < 3) {
      showError(
        "register-password",
        "Password is too weak. Please create a stronger password."
      );
      isValid = false;
    } else {
      showSuccess("register-password");
    }
  }

  // Confirm password validation
  if (!confirmPassword) {
    showError("register-confirm-password", "Please confirm your password");
    isValid = false;
  } else if (password !== confirmPassword) {
    showError("register-confirm-password", "Passwords do not match");
    isValid = false;
  } else {
    showSuccess("register-confirm-password");
  }

  return isValid;
}

// Set button loading state
function setButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (isLoading) {
    button.classList.add("btn-loading");
    button.disabled = true;
  } else {
    button.classList.remove("btn-loading");
    button.disabled = false;
  }
}

// API Configuration
const API_BASE_URL = window.location.origin + "/api";

// Make API call
async function makeAPICall(endpoint, method = "GET", data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API request failed");
  }

  return result;
}

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();

  if (!validateLoginForm()) {
    return;
  }

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  setButtonLoading("login-btn", true);
  hideAlerts();

  try {
    // Make actual API call
    const response = await makeAPICall("/auth/login", "POST", {
      email,
      password,
    });

    showAlert("login-alert", "Login successful! Redirecting...", "success");

    // Store user data and token
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", response.data.token);

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } catch (error) {
    showAlert(
      "login-alert",
      error.message || "Login failed. Please try again."
    );
  } finally {
    setButtonLoading("login-btn", false);
  }
}

// Handle register form submission
async function handleRegister(event) {
  event.preventDefault();

  if (!validateRegisterForm()) {
    return;
  }

  const formData = {
    fullName: document.getElementById("register-fullname").value.trim(),
    email: document.getElementById("register-email").value.trim(),
    password: document.getElementById("register-password").value,
    confirmPassword: document.getElementById("register-confirm-password").value,
  };

  setButtonLoading("register-btn", true);
  hideAlerts();

  try {
    // Make actual API call
    const response = await makeAPICall("/auth/register", "POST", formData);

    showAlert(
      "register-alert",
      response.message || "Account created successfully!",
      "success"
    );

    // Switch to login form after successful registration
    setTimeout(() => {
      switchToLogin();
      showAlert(
        "login-alert",
        "Account created! Please sign in with your credentials.",
        "success"
      );
    }, 2000);
  } catch (error) {
    showAlert(
      "register-alert",
      error.message || "Registration failed. Please try again."
    );
  } finally {
    setButtonLoading("register-btn", false);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Form submissions
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document
    .getElementById("register-form")
    .addEventListener("submit", handleRegister);

  // Real-time password strength checking
  document
    .getElementById("register-password")
    .addEventListener("input", function () {
      checkPasswordStrength(this.value);
    });

  // Real-time validation
  document
    .getElementById("register-confirm-password")
    .addEventListener("input", function () {
      const password = document.getElementById("register-password").value;
      const confirmPassword = this.value;

      if (confirmPassword && password !== confirmPassword) {
        showError("register-confirm-password", "Passwords do not match");
      } else if (confirmPassword && password === confirmPassword) {
        showSuccess("register-confirm-password");
      }
    });

  // Clear errors on input
  document.querySelectorAll(".form-control").forEach((input) => {
    input.addEventListener("input", function () {
      if (this.classList.contains("error")) {
        this.classList.remove("error");
        const errorElement = document.getElementById(this.id + "-error");
        if (errorElement) {
          errorElement.style.display = "none";
        }
      }
    });
  });
});
