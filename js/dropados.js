
/* =========================================
   DROPADOS
   CONTROLE DA JANELA DE CADASTRO
========================================= */

const modalDropados =
  document.querySelector("#modal-dropados");

const botaoAdicionarDropado =
  document.querySelector("#adicionar-dropado");

const botaoCancelarDropado =
  document.querySelector("#cancelar-dropado");

const formularioDropados =
  document.querySelector("#form-dropados");

  
/* ===== CONTROLE DE EDIÇÃO ===== */

let idDropadoEmEdicao = null;

function editarJogoDropado(jogo) {

  if (botaoAdicionarDropado.hidden) return;

  idDropadoEmEdicao = jogo.id;

  document.querySelector("#dropado-nome").value =
    jogo.nome || "";

  document.querySelector("#dropado-ano").value =
    jogo.ano ?? "";

  document.querySelector("#dropado-plataforma").value =
    jogo.plataforma || "";

  document.querySelector("#dropado-genero").value =
    jogo.genero || "";

  const tempo = jogo.tempo_minutos || 0;

  document.querySelector("#dropado-horas").value =
    Math.floor(tempo / 60);

  document.querySelector("#dropado-minutos").value =
    tempo % 60;

  document.querySelector("#dropado-motivo").value =
    jogo.motivo || "";

  document.querySelector("#titulo-modal-dropados").textContent =
    "Editar jogo dropado";

  document.querySelector("#salvar-dropado").textContent =
    "Salvar alterações";

  abrirModalDropados();
}


// ===== ABRIR MODAL =====

function abrirModalDropados() {
  if (botaoAdicionarDropado.hidden) return;

  modalDropados.hidden = false;
  modalDropados.classList.add("aberto");
  modalDropados.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
  document.querySelector("#dropado-nome").focus();
}

// ===== FECHAR MODAL =====

function fecharModalDropados() {
  modalDropados.classList.remove("aberto");
  modalDropados.setAttribute("aria-hidden", "true");
  modalDropados.hidden = true;

  document.body.style.overflow = "";
}

// ===== EVENTOS =====

botaoAdicionarDropado.addEventListener("click", () => {
  idDropadoEmEdicao = null;

  formularioDropados.reset();

  document.querySelector("#titulo-modal-dropados").textContent =
    "Adicionar jogo dropado";

  document.querySelector("#salvar-dropado").textContent =
    "Salvar jogo";

  abrirModalDropados();
});


botaoCancelarDropado.addEventListener(
  "click",
  fecharModalDropados
);

// Fechar pressionando ESC
document.addEventListener("keydown", (evento) => {
  if (
    evento.key === "Escape" &&
    !modalDropados.hidden
  ) {
    fecharModalDropados();
  }
});


/* =========================================
   DROPADOS — PLATAFORMAS E GÊNEROS
========================================= */

const plataformasDropados = [
  "PC", "SNES", "WII", "NINTENDO 64",
  "MEGA DRIVE", "MASTER SYSTEM", "ATARI",
  "PS 1", "PS 2", "NINTENDO DS",
  "NINTENDO 3DS", "PSP", "GAME BOY",
  "GAME BOY ADVANCE", "ARCADE", "EMULAÇÃO",
  "SWITCH", "PS VITA", "NES",
  "TURBO GRAFX", "GAME BOY COLOR",
  "GAME GEAR", "GAME CUBE"
];

const generosDropados = [
  "AÇÃO/AVENTURA",
  "BEAT N’ UP / H. SLASH",
  "CORRIDA",
  "ESTRATÉGIA",
  "ESPORTE",
  "FPS",
  "LUTA",
  "METROIDVANIA",
  "MUNDO ABERTO",
  "POINT AND CLICK",
  "PUZZLE",
  "RPG",
  "SHOOT ’EM UP",
  "SURVIVAL HORROR",
  "WALKING SIMULATOR",
  "SOULSLIKE",
  "NARRATIVO",
];

function preencherSelectDropados(id, opcoes) {
  const select = document.querySelector(id);

  opcoes.forEach(opcao => {
    const elemento = document.createElement("option");
    elemento.value = opcao;
    elemento.textContent = opcao;
    select.appendChild(elemento);
  });
}

preencherSelectDropados(
  "#dropado-plataforma",
  plataformasDropados
);

preencherSelectDropados(
  "#dropado-genero",
  generosDropados
);


/* =========================================
   DROPADOS — CONEXÃO COM SUPABASE
========================================= */

const DROPADOS_SUPABASE_URL =
  "https://awoqcufqlsruqnmjobmq.supabase.co";

const DROPADOS_SUPABASE_KEY =
  "sb_publishable_so1o1Qll9zQ1jEGUx33FEQ_wMDRKtiX";

const bancoDropados = window.supabase.createClient(
  DROPADOS_SUPABASE_URL,
  DROPADOS_SUPABASE_KEY
);

// ===== CARREGAR JOGOS DROPADOS =====

async function carregarDropados() {
  const corpoTabela =
    document.querySelector("#dropados-corpo");

  const { data, error } = await bancoDropados
    .from("dropados")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar Dropados:", error);
    corpoTabela.innerHTML =
      '<tr><td colspan="7">Erro ao carregar jogos.</td></tr>';
    return;
  }

  corpoTabela.innerHTML = "";

  if (!data.length) {
    corpoTabela.innerHTML =
      '<tr><td colspan="7">Nenhum jogo dropado cadastrado.</td></tr>';
    return;
  }

  data.forEach(jogo => {
    const linha = document.createElement("tr");

    const adicionarCelula = (valor) => {
      const celula = document.createElement("td");
      celula.textContent = valor ?? "—";
      linha.appendChild(celula);
      return celula;
    };

    adicionarCelula(jogo.nome);
    adicionarCelula(jogo.ano);
    adicionarCelula(jogo.plataforma);
    adicionarCelula(jogo.genero);

    const minutos = jogo.tempo_minutos || 0;
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    adicionarCelula(
      `${horas}h ${String(resto).padStart(2, "0")}min`
    );

    // Motivo completo será exibido em uma janela
    const celulaMotivo = document.createElement("td");
    const botaoMotivo = document.createElement("button");

    botaoMotivo.type = "button";
    botaoMotivo.textContent = "Ler motivo";
    
botaoMotivo.className = "botao-ler-motivo";

botaoMotivo.addEventListener("click", () => {
  document.querySelector("#motivo-dropado-titulo").textContent =
    jogo.nome;

  document.querySelector("#motivo-dropado-texto").textContent =
    jogo.motivo || "Motivo não informado.";

  document.querySelector("#modal-motivo-dropado").hidden = false;
  document.body.style.overflow = "hidden";
});


    celulaMotivo.appendChild(botaoMotivo);
    linha.appendChild(celulaMotivo);

    
    // ===== AÇÕES ADMINISTRATIVAS =====

    const celulaAcoes = document.createElement("td");

    if (!botaoAdicionarDropado.hidden) {

      const containerAcoes = document.createElement("div");
      containerAcoes.className = "backlog-acoes";

      const botaoEditar = document.createElement("button");
      botaoEditar.type = "button";
      botaoEditar.title = "Editar jogo";
      botaoEditar.setAttribute(
        "aria-label",
        `Editar ${jogo.nome}`
      );

      botaoEditar.innerHTML = '<i data-lucide="pencil"></i>';
      
botaoEditar.addEventListener("click", () => {
  editarJogoDropado(jogo);
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

      botaoExcluir.innerHTML =
        '<i data-lucide="trash-2"></i>';

      botaoExcluir.addEventListener("click", () => {
        excluirJogoDropado(jogo);
      });

      // Adicionar botão de exclusão
      containerAcoes.appendChild(botaoExcluir);

      celulaAcoes.appendChild(containerAcoes);

    }

    linha.appendChild(celulaAcoes);


    
    corpoTabela.appendChild(linha);
  });

  // Atualizar os ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }
}


// Carregar os jogos ao abrir a página
carregarDropados();


/* =========================================
   DROPADOS — VERIFICAR ADMINISTRADOR
========================================= */

async function verificarAdministradorDropados() {

  const botaoAdicionar =
    document.querySelector("#adicionar-dropado");

  // Ocultar até confirmar a autenticação
  botaoAdicionar.hidden = true;

  const { data, error } =
    await bancoDropados.auth.getUser();

  if (error || !data.user) {
    console.log("Dropados: visitante não autenticado.");
    return;
  }

  console.log("Dropados: usuário autenticado.");

  botaoAdicionar.hidden = false;
  await carregarDropados();
}

// Verificar autenticação ao abrir a página
verificarAdministradorDropados();


/* =========================================
   DROPADOS — CADASTRAR JOGO NO SUPABASE
========================================= */

formularioDropados.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  // Confirmar autenticação
  const { data: usuario, error: erroLogin } =
    await bancoDropados.auth.getUser();

  if (erroLogin || !usuario.user) {
    alert("É necessário estar autenticado para cadastrar jogos.");
    return;
  }

  // Capturar o tempo jogado
  const horas = Number(
    document.querySelector("#dropado-horas").value || 0
  );

  const minutos = Number(
    document.querySelector("#dropado-minutos").value || 0
  );

  // Validar o tempo
  if (
    !Number.isInteger(horas) ||
    !Number.isInteger(minutos) ||
    horas < 0 ||
    minutos < 0 ||
    minutos > 59
  ) {
    alert("Informe um tempo de jogo válido.");
    return;
  }

  // Preparar os dados para o Supabase
  const campoAno = document.querySelector("#dropado-ano").value;

  const dadosJogo = {
    nome: document.querySelector("#dropado-nome").value.trim(),
    ano: campoAno ? Number(campoAno) : null,
    plataforma: document.querySelector("#dropado-plataforma").value,
    genero: document.querySelector("#dropado-genero").value,
    tempo_minutos: horas * 60 + minutos,
    motivo: document.querySelector("#dropado-motivo").value.trim()
  };

  // Impedir salvamentos duplicados
  const botaoSalvar =
    document.querySelector("#salvar-dropado");

  botaoSalvar.disabled = true;
  botaoSalvar.textContent = "Salvando...";

  try {
    
let resultado;

if (idDropadoEmEdicao === null) {

  // Cadastrar um novo jogo
  resultado = await bancoDropados
    .from("dropados")
    .insert(dadosJogo);

} else {

  // Atualizar o jogo existente
  resultado = await bancoDropados
    .from("dropados")
    .update(dadosJogo)
    .eq("id", idDropadoEmEdicao)
    .select("id");

}

const { data: registrosAlterados, error } = resultado;

if (
  !error &&
  idDropadoEmEdicao !== null &&
  (!registrosAlterados || registrosAlterados.length === 0)
) {
  alert("Nenhum registro foi atualizado. Verifique as permissões.");
  return;
}

    if (error) {
      console.error("Erro ao cadastrar Dropado:", error);
      alert("Não foi possível cadastrar o jogo. Confira o Console.");
      return;
    }

    // Atualizar a tabela
    await carregarDropados();

    // Limpar e fechar o formulário
    formularioDropados.reset();
    fecharModalDropados();

    
const mensagem = idDropadoEmEdicao === null
  ? "Jogo dropado cadastrado com sucesso!"
  : "Jogo dropado atualizado com sucesso!";

idDropadoEmEdicao = null;

alert(mensagem);


  } catch (erro) {
    console.error("Erro inesperado:", erro);
    alert("Ocorreu um erro ao salvar o jogo.");

  } finally {
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = "Salvar jogo";
  }
});

/* =========================================
   DROPADOS — FECHAR JANELA DO MOTIVO
========================================= */

const modalMotivoDropado =
  document.querySelector("#modal-motivo-dropado");

function fecharMotivoDropado() {
  modalMotivoDropado.hidden = true;
  document.body.style.overflow = "";
}

document.querySelector("#fechar-motivo-dropado")
  .addEventListener("click", fecharMotivoDropado);

modalMotivoDropado.addEventListener("click", (evento) => {
  if (evento.target === modalMotivoDropado) {
    fecharMotivoDropado();
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !modalMotivoDropado.hidden) {
    fecharMotivoDropado();
  }
});


/* =========================================
   DROPADOS — EXCLUIR JOGO
========================================= */

async function excluirJogoDropado(jogo) {

  // Confirmar autenticação
  const { data, error: erroLogin } =
    await bancoDropados.auth.getUser();

  if (erroLogin || !data.user) {
    alert("É necessário estar autenticado para excluir jogos.");
    return;
  }

  // Pedir confirmação
  const confirmado = confirm(
    `Deseja realmente excluir "${jogo.nome}" dos Dropados?`
  );

  if (!confirmado) return;

  // Excluir no Supabase
  const { data: excluidos, error } = await bancoDropados
    .from("dropados")
    .delete()
    .eq("id", jogo.id)
    .select("id");

  if (error) {
    console.error("Erro ao excluir Dropado:", error);
    alert("Não foi possível excluir o jogo.");
    return;
  }

  if (!excluidos || excluidos.length === 0) {
    alert("O jogo não foi excluído. Verifique as permissões.");
    return;
  }

  // Atualizar a tabela
  await carregarDropados();

  alert("Jogo dropado excluído com sucesso!");
}



