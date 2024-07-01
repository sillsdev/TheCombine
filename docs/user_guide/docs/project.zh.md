# 项目

一个项目针对一个土语。

## 创建项目

创建项目时，用户可选项启动一个空项目，或者输入已有的词典数据。

![创建项目 - Tzotzil](../images/projectCreateTzotzil.zh.png){.center}

### 输入已有数据

如果用户已经有词典数据在 [LIFT](https://software.sil.org/lifttools) 文档(很可能是从 The Combine,
[WeSay](https://software.sil.org/wesay), [FLEx](https://software.sil.org/fieldworks), 或
[Lexique Pro](https://software.sil.org/lexiquepro) 导出的) ，只要点击“下载已有数据？”旁的“浏览”键, 就可将数据输入自己的
项目。

如果用户选择在创建项目时不输入数据，可留待以后再操作(参见[下面](#import))。

### 土语语言

*土语*指的是字词被收集的语言 这种语言通常是指具有地方性的、本土性的、少数民族的、传统的及面临濒危的一种语言或方言。 项目
一旦被创建，该土语就无法被更改。

如果用户在创建项目时选用LIFT 文档来输入，则会出现一个下拉菜单，用户可以从导入的 LDML 文档所有语言中选择项目的土语。

### 分析语言

*分析语言*是该土语被译成的语言。 这通常是指使用该土语所在地的一种地区性的、国家性的、官方的或主要的语言。 可在创建项目后
添加其他分析语言(参 [以下](#project-languages))。

如果用户在创建项目的过程中选用LIFT文档来输入，定义或注释中使用的语将会自动添加到项目中作为分析语言

## 管理项目

一旦创建或选择了一个项目，它就变成活动项目。用户可在 The Combine 顶部应用框的中间位置看到一个齿轮图标或该项目名。 点击齿
轮图标或项目名，拉出“项目设置”以管理该项目。 具有足够权限的项目用户可以使用以下设置。

### 基本设置

![基本设置](../images/projectSettings1Basic.zh.png){width=750 .center}

#### 项目名称

建议使用一个区别性和描述性的名称。 [导出](#export) 项目时，项目名称是文件名的一部分。

#### 自动完成 {#autocomplete}

设置默认为开启：当用户用土语输入新词条，此设置会提供现有的类似的词条作为建议，允许用户选择现有词条并为该词条添加新词义，
而不是创建一个(可能是) 重复的词条。 详情请参阅 [词条输入](dataEntry.md#new-entry-with-duplicate-vernacular-form)。

(这不影响对注释的拼写建议，因为这些建议是基于独立于现有项目数据的字典的)。

#### 存档项目

这只有项目所有者才能获取。 将项目存档后，所有用户都无法访问该项目。 只有网站管理员才能取消这一操作。 如果用户希望从服务
器上完全清除该项目，请与网站管理员联系。

### 项目语言 {#project-languages}

![语言](../images/projectSettings2Langs.zh.png){width=750 .center}

![项目语言 - Tzotzil](../images/projectLanguagesTzotzil.zh.png){.center}

创建项目时指定的*土语*是固定的。

与项目有关的*分析语言*可能会有很多种，但只有列表中最上面的一种可以输入新词条。

!!! note "笔记"

    如果项目有多种语言的注释，则那些语言必须被添加至此处，这样所有注释就可以显示在[数据清理](goals.md). 点击放大镜图标，就能看到呈现在项目中的所有语言代码。

*语义领域语言*决定[词条输入](./dataEntry.md)中表达语义领域标题和描述的语言。

### 项目用户

![用户](../images/projectSettings3Users.zh.png){width=750 .center}

#### 当前用户

在每位项目用户的旁边都有一个带三个垂直点的图标。 如果用户是项目所有者，可点击此处，打开一个用户管理菜单，它里面含有以下
选项:

<pre>
    从项目中移除
更改项目角色:
收集者
编辑
管理员
成为项目所有者
[仅对项目所有者改项目管理员时用]
</pre>

_收集者_ 可以进行 [词条输入](./dataEntry.md) ，但不能进行 [数据清理](./goals.md)。 在项目设置中，其他人可以看到 项目语言
和工作坊时间表，但不能做任何更改。

*编辑*具有与*收集者*相同的权限，还可
以[审阅词条](./goals.md#review-entries)、[合并重复词条](./goals.md#merge-duplicates)和[导出](#export)。

_管理员_ 拥有 _编辑_ 的所有权限，还可以修改大多数项目设置和 用户。

!!! warning "重要警告"

    每个项目只有一个所有者。 如果您将另一个用户成为项目所有者，您将自动从项目所有者变为
    管理员，而且您将无法再存档项目或为其他用户设置/删除管理员。

#### 添加用户

可搜素已有的用户(用搜素词显示所有用户的姓名、用户名，或电子邮件地址), 也可以电子邮件的方式邀请新用户(他们在通过邀请创建
帐户后将自动添加到项目中).

#### Manage Speakers

Speakers are distinct from users. A speaker can be associate with audio recording of words. Use the + icon at the bottom
of this section to add a speaker. Beside each added speaker are buttons to delete them, edit their name, and add a
consent for use of their recorded voice. The supported methods for adding consent are to (1) record an audio file or (2)
upload an image file.

When project users are in Data Entry or Review Entries, a speaker icon will be available in the top bar. Users can click
that button to see a list of all available speakers and select the current speaker, this speaker will be automatically
associated with every audio recording made by the user until they log out or select a different speaker.

The speaker associated with a recording can be seen by hovering over its play icon. To change a recording's speaker,
right click the play icon (or press and hold on a touch screen to bring up a menu).

When the project is exported from The Combine, speaker names (and ids) will be added as a pronunciation labels in the
LIFT file. All consent files for project speakers will be added to a "consent" subfolder of the export (with speaker ids
used for the file names).

### 导入/导出

![导入/导出](../images/projectSettings4Port.zh.png){width=750 .center}

#### 导入 {#import}

!!! note "笔记"

    目前，可导入的 LIFT 文件不可超过 100MB。

!!! note "笔记"

    目前，每个项目只能导入一个 LIFT 文件。

#### 导出 {#export}

单击 "导出 "按钮后，在数据准备下载时，用户可以到网站的其他部分浏览。 当导出内容可供下载时，应用程序栏中会出现一个下载图
标。 默认文件名是项目名称加上下载时间。

!!! warning "重要警告"

    导出一个数百 MB 大小的项目文件可能需要好几分钟时间。

!!! note "笔记"

    Project settings, project users, and word flags are not exported.

#### Export pronunciation speakers

When a project is exported from TheCombine and imported into FieldWorks, if a pronunciation has an associated speaker,
the speaker name and id will be added as a pronunciation label. The consent files can be found in the zipped export, but
will not be imported into FieldWorks.

### 工作坊日程 {#workshop-schedule}

![工作坊日程](../images/projectSettings5Sched.zh.png){width=750 .center}

只有项目所有人可以使用该功能，以便为快速文字工作坊设定时间。 点击第一个键可选择工作坊日期范围。 点击中间键可添加或移除具
体日期。 点击最后的键可清除日程表。

![工作坊日程](../images/projectSchedule.zh.png){.center}

## 项目统计数据

如果用户是项目所有者，在 The Combine 顶部应用栏齿轮图标的旁边会有另一个图标。 这将打开项目中关于字词的统计数据。

![项目统计数据](../images/projectStatsButton.png){.center}

在这些统计数据中， _词_ 指的是一对词义-词域：例如，一个词条有 3 个词义，每个词义属于2 个语义域，则该词条将被算作 6 个
词。

### 每个用户的单词词数

一张表格列出了每个项目用户的词数和独特的语义域。 导入的单词没有相关的用户，将计入 "未知用户"行。

### 每个语义域的单词

列出每个语义域中单词数量的表格。

### 每天字数

线形图显示在 [工作坊时间表](#workshop-schedule)中指定的日子里收集到的词语。

### 工作坊进度

线型图显示了 [工作坊日程](#workshop-schedule)多天所累积的词以及对余下时间的预测。
