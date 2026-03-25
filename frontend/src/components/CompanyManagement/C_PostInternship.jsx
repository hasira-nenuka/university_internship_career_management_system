import React, { useState } from 'react';
import { postInternship, uploadImage } from './C_CompanyUtils';

const JOB_CATEGORIES = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile App Developer',
    'QA Engineer',
    'Software Tester',
    'Automation Tester',
    'DevOps Engineer',
    'Cloud Engineer',
    'System Administrator',
    'Data Analyst',
    'Data Scientist',
    'Machine Learning Engineer',
    'UI/UX Designer',
    'Project Manager',
    'Product Manager',
    'Business Analyst',
    'Cybersecurity Analyst'
];

const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara',
    'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota',
    'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
    'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam',
    'Anuradhapura', 'Polonnaruwa',
    'Badulla', 'Moneragala',
    'Ratnapura', 'Kegalle'
];

const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
};

const isFutureDate = (dateString) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate > today;
};

const C_PostInternship = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        skills: '',
        location: '',
        type: 'Full-time',
        duration: '',
        stipend: '',
        openings: 1,
        deadline: ''
    });
    
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if ((name === 'stipend' || name === 'openings') && !/^\d*$/.test(value)) {
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const uploadedImages = [];
        
        setUploading(true);
        
        for (const file of files) {
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                try {
                    const result = await uploadImage(file);
                    uploadedImages.push(result.data.url);
                } catch (err) {
                    setError('Failed to upload image: ' + err.message);
                }
            } else {
                setError('Only JPEG/JPG images are allowed');
            }
        }
        
        setImages(uploadedImages);
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.stipend || Number(formData.stipend) < 0) {
            setError('Stipend must be a valid non-negative number');
            setLoading(false);
            return;
        }

        if (!formData.openings || Number(formData.openings) < 1) {
            setError('Number of openings must be at least 1');
            setLoading(false);
            return;
        }

        if (!isFutureDate(formData.deadline)) {
            setError('Application deadline must be a future date');
            setLoading(false);
            return;
        }
        
        try {
            const companyId = localStorage.getItem('companyId');
            
            const requirementsArray = formData.requirements.split(',').map(req => req.trim());
            const skillsArray = formData.skills.split(',').map(skill => skill.trim());
            
            const result = await postInternship({
                companyId,
                title: formData.title,
                description: formData.description,
                requirements: requirementsArray,
                skills: skillsArray,
                location: formData.location,
                type: formData.type,
                duration: formData.duration,
                stipend: formData.stipend,
                openings: parseInt(formData.openings),
                deadline: formData.deadline,
                images: images
            });
            
            if (result.success) {
                setSuccess('Internship posted successfully!');
                setFormData({
                    title: '',
                    description: '',
                    requirements: '',
                    skills: '',
                    location: '',
                    type: 'Full-time',
                    duration: '',
                    stipend: '',
                    openings: 1,
                    deadline: ''
                });
                setImages([]);
                setTimeout(() => {
                    if (onSuccess) onSuccess(result.data);
                }, 1200);
            }
        } catch (err) {
            setError(err.message || 'Failed to post internship');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Post New Internship</h2>
            
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Internship Title *
                        </label>
                        <select
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Job Category</option>
                            {JOB_CATEGORIES.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Location *
                        </label>
                        <select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select District</option>
                            {DISTRICTS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Internship Type *
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Duration *
                        </label>
                        <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 3 months, 6 months"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stipend *
                        </label>
                        <input
                            type="number"
                            name="stipend"
                            value={formData.stipend}
                            onChange={handleChange}
                            required
                            min="0"
                            inputMode="numeric"
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 2000"
                        />
                        <p className="text-sm text-gray-500 mt-1">Enter stipend amount using numbers only</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Number of Openings *
                        </label>
                        <input
                            type="number"
                            name="openings"
                            value={formData.openings}
                            onChange={handleChange}
                            required
                            min="1"
                            inputMode="numeric"
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Application Deadline *
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                            min={getTomorrowDateString()}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Deadline must be a future date</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Upload Images (JPEG/JPG)
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg"
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        />
                        {uploading && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Uploading images...</p>}
                        {images.length > 0 && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                ✓ {images.length} image(s) uploaded successfully
                            </p>
                        )}
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="5"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Describe the internship role, responsibilities, learning opportunities, and what makes this internship unique..."
                    ></textarea>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Requirements (comma-separated) *
                    </label>
                    <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Bachelor's degree in Computer Science, Strong programming skills, Good communication, Team player"
                    ></textarea>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Separate each requirement with a comma</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Required Skills (comma-separated) *
                    </label>
                    <textarea
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., JavaScript, React, Node.js, Python, MongoDB"
                    ></textarea>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Separate each skill with a comma</p>
                </div>
                
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                    {loading ? 'Posting...' : 'Post Internship'}
                </button>
            </form>
        </div>
    );
};

export default C_PostInternship;