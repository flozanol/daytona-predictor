/**
 * Motor de Pronóstico Grupo Daytona
 * Basado en Run Rate ajustado por estacionalidad de cierre.
 */
export function calcularPronosticoDaytona(ventasAcumuladas, diaCorte = 6) {
    const diasTotalesMes = 31; // Marzo tiene 31 días

    // 1. Calculamos el ritmo real actual (cuántos autos vende por día hoy)
    const ritmoReal = ventasAcumuladas / diaCorte;

    // 2. Definimos el Factor de Aceleración de Cierre.
    // En agencias, el volumen de cierre suele ser ~15-20% más alto 
    // que el ritmo de la primera semana debido a bonos y objetivos.
    const factorAceleracion = 1.15;

    // 3. Proyectamos los días restantes con el factor de aceleración
    const diasRestantes = diasTotalesMes - diaCorte;
    const proyeccionRestante = (ritmoReal * diasRestantes) * factorAceleracion;

    // 4. El pronóstico final es lo que ya tengo + lo proyectado
    const pronosticoFinal = ventasAcumuladas + proyeccionRestante;

    // Retornamos el número redondeado (porque no se venden medios autos)
    return Math.round(pronosticoFinal);
}
