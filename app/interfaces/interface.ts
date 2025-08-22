export interface Story {
  _id: string;
  title: string;
  description: string;
  authorName: string;
  ageGroup: string;
  category: string;
  readCount: number;
  likeCount: number;
  createdAt: string;
  coverImageUrl: string;
  fileType: string;
  fileUrl: string;
}
