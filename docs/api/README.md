# Combine API docs

## User

- [Add user](users/post.md) : `POST /v1/users`
- [Get all users](users/get_all.md) : `GET /v1/users`
- [Update user info](users/put.md) : `PUT /v1/users/{userId}`
- [Get user](users/get.md) : `GET /v1/users/{userId}`
- [Upload Avatar](users/post_upload_avatar.md) : `POST /v1/users/{userId}/upload/avatar`
- [Authenticate](users/authenticate.md) : `POST /v1/users/authenticate`

## Project

- [Add language project](projects/post.md) : `POST: /v1/projects/`
- [Get all projects](projects/get_all.md) : `GET: /v1/projects`
- [Get one project](projects/get.md) : `GET: /v1/projects/{projectId}`
- [Update a project](projects/put.md) : `PUT: /v1/projects/{projectId}`

### Word

- [Add word](projects/words/post.md) : `POST: /v1/projects/{projectId}/words`
- [Merge words](projects/words/put.md) : `PUT: /v1/projects/{projectId}/words`
- [Get all words](projects/words/get.md) : `GET: /v1/projects/{projectId}/words`
- [Get word](projects/words/get_id.md) : `GET: /v1/projects/{projectId}/words/{wordId}`
- [Update word](projects/words/put_id.md) : `PUT: /v1/projects/{projectId}/words/{wordId}`
- [Delete word](projects/words/delete_id.md) : `DELETE: /v1/projects/{projectId}/words/{wordId}`
- [Merge words](projects/words/put.md) : `PUT: /v1/projects/{projectId}/words`
- [Get frontier words](projects/words/frontier.md) : `GET: /v1/projects/{projectId}/words/frontier`
- [Upload Lift File](projects/words/post_upload_lift.md) : `POST: /v1/projects/{projectId}/words/upload`
- [Upload Audio](users/post_upload_audio.md) : `POST /v1/projects/{projectId}/words/{wordId}/upload/audio`

### User Edit

- [Get all user edits](projects/user_edits/get_all.md) : `GET /v1/projects/{projectId}/useredits`
- [Get user edit](projects/user_edits/get.md) : `GET /v1/projects/{projectId}/useredits/{userEditId}`
- [Create goal](projects/user_edits/post_id.md) : `POST /v1/projects/{projectId}/useredits/{userEditId}`
- [Add steps to goal](projects/user_edits/put.md) : `PUT /v1/projects/{projectId}/useredits/{userEditId}`