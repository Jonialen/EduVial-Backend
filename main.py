# main.py (main.py)

import json
import pandas as pd
import matplotlib.pyplot as plt

# ===========
# CARGAR DATOS
# ===========
# Copia el JSON en un archivo llamado "report.json"
with open("report.json", "r") as f:
    data = json.load(f)

# Lista de períodos intermedios (cada "intermediate" es un bloque de tiempo)
periods = data["intermediate"]

# ===================
# PREPARAR DATAFRAMES
# ===================
rows = []
for p in periods:
    period = p.get("period")
    responses = p.get("summaries", {}).get("http.response_time", {})
    register = p.get("summaries", {}).get(
        "plugins.metrics-by-endpoint.response_time./api/auth/register", {}
    )
    quest = p.get("summaries", {}).get(
        "plugins.metrics-by-endpoint.response_time./api/quest", {}
    )
    counters = p.get("counters", {})
    
    rows.append({
        "period": period,
        "register_p50": register.get("p50"),
        "register_p95": register.get("p95"),
        "quest_p50": quest.get("p50"),
        "quest_p95": quest.get("p95"),
        "http_responses": counters.get("http.responses", 0),
        "users_completed": counters.get("vusers.completed", 0),
        "users_failed": counters.get("vusers.failed", 0),
        "errors_timeout": counters.get("errors.ETIMEDOUT", 0),
    })

df = pd.DataFrame(rows)

# Convertir periodo a eje de tiempo legible
df["minute"] = range(1, len(df) + 1)

# ==============
# GRAFICAR DATOS
# ==============

plt.figure(figsize=(12, 8))

# --- Latencias ---
plt.subplot(2, 1, 1)
plt.plot(df["minute"], df["register_p50"], label="Register p50")
plt.plot(df["minute"], df["register_p95"], label="Register p95")
plt.plot(df["minute"], df["quest_p50"], label="Quest p50", linestyle="--")
plt.plot(df["minute"], df["quest_p95"], label="Quest p95", linestyle="--")
plt.title("Latencias (ms) por endpoint")
plt.xlabel("Minuto de la prueba")
plt.ylabel("Tiempo (ms)")
plt.legend()
plt.grid(True)

# --- Errores ---
plt.subplot(2, 1, 2)
plt.plot(df["minute"], df["users_failed"], label="Usuarios fallidos", color="red")
plt.plot(df["minute"], df["users_completed"], label="Usuarios completados", color="green")
plt.bar(df["minute"], df["errors_timeout"], label="Timeouts", alpha=0.3, color="orange")
plt.title("Resultados de usuarios / Errores")
plt.xlabel("Minuto de la prueba")
plt.ylabel("Cantidad")
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.show()
