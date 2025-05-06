#!/bin/bash

##############################################
# Script to fetch dictionary files from
# https://github.com/LibreOffice/dictionaries
# and convert them into wordlists
##############################################

set -e

usage() {
  cat <<USAGE
  Usage: $0 [options]
    Fetch dictionary files for specified language and convert to a wordlist
  Options:
    -h, --help:
          print this message
    -l, --lang:
          (required) language to generate wordlist for
          options: ar, en, es, fr, hi, pt, ru, sw
    -d, --dry-run:
          print commands instead of executing them
    -v, --verbose:
          print each line of code before it is executed
  Caveats:
    This script assumes:
      * internet access
      * scripts.wordlist defined in package.json
    If you run this script many times in rapid succession,
      your dictionary download may be throttled by the source
USAGE
}

if [[ $# -eq 0 ]] ; then
  usage
  exit 0
fi

DRYRUN=0
LANG=
while [[ $# -gt 0 ]] ; do
  arg="$1"
  shift

  case ${arg} in
    -h|--help)
      usage
      exit 0
      ;;
    -l|--lang)
      LANG=$1
      shift
      if [[ "${LANG}" =~ [^a-z] ]]; then
        echo "The -l/--lang argument must be lowercase alphabetic"
        exit 1
      fi
      ;;
    -d|--dry-run)
      DRYRUN=1
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

SRC=https://raw.githubusercontent.com/LibreOffice/dictionaries/master/
case ${LANG} in
  ar)
    # URL=${SRC}ar/ar
    echo "The Arabic LibreOffice dictionary generates a 1.5 GB wordlist."
    echo "Manually download the wordlist from https://sourceforge.net/projects/arabic-wordlist/ instead"
    echo "and save it to src/resources/dictionaries/ar.txt for use with the split_dictionary.py script."
    exit 1
    ;;
  en)
    URL=${SRC}en/en_US
    ;;
  es)
    URL=${SRC}es/es_MX
    ;;
  fr)
    URL=${SRC}fr_FR/fr
    ;;
  hi)
    URL=${SRC}hi_IN/hi_IN
    ;;
  pt)
    URL=${SRC}pt_BR/pt_BR
    ;;
  ru)
    URL=${SRC}ru_RU/ru_RU
    ;;
  sw)
    URL=${SRC}sw_TZ/sw_TZ
    ;;
  *)
    echo "Unavailable language: ${LANG}"
    echo "Options: ar, en, es, fr, hi, pt, ru, sw"
    exit 1
    ;;
esac

DIR=src/resources/dictionaries/

echo "** Fetching .aff file **"
AFF=${DIR}${LANG}.aff
cmd="curl -o ${AFF} ${URL}.aff"
if [[ $DRYRUN -eq 1 ]] ; then
  echo "$cmd"
else
  $cmd
fi

echo "** Fetching .dic file **"
DIC=${DIR}${LANG}.dic
cmd="curl -o ${DIC} ${URL}.dic"
if [[ $DRYRUN -eq 1 ]] ; then
  echo "$cmd"
else
  $cmd
fi

echo "** Converting to .txt wordlist **"
TXT=${DIR}${LANG}.txt
cmd="npm run wordlist -- ${DIC} -po ${TXT}"
if [[ $DRYRUN -eq 1 ]] ; then
  echo "$cmd"
else
  $cmd
fi
echo "** Wordlist saved to ${TXT} **"

if [[ $DRYRUN -eq 1 ]] ; then
  echo "rm $AFF"
  echo "rm $DIC"
else
  rm $AFF
  rm $DIC
fi
echo "** Deleted .aff and .dic files **"
