'use server';
import { prisma } from '@/lib/prisma';
import { RegisterAuth } from '@/types/schema/auth';
import { User } from '@/types/schema/user';
import { hashSync } from 'bcryptjs';
import { z } from 'zod';

export type CreateUserResult = {
  success: boolean;
  message: string;
  user?: Partial<User>;
};

export default async function CreateUser({
  credentials,
}: {
  credentials: RegisterAuth;
}): Promise<CreateUserResult> {
  try {
    console.log(credentials);
    // Validate input using Zod schema
    const validatedData = {
      ...credentials,
      whatsapp: credentials.whatsapp.toString(),
    };

    // Check if user already exists
    const existingUser = await findUserByUsername(validatedData.username);
    if (existingUser) {
      return {
        success: false,
        message: 'Username sudah terpakai',
      };
    }

    // Hash password
    const hashedPassword = hashSync(validatedData.password, 10);

    // Create user
    const user = await prisma.users.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        role: 'Member',
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    });

    return {
      success: true,
      message: 'register created succesfully',
      user,
    };
  } catch (error) {
    console.error(error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors.map((err) => err.message).join(', '),
      };
    }

    // Handle unique constraint or other database errors
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || 'Failed to create user',
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

export async function findUserByUsername(username: string) {
  return await prisma.users.findUnique({
    where: { username },
    select: {
      username: true,
      name: true,
      id: true,
      createdAt: true,
      role: true,
      apiKey: true,
      updatedAt: true,
      whatsapp: true,
    },
  });
}
