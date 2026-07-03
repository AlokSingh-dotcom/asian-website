from pathlib import Path
import easyocr

reader = easyocr.Reader(['en'], gpu=False)
for i in range(1, 6):
    path = Path(f'page_{i}.png')
    print('PAGE', i, 'exists', path.exists())
    if not path.exists():
        continue
    result = reader.readtext(str(path), detail=0)
    print('LINES', len(result))
    for line in result:
        print(line)
    print('---')
