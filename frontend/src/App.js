import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setCurrentUser(savedUsername);
      fetchNotes(savedUsername);
    }
  }, []);

  const fetchNotes = async (user) => {
    try {
      const res = await axios.get(`${API_URL}/notes/${user}`);
      setNotes(res.data);
    } catch (err) {
      setError('Failed to fetch notes');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username);
      setCurrentUser(username);
      fetchNotes(username);
      setUsername('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setCurrentUser('');
    setNotes([]);
    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
  };

  const handleCreateOrUpdateNote = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingNote) {
        await axios.put(
          `${API_URL}/notes/${editingNote.id}`,
          { title: noteTitle, content: noteContent, username: currentUser }
        );
      } else {
        await axios.post(
          `${API_URL}/notes`,
          { username: currentUser, title: noteTitle, content: noteContent }
        );
      }

      setNoteTitle('');
      setNoteContent('');
      setEditingNote(null);
      fetchNotes(currentUser);
    } catch (err) {
      setError('Failed to save note');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/notes/${id}?username=${currentUser}`);
      fetchNotes(currentUser);
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  if (!currentUser) {
    return (
      <div className="App">
        <div className="auth-container">
          <h1>📝 Notes App</h1>
          <h2>Enter Your Name</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit">Start Taking Notes</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>📝 Notes App</h1>
        <div className="user-info">
          <span>Welcome, {currentUser}!</span>
          <button onClick={handleLogout}>Change User</button>
        </div>
      </header>

      <div className="container">
        <div className="note-form">
          <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleCreateOrUpdateNote}>
            <input
              type="text"
              placeholder="Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Content"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows="4"
              required
            />
            <div className="form-buttons">
              <button type="submit">
                {editingNote ? 'Update Note' : 'Create Note'}
              </button>
              {editingNote && (
                <button type="button" onClick={cancelEdit} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="notes-list">
          <h2>My Notes ({notes.length})</h2>
          {notes.length === 0 ? (
            <p className="empty-state">No notes yet. Create your first note!</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="note-card">
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <div className="note-footer">
                  <small>
                    {new Date(note.created_at).toLocaleDateString()}
                  </small>
                  <div className="note-actions">
                    <button onClick={() => handleEdit(note)}>Edit</button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
