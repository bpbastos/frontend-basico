let api_url = 'http://127.0.0.1:5000';

/*
  --------------------------------------------------------------------------------------
  Função que incicializa o aplicativo
  --------------------------------------------------------------------------------------
*/
async function inicializaApp() {
  let addBtn = document.getElementById("adicionar-bnt");
  await buscarCategorias();
  await ativarTab(1);
  addBtn.addEventListener("click", function () {
    adicionarTarefa();
  })
}

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista de categorias existentes via GET e criar os elementos de UI
  --------------------------------------------------------------------------------------
*/
async function buscarCategorias() {
  let container = "container-msg-lista";
  try {
    //Busca categorias
    const response = await fetch(`${api_url}/categoria`)
    const categorias = await response.json();
    if (!response.ok) throw new Error(response.statusText);
    for (const categoria of categorias) {
      criaCategoriaTab(categoria);
      criaCategoriaSelect(categoria);
    };
  } catch (error) {
    criaAlert(container, "alert-danger", error, -1, false);
  }
}


/*
  --------------------------------------------------------------------------------------
  Função para obter a lista de tarefas existentes via GET e criar os elementos de UI
  --------------------------------------------------------------------------------------
*/
async function buscarTarefas(categoriaId) {
  let parent = document.getElementById(`categoria-${categoriaId}`);
  let container = "container-msg-lista";
  try {
    const response = await fetch(`${api_url}/tarefa?categoria_id=${categoriaId}`)
    const tarefas = await response.json();
    if (!response.ok) throw new Error(response.statusText);
    removeElementosFilhos(parent);
    for (const tarefa of tarefas) {
      criaTarefaCard(tarefa);
    };
    tipo = "alert-warning";
    msg = `Nenhuma tarefa encontrada para essa categoria.`;
    if (tarefas && tarefas.length) {
      tipo = "alert-success";
      msg = `Tarefas da categoria <strong>${tarefas[0].categoria.nome}</strong> carregadas com sucesso!`;
    }
    criaAlert(container, tipo, msg, 2000, false);
  } catch (error) {
    criaAlert(container, "alert-danger", error, -1, false);
    console.error(error);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para criar uma tarefa via POST e criar/atualizar os elementos de UI
  --------------------------------------------------------------------------------------
*/
async function adicionarTarefa() {
  let form = document.getElementById("adicionar-tarefa");
  let modal = bootstrap.Modal.getInstance(form);
  let titulo = document.getElementById("tituloInput").value;
  let dtLimite = document.getElementById("dataInput").value;
  let detalhes = document.getElementById("detalhesTextarea").value;
  let categoriaId = document.getElementById("categoriaSelect").value;

  //Preparando parametros
  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("data_limite", dtLimite.split('-').reverse().join('/'));
  formData.append("detalhes", detalhes);
  formData.append("categoria_id", categoriaId);

  try {
    const response = await fetch(`${api_url}/tarefa`, {
      method: "POST",
      body: formData
    });
    const tarefa = await response.json();
    if (!response.ok) {
      if (response.status === 422) {
        validaFormulario(tarefa);
      }
    } else {
      tipo = "alert-success";
      msg = `Tarefa <strong>${tarefa[0].titulo}</strong> cadastrada com sucesso!`;
      criaAlert("container-msg-lista", tipo, msg, 5000, false);
      modal.hide();
      form.reset();
      ativarTab(categoriaId);
    }
  } catch (error) {
    criaAlert(container, "alert-danger", error, -1, false);
    console.error(error);
  }

}

/*
  --------------------------------------------------------------------------------------
  Função para deletar uma tarefa via DELETE e criar/atualizar os elementos de UI
  --------------------------------------------------------------------------------------
*/
function deletarTarefa(tarefaId, categoriaId) {
  let delBtn = document.getElementById("deletar-btn");
  let container = "container-msg-lista";
  //Define um event listener no btn do modal para deleção da tarefa
  //Limpa os eventos antes de adicionar um novo
  //delBtn.replaceWith(delBtn.cloneNode(true))
  delBtn.addEventListener("click", async function () {
    let modalEl = document.getElementById('confirmar-delecao');
    let modal = bootstrap.Modal.getInstance(modalEl);
    try {
      //Deleta tarefa
      const response = await fetch(`${api_url}/tarefa?id=${tarefaId}`, { method: 'DELETE' });
      const tarefa = await response.json();
      if (!response.ok) throw new Error(response.statusText);
      //Ativa tab
      ativarTab(categoriaId);
      //Msg de sucesso
      tipo = "alert-success";
      msg = `Tarefa <strong>${tarefa[0].titulo}</strong> deletada com sucesso!`;
      criaAlert(container, tipo, msg, 5000);
      //Esconde modal
      modal.hide();
    } catch (error) {
      criaAlert(container, "alert-danger", error, -1, false);
      console.error(error);
    }
  },{once : true});
}

/*
  --------------------------------------------------------------------------------------
  Função utilitária para validar e formatar as msg de erro. 
  --------------------------------------------------------------------------------------
*/
function validaFormulario(erros) {
  msg = "Por favor, corrija os <strong>erros</strong> abaixo:<br/><hr/>"
  tipo = "alert-danger";
  container = "container-msg-form";
  if (erros && erros.length) {
    erros.forEach(erro => {
      msg += `<strong>${erro.loc[0]}</strong>: ${erro.msg}<br/>`
    })
    criaAlert(container, tipo, msg, 10000, true);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função utilitária para remover elementos DOM filhos de um container. 
  --------------------------------------------------------------------------------------
*/
function removeElementosFilhos(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/*
  --------------------------------------------------------------------------------------
  Função utilitária para ativar uma aba de uma determinada categoria
  --------------------------------------------------------------------------------------
*/
function ativarTab(categoriaId) {
  let link = document.getElementById(`tab-${categoriaId}`);
  if (link) link.click();
}

/*
  --------------------------------------------------------------------------------------
  Função utilitária para criar os elementos de UI para representação de uma categoria
  --------------------------------------------------------------------------------------
*/
function criaCategoriaTab(categoria) {
  let ul = document.getElementById("categoria-tab");
  let li = document.createElement('li');
  let a = document.createElement('a');
  let divTabContent = document.getElementById("tarefa-tab-cont");
  let divTabPane = document.createElement('div');

  //Configura elemento a
  a.classList.add("nav-link");
  a.setAttribute("id", `tab-${categoria.id}`);
  a.setAttribute("data-bs-toggle", "tab");
  a.setAttribute("role", "tab");
  a.setAttribute("aria-selected", "false");
  //Adiciona evento click para carregar tarefas dinamicamente
  a.addEventListener("click", function () { buscarTarefas(categoria.id); });
  a.textContent = categoria.nome;
  a.href = `#categoria-${categoria.id}`
  //Configura elemento li
  li.classList.add("nav-item");
  li.setAttribute("role", "presentation");
  li.appendChild(a);
  ul.appendChild(li);

  //Div container de conteúdo das tabs
  divTabPane.setAttribute("class", "tab-pane fade");
  divTabPane.setAttribute("id", `categoria-${categoria.id}`);
  divTabPane.setAttribute("role", "tabpanel");
  divTabPane.setAttribute("aria-labelledby", `tab-${categoria.id}`);
  divTabPane.setAttribute("tabindex", "0");

  divTabContent.appendChild(divTabPane);

}

/*
  --------------------------------------------------------------------------------------
  Função utilitária para criar os elementos de UI para representação de uma tarefa
  --------------------------------------------------------------------------------------
*/
function criaTarefaCard(tarefa) {
  let divTabPane = document.getElementById(`categoria-${tarefa.categoria.id}`);
  //Cria o elemento card para representar uma tarefa
  let divCard = document.createElement('div');
  divCard.setAttribute("class", "card mb-3");
  divCard.setAttribute("id", `card-${tarefa.id}`);
  let divCardHeader = document.createElement('div');
  divCardHeader.setAttribute("class", "card-header align-middle");
  divCardHeader.textContent = tarefa.titulo;
  let button = document.createElement('button');
  button.setAttribute("type", "button");
  button.setAttribute("class", "btn btn-danger btn-sm float-end");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#confirmar-delecao");
  button.setAttribute("id", `del-btn-${tarefa.id}`);
  //button.setAttribute("onclick", `deletarTarefa(${tarefa.id},${tarefa.categoria.id})`);
  //button.removeEventListener("click", deletarTarefa(tarefa.id,tarefa.categoria.id));
  button.addEventListener("click", function () { 
    deletarTarefa(tarefa.id,tarefa.categoria.id);
  })
  let i = document.createElement('i');
  i.setAttribute("class", "fas fa-minus");
  let small = document.createElement('small');
  small.setAttribute("class", "text-body-secondary float-end");
  small.textContent = tarefa.data_limite;

  button.appendChild(i);
  divCardHeader.appendChild(button);
  //divCardHeader.appendChild(small);

  let divCardBody = document.createElement('div');
  divCardBody.setAttribute("class", "card-body");

  let p = document.createElement('p');
  p.setAttribute("class", "card-text");
  p.textContent = tarefa.detalhes;
  divCardBody.appendChild(p);

  divCard.appendChild(divCardHeader);
  divCard.appendChild(divCardBody);

  divTabPane.appendChild(divCard);

}


/*
  --------------------------------------------------------------------------------------
  Função utilitária uma caixa de seleção de categorias
  --------------------------------------------------------------------------------------
*/
function criaCategoriaSelect(categoria) {
  let categoriaSelect = document.getElementById("categoriaSelect");
  let option = document.createElement("option");
  option.text = categoria.nome;
  option.value = categoria.id;
  categoriaSelect.add(option);
}

/*
  --------------------------------------------------------------------------------------
  Função utilitária para criar os elementos de UI para representação de uma msg
  --------------------------------------------------------------------------------------
*/
function criaAlert(containerId, tipo, msg, tempo, limpar) {
  let divContainer = document.getElementById(containerId);
  let divAlert = document.createElement('div');
  let btnClose = document.createElement('button');

  //Define um bootstrap alert
  if (limpar) removeElementosFilhos(divContainer);

  divAlert.setAttribute("class", `alert ${tipo} alert-dismissible fade show`);
  divAlert.setAttribute("role", "alert");
  divAlert.innerHTML = msg;
  //Fecha automaticamente
  if (tempo > 0) {
    new bootstrap.Alert(divAlert);
    setTimeout(() => {
      bootstrap.Alert.getInstance(divAlert).close();
    }, tempo);
  }
  btnClose.setAttribute("class", "btn-close");
  btnClose.setAttribute("data-bs-dismiss", "alert");
  btnClose.setAttribute("aria-label", "Fechar");
  btnClose.setAttribute("type", "button");

  divAlert.appendChild(btnClose);
  divContainer.appendChild(divAlert);
}

//Incicializa o aplicativo
inicializaApp();