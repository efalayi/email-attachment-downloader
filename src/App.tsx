import React, { PureComponent } from 'react';

import { authenticateUser, getCurrentUserProfile, getUserEmails, getAllEmailAttachments, loadGAPI } from './api/google';
import { downloadFile } from './api/download';

import './styles/App.css';

interface Props {}

interface State {
  loading: boolean;
  errorMessage: string;
  user?: {
    name: string;
    email: string;
  } | null
}

class App extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      errorMessage: '',
      user: null
    }
  }
  async componentDidMount() {
    this.setState({ loading: true })
    try {
      await loadGAPI();
      const currentUser = await getCurrentUserProfile();
      this.setState({ user: currentUser, loading: false })
    } catch ({ error }) {
      console.log('state error: ', error);
      this.setState({ errorMessage: error, loading: false })
    }
  }
  handleGmailButtonClick = () => {
    authenticateUser();
  }

  getEmailAttachments = async () => {
    try {
      const queryString = 'from:ecnwokolo@gmail.com';
      const { emails } = await getUserEmails(queryString);
      const attachments = await getAllEmailAttachments(emails);
      console.log('attachments: ', attachments);
      await downloadFile('sample', 'pdf', attachments[8][0].data);
    } catch (error) {
      this.setState({ errorMessage: error, loading: false })
    }
  }

  renderAuthView = () => {
    const { loading, user } = this.state;

    if (loading) {
      return <small>Loading...</small>
    }
    if (!loading && user) {
      return (
        <div>
          <small>{`Email: ${user.email}`}</small>
          <button id="authorize_button" onClick={this.getEmailAttachments}>
            Get Attachments
          </button>
        </div>
      )
    }
    if (!loading && !user) {
      return <button id="authorize_button" onClick={this.handleGmailButtonClick}>GMAIL</button>
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p className="App-link">
            Email Attachment Downloader
          </p>

          {this.state.errorMessage && (<small>{this.state.errorMessage}</small>)}

          {this.renderAuthView()}
        </header>
      </div>
    );
  }
}

export default App;
