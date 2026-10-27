
/* =========================================
   FRANKENSTEIN GAMER — BACKLOG
   CONTROLE DA JANELA DE CADASTRO
========================================= */

const modalBacklog = document.querySelector("#modal-backlog");

const botaoAdicionarBacklog =
  document.querySelector("#adicionar-backlog");

const botaoFecharBacklog =
  document.querySelector("#fechar-modal-backlog");

const botaoCancelarBacklog =
  document.querySelector("#cancelar-backlog");

const formularioBacklog =
  document.querySelector("#form-backlog");

  
/* ===== CONTROLE DE EDIÇÃO DO BACKLOG ===== */

let idBacklogEmEdicao = null;

function atualizarTituloBacklog() {
  const editando = idBacklogEmEdicao !== null;

  document.querySelector("#modal-backlog-titulo").textContent =
    editando ? "Editar jogo do Backlog" : "Adicionar jogo ao Backlog";

  formularioBacklog.querySelector('button[type="submit"]').textContent =
    editando ? "Salvar alterações" : "Salvar jogo";
}


// ===== ABRIR JANELA =====

function abrirModalBacklog() {
    
  if (document.querySelector("#adicionar-backlog").hidden) {
    return;
  }

  modalBacklog.classList.add("aberto");
  modalBacklog.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  document.querySelector("#backlog-nome").focus();
}

// ===== FECHAR JANELA =====

function fecharModalBacklog() {
  modalBacklog.classList.remove("aberto");
  modalBacklog.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

// ===== EVENTOS DOS BOTÕES =====

botaoAdicionarBacklog.addEventListener("click", () => {
  idBacklogEmEdicao = null;
  formularioBacklog.reset();
  atualizarTituloBacklog();
  abrirModalBacklog();
});

/* ===== ABRIR JOGO PARA EDIÇÃO ===== */

function editarJogoBacklog(jogo) {

  if (botaoAdicionarBacklog.hidden) return;

  idBacklogEmEdicao = jogo.id;

  document.querySelector("#backlog-nome").value = jogo.nome || "";
  document.querySelector("#backlog-ano").value = jogo.ano || "";
  document.querySelector("#backlog-plataforma").value = jogo.plataforma || "";
  document.querySelector("#backlog-genero").value = jogo.genero || "";
  document.querySelector("#backlog-prioridade").value = jogo.prioridade || "";
  document.querySelector("#backlog-observacoes").value =
    jogo.observacoes || "";

  atualizarTituloBacklog();
  abrirModalBacklog();
}


/* =========================================
   BACKLOG — EXCLUIR JOGO
========================================= */

async function excluirJogoBacklog(jogo) {

  // Verificar se o usuário está autenticado
  const { data, error: erroLogin } =
    await bancoBacklog.auth.getUser();

  if (erroLogin || !data.user) {
    alert("É necessário estar autenticado para excluir jogos.");
    return;
  }

  // Confirmar antes de excluir
  const confirmado = confirm(
    `Deseja realmente excluir "${jogo.nome}" do Backlog?`
  );

  if (!confirmado) return;

  // Excluir do Supabase
  const { data: excluidos, error } = await bancoBacklog
    .from("backlog")
    .delete()
    .eq("id", jogo.id)
    .select("id");

  if (error) {
    console.error("Erro ao excluir jogo:", error);
    alert("Não foi possível excluir o jogo.");
    return;
  }

  if (!excluidos || excluidos.length === 0) {
    alert("O jogo não foi excluído. Verifique as permissões.");
    return;
  }

  // Atualizar a tabela
  await carregarBacklog();

  alert("Jogo excluído com sucesso!");
}


botaoFecharBacklog.addEventListener("click", fecharModalBacklog);

botaoCancelarBacklog.addEventListener("click", fecharModalBacklog);

// ===== FECHAR COM ESC =====

document.addEventListener("keydown", (evento) => {
  if (
    evento.key === "Escape" &&
    modalBacklog.classList.contains("aberto")
  ) {
    fecharModalBacklog();
  }
});

/* =========================================
   BACKLOG — CONEXÃO COM SUPABASE
========================================= */

// Mesma conexão utilizada no app.js
const BACKLOG_SUPABASE_URL = "https://awoqcufqlsruqnmjobmq.supabase.co";

const BACKLOG_SUPABASE_KEY = "sb_publishable_so1o1Qll9zQ1jEGUx33FEQ_wMDRKtiX";

const bancoBacklog = window.supabase.createClient(
  BACKLOG_SUPABASE_URL,
  BACKLOG_SUPABASE_KEY
);

// ===== CARREGAR JOGOS =====

async function carregarBacklog() {

  const corpoTabela = document.querySelector("#backlog-corpo");

  const { data, error } = await bancoBacklog
    .from("backlog")
    .select("*");

  if (error) {
    console.error("Erro ao carregar Backlog:", error);
    corpoTabela.innerHTML =
      '<tr><td colspan="7">Erro ao carregar jogos.</td></tr>';
    return;
  }

  // Ordenar por prioridade: Alta, Média, Baixa
  const ordemPrioridade = {
    alta: 1,
    media: 2,
    baixa: 3
  };

  const jogos = [...data].sort((a, b) => {
    return (ordemPrioridade[a.prioridade] || 4) -
           (ordemPrioridade[b.prioridade] || 4);
  });

  corpoTabela.innerHTML = "";

  if (jogos.length === 0) {
    corpoTabela.innerHTML =
      '<tr><td colspan="7">Nenhum jogo cadastrado no Backlog.</td></tr>';
    return;
  }

  jogos.forEach(jogo => {

    const linha = document.createElement("tr");

    // Criar células com textContent para evitar HTML indevido
    const adicionarCelula = (texto) => {
      const celula = document.createElement("td");
      celula.textContent = texto ?? "";
      linha.appendChild(celula);
      return celula;
    };

    adicionarCelula(jogo.nome);
    adicionarCelula(jogo.ano);
    adicionarCelula(jogo.plataforma);
    adicionarCelula(jogo.genero);

    // Prioridade com cor
    const celulaPrioridade = document.createElement("td");
    const etiqueta = document.createElement("span");

    etiqueta.className = `backlog-prioridade ${jogo.prioridade}`;

    const nomesPrioridade = {
      alta: "Alta",
      media: "Média",
      baixa: "Baixa"
    };

    etiqueta.textContent = nomesPrioridade[jogo.prioridade] || "—";

    celulaPrioridade.appendChild(etiqueta);
    linha.appendChild(celulaPrioridade);

    adicionarCelula(jogo.observacoes || "—");

    
// ===== BOTÃO EDITAR =====

const celulaAcoes = document.createElement("td");

if (!botaoAdicionarBacklog.hidden) {

  const containerAcoes = document.createElement("div");
  containerAcoes.className = "backlog-acoes";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.title = "Editar jogo";
  botaoEditar.setAttribute("aria-label", `Editar ${jogo.nome}`);

  botaoEditar.innerHTML = '<i data-lucide="pencil"></i>';

  botaoEditar.addEventListener("click", () => {
    editarJogoBacklog(jogo);
  });

  
// Adicionar botão de edição
containerAcoes.appendChild(botaoEditar);

// ===== BOTÃO EXCLUIR =====

const botaoExcluir = document.createElement("button");

botaoExcluir.type = "button";
botaoExcluir.title = "Excluir jogo";
botaoExcluir.setAttribute(
  "aria-label",
  `Excluir ${jogo.nome}`
);

botaoExcluir.innerHTML = '<i data-lucide="trash-2"></i>';

botaoExcluir.addEventListener("click", () => {
  excluirJogoBacklog(jogo);
});

// Adicionar botão de exclusão
containerAcoes.appendChild(botaoExcluir);

celulaAcoes.appendChild(containerAcoes);

}

linha.appendChild(celulaAcoes);


        corpoTabela.appendChild(linha);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Carregar a lista ao abrir a página
carregarBacklog();


/* =========================================
   BACKLOG — VERIFICAR AUTENTICAÇÃO
========================================= */

async function verificarAdministradorBacklog() {

  const botaoAdicionar = document.querySelector("#adicionar-backlog");

  // Manter oculto até confirmar a sessão
  botaoAdicionar.hidden = true;

  const { data, error } = await bancoBacklog.auth.getUser();

  if (error || !data.user) {
    console.log("Backlog: visitante não autenticado.");
    return;
  }

  console.log("Backlog: usuário autenticado.");

  botaoAdicionar.hidden = false;
  await carregarBacklog();
}

// Verificar a sessão ao abrir a página
verificarAdministradorBacklog();


/* =========================================
   BACKLOG — CADASTRAR JOGO NO SUPABASE
========================================= */

formularioBacklog.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  // Confirmar autenticação antes de salvar
  const { data: usuario, error: erroLogin } =
    await bancoBacklog.auth.getUser();

  if (erroLogin || !usuario.user) {
    alert("É necessário estar autenticado para cadastrar jogos.");
    return;
  }

  // Capturar os campos do formulário
  const dadosJogo = {
    nome: document.querySelector("#backlog-nome").value.trim(),
    ano: Number(document.querySelector("#backlog-ano").value),
    plataforma: document.querySelector("#backlog-plataforma").value,
    genero: document.querySelector("#backlog-genero").value,
    prioridade: document.querySelector("#backlog-prioridade").value,
    observacoes:
      document.querySelector("#backlog-observacoes").value.trim() || null
  };

  // Impedir cliques repetidos durante o salvamento
  const botaoSalvar = formularioBacklog.querySelector(
    'button[type="submit"]'
  );

  botaoSalvar.disabled = true;
  botaoSalvar.textContent = "Salvando...";

  try {
    
let resultado;

if (idBacklogEmEdicao === null) {

  // Cadastrar novo jogo
  resultado = await bancoBacklog
    .from("backlog")
    .insert(dadosJogo);

} else {

  // Atualizar jogo existente
  resultado = await bancoBacklog
    .from("backlog")
    .update(dadosJogo)
    .eq("id", idBacklogEmEdicao);

}

const { error } = resultado;


    if (error) {
      console.error("Erro ao cadastrar no Backlog:", error);
      alert("Não foi possível cadastrar o jogo. Confira o Console.");
      return;
    }

    // Atualizar a tabela
    await carregarBacklog();

    
// Limpar e fechar o formulário
formularioBacklog.reset();
fecharModalBacklog();

const mensagem = idBacklogEmEdicao === null
  ? "Jogo cadastrado com sucesso!"
  : "Jogo atualizado com sucesso!";

idBacklogEmEdicao = null;
atualizarTituloBacklog();

alert(mensagem);

  } finally {
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = "Salvar jogo";
  }
});



