const supabase = require('../config/supabase');

// GET /api/notes
// optional query param: ?subject_id=xxx to filter by subject
const getNotes = async (req, res) => {
  try {
    let query = supabase
      .from('notes')
      .select(`
        *,
        subjects (id, name, colour)
      `)
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    // filter by subject if provided
    if (req.query.subject_id) {
      query = query.eq('subject_id', req.query.subject_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('getNotes error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

// POST /api/notes
const createNote = async (req, res) => {
  const { title, content, subject_id } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: req.user.id,
        subject_id: subject_id || null,
        title,
        content
      }])
      .select(`
        *,
        subjects (id, name, colour)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('createNote error:', err.message);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

// PUT /api/notes/:id
const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, subject_id } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .update({
        title,
        content,
        subject_id: subject_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id) // ensure user owns this note
      .select(`
        *,
        subjects (id, name, colour)
      `)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('updateNote error:', err.message);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

// DELETE /api/notes/:id
// ai_results linked to this note get cleaned up via db cascade
const deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('deleteNote error:', err.message);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };