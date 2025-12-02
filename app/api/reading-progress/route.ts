import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import ReadingProgress from "@/models/ReadingProgress";
import { ConnectDB } from "@/config/db";
import UserModel from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const storyId = searchParams.get("storyId");
    if (!storyId)
      return NextResponse.json({ error: "storyId required" }, { status: 400 });

    await ConnectDB();
    const progress = await ReadingProgress.findOne({
      userId: session.user.id,
      storyId,
    }).lean();
    return NextResponse.json({ progress });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { storyId, currentPage, totalPages } = body as {
      storyId: string;
      currentPage: number;
      totalPages: number;
    };

    if (
      !storyId ||
      typeof currentPage !== "number" ||
      typeof totalPages !== "number"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const clampedPage = Math.max(0, Math.min(currentPage, totalPages));

    await ConnectDB();

    // Fetch existing progress to check reward status
    const existing = await ReadingProgress.findOne({
      userId: session.user.id,
      storyId,
    });

    const isComplete = totalPages > 0 && clampedPage === totalPages;
    const shouldAward =
      isComplete &&
      session.user.role === "student" &&
      !existing?.completionRewardGranted;

    const updateFields: Record<string, any> = {
      currentPage: clampedPage,
      totalPages,
    };
    if (shouldAward) {
      updateFields.completionRewardGranted = true;
    }

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId: session.user.id, storyId },
      { $set: updateFields },
      { upsert: true, new: true }
    ).lean();

    if (shouldAward) {
      await UserModel.findByIdAndUpdate(session.user.id, {
        $inc: { ninjaGold: 10 },
      });
    }

    // Include a flag in the response so the client can show a reward popup
    return NextResponse.json({
      progress,
      awardedNinjaGold: shouldAward ? 10 : 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
