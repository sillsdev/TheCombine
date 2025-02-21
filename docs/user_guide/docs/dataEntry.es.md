# Entrada de datos

## Árbol de dominios semánticos

Navegue o busque el dominio de su interés.

!!! tip "Consejo"

    Para agilizar la búsqueda de un dominio, The Combine insertará automáticamente `.` entre los dígitos consecutivos a medida que usted
    escriba. Por ejemplo, `1234` se convertirá automáticamente en `1.2.3.4`. Este comportamiento no se produce si se introduce algún carácter no numérico
    se introducen caracteres no numéricos.

## Nueva entrada

### Vernáculo

Palabra tal y como se encuentra en la lengua vernácula, normalmente deletreada fonéticamente o con la ortografía local.

### Glosa

Aunque una entrada puede tener varios acepciones/glosas, sólo se puede añadir uno cuando se crea la entrada por primera
vez.

### Nota

Puede tener una nota en cada entrada. Se puede añadir cualquier anotación para los acepciones de una entrada, glosas,
dominios semánticos, etc a la nota de la entrada.

### Grabación

Puede añadir varias grabaciones a una entrada (por ejemplo, una voz masculina y otra femenina). Como en el caso de la
nota, el audio se asocian a la entrada y no a acepciones individuales.

Para grabar audio, hay un botón circular rojo. Para cada audio grabado, hay un botón triangular verde.

**Con el ratón:** Pulse y mantenga pulsado el círculo rojo para grabar. Haga clic en un triángulo verde para reproducir
su audio, o pulse Mayúsculas y haga clic para borrar su grabación.

**En una pantalla táctil:** Mantenga pulsado el círculo rojo para grabar. Pulse un triángulo verde para reproducir su
audio, o manténgalo pulsado para abrir un menú con opciones.

#### Añadir un locutor a las grabaciones de audio

Haga clic en el icono del locutor en la barra superior para ver una lista de todos los locutores disponibles y
seleccione el locutor actual. Este locutor se asociará automáticamente a cada grabación de audio hasta que cierre la
sesión o seleccione un locutor diferente.

El locutor asociado a una grabación puede verse pasando el ratón por encima de su icono de reproducción, el triángulo
verde. Para cambiar el locutor de una grabación, haga clic con el botón derecho del ratón en el triángulo verde (o
mantén pulsado en una pantalla táctil).

!!! note "Nota"

    El audio importado no se puede borrar ni se le puede añadir un locutor.

## Nueva entrada con forma vernácula duplicada {#new-entry-with-duplicate-vernacular-form}

Si presenta una nueva entrada con idéntica forma vernácula y glosa a una entrada existente, se actualizará dicha entrada
en lugar de crearse una nueva entrada. Por ejemplo, si presenta [Vernáculo: finger; Glosa: dedo] en el dominio 2.1.3.1 (Brazo)
y de nuevo en el dominio 2.1.3.3 (Dedo, dedo del pie), el resultado será una única entrada para "finger" con un única acepción
que tiene glosa "dedo" y dos dominios.

The Combine dispone de una función opcional de facilitar la introducción de palabras que ya existen en el proyecto pero
que se recogen de nuevo en nuevo dominio semántico. Esta función puede activarse o desactivarse en
[Configuración del proyecto > Autocompletar](project.md#autocomplete). Cuando el ajuste está activado, al escribir la
forma vernácula en Entrada de datos, aparece un menú desplegable con formas vernáculas idénticas/similares que ya
existen como entradas en el proyecto. Si ve que la palabra que escribe ya está en el proyecto, puede pulsar en la
palabra en la lista de sugerencias, en lugar de tener que escribir el resto de la palabra. Cuando la configuración está
desactivada, la palabra vernácula debe escribirse en su totalidad; no se sugerirá ninguna coincidencia potencial
existente.

![Entrada de datos duplicados de formularios vernáculos](../images/data-entry-dup-vern.es.png){.center}

Ya sea que escriba una forma que coincide con una entrada existente en el proyecto o seleccione una de las sugerencias
que ofrece The Combine, aparecerá un cuadro con opciones. (Este cuadro no aparecerá si la configuración de Autocompletar
está desactivada o si escribe una forma vernáculo que aún no existe en el proyecto.) En el cuadro emergente, se le
mostrarán todas las entradas existentes con esa forma vernácula y puede elegir si actualizar una de esas entradas o
crear una nueva entrada.

![Entrada de datos entradas vernáculas duplicadas](../images/data-entry-dup-vern-select-entry.es.png){.center}

Si elige crear una nueva entrada, se cerrará el cuadro emergente y entonces podrá escribir la glosa de su nueva entrada.

!!! note "Nota"

    Aunque haya seleccionado crear una nueva entrada, si la glosa que escribe es idéntica a una glosa de otra entrada con la misma forma vernácula, no se creará una nueva entrada, sino que se actualizará esa entrada.

Si por el contrario elige actualizar una de las entradas existentes, aparecerá mas opciones a actualizar una acepción
existente en la entrada seleccionada o añadir una nueva acepción a esa entrada.

![Entrada de datos duplicadas acepciones vernáculas](../images/data-entry-dup-vern-select-sense.es.png){.center}
