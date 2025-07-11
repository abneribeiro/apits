#!/bin/bash

echo "🐳 Starting PostgreSQL database..."
docker-compose up -d postgres

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔄 Running database migrations..."
npm run db:generate
npm run db:migrate

echo "🌱 Seeding database..."
npm run db:seed

echo "🚀 Starting development server..."
npm run dev