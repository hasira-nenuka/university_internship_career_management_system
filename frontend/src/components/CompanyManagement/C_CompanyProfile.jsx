import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProAccount, updateCompanyProfile, uploadImage } from './C_CompanyUtils';

const C_CompanyProfile = ({ companyData, onUpdate }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(companyData || {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [proStatus, setProStatus] = useState(null);

    useEffect(() => {
        setFormData((current) => ({
            ...current,
            ...(companyData || {})
        }));
    }, [companyData]);

    useEffect(() => {
        const fetchProStatus = async () => {
            try {
                const result = await getCompanyProAccount();
                setProStatus(result.data);
            } catch (err) {
                setProStatus(null);
            }
        };
        fetchProStatus();
    }, []);

    const getProBadgeColor = (status) => {
        if (status === 'active') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (status === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200';
        if (status === 'expired') return 'bg-rose-100 text-rose-700 border-rose-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setUploadingLogo(true);
            setError('');
            try {
                const result = await uploadImage(file);
                setFormData((current) => ({
                    ...current,
                    logo: result.data.url
                }));
                setSuccess('Logo uploaded successfully!');
            } catch (err) {
                setError('Failed to upload logo. Please try again.');
            } finally {
                setUploadingLogo(false);
                e.target.value = '';
            }
        } else {
            setError('Please select an image file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await updateCompanyProfile(formData);
            if (result?.data) {
                setFormData((current) => ({
                    ...current,
                    ...result.data
                }));
            }
            setSuccess('Company profile updated successfully!');
            setIsEditing(false);
            if (onUpdate) onUpdate(formData);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!companyData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Company Profile</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your company information</p>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {/* Messages */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-5 py-3 rounded-2xl flex items-center gap-3">
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-5 py-3 rounded-2xl">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-10">
                            {/* Pro Account Section */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-7">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center">
                                                <span className="text-white text-xl">★</span>
                                            </div>
                                            <h3 className="text-2xl font-semibold text-emerald-900 dark:text-emerald-100">Pro Account</h3>
                                        </div>
                                        <p className="text-emerald-700 dark:text-emerald-300 text-lg">
                                            Unlock unlimited student search and job postings
                                        </p>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">Rs 6,000.00 every 30 days</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <span className={`px-5 py-1.5 text-sm font-semibold rounded-full border ${getProBadgeColor(proStatus?.status || 'inactive')}`}>
                                            {(proStatus?.status || 'inactive').toUpperCase()}
                                        </span>
                                        {proStatus?.expiresAt && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                Expires: {new Date(proStatus.expiresAt).toLocaleDateString('en-IN')}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/payments/pro-upgrade', {
                                            state: {
                                                companyId: localStorage.getItem('companyId'),
                                                companyName: companyData?.companyName || ''
                                            }
                                        })}
                                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all whitespace-nowrap shadow-lg"
                                    >
                                        {proStatus?.status === 'active' ? 'Manage Pro' : 'Upgrade to Pro'}
                                    </button>
                                </div>
                            </div>

                            {/* Logo Section */}
                            <div className="flex items-center gap-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl overflow-hidden ring-8 ring-white dark:ring-slate-900 shadow-xl">
                                        {formData.logo ? (
                                            <img
                                                src={formData.logo}
                                                alt="Company Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                                                {formData.companyName?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <label className="absolute -bottom-2 -right-2 cursor-pointer">
                                            <div className="bg-white dark:bg-slate-800 text-indigo-600 hover:text-indigo-700 p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-slate-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                                disabled={uploadingLogo}
                                            />
                                        </label>
                                    )}
                                </div>

                                {isEditing && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">Upload Company Logo</p>
                                        <p className="text-xs text-gray-400">PNG, JPG, SVG, and WebP are supported • Max 5MB recommended</p>
                                        {uploadingLogo && <p className="text-indigo-600 text-sm mt-2">Uploading logo...</p>}
                                    </div>
                                )}
                            </div>

                            {/* Company Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                                        Company Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName || ''}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    ) : (
                                        <p className="text-lg text-gray-900 dark:text-white py-3">
                                            {formData.companyName || '—'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                                        Email
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    ) : (
                                        <p className="text-lg text-gray-900 dark:text-white py-3">
                                            {formData.email || '—'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                                        Phone
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    ) : (
                                        <p className="text-lg text-gray-900 dark:text-white py-3">
                                            {formData.phone || '—'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                                        Industry
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="industry"
                                            value={formData.industry || ''}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    ) : (
                                        <p className="text-lg text-gray-900 dark:text-white py-3">
                                            {formData.industry || '—'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                                        Company Size
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="companySize"
                                            value={formData.companySize || ''}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Select size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="500+">500+ employees</option>
                                        </select>
                                    ) : (
                                        <p className="text-lg text-gray-900 dark:text-white py-3">
                                            {formData.companySize ? `${formData.companySize} employees` : '—'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                                        Website
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website || ''}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    ) : (
                                        <p className="text-lg text-gray-900 dark:text-white py-3">
                                            {formData.website ? (
                                                <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                    {formData.website}
                                                </a>
                                            ) : '—'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Address & Description */}
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                                        Address
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-5 py-4 border border-gray-300 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 resize-y"
                                        />
                                    ) : (
                                        <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                                            {formData.address || '—'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                                        Company Description
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleChange}
                                            rows="6"
                                            className="w-full px-5 py-4 border border-gray-300 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 resize-y"
                                        />
                                    ) : (
                                        <p className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {formData.description || 'No description provided.'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Pro Status Message */}
                            {proStatus?.status === 'active' && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                                    Successfully added Pro Account. Congratulations!
                                </div>
                            )}

                            {/* Form Actions */}
                            {isEditing && (
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-medium"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData(companyData);
                                            setError('');
                                            setSuccess('');
                                        }}
                                        className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-2xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default C_CompanyProfile;