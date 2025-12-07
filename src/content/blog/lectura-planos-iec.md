---
title: "Domina la Lectura de Planos Eléctricos Industriales (Norma IEC 60617)"
description: "¿Ves un plano y solo ves rayas? Aprende a interpretar la simbología IEC, las coordenadas y las referencias cruzadas para no perderte en el tablero."
pubDate: 2025-12-12
author: "Ing. Equipo Voltio"
image: "/images/blog/lectura-planos-iec.jpg"
category: "Diseño e Ingeniería"
tags: ["Planos Eléctricos", "IEC 60617", "Simbología", "Diseño"]
isFeatured: true
---

Un técnico que sabe usar el destornillador es útil. Un técnico que sabe **leer planos** es indispensable.

El plano eléctrico es el mapa del tesoro. Si hay una falla y no sabes leerlo, estás adivinando. En la industria moderna (especialmente con maquinaria europea o asiática), la norma que manda es la **IEC (Comisión Electrotécnica Internacional)**.

A diferencia de la norma americana (NEMA/ANSI) que parece una escalera horizontal, la IEC es más simbólica y técnica. Hoy te enseñamos a descifrarla.

![Comparison of IEC vs NEMA electrical symbols]

## 1. El Alfabeto: Simbología IEC 60617

Lo primero que choca es que los símbolos son diferentes. En IEC, los símbolos suelen ser más abstractos y geométricos.

### Los Protagonistas Principales:
* **Bobinas (Contactores/Relés):** En NEMA son círculos. En IEC son **Rectángulos**.
* **Contactos:** Son líneas verticales paralelas.
* **Protecciones:** Se dibujan sobre la línea del conductor.

**Tabla de Traducción Rápida:**

| Dispositivo | Símbolo IEC (Descripción) | Letra de Referencia (Tag) |
| :--- | :--- | :--- |
| **Disyuntor / Guardamotor** | Contacto con una "X" o un cuadro de disparo térmico | **Q** |
| **Contactor (Potencia)** | Contacto abierto con un semicírculo en el medio | **KM** |
| **Relé de Mando** | Rectángulo (Bobina) | **KA** (o K) |
| **Pulsador** | Línea con un "sombrero" (seta o plano) | **S** |
| **Luz Piloto** | Círculo con una X | **H** |
| **Motor** | Círculo con la letra M | **M** |

## 2. El Sistema de Coordenadas (El GPS del Plano)

Un plano industrial tiene 50, 100 o 500 páginas. Si una bobina está en la página 1 y su contacto está en la página 50, ¿cómo lo encuentras?

La norma IEC usa un sistema de **Coordenadas y Referencias Cruzadas**.

### El Marco del Plano
Mira los bordes de la hoja. Verás:
* **Columnas:** Números (1, 2, 3... hasta 8 o 10).
* **Filas:** Letras (A, B, C, D...).

Si ves una referencia que dice: **4.B2**
Significa: Ve a la **Página 4**, Columna **B**, Fila **2**. ¡Ahí encontrarás el componente!

![Electrical schematic grid reference system example]

## 3. Referencias Cruzadas (Padre e Hijo)

Debajo de la bobina de un contactor (el "Padre"), verás una lista de números. Eso te dice dónde están sus hijos (los contactos auxiliares y de potencia).

**Ejemplo:** Tienes la bobina **KM1** en la página 2. Debajo dice:
* **2.1 (NO):** Hay un contacto abierto en la columna 1 de esta misma página.
* **5.4 (NC):** Hay un contacto cerrado en la página 5, columna 4.
* **10.8 (P):** Los contactos de potencia están en la página 10, columna 8.

> **Consejo de Voltio:** Nunca cambies un contactor sin revisar dónde están TODOS sus contactos. Si se te olvida uno, la máquina hará cosas raras.

## 4. Identificación de Cables (Mangueras)

En IEC, los cables no se numeran al azar.
* **Potencia:** L1, L2, L3, N, PE (Tierra).
* **Control (DC):** +24V, 0V (o L+, M).
* **Control (AC):** X1, X2...

Además, verás líneas que cruzan componentes con un símbolo de "regleta" (unos círculos o cuadrados numerados). Esos son los **Bornes de conexión (X1, X2...)**.
Si el plano dice **X1:5**, significa que ese cable va físicamente al borne 5 de la regleta X1 en el tablero.

## 5. Estructura de Lectura: De Arriba a Abajo

A diferencia del NEMA que se lee de izquierda a derecha (como un libro), los esquemas IEC de potencia se suelen leer **de arriba hacia abajo**:

1.  **Barra de Alimentación** (Arriba).
2.  **Protección** (Disyuntor/Fusible).
3.  **Maniobra** (Contactor).
4.  **Protección Térmica** (Relé).
5.  **Actuador** (Motor) - (Abajo).

El esquema de mando (control) suele estar separado y se dibuja entre dos líneas horizontales (Potencial arriba, Común abajo).

---

## Resumen: Los 3 Pasos para no perderse

1.  **Identifica el Tag:** ¿Qué es? (KM = Contactor, Q = Protección).
2.  **Busca la Coordenada:** Mira los números al margen de la hoja para ubicar componentes.
3.  **Sigue la Referencia:** Usa los números debajo de las bobinas para encontrar dónde actúa ese componente en el resto del proyecto.

Saber leer planos te da autoridad. Dejas de ser el que "mueve cables" para ser el que **diagnostica sistemas**.

**¿Quieres practicar con planos reales de tableros industriales y aprender a diseñarlos en software CAD?**

👉 [Ver Curso de Lectura y Diseño de Planos Eléctricos (EPLAN / AutoCAD)](/cursos/lectura-diseno-planos)