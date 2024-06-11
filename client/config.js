
let VITE_SERVER_URL;

if (typeof import.meta !== 'undefined' && import.meta.env) {
  VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
} else {
  VITE_SERVER_URL = process.env.VITE_SERVER_URL || "http://localhost:5000";
}

const config = {
    DEMO_SITE_URL:"https://annotate-docs.dwaste.live/",
    VITE_SERVER_URL
  };
  
export default config;
  