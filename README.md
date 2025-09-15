# Finance Visualizer WIP

This is a work-in-progress finance app with a React frontend and a Node/Express backend.  
It uses the Plaid API to fetch and visualize user banking information.

## Features

### Authentication & Security
- User registration with email verification (NodeMailer)
- Secure password storage (bcrypt)
- Session management and verification (JWT)
- Rate limiting (express-rate-limit)
- HTTPS support

### Data Integration & Storage
- Bank linking (Plaid API)
- Retrieval and storage of user financial data (MySQL + Redis)
- Asset recording and management (MySQL)

### Visualization & Analytics
- Dynamic balance graphs with filtering (Recharts)
- Transaction category pie chart (Recharts)
- Transaction heatmap (Google Maps API)

### Performance & Scalability
- Multithreaded server processing (Node.js Worker Threads)

## Technologies Used
- React
- Express.js
- Node.js Worker Threads
- Axios
- MySQL
- Redis
- Plaid API
- Bcrypt
- JSON Web Token
- Recharts
- Google Maps API
- TailwindCSS

## Future Features
- Recurring transactions component
- Improved Tailwind styling and UI polish
- Transaction calendar component
- Advanced data filtering and export options