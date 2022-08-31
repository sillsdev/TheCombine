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
SemDomainMap = Dict[str, SemanticDomain]
SemDomainFullMap = Dict[str, SemanticDomainFull]
SemDomainTreeMap = Dict[str, SemanticDomainTreeNode]

# Global variables to collect the results of our parsing
domain_list: List[SemanticDomainFull] = []
domain_tree: Dict[str, SemDomainTreeMap] = {}


def parse_args() -> argparse.Namespace:
    """Parse user command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate mongo import files for semantic domain data.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("xmlfile", help="Input XML file that defines the semantic domains.")
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Print detailed progress information."
    )
    parser.add_argument("--debug", "-d", action="store_true", help="Print debugging information.")
    return parser.parse_args()


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


def fill_missing_fields(domains: SemDomainFullMap) -> None:
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
    domains: SemDomainFullMap,
    tree_nodes: SemDomainTreeMap,
    parent: SemDomainTreeMap,
    prev: SemDomainMap,
) -> None:
    """
    Complete the fields for the tree nodes and save in the global structures.

    This routine performs the following operations:
    for the domain objects of each language
    - creates a tree node from the domain object
    - sets the parent field in the tree node
    - sets the previous field in the tree node
    - sets the next field in the tree node that corresponds to the previous node
    - saves the domain object in the global list, domain_list
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
        domain_list.append(domains[lang])
    for lang, item in tree_nodes.items():
        domain_tree[lang][item.id] = item


def get_sem_doms(
    node: ElementTree.Element, parent: SemDomainTreeMap, prev: SemDomainMap
) -> SemDomainMap:
    """
    Recursively parse domains and sub-domains.

    The domains and sub-domains that are extracted by get_sem_doms are placed into two global
    structures:
    1. domain_list is a list of SemanticDomainFull elements that contain the full information
       about the domain.
    2. domain_tree is a two-dimensional dict of SemanticDomainTreeNode elements that is keyed
       by language and semantic domain id string.  Each element in the domain_tree has basic
       information about the node and its neighboring nodes in the tree.
    """
    # Check for GUID
    domain_set: SemDomainFullMap = {}
    tree_set: SemDomainTreeMap = {}
    return_set: SemDomainMap = {}
    has_sub_domains = False
    guid = UUID(node.attrib["guid"])
    for field in node:
        if field.tag == "Name":
            for name_node in field:
                lang, name_text = get_auni_text(name_node)
                domain_set[lang] = SemanticDomainFull(guid, lang, name_text)
        elif field.tag == "Abbreviation":
            for abbrev_node in field:
                lang, id_text = get_auni_text(abbrev_node)
                logging.info(f"id[{lang}]='{id_text}'")
                domain_set[lang].id = id_text
        elif field.tag == "Description":
            for descr_node in field:
                lang, description = get_astr_text(descr_node)
                domain_set[lang].description = "\n".join(description)
        elif field.tag == "Questions":
            questions = get_questions(field)
            for lang in questions:
                domain_set[lang].questions.extend(questions[lang])
        elif field.tag == "SubPossibilities":
            has_sub_domains = True
            # Check the domain_set that was created.  If only the English version has text,
            # copy the English to the non-English entry
            fill_missing_fields(domain_set)
            # Create the nodes for the domain tree from the info in the
            # current domain nodes
            save_domain(domain_set, tree_set, parent, prev)
            prev_sub_domain: SemDomainMap = {}
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


def main() -> None:
    args = parse_args()
    xmlfile = Path(args.xmlfile).resolve()
    # setup logging levels
    if args.debug:
        log_level = logging.DEBUG
    elif args.verbose:
        log_level = logging.INFO
    else:
        log_level = logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)
    logging.info(f"Parsing {xmlfile}")
    tree = ElementTree.parse(xmlfile)
    root = tree.getroot()
    # Find the languages defined in this file
    for elem in root:
        if elem.tag == "Name":
            # Languages can be found in the Name element
            for sub_elem in elem:
                if sub_elem.tag == "AUni" and "ws" in sub_elem.attrib:
                    lang = sub_elem.attrib["ws"]
                    if lang not in domain_tree:
                        domain_tree[lang] = {}
                    logging.info(f"sub-element attritutes: {sub_elem.attrib}")
        elif elem.tag == "Possibilities":
            # Parse possible domains defined in the file
            prev_domain: SemDomainMap = {}
            for domain in elem:
                prev_domain = get_sem_doms(domain, {}, prev_domain)

    logging.info(f"Number of Domains: {len(domain_list)}")
    for lang in domain_tree:
        logging.info(f"Number of {lang} Tree Nodes: {len(domain_tree[lang])}")


if __name__ == "__main__":
    main()
