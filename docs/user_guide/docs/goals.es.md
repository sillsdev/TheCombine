# Limpieza de datos / Objetivos

## Revisar entradas {#review-entries}

La tabla Revisar entradas muestra todas las entradas del proyecto seleccionado.

### Columnas

Las columnas son: Editar (sin encabezado), Vernáculo, Número de acepciones (#), Glosas, Dominios, Pronunciaciones
(![Review Entries pronunciations column header](../images/reviewEntriesColumnPronunciations.png){width=28}), Nota,
Bandera (![Review Entries flag column header](../images/reviewEntriesColumnFlag.png){width=16}), y Eliminar (sin
encabezado).

![Revisar los encabezados de columna de las entradas](../images/reviewEntriesColumns.png)

Para mostrar/ocultar columnas o reorganizar su orden, haga clic en el icono
![Review Entries columns edit icon](../images/reviewEntriesColumnsEdit.png){width=25} de la esquina superior.

Debido a la naturaleza de la recopilación rápida de palabras, la [entrada de datos](dataEntry.md) en The Combine no
permite añadir definiciones o partes de la oración. Sin embargo, si el proyecto tiene datos importados en los que hay
definiciones o partes de discurso, habrá columnas adicionales disponibles en la tabla Entradas de revisión.

#### Ordenar y filtrar

Hay iconos en la parte superior de cada columna para
![Review Entries column filter icon](../images/reviewEntriesColumnFilter.png){width=20} filtrar y
![Review Entries column sort icon](../images/reviewEntriesColumnSort.png){width=20} ordenar los datos.

En una columna con contenido predominantemente textual (Vernáculo, Glosas, Nota o Bandera), puede ordenar
alfabéticamente o filtrar con una búsqueda de texto. Por defecto, la búsqueda de texto es una coincidencia difusa: no
distingue entre mayúsculas y minúsculas y permite uno o dos errores tipográficos. Si desea coincidencias de texto
exactas, utilice comillas alrededor del filtro. Para mostrar todas las entradas con texto no vacío en la columna,
escriba un espacio para su filtro.

En la columna Número de acepciones o Pronunciaciones, puede ordenar o filtrar por el número de sentidos o
pronunciaciones que tienen las entradas. En la columna Pronunciaciones, también puede filtrar por nombre de locutor.

En la columna Dominios, la ordenación es numérica por el id de dominio menor de cada entrada. Para filtrar por dominio,
escriba un identificador de dominio con o sin puntos. Por ejemplo, "8111" y "8.1.1.1" muestran ambas todas las entradas
con acepción en el dominio 8.1.1.1. Para incluir subdominios, añada un punto final a su filtro. Por ejemplo, "8111."
incluye los dominios "8.1.1.1", "8.1.1.1.1" y "8.1.1.1.2". Filtrar sólo con un punto (".") para mostrar todas las
entradas con cualquier dominio semántico.

### Edición de filas de entrada

Puede grabar, reproducir o borrar las grabaciones de audio de una entrada con los iconos de la columna Pronunciaciones
(![Review Entries pronunciations column header](../images/reviewEntriesColumnPronunciations.png){width=28}).

Puedes modificar la bandera en una entrada haciendo clic en el ícono
![Review Entries flag column header](../images/reviewEntriesColumnFlag.png){width=16} en la columna de bandera.

Para editar cualquier otra parte de una entrada, haga clic en el icono
![Review Entries row edit icon](../images/reviewEntriesRowEdit.png){width=20} en la columna inicial.

Puede borrar una entrada entera haciendo clic en el icono
![Review Entries row delete icon](../images/reviewEntriesRowDelete.png){width=20} en la última columna.

!!! note "Nota"

    Si un administrador de proyecto ha activado el ajuste [Revisar entradas para cosechadores](project.md#harvester-review-entries), las cosechadoras también pueden utilizar Revisar entradas.
    Los cosechadores pueden actualizar grabaciones de audio y banderas, pero las columnas Editar y Eliminar no están a su disposición.

## Combinar duplicados {#merge-duplicates}

Esta herramienta encuentra automáticamente conjuntos de entradas potencialmente duplicadas (hasta 5 entrada en cada
conjunto, y hasta 12 conjuntos en cada pasa). Primero presenta conjuntos de palabras con idénticas formas vernáculas. A
continuación, presenta conjuntos con formas vernáculas similares o glosas (o definiciones) idénticas.

![Combinar duplicados dos entradas](../images/mergeTwo.png)

Cada entrada se muestra en una columna, y cada acepción de esa entrada se muestra como una tarjeta que puede hacer clic
y arrastrar. Hay tres cosas básicas que puede hacer con una acepción: moverlo, combinarlo con otra acepción o
eliminarlo.

### Mover una acepción

Cuando hace clic y mantiene pulsada una tarjeta de acepción, ésta se vuelve verde. Puede arrastrar y soltar la tarjeta
de acepción a un lugar diferente de la misma columna para reordenar las acepciones de esa entrada. O puede arrastrar y
soltar la tarjeta de acepción a una columna diferente para mover la acepción a esa otra entrada.

![Combinar duplicados moviendo una acepción](../images/mergeMove.png)

Si desea dividir una entrada con varias acepciones en varias entradas, puede arrastrar una de las tarjetas de acepción a
la columna extra vacía de la derecha.

### Combinar una acepción

Si arrastra una tarjeta de acepción sobre otra tarjeta de acepción, la otra tarjeta de acepción también se vuelve verde.

![Combinar duplicados combinar una acepción](../images/mergeMerge.png)

Soltar una carta de acepción sobre otra carta de acepción (cuando ambas están verdes) combina las acepciones. Esto hace
que aparezca una barra lateral azul aparezca a la derecha, mostrando cuales acepciones se están combinadas.

![Combinar duplicados acepciones combinadas](../images/mergeSidebar.png)

Puede arrastrar y soltar tarjetas de acepción hacia o desde la barra lateral para cambiar las acepciones que se están
combinando. O dentro de la barra lateral, puede desplazar una acepción diferente a la parte superior (para conservar sus
glosas).

![Combinar duplicados moviendo una acepción de la barra lateral](../images/mergeSidebarMove.png)

Haga clic en el corchete angular derecho (>) para cerrar o abrir la barra lateral azul.

### Borrar una acepción

Para eliminar una acepción por completo, arrastre su tarjeta hasta el icono del cubo de basura situado en la esquina
inferior izquierda. Cuando la tarjeta de acepción se ponga roja, suéltela.

![Combinar duplicados eliminar una acepción](../images/mergeDelete.png)

Si borra la única acepción que queda de una columna, toda la columna desaparecerá, y esa entrada entera se borrada
cuando pulse Guardar & Continuar.

![Combinar duplicados acepción borrada](../images/mergeDeleted.png)

### Marcar una entrada

Hay un icono de bandera en la esquina superior derecha de cada columna (a la derecha del formulario vernáculo).

![Combinar duplicados marcar una entrada](../images/mergeFlag.png){.center}

Puede hacer clic en el icono de la bandera para marcar la entrada para una futura inspección o edición. (Puede
clasificar las entradas marcadas en [Revisar entradas](#review-entries)) Cuando marque una entrada, se le dará la opción
de añadir texto a la bandera.

![Combinar duplicados añadiendo o editando una bandera](../images/mergeEditFlag.png){.center}

Tanto si se escribe texto como si no, sabrá que la entrada está marcada porque el icono de la bandera aparecerá en rojo
sólido. Si ha añadido texto, puede pasar el cursor por encima de la bandera para ver el texto.

![Combinar duplicados una entrada marcada](../images/mergeFlagged.png){.center}

Haga clic en el icono de la bandera roja para editar el texto o eliminar la bandera.

### Terminar un conjunto

Hay dos botones en la parte inferior para terminar el trabajo en el conjunto actual de duplicados potenciales y pasar al
siguiente conjunto: "Guardar & Continuar" y "Aplazar".

#### Guardar y Continuar

![Combinar duplicados botón Guardar & Continuar](../images/mergeSaveAndContinue.png)

El botón azul "Guardar & continuar" hace dos cosas. En primer lugar, guarda todos los cambios realizados (es decir,
todas las acepciones movidas, combinadas o eliminadas), actualizando las palabras en la base de datos. En segundo lugar,
guarda el conjunto de palabras resultante como no duplicadas.

!!! tip "Consejo"

    ¿Los duplicados potenciales no son duplicados? Sólo tiene que hacer clic en Guardar & Continuar para decirle a The Combine que no le vuelva a mostrar ese conjunto.

!!! note "Nota"

    Si una de las palabras de un conjunto no combinado intencionadamente se edita (por ejemplo, en las entradas de revisión), el conjunto puede volver a aparecer como duplicados potenciales.

!!! warning "Importante"

    Evite que varios usuarios fusionen duplicados en el mismo proyecto al mismo tiempo. Si diferentes usuarios fusionan simultáneamente el mismo conjunto de duplicados, se crearán nuevos duplicados (aunque los usuarios tomen las mismas decisiones de fusión).

#### Aplazar

![Combinar duplicados botón Aplazar](../images/mergeDefer.png)

El botón gris "Aplazar" restablece cualquier cambio realizado en el conjunto de duplicados potenciales. El conjunto
aplazado se puede revisar por Revisar duplicados aplazados.

#### Revertir conjunto

El botón "Revertir conjunto" restablece todos los cambios realizados en el conjunto de duplicadas actual (acepciones
movidas, combinadas o borradas) sin que lo aplace. Sólo se activa cuando se han realizado cambios en el conjunto actual.

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

    Una acepción sólo puede tener una parte de la oración. Si se fusionan dos acepciones que tienen diferentes partes de la oración en la misma categoría general, las partes de la oración se combinarán, separadas por un punto y coma (;). Sin embargo, si tienen categorías generales diferentes, sólo se conserva la primera.

#### Entradas y acepciones protegidas {#protected-entries-and-senses}

Si una entrada o acepción importada contiene datos no admitidos en The Combine (por ejemplo, etimologías o inversiones
de sentido), se protege para evitar su eliminación. Si una acepción está protegida, su tarjeta tendrá un fondo
amarillo—no se puede borrar ni colocar en (es decir, se combina en) otra tarjeta de acepción. Si una entrada completa
está protegida, su columna tendrá una cabecera amarilla (donde se encuentran la lengua vernácula y la bandera). Cuando
una entrada protegida sólo tiene una acepción, esa tarjeta de acepción no se puede mover.

## Revisar duplicados aplazados {#review-deferred-duplicates}

Esto abre [Combinar duplicados](#merge-duplicates) con todos los conjuntos de duplicados potenciales que previamente
fueron aplazados con _Combinar duplicados_. Sólo está disponible si hay al menos un conjunto aplazado.

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

![Inventario de caracteres fichas de caracteres](../images/characterInventoryTiles.png)

### Gestionar un solo carácter

Haga clic en una ficha de carácter para abrir un panel para ese carácter.

!!! tip "Consejo"

    Puede que tenga que desplazarse para ver el panel. Si su ventana es lo suficientemente ancha, habrá un margen en blanco a la
    derecha; el panel estará en la parte superior de éste. Si su ventana es estrecha, los azulejos llenarán todo el lado derecho de la
    ventana; el panel estará en la parte inferior, debajo de todos los fichas.

![Inventario de caracteres panel de caracteres](../images/characterInventoryPanel.png){.center}

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
