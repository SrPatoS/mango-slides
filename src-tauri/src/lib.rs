use magic_crypt::{new_magic_crypt, MagicCryptTrait};
use tauri::{command, Runtime};

// Chave de criptografia "mestre" (em um app real, isso poderia ser derivado do hardware)
const MASTER_KEY: &str = "slideflow-secret-pepper-2024";

#[command]
fn encrypt_key(key: &str) -> String {
    let mc = new_magic_crypt!(MASTER_KEY, 256);
    mc.encrypt_str_to_base64(key)
}

#[command]
fn decrypt_key(encrypted_key: &str) -> String {
    let mc = new_magic_crypt!(MASTER_KEY, 256);
    mc.decrypt_base64_to_string(encrypted_key)
        .unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![encrypt_key, decrypt_key])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
