from pathlib import Path
import re

html = Path('index.html').read_text(encoding='utf-8')
assert "const URL_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbw0J46G9iSL90Gxe2EbZNLitmtS0vNE9AoNabgqgJudif2krdtrGMvoXu6zkOSomhet/exec';" in html
assert 'fetch(URL_APPS_SCRIPT' in html
assert 'google.script.run' not in html
assert "body: JSON.stringify(dadosEnvio)" in html
assert 'method: \'POST\'' in html
assert 'function doPost(e)' in Path('Code.gs').read_text(encoding='utf-8')
assert 'TURMAS.forEach(turma => prepararAbaTurma_(planilha, turma));' in Path('Code.gs').read_text(encoding='utf-8')
assert len(re.findall(r"id: \d+,", html)) == 10
print('OK: URL, fetch POST, doPost, criação das turmas e 10 questões validados.')
