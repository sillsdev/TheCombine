# 数据清理/目标

## 检阅词条 {#review-entries}

检查词条表显示出一个项目内所有的词条。

### Columns

The columns are: Edit (no header), Vernacular, Number of Senses (#), Glosses, Domains, Pronunciations
(![Review Entries pronunciations column header](../images/reviewEntriesColumnPronunciations.png){width=28}), Note, Flag
(![Review Entries flag column header](../images/reviewEntriesColumnFlag.png){width=16}), and Delete (no header).

![审查词条列标题](../images/reviewEntriesColumns.zh.png)

To show/hide columns or rearrange their order, click on the
![Review Entries columns edit icon](../images/reviewEntriesColumnsEdit.png){width=25} icon in the top corner.

由于快速字词收集（Rapid Word Collection）自身带有的特性，The Combine 中的[词条输入](dataEntry.md)不支持添加定义或词性的
功能。 However, if the project has imported data in which definitions or parts of speech were already present,
additional columns will be available in the Review Entries table.

#### Sorting and Filtering

There are icons at the top of each column to
![Review Entries column filter icon](../images/reviewEntriesColumnFilter.png){width=20} filter and
![Review Entries column sort icon](../images/reviewEntriesColumnSort.png){width=20} sort the data.

In a column with predominantly text content (Vernacular, Glosses, Note, or Flag), you can sort alphabetically or filter
with a text search. By default, the text search is a fuzzy match: it is not case sensitive and it allows for one or two
typos. If you want exact text matches, use quotes around your filter.

In the Number of Senses column or Pronunciations column, you can sort or filter by the number of senses or recordings
that entries have. In the Pronunciations column, you can also filter by speaker name.

In the Domains column, sorting is numerical by each entry's least domain id. To filter by domain, type a domain id with
or without periods. For example, "8111" and "8.1.1.1" both show all entries with a sense in domain 8.1.1.1. To also
include subdomains, add a final period to your filter. For example, "8111." includes domains "8.1.1.1", "8.1.1.1.1", and
"8.1.1.1.2". Filter with just a period (".") to show all entries with any semantic domain.

### 编辑词条行

用户可以使用“发音”
(![Review Entries pronunciations column header](../images/reviewEntriesColumnPronunciations.png){width=28}) 列中的图标来
录制、播放或删除词条的录音。

To edit any other part of an entry, click the
![Review Entries row edit icon](../images/reviewEntriesRowEdit.png){width=20} edit icon in the initial column.

You can delete an entire entry by clicking the
![Review Entries row delete icon](../images/reviewEntriesRowDelete.png){width=20} delete icon in the final column.

## 合并重复项 {#merge-duplicates}

该工具会自动查找可能重复的词条(每组最多 5 个词条，每次最多 12 组)。 首先，该工具会找出有相同形式的土语。 接着，它会找出
类似土语形式或有相同注释(或定义) 的土语。

![合并两个重复的词条](../images/mergeTwo.zh.png)

每个词条都显示在一列中，并且该词条的每种词义都以卡片的形式展现，这样可方便用户点击并拖动。 用户可对每一个词义采取三种基
本的处理方式：移除、将其与另一个词义合并，或者删除。

### 迁移词义

当用户点击并按住词义卡时，它会变成绿色。 用户可将词义卡拖放至同一列中的不同位置，以重新排列该词条的各项词义。 或者，也可
将此卡拖放至不同列，以将该词义移至另一词条。

![Merge Duplicates moving a sense](../images/mergeMove.zh.png)

如果用户想将含有多种词义的词条拆分为多个词条，可将其中一张词义卡拖至右侧空的附加列中。

### 合并词义

如果将一张词义卡拖至另一张词义卡上，另一张词义卡也会变成绿色。

![Merge Duplicates merging a sense](../images/mergeMerge.zh.png)

将一张词义卡拖放到另一张词义卡上(当它们同时显为绿色时)，它们的词义就合并。 这会导致在右侧出现一个蓝色侧边栏，显示出哪些
词义被合并。

![合并重复的词条和合并其词义](../images/mergeSidebar.zh.png)

用户可将词义卡拖放至侧栏，或者从侧栏拖放至词义卡，来决定哪个词义被合并。 或者在侧栏内，用户可将不同的词义移至顶部(以保留
其注释)。

![Merge Duplicates moving a sidebar sense](../images/mergeSidebarMove.zh.png)

点击右角括号(>) 可关闭或打开蓝色侧边栏。

### 删除词义

要完全删除一个词义，请将其卡片拖至左下角垃圾桶的图标内。 当词义卡变为红色时，松开鼠标。

![合并重复，删除一个词义](../images/mergeDelete.zh.png)

如果用户删除列中仅剩的一条词义，则整个列将消失，并且在保存& 时，整个词条将被删除。

![合并重复的词条，删除词义内容](../images/mergeDeleted.zh.png)

### 标记词条

每列的右上角(位于土语形式右侧) 都有一个旗标图标。

![合并重复，标记该词条](../images/mergeFlag.zh.png){.center}

用户可点击旗标来标记该词条，以用于将来检查或编辑。 (用户可以在[检阅词条](#review-entries)中对标记的词条进行排序)。 当用
户标记词条时，可选择添加文本。

![Merge Duplicates adding or editing a flag](../images/mergeEditFlag.zh.png){.center}

无论是否有任何文本被键入，用户会知晓该词条已被标记，因旗标图标会变为红色。 如果用户添加了文本，可将鼠标悬停在旗标图标上
方来查看文本。

![Merge Duplicates a flagged entry](../images/mergeFlagged.zh.png){.center}

点击红色旗标图标来编辑文本，或者移除标记。

### 完成一组

在底部的位置有两个键，可用于完成目前这一组潜在重复词条有关的工作，并继续下一组的工作：“保存& 继续”和“推迟”。

#### 保存 & 继续

![合并重复保存并继续按钮](../images/mergeSaveAndContinue.zh.png)

蓝色的“保存与继续”键有两个功能。 第一，它将所有更改都保存下来(例如，所有已被移除、合并或被删除的词义)，并更新数据库中的
词。 Second, it saves the resulting set of words as non-duplicates.

!!! tip "提示"

    可能的重复是真的重复吗？ 用户只需点击 保存& 继续, 即可告诉 The Combine 不再显示该组的资料。

!!! note "笔记"

    如果有意不合并词组中有一个被修改(例如，在检阅条目)，则该组词会再次显示为可能重复词。

!!! warning "重要警告"

    Avoid having multiple users merge duplicates in the same project at the same time. If different users simultaneously merge the same set of duplicates, it will results in the creation of new duplicates (even if the users are making the same merge decisions).

#### 推迟

![合并重复推迟按钮](../images/mergeDefer.zh.png)

灰色”推迟”键会重置潜在重复词组所做的任何修改 可通过 "审查被推迟的重复词组 "重新访问被推迟的词组。 。

### 与输入的数据合并

#### 定义和词性

尽管定义与词性无法在词条输入时添加，但它们可以出现在输入的词条中。 出现在“合并重复项”词义卡上的内容：

- 分析语言内的任何定义都将被显示在该语言的注释下方。
- 左上角的彩色六边形表示词性 颜色对应其一般类别(例如名词或动词)。 用户将鼠标悬停在六边形上可查看该词的具体语法类别(例
  如，专有名词或及物动词)。

![将重复词义与定义和语性合并](../images/mergeSenseDefinitionsPartOfSpeech.png){.center}

!!! note "笔记"

    A sense can only have one part of speech. If two senses are merged that have different parts of speech in the same general category, the parts of speech will be combined, separated by a semicolon (;). However, if they have different general categories, only the first one is preserved.

#### 受保护的词条与词义

如果导入的词条或词义项包含 The Combine 不支持的资料(例如词源或词义反转)，它将被保护以防止删除。 受保护的词义卡会有一个黄
色背景。它无法被删除，也无法(被合并)放入另一张词义卡。 如果整个词条受保护，其列将具有黄色标题(位于土语和旗标位置)。 当受
保护的词条只有一个词义时，该词义卡就无法被移动。

## 创建字符库存

创建字符工具仅供项目管理员使用。

*创建字符库存*提供了该项目词条土语形式出现的每个符编码标准字符的概览。 这会使用户识别出该语言中经常用到的字符，并将它们“
接受”为该语言字符库存的一部分。 字符库属于项目土语的LDML文档一部分，在项目[导出](project.md#export)时会包含该文件。 接受
字符后，就能用统一的字符编码标准、在民族语及其他语言资源中表达。

*创建字符库存*的另一个用途，即为识别和替换那些在键入土语字形时被误用的字符。

土语词条中的每个统一编码标准的的字符都有一个图块。 每个图块显示字符、其编码 Unicode "U+" 值，以及它在词条土语形中出现的
次数并其指定名称(默认：有待决定)。

![字符库字符图标](../images/characterInventoryTiles.zh.png)

### 管理单个字符

点击一个字符图块可打开该字符的面板。

!!! tip "提示"

    用户可能需要滚动才能看到面板。 如果用户电脑可视窗户足够宽，窗的右边会有空白边距；而面板将位于其顶部。 如果电脑可视窗户狭窄，图块就会一直填充到窗户右侧；该面板将位于底部，即所有图块的下方。

![字符库字符面板](../images/characterInventoryPanel.zh.png){.center}

面板中间最多会显示该字符总共出现的5个土语形示例，并突出显示每次出现时的字符。

面板顶部有三个键，用于指定该字符是否应含在土语的字符库中。它们是：“接受”、“待定”、“拒绝”。 按其中任何一个键都会更新位于
字符图块底部的指定。 (这些对字符库所做的修改只有在点击“保存”键后才会被保存到项目。“保存”键在页面底部)

面板底部是“查找和替换”工具。 如果该字符在*每次*时都应替换成其他字符，只需在“替换为”框中键入替换字符或字符串，然后点击“应
用”键即可。

!!! warning "重要警告"

    “查找和替换 ”操作更改的是词条，而不是字符库。
