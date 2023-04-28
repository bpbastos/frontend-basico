let api_url = 'http://127.0.0.1:5000';
let tarefasDiv = document.getElementById("tarefas");

/*
  ----------------------------------------------------------------------------------------
  Função para obter a lista de todas as tarefas existentes no servidor via requisição GET
  ----------------------------------------------------------------------------------------
*/
async function procurarTarefas() {
  let categoriaSelect = document.getElementById("categoriaSelect");
  
  //Busca categorias
  const response = await fetch(`${api_url}/categoria`)
  const categorias = await response.json();
  for (const categoria of categorias) {
    //Cria 
    let option = document.createElement("option");
    option.text = categoria.nome;
    option.value = categoria.id;
    categoriaSelect.add(option);
    novaCategoria(categoria)
    const response = await fetch(`${api_url}/tarefa?categoria_id=${categoria.id}`)
    const tarefas = await response.json();
    tarefas.forEach(tarefa => {
      novaTarefa(tarefa)
    });
  }
  //Define a primeira tab como ativa
  tabs = document.querySelectorAll('.nav-link');
  if (tabs.length) {
    tabs[0].classList.add("active")
    tabs[0].setAttribute("aria-selected","true");

    tabsCont = document.querySelectorAll('.tab-pane');
    if (tabsCont.length) {
      tabsCont[0].classList.add("show")
      tabsCont[0].classList.add("active")
    }
  }  
}

function novaCategoria(categoria) {
  let ul = document.getElementById("categoria-tab");
  let li = document.createElement('li');
  let a = document.createElement('a');
  //Configura elemento a
  a.classList.add("nav-link");
  a.setAttribute("id",`tab-${categoria.id}`);
  a.setAttribute("data-bs-toggle","tab");
  a.setAttribute("data-bs-target",`#tab-pane-${categoria.id}`);
  a.setAttribute("role","tab");
  a.setAttribute("aria-controls",`tab-pane-${categoria.id}`);
  a.setAttribute("aria-selected","false");
  a.textContent = categoria.nome;
  //Configura elemento li
  li.classList.add("nav-item");
  li.setAttribute("role","presentation"); 
  li.appendChild(a);
  ul.appendChild(li);
}

function novaTarefa(tarefa) {
  let divTabContent = document.getElementById("tarefa-tab-cont");
  let divTabPane = document.createElement('div');

  divTabPane.setAttribute("class","tab-pane fade");
  divTabPane.setAttribute("id",`tab-pane-${tarefa.id}`);
  divTabPane.setAttribute("role","tabpanel");
  divTabPane.setAttribute("aria-labelledby",`tab-${tarefa.id}`);
  divTabPane.setAttribute("tabindex","0");
  
  let divCard = document.createElement('div');
  divCard.setAttribute("class","card text-white bg-primary mb-3");
  let divCardHeader = document.createElement('div');
  divCardHeader.setAttribute("class","card-header align-middle");
  divCardHeader.textContent = tarefa.titulo;
  let button =  document.createElement('button');
  button.setAttribute("class","btn btn-danger btn-sm float-end");
  button.setAttribute("data-toggle","modal");
  button.setAttribute("data-bs-toggle","#confirmar-delecao");

  let i =  document.createElement('i');
  i.setAttribute("class","fas fa-minus");
  let small =  document.createElement('small');
  small.setAttribute("class","text-body-secondary float-end");
  small.textContent = tarefa.data_limite;  

  button.appendChild(i);
  divCardHeader.appendChild(button);
  //divCardHeader.appendChild(small);
  
  let divCardBody = document.createElement('div');
  divCardBody.setAttribute("class","card-body");

  let p = document.createElement('p');
  p.textContent = tarefa.detalhes;
  divCardBody.appendChild(p);

  divCard.appendChild(divCardHeader);
  divCard.appendChild(divCardBody);

  divTabPane.appendChild(divCard);
  divTabContent.appendChild(divTabPane);
}

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
procurarTarefas()
