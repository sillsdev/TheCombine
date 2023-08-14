#!/bin/bash

######################################################
# Script to fetch dictionary files from
# cgit.freedesktop.org/libreoffice/dictionaries/tree/
# and convert them into wordlists
######################################################

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
    -d, --dry-run:
          print the commands instead of executing them
    -v, --verbose:
          print extra internal variable values to help with debugging

  Caveats:
    This script assumes internet access and hunspell reader has been installed with npm
USAGE
}

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

SRC=https://cgit.freedesktop.org/libreoffice/dictionaries/plain/
case ${LANG} in
  ar)
    # URL=${SRC}ar/ar
    echo "Manually download the wordlist from https://sourceforge.net/projects/arabic-wordlist/"
    exit 1
    ;;
  en)
    URL=${SRC}en/en_US
    ;;
  es)
    URL=${SRC}es/es
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
    exit 1
    ;;
esac

DIR=src/resources/dictionaries/

echo "Fetching .aff file"
AFF=${DIR}${LANG}.aff
cmd="curl -o ${AFF} ${URL}.aff"
if [[ $DRYRUN -eq 1 ]] ; then
  echo "$cmd"
else
  $cmd
fi

echo "Fetching .dic file"
DIC=${DIR}${LANG}.dic
cmd="curl -o ${DIC} ${URL}.dic"
if [[ $DRYRUN -eq 1 ]] ; then
  echo "$cmd"
else
  $cmd
fi

echo "Converting to .txt wordlist"
cmd="npm run wordlist -- ${DIC} -po ${DIR}${LANG}.txt"
if [[ $DRYRUN -eq 1 ]] ; then
  echo "$cmd"
else
  $cmd
fi

rm $AFF
rm $DIC
