#! /usr/bin/bash

mongoimport -d CombineDatabase -c SemanticDomainTree /data/semantic-domains/tree.json --mode=merge --upsertFields=id,guid,lang
mongoimport -d CombineDatabase -c SemanticDomains /data/semantic-domains/nodes.json --mode=merge --upsertFields=id,guid,lang
