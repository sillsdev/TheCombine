#!/bin/bash

######################################################
# Script to add translated User Guide files
# that have been downloaded from Crowdin.
######################################################

set -e

usage() {
  cat <<USAGE
  Usage: $0 [options]
    Add translated User Guide files downloaded from Crowdin.
  Options:
    -h, --help:
          print this message
    -i, --input:
          (required) folder with translated user-guide .md files
          downloaded from Crowdin
    -l, --lang:
          (required) 2- or 3-letter language code of translated files
    -v, --verbose:
          print each line of code before it is executed
USAGE
}

if [[ $# -eq 0 ]] ; then
  usage
  exit 0
fi

DRYRUN=0
SRC_DIR=
TARGET_DIR=docs/user_guide/docs
LANG=
while [[ $# -gt 0 ]] ; do
  arg="$1"
  shift

  case ${arg} in
    -h|--help)
      usage
      exit 0
      ;;
    -i|--input)
      SRC_DIR=$1
      shift
      ;;
    -l|--lang)
      LANG=$1
      shift
      if [[ "${LANG}" =~ [^a-z] ]]; then
        echo "The -l/--lang argument must be lowercase alphabetic"
        exit 1
      fi
      ;;
    -v|--verbose)
      set -x
      ;;
    *)
      echo "Unrecognized argument: ${arg}"
      usage
      exit 1
      ;;
  esac
done

echo "Language: "$LANG
echo "User Guide files:"
for FILE in "$SRC_DIR"/*.md; do
  NAME=${FILE##*/}
  LANG_NAME=${NAME%.*}.$LANG.md
  LANG_FILE=$TARGET_DIR/$LANG_NAME
  cp $FILE $LANG_FILE
  sed -i "s/) {/){/g" $LANG_FILE
  sed -i "s/](\.\./](..\/../g" $LANG_FILE
  sed -i "s/](images/](..\/images/g" $LANG_FILE
  echo $LANG_FILE
done;

echo
echo "ATTENTION: Open and save each of the above files"
echo "to trigger word wrap with the default line length"
echo
echo "ATTENTION: If this is a new language, update mkdocs.yml"
