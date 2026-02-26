import { Subject, StudyData, ChatResponse } from './types';
import { gemini } from './services/gemini';

export const api = {
  async upload(subject: Subject, filename: string, content: string) {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, filename, content }),
    });
    return res.json();
  },

  async chat(message: string, subject: Subject, focusLevel: number): Promise<ChatResponse> {
    try {
      const docs = await this.getDocuments(subject);
      if (docs.length === 0) {
        return { text: `I don't have any documents uploaded for **${subject}** yet. Please upload some PDF or text files using the paperclip icon so I can help you study!` };
      }
      const context = docs.map((d: any) => `File: ${d.filename}\nContent: ${d.content}`).join("\n\n---\n\n");
      return await gemini.chat(message, subject, focusLevel, context);
    } catch (error: any) {
      console.error('Frontend Chat Error:', error);
      return { error: error.message };
    }
  },

  async getStudyData(subject: Subject): Promise<StudyData> {
    const docs = await this.getDocuments(subject);
    if (docs.length === 0) {
      throw new Error("No documents found for this subject. Please upload materials first.");
    }
    const context = docs.map((d: any) => d.content).join("\n\n");
    return await gemini.generateStudyData(subject, context);
  },

  async getDocuments(subject: Subject) {
    const res = await fetch(`/api/documents/${subject}`);
    return res.json();
  },

  async search(q: string, subject: Subject) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&subject=${subject}`);
    return res.json();
  },

  async getNotes(subject: Subject) {
    const res = await fetch(`/api/notes/${subject}`);
    return res.json();
  },

  async saveNote(subject: Subject, title: string, content: string) {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, title, content }),
    });
    return res.json();
  },

  async deleteNote(id: number) {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  }
};
