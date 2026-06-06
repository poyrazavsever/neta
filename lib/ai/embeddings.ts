import { embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';

export async function generateEmbedding(text: string, provider: string, apiKey: string) {
  let embeddingModel;

  if (provider === 'google' && apiKey) {
    const google = createGoogleGenerativeAI({ apiKey });
    embeddingModel = google.textEmbeddingModel('text-embedding-004');
  } else if (apiKey) {
    const openai = createOpenAI({ apiKey });
    embeddingModel = openai.embedding('text-embedding-3-small');
  } else {
    throw new Error('Geçerli bir API Anahtarı bulunamadı.');
  }

  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });

  return embedding;
}

export async function saveDocumentEmbedding(
  userId: string,
  content: string,
  metadata: Record<string, any>,
  provider: string,
  apiKey: string
) {
  const embedding = await generateEmbedding(content, provider, apiKey);
  const supabase = await createClient();

  const { error } = await supabase.from('document_embeddings').insert({
    user_id: userId,
    content,
    metadata,
    embedding,
  });

  if (error) {
    console.error('Embedding kayıt hatası:', error);
    throw new Error('Embedding kaydedilemedi.');
  }
}

export async function searchSimilarDocuments(
  userId: string,
  query: string,
  provider: string,
  apiKey: string,
  matchCount: number = 5
) {
  const queryEmbedding = await generateEmbedding(query, provider, apiKey);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    filter_user_id: userId,
  });

  if (error) {
    console.error('Vektör arama hatası:', error);
    return [];
  }

  return data;
}
