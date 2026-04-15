# 🔱 Soda Shastra Backend - POS System

The robust backend engine for the **Soda Shastra POS**, specifically optimized for high-volume event transactions during **PRANATHI 2K26**.

## 🚀 Features
- **Sequential Token System**: Generates customer-friendly tokens (e.g., #101, #102) rather than cryptic database IDs.
- **Dynamic Bundle Logic**: Automatically calculates combo costs based on individual item prices to ensure accurate profit tracking.
- **Admin Security**: JWT-based authentication for secure access to the dashboard and accounting data.
- **Inventory Management**: Real-time stock tracking with low-stock indicators.
- **Accounting & Analytics**: Tracks total sales, expenses, and net profit per transaction.

## 🛠️ Tech Stack
- **Node.js & Express**: Fast and scalable web server.
- **MongoDB & Mongoose**: Flexible document storage for products and orders.
- **JSON Web Token (JWT)**: Secure stateless authentication.
- **Cors & Dotenv**: Environment management and cross-origin resource sharing.

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd stall-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_super_secret_key
   PORT=5000
   ```

4. **Seed Default Admin**:
   Run the following to create your first admin user:
   ```bash
   node seedAdmin.js
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

## 🔌 API Endpoints

### Orders
- `POST /api/orders`: Create a new order (generates token).
- `GET /api/orders`: Fetch all orders.
- `PUT /api/orders/:id`: Mark order as PAID/Completed.

### Products
- `GET /api/products`: List all individual items and combos.
- `POST /api/products`: Create a new item (Individual or Bundle).
- `PUT /api/products/:id`: Update stock or details.

### Admin
- `POST /api/admin/login`: Secure login returns JWT token.
- `POST /api/admin/register`: add new team members.

## 🛡️ Git Security
The repository is pre-configured with a `.gitignore` to prevent leaking sensitive credentials and the `node_modules` folder.

---
**Developed for PRANATHI 2K26 event management.**
