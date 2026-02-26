Feature: Register

Scenario: User submits with valid credentials
Given I am on the register page
When I register with email "cucumber47111@example.com" and password "Cucumber1234!" and confirmPassword "Cucumber1234!" and acceptTerms "true" and click submit
Then I should see the login page