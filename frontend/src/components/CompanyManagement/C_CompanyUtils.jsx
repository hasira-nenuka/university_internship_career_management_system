// API service for company operations
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const normalizeCompanyApiError = (error, fallbackMessage) => {
    const message = error.response?.data?.message || error.message || fallbackMessage;

    if (
        message.includes('buffering timed out') ||
        message.includes('Database is currently unavailable') ||
        message.includes('ECONNREFUSED')
    ) {
        return {
            message: 'Company login is unavailable because the backend database is not running. Start MongoDB and restart the backend, then try again.'
        };
    }

    return error.response?.data || { message: fallbackMessage };
};

// Set up axios instance with token
const getAuthHeader = () => {
    const token = localStorage.getItem('companyToken');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

// Company Registration
export const registerCompany = async (companyData) => {
    try {
        const response = await axios.post(`${API_URL}/company/register`, companyData);
        const company = response.data.company || response.data.data;
        if (response.data.success) {
            localStorage.setItem('companyToken', response.data.token);
            localStorage.setItem('companyId', company?._id || company?.id || '');
            localStorage.setItem('companyName', company?.companyName || '');
        }
        return response.data;
    } catch (error) {
        throw normalizeCompanyApiError(error, 'Registration failed');
    }
};

// Company Login
export const loginCompany = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/company/login`, { email, password });
        const company = response.data.company || response.data.data;
        if (response.data.success) {
            localStorage.setItem('companyToken', response.data.token);
            localStorage.setItem('companyId', company?._id || company?.id || '');
            localStorage.setItem('companyName', company?.companyName || '');
        }
        return response.data;
    } catch (error) {
        throw normalizeCompanyApiError(error, 'Login failed');
    }
};

// Get Company Profile
export const getCompanyProfile = async () => {
    try {
        const companyId = localStorage.getItem('companyId');
        const response = await axios.get(`${API_URL}/company/${companyId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch profile' };
    }
};

// Update Company Profile
export const updateCompanyProfile = async (profileData) => {
    try {
        const companyId = localStorage.getItem('companyId');
        const response = await axios.put(`${API_URL}/company/${companyId}`, profileData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update profile' };
    }
};

// Post Internship
export const postInternship = async (internshipData) => {
    try {
        const response = await axios.post(`${API_URL}/internships`, internshipData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to post internship' };
    }
};

// Get Company Internships
export const getCompanyInternships = async () => {
    try {
        const companyId = localStorage.getItem('companyId');
        const response = await axios.get(`${API_URL}/internships/company/${companyId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch internships' };
    }
};

// Update Internship
export const updateInternship = async (internshipId, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/internships/${internshipId}`, updateData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update internship' };
    }
};

// Delete Internship
export const deleteInternship = async (internshipId) => {
    try {
        const response = await axios.delete(`${API_URL}/internships/${internshipId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete internship' };
    }
};

// Get Student Recommendations
export const getStudentRecommendations = async (internshipId) => {
    try {
        const response = await axios.get(`${API_URL}/matching/recommendations/${internshipId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch recommendations' };
    }
};

// Get Match Summary for a Student
export const getMatchSummary = async (studentId, internshipId) => {
    try {
        const response = await axios.get(`${API_URL}/matching/summary/${studentId}/${internshipId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch match summary' };
    }
};

// Get Applications for Internship
export const getApplications = async (internshipId) => {
    try {
        const response = await axios.get(`${API_URL}/applications/internship/${internshipId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch applications' };
    }
};

// Update Application Status
export const updateApplicationStatus = async (applicationId, status) => {
    try {
        const response = await axios.put(`${API_URL}/applications/${applicationId}`, 
            { status }, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update application' };
    }
};

// Logout Company
export const logoutCompany = () => {
    localStorage.removeItem('companyToken');
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyName');
};

// Check if Company is Logged In
export const isCompanyLoggedIn = () => {
    return localStorage.getItem('companyToken') !== null;
};

// Upload Image
export const uploadImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post(`${API_URL}/upload`, formData, {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to upload image' };
    }
};

// Get Company Pro Account Status
export const getCompanyProAccount = async () => {
    try {
        const companyId = localStorage.getItem('companyId');
        const response = await axios.get(`${API_URL}/pro-accounts/company/${companyId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch pro account status' };
    }
};

// Direct Student Search (Pro Account)
export const searchStudentsDirectly = async (category, district) => {
    try {
        const companyId = localStorage.getItem('companyId');
        const response = await axios.get(
            `${API_URL}/company/${companyId}/search-students`,
            {
                ...getAuthHeader(),
                params: { category, district }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to search students' };
    }
};

export const submitCompanyReview = async (reviewData) => {
    try {
        const response = await axios.post(`${API_URL}/reviews/company`, reviewData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to submit review' };
    }
};

export const getCompanyReviews = async () => {
    try {
        const response = await axios.get(`${API_URL}/reviews/company`, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch reviews' };
    }
};
