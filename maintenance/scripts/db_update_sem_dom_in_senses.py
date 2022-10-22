#! /usr/bin/env python3

import argparse
import logging
from typing import Any, Dict, List, Optional

from bson.binary import UuidRepresentation
from bson.codec_options import CodecOptions
from bson.objectid import ObjectId
from pymongo import MongoClient
from pymongo.collection import Collection


class SemanticDomainInfo:
    def __init__(self, mongo_id: Optional[ObjectId], guid: str, name: str) -> None:
        self.mongo_id = mongo_id
        self.guid = guid
        self.name = name


domain_info: Dict[str, List[SemanticDomainInfo]] = {}
blank_guid = "00000000-0000-0000-0000-000000000000"


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Restore TheCombine database and backend files from a file in AWS S3.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--host", default="localhost", help="Database hostname")
    parser.add_argument("--port", "-p", default=27017, help="Database connection port")
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Print info while running script."
    )
    return parser.parse_args()


def get_semantic_domain_info(collection: Collection[Dict[str, Any]]) -> None:
    """
    Build a dictionary with pertinent Semantic Domain info.

    The dictionary key is the semantic domain id or abbreviation.
    """

    for sem_dom in collection.find({}):
        mongo_id = sem_dom["_id"]
        id = sem_dom["id"]
        lang = sem_dom["lang"]
        name = sem_dom["name"]
        if not sem_dom["guid"]:
            logging.warning(f"Using blank GUID for {id}, {lang}")
            guid = blank_guid
        else:
            guid = str(sem_dom["guid"])
        info = SemanticDomainInfo(mongo_id, guid, name)
        if id in domain_info:
            domain_info[id].append(info)
        else:
            domain_info[id] = [info]


def get_domain_info(id: str, name: str) -> SemanticDomainInfo:
    """Find the semantic domain info that matches the id and name."""
    if id in domain_info:
        for info in domain_info[id]:
            if name == info.name:
                return info
    logging.warning(f"Using blank GUID for {id} {name}")
    return SemanticDomainInfo(None, blank_guid, name)


def is_obj_id(id: str) -> bool:
    """Test if a string looks like a Mongo ObjectId."""
    try:
        int(id, 16)
    except ValueError:
        return False
    # Check the string length so that ids like 1, 2, etc.
    # are not mistaken for Mongo Ids
    if len(id) < 12:
        return False
    return True


def domain_needs_update(domain: Dict[str, Any]) -> bool:
    """Test the domain to see if any parts of the old structure remain."""

    # Test for keys that need to be removed
    for key in ["Name", "Description"]:
        if key in domain.keys():
            return True
    if "_id" in domain.keys() and not is_obj_id(str(domain["_id"])):
        return True
    # Test for keys that need to be added
    for key in ["id", "name", "guid", "lang"]:
        if key not in domain.keys():
            return True
    return False


def main() -> None:
    args = parse_args()

    logging_level = logging.INFO if args.verbose else logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=logging_level)

    client: MongoClient[Dict[str, Any]] = MongoClient(args.host, args.port)
    db = client.CombineDatabase
    codec_opts: CodecOptions[Dict[str, Any]] = CodecOptions(
        uuid_representation=UuidRepresentation.PYTHON_LEGACY
    )
    semantic_domain_collection = db.get_collection("SemanticDomains", codec_options=codec_opts)
    get_semantic_domain_info(semantic_domain_collection)
    query: Dict[str, Any] = {"senses": {"$elemMatch": {"SemanticDomains": {"$ne": []}}}}
    for collection_name in ["FrontierCollection", "WordsCollection"]:
        updates: Dict[ObjectId, Any] = {}
        curr_collection = db.get_collection(collection_name, codec_options=codec_opts)
        num_docs = curr_collection.count_documents(query)
        total_docs = curr_collection.count_documents({})
        logging.info(f"Checking {num_docs}/{total_docs} documents in {collection_name}.")
        for word in curr_collection.find(query):
            found_updates = False
            for sense in word["senses"]:
                if len(sense["SemanticDomains"]) > 0:
                    for domain in sense["SemanticDomains"]:
                        if domain_needs_update(domain):
                            domain["name"] = domain["Name"]
                            domain["id"] = domain["_id"]
                            this_domain = get_domain_info(domain["id"], domain["name"])
                            domain["guid"] = this_domain.guid
                            domain["lang"] = ""
                            domain["_id"] = this_domain.mongo_id
                            domain.pop("Name", None)
                            domain.pop("Description", None)
                            found_updates = True
            if found_updates:
                updates[ObjectId(word["_id"])] = word
        # apply the updates
        logging.info(f"Updating {len(updates)}/{total_docs} documents in {collection_name}.")
        for obj_id, update in updates.items():
            curr_collection.update_one({"_id": obj_id}, {"$set": update})


if __name__ == "__main__":
    main()
