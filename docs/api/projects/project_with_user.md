# Project With User

Extension of [`Project`](project.md) with [`User`](..\users\user.md) attribute. Used as return type from
[Project Creation](post.md)

## Raw type

<pre>
{
    name: String,
    semanticDomains: <a href=words/semanticDomain.md>semanticDomain</a>[],
    words: <a href=words/word.md>Word</a>[],
    vernacularWritingSystem: WritingSystem,
    analysisWritingSystems: WritingSystem[],
    characterSet: String[],
    customFields: <a href=customField.md>CustomField</a>[],
    wordFields: String[],
    partsOfSpeech: String[],
    __UpdatedUser : <a href=customField.md>User</a>
}
</pre>
