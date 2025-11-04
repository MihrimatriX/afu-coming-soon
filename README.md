# AFU Coming Soon

A modern and interactive "Coming Soon" page featuring retro CRT TV screen effects, glitch animations, and custom cursor design that delivers a stunning user experience.

## 🏷️ Tags

`nextjs` `react` `typescript` `tailwindcss` `coming-soon` `retro` `crt-effect` `glitch-animation` `custom-cursor` `docker` `modern-ui` `interactive` `full-stack-developer` `computer-graphics` `geek`

## 🚀 Features

- **Retro CRT TV Effect**: Realistic old television screen appearance
- **Glitch Animations**: RGB color shift and text glitch effects
- **Custom Cursor**: Interactive and animated custom mouse cursor
- **Dynamic Subtitles**: Auto-rotating and typing subtitles
- **Social Media Integration**: GitHub, LinkedIn, and Email links
- **Responsive Design**: Mobile and desktop compatible
- **Docker Support**: Docker configuration for easy deployment
- **Performance Optimization**: Optimized with Next.js 15 and React 19

## 🛠️ Technologies

- **Framework**: Next.js 15.2.1
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1, CSS Modules
- **Build Tool**: Turbopack (dev mode)
- **Containerization**: Docker & Docker Compose

## 📦 Installation

### Requirements

- Node.js 18+ (or Docker)
- npm, yarn, or pnpm
- Docker (optional)

### Local Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd afu-coming-soon
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Start the development server:
```bash
yarn dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Running with Docker

### Using Docker Compose

```bash
docker-compose up -d
```

The application will run at [http://localhost:8085](http://localhost:8085).

### Manual Build with Dockerfile

```bash
docker build -t afu-coming-soon .
docker run -p 3000:3000 afu-coming-soon
```

## 📂 Project Structure

```
afu-coming-soon/
├── src/
│   └── app/
│       ├── page.tsx          # Main page component
│       ├── layout.tsx         # Root layout
│       ├── globals.css        # Global styles
│       └── page.module.css    # Page-specific styles
├── public/
│   ├── favicon.js            # Dynamic favicon
│   └── favicon.svg           # Favicon SVG
├── Dockerfile                # Docker build file
├── docker-compose.yml        # Docker Compose configuration
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## 🎨 Customization

### Changing Subtitles

You can edit the subtitles in the `src/app/page.tsx` file:

```typescript
<h2 className={styles.subTitle} data-text="New Title">New Title</h2>
```

### Updating Social Media Links

Change the URLs in the buttons linked to the `handleLinkClick` function in `src/app/page.tsx`:

```typescript
onClick={() => handleLinkClick('https://your-link.com')}
```

### Adjusting Animation Speeds

You can modify animation durations in the `src/app/page.module.css` file:

- `typing` animation: `7s` (line 160)
- Subtitle change duration: `7000ms` (line 50, page.tsx)

## 🚢 Production Build

```bash
yarn build
yarn start
```

## 📝 Scripts

- `yarn dev`: Starts the development server (with Turbopack)
- `yarn build`: Creates a production build
- `yarn start`: Starts the production server
- `yarn lint`: Checks code quality with ESLint

## 🔧 Configuration

### Next.js

Next.js configuration is located in the `next.config.ts` file. Default settings are currently used.

### TypeScript

TypeScript configuration is located in the `tsconfig.json` file. Strict mode is enabled and path aliases (`@/*`) are configured.

### Tailwind CSS

Tailwind CSS configuration is located in the `tailwind.config.ts` file. CSS variables with dark mode support are included.

## 🌐 Deployment

### Vercel (Recommended)

1. Log in to your Vercel account
2. Import the project
3. Build command: `yarn build`
4. Output directory: `.next`
5. Deploy

### Docker on Any Platform

```bash
docker build -t afu-coming-soon .
docker push <your-registry>/afu-coming-soon
```

## 📄 License

This is a private project.

## 👤 Developer

**Ahmet Faruk Uzunkaya**
- GitHub: [@MihrimatriX](https://github.com/MihrimatriX)
- LinkedIn: [Ahmet Furkan Gapil](https://www.linkedin.com/in/ahmet-furkan-gapil/)
- Email: afurgapil@gmail.com

## 🎯 Feature Details

### CRT TV Effect
- Screen glass effect
- Scanlines
- Noise effect
- 3D perspective

### Glitch Animations
- RGB color shift
- Text glitch effects
- Icon glitch animations
- Dynamic clip-path usage

### Interactive Features
- Custom cursor design
- Hover effects
- Smooth animations
- Responsive design

---

⭐ If you liked this project, don't forget to give it a star!
