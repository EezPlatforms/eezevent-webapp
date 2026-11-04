export const vendorProfilePath = service => `/vendors/${encodeURIComponent(service?.slug || service?.service_id || "")}`;
export const validServiceReference = value => typeof value === "string" && value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
