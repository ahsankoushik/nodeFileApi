

export const PORT = process.env.PORT || 3000;
export const FOLDER = process.env.FOLDER || "./staic/";
export const PROVIDER = process.env.PROVIDER || "local";
export const DAYS_TO_KEEP = parseInt(process.env.DAYS_TO_KEEP || "7");

// TODO :: changed mb to gb change it later to mb
// upload limit in mb bytes
export const UPLOAD_LIMIT = parseInt(process.env.UPLOAD_LIMIT || 1) * 1024 * 1024 * 1024;
export const DOWNLOAD_LIMIT = parseInt(process.env.DOWNLOAD_LIMIT || 1) * 1024 * 1024 *1024;

// for google cloud provider
export const CONFIG = process.env.CONFIG || "./api_keys/service_account.json" ;
export const BUCKET = process.env.BUCKET || "node_file_api";

// external db etc
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// modes
export const NODE_ENV = process.env.NODE_ENV || "dev";
