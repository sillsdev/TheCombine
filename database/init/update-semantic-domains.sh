#! /usr/bin/bash
# A partial import leaves the collections non-empty but incomplete, so record
# completion here and only on success.  Doing it here rather than in the caller
# means a manual run also counts, and stops the next container start from
# redoing the whole import.
set -eo pipefail

mongoimport -d CombineDatabase -c SemanticDomainTree /data/semantic-domains/tree.json --mode=merge --upsertFields=id,guid,lang
mongoimport -d CombineDatabase -c SemanticDomains /data/semantic-domains/nodes.json --mode=merge --upsertFields=id,guid,lang

mongosh --quiet --host 127.0.0.1 --eval "db.getSiblingDB('CombineDatabase').SemanticDomainImportStatus.replaceOne({ _id: 'semantic-domains' }, { _id: 'semantic-domains', completed: true }, { upsert: true });"
