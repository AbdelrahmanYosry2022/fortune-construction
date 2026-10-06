import { Page, expect } from '@playwright/test';

export const SELECTORS = {
  dashboard: {
    login: {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      submitButton: 'button[type="submit"]',
    },
    nav: {
      projects: 'a[href="/projects"]',
      services: 'a[href="/services"]',
      jobs: 'a[href="/jobs"]',
      messages: 'a[href="/messages"]',
      content: 'a[href="/content"]',
    },
    messages: {
      messageItem: '.message-item, tr, div',
    },
  },
  public: {
    contactForm: {
      nameInput: 'input[name="name"]',
      emailInput: 'input[name="email"]',
      phoneInput: 'input[name="phone"]',
      messageTextarea: 'textarea[name="message"]',
      submitButton: 'button[type="submit"]',
    },
    projects: {
      card: '.project-card, article, a[href^="/projects/"]',
    },
    services: {
      card: '.service-card, article, div',
    },
    careers: {
      jobCard: '.job-card, article, div',
    },
  },
};

export async function loginDashboard(
  page: Page,
  dashboardUrl = 'http://localhost:5174',
  username = 'admin',
  password = 'admin123'
) {
  await page.goto(`${dashboardUrl}/login`);
  await page.fill(SELECTORS.dashboard.login.usernameInput, username);
  await page.fill(SELECTORS.dashboard.login.passwordInput, password);
  await page.click(SELECTORS.dashboard.login.submitButton);
  await expect(page).not.toHaveURL(/\/login$/);
}

export async function submitContactForm(
  page: Page,
  publicUrl = 'http://localhost:5173',
  data: { name: string; email: string; phone: string; message: string }
) {
  await page.goto(`${publicUrl}/contact`);

  const additionalBtn = page.getByRole('button', { name: /Submit Additional Inquiry/i });
  if (await additionalBtn.isVisible().catch(() => false)) {
    await additionalBtn.click();
  }

  await page.fill(SELECTORS.public.contactForm.nameInput, data.name);
  await page.fill(SELECTORS.public.contactForm.emailInput, data.email);
  await page.fill(SELECTORS.public.contactForm.phoneInput, data.phone);
  await page.fill(SELECTORS.public.contactForm.messageTextarea, data.message);

  await page.click(SELECTORS.public.contactForm.submitButton);
  await expect(page.getByText(/Message Dispatched!/i)).toBeVisible({ timeout: 15000 });
}
