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
        setFormData(companyData || {});
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
        if (status === 'active') return 'bg-emerald-100 text-emerald-700';
        if (status === 'pending') return 'bg-amber-100 text-amber-700';
        if (status === 'expired') return 'bg-rose-100 text-rose-700';
        return 'bg-slate-100 text-slate-700';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
            setUploadingLogo(true);
            try {
                const result = await uploadImage(file);
                setFormData({
                    ...formData,
                    logo: result.data.url
                });
            } catch (err) {
                setError('Failed to upload logo');
            } finally {
                setUploadingLogo(false);
            }
        } else {
            setError('Please select a JPEG/JPG image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            await updateCompanyProfile(formData);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!companyData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Company Profile</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-300 px-4 py-3 rounded-lg mb-6">
                    {success}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-emerald-800">Pro Account</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    Rs 6,000.00 every 30 days. Pro gives unlimited direct student search and unlimited job posts.
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProBadgeColor(proStatus?.status || 'inactive')}`}>
                                        {(proStatus?.status || 'inactive').toUpperCase()}
                                    </span>
                                    {proStatus?.expiresAt && (
                                        <span className="text-xs text-slate-500">
                                            Expires: {new Date(proStatus.expiresAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate('/payments/pro-upgrade', {
                                    state: {
                                        companyId: localStorage.getItem('companyId'),
                                        companyName: companyData?.companyName || localStorage.getItem('companyName') || ''
                                    }
                                })}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 whitespace-nowrap"
                            >
                                Update Pro Account
                            </button>
                        </div>
                    </div>

                    {proStatus?.status === 'active' && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                            Successfully added Pro Account. Congratulations!
                        </div>
                    )}

                    {/* Logo Section */}
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                formData.companyName?.charAt(0)
                            )}
                        </div>
                        {isEditing && (
                            <div>
                                <label className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">
                                    <span>Upload Logo (JPEG/JPG)</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={uploadingLogo}
                                    />
                                </label>
                                {uploadingLogo && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Uploading...</p>}
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Company Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900 dark:text-slate-100">{formData.companyName}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Email
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900 dark:text-slate-100">{formData.email}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Phone
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900 dark:text-slate-100">{formData.phone}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Industry
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="industry"
                                    value={formData.industry || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900 dark:text-slate-100">{formData.industry}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Company Size
                            </label>
                            {isEditing ? (
                                <select
                                    name="companySize"
                                    value={formData.companySize || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                            ) : (
                                <p className="text-gray-900 dark:text-slate-100">{formData.companySize} employees</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Website
                            </label>
                            {isEditing ? (
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    {formData.website}
                                </a>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Address
                        </label>
                        {isEditing ? (
                            <textarea
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                            ></textarea>
                        ) : (
                            <p className="text-gray-900 dark:text-slate-100">{formData.address}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Company Description
                        </label>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                rows="5"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                            ></textarea>
                        ) : (
                            <p className="text-gray-900 dark:text-slate-100 whitespace-pre-wrap">{formData.description}</p>
                        )}
                    </div>
                    
                    {isEditing && (
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData(companyData);
                                }}
                                className="px-6 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-slate-100 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default C_CompanyProfile;