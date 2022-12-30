import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { createLogger } from '../utils/logger';

const logger = createLogger('S3 Attachment')

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
    constructor(
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    ) { }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`todo=${todo}`)
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();
        logger.info("Succeed")
        return todo as TodoItem;
    }

    async updateTodo(userId: string, id: string, todo: TodoUpdate): Promise<TodoItem> {
        logger.info(`Call updateTodo with userId=${userId}, id=${id}`)
        const params = {
            TableName: this.todosTable,
            Key: { id, userId },
            UpdateExpression: 'set #name = :updateName, #done = :doneStatus, #dueDate = :updateDueDate',
            ExpressionAttributeNames: { '#name': 'name', '#done': 'done', '#dueDate': 'dueDate' },
            ExpressionAttributeValues: {
                ':updateName': todo.name,
                ':doneStatus': todo.done,
                ':updateDueDate': todo.dueDate,
            },
            ReturnValues: "UPDATED_NEW"
        }
        const res = await this.docClient.update(params).promise();
        logger.info("Succeed")
        return res.Attributes as TodoItem;
    }

    async deleteTodo(userId: string, id: string): Promise<any> {
        logger.info(`Call deleteTodo with userId=${userId} and id=${id}`)
        const params = {
            TableName: this.todosTable,
            Key: { id, userId },
        }

        await this.docClient.delete(params).promise();
        logger.info("Succeed!")
        return;
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info(`Call getTodosForUser with userId=${userId}`)
        const params = {
            TableName: this.todosTable,
            IndexName: process.env.TODOS_DUE_DATE_INDEX,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {":userId": userId},
            ScanIndexForward: true,
        }

        const res = await this.docClient.query(
            params
        ).promise()

        const items = res.Items
        logger.info("Succeed")
        return items as TodoItem[]
    }

    async updateAttachForTodo(id: string, userId: string, attachmentUrl: string): Promise<TodoItem> {
        logger.info(`Call updateAttachForTodo with userId=${userId}`)
        const params = {
            TableName: this.todosTable,
            Key: { id, userId },
            UpdateExpression: "set attachmentUrl = :url",
            ExpressionAttributeValues: {
                ":url": attachmentUrl
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(params).promise();
        logger.info("Succeed")
        return result.Attributes as TodoItem;
    }
    async getTodoForUser(userId: string, todoId: string): Promise<TodoItem[]> {
        const params = {
            TableName: this.todosTable,
            KeyConditionExpression: "userId = :userId and id = :todoId",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":todoId": todoId,
            },
        }
        const res = await this.docClient.query(
            params
        ).promise()
        const items = res.Items
        return items as TodoItem[]
    }

}