import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {

  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly rememberCheckbox: Locator;
  private readonly signInButton: Locator
  private readonly forgotPasswordLink: Locator;
  private readonly signUpLink: Locator
  private readonly errorMessage: Locator;
  private readonly togglePasswordButton: Locator;
  private readonly alreadyLoggedInMessage: Locator;

  // Selectors
  constructor(page: Page) {
    super(page);
    this.emailInput = this.page.locator('#email');
    this.passwordInput = this.page.locator('#password');
    this.rememberCheckbox = this.page.locator('#remember');
    this.signInButton = this.page.locator('button[type="submit"]');
    this.forgotPasswordLink = this.page.locator('a[href="/forgot-password"]');
    this.signUpLink = this.page.locator('a[href="/register"]');
    this.errorMessage = this.page.locator('.bg-red-50');
    this.togglePasswordButton = this.page.locator('#togglePassword');
    this.alreadyLoggedInMessage = this.page.locator('h1:has-text("Already Logged In")');
  }
  // Methods
  async navigateToLogin() {
    await this.goto('/login');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clearPassword() {
    await this.passwordInput.clear();
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
  }

  async togglePasswordVisibility() {
    await this.togglePasswordButton.click();
  }

   async getErrorMessage(): Promise<string> {
    const text = await this.errorMessage.textContent();
    return text?.trim() || '';
  }

    async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async isAlreadyLoggedInMessageVisible(): Promise<boolean> {
    return await this.alreadyLoggedInMessage.isVisible();
  }

  /**
   * Check if email input has error styling
   */
  async emailInputHasError(): Promise<boolean> {
    const classes = await this.emailInput.getAttribute('class');
    return classes?.includes('border-red-500') || false;
  }

  /**
   * Check if password input has error styling
   */
  async passwordInputHasError(): Promise<boolean> {
    const classes = await this.passwordInput.getAttribute('class');
    return classes?.includes('border-red-500') || false;
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