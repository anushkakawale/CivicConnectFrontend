const Officers = () => {
    const { showToast } = useToast();
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const PRIMARY_COLOR = '#1254AF';

    useEffect(() => {
        fetchOfficers();
    }, []);

    const fetchOfficers = async () => {
        setLoading(true);
        try {
            const response = await apiService.citizen.getOfficers();
            setOfficers(response.data || response || []);
        } catch (error) {
            console.error('Failed to fetch officials:', error);
            showToast('Failed to load officials list', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#F8FAFC' }}>
                <RefreshCw className="animate-spin text-primary mb-4" size={56} style={{ color: PRIMARY_COLOR }} />
                <p className="fw-bold text-muted small">Loading official directory...</p>
            </div>
        );
    }

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8FAFC' }}>
            <DashboardHeader
                portalName="PMC Citizen Portal"
                title="District officials"
                subtitle="Contact information for authorized municipal officers in your area."
                icon={User}
                showProfileInitials={true}
            />

            <div className="container-fluid px-5 mt-4">
                {officers.length === 0 ? (
                    <div className="card border-0 shadow-premium p-5 text-center bg-white rounded-4 border-2 border-dashed mx-auto" style={{ maxWidth: '800px' }}>
                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                            <User size={32} className="text-muted opacity-30" />
                        </div>
                        <h4 className="fw-bold text-dark mb-2">No officials assigned</h4>
                        <p className="text-muted small fw-medium mt-2">
                            There are currently no officers assigned to your ward directory.
                        </p>
                    </div>
                ) : (
                    <div className="row g-4 animate-fadeIn mb-5">
                        {officers.map((officer, index) => (
                            <div key={index} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-premium h-100 bg-white rounded-4 transition-all hover-up overflow-hidden">
                                    <div className="p-4 border-bottom bg-light bg-opacity-50">
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm"
                                                style={{
                                                    width: '64px',
                                                    height: '64px',
                                                    backgroundColor: '#EBF2FF',
                                                    color: PRIMARY_COLOR,
                                                    minWidth: '64px'
                                                }}>
                                                <User size={28} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h5 className="fw-bold mb-1 text-dark text-truncate">{officer.name}</h5>
                                                <span className="badge rounded-pill fw-bold extra-small uppercase-tracking"
                                                    style={{ backgroundColor: '#EBF2FF', color: PRIMARY_COLOR }}>
                                                    {(officer.role || 'Officer').replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-body p-4">
                                        <div className="d-flex flex-column gap-3">
                                            {officer.department && (
                                                <div className="d-flex align-items-start gap-3">
                                                    <div className="p-2 rounded-3 bg-light text-muted">
                                                        <Building2 size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="extra-small fw-bold text-muted mb-0 uppercase-tracking">Department</p>
                                                        <p className="small fw-bold text-dark mb-0">{(officer.departmentName || officer.department).replace(/_/g, ' ')}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex align-items-start gap-3">
                                                <div className="p-2 rounded-3 bg-light text-muted">
                                                    <MapPin size={16} />
                                                </div>
                                                <div>
                                                    <p className="extra-small fw-bold text-muted mb-0 uppercase-tracking">Jurisdiction</p>
                                                    <p className="small fw-bold text-dark mb-0">
                                                        Ward {officer.wardNumber || officer.wardId || 'Pune City'}
                                                    </p>
                                                </div>
                                            </div>

                                            {officer.mobile && (
                                                <div className="d-flex align-items-start gap-3">
                                                    <div className="p-2 rounded-3" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                                                        <Phone size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="extra-small fw-bold text-muted mb-0 uppercase-tracking">Direct contact</p>
                                                        <a href={`tel:${officer.mobile}`} className="small fw-bold text-decoration-none" style={{ color: '#10B981' }}>
                                                            {officer.mobile}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-footer bg-white border-0 p-4 pt-0">
                                        <button className="btn btn-light w-100 rounded-pill fw-bold small border transition-all hover-up-small">
                                            Official profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .shadow-premium { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); }
                .hover-up:hover { transform: translateY(-5px); }
                .hover-up-small:hover { transform: translateY(-3px); }
                .transition-all { transition: all 0.3s ease; }
                .uppercase-tracking { text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; }
                .extra-small { font-size: 11px; }
            `}} />
        </div>
    );
};
