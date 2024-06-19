
let SERVER_URL;

if (typeof import.meta !== 'undefined' && import.meta.env) {
  SERVER_URL = import.meta.env.VITE_SERVER_URL;
} else {
  SERVER_URL = process.env.VITE_SERVER_URL || "http://localhost:5000";
}

const config = {
    DOCS_URL:"https://annotate-docs.dwaste.live/",
    SERVER_URL,
    UPLOAD_LIMIT: 5,
    OUTLINE_THICKNESS_CONFIG : {
      POLYGON: 2,
      CIRCLE: 2,
      BOUNDING_BOX: 2
    }
  };
  
export default config;
