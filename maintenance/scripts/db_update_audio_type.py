#! /usr/bin/env python3

import argparse
import logging
from typing import Any, Dict

from bson.binary import UuidRepresentation
from bson.codec_options import CodecOptions
from bson.objectid import ObjectId
from pymongo import MongoClient


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Convert all audio entries from string to a pronunciation object",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--host", default="localhost", help="Database hostname")
    parser.add_argument("--port", "-p", default=27017, help="Database connection port")
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Print info while running script."
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    logging_level = logging.INFO if args.verbose else logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=logging_level)

    client: MongoClient[Dict[str, Any]] = MongoClient(args.host, args.port)
    db = client.CombineDatabase
    codec_opts: CodecOptions[Dict[str, Any]] = CodecOptions(
        uuid_representation=UuidRepresentation.PYTHON_LEGACY
    )
    
    query: Dict[str, Any] = {"audio": {"$ne": []}}
    for collection_name in ["FrontierCollection", "WordsCollection"]:
        updates: Dict[ObjectId, Any] = {}
        curr_collection = db.get_collection(collection_name, codec_options=codec_opts)
        total_docs = curr_collection.count_documents({})
        for word in curr_collection.find(query):
            newAudio = []
            for fileName in word["audio"]:
                if type(fileName) == "string":
                    newAudio.append({"speakerId": "", "protected": False, "fileName": fileName})
                else:
                    newAudio.append(fileName)
            word["audio"] = newAudio
            updates[ObjectId(word["_id"])] = word
        logging.info(f"Updating {len(updates)}/{total_docs} documents in {collection_name}.")
        for obj_id, update in updates.items():
            curr_collection.update_one({"_id": obj_id}, {"$set": update})


if __name__ == "__main__":
    main()
