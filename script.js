let api_url = 'http://127.0.0.1:5000';

async function inicializaApp() {
  await buscarCategorias();
  //await buscarTarefas(1);
  ativarTab(1);
}

async function buscarCategorias() {
  try {
    //Busca categorias
    const response = await fetch(`${api_url}/categoria`)
    const categorias = await response.json();
    for (const categoria of categorias) {
      criaCategoriaTab(categoria);
      criaCategoriaSelect(categoria);
    };
  } catch (error) {
    console.error(error);
  }
}

async function buscarTarefas(categoriaId) {
  try {
    const response = await fetch(`${api_url}/tarefa?categoria_id=${categoriaId}`)
    const tarefas = await response.json();
    removeTarefasCard(categoriaId);
    for (const tarefa of tarefas) {
      criaTarefaCard(tarefa);
    };
    //ativarTab(categoriaId);
  } catch (error) {
    console.error(error);
  }
}


async function adicionarTarefa() {
  let form = document.getElementById("adicionar-tarefa");
  let modal = bootstrap.Modal.getInstance(form);
  let titulo = document.getElementById("tituloInput").value;
  let dtLimite = document.getElementById("dataInput").value;
  let detalhes = document.getElementById("detalhesTextarea").value;  
  let categoriaId = document.getElementById("categoriaSelect").value;  

  //Preparando parametros
  const formData  = new FormData();
  formData.append("titulo",titulo);
  formData.append("data_limite",dtLimite.split('-').reverse().join('/'));
  formData.append("detalhes",detalhes);
  formData.append("categoria_id",categoriaId);
  
  try {
    const response = await fetch(`${api_url}/tarefa`, {
      method: "POST",
      body: formData
    }); 
    const tarefa = await response.json();  
    await buscarTarefas(categoriaId);
    ativarTab(categoriaId);
    modal.hide();
    form.reset();    
    console.log(tarefa);
  } catch (error) {
    console.error(error);
  } 
  
}

function deletarTarefa(tarefaId, categoriaId) {
  let delBtn = document.getElementById("deletar-btn");
  //Define um event listener no btn do modal para deleção da tarefa
  delBtn.addEventListener("click", async function () {
    let modalEl = document.getElementById('confirmar-delecao');
    let modal = bootstrap.Modal.getInstance(modalEl);      
    try {
      //Deleta tarefa
      const response = await fetch(`${api_url}/tarefa?id=${tarefaId}`, { method: 'DELETE' });
      //Ativa tab
      ativarTab(categoriaId);
      //Esconde modal
      modal.hide();
    } catch (error) {
      console.error(error);
    }
  });
}

function removeTarefasCard(categoriaId) {
  let parent = document.getElementById(`categoria-${categoriaId}`);
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function ativarTab(categoriaId) {
  let link = document.getElementById(`tab-${categoriaId}`);
  link.click();
}

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
  //a.setAttribute("data-bs-target",`#tab-pane-${categoria.id}`);
  a.setAttribute("role", "tab");
  //a.setAttribute("aria-controls",`tab-pane-${categoria.id}`);
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

function criaCategoriaSelect(categoria) {
  let categoriaSelect = document.getElementById("categoriaSelect");
  let option = document.createElement("option");
  option.text = categoria.nome;
  option.value = categoria.id;
  categoriaSelect.add(option);  
}

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
  button.setAttribute("class", "btn btn-danger btn-sm float-end");
  button.setAttribute("data-bs-toggle", "modal");
  button.setAttribute("data-bs-target", "#confirmar-delecao");
  button.setAttribute("onclick", `deletarTarefa(${tarefa.id},${tarefa.categoria.id})`);
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

inicializaApp();