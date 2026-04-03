import axios from 'axios';

const STUDENT_API_URL = 'http://localhost:5000/api/students';
const STUDENT_SESSION_KEY = 'stepin_student_session';
const LEGACY_TOKEN_KEY = 'token';
const LEGACY_ACCOUNT_KEY = 'studentAccount';
const LEGACY_PROFILE_KEY = 'student';

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

    setStudentSession(session);
    return session;
  } catch (error) {
    throw normalizeStudentError(error, 'Student login failed');
  }
};

export const setStudentSession = (session) => {
  if (!session) {
    return;
  }

  localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));

  if (session.token) {
    localStorage.setItem(LEGACY_TOKEN_KEY, session.token);
  }

  if (session.student) {
    localStorage.setItem(LEGACY_ACCOUNT_KEY, JSON.stringify(session.student));
  }
};

export const getStudentSession = () => {
  const session = localStorage.getItem(STUDENT_SESSION_KEY);
  if (session) {
    try {
      return JSON.parse(session);
    } catch {
      localStorage.removeItem(STUDENT_SESSION_KEY);
    }
  }

  const token = localStorage.getItem(LEGACY_TOKEN_KEY);
  const studentRaw = localStorage.getItem(LEGACY_ACCOUNT_KEY);

  if (!token || !studentRaw) {
    return null;
  }

  try {
    const fallbackSession = {
      token,
      student: JSON.parse(studentRaw),
    };

    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(fallbackSession));
    return fallbackSession;
  } catch {
    return null;
  }
};

export const isStudentLoggedIn = () => Boolean(getStudentSession()?.token);

export const isStudentAuthError = (error) => {
  const message = error?.response?.data?.message || error?.message || '';
  return ['Token failed', 'No token', 'Student not found'].includes(message);
};

export const logoutStudent = () => {
  localStorage.removeItem(STUDENT_SESSION_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ACCOUNT_KEY);
  localStorage.removeItem(LEGACY_PROFILE_KEY);
};
