# identityza

A lightweight, standalone C++ command-line application designed to validate and parse South African National Identity (ID) numbers without relying on third-party libraries or external services.

---

## Features

- **Date of Birth & Age**: Extracts date of birth (`YYYY-MM-DD`), validates calendar date correctness (including leap years), and computes the person's current age.
- **Gender Determination**: Decodes gender based on the 4-digit sequence number (0000–4999 for Female, 5000–9999 for Male).
- **Citizenship Verification**: Identifies whether the individual is a South African citizen (digit `0`) or a permanent resident (digit `1`).
- **Luhn Algorithm Checksum**: Validates the structural integrity and check digit of the 13-digit ID number.
- **Interactive CLI**: Allows continuous checking of multiple ID numbers in an interactive loop.
- **History & Logging**: Automatically creates and appends verified queries and outputs to `id_numbers.txt`.
- **Zero External Dependencies**: Implemented strictly using modern standard C++.

---

## South African ID Number Structure

A South African ID number is a 13-digit number structured in the format **`YYMMDD SSSS C A Z`**:

| Digits | Field | Description |
|---|---|---|
| `1–6` (`YYMMDD`) | Date of Birth | Year, month, and day of birth. |
| `7–10` (`SSSS`) | Gender Sequence | `0000–4999` = Female, `5000–9999` = Male. |
| `11` (`C`) | Citizenship | `0` = South African Citizen, `1` = Permanent Resident. |
| `12` (`A`) | Former Race/Index | Previously used for racial classification, now usually `8` or `9`. |
| `13` (`Z`) | Checksum Digit | Validation checksum calculated via the Luhn algorithm. |

---

## Prerequisites

- Modern C++ compiler with C++17 or C++11 support (e.g., `g++`, `clang++`, or MSVC).

---

## Building the Project

Compile the application using `g++`:

```bash
g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o identityza
```

Or using `clang++`:

```bash
clang++ -std=c++17 -Wall -Wextra -O2 main.cpp -o identityza
```

---

## Usage

Run the compiled executable:

```bash
./identityza
```

### Example Interactive Session

```text
Welcome to the identityza app!
Please enter a South African ID number: 8801235111088
Date of Birth: 1988-01-23
Age: 38
Gender: Male
Citizenship: SA Citizen
ID Number Validity: Valid
Thank you for using our service.
Would you like to check another ID number? (yes/no): no
Exiting the program. Goodbye!
```

---

## Output & Logging

Whenever a valid ID query is completed, the ID number and parsed information are automatically appended to `id_numbers.txt` in the current working directory for record keeping:

```text
ID Number: 8801235111088
Date of Birth: 1988-01-23
Age: 38
Gender: Male
Citizenship: SA Citizen
ID Number Validity: Valid
```

---

## Project Structure

```text
identityza/
├── main.cpp                  # Standalone C++ CLI application
├── id_numbers.txt            # Automatic record log of processed ID numbers
├── README.md                 # Project documentation
├── .gitignore                # Git ignore rules for build artifacts
│
├── web/                      # Web App (Monetized with Google AdSense)
│   ├── index.html            # Web application UI, validator, SEO content & ad slots
│   ├── style.css             # Responsive styling & ad layout wrappers
│   ├── app.js                # Client-side validation engine & AdSense loader
│   ├── adsense-config.js     # AdSense publisher & ad unit configuration
│   ├── ads.txt               # AdSense seller verification file
│   └── README.md             # AdSense monetization & deployment guide
│
└── mobile/                   # Android App (Monetized with Google AdMob)
    ├── README.md             # AdMob setup, test IDs & Play Store deployment guide
    └── android/              # Native Android Studio project (Kotlin, Material 3)
        ├── app/
        │   ├── build.gradle  # Google Mobile Ads SDK dependency
        │   └── src/main/
        │       ├── AndroidManifest.xml # AdMob App ID & permissions
        │       ├── java/za/co/identityza/
        │       │   ├── MainActivity.kt # UI, banner & interstitial controllers
        │       │   ├── AdMobManager.kt # AdMob initialization & frequency capping
        │       │   └── IdValidator.kt  # Native SA ID validation logic
        │       └── res/      # Layouts, colors, themes, AdMob unit strings
        ├── build.gradle
        └── settings.gradle
```

---

## Monetization

### 1. Web Application (Google AdSense)
- Deploy the static [`web/`](file:///home/manzini/ProjectFiles/C++Projects/identityza/web/) directory to any web host (Vercel, GitHub Pages, Netlify, Cloudflare Pages).
- Edit [`web/adsense-config.js`](file:///home/manzini/ProjectFiles/C++Projects/identityza/web/adsense-config.js) and [`web/ads.txt`](file:///home/manzini/ProjectFiles/C++Projects/identityza/web/ads.txt) with your AdSense Publisher ID.
- See [`web/README.md`](file:///home/manzini/ProjectFiles/C++Projects/identityza/web/README.md) for full instructions.

### 2. Mobile Android Application (Google AdMob)
- Open [`mobile/android/`](file:///home/manzini/ProjectFiles/C++Projects/identityza/mobile/android/) in Android Studio.
- Pre-configured with Google test IDs for instant testing of anchored bottom **Banner Ads** and frequency-capped **Interstitial Ads**.
- Switch to your production AdMob IDs in [`AndroidManifest.xml`](file:///home/manzini/ProjectFiles/C++Projects/identityza/mobile/android/app/src/main/AndroidManifest.xml) and [`strings.xml`](file:///home/manzini/ProjectFiles/C++Projects/identityza/mobile/android/app/src/main/res/values/strings.xml) when publishing to the Google Play Store.
- See [`mobile/README.md`](file:///home/manzini/ProjectFiles/C++Projects/identityza/mobile/README.md) for detailed steps.

---

## Author

- **Andile Danse**
