import React, { useEffect, useState } from 'react';
import { uploadImage } from './C_CompanyUtils';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

const STYLE_PRESETS = {
    modern: {
        name: 'Modern Blue',
        background: ['#0f172a', '#1d4ed8'],
        accent: '#38bdf8',
        secondaryAccent: '#22c55e'
    },
    warm: {
        name: 'Warm Orange',
        background: ['#7c2d12', '#ea580c'],
        accent: '#fbbf24',
        secondaryAccent: '#fde68a'
    },
    elegant: {
        name: 'Elegant Dark',
        background: ['#111827', '#374151'],
        accent: '#a78bfa',
        secondaryAccent: '#60a5fa'
    }
};

// Job Description Templates
const JOB_DESCRIPTIONS = {
    'Frontend Developer': 'We are seeking a talented Frontend Developer to create responsive, accessible, and visually polished user interfaces. You will work closely with designers and backend engineers to deliver seamless experiences, improve UI performance, and maintain clean component-based code.',
    'Backend Developer': 'Join our team as a Backend Developer and help build secure, scalable server-side systems. You will design APIs, manage databases, optimize performance, and collaborate with frontend teams to deliver reliable application features.',
    'Full Stack Developer': 'We are looking for a Full Stack Developer who can contribute across the full product stack. You will build end-to-end features, connect frontend and backend services, and help shape product quality through thoughtful engineering.',
    'Mobile App Developer': 'Build mobile applications that are fast, intuitive, and dependable. As a Mobile App Developer, you will develop cross-platform or native experiences, improve performance, and collaborate with product teams to deliver high-quality mobile solutions.',
    'QA Engineer': 'Help us maintain exceptional product quality as a QA Engineer. You will design test cases, validate features, identify defects, and work closely with developers to ensure reliable releases and a strong user experience.',
    'Software Tester': 'We are looking for a Software Tester to verify product behavior across features and environments. You will execute test scenarios, document issues clearly, and support the team in delivering stable, well-tested software.',
    'Automation Tester': 'Join us as an Automation Tester and help improve test coverage through reliable automated testing. You will create and maintain automated test suites, support regression testing, and strengthen product quality at scale.',
    'DevOps Engineer': 'We are seeking a DevOps Engineer to build efficient delivery pipelines and dependable infrastructure. You will work with CI/CD, cloud platforms, deployment automation, and monitoring to support fast and stable releases.',
    'Cloud Engineer': 'As a Cloud Engineer, you will design, implement, and maintain cloud-based infrastructure solutions. Your work will support scalability, security, and reliability while helping the team use cloud services effectively.',
    'System Administrator': 'Join us as a System Administrator and help keep our systems secure, available, and well maintained. You will manage servers, user access, backups, and operational support to ensure smooth day-to-day performance.',
    'Data Analyst': 'We are looking for a Data Analyst who can turn raw data into actionable insights. You will analyze trends, prepare reports, and support decision-making by translating data into clear business recommendations.',
    'Data Scientist': 'As a Data Scientist, you will explore complex datasets, build predictive models, and uncover patterns that drive smart decisions. You will combine statistical thinking, machine learning, and data visualization to solve meaningful problems.',
    'Machine Learning Engineer': 'We are seeking a Machine Learning Engineer to develop and deploy intelligent systems. You will work on model training, evaluation, deployment, and optimization while collaborating with product and data teams.',
    'UI/UX Designer': 'Create beautiful and intuitive user experiences as a UI/UX Designer. You will conduct research, design wireframes and prototypes, and collaborate with developers to shape products that feel polished and easy to use.',
    'Project Manager': 'We are looking for a Project Manager to coordinate teams, timelines, and delivery goals. You will keep projects on track, align stakeholders, and help ensure work is delivered clearly, efficiently, and on time.'
};

const JOB_TEMPLATES = Object.keys(JOB_DESCRIPTIONS);

const IMAGE_PLACEMENTS = {
    top: { label: 'Top of post' },
    middle: { label: 'Middle of post' },
    left: { label: 'Left of post' },
    right: { label: 'Right of post' },
    bottom: { label: 'Bottom of post' }
};

const IMAGE_FITS = {
    crop: 'Crop to frame',
    fit: 'Fit inside frame'
};

const LOGO_PLACEMENTS = {
    header: 'Header',
    bottom: 'Bottom',
    left: 'Left side',
    right: 'Right side'
};

const IMAGE_REMOVE_BACKGROUND_THRESHOLD = 245;

const DISTRICT_OPTIONS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const C_JobPostBot = () => {
    const [formData, setFormData] = useState({
        title: '',
        companyName: localStorage.getItem('companyName') || '',
        location: '',
        duration: '',
        stipend: '',
        deadline: '',
        description: ''
    });
    
    const [styleKey, setStyleKey] = useState('modern');
    const [referenceImage, setReferenceImage] = useState(null);
    const [referencePreview, setReferencePreview] = useState('');
    const [imagePlacement, setImagePlacement] = useState('middle');
    const [companyLogoFile, setCompanyLogoFile] = useState(null);
    const [companyLogoPreview, setCompanyLogoPreview] = useState(localStorage.getItem('companyLogo') || localStorage.getItem('logo') || '');
    const [logoPlacement, setLogoPlacement] = useState('header');
    const [imageFit, setImageFit] = useState('crop');
    const [removeBackground, setRemoveBackground] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [generatedPosterUrl, setGeneratedPosterUrl] = useState('');
    const [uploadedPosterUrl, setUploadedPosterUrl] = useState('');
    const [generatedPosterFile, setGeneratedPosterFile] = useState(null);
    const [showDescriptionGenerator, setShowDescriptionGenerator] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

    useEffect(() => {
        return () => {
            if (generatedPosterUrl) {
                URL.revokeObjectURL(generatedPosterUrl);
            }
            if (referencePreview) {
                URL.revokeObjectURL(referencePreview);
            }
            if (companyLogoPreview && companyLogoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(companyLogoPreview);
            }
        };
    }, [generatedPosterUrl, referencePreview, companyLogoPreview]);

    const buildDescriptionWithCompany = (description, companyName) => {
        const safeDescription = String(description || '').trim();
        const safeCompanyName = String(companyName || '').trim();

        if (!safeCompanyName) {
            return safeDescription;
        }

        if (!safeDescription) {
            return safeCompanyName + ' is hiring interns. Apply now to join our team.';
        }

        if (safeDescription.toLowerCase().includes(safeCompanyName.toLowerCase())) {
            return safeDescription;
        }

        return safeCompanyName + ' is hiring. ' + safeDescription;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleTitleChange = (event) => {
        const { value } = event.target;
        const generatedDescription = JOB_DESCRIPTIONS[value] || '';

        setFormData((current) => ({
            ...current,
            title: value,
            description: buildDescriptionWithCompany(generatedDescription, current.companyName)
        }));
    };

    const handleGenerateDescription = async () => {
        if (!formData.title) {
            setErrorMessage('Please select a job title first.');
            return;
        }
        
        setIsGeneratingDescription(true);
        setErrorMessage('');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const selectedDesc = JOB_DESCRIPTIONS[formData.title] || 'We are looking for a talented professional to join our team. Please apply with your resume and cover letter.';
            
            setFormData(current => ({
                ...current,
                description: buildDescriptionWithCompany(selectedDesc, current.companyName)
            }));
            setStatusMessage('Job description generated successfully!');
        } catch (err) {
            setErrorMessage('Failed to generate description.');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleTemplateSelect = (position) => {
        const generatedDescription = JOB_DESCRIPTIONS[position] || 'We are looking for a talented professional to join our team. Please apply with your resume and cover letter.';

        setFormData((current) => ({
            ...current,
            title: position,
            description: buildDescriptionWithCompany(generatedDescription, current.companyName)
        }));
        setShowDescriptionGenerator(false);
        setStatusMessage('Description loaded: ' + position);
        setErrorMessage('');
    };

    const handleCompanyLogoChange = (event) => {
        const file = event.target.files ? event.target.files[0] : null;

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please upload a valid logo image file.');
            return;
        }

        if (companyLogoPreview && companyLogoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(companyLogoPreview);
        }

        const logoUrl = URL.createObjectURL(file);
        setCompanyLogoFile(file);
        setCompanyLogoPreview(logoUrl);
        setStatusMessage('Company logo selected successfully.');
        setErrorMessage('');
    };

    const handleReferenceImage = (file) => {
        if (!file) {
            setReferenceImage(null);
            setReferencePreview('');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please upload an image file.');
            return;
        }

        if (referencePreview) {
            URL.revokeObjectURL(referencePreview);
        }

        setErrorMessage('');
        setReferenceImage(file);
        setReferencePreview(URL.createObjectURL(file));
    };

    const handleFileChange = (event) => {
        const file = event.target.files ? event.target.files[0] : null;
        handleReferenceImage(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files ? event.dataTransfer.files[0] : null;
        handleReferenceImage(file);
    };

    const drawRoundedRect = (ctx, x, y, width, height, radius) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    };

    const wrapText = (ctx, text, x, y, maxWidth, lineHeight, maxLines) => {
        const words = String(text || '').split(' ');
        let line = '';
        let lineCount = 0;

        for (let i = 0; i < words.length; i += 1) {
            const testLine = line ? line + ' ' + words[i] : words[i];
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && line) {
                ctx.fillText(line, x, y + lineCount * lineHeight);
                line = words[i];
                lineCount += 1;

                if (maxLines && lineCount >= maxLines) {
                    return y + lineCount * lineHeight;
                }
            } else {
                line = testLine;
            }
        }

        if (line) {
            ctx.fillText(line, x, y + lineCount * lineHeight);
        }

        return y + lineCount * lineHeight;
    };

    const loadImage = (source) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image'));
        image.src = source;
    });

    const createCanvasImageSource = async (image) => {
        if (!removeBackground) {
            return image;
        }

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = image.width;
        sourceCanvas.height = image.height;

        const sourceContext = sourceCanvas.getContext('2d');
        if (!sourceContext) {
            return image;
        }

        sourceContext.drawImage(image, 0, 0);
        const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            const red = pixels[i];
            const green = pixels[i + 1];
            const blue = pixels[i + 2];
            const brightness = (red + green + blue) / 3;

            if (brightness >= IMAGE_REMOVE_BACKGROUND_THRESHOLD) {
                pixels[i + 3] = 0;
            }
        }

        sourceContext.putImageData(imageData, 0, 0);
        return sourceCanvas;
    };

    const drawImageInFrame = (ctx, source, frame) => {
        const sourceWidth = source.width || 1;
        const sourceHeight = source.height || 1;
        const scaleX = frame.width / sourceWidth;
        const scaleY = frame.height / sourceHeight;
        const scale = imageFit === 'fit' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
        const drawWidth = sourceWidth * scale;
        const drawHeight = sourceHeight * scale;
        const drawX = frame.x + (frame.width - drawWidth) / 2;
        const drawY = frame.y + (frame.height - drawHeight) / 2;

        ctx.save();
        drawRoundedRect(ctx, frame.x, frame.y, frame.width, frame.height, frame.radius || 28);
        ctx.clip();
        ctx.drawImage(source, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    };

    const drawImageCard = (ctx, source, frame, label) => {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        drawRoundedRect(ctx, frame.x, frame.y, frame.width, frame.height, frame.radius || 32);
        ctx.fill();

        if (source) {
            drawImageInFrame(ctx, source, frame);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            drawRoundedRect(ctx, frame.x + 12, frame.y + 12, frame.width - 24, frame.height - 24, 24);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = '600 24px Arial';
            ctx.fillText(label || 'Reference image', frame.x + 32, frame.y + frame.height / 2);
        }

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, frame.x, frame.y, frame.width, frame.height, frame.radius || 32);
        ctx.stroke();
        ctx.restore();
    };

    const drawCompanyLogo = (ctx, source) => {
        if (!source) {
            return;
        }

        const configByPlacement = {
            header: { x: 905, y: 155, radius: 52 },
            bottom: { x: 905, y: 1170, radius: 50 },
            left: { x: 150, y: 675, radius: 46 },
            right: { x: 930, y: 675, radius: 46 }
        };

        const config = configByPlacement[logoPlacement] || configByPlacement.header;

        ctx.save();
        ctx.beginPath();
        ctx.arc(config.x, config.y, config.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(config.x, config.y, config.radius, 0, Math.PI * 2);
        ctx.clip();

        const scale = Math.max((config.radius * 2) / (source.width || 1), (config.radius * 2) / (source.height || 1));
        const drawWidth = (source.width || 1) * scale;
        const drawHeight = (source.height || 1) * scale;
        const drawX = config.x - drawWidth / 2;
        const drawY = config.y - drawHeight / 2;
        ctx.drawImage(source, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    };

    const getPosterLayout = () => {
        const layouts = {
            top: {
                image: { x: 110, y: 255, width: 860, height: 230, radius: 34 },
                titleY: 560,
                descriptionY: 650,
                descriptionWidth: 860,
                descriptionLines: 5,
                detailsY: 820
            },
            middle: {
                image: { x: 110, y: 620, width: 860, height: 250, radius: 34 },
                titleY: 290,
                descriptionY: 385,
                descriptionWidth: 860,
                descriptionLines: 5,
                detailsY: 910
            },
            left: {
                image: { x: 110, y: 370, width: 320, height: 320, radius: 34 },
                titleX: 470,
                titleY: 345,
                descriptionX: 470,
                descriptionY: 435,
                descriptionWidth: 480,
                descriptionLines: 5,
                detailsY: 760
            },
            right: {
                image: { x: 650, y: 370, width: 320, height: 320, radius: 34 },
                titleX: 110,
                titleY: 345,
                descriptionX: 110,
                descriptionY: 435,
                descriptionWidth: 480,
                descriptionLines: 5,
                detailsY: 760
            },
            bottom: {
                image: { x: 110, y: 900, width: 860, height: 220, radius: 34 },
                titleY: 300,
                descriptionY: 390,
                descriptionWidth: 860,
                descriptionLines: 5,
                detailsY: 600
            }
        };

        return layouts[imagePlacement] || layouts.middle;
    };

    const buildPoster = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas is not supported in this browser.');
        }

        const preset = STYLE_PRESETS[styleKey] || STYLE_PRESETS.modern;
        const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        gradient.addColorStop(0, preset.background[0]);
        gradient.addColorStop(1, preset.background[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.arc(930, 120, 250, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(150, 1180, 240, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(70, 70, 940, 1210);

        ctx.fillStyle = preset.accent;
        drawRoundedRect(ctx, 70, 70, 940, 170, 40);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 54px Arial';
        ctx.fillText('Internship Opportunity', 110, 150);
        ctx.font = '500 28px Arial';
        ctx.fillText(formData.companyName || 'Company Name', 110, 195);

        const layout = getPosterLayout();
        let processedImage = null;
        let companyLogoImage = null;

        if (referenceImage) {
            const imageUrl = URL.createObjectURL(referenceImage);
            try {
                const loadedImage = await loadImage(imageUrl);
                processedImage = await createCanvasImageSource(loadedImage);
            } finally {
                URL.revokeObjectURL(imageUrl);
            }
        }

        if (companyLogoFile) {
            const logoUrl = URL.createObjectURL(companyLogoFile);
            try {
                companyLogoImage = await loadImage(logoUrl);
            } finally {
                URL.revokeObjectURL(logoUrl);
            }
        } else if (companyLogoPreview) {
            try {
                companyLogoImage = await loadImage(companyLogoPreview);
            } catch (error) {
                companyLogoImage = null;
            }
        }

        ctx.fillStyle = '#0f172a';
        ctx.font = '700 66px Arial';
        wrapText(ctx, formData.title || 'Job Title', layout.titleX || 110, layout.titleY, layout.descriptionWidth || 820, 74, 2);

        ctx.fillStyle = '#334155';
        ctx.font = '400 28px Arial';
        wrapText(
            ctx,
            buildDescriptionWithCompany(formData.description, formData.companyName) || 'Add a short job description to create a clean internship poster.',
            layout.descriptionX || 110,
            layout.descriptionY,
            layout.descriptionWidth || 820,
            42,
            layout.descriptionLines || 6
        );

        drawCompanyLogo(ctx, companyLogoImage);

        drawImageCard(ctx, processedImage, layout.image, 'Upload an image to place it here');

        ctx.fillStyle = '#e2e8f0';
        drawRoundedRect(ctx, 110, layout.detailsY, 860, 250, 32);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = '700 28px Arial';
        ctx.fillText('Key Details', 150, layout.detailsY + 55);

        ctx.font = '500 26px Arial';
        const details = [
            'Location: ' + (formData.location || 'Not selected'),
            'Duration: ' + (formData.duration || 'Not set'),
            'Stipend: ' + (formData.stipend ? 'Rs. ' + formData.stipend : 'Not set'),
            'Deadline: ' + (formData.deadline || 'Not set')
        ];

        details.forEach((detail, index) => {
            ctx.fillText(detail, 150, layout.detailsY + 105 + index * 48);
        });

        if (imagePlacement === 'bottom') {
            ctx.fillStyle = preset.secondaryAccent;
            drawRoundedRect(ctx, 110, 900, 860, 220, 32);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 30px Arial';
            ctx.fillText('Featured Image', 150, 955);
            drawImageCard(ctx, processedImage, { x: 110, y: 900, width: 860, height: 220, radius: 32 }, 'Upload an image to place it here');
        }

        ctx.fillStyle = '#64748b';
        ctx.font = '500 22px Arial';
        ctx.fillText('Generated by INTERNIX Company Portal', 110, 1245);

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Unable to generate the poster image.'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleGenerate = async () => {
        if (!formData.title || !formData.companyName || !formData.location) {
            setErrorMessage('Please fill in the title, company name, and location before generating the poster.');
            return;
        }

        setIsGenerating(true);
        setErrorMessage('');
        setStatusMessage('');
        setUploadedPosterUrl('');

        try {
            const blob = await buildPoster();
            const posterFile = new File([blob], 'internship-poster.jpg', { type: 'image/jpeg' });

            if (generatedPosterUrl) {
                URL.revokeObjectURL(generatedPosterUrl);
            }

            const posterUrl = URL.createObjectURL(blob);
            setGeneratedPosterUrl(posterUrl);
            setGeneratedPosterFile(posterFile);
            setStatusMessage('Poster generated successfully.');
        } catch (error) {
            setErrorMessage(error.message || 'Failed to generate poster.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!generatedPosterUrl) return;

        const link = document.createElement('a');
        link.href = generatedPosterUrl;
        link.download = 'internship-poster.jpg';
        link.click();
    };

    const handleUpload = async () => {
        if (!generatedPosterFile) {
            setErrorMessage('Generate the poster before uploading it.');
            return;
        }

        setIsUploading(true);
        setErrorMessage('');
        setStatusMessage('');

        try {
            const result = await uploadImage(generatedPosterFile);
            const uploadedUrl = (result && result.data && result.data.url) || '';
            setUploadedPosterUrl(uploadedUrl);
            setStatusMessage('Poster uploaded successfully.');
        } catch (error) {
            setErrorMessage(error.message || 'Failed to upload poster.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">INTERNIX Job Post Bot</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                    Create a clean image poster for your internship post, then download or upload it for use in your listing.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Company Name</label>
                        <input
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Job Title</label>
                        <select
                            name="title"
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Select Job Position</option>
                            {JOB_TEMPLATES.map((position) => (
                                <option key={position} value={position}>{position}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Location</label>
                        <select
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Select Location</option>
                            {DISTRICT_OPTIONS.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Duration</label>
                        <input
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="3 months"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Stipend</label>
                        <input
                            name="stipend"
                            value={formData.stipend}
                            onChange={handleChange}
                            placeholder="25000"
                            inputMode="numeric"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Short description for the poster"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                        
                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isGeneratingDescription || !formData.title}
                                className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-60 text-sm"
                            >
                                {isGeneratingDescription ? 'Generating...' : 'Generate Description'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setShowDescriptionGenerator(!showDescriptionGenerator)}
                                className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700 text-sm"
                            >
                                Job Templates
                            </button>
                        </div>
                    </div>

                    {showDescriptionGenerator && (
                        <div className="md:col-span-2 rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/40">
                            <h4 className="mb-3 font-semibold text-cyan-900 dark:text-cyan-200">Select Job Position Template:</h4>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                                {JOB_TEMPLATES.map((position) => (
                                    <button
                                        key={position}
                                        type="button"
                                        onClick={() => handleTemplateSelect(position)}
                                        className="rounded-lg border border-cyan-400 bg-white px-3 py-2 text-xs font-medium text-cyan-700 hover:bg-cyan-100 dark:border-cyan-600 dark:bg-slate-950 dark:text-cyan-300 dark:hover:bg-slate-900"
                                    >
                                        {position}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
                    <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={handleDrop}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">Reference Image</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Drag and drop an image here or choose one from your device.</p>
                            </div>
                            <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                {IMAGE_PLACEMENTS[imagePlacement]?.label}
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-3 block w-full text-sm text-gray-700 dark:text-slate-300"
                        />
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            {Object.entries(IMAGE_PLACEMENTS).map(([key, option]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setImagePlacement(key)}
                                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                        imagePlacement === key
                                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                                            : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-400/50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {Object.entries(IMAGE_FITS).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setImageFit(key)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        imageFit === key
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                            : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setRemoveBackground((current) => !current)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    removeBackground
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-800'
                                }`}
                            >
                                Remove background
                            </button>
                        </div>
                        {referencePreview && (
                            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Uploaded image preview</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">This is the image that will be composed into the poster.</p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        {imageFit === 'crop' ? 'Crop mode' : 'Fit mode'}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-4 dark:bg-slate-900">
                                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                                        <img src={referencePreview} alt="Reference preview" className="max-h-60 w-full object-contain" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">Company Logo</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Upload your company logo and choose where it appears on the poster.</p>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCompanyLogoChange}
                                className="mt-3 block w-full text-sm text-gray-700 dark:text-slate-300"
                            />

                            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                                {Object.entries(LOGO_PLACEMENTS).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setLogoPlacement(key)}
                                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                            logoPlacement === key
                                                ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                                                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-400/50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {companyLogoPreview && (
                                <div className="mt-4 flex items-center gap-3">
                                    <img src={companyLogoPreview} alt="Company logo preview" className="h-14 w-14 rounded-full border border-slate-200 object-cover dark:border-slate-700" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Logo position: {LOGO_PLACEMENTS[logoPlacement]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 self-start rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Style</label>
                        <select
                            value={styleKey}
                            onChange={(event) => setStyleKey(event.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                            {Object.entries(STYLE_PRESETS).map(([key, preset]) => (
                                <option key={key} value={key}>{preset.name}</option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Poster'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={!generatedPosterUrl}
                            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Download Poster
                        </button>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={!generatedPosterUrl || isUploading}
                            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Poster'}
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                        {errorMessage}
                    </div>
                )}

                {statusMessage && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {statusMessage}
                    </div>
                )}

                {uploadedPosterUrl && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                        Uploaded image URL: <a href={uploadedPosterUrl} target="_blank" rel="noreferrer" className="break-all underline">{uploadedPosterUrl}</a>
                    </div>
                )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">A poster preview with the selected image layout.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                        {IMAGE_PLACEMENTS[imagePlacement]?.label}
                    </span>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-950">
                    {generatedPosterUrl ? (
                        <img src={generatedPosterUrl} alt="Generated internship poster" className="w-full object-contain" />
                    ) : (
                        <div className="flex min-h-[320px] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 text-center text-sm text-slate-500 dark:from-slate-950 dark:to-slate-900 dark:text-slate-400">
                            Fill the form and generate a poster to see the result here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default C_JobPostBot;
