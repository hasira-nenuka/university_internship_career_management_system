const API_BASE = "http://localhost:5000";

export const resolveUploadUrl = (value) => {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalized = String(value).replace(/\\/g, "/").replace(/^\/+/, "");

  if (normalized.startsWith("uploads/") || normalized.startsWith("upload/")) {
    return `${API_BASE}/${normalized}`;
  }

  return `${API_BASE}/upload/${normalized}`;
};
