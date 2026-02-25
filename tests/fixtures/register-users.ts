import type { RegisterUser } from '../pages/registerPage';
import "dotenv/config";

const uniqueEmail = () => `pw-user-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;

const VALID_PASSWORD = process.env.TEST_USER_PASSWORD_VALID!;
const WEAK_PASSWORD = process.env.TEST_USER_PASSWORD_WEAK!;
const MISMATCH_PASSWORD_1 = process.env.TEST_USER_MISMATCH_PASSWORD1!;
const MISMATCH_PASSWORD_2 = process.env.TEST_USER_MISMATCH_PASSWORD2!;

export const registerUsers: {
  valid: () => RegisterUser;
  weakPassword: () => RegisterUser;
  mismatchPassword: () => RegisterUser;
} = {
  valid: () => ({
    email: uniqueEmail(),
    password: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
    acceptTerms: true,
  }),

  weakPassword: () => ({
    email: uniqueEmail(),
    password: WEAK_PASSWORD,
    confirmPassword: WEAK_PASSWORD,
    acceptTerms: true,
  }),

  mismatchPassword: () => ({
    email: uniqueEmail(),
    password: MISMATCH_PASSWORD_1,
    confirmPassword: MISMATCH_PASSWORD_2,
    acceptTerms: true,
  }),
};