Feature: Login

@needs_registered_user
Scenario: User logs in with valid credentials
Given I am on the login page
When I login with email "generated" and password "generated"
Then I should see the jobs listings page
