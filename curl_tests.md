# Informe de Pruebas de API con cURL

Este documento detalla las pruebas manuales realizadas con `cURL` para verificar los endpoints principales del backend, siguiendo el plan de pruebas `GEMINI.md`.

**Fecha de ejecución:** 2025-08-02

## Prerrequisitos

Antes de ejecutar las pruebas, el servidor de la aplicación debe estar en funcionamiento. Se inicia con el siguiente comando:

```bash
pnpm start
```

## Ejecución de Casos de Prueba

A continuación se describen los casos de prueba ejecutados.

---

### Caso de Prueba Cero: Registro de Usuario de Prueba

Dado que la base de datos de prueba podría no contener usuarios, el primer paso fue registrar un nuevo usuario para poder probar el login.

- **Acción:** Registrar el usuario `user@example.com`.
- **Comando:**
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name": "User", "email": "user@example.com", "password": "password1234"}'
  ```
- **Resultado Obtenido:**
  ```json
  { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
  ```
- **Análisis:** El usuario se registró correctamente y se obtuvo un token.

---

### Caso de Prueba BE-01 y BE-02: Login Exitoso y Verificación de Tiempo

- **ID:** BE-01, BE-02
- **Escenario:** Un usuario inicia sesión con credenciales válidas. Se mide el tiempo de respuesta y se verifica la integridad de los datos.
- **Comando:**
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"password1234"}' \
    -w "\n\n----------------------------\nEstado HTTP: %{http_code}\nTiempo total: %{time_total}s\n"
  ```
- **Resultado Obtenido:**

  ```
  {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsInJvbGUiOiJwcmluY2lwaWFudGUiLCJpYXQiOjE3NTQwOTQ1ODMsImV4cCI6MTc1NDE4MDk4M30.Z8WiZ7zbZH2htA9jFyTIi7KPNiQ3MQl8U1xX34Fh-Ms"}

  ----------------------------
  Estado HTTP: 200
  Tiemo total: 0.035123s
  ```

- **Análisis:** La prueba fue **exitosa**. El servidor respondió con un código 200 y un token. El tiempo de respuesta (aprox. 35ms) fue muy inferior al límite de 500ms.

---

### Verificación de JWT

Para confirmar la integridad de los datos, se decodificó el payload del token JWT obtenido.

- **Comando:**
  ```bash
  echo "eyJ1c2VySWQiOjUsInJvbGUiOiJwcmluY2lwaWFudGUiLCJpYXQiOjE3NTQwOTQ1ODMsImV4cCI6MTc1NDE4MDk4M30" | base64 -d
  ```
- **Resultado Obtenido:**
  ```json
  { "userId": 5, "role": "principiante", "iat": 1754094583, "exp": 1754180983 }
  ```
- **Análisis:** El token contiene el `userId` y `role` correctos para el usuario con el que se hizo login.

---

### Caso de Prueba BE-03: Consulta de Pregunta por ID

- **ID:** BE-03
- **Escenario:** Se consulta una pregunta existente por su ID.
- **Comando:**
  ```bash
  curl http://localhost:3000/api/quest/5
  ```
- **Resultado Obtenido:**
  ```json
  {"id":5,"txt":"¿Qué documento debe portar todo conductor?","cat":"Documentación", ...}
  ```
- **Análisis:** La prueba fue **exitosa**. El servidor devolvió los datos de la pregunta con `id: 5`.

---

### Caso de Prueba BE-04: Login con Credenciales Incorrectas

- **ID:** BE-04
- **Escenario:** Un usuario intenta iniciar sesión con una contraseña incorrecta.
- **Comando:**
  ```bash
  curl -i -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"gemini-user@example.com","password":"wrongpassword"}'
  ```
- **Resultado Obtenido:**

  ```
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json; charset=utf-8
  ...

  {"message":"Credenciales inválidas"}
  ```

- **Análisis:** La prueba fue **exitosa**. El servidor respondió con un código 401 y el mensaje de error esperado.

---

### Caso de Prueba BE-05: Consulta de Pregunta Inexistente

- **ID:** BE-05
- **Escenario:** Se consulta una pregunta con un ID que no existe.
- **Comando:**
  ```bash
  curl -i http://localhost:3000/api/quest/9999
  ```
- **Resultado Obtenido:**

  ```
  HTTP/1.1 404 Not Found
  Content-Type: application/json; charset=utf-8
  ...

  {"error":"Pregunta no encontrada"}
  ```

- **Análisis:** La prueba fue **exitosa**. El servidor respondió con un código 404 y el mensaje de error esperado.

---

## Conclusión

Todas las pruebas manuales con `cURL` se completaron con éxito, validando que los endpoints de autenticación y consulta de preguntas funcionan según lo especificado en el plan de pruebas.

```

```
