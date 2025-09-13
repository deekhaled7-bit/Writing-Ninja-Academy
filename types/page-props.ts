/**
 * Type definitions for page props in Next.js application
 */

/**
 * PageProps interface for Next.js internal type checking
 * This is used by Next.js to validate page props
 */
export interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * PageProps interface for client components with dynamic routes
 * Use this for 'use client' components that receive route parameters
 */
export interface ClientPageProps extends PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * RouteContext interface for API routes
 */
export interface RouteContext {
  params: Promise<{ [key: string]: string }>;
}

/**
 * PageProps interface for server components with dynamic routes
 * Use this for async server components that receive route parameters
 */
export interface ServerPageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}