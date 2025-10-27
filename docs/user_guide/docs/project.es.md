# Proyectos

Un proyecto es para un solo idioma vernáculo.

## Crear un proyecto

Al crear un proyecto, tiene la opción de empezar con un proyecto vacío o de importar los datos léxicos existentes.

![Crear proyecto - Tzotzil](../images/projectCreateTzotzil.es.png){.center}

### Importar los datos existentes

Si tiene datos léxicos en un archivo [LIFT](https://software.sil.org/lifttools) (probablemente exportado de The Combine,
[WeSay](https://software.sil.org/wesay), [FLEx](https://software.sil.org/fieldworks) o
[Lexique Pro](https://software.sil.org/lexiquepro)), puede hacer clic en el botón Navegar junto a "¿Subir los datos
existentes?" para importar los datos a su proyecto.

Si decide no importar datos durante la creación del proyecto, podrá hacerlo más adelante (véase [más abajo](#import)).

### Idioma vernáculo

El _idioma vernáculo_ es el idioma para lo que se recogen palabras. Suele tratarse de una lengua o dialecto local,
indígena minoritario, autóctono, patrimonio o lengua o dialecto en peligro de extinción. Una vez creado un proyecto, el
idioma vernáculo no puede cambiarse.

Si selecciona un archivo LIFT para importar durante la creación del proyecto, aparecerá un menú desplegable que le
permitirá elegir el idioma vernáculo del proyecto entre todos los idiomas de los archivos LDML de la importación.

### Idioma de análisis

El _idioma de análisis_ es el idioma primario a lo que se traduce el idioma vernáculo. Ésta suele ser una lengua
regional, nacional, oficial o mayoritaria del lugar donde se habla la lengua vernácula. Idiomas de análisis adicionales
pueden añadirse tras la creación del proyecto (véase [más abajo](#project-languages)).

Si selecciona un archivo LIFT para importarlo durante la creación del proyecto, cada idioma utilizado en una definición
o glosa se añadirá automáticamente al proyecto como idioma de análisis.

## Administrar un proyecto

Cuando se ha creado o seleccionado un proyecto, éste se convierte en el proyecto activo—deberá ver un icono de engranaje
y/o el nombre del proyecto en el centro de la barra de aplicaciones, en la parte superior de The Combine. Al hacer clic
en el icono de engranaje o en el nombre del proyecto, aparece Proyecto Ajustes para gestionar el proyecto. Los
siguientes ajustes están disponibles para los usuarios del proyecto con permisos suficientes.

![Configuración](../images/projectSettings123456.png)

### Configuración básica

![Configuración básico](../images/projectSettings1Basic.es.png)

#### Nombre del proyecto

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

#### Administración de datos protegidos

Esta sección tiene dos conmutadores de ajuste de Apagado/Encendido acerca de la
[protección](goals.md#protected-entries-and-senses) de las palabras y las acepciones que se importaron con datos no
manejados por The Combine. Ambos ajustes están desactivados por defecto.

Active la opción "Evitar conjuntos protegidos en Combinar duplicados" para que la herramienta Combinar duplicados sólo
muestre conjuntos de posibles duplicados de con al menos una palabra que no esté protegida. Esto evitará conjuntos de
entradas maduras importadas de FieldWorks y promoverá la fusión de entradas recopiladas en The Combine.

Active "Permitir la anulación de la protección de datos en Combinar duplicados" para permitir a los usuarios del
proyecto en Combinar duplicados anular manualmente la protección de palabras y acepciones. Si alguien intenta fusionar o
eliminar una entrada o acepción protegida, The Combine le advierte de los campos que se perderán.

#### Archivar el proyecto

Sólo está disponible para el Propietario del proyecto. Archivar un proyecto lo hace inaccesible para todos los usuarios.
Esto sólo puede ser deshacer por un administrador del sitio. Póngase en contacto con un administrador del sitio si desea
que el proyecto se elimine por completo de los servidores.

### Idiomas del proyecto {#project-languages}

![Idiomas](../images/projectSettings2Langs.es.png)

![Idiomas del proyecto - Tzotzil](../images/projectLanguagesTzotzil.es.png){.center}

El _idioma vernáculo_ especificado en la creación del proyecto es fijo.

Puede haber varios _idiomas de análisis_ asociados al proyecto, pero sólo el primero de la lista se asocia con las
nuevas entradas de datos.

!!! note "Nota"

    Si el proyecto tiene glosas en varios idiomas, esos idiomas deben añadirse aquí para que todas las glosas aparezcan
    en [Limpieza de datos](goals.md). Haga clic en el icono de la lupa para ver todos los códigos de idioma presentes en el proyecto.

El _idioma de los dominios semánticos_ controla el idioma en el que se muestran los títulos y descripciones de los
dominios semánticos en [Entrada de datos](./dataEntry.md).

### Usuarios del proyecto

![Usuarios](../images/projectSettings3Users.es.png)

#### Usuarios actuales

Al lado de cada usuario del proyecto hay un icono con tres puntos verticales. Si usted es el Propietario del proyecto o
un Administrador, puede hacer clic aquí para abrir un menú de gestión de usuarios con las siguientes opciones:

<pre>
    Eliminar del proyecto
    Cambiar rol del proyecto:
        Cosechador
        Editor
        Administrador
    Hacer propietario del proyecto
        [sólo disponible para el Propietario que modifica un Administrador]
</pre>

Una _cosechadora_ puede hacer [entrada de datos](./dataEntry.md) pero no [limpieza de datos](./goals.md). En los ajustes
del proyecto, pueden ver los idiomas del proyecto y el calendario del taller, pero no pueden realizar ningún cambio.

Un _Editor_ tiene permiso para hacer todo lo que puede hacer un _Recolector_, además de
[Revisar entradas](./goals.md#review-entries), [Combinar duplicados](./goals.md#merge-duplicates) y [Exportar](#export).

Un _Administrador_ tiene permiso para hacer todo lo que puede hacer un _Editor_, así como para modificar la mayoría de
los ajustes del proyecto y los usuarios.

!!! warning "Importante"

    Sólo hay un propietario por proyecto. Si hace "Propietario del proyecto" a otro usuario, pasará automáticamente de Propietario a
    Administrador para el proyecto, y ya no podrá archivar el proyecto ni hacer/quitar de Administrador a otros usuarios.

#### Agregar usuarios

Buscar usuarios existentes (muestra todos los usuarios con el término de búsqueda en su nombre, nombre de usuario o
dirección de correo electrónico), o invitar a nuevos usuarios por dirección de correo electrónico (se añadirán
automáticamente al proyecto cuando se hagan una cuenta a través de la invitación).

#### Administrar locutores

Los altavoces son distintos de los usuarios. Se puede asociar un altavoz con la grabación de audio de las palabras.
Utilice el icono + en la parte inferior de esta sección para añadir un altavoz. Junto a cada locutor añadido hay botones
para eliminarlo, editar su nombre y añadir un consentimiento para el uso de su voz grabada. Los métodos admitidos para
añadir el consentimiento son (1) grabar un archivo de audio o (2) cargar un archivo de imagen.

Cuando los usuarios del proyecto estén en Entrada de datos o Revisar entradas, aparecerá un icono de altavoz en la barra
superior. Los usuarios pueden pulsar ese botón para ver una lista de todos los altavoces disponibles y seleccionar el
altavoz actual, este altavoz será automáticamente este altavoz se asociará automáticamente a todas las grabaciones de
audio realizadas por el usuario hasta que cierre la sesión o seleccione un altavoz diferente.

El altavoz asociado a una grabación puede verse pasando el ratón por encima de su icono de reproducción. Para cambiar el
altavoz de una grabación haz clic con el botón derecho del ratón en el icono de reproducción (o mantén pulsado en una
pantalla táctil para abrir un menú).

Cuando se exporta el proyecto desde The Combine, los nombres (e ids) de los locutores se añadirán como etiquetas de
pronunciación en el archivo Archivo LIFT. Todos los archivos de consentimiento de los ponentes del proyecto se añadirán
a una subcarpeta "consentimiento" de la exportación (con los identificadores de ponente para los nombres de los
archivos).

### Importar/Exportar

![Importar/Exportar](../images/projectSettings4Port.es.png)

#### Importar {#import}

!!! note "Nota"

    Actualmente, el tamaño máximo de los archivos LIFT admitidos para la importación es de 100 MB.

Al importar un archivo LIFT en The Combine, se importarán todas las entradas con forma de lexema o forma de cita que
coincida con el idioma vernáculo del proyecto.

La primera vez que se importa en un proyecto, las palabras importadas se añadirán junto con las palabras recopiladas en
The Combine. No se realizará ninguna deduplicación, combinación o sincronización automática.

Si realiza una segunda importación, todas las palabras de The Combine se borrarán automáticamente antes de que se
importen las nuevas palabras. No haga una segunda importación a menos que ya haya exportado su proyecto y lo haya
importado a FieldWorks. Luego, si desea hacer más recopilación de palabras en The Combine, puede exportar desde
FieldWorks e importar a The Combine. Las palabras anteriores se borrarán para poder empezar de cero con los datos
actualizados de FieldWorks.

#### Exportar {#export}

Tras hacer clic en el botón Exportar, puede navegar por otras partes del sitio web mientras se preparan los datos para
la descargar. Una vez recopilados los datos, la descarga comenzará automáticamente. El nombre del archivo es el id del
proyecto.

!!! warning "Importante"

    Un proyecto que haya alcanzado cientos de MB de tamaño puede tardar varios minutos en exportarse.

!!! note "Nota"

    No se exportan la configuración del proyecto, los usuarios del proyecto, los indicadores de palabras ni las preguntas de dominio semántico personalizadas.

#### Exportar locutores de las pronunciaciones

Cuando se exporta un proyecto desde The Combine y se importa a FieldWorks, si una pronunciación tiene un locutor
asociado, el nombre del orador se añadirá como etiqueta de pronunciación. Los archivos de consentimiento se pueden
encontrar en la exportación comprimida, pero no se importarán en FieldWorks no se importarán en FieldWorks.

### Calendario {#schedule}

![Calendario](../images/projectSettings5Sched.es.png)

Sólo está disponible para editar para el Propietario del proyecto, lo que permite fijar un calendario para un taller de
recopilación rápida de palabras. Haga clic en el primer botón para seleccionar un intervalo de fechas para el taller.
Haga clic en el botón central para añadir o eliminar fechas concretas. Haga clic en el último botón para borrar la
programación.

![Calendario de talleres](../images/projectSchedule.es.png){.center}

### Dominios semánticos {#semantic-domains}

![Dominios semánticos](../images/projectSettings6Doms.es.png)

En esta pestaña de configuración, puede cambiar el idioma del dominio semántico y gestionar dominios semánticos
personalizados.

El _idioma de los dominios semánticos_ controla el idioma en el que se muestran los títulos y descripciones de los
dominios semánticos en [Entrada de datos](./dataEntry.md).

Por el momento, The Combine sólo admite _dominios semánticos personalizados_ que amplíen los
[dominios establecidos](https://semdom.org/). Para cada dominio establecido, se puede crear un subdominio personalizado,
que tendrá `.0` al final del identificador del dominio. Por ejemplo, el dominio _6.2.1.1: Cultivo de Cereales_ tiene
tres subdominios estándar, para el arroz, el trigo y el maíz. Si otro grano, como la Cebada, es dominante entre el grupo
de personas que recogen palabras, puede añadirse como dominio _6.2.1.1.0_.

![Añadir dominio personalizado](../images/projectSettingsDomsCustomAdd.png){.center}

Para cada dominio personalizado, puede añadir una descripción y preguntas que le ayuden con la recopilación de palabras
en ese dominio.

![Editar dominio personalizado](../images/projectSettingsDomsCustomEdit.png){.center}

!!! note "Nota"

    Los dominios semánticos personalizados se incluyen en la exportación del proyecto y pueden importarse a FieldWorks. Sin embargo, las
    preguntas no están incluidas.

Los dominios semánticos personalizados estarán disponibles para todos los usuarios del proyecto que realicen
Introducción de datos.

![Ver dominio personalizado](../images/projectSettingsDomsCustomSee.png){.center}

!!! note "Nota"

    Los dominios semánticos personalizados son específicos de cada idioma. Si añades un dominio personalizado en un idioma y luego cambias el idioma de los dominios semánticos
    ese dominio no será visible a menos que cambies de nuevo a su idioma.

## Estadísticas del proyecto

Si usted es el Propietario del proyecto, habrá otro icono junto al icono del engranaje en la App Bar, en la parte
superior de The Combine. Esto abre las estadísticas sobre las palabras en el proyecto.

![Botón de estadísticas del proyecto](../images/projectStatsButton.png){.center}

En el contexto de estas estadísticas, _palabra_ se refiere a un par acepción-dominio: por ejemplo, una entrada con 3
acepciones, cada uno con 2 dominios semánticos, se contará como 6 palabras.

### Palabras por usuario

Una tabla con el número de palabras y dominios semánticos distintos para cada usuario del proyecto. Las palabras
importadas no tienen un usuario y se contabilizarán en una fila "unknownUser".

### Palabras por dominio

Una tabla con el número de palabras de cada dominio semántico.

### Palabras por día

Gráficos lineales que muestran las palabras recogidas durante los días especificados en el [Calendario](#schedule) de
talleres.

### Progresos del taller

Gráficos lineales que muestran las palabras recogidas acumuladas a lo largo de los días del [Calendario](#schedule) de
talleres, así como las previsiones para el resto del taller.
