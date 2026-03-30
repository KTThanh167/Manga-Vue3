import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmviwofzfrjulokbjylv.supabase.co'
const supabaseAnonKey = 'sb_publishable__E9GvjceRE2oxu_qm2Hhsw_gBDAgrDC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
