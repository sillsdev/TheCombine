# Proyectos

Un proyecto es para una sola lengua vernácula.

## Crear un proyecto

Al crear un proyecto, tiene la opción de empezar con un proyecto vacío o de importar los datos léxicos existentes.

![Crear proyecto - Tzotzil](../images/projectCreateTzotzil.png){ .center }

### Importar los datos existentes

Si tiene datos léxicos en un archivo [LIFT](https://software.sil.org/lifttools) (probablemente exportado de The Combine,
[WeSay](https://software.sil.org/wesay), [FLEx](https://software.sil.org/fieldworks) o
[Lexique Pro](https://software.sil.org/lexiquepro)), puede hacer clic en el botón BROWSE junto a "¿Cargar los datos
existentes?" para importar los datos a su proyecto.

Si decide no importar datos durante la creación del proyecto, podrá hacerlo más adelante (véase [más abajo](#import)).

### Idioma vernáculo

La _lengua vernácula_ es la lengua para la que se recogen palabras. Suele tratarse de una lengua o dialecto local,
indígena minoritario, autóctono, patrimonio o lengua o dialecto en peligro de extinción. Una vez creado un proyecto, la
lengua vernácula no puede cambiarse.

Si selecciona un archivo LIFT para importar durante la creación del proyecto, aparecerá un menú desplegable que le
permitirá elegir la lengua vernácula del proyecto entre todas las lenguas de los archivos LDML de la importación.

### Idioma de análisis

La _lengua de análisis_ es la lengua primaria a la que se traduce la lengua vernácula. Ésta suele ser una lengua
regional, nacional, oficial o mayoritaria del lugar donde se habla la lengua vernácula. Análisis adicionales pueden
añadirse tras la creación del proyecto (véase [más abajo](#project-languages)).

Si selecciona un archivo LIFT para importarlo durante la creación del proyecto, cada idioma utilizado en una definición
o glosa se añadirá automáticamente al proyecto como lengua de análisis.

## Administrar un proyecto

Cuando se ha creado o seleccionado un proyecto, éste se convierte en el proyecto activo-deberá ver un icono de engranaje
y/o el nombre del proyecto en el centro de la barra de aplicaciones, en la parte superior de The Combine. Al hacer clic
en el icono de engranaje o en el nombre del proyecto, aparece Proyecto Ajustes para gestionar el proyecto. Los
siguientes ajustes están disponibles para los usuarios del proyecto con permisos suficientes.

### Configuración básica

![Configuración básico](../images/projectSettings1Basic.png){ width=750 .center }

#### Nombre del Proyecto

Se recomienda un nombre distintivo y descriptivo. El nombre del proyecto forma parte del nombre del archivo cuando usted
[exporte](#export) su proyecto.

#### Autocompletar {#autocomplete}

El ajuste por defecto es Activado: Cuando un usuario está introduciendo la forma vernácula de una nueva entrada en
Entrada de datos, este ajuste ofrece sugerencias de entradas similares existentes, lo que permite al usuario seleccionar
una entrada existente y añadir una nueva acepción a esa entrada, en lugar de crear un duplicado (en su mayoría) a algo
introducido previamente. Consulte [Introducción de datos](dataEntry.md#new-entry-with-duplicate-vernacular-form) para
más detalles.

(Esto no afecta a las sugerencias ortográficas para la glosa, ya que dichas sugerencias se basan en un diccionario
independiente de los datos existentes del proyecto)

#### Archivar el proyecto

Sólo está disponible para el Propietario del proyecto. Archivar un proyecto lo hace inaccesible para todos los usuarios.
Esto sólo puede ser deshacer por un administrador del sitio. Póngase en contacto con un administrador del sitio si desea
que el proyecto se elimine por completo de los servidores.

### Idiomas del proyecto {#project-languages}

![Idiomas](../images/projectSettings2Langs.png){ width=750 .center }

![Idiomas del proyecto - Tzotzil](../images/projectLanguagesTzotzil.png){ .center }

La _lengua vernácula_ especificada en la creación del proyecto es fija.

Puede haber varios _idiomas de análisis_ asociados al proyecto, pero sólo el primero de la lista se asocia con las
nuevas entradas de datos.

!!! note

    Si el proyecto tiene glosas en varios idiomas, esos idiomas deben añadirse aquí para que todas las glosas aparezcan
    en [Limpieza de datos](goals.md). Pulse el icono de la lupa para ver todos los códigos de idioma presentes en el proyecto.

El _idioma de los_ dominios semánticos controla el idioma en el que se muestran los títulos y descripciones de los
dominios semánticos en [Entrada de datos](./dataEntry.md).

### Usuarios del proyecto

![Usuarios](../images/projectSettings3Users.png){ width=750 .center }

#### Usuarios actuales

Al lado de cada usuario del proyecto hay un icono con tres puntos verticales. Si usted es el Propietario del proyecto o
un Administrador, puede hacer clic aquí para abrir un menú de gestión de usuarios con las siguientes opciones:

<pre>
    Eliminar del proyecto
    Cambiar el papel del proyecto:
        Cosechadora
        Editor
        Administrador
    Convertir el proyecto en Propietario
        [sólo disponible para el Propietario que modifica un Administrador]
</pre>

Una _cosechadora_ puede hacer [entrada de datos](./dataEntry.md) pero no [limpieza de datos](./goals.md). En los ajustes
del proyecto, pueden ver los idiomas del proyecto y el calendario del taller, pero no pueden realizar ningún cambio.

Un _Editor_ tiene permiso para hacer todo lo que puede hacer un _Recolector_, además de
[Revisar entradas](./goals.md#review-entries), [Combinar duplicados](./goals.md#merge-duplicates) y [Exportar](#export).

Un _Administrador_ tiene permiso para hacer todo lo que puede hacer un _Editor_, así como para modificar la mayoría de
los ajustes del proyecto y los usuarios.

!!! important

    Sólo hay un propietario por proyecto. Si hace "Propietario del proyecto" a otro usuario, pasará automáticamente de Propietario a
    Administrador para el proyecto, y ya no podrá archivar el proyecto ni hacer/quitar de Administrador a otros usuarios.

#### Agregar usuarios

Buscar usuarios existentes (muestra todos los usuarios con el término de búsqueda en su nombre, nombre de usuario o
dirección de correo electrónico), o invitar a nuevos usuarios por dirección de correo electrónico (se añadirán
automáticamente al proyecto cuando se hagan una cuenta a través de la invitación).

### Importar/Exportar

![Importar/Exportar](../images/projectSettings4Port.png){ width=750 .center }

#### Importar {#import}

!!! note

    Actualmente, el tamaño máximo de los archivos LIFT admitidos para la importación es de 100 MB.

!!! note

    Actualmente, sólo se puede importar un archivo LIFT por proyecto.

#### Exportar {#export}

Tras pulsar el botón Exportar, puede navegar por otras partes del sitio web mientras se preparan los datos para la
descargar. Aparecerá un icono de descarga en la barra de aplicaciones cuando la exportación esté lista para su descarga.
El nombre de archivo por defecto es el nombre del proyecto con una marca de tiempo añadida.

!!! important

    Un proyecto que haya alcanzado cientos de MB de tamaño puede tardar varios minutos en exportarse.

### Calendario de talleres {#workshop-schedule}

![Calendario de talleres](../images/projectSettings5Sched.png){ width=750 .center }

Sólo está disponible para el Propietario del proyecto, lo que permite fijar un calendario para un taller de recopilación
rápida de palabras. Haga clic en el primer botón para seleccionar un intervalo de fechas para el taller. Pulse el botón
central para añadir o eliminar fechas concretas. Pulse el último botón para borrar la programación.

![Calendario de talleres](../images/projectSchedule.png){ .center }

## Estadísticas del proyecto

Si usted es el Propietario del proyecto, habrá otro icono junto al icono del engranaje en la App Bar, en la parte
superior de The Combine. Esto abre las estadísticas sobre las palabras en el proyecto.

![Botón de estadísticas del proyecto](../images/projectStatsButton.png){ .center }

En el contexto de estas estadísticas, _palabra_ se refiere a un par acepción-dominio: por ejemplo, una entrada con 3
acepciones, cada uno con 2 dominios semánticos, se contará como 6 palabras.

### Palabras por usuario

Una tabla con el número de palabras y dominios semánticos distintos para cada usuario del proyecto. Las palabras
importadas no tienen un usuario y se contabilizarán en una fila "unknownUser".

### Palabras por dominio

Una tabla con el número de palabras de cada dominio semántico.

### Palabras por día

Gráficos lineales que muestran las palabras recogidas durante los días especificados en el
[Calendario de talleres](#workshop-schedule).

### Progresos del taller

Gráficos lineales que muestran las palabras acumuladas a lo largo de los días del
[Calendario de talleres](#workshop-schedule), así como las previsiones para el resto del taller.
