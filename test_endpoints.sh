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
