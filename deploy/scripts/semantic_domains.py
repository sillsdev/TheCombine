from __future__ import annotations

from dataclasses import dataclass
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from uuid import UUID


@dataclass
class DomainQuestion:
    question: str
    example_words: str
    example_sentences: str


class SemanticDomain:
    def __init__(self, _guid: UUID, _lang: str, _name: str, _id: str = "") -> None:
        self.guid = _guid
        self.lang = _lang
        self.name = _name
        self.id = _id


class SemanticDomainFull(SemanticDomain):
    def __init__(self, _guid: UUID, _lang: str, _name: str, _id: str = "") -> None:
        super().__init__(_guid, _lang, _name, _id)
        self.description = ""
        self.questions: List[DomainQuestion] = []

    def to_semantic_domain(self) -> SemanticDomain:
        return SemanticDomain(self.guid, self.lang, self.name, self.id)

    def to_semantic_domain_tree_node(self) -> SemanticDomainTreeNode:
        return SemanticDomainTreeNode(self.guid, self.lang, self.name, self.id)


class SemanticDomainTreeNode(SemanticDomain):
    def __init__(self, _guid: UUID, _lang: str, _name: str, _id: str = ""):
        super().__init__(_guid, _lang, _name, _id)
        self.parent: Optional[SemanticDomain] = None
        self.children: List[SemanticDomain] = []
        self.prev: Optional[SemanticDomain] = None
        self.next: Optional[SemanticDomain] = None

    def to_semantic_domain(self) -> SemanticDomain:
        return SemanticDomain(self.guid, self.lang, self.name, self.id)
