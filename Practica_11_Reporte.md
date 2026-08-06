# Práctica 11: Administración de Cuentas de Usuario y Seguridad

## Introducción

El presente reporte documenta el procedimiento realizado para la administración de cuentas de usuario locales en el sistema operativo Windows, utilizando la herramienta de línea de comandos `net user`. Se abordan las operaciones de creación, consulta, habilitación y deshabilitación de cuentas, con el propósito de comprender su impacto en la seguridad y continuidad operativa de un entorno informático.

---

## 1. Creación de Cuentas de Usuario

Se crearon tres cuentas de usuario locales mediante los siguientes comandos, ejecutados desde una terminal con privilegios de administrador:

```
net user alumno1 Password123! /add
net user alumno2 Password123! /add
net user invitado Password123! /add
```

Cada comando genera una nueva cuenta local con la contraseña especificada, quedando disponible de forma inmediata dentro del grupo predeterminado "Usuarios".

**[INSERTAR CAPTURA DE CREACIÓN AQUÍ]**

### 1.1 Tabla de cuentas creadas

| Usuario  | Habilitado | Grupo    | Cambio de contraseña |
|----------|:----------:|----------|:---------------------:|
| alumno1  | Sí         | Usuarios | No                    |
| alumno2  | Sí         | Usuarios | No                    |
| invitado | Sí         | Usuarios | No                    |

---

## 2. Consulta, Deshabilitación y Habilitación de una Cuenta

### 2.1 Consulta inicial

Se ejecutó el comando `net user alumno1` con la finalidad de obtener el detalle completo de la cuenta, incluyendo su estado, grupo de pertenencia y políticas de contraseña asociadas. En la salida obtenida, la propiedad **"Cuenta activa"** se reportó como **"Sí"**, confirmando que la cuenta se encontraba habilitada para el inicio de sesión.

### 2.2 Deshabilitación de la cuenta

Se procedió a deshabilitar la cuenta `alumno1` mediante el siguiente comando:

```
net user alumno1 /active:no
```

Esta instrucción modifica el estado de la cuenta sin eliminar ninguno de sus datos, perfil o configuración asociada. Como consecuencia directa de esta acción, el usuario `alumno1` **ya no puede iniciar sesión** en el sistema, ya que Windows rechaza cualquier intento de autenticación proveniente de una cuenta marcada como inactiva.

Al volver a ejecutar `net user alumno1`, la propiedad **"Cuenta activa"** cambió de **"Sí"** a **"No"**, confirmando que la deshabilitación se aplicó correctamente.

**[INSERTAR CAPTURA DE DESHABILITACIÓN AQUÍ]**

### 2.3 Habilitación nuevamente

Finalmente, se restauró el acceso de la cuenta mediante:

```
net user alumno1 /active:yes
```

Al verificar el estado de la cuenta con `net user alumno1`, la propiedad **"Cuenta activa"** cambió de **"No"** nuevamente a **"Sí"**, confirmando que el usuario recuperó la capacidad de iniciar sesión sin que se haya requerido ninguna acción adicional de restauración de datos, dado que estos permanecieron intactos durante todo el proceso.

---

## 3. Comparativa: Deshabilitar vs. Eliminar un Usuario

| Acción                | ¿Se conserva la información? | ¿Puede iniciar sesión? | ¿Puede recuperarse fácilmente? |
|------------------------|:-----------------------------:|:------------------------:|:---------------------------------:|
| Deshabilitar usuario   | Sí                            | No                       | Sí                                |
| Eliminar usuario       | No                            | No                       | No                                |

La diferencia sustancial entre ambas operaciones radica en la reversibilidad: deshabilitar una cuenta es una medida temporal y no destructiva, mientras que eliminarla constituye una acción definitiva que suprime el identificador de seguridad (SID) asociado, provocando la pérdida de la vinculación entre el usuario y sus recursos, permisos y perfil de sistema.

---

## 4. Resolución de Casos Prácticos Empresariales

### Caso 1 — Ana (ausencia temporal por incapacidad médica)

**Acción recomendada:** Deshabilitar la cuenta.

**Justificación:** La ausencia de Ana es de carácter temporal y se espera su reincorporación. Deshabilitar la cuenta impide el inicio de sesión durante su ausencia sin afectar su perfil, archivos, permisos ni configuración, permitiendo reactivar el acceso de forma inmediata al momento de su regreso.

### Caso 2 — Luis (proceso de auditoría, posterior desvinculación)

**Acción recomendada:** Deshabilitar temporalmente durante la auditoría y, una vez concluida esta y confirmada la desvinculación definitiva, eliminar la cuenta.

**Justificación:** Mientras la auditoría se encuentra en curso, es necesario conservar la cuenta y su información asociada como posible fuente de evidencia. Una eliminación prematura podría destruir datos relevantes para el proceso. Una vez finalizada la auditoría y formalizada la baja del colaborador, la eliminación de la cuenta resulta apropiada para evitar el mantenimiento innecesario de credenciales de personal que ya no pertenece a la organización.

### Caso 3 — Pedro (bajo investigación interna)

**Acción recomendada:** Deshabilitar la cuenta, conservando los registros (logs) asociados a su actividad.

**Justificación:** Al tratarse de una investigación en curso, resulta indispensable preservar tanto la cuenta como los registros de auditoría y actividad vinculados a esta, ya que constituyen evidencia potencial. Deshabilitar la cuenta bloquea el acceso inmediato de Pedro al sistema sin comprometer la integridad de la información requerida por la investigación.

### Caso 4 — María (cambio de puesto dentro de la organización)

**Acción recomendada:** Modificar los permisos y grupos de pertenencia de la cuenta, sin deshabilitarla ni eliminarla.

**Justificación:** María continúa siendo colaboradora activa de la organización; únicamente ha cambiado su función. Corresponde ajustar sus membresías de grupo y niveles de acceso conforme al principio de mínimo privilegio, asignándole los permisos correspondientes a su nuevo puesto y revocando aquellos que ya no le sean necesarios.

---

## 5. Cuestionario Final

**1. ¿Cuál es la diferencia entre deshabilitar y eliminar una cuenta de usuario?**

Deshabilitar una cuenta es una operación reversible que suspende temporalmente la capacidad de inicio de sesión, conservando íntegramente el perfil, los permisos, el identificador de seguridad (SID) y los archivos asociados al usuario. Eliminar una cuenta, en cambio, es una operación irreversible que borra de manera definitiva el SID y desvincula al usuario de todos los recursos, grupos y permisos que tenía asignados.

**2. ¿Cuáles son las ventajas de deshabilitar una cuenta en lugar de eliminarla?**

Entre las principales ventajas se encuentran: la posibilidad de reactivar el acceso de forma inmediata y sin pérdida de configuración; la conservación de archivos, permisos y membresías de grupo; el mantenimiento de la trazabilidad y del historial de auditoría vinculado al usuario; y la reducción del riesgo de eliminar accidentalmente información crítica cuando aún existe incertidumbre sobre la situación del colaborador.

**3. ¿Qué riesgos representa no deshabilitar cuentas de usuarios que ya no laboran en la organización (cuentas fantasma)?**

Las cuentas fantasma —cuentas activas pertenecientes a personal que ya no forma parte de la organización— representan un riesgo de seguridad considerable, ya que constituyen puntos de acceso no supervisados que pueden ser utilizados de forma maliciosa por el excolaborador o por terceros que obtengan sus credenciales. Estas cuentas incrementan la superficie de ataque del sistema, dificultan la trazabilidad de las acciones realizadas dentro de la red y pueden derivar en accesos no autorizados a información confidencial, incumplimientos normativos y afectaciones a la reputación de la organización.

**4. ¿Qué sucede con los archivos personales de un usuario al deshabilitar su cuenta?**

Los archivos personales, el perfil de usuario y la configuración asociada se mantienen intactos en el disco. La deshabilitación únicamente impide la autenticación y el inicio de sesión de la cuenta; no elimina, mueve ni modifica ningún dato almacenado, por lo que dicha información permanece disponible para su consulta o restauración por parte de un administrador en caso de ser requerida.

**5. ¿En qué escenarios se recomienda deshabilitar una cuenta en lugar de eliminarla?**

Se recomienda deshabilitar una cuenta en escenarios de carácter temporal o incierto, tales como: incapacidades médicas o licencias prolongadas; procesos de auditoría o investigación interna en curso; periodos de transición durante la terminación de un contrato laboral, previos a la confirmación formal de la baja; y, en general, cualquier situación en la que exista la posibilidad de que el usuario reanude sus actividades o en la que se requiera conservar evidencia antes de proceder con una eliminación definitiva.

---

## Conclusión

La correcta administración de cuentas de usuario constituye un pilar fundamental de la seguridad informática dentro de cualquier organización. La elección entre deshabilitar y eliminar una cuenta no debe basarse en la conveniencia inmediata, sino en un análisis del contexto, la reversibilidad requerida y las implicaciones de seguridad, auditoría y continuidad operativa que cada decisión conlleva.
