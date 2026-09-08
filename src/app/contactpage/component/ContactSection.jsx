'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FcGoogle } from "react-icons/fc";
import { FaYoutube, FaFacebook, FaInstagram, FaPhoneAlt, FaEnvelope, FaSeedling, FaLeaf } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiClock, FiCheckCircle } from "react-icons/fi";
import { RiCustomerService2Line, RiPlantLine } from "react-icons/ri";
import Loading from '@/app/common/Loading';
import { createUserQuery } from '@/app/interceptor/interseptor';

// ==================== Constants ====================
const FORM_FIELDS = {
    NAME: 'name',
    EMAIL: 'email',
    PHONE: 'phone',
    MESSAGE: 'message'
};

const VALIDATION_RULES = {
    NAME: {
        MIN_LENGTH: 2,
        REQUIRED: true
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        REQUIRED: true
    },
    PHONE: {
        PATTERN: /^[0-9]{10}$/,
        MAX_LENGTH: 10,
        REQUIRED: true
    },
    MESSAGE: {
        MIN_LENGTH: 10,
        REQUIRED: true
    }
};

const TOAST_STYLES = {
    SUCCESS: {
        duration: 5000,
        style: {
            background: '#047857',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '16px 24px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#047857',
        },
    },
    ERROR: {
        duration: 4000,
        style: {
            background: '#b91c1c',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '16px 24px',
        },
    }
};

const SOCIAL_LINKS = [
    { icon: FcGoogle, url: "https://www.google.com", label: "Google" },
    { icon: FaYoutube, url: "https://www.youtube.com", label: "YouTube", color: "text-red-500" },
    { icon: FaFacebook, url: "https://www.facebook.com", label: "Facebook", color: "text-blue-500" },
    { icon: FaInstagram, url: "https://www.instagram.com", label: "Instagram", color: "text-pink-500" }
];

// ==================== Utility Functions ====================
const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
        case FORM_FIELDS.NAME:
            if (!value.trim()) {
                error = 'Name is required';
            } else if (value.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH) {
                error = `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`;
            }
            break;

        case FORM_FIELDS.EMAIL:
            if (!value) {
                error = 'Email is required';
            } else if (!VALIDATION_RULES.EMAIL.PATTERN.test(value)) {
                error = 'Please enter a valid email address';
            }
            break;

        case FORM_FIELDS.PHONE:
            if (!value) {
                error = 'Phone number is required';
            } else if (!VALIDATION_RULES.PHONE.PATTERN.test(value)) {
                error = 'Please enter a valid 10-digit phone number';
            }
            break;

        case FORM_FIELDS.MESSAGE:
            if (!value.trim()) {
                error = 'Message is required';
            } else if (value.trim().length < VALIDATION_RULES.MESSAGE.MIN_LENGTH) {
                error = `Message must be at least ${VALIDATION_RULES.MESSAGE.MIN_LENGTH} characters`;
            }
            break;

        default:
            break;
    }

    return error;
};

const validateForm = (formData) => {
    const newErrors = {};
    
    Object.keys(FORM_FIELDS).forEach(key => {
        const fieldName = FORM_FIELDS[key];
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
            newErrors[fieldName] = error;
        }
    });
    
    return newErrors;
};

const sanitizePhoneInput = (value) => {
    return value.replace(/\D/g, '').slice(0, VALIDATION_RULES.PHONE.MAX_LENGTH);
};

// ==================== Component: Hero Section ====================
const HeroSection = () => (
    <div className="relative h-[400px] md:h-[460px] bg-gradient-to-r from-[#1a4a13] via-[#2d7a22] to-[#1a4a13] overflow-hidden">
        <div className="absolute inset-0">
            <Image
                src="/hero.webp"
                alt="Agrowmed Agriculture Marketplace"
                fill
                className="object-cover opacity-25"
                priority
            />
        </div>
        
        {/* Decorative Agriculture Icons */}
        <div className="hidden md:block absolute top-8 left-8 opacity-20 animate-pulse">
            <FaSeedling className="text-5xl text-green-200" />
        </div>
        <div className="hidden lg:block absolute top-12 left-1/4 opacity-15 animate-pulse" style={{ animationDelay: '1.5s' }}>
            <FaLeaf className="text-3xl text-green-300" />
        </div>
        <div className="hidden lg:block absolute top-12 right-1/4 opacity-15 animate-pulse" style={{ animationDelay: '2.5s' }}>
            <RiPlantLine className="text-4xl text-green-300" />
        </div>
        <div className="hidden md:block absolute top-8 right-8 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
            <FaSeedling className="text-4xl text-green-200" />
        </div>
        
        <div className="hidden lg:block absolute bottom-12 left-1/3 opacity-15 animate-pulse" style={{ animationDelay: '1.2s' }}>
            <FaLeaf className="text-3xl text-green-300" />
        </div>
        <div className="hidden md:block absolute bottom-8 right-8 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>
            <FaSeedling className="text-4xl text-green-200" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
            <div className="animate-float mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                    <FaSeedling className="text-4xl md:text-5xl text-green-300 drop-shadow-lg" />
                </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                Connect With Us
            </h1>
            
            <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-0.5 w-16 md:w-24 bg-gradient-to-r from-transparent via-green-300 to-transparent" />
                <FaLeaf className="text-lg md:text-xl text-green-300 animate-pulse" />
                <div className="h-0.5 w-16 md:w-24 bg-gradient-to-r from-transparent via-green-300 to-transparent" />
            </div>
            
            <p className="text-base md:text-lg lg:text-xl text-green-100 max-w-2xl mx-auto leading-relaxed px-4">
                We&apos;re here to help with your farming needs, crop questions, and orders.
            </p>
        </div>
    </div>
);

// ==================== Component: Form Input ====================
const FormInput = ({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    onBlur, 
    error, 
    touched, 
    placeholder,
    maxLength,
    helperText,
    rows
}) => {
    const hasError = touched && error;
    const inputClasses = `w-full px-4 py-3.5 border-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 ${
        hasError 
            ? 'border-red-400 bg-red-50 focus:ring-red-500' 
            : 'border-green-100 hover:border-green-300'
    }`;

    const InputComponent = rows ? 'textarea' : 'input';

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                {label} <span className="text-red-600">*</span>
            </label>
            <InputComponent
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClasses}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={rows}
                {...(rows && { style: { resize: 'none' } })}
            />
            {hasError ? (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <span className="text-sm">⚠</span> {error}
                </p>
            ) : helperText && (
                <p className="text-xs text-neutral-500">{helperText}</p>
            )}
        </div>
    );
};

// ==================== Component: Contact Info Card ====================
const ContactInfoCard = ({ icon, title, text, subtext, gradient, href }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 group`}>
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-green-200 group-hover:border-green-400 group-hover:shadow-md transition-all duration-300">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-green-900 mb-1.5 uppercase tracking-wide">
                    {title}
                </h3>
                {href ? (
                    <a href={href} className="text-gray-700 text-sm font-medium leading-relaxed break-words hover:text-green-700 transition-colors">
                        {text}
                    </a>
                ) : (
                    <p className="text-gray-700 text-sm leading-relaxed break-words">{text}</p>
                )}
                {subtext && (
                    <p className="text-gray-500 text-xs mt-1">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    </div>
);

// ==================== Component: Social Media Section ====================
const SocialMediaSection = () => (
    <div className="bg-gradient-to-br from-[#1a4a13] to-[#2d7a22] rounded-2xl p-8 text-center border border-green-800 shadow-xl">
        <div className="animate-float mb-4">
            <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <FaSeedling className="text-2xl text-green-300" />
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
            Follow Agrowmed
        </h3>
        <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full mx-auto mb-4" />
        <p className="text-green-100 mb-6 text-sm">
            Stay updated with seasonal offers, agricultural advice, and new farm products.
        </p>
        <div className="flex justify-center gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, url, label, color }, index) => (
                <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 bg-white rounded-xl flex items-center justify-center hover:bg-green-50 hover:scale-110 transition-all duration-300 border border-white/20 shadow-md hover:shadow-lg"
                >
                    <Icon className={`text-xl ${color || ''}`} />
                </a>
            ))}
        </div>
    </div>
);

// ==================== Main Component ====================
const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        const sanitizedValue = name === FORM_FIELDS.PHONE 
            ? sanitizePhoneInput(value) 
            : value;
        
        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        const error = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm(formData);
        
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setTouched({
                name: true,
                email: true,
                phone: true,
                message: true
            });
            
            toast.error('Please fix the errors in the form', TOAST_STYLES.ERROR);
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const response = await createUserQuery(formData);
            
            if (response.status) {
                toast.success('Thank you for your message! Our team will get back to you soon.', TOAST_STYLES.SUCCESS);
                
                setFormData({ 
                    name: '', 
                    email: '', 
                    phone: '', 
                    message: '' 
                });
                setErrors({});
                setTouched({});
            } else {
                toast.error(
                    response.data?.message || 'Failed to submit query. Please try again.',
                    TOAST_STYLES.ERROR
                );
            }
        } catch (error) {
            console.error('Error submitting query:', error);
            toast.error('Something went wrong. Please try again later.', TOAST_STYLES.ERROR);
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactInfoData = [
        {
            icon: <FiPhone className="text-green-700 text-xl" />,
            title: "Call Us",
            text: "+91 93444 30739",
            href: "tel:+919344430739",
            subtext: "Mon - Sat: 9:00 AM - 7:00 PM",
            gradient: "from-green-50 to-emerald-50/50"
        },
        {
            icon: <FiMail className="text-green-700 text-xl" />,
            title: "Email Us",
            text: "sales@agrowmed.com",
            href: "mailto:sales@agrowmed.com",
            subtext: "Quick response within 24 hours",
            gradient: "from-emerald-50 to-green-50/50"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/50 via-white to-green-50/30">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-green-50/20">
            <HeroSection />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
                    
                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-6 sm:p-8 lg:p-10 hover:shadow-2xl transition-shadow duration-300">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-bgvariant-1 text-white rounded-2xl flex items-center justify-center shadow-md">
                                        <RiCustomerService2Line className="text-2xl" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        Send us a Message
                                    </h2>
                                </div>
                                <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-emerald-400 rounded-full mb-3" />
                                <p className="text-gray-600 text-sm md:text-base">
                                    Have questions about our agriculture products or order status? Send us a message and our expert support team will assist you.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        label="Full Name"
                                        name={FORM_FIELDS.NAME}
                                        value={formData.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.name}
                                        touched={touched.name}
                                        placeholder="Farmer / Customer Name"
                                    />
                                    
                                    <FormInput
                                        label="Email Address"
                                        name={FORM_FIELDS.EMAIL}
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.email}
                                        touched={touched.email}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                
                                <FormInput
                                    label="Phone Number"
                                    name={FORM_FIELDS.PHONE}
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.phone}
                                    touched={touched.phone}
                                    placeholder="9876543210"
                                    maxLength={VALIDATION_RULES.PHONE.MAX_LENGTH}
                                    helperText={!errors.phone && "10-digit mobile number without country code"}
                                />
                                
                                <FormInput
                                    label="Your Message"
                                    name={FORM_FIELDS.MESSAGE}
                                    value={formData.message}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.message}
                                    touched={touched.message}
                                    placeholder="Tell us about your requirements, crops, or questions..."
                                    rows={5}
                                    helperText={!errors.message && formData.message && `${formData.message.length} characters`}
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 px-8 text-white font-semibold text-base rounded-2xl bg-bgvariant-1 hover:bg-bgvariant-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ${
                                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Sending Message...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <FaSeedling className="text-lg" />
                                            Send Message
                                        </span>
                                    )}
                                </button>
                                
                                <p className="text-xs text-gray-500 text-center pt-2">
                                    <span className="text-red-600">*</span> All fields are required
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Contact Information Sidebar */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                            {contactInfoData.map((item, index) => (
                                <ContactInfoCard key={index} {...item} />
                            ))}
                        </div>

                        <SocialMediaSection />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default ContactPage;
