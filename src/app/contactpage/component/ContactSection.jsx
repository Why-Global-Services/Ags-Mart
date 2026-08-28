'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FcGoogle } from "react-icons/fc";
import { FaYoutube, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaPhoneAlt, FaRegClock, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { GiDiamondRing, GiCrystalShine, GiGemChain, GiCutDiamond } from "react-icons/gi";
import { BsGem } from "react-icons/bs";
import Loading from '@/app/common/Loading';
import { createUserQuery } from '@/app/interceptor/interseptor';
import { fetchAdminProfile } from '@/app/store/adminProfileSlice';

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
            background: '#78350f',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '8px',
            padding: '16px 24px',
        },
        iconTheme: {
            primary: '#fbbf24',
            secondary: '#78350f',
        },
    },
    ERROR: {
        duration: 4000,
        style: {
            background: '#7c2d12',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '8px',
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
    <div className="relative h-[450px] md:h-[500px] bg-linear-to-r from-bgvariant-2 via-amber-800 to-bgvariant-1 overflow-hidden">
        <div className="absolute inset-0">
            <Image
                src="/Jewellery.jpeg"
                alt="Luxury Jewellery Collection"
                fill
                className="object-cover opacity-30"
                priority
            />
        </div>
        
        {/* Decorative Icons */}
        {/* Top Row */}
        <div className="hidden md:block absolute top-8 left-8 opacity-20 animate-pulse">
            <GiCrystalShine className="text-5xl text-amber-200" />
        </div>
        <div className="hidden lg:block absolute top-12 left-1/4 opacity-15 animate-pulse" style={{ animationDelay: '1.5s' }}>
            <BsGem className="text-3xl text-amber-300" />
        </div>
        <div className="hidden lg:block absolute top-12 right-1/4 opacity-15 animate-pulse" style={{ animationDelay: '2.5s' }}>
            <GiGemChain className="text-3xl text-amber-300" />
        </div>
        <div className="hidden md:block absolute top-8 right-8 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
            <BsGem className="text-4xl text-amber-200" />
        </div>
        
        {/* Middle Row */}
        <div className="hidden lg:block absolute top-1/2 left-12 opacity-15 animate-pulse" style={{ animationDelay: '3s' }}>
            <GiDiamondRing className="text-4xl text-amber-300" />
        </div>
        <div className="hidden lg:block absolute top-1/2 right-12 opacity-15 animate-pulse" style={{ animationDelay: '0.8s' }}>
            <GiCrystalShine className="text-4xl text-amber-300" />
        </div>
        
        {/* Bottom Row */}
        <div className="hidden md:block absolute bottom-8 left-8 opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>
            <GiGemChain className="text-5xl text-amber-200" />
        </div>
        <div className="hidden lg:block absolute bottom-12 left-1/3 opacity-15 animate-pulse" style={{ animationDelay: '1.2s' }}>
            <GiCrystalShine className="text-3xl text-amber-300" />
        </div>
        <div className="hidden lg:block absolute bottom-12 right-1/3 opacity-15 animate-pulse" style={{ animationDelay: '2.8s' }}>
            <BsGem className="text-3xl text-amber-300" />
        </div>
        <div className="hidden md:block absolute bottom-8 right-8 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>
            <GiDiamondRing className="text-4xl text-amber-200" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
            <div className="animate-float mb-8">
                <GiCutDiamond className="text-7xl md:text-8xl text-amber-300 drop-shadow-2xl" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                Connect With Us
            </h1>
            
            <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-0.5 w-16 md:w-24 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                <GiCrystalShine className="text-2xl md:text-3xl text-amber-300 animate-pulse" />
                <div className="h-0.5 w-16 md:w-24 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            </div>
            
            <p className="text-base md:text-lg lg:text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed px-4">
                Experience luxury and elegance. Share your vision with us, and let's create something extraordinary together.
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
    const inputClasses = `w-full px-4 py-3.5 border-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
        hasError 
            ? 'border-red-400 bg-red-50 focus:ring-red-500' 
            : 'border-amber-200 hover:border-amber-300'
    }`;

    const InputComponent = rows ? 'textarea' : 'input';

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-bgvariant-3 uppercase tracking-wider flex items-center gap-1.5">
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
const ContactInfoCard = ({ icon, title, text, subtext, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-5 border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 group`}>
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-200 group-hover:border-amber-400 group-hover:shadow-md transition-all duration-300">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-amber-900 mb-1.5 uppercase tracking-wide">
                    {title}
                </h3>
                <p className="text-neutral-700 text-sm leading-relaxed break-words">
                    {text}
                </p>
                {subtext && (
                    <p className="text-neutral-600 text-xs mt-1">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    </div>
);

// ==================== Component: Social Media Section ====================
const SocialMediaSection = () => (
    <div className="bg-gradient-to-br from-bgvariant-1  to-bgvariant-2 rounded-xl p-8 text-center border border-amber-700 shadow-xl">
        <div className="animate-float">
            <GiDiamondRing className="text-5xl text-amber-300 mx-auto mb-4 drop-shadow-lg" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-3">
            Follow Our Journey
        </h3>
        <div className="h-1 w-16 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full mx-auto mb-4" />
        <p className="text-amber-100 mb-6 text-sm">
            Discover our latest collections and exclusive designs
        </p>
        <div className="flex justify-center gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, url, label, color }, index) => (
                <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-amber-50 hover:scale-110 transition-all duration-300 border border-amber-200 shadow-md hover:shadow-lg"
                >
                    <Icon className={`text-2xl ${color || ''}`} />
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

    const dispatch = useDispatch();
    const { address, primaryEmail, contactNumber } = useSelector(
        (state) => state.adminProfile
    );

    useEffect(() => {
        dispatch(fetchAdminProfile());
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [dispatch]);

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
                toast.success('Thank you for your message! We\'ll get back to you soon.', TOAST_STYLES.SUCCESS);
                
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
            icon: <FaMapMarkerAlt className="text-amber-700 text-xl" />,
            title: "Visit Us",
            text: address || "123 Luxury Avenue, Fashion District, City - 400001",
            gradient: "from-amber-50 to-amber-100/50"
        },
        {
            icon: <FaPhoneAlt className="text-amber-700 text-xl" />,
            title: "Call Us",
            text: `+91 ${contactNumber || "9876543210"}`,
            subtext: "Mon–Sat: 10AM–8PM",
            gradient: "from-orange-50 to-orange-100/50"
        },
        {
            icon: <FaEnvelope className="text-amber-700 text-xl" />,
            title: "Email Us",
            text: primaryEmail || "contact@jewellery.com",
            gradient: "from-yellow-50 to-yellow-100/50"
        },
        {
            icon: <FaRegClock className="text-amber-700 text-xl" />,
            title: "Business Hours",
            text: "Mon–Sat: 10AM–8PM",
            subtext: "Sunday: 11AM–6PM",
            gradient: "from-amber-50 to-amber-100/50"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            <HeroSection />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
                    
                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-xl border border-bgvariant-3 p-6 sm:p-8 lg:p-10 hover:shadow-2xl transition-shadow duration-300">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-bgvariant-3 rounded-xl flex items-center justify-center shadow-lg">
                                        <GiGemChain className="text-2xl text-white" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-bgvariant-3">
                                        Send us a Message
                                    </h2>
                                </div>
                                <div className="h-1 w-20 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full mb-4" />
                                <p className="text-neutral-600 text-base md:text-lg">
                                    Let us know how we can assist you with our exquisite collection.
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
                                        placeholder="John Doe"
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
                                    placeholder="Tell us about your requirements, preferences, or any questions you may have..."
                                    rows={5}
                                    helperText={!errors.message && formData.message && `${formData.message.length} characters`}
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 px-8 text-white font-semibold text-lg rounded-xl bg-bgvariant-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Sending Message...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center gap-3">
                                            <GiCrystalShine className="text-xl" />
                                            Send Message
                                            <GiCrystalShine className="text-xl" />
                                        </span>
                                    )}
                                </button>
                                
                                <p className="text-xs text-neutral-500 text-center pt-2">
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
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default ContactPage;