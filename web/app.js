/**
 * identityza - South African ID Number Validator & Info Parser
 * Client-Side Engine & AdSense Integration
 */

// --- Pure Validation & Parsing Engine (Faithful to C++ main.cpp) ---

function parseSouthAfricanId(idNumber) {
  const sanitized = (idNumber || '').trim();

  // 1. Length and digit check
  if (!/^\d{13}$/.test(sanitized)) {
    return {
      isValid: false,
      error: 'ID number must contain exactly 13 digits without spaces or symbols.',
      details: null
    };
  }

  // 2. Extract Date of Birth
  const yy = parseInt(sanitized.substring(0, 2), 10);
  const mm = parseInt(sanitized.substring(2, 4), 10);
  const dd = parseInt(sanitized.substring(4, 6), 10);

  const today = new Date();
  const currentYearTwoDigits = today.getFullYear() % 100;
  const century = yy > currentYearTwoDigits ? 1900 : 2000;
  const fullYear = century + yy;

  // Validate calendar date
  const birthDate = new Date(fullYear, mm - 1, dd);
  if (
    birthDate.getFullYear() !== fullYear ||
    birthDate.getMonth() !== mm - 1 ||
    birthDate.getDate() !== dd
  ) {
    return {
      isValid: false,
      error: `Invalid date of birth components in ID number (${fullYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}).`,
      details: null
    };
  }

  // 3. Calculate Age
  let age = today.getFullYear() - fullYear;
  const hasHadBirthdayThisYear =
    today.getMonth() > (mm - 1) ||
    (today.getMonth() === (mm - 1) && today.getDate() >= dd);
  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  // 4. Gender Determination (Digits 7-10: 0000-4999 Female, 5000-9999 Male)
  const genderSeq = parseInt(sanitized.substring(6, 10), 10);
  const gender = genderSeq >= 5000 ? 'Male' : 'Female';

  // 5. Citizenship Determination (Digit 11: 0 = SA Citizen, 1 = Permanent Resident)
  const citizenshipDigit = parseInt(sanitized.charAt(10), 10);
  let citizenship = 'Unknown';
  if (citizenshipDigit === 0) {
    citizenship = 'SA Citizen';
  } else if (citizenshipDigit === 1) {
    citizenship = 'Permanent Resident';
  } else {
    citizenship = `Non-standard (${citizenshipDigit})`;
  }

  // 6. Luhn Algorithm Checksum (Exact algorithm matching main.cpp)
  let oddDigits = '';
  let evenDigitsStr = '';

  for (let i = 0; i < 13; i++) {
    if (i % 2 === 0) {
      oddDigits += sanitized[i];
    } else {
      evenDigitsStr += sanitized[i];
    }
  }

  let oddSum = 0;
  for (const char of oddDigits) {
    oddSum += parseInt(char, 10);
  }

  const evenNum = parseInt(evenDigitsStr, 10) * 2;
  const evenDoubledStr = String(evenNum);
  let evenSum = 0;
  for (const char of evenDoubledStr) {
    evenSum += parseInt(char, 10);
  }

  const luhnTotal = oddSum + evenSum;
  const isLuhnValid = luhnTotal % 10 === 0;

  const formattedDob = `${fullYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;

  return {
    isValid: isLuhnValid,
    error: isLuhnValid ? null : 'Failed Luhn checksum validation. The 13th check digit does not match.',
    idNumber: sanitized,
    details: {
      dob: formattedDob,
      age: age,
      gender: gender,
      genderSequence: sanitized.substring(6, 10),
      citizenship: citizenship,
      citizenshipDigit: citizenshipDigit,
      classificationIndex: sanitized.charAt(11),
      checkDigit: sanitized.charAt(12),
      luhn: {
        oddSum,
        evenDigitsStr,
        evenNum,
        evenSum,
        luhnTotal,
        isValid: isLuhnValid
      }
    }
  };
}

// --- Local Storage History (Similar to id_numbers.txt in CLI) ---
const HISTORY_KEY = 'identityza_history_v1';

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveToHistory(entry) {
  try {
    const current = getHistory();
    // Prepend and limit to latest 10
    const filtered = current.filter(item => item.idNumber !== entry.idNumber);
    filtered.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 10)));
  } catch (e) {
    console.warn('LocalStorage unavailable', e);
  }
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {}
}

// --- Google AdSense Engine Loader ---
function initAdSense() {
  const config = window.ADSENSE_CONFIG || { previewMode: true };
  const previewBanners = document.querySelectorAll('.ad-preview-banner');
  const adUnits = document.querySelectorAll('.adsbygoogle');

  if (config.previewMode || !config.publisherId || config.publisherId.includes('XXXX')) {
    // Development / Preview Mode: Keep styled visual placeholders
    previewBanners.forEach(banner => {
      banner.style.display = 'flex';
    });
    adUnits.forEach(unit => {
      unit.style.display = 'none';
    });
    console.info('identityza: Running in AdSense Preview Mode. Set previewMode: false in adsense-config.js to serve live ads.');
  } else {
    // Production Mode: Display live Google AdSense ad units
    previewBanners.forEach(banner => {
      banner.style.display = 'none';
    });

    adUnits.forEach(unit => {
      unit.style.display = 'block';

      // Ensure client ID matches configuration
      if (config.publisherId) {
        unit.setAttribute('data-ad-client', config.publisherId);
      }

      // Map ad slot from config if configured
      const slotName = unit.getAttribute('data-slot-name');
      if (slotName && config.slots && config.slots[slotName]) {
        unit.setAttribute('data-ad-slot', config.slots[slotName]);
      }
    });

    // Ensure AdSense library is present in document head
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.publisherId)}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      script.onload = () => pushAdUnits(adUnits);
    } else {
      pushAdUnits(adUnits);
    }
  }
}

function pushAdUnits(adUnits) {
  adUnits.forEach(unit => {
    // Only push if the unit hasn't already been processed by Google
    if (!unit.getAttribute('data-adsbygoogle-status')) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    }
  });
}

// --- UI Interaction & DOM Setup ---
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('validator-form');
  const idInput = document.getElementById('id-input');
  const resultCard = document.getElementById('result-card');
  const resultBadge = document.getElementById('result-badge');
  const dobVal = document.getElementById('res-dob');
  const ageVal = document.getElementById('res-age');
  const genderVal = document.getElementById('res-gender');
  const citizenshipVal = document.getElementById('res-citizenship');
  const luhnVal = document.getElementById('res-luhn');
  const errorMsg = document.getElementById('id-error');
  const copyBtn = document.getElementById('copy-btn');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const sampleButtons = document.querySelectorAll('[data-sample-id]');

  let currentResult = null;

  // Initialize Ads
  initAdSense();

  // Render initial history
  renderHistory();

  // Sample ID quick-fill buttons
  sampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleId = btn.getAttribute('data-sample-id');
      idInput.value = sampleId;
      idInput.focus();
      validateAndRender(sampleId);
    });
  });

  // Sync aria-invalid with form field state
  const syncAria = (el) => {
    if (el.matches) {
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    }
  };
  idInput.addEventListener('blur', () => syncAria(idInput));
  idInput.addEventListener('input', () => {
    // Only allow numeric input
    idInput.value = idInput.value.replace(/\D/g, '').slice(0, 13);
    if (idInput.hasAttribute('aria-invalid')) syncAria(idInput);

    if (idInput.value.length === 13) {
      validateAndRender(idInput.value);
    } else {
      hideResults();
    }
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validateAndRender(idInput.value);
  });

  // Reset form
  form.addEventListener('reset', () => {
    setTimeout(() => {
      hideResults();
      idInput.removeAttribute('aria-invalid');
    }, 10);
  });

  // Copy button handler
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!currentResult || !currentResult.details) return;
      const text = [
        `South African ID Number: ${currentResult.idNumber}`,
        `Date of Birth: ${currentResult.details.dob}`,
        `Age: ${currentResult.details.age}`,
        `Gender: ${currentResult.details.gender}`,
        `Citizenship: ${currentResult.details.citizenship}`,
        `Luhn Validity: ${currentResult.isValid ? 'Valid' : 'Invalid'}`
      ].join('\n');

      navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('btn-success');
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('btn-success');
        }, 2000);
      });
    });
  }

  // Clear History handler
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      clearHistory();
      renderHistory();
    });
  }

  function validateAndRender(idStr) {
    const res = parseSouthAfricanId(idStr);
    currentResult = res;

    if (!res.isValid && !res.details) {
      // Hard syntax / date error
      errorMsg.textContent = res.error;
      errorMsg.style.display = 'block';
      resultCard.style.display = 'none';
      return;
    }

    errorMsg.style.display = 'none';
    resultCard.style.display = 'block';

    if (res.isValid) {
      resultBadge.className = 'status-badge status-valid';
      resultBadge.textContent = 'Valid SA ID Number';
      luhnVal.textContent = 'Passed (Checksum 100% Valid)';
      luhnVal.className = 'val-valid';
    } else {
      resultBadge.className = 'status-badge status-invalid';
      resultBadge.textContent = 'Invalid Checksum';
      luhnVal.textContent = 'Failed (Checksum Mismatch)';
      luhnVal.className = 'val-invalid';
    }

    dobVal.textContent = res.details.dob;
    ageVal.textContent = `${res.details.age} years old`;
    genderVal.textContent = res.details.gender;
    citizenshipVal.textContent = res.details.citizenship;

    // Save to local storage history if 13 digits parsed
    saveToHistory({
      idNumber: res.idNumber,
      dob: res.details.dob,
      age: res.details.age,
      gender: res.details.gender,
      citizenship: res.details.citizenship,
      isValid: res.isValid,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    renderHistory();
  }

  function hideResults() {
    resultCard.style.display = 'none';
    errorMsg.style.display = 'none';
    currentResult = null;
  }

  function renderHistory() {
    if (!historyList) return;
    const history = getHistory();
    if (history.length === 0) {
      historyList.innerHTML = '<li class="history-empty">No recent queries in this browser session.</li>';
      if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
      return;
    }

    if (clearHistoryBtn) clearHistoryBtn.style.display = 'inline-block';
    historyList.innerHTML = history.map(item => `
      <li class="history-item" data-id="${item.idNumber}">
        <div class="history-main">
          <strong>${item.idNumber}</strong>
          <span class="badge ${item.isValid ? 'badge-valid' : 'badge-invalid'}">
            ${item.isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        <div class="history-sub">
          <span>${item.dob}</span> • <span>${item.gender}</span> • <span>${item.citizenship}</span>
        </div>
      </li>
    `).join('');

    // Re-bind click on history item to fill input
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const idVal = item.getAttribute('data-id');
        idInput.value = idVal;
        validateAndRender(idVal);
      });
    });
  }
});
