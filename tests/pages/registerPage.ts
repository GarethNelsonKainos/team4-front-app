import { expect, Page } from '@playwright/test';

export type RegisterUser = {
  email: string;
  password: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
};

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/register');
    await expect(this.page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  }

  async fillEmail(email: string) {
    await this.page.locator('#email').fill(email);
  }

  async fillPassword(password: string) {
    await this.page.locator('#password').fill(password);
  }

  async fillConfirmPassword(confirmPassword: string) {
    await this.page.locator('#confirmPassword').fill(confirmPassword);
  }

  async acceptTerms() {
    await this.page.locator('#terms').check();
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  async register(user: RegisterUser) {
    await this.goto();
    await this.fillEmail(user.email);
    await this.fillPassword(user.password);
    await this.fillConfirmPassword(user.confirmPassword ?? user.password);

    if (user.acceptTerms !== false) {
      await this.acceptTerms();
    }

    await this.submit();
  }

  async togglePasswordVisibility() {
    await this.page.locator('#togglePassword').click();
  }

  async toggleConfirmPasswordVisibility() {
    await this.page.locator('#toggleConfirmPassword').click();
  }

  passwordInput() {
    return this.page.locator('#password');
  }

  confirmPasswordInput() {
    return this.page.locator('#confirmPassword');
  }

  async expectAlreadyRegisteredBanner() {
    await expect(this.page.getByRole('heading', { name: 'Already Registered' })).toBeVisible();
  }

  async expectSuccessRedirect() {
    await expect(this.page).not.toHaveURL(/\/register$/);
    await expect(this.page.getByRole('heading', { name: /Welcome Back|Sign In|Login/ })).toBeVisible();
  }

  async expectPasswordMismatchError() {
    await expect(this.page.getByText(/passwords? do not match|must match/i)).toBeVisible();
    await expect(this.page).toHaveURL(/\/register/);
  }


  async expectTermsRequiredError() {
    await expect(this.page).toHaveURL(/\/register/);
    await expect(this.page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  }
}