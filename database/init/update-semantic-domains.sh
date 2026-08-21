#! /usr/bin/bash
# The caller records the import as complete only if this script succeeds, so a
# failed import must not be reported as success.
set -eo pipefail

mongoimport -d CombineDatabase -c SemanticDomainTree /data/semantic-domains/tree.json --mode=merge --upsertFields=id,guid,lang
mongoimport -d CombineDatabase -c SemanticDomains /data/semantic-domains/nodes.json --mode=merge --upsertFields=id,guid,lang
