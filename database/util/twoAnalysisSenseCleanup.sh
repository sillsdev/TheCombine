#!/bin/bash

###############################################################
# Script to merge senses from two different analysis languages
###############################################################

set -e

usage() {
  cat <<USAGE
  Usage: $0 [options]
    Find all words with exactly two senses, each with exactly one gloss in one of two given languages.
    Merge those two senses into a single sense with two glosses, one in each language.
    Note: If the sense with gloss in language B has a grammatical category, it will be lost in the merge.
  Options:
    -h, --help:
          print this message
    -A, --langA:
          (required) one of the two languages
    -B, --langB:
          (required) one of the two languages
    -p, --proj:
          (required) project id
    -d, --dry-run:
          print commands instead of executing them
    -v, --verbose:
          print each line of code before it is executed

  Caveat:
    This script assumes that the backups have been created by the combine-backup
USAGE
}

if [[ $# -eq 0 ]] ; then
  usage
  exit 0
fi

DRYRUN=0
LANGA=
LANGB=
PROJ=
while [[ $# -gt 0 ]] ; do
  arg="$1"
  shift

  case ${arg} in
    -h|--help)
      usage
      exit 0
      ;;
    -A|--langA)
      LANGA=$1
      shift
      if [[ "${LANGA}" =~ [^A-Za-z\-] ]]; then
        echo "The -A/--langA argument must be alphabetic (dashes allowed)"
        exit 1
      fi
      ;;
    -B|--langB)
      LANGB=$1
      shift
      if [[ "${LANGB}" =~ [^A-Za-z\-] ]]; then
        echo "The -B/--langB argument must be alphabetic (dashes allowed)"
        exit 1
      fi
      ;;
    -p|--proj)
      PROJ=$1
      shift
      if [[ "${PROJ}" =~ [^0-9a-f] ]]; then
        echo "The -p/--proj argument must be a hexidecimal id"
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

if [[ -z "${LANGA}" ]]; then
  echo "The -A/--langA argument is require"
  echo "Run this script with -h/--help for usage"
  exit 1
fi
if [[ -z "${LANGB}" ]]; then
  echo "The -B/--langB argument is require"
  echo "Run this script with -h/--help for usage"
  exit 1
fi
if [[ "${LANGA}" == "${LANGB}" ]]; then
  echo "The -A/--langA and -B/--langB arguments must be different"
  echo "Run this script with -h/--help for usage"
  exit 1
fi
if [[ -z "${PROJ}" ]]; then
  echo "The -p/--proj argument is require"
  echo "Run this script with -h/--help for usage"
  exit 1
fi

match1="{\$match:{projectId:\"$PROJ\",senses:{\$size:2},\"senses.0.Glosses\":{\$size:1},\"senses.1.Glosses\":{\$size:1},\"senses.Glosses.Language\":{\$all:[\"$LANGA\",\"$LANGB\"],},},},"
addFields1="{\$addFields:{originalDocument:\"\$\$ROOT\",},},"
fieldA="senseA:{\$arrayElemAt:[{\$filter:{input:\"\$senses\",as:\"sense\",cond:{\$eq:[{\$arrayElemAt:[\"\$\$sense.Glosses.Language\",0],},\"$LANGA\",],},},},0,],},"
fieldB="senseB:{\$arrayElemAt:[{\$filter:{input:\"\$senses\",as:\"sense\",cond:{\$eq:[{\$arrayElemAt:[\"\$\$sense.Glosses.Language\",0],},\"$LANGB\",],},},},0,],},"
addFields2="{\$addFields:{$fieldA$fieldB},},"
addFields3="{\$addFields:{semDomGuidsA:\"\$senseA.SemanticDomains.guid\",semDomGuidsB:\"\$senseB.SemanticDomains.guid\",},},"
match2="{\$match:{\$expr:{\$or:[{\$setIsSubset:[\"\$semDomGuidsA\",\"\$semDomGuidsB\"],},{\$setIsSubset:[\"\$semDomGuidsB\",\"\$semDomGuidsA\"],},],},},},"
fieldD="Definitions:{\$concatArrays:[\"\$senseA.Definitions\",\"\$senseB.Definitions\"],},"
fieldG="Glosses:{\$concatArrays:[\"\$senseA.Glosses\",\"\$senseB.Glosses\"],},"
fieldP="protectReasons:{\$concatArrays:[\"\$senseA.protectReasons\",\"\$senseB.protectReasons\",],},"
fieldS="SemanticDomains:{\$cond:{if:{\$gte:[{\$size:\"\$semDomGuidsA\"},{\$size:\"\$semDomGuidsB\"},],},then:\"\$senseA.SemanticDomains\",else:\"\$senseB.SemanticDomains\",},},"
addFields4="{\$addFields:{\"originalDocument.senses\":{\$mergeObjects:[\"\$senseA\",{$fieldD$fieldG$fieldP$fieldS},],},},},"
replaceRoot="{\$replaceRoot:{newRoot:\"\$originalDocument\",},},"
pipeline=$match1$addFields1$addFields2$addFields3$match2$addFields4$replaceRoot

mergeWords="{\$merge:{into:\"WordsCollection\",on:\"_id\",whenMatched:\"merge\",whenNotMatched:\"discard\",},},"
cmd="mongosh CombineDatabase --eval 'db.FrontierCollection.aggregate([$pipeline$mergeWords])'"
if [[ $DRYRUN -eq 1 ]] ; then
  echo $cmd
else
  $cmd
fi

mergeFrontier="{\$merge:{into:\"FrontierCollection\",on:\"_id\",whenMatched:\"merge\",whenNotMatched:\"discard\",},},"
cmd="mongosh CombineDatabase --eval 'db.FrontierCollection.aggregate([$pipeline$mergeFrontier])'"
if [[ $DRYRUN -eq 1 ]] ; then
  echo $cmd
else
  $cmd
fi
