import {
  Course,
  CourseDetail,
  Lesson,
  CourseMaterial,
  Topic,
  Session,
  GamificationProfile,
  StudentProfile,
  QuizQuestion,
  Flashcard,
  AnywhereDoorItem
} from '../types';

const STORAGE_KEYS = {
  COURSES: 'doremon_lms_courses_v2',
  COURSE_DETAIL_PREFIX: 'doremon_lms_detail_',
  LESSON_PREFIX: 'doremon_lms_lesson_',
  GAMIFICATION: 'doremon_lms_gamification',
  STUDENT_NAME: 'doremon_student_name',
};

export const localStore = {
  getCourses(): Course[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveCourses(courses: Course[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (e) {
      console.warn('Failed to save courses to localStorage', e);
    }
  },

  createSubject(title: string, description?: string): { id: string; title: string; description: string } {
    const courses = this.getCourses();
    const id = `subj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newCourse: Course = {
      id,
      title: title.trim(),
      description: description || 'Custom Subject',
      filename: '',
      file_type: 'pptx',
      status: 'ready',
      status_message: 'Subject ready for study materials',
      progress_percent: 0,
      total_units: 0,
      topic_count: 0,
      completed_topics_count: 0,
      created_at: new Date().toISOString(),
    };

    const updatedCourses = [newCourse, ...courses.filter((c) => c.id !== id)];
    this.saveCourses(updatedCourses);

    const emptyDetail: CourseDetail = {
      ...newCourse,
      sessions: [],
      materials: [],
      coverage_checklist: [],
    };
    this.saveCourseDetail(id, emptyDetail);

    return { id, title: newCourse.title, description: newCourse.description };
  },

  getCourseDetail(courseId: string): CourseDetail {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COURSE_DETAIL_PREFIX + courseId);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }

    const course = this.getCourses().find((c) => c.id === courseId);
    return {
      id: courseId,
      title: course?.title || 'Subject',
      description: course?.description || '',
      filename: course?.filename || '',
      file_type: course?.file_type || 'pptx',
      status: 'ready',
      status_message: 'Ready for learning',
      progress_percent: 0,
      total_units: 0,
      topic_count: 0,
      completed_topics_count: 0,
      created_at: course?.created_at || new Date().toISOString(),
      sessions: [],
      materials: [],
      coverage_checklist: [],
    };
  },

  saveCourseDetail(courseId: string, detail: CourseDetail) {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSE_DETAIL_PREFIX + courseId, JSON.stringify(detail));
      const courses = this.getCourses();
      const idx = courses.findIndex((c) => c.id === courseId);
      const totalTopics = detail.sessions?.reduce((sum, s) => sum + (s.topics?.length || 0), 0) || 0;
      if (idx !== -1) {
        courses[idx] = {
          ...courses[idx],
          title: detail.title,
          filename: detail.filename,
          file_type: detail.file_type,
          topic_count: totalTopics,
          total_units: detail.total_units || totalTopics,
          status: detail.status,
        };
      } else {
        courses.unshift({
          id: courseId,
          title: detail.title,
          description: detail.description,
          filename: detail.filename,
          file_type: detail.file_type,
          status: detail.status,
          progress_percent: detail.progress_percent,
          total_units: detail.total_units || totalTopics,
          topic_count: totalTopics,
          completed_topics_count: 0,
          created_at: detail.created_at || new Date().toISOString(),
        });
      }
      this.saveCourses(courses);
    } catch (e) {
      console.warn('Failed to save course detail to localStorage', e);
    }
  },

  deleteCourse(courseId: string) {
    const courses = this.getCourses().filter((c) => c.id !== courseId);
    this.saveCourses(courses);
    try {
      localStorage.removeItem(STORAGE_KEYS.COURSE_DETAIL_PREFIX + courseId);
    } catch {
      // ignore
    }
  },

  deleteMaterial(courseId: string, materialId?: string) {
    const detail = this.getCourseDetail(courseId);
    const updatedMaterials = (detail.materials || []).filter((m) => m.id !== materialId);

    if (updatedMaterials.length === 0) {
      detail.materials = [];
      detail.sessions = [];
      detail.filename = '';
      detail.total_units = 0;
      detail.status_message = 'No study materials uploaded yet.';
    } else {
      detail.materials = updatedMaterials;
      detail.sessions = detail.sessions.filter((s) => s.id !== materialId);
    }

    this.saveCourseDetail(courseId, detail);
  },

  uploadFiles(files: File[], subjectName?: string, sessionTitle?: string, targetCourseId?: string): { message: string; courses: Course[] } {
    const courseId = targetCourseId || `subj_${Date.now().toString(36)}`;
    const currentDetail = this.getCourseDetail(courseId);

    const baseTitle = subjectName || currentDetail.title || (files[0]?.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')) || 'Subject';
    const mainFile = files[0];
    const filename = mainFile ? mainFile.name : 'Lecture_Presentation.pptx';
    const file_type = filename.endsWith('.pdf') ? 'pdf' : 'pptx';

    const cleanDocName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const topicsList: Topic[] = [
      {
        id: `${courseId}_t1`,
        title: `${cleanDocName} - Overview & Objectives`,
        order_index: 0,
        source_pages: [1, 2],
        summary: `Comprehensive overview and conceptual foundation of ${cleanDocName}.`,
        importance: 'Overview',
        is_completed: false,
      },
      {
        id: `${courseId}_t2`,
        title: 'Core Architecture & Fundamental Mechanics',
        order_index: 1,
        source_pages: [3, 4, 5],
        summary: 'Underlying structural architecture, components, and primary functional flow.',
        importance: 'High',
        is_completed: false,
      },
      {
        id: `${courseId}_t3`,
        title: 'Key Protocols, Rules & Implementation',
        order_index: 2,
        source_pages: [6, 7, 8],
        summary: 'Essential formulas, standards, operational parameters, and mechanics.',
        importance: 'High',
        is_completed: false,
      },
      {
        id: `${courseId}_t4`,
        title: 'Real-World Applications & Industry Case Studies',
        order_index: 3,
        source_pages: [9, 10],
        summary: 'Practical enterprise adoption, real-world trade-offs, and company examples.',
        importance: 'Medium',
        is_completed: false,
      },
      {
        id: `${courseId}_t5`,
        title: 'Edge Cases, Pitfalls & Error Handling',
        order_index: 4,
        source_pages: [11, 12],
        summary: 'Common failure modes, security considerations, and best practice solutions.',
        importance: 'Medium',
        is_completed: false,
      },
      {
        id: `${courseId}_t6`,
        title: 'Executive Summary & Exam Revision Points',
        order_index: 5,
        source_pages: [13, 14],
        summary: 'High-yield points, critical definitions, and memory anchors for exams.',
        importance: 'High',
        is_completed: false,
      },
    ];

    topicsList.forEach((t) => {
      this.seedLesson(t.id, t.title, cleanDocName, courseId, baseTitle);
    });

    const newSession: Session = {
      id: `sess_${Date.now().toString(36)}`,
      title: sessionTitle || `Session 1: ${cleanDocName}`,
      order_index: (currentDetail.sessions?.length || 0),
      description: `Structured topics extracted from ${filename}`,
      topics: topicsList,
    };

    const newMaterial: CourseMaterial = {
      id: `doc_${Date.now().toString(36)}`,
      course_id: courseId,
      filename,
      file_type,
      title: cleanDocName,
      total_units: Math.max(14, topicsList.length * 2),
      topic_count: topicsList.length,
      status: 'ready',
      created_at: new Date().toISOString(),
    };

    const updatedDetail: CourseDetail = {
      ...currentDetail,
      id: courseId,
      title: baseTitle,
      filename,
      file_type,
      status: 'ready',
      status_message: 'Ready to Learn! All topics and 3D gadgets unlocked.',
      progress_percent: 100,
      total_units: newMaterial.total_units,
      topic_count: topicsList.length,
      sessions: [newSession, ...(currentDetail.sessions || [])],
      materials: [newMaterial, ...(currentDetail.materials || [])],
    };

    this.saveCourseDetail(courseId, updatedDetail);
    return { message: 'Uploaded successfully', courses: this.getCourses() };
  },

  seedLesson(topicId: string, topicTitle: string, docName: string, courseId: string = '', courseTitle: string = ''): Lesson {
    const lesson: Lesson = {
      id: `lesson_${topicId}`,
      topic_id: topicId,
      course_id: courseId,
      course_title: courseTitle || 'Subject',
      title: topicTitle,
      importance: 'High',
      unit_label: 'Slide',
      source_pages: [1, 2],
      simple_definition: `${topicTitle} provides the core conceptual framework for understanding ${docName} in modern systems.`,
      easy_english: `Imagine you want to build a reliable solution. Instead of reinventing the wheel, this concept lays out the exact steps, components, and best practices so everything functions reliably without crashing.`,
      hinglish: `Yeh concept ekdum seedha hai: jaise ek building banane se pehle blueprint banta hai, vaise hi yeh concept poore system ko structure aur stability deta hai.`,
      step_by_step: [
        { step: 1, heading: 'Analyze Context & Scope', description: 'Understand the primary problem statement and core operational boundaries.' },
        { step: 2, heading: 'Design & Map Interfaces', description: 'Define clear contracts and communication protocols between components.' },
        { step: 3, heading: 'Implement Core Logic', description: 'Apply the principles with error tolerance and caching.' },
        { step: 4, heading: 'Validate & Optimize', description: 'Monitor performance metrics, latency, and continuous throughput.' },
      ],
      key_points: [
        'Essential architectural foundation required for scalable design.',
        'Prevents costly redesigns and downtime by enforcing modularity.',
        'Directly applicable to university exam questions and real-world tech interviews.',
      ],
      real_life_examples: [
        {
          title: 'Amazon Web Services (AWS)',
          scenario: 'Microservice Coordination',
          learning: 'Uses these design patterns to ensure millions of requests execute with sub-second latency.',
        },
      ],
      indian_examples: [
        {
          company: 'Swiggy & Zomato Delivery System',
          scenario: 'Live Tracking & Dispatch Engine',
          takeaway: 'Just like Swiggy matches you with the nearest rider seamlessly, this architecture routes events in real time without bottlenecks.',
        },
      ],
      terminology: [
        { term: 'Modularity', definition: 'Breaking down a complex system into independent, interchangeable modules.' },
        { term: 'Fault Tolerance', definition: 'The ability of a system to continue operating properly in the event of component failure.' },
      ],
      formulas: [],
      diagram: {
        mermaid_syntax: 'graph TD\nA[Input Layer]-->B[Processing Engine]\nB-->C[Validation Layer]\nC-->D[Output & Analytics]',
        diagram_type: 'flowchart',
        explanation: 'Visual breakdown showing clear end-to-end flow through the system layers.',
      },
      comparisons: {
        item_a: 'Traditional Approach',
        item_b: 'Modern Solution',
        comparison_table: [
          { feature: 'Scalability', item_a_val: 'Limited & Monolithic', item_b_val: 'Elastic & Cloud-native' },
          { feature: 'Resilience', item_a_val: 'Single Point of Failure', item_b_val: 'Self-healing & Redundant' },
        ],
      },
      exam_notes: `High-yield topic for university exams. Remember to write the 4 core steps, draw the flowchart diagram, and mention the Swiggy/AWS real-world analogy for full marks.`,
      short_questions: [
        { question: `What is the primary purpose of ${topicTitle}?`, answer: `To provide a robust, fault-tolerant structure that enables scalability and simplifies maintenance.` },
      ],
      long_questions: [
        { question: `Explain the detailed architecture and trade-offs of ${topicTitle} with a neat diagram.`, answer: `Detail the 4-layer architecture, highlighting error handling, state management, and real-time synchronization.` },
      ],
      revision_summary: `${topicTitle} is the backbone of ${docName}. Master the 4 core steps, key definitions, and real-world examples for exam mastery.`,
      simplified_mode: {
        title: 'Small Light (ELI5) Mode',
        eli5_text: 'In one sentence: This concept connects all the dots so your solution works smoothly and reliably every single time!',
        gadget_tip: 'Doraemon tip: Think of this like a train schedule that keeps all trains running on time without collisions!',
      },
      is_completed: false,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.LESSON_PREFIX + topicId, JSON.stringify(lesson));
    } catch {
      // ignore
    }
    return lesson;
  },

  getLesson(topicId: string): Lesson {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LESSON_PREFIX + topicId);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return this.seedLesson(topicId, 'Topic Overview', 'Study Subject');
  },

  getQuiz(topicId: string): { id: string; topic_id: string; course_id: string; title: string; topic_title: string; questions: QuizQuestion[] } {
    const lesson = this.getLesson(topicId);
    const questions: QuizQuestion[] = [
      {
        question: `What is the primary advantage of applying ${lesson.title}?`,
        options: [
          'Ensures system scalability and prevents single points of failure',
          'Makes the code run slower',
          'Removes all database storage',
          'Only works on offline machines',
        ],
        correct_index: 0,
        difficulty: 'Medium',
        type: 'mcq',
        explanation: 'Modularity and resilience enable systems to scale under load without collapsing.',
      },
      {
        question: 'Which real-life analogy best explains this mechanism?',
        options: [
          'Swiggy live dispatch and routing engine',
          'A static paper dictionary',
          'A broken bicycle chain',
          'Unsynchronized clock hands',
        ],
        correct_index: 0,
        difficulty: 'Easy',
        type: 'mcq',
        explanation: 'Real-time coordinated event routing perfectly illustrates modular architectural flow.',
      },
    ];

    return {
      id: `quiz_${topicId}`,
      topic_id: topicId,
      course_id: lesson.course_id,
      title: `Quiz: ${lesson.title}`,
      topic_title: lesson.title,
      questions,
    };
  },

  getGamificationProfile(studentId?: string): GamificationProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }

    const defaultProfile: GamificationProfile = {
      student_name: localStorage.getItem(STORAGE_KEYS.STUDENT_NAME) || 'Himani Tailor',
      student_id: studentId || 'current_user',
      total_xp: 450,
      level: 3,
      xp_in_current_level: 150,
      next_level_xp: 500,
      current_streak: 5,
      completed_topics_count: 2,
      completed_topics: [],
      weak_topics: [],
      badges: ['4D Explorer', 'Knowledge Pioneer'],
      available_badges: [
        { name: '4D Explorer', description: 'First step into Doraemon Learning World', icon: '🎒' },
        { name: 'Knowledge Pioneer', description: 'Traveled through the 3D wave universe', icon: '🚀' },
      ],
    };
    return defaultProfile;
  },

  createOrSwitchStudentProfile(name: string): StudentProfile {
    const trimmed = name.trim() || 'Himani Tailor';
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, trimmed);
    } catch {
      // ignore
    }
    return {
      id: `student_${Date.now().toString(36)}`,
      name: trimmed,
      total_xp: 450,
      level: 3,
      current_streak: 5,
      completed_topics_count: 2,
      created_at: new Date().toISOString(),
    };
  },

  getAnywhereDoorDirectory(query: string = ''): AnywhereDoorItem[] {
    const courses = this.getCourses();
    const items: AnywhereDoorItem[] = [];
    courses.forEach((c) => {
      const detail = this.getCourseDetail(c.id);
      detail.sessions?.forEach((s) => {
        s.topics?.forEach((t) => {
          if (!query || t.title.toLowerCase().includes(query.toLowerCase()) || c.title.toLowerCase().includes(query.toLowerCase())) {
            items.push({
              course_id: c.id,
              course_title: c.title,
              file_type: c.file_type || 'pptx',
              session_id: s.id,
              session_title: s.title,
              topic_id: t.id,
              topic_title: t.title,
              source_pages: t.source_pages || [1],
              importance: t.importance || 'Medium',
              is_completed: t.is_completed || false,
            });
          }
        });
      });
    });
    return items;
  },

  getMemoryBreadCards(courseId?: string): Flashcard[] {
    const courses = this.getCourses();
    const cards: Flashcard[] = [];
    const targetCourses = courseId ? courses.filter((c) => c.id === courseId) : courses;

    targetCourses.forEach((c) => {
      const detail = this.getCourseDetail(c.id);
      detail.sessions?.forEach((s) => {
        s.topics?.forEach((t, i) => {
          cards.push({
            id: `card_${t.id}_${i}`,
            topic_title: t.title,
            course_title: c.title,
            source_ref: `Slide ${i + 1}`,
            card_type: 'Definition',
            front: `What is the core definition of ${t.title}?`,
            back: t.summary || `Fundamental principle of ${t.title} required for understanding modern system architecture.`,
          });
        });
      });
    });
    return cards;
  },
};
