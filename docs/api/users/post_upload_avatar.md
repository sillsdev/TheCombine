# Upload an avatar

Used to add an avatar to a user profile

**URL** : `/v1/users/{userId}/upload/avatar`

**Method** : `POST`

**Auth required** :

**Data type**: [`FormData()`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) - Binary Stream

```
FormData()
{
    LanguageData : File
    name : string
}
```

## Success Response

**Code** : `200 OK`

**Data content** : `bool` - if action was successful

## Error response

**Condition** : Invalid file

**Code** : `415 UNSUPPORTED MEDIA TYPE`
