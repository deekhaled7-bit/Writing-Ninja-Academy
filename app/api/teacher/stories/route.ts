import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import dbConnect from "@/lib/mongodb";
import mongoose from 'mongoose';

// GET stories from students in teacher's assigned classes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Unauthorized. Teacher access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get teacher's ID from session
    const teacherId = session.user.id;

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Find the teacher's assigned classes
    const teacher = await UserModel.findById(teacherId);
    
    if (!teacher || !teacher.assignedClasses || teacher.assignedClasses.length === 0) {
      return NextResponse.json({ stories: [], pagination: { currentPage: page, totalPages: 0, totalStories: 0 } }, { status: 200 });
    }

    // Find students in teacher's assigned classes
    const students = await UserModel.find({
      assignedClasses: { $in: teacher.assignedClasses },
      role: "student"
    }).select("_id");

    const studentIds = students.map(student => student._id);

    // Build query to find stories by these students
    const query: any = { author: { $in: studentIds } };

    // Add search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { authorName: searchRegex },
      ];
    }

    // Add status filter if provided
    if (status && status !== "all") {
      if (status === "published") {
        query.isPublished = true;
      } else if (status === "review") {
        query.isPublished = false;
        query.status = "waiting_revision";
      } else if (status === "draft") {
        query.isPublished = false;
      }
    }

    // Get total count for pagination
    const totalStories = await Story.countDocuments(query);
    const totalPages = Math.ceil(totalStories / limit);

    // Fetch stories with pagination
    const stories = await Story.find(query)
      .populate("author", "firstName lastName assignedClasses")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get class information for each student
    const classIds = stories.reduce((ids: Set<string>, story: any) => {
      if (story.author && story.author.assignedClasses && story.author.assignedClasses.length > 0) {
        story.author.assignedClasses.forEach((classId: any) => ids.add(classId.toString()));
      }
      return ids;
    }, new Set<string>());

    // Fetch class and grade information
    await dbConnect();
    const ClassModel = mongoose.models.Class || mongoose.model('Class');
    const classes = await Promise.all(
      Array.from(classIds).map(async (classId: string) => {
        const classInfo = await ClassModel.findById(classId).populate('grade').lean();
        return classInfo;
      })
    );

    // Create a map of class information for quick lookup
    interface ClassInfo {
      className: string;
      gradeName: string;
      gradeNumber: number | string;
    }
    
    interface ClassMap {
      [key: string]: ClassInfo;
    }
    
    const classMap = classes.reduce<ClassMap>((map: ClassMap, classInfo: any) => {
      if (classInfo) {
        map[classInfo._id.toString()] = {
          className: classInfo.className,
          gradeName: classInfo.grade ? classInfo.grade.name : '',
          gradeNumber: classInfo.grade ? classInfo.grade.gradeNumber : ''
        };
      }
      return map;
    }, {});

    // Format stories for response
    const formattedStories = stories.map(story => {
      // Find the class info for this student
      let classGradeInfo = { className: '', gradeName: '' };
      
      if (story.author && story.author.assignedClasses && story.author.assignedClasses.length > 0) {
        const studentClassId = story.author.assignedClasses[0].toString();
        classGradeInfo = classMap[studentClassId] || { className: '', gradeName: '' };
      }
      
      return {
        id: story._id,
        title: story.title,
        student: story.authorName || (story.author ? `${story.author.firstName} ${story.author.lastName}` : 'Unknown'),
        className: classGradeInfo.className,
        gradeName: classGradeInfo.gradeName,
        status: story.isPublished ? 'published' : (story.status === 'waiting_revision' ? 'review' : 'draft'),
        submittedAt: new Date(story.createdAt).toISOString().split('T')[0],
      };
    });

    return NextResponse.json({
      stories: formattedStories,
      pagination: {
        currentPage: page,
        totalPages,
        totalStories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stories" },
      { status: 500 }
    );
  }
}