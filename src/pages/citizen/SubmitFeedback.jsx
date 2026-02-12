import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../../api/apiService';
import { Star, ArrowLeft, AlertCircle, Send, RefreshCw, CheckCircle, Target, ShieldCheck, Zap } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { useToast } from '../../hooks/useToast';

/**
 * 🚀 Premium Tactical Feedback Console
 * Quality Audit Node • PMC Citizen Portal
 */
const SubmitFeedback = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const PRIMARY_COLOR = '#173470';

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            const response = await apiService.complaint.getDetails(id);
            const data = response.data || response;
            setComplaint(data);

            if (data.status !== 'CLOSED' && data.status !== 'RESOLVED') {
                showToast('Feedback can only be provided for RESOLVED or CLOSED complaints.', 'warning');
                navigate('/citizen/complaints');
            }
        } catch (err) {
            console.error('Record retrieval failed:', err);
            showToast('Unable to synchronize audit record.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            rating: 5,
            comments: ''
        },
        validationSchema: Yup.object({
            rating: Yup.number()
                .min(1, 'Minimum 1-star rating required')
                .max(5, 'Maximum 5-star rating allowed')
                .required('Performance rating required'),
            comments: Yup.string()
                .min(10, 'Details must be at least 10 characters')
                .max(500, 'Details limited to 500 characters')
                .required('Qualitative intel required for audit')
        }),
        onSubmit: async (values) => {
            setSubmitting(true);
            try {
                await apiService.feedback.submit(id, values);
                setSuccess(true);
                showToast('Tactical audit submitted successfully.', 'success');
                setTimeout(() => navigate('/citizen/complaints'), 2500);
            } catch (err) {
                showToast(err.response?.data?.message || 'Feedback transmission failed.', 'error');
            } finally {
                setSubmitting(false);
            }
        }
    });

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-black text-muted text-uppercase tracking-widest small animate-pulse">Synchronizing Audit Node...</p>
            </div>
        );
    }

    if (!complaint) return null;

    return (
        <div className="feedback-console min-vh-100 pb-5 position-relative overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Tactical Grid Overlay */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05 pointer-events-none" style={{
                backgroundImage: `linear-gradient(${PRIMARY_COLOR} 1px, transparent 1px), linear-gradient(90deg, ${PRIMARY_COLOR} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                zIndex: 0
            }}></div>

            <DashboardHeader
                portalName="PMC Quality Control"
                userName="OPERATIONAL AUDIT"
                wardName={complaint.wardName || "Sector Node"}
                subtitle="Citizen Performance Feedback & Service Verification"
                icon={Target}
                actions={
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-white bg-white rounded-pill px-4 py-2 shadow-sm fw-black extra-small tracking-widest d-flex align-items-center gap-2 border transition-all hover-shadow-md"
                        style={{ color: PRIMARY_COLOR }}
                    >
                        <ArrowLeft size={16} /> ABORT
                    </button>
                }
            />

            <div className="container position-relative" style={{ maxWidth: '800px', marginTop: '-30px', zIndex: 1 }}>
                <div className="card border-0 shadow-premium rounded-4 overflow-hidden mb-4 bg-white border-top border-4" style={{ borderTopColor: PRIMARY_COLOR }}>
                    <div className="card-header bg-white border-0 p-4 p-lg-5 pb-0">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <h6 className="extra-small fw-black text-muted uppercase tracking-widest mb-2 opacity-50">RECORD IDENTIFIER</h6>
                                <h2 className="fw-black text-dark mb-0 uppercase tracking-tighter" style={{ fontSize: '1.8rem' }}>#{complaint.complaintId} • {complaint.title}</h2>
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success px-4 py-2 rounded-pill fw-black extra-small border border-success border-opacity-20 uppercase tracking-widest shadow-sm">
                                {complaint.status}
                            </span>
                        </div>
                    </div>
                    <div className="card-body p-4 p-lg-5 pt-4">
                        {success ? (
                            <div className="text-center py-5 animate-zoomIn">
                                <div className="rounded-circle bg-success shadow-lg d-inline-flex p-4 mb-4 text-white">
                                    <CheckCircle size={48} strokeWidth={3} />
                                </div>
                                <h3 className="fw-black text-dark uppercase tracking-tighter mb-2">Audit Transmitted</h3>
                                <p className="extra-small fw-black text-muted uppercase tracking-widest opacity-60">Your feedback has been logged in the central registry.</p>
                                <div className="mt-4 extra-small fw-bold text-success animate-pulse">REDIRECTING TO COMMAND CENTER...</div>
                            </div>
                        ) : (
                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-5 text-center p-4 bg-light rounded-4 border">
                                    <label className="extra-small fw-black text-muted uppercase tracking-widest mb-4 d-block opacity-50">
                                        Resolution Performance Score
                                    </label>
                                    <div className="d-flex gap-4 align-items-center justify-content-center mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="btn btn-link p-1 transition-all border-0 shadow-none hover-scale"
                                                onClick={() => formik.setFieldValue('rating', star)}
                                            >
                                                <Star
                                                    size={48}
                                                    fill={star <= formik.values.rating ? '#F59E0B' : 'white'}
                                                    color={star <= formik.values.rating ? '#F59E0B' : '#CBD5E1'}
                                                    strokeWidth={star <= formik.values.rating ? 0 : 2}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="badge bg-white shadow-sm border rounded-pill px-4 py-2">
                                        <span className="fw-black text-primary extra-small uppercase tracking-widest" style={{ color: PRIMARY_COLOR }}>
                                            Performance Rating: {formik.values.rating} / 5
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label htmlFor="comments" className="extra-small fw-black text-muted uppercase tracking-widest mb-3 d-block opacity-50">
                                        Qualitative Operational Intel
                                    </label>
                                    <textarea
                                        className={`form-control border-2 shadow-none p-4 rounded-4 bg-light extra-small fw-black tracking-wide transition-all focus-bg-white ${formik.touched.comments && formik.errors.comments ? 'border-danger' : 'border-transparent'}`}
                                        id="comments"
                                        rows="5"
                                        placeholder="Detailed assessment of resolution quality and responsiveness..."
                                        {...formik.getFieldProps('comments')}
                                        style={{ resize: 'none' }}
                                    ></textarea>
                                    <div className="d-flex justify-content-between mt-2 px-2">
                                        {formik.touched.comments && formik.errors.comments ? (
                                            <div className="extra-small text-danger fw-black uppercase tracking-widest">{formik.errors.comments}</div>
                                        ) : (
                                            <div className="extra-small text-muted fw-bold opacity-40 uppercase">{formik.values.comments.length} / 500 CHARACTERS</div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 rounded-4 bg-dark text-white border-start border-4 border-success mb-5 position-relative overflow-hidden shadow-lg">
                                    <div className="position-absolute end-0 bottom-0 p-n3 opacity-10"><ShieldCheck size={100} /></div>
                                    <h6 className="extra-small fw-black text-success uppercase tracking-widest mb-2">Institutional Verification</h6>
                                    <p className="extra-small fw-bold opacity-60 mb-0 uppercase leading-relaxed font-monospace" style={{ fontSize: '0.62rem' }}>
                                        Submission of this audit record contributes to ward-level officer performance metrics and municipal transparency initiatives. Data is encrypted and verified by PMC Central Command.
                                    </p>
                                </div>

                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-pill px-4 py-3 fw-black extra-small tracking-widest border-2 flex-grow-1"
                                        onClick={() => navigate(-1)}
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-pill px-5 py-3 fw-black extra-small tracking-widest shadow-lg border-0 flex-grow-2 transition-all hover-up d-flex align-items-center justify-content-center gap-2"
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <RefreshCw className="animate-spin" size={18} />
                                                TRANSMITTING...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                AUTHORIZE AUDIT
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .feedback-console { font-family: 'Outfit', sans-serif; }
                .fw-black { font-weight: 900; }
                .extra-small { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.15em; }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
                .animate-zoomIn { animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .hover-scale:hover { transform: scale(1.15); }
                .hover-up:hover { transform: translateY(-4px); }
                .transition-all { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .focus-bg-white:focus { background-color: #FFFFFF !important; border-color: ${PRIMARY_COLOR}30 !important; }
            ` }} />
        </div>
    );
};

export default SubmitFeedback;
