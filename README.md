# AFU Coming Soon

Modern ve etkileşimli bir "Yakında" (Coming Soon) sayfası. Retro CRT TV ekranı efektleri, glitch animasyonları ve özel cursor tasarımı ile göz alıcı bir kullanıcı deneyimi sunar.

## 📝 Tek Cümlelik Açıklama

Retro CRT TV ekranı efektleri ve glitch animasyonları ile süslenmiş, Next.js ve React 19 ile geliştirilmiş modern bir "yakında" sayfası.

## 🏷️ Tag'ler

`nextjs` `react` `typescript` `tailwindcss` `coming-soon` `retro` `crt-effect` `glitch-animation` `custom-cursor` `docker` `modern-ui` `interactive` `full-stack-developer` `computer-graphics` `geek`

## 🚀 Özellikler

- **Retro CRT TV Efekti**: Gerçekçi eski televizyon ekranı görünümü
- **Glitch Animasyonları**: RGB renk kayması ve metin glitch efektleri
- **Özel Cursor**: Interaktif ve animasyonlu özel fare imleci
- **Dinamik Alt Başlıklar**: Otomatik dönen ve yazılan alt başlıklar
- **Sosyal Medya Entegrasyonu**: GitHub, LinkedIn ve Email linkleri
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Docker Desteği**: Kolay deployment için Docker yapılandırması
- **Performans Optimizasyonu**: Next.js 15 ve React 19 ile optimize edilmiş

## 🛠️ Teknolojiler

- **Framework**: Next.js 15.2.1
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1, CSS Modules
- **Build Tool**: Turbopack (dev mode)
- **Containerization**: Docker & Docker Compose

## 📦 Kurulum

### Gereksinimler

- Node.js 18+ (veya Docker)
- npm, yarn veya pnpm
- Docker (opsiyonel)

### Yerel Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd afu-coming-soon
```

2. Bağımlılıkları yükleyin:
```bash
yarn install
# veya
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
yarn dev
# veya
npm run dev
```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 🐳 Docker ile Çalıştırma

### Docker Compose Kullanımı

```bash
docker-compose up -d
```

Uygulama [http://localhost:8085](http://localhost:8085) adresinde çalışacaktır.

### Dockerfile ile Manuel Build

```bash
docker build -t afu-coming-soon .
docker run -p 3000:3000 afu-coming-soon
```

## 📂 Proje Yapısı

```
afu-coming-soon/
├── src/
│   └── app/
│       ├── page.tsx          # Ana sayfa komponenti
│       ├── layout.tsx         # Root layout
│       ├── globals.css        # Global stiller
│       └── page.module.css    # Sayfa özel stilleri
├── public/
│   ├── favicon.js            # Dinamik favicon
│   └── favicon.svg           # Favicon SVG
├── Dockerfile                # Docker build dosyası
├── docker-compose.yml        # Docker Compose yapılandırması
├── next.config.ts            # Next.js yapılandırması
├── tailwind.config.ts        # Tailwind CSS yapılandırması
├── tsconfig.json             # TypeScript yapılandırması
└── package.json              # Proje bağımlılıkları
```

## 🎨 Özelleştirme

### Alt Başlıkları Değiştirme

`src/app/page.tsx` dosyasındaki alt başlıkları düzenleyebilirsiniz:

```typescript
<h2 className={styles.subTitle} data-text="Yeni Başlık">Yeni Başlık</h2>
```

### Sosyal Medya Linklerini Güncelleme

`src/app/page.tsx` dosyasındaki `handleLinkClick` fonksiyonuna bağlı butonlardaki URL'leri değiştirin:

```typescript
onClick={() => handleLinkClick('https://your-link.com')}
```

### Animasyon Hızlarını Ayarlama

`src/app/page.module.css` dosyasındaki animasyon sürelerini değiştirebilirsiniz:

- `typing` animasyonu: `7s` (satır 160)
- Alt başlık değişim süresi: `7000ms` (satır 50, page.tsx)

## 🚢 Production Build

```bash
yarn build
yarn start
```

## 📝 Scriptler

- `yarn dev`: Geliştirme sunucusunu başlatır (Turbopack ile)
- `yarn build`: Production build oluşturur
- `yarn start`: Production sunucusunu başlatır
- `yarn lint`: ESLint ile kod kalitesini kontrol eder

## 🔧 Yapılandırma

### Next.js

Next.js yapılandırması `next.config.ts` dosyasında bulunur. Şu anda varsayılan ayarlar kullanılmaktadır.

### TypeScript

TypeScript yapılandırması `tsconfig.json` dosyasında bulunur. Strict mode aktif ve path alias'lar (`@/*`) yapılandırılmıştır.

### Tailwind CSS

Tailwind CSS yapılandırması `tailwind.config.ts` dosyasında bulunur. CSS değişkenleri ile dark mode desteği vardır.

## 🌐 Deployment

### Vercel (Önerilen)

1. Vercel hesabınıza giriş yapın
2. Projeyi import edin
3. Build komutu: `yarn build`
4. Output directory: `.next`
5. Deploy edin

### Docker ile Herhangi Bir Platform

```bash
docker build -t afu-coming-soon .
docker push <your-registry>/afu-coming-soon
```

## 📄 Lisans

Bu proje özel bir projedir.

## 👤 Geliştirici

**Ahmet Faruk Uzunkaya**
- GitHub: [@MihrimatriX](https://github.com/MihrimatriX)
- LinkedIn: [Ahmet Furkan Gapil](https://www.linkedin.com/in/ahmet-furkan-gapil/)
- Email: afurgapil@gmail.com

## 🎯 Özellikler Detayı

### CRT TV Efekti
- Ekran cam efekti (glass effect)
- Scanlines (tarama çizgileri)
- Noise (gürültü) efekti
- 3D perspektif

### Glitch Animasyonları
- RGB renk kayması
- Metin glitch efektleri
- Icon glitch animasyonları
- Dinamik clip-path kullanımı

### İnteraktif Özellikler
- Özel cursor tasarımı
- Hover efektleri
- Smooth animasyonlar
- Responsive tasarım