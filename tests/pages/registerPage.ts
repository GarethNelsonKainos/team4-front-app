import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export type RegisterUser = {
  email: string;
  password: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
};

export class RegisterPage extends BasePage {


  readonly emailInput = this.page.locator('#email');
  readonly passwordInputField = this.page.locator('#password');
  readonly confirmPasswordInputField = this.page.locator('#confirmPassword');
  readonly termsCheckbox = this.page.locator('#terms');
  readonly createAccountButton = this.page.getByRole('button', { name: 'Create Account' });
  readonly togglePasswordButton = this.page.locator('#togglePassword');
  readonly toggleConfirmPasswordButton = this.page.locator('#toggleConfirmPassword');

  async navigateToRegister() {
    await this.goto('/register');
    await this.waitForLoadState('networkidle');
    await expect(this.page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
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
    await this.waitForLoadState('networkidle');

  }

  async togglePasswordVisibility() {
    await this.togglePasswordButton.click();
  }

  async toggleConfirmPasswordVisibility() {
    await this.toggleConfirmPasswordButton.click();
  }

  passwordInput() {
    return this.passwordInputField;
  }

  confirmPasswordInput() {
    return this.confirmPasswordInputField;
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
    await expect(this.createAccountButton).toBeVisible();
  }
}