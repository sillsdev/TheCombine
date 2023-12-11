# Depuración de datos / Objetivos

## Revisar entradas {#review-entries}

La tabla Revisar entradas muestra todas las entradas del proyecto seleccionado.

### Ordenar y filtrar columnas

Las columnas son: Edición, Vernáculo, Acepciones, Glosas, Dominios, Pronunciaciones, Nota, Bandera y Borrar.

![Revisar los encabezados de columna de las entradas](../images/reviewEntriesColumns.es.png)

En la parte superior de una columna con contenido predominantemente textual (Vernáculo, Glosas, Dominios, Nota o
Bandera), puede ordenar alfabéticamente o filtrar con una búsqueda de texto.

En la parte superior de la columna Acepciones o la columna Pronunciaciones, puede ordenar o filtrar por el número de
acepciones o pronunciaciones que tienen las entradas.

Debido a la naturaleza de la recopilación rápida de palabras, la [entrada de datos](dataEntry.md) en The Combine no
permite añadir definiciones o partes de la oración. Sin embargo, si el proyecto tiene datos importados en los que hay
definiciones o partes de discurso, se añadirán automáticamente columnas adicionales a la tabla Entradas de revisión.

### Edición de filas de entrada

Puede grabar, reproducir o borrar las grabaciones de audio de una entrada con los iconos de la columna Pronunciaciones.
Puede eliminar una entrada completa con el icono de la columna Suprimir.

Para editar la forma vernácula, los acepciones (incluidas las glosas y los dominios), la nota o la bandera de una
entrada, haga clic en el icono de la columna Editar.

## Combinar duplicados {#merge-duplicates}

Esta herramienta encuentra automáticamente conjuntos de entradas potencialmente duplicadas (hasta 5 entrada en cada
conjunto, y hasta 12 conjuntos en cada pasa). Primero presenta conjuntos de palabras con idénticas formas vernáculas. A
continuación, presenta conjuntos con formas vernáculas similares o glosas (o definiciones) idénticas.

![Fusionar duplica dos entradas](../images/mergeTwo.png)

Cada entrada se muestra en una columna, y cada acepción de esa entrada se muestra como una tarjeta que puede pulsar y
arrastrar. Hay tres cosas básicas que puede hacer con una acepción: moverlo, combinarlo con otra acepción o eliminarlo.

### Mover una acepción

Cuando pulsa y mantiene pulsada una tarjeta de acepción, ésta se vuelve verde. Puede arrastrar y soltar la tarjeta de
acepción a un lugar diferente de la misma columna para reordenar las acepciones de esa entrada. O puede arrastrar y
soltar la tarjeta de acepción a una columna diferente para mover la acepción a esa otra entrada.

![Fusionar duplicados moviendo una acepción](../images/mergeMove.png)

Si desea dividir una entrada con varias acepciones en varias entradas, puede arrastrar una de las tarjetas de acepción a
la columna extra vacía de la derecha.

### Fusionar una acepción

Si arrastra una tarjeta de acepción sobre otra tarjeta de acepción, la otra tarjeta de acepción también se vuelve verde.

![Fusionar duplicados fusionar una acepción](../images/mergeMerge.png)

Soltar una carta de acepción sobre otra carta de acepción (cuando ambas están verdes) fusiona las acepciones. Esto hace
que aparezca una barra lateral azul aparezca a la derecha, mostrando cuales acepciones se están fusionando.

![Fusionar duplicados acepciones fusionadas](../images/mergeSidebar.png)

!!! warning "Importante"

    Cuando se fusionan varias acepciones, se conservan todos los dominios semánticos, pero **sólo la acepción superior de la barra lateral** conserva sus glosas (y definiciones).

Puede arrastrar y soltar tarjetas de acepción hacia o desde la barra lateral para cambiar las acepciones que se están
fusionando. O dentro de la barra lateral, puede desplazar una acepción diferente a la parte superior (para conservar sus
glosas).

![Fusionar duplicados moviendo una acepción de la barra lateral](../images/mergeSidebarMove.png)

Pulse el corchete angular derecho (>) para cerrar o abrir la barra lateral azul.

### Borrar una acepción

Para eliminar una acepción por completo, arrastre su tarjeta hasta el icono del cubo de basura situado en la esquina
inferior izquierda. Cuando la tarjeta de acepción se ponga roja, suéltela.

![Fusionar duplicados eliminar una acepción](../images/mergeDelete.png)

Si borra la única acepción que queda de una columna, toda la columna desaparecerá, y esa entrada entera se borrada
cuando pulse Guardar y Continuar.

![Fusionar duplicados acepción borrada](../images/mergeDeleted.png)

### Marcar una entrada

Hay un icono de bandera en la esquina superior derecha de cada columna (a la derecha del formulario vernáculo).

![Fusionar duplicados marcar una entrada](../images/mergeFlag.png){.center}

Puede hacer clic en el icono de la bandera para marcar la entrada para una futura inspección o edición. (Puede
clasificar las entradas marcadas en [Revisar entradas](#review-entries)) Cuando marque una entrada, se le dará la opción
de añadir texto a la bandera.

![Fusionar duplicados añadiendo o editando una bandera](../images/mergeEditFlag.png){.center}

Tanto si se escribe texto como si no, sabrá que la entrada está marcada porque el icono de la bandera aparecerá en rojo
sólido. Si ha añadido texto, puede pasar el cursor por encima de la bandera para ver el texto.

![Fusionar Duplica una entrada marcada](../images/mergeFlagged.png){.center}

Pulse sobre el icono de la bandera roja para editar el texto o eliminar la bandera.

### Terminar un conjunto

Hay dos botones en la parte inferior para terminar el trabajo en el conjunto actual de duplicados potenciales y pasar al
siguiente conjunto: "Guardar y Continuar" y "Aplazar".

#### Guardar y Continuar

![Fusionar duplicados botón Guardar y Continuar](../images/mergeSaveAndContinue.es.png)

El botón azul "Guardar y continuar" hace dos cosas. En primer lugar, guarda todos los cambios realizados (es decir,
todas las acepciones movidas, fusionadas o eliminadas), actualizando las palabras en la base de datos. En segundo lugar,
guarda las palabras no falsificadas como no duplicadas.

!!! tip "Consejo"

    ¿Los duplicados potenciales no son duplicados? Sólo tiene que pulsar Guardar y Continuar para decirle a The Combine que no le vuelva a mostrar ese conjunto.

!!! note "Nota"

    Si una de las palabras de un conjunto no fusionado intencionadamente se edita (por ejemplo, en las entradas de revisión), el conjunto puede volver a aparecer como duplicados potenciales.

#### Aplazar

![Fusionar duplicados botón Aplazar](../images/mergeDefer.es.png)

El botón gris "Aplazar" restablece cualquier cambio realizado en el conjunto de duplicados potenciales. El conjunto
aplazado se puede revisar por Revisar duplicados aplazados.

### Fusión con datos importados

#### Definiciones y parte de la oración

Aunque las definiciones y las partes de la oración no pueden añadirse durante la introducción de datos, sí pueden estar
presentes en las entradas importadas. Esta información aparecerá en las tarjetas de acepción de Fusionar duplicados de
la siguiente manera:

- Cualquier definición en una lengua de análisis se muestra debajo de la glosa en esa lengua.
- Cualquier parte de la oración se indica mediante un hexágono de color en la esquina superior izquierda. El color
  corresponde a su categoría (por ejemplo, sustantivo o verbo). Pase el cursor por encima del hexágono para ver la
  categoría gramatical específica (p. ej., nombre propio o verbo transitivo).

![Fusionar duplicados acepción con definiciones y parte de la oración](../images/mergeSenseDefinitionsPartOfSpeech.png){.center}

#### Entradas y acepciones protegidas

Si una entrada o acepción importada contiene datos no admitidos en The Combine (por ejemplo, etimologías o inversiones
de sentido), se protege para evitar su eliminación. Si una acepción está protegida, su tarjeta tendrá un fondo
amarillo—no se puede borrar ni colocar en (es decir, se combina en) otra tarjeta de acepción. Si una entrada completa
está protegida, su columna tendrá una cabecera amarilla (donde se encuentran la lengua vernácula y la bandera). Cuando
una entrada protegida sólo tiene una acepción, esa tarjeta de acepción no se puede mover.

## Crear inventario de caracteres

Las herramientas de inventario de personajes sólo están disponibles para los administradores de proyectos.

_Crear un inventario de caracteres_ proporciona una visión general de cada carácter unicode que aparece en las formas
vernáculas del entradas del proyecto. Esto le permite identificar qué caracteres se utilizan habitualmente en la lengua
y "aceptarlos" como parte del inventario de caracteres de la lengua. El inventario de caracteres forma parte del archivo
LDML para la lengua vernácula de un proyecto lengua vernácula que se incluye cuando se [exporta](project.md#export) el
proyecto. La aceptación de los caracteres conducirá a una representación precisa de la lengua en Unicode, el Ethnologue
y otros estándares y recursos lingüísticos.

Otro uso de _Crear inventario de caracteres_ es identificar y sustituir caracteres que se han utilizado incorrectamente
al escribir formas vernáculas de palabras.

Hay una ficha para cada carácter unicode que aparece en la forma vernácula de cualquier entrada. Cada ficha muestra el
carácter, su valor Unicode "U+", el número de veces que aparece en las formas vernáculas de entrada y su designación
(por defecto: Indeciso).

![Fichas de personaje del inventario](../images/characterInventoryTiles.png)

### Gestionar un solo carácter

Haga clic en una ficha de personaje para abrir un panel para ese personaje.

!!! tip "Consejo"

    Puede que tenga que desplazarse para ver el panel. Si su ventana es lo suficientemente ancha, habrá un margen en blanco a la
    derecha; el panel estará en la parte superior de éste. Si su ventana es estrecha, los azulejos llenarán todo el lado derecho de la
    ventana; el panel estará en la parte inferior, debajo de todos los azulejos.

![Inventario de personajes panel de personajes](../images/characterInventoryPanel.png){.center}

El centro del panel muestra hasta 5 ejemplos de formas vernáculas en las que aparece el carácter, resaltando el carácter
en cada ocurrencia.

En la parte superior del panel hay tres botones para designar si el carácter debe incluirse en el inventario de
caracteres de la lengua vernácula: "ACEPTAR", "NO DECIDIDO" y "RECHAZAR". Al pulsar cualquiera de estos botones se
actualizará la designación en la parte inferior de la ficha de personaje. (Estas actualizaciones del inventario del
personaje no se guardan en el proyecto hasta que pulse el botón GUARDAR en la parte inferior de la página)

En la parte inferior del panel se encuentra la herramienta Buscar y Reemplazar. Si _cada_ aparición del carácter debe
sustituirse por otra cosa, escriba el carácter o cadena de sustitución en la casilla "Sustituir por" y pulse el botón
APLICAR.

!!! warning "Importante"

    La operación de buscar y reemplazar realiza cambios en las entradas, no en el inventario de personajes. No **se puede deshacer**
