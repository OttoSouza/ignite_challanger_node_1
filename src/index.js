const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware -> ele é responsavel por realizar uma açao antes de chegar no servidor
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  // verificar se o usuario ja existe
  // Metodo find, se o usuario que esta salvo no array for igual ao usuario informado na requisicao é pq ele existe
  // LowerCase é para transformar uma string em minusculo;
  const user = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    return response.status(400).json({ erro: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  // obtendo os dados que foi requisitado
  const { name, username } = request.body;
  // verificar se o usuario ja existe
  // Metodo find, se o usuario que esta salvo no array for igual ao usuario informado na requisicao é pq ele existe
  // LowerCase é para transformar uma string em minusculo;
  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const newUser = {
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const updateTodo = user.todos.find((todo) => todo.id === id);

  if(!updateTodo) {
    return response.status(404).json({error: "Todo not found"})
  }

  updateTodo.title = title;
  updateTodo.deadline = new Date(deadline);

  return response.json(updateTodo);

});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const updateDoneTodo = user.todos.find((todo) => todo.id === id);

  if(!updateDoneTodo) {
    return response.status(404).json({error: "Todo not found"})
  }
  updateDoneTodo.done = true;

  return response.json(updateDoneTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const deleleTodo = user.todos.findIndex((todo) => todo.id === id);

  if(deleleTodo === -1) {
    return response.status(404).json({error: "Todo not found"})
  }

  user.todos.splice(deleleTodo, 1)


  return response.status(204).json()
});

module.exports = app;
