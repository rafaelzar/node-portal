# employee-portal-backend

## Cognito setup
Project uses aws cognito indendity validation for authentication
After creating account on aws, go to 
Managment Console -> Cognito -> Create a User Pool (there are 2 ways to create user pool, default and custom setup)

Cognito dev_eyerate user pool have custom setup
1. Attributes 
    Email and phone number - Allow email Address
    Enable case insensitivity for username input
    Standard attributes required - email

2. Policies
    Password strenght (Minimul lenght 8, Require numbers, special character, uppercase and lowercase letters) - check
    Allow users to sign themselves up - check
    Temporary password expires if no used in - 7 days 

3. MFA and verifications
    Multy-Factor Authentication - off
    User able to recover their account - Email Only
    Attributes to verify - Email

4. Message customizations
    Use Cognito (Default)
    Customize verification messages - Verification type Code
    Enter your email massage - accepts html template

Enter your cognito aws credentials to enviroment file

## Plaid setup
In dev environment create your plaid account and use plaid sandbox enviroment.
When switching to production, create plaid production account and change plaid client options in config file located
```src/plaid/plaid.config.ts```