Feature: Register

Scenario:
User submits with valid credentials
Given I am on the register page
When I register with email "cucumber@test.com" and password "Cucumber123!" and confirmPassword "Cucumber123!" and acceptTerms 'true'
Then I should see the login page