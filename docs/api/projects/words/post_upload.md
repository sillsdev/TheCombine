# Upload a .lift file

Used to add many words to a language project from a .lift file  
[.lift](https://github.com/sillsdev/lift-standard) is an xml variant focused on lexical data transfer

**URL** : `/v1/projects/{project}/words/upload`

**Method** : `POST`

**Auth required** :

**Data type**: [`FormData()`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) - Binary Stream

## Success Response

**Code** : `200 OK`

**Data content** : `num: int` - Number of successful entries
