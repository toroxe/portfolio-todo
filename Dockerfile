# Använd Ubuntu som bas
FROM ubuntu:latest

# Installera Python och nödvändiga verktyg
RUN apt-get update && apt-get install -y python3 python3-pip curl build-essential libssl-dev libffi-dev python3-dev python3-venv

# Skapa och aktivera en virtuell miljö
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Ställ in arbetsmappen till rätt nivå
WORKDIR /todo

# Kopiera beroende-filen och installera Python-paketen
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Kopiera all applikationskod till containern
COPY . .

# Exponera port 5001 för Flask
EXPOSE 5001

# Starta applikationen
CMD ["python", "todo.py"]
