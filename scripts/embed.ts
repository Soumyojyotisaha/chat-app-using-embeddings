import { loadEnvConfig } from "@next/env";
import { PGEssay, PGJSON, PGChunk } from "@/types";
import fs from 'fs';
import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";

loadEnvConfig("");

// interface EmbeddingResponse {
//   data: {
//     data: {
//       embedding: any; // Replace 'any' with the actual type of the embedding
//     }[];
//   };
// }

const generateEmbeddings = async (essays: PGEssay[]) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];
    for (let j = 0; j < essay.chunks.length; j++) {
      const chunk = essay.chunks[j] as PGChunk;

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk.content
      }) ;

      const [{ embedding }] = embeddingResponse.data;
      const { data, error } = await supabase
        .from('paul_graham')
        .insert({
          essay_title: chunk.essay_title,
          essay_url: chunk.essay_url,
          essay_date: chunk.essay_date,
          content: chunk.content,
          content_tokens: chunk.content_tokens,
          embedding
        })
        .select("*");

      if (error) {
        console.log('error');
      } else {
        console.log('saved', i, j);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
}

(async () => {
  const json: PGJSON = JSON.parse(fs.readFileSync('scripts/pg.json', 'utf8'))
  await generateEmbeddings(json.essays)
})();
