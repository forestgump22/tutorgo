import os

ALLOWED_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss", ".html", ".md", ".txt","mjs","yaml"}
EXCLUDED_DIRS = {"node_modules", ".git", ".next", "__pycache__"}

base_dir = os.path.abspath(".")
output_file = os.path.join(base_dir, "proyecto_completo.txt")

def extract_files():
    with open(output_file, "w", encoding="utf-8") as out:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

            for file in files:
                _, ext = os.path.splitext(file)
                if ext in ALLOWED_EXTENSIONS:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, base_dir)

                    try:
                        with open(full_path, "r", encoding="utf-8") as f:
                            content = f.read()
                    except Exception as e:
                        content = f"[ERROR LEYENDO ARCHIVO: {e}]"

                    out.write("=" * 80 + "\n")
                    out.write(f"Archivo: {rel_path}\n")
                    out.write("-" * 80 + "\n")
                    out.write(content + "\n\n")

if __name__ == "__main__":
    extract_files()
    print("✅ Archivo generado: proyecto_completo.txt")
