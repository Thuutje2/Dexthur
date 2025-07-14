class DBDQuizManager {
  constructor() {
    this.activeQuizzes = new Map(); // userId -> { type, startTime, channelId }
  }

  // Check if user has an active DBD quiz
  hasActiveQuiz(userId) {
    return this.activeQuizzes.has(userId);
  }

  // Start a new DBD quiz session
  startQuiz(userId, quizType, channelId) {
    if (this.hasActiveQuiz(userId)) {
      return false; // Quiz already active
    }
    
    this.activeQuizzes.set(userId, {
      type: quizType,
      startTime: Date.now(),
      channelId: channelId
    });
    
    return true; // Quiz started successfully
  }

  // End a quiz session
  endQuiz(userId) {
    return this.activeQuizzes.delete(userId);
  }

  // Get active quiz info
  getActiveQuiz(userId) {
    return this.activeQuizzes.get(userId);
  }

  // Clean up old sessions (optional)
  cleanupOldSessions(maxAgeMs = 300000) { // 5 minutes default
    const now = Date.now();
    for (const [userId, session] of this.activeQuizzes.entries()) {
      if (now - session.startTime > maxAgeMs) {
        this.activeQuizzes.delete(userId);
      }
    }
  }
}

module.exports = new DBDQuizManager();