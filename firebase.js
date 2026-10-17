// ==========================================
// 🔥 FIREBASE SETUP & HELPERS
// ==========================================

let db = null;
let storage = null;

// Initialize Firebase
if (typeof CONFIG !== 'undefined' && CONFIG.firebase.enabled) {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    storage = firebase.storage();
}
