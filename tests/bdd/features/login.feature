Feature: Login

Scenario:
User logs in with valid credentials
Given I am on the login page
When I login with email "test@test.com"
Then I should see the jobs listings page