# This has multistage build process
# Stage 1: Build stage using lightweight Node.js 18 image
FROM node:18-alpine as build

# Setting up /app as the working directory inside the container
# All commands will run from this directory
WORKDIR /app

# Copying package.json and package-lock.json into the working directory
COPY package*.json ./

# Installing all the dependencies in the package.json
RUN npm install

#Copying the rest of the application code inside the container
COPY . .

# Setting up environment variable that our react app will use during build time
ENV REACT_APP_API_URL=http://localhost:5000/api

# This will build the production version of the app
# This will output static files to "build/" directory
# After this the compiled HTML, CSS and JS files are ready to serve
RUN npm run build

# Stage 2: Nginx image for serving static files
# This multistage build will have the final image much smaller
# Because it will not contain any Node.js or build tools
FROM nginx:alpine

# Copying the build static files from the first stage into the nginx HTML directory
# So that nginx can serve them
# The path from where nginx serves the pages by default
COPY --from=build /app/build /usr/share/nginx/html

# Replacing the Nginx's default configuration with our custom nginx.conf
# This conf contains the SPA routing (for eg redirecting all requests to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Container will listen on port 80
EXPOSE 80

# Starting nginx in the foreground, not background
# By default nginx runs as background process (as daemon process)
# But when running inside the container, docker expects one main process to run in the foreground (PID 1)
# So if that process exits, docker assumes that the work of the container is done
# And it will automatically exit and stop the container
# That's why we are making nginx to run in the foreground
CMD ["nginx", "-g", "daemon off;"]




