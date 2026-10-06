from __future__ import annotations

import math
from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "design-concepts" / "redesign-2026"
PNG_DIR = OUT / "png"
REPORT_DIR = OUT / "report"
LOGO = ROOT / "public" / "Logo-new-01.png"

NAVY = (8, 32, 72)
NAVY_DARK = (3, 11, 22)
NAVY_SOFT = (20, 45, 82)
TEAL = (16, 192, 184)
TEAL_DARK = (13, 148, 136)
BG = (246, 249, 252)
CARD = (255, 255, 255)
SLATE = (89, 107, 130)
SLATE_DARK = (26, 38, 55)
BORDER = (222, 229, 237)
GOLD = (194, 143, 63)
ORANGE = (234, 114, 63)
INK = (12, 20, 32)


SITE_PAGES = [
    {
        "slug": "site-01-home",
        "title": "Crafting Visionary Infrastructure.",
        "eyebrow": "Home",
        "summary": "World-class civil engineering across Malawi, with a calmer premium homepage and stronger project proof.",
        "sections": ["Hero", "Impact Metrics", "Services", "About Teaser", "Featured Portfolio", "Partners", "CTA"],
        "hero": "Malawi's premier construction company since 2004.",
    },
    {
        "slug": "site-02-about",
        "title": "Building Malawi's Future With Precision",
        "eyebrow": "About",
        "summary": "A heritage-led page with mission, values, leadership proof, and process blocks kept intact.",
        "sections": ["Page Hero", "Company Story", "Mission & Values", "Timeline", "Leadership", "Partners"],
        "hero": "Engineering mastery, safety, and national-scale delivery.",
    },
    {
        "slug": "site-03-projects",
        "title": "Featured Portfolio",
        "eyebrow": "Projects",
        "summary": "A sharper portfolio experience with filters, stats, project cards, and map context.",
        "sections": ["Page Hero", "Portfolio Stats", "Filters", "Project Grid", "Map", "Case Study CTA"],
        "hero": "Proven performance across roads, housing, commercial, and infrastructure.",
    },
    {
        "slug": "site-04-project-details",
        "title": "Project Case Study",
        "eyebrow": "Project Details",
        "summary": "A case-study layout with strong hero media, project facts, gallery, scope, and outcomes.",
        "sections": ["Hero", "Fact Cards", "Overview", "Gallery", "Scope", "Results", "Related CTA"],
        "hero": "A premium detail page for proof, not decoration.",
    },
    {
        "slug": "site-05-hse-quality",
        "title": "HSE & Quality",
        "eyebrow": "Safety",
        "summary": "A trust-first page around safety systems, quality standards, certifications, and culture.",
        "sections": ["Page Hero", "Safety Promise", "Quality Metrics", "Standards", "Process", "CTA"],
        "hero": "Safety-first delivery with measurable quality controls.",
    },
    {
        "slug": "site-06-careers",
        "title": "Build Your Career With Fortune",
        "eyebrow": "Careers",
        "summary": "A recruiting page with open roles, culture cards, benefits, and application flow.",
        "sections": ["Page Hero", "Why Join", "Open Roles", "Benefits", "Application Form"],
        "hero": "Join a team building durable national infrastructure.",
    },
    {
        "slug": "site-07-contact",
        "title": "Start A Serious Build Conversation",
        "eyebrow": "Contact",
        "summary": "A focused contact page with form, contact details, map area, and business hours.",
        "sections": ["Page Hero", "Contact Form", "Contact Info", "Map", "Office Hours"],
        "hero": "Clear routes to inquiries, careers, and project conversations.",
    },
]


DASH_PAGES = [
    ("dashboard-01-login", "Login", "Secure admin entry with brand confidence and clean access panel."),
    ("dashboard-02-overview", "Overview", "KPI cards, unread activity, recent projects, and quick admin actions."),
    ("dashboard-03-projects", "Projects", "Project table, status filters, media previews, and edit actions."),
    ("dashboard-04-services", "Services", "Service management cards with order, status, and quick edit affordances."),
    ("dashboard-05-team", "Team", "Team directory table with roles, images, and publishing controls."),
    ("dashboard-06-partners", "Partners", "Partner logo management with grid previews and concise metadata."),
    ("dashboard-07-jobs", "Job Positions", "Recruitment pipeline view with role status and application counts."),
    ("dashboard-08-applications", "Applications", "Candidate table, review status, CV action, and priority signals."),
    ("dashboard-09-messages", "Messages", "Inbox-style triage with unread states and contact details."),
    ("dashboard-10-page-content", "Page Content", "Content editor with page tabs, section fields, and media slots."),
    ("dashboard-11-settings", "Settings", "Company settings, contact channels, hero content, and site identity."),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


F10 = font(10)
F12 = font(12)
F13 = font(13)
F14 = font(14)
F16 = font(16)
F18 = font(18)
F20 = font(20, True)
F24 = font(24, True)
F28 = font(28, True)
F34 = font(34, True)
F44 = font(44, True)
F58 = font(58, True)


def ensure_dirs() -> None:
    PNG_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill, outline=None, width=1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def shadow_card(base: Image.Image, box: tuple[int, int, int, int], radius: int = 12, blur: int = 18) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle(box, radius=radius, fill=(8, 32, 72, 34))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)


def text(draw: ImageDraw.ImageDraw, pos: tuple[int, int], value: str, fnt, fill=INK, anchor=None) -> None:
    draw.text(pos, value, font=fnt, fill=fill, anchor=anchor)


def wrap(draw: ImageDraw.ImageDraw, value: str, fnt, width: int) -> list[str]:
    words = value.split()
    lines: list[str] = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if draw.textlength(test, font=fnt) <= width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def paragraph(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, fnt, width: int, fill=SLATE, line_h=26) -> int:
    y = xy[1]
    for line in wrap(draw, value, fnt, width):
        draw.text((xy[0], y), line, font=fnt, fill=fill)
        y += line_h
    return y


def logo_mark(draw: ImageDraw.ImageDraw, x: int, y: int, light: bool = False) -> None:
    color = TEAL if not light else (255, 255, 255)
    accent = NAVY if not light else TEAL
    draw.polygon([(x + 18, y), (x + 36, y + 18), (x + 18, y + 36), (x, y + 18)], outline=color, width=4)
    draw.line([(x + 18, y + 9), (x + 27, y + 18), (x + 18, y + 27), (x + 9, y + 18), (x + 18, y + 9)], fill=accent, width=3)


def draw_image_placeholder(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], label: str, dark=False) -> None:
    x1, y1, x2, y2 = box
    base = NAVY_SOFT if dark else (222, 231, 239)
    rounded(draw, box, 12, base)
    for i in range(0, x2 - x1, 28):
        c = (255, 255, 255, 22) if dark else (255, 255, 255, 95)
        draw.line([(x1 + i, y2), (x1 + i + 80, y1)], fill=c, width=2)
    draw.rectangle((x1, y2 - 68, x2, y2), fill=(3, 11, 22, 120) if dark else (8, 32, 72, 34))
    draw.text((x1 + 22, y2 - 44), label, font=F16, fill=(255, 255, 255) if dark else NAVY)


def pill(draw: ImageDraw.ImageDraw, x: int, y: int, label: str, fill, fg) -> int:
    w = int(draw.textlength(label, font=F12)) + 28
    rounded(draw, (x, y, x + w, y + 30), 15, fill)
    text(draw, (x + 14, y + 8), label, F12, fg)
    return w


def site_nav(draw: ImageDraw.ImageDraw, light=False) -> None:
    logo_mark(draw, 72, 38, light)
    color = (255, 255, 255) if light else NAVY
    text(draw, (118, 40), "FORTUNE", F24, color)
    text(draw, (120, 68), "CONSTRUCTION", F10, TEAL if not light else (196, 245, 242))
    x = 650
    for item in ["Home", "About", "Projects", "HSE", "Careers", "Contact"]:
        text(draw, (x, 58), item, F14, (230, 244, 246) if light else SLATE_DARK)
        x += 92
    rounded(draw, (1205, 38, 1362, 78), 8, TEAL if light else NAVY)
    text(draw, (1235, 51), "Executive Inquiry", F13, (255, 255, 255))


def draw_site_page(page: dict[str, object]) -> Path:
    img = Image.new("RGBA", (1440, 1760), BG + (255,))
    draw = ImageDraw.Draw(img)

    draw.rectangle((0, 0, 1440, 585), fill=(244, 248, 251))
    draw.rectangle((0, 0, 1440, 112), fill=(255, 255, 255, 238))
    draw.line((0, 112, 1440, 112), fill=BORDER, width=1)
    site_nav(draw)

    draw.rectangle((0, 112, 1440, 585), fill=(247, 250, 252))
    for gx in range(0, 1440, 72):
        draw.line((gx, 112, gx, 585), fill=(226, 233, 241), width=1)
    for gy in range(130, 585, 72):
        draw.line((0, gy, 1440, gy), fill=(235, 240, 245), width=1)

    pill(draw, 74, 165, str(page["eyebrow"]).upper(), (226, 247, 246), TEAL_DARK)
    paragraph(draw, (74, 218), str(page["title"]), F58, 540, fill=INK, line_h=68)
    paragraph(draw, (78, 382), str(page["hero"]), F18, 500, fill=SLATE, line_h=30)
    rounded(draw, (78, 470, 258, 528), 9, NAVY)
    text(draw, (112, 491), "Primary CTA", F16, (255, 255, 255))
    rounded(draw, (278, 470, 458, 528), 9, (255, 255, 255), outline=(198, 211, 225))
    text(draw, (314, 491), "View Work", F16, NAVY)

    shadow_card(img, (650, 160, 1360, 535), radius=18)
    draw_image_placeholder(draw, (650, 160, 1360, 535), "Premium construction / project media")
    rounded(draw, (690, 198, 890, 286), 12, (255, 255, 255, 235), outline=(226, 233, 241))
    text(draw, (714, 222), "500+", F34, NAVY)
    text(draw, (716, 264), "Projects delivered", F13, SLATE)
    rounded(draw, (912, 198, 1112, 286), 12, (255, 255, 255, 235), outline=(226, 233, 241))
    text(draw, (936, 222), "20+", F34, NAVY)
    text(draw, (938, 264), "Years experience", F13, SLATE)
    rounded(draw, (1134, 198, 1320, 286), 12, (255, 255, 255, 235), outline=(226, 233, 241))
    text(draw, (1158, 222), "HSE", F34, NAVY)
    text(draw, (1160, 264), "Safety led", F13, SLATE)

    rounded(draw, (72, 625, 1368, 755), 14, NAVY_DARK)
    service_items = ["Smart Planning", "Quality Construction", "On-Time Delivery", "Client Focused", "Safety First"]
    sx = 110
    for item in service_items:
        draw.ellipse((sx, 662, sx + 46, 708), outline=TEAL, width=2)
        draw.line((sx + 23, 674, sx + 23, 696), fill=TEAL, width=2)
        draw.line((sx + 13, 685, sx + 33, 685), fill=TEAL, width=2)
        text(draw, (sx + 66, 658), item, F18, (255, 255, 255))
        text(draw, (sx + 66, 690), "Refined execution system", F13, (175, 190, 208))
        sx += 254

    text(draw, (76, 820), "Current sections preserved", F14, TEAL_DARK)
    text(draw, (76, 855), "Visual redesign direction", F34, NAVY)
    paragraph(draw, (76, 910), str(page["summary"]), F18, 560, fill=SLATE, line_h=31)

    sections = list(page["sections"])
    cx, cy = 710, 820
    for idx, section in enumerate(sections):
        x = cx + (idx % 2) * 320
        y = cy + (idx // 2) * 118
        shadow_card(img, (x, y, x + 292, y + 92), radius=12, blur=12)
        rounded(draw, (x, y, x + 292, y + 92), 12, CARD, outline=BORDER)
        draw.rectangle((x, y, x + 6, y + 92), fill=TEAL if idx % 3 else NAVY)
        text(draw, (x + 24, y + 24), f"{idx + 1:02d}", F14, TEAL_DARK)
        text(draw, (x + 74, y + 22), section, F18, INK)
        text(draw, (x + 74, y + 54), "Same content, sharper layout", F12, SLATE)

    y2 = 1245
    text(draw, (76, y2), "Component system", F28, NAVY)
    cards = [
        ("Page Hero", "Navy media overlay, tighter copy width"),
        ("Cards", "8-12px radius, calmer shadows"),
        ("Forms", "Clear labels, compact fields, strong CTA"),
        ("Project Proof", "Stats, status tags, case-study rhythm"),
    ]
    for i, (title, desc) in enumerate(cards):
        x = 76 + i * 326
        shadow_card(img, (x, y2 + 62, x + 294, y2 + 240), radius=12, blur=14)
        rounded(draw, (x, y2 + 62, x + 294, y2 + 240), 12, CARD, outline=BORDER)
        draw.ellipse((x + 24, y2 + 88, x + 62, y2 + 126), fill=(226, 247, 246), outline=(184, 235, 232))
        text(draw, (x + 82, y2 + 90), title, F18, INK)
        paragraph(draw, (x + 24, y2 + 142), desc, F14, 235, fill=SLATE, line_h=24)

    rounded(draw, (74, 1570, 1366, 1682), 14, NAVY)
    text(draw, (110, 1606), "Implementation note", F24, (255, 255, 255))
    paragraph(draw, (110, 1644), "This mockup changes presentation only: routes, sections, page content, and API data remain untouched.", F16, 1040, fill=(210, 225, 236), line_h=26)
    rounded(draw, (1165, 1608, 1328, 1658), 8, TEAL)
    text(draw, (1195, 1624), "Approve Design", F14, NAVY_DARK)

    path = PNG_DIR / f"{page['slug']}.png"
    img.convert("RGB").save(path, quality=95)
    return path


def dashboard_shell(title: str, summary: str) -> Image.Image:
    img = Image.new("RGBA", (1440, 1040), BG + (255,))
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 292, 1040), fill=NAVY_DARK)
    logo_mark(draw, 34, 34, True)
    text(draw, (84, 36), "Fortune", F24, (255, 255, 255))
    text(draw, (86, 66), "Management", F10, (140, 171, 195))
    nav = ["Overview", "Projects", "Services", "Team", "Partners", "Jobs", "Applications", "Messages", "Content", "Settings"]
    y = 136
    for item in nav:
        active = item.lower() in title.lower() or (title == "Overview" and item == "Overview")
        rounded(draw, (24, y, 268, y + 46), 10, TEAL if active else (13, 28, 52))
        text(draw, (58, y + 14), item, F14, (255, 255, 255) if active else (165, 184, 204))
        y += 58
    rounded(draw, (24, 924, 268, 986), 10, (13, 28, 52), outline=(30, 55, 89))
    text(draw, (50, 944), "Live Site", F14, (175, 190, 208))

    draw.rectangle((292, 0, 1440, 90), fill=(255, 255, 255))
    draw.line((292, 90, 1440, 90), fill=BORDER)
    text(draw, (330, 24), "Corporate Dashboard", F10, SLATE)
    text(draw, (330, 44), "Admin Control Center", F20, INK)
    rounded(draw, (1185, 25, 1235, 65), 20, (241, 245, 249))
    rounded(draw, (1260, 24, 1404, 66), 21, (244, 248, 251), outline=BORDER)
    text(draw, (1282, 37), "Admin", F14, INK)

    text(draw, (330, 128), title, F44, NAVY)
    paragraph(draw, (332, 184), summary, F16, 640, fill=SLATE, line_h=28)
    return img


def draw_table(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, rows: Sequence[str]) -> None:
    rounded(draw, (x, y, x + w, y + 384), 12, CARD, outline=BORDER)
    draw.rectangle((x, y, x + w, y + 58), fill=(249, 251, 253))
    headers = ["Item", "Status", "Owner", "Updated", "Action"]
    positions = [x + 26, x + 360, x + 520, x + 700, x + 860]
    for pos, header in zip(positions, headers):
        text(draw, (pos, y + 22), header, F12, SLATE)
    yy = y + 58
    for idx, row in enumerate(rows):
        draw.line((x, yy, x + w, yy), fill=BORDER)
        text(draw, (x + 26, yy + 24), row, F16, INK)
        pill(draw, x + 360, yy + 17, "Published" if idx % 2 else "Active", (226, 247, 246), TEAL_DARK)
        text(draw, (x + 520, yy + 24), "Admin", F14, SLATE_DARK)
        text(draw, (x + 700, yy + 24), "Today", F14, SLATE)
        rounded(draw, (x + 860, yy + 16, x + 934, yy + 46), 7, NAVY)
        text(draw, (x + 886, yy + 24), "Edit", F12, (255, 255, 255))
        yy += 64


def draw_dashboard_page(slug: str, title: str, summary: str) -> Path:
    img = dashboard_shell(title, summary)
    draw = ImageDraw.Draw(img)

    if title == "Login":
        img = Image.new("RGBA", (1440, 1040), (239, 245, 249, 255))
        draw = ImageDraw.Draw(img)
        draw.rectangle((0, 0, 720, 1040), fill=NAVY_DARK)
        for i in range(0, 720, 56):
            draw.line((i, 0, i + 380, 1040), fill=(20, 45, 82), width=1)
        logo_mark(draw, 86, 88, True)
        text(draw, (138, 90), "FORTUNE", F34, (255, 255, 255))
        text(draw, (140, 130), "CONSTRUCTION MANAGEMENT", F12, (154, 231, 226))
        paragraph(draw, (86, 310), "Premium admin access for content, projects, careers, and communications.", F44, 500, fill=(255, 255, 255), line_h=58)
        paragraph(draw, (90, 590), "Cleaner authentication, stronger trust cues, and a calm operational tone aligned with the global site redesign.", F18, 460, fill=(190, 206, 224), line_h=30)
        shadow_card(img, (840, 238, 1240, 760), radius=16, blur=24)
        rounded(draw, (840, 238, 1240, 760), 16, CARD, outline=BORDER)
        text(draw, (890, 292), "Sign in", F34, NAVY)
        text(draw, (890, 340), "Admin Control Center", F14, SLATE)
        for yy, label in [(405, "Username"), (495, "Password")]:
            text(draw, (890, yy), label, F13, SLATE_DARK)
            rounded(draw, (890, yy + 26, 1192, yy + 78), 9, (248, 251, 253), outline=BORDER)
        rounded(draw, (890, 610, 1192, 668), 9, TEAL)
        text(draw, (990, 630), "Login Securely", F16, NAVY_DARK)
        text(draw, (890, 708), "Protected operational workspace", F13, SLATE)
    else:
        stat_titles = ["Total", "Active", "Pending", "Unread"]
        stat_vals = ["128", "42", "9", "17"]
        for i in range(4):
            x = 330 + i * 260
            shadow_card(img, (x, 250, x + 230, 370), radius=12, blur=14)
            rounded(draw, (x, 250, x + 230, 370), 12, CARD, outline=BORDER)
            text(draw, (x + 22, 276), stat_titles[i], F12, SLATE)
            text(draw, (x + 22, 306), stat_vals[i], F34, NAVY)
            draw.line((x + 170, 286, x + 205, 286), fill=TEAL, width=4)
            text(draw, (x + 22, 344), "+ refined management view", F10, TEAL_DARK)

        if title == "Overview":
            draw_table(draw, 330, 420, 650, ["Chileka Road Upgrade", "Lilongwe Housing", "Corporate Offices", "HSE Review"])
            rounded(draw, (1010, 420, 1392, 804), 12, CARD, outline=BORDER)
            text(draw, (1040, 452), "Activity Focus", F24, NAVY)
            for i, label in enumerate(["New applications", "Unread messages", "Projects awaiting update", "Content drafts"]):
                yy = 512 + i * 66
                draw.ellipse((1040, yy, 1064, yy + 24), fill=(226, 247, 246), outline=TEAL)
                text(draw, (1084, yy + 2), label, F16, INK)
        elif title == "Page Content":
            rounded(draw, (330, 420, 1390, 894), 12, CARD, outline=BORDER)
            tabs = ["Home", "About", "Projects", "HSE", "Careers", "Contact"]
            tx = 360
            for i, t in enumerate(tabs):
                rounded(draw, (tx, 452, tx + 112, 488), 8, TEAL if i == 0 else (246, 249, 252), outline=BORDER)
                text(draw, (tx + 26, 463), t, F13, (255, 255, 255) if i == 0 else SLATE_DARK)
                tx += 124
            for i, label in enumerate(["Hero title", "Hero subtitle", "Impact metrics", "Success stories"]):
                yy = 548 + i * 76
                text(draw, (372, yy), label, F14, SLATE_DARK)
                rounded(draw, (520, yy - 14, 1165, yy + 38), 8, (248, 251, 253), outline=BORDER)
                rounded(draw, (1190, yy - 14, 1328, yy + 38), 8, NAVY if i < 3 else TEAL)
                text(draw, (1230, yy + 1), "Update", F13, (255, 255, 255))
        elif title == "Settings":
            for col, heading in enumerate(["Company identity", "Contact channels"]):
                x = 330 + col * 540
                rounded(draw, (x, 420, x + 500, 825), 12, CARD, outline=BORDER)
                text(draw, (x + 30, 454), heading, F24, NAVY)
                for i, field in enumerate(["Company name", "Email", "Phone", "Address"]):
                    yy = 520 + i * 70
                    text(draw, (x + 30, yy), field, F13, SLATE_DARK)
                    rounded(draw, (x + 30, yy + 22, x + 440, yy + 68), 8, (248, 251, 253), outline=BORDER)
        else:
            row_names = {
                "Projects": ["Road Upgrade", "Housing Estate", "Office Tower", "Bridge Works"],
                "Services": ["General Contracting", "Civil Engineering", "Design & Build", "Project Management"],
                "Team": ["Managing Director", "Site Engineer", "HSE Officer", "Project Manager"],
                "Partners": ["Supplier Network", "Engineering Partner", "Equipment Vendor", "Consultant"],
                "Job Positions": ["Site Engineer", "Quantity Surveyor", "Safety Officer", "Foreman"],
                "Applications": ["Senior Engineer CV", "Surveyor Applicant", "Intern Candidate", "HSE Candidate"],
                "Messages": ["New project inquiry", "Supplier email", "Career question", "Meeting request"],
            }.get(title, ["Content item", "Record item", "Published item", "Review item"])
            draw_table(draw, 330, 420, 1005, row_names)
            rounded(draw, (1115, 190, 1392, 232), 8, TEAL)
            text(draw, (1162, 203), f"Add {title.split()[0]}", F14, NAVY_DARK)

    path = PNG_DIR / f"{slug}.png"
    img.convert("RGB").save(path, quality=95)
    return path


def report_page(title: str, subtitle: str, body: Iterable[str], image_path: Path | None = None, page_no: int = 1) -> Image.Image:
    img = Image.new("RGB", (1240, 1754), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 1240, 178), fill=NAVY)
    logo_mark(draw, 72, 50, True)
    text(draw, (126, 50), "FORTUNE CONSTRUCTION", F24, (255, 255, 255))
    text(draw, (126, 84), "Global redesign concept report", F13, (180, 235, 232))
    text(draw, (72, 232), title, F44, NAVY)
    paragraph(draw, (72, 296), subtitle, F18, 980, fill=SLATE, line_h=30)
    y = 390
    for item in body:
        draw.ellipse((80, y + 8, 92, y + 20), fill=TEAL)
        y = paragraph(draw, (112, y), item, F16, 980, fill=INK, line_h=28) + 16
    if image_path:
        screen = Image.open(image_path).convert("RGB")
        screen.thumbnail((1096, 760))
        sx = (1240 - screen.width) // 2
        shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.rounded_rectangle((sx - 8, y + 24, sx + screen.width + 8, y + screen.height + 40), radius=16, fill=(8, 32, 72, 35))
        shadow = shadow.filter(ImageFilter.GaussianBlur(18))
        img = Image.alpha_composite(img.convert("RGBA"), shadow).convert("RGB")
        draw = ImageDraw.Draw(img)
        img.paste(screen, (sx, y + 28))
    draw.line((72, 1680, 1168, 1680), fill=BORDER)
    text(draw, (72, 1704), f"Page {page_no}", F12, SLATE)
    text(draw, (1000, 1704), "Prepared for design approval", F12, SLATE)
    return img


def make_pdf(all_paths: Sequence[Path]) -> Path:
    pages: list[Image.Image] = []
    pages.append(
        report_page(
            "Redesign direction",
            "Premium global visual redesign, preserving current content, sections, pages, routes, and API contracts.",
            [
                "Primary palette is derived from the logo: navy #082048 and teal #10c0b8.",
                "Teal becomes an action/accent color instead of dominating every surface.",
                "The visual system reduces excessive roundness and glass effects in favor of cleaner, sharper UI.",
                "The dashboard uses a more operational layout: stronger sidebar, clearer KPI cards, cleaner tables, and direct actions.",
            ],
            all_paths[0],
            1,
        )
    )
    pages.append(
        report_page(
            "UI system",
            "The redesign keeps Fortune's construction identity while making every screen feel calmer, more mature, and more international.",
            [
                "Navigation: white or navy surfaces, compact links, clearer active states, and direct inquiry actions.",
                "Cards: 8-12px radius, subtle navy shadows, thinner borders, and stronger content hierarchy.",
                "Forms and tables: clearer labels, better spacing, and more visible primary actions.",
                "Page heroes: project or construction media, measured overlays, proof metrics, and concise page introductions.",
            ],
            all_paths[1],
            2,
        )
    )
    page_no = 3
    for path in all_paths:
        name = path.stem.replace("-", " ").title()
        pages.append(
            report_page(
                name,
                "Design mockup PNG included in the delivery set. This screen preserves the current content intent while updating presentation.",
                [
                    "No route, API contract, or data model change is implied.",
                    "Use this image as the visual target for the future implementation phase.",
                    "Content remains editable through the existing dashboard and page content systems.",
                ],
                path,
                page_no,
            )
        )
        page_no += 1

    pdf_path = REPORT_DIR / "fortune-redesign-2026-report.pdf"
    first, rest = pages[0], pages[1:]
    first.save(pdf_path, save_all=True, append_images=rest, resolution=150)
    return pdf_path


def make_index(all_paths: Sequence[Path], pdf_path: Path) -> Path:
    lines = [
        "# Fortune Construction Redesign 2026",
        "",
        "Deliverables generated for design approval only. No application code, routes, API contracts, or content models were changed.",
        "",
        "## Core Direction",
        "- Premium global construction website and dashboard.",
        "- Primary logo colors preserved: navy `#082048` and teal `#10c0b8`.",
        "- Teal is used as an accent/CTA, not the dominant page color.",
        "- Cleaner cards, tighter grids, calmer dashboards, and stronger project proof.",
        "",
        f"PDF report: [`{pdf_path.name}`](report/{pdf_path.name})",
        "",
        "## PNG Screens",
    ]
    for path in all_paths:
        lines.append(f"- [`{path.name}`](png/{path.name})")
    index = OUT / "README.md"
    index.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return index


def main() -> None:
    ensure_dirs()
    paths = [draw_site_page(page) for page in SITE_PAGES]
    paths.extend(draw_dashboard_page(slug, title, summary) for slug, title, summary in DASH_PAGES)
    pdf_path = make_pdf(paths)
    index = make_index(paths, pdf_path)
    print(f"Generated {len(paths)} PNG files")
    print(pdf_path)
    print(index)


if __name__ == "__main__":
    main()
