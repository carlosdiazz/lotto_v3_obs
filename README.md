# lottodiz_obs

Microservicio de control OBS del sistema LOTTODIZ. Se conecta a una instancia de OBS Studio via WebSocket para automatizar transmisiones en vivo de sorteos (iniciar/detener streams, cambiar escenas, ajustar volumen).

## Qué hace

- Se conecta a OBS Studio via obs-websocket-js
- Inicia streams de YouTube con stream keys dinámicas
- Detiene streams activos
- Cambia escenas programáticamente
- Ajusta volumen de fuentes de audio
- Ejecuta acciones de configuración OBS recibidas desde el microservicio de tools via NATS
- Obtiene configuración de OBS (config_obs) desde el microservicio de tools

## Tecnologías

- NestJS (microservicio NATS)
- obs-websocket-js (control remoto de OBS Studio)
- NATS (comunicación entre microservicios)

## Requisitos previos

- Node.js >= 18
- NATS Server
- OBS Studio con WebSocket Server habilitado (Tools > WebSocket Server Settings)

## Inicio rápido

1. Copiar el archivo de variables de entorno:

```bash
cp template.env .env
```

2. Configurar las variables en `.env`:

- **NATS**: `NATS_SERVERS`, `NATS_USER`, `NATS_PASSWORD` y opcionalmente los certificados TLS
- **OBS WebSocket**: `OBS_IP` (IP de la máquina con OBS), `OBS_PORT` (puerto del WebSocket, default 4455), `OBS_PASSWORD` (contraseña del WebSocket)
- **Canal**: `CHANNEL_ID` (ID del canal de YouTube asociado a esta instancia OBS)
- **General**: `TZ` (timezone, ej: `America/Santo_Domingo`), `PORT`, `STATE` (`DEV` o `PROD`)

3. Instalar dependencias:

```bash
npm install
```

4. Iniciar en desarrollo:

```bash
npm run dev
```

Al iniciar, el servicio se conecta automáticamente a OBS via WebSocket.

## Scripts disponibles

| Script               | Descripción                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Inicia en modo desarrollo con hot-reload     |
| `npm run build`      | Compila el proyecto                          |
| `npm run start:prod` | Inicia en producción (requiere build previo) |

## Estructura del proyecto

```
src/
├── app/              # Módulo principal
├── common/           # Response DTO
├── components/
│   ├── obs/          # Servicio OBS (WebSocket, stream, scenes, volume)
│   └── nats/         # Configuración NATS
└── config/           # Variables de entorno validadas
```

## Cómo funciona

1. El microservicio de tools programa jobs de OBS al crear broadcasts de YouTube
2. Este microservicio recibe comandos via NATS con el ID de `config_obs`
3. Consulta la configuración al microservicio de tools
4. Ejecuta las acciones en orden: cambiar escena → ajustar volumen → iniciar/detener stream

## Notas

- No requiere base de datos (stateless)
- No requiere Redis
- Cada instancia se conecta a un OBS específico (una instancia por máquina OBS)
- Si la conexión WebSocket se pierde, es necesario reiniciar el servicio
- OBS debe tener el plugin WebSocket habilitado y configurado con la misma contraseña del `.env`
