// Mock job data
export const jobRoles = [
    {
        id: 1,
        roleName: 'Software Developer',
        location: 'Belfast',
        capability: 'Engineering',
        band: 'Consultant',
        closingDate: '2026-03-15',
        status: 'open'
    },
    {
        id: 2,
        roleName: 'Senior Business Analyst',
        location: 'Belfast',
        capability: 'Business Analysis',
        band: 'Senior Consultant',
        closingDate: '2026-03-20',
        status: 'open'
    },
    {
        id: 3,
        roleName: 'DevOps Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Principal Consultant',
        closingDate: '2026-03-10',
        status: 'open'
    },
    {
        id: 4,
        roleName: 'UX Designer',
        location: 'Birmingham',
        capability: 'Design',
        band: 'Consultant',
        closingDate: '2026-03-25',
        status: 'open'
    },
    {
        id: 5,
        roleName: 'Data Engineer',
        location: 'Belfast',
        capability: 'Data',
        band: 'Senior Consultant',
        closingDate: '2026-04-01',
        status: 'open'
    },
    // Add some closed jobs for testing
    {
        jobRoleId: 8,
        roleName: 'Test Closed Role',
        jobLocation: 'Belfast',
        capabilityId: 1,
        capabilityName: 'Engineering',
        bandId: 2,
        bandName: 'Associate',
        closingDate: '2025-12-01' // Past date = closed
    }
];