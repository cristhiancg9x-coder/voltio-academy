---
title: "Arranque Estrella-Triángulo: Diagramas de Fuerza y Mando (Guía Paso a Paso)"
description: "El clásico de la automatización industrial. Descarga y entiende los esquemas de fuerza y mando del arranque estrella-triángulo para evitar picos de corriente."
pubDate: 2025-12-08
author: "Ing. Equipo Voltio"
image: "/images/blog/estrella-triangulo-portada.jpg"
category: "Automatización"
tags: ["Motores", "Contactores", "Diagramas", "Automatización Industrial"]
isFeatured: true
---

Si hay un circuito que es el "Padre Nuestro" de los electricistas industriales, es el **Arranque Estrella-Triángulo**.

¿Por qué? Porque los motores trifásicos, al arrancar directamente, son "glotones": piden entre **5 y 7 veces** su corriente nominal. Esto puede hacer saltar las llaves generales o dañar la mecánica de la máquina por el golpe brusco (par de arranque).

El arranque Estrella-Triángulo es la solución económica para reducir esa corriente de arranque a la tercera parte. Aquí te explicamos cómo armarlo sin causar una explosión (literalmente).

## El Concepto Básico

La idea es simple:
1.  **Primera Etapa (Estrella $\lambda$):** Alimentamos el motor con una tensión reducida ($\frac{1}{\sqrt{3}}$ de la tensión de red). El motor arranca suave y lento.
2.  **Transición:** Un temporizador cuenta unos segundos.
3.  **Segunda Etapa (Triángulo $\Delta$):** Una vez que el motor tomó velocidad, cambiamos la conexión a plena tensión para que entregue toda su potencia.

> **¡OJO!** Para hacer esto, **debes retirar los puentes (chapas) de la bornera del motor**. Si los dejas puestos y haces este cableado, provocarás un cortocircuito franco.

---

## 1. Diagrama de Fuerza (Potencia)

Aquí es donde circulan los amperios que mueven la máquina. Necesitas 3 contactores:
* **KM1 (Principal):** Siempre activo durante el funcionamiento.
* **KM3 (Estrella):** Une los finales de bobina (W2, U2, V2) en un punto común.
* **KM2 (Triángulo):** Conecta las bobinas en fase-fase para plena tensión.
* **Relé Térmico (F1):** Para proteger el motor.

![Esquema de fuerza arranque estrella triangulo con contactores y motor]

**Funcionamiento:**
1.  Al inicio, cierran **KM1 + KM3**. El motor está en Estrella.
2.  Pasa el tiempo, se abre KM3.
3.  Inmediatamente se cierra **KM2** (mientras KM1 sigue cerrado). El motor pasa a Triángulo.

---

## 2. Diagrama de Mando (Control)

Este es el "cerebro" que le dice a los contactores cuándo abrir y cerrar. Aquí usamos pulsadores, bobinas y, lo más importante, el **Temporizador**.

![Esquema de mando o control arranque estrella triangulo con temporizador]

### Componentes Clave del Mando:
* **S1 (Pulsador Parada):** NC (Normalmente Cerrado).
* **S2 (Pulsador Marcha):** NA (Normalmente Abierto).
* **KT1 (Temporizador):** Es el que define cuánto tiempo dura el arranque suave (usualmente 3 a 7 segundos).
* **Enclavamiento Eléctrico (CRUCIAL):** Fíjate en el diagrama. Antes de la bobina de KM2 hay un contacto cerrado de KM3, y viceversa.
    * **¿Por qué?** Para que Físicamente sea **IMPOSIBLE** que entre Estrella y Triángulo a la vez. Si entran juntos = ¡BOOM! (Cortocircuito entre fases).

---

## La Secuencia Lógica (Paso a Paso)

Para que puedas seguir el cableado con el dedo en el plano:

1.  Pulsas **Marcha (S2)**.
2.  Se energiza la bobina de **KM1** (Línea) y **KM3** (Estrella), y el Temporizador **KT1**.
3.  El motor gira suavemente en Estrella.
4.  El **KT1** termina su conteo.
5.  El contacto del temporizador abre el circuito de **KM3** (Sale la Estrella).
6.  El contacto del temporizador cierra el circuito de **KM2** (Entra el Triángulo).
7.  El motor queda trabajando en **KM1 + KM2** a plena potencia.

## Tabla de Selección Rápida

¿Qué contactor comprar? Aquí una regla práctica aproximada (siempre calcula, pero esto ayuda):

| Componente | Corriente que soporta | Cálculo Aprox. |
| :--- | :--- | :--- |
| **KM1 (Principal)** | 58% de la In del motor | $In \times 0.58$ |
| **KM2 (Triángulo)** | 58% de la In del motor | $In \times 0.58$ |
| **KM3 (Estrella)** | 33% de la In del motor | $In \times 0.33$ |
| **Relé Térmico** | Ajustado a la In del motor | $In$ (Si va bajo KM1) |

---

## Pregunta de examen: ¿Cuándo NO puedo usarlo?

No todos los motores sirven. Para usar un arranque estrella-triángulo en una red de **380V (Trifásica)**, la placa de tu motor debe decir:
* **Tensión: 380V / 660V** (o $\Delta 380 / Y 660$).

Si tu motor dice **220V / 380V** y lo conectas en Triángulo a una red de 380V, **lo quemarás**.

**¿Quieres dominar la lógica cableada, los PLC y los variadores de frecuencia?**
El mundo industrial paga bien a quien sabe controlar la potencia.

👉 [Ver Curso de Automatización Industrial con Contactores y PLC](/cursos/automatizacion-industrial)