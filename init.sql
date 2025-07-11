-- Initial database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types if needed
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;