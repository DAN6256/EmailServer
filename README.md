# Peer Tutoring System API

A comprehensive email notification system for the Ashesi University Peer Tutoring Program. This API handles application confirmations and booking notifications with calendar integration.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Endpoints](#endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Email Notifications**: Automated email confirmations for tutor applications and session bookings
- **Calendar Integration**: Automatic generation of ICS calendar invites for tutoring sessions
- **Swagger Documentation**: Interactive API documentation with testing capabilities
- **Gmail Integration**: Seamless integration with Gmail and other email providers
- **Responsive Design**: Mobile-friendly email templates
- **Error Handling**: Comprehensive error handling and validation
- **Health Monitoring**: Built-in health check endpoints

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0 or higher)
- **npm** (v6.0 or higher)
- **Gmail account** (or other email service for sending emails)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DAN6256/EmailServer.git
   cd EmailServer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required packages**
   ```bash
   npm install express nodemailer moment swagger-ui-express swagger-jsdoc dotenv
   ```

## ⚙️ Configuration

1. **Create a `.env` file** in the root directory:
   ```env
   PORT=3000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Gmail Setup** (if using Gmail):
   - Enable 2-Factor Authentication on your Gmail account
   - Generate an App Password:
     1. Go to Google Account settings
     2. Security → 2-Step Verification
     3. App passwords → Generate new password
     4. Use the generated password in `EMAIL_PASS`

3. **Alternative Email Services**:
   ```javascript
   // For other email providers, update the transporter configuration
   const transporter = nodemailer.createTransporter({
     host: 'smtp.your-provider.com',
     port: 587,
     secure: false,
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
     },
     tls: {
       rejectUnauthorized: false
     }
   });
   ```

## 🚀 Usage

1. **Start the server**
   ```bash
   npm start
   ```

2. **Development mode** (with auto-restart)
   ```bash
   npm run dev
   ```

3. **Access the application**
   - API Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health
   - Email Test: http://localhost:3000/api/test-email

## 📚 API Documentation

The API includes comprehensive Swagger UI documentation accessible at `/api-docs`. The documentation provides:

- Interactive endpoint testing
- Request/response schemas
- Example payloads
- Error code explanations

### Quick Access Links

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **Email Configuration Test**: [http://localhost:3000/api/test-email](http://localhost:3000/api/test-email)

## 🔗 Endpoints

### Email Notifications

#### POST `/api/send-application-confirmation`
Sends confirmation email for peer tutor applications.

**Request Body:**
```json
{
  "to_email": "student@gmail.com",
  "to_name": "John Doe",
  "courses": "Mathematics, Physics, Computer Science",
  "submission_date": "2024-07-12"
}
```

#### POST `/api/send-booking-confirmation`
Sends booking confirmation with calendar invite.

**Request Body:**
```json
{
  "to_email": "student@gmail.com",
  "to_name": "Jane Smith",
  "user_email": "booker@gmail.com",
  "subject": "Mathematics",
  "teacher": "Dr. John Smith",
  "teacher_email": "tutor@gmail.com",
  "teacher_number": "+233 24 123 4567",
  "topic": "Calculus - Derivatives",
  "selected_time": "2024-07-15T14:00:00Z"
}
```

### System Endpoints

#### GET `/health`
Returns server health status.

#### GET `/api/test-email`
Tests email configuration.

## 🧪 Testing

### Test Email Configuration
```bash
curl http://localhost:3000/api/test-email
```

### Test Application Confirmation
```bash
curl -X POST http://localhost:3000/api/send-application-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@gmail.com",
    "to_name": "Test User",
    "courses": "Mathematics, Physics",
    "submission_date": "2024-07-12"
  }'
```

### Test Booking Confirmation
```bash
curl -X POST http://localhost:3000/api/send-booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "student@gmail.com",
    "to_name": "Test Student",
    "user_email": "booker@gmail.com",
    "subject": "Mathematics",
    "teacher": "Dr. Test",
    "teacher_email": "tutor@gmail.com",
    "teacher_number": "+233 24 123 4567",
    "topic": "Test Topic",
    "selected_time": "2024-07-15T14:00:00Z"
  }'
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
```

### Docker Deployment
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Heroku Deployment
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password

# Deploy
git push heroku main
```
### Render Deployment (Recommended)
Render is a modern cloud platform that offers free hosting for web services.

#### Method 1: Connect GitHub Repository

**Push your code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

**Deploy on Render**

1. Go to render.com
2. Sign up/Login with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: peer-tutoring-api
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start

**Add environment variables:**
- EMAIL_USER: your-email@gmail.com
- EMAIL_PASS: your-app-password

#### Method 2: Manual Deployment

**Create render.yaml in your project root:**
```yaml
services:
  - type: web
    name: peer-tutoring-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: EMAIL_USER
        value: your-email@gmail.com
      - key: EMAIL_PASS
        value: your-app-password
```

**Deploy using Render CLI**
```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login

# Deploy
render deploy
```

#### Method 3: Docker on Render

**Create Dockerfile (if not exists):**
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**Deploy Docker Container**

1. In Render dashboard, select "Docker" as environment
2. Connect your repository
3. Render will automatically detect the Dockerfile
4. Set environment variables as above


#### Post-Deployment on Render
After deployment, your API will be available at:
https://your-app-name.onrender.com

**Access points:**
- API Documentation: https://your-app-name.onrender.com/api-docs
- Health Check: https://your-app-name.onrender.com/health
- Email Test: https://your-app-name.onrender.com/api/test-email
## 🔧 Troubleshooting

### Common Issues

1. **SSL Certificate Error**
   - Solution: The app includes `tls: { rejectUnauthorized: false }` configuration
   - This is already handled in the codebase

2. **Gmail Authentication Failed**
   - Ensure 2FA is enabled on your Gmail account
   - Use App Password, not your regular password
   - Check that the email and password are correct in `.env`

3. **Port Already in Use**
   - Change the PORT in `.env` file
   - Or kill the process using the port: `lsof -ti:3000 | xargs kill`

4. **Calendar Invite Not Working**
   - Verify the `selected_time` is in proper ISO format
   - Check that the email client supports ICS files

## 📝 Package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ashesi University** for the peer tutoring program
- **Nodemailer** for email functionality
- **Swagger** for API documentation
- **Express.js** for the web framework

## 📞 Support

For support, email daniel.tunyinko@gmail.com or create an issue in the repository.

---

**Made with ❤️ for Ashesi University Peer Tutoring Program**