const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
require('dotenv').config();

// Import services
const { testEmailConfig } = require('./config/emailConfig');
const { sendApplicationConfirmation, sendBookingConfirmation } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [process.env.ORIGIN_1, process.env.ORIGIN_2,process.env.ORIGIN_3] 
}));


// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Peer Tutoring System API',
      version: '1.0.0',
      description: 'API for managing peer tutoring sessions and applications at Ashesi University',
      contact: {
        name: 'Peer Tutoring Program',
        email: 'booktutor.ashesi@gmail.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      },
      {
        url: `https://emailserver-4gcn.onrender.com`,
        description: 'Production server'
      }
      
    ],
    components: {
      schemas: {
        ApplicationConfirmationRequest: {
          type: 'object',
          required: ['to_email', 'to_name', 'courses', 'submission_date'],
          properties: {
            to_email: {
              type: 'string',
              format: 'email',
              description: 'Recipient email address',
              example: 'student@gmail.com'
            },
            to_name: {
              type: 'string',
              description: 'Recipient name',
              example: 'John Doe'
            },
            courses: {
              type: 'string',
              description: 'Comma-separated list of courses',
              example: 'Mathematics, Physics, Computer Science'
            },
            submission_date: {
              type: 'string',
              format: 'date',
              description: 'Date of application submission',
              example: '2025-07-12'
            }
          }
        },
        BookingConfirmationRequest: {
          type: 'object',
          required: ['student_email', 'student_name', 'tutor_email', 'tutor_name', 'tutor_number', 'subject', 'topic', 'selected_time'],
          properties: {
            student_email: {
              type: 'string',
              format: 'email',
              description: 'Student email address',
              example: 'student@gmail.com'
            },
            student_name: {
              type: 'string',
              description: 'Student name',
              example: 'Jane Smith'
            },
            tutor_email: {
              type: 'string',
              format: 'email',
              description: 'Tutor email address',
              example: 'tutor@gmail.com'
            },
            tutor_name: {
              type: 'string',
              description: 'Tutor name',
              example: 'John Smith'
            },
            tutor_number: {
              type: 'string',
              description: 'Tutor phone number',
              example: '+233 24 123 4567'
            },
            subject: {
              type: 'string',
              description: 'Subject for tutoring',
              example: 'Mathematics'
            },
            topic: {
              type: 'string',
              description: 'Specific topic for tutoring',
              example: 'Calculus - Derivatives'
            },
            selected_time: {
              type: 'string',
              format: 'date-time',
              description: 'Selected time for tutoring session',
              example: '2024-07-15T14:00:00Z'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the operation was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            error: {
              type: 'string',
              description: 'Error message if operation failed'
            },
            details: {
              type: 'string',
              description: 'Additional error details'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-07-12T10:30:00.000Z'
            }
          }
        }
      }
    }
  },
  apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Peer Tutoring API Documentation'
}));

/**
 * @swagger
 * /api/send-application-confirmation:
 *   post:
 *     summary: Send peer tutor application confirmation email
 *     description: Sends a confirmation email to a student who has applied to be a peer tutor
 *     tags:
 *       - Email Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationConfirmationRequest'
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.post('/api/send-application-confirmation', async (req, res) => {
  try {
    const { to_email, to_name, courses, submission_date } = req.body;
    
    // Validate required fields
    if (!to_email || !to_name || !courses || !submission_date) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: to_email, to_name, courses, submission_date' 
      });
    }
    
    const result = await sendApplicationConfirmation({ to_email, to_name, courses, submission_date });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('Error in application confirmation endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/send-booking-confirmation:
 *   post:
 *     summary: Send tutoring session booking confirmation
 *     description: Sends separate booking confirmation emails to both tutor and student with calendar invites
 *     tags:
 *       - Email Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingConfirmationRequest'
 *     responses:
 *       200:
 *         description: Booking confirmation emails sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.post('/api/send-booking-confirmation', async (req, res) => {
  try {
    const { 
      student_email, 
      student_name, 
      tutor_email,
      tutor_name,
      tutor_number,
      subject, 
      topic, 
      selected_time 
    } = req.body;
    
    // Validate required fields
    if (!student_email || !student_name || !tutor_email || !tutor_name || !tutor_number || !subject || !topic || !selected_time) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: student_email, student_name, tutor_email, tutor_name, tutor_number, subject, topic, selected_time' 
      });
    }
    
    const result = await sendBookingConfirmation({ 
      student_email, 
      student_name, 
      tutor_email,
      tutor_name,
      tutor_number,
      subject, 
      topic, 
      selected_time 
    });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('Error in booking confirmation endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/test-email:
 *   get:
 *     summary: Test email configuration
 *     description: Verifies if the email configuration is working correctly
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Email configuration is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Email configuration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.get('/api/test-email', async (req, res) => {
  try {
    const result = await testEmailConfig();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Email configuration test failed', 
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Documentation redirect
 *     description: Redirects to the Swagger UI documentation
 *     tags:
 *       - System
 *     responses:
 *       302:
 *         description: Redirect to API documentation
 */
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Add this endpoint to your existing Express app
app.get('/api/config', (req, res) => {
  try {
    const config = {
      // Firebase Configuration
      FIREBASE_CONFIG: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
      },

      // EmailJS Configuration
      EMAIL_CONFIG: {
        SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
        TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
        PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY
      },

      // Admin Emails Configuration
      ADMIN_EMAILS: {
        ADMIN_1: process.env.ADMIN_EMAIL_1,
        ADMIN_2: process.env.ADMIN_EMAIL_2,
        ADMIN_3: process.env.ADMIN_EMAIL_3,
        ADMIN_4: process.env.ADMIN_EMAIL_4
      },

      // Special Access Emails Configuration
      SPECIAL_ACCESS_EMAILS: {
        SPECIAL_1: process.env.SPECIAL_EMAIL_1,
        SPECIAL_2: process.env.SPECIAL_EMAIL_2,
        SPECIAL_3: process.env.SPECIAL_EMAIL_3,
        SPECIAL_4: process.env.SPECIAL_EMAIL_4,
        SPECIAL_5: process.env.SPECIAL_EMAIL_5,
        SPECIAL_6: process.env.SPECIAL_EMAIL_6
      }
    };

    // Check if any required environment variables are missing
    const missingVars = [];
    
    // Check Firebase config
    Object.entries(config.FIREBASE_CONFIG).forEach(([key, value]) => {
      if (!value) missingVars.push(`FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
    });

    // Check EmailJS config
    Object.entries(config.EMAIL_CONFIG).forEach(([key, value]) => {
      if (!value) missingVars.push(`EMAILJS_${key}`);
    });

    if (missingVars.length > 0) {
      return res.status(500).json({
        error: 'Missing environment variables',
        missingVariables: missingVars
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test email: http://localhost:${PORT}/api/test-email`);
});

module.exports = app;