import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import UserModel from "@/models/userModel";
import Story from "@/models/Story";
import { ConnectDB } from "@/config/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Connect to database
    await ConnectDB();

    // Get total users count
    const totalUsers = await UserModel.countDocuments();

    // Get total stories count
    const totalStories = await Story.countDocuments();

    // Get teachers count
    const totalTeachers = await UserModel.countDocuments({ role: "teacher" });

    // Get students count
    const totalStudents = await UserModel.countDocuments({ role: "student" });

    // Get additional analytics
    const activeUsers = await UserModel.countDocuments({ active: true });
    const verifiedUsers = await UserModel.countDocuments({ verified: true });

    // Get recent activity (stories uploaded in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentStories = await Story.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get total reads across all stories
    const totalReadsResult = await Story.aggregate([
      {
        $group: {
          _id: null,
          totalReads: { $sum: "$readCount" },
        },
      },
    ]);
    const totalReads =
      totalReadsResult.length > 0 ? totalReadsResult[0].totalReads : 0;

    // Top stories by read count
    const topStories = await Story.find({})
      .sort({ readCount: -1 })
      .limit(5)
      .select("title readCount authorName description coverImageUrl")
      .lean();

    const stats = {
      totalUsers,
      totalStories,
      totalTeachers,
      totalStudents,
      activeUsers,
      verifiedUsers,
      recentStories,
      totalReads,
      topStories,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
