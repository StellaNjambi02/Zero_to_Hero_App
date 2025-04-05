import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// const sql = neon(
//   "postgresql://neondb_owner:npg_4WJcZ8awoOuR@ep-young-queen-a8wzguox-pooler.eastus2.azure.neon.tech/zero_to_hero?sslmode=require"
// ); //holds connection to neon database

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema }); //db object helps with db interaction through project
