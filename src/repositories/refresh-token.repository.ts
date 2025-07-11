import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { refreshTokens, RefreshToken, NewRefreshToken } from '../db/schema';

export class RefreshTokenRepository {
  async create(tokenData: NewRefreshToken): Promise<RefreshToken> {
    const [token] = await db.insert(refreshTokens).values(tokenData).returning();
    if (!token) throw new Error('Failed to create refresh token');
    return token;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const [refreshToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    return refreshToken || null;
  }


  async delete(token: string): Promise<boolean> {
    const result = await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    return (result.rowCount || 0) > 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    return (result.rowCount || 0) > 0;
  }

}