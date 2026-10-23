import { Router, Request, Response } from 'express';
import Project from '../models/Project';
import JobApplication from '../models/JobApplication';
import ContactMessage from '../models/ContactMessage';
import JobPosition from '../models/JobPosition';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', protect, asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const [projects, applications, messages, jobs, unreadMessages, newApplications] = await Promise.all([
    Project.countDocuments(),
    JobApplication.countDocuments(),
    ContactMessage.countDocuments(),
    JobPosition.countDocuments({ isActive: true }),
    ContactMessage.countDocuments({ isRead: false }),
    JobApplication.countDocuments({ status: 'new' }),
  ]);

  const recentApplications = await JobApplication.find().sort({ createdAt: -1 }).limit(5);
  const recentMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(5);

  res.json({
    projects,
    applications,
    messages,
    jobs,
    unreadMessages,
    newApplications,
    recentApplications,
    recentMessages,
  });
}));

export default router;
