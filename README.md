# Backup ONE

Automatizacion de copias de seguridad con cifrado, compresion y politicas de retencion. Basado en [Restic](https://github.com/restic/restic) y [Zerobyte](https://github.com/nicotsx/zerobyte).

> [!WARNING]
> Backup ONE esta en desarrollo activo y puede sufrir cambios importantes entre versiones.

## Caracteristicas

- Copias de seguridad cifradas y comprimidas con programacion cron y politicas de retencion
- Interfaz web para gestionar volumenes, repositorios, programaciones y notificaciones
- Volumenes: NFS, SMB, WebDAV, SFTP, directorios locales
- Repositorios: S3, Google Cloud Storage, Azure Blob Storage, rclone, locales
- Notificaciones: Discord, Email, Gotify, Ntfy, Slack, Pushover
- Multi-arquitectura: amd64 y arm64

## Instalacion

### Docker

```yaml
services:
  backupone:
    image: ghcr.io/c3i-servicios-informaticos/backupone:latest
    container_name: backupone
    restart: unless-stopped
    cap_add:
      - SYS_ADMIN
    devices:
      - /dev/fuse:/dev/fuse
    ports:
      - "4096:4096"
    environment:
      - TZ=${TZ:-UTC}
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/lib/zerobyte:/var/lib/zerobyte
```

### Windows

Descarga el instalador desde [Releases](https://github.com/C3i-Servicios-Informaticos/backupone/releases):

- **NSIS (.exe)**: Instalador estandar
- **MSI (.msi)**: Instalador para despliegues gestionados

## Desarrollo

```bash
bun install
bun run dev
```

## Licencia

AGPL-3.0 — Ver [LICENSE](LICENSE) para mas detalles.
