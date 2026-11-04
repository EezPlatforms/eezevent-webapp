export const formatPrice = value => {
  const price = String(value ?? "").trim();
  if (!price) return "";
  // Preserve currency labels and vendor-written pricing descriptions.
  if (!/^[\d,.\s+–—-]+$/.test(price)) return price;
  return price.replace(/\d[\d,]*(?:\.\d+)?/g, amount =>
    `$${Number(amount.replaceAll(",", "")).toLocaleString("en-US", {
      minimumFractionDigits: amount.includes(".") ? amount.split(".")[1].length : 0,
      maximumFractionDigits: 20,
    })}`
  );
};
