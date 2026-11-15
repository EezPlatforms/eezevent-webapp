// Main service photos are stored separately from additional portfolio photos.
export const buildProfileImages = (service, portfolio = []) => {
  const mainUrl = service?.main_image_url;
  if (!mainUrl) return portfolio;
  return [
    { id: 'main', url: mainUrl, title: service.name || 'Service main image', is_main: true },
    ...portfolio.filter(image => image.url !== mainUrl),
  ];
};
