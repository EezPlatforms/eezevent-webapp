export const validateGalleryImage = file => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use a JPG, PNG, or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Images must be 5 MB or smaller.');
};
export const uploadGalleryBatch = async (entries, upload, onProgress = () => {}) => {
  const failed = [];
  let uploaded = 0;
  for (const [index, entry] of entries.entries()) {
    onProgress(index + 1, entries.length);
    try {
      validateGalleryImage(entry.file);
      await upload(entry.file, entry.caption || '');
      uploaded++;
    } catch (error) { failed.push({ ...entry, error: error.message || 'Upload failed. Please retry.' }); }
  }
  return { uploaded, failed };
};
