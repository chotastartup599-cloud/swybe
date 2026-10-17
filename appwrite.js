// ==========================================
// 🔥 APPWRITE SETUP & CLOUDINARY UPLOAD
// ==========================================

const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1'; 
const APPWRITE_PROJECT_ID = '6ad32736000b5c77836e';        
const DATABASE_ID = '6ad32c1d0016207e7c05'; // Jo tumne banaya hai
const COLLECTION_ID = '6ad32d260012fc4b6b66';

// Init Appwrite
const client = new Appwrite.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);

// ==========================================
// 📤 CLOUDINARY UPLOAD FUNCTION
// ==========================================
const CLOUDINARY_CLOUD_NAME = 'okuevkuf'; 
const CLOUDINARY_UPLOAD_PRESET = 'swybe_upload'; 

window.uploadToCloudinary = async function(file, folderName) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folderName);

    const type = file.type.startsWith('video') ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`;

    const res = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const data = await res.json();
    if (data.secure_url) {
        return data.secure_url;
    } else {
        throw new Error("Cloudinary upload failed");
    }
};
