FROM oven/bun:1.1.3

WORKDIR /app

COPY . .

RUN bun install 

ENV PORT=5000
EXPOSE 5000

CMD ["bun", "index.ts"]

# docker build -t devfalls-api .
# docker run -p 5000:5000 devfalls-api