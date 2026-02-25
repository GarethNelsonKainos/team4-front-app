import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export type RegisterUser = {
  email: string;
  password: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
};

export class RegisterPage extends BasePage {

  readonly emailInput: Locator;
  readonly passwordInputField: Locator;
  readonly confirmPasswordInputField: Locator;
  readonly termsCheckbox: Locator;
  readonly createAccountButton: Locator;
  readonly togglePasswordButton: Locator;
  readonly toggleConfirmPasswordButton: Locator;
  readonly pageHeading: Locator;
  readonly alreadyRegisteredHeading: Locator;
  readonly successRedirectHeading: Locator;
  readonly passwordMismatchError: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInput = this.page.locator('#email');
    this.passwordInputField = this.page.locator('#password');
    this.confirmPasswordInputField = this.page.locator('#confirmPassword');
    this.termsCheckbox = this.page.locator('#terms');
    this.createAccountButton = this.page.getByRole('button', { name: 'Create Account' });
    this.togglePasswordButton = this.page.locator('#togglePassword');
    this.toggleConfirmPasswordButton = this.page.locator('#toggleConfirmPassword');
    this.pageHeading = this.page.getByRole('heading', { name: 'Create Your Account' });
    this.alreadyRegisteredHeading = this.page.getByRole('heading', { name: 'Already Registered' });
    this.successRedirectHeading = this.page.getByRole('heading', { name: /Welcome Back|Sign In|Login/ });
    this.passwordMismatchError = this.page.getByText(/passwords? do not match|must match/i);

  }

  async navigateToRegister() {
    await this.goto('/register');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInputField.fill(password);
  }

  async fillConfirmPassword(confirmPassword: string) {
    await this.confirmPasswordInputField.fill(confirmPassword);
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  async submit() {
    await this.createAccountButton.click();
  }

  async register(user: RegisterUser) {
    await this.navigateToRegister();
    await this.fillEmail(user.email);
    await this.fillPassword(user.password);
    await this.fillConfirmPassword(user.confirmPassword ?? user.password);

    if (user.acceptTerms !== false) {
      await this.acceptTerms();
    }

    await this.submit();

  }

  async togglePasswordVisibility() {
    await this.togglePasswordButton.click();
  }

  async toggleConfirmPasswordVisibility() {
    await this.toggleConfirmPasswordButton.click();
  }

    /**
   * Check if page heading is visible
   */
  async isPageHeadingVisible(): Promise<boolean> {
    return await this.pageHeading.isVisible();
  }

  /**
   * Check if already registered heading is visible
   */
  async isAlreadyRegisteredHeadingVisible(): Promise<boolean> {
    return await this.alreadyRegisteredHeading.isVisible();
  }

  /**
   * Check if success redirect heading is visible
   */
  async isSuccessRedirectHeadingVisible(): Promise<boolean> {
    return await this.successRedirectHeading.isVisible();
  }

  /**
   * Check if password mismatch error is visible
   */
  async isPasswordMismatchErrorVisible(): Promise<boolean> {
    return await this.passwordMismatchError.isVisible();
  }
}