import axios from 'axios';

const STUDENT_API_URL = 'http://localhost:5000/api/students';
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

export const getStudentSession = () => {
  const session = localStorage.getItem(STUDENT_SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const isStudentLoggedIn = () => Boolean(getStudentSession()?.token);

export const logoutStudent = () => {
  localStorage.removeItem(STUDENT_SESSION_KEY);
};
