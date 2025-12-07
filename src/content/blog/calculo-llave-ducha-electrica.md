---
title: "Cálculo de Llave Termomagnética para Ducha Eléctrica"
description: "¿Qué llave poner a la ducha? Aprende a calcular el interruptor termomagnético y el cable correcto para tu ducha eléctrica según el CNE."
pubDate: 2025-12-06
author: "Ing. Equipo Voltio"
image: "https://images.unsplash.com/photo-1581092921461-eab6245b0262?q=80&w=1000&auto=format&fit=crop"
category: "Residencial"
tags: ["Cálculo", "Ducha Eléctrica", "Protección", "CNE"]
isFeatured: false
---

¡Hola, colega! Hoy vamos a resolver una de las preguntas más frecuentes que recibo en obra y en clase: **"Profe, ¿de cuánto tiene que ser la llave para esta ducha?"**.

Instalar una ducha eléctrica (especialmente las "instantáneas" o "rápidas") no es juego. Es uno de los equipos de mayor consumo en una casa y combina dos cosas que no se llevan bien si no sabes lo que haces: **electricidad y agua**. Un mal cálculo aquí no solo te deja sin agua caliente a mitad del baño, sino que puede derretir cables o causar incendios.

Vamos a calcularlo como manda el **Código Nacional de Electricidad (CNE) Utilización**, sin fórmulas complicadas, directo al grano.

![Diagrama de instalacion de ducha electrica con termomagnetica y diferencial](/images/blog/diagrama-instalacion-ducha.jpg)

## Paso 1: La Fórmula Sagrada

Para saber qué "llave" (Interruptor Termomagnético o ITM) necesitas, primero debes saber cuánta corriente (Amperios) va a "jalar" tu ducha. La fórmula es la Ley de Watt básica:

$$I = \frac{P}{V}$$

Donde:
* **I (Intensidad):** Corriente en Amperios (A).
* **P (Potencia):** La potencia de tu ducha en Watts (W). (Mira la caja o la etiqueta de la ducha).
* **V (Voltaje):** En Perú, el voltaje residencial estándar es **220 V**.

### Ejemplo Práctico
Digamos que compraste la clásica ducha marca *Lorenzetti* o similar de **5500 Watts**.

$$I = \frac{5500 \text{ W}}{220 \text{ V}} = 25 \text{ Amperios}$$

Esto significa que tu ducha, funcionando al máximo (modo invierno), consumirá **25 A**.

## Paso 2: Selección del Interruptor Termomagnético (La "Llave")

Aquí es donde muchos cometen el error. Piensan: *"Si consume 25A, le pongo una llave de 25A"*.
**¡Cuidado!** Si la llave es muy justa, con el calor y el tiempo de uso podría dispararse (saltar) en pleno baño. Por norma y seguridad, se busca un valor comercial inmediatamente superior o igual, pero que **PROTEJA AL CABLE**.

En el mercado, los valores comunes de llaves son: **16A, 20A, 25A, 32A, 40A**.

Para nuestro ejemplo de **25A**:
* Una llave de **25A** trabajaría al 100% de su capacidad. Es arriesgado.
* Lo ideal técnico sería pasar al siguiente valor comercial: **32A**.

> **Regla de Oro del Profe Voltio:** La capacidad de la llave termomagnética **NUNCA** debe ser mayor que la capacidad del cable. La llave está ahí para proteger al cable, no a la ducha.

## Paso 3: Selección del Cable (Lo más importante)

Si decidimos usar una llave de **32A**, necesitamos un cable que soporte **más de 32A**. Si pones un cable delgado (digamos 2.5 mm² o #14 AWG) con una llave de 32A, el cable se quemará antes de que la llave salte.

Según las tablas del **CNE Utilización (Tabla 2)** para conductores en tubería (lo usual en casas):

* **Cable 4 mm² (aprox. #12 AWG):** Soporta aprox. **25-28 A**. (Muy justo para 5500W, peligroso con llave de 32A).
* **Cable 6 mm² (aprox. #10 AWG):** Soporta aprox. **34-40 A**. (**¡Este es el ganador!**)

### Resumen de Selección (Tabla Rápida)

Para instalaciones monofásicas a 220V en Perú:

| Potencia Ducha | Corriente Calc. | Cable Mínimo (Indeco/CNE) | Llave ITM Recomendada |
| :--- | :--- | :--- | :--- |
| **3500 W** - 4000 W | ~16 - 18 A | 4 mm² (#12 AWG) | **20 A** |
| **4500 W** | ~20.5 A | 4 mm² (#12 AWG) | **25 A** |
| **5000 W - 5500 W** | ~23 - 25 A | **6 mm² (#10 AWG)** | **32 A** |
| **> 6000 W** | > 27 A | 6 mm² (#10 AWG) | **40 A** |

*(Nota: Valores referenciales para conductores THW-90 o libre de halógenos en tubería. Siempre verifica la ficha técnica de tu cable).*

![Tabla de capacidad de corriente conductores electricos peru](/images/blog/tabla-capacidad-cables-cne.jpg)

## La Seguridad NO es Negociable: El Interruptor Diferencial

El CNE Utilización, en la **Regla 150-758 (Calentadores de Agua con Elementos Desnudos)**, es estricto:

1.  **Circuito Independiente:** La ducha debe tener su propio circuito desde el tablero. No la empalmes de la luz del baño ni del tomacorriente.
2.  **Protección Diferencial:** Es **OBLIGATORIO** instalar un **Interruptor Diferencial (ID)** de 30mA (salvavidas). La termomagnética protege los cables; el diferencial protege **tu vida** si hay una fuga de corriente a través del agua.

> **¡Ojo!** El interruptor diferencial también debe ser de una capacidad igual o mayor a la llave termomagnética. Si usas llave de 32A, tu diferencial debe ser de 40A (2x40A 30mA).

## Errores Comunes que te Pueden Costar Caro

1.  **Usar cable mellizo:** Prohibido para instalaciones fijas y duchas. Se calienta, se reseca y causa cortocircuitos. Usa cable sólido o cableado (hilos) tipo TW-80 o THW-90.
2.  **No conectar la tierra:** El cable verde/amarillo de la ducha debe ir a la barra de tierra del tablero. Si tu casa no tiene pozo a tierra, el Interruptor Diferencial es aún más vital, pero no reemplaza la puesta a tierra física.
3.  **Empalmes dentro de la ducha:** La conexión entre los cables de la pared y la ducha debe hacerse con **conector de porcelana** o **cinta vulcanizante**. La cinta aislante simple se despega con el vapor.

---

Instalar una ducha eléctrica es una responsabilidad grande. Si sigues estos pasos, garantizas un baño caliente y, lo más importante, seguro para ti y tu familia.

**¿Quieres aprender a dimensionar circuitos completos para toda una casa?**
En nuestro curso profundizamos en cuadros de cargas, selección de conductores y normativa CNE al detalle.

👉 [Ver Curso de Diseño de Instalaciones Eléctricas](/cursos/diseno-electrico)