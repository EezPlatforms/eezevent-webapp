const storageKey = "eezevent-vendor-search";

export const vendorSearchUrl = (zipcode, types = ["all"]) => {
  const params = new URLSearchParams();
  if (zipcode) params.set("zipcode", zipcode);
  for (const type of types) if (type !== "all") params.append("type", type);
  return `/search-vendors${params.size ? `?${params}` : ""}`;
};

export const safeVendorSearchUrl = value => {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, "https://eezevent.com");
    if (url.origin !== "https://eezevent.com" || url.pathname !== "/search-vendors") return null;
    return `${url.pathname}${url.search}`;
  } catch { return null; }
};

export const saveVendorSearch = snapshot => {
  try { sessionStorage.setItem(storageKey, JSON.stringify(snapshot)); } catch { /* URL-based restoration remains available. */ }
};

export const readVendorSearch = zipcode => {
  try {
    const snapshot = JSON.parse(sessionStorage.getItem(storageKey));
    return snapshot?.zipcode === zipcode && Array.isArray(snapshot.results) ? snapshot : null;
  } catch { return null; }
};
