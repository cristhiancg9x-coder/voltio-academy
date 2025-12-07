---
title: "Los 'Sentidos' de la Máquina: Guía Definitiva de Sensores Industriales"
description: "¿Inductivo o Capacitivo? ¿PNP o NPN? Descubre los tipos de sensores que mueven la industria y cómo elegir el correcto para tu automatización."
pubDate: 2025-12-11
author: "Ing. Equipo Voltio"
image: "/images/blog/tipos-sensores-industriales.jpg"
category: "Instrumentación"
tags: ["Sensores", "Automatización", "PLC", "Instrumentación"]
isFeatured: true
---

Si el PLC es el **cerebro** de la automatización, los sensores son sus **ojos, oídos y tacto**. Sin ellos, el programa más sofisticado del mundo no sirve para nada porque la máquina estaría ciega.

En la planta, elegir el sensor incorrecto es la receta perfecta para paradas continuas y "fantasmas" eléctricos. Hoy en **VoltioAcademy** vamos a clasificar los sensores más usados en la industria para que sepas exactamente cuál pedir en tu próximo proyecto.

![Diagram of different types of industrial sensors proximity and process]

## 1. Sensores de Detección de Objetos (Discretos)

Estos son los que responden con un "SÍ" o "NO" (1 o 0 lógico). Se usan para contar piezas, detectar posición o seguridad.

### A. Sensor Inductivo (El "Detector de Metales")
Es el rey de la industria. Robusto, barato y duradero.
* **¿Qué detecta?** Únicamente **METALES**.
* **¿Cómo funciona?** Genera un campo magnético; si un metal lo perturba, activa la salida.
* **Aplicación:** Contar latas, detectar si una puerta metálica cerró, verificar posición de un pistón neumático.
* **Ventaja:** No le afecta el polvo, aceite o agua (si es IP67).

### B. Sensor Capacitivo (El "Detector de Todo")
Físicamente se parece al inductivo, pero su tecnología es distinta.
* **¿Qué detecta?** Casi cualquier material denso: Plástico, madera, **LÍQUIDOS**, vidrio, metal.
* **Aplicación:** Ver el nivel de agua a través de un tubo de plástico, detectar si hay grano en un silo, contar cajas de cartón.
* **Cuidado:** Es sensible a la suciedad acumulada en la punta.

### C. Sensor Fotoeléctrico (El "Ojo Óptico")
Usa luz (infrarroja o láser) para detectar. Es el que tiene mayor alcance.
Existen tres tipos principales:
1.  **Barrera (Emisor-Receptor):** Máxima distancia (hasta 50m). Si algo corta el haz, dispara.
2.  **Reflex:** El sensor tiene un espejo en frente.
3.  **Difuso:** La luz rebota en el propio objeto.
* **Aplicación:** Detectar personas (seguridad), contar botellas transparentes, detectar cajas en fajas transportadoras.



### D. Sensor Ultrasónico (El "Murciélago")
Emite ondas de sonido de alta frecuencia y mide el rebote.
* **¿Qué detecta?** Objetos sólidos o líquidos, sin importar el color o transparencia.
* **Aplicación:** Medición de nivel en tanques (sin tocar el líquido), detección de vidrios transparentes donde falla el fotoeléctrico.

---

## 2. Sensores de Variables de Proceso (Analógicos)

Estos no dicen "sí/no", sino que dicen "¿Cuánto?". Envían señales variables (4-20mA o 0-10V) al PLC.

### A. Sensores de Temperatura
* **RTD (PT100):** Basado en resistencia. Muy preciso. Estándar para industria alimentaria y procesos generales (hasta 400°C aprox).
* **Termocuplas (J, K):** Basado en voltaje mili-volt. Para altas temperaturas (Hornos de fundición, calderas, hasta 1200°C+).

### B. Transmisores de Presión
Convierten la presión de un gas o líquido en señal eléctrica.
* **Aplicación:** Controlar la presión de una línea de aire comprimido, presión de aceite en hidráulica, o nivel de agua por presión hidrostática en el fondo de un tanque.

### C. Encoders (Posición y Velocidad)
Se acoplan al eje de un motor.
* **Incremental:** Cuenta pulsos para saber velocidad o posición relativa. Si se va la luz, pierde la posición.
* **Absoluto:** Sabe exactamente en qué grado (0° a 360°) está el eje, aunque se vaya la luz.
* **Aplicación:** Brazos robóticos, máquinas de corte a medida (CNC), control de velocidad en fajas.

---

## Tabla de Selección Rápida (El "Chivo")

Guarda esta tabla para cuando estés en campo:

| Material a detectar | Distancia requerida | Sensor Recomendado |
| :--- | :--- | :--- |
| **Metal** (Acero, Hierro) | Corta (< 2cm) | **Inductivo** |
| **Plástico / Madera / Granos** | Corta (< 2cm) | **Capacitivo** |
| **Cajas / Objetos opacos** | Media/Larga (> 5cm) | **Fotoeléctrico** |
| **Líquido (desde afuera del tanque)**| Corta (Pared delgada)| **Capacitivo** |
| **Objeto Transparente (Vidrio)** | Media | **Ultrasónico** |

---

## Un detalle técnico vital: PNP vs NPN

Cuando compres un sensor discreto (inductivo/fotoeléctrico), el vendedor te preguntará: **"¿Lo quieres PNP o NPN?"**.

Si te equivocas, **no funcionará con tu PLC** (o tendrás que usar relés extra).

* **PNP (Source / Positivo):** Al detectar, entrega voltaje positivo (+24V) por el cable de señal. Es el estándar en **América y Europa**.
* **NPN (Sink / Negativo):** Al detectar, entrega negativo (0V/Masa). Es el estándar en maquinaria **Asiática**.

> **Consejo de Voltio:** Revisa siempre la tarjeta de entrada de tu PLC. Si el común (S/S o COM) está conectado a negativo, necesitas sensores **PNP**.

La automatización empieza por una buena medición. Si el sensor miente, el PLC se equivoca.

**¿Quieres aprender a calibrar instrumentos, conectar sensores a PLC y escalar señales analógicas 4-20mA?**

👉 [Ver Curso de Instrumentación Industrial y PLC](/cursos/instrumentacion-plc)