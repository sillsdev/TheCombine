var fs = require("fs"), xml2js = require("xml2js"), path = require("path");
var args = process.argv.slice(2);
if (args.length > 0) {
    var importFileLocation = args[0];
    var parser = new xml2js.Parser();
    var xmlLocataion = path.normalize(importFileLocation);
    fs.readFile(xmlLocataion, function (err, data) {
        if (err)
            throw err;
        parser.parseString(data, function (err, result) {
            if (err)
                throw err;
            var foriegnLanguage = result.List.Name[0].AUni[1].$.ws;
            var parsedDomain = result.List.Possibilities[0].CmSemanticDomain;
            var cleanedEnglishDomain = [], cleanedForiegnDomain = [];
            generateCleanJSON(parsedDomain, cleanedEnglishDomain, cleanedForiegnDomain);
            fs.writeFile(path.normalize("./src/resources/semantic-domains/en.json"), JSON.stringify(cleanedEnglishDomain, null, "  "), function (err) {
                if (err)
                    throw err;
            });
            fs.writeFile(path.normalize("./src/resources/semantic-domains/" + foriegnLanguage + ".json"), JSON.stringify(cleanedForiegnDomain, null, "  "), function (err) {
                if (err)
                    throw err;
            });
        });
    });
    console.log("Finished import to ./src/resources/semantic-domains/");
}
else {
    console.log("Please specify the relative file location to import, e.g. npm run import-sem-doms -- ../../importfile.xml");
}
var SemanticDomainWithSubdomains = /** @class */ (function () {
    function SemanticDomainWithSubdomains() {
    }
    return SemanticDomainWithSubdomains;
}());
function generateCleanJSON(domain, enDom, fnDom) {
    domain.forEach(function (subDomain) {
        var newEnglishEntry = new SemanticDomainWithSubdomains(), newForiegnEntry = new SemanticDomainWithSubdomains();
        newEnglishEntry.name = subDomain.Name[0].AUni[0]._;
        newEnglishEntry.id = subDomain.Abbreviation[0].AUni[0]._;
        newEnglishEntry.description = subDomain.Description[0].AStr[0].Run[0]._;
        newEnglishEntry.questions = [];
        newEnglishEntry.subdomains = [];
        newForiegnEntry.name = subDomain.Name[0].AUni[1].hasOwnProperty("_")
            ? subDomain.Name[0].AUni[1]._
            : "";
        newForiegnEntry.id = subDomain.Abbreviation[0].AUni[0].hasOwnProperty("_")
            ? subDomain.Abbreviation[0].AUni[0]._
            : "";
        newForiegnEntry.description = subDomain.Description[0].AStr[1].Run[0].hasOwnProperty("_")
            ? subDomain.Description[0].AStr[1].Run[0]._
            : "";
        newForiegnEntry.questions = [];
        newForiegnEntry.subdomains = [];
        if (subDomain.hasOwnProperty("Questions")) {
            //Iterate through the questions and add them to the new entries
            for (var i = 0; i < subDomain.Questions[0].CmDomainQ.length; i++) {
                if (subDomain.Questions[0].CmDomainQ[i].Question[0].AUni[0].hasOwnProperty("_")) {
                    newEnglishEntry.questions.push(subDomain.Questions[0].CmDomainQ[i].Question[0].AUni[0]._);
                }
                if (subDomain.Questions[0].CmDomainQ[i].Question[0].AUni[1].hasOwnProperty("_")) {
                    newForiegnEntry.questions.push(subDomain.Questions[0].CmDomainQ[i].Question[0].AUni[1]._);
                }
            }
        }
        if (subDomain.hasOwnProperty("SubPossibilities")) {
            generateCleanJSON(subDomain.SubPossibilities[0].CmSemanticDomain, newEnglishEntry.subdomains, newForiegnEntry.subdomains);
        }
        enDom.push(newEnglishEntry);
        fnDom.push(newForiegnEntry);
    });
}
