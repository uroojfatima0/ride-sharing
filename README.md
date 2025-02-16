# Ride-Sharing API Documentation

This project provides a set of APIs designed to handle the core functionalities of a ride-sharing application. It includes endpoints for both customer and driver interactions such as user registration, authentication, ride requests, ride tracking, and earnings management. The APIs support seamless communication between customers requesting rides and drivers accepting and completing them.

## Git Clone Instructions

To get started with the project, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/uroojfatima0/ride-sharing
    ```

2. Navigate into the project directory:

    ```bash
    cd ride-sharing-api
    ```

3. Install the necessary dependencies and follow the setup instructions provided in the project README to get the application running.

4. To configure your local environment, create a `.env` file in the root directory of the project with the following credentials:
   
- **MONGO_URI**: Connection string for MongoDB.
- **JWT_SECRET**: Secret key used to sign JWT tokens.
- **PORT**: Port number where the application will run (default is 5000).
(replace with your own credentials)
  ```bash
  MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
  JWT_SECRET=SecretKey
  PORT=5000
  ```

Make sure to keep your `.env` file secure and do not share it publicly.
  

6. Run the following command

    ```bash
    nodemon server.js
    ```

7. Open in your local browser:

   ```bash
   http://localhost:5000/
   ```
8. For swagger documentation, open following link in your browsers:
   ```bash
      http://localhost:5000/api-docs
   ```
