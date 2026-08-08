import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ForestRoundedIcon from "@mui/icons-material/ForestRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import LaptopMacRoundedIcon from "@mui/icons-material/LaptopMacRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import SlideshowRoundedIcon from "@mui/icons-material/SlideshowRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import SportsGymnasticsRoundedIcon from "@mui/icons-material/SportsGymnasticsRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TempleBuddhistRoundedIcon from "@mui/icons-material/TempleBuddhistRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";

const eventTypeIcons = {
  ANNIVERSARY: FavoriteBorderRoundedIcon,
  BABY_SHOWER: CelebrationRoundedIcon,
  BIRTHDAY: CelebrationRoundedIcon,
  BRIDAL_SHOWER: VolunteerActivismRoundedIcon,
  CEREMONY: TempleBuddhistRoundedIcon,
  COMPETITION: WorkspacePremiumRoundedIcon,
  CONFERENCE: BusinessRoundedIcon,
  ENGAGEMENT: FavoriteBorderRoundedIcon,
  EXPO: WorkspacesRoundedIcon,
  FAREWELL: HandshakeRoundedIcon,
  FESTIVAL: TipsAndUpdatesRoundedIcon,
  GRADUATION: SchoolRoundedIcon,
  MEETUP: Diversity3RoundedIcon,
  NETWORKING: ShareRoundedIcon,
  OTHER: MoreHorizRoundedIcon,
  PARTY: CelebrationRoundedIcon,
  PROM: StarRoundedIcon,
  RETREAT: ForestRoundedIcon,
  REUNION: Diversity3RoundedIcon,
  SEMINAR: SlideshowRoundedIcon,
  SOCIAL: ChatRoundedIcon,
  TRAINING: SportsGymnasticsRoundedIcon,
  WEBINAR: LaptopMacRoundedIcon,
  WEDDING: SpaRoundedIcon,
  WORKSHOP: ConstructionRoundedIcon,
  DEFAULT: CalendarMonthRoundedIcon,
};

const normalizeEventType = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

export function getEventTypeIcon(eventType) {
  const key = normalizeEventType(eventType);
  return eventTypeIcons[key] || eventTypeIcons.DEFAULT;
}
