import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodoForUser as getTodoForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const user_id = getUserId(event);
    const todo_id = event.pathParameters.todoId
    const res = await getTodoForUser(user_id, todo_id);
    return {
      statusCode: 200,
      body: JSON.stringify({
        "items": res
      })
    }
  }
)


handler
  .use(httpErrorHandler())
  .use(
  cors({
    credentials: true
  })
)
