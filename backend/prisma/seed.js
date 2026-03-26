import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduMesh database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // ─── Users ──────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: 'admin@edumesh.org' },
    update: {},
    create: {
      email: 'admin@edumesh.org',
      passwordHash,
      role: 'ADMIN',
      profile: { create: { displayName: 'Platform Admin', language: 'en' } },
    },
  });

  const ngoUser = await prisma.user.upsert({
    where: { email: 'ngo@unicef.org' },
    update: {},
    create: {
      email: 'ngo@unicef.org',
      passwordHash,
      role: 'NGO',
      profile: { create: { displayName: 'UNICEF Education', language: 'en', location: { lat: 40.7, lng: -74.0, country: 'USA', region: 'New York' } } },
    },
  });

  // Students
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'priya@student.in' },
      update: {},
      create: {
        email: 'priya@student.in', passwordHash, role: 'STUDENT',
        profile: { create: { displayName: 'Priya Sharma', language: 'hi', gradeLevel: 7, location: { lat: 28.6, lng: 77.2, country: 'India', region: 'Delhi' } } },
      },
    }),
    prisma.user.upsert({
      where: { email: 'amina@student.ng' },
      update: {},
      create: {
        email: 'amina@student.ng', passwordHash, role: 'STUDENT',
        profile: { create: { displayName: 'Amina Okafor', language: 'en', gradeLevel: 5, location: { lat: 6.5, lng: 3.4, country: 'Nigeria', region: 'Lagos' } } },
      },
    }),
    prisma.user.upsert({
      where: { email: 'rashid@student.bd' },
      update: {},
      create: {
        email: 'rashid@student.bd', passwordHash, role: 'STUDENT',
        profile: { create: { displayName: 'Rashid Islam', language: 'bn', gradeLevel: 8, location: { lat: 23.8, lng: 90.4, country: 'Bangladesh', region: 'Dhaka' } } },
      },
    }),
    prisma.user.upsert({
      where: { email: 'fatima@student.eg' },
      update: {},
      create: {
        email: 'fatima@student.eg', passwordHash, role: 'STUDENT',
        profile: { create: { displayName: 'Fatima Hassan', language: 'ar', gradeLevel: 6, location: { lat: 30.0, lng: 31.2, country: 'Egypt', region: 'Cairo' } } },
      },
    }),
    prisma.user.upsert({
      where: { email: 'juma@student.tz' },
      update: {},
      create: {
        email: 'juma@student.tz', passwordHash, role: 'STUDENT',
        profile: { create: { displayName: 'Juma Mwangi', language: 'sw', gradeLevel: 4, location: { lat: -6.8, lng: 39.3, country: 'Tanzania', region: 'Dar es Salaam' } } },
      },
    }),
  ]);

  // Mentors
  const mentors = await Promise.all([
    prisma.user.upsert({
      where: { email: 'dr.kumar@mentor.in' },
      update: {},
      create: {
        email: 'dr.kumar@mentor.in', passwordHash, role: 'MENTOR',
        profile: { create: { displayName: 'Dr. Arun Kumar', language: 'hi', isOnline: true, location: { lat: 19.1, lng: 72.9, country: 'India', region: 'Mumbai' } } },
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah@mentor.uk' },
      update: {},
      create: {
        email: 'sarah@mentor.uk', passwordHash, role: 'MENTOR',
        profile: { create: { displayName: 'Sarah Thompson', language: 'en', isOnline: true, location: { lat: 51.5, lng: -0.1, country: 'UK', region: 'London' } } },
      },
    }),
    prisma.user.upsert({
      where: { email: 'yusuf@mentor.ke' },
      update: {},
      create: {
        email: 'yusuf@mentor.ke', passwordHash, role: 'MENTOR',
        profile: { create: { displayName: 'Yusuf Abdi', language: 'sw', isOnline: false, location: { lat: -1.3, lng: 36.8, country: 'Kenya', region: 'Nairobi' } } },
      },
    }),
  ]);

  // ─── Learner Profiles ───────────────────────────────────

  for (const student of students) {
    await prisma.learnerProfile.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        knowledgeMap: {
          Mathematics: { fractions: 0.8, algebra: 0.3, geometry: 0.6 },
          Science: { biology: 0.5, physics: 0.2, chemistry: 0.4 },
          English: { reading: 0.7, writing: 0.4, grammar: 0.6 },
        },
        learningStyle: ['visual', 'auditory', 'kinesthetic', 'reading'][Math.floor(Math.random() * 4)],
        pace: [0.8, 1.0, 1.2][Math.floor(Math.random() * 3)],
        weeklyGoalMins: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
        streakDays: Math.floor(Math.random() * 30),
        totalMinutes: Math.floor(Math.random() * 500 + 100),
      },
    });
  }

  // ─── Content ────────────────────────────────────────────

  const contentData = [
    { title: 'Introduction to Fractions', body: 'Fractions represent parts of a whole. When we divide something into equal parts, each part is a fraction...', type: 'ARTICLE', subject: 'Mathematics', topic: 'fractions', gradeLevel: 5, language: 'en', durationMins: 15, tags: ['math', 'fractions', 'beginner'] },
    { title: 'Understanding Algebra Basics', body: 'Algebra uses letters and symbols to represent numbers and quantities in formulas and equations...', type: 'VIDEO', subject: 'Mathematics', topic: 'algebra', gradeLevel: 7, language: 'en', durationMins: 20, tags: ['math', 'algebra'] },
    { title: 'Geometry: Shapes and Angles', body: 'Geometry is the branch of mathematics that studies shapes, sizes, and positions of figures...', type: 'EXERCISE', subject: 'Mathematics', topic: 'geometry', gradeLevel: 6, language: 'en', durationMins: 25, tags: ['math', 'geometry'] },
    { title: 'भिन्नों का परिचय', body: 'भिन्न एक पूर्ण के भागों को दर्शाते हैं। जब हम किसी चीज़ को बराबर भागों में विभाजित करते हैं...', type: 'ARTICLE', subject: 'Mathematics', topic: 'fractions', gradeLevel: 5, language: 'hi', durationMins: 15, tags: ['math', 'fractions'] },
    { title: 'مقدمة في الكسور', body: 'الكسور تمثل أجزاء من الكل. عندما نقسم شيئاً إلى أجزاء متساوية...', type: 'ARTICLE', subject: 'Mathematics', topic: 'fractions', gradeLevel: 5, language: 'ar', durationMins: 15, tags: ['math', 'fractions'] },
    { title: 'Cell Biology Basics', body: 'All living things are made of cells. Cells are the basic building blocks of life...', type: 'ARTICLE', subject: 'Science', topic: 'biology', gradeLevel: 6, language: 'en', durationMins: 20, tags: ['science', 'biology', 'cells'] },
    { title: 'Introduction to Physics: Forces', body: 'A force is a push or pull on an object. Forces can make things move, stop, or change direction...', type: 'VIDEO', subject: 'Science', topic: 'physics', gradeLevel: 7, language: 'en', durationMins: 25, tags: ['science', 'physics', 'forces'] },
    { title: 'Chemistry: Elements and Atoms', body: 'Everything around us is made of atoms. An atom is the smallest unit of an element...', type: 'QUIZ', subject: 'Science', topic: 'chemistry', gradeLevel: 8, language: 'en', durationMins: 15, tags: ['science', 'chemistry'] },
    { title: 'Reading Comprehension Skills', body: 'Reading comprehension means understanding what you read. Active reading strategies help you...', type: 'ARTICLE', subject: 'English', topic: 'reading', gradeLevel: 5, language: 'en', durationMins: 20, tags: ['english', 'reading'] },
    { title: 'Essay Writing Guide', body: 'A good essay has three parts: introduction, body, and conclusion. Start with a thesis statement...', type: 'EXERCISE', subject: 'English', topic: 'writing', gradeLevel: 7, language: 'en', durationMins: 30, tags: ['english', 'writing'] },
    { title: 'Grammar: Parts of Speech', body: 'Every word in a sentence has a role. Nouns name things, verbs show action, adjectives describe...', type: 'QUIZ', subject: 'English', topic: 'grammar', gradeLevel: 6, language: 'en', durationMins: 15, tags: ['english', 'grammar'] },
    { title: 'Understanding Democracy', body: 'Democracy is a system of government where citizens exercise power by voting. Key principles include...', type: 'ARTICLE', subject: 'Civic Education', topic: 'democracy', gradeLevel: 7, language: 'en', durationMins: 20, tags: ['civic', 'democracy'] },
    { title: 'Your Rights as a Citizen', body: 'Every citizen has fundamental rights protected by the constitution. These include freedom of speech...', type: 'VIDEO', subject: 'Civic Education', topic: 'rights', gradeLevel: 8, language: 'en', durationMins: 18, tags: ['civic', 'rights'] },
    { title: 'How Laws Are Made', body: 'The legislative process involves several steps: a bill is proposed, debated, amended, and voted on...', type: 'ARTICLE', subject: 'Civic Education', topic: 'legislation', gradeLevel: 9, language: 'en', durationMins: 22, tags: ['civic', 'law'] },
    { title: 'Utangulizi wa Saiyansi', body: 'Saiyansi ni utafiti wa ulimwengu wa asili kwa kutumia uchunguzi na majaribio...', type: 'ARTICLE', subject: 'Science', topic: 'introduction', gradeLevel: 4, language: 'sw', durationMins: 15, tags: ['science', 'introduction'] },
    { title: 'বিজ্ঞানের ভূমিকা', body: 'বিজ্ঞান হল প্রাকৃতিক জগতের পদ্ধতিগত অধ্যয়ন। পর্যবেক্ষণ এবং পরীক্ষা-নিরীক্ষা ব্যবহার করে...', type: 'ARTICLE', subject: 'Science', topic: 'introduction', gradeLevel: 5, language: 'bn', durationMins: 15, tags: ['science', 'introduction'] },
    { title: 'Mental Math Tricks', body: 'Speed up your calculations with these mental math techniques. Multiply by 11, square numbers ending in 5...', type: 'PODCAST', subject: 'Mathematics', topic: 'arithmetic', gradeLevel: 6, language: 'en', durationMins: 12, tags: ['math', 'mental-math'] },
    { title: 'The Water Cycle', body: 'Water moves through the Earth in a continuous cycle: evaporation, condensation, precipitation, collection...', type: 'VIDEO', subject: 'Science', topic: 'earth-science', gradeLevel: 5, language: 'en', durationMins: 18, tags: ['science', 'water-cycle'] },
    { title: 'Creative Writing Workshop', body: 'Unleash your creativity! Learn to write compelling stories with vivid characters and exciting plots...', type: 'EXERCISE', subject: 'English', topic: 'creative-writing', gradeLevel: 7, language: 'en', durationMins: 35, tags: ['english', 'creative-writing'] },
    { title: 'Voting and Elections', body: 'Elections are a key part of democracy. Learn how to participate, understand ballots, and the importance of every vote...', type: 'QUIZ', subject: 'Civic Education', topic: 'elections', gradeLevel: 8, language: 'en', durationMins: 20, tags: ['civic', 'elections', 'voting'] },
  ];

  for (const item of contentData) {
    await prisma.content.create({ data: item });
  }

  // ─── Learning Sessions ──────────────────────────────────

  const allContent = await prisma.content.findMany();
  for (let i = 0; i < 10; i++) {
    const student = students[i % students.length];
    const content = allContent[i % allContent.length];
    const durationSecs = Math.floor(Math.random() * 1800 + 300);

    await prisma.learningSession.create({
      data: {
        studentId: student.id,
        contentId: content.id,
        startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        endedAt: new Date(),
        durationSecs,
        completionPct: Math.floor(Math.random() * 60 + 40),
        quizScore: content.type === 'QUIZ' ? Math.floor(Math.random() * 40 + 60) : null,
        wasOffline: Math.random() > 0.7,
      },
    });
  }

  // ─── Credentials ────────────────────────────────────────

  await prisma.credential.create({
    data: {
      studentId: students[0].id,
      subject: 'Mathematics',
      level: 'Intermediate',
      metadataJson: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'EduMeshCredential'],
        issuer: 'did:edumesh:platform',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: `did:edumesh:student:${students[0].id}`,
          achievement: { type: 'LearningAchievement', name: 'Mathematics — Intermediate' },
        },
      },
    },
  });

  await prisma.credential.create({
    data: {
      studentId: students[1].id,
      subject: 'English',
      level: 'Beginner',
      metadataJson: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'EduMeshCredential'],
        issuer: 'did:edumesh:platform',
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: `did:edumesh:student:${students[1].id}`,
          achievement: { type: 'LearningAchievement', name: 'English — Beginner' },
        },
      },
    },
  });

  console.log('✅ Seed complete!');
  console.log(`   👤 ${students.length + mentors.length + 2} users`);
  console.log(`   📚 ${contentData.length} content items`);
  console.log(`   📝 10 learning sessions`);
  console.log(`   🏆 2 credentials`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Seed error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
