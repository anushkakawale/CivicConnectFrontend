import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, UserCheck, FileText, ArrowLeft, Building2 } from 'lucide-react';

const PRIMARY_COLOR = '#244799';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            content: [
                "Personal identification information (Name, email address, phone number)",
                "Address and ward information for complaint routing",
                "Complaint details, images, and location data",
                "Device information and usage analytics",
                "Communication preferences and notification settings"
            ]
        },
        {
            icon: Lock,
            title: "How We Use Your Information",
            content: [
                "To process and route your civic complaints to appropriate authorities",
                "To send notifications about complaint status updates",
                "To improve our services and user experience",
                "To comply with legal obligations and municipal regulations",
                "To prevent fraud and ensure system security"
            ]
        },
        {
            icon: Shield,
            title: "Data Protection & Security",
            content: [
                "All data is encrypted using government-grade encryption standards",
                "Secure servers with regular security audits and updates",
                "Access controls and authentication mechanisms",
                "Regular backups and disaster recovery procedures",
                "Compliance with data protection regulations"
            ]
        },
        {
            icon: Eye,
            title: "Information Sharing",
            content: [
                "We do not sell your personal information to third parties",
                "Data is shared only with relevant municipal officers for complaint resolution",
                "Anonymous aggregate data may be used for public reports",
                "Legal disclosures only when required by law",
                "Your consent is required for any other data sharing"
            ]
        },
        {
            icon: UserCheck,
            title: "Your Rights",
            content: [
                "Access your personal data at any time through your profile",
                "Request correction of inaccurate information",
                "Request deletion of your account and associated data",
                "Opt-out of non-essential communications",
                "Lodge complaints about data handling practices"
            ]
        },
        {
            icon: FileText,
            title: "Data Retention",
            content: [
                "Active accounts: Data retained as long as account is active",
                "Closed complaints: Retained for 7 years for record-keeping",
                "Inactive accounts: Data may be archived after 2 years of inactivity",
                "Deleted accounts: Personal data removed within 30 days",
                "Legal requirements may override standard retention periods"
            ]
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
                            <Shield size={36} className="text-white" />
                        </div>
                        <h1 className="fw-black mb-2">Privacy Policy</h1>
                        <p className="opacity-90 mb-0">Last updated: February 2026</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* Introduction */}
                        <div className="card border-0 shadow-sm rounded-4 p-5 mb-4">
                            <h4 className="fw-bold mb-3" style={{ color: PRIMARY_COLOR }}>Introduction</h4>
                            <p className="text-muted mb-0 lh-lg">
                                CivicConnect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our municipal complaint management system. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                            </p>
                        </div>

                        {/* Sections */}
                        {sections.map((section, idx) => (
                            <div key={idx} className="card border-0 shadow-sm rounded-4 p-5 mb-4 animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: `${PRIMARY_COLOR}15` }}>
                                        <section.icon size={24} style={{ color: PRIMARY_COLOR }} />
                                    </div>
                                    <h5 className="fw-bold mb-0" style={{ color: PRIMARY_COLOR }}>{section.title}</h5>
                                </div>
                                <ul className="list-unstyled mb-0">
                                    {section.content.map((item, i) => (
                                        <li key={i} className="d-flex align-items-start gap-3 mb-3">
                                            <div className="rounded-circle bg-success flex-shrink-0 mt-1" style={{ width: '8px', height: '8px' }}></div>
                                            <span className="text-muted lh-lg">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Contact */}
                        <div className="card border-0 shadow-sm rounded-4 p-5" style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}10 0%, ${PRIMARY_COLOR}05 100%)` }}>
                            <h5 className="fw-bold mb-3" style={{ color: PRIMARY_COLOR }}>Contact Us</h5>
                            <p className="text-muted mb-4">
                                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="small text-muted mb-1">Email</div>
                                    <div className="fw-bold">privacy@civicconnect.gov.in</div>
                                </div>
                                <div className="col-md-6">
                                    <div className="small text-muted mb-1">Phone</div>
                                    <div className="fw-bold">1800-XXX-XXXX (Toll-Free)</div>
                                </div>
                                <div className="col-12">
                                    <div className="small text-muted mb-1">Address</div>
                                    <div className="fw-bold">Pune Municipal Corporation, Shivajinagar, Pune - 411005</div>
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
                            <Link to="/privacy" className="text-muted text-decoration-none small fw-medium" style={{ color: PRIMARY_COLOR }}>
                                Privacy
                            </Link>
                            <Link to="/terms" className="text-muted text-decoration-none small fw-medium">
                                Terms
                            </Link>
                            <Link to="/support" className="text-muted text-decoration-none small fw-medium">
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
        `}} />
        </div>
    );
};

export default PrivacyPolicy;
