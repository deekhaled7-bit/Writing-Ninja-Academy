import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/authOptions';
import SessionModel from '@/models/sessionsModel';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session && session.user?.id) {
      // Clear the session from our database
      await SessionModel.findOneAndDelete({ userId: session.user.id });
      
      // Return success response instead of redirect
      // NextAuth signOut will handle the redirect
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}