import type { RegisterUser } from '../pages/registerPage';

const uniqueEmail = () => `pw-user-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;

export const registerUsers: {
  valid: () => RegisterUser;
  weakPassword: () => RegisterUser;
  mismatchPassword: () => RegisterUser;
} = {
  valid: () => ({
    email: uniqueEmail(),
    password: 'ValidPass1!',
    confirmPassword: 'ValidPass1!',
    acceptTerms: true,
  }),

  weakPassword: () => ({
    email: uniqueEmail(),
    password: 'Weak1!',
    confirmPassword: 'Weak1!',
    acceptTerms: true,
  }),

  mismatchPassword: () => ({
    email: uniqueEmail(),
    password: 'ValidPass1!',
    confirmPassword: 'Different1!',
    acceptTerms: true,
  }),
};