import { isSocialOnlyAuth } from "./authMode.js";
const rawBaseUrl = String(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : ""),
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const apiBaseUrl = rawBaseUrl;
const AUTH_STORAGE_KEY = "eezevent.web.auth";

const withBaseUrl = (path) => `${apiBaseUrl}${path}`;

const toJson = async (response) => {
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      detail = payload?.detail || detail;
    } catch {
      // Keep the generic message when the error payload is not JSON.
    }
    const error = new Error(typeof detail === "string" ? detail : "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return response.json();
};

export const getStoredAuth = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const buildHeaders = (headers = {}) => {
  const nextHeaders = new Headers(headers);
  const token = getStoredAuth()?.token;
  if (token && !nextHeaders.has("Authorization")) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }
  return nextHeaders;
};

const requestJson = async (path, options = {}) =>
  toJson(
    await fetch(withBaseUrl(path), {
      credentials: "include",
      ...options,
      headers: buildHeaders(options.headers),
    }),
  );

const requestEmailAuth = async (path, options) => {
  if (isSocialOnlyAuth) throw new Error("Email/password and email-code authentication is disabled. Please use social sign-in.");
  return requestJson(path, options);
};

export const normalizeAssetUrl = (url) => {
  if (!url) return "";

  let trimmed = String(url).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return withBaseUrl(trimmed);

  try {
    const parsed = new URL(trimmed);
    const isPresigned =
      parsed.searchParams.has("X-Amz-Algorithm") ||
      parsed.searchParams.has("X-Amz-Signature") ||
      parsed.searchParams.has("AWSAccessKeyId") ||
      parsed.searchParams.has("Signature");

    if (isPresigned || !apiBaseUrl) {
      return parsed.toString();
    }

    if (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") {
      const base = new URL(apiBaseUrl);
      parsed.hostname = base.hostname;
      parsed.protocol = base.protocol;
      if (base.port) {
        parsed.port = base.port;
      }
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
};

export const loginClient = async (email, password) =>
  requestEmailAuth("/clients/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

export const loginVendor = async (email, password) =>
  requestEmailAuth("/business/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

export const validateClientEmail = async (email, code) =>
  requestEmailAuth("/clients/validate_email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

export const validateBusinessEmail = async (email, code) =>
  requestEmailAuth("/business/validate_email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

export const resendClientEmailCode = async (email) =>
  requestEmailAuth("/clients/resend_email_code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

export const resendBusinessEmailCode = async (email) =>
  requestEmailAuth("/business/resend_email_code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

export const logoutClient = async () =>
  requestJson("/clients/logout", {
    method: "POST",
  });

export const logoutVendor = async () =>
  requestJson("/business/logout", {
    method: "POST",
  });

export const loginWithGoogle = async ({ idToken, userType, clientPlatform = "web" }) =>
  requestJson("/auth/google/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: idToken,
      provider: "google",
      user_type: userType,
      client_platform: clientPlatform,
    }),
  });

export const fetchServiceTypes = async () => requestJson("/business/service-types");

export const fetchServicesByZipcode = async (zipcode) => {
  if (!zipcode) return [];

  return requestJson(`/business/services_by_zipcode/${encodeURIComponent(zipcode)}`);
};

// Match mobile discovery: pages contain matching services with business context.
export const fetchVendorSearch = async (zipcode, { page = 1, pageSize = 20, category, search } = {}) => {
  const params = new URLSearchParams({ zip_code: zipcode, page: String(page), page_size: String(pageSize), sort: "distance" });
  if (category && category !== "all") params.set("category_id", category);
  if (search) params.set("search", search);
  const data = await requestJson(`/api/v1/vendors/search?${params}`);
  const items = (data.results || []).flatMap(vendor => (vendor.services || []).map(service => ({
    ...vendor,
    service: { ...service, main_image_url: normalizeAssetUrl(service.main_image_url) },
    business: { business_id: vendor.business_id, business_name: vendor.business_name, city: vendor.city, state: vendor.state },
    distance_miles: service.distance_miles ?? vendor.distance_miles,
  })));
  return { items, page: data.page ?? page, hasMore: Boolean(data.has_more), total: data.total ?? items.length };
};

export const fetchPublicServiceProfile = async (serviceId) => {
  if (!serviceId) return null;

  return requestJson(`/business/public/service/${serviceId}`);
};

export const fetchServiceImages = async (serviceId) => {
  if (!serviceId) return [];

  const items = await requestJson(`/business/service/${serviceId}/images`);

  return Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        url: normalizeAssetUrl(item?.url),
      }))
    : [];
};

export const fetchServiceCatalogItems = async (serviceId) => {
  if (!serviceId) return [];

  const items = await requestJson(`/business/service/${serviceId}/catalog-items`);

  return Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        url: normalizeAssetUrl(item?.url),
      }))
    : [];
};

export const fetchClientEvents = async (options = {}) => {
  const params = new URLSearchParams();

  if (options.includeInactive) {
    params.set("include_inactive", "true");
  }

  if (options.includeTeam !== false) {
    params.set("include_team", "true");
  }

  const query = params.toString();
  const items = await requestJson(`/events/list_events${query ? `?${query}` : ""}`, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  return Array.isArray(items) ? items : [];
};

export const fetchEventTypes = async () => {
  const payload = await requestJson("/events/types");
  return Array.isArray(payload?.event_types) ? payload.event_types : [];
};

export const fetchClientByEmail = async (email) => {
  if (!email) {
    throw new Error("Missing email.");
  }

  return requestJson(`/clients/get_client_by_email/${encodeURIComponent(email)}`);
};

export const createClientEvent = async (payload) =>
  requestJson("/events/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const createPlannerEventForClient = async (payload) =>
  requestJson("/events/planner/create_for_client", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });


// Existing reviews endpoint used by eezevent-mobileapp/src/api/reviews.js.
export const fetchVendorReviews = async (serviceId, { limit = 5, offset = 0 } = {}) => {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const data = await requestJson(`/reviews/services/${encodeURIComponent(serviceId)}?${params}`);
  return {
    reviews: (data?.reviews || []).map(review => ({
      id: review.review_id,
      rating: review.rating,
      comment: review.comment,
      authorName: review.author_name,
      createdAt: review.created_at,
      vendorResponse: review.vendor_response,
      vendorResponseUpdatedAt: review.vendor_response_updated_at,
    })),
    reviewCount: data?.review_count || 0,
    averageRating: data?.average_rating ?? null,
  };
};

export const fetchLegalDocument = key => requestJson(`/legal/documents/${encodeURIComponent(key)}`);

export const registerAccount = (accountType, payload) => requestEmailAuth(
  accountType === "vendor" ? "/business/register_business_owner" : "/clients/save_client",
  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
);

export const registerWithGoogle = payload => requestJson("/auth/google/register", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...payload, provider: "google", client_platform: "web" }),
});

export const sendVendorInquiry = async ({ serviceId, eventId, message }) => {
  if (!/^\d+$/.test(String(serviceId)) || !/^\d+$/.test(String(eventId))) throw new Error("Select a vendor and event before sending an inquiry.");
  return requestJson("/inquiries/v2/inquiries", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vendor_id: Number(serviceId), event_id: Number(eventId), message: String(message || "").trim() }),
  });
};

export const loginWithApple = ({ idToken, userType }) => requestJson("/auth/apple/login", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id_token: idToken, provider: "apple", user_type: userType, client_platform: "web" }),
});

export const registerWithApple = payload => requestJson("/auth/apple/register", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...payload, provider: "apple", client_platform: "web" }),
});

export const getHostInvitation = (eventId) => requestJson(`/invitations/events/${eventId}`);
export const uploadInvitationImage = (eventId, file) => {
  const body = new FormData(); body.append('file', file);
  return requestJson(`/invitations/events/${eventId}/image`, { method: 'POST', body });
};
export const getPublicInvitation = (token) => requestJson(`/invitations/${encodeURIComponent(token)}`);
export const submitInvitationRSVP = (token, payload) => requestJson(`/invitations/${encodeURIComponent(token)}/rsvp`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
});
