# **Play Forge** A Gaming Forum - Backend
<br>

## Overview
The backend for playforge is built with node.js and provides functionalities for posts, comment, search, reactions
operations. It handles data management, authentication, and various API endpoints for post , comments, reactions, games along 
with external APIs for searching games from google play store and getting otp in phone.

## Features

### API Endpoints


#### User API
* **POST /api/user/create**
  - Register a new user.
  
* **POST /api/user/login**
  - User login to obtain a JWT token.
  
* **GET /api/user/get_user/:id**
  - Retrieve user profile details.
  
* **PUT /api/user/update_profile/:id**
  - Update user profile information.
  
* **POST /api/user/forgot_password**
  - Send a password reset request.
  
* **POST /api/user/verify_otp**
  - Verify the OTP for account recovery.
  
* **GET /api/user/get_all_users**
  - Retrieve a list of all users.
  
* **DELETE /api/user/delete_user/:id**
  - Delete a user account.


#### Forum API

* **POST /api/forum/create**
  - Create a new forum post.
  
* **GET /api/forum/get_single_post/:id**
  - Retrieve a specific forum post by ID.
  
* **GET /api/forum/get_all_post**
  - Retrieve all forum posts.
  
* **POST /api/forum/add_comment/:postId**
  - Add a comment to a forum post.
  
* **PUT /api/forum/edit_comment/:postId/:commentId**
  - Edit a comment on a forum post.
  
* **DELETE /api/forum/delete_comment/:postId/:commentId**
  - Delete a comment from a forum post.
  
* **GET /api/forum/pagination?page=:page&limit=:limit&sort=:sortOption**
  - Retrieve forum posts with pagination and sorting options.
  
* **GET /api/forum/search?q=:query&tags=:tags**
  - Search for forum posts by query and tags.
  
* **POST /api/forum/:postId/like**
  - Like a forum post.
  
* **POST /api/forum/:postId/dislike**
  - Dislike a forum post.
  
* **POST /api/forum/:postId/view**
  - Record a view on a forum post.
  
* **GET /api/forum/user_posts/:id**
  - Retrieve all forum posts by a specific user.
  
* **GET /api/forum/user_comments/:id**
  - Retrieve all comments made by a specific user.
  
* **PUT /api/forum/edit_post/:postId**
  - Edit a forum post.
  
* **DELETE /api/forum/delete_post/:postId**
  - Delete a forum post.


#### Game API

* **POST /api/game/create**
  - Add a new game to the system.
  
* **GET /api/game/get_all_games**
  - Retrieve all games.
  
* **GET /api/game/get_single_game/:id**
  - Retrieve details of a specific game by ID.
  
* **DELETE /api/game/delete_game/:id**
  - Delete a game by ID.
  
* **PUT /api/game/update_game/:id**
  - Update game details by ID.

  
#### Search API

* **GET /api/forum/games**
  - Search for games using query parameters such as category and section page token.

### Authentication
* **JWT-Based Authentication**
  - Secure user authentication using JSON Web Tokens(JWT).

## Technologies
<br>

* **Node.js**: Server side runtine environment.
* **Express.js**: Backend framework for building web applications.
* **MongoDB**: NoSQL database for storing data.
* **Mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js

## Environment Variables

* MONGO_DB_URI:
* JWT_SECRET: 
* PORT:

## Author
<br>
Aashista Karki


