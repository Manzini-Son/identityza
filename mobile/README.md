# IdentityZA Mobile App & Google AdMob Setup Guide

This directory contains the native Android implementation of `identityza` equipped with **Google AdMob** for mobile advertising monetization (anchored Banner Ads and full-screen Interstitial Ads).

---

## 1. Project Overview & Architecture

- **Language / Framework:** Kotlin, Android SDK (minSdk 21, targetSdk 34), Material 3.
- **AdMob SDK:** `com.google.android.gms:play-services-ads:23.0.0`
- **Monetization Formats:**
  1. **Bottom Anchored Banner Ad:** Displayed persistently at the bottom of the screen inside [`activity_main.xml`](file:///home/manzini/ProjectFiles/C++Projects/identityza/mobile/android/app/src/main/res/layout/activity_main.xml).
  2. **Frequency-Capped Interstitial Ad:** Preloaded automatically in the background by [`AdMobManager.kt`](file:///home/manzini/ProjectFiles/C++Projects/identityza/mobile/android/app/src/main/java/za/co/identityza/AdMobManager.kt) and triggered every 3 validations to balance monetization with great user experience.

---

## 2. Opening & Running in Android Studio

1. Open **Android Studio**.
2. Select **File -> Open...** and navigate to:
   `/home/manzini/ProjectFiles/C++Projects/identityza/mobile/android`
3. Allow Gradle to sync dependencies.
4. Connect an Android phone via USB debugging or start an Android Virtual Device (AVD).
5. Click **Run 'app'** (`Shift + F10`).

> [!NOTE]
> The app is pre-configured with **Google's official AdMob sample/test IDs**. Test banner and interstitial ads will load immediately without needing an approved AdMob account.

---

## 3. Switching to Your Production AdMob Account

When you are ready to publish IdentityZA to the Google Play Store:

### Step 1: Create an AdMob Account
1. Go to [Google AdMob](https://admob.google.com/) and register.
2. Under **Apps -> Add App**, select **Android** and choose whether your app is already on Google Play.
3. Copy your unique **AdMob App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`).

### Step 2: Create Ad Units
Under **Ad units -> Add ad unit**:
1. Create a **Banner** ad unit and copy its Ad Unit ID.
2. Create an **Interstitial** ad unit and copy its Ad Unit ID.

### Step 3: Replace IDs in Code
1. Open [`mobile/android/app/src/main/AndroidManifest.xml`](file:///home/manzini/ProjectFiles/C++Projects/identityza/mobile/android/app/src/main/AndroidManifest.xml#L22):
   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID" />
   ```
2. Open [`mobile/android/app/src/main/res/values/strings.xml`](file:///home/manzini/ProjectFiles/C++Projects/identityza/mobile/android/app/src/main/res/values/strings.xml#L14-L15):
   ```xml
   <string name="admob_banner_ad_unit_id">ca-app-pub-YOUR_PUBLISHER_ID/YOUR_BANNER_SLOT</string>
   <string name="admob_interstitial_ad_unit_id">ca-app-pub-YOUR_PUBLISHER_ID/YOUR_INTERSTITIAL_SLOT</string>
   ```

---

## 4. Google Play Policy & Best Practices

1. **Never Click Your Own Ads**: Clicking live ads on your own device will cause AdMob to ban your account for invalid traffic.
2. **Set Up Test Devices**: In `AdMobManager.kt`, you can register your physical device ID as a test device so you can test real builds safely.
3. **Data Safety Section in Google Play**:
   - Because Google Mobile Ads SDK collects diagnostic information and advertising IDs, declare this in the Google Play Console **App Content -> Data safety** section (check *Yes* for advertising/analytics purposes).
4. **Build Release Bundle**:
   - In Android Studio: **Build -> Generate Signed Bundle / APK...** -> **Android App Bundle (.aab)**.
