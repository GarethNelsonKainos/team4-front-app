import { Page, expect } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  // Selectors
  readonly emailInput = this.page.locator('#email');
  readonly passwordInput = this.page.locator('#password');
  readonly rememberCheckbox = this.page.locator('#remember');
  readonly signInButton = this.page.locator('button[type="submit"]');
  readonly forgotPasswordLink = this.page.locator('a[href="/forgot-password"]');
  readonly signUpLink = this.page.locator('a[href="/register"]');
  readonly errorMessage = this.page.locator('.bg-red-50');
  readonly togglePasswordButton = this.page.locator('#togglePassword');
  readonly alreadyLoggedInMessage = this.page.locator('h1:has-text("Already Logged In")');

  // Methods
  async navigateToLogin() {
    await this.goto('/login');
    await this.waitForLoadState('networkidle');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async checkRememberMe() {
    await this.rememberCheckbox.check();
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.checkRememberMe();
    }
    await this.clickSignIn();
    await this.waitForLoadState('networkidle');
  }

  async togglePasswordVisibility() {
    await this.togglePasswordButton.click();
  }

  async assertErrorMessageVisible(expectedMessage: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedMessage);
  }

  async assertAlreadyLoggedIn() {
    await expect(this.alreadyLoggedInMessage).toBeVisible();
  }

  async assertEmailInputHasError() {
    await expect(this.emailInput).toHaveClass(/border-red-500/);
  }

  async assertPasswordInputHasError() {
    await expect(this.passwordInput).toHaveClass(/border-red-500/);
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async clickSignUp() {
    await this.signUpLink.click();
  }

  async getPasswordInputType() {
    return await this.passwordInput.getAttribute('type');
  }
}