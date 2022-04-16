const app = document.getElementById('app');


app.innerHTML = `
<div class="todos">
  <div class="todos-header">
    <h3 class="todos-title">Todo List</h3>
    <div>
      <p>You have <span class="todos-count">0</span> items</p>
      <button type="button" class="todos-clear" style='display: none'>Clear Completed</button>
    </div>
  </div>
  <form class="todos-form" name="todos">
    <input type="text" name="todo" placeholder="What's Next?" />
  </form>
  <ul class="todos-list"></ul>
</div>
`;

// state
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// selectors
const root = document.querySelector('.todos');
const list = root.querySelector('.todos-list');
const count = root.querySelector('.todos-count');
const clear = root.querySelector('.todos-clear');
const form = document.forms.todos;
const input = form.elements.todo;

// functions
function saveToStorage(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function rendarTodos(todos) {
  let todoString = '';
  const pendingTodos = todos.filter((todo) => !todo.complete);

  todos.forEach((todo, index) => {
    todoString += `
      <li data-id=${index}${todo.complete ? ' class="todos-complete"' : ''}>
        <input type='checkbox'${todo.complete ? ' checked' : ''}>
        <span>${todo.label}</span>
        <button type='button'></button>
      </li>
    `;
  });

  list.innerHTML = todoString;
  count.innerText = pendingTodos.length;
  clear.style.display = todos.length !== pendingTodos.length ? 'block' : 'none';
}

function addTodo(event) {
  event.preventDefault();
  const label = input.value;
  const complete = false;

  todos.push({ label, complete });
  input.value = '';
  rendarTodos(todos);
  saveToStorage(todos);
}

function updateTodo(event) {
  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  const complete = event.target.checked;

  todos = todos.map((todo, index) => {
    if (id === index) return { ...todo, complete };
    return todo;
  });

  rendarTodos(todos);
  saveToStorage(todos);
}

function editTodo(event) {
  if (event.target.nodeName.toLowerCase() !== 'span') return;

  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  const todoLabel = todos[id].label;
  const input = document.createElement('input');

  input.type = 'text';
  input.value = todoLabel;

  function handleEdit(event) {
    event.stopPropagation();
    const label = this.value;

    if (label !== todoLabel) {
      todos = todos.map((todo, index) => {
        if (id === index) return { ...todo, label };
        return todo;
      });
      rendarTodos(todos);
      saveToStorage(todos);
    }

    // clean up
    event.target.style.display = '';
    this.removeEventListener('change', handleEdit);
    this.remove();
  }

  event.target.style.display = 'none';
  event.target.parentNode.append(input);
  input.addEventListener('change', handleEdit);
  input.focus();
}

function deleteTodo(event) {
  if (event.target.nodeName.toLowerCase() !== 'button') return;
  const label = event.target.previousElementSibling.innerText;

  if (window.confirm(`Delete ${label}?`)) {
    const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
    todos = todos.filter((_, index) => !(index === id));
    rendarTodos(todos);
    saveToStorage(todos);
  }
}

function clearCompleteTodos() {
  const completeTodos = todos.filter((todo) => todo.complete).length;
  if (completeTodos === 0) return;

  if (window.confirm(`Delete ${completeTodos} todos?`)) {
    todos = todos.filter((todo) => !todo.complete);
    rendarTodos(todos);
    saveToStorage(todos);
  }
}

// init
function init() {
  rendarTodos(todos);
  // add todo
  form.addEventListener('submit', addTodo);
  // update todo
  list.addEventListener('change', updateTodo);
  // edit todo
  list.addEventListener('dblclick', editTodo);
  // delete todo
  list.addEventListener('click', deleteTodo);
  // clear completed
  clear.addEventListener('click', clearCompleteTodos);
}

init();
