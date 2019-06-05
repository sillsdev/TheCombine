# Get all users

**URL** : `/v1/users`

**Method** : `GET`

**Auth required** :

**Data type** : `ids: string[] | undefined`

> If `undefined` it will return all users

## Success response

**Code** : `200 OK`

**Data content**: [`User`](user.md)`[]`

## Error response

**Condition** : If any ID in body is not found

**Code** : `404 NOT FOUND`

**Data content** : `missingIds: String[]`
