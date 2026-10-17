const CONFIG = {
  backend: {
    // Tumhara naya Apps Script URL
    scriptUrl: "https://script.google.com/macros/s/AKfycbz-9zmyhAZ8whf_aN9hvuPWV0-HDRVZBMQ5RL4MTjBILHhTLD_lU0iMXz3tsOS2a0IP/exec"
  },
  video: {
    baseUrl: "videos/", 
    autoPlay: true,
    muted: true,
    loop: true,
    minWatchTimeForView: 3
  },
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
    upload: true,
    profile: true
  },
  ui: {
    theme: "dark",
    primaryColor: "#FF0055"
  },
  firebase: {
    enabled: true
  },
  app: {
    name: "Swybe",
    tagline: "Learn from Toppers & Peers",
    version: "1.0.0"
  }
};

Object.freeze(CONFIG);
