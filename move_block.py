import sys

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
main_close_idx = -1

for i, line in enumerate(lines):
    if "<AnimatePresence>" in line and "isMenuOpen" in lines[i+1]:
        start_idx = i
    if start_idx != -1 and end_idx == -1 and "</AnimatePresence>" in line:
        end_idx = i
    if "</main>" in line:
        main_close_idx = i

if start_idx != -1 and end_idx != -1 and main_close_idx != -1:
    block = lines[start_idx:end_idx+1]
    # Remove block
    del lines[start_idx:end_idx+1]
    
    # Recalculate main_close_idx after deletion
    if main_close_idx > end_idx:
        main_close_idx -= len(block)
        
    # Insert after </main>
    lines.insert(main_close_idx + 1, "".join(block))
    
    with open(file_path, "w") as f:
        f.writelines(lines)
    print("Block moved successfully")
else:
    print(f"Failed to find indices: start={start_idx}, end={end_idx}, main={main_close_idx}")
