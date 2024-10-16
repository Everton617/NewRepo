# Etapa de build
FROM node:18-alpine AS builder

# Definir a variável de build para a URL do banco de dados
ARG DATABASE_URL

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos de dependência para aproveitar o cache
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm globalmente e as dependências do projeto
RUN npm install -g pnpm && pnpm install

# Copiar todo o código do projeto
COPY . .

# Definir a variável de ambiente para o Prisma
ENV DATABASE_URL=postgres://postgres:cf8fd9514a7abcbae700@servidor.qu1ck.com.br:5435/qu1ck-internnal

# Construir a aplicação para produção
RUN npm run build:prod

# Etapa de produção
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar os arquivos necessários da etapa de build
COPY --from=builder /app/.next ./next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./


# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV DATABASE_URL=postgres://postgres:cf8fd9514a7abcbae700@servidor.qu1ck.com.br:5435/qu1ck-internnal

# Expor a porta em que a aplicação irá rodar
EXPOSE 4002

# Comando para rodar a aplicação
CMD ["npm", "run", "start"]
