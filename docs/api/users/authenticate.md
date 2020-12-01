# Authenticate User

**URL** : `/v1/users/authenticate`

**Method** : `POST`

**Auth required** : No

**Data type**:

## Success Response

**Code** : `200 OK`

**Data content** : `User`

## Error Response

**Condition** : If user is invalid

**Code** : `401 UNAUTHORIZED`

**Condition** : If user is null

**Code** : `404 NOT FOUND`
