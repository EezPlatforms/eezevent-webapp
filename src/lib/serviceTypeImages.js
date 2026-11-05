import audioVisualImage from "../../assets/service-types/AUDIO_VISUAL_SERVICES.jpg";
import bartendingImage from "../../assets/service-types/BARTENDING_SERVICES.jpg";
import cakeDesignersImage from "../../assets/service-types/CAKE_DESIGNERS.jpg";
import cateringImage from "../../assets/service-types/CATERING.jpg";
import cleanersImage from "../../assets/service-types/CLEANERS.jpg";
import decoratorsImage from "../../assets/service-types/DECORATORS.jpg";
import djServicesImage from "../../assets/service-types/DJ_SERVICES.jpg";
import eventPlannersImage from "../../assets/service-types/EVENT_PLANNERS.jpg";
import floristsImage from "../../assets/service-types/FLORISTS.jpg";
import furnitureRentalsImage from "../../assets/service-types/FURNITURE_RENTALS.avif";
import hairStylistsImage from "../../assets/service-types/HAIR_STYLISTS.jpg";
import lightingImage from "../../assets/service-types/LIGHTING.jpg";
import makeupArtistsImage from "../../assets/service-types/MAKEUP_ARTISTS.webp";
import photographyImage from "../../assets/service-types/PHOTOGRAPHY.jpg";
import securityImage from "../../assets/service-types/SECURITY.jpg";
import transportationImage from "../../assets/service-types/TRANSPORTATION.jpg";
import valetServicesImage from "../../assets/service-types/VALET_SERVICES.jpg";
import venueRentalsImage from "../../assets/service-types/VENUE_RENTALS.jpg";
import defaultServiceImage from "../../assets/service-types/default_service.jpg";

const serviceTypeImages = {
  AUDIO_VISUAL_SERVICES: audioVisualImage.src,
  BARTENDING_SERVICES: bartendingImage.src,
  CAKE_DESIGNERS: cakeDesignersImage.src,
  CATERING: cateringImage.src,
  CLEANERS: cleanersImage.src,
  DECORATORS: decoratorsImage.src,
  DJ_SERVICES: djServicesImage.src,
  EVENT_PLANNERS: eventPlannersImage.src,
  FLORISTS: floristsImage.src,
  FURNITURE_RENTALS: furnitureRentalsImage.src,
  HAIR_STYLISTS: hairStylistsImage.src,
  LIGHTING: lightingImage.src,
  MAKEUP_ARTISTS: makeupArtistsImage.src,
  PHOTOGRAPHY: photographyImage.src,
  SECURITY: securityImage.src,
  TRANSPORTATION: transportationImage.src,
  VALET_SERVICES: valetServicesImage.src,
  VENUE_RENTALS: venueRentalsImage.src,
};

export const normalizeServiceTypeKey = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

export const getServiceTypeImage = (value) =>
  serviceTypeImages[normalizeServiceTypeKey(value)] || defaultServiceImage.src;
