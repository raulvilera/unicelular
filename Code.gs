/**
 * Atividade de Ciências — registro de respostas no Google Sheets.
 *
 * Este arquivo deve ser usado em um projeto Google Apps Script publicado como
 * aplicativo da web. A planilha de destino é identificada pelo ID abaixo.
 */

const PLANILHA_ID = '1V1Mmm72ScIc_Jsi8Zbbr9kZCxMPx1Bk4VH0h2OhgwFs';
const TURMAS = ['6ºAno A', '6ºAno C'];
const ABA_GABARITO = 'Gabarito';

const QUESTOES = [
  { id: 1, resposta: 'B', aprendizagem: 'Diferenciar células procariontes e eucariontes.' },
  { id: 2, resposta: 'B', aprendizagem: 'Reconhecer a importância histórica do microscópio para o estudo das células.' },
  { id: 3, resposta: 'B', aprendizagem: 'Identificar membrana plasmática, citoplasma e núcleo.' },
  { id: 4, resposta: 'B', aprendizagem: 'Classificar bactérias como organismos procariontes.' },
  { id: 5, resposta: 'C', aprendizagem: 'Relacionar a mitocôndria à respiração celular e à produção de ATP.' },
  { id: 6, resposta: 'B', aprendizagem: 'Relacionar o cloroplasto à fotossíntese em células vegetais.' },
  { id: 7, resposta: 'B', aprendizagem: 'Reconhecer bactérias como organismos procariontes e unicelulares.' },
  { id: 8, tipo: 'dissertativa', aprendizagem: 'Explicar a importância ecológica e social dos fungos.' },
  { id: 9, tipo: 'dissertativa', aprendizagem: 'Descrever protozoários, doenças causadas e formas de transmissão.' },
  { id: 10, tipo: 'dissertativa', aprendizagem: 'Relacionar saneamento básico à prevenção de doenças.' }
];

const CORES = {
  cabecalho: '#1a5276',
  textoCabecalho: '#ffffff',
  correta: '#9dc3e6',
  errada: '#f4b6b6',
  avaliar: '#ffe599',
  aprendizagemAtingida: '#d9ead3',
  aprendizagemNaoAtingida: '#fce4d6',
  aprendizagemAvaliar: '#fff2cc'
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Atividade de Ciências - 6º Ano')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Executar uma vez manualmente para criar as abas e o gabarito. */
function configurarPlanilha() {
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  TURMAS.forEach(turma => prepararAbaTurma_(planilha, turma));
  prepararAbaGabarito_(planilha);
  return 'Abas criadas e configuradas com sucesso.';
}

/** Recebe o objeto enviado pelo formulário por google.script.run. */
function registrarRespostas(dados) {
  if (!dados || !dados.turma || !dados.nome || !dados.ra) {
    return { status: 'error', message: 'Dados de identificação incompletos.' };
  }
  if (TURMAS.indexOf(dados.turma) === -1) {
    return { status: 'error', message: 'Turma não cadastrada: ' + dados.turma };
  }

  const bloqueio = LockService.getScriptLock();
  bloqueio.waitLock(30000);
  try {
    const planilha = SpreadsheetApp.openById(PLANILHA_ID);
    const aba = prepararAbaTurma_(planilha, dados.turma);
    const respostas = dados.respostas || {};
    const linha = construirLinha_(dados, respostas);
    const numeroLinha = aba.getLastRow() + 1;

    aba.getRange(numeroLinha, 1, 1, linha.valores.length).setValues([linha.valores]);
    aplicarCoresDaLinha_(aba, numeroLinha, linha.statuses);
    aba.getRange(numeroLinha, 1, 1, linha.valores.length)
      .setVerticalAlignment('middle')
      .setWrap(true);
    aba.autoResizeRows(numeroLinha, 1);

    return {
      status: 'success',
      message: 'Respostas registradas na aba ' + dados.turma + '.',
      acertos: linha.acertos,
      totalMultipla: QUESTOES.filter(q => q.tipo !== 'dissertativa').length
    };
  } catch (erro) {
    console.error(erro);
    return { status: 'error', message: erro.message || String(erro) };
  } finally {
    bloqueio.releaseLock();
  }
}

function prepararAbaTurma_(planilha, turma) {
  let aba = planilha.getSheetByName(turma);
  if (!aba) aba = planilha.insertSheet(turma);

  const cabecalho = construirCabecalho_();
  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]);
    aba.setFrozenRows(1);
    formatarCabecalho_(aba, cabecalho.length);
    configurarLarguras_(aba);
  }
  return aba;
}

function prepararAbaGabarito_(planilha) {
  let aba = planilha.getSheetByName(ABA_GABARITO);
  if (!aba) aba = planilha.insertSheet(ABA_GABARITO);
  aba.clear();

  const linhas = [['Questão', 'Gabarito', 'Tipo', 'Aprendizagem avaliada']];
  QUESTOES.forEach(q => linhas.push([
    'Q' + q.id,
    q.tipo === 'dissertativa' ? 'Correção manual' : q.resposta,
    q.tipo === 'dissertativa' ? 'Dissertativa' : 'Múltipla escolha',
    q.aprendizagem
  ]));
  aba.getRange(1, 1, linhas.length, 4).setValues(linhas);
  aba.setFrozenRows(1);
  formatarCabecalho_(aba, 4);
  aba.getRange(2, 2, QUESTOES.length, 1).setBackground(CORES.correta);
  aba.getRange(2, 4, QUESTOES.length, 1).setWrap(true);
  aba.setColumnWidth(1, 90);
  aba.setColumnWidth(2, 150);
  aba.setColumnWidth(3, 150);
  aba.setColumnWidth(4, 430);
}

function construirCabecalho_() {
  const cabecalho = [
    'Data/hora do registro', 'Turma', 'Nome do aluno', 'RA', 'Dígito',
    'E-mail institucional', 'Nº chamada', 'Data da atividade'
  ];
  QUESTOES.forEach(q => {
    cabecalho.push('Q' + q.id + ' — resposta');
    cabecalho.push('Q' + q.id + ' — aprendizagem');
  });
  cabecalho.push('Acertos (objetivas)', 'Total de objetivas', 'Percentual objetivo');
  return cabecalho;
}

function construirLinha_(dados, respostas) {
  const valores = [
    new Date(), dados.turma, dados.nome, dados.ra, dados.digito || '',
    dados.email || '', dados.chamada || '', dados.data || ''
  ];
  const statuses = [];
  let acertos = 0;
  let totalObjetivas = 0;

  QUESTOES.forEach(q => {
    const resposta = String(respostas['q' + q.id] || '').trim();
    const dissertativa = q.tipo === 'dissertativa';
    let status;
    if (dissertativa) {
      status = 'A avaliar';
    } else {
      totalObjetivas++;
      if (resposta.toUpperCase() === q.resposta) {
        status = 'Atingida';
        acertos++;
      } else {
        status = 'Não atingida';
      }
    }
    valores.push(resposta || '(sem resposta)', status);
    statuses.push(dissertativa ? 'avaliar' : status === 'Atingida' ? 'correta' : 'errada');
  });

  valores.push(acertos, totalObjetivas, totalObjetivas ? acertos / totalObjetivas : 0);
  return { valores, statuses, acertos };
}

function aplicarCoresDaLinha_(aba, numeroLinha, statuses) {
  let coluna = 9; // A-H são identificação; Q1 começa em I.
  statuses.forEach(status => {
    const corResposta = status === 'correta' ? CORES.correta : status === 'errada' ? CORES.errada : CORES.avaliar;
    const corAprendizagem = status === 'correta' ? CORES.aprendizagemAtingida : status === 'errada' ? CORES.aprendizagemNaoAtingida : CORES.aprendizagemAvaliar;
    aba.getRange(numeroLinha, coluna).setBackground(corResposta);
    aba.getRange(numeroLinha, coluna + 1).setBackground(corAprendizagem);
    coluna += 2;
  });
  aba.getRange(numeroLinha, coluna).setNumberFormat('0');
  aba.getRange(numeroLinha, coluna + 1).setNumberFormat('0');
  aba.getRange(numeroLinha, coluna + 2).setNumberFormat('0.00%');
}

function formatarCabecalho_(aba, quantidadeColunas) {
  aba.getRange(1, 1, 1, quantidadeColunas)
    .setBackground(CORES.cabecalho)
    .setFontColor(CORES.textoCabecalho)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  aba.setRowHeight(1, 48);
}

function configurarLarguras_(aba) {
  aba.setColumnWidth(1, 145);
  aba.setColumnWidth(2, 105);
  aba.setColumnWidth(3, 240);
  aba.setColumnWidth(4, 130);
  aba.setColumnWidth(5, 70);
  aba.setColumnWidth(6, 260);
  aba.setColumnWidth(7, 90);
  aba.setColumnWidth(8, 115);
  for (let coluna = 9; coluna <= 28; coluna += 2) {
    aba.setColumnWidth(coluna, 125);
    aba.setColumnWidth(coluna + 1, 270);
  }
  aba.setColumnWidth(29, 110);
  aba.setColumnWidth(30, 115);
  aba.setColumnWidth(31, 135);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Atividade de Ciências')
    .addItem('Configurar abas e gabarito', 'configurarPlanilha')
    .addToUi();
}
