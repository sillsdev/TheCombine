#! /usr/bin/env python3
"""
Create data files for importing the Semantic Domain information into the Mongo database.

There are 2 files that are created for each language:
 - <lang>/tree.json -  the semantic domain hierarchy; it contains the data for the
                       SemanticDomainTree collection
 - <lang>/nodes.json - the contents of each element in the hierarchy; it contains the
                       data for the SemanticDomainNodes collection
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path
from typing import Dict, List, Tuple
from uuid import UUID
from xml.etree import ElementTree

from semantic_domains import (
    DomainQuestion,
    SemanticDomain,
    SemanticDomainFull,
    SemanticDomainTreeNode,
)

# Define some type aliases to (hopefully) improve readability
SemDomMap = Dict[str, SemanticDomain]
SemDomFullMap = Dict[str, SemanticDomainFull]
SemDomTreeMap = Dict[str, SemanticDomainTreeNode]

# Global variables to collect the results of our parsing
domain_nodes: Dict[str, SemDomFullMap] = {}
domain_tree: Dict[str, SemDomTreeMap] = {}

project_dir = Path(__file__).resolve().parent


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate mongo import files for semantic domain data.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "input_files",
        metavar="xmlfile",
        nargs="+",
        help="Input XML file that defines the semantic domains.",
    )
    default_output_dir = project_dir / "semantic_domains" / "json"
    parser.add_argument(
        "--output-dir",
        "-o",
        default=str(default_output_dir),
        help="Default directory for the output files.",
    )
    parser.add_argument(
        "--question-mode",
        "-q",
        choices=["full", "flat"],
        default="flat",
        help="Structure to be used for the domain questions.",
    )
    logging_group = parser.add_mutually_exclusive_group()
    logging_group.add_argument(
        "--verbose", "-v", action="store_true", help="Print detailed progress information."
    )
    logging_group.add_argument(
        "--debug", "-d", action="store_true", help="Print debugging information."
    )
    args = parser.parse_args()
    args.output_dir = Path(args.output_dir).resolve()
    for i, input in enumerate(args.input_files):
        args.input_files[i] = Path(input).resolve()
    return args


def get_auni_text(node: ElementTree.Element) -> Tuple[str, str]:
    """Returns the language and text for an AUni element."""
    if node.tag != "AUni":
        raise (ValueError("Expected AUni element"))
    return (node.attrib["ws"], node.text if node.text is not None else "")


def get_astr_text(node: ElementTree.Element) -> Tuple[str, List[str]]:
    """
    Returns the language and text of an AStr element.

    The text returned is a concatenation of the text of all Run
    sub-elements.
    """
    if node.tag != "AStr":
        raise (ValueError("Expected AStr element"))
    astr_text: List[str] = []
    for sub_node in node:
        if sub_node.tag == "Run":
            if sub_node.text:
                astr_text.append(sub_node.text)
    return (node.attrib["ws"], astr_text)


def get_questions(node: ElementTree.Element) -> Dict[str, List[DomainQuestion]]:
    """
    Gets a list of DomainQuestion objects from the CmDomainQ element.

    The DomainQuestion consists of the question text, the example words and
    the example sentences.
    """
    results: Dict[str, List[DomainQuestion]] = {}
    for cm_domain_q in node:
        if cm_domain_q.tag == "CmDomainQ":
            this_question: Dict[str, DomainQuestion] = {}
            for quest_field in cm_domain_q:
                if quest_field.tag == "Question":
                    for auni_node in quest_field:
                        lang, question = get_auni_text(auni_node)
                        this_question[lang] = DomainQuestion(question, "", "")
                elif quest_field.tag == "ExampleWords":
                    for auni_node in quest_field:
                        lang, words = get_auni_text(auni_node)
                        this_question[lang].example_words = words
                elif quest_field.tag == "ExampleSentences":
                    for astr_node in quest_field:
                        lang, sentences = get_astr_text(astr_node)
                        if len(sentences) > 0:
                            this_question[lang].example_sentences = "\n".join(sentences)
            for lang in this_question:
                if lang in results:
                    results[lang].append(this_question[lang])
                else:
                    results[lang] = [this_question[lang]]
    return results


def fill_missing_fields(domains: SemDomFullMap) -> None:
    """
    Fill in blank fields from the value for English.

    This assumes that there is an English value available and that it is defined
    in the XML source file before any other languages.
    """
    for lang in domains:
        if lang == "en":
            continue
        if not domains[lang].name:
            domains[lang].name = domains["en"].name
        if not domains[lang].id:
            domains[lang].id = domains["en"].id
        if not domains[lang].description:
            domains[lang].description = domains["en"].description


def save_domain(
    domains: SemDomFullMap,
    tree_nodes: SemDomTreeMap,
    parent: SemDomTreeMap,
    prev: SemDomMap,
) -> None:
    """
    Complete the fields for the tree nodes and save in the global structures.

    This routine performs the following operations:
    for the domain objects of each language
    - creates a tree node from the domain object
    - sets the parent field in the tree node
    - sets the previous field in the tree node
    - sets the next field in the tree node that corresponds to the previous node
    - saves the domain object in the global structure, domain_nodes
    - saves the tree node in the global structure, domain_tree
    """

    for lang in domains:
        domain_item = domains[lang]
        tree_nodes[lang] = domain_item.to_semantic_domain_tree_node()
        if lang in parent:
            tree_nodes[lang].parent = parent[lang].to_semantic_domain()
            parent[lang].children.append(domain_item.to_semantic_domain())
        if lang in prev:
            # set the previous link in the current domain
            tree_nodes[lang].prev = prev[lang]
            # set the next link in the previous domain
            prev_id = prev[lang].id
            domain_tree[lang][prev_id].next = tree_nodes[lang].to_semantic_domain()
        domain_nodes[lang][domain_item.id] = domain_item
    for lang, item in tree_nodes.items():
        domain_tree[lang][item.id] = item


def get_sem_doms(node: ElementTree.Element, parent: SemDomTreeMap, prev: SemDomMap) -> SemDomMap:
    """
    Recursively parse domains and sub-domains.

    The domains and sub-domains that are extracted by get_sem_doms are placed into two global
    structures:
    1. domain_nodes is a list of SemanticDomainFull elements that contain the full information
       about the domain.
    2. domain_tree is a two-dimensional dict of SemanticDomainTreeNode elements that is keyed
       by language and semantic domain id string.  Each element in the domain_tree has basic
       information about the node and its neighboring nodes in the tree.
    """
    # Check for GUID
    domain_set: SemDomFullMap = {}
    tree_set: SemDomTreeMap = {}
    return_set: SemDomMap = {}
    has_sub_domains = False
    if "guid" in node.attrib:
        guid = UUID(node.attrib["guid"])
    else:
        guid = None
    for field in node:
        if field.tag == "Name":
            for name_node in field:
                lang, name_text = get_auni_text(name_node)
                domain_set[lang] = SemanticDomainFull(guid, lang, name_text)
        elif field.tag == "Abbreviation":
            for abbrev_node in field:
                lang, id_text = get_auni_text(abbrev_node)
                logging.debug(f"id[{lang}]='{id_text}'")
                domain_set[lang].id = id_text
        elif field.tag == "Description":
            for descr_node in field:
                lang, description = get_astr_text(descr_node)
                domain_set[lang].description = "\n".join(description)
        elif field.tag == "Questions":
            questions = get_questions(field)
            for lang in questions:
                domain_set[lang].questions.extend(questions[lang])
        elif (field.tag == "Possibilities") or (field.tag == "SubPossibilities"):
            has_sub_domains = True
            # Check the domain_set that was created.  If only the English version has text,
            # copy the English to the non-English entry
            fill_missing_fields(domain_set)
            # Create the nodes for the domain tree from the info in the
            # current domain nodes
            save_domain(domain_set, tree_set, parent, prev)
            prev_sub_domain: SemDomMap = {}
            for sub_domain in field:
                prev_sub_domain = get_sem_doms(sub_domain, tree_set, prev_sub_domain)
    if not has_sub_domains:
        # Check the domain_set that was created.  If only the English version has text,
        # copy the English to the non-English entry
        fill_missing_fields(domain_set)
        # Create the nodes for the domain tree from the info in the
        # current domain nodes
        save_domain(domain_set, tree_set, parent, prev)
    for lang in domain_set:
        return_set[lang] = domain_set[lang].to_semantic_domain()
    return return_set


def write_json(output_dir: Path) -> None:
    """
    Serialize the domain_nodes and domain_tree structures to JSON files.

    The data structures are serialized to a file of contatenated JSON elements;
    not an array of JSON elements nor a nested structure.  This allows the files
    to be used by mongoimport.
    """
    if not output_dir.is_dir():
        output_dir.mkdir()
    output_file = output_dir / "nodes.json"
    with open(output_file, "w") as file:
        for lang in domain_nodes:
            for id in domain_nodes[lang]:
                file.write(f"{domain_nodes[lang][id].to_json()}\n")
    output_file = output_dir / "tree.json"
    with open(output_file, "w") as file:
        for lang in domain_tree:
            for id in domain_tree[lang]:
                file.write(f"{domain_tree[lang][id].to_json()}\n")


def generate_semantic_domains(
    input_files: List[Path], output_dir: Path, *, flatten_questions: bool = True
) -> None:
    for xmlfile in input_files:
        logging.info(f"Parsing {xmlfile}")
        tree = ElementTree.parse(xmlfile)
        root = tree.getroot()
        # Find the languages defined in this file
        # We need to do this first so that we know which keys
        # to create in the global structures.
        for elem in root:
            if elem.tag == "Name":
                # Languages can be found in the Name element
                for sub_elem in elem:
                    lang, name_text = get_auni_text(sub_elem)
                    if lang not in domain_tree:
                        domain_tree[lang] = {}
                    if lang not in domain_nodes:
                        domain_nodes[lang] = {}
        # Parse possible domains defined in the file
        prev_domain: SemDomMap = {}
        prev_domain = get_sem_doms(root, {}, prev_domain)

    for lang in domain_nodes:
        logging.info(f"Number of {lang} Domains: {len(domain_nodes[lang])}")
    for lang in domain_tree:
        logging.info(f"Number of {lang} Tree Nodes: {len(domain_tree[lang])}")
    if not flatten_questions:
        SemanticDomainFull.flatten_questions = False
    write_json(output_dir)


def main() -> None:
    args = parse_args()
    # setup logging levels
    if args.debug:
        log_level = logging.DEBUG
    elif args.verbose:
        log_level = logging.INFO
    else:
        log_level = logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)
    generate_semantic_domains(
        args.input_files, args.output_dir, flatten_questions=(args.question_mode == "flat")
    )


if __name__ == "__main__":
    main()
