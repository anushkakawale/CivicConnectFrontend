/**
 * Token Debug Utility
 * Use this in browser console to debug JWT token issues
 */

export const debugToken = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    console.log('🔍 TOKEN DEBUG INFORMATION');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n📦 LocalStorage Data:');
    console.log('Token Present:', !!token);
    console.log('Role:', role);
    console.log('User:', user ? JSON.parse(user) : null);

    if (!token) {
        console.error('❌ NO TOKEN FOUND - Please log in');
        return;
    }

    try {
        // Decode JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const decoded = JSON.parse(jsonPayload);

        console.log('\n🔓 Decoded JWT Token:');
        console.log(JSON.stringify(decoded, null, 2));

        console.log('\n🎯 Key Information:');
        console.log('Subject (sub):', decoded.sub);
        console.log('Authorities:', decoded.authorities);
        console.log('Role:', decoded.role);
        console.log('Issued At:', new Date(decoded.iat * 1000).toLocaleString());
        console.log('Expires At:', new Date(decoded.exp * 1000).toLocaleString());

        // Check if token is expired
        const now = Date.now() / 1000;
        const isExpired = decoded.exp < now;
        console.log('Is Expired:', isExpired ? '❌ YES' : '✅ NO');

        // Check for ROLE_CITIZEN
        const hasRoleCitizen = decoded.authorities?.includes('ROLE_CITIZEN');
        console.log('Has ROLE_CITIZEN:', hasRoleCitizen ? '✅ YES' : '❌ NO');

        if (!hasRoleCitizen) {
            console.error('\n❌ PROBLEM FOUND:');
            console.error('Token does not contain ROLE_CITIZEN authority!');
            console.error('Current authorities:', decoded.authorities);
            console.error('\n💡 SOLUTION:');
            console.error('1. Log out');
            console.error('2. Log back in');
            console.error('3. Backend must generate token with ROLE_CITIZEN');
        }

        if (isExpired) {
            console.error('\n❌ PROBLEM FOUND:');
            console.error('Token has expired!');
            console.error('\n💡 SOLUTION:');
            console.error('1. Log out');
            console.error('2. Log back in to get a new token');
        }

        console.log('\n═══════════════════════════════════════════════════════');

        return {
            token,
            decoded,
            role,
            hasRoleCitizen,
            isExpired
        };

    } catch (error) {
        console.error('❌ Error decoding token:', error);
        console.error('Token might be malformed');
    }
};

// Auto-run on import in development
if (typeof window !== 'undefined') {
    window.debugToken = debugToken;
    console.log('💡 Token debug utility loaded. Run debugToken() in console to check your JWT token.');
}

export default debugToken;
