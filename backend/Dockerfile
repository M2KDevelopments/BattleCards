FROM node:22

# Working directory
WORKDIR ./

# Copy package.json
COPY package*.json ./

# Install packages
RUN npm install

# Copy everything
COPY . .

# POST ENV variables
ENV PORT=3002

# Expose PORT
EXPOSE 3002

# Start the container
CMD [ "npm", 'start' ]