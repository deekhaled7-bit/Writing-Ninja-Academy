import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/authOptions';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Auth check - session:', session ? {
      ...session,
      user: {
        ...session.user,
        email: session.user.email ? '[REDACTED]' : undefined,
        id: session.user.id ? '[REDACTED]' : undefined
      }
    } : null);
    
    if (!session) {
      console.log('Auth check - No session found');
      return NextResponse.json({ isAuth: false, user: null }, { status: 401 });
    }
    
    console.log('Auth check - User role:', session.user.role);
    console.log('Auth check - User active status:', session.user.active);
    console.log('Auth check - User verified status:', session.user.verified);
    
    // Return the session user object as is, without modifying the active and verified fields
    return NextResponse.json({
      isAuth: true,
      user: session.user
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuth: false, user: null }, { status: 500 });
  }
}