rem Pass the existing user to grant database admin permissions to as the argument to this script
set user=%1
set command="db.UsersCollection.updateOne({username: \"%user%\"}, {$set: {isAdmin: true}})"
mongo --eval %command%; CombineDatabase
