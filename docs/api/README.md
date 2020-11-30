# Combine API docs

## Project

- [Add project](projects/post.md) : `POST: /v1/projects/`
- [Get one project](projects/get.md) : `GET: /v1/projects/{projectId}`
- [Get all users working on one project](projects/get_users.md) : `GET: /v1/projects/{projectId}/users`
- [Update a project](projects/put.md) : `PUT: /v1/projects/{projectId}`
- [Update character set of a project](projects/put_characters.md) : `PUT: /v1/projects/{projectId}/characters`
- [Update UserRole of User on one project](projects/put_user.md) : `PUT: /v1/projects/{projectId}/users/{userId}`

### Word

- [Add word](projects/words/post.md) : `POST: /v1/projects/{projectId}/words`
- [Get all words](projects/words/get.md) : `GET: /v1/projects/{projectId}/words`
- [Get word](projects/words/get_id.md) : `GET: /v1/projects/{projectId}/words/{wordId}`
- [Update word](projects/words/put_id.md) : `PUT: /v1/projects/{projectId}/words/{wordId}`
- [Merge words](projects/words/put.md) : `PUT: /v1/projects/{projectId}/words`
- [Delete word](projects/words/delete_id.md) : `DELETE: /v1/projects/{projectId}/words/{wordId}`

### Frontier

- [Get frontier words](projects/words/frontier.md) : `GET: /v1/projects/{projectId}/words/frontier`

### Lift

- [Import Lift Collection](projects/words/post_upload_lift.md) : `POST: /v1/projects/{projectId}/words/upload`
- [Export Lift Collection](projects/words/post_upload_lift.md) : `GET: /v1/projects/{projectId}/words/download`

### Audio

- [Upload Audio](users/post_upload_audio.md) : `POST /v1/projects/{projectId}/words/{wordId}/upload/audio`

## User

- [Add user](users/post.md) : `POST /v1/users`
- [Get user](users/get.md) : `GET /v1/users/{userId}`
- [Update user info](users/put.md) : `PUT /v1/users/{userId}`
- [Authenticate](users/authenticate.md) : `POST /v1/users/authenticate`

### Avatar

- [Upload Avatar](users/post_upload_avatar.md) : `POST /v1/users/{userId}/upload/avatar`

### User Edit

- [Add user edit](projects/user_edits/post_id.md) : `POST /v1/projects/{projectId}/useredits/{userEditId}`
- [Get all user edits](projects/user_edits/get_all.md) : `GET /v1/projects/{projectId}/useredits`
- [Get user edit](projects/user_edits/get.md) : `GET /v1/projects/{projectId}/useredits/{userEditId}`
- [Add goal to UserEdit](projects/user_edits/post_id.md) : `POST /v1/projects/{projectId}/useredits/{userEditId}`
- [Add steps to goal](projects/user_edits/put.md) : `PUT /v1/projects/{projectId}/useredits/{userEditId}`

### User Role

- [Add user role](projects/user_roles/post.md) : `POST /v1/projects/{projectId}/userrole/{userRoleId}`
- [Get all user roles](projects/user_roles/get_all.md) : `GET /v1/projects/{projectId}/userroles`
- [Get user role](projects/user_roles/get.md) : `GET /v1/projects/{projectId}/userroles/{userRoleId}`
- [Update user role](projects/user_roles/put.md) : `PUT /v1/projects/{projectId}/userroles/{userRoleId}`
