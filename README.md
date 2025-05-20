# Bitespeed Identity Reconciliation
## Overview
This project is a backend service built for the Bitespeed Identity Reconciliation assignment. It is designed to intelligently manage and consolidate user contact information based on provided email addresses and phone numbers. The service is implemented using Node.js, Express, TypeScript, and MongoDB (Mongoose), ensuring type safety, scalability, and robust data handling.
The core functionality revolves around a single API endpoint (/identify) that receives user identifiers and returns a consolidated contact profile, following the identity reconciliation logic described in the assignment.

## Assignment Context
In many real-world applications, users may register or interact using different identifiers (such as multiple emails or phone numbers). The challenge is to recognize and merge these identities to avoid duplication and maintain a unified user profile.

### This service:

Accepts an email and/or phone number as input. 

Searches existing records to find linked contacts. 

Returns a single, consolidated contact object, specifying primary and secondary contacts, as well as all associated emails and phone numbers.

# [Live API](https://bitespeed-backend-1-hs6n.onrender.com)
This is the live API link generated after deployment. To use the service, send a POST request to the /identify endpoint to receive a response.

# How to Use the API

To test the /identify endpoint using Postman or any API client:

Set the request type to POST.

Enter /identify as the endpoint path in your request URL.

In the "Body" tab, select "raw" and choose "JSON" as the format.

Enter a JSON payload with at least one of the following fields:

{

  "email": 
  
  "phoneNumber":
  
}

Click "Send" to receive a JSON response with the consolidated contact information.
