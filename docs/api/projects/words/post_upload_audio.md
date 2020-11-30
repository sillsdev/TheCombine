# Upload an audio file

**URL** : `/v1/projects/{projectId}/words/{wordId}/upload/audio`

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

**Data content** : `string` - file path

## Error response

**Condition** : Invalid file

**Code** : `415 UNSUPPORTED MEDIA TYPE`
