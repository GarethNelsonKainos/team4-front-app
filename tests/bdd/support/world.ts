import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page, chromium } from "@playwright/test";
import { RegisterPage } from "../../pages/registerPage";
import { LoginPage } from "../../pages/LoginPage";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  registerPage!: RegisterPage;
  loginPage!: LoginPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      baseURL: "http://localhost:3000",
    });
    this.page = await this.context.newPage();
    this.registerPage = new RegisterPage(this.page);
    this.loginPage = new LoginPage(this.page);
  }

  async cleanup() {
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
