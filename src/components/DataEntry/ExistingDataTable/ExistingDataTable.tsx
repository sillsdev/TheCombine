import React from "react";
import { Word, SemanticDomain, Gloss } from "../../../types/word";
import { getWordsFromBackend } from "../DataEntryTable/DataEntryTable";
import { ImmutableExistingData } from "./ImmutableExistingData/ImmutableExistingData";

interface DomainWord {
  word: Word;
  gloss: Gloss;
}

interface ExistingDataTableProps {
  domain: SemanticDomain;
}

interface ExistingDataTableStates {
  existingWords: Word[];
  domainWords: DomainWord[];
}

function filterWordsByDomain(
  words: Word[],
  domain: SemanticDomain
): DomainWord[] {
  let domainWords: DomainWord[] = [];
  let domainName: String = domain.name;
  let domainMatched: Boolean = false;

  for (let currentWord of words) {
    for (let currentSense of currentWord.senses) {
      domainMatched = false;
      for (let currentDomain of currentSense.semanticDomains) {
        if (currentDomain.name === domainName) {
          domainMatched = true;
        }
      }
      if (domainMatched) {
        for (let currentGloss of currentSense.glosses) {
          let newDomainWord: DomainWord = {
            word: currentWord,
            gloss: currentGloss,
          };
          domainWords.push(newDomainWord);
        }
      }
    }
  }

  return domainWords;
}

function sortDomainWordByGloss(existingData: ExistingDataTable): DomainWord[] {
  let domainWords: DomainWord[] = filterWordsByDomain(
    existingData.state.existingWords,
    existingData.props.domain
  );
  domainWords.sort((a, b) =>
    a.gloss.def.length < 1 ? 1 : a.gloss.def < b.gloss.def ? 1 : -1
  );
  return domainWords;
}
/*Displays previously entered data in a panel to the right of the DataEntryTable */
export class ExistingDataTable extends React.Component<
  ExistingDataTableProps,
  ExistingDataTableStates
> {
  constructor(props: ExistingDataTableProps) {
    super(props);
    this.state = {
      existingWords: [],
      domainWords: [],
    };
  }

  async componentDidMount() {
    let allWords = await getWordsFromBackend();
    this.setState({
      existingWords: allWords,
      domainWords: sortDomainWordByGloss(this),
    });
  }

  async updateTable() {
    let allWords = await getWordsFromBackend();
    this.setState({
      existingWords: allWords,
      domainWords: sortDomainWordByGloss(this),
    });
  }
  /*Make an interface that has the Word and an array of numbers to reference the senses desired to be displayed*/

  render() {
    this.updateTable();
    let domainWords: DomainWord[] = this.state.domainWords;
    if (domainWords !== []) {
      return (
        <div>
          {domainWords.map((domainWords) => (
            <ImmutableExistingData
              key={domainWords.word.id}
              vernacular={domainWords.word.vernacular}
              gloss={domainWords.gloss.def}
            />
          ))}
        </div>
      );
    }
    return null;
  }
}
