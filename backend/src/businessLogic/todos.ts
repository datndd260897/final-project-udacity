import { TodosAccess } from '../helpers/todosAcess';

import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

import * as uuid from 'uuid';
import { createLogger } from '../utils/logger';

const logger = createLogger('todos')

const todosAccess = new TodosAccess()

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
  ): Promise<TodoItem> {
    const id = uuid.v4();
    logger.info(`createTodo id ${id}`);
    logger.info(`createTodo userId: ${userId}`)
  
    return await todosAccess.createTodo({
      id,
      userId,
      name: createTodoRequest.name,
      done: false,
      createdAt: new Date().toISOString(),
      dueDate: createTodoRequest.dueDate
    })
  }

export async function updateTodo(userId: string, id: string, payload: UpdateTodoRequest) : Promise<TodoItem>{
  logger.info(`Call updateTodo with: ${userId}, ${id}, ${payload}`)
  return todosAccess.updateTodo(userId, id, payload);
}

export async function deleteTodo(userId: string, id: string) : Promise<void>{
  logger.info(`Call deleteTodo with: ${userId}, ${id}}`)
  return todosAccess.deleteTodo(userId, id);
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info(`Call getTodosForUser with: ${userId}`)
  return todosAccess.getTodosForUser(userId);
}

export async function getTodoForUser(userId: string, id: string): Promise<TodoItem[]> {
  logger.info(`Call getTodoForUser with: ${userId}`)
  return todosAccess.getTodoForUser(userId, id);
}