const addressFields = ['street', 'street2', 'city', 'state', 'zip'];
export const businessServiceAddress = business => Object.fromEntries(addressFields.map(key => [`service_${key}`, business?.[key] || '']));
export const matchesBusinessAddress = (service, business) => addressFields.every(key =>
  String(service?.[`service_${key}`] || '').trim().toLowerCase() === String(business?.[key] || '').trim().toLowerCase());
export const serviceAreaError = (area, serviceZip) => {
  const zip = area.zip_code ?? serviceZip ?? '';
  const radius = String(area.radius_miles ?? 50);
  return !/^\d{5}$/.test(zip) || !radius.trim() || !Number.isFinite(Number(radius)) || Number(radius) < 0 || Number(radius) > 500
    ? 'Enter a five-digit service area ZIP and a radius from 0 to 500 miles.' : '';
};
export const serviceAreaPayload = (area, serviceZip) => ({
  zip_code: area.zip_code ?? serviceZip ?? '',
  radius_miles: Number(area.radius_miles ?? 50),
  travel_available: true,
  ...(area.latitude != null && area.longitude != null ? { latitude: area.latitude, longitude: area.longitude } : {}),
});
