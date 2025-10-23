import { registerNewUser } from './firebaseUtils';
import { Role } from '../types';

const setupInitialData = async () => {
  try {
    // Create admin user
    await registerNewUser('admin@school.com', 'admin123', {
      name: 'Admin User',
      role: Role.Admin
    });

    // Create teacher users
    await registerNewUser('alice@school.com', 'teacher123', {
      name: 'Teacher Alice',
      role: Role.Teacher,
      stationId: 'station-1'
    });

    await registerNewUser('bob@school.com', 'teacher123', {
      name: 'Teacher Bob',
      role: Role.Teacher,
      stationId: 'station-2'
    });

    console.log('Initial users created successfully!');
  } catch (error) {
    console.error('Error setting up initial data:', error);
  }
};

export { setupInitialData };