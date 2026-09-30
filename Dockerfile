# Temel imaj olarak Node.js'in resmi imajını kullanıyoruz
FROM node:lts-trixie-slim AS base

# Çalışma dizinini ayarlıyoruz
WORKDIR /app

# Bağımlılıkları yüklemek için gerekli dosyaları kopyalıyoruz
COPY package.json package-lock.json* ./

# Bağımlılıkları yüklüyoruz
FROM base AS dependencies
RUN npm install

# Geliştirme bağımlılıklarını içeren katman
FROM dependencies AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

# Üretim katmanı
FROM base AS deploy
ENV NODE_ENV production

# Üretim için optimize edilmiş bağımlılıkları yüklüyoruz
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts

# Uygulamayı çalıştırıyoruz
EXPOSE 3000
CMD ["npm", "start"]