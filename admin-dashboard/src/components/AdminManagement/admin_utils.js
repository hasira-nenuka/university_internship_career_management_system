import axios from 'axios';

const ADMIN_API_URL = 'http://localhost:5000/api/admins';
const ADMIN_RESOURCES_URL = 'http://localhost:5000/api/admin-resources';
const ADMIN_REVIEWS_URL = 'http://localhost:5000/api/reviews';
const ADMIN_SESSION_KEY = 'stepin_admin_session';

const api = axios.create();

const getAuthConfig = () => {
  const session = getAdminSession();
  return {
    headers: {
      Authorization: `Bearer ${session?.token || ''}`,
    },
  };
};

const mapAdmin = (admin, index) => ({
  id: admin.id || admin._id || `ADM-${String(index + 1).padStart(3, '0')}`,
  fullName: admin.fullName || admin.name || 'Unnamed Admin',
  email: admin.email || 'no-email@example.com',
  password: admin.password || '',
  role: admin.role || 'Admin Manager',
  department: admin.department || 'General Administration',
  status: admin.status || 'Active',
  createdAt: admin.createdAt || new Date().toISOString(),
});

export const ADMIN_ROLES = [
  'Super Admin',
  'Admin Manager',
  'Company Manager',
  'Internship Manager',
  'Payment Manager',
  'Review Admin',
];

export const PAGE_ACCESS = {
  dashboard: ADMIN_ROLES,
  createAdmin: ['Super Admin', 'Admin Manager'],
  adminRegistry: ['Super Admin', 'Admin Manager'],
  companies: ['Super Admin', 'Company Manager'],
  internships: ['Super Admin', 'Internship Manager'],
  payments: ['Super Admin', 'Payment Manager'],
  reviews: ['Super Admin', 'Review Admin'],
};

export const isRoleAllowed = (role, allowedRoles = []) => allowedRoles.includes(role);

export const getAdminNavigation = (role) => {
  const items = [
    { label: 'Dashboard', path: '/dashboard', accessKey: 'dashboard' },
    { label: 'Create Admin', path: '/create', accessKey: 'createAdmin' },
    { label: 'Admin Registry', path: '/registry', accessKey: 'adminRegistry' },
    { label: 'Company Data', path: '/companies', accessKey: 'companies' },
    { label: 'Internship Data', path: '/internships', accessKey: 'internships' },
    { label: 'Payment Data', path: '/payments', accessKey: 'payments' },
    { label: 'Review Data', path: '/reviews', accessKey: 'reviews' },
  ];

  return items.filter((item) => isRoleAllowed(role, PAGE_ACCESS[item.accessKey]));
};

export const loginAdmin = async (email, password) => {
  const response = await api.post(`${ADMIN_API_URL}/login`, { email, password });
  const admin = response.data?.data || response.data?.admin || response.data;

  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      token: response.data?.token,
      admin: mapAdmin(admin, 0),
      source: 'backend',
    })
  );

  return { success: true, source: 'backend', data: mapAdmin(admin, 0) };
};

export const getAdminSession = () => {
  const session = localStorage.getItem(ADMIN_SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const isAdminLoggedIn = () => Boolean(getAdminSession()?.token);

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const fetchAdmins = async () => {
  const response = await api.get(ADMIN_API_URL, getAuthConfig());
  const admins = response.data?.data || response.data || [];

  return {
    data: admins.map(mapAdmin),
    source: 'backend',
  };
};

export const createAdmin = async (adminData) => {
  const response = await api.post(
    ADMIN_API_URL,
    {
      ...adminData,
      password: adminData.password || '',
      status: adminData.status || 'Active',
    },
    getAuthConfig()
  );

  return {
    data: mapAdmin(response.data?.data || response.data, 0),
    source: 'backend',
  };
};

export const updateAdminRole = async (adminId, role) => {
  const response = await api.patch(`${ADMIN_API_URL}/${adminId}/role`, { role }, getAuthConfig());
  return {
    data: mapAdmin(response.data?.data || response.data, 0),
    source: 'backend',
  };
};

export const updateAdmin = async (adminId, adminData) => {
  const response = await api.put(`${ADMIN_API_URL}/${adminId}`, adminData, getAuthConfig());
  return {
    data: mapAdmin(response.data?.data || response.data, 0),
    source: 'backend',
  };
};

export const removeAdmin = async (adminId) => {
  await api.delete(`${ADMIN_API_URL}/${adminId}`, getAuthConfig());
  return { source: 'backend' };
};

export const buildAdminInvitationLink = (admin) => {
  const subject = encodeURIComponent('StepIn Admin Account Details');
  const body = encodeURIComponent(
    [
      `Hello ${admin.fullName},`,
      '',
      'Your StepIn admin account has been created.',
      '',
      `Position/Role: ${admin.role}`,
      `Email: ${admin.email}`,
      `Password: ${admin.password || 'Not set'}`,
      '',
      'Please log in to the admin portal using these details.',
    ].join('\n')
  );

  return `mailto:${admin.email}?subject=${subject}&body=${body}`;
};

export const getAdminSummary = (admins) => {
  const activeAdmins = admins.filter((admin) => admin.status === 'Active').length;
  const superAdmins = admins.filter((admin) => admin.role === 'Super Admin').length;
  const companyManagers = admins.filter((admin) => admin.role === 'Company Manager').length;

  return {
    totalAdmins: admins.length,
    activeAdmins,
    superAdmins,
    companyManagers,
  };
};

export const RESOURCE_CONFIGS = {
  companies: {
    title: 'Company Data',
    description: 'View, add, update, and delete company records.',
    endpoint: 'companies',
    allowedRoles: PAGE_ACCESS.companies,
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'industry', label: 'Industry', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'text', required: false },
      { name: 'address', label: 'Address', type: 'text', required: true },
      { name: 'website', label: 'Website', type: 'text', required: false },
      { name: 'companySize', label: 'Company Size', type: 'text', required: false },
      { name: 'description', label: 'Description', type: 'text', required: false },
    ],
    columns: ['companyName', 'email', 'industry', 'phone', 'address', 'website'],
  },
  internships: {
    title: 'Internship Data',
    description: 'View, add, update, and delete internship records.',
    endpoint: 'internships',
    allowedRoles: PAGE_ACCESS.internships,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'companyId', label: 'Company ID', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text', required: false },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Full-time', 'Part-time', 'Remote', 'Hybrid'], required: true },
      { name: 'duration', label: 'Duration', type: 'text', required: true },
      { name: 'stipend', label: 'Stipend', type: 'text', required: true },
      { name: 'openings', label: 'Openings', type: 'number', required: true },
      { name: 'deadline', label: 'Deadline', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'closed'], required: true },
    ],
    columns: ['title', 'companyId.companyName', 'location', 'type', 'duration', 'status'],
  },
  payments: {
    title: 'Payment Data',
    description: 'Manage payment records and financial statuses.',
    endpoint: 'payments',
    allowedRoles: PAGE_ACCESS.payments,
    fields: [
      { name: 'name', label: 'Payer Name', type: 'text', required: true },
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'phoneNumber', label: 'Phone Number', type: 'text', required: true },
      { name: 'bankName', label: 'Bank Name', type: 'select', options: ['Sampath Bank', 'BOC Bank'], required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'referenceNo', label: 'Reference Number', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'verified', 'rejected'], required: true },
    ],
    columns: ['name', 'companyName', 'phoneNumber', 'bankName', 'amount', 'referenceNo', 'status'],
  },
};

export const fetchResourceRecords = async (resourceKey) => {
  const response = await api.get(`${ADMIN_RESOURCES_URL}/${RESOURCE_CONFIGS[resourceKey].endpoint}`, getAuthConfig());
  return response.data?.data || [];
};

export const createResourceRecord = async (resourceKey, payload) => {
  const response = await api.post(
    `${ADMIN_RESOURCES_URL}/${RESOURCE_CONFIGS[resourceKey].endpoint}`,
    payload,
    getAuthConfig()
  );
  return response.data?.data;
};

export const updateResourceRecord = async (resourceKey, id, payload) => {
  const response = await api.put(
    `${ADMIN_RESOURCES_URL}/${RESOURCE_CONFIGS[resourceKey].endpoint}/${id}`,
    payload,
    getAuthConfig()
  );
  return response.data?.data;
};

export const deleteResourceRecord = async (resourceKey, id) => {
  await api.delete(`${ADMIN_RESOURCES_URL}/${RESOURCE_CONFIGS[resourceKey].endpoint}/${id}`, getAuthConfig());
};

export const fetchReviewRecords = async () => {
  const response = await api.get(ADMIN_REVIEWS_URL, getAuthConfig());
  return response.data?.data || [];
};

export const replyToReviewRecord = async (reviewId, payload) => {
  const response = await api.patch(`${ADMIN_REVIEWS_URL}/${reviewId}/reply`, payload, getAuthConfig());
  return response.data?.data;
};

export const updateReviewRecordStatus = async (reviewId, status) => {
  const response = await api.patch(`${ADMIN_REVIEWS_URL}/${reviewId}/status`, { status }, getAuthConfig());
  return response.data?.data;
};

export const deleteReviewRecord = async (reviewId) => {
  await api.delete(`${ADMIN_REVIEWS_URL}/${reviewId}`, getAuthConfig());
};
