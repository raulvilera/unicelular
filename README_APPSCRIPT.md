# Google Apps Script — Registro da Atividade de Ciências

O arquivo `Code.gs` registra as respostas enviadas pelo `index.html` na planilha Google Sheets identificada no código.

## Configuração

1. Abra a planilha com o ID `1V1Mmm72ScIc_Jsi8Zbbr9kZCxMPx1Bk4VH0h2OhgwFs`.
2. Acesse **Extensões → Apps Script**.
3. Crie ou substitua o arquivo `Code.gs` pelo conteúdo deste repositório.
4. Crie um arquivo HTML chamado `index.html` no projeto do Apps Script e copie o conteúdo do `index.html` deste repositório.
5. No editor do Apps Script, execute manualmente a função `configurarPlanilha` uma vez e autorize o acesso à planilha.
6. Publique em **Implantar → Nova implantação → Aplicativo da web**.
7. Selecione uma configuração de acesso adequada à sua escola e use a URL da implantação para abrir a atividade.

## Abas criadas

A função `configurarPlanilha` cria ou prepara automaticamente:

- `6ºAno A`
- `6ºAno C`
- `Gabarito`

Cada aba de turma possui os dados de identificação do aluno, a resposta de cada questão, o status da aprendizagem, a quantidade de acertos e o percentual das questões objetivas.

## Cores

- **Azul:** resposta objetiva correta / aprendizagem atingida.
- **Vermelho:** resposta objetiva incorreta / aprendizagem não atingida.
- **Amarelo:** questão discursiva aguardando correção manual.
- **Verde-claro:** aprendizagem atingida.
- **Laranja-claro:** aprendizagem não atingida.

As questões discursivas são registradas como **A avaliar**, pois exigem correção pedagógica do professor. Depois da correção, o professor pode substituir esse status manualmente na planilha.

## Observação de segurança

O ID da planilha já está fixado no `Code.gs`. Não é necessário expor credenciais ou chaves de API no código. O acesso à planilha depende das autorizações da conta que executar ou publicar o projeto Apps Script.
