from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Dict, List, Optional
from uuid import UUID


@dataclass
class DomainQuestion:
    question: str
    example_words: str
    example_sentences: str


class SemanticDomain:
    def __init__(self, _guid: Optional[UUID], _lang: str, _name: str, _id: str = "") -> None:
        self.guid = _guid
        self.lang = _lang
        self.name = _name
        self.id = _id

    def to_json(self) -> str:
        data = {
            "guid": "" if self.guid is None else str(self.guid),
            "lang": self.lang,
            "name": self.name,
            "id": self.id,
        }
        return json.dumps(data, indent=4)

    def to_dict(self) -> Dict[str, str]:
        return {
            "guid": "" if self.guid is None else str(self.guid),
            "lang": self.lang,
            "name": self.name,
            "id": self.id,
        }


class SemanticDomainFull(SemanticDomain):
    flatten_questions = True

    def __init__(self, _guid: Optional[UUID], _lang: str, _name: str, _id: str = "") -> None:
        super().__init__(_guid, _lang, _name, _id)
        self.description = ""
        self.questions: List[DomainQuestion] = []

    def to_semantic_domain(self) -> SemanticDomain:
        return SemanticDomain(self.guid, self.lang, self.name, self.id)

    def to_semantic_domain_tree_node(self) -> SemanticDomainTreeNode:
        return SemanticDomainTreeNode(self.guid, self.lang, self.name, self.id)

    def to_json(self) -> str:
        full_question_list: List[Dict[str, str]] = []
        flat_question_list: List[str] = []
        for item in self.questions:
            if SemanticDomainFull.flatten_questions:
                flat_question_list.append(item.question)
            else:
                full_question_list.append(
                    {
                        "question": item.question,
                        "example_words": item.example_words,
                        "example_sentences": item.example_sentences,
                    }
                )
        data = {
            "guid": "" if self.guid is None else str(self.guid),
            "lang": self.lang,
            "name": self.name,
            "id": self.id,
            "description": self.description,
            "questions": (
                flat_question_list if SemanticDomainFull.flatten_questions else full_question_list
            ),
        }
        return json.dumps(data, indent=4)


class SemanticDomainTreeNode(SemanticDomain):
    def __init__(self, _guid: Optional[UUID], _lang: str, _name: str, _id: str = ""):
        super().__init__(_guid, _lang, _name, _id)
        self.parent: Optional[SemanticDomain] = None
        self.children: List[SemanticDomain] = []
        self.prev: Optional[SemanticDomain] = None
        self.next: Optional[SemanticDomain] = None

    def to_semantic_domain(self) -> SemanticDomain:
        return SemanticDomain(self.guid, self.lang, self.name, self.id)

    def to_json(self) -> str:
        children: List[Dict[str, str]] = []
        for item in self.children:
            children.append(
                {
                    "guid": "" if item.guid is None else str(item.guid),
                    "lang": item.lang,
                    "name": item.name,
                    "id": item.id,
                }
            )
        data = {
            "guid": "" if self.guid is None else str(self.guid),
            "lang": self.lang,
            "name": self.name,
            "id": self.id,
            "parent": {} if self.parent is None else self.parent.to_dict(),
            "prev": {} if self.prev is None else self.prev.to_dict(),
            "next": {} if self.next is None else self.next.to_dict(),
            "children": children,
        }
        return json.dumps(data, indent=4)
