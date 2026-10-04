// Zakeem Solutions — Native App Entrypoint (Tauri 2)
// Provides unified cross-platform desktop & mobile execution

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                // In debug mode, setup development hooks if needed
                let _ = app;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Zakeem Solutions native application");
}
