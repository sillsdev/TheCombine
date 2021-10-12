const fs = require("fs"),
  xml2js = require("xml2js"),
  path = require("path");
const args = process.argv.slice(2);
if (args.length > 0) {
  const parser = new xml2js.Parser();
  const xmlLocation = path.normalize(args[0]);
  fs.readFile(xmlLocation, function (err: Error, data: string) {
    if (err) throw err;
    parser.parseString(data, function (err: Error, result: any) {
      if (err) throw err;
      const foreignLanguage: string = result.List.Name[0].AUni[1].$.ws;
      const parsedDomain = result.List.Possibilities[0].CmSemanticDomain;
      let cleanedEnglishDomain: SemanticDomainWithSubdomains[] = [],
        cleanedForeignDomain: SemanticDomainWithSubdomains[] = [];

      generateCleanJSON(
        parsedDomain,
        cleanedEnglishDomain,
        cleanedForeignDomain
      );

      fs.writeFile(
        path.normalize("./src/resources/semantic-domains/en.json"),
        JSON.stringify(cleanedEnglishDomain, null, "  "),
        (err: Error) => {
          if (err) throw err;
        }
      );

      fs.writeFile(
        path.normalize(
          `./src/resources/semantic-domains/${foreignLanguage}.json`
        ),
        JSON.stringify(cleanedForeignDomain, null, "  "),
        (err: Error) => {
          if (err) throw err;
        }
      );
    });
  });
  console.log("Finished import to ./src/resources/semantic-domains/");
} else {
  console.log(
    "Please specify the relative file location to import, e.g. npm run import-sem-doms -- <XML_FILE_PATH>"
  );
}

class SemanticDomainWithSubdomains {
  name: string;
  id: string;
  description: string;
  questions: string[];
  subdomains: SemanticDomainWithSubdomains[];
}

export function generateCleanJSON(
  domain: any[],
  enDom: SemanticDomainWithSubdomains[],
  fnDom: SemanticDomainWithSubdomains[]
) {
  domain.forEach(function (subDomain) {
    const newEnglishEntry = new SemanticDomainWithSubdomains();
    const newForeignEntry = new SemanticDomainWithSubdomains();

    newEnglishEntry.name = subDomain.Name[0].AUni[0]._;
    newEnglishEntry.id = subDomain.Abbreviation[0].AUni[0]._;
    newEnglishEntry.description =
      subDomain.Description[0].AStr[0].Run[0]._.replace(/\s+/g, " ");
    newEnglishEntry.questions = [];
    newEnglishEntry.subdomains = [];

    //If there is no foreign entry for name or description, use the English as default
    newForeignEntry.name = subDomain.Name[0].AUni[1].hasOwnProperty("_")
      ? subDomain.Name[0].AUni[1]._
      : newEnglishEntry.name;
    newForeignEntry.id = subDomain.Abbreviation[0].AUni[0]._;
    newForeignEntry.description =
      subDomain.Description[0].AStr[1].Run[0].hasOwnProperty("_")
        ? subDomain.Description[0].AStr[1].Run[0]._.replace(/\s+/g, " ")
        : newEnglishEntry.description;
    newForeignEntry.questions = [];
    newForeignEntry.subdomains = [];

    if (subDomain.hasOwnProperty("Questions")) {
      //Iterate through the questions and add them to the new entries
      for (
        let i: number = 0;
        i < subDomain.Questions[0].CmDomainQ.length;
        i++
      ) {
        if (
          subDomain.Questions[0].CmDomainQ[
            i
          ].Question[0].AUni[0].hasOwnProperty("_")
        ) {
          newEnglishEntry.questions.push(
            subDomain.Questions[0].CmDomainQ[i].Question[0].AUni[0]._
          );
        }
        if (
          subDomain.Questions[0].CmDomainQ[
            i
          ].Question[0].AUni[1].hasOwnProperty("_")
        ) {
          newForeignEntry.questions.push(
            subDomain.Questions[0].CmDomainQ[i].Question[0].AUni[1]._
          );
        }
      }
    }

    if (subDomain.hasOwnProperty("SubPossibilities")) {
      generateCleanJSON(
        subDomain.SubPossibilities[0].CmSemanticDomain,
        newEnglishEntry.subdomains,
        newForeignEntry.subdomains
      );
    }

    enDom.push(newEnglishEntry);
    fnDom.push(newForeignEntry);
  });
}
