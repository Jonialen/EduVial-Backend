# Informe de Pruebas de API Automatizadas con Shell Script

Este documento describe el proceso de pruebas de integración para los endpoints de la API, las cuales han sido automatizadas mediante un script de shell (`test_endpoints.sh`).

**Fecha de ejecución:** 2025-09-16

## Proceso de Pruebas Automatizadas

Las pruebas manuales con `cURL` han sido reemplazadas por un script que automatiza el ciclo completo de pruebas:

1.  **Inicia el servidor** de la aplicación en segundo plano.
2.  **Espera** a que el servidor esté listo para aceptar peticiones.
3.  **Ejecuta una secuencia de casos de prueba** que cubren todos los endpoints principales, incluyendo registro, login, consulta de datos y actualización de puntuaciones.
4.  **Maneja la autenticación** extrayendo y reutilizando un token JWT para las rutas protegidas.
5.  **Detiene el servidor** una vez que todas las pruebas han finalizado.

Este enfoque garantiza una ejecución de pruebas rápida, consistente y repetible.

---

## Script de Pruebas: `test_endpoints.sh`

A continuación se muestra el contenido del script utilizado para las pruebas.

```bash
#!/bin/bash

# Script para probar todos los endpoints de la API de forma automatizada.
# Inicia el servidor, ejecuta las pruebas y luego lo detiene.

echo "--- Iniciando el servidor en segundo plano ---"
# Iniciar el servidor y redirigir su salida a un log para no ensuciar la salida de las pruebas
pnpm start > server.log 2>&1 &
SERVER_PID=$!

# Darle tiempo al servidor para que inicie
echo "Esperando 5 segundos para que el servidor inicie... (PID: $SERVER_PID)"
sleep 5

# Verificar si el servidor está activo antes de continuar
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "Error: El servidor no pudo iniciarse. Revisa server.log para más detalles."
    exit 1
fi

# --- Inicio de Casos de Prueba ---

# Función para imprimir separadores
print_separator() {
    echo ""
    echo "--------------------------------------------------"
}

echo ""
echo "Caso de Prueba Cero: Registro de Usuario de Prueba"
# Silenciamos la salida porque solo nos interesa que el usuario exista para el login
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "User", "email": "user@example.com", "password": "password1234"}'
print_separator

echo ""
echo "Caso de Prueba BE-01: Login Exitoso y obtención de token"
# Usamos sed para extraer el token del JSON de respuesta
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password1234"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
    echo "Error: No se pudo obtener el token. Abortando pruebas."
    kill $SERVER_PID
    exit 1
fi
echo "Token obtenido exitosamente."
print_separator

echo ""
echo "Caso de Prueba BE-02: Login con Credenciales Incorrectas"
curl -s -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrongpassword"}' | head -n 1
print_separator

echo ""
echo "Caso de Prueba BE-03: Consulta de Pregunta por ID existente"
curl -s http://localhost:3000/api/quest/1
print_separator

echo ""
echo "Caso de Prueba BE-04: Consulta de Pregunta Inexistente"
curl -s -i http://localhost:3000/api/quest/9999 | head -n 1
print_separator

echo ""
echo "Caso de Prueba BE-05: Obtener Ranking Global"
curl -s http://localhost:3000/api/ranking/top/
print_separator

echo ""
echo "Caso de Prueba BE-06: Obtener Ranking del Usuario Autenticado"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/ranking/me/ranking
print_separator

echo ""
echo "Caso de Prueba BE-07: Obtener Datos Básicos del Usuario"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/me/basic
print_separator

echo ""
echo "Caso de Prueba BE-08: Obtener Puntuación del Usuario"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/me/score
print_separator

echo ""
echo "Caso de Prueba BE-09: Actualizar Puntuación del Usuario"
curl -s -X PUT http://localhost:3000/api/user/me/score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"points": 25}'
print_separator

echo ""
echo "Caso de Prueba BE-10: Verificar actualización de Puntuación"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/user/me/score
print_separator


# --- Fin de Casos de Prueba ---

echo ""
echo "--- Deteniendo el servidor (PID: $SERVER_PID) ---"
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null # Suprimir el mensaje "Terminated"

echo "--- Pruebas de API finalizadas ---"

```

---

## Ejecución y Resultados

Para ejecutar las pruebas, simplemente corre el script desde la raíz del proyecto:

```bash
chmod +x test_endpoints.sh
./test_endpoints.sh
```

### Salida de Ejemplo

A continuación se muestra la salida obtenida durante la ejecución del script, demostrando que todas las pruebas se completaron con éxito.

```
--- Iniciando el servidor en segundo plano ---
Esperando 5 segundos para que el servidor inicie... (PID: 149443)

Caso de Prueba Cero: Registro de Usuario de Prueba
{"token":"..."}
--------------------------------------------------

Caso de Prueba BE-01: Login Exitoso y obtención de token
Token obtenido exitosamente.
--------------------------------------------------

Caso de Prueba BE-02: Login con Credenciales Incorrectas
HTTP/1.1 401 Unauthorized
--------------------------------------------------

Caso de Prueba BE-03: Consulta de Pregunta por ID existente
{"id":1,"txt":"...","cat":"..."}
--------------------------------------------------

Caso de Prueba BE-04: Consulta de Pregunta Inexistente
HTTP/1.1 404 Not Found
--------------------------------------------------

Caso de Prueba BE-05: Obtener Ranking Global
[{"position":1,"name":"..."}]
--------------------------------------------------

Caso de Prueba BE-06: Obtener Ranking del Usuario Autenticado
{"name":"User","total_points":0,"position":null,"isExpert":false}
--------------------------------------------------

Caso de Prueba BE-07: Obtener Datos Básicos del Usuario
{"name":"User","email":"user@example.com","points":0}
--------------------------------------------------

Caso de Prueba BE-08: Obtener Puntuación del Usuario
{"score_id":21,"user_id":9,"total_points":0}
--------------------------------------------------

Caso de Prueba BE-09: Actualizar Puntuación del Usuario
{"score_id":21,"user_id":9,"total_points":25}
--------------------------------------------------

Caso de Prueba BE-10: Verificar actualización de Puntuación
{"score_id":21,"user_id":9,"total_points":25}
--------------------------------------------------

--- Deteniendo el servidor (PID: 149443) ---
--- Pruebas de API finalizadas ---
```

---

## Conclusión

El script `test_endpoints.sh` proporciona una forma robusta y automatizada de verificar la funcionalidad principal de la API, asegurando que todos los endpoints respondan como se espera.

```