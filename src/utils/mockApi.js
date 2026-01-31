// Mock API responses for development testing
// This simulates the backend API responses

const mockUsers = {
  'citizen@example.com': {
    token: 'mock-jwt-token-citizen',
    role: 'CITIZEN',
    name: 'John Citizen',
    email: 'citizen@example.com'
  },
  'admin@civicconnect.gov': {
    token: 'mock-jwt-token-admin',
    role: 'ADMIN',
    name: 'Admin User',
    email: 'admin@civicconnect.gov'
  },
  'ward.officer@example.com': {
    token: 'mock-jwt-token-ward',
    role: 'WARD_OFFICER',
    name: 'Ward Officer',
    email: 'ward.officer@example.com'
  },
  'dept.officer@example.com': {
    token: 'mock-jwt-token-dept',
    role: 'DEPARTMENT_OFFICER',
    name: 'Department Officer',
    email: 'dept.officer@example.com'
  }
};

// Mock login function
export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers[email];
      
      if (user && (password === 'password' || password === 'Admin@123')) {
        resolve({
          data: user,
          status: 200
        });
      } else {
        reject({
          response: {
            status: 401,
            data: { message: 'Invalid credentials' }
          }
        });
      }
    }, 1000); // Simulate network delay
  });
};

// Mock registration function
export const mockRegister = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful registration
      resolve({
        data: {
          message: 'User registered successfully',
          user: {
            id: Date.now(),
            ...userData
          }
        },
        status: 201
      });
    }, 1000);
  });
};

// Mock wards data (as per database schema)
export const mockWards = [
  { wardId: 1, number: 1, area_name: 'Shivaji Nagar' },
  { wardId: 2, number: 2, area_name: 'Kothrud' },
  { wardId: 3, number: 3, area_name: 'Hadapsar' },
  { wardId: 4, number: 4, area_name: 'Baner' },
  { wardId: 5, number: 5, area_name: 'Kasba Peth' }
];

// Mock departments data (as per database schema)
export const mockDepartments = [
  { department_id: 1, name: 'Water Supply', sla_hours: 24, priority_level: 'HIGH', description: 'No water, leakage, low pressure' },
  { department_id: 2, name: 'Sanitation', sla_hours: 36, priority_level: 'MEDIUM', description: 'Public toilets, cleanliness' },
  { department_id: 3, name: 'Roads', sla_hours: 72, priority_level: 'LOW', description: 'Potholes, damaged roads' },
  { department_id: 4, name: 'Electricity', sla_hours: 24, priority_level: 'HIGH', description: 'Street lights, power issues' },
  { department_id: 5, name: 'Waste Management', sla_hours: 12, priority_level: 'CRITICAL', description: 'Garbage collection' },
  { department_id: 6, name: 'Public Safety', sla_hours: 6, priority_level: 'CRITICAL', description: 'Open manholes, hazards' },
  { department_id: 7, name: 'Health', sla_hours: 48, priority_level: 'MEDIUM', description: 'Mosquitoes, hygiene' },
  { department_id: 8, name: 'Education', sla_hours: 96, priority_level: 'LOW', description: 'School infrastructure' }
];

export default {
  mockLogin,
  mockRegister,
  mockWards,
  mockDepartments
};
