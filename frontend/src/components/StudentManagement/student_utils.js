import axios from 'axios';

const STUDENT_API_URL = 'http://localhost:5000/api/students';
const API_URL = 'http://localhost:5000/api';
const STUDENT_SESSION_KEY = 'stepin_student_session';

const normalizeStudentError = (error, fallbackMessage) => {
  const message = error.response?.data?.message || error.response?.data?.error || error.message || fallbackMessage;

  if (
    message.includes('buffering timed out') ||
    message.includes('Database is currently unavailable') ||
    message.includes('ECONNREFUSED')
  ) {
    return new Error('Student portal is unavailable because the backend database is not running. Start MongoDB and restart the backend, then try again.');
  }

  return new Error(message);
};

export const registerStudent = async (studentData) => {
  try {
    const response = await axios.post(`${STUDENT_API_URL}/register`, studentData);
    return response.data;
  } catch (error) {
    throw normalizeStudentError(error, 'Student registration failed');
  }
};

export const loginStudent = async (email, password) => {
  try {
    const response = await axios.post(`${STUDENT_API_URL}/login`, { email, password });
    const student = response.data?.student || response.data?.data || response.data;
    const session = {
      token: response.data?.token || '',
      student,
    };

    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    throw normalizeStudentError(error, 'Student login failed');
  }
};

export const saveStudentSession = (token, student) => {
    const session = { token, student };
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
    return session;
};

export const getStudentSession = () => {
  const session = localStorage.getItem(STUDENT_SESSION_KEY);

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session);
  } catch {
    localStorage.removeItem(STUDENT_SESSION_KEY);
    return null;
  }
};

export const isStudentLoggedIn = () => Boolean(getStudentSession()?.token);

export const isStudentAuthError = (error) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message || error?.response?.data?.error || error?.message || ''
  ).toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('invalid token') ||
    message.includes('token expired') ||
    message.includes('jwt') ||
    message.includes('not authenticated')
  );
};

export const logoutStudent = () => {
    localStorage.removeItem(STUDENT_SESSION_KEY);
    // Also clear legacy keys for clean state
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    localStorage.removeItem('studentAccount');
};

// --- Review API Section ---

const getAuthHeader = () => {
    const session = getStudentSession();
    return {
        headers: { Authorization: `Bearer ${session?.token || ''}` }
    };
};

export const getStudentInterviewSchedules = async () => {
  try {
    const auth = getAuthHeader();
    const endpoints = [
      `${API_URL}/interviews/student`,
      `${API_URL}/interview-schedules/student`,
      `${API_URL}/interviewSchedule/student`,
    ];

    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, auth);
        return response.data;
      } catch (error) {
        lastError = error;
        if (error.response?.status !== 404) {
          throw error;
        }
      }
    }

    throw lastError || new Error('Interview schedule route not found');
  } catch (error) {
    throw normalizeStudentError(error, 'Failed to fetch interview schedules');
  }
};

export const submitStudentReview = async (reviewData) => {
    try {
        const response = await axios.post('http://localhost:5000/api/reviews/student', reviewData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw normalizeStudentError(error, 'Failed to submit review');
    }
};

export const getStudentReviews = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/reviews/student', getAuthHeader());
        return response.data;
    } catch (error) {
        throw normalizeStudentError(error, 'Failed to fetch reviews');
    }
};
