# Entrada de datos

## Árbol de dominios semánticos

Navegue o busque el dominio de su interés.

!!! tip

    Para agilizar la búsqueda de un dominio, The Combine insertará automáticamente `.` entre los dígitos consecutivos a medida que usted
    escriba. Por ejemplo, `1234` se convertirá automáticamente en `1.2.3.4`. Este comportamiento no se produce si se introduce algún carácter no numérico
    se introducen caracteres no numéricos.

## Nueva entrada

### Vernáculo

Palabra tal y como se encuentra en la lengua vernácula, normalmente deletreada fonéticamente o con la ortografía local.

### Glosa

Una entrada puede tener varios acepciones/brillos, aunque sólo se puede añadir uno cuando se crea la entrada por primera
vez.

### Nota

Puede tener una nota en cada entrada. Se puede añadir cualquier anotación para los acepciones de una entrada, glosas,
dominios semánticos, etc a la nota de la entrada.

### Grabación

Puede añadir varias grabaciones a una entrada (por ejemplo, una voz masculina y otra femenina). Como en el caso de la
nota, el audio se asocian a la entrada y no a sus acepciones.

Para grabar audio, hay un botón circular rojo. Para cada audio grabado, hay un botón triangular verde.

**Con el ratón:** Pulse y mantenga pulsado el círculo rojo para grabar. Haga clic en un triángulo verde para reproducir
su audio, o pulse Mayúsculas y haga clic para borrar su grabación.

**En una pantalla táctil:** Mantenga pulsado el círculo rojo para grabar. Pulse un triángulo verde para reproducir su
audio, o manténgalo pulsado para abrir un menú (con opciones para reproducir o eliminar).

## Nueva entrada con formulario vernáculo duplicado

Si presenta una nueva entrada con idéntica forma vernácula y glosa a una entrada existente, se actualizará dicha entrada
en lugar de crearse una nueva entrada. Por ejemplo. Si presenta [Vernáculo: finger; Glosa: dedo] en el dominio 2.1.3.1
(Brazo) y de nuevo en el dominio 2.1.3.3 (Dedo, dedo del pie), el resultado será una única entrada para "finger" con un
única acepción que tiene glosa "dedo" y dos dominios.

The Combine dispone de una función opcional de ayuda a la introducción de datos que implica la duplicación de
formularios vernáculos. Puede activarse o desactivarse en
[Configuración del proyecto > Autocompletar](project.md#autocompletar). Cuando el ajuste está activado, al escribir la
forma vernácula en Entrada de datos, aparece un menú desplegable con formas vernáculas idénticas/similares que ya
existen en otras entradas en el proyecto. Si ignora las opciones del menú y teclea un nuevo formulario vernáculo, puede
simplemente continuar con la glosa y enviar una nueva entrada.

![Entrada de datos duplicados de formularios vernáculos](../images/data-entry-dup-vern.png) {.center}

Cuando la opción de autocompletar está activada y escribe o selecciona una forma vernácula que ya existe en otra
entrada, aparecerá un cuadro aparecerá con opciones. Se le mostrarán todas las entradas con esa forma vernácula y podrá
elegir si desea actualizar una de esas entradas o crear una nueva. Si elige crear una nueva entrada, el cuadro emergente
desaparecerá y podrá escribir la glosa para su nueva entrada.

![Entrada de datos entradas vernáculas duplicadas](../images/data-entry-dup-vern-select-entry.png) {.center}

!!! note

    Aunque haya seleccionado crear una nueva entrada, si la glosa que escribe es idéntica a una glosa de otra entrada con la misma forma vernácula, no se creará una nueva entrada, sino que se actualizará esa entrada.

Si elige actualizar una de las entradas existentes, aparecerá un segundo cuadro. Aquí puede elegir actualizar una
acepción existente en la entrada seleccionada o añadir una nueva acepción a esa entrada.

![Entrada de datos duplicadas acepciones vernáculas](../images/data-entry-dup-vern-select-sense.png) {.center}
