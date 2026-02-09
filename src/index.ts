import express from 'express';
import { Request, Response, NextFunction } from 'express';
import nunjucks from 'nunjucks';

const app = express();
const port = 3000

// Configure Nunjucks
nunjucks.configure('src', {
    autoescape: true,
    express: app
});

app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory
app.use(express.static('src')); // Serve static CSS files

// Mock job data
const jobRoles = [
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
    }
];

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        res.render('templates/pages/home.njk', {
            title: 'Kainos Job Roles',
            heading: 'Kainos Job Opportunities',
            message: 'Find your dream job with us!'
        });
    } catch (error) {
        console.error('Error rendering template:', error);
        res.status(500).send('Error rendering template');
    }
});

app.get('/jobs', (req: Request, res: Response, next: NextFunction) => {
    try {
        // Filter only open job roles
        const openJobRoles = jobRoles.filter(job => job.status === 'open');
        
        res.render('templates/pages/jobs.njk', {
            title: 'Available Job Roles - Kainos',
            heading: 'Kainos Job Opportunities',
            jobRoles: openJobRoles
        });
    } catch (error) {
        console.error('Error rendering jobs template:', error);
        res.status(500).send('Error rendering jobs template');
    }
});

const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    console.log('Server started successfully...');
});

// Keep the process running
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server closed');
    });
});

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server closed');
    });
});