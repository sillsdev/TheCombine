# Add User

Used to add a user to the server.

**URL** : `/v1/users`

**Method** : `POST`

**Auth required** : No

**Data type**: [`User`](user.md)

## Success Response

**Code** : `200 OK`

**Data content** : `id: string`

## Error Response

**Condition** : If user is null

**Code** : `400 BAD REQUEST`
