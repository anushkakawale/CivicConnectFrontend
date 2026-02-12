import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, CheckCircle2, XCircle, AlertTriangle, Scale, UserX, ArrowLeft, Building2 } from 'lucide-react';

const PRIMARY_COLOR = '#244799';

const TermsOfService = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: CheckCircle2,
            title: "Acceptance of Terms",
            content: "By accessing and using CivicConnect, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use this service."
        },
        {
            icon: UserX,
            title: "User Eligibility",
            content: "You must be at least 18 years old to register for an account. By registering, you represent that you are of legal age and have the authority to enter into this agreement. Users must provide accurate and complete information during registration."
        },
        {
            icon: FileText,
            title: "User Responsibilities",
            content: "Users are responsible for maintaining the confidentiality of their account credentials. You agree to provide accurate, truthful information when filing complaints. Misuse of the system, including filing false complaints or harassing municipal officers, may result in account suspension or legal action."
        },
        {
            icon: Scale,
            title: "Acceptable Use Policy",
            content: "Users must not: (a) Use the service for any unlawful purpose, (b) Submit false, misleading, or fraudulent complaints, (c) Harass, abuse, or threaten municipal officers or other users, (d) Attempt to gain unauthorized access to the system, (e) Upload malicious code or viruses, (f) Violate any applicable laws or regulations."
        },
        {
            icon: AlertTriangle,
            title: "Complaint Processing",
            content: "While we strive to address all complaints promptly, we do not guarantee specific resolution timeframes. The municipality reserves the right to prioritize complaints based on severity and available resources. Not all complaints may result in the desired outcome."
        },
        {
            icon: XCircle,
            title: "Account Termination",
            content: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the system. Users may deactivate their accounts at any time through their profile settings. Upon termination, certain data may be retained for legal and record-keeping purposes."
        }
    ];

    const additionalTerms = [
        {
            title: "Intellectual Property",
            points: [
                "All content, features, and functionality are owned by PMC and protected by copyright laws",
                "Users may not reproduce, distribute, or create derivative works without permission",
                "User-submitted content (complaints, images) grants PMC a license to use for service provision"
            ]
        },
        {
            title: "Limitation of Liability",
            points: [
                "CivicConnect is provided 'as is' without warranties of any kind",
                "We are not liable for delays, failures, or errors in complaint processing",
                "PMC is not responsible for damages arising from use or inability to use the service",
                "Our liability is limited to the maximum extent permitted by law"
            ]
        },
        {
            title: "Modifications to Terms",
            points: [
                "We reserve the right to modify these terms at any time",
                "Users will be notified of significant changes via email or system notifications",
                "Continued use after modifications constitutes acceptance of new terms",
                "Users who disagree with changes should discontinue use of the service"
            ]
        },
        {
            title: "Governing Law",
            points: [
                "These terms are governed by the laws of India",
                "Disputes shall be subject to the exclusive jurisdiction of Pune courts",
                "Any legal proceedings must be initiated within one year of the cause of action",
                "Arbitration may be required before court proceedings"
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
                            <FileText size={36} className="text-white" />
                        </div>
                        <h1 className="fw-black mb-2">Terms of Service</h1>
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
                            <h4 className="fw-bold mb-3" style={{ color: PRIMARY_COLOR }}>Agreement to Terms</h4>
                            <p className="text-muted mb-0 lh-lg">
                                These Terms of Service constitute a legally binding agreement made between you and Pune Municipal Corporation ("PMC," "we," "us," or "our"), concerning your access to and use of the CivicConnect platform. By using CivicConnect, you acknowledge that you have read, understood, and agree to be bound by all of these Terms of Service.
                            </p>
                        </div>

                        {/* Main Sections */}
                        {sections.map((section, idx) => (
                            <div key={idx} className="card border-0 shadow-sm rounded-4 p-5 mb-4 animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: `${PRIMARY_COLOR}15` }}>
                                        <section.icon size={24} style={{ color: PRIMARY_COLOR }} />
                                    </div>
                                    <h5 className="fw-bold mb-0" style={{ color: PRIMARY_COLOR }}>{section.title}</h5>
                                </div>
                                <p className="text-muted mb-0 lh-lg ps-5">{section.content}</p>
                            </div>
                        ))}

                        {/* Additional Terms */}
                        {additionalTerms.map((term, idx) => (
                            <div key={idx} className="card border-0 shadow-sm rounded-4 p-5 mb-4 animate-fadeIn" style={{ animationDelay: `${(sections.length + idx) * 0.1}s` }}>
                                <h5 className="fw-bold mb-4" style={{ color: PRIMARY_COLOR }}>{term.title}</h5>
                                <ul className="list-unstyled mb-0">
                                    {term.points.map((point, i) => (
                                        <li key={i} className="d-flex align-items-start gap-3 mb-3">
                                            <div className="rounded-circle flex-shrink-0 mt-1" style={{ width: '8px', height: '8px', backgroundColor: PRIMARY_COLOR }}></div>
                                            <span className="text-muted lh-lg">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Contact */}
                        <div className="card border-0 shadow-sm rounded-4 p-5" style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}10 0%, ${PRIMARY_COLOR}05 100%)` }}>
                            <h5 className="fw-bold mb-3" style={{ color: PRIMARY_COLOR }}>Questions About Terms?</h5>
                            <p className="text-muted mb-4">
                                If you have any questions about these Terms of Service, please contact us:
                            </p>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="small text-muted mb-1">Email</div>
                                    <div className="fw-bold">legal@civicconnect.gov.in</div>
                                </div>
                                <div className="col-md-6">
                                    <div className="small text-muted mb-1">Phone</div>
                                    <div className="fw-bold">1800-XXX-XXXX (Toll-Free)</div>
                                </div>
                                <div className="col-12">
                                    <div className="small text-muted mb-1">Address</div>
                                    <div className="fw-bold">Legal Department, Pune Municipal Corporation, Shivajinagar, Pune - 411005</div>
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
                            <Link to="/terms" className="text-muted text-decoration-none small fw-medium" style={{ color: PRIMARY_COLOR }}>
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

export default TermsOfService;
