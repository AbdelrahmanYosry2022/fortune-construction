// Constants for the entire site -- single source of truth
const ADDRESS = 'Area 4, Lilongwe, Malawi'

export const SITE = {
    name: 'Fortune Construction',
    tagline: "Malawi's premier construction company since 2004.",
    // Phone and email are shown only when set in the dashboard's Site Settings.
    // Left empty on purpose: never put a placeholder number or email here.
    phone: '',
    phoneHref: '',
    email: '',
    emailHref: '',
    address: ADDRESS,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
    workingHours: 'Mon - Fri: 7:30am - 5:00pm',
    foundedYear: 2004,
}

export const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Services', href: '/services' },
    { label: 'HSE & Quality', href: '/hse' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
]

// Real photos of the Lunzu Rural Training Centre site. Shown as the home hero slideshow
// unless the Home page content sets its own background media.
export const HERO_IMAGES = [
    '/assets/images/site/lunzu-01.webp',
    '/assets/images/site/lunzu-02.webp',
    '/assets/images/site/lunzu-03.webp',
    '/assets/images/site/lunzu-04.webp',
]
