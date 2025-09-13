import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import ClassModel from "@/models/ClassModel";
import GradeModel from "@/models/GradeModel";
import UserModel from "@/models/userModel";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

// GET a single class by ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const resolvedParams = await context.params;
    const { id } = resolvedParams;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }
    
    // Get class data
    const classData = await ClassModel.findById(id)
      .populate("grade", "gradeNumber name");
      
    // Get teachers and students from UserModel
    const teachers = await UserModel.find({
      assignedClasses: id,
      role: "teacher"
    }).select("_id firstName lastName email");
    
    const students = await UserModel.find({
      assignedClasses: id,
      role: "student"
    }).select("_id firstName lastName email");
    
    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      class: {
        ...classData.toObject(),
        teachers,
        students
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// PUT update a class by ID
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const resolvedParams = await context.params;
    const { id } = resolvedParams;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const { className, section, grade, capacity, isActive, academicYear, teachers, students } = body;
    
    // Check if class exists
    const existingClass = await ClassModel.findById(id);
    
    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }
    
    // Validate grade ID if provided
    if (grade) {
      if (!mongoose.Types.ObjectId.isValid(grade)) {
        return NextResponse.json(
          { error: "Invalid grade ID format" },
          { status: 400 }
        );
      }
      
      // Check if grade exists
      const gradeExists = await GradeModel.findById(grade);
      if (!gradeExists) {
        return NextResponse.json(
          { error: "Grade not found" },
          { status: 404 }
        );
      }
    }
    
    // Check if updating to a class name that already exists in the same grade
    if ((className && className !== existingClass.className) || 
        (grade && grade !== existingClass.grade.toString())) {
      
      const duplicateClass = await ClassModel.findOne({
        _id: { $ne: id },
        className: className || existingClass.className,
        grade: grade || existingClass.grade
      });
      
      if (duplicateClass) {
        return NextResponse.json(
          { error: `Class with name ${className || existingClass.className} already exists for this grade` },
          { status: 409 }
        );
      }
    }
    
    // Validate teachers array if provided
    if (teachers && Array.isArray(teachers)) {
      for (const teacherId of teachers) {
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
          return NextResponse.json(
            { error: `Invalid teacher ID format: ${teacherId}` },
            { status: 400 }
          );
        }
      }
    }
    
    // Validate students array if provided
    if (students && Array.isArray(students)) {
      for (const studentId of students) {
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          return NextResponse.json(
            { error: `Invalid student ID format: ${studentId}` },
            { status: 400 }
          );
        }
      }
    }
    
    // Update class with provided fields (only className and grade)
    const updatedClass = await ClassModel.findByIdAndUpdate(
      id,
      {
        ...(className && { className }),
        ...(grade && { grade }),
      },
      { new: true, runValidators: true }
    )
      .populate("grade", "gradeNumber name");
      
    // Handle teachers if provided
    if (teachers && Array.isArray(teachers)) {
      // Get current teachers
      const currentTeachers = await UserModel.find({
        assignedClasses: id,
        role: "teacher"
      }).select("_id");
      
      const currentTeacherIds = currentTeachers.map(
        (teacher: any) => teacher._id.toString()
      );
      
      // Find teachers to add and remove
      const teachersToAdd = teachers.filter(
        (id: string) => !currentTeacherIds.includes(id)
      );
      const teachersToRemove = currentTeacherIds.filter(
        (id: string) => !teachers.includes(id)
      );
      
      // Add class to new teachers' assignedClasses
      if (teachersToAdd.length > 0) {
        await UserModel.updateMany(
          { _id: { $in: teachersToAdd } },
          { $addToSet: { assignedClasses: id } }
        );
      }
      
      // Remove class from removed teachers' assignedClasses
      if (teachersToRemove.length > 0) {
        await UserModel.updateMany(
          { _id: { $in: teachersToRemove } },
          { $pull: { assignedClasses: id } }
        );
      }
    }
    
    // Handle students if provided
    if (students && Array.isArray(students)) {
      // Get current students
      const currentStudents = await UserModel.find({
        assignedClasses: id,
        role: "student"
      }).select("_id");
      
      const currentStudentIds = currentStudents.map(
        (student: any) => student._id.toString()
      );
      
      // Find students to add and remove
      const studentsToAdd = students.filter(
        (id: string) => !currentStudentIds.includes(id)
      );
      const studentsToRemove = currentStudentIds.filter(
        (id: string) => !students.includes(id)
      );
      
      // Add class to new students' assignedClasses
      if (studentsToAdd.length > 0) {
        await UserModel.updateMany(
          { _id: { $in: studentsToAdd } },
          { $addToSet: { assignedClasses: id } }
        );
      }
      
      // Remove class from removed students' assignedClasses
      if (studentsToRemove.length > 0) {
        await UserModel.updateMany(
          { _id: { $in: studentsToRemove } },
          { $pull: { assignedClasses: id } }
        );
      }
    }
    
    // Get updated class data
    const updatedClassData = await ClassModel.findById(id)
      .populate("grade", "gradeNumber name");
      
    // Get teachers and students for response
    const assignedTeachers = await UserModel.find({
      assignedClasses: id,
      role: "teacher"
    }).select("_id firstName lastName email");
    
    const assignedStudents = await UserModel.find({
      assignedClasses: id,
      role: "student"
    }).select("_id firstName lastName email");
    
    return NextResponse.json({
      class: {
        ...updatedClassData.toObject(),
        teachers: assignedTeachers,
        students: assignedStudents
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update class" },
      { status: 500 }
    );
  }
}

// DELETE a class by ID
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const resolvedParams = await context.params;
    const { id } = resolvedParams;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }
    
    // Check if class exists
    const classData = await ClassModel.findById(id);
    
    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }
    
    // Remove class from all users' assignedClasses
    await UserModel.updateMany(
      { assignedClasses: id },
      { $pull: { assignedClasses: id } }
    );
    
    // Delete class
    await ClassModel.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete class" },
      { status: 500 }
    );
  }
}