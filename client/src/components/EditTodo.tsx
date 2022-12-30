import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, getTodo, patchTodo } from '../api/todos-api'
import { Todo } from '../types/Todo'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  todo: Todo
  file: any
  uploadState: UploadState
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    todo: {
      name: ""
    } as Todo,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  async componentDidMount() {
    try {
      const todo: Todo[] = await getTodo(this.props.auth.getIdToken(), this.props.match.params.todoId)
      this.setState({todo: todo[0]})
      console.log("todo", this.state.todo)
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleTodoNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value
    if (!name) return

    this.setState(prevState => ({
      todo: {                   // object that we want to update
          ...prevState.todo,    // keep all other key-value pairs
          name: name       // update the value of specific key
      }
  }))
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)
      console.log("uploadUrl", uploadUrl)

      this.setUploadState(UploadState.UploadingFile)
      console.log("state.name ", this.state.todo.name)
      await uploadFile(uploadUrl, this.state.file)
      await patchTodo(this.props.auth.getIdToken(), this.state.todo.id, {
        name: this.state.todo.name,
        dueDate: this.state.todo.dueDate,
        done: this.state.todo.done
      })

      alert('Item saved')
    } catch (e) {
      alert('Could not save item: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Edit</h1>

        <Form onSubmit={this.handleSubmit}>
        <Form.Field>
            <label>Name</label>
            <input
              type="text"
              defaultValue={this.state.todo.name}
              placeholder={this.state.todo.name}
              onChange={this.handleTodoNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Save
        </Button>
      </div>
    )
  }
}
