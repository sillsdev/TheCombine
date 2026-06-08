# Limpieza de datos / Objetivos

## Revisar entradas {#review-entries}

La tabla Revisar entradas muestra todas las entradas del proyecto seleccionado.

### Columnas

Las columnas son: Editar (sin encabezado), Vernáculo, Número de acepciones (#), Glosas, Dominios, Pronunciaciones
(![Review Entries pronunciations column header](../images/reviewEntriesColumnPronunciations.png){width=28}), Nota,
Bandera (![Review Entries flag column header](../images/reviewEntriesColumnFlag.png){width=16}), y Eliminar (sin
encabezado).

![Revisar los encabezados de columna de las entradas](../images/reviewEntriesColumns.es.png)

To show/hide columns or rearrange their order, click on the
![Review Entries columns edit icon](../images/reviewEntriesColumnsEdit.png){width=25} icon in the top corner.

Debido a la naturaleza de la recopilación rápida de palabras, la [entrada de datos](dataEntry.md) en The Combine no
permite añadir definiciones o partes de la oración. Sin embargo, si el proyecto tiene datos importados en los que hay
definiciones o partes de discurso, habrá columnas adicionales disponibles en la tabla Entradas de revisión.

#### Ordenar y filtrar

There are icons at the top of each column to
![Review Entries column filter icon](../images/reviewEntriesColumnFilter.png){width=20} filter and
![Review Entries column sort icon](../images/reviewEntriesColumnSort.png){width=20} sort the data.

En una columna con contenido predominantemente textual (Vernáculo, Glosas, Nota o Bandera), puede ordenar
alfabéticamente o filtrar con una búsqueda de texto. By default, the text search is a fuzzy match: it is not case
sensitive and it allows for one or two typos. If you want exact text matches, use quotes around your filter.

In the Number of Senses column or Pronunciations column, you can sort or filter by the number of senses or recordings
that entries have. In the Pronunciations column, you can also filter by speaker name.

En la columna Dominios, la ordenación es numérica por el id de dominio menor de cada entrada. To filter by domain, type
a domain id with or without periods. For example, "8111" and "8.1.1.1" both show all entries with a sense in domain
8.1.1.1. To also include subdomains, add a final period to your filter. For example, "8111." includes domains "8.1.1.1",
"8.1.1.1.1", and "8.1.1.1.2". Filter with just a period (".") to show all entries with any semantic domain.

### Edición de filas de entrada

Puede grabar, reproducir o borrar las grabaciones de audio de una entrada con los iconos de la columna Pronunciaciones
(![Review Entries pronunciations column header](../images/reviewEntriesColumnPronunciations.png){width=28}).

To edit any other part of an entry, click the
![Review Entries row edit icon](../images/reviewEntriesRowEdit.png){width=20} edit icon in the initial column.

You can delete an entire entry by clicking the
![Review Entries row delete icon](../images/reviewEntriesRowDelete.png){width=20} delete icon in the final column.

## Combinar duplicados {#merge-duplicates}

Esta herramienta encuentra automáticamente conjuntos de entradas potencialmente duplicadas (hasta 5 entrada en cada
conjunto, y hasta 12 conjuntos en cada pasa). Primero presenta conjuntos de palabras con idénticas formas vernáculas. A
continuación, presenta conjuntos con formas vernáculas similares o glosas (o definiciones) idénticas.

![Fusionar duplicados entradas](../images/mergeTwo.es.png)

Cada entrada se muestra en una columna, y cada acepción de esa entrada se muestra como una tarjeta que puede hacer clic
y arrastrar. Hay tres cosas básicas que puede hacer con una acepción: moverlo, combinarlo con otra acepción o
eliminarlo.

### Mover una acepción

Cuando hace clic y mantiene pulsada una tarjeta de acepción, ésta se vuelve verde. Puede arrastrar y soltar la tarjeta
de acepción a un lugar diferente de la misma columna para reordenar las acepciones de esa entrada. O puede arrastrar y
soltar la tarjeta de acepción a una columna diferente para mover la acepción a esa otra entrada.

![Fusionar duplicados moviendo una acepción](../images/mergeMove.es.png)

Si desea dividir una entrada con varias acepciones en varias entradas, puede arrastrar una de las tarjetas de acepción a
la columna extra vacía de la derecha.

### Fusionar una acepción

Si arrastra una tarjeta de acepción sobre otra tarjeta de acepción, la otra tarjeta de acepción también se vuelve verde.

![Combinar duplicados combinar una acepción](../images/mergeMerge.es.png)

Soltar una carta de acepción sobre otra carta de acepción (cuando ambas están verdes) fusiona las acepciones. Esto hace
que aparezca una barra lateral azul aparezca a la derecha, mostrando cuales acepciones se están fusionando.

![Combinar duplicados acepciones combinadas](../images/mergeSidebar.es.png)

Puede arrastrar y soltar tarjetas de acepción hacia o desde la barra lateral para cambiar las acepciones que se están
combinando. O dentro de la barra lateral, puede desplazar una acepción diferente a la parte superior (para conservar sus
glosas).

![Combinar duplicados moviendo una acepción de la barra lateral](../images/mergeSidebarMove.es.png)

Haga clic en el corchete angular derecho (>) para cerrar o abrir la barra lateral azul.

### Borrar una acepción

Para eliminar una acepción por completo, arrastre su tarjeta hasta el icono del cubo de basura situado en la esquina
inferior izquierda. Cuando la tarjeta de acepción se ponga roja, suéltela.

![Combinar duplicados eliminar una acepción](../images/mergeDelete.es.png)

Si borra la única acepción que queda de una columna, toda la columna desaparecerá, y esa entrada entera se borrada
cuando pulse Guardar y Continuar.

![Combinar duplicados acepción borrada](../images/mergeDeleted.es.png)

### Marcar una entrada

Hay un icono de bandera en la esquina superior derecha de cada columna (a la derecha del formulario vernáculo).

![Combinar duplicados marcar una entrada](../images/mergeFlag.es.png){.center}

Puede hacer clic en el icono de la bandera para marcar la entrada para una futura inspección o edición. (Puede
clasificar las entradas marcadas en [Revisar entradas](#review-entries)) Cuando marque una entrada, se le dará la opción
de añadir texto a la bandera.

![Combinar duplicados añadiendo o editando una bandera](../images/mergeEditFlag.es.png){.center}

Tanto si se escribe texto como si no, sabrá que la entrada está marcada porque el icono de la bandera aparecerá en rojo
sólido. Si ha añadido texto, puede pasar el cursor por encima de la bandera para ver el texto.

![Combinar duplicados una entrada marcada](../images/mergeFlagged.es.png){.center}

Haga clic en el icono de la bandera roja para editar el texto o eliminar la bandera.

### Terminar un conjunto

Hay dos botones en la parte inferior para terminar el trabajo en el conjunto actual de duplicados potenciales y pasar al
siguiente conjunto: "Guardar y Continuar" y "Aplazar".

#### Guardar y Continuar

![Combinar duplicados botón Guardar y Continuar](../images/mergeSaveAndContinue.es.png)

El botón azul "Guardar y continuar" hace dos cosas. En primer lugar, guarda todos los cambios realizados (es decir,
todas las acepciones movidas, combinadas o eliminadas), actualizando las palabras en la base de datos. Second, it saves
the resulting set of words as non-duplicates.

!!! tip "Consejo"

    ¿Los duplicados potenciales no son duplicados? Sólo tiene que hacer clic en Guardar y Continuar para decirle a The Combine que no le vuelva a mostrar ese conjunto.

!!! note "Nota"

    Si una de las palabras de un conjunto no combinado intencionadamente se edita (por ejemplo, en las entradas de revisión), el conjunto puede volver a aparecer como duplicados potenciales.

!!! warning "Importante"

    Avoid having multiple users merge duplicates in the same project at the same time. If different users simultaneously merge the same set of duplicates, it will results in the creation of new duplicates (even if the users are making the same merge decisions).

#### Aplazar

![Combinar duplicados botón Aplazar](../images/mergeDefer.es.png)

El botón gris "Aplazar" restablece cualquier cambio realizado en el conjunto de duplicados potenciales. El conjunto
aplazado se puede revisar por Revisar duplicados aplazados.

### Fusión con datos importados

#### Definiciones y parte de la oración

Aunque las definiciones y las partes de la oración no pueden añadirse durante la introducción de datos, sí pueden estar
presentes en las entradas importadas. Esta información aparecerá en las tarjetas de acepción de Combinar duplicados de
la siguiente manera:

- Cualquier definición en un idioma de análisis se muestra debajo de la glosa en esa lengua.
- Cualquier parte de la oración se indica mediante un hexágono de color en la esquina superior izquierda. El color
  corresponde a su categoría (por ejemplo, sustantivo o verbo). Pase el cursor por encima del hexágono para ver la
  categoría gramatical específica (p. ej., nombre propio o verbo transitivo).

![Combinar duplicados acepción con definiciones y parte de la oración](../images/mergeSenseDefinitionsPartOfSpeech.png){.center}

!!! note "Nota"

    A sense can only have one part of speech. If two senses are merged that have different parts of speech in the same general category, the parts of speech will be combined, separated by a semicolon (;). However, if they have different general categories, only the first one is preserved.

#### Entradas y acepciones protegidas {#protected-entries-and-senses}

Si una entrada o acepción importada contiene datos no admitidos en The Combine (por ejemplo, etimologías o inversiones
de sentido), se protege para evitar su eliminación. Si una acepción está protegida, su tarjeta tendrá un fondo
amarillo—no se puede borrar ni colocar en (es decir, se combina en) otra tarjeta de acepción. Si una entrada completa
está protegida, su columna tendrá una cabecera amarilla (donde se encuentran la lengua vernácula y la bandera). Cuando
una entrada protegida sólo tiene una acepción, esa tarjeta de acepción no se puede mover.

## Comprobar ortografía

Esta herramienta sólo está disponible para los administradores del proyecto.

_Comprobar ortografía_ proporciona una visión general de cada carácter unicode que aparece en las formas vernáculas del
entradas del proyecto. Esto le permite identificar qué caracteres se utilizan habitualmente en la lengua y "aceptarlos"
como parte del inventario de caracteres de la lengua. El inventario de caracteres forma parte del archivo LDML para el
idioma vernáculo de un proyecto que se incluye cuando se [exporta](project.md#export) el proyecto. La aceptación de los
caracteres conducirá a una representación precisa de la lengua en Unicode, el Ethnologue y otros estándares y recursos
lingüísticos.

Otro uso de _Comprobar ortografía_ es identificar y sustituir caracteres que se han utilizado incorrectamente al
escribir formas vernáculas de palabras.

Hay una ficha para cada carácter unicode que aparece en la forma vernácula de cualquier entrada. Cada ficha muestra el
carácter, su valor Unicode "U+", el número de veces que aparece en las formas vernáculas de entrada y su designación
(por defecto: Indeciso).

![Inventario de caracteres fichas de caracteres](../images/characterInventoryTiles.es.png)

### Gestionar un solo carácter

Haga clic en una ficha de carácter para abrir un panel para ese carácter.

!!! tip "Consejo"

    Puede que tenga que desplazarse para ver el panel. Si su ventana es lo suficientemente ancha, habrá un margen en blanco a la
    derecha; el panel estará en la parte superior de éste. Si su ventana es estrecha, los azulejos llenarán todo el lado derecho de la
    ventana; el panel estará en la parte inferior, debajo de todos los fichas.

![Inventario de caracteres panel de caracteres](../images/characterInventoryPanel.es.png){.center}

El centro del panel muestra hasta 5 ejemplos de formas vernáculas en las que aparece el carácter, resaltando el carácter
en cada ocurrencia.

En la parte superior del panel hay tres botones para designar si el carácter debe incluirse en el inventario de
caracteres del idioma vernáculo: "Aceptar", "No decidido" y "Rechazar". Al pulsar cualquiera de estos botones se
actualizará la designación en la parte inferior de la ficha de carácter. (Estas actualizaciones del inventario del
caracteres no se guardan en el proyecto hasta que haga clic en el botón Guardar en la parte inferior de la página)

En la parte inferior del panel se encuentra la herramienta Buscar y Reemplazar. Si _cada_ aparición del carácter debe
sustituirse por otra cosa, escriba el carácter o cadena de sustitución en la casilla "Sustituir por" y haga clic en el
botón Aplicar.

!!! warning "Importante"

    La operación de buscar y reemplazar realiza cambios en las entradas, no en el inventario de caracteres.
