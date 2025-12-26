import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";

// --- KONFIGURASI ---

// Ganti dengan nama Anda atau Organisasi
const COPYRIGHT_HOLDER = "Renaldi Apriyanto Kadang"; 
const YEAR = new Date().getFullYear();

// Header Lisensi AGPLv3 Standar
const LICENSE_HEADER = `/*
 * Sylent Auth Modules
 * Copyright (C) ${YEAR} ${COPYRIGHT_HOLDER}
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
`;

// Folder yang akan diproses (bisa ditambah jika ada folder lain)
const TARGET_DIRS = ["backend/src", "frontend/src", "auth-modules-sdk/src"];

// Ekstensi file yang akan ditempel lisensi
const TARGET_EXTS = new Set([".ts", ".tsx", ".js", ".jsx"]);

// --- LOGIKA PROGRAM ---

async function processDirectory(directory: string) {
  try {
    const files = await readdir(directory);

    for (const file of files) {
      const fullPath = join(directory, file);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Rekursif ke sub-folder
        await processDirectory(fullPath);
      } else if (stats.isFile()) {
        const ext = extname(file);
        if (TARGET_EXTS.has(ext)) {
          await applyLicense(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Gagal membaca direktori ${directory}:`, error);
  }
}

async function applyLicense(filePath: string) {
  try {
    const content = await readFile(filePath, "utf-8");

    // Cek apakah file sudah punya header (agar tidak duplikat)
    if (content.trim().startsWith("/*") && content.includes("GNU Affero General Public License")) {
      console.log(`[SKIP] Header sudah ada: ${filePath}`);
      return;
    }

    // Tempel header di atas konten asli
    const newContent = LICENSE_HEADER + "\n" + content;
    await writeFile(filePath, newContent, "utf-8");
    
    console.log(`[OK] Lisensi ditambahkan ke: ${filePath}`);
  } catch (error) {
    console.error(`Gagal memproses file ${filePath}:`, error);
  }
}

// Jalankan Program
console.log("Mulai menempelkan lisensi AGPLv3...");
console.log(`Copyright: ${COPYRIGHT_HOLDER}`);
console.log("-----------------------------------");

// Jalankan paralel untuk semua target direktori
Promise.all(TARGET_DIRS.map((dir) => processDirectory(dir)))
  .then(() => console.log("\n✅ Selesai! Semua file telah diperbarui."))
  .catch((err) => console.error("\n❌ Terjadi kesalahan fatal:", err));