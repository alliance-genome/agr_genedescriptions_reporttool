# Stage 1
FROM node:8 as react-build
WORKDIR /app
COPY . ./
ENV REACT_APP_URLROOT="https://reports.alliancegenome.org/"
# RUN yarn
# RUN yarn build
RUN npm install
RUN npm run build

# Stage 2 - the production environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=react-build /app/build /var/www/gd_reporttool
# COPY --from=react-build /app/build /app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# CMD [ "npm", "run", "start" ]
