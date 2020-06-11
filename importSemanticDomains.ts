const fs = require("fs"),
  xml2js = require("xml2js");
const args = process.argv.slice(2);

if (args.length > 0) {
  const fileLocation = args[0];
  const cwd = process.cwd();
  console.log(`File Location: "${fileLocation}" CWD: "${cwd}"`);
} else {
  console.log(
    "Please specify the relative file location to import, e.g. npm run import-sem-doms -- ../../importfile.xml"
  );
}
class SemanticDomainWithSubdomains {
  Name: string;
  Id: string;
  Description: string;
  Questions: string[];
  Subdomains: SemanticDomainWithSubdomains[];
}
var parser = new xml2js.Parser();
fs.readFile(__dirname + "/SemanticDomains-es.xml", function (
  err: Error,
  data: string
) {
  parser.parseString(data, function (err: Error, result) {
    const foriegnLanguage: string = result.List.Name[0].AUni[1].$.ws;
    const parsedDomain = result.List.Possibilities[0].CmSemanticDomain;
    let cleanedEnglishDomain: SemanticDomainWithSubdomains[] = [],
      cleanedForiegnDomain: SemanticDomainWithSubdomains[] = [];
    generateCleanJSON(parsedDomain, cleanedEnglishDomain, cleanedForiegnDomain);

    // fs.writeFile(
    //   process.cwd() + "src/resources/semantic-domains/en.json",
    //   JSON.stringify(cleanedEnglishDomain, null, "  "),
    //   (err) => console.log(err)
    // );

    // fs.writeFile(
    //   process.cwd() +
    //     "src/resources/semantic-domains/" +
    //     foriegnLanguage +
    //     ".json",
    //   JSON.stringify(cleanedForiegnDomain, null, "  "),
    //   (err) => console.log(err)
    // );

    console.log("Done");
  });
});

function generateCleanJSON(
  domain: any[],
  enDom: SemanticDomainWithSubdomains[],
  fnDom: SemanticDomainWithSubdomains[]
) {
  domain.forEach(function (subDomain) {
    let newEnglishEntry: SemanticDomainWithSubdomains = new SemanticDomainWithSubdomains(),
      newForiegnEntry: SemanticDomainWithSubdomains = new SemanticDomainWithSubdomains();

    newEnglishEntry.Name = subDomain.Name[0].AUni[0]._;
    newEnglishEntry.Id = subDomain.Abbreviation[0].AUni[0]._;
    newEnglishEntry.Description = subDomain.Description[0].AStr[0].Run[0]._;
    newEnglishEntry.Questions = [];
    newEnglishEntry.Subdomains = [];

    newForiegnEntry.Name = subDomain.Name[0].AUni[1]._;
    newForiegnEntry.Id = subDomain.Abbreviation[0].AUni[1]._;
    newForiegnEntry.Description = subDomain.Description[0].AStr[1].Run[0]._;
    newForiegnEntry.Questions = [];
    newEnglishEntry.Subdomains = [];

    if (subDomain.hasOwnProperty("Questions")) {
      //Iterate through the questions and add them to the new entries
      for (
        let i: number = 0;
        i < subDomain.Questions[0].CmDomainQ.length;
        i++
      ) {
        newEnglishEntry.Questions.push(
          subDomain.Questions[0].CmDomainQ[i].Question[0].AUni[0]._
        );
        newForiegnEntry.Questions.push(
          subDomain.Questions[0].CmDomainQ[i].Question[0].AUni[1]._
        );
      }
    }

    if (subDomain.hasOwnProperty("SubPossibilities")) {
      generateCleanJSON(
        subDomain.SubPossibilities[0].CmSemanticDomain,
        newEnglishEntry.Subdomains,
        newForiegnEntry.Subdomains
      );
    }

    enDom.push(newEnglishEntry);
    fnDom.push(newForiegnEntry);
  });
}
