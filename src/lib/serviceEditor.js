export const isVenueService = type => type === 'VENUE_RENTALS';
export const changeServiceType = (form, type) => type === form.type ? form : {
  ...form, type, specialty_ids: [], capacity: '',
};
export const serviceEditorPayload = (form, businessId) => ({
  ...form,
  business_id: Number(businessId),
  specialty_ids: form.specialty_ids || [],
  capacity: isVenueService(form.type) && form.capacity !== '' && form.capacity != null
    ? Number(form.capacity) : null,
});
