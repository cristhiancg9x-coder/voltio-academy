---
title: "No quemes tu bomba: Cómo dimensionar el Guardamotor exacto"
description: "¿Usas una llave térmica común para tu bomba de agua? Error grave. Aprende a calcular, seleccionar y regular el guardamotor correcto para proteger tu inversión."
pubDate: 2025-12-09
author: "Ing. Equipo Voltio"
image: "/images/blog/dimensionamiento-guardamotor-bomba.jpg"
category: "Motores y Control"
tags: ["Bombas", "Guardamotor", "Cálculo", "Protección"]
isFeatured: false
---

Si instalas una bomba de agua (ya sea para un tanque elevado en casa o un sistema de riego) y la proteges con una "llave térmica" normal (termomagnético riel DIN), estás jugando a la ruleta rusa.

¿Por qué? Porque la térmica estándar está hecha para proteger cables, no bobinados de motores.

Para el motor, necesitas un **Guardamotor**. Es un "traje a la medida" que combina protección magnética (cortocircuitos) y térmica (sobrecargas) ajustable. Hoy aprenderás a elegir el calibre exacto en 3 pasos sencillos, sin fórmulas complejas que nadie usa en la obra.

![Guardamotor con dial de regulacion de amperaje](/images/blog/detalle-dial-guardamotor.jpg)

## Paso 1: La Placa de Características (El DNI del Motor)

No puedes adivinar. Tienes que ir a la bomba y leer la placa metálica. El dato rey que buscamos es la **Corriente Nominal ($I_n$)** o **FLA** (Full Load Amps).

Si la placa es legible y dice `Amps: 5.5 A`, ¡felicidades! Pasa al Paso 2.

### ¿Y si la placa no se lee? (Cálculo Rápido)
Si solo sabes la potencia (HP) y el voltaje, usa estas fórmulas para estimar la corriente nominal ($I_n$):

**Para Bombas Monofásicas (220V):**
$$I_n \approx P_{(HP)} \times 5$$
*(Ejemplo: Bomba de 1 HP $\approx$ 5 Amperios)*

**Para Bombas Trifásicas (380V):**
$$I_n \approx P_{(HP)} \times 1.5$$
*(Ejemplo: Bomba de 2 HP $\approx$ 3 Amperios)*

> **Nota Técnica:** La fórmula exacta es $I = \frac{P_{(watts)}}{\sqrt{3} \cdot V \cdot \cos\phi \cdot \eta}$. Pero en campo, los factores prácticos de arriba te dan una aproximación segura para *buscar el rango*.

## Paso 2: Selección del Rango de Regulación

A diferencia de las térmicas fijas (C16, C20, C32), el guardamotor tiene un **rango ajustable** (ej: 4 a 6.3 A).

**La Regla de Oro:**
Tu corriente nominal ($I_n$) debe quedar, idealmente, en el **medio del rango** del guardamotor.

**Ejemplo Práctico:**
Tienes una bomba periférica de **1 HP monofásica (220V)**.
1.  Miras la placa y dice: **4.8 Amperios**.
2.  Vas a la tienda y pides un guardamotor.
    * Opción A: Rango 2.5 - 4 A (Muy chico, no sirve).
    * Opción B: Rango 6 - 10 A (Muy grande, pierde precisión).
    * Opción C: **Rango 4 - 6.3 A**. (¡Perfecto! El 4.8 entra cómodo).



[Image of motor protection circuit breaker sizing chart]


## Paso 3: La Regulación (El Ajuste Fino)

Una vez instalado, verás una perilla o dial con números.
¿Dónde lo pones? ¿Le das un "poquito más" por si acaso? **NO**.

El guardamotor se regula **exactamente a la corriente nominal ($I_n$) de la placa**.

* Si la placa dice **4.8 A**, giras la perilla hasta **4.8 A**.

Si lo ajustas más alto, el motor podría quemarse antes de que el dispositivo salte. Si lo ajustas más bajo, saltará a cada rato ("disparo intempestivo") cuando la bomba trabaje a plena carga.

### El Factor de Servicio (SF)
Solo si tu placa dice **S.F. 1.15** (Service Factor), podrías teóricamente subir el ajuste un 10-15%, pero en **VoltioAcademy** recomendamos mantenerlo al 100% de la $I_n$ para mayor vida útil del equipo.

---

## Ejemplo Completo: Bomba Sumergible

Vamos a dimensionar uno real para una cisterna de edificio:

* **Motor:** 3 HP, Trifásico 380V.
* **Placa:** No se lee bien, pero sabemos la potencia.
* **Cálculo Estimado:** $3 \text{ HP} \times 1.5 = 4.5 \text{ A}$ aprox.
* *(Miramos tablas técnicas de fabricantes como Siemens/Schneider para 3HP 380V $\rightarrow$ Realidad aprox: 5.0 A)*.
* **Selección:** Buscamos un guardamotor con rango **4.0 - 6.3 A**.
* **Ajuste:** Usamos una pinza amperimétrica con la bomba funcionando a plena carga (con agua). Si la pinza marca **4.9 A**, ajustamos el dial a **5.0 A**.

| Potencia Bomba (380V) | Corriente Aprox ($I_n$) | Rango Guardamotor Sugerido |
| :--- | :--- | :--- |
| 1 HP | 1.6 - 1.9 A | 1.6 - 2.5 A |
| 2 HP | 3.2 - 3.6 A | 2.5 - 4.0 A |
| 3 HP | 4.8 - 5.2 A | 4.0 - 6.3 A |
| 5 HP | 7.6 - 8.5 A | 6.3 - 10 A |
| 7.5 HP | 11 - 12.5 A | 9 - 14 A |

---

## ¿Y el cable?
El guardamotor protege al motor, pero el cable debe soportar más. Para el cable, aplica la regla del CNE:
$$I_{cable} \ge 1.25 \times I_n$$
En nuestro ejemplo de 5.0 A, el cable debe aguantar al menos 6.25 A. (Un cable 14 AWG o 2.5mm² sobra y basta).

**¿Quieres aprender a diseñar tableros de bombas alternadas con contactores y boyas de nivel?**
Es uno de los trabajos más solicitados en condominios y edificios.

👉 [Ver Curso de Automatización de Sistemas de Bombeo](/cursos/automatizacion-bombas)