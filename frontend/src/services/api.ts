import {
  Course,
  CourseDetail,
  Lesson,
  GamificationProfile,
  Flashcard,
  AnywhereDoorItem,
  TutorMessage,
  AppSettings,
  QuizQuestion,
  CourseSummaryData,
  KnowledgeGraphData,
  StudentProfile
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Courses
  async getCourses(): Promise<Course[]> {
    const res = await fetch(`${BASE_URL}/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async getCourseDetail(courseId: string): Promise<CourseDetail> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}`);
    if (!res.ok) throw new Error('Failed to fetch course details');
    return res.json();
  },

  async createSubject(title: string, description?: string): Promise<{ id: string; title: string; description: string }> {
    const res = await fetch(`${BASE_URL}/courses/subject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create subject');
    }
    return res.json();
  },

  async uploadFiles(
    files: File[],
    subjectName?: string,
    sessionTitle?: string,
    targetCourseId?: string
  ): Promise<{ message: string; courses: Course[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (subjectName && subjectName.trim()) formData.append('subject_name', subjectName.trim());
    if (sessionTitle && sessionTitle.trim()) formData.append('session_title', sessionTitle.trim());
    if (targetCourseId) formData.append('target_course_id', targetCourseId);
    const res = await fetch(`${BASE_URL}/courses/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload files');
    }
    return res.json();
  },

  async retryCourse(courseId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/retry`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to retry course processing');
  },

  async deleteCourse(courseId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete course');
  },

  async deleteMaterial(courseId: string, materialId?: string): Promise<void> {
    const url = materialId 
      ? `${BASE_URL}/courses/${courseId}/materials/${materialId}`
      : `${BASE_URL}/courses/${courseId}/document`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete study material');
  },

  async updateCourse(courseId: string, payload: { title?: string; description?: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update course');
  },

  async updateSession(courseId: string, sessionId: string, payload: { title?: string; description?: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update session');
  },

  async getCourseRawText(courseId: string): Promise<Array<{ unit_number: number; header: string; content: string }>> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/raw-text`);
    if (!res.ok) throw new Error('Failed to fetch raw course text');
    return res.json();
  },

  async getCourseSummary(courseId: string): Promise<CourseSummaryData> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/summary`);
    if (!res.ok) throw new Error('Failed to fetch course summary');
    return res.json();
  },

  async getCourseKnowledgeMap(courseId: string): Promise<KnowledgeGraphData> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/knowledge-map`);
    if (!res.ok) throw new Error('Failed to fetch course knowledge map');
    return res.json();
  },

  async getAllLearningKnowledgeMap(): Promise<KnowledgeGraphData> {
    const res = await fetch(`${BASE_URL}/courses/knowledge-map/all`);
    if (!res.ok) throw new Error('Failed to fetch all learning knowledge map');
    return res.json();
  },

  async createCourseManual(title: string, description?: string): Promise<{ message: string; course_id: string }> {
    const res = await fetch(`${BASE_URL}/courses/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error('Failed to create manual course');
    return res.json();
  },

  async addSession(courseId: string, title: string, description?: string): Promise<{ message: string; session_id: string }> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error('Failed to add session');
    return res.json();
  },

  async uploadSessionFile(courseId: string, sessionId: string, file: File): Promise<{ message: string; course_id: string; session_id: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/courses/${courseId}/sessions/${sessionId}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload session file');
    }
    return res.json();
  },

  async addTopic(courseId: string, sessionId: string, title: string, summary?: string, importance?: string): Promise<{ message: string; topic_id: string }> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/sessions/${sessionId}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, summary, importance }),
    });
    if (!res.ok) throw new Error('Failed to add topic');
    return res.json();
  },

  // Lessons
  async getLesson(topicId: string): Promise<Lesson> {
    const res = await fetch(`${BASE_URL}/lessons/${topicId}`);
    if (!res.ok) throw new Error('Failed to fetch lesson');
    return res.json();
  },

  async completeLesson(topicId: string, courseId: string): Promise<{
    success: boolean;
    already_completed: boolean;
    xp_awarded: number;
    total_xp: number;
    new_badge?: string;
  }> {
    const res = await fetch(`${BASE_URL}/lessons/${topicId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
    if (!res.ok) throw new Error('Failed to complete lesson');
    return res.json();
  },

  // Quizzes
  async getQuiz(topicId: string): Promise<{
    id: string;
    topic_id: string;
    course_id: string;
    title: string;
    topic_title: string;
    questions: QuizQuestion[];
  }> {
    const res = await fetch(`${BASE_URL}/quizzes/${topicId}`);
    if (!res.ok) throw new Error('Failed to fetch quiz');
    return res.json();
  },

  async submitQuiz(quizId: string, courseId: string, topicId: string, answers: number[]): Promise<{
    score_percent: number;
    correct_count: number;
    total_questions: number;
    xp_earned: number;
    new_badge?: string;
    weak_topic_status: string;
    evaluation: Array<{
      question_index: number;
      question: string;
      options: string[];
      user_index: number;
      correct_index: number;
      is_correct: boolean;
      explanation: string;
    }>;
  }> {
    const res = await fetch(`${BASE_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId, topic_id: topicId, answers }),
    });
    if (!res.ok) throw new Error('Failed to submit quiz');
    return res.json();
  },

  // Tutor
  async sendTutorMessage(
    message: string,
    courseId?: string,
    topicId?: string
  ): Promise<{
    reply: string;
    citations: string[];
    grounded_in_materials: boolean;
    source_snippets: Array<{ citation: string; header: string; snippet: string }>;
  }> {
    const res = await fetch(`${BASE_URL}/tutor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, course_id: courseId, topic_id: topicId }),
    });
    if (!res.ok) throw new Error('Failed to get tutor response');
    return res.json();
  },

  async getTutorHistory(courseId?: string, topicId?: string): Promise<TutorMessage[]> {
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId);
    if (topicId) params.append('topic_id', topicId);
    const res = await fetch(`${BASE_URL}/tutor/history?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tutor chat history');
    return res.json();
  },

  // Gadgets
  async getAnywhereDoorDirectory(query: string = ''): Promise<AnywhereDoorItem[]> {
    const res = await fetch(`${BASE_URL}/gadgets/anywhere-door?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to fetch Anywhere Door index');
    return res.json();
  },

  async getMemoryBreadCards(courseId?: string, topicId?: string): Promise<Flashcard[]> {
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId);
    if (topicId) params.append('topic_id', topicId);
    const res = await fetch(`${BASE_URL}/gadgets/memory-bread?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch Memory Bread flashcards');
    return res.json();
  },

  async getTimeMachineExam(courseId: string, durationMinutes: number = 15): Promise<any> {
    const res = await fetch(
      `${BASE_URL}/gadgets/time-machine/exam?course_id=${encodeURIComponent(courseId)}&duration_minutes=${durationMinutes}`
    );
    if (!res.ok) throw new Error('Failed to generate Time Machine exam');
    return res.json();
  },

  // Gamification & Student Profiles
  async getGamificationProfile(studentId?: string): Promise<GamificationProfile> {
    const url = studentId
      ? `${BASE_URL}/gamification/profile?student_id=${encodeURIComponent(studentId)}`
      : `${BASE_URL}/gamification/profile`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch gamification profile');
    return res.json();
  },

  async getStudentProfiles(): Promise<StudentProfile[]> {
    const res = await fetch(`${BASE_URL}/gamification/profiles`);
    if (!res.ok) throw new Error('Failed to fetch student profiles');
    return res.json();
  },

  async createOrSwitchStudentProfile(name: string): Promise<StudentProfile> {
    const res = await fetch(`${BASE_URL}/gamification/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create or switch student profile');
    return res.json();
  },

  async updateStudentProfileName(profileId: string, name: string): Promise<{ id: string; name: string }> {
    const res = await fetch(`${BASE_URL}/gamification/profiles/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update student profile name');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings & { gemini_api_key?: string }>): Promise<void> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
  },

  async testConnection(): Promise<{ success: boolean; status: string; message: string }> {
    const res = await fetch(`${BASE_URL}/settings/test-connection`, { method: 'POST' });
    if (!res.ok) throw new Error('Connection test failed');
    return res.json();
  },
};
