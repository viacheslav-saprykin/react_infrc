# Shop App

A product management web application built with React, Redux Toolkit, and TypeScript. Simulates a shop app with product listing, management, and commenting system.

## Features

### Products List View
- **Product Grid**: Display products in responsive cards
- **Add Products**: Modal form with validation (name, image URL, count, size, weight)
- **Delete Products**: Confirmation modal before removal
- **Edit Products**: Inline editing from list view
- **Sorting Options**: 
  - Alphabetical (A-Z)
  - Alphabetical (Z-A) 
  - Count (Low to High)
  - Count (High to Low)
- **Clickable Cards**: Entire product card navigates to detail view

### Product Detail View
- **Product Information**: Complete product details display
- **Edit Product**: Modal form for updating product data
- **Delete Product**: Remove product with confirmation
- **Comments System**: Add and delete comments for products
- **Responsive Layout**: Optimized for all screen sizes

## Technical Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Redux Toolkit + React Redux
- **Routing**: React Router (HashRouter for GitHub Pages)
- **Styling**: CSS3 with CSS Variables + Modern Design System
- **API**: JSON Server (development) + localStorage fallback (production)
- **Build Tool**: Vite
- **Deployment**: GitHub Pages ready

## Data Models

### Product
```typescript
{
  id: number;
  imageUrl: string;
  name: string;
  count: number;
  size: {
    width: number;
    height: number;
  };
  weight: string;
  comments: Comment[];
}
```

### Comment
```typescript
{
  id: number;
  productId: number;
  description: string;
  date: string;
}
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development
```bash
# Clone repository
git clone <repository-url>
cd react_infrc

# Install dependencies
npm install

# Start development server (Vite + JSON Server)
npm run dev

# Access application
# Frontend: http://localhost:5173
# API: http://localhost:3001
```

### Production Build
```bash
# Build application
npm run build

# Preview build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## API Endpoints

JSON Server provides REST API on `http://localhost:3001`:

- `GET /products` - Fetch all products
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /comments?productId=:id` - Get product comments
- `POST /comments` - Create comment
- `DELETE /comments/:id` - Delete comment

## Key Features

### Data Persistence
- **Development**: JSON Server with file-based storage
- **Production**: Automatic fallback to localStorage
- **Transparent**: Same API interface for both backends

### Form Validation
- Required field validation
- Data type checking
- User-friendly error messages
- Prevents empty product creation

### Responsive Design
- Mobile-first approach
- CSS Grid layouts
- Flexible card system
- Touch-friendly interactions

### Modern UI/UX
- Dark theme with CSS variables
- Smooth animations and transitions
- Consistent button styling
- Professional card layouts

## Development Scripts

- `npm run dev` - Start development server
- `npm run server` - Start JSON Server only
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details.

