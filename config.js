// ==========================================
// 🎛️ SWYBE - MASTER CONFIG
// ==========================================

const CONFIG = {
  
  // ===== BACKEND =====
  backend: {
    scriptUrl: "https://script.google.com/macros/s/AKfycbykj3nN7s1C4eviFOiQVwK4w_kPZHuo0kcwmj9_fVGQIoLnjZOQ93WAYKFK04wrGBY-2w/exec"
  },
  
  // ===== VIDEO =====
  video: {
    baseUrl: "videos/",
    autoPlay: true,
    muted: true,
    loop: true,
    minWatchTimeForView: 3,
    watchTimeMilestones: [3, 10, 30, 60]
  },
  
  // ===== FEATURES =====
  features: {
    reels: true,
    feed: true,
    stories: true,
    login: true,
    comments: true,
    likes: true,
    bookmarks: true,
    share: true,
    search: true,
    upload: false,
    profile: true
  },
  
  // ===== UI =====
  ui: {
    theme: "dark",
    primaryColor: "#FF0055",
    showLoginButton: true
  },
  
  // ===== FIREBASE =====
  firebase: {
    enabled: true
  },
  
  // ===== ANALYTICS =====
  analytics: {
    trackWatchTime: true,
    trackTrafficSource: true,
    trackDeviceType: true,
    trackSessionId: true,
    sessionTimeout: 30
  },
  
  // ===== APP INFO =====
  app: {
    name: "Swybe",
    tagline: "Learn from Toppers & Peers",
    version: "1.0.0"
  }
};

Object.freeze(CONFIG);
