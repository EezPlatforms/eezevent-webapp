import workspaceImage from "../../assets/launch-workspace.jpg";
import pipelineImage from "../../assets/launch-pipeline.jpg";
import vendorImage from "../../assets/launch-vendor.jpg";

export const navItems = [
  { label: "Home", to: "/" },
  { label: "My Events", to: "/events" },
  { label: "Search Vendors", to: "/search-vendors" },
  { label: "Help Guide", to: "/help" },
  { label: "Login", to: "/login" },
];

export const heroStats = [
  {
    title: "Unified Workspace",
    body: "Clients and vendors collaborate in one operational flow.",
  },
  {
    title: "Structured Pipeline",
    body: "Every inquiry moves with clear, trackable status.",
  },
  {
    title: "Launch Focus",
    body: "Early access is prioritized for active teams and vendors.",
  },
];

export const launchCards = [
  {
    title: "Unified Event Workspace",
    body: "Manage event details, service needs, and communication from a single place.",
    image: workspaceImage,
    alt: "Event planning workspace",
  },
  {
    title: "Structured Inquiry Pipeline",
    body: "Track outreach, responses, and quote progress with clear status visibility.",
    image: pipelineImage,
    alt: "Inquiry pipeline overview",
  },
  {
    title: "Vendor Collaboration Tools",
    body: "Support faster follow-ups with messaging, files, and timeline context.",
    image: vendorImage,
    alt: "Vendor collaboration",
  },
];

export const benefits = [
  {
    title: "Clear Coordination",
    body: "Consolidate messages, documents, and quote steps in a single workflow.",
  },
  {
    title: "Reliable Visibility",
    body: "Understand what is open, pending, and confirmed without spreadsheet overhead.",
  },
  {
    title: "Purpose-built Outreach",
    body: "Help vendors discover opportunities and respond with context that matters.",
  },
];

export const audiences = [
  {
    title: "Clients",
    body: "Keep outreach, quotes, documents, and booking progress visible in one place.",
  },
  {
    title: "Event planners",
    body: "Coordinate multiple services with cleaner timelines, status visibility, and fewer handoff gaps.",
  },
  {
    title: "Vendors",
    body: "Review opportunities faster, respond with context, and manage follow-up without spreadsheet overhead.",
  },
];

export const helpSections = [
  {
    id: "help-account",
    title: "1. Registering and logging in",
    intro:
      "The app supports separate client and vendor entry paths. Google sign-in is available across environments, Apple sign-in is available on iOS, and some environments may allow email/password login.",
    bullets: [
      "Choose whether you are logging in as a client or a vendor.",
      "Use Google or Apple social sign-in when offered by your build.",
      "New vendor owners create an owner profile before adding businesses.",
      "New clients create a client profile and can mark themselves as event planners.",
      "Registration requires accepting the latest legal documents before account creation completes.",
      "Push notification registration happens after successful sign-in on supported devices.",
    ],
  },
  {
    id: "help-events",
    title: "2. Creating and managing an event",
    intro:
      "Clients create events from the home area. Event planners can create events on behalf of a client by entering or looking up the client first.",
    ordered: [
      "Open the event creation screen from the client home area.",
      "Enter the event name, event type, zip code, date and time window, guest count, budget, and description.",
      "Select the service categories you expect to need for the event.",
      "Save the event to make it available for search, outreach, dashboard tracking, and inquiries.",
      "Edit the event later if plans change.",
    ],
    outro:
      "Once active inquiries exist, some event fields become restricted. The app keeps the event name, description, and service selection editable while protecting inquiry-linked details.",
  },
  {
    id: "help-search",
    title: "3. Searching vendors and sending inquiries",
    intro:
      "Vendor search is event-aware. The app uses the event location and timing to show planned matches and other available services.",
    bullets: [
      "Start from vendor search and choose the event you are shopping for.",
      "Filter by service type to narrow the result list.",
      "Open a vendor public profile to review business details, service description, capacity, pricing, photos, and catalog items.",
      "Send an inquiry directly from the vendor profile with an event and a message.",
      "Use event-specific service hints to understand which categories are commonly needed for the selected event type.",
    ],
  },
  {
    id: "help-inquiries",
    title: "4. Inquiry workflow",
    intro:
      "Each inquiry moves through a status-based workflow so clients and vendors can see exactly where the booking stands.",
    bullets: [
      "Typical statuses include Submitted, Under Review, Quote Sent, Client Responded, Quote Accepted, Contract Issued, Contract Signed, Confirmed, Completed, Cancelled, and Declined.",
      "Vendors can start review, send a quote, decline an inquiry, issue a contract, schedule work, and mark work complete.",
      "Clients can accept or decline quotes, reply with questions, sign contracts, and cancel when needed.",
      "When a client signs a contract, the app can cancel other same-service inquiries for that event to reduce duplicate bookings.",
      "Inquiry detail also shows audit history, vendor availability checks, and overlapping vendor commitments where applicable.",
    ],
  },
  {
    id: "help-dashboard",
    title: "5. Event dashboard and event home",
    intro:
      "The Event Dashboard gives clients a summary view across event activity, while Event Home is the operational entry point for a single event.",
    bullets: [
      "Review inquiries, responses, and reservation progress for one event or switch between multiple events.",
      "Jump from the dashboard into Event Home for event-specific actions.",
      "Track service category coverage and booking progress against the event plan.",
      "Use the client home screen to manage active and inactive events.",
    ],
  },
  {
    id: "help-documents",
    title: "6. Documents and uploads",
    intro:
      "Documents are managed inside the inquiry detail flow so each quote and booking keeps its files attached to the right conversation.",
    bullets: [
      "Upload files such as quotes, contracts, invoices, schedules, permits, receipts, and other supporting documents.",
      "Open and review uploaded files from the inquiry attachment list.",
      "Delete attachments when permissions allow.",
      "Registration flows also provide in-app access to the latest privacy policy, vendor agreement, and other legal documents.",
    ],
  },
  {
    id: "help-messaging",
    title: "7. Messaging and notifications",
    intro:
      "EezEvent includes two communication layers: inquiry activity notes and dedicated conversation threads.",
    bullets: [
      "Use the Messages tab to see all vendor-client conversations by event.",
      "Filter the conversation list to unread only.",
      "Open a thread to read the message history, send a new message, and automatically mark the conversation as read.",
      "Unread badge counts appear in the app navigation.",
      "Vendors also get a Notifications screen for items that need action, including unsigned contracts, unscheduled events, overdue completions, unanswered inquiries, and quotes waiting on the client.",
    ],
  },
  {
    id: "help-business",
    title: "8. Creating a business and adding a service",
    intro:
      "Vendor owners first create a business, then attach one or more services to it.",
    ordered: [
      "Register the business with name, contact details, address, and description.",
      "Open the business later to update details, manage team members, or remove the business.",
      "Add a service and choose the service type, price, service area, availability location, and social links.",
      "Optionally reuse the business address for the service.",
      "Upload service images and build a visual catalog with item names, prices, notes, and display order.",
      "Manage service-level team members separately from business-level team members.",
    ],
  },
  {
    id: "help-leads",
    title: "9. Generating leads for vendors",
    intro:
      "Lead generation appears in two ways: vendor outreach leads and client outreach history.",
    bullets: [
      "Vendors use Outreach Leads to review nearby events and send quick outreach messages to likely matches.",
      "Vendors can select one or more matching services before sending outreach.",
      "Clients can view outreach they have received and convert relevant outreach messages into inquiries by selecting services and sending a response.",
      "This makes the lead flow two-sided: vendors can prospect, and clients can convert outreach into active inquiry threads.",
    ],
  },
  {
    id: "help-calendar",
    title: "10. Calendar management",
    intro:
      "The vendor calendar is a planning view for upcoming work and inquiry-linked dates.",
    bullets: [
      "Browse the month view and select a date to see the events scheduled for that day.",
      "Open an inquiry from the calendar for direct follow-up.",
      "Use calendar access alongside notifications to spot unsigned, unscheduled, and upcoming commitments.",
    ],
  },
  {
    id: "help-reservations",
    title: "11. Reservations and confirmed work",
    intro:
      "Vendor dashboards separate open inquiry handling from confirmed work so teams can manage bookings cleanly.",
    bullets: [
      "The Reservations area focuses on confirmed and reservation-stage inquiries.",
      "Filter reservations by service and status.",
      "Open reservation entries to continue through scheduling, contracts, and completion steps.",
      "Vendor dashboards also show business-level or service-level summary stats and revenue views.",
    ],
  },
  {
    id: "help-profile",
    title: "12. Profiles, public pages, and team management",
    intro:
      "The app also includes a set of operational tools that support day-to-day account management.",
    bullets: [
      "Update personal profile details such as phone number and planner status.",
      "Maintain vendor public pages with business details, contact info, maps, photos, and catalog items.",
      "Add and remove event team members, business team members, and service team members by email.",
      "Use lookup flows to connect existing users before inviting new ones.",
      "Review legal documents in-app whenever terms or agreements need to be referenced again.",
    ],
  },
];
