/**
 * Type definitions for page props in Next.js application
 */

/**
 * PageProps interface for client components with dynamic routes
 * Use this for 'use client' components that receive route parameters
 */
export interface ClientPageProps {
  params: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * PageProps interface for server components with dynamic routes
 * Use this for async server components that receive route parameters
 */
export interface ServerPageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}