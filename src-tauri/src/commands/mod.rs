pub mod service;

use crate::AppState;
use serde::Serialize;
use std::sync::atomic::Ordering;

#[derive(Debug, Clone, Serialize)]
pub struct BackendInfo {
    pub url: String,
    pub port: u16,
    pub using_service: bool,
}

/// Get the URL of the backend server
/// Returns the service URL if connected to service, otherwise the sidecar URL
#[tauri::command]
pub async fn get_backend_url(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let port = state.backend_port.load(Ordering::SeqCst);
    Ok(format!("http://localhost:{}", port))
}

/// Get detailed backend connection info
/// Returns port, URL, and whether connected to service or sidecar
#[tauri::command]
pub async fn get_backend_info(state: tauri::State<'_, AppState>) -> Result<BackendInfo, String> {
    let port = state.backend_port.load(Ordering::SeqCst);
    let using_service = state.using_service.load(Ordering::SeqCst);
    Ok(BackendInfo {
        url: format!("http://localhost:{}", port),
        port,
        using_service,
    })
}
