# Social Auth API Documentation

This backend handles user storage and social account linking to bridge the gap between Cognito and custom attribute searching.

**Base URL**: `http://localhost:8080/api`

---

## 1. Register User
Create a new user entry in ScyllaDB.

*   **URL**: `/register`
*   **Method**: `POST`
*   **Input Body**:
    ```json
    {
      "email": "user@example.com"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "user_id": "uuid-string",
      "email": "user@example.com",
      "twitter_id": null,
      "telegram_id": null,
      "linked_accounts": [],
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    ```

---

## 2. Login / Identity Check
Check if a user exists by their email or social ID. This is useful for finding the Cognito-linked account during social login.

*   **URL**: `/login`
*   **Method**: `POST`
*   **Input Body**:
    ```json
    {
      "type": "email", // or "twitter", "telegram"
      "identifier": "user@example.com" // or "@twitter_handle", "tg_id"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "message": "Login successful",
      "user": { ...user_object... }
    }
    ```
*   **Error Response (404 Not Found)**:
    ```json
    { "error": "User not found" }
    ```

---

## 3. Link Social Account
Associate a Twitter or Telegram ID with an existing user.

*   **URL**: `/link`
*   **Method**: `POST`
*   **Input Body**:
    ```json
    {
      "userId": "uuid-string",
      "provider": "twitter", // or "telegram"
      "socialId": "@my_handle"
    }
    ```
*   **Success Response (200 OK)**:
    Returns the updated `user` object with the new social ID and `linked_accounts` updated.

---

## 4. Unlink Social Account
Remove a social association.

*   **URL**: `/unlink`
*   **Method**: `POST`
*   **Input Body**:
    ```json
    {
      "userId": "uuid-string",
      "provider": "twitter"
    }
    ```
*   **Success Response (200 OK)**:
    Returns the updated `user` object.

---

## 5. Get User Details
Fetch a user's full profile by their internal ID.

*   **URL**: `/user/:id`
*   **Method**: `GET`
*   **Success Response (200 OK)**:
    Returns the `user` object.

---

## User Data Structure

| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | UUID | Primary key, matches Cognito Sub if linked. |
| `email` | String | User's primary email. |
| `twitter_id` | String | Linked Twitter identifier. |
| `telegram_id` | String | Linked Telegram identifier. |
| `linked_accounts` | Array | List of connected providers (e.g., `["twitter"]`). |
| `created_at` | Timestamp | Record creation date. |
| `updated_at` | Timestamp | Last modification date. |
