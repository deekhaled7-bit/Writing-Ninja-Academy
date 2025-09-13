import { NextRequest, NextResponse } from 'next/server';
import { ConnectDB } from '@/config/db';
import UserModel from '@/models/userModel';
import { hash } from 'bcryptjs';

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await ConnectDB();
    
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    // Build query
    let query: any = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await UserModel.find(query)
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    
    const body = await request.json();
    
    // Check if email already exists
    const existingUser = await UserModel.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash the password before creating the user
    if (body.password) {
      body.password = await hash(body.password, 10);
    }
    
    // Create new user
    const newUser = await UserModel.create(body);
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}