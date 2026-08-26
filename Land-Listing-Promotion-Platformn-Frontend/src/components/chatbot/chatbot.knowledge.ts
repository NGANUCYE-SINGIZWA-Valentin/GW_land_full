// ─────────────────────────────────────────────────────────────────────────────
// CHATBOT KNOWLEDGE BASE
// Add new FAQs by appending to the `FAQ_ENTRIES` array.
// Each entry has: keywords (for matching), answer, and optional link.
// ─────────────────────────────────────────────────────────────────────────────

export interface FaqEntry {
  id: string;
  keywords: string[];
  answer: string;
  link?: { label: string; href: string };
}

export interface PageContext {
  path: string;
  label: string;
  description: string;
}

// ── Page context map ──────────────────────────────────────────────────────────
export const PAGE_CONTEXTS: PageContext[] = [
  {
    path: '/',
    label: 'Home',
    description: "You're on the Home page — browse featured and latest property listings in Rwanda.",
  },
  {
    path: '/properties',
    label: 'Properties',
    description: "You're on the Properties page — search, filter, and explore all available listings.",
  },
  {
    path: '/login',
    label: 'Login',
    description: "You're on the Login page — sign in to access your dashboard.",
  },
  {
    path: '/register',
    label: 'Register',
    description: "You're on the Register page — create a new account to post or manage listings.",
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    description: "You're on the Dashboard — manage your listings, inquiries, and account settings.",
  },
  {
    path: '/dashboard/properties/new',
    label: 'Add Property',
    description: "You're on the Add Property page — fill in the form to post a new listing.",
  },
  {
    path: '/admin/properties',
    label: 'Property Management',
    description: "You're on the Property Management page — view, edit, or delete your listings.",
  },
  {
    path: '/seller/inquiries',
    label: 'Inquiries',
    description: "You're on the Inquiries page — view messages from potential buyers.",
  },
  {
    path: '/seller/pricing',
    label: 'Pricing',
    description: "You're on the Pricing page — choose a plan to promote your listings.",
  },
];

// ── Suggested quick questions ─────────────────────────────────────────────────
export const SUGGESTED_QUESTIONS = [
  'What is this website about?',
  'How do I register?',
  'How do I log in?',
  'Show me available properties.',
  'How do I post a listing?',
  'How do I search for a property?',
  'How do I contact support?',
  'What types of properties are available?',
];

// ── FAQ knowledge base ────────────────────────────────────────────────────────
export const FAQ_ENTRIES: FaqEntry[] = [
  // ── About ──
  {
    id: 'about',
    keywords: ['about', 'what is', 'what does', 'platform', 'site', 'website', 'purpose', 'overview', 'tell me about', 'explain'],
    answer:
      '🏡 **GW Land** is a premier real estate listing platform in Rwanda.\n\nWe connect property buyers, sellers, and investors across Kigali and beyond. You can browse verified listings, filter by type and budget, view property details, and contact agents directly.\n\nWhether you\'re looking for a home, villa, apartment, office space, or investment land — we\'ve got you covered.',
  },
  // ── Register ──
  {
    id: 'register',
    keywords: ['register', 'sign up', 'create account', 'new account', 'join', 'get started'],
    answer:
      '📝 **To register:**\n\n1. Click the **"Post a Listing"** button in the top navigation.\n2. You\'ll be taken to the Register page.\n3. Fill in your name, email, and password.\n4. Submit the form to create your account.\n\nOnce registered, you can post listings, manage inquiries, and access your dashboard.',
    link: { label: 'Go to Register', href: '/register' },
  },
  // ── Login ──
  {
    id: 'login',
    keywords: ['login', 'log in', 'sign in', 'access account', 'my account'],
    answer:
      '🔐 **To log in:**\n\n1. Click **"Post a Listing"** or go to the Login page.\n2. Enter your email and password.\n3. Click **"Sign In"**.\n\nYou\'ll be redirected to your dashboard after a successful login.',
    link: { label: 'Go to Login', href: '/login' },
  },
  // ── Properties / Browse ──
  {
    id: 'properties',
    keywords: ['properties', 'listings', 'browse', 'available', 'show me', 'find property', 'explore', 'all properties'],
    answer:
      '🏘️ **Browse all properties** on our Properties page.\n\nYou can:\n• Filter by type (Villa, Apartment, Townhouse, etc.)\n• Set a budget range\n• Filter by number of bedrooms\n• Search by title, location, or description\n• View results on an interactive map',
    link: { label: 'Browse Properties', href: '/properties' },
  },
  // ── Property types ──
  {
    id: 'property-types',
    keywords: ['types', 'categories', 'kind of property', 'what types', 'townhouse', 'apartment', 'villa', 'bungalow', 'penthouse', 'farmhouse', 'studio', 'office', 'retail', 'warehouse'],
    answer:
      '🏠 **Available property types:**\n\n• Townhouses\n• Apartments\n• Bungalows\n• Penthouses\n• Farmhouses\n• Villas\n• Studios\n• Office Spaces\n• Retail Shops\n• Warehouses\n\nUse the category chips on the Properties page to filter by type.',
    link: { label: 'View All Types', href: '/properties' },
  },
  // ── Search ──
  {
    id: 'search',
    keywords: ['search', 'find', 'filter', 'how to search', 'look for', 'query'],
    answer:
      '🔍 **How to search for a property:**\n\n1. Go to the **Properties** page.\n2. Use the **search bar** at the top to type a title, location, or description.\n3. Use the **category chips** to filter by property type.\n4. Click **Filter** to set a budget or minimum bedrooms.\n5. Results update in real time as you type.',
    link: { label: 'Search Properties', href: '/properties' },
  },
  // ── Post a listing ──
  {
    id: 'post-listing',
    keywords: ['post', 'add listing', 'add property', 'sell', 'list my property', 'upload', 'new listing', 'create listing'],
    answer:
      '📋 **To post a listing:**\n\n1. Log in to your account.\n2. Go to your **Dashboard**.\n3. Click **"Add New Property"**.\n4. Fill in the property details (title, price, location, images, etc.).\n5. Submit — your listing will be live immediately.',
    link: { label: 'Add Property', href: '/dashboard/properties/new' },
  },
  // ── Dashboard ──
  {
    id: 'dashboard',
    keywords: ['dashboard', 'my account', 'manage', 'account', 'admin', 'panel'],
    answer:
      '📊 **Your Dashboard** lets you:\n\n• View and manage your property listings\n• Track buyer inquiries\n• Add new properties\n• Choose a promotion plan\n• Monitor your account activity',
    link: { label: 'Go to Dashboard', href: '/dashboard' },
  },
  // ── Contact ──
  {
    id: 'contact',
    keywords: ['contact', 'support', 'help', 'reach', 'email', 'phone', 'whatsapp', 'agent', 'talk to someone'],
    answer:
      '📞 **Contact & Support:**\n\nYou can contact a listing agent directly from any property detail page:\n• 📱 Call or WhatsApp the agent\n• 📧 Send an email\n• 📅 Schedule a tour using the form on the property page\n\nFor general support, reach out via the contact details listed on each property.',
  },
  // ── Featured listings ──
  {
    id: 'featured',
    keywords: ['featured', 'top listings', 'best properties', 'highlighted'],
    answer:
      '⭐ **Featured Listings** are hand-picked, verified properties highlighted on the homepage.\n\nThey represent the best available options in terms of value, location, and quality. You can browse all featured listings on the homepage or filter by "FEATURED" tag on the Properties page.',
    link: { label: 'View Featured', href: '/properties?tag=FEATURED' },
  },
  // ── New listings ──
  {
    id: 'new-listings',
    keywords: ['new', 'latest', 'recent', 'newest', 'just added'],
    answer:
      '🆕 **Latest Listings** are the most recently added properties on the platform.\n\nCheck the "Latest" section on the homepage or filter by "NEW" on the Properties page to see what\'s just been added.',
    link: { label: 'View Latest', href: '/properties?tag=NEW' },
  },
  // ── Pricing / Plans ──
  {
    id: 'pricing',
    keywords: ['pricing', 'plan', 'cost', 'fee', 'subscription', 'promote', 'paid', 'free'],
    answer:
      '💰 **Listing Plans:**\n\nWe offer different plans to promote your listings and reach more buyers. Visit the Pricing page from your dashboard to see available options and choose the plan that fits your needs.',
    link: { label: 'View Pricing', href: '/seller/pricing' },
  },
  // ── Inquiries ──
  {
    id: 'inquiries',
    keywords: ['inquiry', 'inquiries', 'messages', 'buyer message', 'leads', 'interested buyers'],
    answer:
      '💬 **Inquiries** are messages sent by potential buyers interested in your listings.\n\nYou can view and manage all inquiries from the **Seller Inquiries** page in your dashboard.',
    link: { label: 'View Inquiries', href: '/seller/inquiries' },
  },
  // ── Privacy ──
  {
    id: 'privacy',
    keywords: ['privacy', 'data', 'personal information', 'gdpr', 'privacy policy'],
    answer:
      '🔒 **Privacy Policy:**\n\nWe take your privacy seriously. Your personal data is used only to provide our services and is never sold to third parties. All data is stored securely.\n\nFor full details, please refer to our Privacy Policy document.',
  },
  // ── Terms ──
  {
    id: 'terms',
    keywords: ['terms', 'conditions', 'terms of service', 'tos', 'rules', 'agreement'],
    answer:
      '📄 **Terms of Service:**\n\nBy using GW Land, you agree to our terms which include:\n• Accurate listing information\n• No fraudulent activity\n• Respectful communication\n\nPlease review our full Terms of Service for complete details.',
  },
  // ── Map ──
  {
    id: 'map',
    keywords: ['map', 'location', 'where', 'kigali', 'rwanda', 'area', 'neighborhood'],
    answer:
      '🗺️ **Interactive Map:**\n\nEvery property listing includes an interactive map showing its exact location. On the Properties page, you can also view all filtered results on a map panel to compare locations at a glance.',
    link: { label: 'View on Map', href: '/properties' },
  },
  // ── Password reset ──
  {
    id: 'password',
    keywords: ['password', 'forgot password', 'reset password', 'change password', 'lost password'],
    answer:
      '🔑 **Forgot your password?**\n\nOn the Login page, click **"Forgot Password"** and enter your email address. You\'ll receive a reset link to create a new password.',
    link: { label: 'Go to Login', href: '/login' },
  },
];

// ── Welcome message ───────────────────────────────────────────────────────────
export const WELCOME_MESSAGE = `Hello! 👋 Welcome to **GW Land**.

I'm your Website Assistant.

I can help you:
• Understand what this website does
• Navigate different pages
• Find and filter properties
• Explain available services
• Answer frequently asked questions
• Guide you through common tasks

Ask me anything!`;

// ── Fallback message ──────────────────────────────────────────────────────────
export const FALLBACK_MESSAGE =
  "I'm sorry, I couldn't find information about that. 🤔\n\nTry asking about:\n• Properties & listings\n• How to register or log in\n• How to post a listing\n• Contact & support\n\nOr contact our support team directly from any property page.";
