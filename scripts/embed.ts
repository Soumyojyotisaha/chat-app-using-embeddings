import { PGEssay, PGJSON } from "@/types";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import OpenAI from 'openai'; // Importing OpenAI from the updated package
loadEnvConfig("");

const generateEmbeddings = async (essays: PGEssay[]) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  for (let i = 0; i < essays.length; i++) {
    const section = essays[i];
    for (let j = 0; j < section.chunks.length; j++) {
      const chunk = section.chunks[j];
      
      const { essay_title, essay_url, essay_date, essay_thanks, content, content_length, content_tokens } = chunk;

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: content
      }) ;

      const [{ embedding }] = embeddingResponse.data;
      const { data, error } = await supabase
        .from('test_pg')
        .insert({
          essay_title,
          essay_url,
          essay_date,
          content,
          content_tokens,
          embedding
        })
        .select("*");

      if (error) {
        console.log('error');
      } else {
        console.log('saved', i, j);
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
}

(async () => {
  const json: PGJSON = JSON.parse(fs.readFileSync('scripts/pg.json', 'utf8'))
  await generateEmbeddings(json.essays)
})();
