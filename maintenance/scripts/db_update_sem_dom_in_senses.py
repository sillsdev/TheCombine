#! /usr/bin/env python3

import argparse
import logging
from typing import Any, Dict
from uuid import UUID

from bson.binary import UuidRepresentation
from bson.codec_options import CodecOptions
from bson.objectid import ObjectId
from pymongo import MongoClient
from pymongo.collection import Collection


class SemanticDomainInfo:
    def __init__(self, guid: UUID, name: str) -> None:
        self.guid = guid
        self.names = [name]


domain_info: Dict[str, SemanticDomainInfo] = {}
blank_guid = UUID("{00000000-0000-0000-0000-000000000000}")


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
        id = sem_dom["id"]
        lang = sem_dom["lang"]
        name = sem_dom["name"]
        if sem_dom["guid"]:
            guid = UUID(sem_dom["guid"])
        else:
            logging.warning(f"Using blank GUID for {id}, {lang}")
            guid = blank_guid
        if id in domain_info:
            domain_info[id].names.append(name)
            if guid != domain_info[id].guid:
                logging.warning(f"Multiple semantic domain guids for {id}.")
        else:
            domain_info[id] = SemanticDomainInfo(guid, name)


def get_guid(id: str, name: str) -> UUID:
    if id in domain_info:
        if name in domain_info[id].names:
            return domain_info[id].guid
    logging.warning(f"Using blank GUID for {id} {name}")
    return blank_guid


def domain_needs_update(domain: Dict[str, Any]) -> bool:
    """Test the domain to see if any parts of the old structure remain."""

    # Test for keys that need to be removed
    for key in ["_id", "Name", "Description"]:
        if key in domain.keys():
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
                            domain["guid"] = get_guid(domain["id"], domain["name"])
                            domain["lang"] = ""
                            domain.pop("_id", None)
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
