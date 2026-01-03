# 🟢 Guthmi WA - Enterprise WhatsApp Platform

<div align="center">
  <img src="https://guthmi.online/wp-content/uploads/2025/11/Asset-35-1.png" alt="Guthmi WA Logo" width="200"/>
  
  **Since 1942** • Enterprise-Grade WhatsApp Business Solution
  
  [![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](https://github.com/guthmi/wa-enterprise)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
</div>

---

## ✨ Features

### 📊 **Dashboard & Analytics**
- Real-time messaging analytics
- Campaign performance tracking
- Cost breakdown and insights
- System health monitoring

### 💬 **Inbox Management**
- Live chat with customers
- Multi-agent support
- Quick replies & saved responses
- Conversation tagging & assignment

### 🛍️ **Order Management**
- Create orders from chat
- Approval workflow
- Payment tracking
- Invoice generation

### 📢 **Notification Campaigns**
- Bulk messaging with templates
- Scheduling & automation
- Contact segmentation
- Campaign analytics

### 🤖 **Automation**
- Auto-replies & triggers
- Chatbot builder
- Knowledge base integration
- Flow automation

### 📚 **Content Library**
- WhatsApp templates
- Quick replies
- Flow templates
- Media management

### 👥 **Contact Management**
- Contact lists & segments
- Tag system
- Import/export tools
- Custom fields

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/guthmi/wa-enterprise.git
cd wa-enterprise

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Building for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

---

## 📦 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. Deploy! 🎉

The app uses HashRouter for full compatibility with static hosting platforms.

---

## 🏗️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6 (HashRouter)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **HTTP Client**: Axios

---

## 📂 Project Structure

```
src/frontend/
├── components/       # Reusable UI components
│   ├── Layout.tsx   # Main layout wrapper
│   └── Sidebar.tsx  # Navigation sidebar
├── context/         # React Context providers
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   └── NotificationContext.tsx
├── pages/           # Page components
│   ├── Dashboard/
│   ├── Inbox/
│   ├── Orders/
│   ├── Analytics/
│   └── ...
├── services/        # API services
│   └── whatsappService.ts
├── types/           # TypeScript types
├── i18n/           # Internationalization
│   ├── en.ts
│   └── ar.ts
└── App.tsx         # Root component
```

---

## 🌍 Multi-Language Support

The platform supports both English and Arabic with RTL layout:

```typescript
import { useLanguage } from './context/LanguageContext';

const { t, language, setLanguage, dir } = useLanguage();
```

---

## 🔐 Authentication

Protected routes use the AuthContext:

```typescript
import { useAuth } from './context/AuthContext';

const { user, login, logout, hasPermission } = useAuth();
```

---

## 🎨 Theming

Colors are configured in `tailwind.config.js`:

```javascript
colors: {
  primary: '#16a34a',    // Green
  secondary: '#15803d',
  surface: '#F0F2F5',
  guthmi: {
    gold: '#C8973A',
  }
}
```

---

## 📱 Responsive Design

- **Mobile-first** approach
- Collapsible sidebar
- Touch-friendly UI
- Adaptive layouts

---

## 🔧 Configuration

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support

For support, email support@guthmi.com or join our community chat.

---

<div align="center">
  <strong>Built with ❤️ by Guthmi Team</strong>
  
  **Since 1942** • Trusted by enterprises worldwide
</div>
