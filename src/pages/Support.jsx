import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Headphones, Mail, Phone, MessageCircle, HelpCircle, Book,
    FileQuestion, Send, ArrowLeft, Building2, Clock, MapPin, CheckCircle2
} from 'lucide-react';

const PRIMARY_COLOR = '#244799';

const Support = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const contactMethods = [
        {
            icon: Phone,
            title: "Phone Support",
            description: "Speak with our support team",
            details: "1800-XXX-XXXX (Toll-Free)",
            subDetails: "Mon-Sat: 9:00 AM - 6:00 PM",
            color: "#10B981"
        },
        {
            icon: Mail,
            title: "Email Support",
            description: "Send us your queries",
            details: "support@civicconnect.gov.in",
            subDetails: "Response within 24 hours",
            color: "#3B82F6"
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with support agent",
            details: "Available in dashboard",
            subDetails: "Mon-Fri: 10:00 AM - 5:00 PM",
            color: "#8B5CF6"
        },
        {
            icon: MapPin,
            title: "Visit Us",
            description: "In-person assistance",
            details: "PMC Office, Shivajinagar",
            subDetails: "Pune - 411005",
            color: "#F59E0B"
        }
    ];

    const faqs = [
        {
            question: "How do I register a new complaint?",
            answer: "Log in to your account, navigate to 'Register Complaint', fill in the required details including location, description, and upload relevant images. Your complaint will be automatically routed to the appropriate ward officer."
        },
        {
            question: "How can I track my complaint status?",
            answer: "Go to 'My Complaints' section in your dashboard. You'll see all your complaints with their current status. Click on any complaint to view detailed progress updates and officer comments."
        },
        {
            question: "What if I'm not satisfied with the resolution?",
            answer: "You can reopen a complaint within 7 days of closure by providing a reason. The complaint will be reassigned for review. You can also escalate to higher authorities through the system."
        },
        {
            question: "How do I change my ward information?",
            answer: "Go to your Profile, click 'Request Ward Change', and select the new ward. Your request will be sent to the admin for approval. First-time ward assignments are immediate."
        },
        {
            question: "Can I update my mobile number or email?",
            answer: "For security reasons, email cannot be changed. To update your mobile number, go to Profile > Edit Profile > Update Mobile. You'll need to verify the new number via OTP."
        },
        {
            question: "How long does it take to resolve a complaint?",
            answer: "Resolution time varies based on complaint type and severity. Most complaints are addressed within 7-15 days. You'll receive notifications at each stage of the process."
        }
    ];

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
            {/* Header */}
            <div className="py-5" style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #1a3a7a 100%)` }}>
                <div className="container">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-light rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                        <Link to="/" className="text-white text-decoration-none d-flex align-items-center gap-2">
                            <Building2 size={20} />
                            <span className="fw-bold">CivicConnect</span>
                        </Link>
                    </div>
                    <div className="text-center text-white">
                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 bg-white bg-opacity-15" style={{ width: '80px', height: '80px' }}>
                            <Headphones size={36} className="text-white" />
                        </div>
                        <h1 className="fw-black mb-2">Support Center</h1>
                        <p className="opacity-90 mb-0">We're here to help you 24/7</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* Contact Methods */}
                        <div className="row g-4 mb-5">
                            {contactMethods.map((method, idx) => (
                                <div key={idx} className="col-md-6 col-lg-3">
                                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 text-center hover-lift transition-all animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3 mx-auto" style={{ width: '64px', height: '64px', backgroundColor: `${method.color}15` }}>
                                            <method.icon size={28} style={{ color: method.color }} />
                                        </div>
                                        <h6 className="fw-bold mb-2">{method.title}</h6>
                                        <p className="text-muted small mb-2">{method.description}</p>
                                        <div className="fw-bold small mb-1" style={{ color: PRIMARY_COLOR }}>{method.details}</div>
                                        <div className="text-muted extra-small">{method.subDetails}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Contact Form */}
                        <div className="card border-0 shadow-sm rounded-4 p-5 mb-5">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: `${PRIMARY_COLOR}15` }}>
                                    <Send size={24} style={{ color: PRIMARY_COLOR }} />
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-1" style={{ color: PRIMARY_COLOR }}>Send Us a Message</h4>
                                    <p className="text-muted small mb-0">Fill out the form and we'll get back to you shortly</p>
                                </div>
                            </div>

                            {submitted ? (
                                <div className="alert border-0 shadow-sm d-flex align-items-center rounded-4 animate-fadeIn" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                                    <CheckCircle2 size={20} className="me-3" />
                                    <div className="small fw-medium">Thank you! Your message has been sent successfully. We'll respond within 24 hours.</div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-muted mb-2">Your Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none"
                                                placeholder="Enter your full name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-muted mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none"
                                                placeholder="yourname@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-bold small text-muted mb-2">Subject</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                className="form-control rounded-pill border-0 bg-light py-3 fw-medium shadow-none"
                                                placeholder="What is your query about?"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-bold small text-muted mb-2">Message</label>
                                            <textarea
                                                name="message"
                                                className="form-control rounded-4 border-0 bg-light py-3 fw-medium shadow-none"
                                                rows="5"
                                                placeholder="Describe your issue or question in detail..."
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="col-12">
                                            <button
                                                type="submit"
                                                className="btn px-5 py-3 text-white rounded-pill fw-bold shadow-sm hover-lift transition-all"
                                                style={{ backgroundColor: PRIMARY_COLOR }}
                                            >
                                                <Send size={18} className="me-2" />
                                                Send Message
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* FAQs */}
                        <div className="card border-0 shadow-sm rounded-4 p-5">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: `${PRIMARY_COLOR}15` }}>
                                    <HelpCircle size={24} style={{ color: PRIMARY_COLOR }} />
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-1" style={{ color: PRIMARY_COLOR }}>Frequently Asked Questions</h4>
                                    <p className="text-muted small mb-0">Quick answers to common questions</p>
                                </div>
                            </div>

                            <div className="accordion" id="faqAccordion">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="accordion-item border-0 mb-3 rounded-4 overflow-hidden shadow-sm">
                                        <h2 className="accordion-header">
                                            <button
                                                className="accordion-button collapsed fw-bold bg-light"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target={`#faq${idx}`}
                                                style={{ color: PRIMARY_COLOR }}
                                            >
                                                <FileQuestion size={20} className="me-3 flex-shrink-0" />
                                                {faq.question}
                                            </button>
                                        </h2>
                                        <div id={`faq${idx}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                            <div className="accordion-body text-muted lh-lg">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Resources */}
                        <div className="card border-0 shadow-sm rounded-4 p-5 mt-4" style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}10 0%, ${PRIMARY_COLOR}05 100%)` }}>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: `${PRIMARY_COLOR}15` }}>
                                    <Book size={24} style={{ color: PRIMARY_COLOR }} />
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1" style={{ color: PRIMARY_COLOR }}>Additional Resources</h5>
                                    <p className="text-muted small mb-0">Helpful guides and documentation</p>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3">
                                        <div className="rounded-circle bg-success bg-opacity-10 p-2">
                                            <CheckCircle2 size={20} className="text-success" />
                                        </div>
                                        <div>
                                            <div className="fw-bold small">User Guide</div>
                                            <div className="text-muted extra-small">Complete platform walkthrough</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3">
                                        <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                                            <FileQuestion size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="fw-bold small">Video Tutorials</div>
                                            <div className="text-muted extra-small">Step-by-step video guides</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="py-4 border-top bg-white">
                <div className="container">
                    <div className="text-center">
                        <p className="text-muted small mb-3">© 2026 PMC Municipal Administration</p>
                        <div className="d-flex justify-content-center gap-4">
                            <Link to="/privacy" className="text-muted text-decoration-none small fw-medium">
                                Privacy
                            </Link>
                            <Link to="/terms" className="text-muted text-decoration-none small fw-medium">
                                Terms
                            </Link>
                            <Link to="/support" className="text-muted text-decoration-none small fw-medium" style={{ color: PRIMARY_COLOR }}>
                                Support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
          .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .hover-lift { transition: all 0.3s ease; }
          .hover-lift:hover { transform: translateY(-5px); }
          .extra-small { font-size: 11px; }
          .transition-all { transition: all 0.3s ease; }
        `}} />
        </div>
    );
};

export default Support;
