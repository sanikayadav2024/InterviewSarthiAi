// utils/db.js
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'; // Your tables

// Initialize Neon client
const sql = neon("postgresql://neondb_owner:npg_c0tAwXmZuED5@ep-steep-hat-ad2qgey7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

// Initialize Drizzle ORM with schema
export const db = drizzle(sql, { schema });

