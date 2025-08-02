#!/bin/bash

# Script to test API endpoints using curl

echo "--- Starting API tests ---"

echo ""
echo "Caso de Prueba Cero: Registro de Usuario de Prueba"
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "User", "email": "user@example.com", "password": "password1234"}'
echo ""
echo "--------------------------------------------------"

echo ""
echo "Caso de Prueba BE-01 y BE-02: Login Exitoso y Verificación de Tiempo"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password1234"}' \
  -w "\n\n----------------------------\nEstado HTTP: %{http_code}\nTiempo total: %{time_total}s\n"
echo ""
echo "--------------------------------------------------"

echo ""
echo "Caso de Prueba BE-03: Consulta de Pregunta por ID"
curl http://localhost:3000/api/quest/5
echo ""
echo "--------------------------------------------------"

echo ""
echo "Caso de Prueba BE-04: Login con Credenciales Incorrectas"
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gemini-user@example.com","password":"wrongpassword"}'
echo ""
echo "--------------------------------------------------"

echo ""
echo "Caso de Prueba BE-05: Consulta de Pregunta Inexistente"
curl -i http://localhost:3000/api/quest/9999
echo ""
echo "--------------------------------------------------"

echo ""
echo "--- API tests finished ---"
