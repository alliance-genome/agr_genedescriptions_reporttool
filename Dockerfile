# Stage 1
FROM node:8 as react-build
WORKDIR /app
COPY . ./
# RUN yarn
# RUN yarn build
RUN npm install
RUN npm run build

# Stage 2 - the production environment
FROM nginx:alpine
# # COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=react-build /app/build /usr/share/nginx/html
# COPY --from=react-build /app/build /app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# CMD [ "npm", "run", "start" ]

# Try stuff from Valerio's docker file https://github.com/WormBase/afp_webapp/blob/master/Dockerfile
