# Users API

## Create Dealer

Creates a dealer account and sends the dealer a temporary password by email.

- Method: `POST`
- Route: `/api/v1/users/dealers`
- Auth: Bearer access token for an `admin` or `super_admin`
- Headers:
  - `Authorization: Bearer <accessToken>`
  - `Content-Type: application/json`

### Request Body

```json
{
  "name": "Dealer One",
  "email": "dealer@example.com"
}
```

Validation rules:

- `name` is required, trimmed, minimum 2 characters, maximum 80 characters.
- `email` is required and must be a valid email address.
- `password`, `role`, and `status` are not accepted from the request body for this endpoint.

### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "message": "Dealer created successfully. Temporary password was sent by email.",
  "data": {
    "user": {
      "_id": "663fb6d8a8d2f0c0e6edc111",
      "name": "Dealer One",
      "email": "dealer@example.com",
      "role": "dealer",
      "status": "active",
      "createdBy": "663fb6d8a8d2f0c0e6edc000",
      "createdAt": "2026-05-12T00:00:00.000Z",
      "updatedAt": "2026-05-12T00:00:00.000Z"
    }
  }
}
```

The response never includes the generated password. The password is sent only through the configured Nodemailer SMTP transport. If `SMTP_HOST` is empty, the existing mail layer logs the email content for local development.

### Error Responses

Validation error, status `400 Bad Request`:

```json
{
  "success": false,
  "message": "Invalid email address"
}
```

Duplicate email, status `409 Conflict`:

```json
{
  "success": false,
  "message": "A user with this email already exists"
}
```

Email delivery failure, status `502 Bad Gateway`:

```json
{
  "success": false,
  "message": "Dealer account could not be created because the welcome email could not be sent. Verify SMTP configuration and try again."
}
```

Edge cases:

- If email delivery fails, the created dealer is removed so the admin can retry without leaving an inaccessible account.
- The dealer role is assigned by the service and cannot be overridden by the caller.
- The generated temporary password includes uppercase, lowercase, numeric, and symbol characters.
