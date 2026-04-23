import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: { name } }
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single()
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function saveProfile(userId, profile) {
  const { error } = await supabase
    .from('profiles').upsert({ id: userId, ...profile, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function loadTasks(userId) {
  const { data, error } = await supabase
    .from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function saveTask(userId, task) {
  const { error } = await supabase
    .from('tasks').upsert({ ...task, user_id: userId, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function deleteTask(userId, taskId) {
  const { error } = await supabase
    .from('tasks').delete().eq('id', taskId).eq('user_id', userId)
  if (error) throw error
}
