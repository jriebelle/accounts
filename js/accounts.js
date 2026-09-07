/**
 * Accounts Application Scripts - ShopKite
 * Handles client-side form validation, countdown timers,
 * password toggles, modal dialogs, and navigation flows.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initVerifyAccountPage();
  initCompleteProfilePage();
  initConfirmBusinessNumberPage();
  initCreatePasswordPage();
});

/* -------------------------------------------------------------------------- */
/* 1. Login Page (index.html, accounts.html)                                  */
/* -------------------------------------------------------------------------- */
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const emailInput = document.getElementById('email');
  const submitBtn = document.getElementById('submitBtn');

  function checkEmailValidity() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (emailInput && emailRegex.test(emailInput.value.trim())) {
      loginForm.classList.add('has-valid-email');
      if (submitBtn) submitBtn.disabled = false;
    } else {
      loginForm.classList.remove('has-valid-email');
      if (submitBtn) submitBtn.disabled = true;
    }
  }

  if (emailInput) {
    emailInput.addEventListener('input', checkEmailValidity);
    emailInput.addEventListener('change', checkEmailValidity);

    // Support prefill if navigating back from change email link
    const urlParams = new URLSearchParams(window.location.search);
    const prefillEmail = urlParams.get('email');
    if (prefillEmail) {
      emailInput.value = prefillEmail;
    }
    checkEmailValidity();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn && !submitBtn.disabled) {
      const email = emailInput ? emailInput.value.trim() : '';
      sessionStorage.setItem('accountEmail', email);
      window.location.href = `create-account.html?email=${encodeURIComponent(email)}`;
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 2. Create Account / Verify Page (create-account.html)                      */
/* -------------------------------------------------------------------------- */
function initVerifyAccountPage() {
  const verifyForm = document.getElementById('verifyForm');
  if (!verifyForm) return;

  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email') || sessionStorage.getItem('accountEmail') || 'user@example.com';

  const emailInput = document.getElementById('email');
  const emailDisplay = document.getElementById('emailDisplay');
  const changeEmailLink = document.getElementById('changeEmailLink');
  const codeInput = document.getElementById('code');
  const confirmBtn = document.getElementById('confirmBtn');
  const resendBtn = document.getElementById('resendBtn');

  if (emailInput && emailParam) {
    emailInput.value = emailParam;
    if (emailDisplay) {
      emailDisplay.textContent = emailParam;
    }
    if (changeEmailLink) {
      changeEmailLink.href = `accounts.html?email=${encodeURIComponent(emailParam)}`;
    }
  }

  function checkCodeValidity() {
    if (!codeInput) return;
    const code = codeInput.value.trim();
    if (code.length >= 4) {
      verifyForm.classList.add('has-valid-code');
      if (confirmBtn) confirmBtn.disabled = false;
    } else {
      verifyForm.classList.remove('has-valid-code');
      if (confirmBtn) confirmBtn.disabled = true;
    }
  }

  if (codeInput) {
    codeInput.addEventListener('input', checkCodeValidity);
    codeInput.addEventListener('change', checkCodeValidity);
    checkCodeValidity();
  }

  let countdownTimer = null;
  function startResendCountdown(durationSeconds = 120) {
    if (!resendBtn) return;
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    let timeLeft = durationSeconds;
    resendBtn.disabled = true;

    function updateDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      resendBtn.textContent = `Resend code in ${formattedTime}`;
    }

    updateDisplay();

    countdownTimer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend code';
      } else {
        updateDisplay();
      }
    }, 1000);
  }

  if (resendBtn) {
    startResendCountdown(120);

    resendBtn.addEventListener('click', () => {
      if (resendBtn.disabled) return;
      startResendCountdown(120);
    });
  }

  verifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (confirmBtn && !confirmBtn.disabled) {
      window.location.href = 'complete-profile.html';
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 3. Complete Profile Page (complete-profile.html)                           */
/* -------------------------------------------------------------------------- */
function initCompleteProfilePage() {
  const profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  const firstname = document.getElementById('firstname') || document.getElementById('fullname');
  const lastname = document.getElementById('lastname');
  const businessName = document.getElementById('businessName');
  const personalLine = document.getElementById('personalLine');
  const businessLine = document.getElementById('businessLine');
  const continueBtn = document.getElementById('continueBtn');

  function formatPhoneNumber(e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 13);
  }

  if (personalLine) personalLine.addEventListener('input', formatPhoneNumber);
  if (businessLine) businessLine.addEventListener('input', formatPhoneNumber);

  function checkProfileValidity() {
    const isFirstnameValid = firstname ? firstname.value.trim().length > 0 : false;
    const isLastnameValid = lastname ? lastname.value.trim().length > 0 : false;
    const isBusinessNameValid = businessName ? businessName.value.trim().length > 0 : false;
    const isPersonalLineValid = personalLine ? (personalLine.value.trim().length >= 10 && personalLine.value.trim().length <= 13) : false;
    const isBusinessLineValid = businessLine ? (businessLine.value.trim().length === 0 || (businessLine.value.trim().length >= 10 && businessLine.value.trim().length <= 13)) : true;

    const isValid = isFirstnameValid && isLastnameValid && isBusinessNameValid && isPersonalLineValid && isBusinessLineValid;

    if (isValid) {
      profileForm.classList.add('has-valid-profile');
      if (continueBtn) continueBtn.disabled = false;
    } else {
      profileForm.classList.remove('has-valid-profile');
      if (continueBtn) continueBtn.disabled = true;
    }
  }

  [firstname, lastname, businessName, personalLine, businessLine].forEach((input) => {
    if (input) {
      input.addEventListener('input', checkProfileValidity);
      input.addEventListener('change', checkProfileValidity);
    }
  });

  checkProfileValidity();

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (continueBtn && !continueBtn.disabled) {
      const personalCountryCodeEl = document.getElementById('personalCountryCode');
      const countryCode = personalCountryCodeEl ? personalCountryCodeEl.value : '+234';
      const phone = `${countryCode} ${personalLine ? personalLine.value.trim() : ''}`;
      sessionStorage.setItem('personalLine', phone);
      sessionStorage.setItem('phoneToConfirm', phone);
      if (businessLine && businessLine.value.trim().length > 0) {
        const businessCountryCodeEl = document.getElementById('businessCountryCode');
        const bCountryCode = businessCountryCodeEl ? businessCountryCodeEl.value : '+234';
        sessionStorage.setItem('businessLine', `${bCountryCode} ${businessLine.value.trim()}`);
      }
      window.location.href = `confirm-personal-number.html?phone=${encodeURIComponent(phone)}`;
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 4. Confirm Personal Number Page (confirm-personal-number.html)             */
/* -------------------------------------------------------------------------- */
function initConfirmBusinessNumberPage() {
  initConfirmPersonalNumberPage();
}

function initConfirmPersonalNumberPage() {
  const confirmNumberForm = document.getElementById('confirmNumberForm');
  if (!confirmNumberForm) return;

  const urlParams = new URLSearchParams(window.location.search);
  const phoneParam = urlParams.get('phone') || sessionStorage.getItem('personalLine') || sessionStorage.getItem('phoneToConfirm') || sessionStorage.getItem('businessLine') || '+234 803 918 5918';

  const personalNumber = document.getElementById('personalNumber') || document.getElementById('businessNumber');
  const phoneDisplay = document.getElementById('phoneDisplay');
  const changeNumberLink = document.getElementById('changeNumberLink');
  const verificationMethod = document.getElementById('verificationMethod');
  const sendCodeBtn = document.getElementById('sendCodeBtn');
  const sendCodeText = document.getElementById('sendCodeText');
  const codeInput = document.getElementById('code');
  const confirmBtn = document.getElementById('confirmBtn');
  const resendBtn = document.getElementById('resendBtn');

  if (personalNumber && phoneParam) {
    personalNumber.value = phoneParam;
    if (phoneDisplay) {
      phoneDisplay.textContent = phoneParam;
    }
    if (changeNumberLink) {
      changeNumberLink.href = `complete-profile.html?phone=${encodeURIComponent(phoneParam)}`;
    }
  }

  function checkCodeValidity() {
    if (!codeInput) return;
    const code = codeInput.value.trim();
    if (code.length >= 4) {
      confirmNumberForm.classList.add('has-valid-code');
      if (confirmBtn) confirmBtn.disabled = false;
    } else {
      confirmNumberForm.classList.remove('has-valid-code');
      if (confirmBtn) confirmBtn.disabled = true;
    }
  }

  if (codeInput) {
    codeInput.addEventListener('input', checkCodeValidity);
    codeInput.addEventListener('change', checkCodeValidity);
    checkCodeValidity();
  }

  let countdownTimer = null;
  function startCountdown(durationSeconds = 120) {
    if (!resendBtn) return;
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    let timeLeft = durationSeconds;
    resendBtn.disabled = true;

    function updateDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      resendBtn.textContent = `Resend code in ${formatted}`;
    }

    updateDisplay();

    countdownTimer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend code';
      } else {
        updateDisplay();
      }
    }, 1000);
  }

  if (resendBtn) {
    startCountdown(120);

    resendBtn.addEventListener('click', () => {
      if (resendBtn.disabled) return;
      const method = verificationMethod ? verificationMethod.value : 'WhatsApp';
      if (sendCodeText) sendCodeText.textContent = `Code Sent via ${method}!`;
      startCountdown(120);
    });
  }

  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', () => {
      const method = verificationMethod ? verificationMethod.value : 'WhatsApp';
      if (sendCodeText) sendCodeText.textContent = `Code Sent via ${method}!`;
      sendCodeBtn.style.borderColor = '#38ef7d';
      sendCodeBtn.style.color = '#38ef7d';
      startCountdown(120);
      if (codeInput) codeInput.focus();

      setTimeout(() => {
        if (sendCodeText) sendCodeText.textContent = 'Resend Verification Code';
        sendCodeBtn.style.borderColor = '';
        sendCodeBtn.style.color = '';
      }, 3000);
    });
  }

  confirmNumberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (confirmBtn && !confirmBtn.disabled) {
      window.location.href = 'create-password.html';
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 5. Create Password Page (create-password.html)                             */
/* -------------------------------------------------------------------------- */
function initCreatePasswordPage() {
  const createPasswordForm = document.getElementById('createPasswordForm');
  if (!createPasswordForm) return;

  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const continueBtn = document.getElementById('continueBtn');
  const matchError = document.getElementById('passwordMatchError');
  const successModal = document.getElementById('successModal');
  const loginAccountBtn = document.getElementById('loginAccountBtn');

  // Password visibility toggles
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeIcon1 = document.getElementById('eyeIcon1');
  const eyeOffIcon1 = document.getElementById('eyeOffIcon1');

  if (togglePasswordBtn && password) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = password.type === 'password';
      password.type = isPassword ? 'text' : 'password';
      if (eyeIcon1) eyeIcon1.style.display = isPassword ? 'none' : 'block';
      if (eyeOffIcon1) eyeOffIcon1.style.display = isPassword ? 'block' : 'none';
    });
  }

  const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');
  const eyeIcon2 = document.getElementById('eyeIcon2');
  const eyeOffIcon2 = document.getElementById('eyeOffIcon2');

  if (toggleConfirmPasswordBtn && confirmPassword) {
    toggleConfirmPasswordBtn.addEventListener('click', () => {
      const isPassword = confirmPassword.type === 'password';
      confirmPassword.type = isPassword ? 'text' : 'password';
      if (eyeIcon2) eyeIcon2.style.display = isPassword ? 'none' : 'block';
      if (eyeOffIcon2) eyeOffIcon2.style.display = isPassword ? 'block' : 'none';
    });
  }

  // Validation logic
  function validatePasswords() {
    if (!password || !confirmPassword) return;
    const pwdVal = password.value;
    const confVal = confirmPassword.value;

    const isLengthValid = pwdVal.length >= 8;
    const doMatch = pwdVal === confVal && confVal.length > 0;

    if (matchError) {
      if (confVal.length > 0 && pwdVal !== confVal) {
        matchError.classList.add('is-visible');
      } else {
        matchError.classList.remove('is-visible');
      }
    }

    if (isLengthValid && doMatch) {
      createPasswordForm.classList.add('has-valid-password');
      if (continueBtn) continueBtn.disabled = false;
    } else {
      createPasswordForm.classList.remove('has-valid-password');
      if (continueBtn) continueBtn.disabled = true;
    }
  }

  if (password) password.addEventListener('input', validatePasswords);
  if (confirmPassword) confirmPassword.addEventListener('input', validatePasswords);

  // Form submit -> Show success popup modal
  createPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (continueBtn && !continueBtn.disabled) {
      if (successModal) {
        successModal.classList.add('is-active');
        if (loginAccountBtn) loginAccountBtn.focus();
      }
    }
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal && successModal.classList.contains('is-active')) {
      successModal.classList.remove('is-active');
    }
  });

  // Close on overlay click outside card
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('is-active');
      }
    });
  }
}
