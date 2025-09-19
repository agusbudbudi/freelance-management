# Freelance Management System

A modern web application for managing freelance design projects with MongoDB Atlas integration and Vercel deployment.

## 🚀 Features

- **Project Management**: Create, read, update, and delete design projects
- **Dashboard Analytics**: Track total, ongoing, and completed projects with revenue statistics
- **Client Management**: Store client information and contact details
- **Project Status Tracking**: Monitor project progress with status updates
- **Rich Text Editor**: Use Quill.js for detailed project briefs
- **Responsive Design**: Modern UI with mobile-friendly interface
- **Cloud Database**: MongoDB Atlas integration for persistent data storage
- **Serverless Backend**: Deployed on Vercel with serverless functions

## 🛠 Tech Stack

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Interactive functionality
- **Quill.js** - Rich text editor for project briefs
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Poppins)

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Deployment

- **Vercel** - Frontend and serverless backend hosting
- **GitHub** - Version control and CI/CD

## 📁 Project Structure

```
freelance-management/
├── api/                    # Backend serverless functions
│   ├── index.js           # Main API handler
│   ├── models/            # MongoDB models
│   │   └── Project.js     # Project schema
│   ├── routes/            # API routes
│   │   └── projects.js    # Project CRUD operations
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── css/                   # Frontend styles
│   ├── global.css         # Global styles
│   ├── style.css          # Main styles
│   ├── theme.css          # Theme variables
│   └── result.css         # Result page styles
├── js/                    # Frontend JavaScript
│   └── script.js          # Main application logic
├── img/                   # Images and assets
├── index.html            # Main application page
├── result.html           # Project result page
├── vercel.json           # Vercel configuration
├── package.json          # Root dependencies
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Vercel account (for deployment)
- Git

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/agusbudbudi/freelance-management.git
   cd freelance-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd api && npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `api/` directory:

   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/freelance_management?retryWrites=true&w=majority
   PORT=3001
   ```

4. **Run the development server**

   ```bash
   # Start backend (from api/ directory)
   cd api && npm start

   # Serve frontend (use Live Server or similar)
   # Open index.html in your browser
   ```

### Deployment on Vercel

1. **Connect your GitHub repository to Vercel**

2. **Set Environment Variables in Vercel Dashboard**

   - Go to your project settings
   - Add `MONGO_URI` with your MongoDB Atlas connection string

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

Vercel will automatically deploy your application with both frontend and backend.

## 📊 API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get a specific project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Dashboard

- `GET /api/projects/stats/dashboard` - Get dashboard statistics

### Health Check

- `GET /api` - API health check

## 💾 Database Schema

### Project Model

```javascript
{
  id: String (unique),
  numberOrder: String (unique, auto-generated),
  projectName: String (required),
  clientName: String (required),
  clientPhone: String,
  deadline: Date (required),
  brief: String (HTML content),
  price: Number (required),
  quantity: Number (default: 1),
  discount: Number (default: 0),
  totalPrice: Number (calculated),
  deliverables: String (URL),
  invoice: String (URL),
  status: String (enum: 'to do', 'in progress', 'waiting for payment', 'in review', 'revision', 'done'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🎨 Features Overview

### Dashboard

- Total projects count
- Ongoing projects tracking
- Completed projects summary
- Revenue analytics (ongoing and completed)

### Project Management

- Auto-generated order numbers (format: AGD-DDMMYY-XXX)
- Rich text project briefs
- Client information storage
- Status tracking with visual indicators
- Price calculation with quantity and discounts
- File deliverables linking
- Invoice integration

### User Interface

- Modern, responsive design
- Dark sidebar navigation
- Modal-based project forms
- Status badges with color coding
- Interactive data tables
- Alert notifications

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### CORS Configuration

The API is configured to accept requests from:

- `https://freelance-management-lyart.vercel.app` (production)
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- `http://127.0.0.1:5500` (Live Server)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gous Studio**

- GitHub: [@agusbudbudi](https://github.com/agusbudbudi)

## 🙏 Acknowledgments

- [Quill.js](https://quilljs.com/) for the rich text editor
- [Font Awesome](https://fontawesome.com/) for icons
- [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database
- [Vercel](https://vercel.com/) for hosting and deployment

---

## 🔗 Live Demo

Visit the live application: [https://freelance-management-lyart.vercel.app/](https://freelance-management-lyart.vercel.app/)

---

_Built with ❤️ for freelance designers and project managers_

Update: update mongo_uri
