import 'source-map-support/register'
import * as middy from 'middy'

import { deleteAttachment } from '../../helpers/attachmentUtil'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'


import { cors, httpErrorHandler } from 'middy/middlewares'




export const delete_handler = middy(
  async (apigateway_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Delete Attachment from db

    const todo_id = apigateway_event.pathParameters.todoId

    await deleteAttachment(todo_id)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*'
      },

      body: JSON.stringify({})

    };
  }
)

delete_handler // delete handle
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
