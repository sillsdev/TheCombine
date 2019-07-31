# Project

**name** : Name of project

**semanticDomains** : Custom Semantic Domains for this project

**vernacularWritingSystem** : Language code of vernaculars

**analysisWritingSystems** : Language code of glossing systems

**validCharacters** : 𠮷 appears to be a single character but is represented `"\uD842\uDFB7"` if we store characters as a single unicode codepoint this single character would be split in two.

**rejectedCharacters** :

**customFields** : Optional at this point. We may or may not include this in our final design.

**wordFields** :

> **Typing of this is uncertain**  
> It would make sense to have this strictly typed since we know
> all possible values at runtime we should probably add a enum that looks
> something like
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
    vernacularWritingSystem: String,
    analysisWritingSystems: String[],
    validCharacters: String[],
    rejectedCharacters: String[],
    customFields: <a href=customField.md>CustomField</a>[],
    wordFields: String[],
    partsOfSpeech: String[]
}
</pre>
