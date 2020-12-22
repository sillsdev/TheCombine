# Project

**name** : Name of project

**semanticDomains** : Custom Semantic Domains for this project

**vernacularWritingSystem** : Language code of vernaculars

**analysisWritingSystems** : Language code of glossing systems

**validCharacters** : 𠮷 appears to be a single character but is represented with two unicode codepoints:
`"\uD842\uDFB7"`. Currently, the front-end splits on codepoints, so this character would be broken up.

**rejectedCharacters** :

**customFields** : Optional at this point. We may or may not include this in our final design.

**wordFields** :

> **Typing of this is uncertain**  
> It would make sense to have this strictly typed since we know all possible values at runtime we should probably add a
> enum that looks something like
>
> ```typescript
> enum {
>   Vernacular,
>   Gloss,
>   AudioFile,
>   SemanticDomain,
>   PartOfSpeech
> }
> ```
>
> And use that as the type for wordFields

**partsOfSpeech** :

## Raw type

<pre>
{
    name: String,
    semanticDomains: <a href=words/semanticDomain.md>semanticDomain</a>[],
    vernacularWritingSystem: WritingSystem,
    analysisWritingSystems: WritingSystem[],
    validCharacters: String[],
    rejectedCharacters: String[],
    customFields: <a href=customField.md>CustomField</a>[],
    wordFields: String[],
    partsOfSpeech: String[]
}
</pre>
