import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/course.model.js';
import connectDB from '../config/db.js';

dotenv.config();

async function seed() {
  await connectDB();
  const courses = [
    { name: 'BTech', duration: 4, allowedBranches: ['CSE','ECE','ME','EE','CE','MDS','CHE','MME'] }
    // { name: 'MTech', duration: 2, allowedBranches: ['CSE','ECE','ME','EE','CE','MDS'] },
    // { name: 'MCA',  duration: 2, allowedBranches: ['MCA'] }
  ];
  for (const c of courses) {
    await Course.updateOne({ name: c.name }, c, { upsert: true });
  }
  console.log('Courses seeded');
  process.exit(0);
}

seed();