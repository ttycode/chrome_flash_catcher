const SUPABASE_URL = 'https://rshfjjpxggleavyawppm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzaGZqanB4Z2dsZWF2eWF3cHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY0OTc4OTYsImV4cCI6MjA0MjA3Mzg5Nn0.ZmesrU78cgZJ4mvF4QN9JTFQkmq49MHi_lEDhXbcxac'

class SupabaseClient {
  constructor() {
    this.headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async saveThought(email, content) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/flash_thoughts`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email,
          content,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return { data: data[0], error: null };
      } else {
        const text = await response.text();
        return { data: { content, email }, error: null };
      }
    } catch (error) {
      console.error('Error saving thought:', error);
      return { data: null, error };
    }
  }

  async getThoughts(email) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/flash_thoughts?select=*&email=eq.${email}&order=created_at.desc`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error getting thoughts:', error);
      return { data: null, error };
    }
  }

  async updateThought(id, content) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/flash_thoughts?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            ...this.headers,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            content,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error updating thought:', error);
      return { data: null, error };
    }
  }

  async deleteThought(id) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/flash_thoughts?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            ...this.headers,
            'Prefer': 'return=representation'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error deleting thought:', error);
      return { data: null, error };
    }
  }
}

// 创建全局实例
window.supabaseClient = new SupabaseClient(); 