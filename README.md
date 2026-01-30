# C3i Backup ONE

Automatizacion de copias de seguridad con cifrado, compresion y politicas de retencion. Basado en [Restic](https://github.com/restic/restic).

> [!WARNING]
> C3i Backup ONE esta en version 0.x.x y puede sufrir cambios importantes entre versiones. Es posible que encuentres errores. Por favor, abre issues o solicitudes de funcionalidades.

## Caracteristicas

- Copias de seguridad automatizadas con cifrado y compresion
- Programacion flexible con politicas de retencion
- Soporte multi-protocolo: NFS, SMB, WebDAV, SFTP o directorios locales
- Repositorios compatibles con S3, Google Cloud Storage, Azure Blob Storage y rclone

## Instalacion

Descarga el instalador para tu plataforma desde la seccion de [Releases](https://github.com/JBibu/backupone/releases).

### Windows

- **NSIS (.exe)**: Instalador estandar
- **MSI (.msi)**: Instalador para despliegues gestionados

### Linux

- **AppImage**: Ejecutable portable, no requiere instalacion
- **DEB**: Para distribuciones basadas en Debian/Ubuntu
- **RPM**: Para distribuciones basadas en Fedora/RHEL

## Desarrollo

```bash
bun install
bun run dev
```

## Licencia

AGPL-3.0 — Ver [LICENSE](LICENSE) para mas detalles.
