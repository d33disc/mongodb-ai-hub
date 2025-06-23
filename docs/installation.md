# Installation Guide

This guide walks you through setting up MongoDB AI Data Hub from scratch, with minimal coding required.

## Prerequisites

- MongoDB Atlas account (free tier available)
- Node.js installed (for running the API server)
- Retool account (free tier available)
- GitHub account (for version control)
- Basic understanding of REST APIs

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new project called "AI-Data-Hub"

2. **Create a Cluster**
   - Create a new cluster (free tier is sufficient to start)
   - Choose your preferred cloud provider and region
   - Select M0 (free) tier

3. **Configure Database Access**
   - Create a database user with read/write permissions
   - Save username and password securely

4. **Configure Network Access**
   - Add your IP address to the IP access list
   - For development, you can allow access from anywhere (not recommended for production)

5. **Create Collections**
   - Create the following collections:
     - `prompts`
     - `vectorstores`
     - `chathistory`
     - `rag`
     - `webscrapes`

## Step 2: API Server Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/mongodb-ai-hub.git
   cd mongodb-ai-hub
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=3000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     ```

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Verify API Server**
   - Open your browser to `http://localhost:3000/api/health`
   - You should see a status message indicating the server is running

## Step 3: Retool Dashboard Setup

1. **Create Retool Account**
   - Go to [Retool](https://retool.com)
   - Sign up for a free account

2. **Create a New App**
   - Click "Create new" > "App"
   - Name it "AI Data Hub Dashboard"

3. **Connect to Your API**
   - Go to "Resources" > "Create a resource" > "REST API"
   - Configure the resource:
     - Name: "AI Data Hub API"
     - Base URL: `http://localhost:3000/api` (or your deployed API URL)
     - Authentication: None (initially)

4. **Import Dashboard Template**
   - In Retool, go to your app
   - Click "..." > "Import JSON"
   - Upload the Retool template from `/templates/retool-dashboard.json`

5. **Test Dashboard**
   - Verify you can create, read, update, and delete records
   - Test the vector search functionality

## Step 4: Production Deployment

### API Server Deployment

1. **Create a Render.com Account**
   - Go to [Render](https://render.com)
   - Sign up for a free account

2. **Deploy API Server**
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: "ai-data-hub-api"
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add environment variables from your `.env` file
   - Click "Create Web Service"

### Retool Production Setup

1. **Update API Resource**
   - In Retool, go to "Resources"
   - Edit your "AI Data Hub API" resource
   - Update Base URL to your Render.com URL
   - Add authentication if needed

2. **Publish Dashboard**
   - In your Retool app, click "Share" > "Deploy"
   - Choose your deployment settings
   - Click "Deploy"

## Next Steps

1. **Add Authentication**
   - Implement Auth0 or similar service
   - Update the API to require authentication
   - Configure Retool to use authenticated API calls

2. **Set Up Vector Search**
   - Follow the guide in `/docs/vector-search-setup.md`

3. **Configure Stripe for Payments**
   - Follow the guide in `/docs/payment-setup.md`

4. **Invite Beta Users**
   - Create user accounts
   - Share access with your first users

## Troubleshooting

### Common Issues

**MongoDB Connection Problems**
- Verify your connection string
- Check that your IP is in the allowlist
- Confirm your database user has correct permissions

**API Server Not Starting**
- Check for errors in the console
- Verify all environment variables are set
- Ensure the port is not in use

**Retool Connection Issues**
- Verify API server is running
- Check CORS settings in the API
- Test API endpoints with Postman

### Getting Help

- Check the [GitHub Issues](https://github.com/yourusername/mongodb-ai-hub/issues) for known problems
- Join our [Discord community](https://discord.gg/yourinvitelink)
- Email support@yourdomain.com