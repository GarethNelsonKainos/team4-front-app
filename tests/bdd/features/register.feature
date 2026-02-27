Feature: Register

Scenario: User submits with valid credentials
Given I am on the register page
When I register with email "generated" and password "generated" and confirmPassword "generated" and acceptTerms "true" and click submit
Then I should see the login page