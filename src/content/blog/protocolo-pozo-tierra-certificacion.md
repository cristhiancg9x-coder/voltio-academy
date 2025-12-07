---
title: "Protocolo de Pruebas de Pozo a Tierra: Guía de Cumplimiento (Normativa Peruana)"
description: "¿Te piden el 'Certificado INDECOPI' para tu licencia? Te explicamos qué debe contener un Protocolo de Puesta a Tierra válido, cómo se mide y qué valores exige la norma."
pubDate: 2025-12-14
author: "Ing. Equipo Voltio"
image: "/images/blog/protocolo-pozo-tierra-certificacion.jpg"
category: "Normativa y Legal"
tags: ["INDECOPI", "INACAL", "Pozo a Tierra", "Protocolo", "Seguridad"]
isFeatured: true
---

A menudo nos llaman clientes asustados: **"Ingeniero, la municipalidad me pide el protocolo del pozo a tierra visado y con certificado de calibración INDECOPI"**.

Aquí suele haber una confusión. INDECOPI no emite el protocolo de tu pozo; INDECOPI (y ahora **INACAL**) acreditan a los laboratorios que calibran el equipo (Telurometro) con el que se hace la prueba.

Hoy en **VoltioAcademy** desglosamos la anatomía de un Protocolo de Pruebas válido para evitar clausuras y asegurar que, técnicamente, tu sistema protege vidas.

![Telurometro digital con certificado de calibracion]

## 1. ¿Qué es el Protocolo de Pruebas?

No es solo un "papel firmado". Es un informe técnico con valor legal (Declaración Jurada) donde un **Ingeniero Electricista o Mecánico-Electricista Colegiado y Habilitado** certifica que tu sistema de puesta a tierra (SPAT) cumple con los valores de resistencia del **Código Nacional de Electricidad (CNE)**.

### ¿Qué debe contener obligatoriamente?
Para que Defensa Civil (ITSE) no te lo rechace, el documento debe tener:
1.  **Datos del Cliente y Ubicación:** Dirección exacta del predio.
2.  **Características del Pozo:** Tipo (Vertical/Horizontal), electrodo (Cobre/Copperweld), tratamiento (Dosis química/Gel).
3.  **Datos del Equipo de Medición:** Marca, modelo, serie y **Certificado de Calibración Vigente**.
4.  **Valor de Resistencia Obtenido:** En Ohmios ($\Omega$).
5.  **Panel Fotográfico:** Pruebas visuales de la medición.
6.  **Firma y Sello:** Del Ingeniero responsable.

## 2. El Factor "INDECOPI/INACAL" (La Calibración)

Aquí está el truco. El protocolo no vale nada si el instrumento usado (Telurometro) miente.

La norma exige que el equipo tenga un **Certificado de Calibración** con antigüedad no mayor a un año, emitido por un laboratorio acreditado por **INACAL** (Instituto Nacional de Calidad, funciones que antes veía INDECOPI en su totalidad).

> **Alerta Voltio:** Si contratas a un técnico que viene con un telurometro "hechizo" o sin certificado, ese protocolo será observado inmediatamente por la municipalidad.

## 3. El Procedimiento de Prueba (Método de Caída de Potencial)

¿Cómo se obtienen los datos para el protocolo? No se adivina. Se usa estandarizadamente el **Método del 62%** (o Caída de Potencial).

**Pasos Técnicos:**
1.  **Desconexión:** Se debe desconectar el cable de tierra del borne de la varilla (o abrir el seccionador de prueba). **Nunca midas con la carga conectada**, medirás resistencias en paralelo falsas.
2.  **Colocación de Picas:**
    * Electrodo de Corriente (C): Se clava a una distancia $D$ (ej. 10 a 20 metros).
    * Electrodo de Potencial (P): Se clava al **61.8%** de la distancia $D$.
3.  **Inyección:** El telurometro inyecta una corriente y mide la caída de tensión para calcular la resistencia según la Ley de Ohm ($R=V/I$).



## 4. Valores Máximos Permitidos (La Tabla de la Verdad)

Según el CNE Utilización y normas técnicas peruanas (NTP), tu pozo pasa la prueba si el valor en pantalla es:

| Uso del Pozo a Tierra | Resistencia Máxima Permitida |
| :--- | :--- |
| **Cargas Generales** (Comercio, Casa, Fuerza) | **$\le 25 \Omega$** |
| **Cómputo / Data Center / Electrónica** | **$\le 5 \Omega$** |
| **Ascensores** (Según fabricante) | **$\le 5 \Omega$ a $10 \Omega$** |
| **Hospitales / Quirófanos** | **$\le 2 \Omega$** |
| **Subestaciones de Alta Tensión** | **$\le 1 \Omega$** |

## 5. Errores que anulan tu Protocolo

He visto protocolos rechazados por errores de novato. Evítalos:

* **Fecha de Calibración Vencida:** El certificado del equipo expiró ayer. Protocolo inválido.
* **Ingeniero Inhabilitado:** El sello es de un ingeniero que no ha pagado sus cuotas al Colegio de Ingenieros (CIP). Se verifica online en segundos.
* **Foto "Fake":** Poner una foto genérica de internet en el panel fotográfico. Los inspectores conocen su distrito.
* **Medición con "Bucle":** Medir sin desconectar la varilla del tablero. Te dará un valor bajísimo (ej: 0.5 $\Omega$) pero falso, porque estás midiendo el neutro de la red pública en paralelo.

---

El protocolo de pruebas es la radiografía de la seguridad de tu instalación. No busques solo "el papel para el trámite". Busca la seguridad de que, si hay una fuga, la corriente se irá a tierra y no a través de una persona.

**¿Eres técnico y quieres aprender a realizar mediciones correctas y redactar protocolos que pasen cualquier auditoría?**

👉 [Inscríbete en el Curso de Puesta a Tierra y Elaboración de Protocolos](/cursos/protocolos-puesta-tierra)