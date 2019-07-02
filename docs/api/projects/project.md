# Project

**name** :

**semanticDomains** :

**words** : This should only contain [frontier](words/frontier.md) words

**vernacularWritingSystem** :

**analysisWritingSystem** :

**characterSet** : 𠮷 appears to be a single character but is represented `"\uD842\uDFB7"` if we store characters as a single unicode codepoint this single character would be split in two.

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
    words: <a href=words/word.md>Word</a>[],
    vernacularWritingSystem: String,
    analysisWritingSystems: String[],
    characterSet: String[],
    customFields: <a href=customField.md>CustomField</a>[],
    wordFields: String[],
    partsOfSpeech: String[]
}
</pre>
