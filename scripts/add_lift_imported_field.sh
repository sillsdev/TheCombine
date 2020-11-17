#!/bin/bash

# Update CombineDatabase.ProjectsCollection to add the liftImported field.
#
# The original design for TheCombine uses the existence of the .zip file used
# for importing LIFT data as an indicator that LIFT data were imported previously.
# PR #810 adds a field to documents in the ProjectsCollection, liftImported, for
# this function.
# This script adds this field to all current projects and sets it to true if there
# is a .lift file which is created when the data are imported into a project, and
# false otherwize.  The zip file that was used in an earlier design of the
# application is not used because earlier revisions deleted the zip file so this
# measure is not as reliable as the .lift files.

# Script Strategy
#  1. use find to find all imported .lift files
#  2. use list of files to create list of project ObjectIds
#  3. set liftImported to true for all project ids in list
#     c.f. https://docs.mongodb.com/manual/reference/operator/query/in/
#  4. set liftImported to false for all project docs that don't have a liftImported
#     field

# Function to update documents in the CombineDatabase.ProjectsCollection
# Expects two arguments:
#  - mongo selection clause
#  - mongo update clause
# Note: In order to aid validation/verification, the function will print the
#       command that is run.
update_projects() {
  mongo_cmd="db.getSiblingDB('CombineDatabase').getCollection('ProjectsCollection').updateMany($1, $2)"
  echo -e "Running command:\n${mongo_cmd}\n"
  mongo -eval "${mongo_cmd}"
}

# set working dorectory
COMBINE_HOME=${COMBINE_HOME:="/home/combine"}
cd ${COMBINE_HOME}/.CombineFiles

#  1. use find to find all imported .lift files
#  2. use list of files to create list of project ObjectIds
imported_projs="[ $(find . -name "*.lift" | grep Import | xargs | sed "s/\.\/\([0-9a-f]\{24\}\)[^\.]*\.lift/ObjectId\(\"\1\"\),/g" | sed "s/, *\$//") ]"

#  3. set liftImported to true for all project ids in list
mongo_select="{ \"_id\": { \"\$in\": ${imported_projs}}}"
mongo_update="{ \"\$set\": { \"liftImported\": true } }"
update_projects "${mongo_select}" "${mongo_update}"

#  4. set liftImported to false for all project docs that don't have a liftImported
#     field
mongo_select="{ \"liftImported\": { \"\$exists\": false }}"
mongo_update="{ \"\$set\": { \"liftImported\": false } }"
update_projects "${mongo_select}" "${mongo_update}"
