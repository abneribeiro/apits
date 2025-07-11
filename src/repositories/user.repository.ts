import { eq, and, count, desc, asc } from 'drizzle-orm';
import { db } from '../db/connection';
import { users, User, NewUser } from '../db/schema';
import { PaginationOptions, PaginatedResponse } from '../types';

export class UserRepository {
  async create(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResponse<User>> {
    const { page, limit, orderBy = 'createdAt', order = 'desc' } = options;
    const offset = (page - 1) * limit;

    const orderDirection = order === 'asc' ? asc : desc;
    let orderColumn;
    switch (orderBy) {
      case 'updatedAt':
        orderColumn = users.updatedAt;
        break;
      case 'email':
        orderColumn = users.email;
        break;
      case 'username':
        orderColumn = users.username;
        break;
      default:
        orderColumn = users.createdAt;
    }

    const [totalResult] = await db.select({ count: count() }).from(users);
    const total = totalResult?.count || 0;

    const data = await db
      .select()
      .from(users)
      .orderBy(orderDirection(orderColumn))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, userData: Partial<NewUser>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    return !!user;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
    return !!user;
  }


  async deactivateUser(id: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async activateUser(id: string): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }
}