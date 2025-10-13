import { NextRequest, NextResponse } from 'next/server';
import { ConnectDB } from '@/config/db';
import UserModel from '@/models/userModel';
import mongoose from 'mongoose';

// GET /api/admin/users/[id]/details - Get a user with grade and class details
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await ConnectDB();
    
    const resolvedParams = await context.params;
    const { id } = resolvedParams;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Find user and populate grade and classes
    const user = await UserModel.findById(id)
      .select('-password')
      .populate('grade', 'name gradeNumber')
      .populate('assignedClasses', 'name');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}