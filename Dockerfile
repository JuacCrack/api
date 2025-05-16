FROM oven/bun:1.1.3

WORKDIR /app
COPY . .

RUN bun install --frozen-lockfile

ENV PORT=5000
EXPOSE 5000

CMD ["bun", "run", "index.ts"]

# docker build -t devfalls-api .
