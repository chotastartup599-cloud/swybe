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

// ==========================================
// 📤 UPLOAD FILE TO FIREBASE STORAGE
// ==========================================
window.uploadFileToStorage = function(file, folderName) {
    return new Promise((resolve, reject) => {
        if (!file) return reject("No file selected");
        
        // Create unique filename
        const fileName = Date.now() + "_" + file.name;
        const storageRef = storage.ref(`${folderName}/${fileName}`);
        
        // Start upload
        const uploadTask = storageRef.put(file);
        
        // Track progress
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                // Update UI if needed
            }, 
            (error) => {
                reject(error);
            }, 
            () => {
                // Upload completed successfully, now get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};
