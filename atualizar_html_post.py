from pathlib import Path

path = Path('/home/ubuntu/work-unicelular/index.html')
html = path.read_text(encoding='utf-8')

marker = "<script>\n    // --- DADOS DAS QUESTÕES (Contextualizadas) ---"
replacement = """<script>
    // Implantação pública que recebe as respostas via doPost(e).
    const URL_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbw0J46G9iSL90Gxe2EbZNLitmtS0vNE9AoNabgqgJudif2krdtrGMvoXu6zkOSomhet/exec';

    // --- DADOS DAS QUESTÕES (Contextualizadas) ---"""
if marker not in html:
    raise SystemExit('Marcador do script não encontrado.')
html = html.replace(marker, replacement, 1)

start = html.find('        google.script.run\n', html.find('function enviarRespostas'))
end_marker = '            .registrarRespostas(dadosEnvio);'
end = html.find(end_marker, start)
if start == -1 or end == -1:
    raise SystemExit('Bloco de envio google.script.run não encontrado.')
end += len(end_marker)

block = """        // O Content-Type text/plain evita o preflight CORS no Web App do Apps Script.
        fetch(URL_APPS_SCRIPT, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(dadosEnvio)
        })
        .then(async function(response) {
            const texto = await response.text();
            let resultado;
            try {
                resultado = JSON.parse(texto);
            } catch (erro) {
                throw new Error('Resposta inválida do Apps Script: ' + texto.slice(0, 160));
            }
            if (!response.ok || resultado.status !== 'success') {
                throw new Error(resultado.message || 'O Apps Script recusou o registro.');
            }
            feedback.className = 'feedback success';
            feedback.textContent = `Respostas enviadas com sucesso! Você acertou ${resultado.acertos} de ${resultado.totalMultipla} questões de múltipla escolha.`;
            feedback.style.display = 'block';
            btnEnviar.textContent = 'Enviado!';
        })
        .catch(function(error) {
            feedback.className = 'feedback error';
            feedback.textContent = 'Erro ao enviar: ' + error.message;
            feedback.style.display = 'block';
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar Respostas';
        });"""
html = html[:start] + block + html[end:]
path.write_text(html, encoding='utf-8')
print('index.html atualizado com URL_APPS_SCRIPT e fetch POST.')
