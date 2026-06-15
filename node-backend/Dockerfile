FROM node:20-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv python3-pip build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY requirements.txt .
RUN python3 -m venv /opt/aethervault-venv \
    && /opt/aethervault-venv/bin/pip install --no-cache-dir -r requirements.txt

COPY src ./src

ENV PYTHON_BIN=/opt/aethervault-venv/bin/python

EXPOSE 5000

CMD ["npm", "start"]
