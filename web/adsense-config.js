/**
 * Google AdSense Configuration for identityza
 * -------------------------------------------
 * When your Google AdSense account is approved, update this file with your
 * publisher credentials and ad unit slot IDs.
 */

window.ADSENSE_CONFIG = {
  // Set to true to show styled preview placeholders when running locally or during development.
  // Set to false once your real Google AdSense account and ad units are approved.
  previewMode: false,

  // Your Google AdSense Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
  // Found in your AdSense console -> Account -> Settings -> Account information
  publisherId: "ca-pub-6548527919306016",

  // Specific ad slot IDs created in your AdSense console (Ads -> By ad unit)
  slots: {
    topLeaderboard: "4501250656", // Responsive Horizontal Banner (Header)
    inContent: "6935842309",      // Responsive In-Feed / Display Unit (Mid-page)
    bottomBanner: "1156153581"    // Responsive Banner (Footer)
  }
};
