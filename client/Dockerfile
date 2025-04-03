FROM node:22

# Working directory
WORKDIR /

# Copy package.json
COPY package*.json ./

# Install packages
RUN npm install

# Copy everything
COPY . .

# Expose PORT
EXPOSE 4173

# Start the container
CMD [ "npm", 'start' ]