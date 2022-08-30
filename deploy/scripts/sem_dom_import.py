#! /usr/bin/env python3
"""
Create data files for importing the Semantic Domain information into the Mongo database.

There are 2 files that are created for each language:
 - <lang>/tree.json - the semantic domain hierarchy; it contains the data for the SemanticDomainTree collection
 - <lang>/nodes.json - the contents of each element in the hierarchy; it contains the data for the SemanticDomainNodes collection
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from uuid import UUID
import xml.etree.ElementTree as ET

from semantic_domains import (
    DomainQuestion,
    SemanticDomain,
    SemanticDomainFull,
    SemanticDomainTreeNode,
)

domain_list: List[SemanticDomainFull] = []
domain_tree: Dict[str, Dict[str, SemanticDomainTreeNode]] = {}


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


def get_auni_text(node: ET.Element) -> Tuple[str, str]:
    if node.tag != "AUni":
        raise (ValueError("Expected AUni element"))
    return (node.attrib["ws"], node.text)


def get_astr_text(node: ET.Element) -> Tuple[str, List[str]]:
    if node.tag != "AStr":
        raise (ValueError("Expected AStr element"))
    astr_text: List[str] = []
    for sub_node in node:
        if sub_node.tag == "Run":
            if sub_node.text:
                astr_text.append(sub_node.text)
    return (node.attrib["ws"], astr_text)


def get_questions(node: ET.Element) -> Dict[str, List[DomainQuestion]]:
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


def fill_missing_fields(domains: Dict[str, SemanticDomainFull]) -> None:
    for lang in domains:
        if lang == "en":
            continue
        if not domains[lang].name:
            domains[lang].name = domains["en"].name
        if not domains[lang].id:
            domains[lang].id = domains["en"].id
        if not domains[lang].description:
            domains[lang].description = domains["en"].description


#        populate_tree_set(domain_set, tree_set, parent)


def populate_tree_set(
    domains: Dict[str, SemanticDomainFull],
    tree_nodes: Dict[str, SemanticDomainTreeNode],
    parent: Dict[str, SemanticDomainTreeNode],
) -> None:
    for lang in domains:
        domain_item = domains[lang]
        tree_nodes[lang] = SemanticDomainTreeNode(
            domain_item.guid, domain_item.lang, domain_item.name, domain_item.id
        )
        if lang in parent:
            tree_nodes[lang].parent = SemanticDomain(
                parent[lang].guid, lang, parent[lang].name, parent[lang].id
            )
            parent[lang].children.append(
                SemanticDomain(
                    domain_item.guid, domain_item.lang, domain_item.name, domain_item.id
                )
            )


def get_sem_doms(node: ET.Element, parent: Dict[str, SemanticDomainTreeNode]):
    # Check for GUID
    domain_set: Dict[str, SemanticDomainFull] = {}
    tree_set: Dict[str, SemanticDomainTreeNode] = {}
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
            populate_tree_set(domain_set, tree_set, parent)
            for sub_domain in field:
                get_sem_doms(sub_domain, tree_set)
    if not has_sub_domains:
        # Check the domain_set that was created.  If only the English version has text,
        # copy the English to the non-English entry
        fill_missing_fields(domain_set)
        # Create the nodes for the domain tree from the info in the
        # current domain nodes
        populate_tree_set(domain_set, tree_set, parent)
    for lang in domain_set:
        domain_list.append(domain_set[lang])
    for lang, item in tree_set.items():
        domain_tree[lang][item.id] = item


def main() -> None:
    args = parse_args()
    xmlfile = Path(args.xmlfile).resolve()
    if args.debug:
        log_level = logging.DEBUG
    elif args.verbose:
        log_level = logging.INFO
    else:
        log_level = logging.WARNING
    logging.basicConfig(format="%(levelname)s:%(message)s", level=log_level)
    logging.info(f"Parsing {xmlfile}")
    tree = ET.parse(xmlfile)
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
            for domain in elem:
                get_sem_doms(domain, {})

    logging.info(f"Number of Domains: {len(domain_list)}")
    for lang in domain_tree:
        logging.info(f"Number of {lang} Tree Nodes: {len(domain_tree[lang])}")
        for node in domain_tree[lang]:
            logging.debug(f"node: {node}")


if __name__ == "__main__":
    main()
