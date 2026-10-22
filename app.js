// ===== CONFIGURAÇÃO DO SUPABASE =====

const SUPABASE_URL = "https://awoqcufqlsruqnmjobmq.supabase.co";

const SUPABASE_KEY = "sb_publishable_so1o1Qll9zQ1jEGUx33FEQ_wMDRKtiX";

// Criar conexão com o banco de dados
const banco = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let administradorAutenticado = false;

// Verificar se o administrador está conectado
async function verificarLogin() {
  const { data, error } = await banco.auth.getUser();

  if (error || !data.user) {
    console.log("Nenhum administrador conectado.");
    document.querySelector("#add-game").style.display = "none";
    return;
  }

  
/* ===== RESTAURAR IDENTIFICAÇÃO DO ADMINISTRADOR ===== */

console.log("Administrador autenticado.");
administradorAutenticado = true;

document.querySelector("#login-mensagem").textContent = "Login autenticado!";
document.querySelector("#botao-sair").hidden = false;

renderizarJogos();
document.querySelector("#add-game").style.display = "";

}

verificarLogin();

// Login do administrador

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#form-login").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const email = document.querySelector("#login-email").value;
  const senha = document.querySelector("#login-senha").value;
  const mensagem = document.querySelector("#login-mensagem");

  mensagem.textContent = "Verificando acesso...";

  const { error } = await banco.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
  console.error("Erro de autenticação:", error.message);
  mensagem.textContent = "Não foi possível entrar. Verifique o console.";
  return;
}

  mensagem.textContent = "Login autenticado!";

  
/* ===== EXIBIR LINK SAIR APÓS O LOGIN ===== */

document.querySelector("#botao-sair").hidden = false;

  
/* ===== LIBERAR FERRAMENTAS APÓS O LOGIN ===== */

administradorAutenticado = true;
document.querySelector("#login-mensagem").textContent = "Login autenticado!";
document.querySelector("#botao-sair").hidden = false;
document.querySelector("#add-game").style.display = "";
renderizarJogos();

  document.querySelector("#login-senha").value = "";
});
});

console.log("Supabase conectado!", banco);

// Testar leitura dos jogos no Supabase
async function testarBanco() {
  const { data, error } = await banco
    .from("jogos")
    .select("*");

  if (error) {
    console.error("Erro ao consultar jogos:", error);
  } else {
  jogosOnline = data;
  console.log("Jogos carregados na memória:", jogosOnline);
  renderizarJogos();
  }
}

// Lista central dos jogos carregados do banco
let jogosOnline = [];
testarBanco();

// Recarregar os jogos após alterações no banco
async function recarregarJogos() {
  await testarBanco();
}

const sections = {
  zerados: { title: "Jogos Zerados", icon: "trophy" },
  backlog: { title: "Backlog", icon: "clock-3" },
  desafios: { title: "Desafios", icon: "target" },
  dropados: { title: "Jogos Dropados", icon: "x" },
  aquisicoes: { title: "Aquisições", icon: "shopping-cart" },
  "hi-scores": { title: "Hi-Scores", icon: "chart-no-axes-column-increasing" }
};

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelector(".nav-item.active")?.classList.remove("active");
    item.classList.add("active");

    const section = sections[item.dataset.section];
    if (!section) return;

    document.querySelector("#page-title").textContent = section.title;

    const headingIcon = document.querySelector(".heading-icon");
    headingIcon.innerHTML = `<i data-lucide="${section.icon}"></i>`;

    // Recria os ícones Lucide, incluindo o novo ícone do título.
    if (window.lucide) window.lucide.createIcons();
  });
});


/* ===== CONTROLE DA JANELA DE CADASTRO ===== */

const modalJogo = document.querySelector("#modal-jogo");
const botaoAdicionar = document.querySelector("#add-game");
botaoAdicionar.style.display = "none";
const botaoFechar = document.querySelector("#fechar-modal");
const botaoCancelar = document.querySelector("#cancelar-jogo");
const formularioJogo = document.querySelector("#form-jogo");
let idJogoEmEdicao = null;
const tituloFormJogo = document.querySelector("#modal-titulo");
const botaoSalvarJogo = document.querySelector("#botao-salvar-jogo");

function atualizarModoFormulario() {
  const editando = idJogoEmEdicao !== null;

  tituloFormJogo.textContent = editando
    ? "Editar jogo"
    : "Adicionar jogo";

  botaoSalvarJogo.textContent = editando
    ? "Salvar alterações"
    : "Salvar jogo";
}

function abrirModal() {
  modalJogo.classList.add("aberto");
  modalJogo.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.querySelector("#nome").focus();
}

function fecharModal() {
  modalJogo.classList.remove("aberto");
  modalJogo.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  idJogoEmEdicao = null;
  atualizarModoFormulario();

  botaoAdicionar.focus();
}

botaoAdicionar.addEventListener("click", () => {
  idJogoEmEdicao = null;
  atualizarModoFormulario();
  formularioJogo.reset();
  atualizarPreviewCapa();
  abrirModal(); 
});
botaoFechar.addEventListener("click", fecharModal);
botaoCancelar.addEventListener("click", fecharModal);

// Fechar clicando fora da janela
modalJogo.addEventListener("click", (evento) => {
  if (evento.target === modalJogo) {
    fecharModal();
  }
});

// Fechar com a tecla ESC
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" &&
      modalJogo.classList.contains("aberto")) {
    fecharModal();
  }
});

// Capturar os dados do formulário
formularioJogo.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dados = Object.fromEntries(
    new FormData(formularioJogo).entries()
  );
  
// Converter horas e minutos para minutos totais
const horas = Number(dados.horas);
const minutos = Number(dados.minutos);

dados.tempoTotal = (horas * 60) + minutos;

// Remover os campos temporários do objeto
delete dados.horas;
delete dados.minutos;

// Preparar os dados para o Supabase
const dadosOnline = {
  nome: dados.nome,
  ano: dados.ano,
  developer: dados.developer,
  genero: dados.genero,
  subgenero: dados.subgenero,
  plataforma: dados.plataforma,
  ranking: dados.ranking,
  dificuldade: dados.dificuldade,
  capa: dados.capa,
  nacional: dados.nacional,
  replay: dados.replay,
  dataFinal: dados.dataFinal || null,
  tempoTotal: dados.tempoTotal
};

// Salvar jogo novo no Supabase
if (idJogoEmEdicao === null) {
  const { error } = await banco
    .from("jogos")
    .insert(dadosOnline);

  if (error) {
    console.error("Erro ao salvar no Supabase:", error);
    alert("Não foi possível salvar o jogo online.");
    return;
  }

  await recarregarJogos();
}

// Editar jogo existente no Supabase
if (idJogoEmEdicao !== null) {
  const { error } = await banco
    .from("jogos")
    .update(dadosOnline)
    .eq("id", idJogoEmEdicao);

  if (error) {
    console.error("Erro ao editar no Supabase:", error);
    alert("Não foi possível atualizar o jogo.");
    return;
  }

  await recarregarJogos();
}

// Encerrar o modo de edição
idJogoEmEdicao = null;

// Atualizar a galeria
renderizarJogos();


// Exibir notificação personalizada
const notificacao = document.querySelector("#notificacao");

notificacao.classList.add("mostrar");

// Reinicia a contagem se outra notificação já estiver aparecendo
clearTimeout(window.tempoNotificacao);

window.tempoNotificacao = setTimeout(() => {
  notificacao.classList.remove("mostrar");
}, 3000);

  formularioJogo.reset();
  atualizarPreviewCapa();
  fecharModal();
});

if (window.lucide) {
  window.lucide.createIcons();
}

// ========================================
// CAPA DOS JOGOS
// ========================================

// Capa padrão criada diretamente no código
const capaPadrao = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg"
     width="300" height="400"
     viewBox="0 0 300 400">

  <rect width="300" height="400" fill="#181630"/>

  <rect x="15" y="15" width="270" height="370"
        rx="12" fill="none"
        stroke="#6250df" stroke-width="3"/>

  <g transform="translate(90 135)"
     fill="none" stroke="#7665f2"
     stroke-width="8"
     stroke-linecap="round"
     stroke-linejoin="round">

    <path d="M30 40 H90
             C110 40 120 55 125 75
             L135 115
             C140 140 115 150 100 130
             L85 110 H35
             L20 130
             C5 150 -20 140 -15 115
             L-5 75
             C0 55 10 40 30 40 Z"/>

    <path d="M30 65 V95"/>
    <path d="M15 80 H45"/>

    <circle cx="95" cy="70" r="5" fill="#7665f2"/>
    <circle cx="110" cy="90" r="5" fill="#7665f2"/>
  </g>

  <text x="150" y="310"
        fill="#aaa5c9"
        font-family="Arial"
        font-size="18"
        text-anchor="middle">
    SEM CAPA
  </text>

</svg>
`)}`;


// Elementos do formulário
const campoCapa = document.querySelector("#capa");
const previewCapa = document.querySelector("#capa-preview");


// Função que atualiza a imagem
function atualizarPreviewCapa() {

  const url = campoCapa.value.trim();

  if (!url) {
    previewCapa.src = capaPadrao;
    return;
  }

  previewCapa.src = url;
}


// Caso a imagem não carregue
previewCapa.addEventListener("error", () => {

  if (previewCapa.src !== capaPadrao) {
    previewCapa.src = capaPadrao;
  }

});


// Atualiza quando o usuário altera o campo
campoCapa.addEventListener("input", atualizarPreviewCapa);


// Mostra a capa padrão inicialmente
atualizarPreviewCapa();

/* ===== EDITAR JOGO ===== */

function editarJogo(jogo) {
  idJogoEmEdicao = jogo.id;
  atualizarModoFormulario();

  formularioJogo.reset();

  // Preencher os campos com os dados salvos
  Object.entries(jogo).forEach(([campo, valor]) => {
    const elemento = formularioJogo.elements.namedItem(campo);

    if (!elemento || elemento instanceof RadioNodeList) return;

    if (elemento.type === "checkbox") {
      elemento.checked = Boolean(valor);
    } else {
      elemento.value = valor ?? "";
    }
  });

  // Recuperar horas e minutos
  const tempoTotal = Number(jogo.tempoTotal) || 0;

  formularioJogo.elements.namedItem("horas").value =
    Math.floor(tempoTotal / 60);

  formularioJogo.elements.namedItem("minutos").value =
    tempoTotal % 60;

  atualizarPreviewCapa();
  abrirModal();
}

/* ===== CARDS DOS JOGOS ZERADOS ===== */

const galeriaJogos = document.querySelector("#galeria-jogos");

// Evita que textos cadastrados sejam interpretados como HTML
function textoSeguro(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caractere]);
}

// Formatar data sem problemas de fuso horário
function formatarData(data) {
  if (!data) return "Não informada";

  const partes = data.split("-");

  if (partes.length !== 3) return "Não informada";

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Converter minutos em horas e minutos
function formatarTempo(total) {
  const minutosTotais = Number(total) || 0;
  const horas = Math.floor(minutosTotais / 60);
  const minutos = minutosTotais % 60;

  return `${horas}h ${String(minutos).padStart(2, "0")}m`;
}

// Mostrar a dificuldade com o nome correto
function formatarDificuldade(valor) {
  const dificuldades = {
    "muito-facil": "Muito fácil",
    "facil": "Fácil",
    "normal": "Normal",
    "dificil": "Difícil",
    "muito-dificil": "Impossível"
  };

  return dificuldades[valor] || "Não informada";
}

// Criar as estrelas de acordo com o ranking
function criarEstrelas(ranking) {
  const nota = Number(ranking) || 0;

  return Array.from({ length: 5 }, (_, indice) => {
    const preenchida = indice < nota;

    return `
      <span class="${preenchida ? "estrela-ativa" : "estrela-inativa"}">
        ★
      </span>
    `;
  }).join("");
}

// Construir os cards na galeria
/* ===== ESTATÍSTICAS DO DASHBOARD ===== */

function atualizarTotalZerados() {
  const jogos = jogosOnline;

  const total = jogos.length;

  document.querySelector("#total-zerados").textContent = total;
}

/* ===== TEMPO TOTAL DOS JOGOS ===== */

function atualizarTempoTotal() {

  const jogos = jogosOnline;

  // Somar o tempo de todos os jogos (em minutos)
  const totalMinutos = jogos.reduce((total, jogo) => {
    return total + (Number(jogo.tempoTotal) || 0);
  }, 0);

  // Converter minutos em horas e minutos
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  // Mostrar o resultado no dashboard
  document.querySelector("#tempo-total").textContent =
    `${horas}h ${String(minutos).padStart(2, "0")}m`;

}

/* ===== JOGOS ZERADOS NO ANO ATUAL ===== */

function atualizarZeradosAno() {

  // Descobrir o ano atual automaticamente
  const anoAtual = new Date().getFullYear();

  // Recuperar os jogos cadastrados
  const jogos = jogosOnline;

  // Contar os jogos concluídos no ano atual
  const totalAno = jogos.filter(jogo => {
    return jogo.dataFinal?.slice(0, 4) === String(anoAtual);
  }).length;

  // Atualizar o título do card
  document.querySelector("#titulo-zerados-ano").textContent =
    `Zerados em ${anoAtual}`;

  // Atualizar o número do card
  document.querySelector("#zerados-ano").textContent = totalAno;

}

/* ===== TEMPO DE JOGO NO ANO ATUAL ===== */

function atualizarTempoAno() {

  // Descobrir o ano atual
  const anoAtual = new Date().getFullYear();

  // Recuperar os jogos cadastrados
  const jogos = jogosOnline;

  // Selecionar somente jogos concluídos no ano atual
  const jogosDoAno = jogos.filter(jogo => {
    return jogo.dataFinal?.slice(0, 4) === String(anoAtual);
  });

  // Somar o tempo desses jogos em minutos
  const totalMinutos = jogosDoAno.reduce((total, jogo) => {
    return total + (Number(jogo.tempoTotal) || 0);
  }, 0);

  // Converter para horas e minutos
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  // Atualizar o título
  document.querySelector("#titulo-tempo-ano").textContent =
    `Tempo em ${anoAtual}`;

  // Atualizar o tempo exibido
  document.querySelector("#tempo-ano").textContent =
    `${horas}H ${String(minutos).padStart(2, "0")}M`;

}

/* ===== ANOS DO HISTÓRICO ===== */

function atualizarAnosHistorico() {

  const seletor = document.querySelector("#historico-ano");
  const anoAtual = new Date().getFullYear();

  const jogos = jogosOnline;

  // Preservar o ano selecionado
  const anoSelecionado = seletor.value;

  // Descobrir o ano mais antigo dos jogos cadastrados
  const anosJogos = jogos
    .map(jogo => Number(jogo.dataFinal?.slice(0, 4)))
    .filter(ano => ano >= 1900 && ano <= anoAtual);

  const primeiroAno = Math.min(2020, ...anosJogos);

  // Preencher o seletor
  seletor.innerHTML = "";

  for (let ano = anoAtual; ano >= primeiroAno; ano--) {
    const opcao = document.createElement("option");

    opcao.value = String(ano);
    opcao.textContent = ano;

    seletor.appendChild(opcao);
  }

  // Restaurar a seleção anterior, se possível
  if ([...seletor.options].some(opcao => opcao.value === anoSelecionado)) {
    seletor.value = anoSelecionado;
  } else {
    seletor.value = String(anoAtual);
  }

}

/* ===== ESTATÍSTICAS DO ANO SELECIONADO ===== */

function atualizarHistoricoAno() {

  const anoSelecionado =
    document.querySelector("#historico-ano").value;

  const jogos = jogosOnline;

  // Selecionar jogos concluídos no ano escolhido
  const jogosDoAno = jogos.filter(jogo => {
    return jogo.dataFinal?.slice(0, 4) === anoSelecionado;
  });

  // Contar os jogos
  const totalJogos = jogosDoAno.length;

  // Somar o tempo em minutos
  const totalMinutos = jogosDoAno.reduce((total, jogo) => {
    return total + (Number(jogo.tempoTotal) || 0);
  }, 0);

  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  // Atualizar os indicadores do histórico
  document.querySelector("#historico-jogos").textContent =
    totalJogos;

  document.querySelector("#historico-horas").textContent =
    `${horas}H ${String(minutos).padStart(2, "0")}M`;

}

/* ===== JOGOS ZERADOS EM 2026 ===== */

function atualizarZerados2026() {

  const jogos = JSON.parse(
    localStorage.getItem("jogosZerados") || "[]"
  );

  // Contar somente os jogos concluídos em 2026
  const total2026 = jogos.filter(jogo => {
    return Number(jogo.ano) === 2026;
  }).length;

  // Atualizar o terceiro card
  document.querySelector("#zerados-2026").textContent = total2026;

}

/* ===== RANKING DE GÊNEROS MAIS JOGADOS ===== */

function atualizarRankingGeneros() {

  const jogos = jogosOnline;

  const ranking = document.querySelector("#ranking-generos");

  // Contar quantos jogos existem em cada gênero
  const contagem = {};

  jogos.forEach(jogo => {
    const genero = jogo.genero;

    if (!genero) return;

    contagem[genero] = (contagem[genero] || 0) + 1;
  });

  // Atualizar os números dos gêneros existentes
  ranking.querySelectorAll(".ranking-item").forEach(item => {

    const genero = item.querySelector("span").textContent.trim();
    const numero = item.querySelector("strong");

    numero.textContent = contagem[genero] || 0;

  });

  // Ordenar do gênero mais jogado para o menos jogado
  const itens = [...ranking.querySelectorAll(".ranking-item")];

  itens.sort((a, b) => {
    const quantidadeA = Number(a.querySelector("strong").textContent);
    const quantidadeB = Number(b.querySelector("strong").textContent);

    return quantidadeB - quantidadeA;
  });

  itens.forEach(item => ranking.appendChild(item));

}

/* ===== RANKING DE PLATAFORMAS MAIS JOGADAS ===== */

function atualizarRankingPlataformas() {

  const jogos = jogosOnline;

  const ranking = document.querySelector("#ranking-plataformas");

  // Contar os jogos de cada plataforma
  const contagem = {};

  jogos.forEach(jogo => {
    const plataforma = jogo.plataforma;

    if (!plataforma) return;

    contagem[plataforma] = (contagem[plataforma] || 0) + 1;
  });

  // Atualizar os números das plataformas existentes
  ranking.querySelectorAll(".ranking-item").forEach(item => {

    const plataforma = item.querySelector("span").textContent.trim();
    const numero = item.querySelector("strong");

    numero.textContent = contagem[plataforma] || 0;

  });

  // Ordenar da plataforma mais jogada para a menos jogada
  const itens = [...ranking.querySelectorAll(".ranking-item")];

  itens.sort((a, b) => {
    const quantidadeA = Number(a.querySelector("strong").textContent);
    const quantidadeB = Number(b.querySelector("strong").textContent);

    return quantidadeB - quantidadeA;
  });

  itens.forEach(item => ranking.appendChild(item));

}

/* ===== PREENCHER FILTRO DE ANO DE LANÇAMENTO ===== */

function atualizarFiltroAno() {

  const jogos = jogosOnline;

  const filtro = document.querySelector("#filtro-ano");

  if (!filtro) return;

  // Guardar o ano que estiver selecionado
  const anoSelecionado = filtro.value;

  // Obter os anos de lançamento, sem duplicações
  const anos = [...new Set(
    jogos
      .map(jogo => String(jogo.ano || "").trim())
      .filter(ano => ano !== "")
  )];

  // Ordenar do ano mais recente para o mais antigo
  anos.sort((a, b) => Number(b) - Number(a));

  // Limpar e reconstruir as opções
  filtro.innerHTML = '<option value="">Todos</option>';

  anos.forEach(ano => {
    const opcao = document.createElement("option");

    opcao.value = ano;
    opcao.textContent = ano;

    filtro.appendChild(opcao);
  });

  // Preservar a seleção, se o ano ainda existir
  if (anos.includes(anoSelecionado)) {
    filtro.value = anoSelecionado;
  }

}

/* ===== PREENCHER FILTRO DE ANO ZERADO ===== */

function atualizarFiltroAnoZerado() {

  const jogos = jogosOnline;

  const filtro = document.querySelector("#filtro-ano-zerado");

  if (!filtro) return;

  // Guardar o ano selecionado
  const anoSelecionado = filtro.value;

  // Extrair os anos das datas de conclusão
  const anos = [...new Set(
    jogos
      .map(jogo => jogo.dataFinal?.slice(0, 4))
      .filter(ano => ano && /^\d{4}$/.test(ano))
  )];

  // Ordenar do ano mais recente para o mais antigo
  anos.sort((a, b) => Number(b) - Number(a));

  // Reconstruir as opções
  filtro.innerHTML = '<option value="">Todos</option>';

  anos.forEach(ano => {

    const opcao = document.createElement("option");

    opcao.value = ano;
    opcao.textContent = ano;

    filtro.appendChild(opcao);

  });

  // Preservar a seleção anterior
  if (anos.includes(anoSelecionado)) {
    filtro.value = anoSelecionado;
  }
}

/* ===== PREENCHER FILTRO DE PLATAFORMA ===== */

function atualizarFiltroPlataforma() {

  const jogos = jogosOnline;

  const filtro = document.querySelector("#filtro-plataforma");

  if (!filtro) return;

  // Guardar a plataforma selecionada
  const plataformaSelecionada = filtro.value;

  // Obter as plataformas cadastradas, sem duplicações
  const plataformas = [...new Set(
    jogos
      .map(jogo => String(jogo.plataforma || "").trim())
      .filter(plataforma => plataforma !== "")
  )];

  // Organizar em ordem alfabética
  plataformas.sort((a, b) => a.localeCompare(b, "pt-BR"));

  // Reconstruir as opções
  filtro.innerHTML = '<option value="">Todos</option>';

  plataformas.forEach(plataforma => {

    const opcao = document.createElement("option");

    opcao.value = plataforma;
    opcao.textContent = plataforma;

    filtro.appendChild(opcao);

  });

  // Preservar a seleção anterior
  if (plataformas.includes(plataformaSelecionada)) {
    filtro.value = plataformaSelecionada;
  }

}

/* ===== PREENCHER FILTRO DE GÊNERO ===== */

function atualizarFiltroGenero() {

  const jogos = jogosOnline;

  const filtro = document.querySelector("#filtro-genero");

  if (!filtro) return;

  // Guardar o gênero selecionado
  const generoSelecionado = filtro.value;

  // Obter os gêneros cadastrados, sem duplicações
  const generos = [...new Set(
    jogos
      .map(jogo => String(jogo.genero || "").trim())
      .filter(genero => genero !== "")
  )];

  // Organizar em ordem alfabética
  generos.sort((a, b) => a.localeCompare(b, "pt-BR"));

  // Reconstruir as opções
  filtro.innerHTML = '<option value="">Todos</option>';

  generos.forEach(genero => {

    const opcao = document.createElement("option");

    opcao.value = genero;
    opcao.textContent = genero;

    filtro.appendChild(opcao);

  });

  // Preservar a seleção anterior
  if (generos.includes(generoSelecionado)) {
    filtro.value = generoSelecionado;
  }

}

/* ===== PREENCHER FILTRO DE RANKING ===== */

function atualizarFiltroRanking() {

  const jogos = jogosOnline;

  const filtro = document.querySelector("#filtro-ranking");

  if (!filtro) return;

  // Guardar a avaliação selecionada
  const rankingSelecionado = filtro.value;

  // Obter as avaliações utilizadas, sem repetições
  const rankings = [...new Set(
    jogos
      .map(jogo => String(jogo.ranking ?? "").trim())
      .filter(ranking => ranking !== "")
  )];

  // Organizar da maior avaliação para a menor
  rankings.sort((a, b) => Number(b) - Number(a));

  // Reconstruir as opções
  filtro.innerHTML = '<option value="">Todos</option>';

  rankings.forEach(ranking => {

    const opcao = document.createElement("option");

    opcao.value = ranking;

    // Exibir estrelas, preservando o valor original
    const quantidadeEstrelas = Number(ranking);

    opcao.textContent =
      Number.isInteger(quantidadeEstrelas) &&
      quantidadeEstrelas >= 1 &&
      quantidadeEstrelas <= 5
        ? "★".repeat(quantidadeEstrelas)
        : ranking;

    filtro.appendChild(opcao);

  });

  // Preservar a seleção anterior
  if (rankings.includes(rankingSelecionado)) {
    filtro.value = rankingSelecionado;
  }

}

/* ===== PREENCHER FILTRO DE DIFICULDADE ===== */

function atualizarFiltroDificuldade() {

  const jogos = jogosOnline;

  const filtro = document.querySelector("#filtro-dificuldade");

  if (!filtro) return;

  // Preservar a dificuldade selecionada
  const dificuldadeSelecionada = filtro.value;

  // Dificuldades oficiais, na ordem desejada
  const dificuldades = [
    { valor: "muito-facil", nome: "Muito Fácil" },
    { valor: "facil", nome: "Fácil" },
    { valor: "normal", nome: "Normal" },
    { valor: "dificil", nome: "Difícil" },
    { valor: "muito-dificil", nome: "Impossível" }
  ];

  // Reconstruir as opções
  filtro.innerHTML = '<option value="">Todos</option>';

  dificuldades.forEach(dificuldade => {

    const opcao = document.createElement("option");

    opcao.value = dificuldade.valor;
    opcao.textContent = dificuldade.nome;

    filtro.appendChild(opcao);

  });

  // Restaurar a seleção anterior
  filtro.value = dificuldadeSelecionada;

}

function renderizarJogos() {
  atualizarTotalZerados();
  atualizarTempoTotal();
  atualizarZeradosAno();
  atualizarTempoAno();
  atualizarAnosHistorico();
  atualizarHistoricoAno();
  atualizarRankingGeneros();
  atualizarRankingPlataformas();
  atualizarFiltroAno();
  atualizarFiltroAnoZerado();
  atualizarFiltroPlataforma();
  atualizarFiltroGenero();
  atualizarFiltroRanking();
  atualizarFiltroDificuldade();

  const todosJogos = jogosOnline;

/* ===== FILTROS: ANO, ANO ZERADO, PLATAFORMA, GÊNERO, RANKING E DIFICULDADE ===== */

// Ano de lançamento
const anoSelecionado = document.querySelector("#filtro-ano").value;

// Ano em que o jogo foi zerado
const anoZeradoSelecionado = document.querySelector("#filtro-ano-zerado").value;

// Plataforma selecionada
const plataformaSelecionada = document.querySelector("#filtro-plataforma").value;

// Gênero selecionado
const generoSelecionado = document.querySelector("#filtro-genero").value;

// Ranking selecionado
const rankingSelecionado = document.querySelector("#filtro-ranking").value;

// Dificuldade selecionada
const dificuldadeSelecionada = document.querySelector("#filtro-dificuldade").value;

// ===== FILTRO DE JOGOS BRASILEIROS =====
const brSelecionado = document.querySelector("#filtro-br").checked;

// ===== FILTRO DE JOGOS EM REPLAY =====
const replaySelecionado = document.querySelector("#filtro-replay").checked;

// Aplicar os cinco filtros simultaneamente
const jogos = todosJogos.filter(jogo => {

  const correspondeAno =
    !anoSelecionado || String(jogo.ano) === anoSelecionado;

  const correspondeAnoZerado =
    !anoZeradoSelecionado ||
    jogo.dataFinal?.slice(0, 4) === anoZeradoSelecionado;

  const correspondePlataforma =
    !plataformaSelecionada ||
    String(jogo.plataforma || "").trim() === plataformaSelecionada;

  const correspondeGenero =
    !generoSelecionado ||
    String(jogo.genero || "").trim() === generoSelecionado;

  const correspondeRanking =
    !rankingSelecionado ||
    String(jogo.ranking ?? "").trim() === rankingSelecionado;

  const correspondeDificuldade =
   !dificuldadeSelecionada ||
   String(jogo.dificuldade || "").trim() === dificuldadeSelecionada;

   // Verificar se o jogo é brasileiro
const correspondeBR = !brSelecionado || jogo.nacional === "sim";
// Verificar se o jogo está em Replay
const correspondeReplay = !replaySelecionado || jogo.replay === "sim";

  return correspondeAno &&
       correspondeAnoZerado &&
       correspondePlataforma &&
       correspondeGenero &&
       correspondeRanking &&
       correspondeDificuldade &&
       correspondeBR &&
       correspondeReplay;

});

  galeriaJogos.innerHTML = "";

  jogos.forEach((jogo) => {
    const card = document.createElement("article");
    card.className = "card-jogo";

    card.innerHTML = `
  <div class="card-jogo-capa">
    <img class="card-jogo-imagem" alt="">
<button
  type="button"
  class="card-jogo-editar"
  title="Editar jogo"
  aria-label="Editar ${textoSeguro(jogo.nome)}"
>
  <i data-lucide="pencil"></i>
</button>
    <button
      type="button"
      class="card-jogo-excluir"
      title="Excluir jogo"
      aria-label="Excluir ${textoSeguro(jogo.nome)}"
    >
      <i data-lucide="trash-2"></i>
    </button>
  </div>

      <div class="card-jogo-info">

        <div class="card-jogo-nome">
          <strong>${textoSeguro(jogo.nome)}</strong>
          <span class="card-jogo-ano">
  ${jogo.replay === "sim" ? '<i data-lucide="rotate-ccw" class="card-jogo-replay"></i>' : ""}
  ${textoSeguro(jogo.ano || "—")}
</span>
        </div>

        <div class="card-jogo-desenvolvedora">
          ${textoSeguro(jogo.developer || "Desenvolvedora não informada")}
        </div>

        <div class="card-jogo-genero">
          ${textoSeguro(jogo.genero)}${jogo.subgenero?.trim() ? " / " + textoSeguro(jogo.subgenero.trim()) : ""}
        </div>
        
       <div class="card-jogo-avaliacao">

        <div class="card-jogo-estrelas"
             aria-label="Avaliação: ${Number(jogo.ranking) || 0} de 5 estrelas">
          ${criarEstrelas(jogo.ranking)}
        </div>
        ${jogo.nacional === "sim"
    ? '<img class="card-jogo-bandeira" src="https://flagcdn.com/br.svg" alt="Bandeira do Brasil" title="Jogo brasileiro">'
    : ""}

</div>

        <div class="card-jogo-dados">

          <div class="card-jogo-dado">
            <span class="card-jogo-dado-titulo">Zerado em:</span>
            <span class="card-jogo-dado-valor">
              <i data-lucide="calendar-days"></i>
              ${formatarData(jogo.dataFinal)}
            </span>
          </div>

          <div class="card-jogo-dado card-jogo-dado-direita">
            <span class="card-jogo-dado-titulo">Tempo:</span>
            <span class="card-jogo-dado-valor">
              <i data-lucide="clock"></i>
              ${formatarTempo(jogo.tempoTotal)}
            </span>
          </div>

        </div>

        <div class="card-jogo-rodape">
          <div>
            <span>Dificuldade</span>
            <strong>${formatarDificuldade(jogo.dificuldade)}</strong>
          </div>

          <div>
            <span>Plataforma</span>
            <strong>${textoSeguro(jogo.plataforma)}</strong>
          </div>
        </div>

      </div>
    `;

    // Configurar a imagem sem inserir a URL diretamente no HTML
    const imagem = card.querySelector(".card-jogo-imagem");

    imagem.onerror = () => {
      imagem.onerror = null;
      imagem.src = capaPadrao;
    };

    try {
      const url = new URL(jogo.capa);

      imagem.src = ["http:", "https:"].includes(url.protocol)
        ? url.href
        : capaPadrao;
    } catch {
      imagem.src = capaPadrao;
    }

    if (!administradorAutenticado) {
  card.querySelector(".card-jogo-editar").style.display = "none";
  card.querySelector(".card-jogo-excluir").style.display = "none";
}

    const botaoEditar = card.querySelector(".card-jogo-editar");

botaoEditar.addEventListener("click", () => {
  editarJogo(jogo);
});
    const botaoExcluir = card.querySelector(".card-jogo-excluir");

botaoExcluir.addEventListener("click", async () => {
  const confirmar = confirm(
    `Deseja realmente excluir "${jogo.nome}"?`
  );

  if (!confirmar) return;

  const { error } = await banco
    .from("jogos")
    .delete()
    .eq("id", jogo.id);

  if (error) {
    console.error("Erro ao excluir no Supabase:", error);
    alert("Não foi possível excluir o jogo.");
    return;
  }

  await recarregarJogos();
});

    galeriaJogos.appendChild(card);
  });

  // Ativar os ícones dos novos cards
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Mostrar os jogos salvos ao abrir a página
renderizarJogos();

/* ===== MUDANÇA DO ANO NO HISTÓRICO ===== */

document.querySelector("#historico-ano").addEventListener("change", () => {
  atualizarHistoricoAno();
});

/* ===== FILTRO POR ANO DE LANÇAMENTO ===== */

document.querySelector("#filtro-ano").addEventListener("change", renderizarJogos);

/* ===== FILTRO POR ANO ZERADO ===== */

document.querySelector("#filtro-ano-zerado").addEventListener("change", renderizarJogos);

/* ===== FILTRO POR PLATAFORMA ===== */

document.querySelector("#filtro-plataforma").addEventListener("change", renderizarJogos);

/* ===== FILTRO POR GÊNERO ===== */

document.querySelector("#filtro-genero").addEventListener("change", renderizarJogos);

/* ===== FILTRO POR RANKING ===== */

document.querySelector("#filtro-ranking").addEventListener("change", renderizarJogos);

/* ===== FILTRO POR DIFICULDADE ===== */

document.querySelector("#filtro-dificuldade").addEventListener("change", renderizarJogos);

/* ===== EVENTO DO FILTRO BR ===== */

document.querySelector("#filtro-br").addEventListener("change", renderizarJogos);

/* ===== EVENTO DO FILTRO REPLAY ===== */

document.querySelector("#filtro-replay").addEventListener("change", renderizarJogos);

/* ===== BOTÃO ZERAR FILTROS ===== */

document.querySelector("#btn-zerar-filtros").addEventListener("click", function() {

  // Redefinir todos os filtros
  document.querySelectorAll(".barra-filtros select").forEach(filtro => {
    filtro.value = "";
  });

  // Atualizar a galeria de jogos
  renderizarJogos();

});


/* ===== ENCERRAR SESSÃO DO ADMINISTRADOR ===== */

document.querySelector("#botao-sair").addEventListener("click", async (evento) => {
  evento.preventDefault();

  const { error } = await banco.auth.signOut();

  if (error) {
    console.error("Erro ao sair:", error.message);
    return;
  }

  administradorAutenticado = false;

  document.querySelector("#login-mensagem").textContent = "";
  document.querySelector("#botao-sair").hidden = true;
  document.querySelector("#add-game").style.display = "none";

  renderizarJogos();
});
