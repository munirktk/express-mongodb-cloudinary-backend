// Function to validate email addresses
export const validateEmail = (email) => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Function to validate passwords
  export const validatePassword = (password) => {
    // Password length requirement
    const minLength = 8;
    // Regular expression for password validation (example: at least one uppercase letter, one lowercase letter, one digit)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return password.length >= minLength && passwordRegex.test(password);
  };
  