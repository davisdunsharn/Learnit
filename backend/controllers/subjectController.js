const supabase = require('../config/supabase');

// GET /api/subjects
// returns all subjects belonging to the logged-in user
const getSubjects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('getSubjects error:', err.message);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// POST /api/subjects
const createSubject = async (req, res) => {
  const { name, colour } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Subject name is required' });
  }

  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{
        user_id: req.user.id,
        name,
        colour: colour || '#6366f1'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('createSubject error:', err.message);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  const { id } = req.params;
  const { name, colour } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Subject name is required' });
  }

  try {
    // make sure the subject belongs to the logged-in user before updating
    const { data, error } = await supabase
      .from('subjects')
      .update({ name, colour })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('updateSubject error:', err.message);
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

// DELETE /api/subjects/:id
// cascades to notes and ai_results via db foreign keys
const deleteSubject = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('deleteSubject error:', err.message);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };